-- MecoPay Tele Sales invoice/action extension (additive migration)
-- IMPORTANT: This file is prepared for review; it has NOT been run against Supabase.
-- Prerequisites from the existing MecoPay schema: profiles, brands, invoices,
-- client_resource_access. The last table is shared with freelancer dashboard access.
-- This SQL deliberately does NOT add an `action` column to invoices: the visible
-- Action header is a frontend button group. Status-changing privileges are separate.
-- Courier booking is intentionally excluded for a later phase.

BEGIN;

-- -----------------------------------------------------------------------------
-- 1) Full COD confirmation state, separate from paid invoice status.
--    Do not mark a COD order as payment-completed merely because a customer confirms.
-- -----------------------------------------------------------------------------
-- The deployed invoices schema does not contain is_full_cod. Existing checkout
-- writers identify 100% COD through product_type (physical_cod / just_form),
-- so classify from that persisted field rather than assuming a missing column.
CREATE OR REPLACE FUNCTION public.is_tele_sales_full_cod(p_product_type text, p_advance_amount numeric)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT lower(COALESCE(p_product_type, '')) IN ('physical_cod', 'just_form')
      OR (lower(COALESCE(p_product_type, '')) = 'physical' AND COALESCE(p_advance_amount, 0) <= 0);
$$;

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS tele_sales_cod_status text NOT NULL DEFAULT 'not_applicable',
  ADD COLUMN IF NOT EXISTS tele_sales_cod_confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS tele_sales_cod_confirmed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tele_sales_cod_note text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.invoices'::regclass
      AND conname = 'invoices_tele_sales_cod_status_check'
  ) THEN
    ALTER TABLE public.invoices
      ADD CONSTRAINT invoices_tele_sales_cod_status_check
      CHECK (tele_sales_cod_status IN ('not_applicable', 'needs_confirmation', 'confirmed', 'declined'));
  END IF;
END;
$$;

-- Initialize existing Full-COD rows without overwriting an already recorded state.
UPDATE public.invoices
SET tele_sales_cod_status = CASE
  WHEN lower(COALESCE(status, '')) IN ('completed') THEN 'confirmed'
  WHEN lower(COALESCE(status, '')) IN ('cancelled', 'failed', 'cut invoice') THEN 'declined'
  ELSE 'needs_confirmation'
END
WHERE public.is_tele_sales_full_cod(COALESCE(product_type, metadata->>'product_type'), advance_amount) IS TRUE
  AND tele_sales_cod_status = 'not_applicable';

-- -----------------------------------------------------------------------------
-- 2) Expand the server-side invoice-field allowlist. Existing rows/roles remain
--    unchanged; merchant KYC is intentionally not required for the teammate.
-- -----------------------------------------------------------------------------
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
    'customer_email', 'customer_address', 'sender_number', 'gateway_used', 'trx_id',
    'amount', 'total_amount', 'product_price', 'status', 'created_at', 'is_full_cod',
    'advance_amount', 'brand_name', 'tele_sales_cod_status'
  ];
BEGIN
  IF v_client_id IS NULL OR btrim(COALESCE(p_member_email, '')) = '' THEN
    RAISE EXCEPTION 'Sign in and enter the teammate email';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.brands b WHERE b.id = p_brand_id AND b.user_id = v_client_id
  ) THEN
    RAISE EXCEPTION 'Brand does not belong to this client';
  END IF;

  SELECT p.id INTO v_member_id
  FROM public.profiles p
  WHERE lower(p.email) = lower(btrim(p_member_email))
    AND p.id <> v_client_id
  LIMIT 1;
  IF v_member_id IS NULL THEN
    RAISE EXCEPTION 'No logged-in teammate account matches that email. Ask the teammate to sign in first.';
  END IF;

  v_keys := ARRAY(
    SELECT DISTINCT field_key
    FROM unnest(COALESCE(p_field_keys, '{}')) AS input(field_key)
    WHERE NULLIF(btrim(field_key), '') IS NOT NULL
  );
  IF cardinality(v_keys) = 0 OR EXISTS (
    SELECT 1 FROM unnest(v_keys) AS input(field_key)
    WHERE NOT (field_key = ANY(v_allowed))
  ) THEN
    RAISE EXCEPTION 'Select one or more allowed invoice fields';
  END IF;

  INSERT INTO public.client_resource_access (
    client_id, brand_id, member_id, resource_type, resource_key, actions,
    status, granted_by, granted_at, revoked_at, updated_at
  )
  SELECT v_client_id, p_brand_id, v_member_id, 'invoice_field', field_key,
         ARRAY['view']::text[], 'active', v_client_id, now(), NULL, now()
  FROM unnest(v_keys) AS field_list(field_key)
  ON CONFLICT (client_id, brand_id, member_id, resource_type, resource_key)
    WHERE status IN ('requested', 'active')
  DO UPDATE SET status = 'active', actions = ARRAY['view']::text[],
                granted_by = v_client_id, granted_at = now(),
                revoked_at = NULL, updated_at = now();

  RETURN v_member_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- 3) Separate per-brand action grants. No direct table access is exposed.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tele_sales_action_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_key text NOT NULL CHECK (action_key IN (
    'verify_manual', 'cancel_invoice', 'mark_failed', 'confirm_full_cod'
  )),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  granted_by uuid NOT NULL REFERENCES public.profiles(id),
  granted_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, brand_id, member_id, action_key)
);

