BEGIN;

-- Payment integration is intentionally deferred. Remove only the provisional
-- marketplace-payment objects from the earlier draft, if that draft was run.
DROP TRIGGER IF EXISTS marketplace_invoice_completion_trigger ON public.invoices;
DROP FUNCTION IF EXISTS public.process_marketplace_invoice_completion();
DROP FUNCTION IF EXISTS public.fulfill_marketplace_order(uuid);

-- These tables are created by the earlier marketplace schema SQL.
-- Frontend clients receive read access only; state changes go through the RPCs below.
ALTER TABLE public.freelancer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_resource_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tele_sales_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON public.freelancer_applications TO authenticated;
GRANT SELECT ON public.marketplace_orders TO authenticated;
GRANT SELECT ON public.client_resource_access TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.influencer_profiles TO authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.marketplace_orders FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.client_resource_access FROM anon, authenticated;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.tele_sales_call_logs FROM anon, authenticated;

-- Repair the role flag for legacy applicants already approved by an admin. This is
-- limited to verified profiles with an approved application; pending/rejected users
-- are never promoted by this backfill.
UPDATE public.profiles p
SET is_freelancer = true, updated_at = now()
WHERE p.is_freelancer IS DISTINCT FROM true
  AND p.verification_status = 'verified'
  AND EXISTS (
    SELECT 1 FROM public.freelancer_applications fa
    WHERE fa.user_id = p.id AND fa.status = 'approved'
  );

DROP POLICY IF EXISTS freelancer_applications_select_owner_admin ON public.freelancer_applications;
CREATE POLICY freelancer_applications_select_owner_admin
  ON public.freelancer_applications FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_super_admin IS TRUE
    )
  );

DROP POLICY IF EXISTS freelancer_applications_insert_verified_owner ON public.freelancer_applications;
CREATE POLICY freelancer_applications_insert_verified_owner
  ON public.freelancer_applications FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'pending'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.verification_status = 'verified'
    )
  );

DROP POLICY IF EXISTS marketplace_orders_select_participants ON public.marketplace_orders;
CREATE POLICY marketplace_orders_select_participants
  ON public.marketplace_orders FOR SELECT TO authenticated
  USING (client_id = auth.uid() OR provider_id = auth.uid());

DROP POLICY IF EXISTS client_resource_access_select_participants ON public.client_resource_access;
CREATE POLICY client_resource_access_select_participants
  ON public.client_resource_access FOR SELECT TO authenticated
  USING (client_id = auth.uid() OR member_id = auth.uid());

DROP POLICY IF EXISTS tele_sales_call_logs_select_participants ON public.tele_sales_call_logs;
CREATE POLICY tele_sales_call_logs_select_participants
  ON public.tele_sales_call_logs FOR SELECT TO authenticated
  USING (client_id = auth.uid() OR member_id = auth.uid());

DROP POLICY IF EXISTS influencer_profiles_select_owner_admin ON public.influencer_profiles;
CREATE POLICY influencer_profiles_select_owner_admin
  ON public.influencer_profiles FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin IS TRUE)
  );

DROP POLICY IF EXISTS influencer_profiles_insert_role_owner ON public.influencer_profiles;
CREATE POLICY influencer_profiles_insert_role_owner
  ON public.influencer_profiles FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_influencer IS TRUE)
  );

DROP POLICY IF EXISTS influencer_profiles_update_role_owner_admin ON public.influencer_profiles;
CREATE POLICY influencer_profiles_update_role_owner_admin
  ON public.influencer_profiles FOR UPDATE TO authenticated
  USING (
    (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_influencer IS TRUE))
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin IS TRUE)
  )
  WITH CHECK (
    (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_influencer IS TRUE))
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin IS TRUE)
  );

