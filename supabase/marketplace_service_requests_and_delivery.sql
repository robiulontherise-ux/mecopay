BEGIN;

-- Prerequisite: run the base marketplace/access schema and
-- marketplace_access_roles_and_tele_sales.sql first.
-- This migration adds unpaid service-request flow only. It does not create invoices,
-- charge money, or place/activate an order after payment. A trusted payment integration
-- can later move pending_payment -> placed.

-- Repair role flags for previously approved applicants; never enables unverified or
-- pending/rejected applications.
UPDATE public.profiles p
SET is_freelancer = true, updated_at = now()
WHERE p.is_freelancer IS DISTINCT FROM true
  AND p.verification_status = 'verified'
  AND EXISTS (
    SELECT 1 FROM public.freelancer_applications fa
    WHERE fa.user_id = p.id AND fa.status = 'approved'
  );

ALTER TABLE public.marketplace_orders
  ADD COLUMN IF NOT EXISTS client_revision_note text;

ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.marketplace_orders TO authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.marketplace_orders FROM anon, authenticated;

DROP POLICY IF EXISTS marketplace_orders_select_participants ON public.marketplace_orders;
CREATE POLICY marketplace_orders_select_participants
  ON public.marketplace_orders FOR SELECT TO authenticated
  USING (client_id = auth.uid() OR provider_id = auth.uid());