CREATE INDEX IF NOT EXISTS tele_sales_action_access_member_idx
  ON public.tele_sales_action_access (member_id, status, brand_id);
CREATE INDEX IF NOT EXISTS tele_sales_action_access_client_idx
  ON public.tele_sales_action_access (client_id, brand_id, status);
ALTER TABLE public.tele_sales_action_access ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.tele_sales_action_access FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS public.tele_sales_action_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_key text NOT NULL CHECK (action_key IN (
    'verify_manual', 'cancel_invoice', 'mark_failed', 'confirm_full_cod'
  )),
  old_invoice_status text,
  new_invoice_status text,
  old_cod_status text,
  new_cod_status text,
  action_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tele_sales_action_logs_invoice_idx
  ON public.tele_sales_action_logs (invoice_id, created_at DESC);
CREATE INDEX IF NOT EXISTS tele_sales_action_logs_client_idx
  ON public.tele_sales_action_logs (client_id, brand_id, created_at DESC);
ALTER TABLE public.tele_sales_action_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.tele_sales_action_logs FROM PUBLIC, anon, authenticated;

-- Grant action permissions only to a teammate who already has at least one active
-- invoice-field grant for the same client and brand.
CREATE OR REPLACE FUNCTION public.grant_tele_sales_invoice_actions(
  p_brand_id uuid,
  p_member_email text,
  p_action_keys text[]
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
    'verify_manual', 'cancel_invoice', 'mark_failed', 'confirm_full_cod'
  ];
