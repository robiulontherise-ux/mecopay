CREATE OR REPLACE FUNCTION mecopay_auth.process_login_provision_batch(p_events jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'mecopay_auth', 'mecopay_heart'
AS $function$
DECLARE
  p jsonb;
  v_event_id uuid;
  v_provider text;
  v_account_id text;
  v_email text;
  v_uid text;
  v_hash text;
  v_old_hash text;
  v_processed timestamptz;
  v_domain text;
  v_surface text;
  v_site_id text;
  v_client_id text;
  v_brand_id uuid;
  v_origin text;
  v_handoff_id text;
  v_count integer := 0;
BEGIN
  IF jsonb_typeof(p_events) <> 'array' THEN
    RAISE EXCEPTION 'BATCH_MUST_BE_ARRAY';
  END IF;

  FOR p IN SELECT value FROM jsonb_array_elements(p_events) LOOP
    v_event_id := (p->>'event_id')::uuid;
    v_provider := p->>'provider';
    v_account_id := p->>'provider_account_id';
    v_email := nullif(lower(trim(p->>'email')), '');

    -- Old payloads did not include surface; retain their existing convention.
    v_surface := coalesce(
      nullif(p->>'surface', ''),
      CASE
        WHEN nullif(lower(trim(p->>'domain')), '') IS NOT NULL THEN 'no_code'
        ELSE 'mother'
      END
    );
    IF v_surface NOT IN ('mother', 'no_code') THEN
      RAISE EXCEPTION 'INVALID_LOGIN_SURFACE';
    END IF;

    v_domain := coalesce(
      nullif(lower(trim(p->>'domain')), ''),
      CASE WHEN v_surface = 'mother' THEN nullif(lower(trim(p->>'mother_domain')), '') END
    );
    IF v_domain IS NOT NULL THEN
      v_domain := split_part(split_part(regexp_replace(v_domain, '^https?://', ''), '/', 1), ':', 1);
    END IF;

    v_hash := md5(p::text);
    INSERT INTO mecopay_auth.auth_login_events(
      event_id, event_type, provider, identity_hash, payload_hash, schema_version,
      jwt_jti, jwt_expires_at, created_at
    )
    VALUES (
      v_event_id, 'login_provision', v_provider, md5(v_provider || ':' || v_account_id),
      v_hash, (p->>'schema_version')::smallint,
      coalesce(p->>'jwt_jti', p->>'event_id'),
      coalesce((p->>'jwt_expires_at')::timestamptz, now() + interval '30 minutes'), now()
    )
    ON CONFLICT(event_id) DO NOTHING;

    IF NOT FOUND THEN
      SELECT payload_hash, processed_at
      INTO v_old_hash, v_processed
      FROM mecopay_auth.auth_login_events
      WHERE event_id = v_event_id;
      IF v_old_hash <> v_hash THEN
        RAISE EXCEPTION 'EVENT_ID_PAYLOAD_MISMATCH';
      END IF;
      IF v_processed IS NOT NULL THEN
        CONTINUE;
      END IF;
    END IF;

    PERFORM pg_advisory_xact_lock(hashtext(v_provider || ':' || v_account_id));
    SELECT "userId"
    INTO v_uid
    FROM mecopay_auth.account
    WHERE "providerId" = v_provider AND "accountId" = v_account_id
    LIMIT 1;

    IF v_uid IS NULL THEN
      IF v_email IS NULL THEN
        v_email := CASE
          WHEN v_provider = 'telegram' THEN
            'telegram+' || encode(convert_to(v_account_id, 'UTF8'), 'escape') || '@users.mecopay.invalid'
          ELSE NULL
        END;
      END IF;
      IF v_email IS NULL THEN
        RAISE EXCEPTION 'VERIFIED_EMAIL_REQUIRED';
      END IF;
      IF (p->>'email_verified')::boolean IS TRUE THEN
        SELECT id INTO v_uid FROM mecopay_auth."user" WHERE email = v_email LIMIT 1;
      END IF;
      IF v_uid IS NULL THEN
        INSERT INTO mecopay_auth."user"(name, email, "emailVerified", image, "createdAt", "updatedAt")
        VALUES (
          coalesce(nullif(p->>'name', ''), 'MecoPay User'), v_email,
          coalesce((p->>'email_verified')::boolean, false), nullif(p->>'image', ''), now(), now()
        )
        RETURNING id INTO v_uid;
      END IF;
      INSERT INTO mecopay_auth.account(
        "accountId", "providerId", "userId", "telegramChatId", "createdAt", "updatedAt"
      )
      VALUES (
        v_account_id, v_provider, v_uid, nullif(p->>'telegram_chat_id', ''), now(), now()
      )
      ON CONFLICT DO NOTHING;
      SELECT "userId"
      INTO v_uid
      FROM mecopay_auth.account
      WHERE "providerId" = v_provider AND "accountId" = v_account_id
      LIMIT 1;
    ELSE
      UPDATE mecopay_auth."user"
      SET name = coalesce(nullif(p->>'name', ''), name), "updatedAt" = now()
      WHERE id = v_uid;
    END IF;

    IF v_provider = 'telegram' AND nullif(p->>'telegram_chat_id', '') IS NOT NULL THEN
      UPDATE mecopay_auth.account
      SET "telegramChatId" = p->>'telegram_chat_id', "updatedAt" = now()
      WHERE "providerId" = v_provider AND "accountId" = v_account_id;
    END IF;

    -- Clear site context every iteration: mixed Mother/no-code batches must not
    -- reuse a preceding no-code site's IDs for a Mother handoff.
    v_site_id := NULL;
    v_client_id := NULL;
    v_brand_id := NULL;

    IF v_surface = 'no_code' THEN
      IF v_domain IS NULL THEN
        RAISE EXCEPTION 'NO_CODE_DOMAIN_REQUIRED';
      END IF;
      SELECT id, client_id, brand_id
      INTO v_site_id, v_client_id, v_brand_id
      FROM mecopay_heart.site_settings
      WHERE (lower(domain) = v_domain OR lower(canonical_domain) = v_domain OR lower(subdomain) = v_domain)
        AND coalesce(domain_status, 'active') IN ('active', 'verified')
        AND coalesce(website_service_active, true) = true
      ORDER BY CASE WHEN lower(domain) = v_domain THEN 0 ELSE 1 END
      LIMIT 1;
      IF v_site_id IS NULL THEN
        RAISE EXCEPTION 'NO_CODE_SITE_NOT_FOUND';
      END IF;
      INSERT INTO mecopay_heart.site_customers(
        site_id, client_id, brand_id, user_id, last_login_origin, last_provider,
        first_login_at, last_login_at, login_count, created_at, updated_at
      )
      VALUES (
        v_site_id, v_client_id, v_brand_id, v_uid, p->>'last_login_origin', v_provider,
        now(), now(), 1, now(), now()
      )
      ON CONFLICT(site_id, client_id, user_id) DO UPDATE
      SET last_login_origin = excluded.last_login_origin,
          last_provider = excluded.last_provider,
          last_login_at = now(),
          login_count = mecopay_heart.site_customers.login_count + 1,
          updated_at = now();
      v_origin := 'https://' || v_domain;
    ELSE
      v_origin := 'https://' || coalesce(v_domain, 'mecopay.space');
    END IF;

    v_handoff_id := coalesce(nullif(p->>'handoff_id', ''), v_event_id::text);
    INSERT INTO mecopay_auth.auth_handoff(
      id, tenant_origin, provider, return_to, status, expires_at,
      site_id, client_id, brand_id, created_at
    )
    VALUES (
      v_handoff_id, v_origin, v_provider, coalesce(nullif(p->>'return_to', ''), '/'), 'ready',
      coalesce((p->>'jwt_expires_at')::timestamptz, now() + interval '30 minutes'),
      v_site_id, v_client_id, v_brand_id, now()
    )
    ON CONFLICT(id) DO UPDATE
    SET tenant_origin = excluded.tenant_origin,
        provider = excluded.provider,
        return_to = excluded.return_to,
        site_id = excluded.site_id,
        client_id = excluded.client_id,
        brand_id = excluded.brand_id,
        expires_at = excluded.expires_at,
        status = CASE
          WHEN mecopay_auth.auth_handoff.status = 'consumed'
            THEN mecopay_auth.auth_handoff.status
          ELSE excluded.status
        END;

    UPDATE mecopay_auth.auth_login_events
    SET user_id = v_uid, processed_at = now()
    WHERE event_id = v_event_id;
    v_count := v_count + 1;
  END LOOP;

  RETURN jsonb_build_object('processed', v_count);
END;
$function$;