-- Private, allow-listed dashboard resources exposed by the client UI.
CREATE OR REPLACE FUNCTION public.list_dashboard_freelancers()
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
  SELECT DISTINCT ON (p.id) p.id, COALESCE(p.name, 'Approved freelancer'), fa.portfolio_url, fa.service_categories
  FROM public.freelancer_applications fa
  JOIN public.profiles p ON p.id = fa.user_id
  WHERE auth.uid() IS NOT NULL
    AND p.is_freelancer IS TRUE
    AND p.verification_status = 'verified'
    AND fa.status = 'approved'
    AND fa.wants_dashboard_work IS TRUE
    AND fa.dashboard_work_review_status = 'approved'
  ORDER BY p.id, fa.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.request_dashboard_access(
  p_client_id uuid,
  p_brand_id uuid,
  p_member_id uuid,
  p_scope text,
  p_page_keys text[] DEFAULT '{}'
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_keys text[];
  v_count integer := 0;
  v_allowed constant text[] := ARRAY[
    'dashboard', 'payment_links', 'invoices', 'digital_service', 'full_cod_service',
    'courier_service', 'transactions', 'transaction_analysis', 'analytics',
    'website_builder', 'custom_domain', 'server_side_tracking', 'email_service',
    'web_custom_agent', 'social_custom_agent'
  ];
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_client_id THEN
    RAISE EXCEPTION 'Not authorized to request access for this client';
  END IF;
  IF p_scope IS NULL OR p_scope NOT IN ('selected_pages', 'full_dashboard') THEN
    RAISE EXCEPTION 'Invalid dashboard scope';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.brands b WHERE b.id = p_brand_id AND b.user_id = p_client_id
  ) THEN
    RAISE EXCEPTION 'Brand does not belong to this client';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.freelancer_applications fa ON fa.user_id = p.id
    WHERE p.id = p_member_id
      AND p.is_freelancer IS TRUE
      AND p.verification_status = 'verified'
      AND fa.status = 'approved'
      AND fa.wants_dashboard_work IS TRUE
      AND fa.dashboard_work_review_status = 'approved'
  ) THEN
    RAISE EXCEPTION 'Freelancer is not approved for Dashboard Work';
  END IF;

  IF p_scope = 'full_dashboard' THEN
    IF cardinality(COALESCE(p_page_keys, '{}')) > 0 THEN
      RAISE EXCEPTION 'Full dashboard scope must not include individual page keys';
    END IF;
    v_keys := ARRAY['*'];
  ELSE
    v_keys := ARRAY(SELECT DISTINCT page_key FROM unnest(COALESCE(p_page_keys, '{}')) AS input(page_key));
    IF cardinality(v_keys) = 0 OR EXISTS (SELECT 1 FROM unnest(v_keys) AS input(page_key) WHERE NOT (page_key = ANY(v_allowed))) THEN
      RAISE EXCEPTION 'Select one or more allowed dashboard pages';
    END IF;
  END IF;

  INSERT INTO public.client_resource_access (
    client_id, brand_id, member_id, resource_type, resource_key, actions, status
  )
  SELECT p_client_id, p_brand_id, p_member_id, 'dashboard_page', page_key,
         ARRAY['view', 'edit']::text[], 'requested'
  FROM unnest(v_keys) AS page_list(page_key)
  ON CONFLICT (client_id, brand_id, member_id, resource_type, resource_key)
    WHERE status IN ('requested', 'active')
  DO NOTHING;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.respond_dashboard_access(
  p_access_id uuid,
  p_accept boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  UPDATE public.client_resource_access
  SET status = CASE WHEN p_accept THEN 'active' ELSE 'rejected' END,
      accepted_at = CASE WHEN p_accept THEN now() ELSE accepted_at END,
      updated_at = now()
  WHERE id = p_access_id
    AND member_id = auth.uid()
    AND resource_type = 'dashboard_page'
    AND status = 'requested';
  IF NOT FOUND THEN RAISE EXCEPTION 'Access request not found or already handled'; END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_dashboard_access(p_access_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.client_resource_access
  SET status = 'revoked', revoked_at = now(), updated_at = now()
  WHERE id = p_access_id
    AND client_id = auth.uid()
    AND resource_type = 'dashboard_page'
    AND status IN ('requested', 'active');
  IF NOT FOUND THEN RAISE EXCEPTION 'Dashboard access request/grant not found'; END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_review_freelancer_application(
  p_application_id uuid,
  p_decision text,
  p_admin_note text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_application public.freelancer_applications%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin IS TRUE
  ) THEN
    RAISE EXCEPTION 'Admin permission required';
  END IF;
  IF p_decision NOT IN ('approve', 'reject') THEN RAISE EXCEPTION 'Invalid review decision'; END IF;
  SELECT * INTO v_application
  FROM public.freelancer_applications
  WHERE id = p_application_id AND status = 'pending'
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Pending application not found'; END IF;
  IF p_decision = 'approve' AND NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = v_application.user_id AND p.verification_status = 'verified'
  ) THEN
    RAISE EXCEPTION 'Merchant identity must be verified first';
  END IF;

  UPDATE public.profiles
  SET is_freelancer = (p_decision = 'approve'), updated_at = now()
  WHERE id = v_application.user_id;
  UPDATE public.freelancer_applications
  SET status = CASE WHEN p_decision = 'approve' THEN 'approved' ELSE 'rejected' END,
      dashboard_work_review_status = CASE
        WHEN wants_dashboard_work IS NOT TRUE THEN 'not_requested'
        WHEN p_decision = 'approve' THEN 'approved'
        ELSE 'rejected'
      END,
      reviewed_by = auth.uid(), reviewed_at = now(),
      admin_note = NULLIF(btrim(p_admin_note), ''), updated_at = now()
  WHERE id = v_application.id;
END;
$$;

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
    UPDATE public.marketplace_orders
    SET order_status = p_next_status, delivery_note = p_delivery_note,
        delivery_urls = COALESCE(p_delivery_urls, '{}'), delivered_at = now(), updated_at = now()
    WHERE id = p_order_id;
  ELSE
    RAISE EXCEPTION 'Invalid order status transition';
  END IF;
END;
$$;

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

CREATE OR REPLACE FUNCTION public.revoke_tele_sales_invoice_access(p_access_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.client_resource_access
  SET status = 'revoked', revoked_at = now(), updated_at = now()
  WHERE id = p_access_id
    AND client_id = auth.uid()
    AND resource_type = 'invoice_field'
    AND status = 'active';
  IF NOT FOUND THEN RAISE EXCEPTION 'Active Tele Sales field access not found'; END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.list_tele_sales_access(p_brand_id uuid)
RETURNS TABLE (
  access_id uuid,
  member_id uuid,
  member_name text,
  member_email text,
  field_key text,
  access_status text,
  granted_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT a.id, a.member_id, p.name, p.email, a.resource_key, a.status, a.granted_at
  FROM public.client_resource_access a
  JOIN public.profiles p ON p.id = a.member_id
  WHERE auth.uid() = a.client_id
    AND a.brand_id = p_brand_id
    AND a.resource_type = 'invoice_field'
  ORDER BY p.name NULLS LAST, a.resource_key;
$$;

CREATE OR REPLACE FUNCTION public.has_tele_sales_access()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.client_resource_access a
    WHERE a.member_id = auth.uid()
      AND a.resource_type = 'invoice_field'
      AND a.status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_tele_sales_invoices()
RETURNS TABLE (invoice_data jsonb)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT jsonb_strip_nulls(jsonb_build_object(
    'invoice_id', i.id,
    'brand_id', i.brand_id,
    'invoice_number', CASE WHEN EXISTS (SELECT 1 FROM public.client_resource_access a WHERE a.client_id=i.user_id AND a.brand_id=i.brand_id AND a.member_id=auth.uid() AND a.resource_type='invoice_field' AND a.resource_key='invoice_number' AND a.status='active') THEN to_jsonb(i.invoice_number) END,
    'product_name', CASE WHEN EXISTS (SELECT 1 FROM public.client_resource_access a WHERE a.client_id=i.user_id AND a.brand_id=i.brand_id AND a.member_id=auth.uid() AND a.resource_type='invoice_field' AND a.resource_key='product_name' AND a.status='active') THEN to_jsonb(i.product_name) END,
    'product_type', CASE WHEN EXISTS (SELECT 1 FROM public.client_resource_access a WHERE a.client_id=i.user_id AND a.brand_id=i.brand_id AND a.member_id=auth.uid() AND a.resource_type='invoice_field' AND a.resource_key='product_type' AND a.status='active') THEN to_jsonb(i.product_type) END,
    'customer_name', CASE WHEN EXISTS (SELECT 1 FROM public.client_resource_access a WHERE a.client_id=i.user_id AND a.brand_id=i.brand_id AND a.member_id=auth.uid() AND a.resource_type='invoice_field' AND a.resource_key='customer_name' AND a.status='active') THEN to_jsonb(i.customer_name) END,
    'customer_phone', CASE WHEN EXISTS (SELECT 1 FROM public.client_resource_access a WHERE a.client_id=i.user_id AND a.brand_id=i.brand_id AND a.member_id=auth.uid() AND a.resource_type='invoice_field' AND a.resource_key='customer_phone' AND a.status='active') THEN to_jsonb(i.customer_phone) END,
    'customer_email', CASE WHEN EXISTS (SELECT 1 FROM public.client_resource_access a WHERE a.client_id=i.user_id AND a.brand_id=i.brand_id AND a.member_id=auth.uid() AND a.resource_type='invoice_field' AND a.resource_key='customer_email' AND a.status='active') THEN to_jsonb(i.customer_email) END,
    'customer_address', CASE WHEN EXISTS (SELECT 1 FROM public.client_resource_access a WHERE a.client_id=i.user_id AND a.brand_id=i.brand_id AND a.member_id=auth.uid() AND a.resource_type='invoice_field' AND a.resource_key='customer_address' AND a.status='active') THEN to_jsonb(i.customer_address) END,
    'amount', CASE WHEN EXISTS (SELECT 1 FROM public.client_resource_access a WHERE a.client_id=i.user_id AND a.brand_id=i.brand_id AND a.member_id=auth.uid() AND a.resource_type='invoice_field' AND a.resource_key='amount' AND a.status='active') THEN to_jsonb(i.amount) END,
    'total_amount', CASE WHEN EXISTS (SELECT 1 FROM public.client_resource_access a WHERE a.client_id=i.user_id AND a.brand_id=i.brand_id AND a.member_id=auth.uid() AND a.resource_type='invoice_field' AND a.resource_key='total_amount' AND a.status='active') THEN to_jsonb(i.total_amount) END,
    'product_price', CASE WHEN EXISTS (SELECT 1 FROM public.client_resource_access a WHERE a.client_id=i.user_id AND a.brand_id=i.brand_id AND a.member_id=auth.uid() AND a.resource_type='invoice_field' AND a.resource_key='product_price' AND a.status='active') THEN to_jsonb(i.product_price) END,
    'status', CASE WHEN EXISTS (SELECT 1 FROM public.client_resource_access a WHERE a.client_id=i.user_id AND a.brand_id=i.brand_id AND a.member_id=auth.uid() AND a.resource_type='invoice_field' AND a.resource_key='status' AND a.status='active') THEN to_jsonb(i.status) END,
    'created_at', CASE WHEN EXISTS (SELECT 1 FROM public.client_resource_access a WHERE a.client_id=i.user_id AND a.brand_id=i.brand_id AND a.member_id=auth.uid() AND a.resource_type='invoice_field' AND a.resource_key='created_at' AND a.status='active') THEN to_jsonb(i.created_at) END
  ))
  FROM public.invoices i
  WHERE EXISTS (
    SELECT 1 FROM public.client_resource_access a
    WHERE a.client_id = i.user_id AND a.brand_id = i.brand_id
      AND a.member_id = auth.uid() AND a.resource_type = 'invoice_field' AND a.status = 'active'
  )
  ORDER BY i.created_at DESC
  LIMIT 250;
$$;

CREATE OR REPLACE FUNCTION public.record_tele_sales_call(
  p_invoice_id uuid,
  p_call_status text,
  p_call_note text DEFAULT NULL,
  p_follow_up_at timestamptz DEFAULT NULL
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
BEGIN
  SELECT i.user_id, i.brand_id INTO v_client_id, v_brand_id
  FROM public.invoices i WHERE i.id = p_invoice_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invoice not found'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.client_resource_access a
    WHERE a.client_id = v_client_id AND a.brand_id = v_brand_id
      AND a.member_id = auth.uid() AND a.resource_type = 'invoice_field'
      AND a.status = 'active'
  ) THEN RAISE EXCEPTION 'Active Tele Sales access is required'; END IF;
  INSERT INTO public.tele_sales_call_logs (
    client_id, brand_id, invoice_id, member_id, call_status, call_note, follow_up_at
  ) VALUES (
    v_client_id, v_brand_id, p_invoice_id, auth.uid(), p_call_status,
    NULLIF(btrim(p_call_note), ''), p_follow_up_at
  ) RETURNING id INTO v_log_id;
  RETURN v_log_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.list_tele_sales_call_logs(p_invoice_id uuid)
RETURNS TABLE (
  id uuid,
  member_name text,
  call_status text,
  call_note text,
  follow_up_at timestamptz,
  called_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT l.id, p.name, l.call_status, l.call_note, l.follow_up_at, l.called_at
  FROM public.tele_sales_call_logs l
  JOIN public.profiles p ON p.id = l.member_id
  WHERE l.invoice_id = p_invoice_id
    AND (
      l.client_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.client_resource_access a
        WHERE a.client_id = l.client_id AND a.brand_id = l.brand_id
          AND a.member_id = auth.uid() AND a.resource_type = 'invoice_field' AND a.status = 'active'
      )
    )
  ORDER BY l.called_at DESC;
$$;

REVOKE ALL ON FUNCTION public.list_dashboard_freelancers() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_dashboard_freelancers() TO authenticated;
REVOKE ALL ON FUNCTION public.request_dashboard_access(uuid,uuid,uuid,text,text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_dashboard_access(uuid,uuid,uuid,text,text[]) TO authenticated;
REVOKE ALL ON FUNCTION public.respond_dashboard_access(uuid,boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.respond_dashboard_access(uuid,boolean) TO authenticated;
REVOKE ALL ON FUNCTION public.revoke_dashboard_access(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.revoke_dashboard_access(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.admin_review_freelancer_application(uuid,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_review_freelancer_application(uuid,text,text) TO authenticated;
REVOKE ALL ON FUNCTION public.transition_marketplace_order(uuid,text,text,text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.transition_marketplace_order(uuid,text,text,text[]) TO authenticated;
REVOKE ALL ON FUNCTION public.grant_tele_sales_invoice_access(uuid,text,text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.grant_tele_sales_invoice_access(uuid,text,text[]) TO authenticated;
REVOKE ALL ON FUNCTION public.revoke_tele_sales_invoice_access(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.revoke_tele_sales_invoice_access(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.list_tele_sales_access(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_tele_sales_access(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.has_tele_sales_access() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_tele_sales_access() TO authenticated;
REVOKE ALL ON FUNCTION public.get_tele_sales_invoices() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_tele_sales_invoices() TO authenticated;
REVOKE ALL ON FUNCTION public.record_tele_sales_call(uuid,text,text,timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_tele_sales_call(uuid,text,text,timestamptz) TO authenticated;
REVOKE ALL ON FUNCTION public.list_tele_sales_call_logs(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_tele_sales_call_logs(uuid) TO authenticated;

COMMIT;