BEGIN
  IF v_client_id IS NULL OR btrim(COALESCE(p_member_email, '')) = '' THEN
    RAISE EXCEPTION 'Sign in and enter the teammate email';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.brands b WHERE b.id = p_brand_id AND b.user_id = v_client_id
  ) THEN
    RAISE EXCEPTION 'Brand does not belong to this client';
  END IF;

  SELECT p.id INTO v_member_id
  FROM public.profiles p
  WHERE lower(p.email) = lower(btrim(p_member_email))
    AND p.id <> v_client_id
  LIMIT 1;
  IF v_member_id IS NULL THEN
    RAISE EXCEPTION 'No logged-in teammate account matches that email';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.client_resource_access a
    WHERE a.client_id = v_client_id AND a.brand_id = p_brand_id
      AND a.member_id = v_member_id AND a.resource_type = 'invoice_field'
      AND a.status = 'active'
  ) THEN
    RAISE EXCEPTION 'Grant at least one invoice field before granting invoice actions';
  END IF;

  v_keys := ARRAY(
    SELECT DISTINCT action_key
    FROM unnest(COALESCE(p_action_keys, '{}')) AS input(action_key)
    WHERE NULLIF(btrim(action_key), '') IS NOT NULL
  );
  IF cardinality(v_keys) = 0 OR EXISTS (
    SELECT 1 FROM unnest(v_keys) AS input(action_key)
    WHERE NOT (action_key = ANY(v_allowed))
  ) THEN
    RAISE EXCEPTION 'Select one or more allowed Tele Sales actions';
  END IF;

  INSERT INTO public.tele_sales_action_access (
    client_id, brand_id, member_id, action_key, status, granted_by,
    granted_at, revoked_at, updated_at
  )
  SELECT v_client_id, p_brand_id, v_member_id, action_key, 'active', v_client_id,
         now(), NULL, now()
  FROM unnest(v_keys) AS action_list(action_key)
  ON CONFLICT (client_id, brand_id, member_id, action_key)
  DO UPDATE SET status = 'active', granted_by = v_client_id,
                granted_at = now(), revoked_at = NULL, updated_at = now();

  RETURN v_member_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_tele_sales_invoice_action(p_access_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  UPDATE public.tele_sales_action_access
  SET status = 'revoked', revoked_at = now(), updated_at = now()
  WHERE id = p_access_id AND client_id = auth.uid() AND status = 'active';
  IF NOT FOUND THEN RAISE EXCEPTION 'Active action permission not found'; END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.list_tele_sales_invoice_actions(p_brand_id uuid)
RETURNS TABLE (
  access_id uuid,
  member_id uuid,
  member_name text,
  member_email text,
  action_key text,
  access_status text,
  granted_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT a.id, a.member_id, p.name, p.email, a.action_key, a.status, a.granted_at
  FROM public.tele_sales_action_access a
  JOIN public.profiles p ON p.id = a.member_id
  WHERE auth.uid() = a.client_id
    AND a.brand_id = p_brand_id
  ORDER BY p.name NULLS LAST, a.action_key;
$$;

-- The teammate sees only action grants associated with their currently active
-- invoice-field access; the underlying action table stays private.
CREATE OR REPLACE FUNCTION public.get_my_tele_sales_invoice_actions()
RETURNS TABLE (brand_id uuid, action_key text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT DISTINCT g.brand_id, g.action_key
  FROM public.tele_sales_action_access g
  WHERE g.member_id = auth.uid() AND g.status = 'active'
    AND EXISTS (
      SELECT 1 FROM public.client_resource_access a
      WHERE a.client_id = g.client_id AND a.brand_id = g.brand_id
        AND a.member_id = g.member_id AND a.resource_type = 'invoice_field'
        AND a.status = 'active'
    )
  ORDER BY g.brand_id, g.action_key;
$$;

-- -----------------------------------------------------------------------------
-- 4) Audited invoice actions. The Action UI must call this RPC, never update
--    invoices.status directly as a teammate.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.perform_tele_sales_invoice_action(
  p_invoice_id uuid,
  p_action_key text,
  p_action_note text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_client_id uuid;
  v_brand_id uuid;
  v_old_status text;
  v_new_status text;
  v_trx_id text;
  v_is_full_cod boolean;
  v_old_cod_status text;
  v_new_cod_status text;
  v_action_log_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF p_action_key NOT IN ('verify_manual', 'cancel_invoice', 'mark_failed', 'confirm_full_cod') THEN
    RAISE EXCEPTION 'Unsupported Tele Sales action';
  END IF;

  SELECT i.user_id, i.brand_id, i.status, i.trx_id,
         public.is_tele_sales_full_cod(COALESCE(i.product_type, i.metadata->>'product_type'), i.advance_amount), i.tele_sales_cod_status
  INTO v_client_id, v_brand_id, v_old_status, v_trx_id, v_is_full_cod, v_old_cod_status
  FROM public.invoices i
  WHERE i.id = p_invoice_id
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invoice not found'; END IF;
  v_new_status := v_old_status;
  v_old_cod_status := COALESCE(v_old_cod_status, 'not_applicable');
  v_new_cod_status := v_old_cod_status;

  IF NOT EXISTS (
    SELECT 1 FROM public.client_resource_access a
    WHERE a.client_id = v_client_id AND a.brand_id = v_brand_id
      AND a.member_id = auth.uid() AND a.resource_type = 'invoice_field'
      AND a.status = 'active'
  ) OR NOT EXISTS (
    SELECT 1 FROM public.tele_sales_action_access g
    WHERE g.client_id = v_client_id AND g.brand_id = v_brand_id
      AND g.member_id = auth.uid() AND g.action_key = p_action_key
      AND g.status = 'active'
  ) THEN
    RAISE EXCEPTION 'Active permission for this invoice action is required';
  END IF;

  IF p_action_key = 'verify_manual' THEN
    IF lower(COALESCE(v_old_status, '')) <> 'pending'
       OR NULLIF(btrim(COALESCE(v_trx_id, '')), '') IS NULL
       OR v_is_full_cod THEN
      RAISE EXCEPTION 'Manual verification requires a pending non-Full-COD invoice with a transaction ID';
    END IF;
    v_new_status := 'Completed';
    UPDATE public.invoices SET status = v_new_status WHERE id = p_invoice_id;

  ELSIF p_action_key = 'cancel_invoice' THEN
    IF lower(COALESCE(v_old_status, '')) NOT IN (
      'pending', 'cancelled - returned to form', 'returned to form (from gateway)'
    ) THEN
      RAISE EXCEPTION 'Only pending or returned-to-form invoices can be cancelled';
    END IF;
    v_new_status := 'Cancelled';
    IF v_is_full_cod THEN
      v_new_cod_status := 'declined';
      UPDATE public.invoices
      SET status = v_new_status, tele_sales_cod_status = v_new_cod_status,
          tele_sales_cod_note = NULLIF(btrim(p_action_note), ''),
          tele_sales_cod_confirmed_at = NULL, tele_sales_cod_confirmed_by = NULL
      WHERE id = p_invoice_id;
    ELSE
      UPDATE public.invoices SET status = v_new_status WHERE id = p_invoice_id;
    END IF;

  ELSIF p_action_key = 'mark_failed' THEN
    IF lower(COALESCE(v_old_status, '')) <> 'pending' OR v_is_full_cod THEN
      RAISE EXCEPTION 'Only a pending non-Full-COD invoice can be marked failed';
    END IF;
    v_new_status := 'Failed';
    UPDATE public.invoices SET status = v_new_status WHERE id = p_invoice_id;

  ELSIF p_action_key = 'confirm_full_cod' THEN
    IF NOT v_is_full_cod OR lower(COALESCE(v_old_status, '')) NOT IN (
      'pending', 'cancelled - returned to form', 'returned to form (from gateway)'
    ) OR v_old_cod_status IN ('confirmed', 'declined') THEN
      RAISE EXCEPTION 'This invoice is not an eligible Full-COD order awaiting confirmation';
    END IF;
    v_new_cod_status := 'confirmed';
    UPDATE public.invoices
    SET tele_sales_cod_status = v_new_cod_status,
        tele_sales_cod_confirmed_at = now(),
        tele_sales_cod_confirmed_by = auth.uid(),
        tele_sales_cod_note = NULLIF(btrim(p_action_note), '')
    WHERE id = p_invoice_id;
  END IF;

  INSERT INTO public.tele_sales_action_logs (
    client_id, brand_id, invoice_id, member_id, action_key,
    old_invoice_status, new_invoice_status, old_cod_status, new_cod_status, action_note
  ) VALUES (
    v_client_id, v_brand_id, p_invoice_id, auth.uid(), p_action_key,
    v_old_status, v_new_status, v_old_cod_status, v_new_cod_status,
    NULLIF(btrim(p_action_note), '')
  ) RETURNING id INTO v_action_log_id;

  RETURN v_action_log_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.list_tele_sales_invoice_action_logs(p_invoice_id uuid)
RETURNS TABLE (
  id uuid,
  member_name text,
  action_key text,
  old_invoice_status text,
  new_invoice_status text,
  old_cod_status text,
  new_cod_status text,
  action_note text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT l.id, p.name, l.action_key, l.old_invoice_status, l.new_invoice_status,
         l.old_cod_status, l.new_cod_status, l.action_note, l.created_at
  FROM public.tele_sales_action_logs l
  JOIN public.profiles p ON p.id = l.member_id
  WHERE l.invoice_id = p_invoice_id
    AND (
      l.client_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.client_resource_access a
        WHERE a.client_id = l.client_id AND a.brand_id = l.brand_id
          AND a.member_id = auth.uid() AND a.resource_type = 'invoice_field'
          AND a.status = 'active'
      )
    )
  ORDER BY l.created_at DESC;
$$;

-- -----------------------------------------------------------------------------
-- 5) All-status, paginated, brand-scoped invoice feed. Only fields explicitly
--    granted in client_resource_access are included. A permitted null value is
--    represented in permitted_fields so the UI can render a dash, not hide it.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_tele_sales_invoices_filtered(
  p_brand_id uuid DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_limit integer DEFAULT 100,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (invoice_data jsonb)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_limit integer := LEAST(GREATEST(COALESCE(p_limit, 100), 1), 250);
  v_offset integer := GREATEST(COALESCE(p_offset, 0), 0);
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF p_status IS NOT NULL AND btrim(p_status) <> '' AND NOT EXISTS (
    SELECT 1 FROM public.client_resource_access a
    WHERE a.member_id = auth.uid() AND a.resource_type = 'invoice_field'
      AND a.resource_key = 'status' AND a.status = 'active'
      AND (p_brand_id IS NULL OR a.brand_id = p_brand_id)
  ) THEN
    RAISE EXCEPTION 'Status-field access is required to filter invoices by status';
  END IF;

  RETURN QUERY
  SELECT jsonb_strip_nulls(jsonb_build_object(
    'invoice_id', i.id,
    'brand_id', i.brand_id,
    'permitted_fields', (
      SELECT to_jsonb(array_agg(a.resource_key ORDER BY a.resource_key))
      FROM public.client_resource_access a
      WHERE a.client_id = i.user_id AND a.brand_id = i.brand_id
        AND a.member_id = auth.uid() AND a.resource_type = 'invoice_field'
        AND a.status = 'active'
    ),
    'invoice_number', CASE WHEN EXISTS (SELECT 1 FROM public.client_resource_access a WHERE a.client_id=i.user_id AND a.brand_id=i.brand_id AND a.member_id=auth.uid() AND a.resource_type='invoice_field' AND a.resource_key='invoice_number' AND a.status='active') THEN to_jsonb(i.invoice_number) END,
    'product_name', CASE WHEN EXISTS (SELECT 1 FROM public.client_resource_access a WHERE a.client_id=i.user_id AND a.brand_id=i.brand_id AND a.member_id=auth.uid() AND a.resource_type='invoice_field' AND a.resource_key='product_name' AND a.status='active') THEN to_jsonb(i.product_name) END,
    'product_type', CASE WHEN EXISTS (SELECT 1 FROM public.client_resource_access a WHERE a.client_id=i.user_id AND a.brand_id=i.brand_id AND a.member_id=auth.uid() AND a.resource_type='invoice_field' AND a.resource_key='product_type' AND a.status='active') THEN to_jsonb(i.product_type) END,
    'customer_name', CASE WHEN EXISTS (SELECT 1 FROM public.client_resource_access a WHERE a.client_id=i.user_id AND a.brand_id=i.brand_id AND a.member_id=auth.uid() AND a.resource_type='invoice_field' AND a.resource_key='customer_name' AND a.status='active') THEN to_jsonb(i.customer_name) END,
    'customer_phone', CASE WHEN EXISTS (SELECT 1 FROM public.client_resource_access a WHERE a.client_id=i.user_id AND a.brand_id=i.brand_id AND a.member_id=auth.uid() AND a.resource_type='invoice_field' AND a.resource_key='customer_phone' AND a.status='active') THEN to_jsonb(i.customer_phone) END,
    'customer_email', CASE WHEN EXISTS (SELECT 1 FROM public.client_resource_access a WHERE a.client_id=i.user_id AND a.brand_id=i.brand_id AND a.member_id=auth.uid() AND a.resource_type='invoice_field' AND a.resource_key='customer_email' AND a.status='active') THEN to_jsonb(i.customer_email) END,
    'customer_address', CASE WHEN EXISTS (SELECT 1 FROM public.client_resource_access a WHERE a.client_id=i.user_id AND a.brand_id=i.brand_id AND a.member_id=auth.uid() AND a.resource_type='invoice_field' AND a.resource_key='customer_address' AND a.status='active') THEN to_jsonb(i.customer_address) END,
    'sender_number', CASE WHEN EXISTS (SELECT 1 FROM public.client_resource_access a WHERE a.client_id=i.user_id AND a.brand_id=i.brand_id AND a.member_id=auth.uid() AND a.resource_type='invoice_field' AND a.resource_key='sender_number' AND a.status='active') THEN to_jsonb(i.sender_number) END,
    'gateway_used', CASE WHEN EXISTS (SELECT 1 FROM public.client_resource_access a WHERE a.client_id=i.user_id AND a.brand_id=i.brand_id AND a.member_id=auth.uid() AND a.resource_type='invoice_field' AND a.resource_key='gateway_used' AND a.status='active') THEN to_jsonb(i.gateway_used) END,
    'trx_id', CASE WHEN EXISTS (SELECT 1 FROM public.client_resource_access a WHERE a.client_id=i.user_id AND a.brand_id=i.brand_id AND a.member_id=auth.uid() AND a.resource_type='invoice_field' AND a.resource_key='trx_id' AND a.status='active') THEN to_jsonb(i.trx_id) END,
    'amount', CASE WHEN EXISTS (SELECT 1 FROM public.client_resource_access a WHERE a.client_id=i.user_id AND a.brand_id=i.brand_id AND a.member_id=auth.uid() AND a.resource_type='invoice_field' AND a.resource_key='amount' AND a.status='active') THEN to_jsonb(i.amount) END,
    'total_amount', CASE WHEN EXISTS (SELECT 1 FROM public.client_resource_access a WHERE a.client_id=i.user_id AND a.brand_id=i.brand_id AND a.member_id=auth.uid() AND a.resource_type='invoice_field' AND a.resource_key='total_amount' AND a.status='active') THEN to_jsonb(i.total_amount) END,
    'product_price', CASE WHEN EXISTS (SELECT 1 FROM public.client_resource_access a WHERE a.client_id=i.user_id AND a.brand_id=i.brand_id AND a.member_id=auth.uid() AND a.resource_type='invoice_field' AND a.resource_key='product_price' AND a.status='active') THEN to_jsonb(i.product_price) END,
    'status', CASE WHEN EXISTS (SELECT 1 FROM public.client_resource_access a WHERE a.client_id=i.user_id AND a.brand_id=i.brand_id AND a.member_id=auth.uid() AND a.resource_type='invoice_field' AND a.resource_key='status' AND a.status='active') THEN to_jsonb(i.status) END,
    'created_at', CASE WHEN EXISTS (SELECT 1 FROM public.client_resource_access a WHERE a.client_id=i.user_id AND a.brand_id=i.brand_id AND a.member_id=auth.uid() AND a.resource_type='invoice_field' AND a.resource_key='created_at' AND a.status='active') THEN to_jsonb(i.created_at) END,
    'is_full_cod', CASE WHEN EXISTS (SELECT 1 FROM public.client_resource_access a WHERE a.client_id=i.user_id AND a.brand_id=i.brand_id AND a.member_id=auth.uid() AND a.resource_type='invoice_field' AND a.resource_key='is_full_cod' AND a.status='active') THEN to_jsonb(public.is_tele_sales_full_cod(COALESCE(i.product_type, i.metadata->>'product_type'), i.advance_amount)) END,
    'advance_amount', CASE WHEN EXISTS (SELECT 1 FROM public.client_resource_access a WHERE a.client_id=i.user_id AND a.brand_id=i.brand_id AND a.member_id=auth.uid() AND a.resource_type='invoice_field' AND a.resource_key='advance_amount' AND a.status='active') THEN to_jsonb(i.advance_amount) END,
    'brand_name', CASE WHEN EXISTS (SELECT 1 FROM public.client_resource_access a WHERE a.client_id=i.user_id AND a.brand_id=i.brand_id AND a.member_id=auth.uid() AND a.resource_type='invoice_field' AND a.resource_key='brand_name' AND a.status='active') THEN to_jsonb(b.name) END,
    'tele_sales_cod_status', CASE WHEN EXISTS (SELECT 1 FROM public.client_resource_access a WHERE a.client_id=i.user_id AND a.brand_id=i.brand_id AND a.member_id=auth.uid() AND a.resource_type='invoice_field' AND a.resource_key='tele_sales_cod_status' AND a.status='active') THEN to_jsonb(i.tele_sales_cod_status) END
  ))
  FROM public.invoices i
  JOIN public.brands b ON b.id = i.brand_id
  WHERE (p_brand_id IS NULL OR i.brand_id = p_brand_id)
    AND EXISTS (
      SELECT 1 FROM public.client_resource_access a
      WHERE a.client_id = i.user_id AND a.brand_id = i.brand_id
        AND a.member_id = auth.uid() AND a.resource_type = 'invoice_field'
        AND a.status = 'active'
    )
    AND (
      p_status IS NULL OR btrim(p_status) = ''
      OR (lower(btrim(p_status)) = 'manual verify'
          AND lower(COALESCE(i.status, '')) = 'pending'
          AND NULLIF(btrim(COALESCE(i.trx_id, '')), '') IS NOT NULL
          AND public.is_tele_sales_full_cod(COALESCE(i.product_type, i.metadata->>'product_type'), i.advance_amount) IS FALSE)
      OR (lower(btrim(p_status)) <> 'manual verify'
          AND lower(COALESCE(i.status, '')) = lower(btrim(p_status)))
    )
    AND (
      p_status IS NULL OR btrim(p_status) = ''
      OR EXISTS (
        SELECT 1 FROM public.client_resource_access a
        WHERE a.client_id = i.user_id AND a.brand_id = i.brand_id
          AND a.member_id = auth.uid() AND a.resource_type = 'invoice_field'
          AND a.resource_key = 'status' AND a.status = 'active'
      )
    )
  ORDER BY i.created_at DESC
  LIMIT v_limit OFFSET v_offset;
END;
$$;

-- Keep the existing zero-argument frontend RPC compatible; it still returns all
-- statuses (first 250 newest rows). New status tabs/pagination call the filtered RPC.
CREATE OR REPLACE FUNCTION public.get_tele_sales_invoices()
RETURNS TABLE (invoice_data jsonb)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT * FROM public.get_tele_sales_invoices_filtered(NULL, NULL, 250, 0);
$$;

-- -----------------------------------------------------------------------------
-- 6) Call-history table and RPCs. A successful save is persisted here; direct
--    table reads/writes remain disabled and clients use the secure list RPC.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tele_sales_call_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  call_status text NOT NULL CHECK (call_status IN (
    'no_answer', 'connected', 'interested', 'not_interested',
    'follow_up', 'converted', 'wrong_number'
  )),
  call_note text,
  follow_up_at timestamptz,
  called_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- One persisted invoice-linked call row is shared by the client and every
-- teammate with active invoice access. Email history is normalized separately.
ALTER TABLE public.tele_sales_call_logs
  ADD COLUMN IF NOT EXISTS called_phone text;

CREATE INDEX IF NOT EXISTS tele_sales_call_logs_invoice_idx
  ON public.tele_sales_call_logs (invoice_id, called_at DESC);
CREATE INDEX IF NOT EXISTS tele_sales_call_logs_member_idx
  ON public.tele_sales_call_logs (member_id, called_at DESC);
ALTER TABLE public.tele_sales_call_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.tele_sales_call_logs FROM PUBLIC, anon, authenticated;
DROP POLICY IF EXISTS tele_sales_call_logs_select_participants ON public.tele_sales_call_logs;
CREATE POLICY tele_sales_call_logs_select_participants
  ON public.tele_sales_call_logs FOR SELECT TO authenticated
  USING (
    client_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.client_resource_access a
      WHERE a.client_id = tele_sales_call_logs.client_id
        AND a.brand_id = tele_sales_call_logs.brand_id
        AND a.member_id = auth.uid()
        AND a.resource_type = 'invoice_field'
        AND a.status = 'active'
    )
  );

-- Drop the old four-argument signature so PostgREST does not see ambiguous
-- overloads; the fifth argument below is optional for compatibility with the
-- currently deployed UI until it starts passing p_contact_field.
DROP FUNCTION IF EXISTS public.record_tele_sales_call(uuid,text,text,timestamptz);
CREATE OR REPLACE FUNCTION public.record_tele_sales_call(
  p_invoice_id uuid,
  p_call_status text,
  p_call_note text DEFAULT NULL,
  p_follow_up_at timestamptz DEFAULT NULL,
  p_contact_field text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_client_id uuid;
  v_brand_id uuid;
  v_log_id uuid;
  v_called_phone text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF p_call_status NOT IN (
    'no_answer', 'connected', 'interested', 'not_interested',
    'follow_up', 'converted', 'wrong_number'
  ) THEN RAISE EXCEPTION 'Unsupported call outcome'; END IF;

  SELECT i.user_id, i.brand_id,
         CASE p_contact_field
           WHEN 'customer_phone' THEN i.customer_phone
           WHEN 'sender_number' THEN i.sender_number
           ELSE NULL
         END
  INTO v_client_id, v_brand_id, v_called_phone
  FROM public.invoices i WHERE i.id = p_invoice_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invoice not found'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.client_resource_access a
    WHERE a.client_id = v_client_id AND a.brand_id = v_brand_id
      AND a.member_id = auth.uid() AND a.resource_type = 'invoice_field'
      AND a.status = 'active'
  ) THEN RAISE EXCEPTION 'Active Tele Sales access is required'; END IF;

  IF p_contact_field IS NOT NULL AND p_contact_field NOT IN ('customer_phone', 'sender_number') THEN
    RAISE EXCEPTION 'Unsupported phone field';
  END IF;
  IF p_contact_field IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.client_resource_access a
    WHERE a.client_id = v_client_id AND a.brand_id = v_brand_id
      AND a.member_id = auth.uid() AND a.resource_type = 'invoice_field'
      AND a.resource_key = p_contact_field AND a.status = 'active'
  ) THEN RAISE EXCEPTION 'Permission to view the selected phone field is required'; END IF;

  INSERT INTO public.tele_sales_call_logs (
    client_id, brand_id, invoice_id, member_id, call_status, call_note,
    follow_up_at, called_phone
  ) VALUES (
    v_client_id, v_brand_id, p_invoice_id, auth.uid(), p_call_status,
    NULLIF(btrim(p_call_note), ''), p_follow_up_at, v_called_phone
  ) RETURNING id INTO v_log_id;
  RETURN v_log_id;
