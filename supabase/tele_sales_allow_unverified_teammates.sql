-- Tele Sales may be assigned to an authenticated teammate without merchant KYC.
-- The teammate must first sign in so a profiles row exists for the supplied email.
-- Access remains limited to the granting client's brand and explicitly selected invoice fields.
BEGIN;

CREATE OR REPLACE FUNCTION public.grant_tele_sales_invoice_access(
  p_brand_id uuid,
  p_member_email text,
  p_field_keys text[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_client_id uuid := auth.uid();
  v_member_id uuid;
  v_keys text[];
  v_allowed constant text[] := ARRAY[
    'invoice_number', 'product_name', 'product_type', 'customer_name', 'customer_phone',
    'customer_email', 'customer_address', 'amount', 'total_amount', 'product_price', 'status', 'created_at'
  ];
BEGIN
  IF v_client_id IS NULL OR btrim(COALESCE(p_member_email, '')) = '' THEN
    RAISE EXCEPTION 'Sign in and enter the teammate email';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.brands b WHERE b.id = p_brand_id AND b.user_id = v_client_id) THEN
    RAISE EXCEPTION 'Brand does not belong to this client';
  END IF;

  -- No merchant verification is required; only a pre-existing authenticated profile matches.
  SELECT p.id INTO v_member_id
  FROM public.profiles p
  WHERE lower(p.email) = lower(btrim(p_member_email))
    AND p.id <> v_client_id
  LIMIT 1;
  IF v_member_id IS NULL THEN
    RAISE EXCEPTION 'No logged-in teammate account matches that email. Ask the teammate to sign in first.';
  END IF;

  v_keys := ARRAY(SELECT DISTINCT field_key FROM unnest(COALESCE(p_field_keys, '{}')) AS input(field_key));
  IF cardinality(v_keys) = 0 OR EXISTS (
    SELECT 1 FROM unnest(v_keys) AS input(field_key) WHERE NOT (field_key = ANY(v_allowed))
  ) THEN
    RAISE EXCEPTION 'Select one or more allowed invoice fields';
  END IF;

  INSERT INTO public.client_resource_access (
    client_id, brand_id, member_id, resource_type, resource_key, actions,
    status, granted_by, granted_at
  )
  SELECT v_client_id, p_brand_id, v_member_id, 'invoice_field', field_key,
         ARRAY['view']::text[], 'active', v_client_id, now()
  FROM unnest(v_keys) AS field_list(field_key)
  ON CONFLICT (client_id, brand_id, member_id, resource_type, resource_key)
    WHERE status IN ('requested', 'active')
  DO UPDATE SET status = 'active', granted_by = v_client_id,
                granted_at = now(), revoked_at = NULL, updated_at = now();

  RETURN v_member_id;
END;
$$;

REVOKE ALL ON FUNCTION public.grant_tele_sales_invoice_access(uuid, text, text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.grant_tele_sales_invoice_access(uuid, text, text[]) TO authenticated;

COMMIT;