-- Return only the public directory fields needed to select an approved provider.
CREATE OR REPLACE FUNCTION public.list_marketplace_freelancers(p_service_category text)
RETURNS TABLE (
  id uuid,
  name text,
  portfolio_url text,
  service_categories text[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH latest_app AS (
    SELECT DISTINCT ON (fa.user_id) fa.*
    FROM public.freelancer_applications fa
    ORDER BY fa.user_id, fa.created_at DESC, fa.id DESC
  )
  SELECT
    p.id,
    COALESCE(p.name, 'Approved freelancer'),
    fa.portfolio_url,
    fa.service_categories
  FROM latest_app fa
  JOIN public.profiles p ON p.id = fa.user_id
  WHERE auth.uid() IS NOT NULL
    AND p_service_category = ANY(fa.service_categories)
    AND p.is_freelancer IS TRUE
    AND p.verification_status = 'verified'
    AND fa.status = 'approved'
  ORDER BY p.id;
$$;

-- Create a service request without accepting a client-supplied price. The zero price
-- is only a schema placeholder; pending_payment stays non-actionable until payment
-- integration is added and a trusted server marks it placed.
CREATE OR REPLACE FUNCTION public.request_marketplace_service(
  p_brand_id uuid,
  p_provider_id uuid,
  p_service_category text,
  p_service_key text,
  p_title text,
  p_client_brief jsonb DEFAULT '{}'::jsonb,
  p_due_at timestamptz DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_client_id uuid := auth.uid();
  v_order_id uuid;
  v_allowed_categories constant text[] := ARRAY['design', 'video', 'social', 'writing', 'marketing'];
BEGIN
  IF v_client_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF p_provider_id = v_client_id THEN RAISE EXCEPTION 'You cannot assign a service request to yourself'; END IF;
  IF p_service_category IS NULL OR NOT (p_service_category = ANY(v_allowed_categories)) THEN
    RAISE EXCEPTION 'Invalid service category';
  END IF;
  IF p_service_key IS NULL OR length(btrim(p_service_key)) = 0 OR length(p_service_key) > 120 THEN
    RAISE EXCEPTION 'Choose a valid service';
  END IF;
  IF p_title IS NULL OR length(btrim(p_title)) < 3 OR length(p_title) > 180 THEN
    RAISE EXCEPTION 'Request title must be 3 to 180 characters';
  END IF;
  IF p_client_brief IS NULL OR jsonb_typeof(p_client_brief) <> 'object'
     OR length(p_client_brief::text) > 12000 THEN
    RAISE EXCEPTION 'Project brief must be a small JSON object';
  END IF;
  IF p_due_at IS NOT NULL AND p_due_at <= now() THEN
    RAISE EXCEPTION 'Requested delivery date must be in the future';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.brands b
    WHERE b.id = p_brand_id AND b.user_id = v_client_id
  ) THEN
    RAISE EXCEPTION 'Brand does not belong to this client';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN LATERAL (
      SELECT latest.* FROM public.freelancer_applications latest
      WHERE latest.user_id = p.id
      ORDER BY latest.created_at DESC, latest.id DESC
      LIMIT 1
    ) fa ON true
    WHERE p.id = p_provider_id
      AND p.is_freelancer IS TRUE
      AND p.verification_status = 'verified'
      AND fa.status = 'approved'
      AND p_service_category = ANY(fa.service_categories)
  ) THEN
    RAISE EXCEPTION 'Freelancer is not approved for this service category';
  END IF;

  INSERT INTO public.marketplace_orders (
    client_id, brand_id, provider_id, order_kind, service_category, service_key,
    title, client_brief, dashboard_scope, requested_page_keys, agreed_price,
    currency, order_status, due_at
  ) VALUES (
    v_client_id, p_brand_id, p_provider_id, 'marketplace_service', p_service_category,
    btrim(p_service_key), btrim(p_title), p_client_brief, 'none', '{}', 0,
    'BDT', 'pending_payment', p_due_at
  )
  RETURNING id INTO v_order_id;

  RETURN v_order_id;
END;
$$;

-- Provider can start delivery only after a trusted system has moved the request to
-- placed. Delivery is handed off as an HTTPS URL and/or written note; file uploads
-- are deliberately not introduced here.
CREATE OR REPLACE FUNCTION public.transition_marketplace_order(
  p_order_id uuid,
  p_next_status text,
  p_delivery_note text DEFAULT NULL,
  p_delivery_urls text[] DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_current_status text;
  v_urls text[] := COALESCE(p_delivery_urls, '{}');
BEGIN
  SELECT order_status INTO v_current_status
  FROM public.marketplace_orders
  WHERE id = p_order_id AND provider_id = auth.uid()
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found for this freelancer'; END IF;

  IF v_current_status = 'placed' AND p_next_status = 'in_progress' THEN
    UPDATE public.marketplace_orders SET order_status = p_next_status, updated_at = now()
    WHERE id = p_order_id;
  ELSIF v_current_status IN ('in_progress', 'revision_requested') AND p_next_status = 'delivered' THEN
    IF length(COALESCE(p_delivery_note, '')) > 10000 OR cardinality(v_urls) > 10 THEN
      RAISE EXCEPTION 'Delivery note or number of links exceeds the allowed limit';
    END IF;
    IF EXISTS (
      SELECT 1 FROM unnest(v_urls) AS entry(url)
      WHERE url !~ '^https://[^[:space:]]+$' OR length(url) > 2048
    ) THEN
      RAISE EXCEPTION 'Delivery links must be valid HTTPS URLs';
    END IF;
    IF NULLIF(btrim(COALESCE(p_delivery_note, '')), '') IS NULL AND cardinality(v_urls) = 0 THEN
      RAISE EXCEPTION 'Add a delivery note or at least one HTTPS delivery link';
    END IF;
    UPDATE public.marketplace_orders
    SET order_status = p_next_status,
        delivery_note = NULLIF(btrim(p_delivery_note), ''),
        delivery_urls = v_urls,
        delivered_at = now(),
        updated_at = now()
    WHERE id = p_order_id;
  ELSE
    RAISE EXCEPTION 'Invalid order status transition';
  END IF;
END;
$$;

-- Client may approve a delivered item or request a revision. No payment or payout is
-- triggered by either action.
CREATE OR REPLACE FUNCTION public.review_marketplace_delivery(
  p_order_id uuid,
  p_decision text,
  p_revision_note text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF p_decision NOT IN ('complete', 'revision') THEN RAISE EXCEPTION 'Invalid delivery decision'; END IF;
  IF length(COALESCE(p_revision_note, '')) > 5000 THEN RAISE EXCEPTION 'Revision note is too long'; END IF;
  UPDATE public.marketplace_orders
  SET order_status = CASE WHEN p_decision = 'complete' THEN 'completed' ELSE 'revision_requested' END,
      completed_at = CASE WHEN p_decision = 'complete' THEN now() ELSE completed_at END,
      client_revision_note = CASE WHEN p_decision = 'revision' THEN NULLIF(btrim(p_revision_note), '') ELSE NULL END,
      updated_at = now()
  WHERE id = p_order_id
    AND client_id = auth.uid()
    AND order_status = 'delivered';
  IF NOT FOUND THEN RAISE EXCEPTION 'Delivered order not found for this client'; END IF;
END;
$$;

-- Minimal read-only viewer for the Invoices page. It returns an explicit allow-list
-- of columns and only for the authenticated freelancer's active client/brand grant.
CREATE OR REPLACE FUNCTION public.get_shared_dashboard_invoices(p_access_id uuid)
RETURNS TABLE (
  id uuid,
  invoice_number text,
  customer_name text,
  customer_phone text,
  customer_email text,
  product_name text,
  product_type text,
  amount numeric,
  status text,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_client_id uuid;
  v_brand_id uuid;
  v_resource_key text;
BEGIN
  SELECT access.client_id, access.brand_id, access.resource_key
    INTO v_client_id, v_brand_id, v_resource_key
  FROM public.client_resource_access access
  WHERE access.id = p_access_id
    AND access.member_id = auth.uid()
    AND access.resource_type = 'dashboard_page'
    AND access.status = 'active'
    AND (access.expires_at IS NULL OR access.expires_at > now())
    AND access.actions @> ARRAY['view']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'No active read grant for this page'; END IF;
  IF v_resource_key NOT IN ('invoices', '*') THEN
    RAISE EXCEPTION 'This page does not grant invoice data access';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.brands b WHERE b.id = v_brand_id AND b.user_id = v_client_id
  ) THEN
    RAISE EXCEPTION 'Client brand ownership check failed';
  END IF;

  RETURN QUERY
  SELECT inv.id, inv.invoice_number::text, inv.customer_name::text,
         inv.customer_phone::text, inv.customer_email::text,
         inv.product_name::text, inv.product_type::text, inv.amount::numeric,
         inv.status::text, inv.created_at
  FROM public.invoices inv
  WHERE inv.user_id = v_client_id AND inv.brand_id = v_brand_id
  ORDER BY inv.created_at DESC
  LIMIT 500;
END;
$$;

REVOKE ALL ON FUNCTION public.list_marketplace_freelancers(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_marketplace_freelancers(text) TO authenticated;
REVOKE ALL ON FUNCTION public.request_marketplace_service(uuid, uuid, text, text, text, jsonb, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_marketplace_service(uuid, uuid, text, text, text, jsonb, timestamptz) TO authenticated;
REVOKE ALL ON FUNCTION public.transition_marketplace_order(uuid, text, text, text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.transition_marketplace_order(uuid, text, text, text[]) TO authenticated;
REVOKE ALL ON FUNCTION public.review_marketplace_delivery(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_marketplace_delivery(uuid, text, text) TO authenticated;
REVOKE ALL ON FUNCTION public.get_shared_dashboard_invoices(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_shared_dashboard_invoices(uuid) TO authenticated;

COMMIT;