END;
$$;

DROP FUNCTION IF EXISTS public.list_tele_sales_call_logs(uuid);
CREATE FUNCTION public.list_tele_sales_call_logs(p_invoice_id uuid)
RETURNS TABLE (
  id uuid,
  member_name text,
  call_status text,
  call_note text,
  follow_up_at timestamptz,
  called_at timestamptz,
  called_phone text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT l.id, p.name, l.call_status, l.call_note, l.follow_up_at, l.called_at,
         l.called_phone
  FROM public.tele_sales_call_logs l
  JOIN public.profiles p ON p.id = l.member_id
  WHERE l.invoice_id = p_invoice_id
    AND (
      l.client_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.client_resource_access a
        WHERE a.client_id = l.client_id AND a.brand_id = l.brand_id
          AND a.member_id = auth.uid() AND a.resource_type = 'invoice_field'
          AND a.status = 'active'
      )
    )
  ORDER BY l.called_at DESC;
$$;

-- Email history storage for the later email-sending feature. This migration
-- creates no sending function and does not send any email. A trusted future
-- Edge Function will write sent/failed metadata; participants read via RPC.
CREATE TABLE IF NOT EXISTS public.tele_sales_email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_email text NOT NULL,
  email_subject text,
  email_note text,
  send_status text NOT NULL DEFAULT 'draft'
    CHECK (send_status IN ('draft', 'sent', 'failed')),
  provider_message_id text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tele_sales_email_logs_invoice_idx
  ON public.tele_sales_email_logs (invoice_id, created_at DESC);
