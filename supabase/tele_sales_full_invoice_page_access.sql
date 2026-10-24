-- Run this SQL manually in the Supabase project.
-- No new table or column is required. It reuses client_resource_access.

BEGIN;

CREATE OR REPLACE FUNCTION public.grant_tele_sales_invoice_page_access(
  p_brand_id uuid,
  p_member_email text,
  p_actions text[] DEFAULT ARRAY['view']::text[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_client_id uuid := auth.uid();
  v_member_id uuid;
  v_actions text[];
  v_access_id uuid;
BEGIN
  IF v_client_id IS NULL OR btrim(COALESCE(p_member_email, '')) = '' THEN
    RAISE EXCEPTION 'Sign in and enter the teammate email';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.brands WHERE id = p_brand_id AND user_id = v_client_id) THEN
    RAISE EXCEPTION 'Brand does not belong to this client';
  END IF;

  SELECT id INTO v_member_id
  FROM public.profiles
  WHERE lower(email) = lower(btrim(p_member_email))
    AND id <> v_client_id
  LIMIT 1;
  IF v_member_id IS NULL THEN
    RAISE EXCEPTION 'No logged-in teammate account matches that email';
  END IF;

  v_actions := ARRAY(SELECT DISTINCT action_key FROM unnest(COALESCE(p_actions, ARRAY['view']::text[])) AS x(action_key)
                    WHERE action_key IN ('view', 'edit'));
  IF NOT (v_actions @> ARRAY['view']::text[]) THEN
    RAISE EXCEPTION 'Full Invoice page access must include view permission';
  END IF;

  UPDATE public.client_resource_access
  SET actions = v_actions, status = 'active', granted_by = v_client_id,
      granted_at = now(), revoked_at = NULL, updated_at = now()
  WHERE client_id = v_client_id AND brand_id = p_brand_id AND member_id = v_member_id
    AND resource_type = 'dashboard_page' AND resource_key = 'invoices';
  IF FOUND THEN
    SELECT id INTO v_access_id
    FROM public.client_resource_access
    WHERE client_id = v_client_id AND brand_id = p_brand_id AND member_id = v_member_id
      AND resource_type = 'dashboard_page' AND resource_key = 'invoices'
    ORDER BY updated_at DESC LIMIT 1;
  ELSE
    INSERT INTO public.client_resource_access (
      client_id, brand_id, member_id, resource_type, resource_key, actions,
      status, granted_by, granted_at, accepted_at, revoked_at, updated_at
    ) VALUES (
      v_client_id, p_brand_id, v_member_id, 'dashboard_page', 'invoices', v_actions,
      'active', v_client_id, now(), now(), NULL, now()
    ) RETURNING id INTO v_access_id;
  END IF;

  RETURN v_access_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_tele_sales_invoice_page_access(p_access_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  UPDATE public.client_resource_access a
  SET status = 'revoked', revoked_at = now(), updated_at = now()
  FROM public.brands b
  WHERE a.id = p_access_id
    AND a.client_id = auth.uid()
    AND a.resource_type = 'dashboard_page'
    AND a.resource_key = 'invoices'
    AND b.id = a.brand_id AND b.user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Active Full Invoice page access not found'; END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.grant_tele_sales_invoice_page_access(uuid, text, text[]) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.revoke_tele_sales_invoice_page_access(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.grant_tele_sales_invoice_page_access(uuid, text, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_tele_sales_invoice_page_access(uuid) TO authenticated;

-- A full Invoice page grant is an independent Tele Sales access type.
-- Keep the existing invoice_field path unchanged; either grant is sufficient
-- for the Tele Sales tab to appear.
CREATE OR REPLACE FUNCTION public.has_tele_sales_access()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.client_resource_access a
    WHERE a.member_id = auth.uid()
      AND a.status = 'active'
      AND (
        a.resource_type = 'invoice_field'
        OR (
          a.resource_type = 'dashboard_page'
          AND a.resource_key IN ('invoices', '*')
          AND COALESCE(a.actions, '{}'::text[]) @> ARRAY['view']::text[]
          AND (a.expires_at IS NULL OR a.expires_at > now())
          AND a.revoked_at IS NULL
        )
      )
  );
$$;

REVOKE ALL ON FUNCTION public.has_tele_sales_access() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_tele_sales_access() TO authenticated;

COMMIT;