CREATE INDEX IF NOT EXISTS tele_sales_email_logs_client_idx
  ON public.tele_sales_email_logs (client_id, brand_id, created_at DESC);
ALTER TABLE public.tele_sales_email_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.tele_sales_email_logs FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.list_tele_sales_email_logs(p_invoice_id uuid)
RETURNS TABLE (
  id uuid,
  member_name text,
  recipient_email text,
  email_subject text,
  email_note text,
  send_status text,
  provider_message_id text,
  sent_at timestamptz,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT l.id, p.name, l.recipient_email, l.email_subject, l.email_note,
         l.send_status, l.provider_message_id, l.sent_at, l.created_at
  FROM public.tele_sales_email_logs l
  JOIN public.profiles p ON p.id = l.member_id
  WHERE l.invoice_id = p_invoice_id
    AND (
      l.client_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.client_resource_access a
        WHERE a.client_id = l.client_id AND a.brand_id = l.brand_id
          AND a.member_id = auth.uid() AND a.resource_type = 'invoice_field'
          AND a.status = 'active'
      )
    )
  ORDER BY l.created_at DESC;
$$;

-- -----------------------------------------------------------------------------
-- 7) RPC privileges: authenticated users only; every function performs its own
--    client/brand/member/grant checks. No anon/public execution.
-- -----------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.grant_tele_sales_invoice_access(uuid,text,text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.grant_tele_sales_invoice_access(uuid,text,text[]) TO authenticated;

REVOKE ALL ON FUNCTION public.grant_tele_sales_invoice_actions(uuid,text,text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.grant_tele_sales_invoice_actions(uuid,text,text[]) TO authenticated;
REVOKE ALL ON FUNCTION public.revoke_tele_sales_invoice_action(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.revoke_tele_sales_invoice_action(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.list_tele_sales_invoice_actions(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_tele_sales_invoice_actions(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.get_my_tele_sales_invoice_actions() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_tele_sales_invoice_actions() TO authenticated;
REVOKE ALL ON FUNCTION public.perform_tele_sales_invoice_action(uuid,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.perform_tele_sales_invoice_action(uuid,text,text) TO authenticated;
REVOKE ALL ON FUNCTION public.list_tele_sales_invoice_action_logs(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_tele_sales_invoice_action_logs(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.get_tele_sales_invoices_filtered(uuid,text,integer,integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_tele_sales_invoices_filtered(uuid,text,integer,integer) TO authenticated;
REVOKE ALL ON FUNCTION public.get_tele_sales_invoices() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_tele_sales_invoices() TO authenticated;
REVOKE ALL ON FUNCTION public.record_tele_sales_call(uuid,text,text,timestamptz,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_tele_sales_call(uuid,text,text,timestamptz,text) TO authenticated;
REVOKE ALL ON FUNCTION public.list_tele_sales_call_logs(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_tele_sales_call_logs(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.list_tele_sales_email_logs(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_tele_sales_email_logs(uuid) TO authenticated;

NOTIFY pgrst, 'reload schema';
COMMIT;
