BEGIN;

-- The freelancer stays authenticated as themselves. This helper is the database
-- authorization predicate for delegated page access: active, accepted, unexpired,
-- non-revoked grant; exact client + brand; exact page or a full-dashboard grant;
-- and the requested view/edit action.
CREATE OR REPLACE FUNCTION public.has_dashboard_page_access(
  p_client_id uuid,
  p_brand_id uuid,
  p_page_key text,
  p_action text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT auth.uid() IS NOT NULL
    AND p_action IN ('view', 'edit')
    AND p_page_key = ANY (ARRAY[
      'dashboard', 'payment_links', 'invoices', 'digital_service', 'full_cod_service',
      'courier_service', 'transactions', 'transaction_analysis', 'analytics',
      'website_builder', 'custom_domain', 'server_side_tracking', 'email_service',
      'web_custom_agent', 'social_custom_agent'
    ])
    AND EXISTS (
      SELECT 1
      FROM public.client_resource_access AS a
      JOIN public.brands AS b ON b.id = a.brand_id AND b.user_id = a.client_id
      WHERE a.client_id = p_client_id
        AND a.brand_id = p_brand_id
        AND a.member_id = auth.uid()
        AND a.resource_type = 'dashboard_page'
        AND a.resource_key IN ('*', p_page_key)
        AND a.status = 'active'
        AND (a.expires_at IS NULL OR a.expires_at > pg_catalog.now())
        AND a.revoked_at IS NULL
        AND COALESCE(a.actions, '{}'::text[]) @> ARRAY[p_action]::text[]
    );
$$;

-- Variant for legacy tables whose brand_id column is text rather than uuid.
CREATE OR REPLACE FUNCTION public.has_dashboard_page_access_text_brand(
  p_client_id uuid,
  p_brand_id text,
  p_page_key text,
  p_action text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT auth.uid() IS NOT NULL
    AND p_brand_id IS NOT NULL
    AND p_action IN ('view', 'edit')
    AND p_page_key = ANY (ARRAY[
      'dashboard', 'payment_links', 'invoices', 'digital_service', 'full_cod_service',
      'courier_service', 'transactions', 'transaction_analysis', 'analytics',
      'website_builder', 'custom_domain', 'server_side_tracking', 'email_service',
      'web_custom_agent', 'social_custom_agent'
    ])
    AND EXISTS (
      SELECT 1
      FROM public.client_resource_access AS a
      JOIN public.brands AS b ON b.id = a.brand_id AND b.user_id = a.client_id
      WHERE a.client_id = p_client_id
        AND a.brand_id::text = p_brand_id
        AND a.member_id = auth.uid()
        AND a.resource_type = 'dashboard_page'
        AND a.resource_key IN ('*', p_page_key)
        AND a.status = 'active'
        AND (a.expires_at IS NULL OR a.expires_at > pg_catalog.now())
        AND a.revoked_at IS NULL
        AND COALESCE(a.actions, '{}'::text[]) @> ARRAY[p_action]::text[]
    );
$$;

-- Brand-owned rows such as courier bookings and received mail do not carry a
-- client_id column. Resolve the client from the brand inside this SECURITY DEFINER
-- predicate rather than trusting a client_id supplied by the browser.
CREATE OR REPLACE FUNCTION public.has_dashboard_brand_page_access(
  p_brand_id uuid,
  p_page_key text,
  p_action text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.brands AS b
    WHERE b.id = p_brand_id
      AND public.has_dashboard_page_access(b.user_id, b.id, p_page_key, p_action)
  );
$$;

CREATE OR REPLACE FUNCTION public.has_dashboard_invoice_page_access(
  p_invoice_id uuid,
  p_page_key text,
  p_action text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.invoices AS i
    WHERE i.id = p_invoice_id
      AND i.brand_id IS NOT NULL
      AND public.has_dashboard_page_access(i.user_id, i.brand_id, p_page_key, p_action)
  );
$$;

-- This RPC validates the actual grant again and returns only page-safe brand fields.
-- Secret API keys, webhook secrets, merchant/courier credentials, and profile data
-- are intentionally omitted from the bootstrap context.
CREATE OR REPLACE FUNCTION public.get_shared_dashboard_page_context(
  p_access_id uuid,
  p_page_key text
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_access public.client_resource_access%ROWTYPE;
  v_brand public.brands%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF p_page_key IS NULL OR NOT (p_page_key = ANY (ARRAY[
    'dashboard', 'payment_links', 'invoices', 'digital_service', 'full_cod_service',
    'courier_service', 'transactions', 'transaction_analysis', 'analytics',
    'website_builder', 'custom_domain', 'server_side_tracking', 'email_service',
    'web_custom_agent', 'social_custom_agent'
  ])) THEN
    RAISE EXCEPTION 'Dashboard page is not allowed';
  END IF;

  SELECT * INTO v_access
  FROM public.client_resource_access AS a
  WHERE a.id = p_access_id
    AND a.member_id = auth.uid()
    AND a.resource_type = 'dashboard_page'
    AND a.resource_key IN ('*', p_page_key)
    AND a.status = 'active'
    AND (a.expires_at IS NULL OR a.expires_at > pg_catalog.now())
    AND a.revoked_at IS NULL
    AND COALESCE(a.actions, '{}'::text[]) @> ARRAY['view']::text[];
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active view permission for this dashboard page';
  END IF;

  SELECT * INTO v_brand
  FROM public.brands AS b
  WHERE b.id = v_access.brand_id
    AND b.user_id = v_access.client_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'The granted brand no longer belongs to the client';
  END IF;

  RETURN jsonb_build_object(
    'access_id', v_access.id,
    'client_id', v_access.client_id,
    'brand_id', v_access.brand_id,
    'resource_key', v_access.resource_key,
    'page_key', p_page_key,
    'actions', COALESCE(v_access.actions, '{}'::text[]),
    'expires_at', v_access.expires_at,
    'brand', jsonb_build_object(
      'id', v_brand.id,
      'user_id', v_brand.user_id,
      'name', v_brand.name,
      'logo_url', v_brand.logo_url,
      'support_email', v_brand.support_email,
      'website_url', v_brand.website_url,
      'redirect_links', COALESCE(v_brand.redirect_links, '{}'::jsonb),
      'payment_amount_type', v_brand.payment_amount_type,
      'amount_format', v_brand.amount_format,
      'transaction_fee', v_brand.transaction_fee,
      'transaction_fee_type', v_brand.transaction_fee_type,
      'full_cod_active', v_brand.full_cod_active,
      'full_cod_expires_at', v_brand.full_cod_expires_at,
      'personal_api', v_brand.personal_api,
      'merchant_api', v_brand.merchant_api,
      'international_api', v_brand.international_api,
      'auto_courier_on_full_cod', v_brand.auto_courier_on_full_cod,
      'auto_courier_on_advance', v_brand.auto_courier_on_advance,
      'auto_courier_on_full_payment', v_brand.auto_courier_on_full_payment,
      'courier_provider', v_brand.courier_provider,
      'courier_delay_hours_full_payment', v_brand.courier_delay_hours_full_payment,
      'courier_delay_hours_advance', v_brand.courier_delay_hours_advance,
      'courier_delay_hours_full_cod', v_brand.courier_delay_hours_full_cod
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.has_dashboard_page_access(uuid, uuid, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_dashboard_page_access_text_brand(uuid, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_dashboard_brand_page_access(uuid, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_dashboard_invoice_page_access(uuid, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_shared_dashboard_page_context(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_dashboard_page_access(uuid, uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_dashboard_page_access_text_brand(uuid, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_dashboard_brand_page_access(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_dashboard_invoice_page_access(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_shared_dashboard_page_context(uuid, text) TO authenticated;

-- Replace browser-local-only Web/Social Agent configuration with persistent
-- client+brand records. Both normal owners and authorized page editors use this table.
CREATE TABLE IF NOT EXISTS public.brand_agent_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client_id uuid NOT NULL,
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  agent_type text NOT NULL CHECK (agent_type IN ('web', 'social')),
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT brand_agent_configs_owner_identity_check CHECK (user_id = client_id),
  CONSTRAINT brand_agent_configs_owner_brand_agent_key UNIQUE (user_id, client_id, brand_id, agent_type)
);
ALTER TABLE public.brand_agent_configs ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brand_agent_configs TO authenticated;
DROP POLICY IF EXISTS brand_agent_configs_owner_all ON public.brand_agent_configs;
CREATE POLICY brand_agent_configs_owner_all ON public.brand_agent_configs
  FOR ALL TO authenticated
  USING (auth.uid() = user_id AND auth.uid() = client_id)
  WITH CHECK (auth.uid() = user_id AND auth.uid() = client_id);
DROP POLICY IF EXISTS brand_agent_configs_shared_select ON public.brand_agent_configs;
CREATE POLICY brand_agent_configs_shared_select ON public.brand_agent_configs
  FOR SELECT TO authenticated
  USING (
    user_id = client_id AND (
      (agent_type = 'web' AND public.has_dashboard_page_access(client_id, brand_id, 'web_custom_agent', 'view')) OR
      (agent_type = 'social' AND public.has_dashboard_page_access(client_id, brand_id, 'social_custom_agent', 'view'))
    )
  );
DROP POLICY IF EXISTS brand_agent_configs_shared_insert ON public.brand_agent_configs;
CREATE POLICY brand_agent_configs_shared_insert ON public.brand_agent_configs
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = client_id AND (
      (agent_type = 'web' AND public.has_dashboard_page_access(client_id, brand_id, 'web_custom_agent', 'edit')) OR
      (agent_type = 'social' AND public.has_dashboard_page_access(client_id, brand_id, 'social_custom_agent', 'edit'))
    )
  );
DROP POLICY IF EXISTS brand_agent_configs_shared_update ON public.brand_agent_configs;
CREATE POLICY brand_agent_configs_shared_update ON public.brand_agent_configs
  FOR UPDATE TO authenticated
  USING (
    user_id = client_id AND (
      (agent_type = 'web' AND public.has_dashboard_page_access(client_id, brand_id, 'web_custom_agent', 'edit')) OR
      (agent_type = 'social' AND public.has_dashboard_page_access(client_id, brand_id, 'social_custom_agent', 'edit'))
    )
  )
  WITH CHECK (
    user_id = client_id AND (
      (agent_type = 'web' AND public.has_dashboard_page_access(client_id, brand_id, 'web_custom_agent', 'edit')) OR
      (agent_type = 'social' AND public.has_dashboard_page_access(client_id, brand_id, 'social_custom_agent', 'edit'))
    )
  );

-- A dedicated one-row-per-brand settings table avoids storing courier credentials
-- on arbitrary courier booking rows. The existing booking table is extended only
-- with the recipient/amount fields the page already writes.
CREATE TABLE IF NOT EXISTS public.brand_courier_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'steadfast',
  api_endpoint text,
  api_key text,
  secret_key text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT brand_courier_settings_client_brand_key UNIQUE (client_id, brand_id)
);
ALTER TABLE public.brand_courier_settings ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brand_courier_settings TO authenticated;
DROP POLICY IF EXISTS brand_courier_settings_owner_all ON public.brand_courier_settings;
CREATE POLICY brand_courier_settings_owner_all ON public.brand_courier_settings
  FOR ALL TO authenticated
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);
DROP POLICY IF EXISTS brand_courier_settings_shared_select ON public.brand_courier_settings;
CREATE POLICY brand_courier_settings_shared_select ON public.brand_courier_settings
  FOR SELECT TO authenticated
  USING (public.has_dashboard_page_access(client_id, brand_id, 'courier_service', 'view'));
DROP POLICY IF EXISTS brand_courier_settings_shared_insert ON public.brand_courier_settings;
CREATE POLICY brand_courier_settings_shared_insert ON public.brand_courier_settings
  FOR INSERT TO authenticated
  WITH CHECK (public.has_dashboard_page_access(client_id, brand_id, 'courier_service', 'edit'));
DROP POLICY IF EXISTS brand_courier_settings_shared_update ON public.brand_courier_settings;
CREATE POLICY brand_courier_settings_shared_update ON public.brand_courier_settings
  FOR UPDATE TO authenticated
  USING (public.has_dashboard_page_access(client_id, brand_id, 'courier_service', 'edit'))
  WITH CHECK (public.has_dashboard_page_access(client_id, brand_id, 'courier_service', 'edit'));

ALTER TABLE public.courier_bookings ADD COLUMN IF NOT EXISTS recipient_name text;
ALTER TABLE public.courier_bookings ADD COLUMN IF NOT EXISTS recipient_phone text;
ALTER TABLE public.courier_bookings ADD COLUMN IF NOT EXISTS recipient_address text;
ALTER TABLE public.courier_bookings ADD COLUMN IF NOT EXISTS cod_amount numeric(12,2) NOT NULL DEFAULT 0;
ALTER TABLE public.courier_bookings ADD COLUMN IF NOT EXISTS advance_paid numeric(12,2) NOT NULL DEFAULT 0;
GRANT SELECT, INSERT, UPDATE ON public.courier_bookings TO authenticated;
DROP POLICY IF EXISTS courier_bookings_shared_select ON public.courier_bookings;
CREATE POLICY courier_bookings_shared_select ON public.courier_bookings
  FOR SELECT TO authenticated
  USING (public.has_dashboard_brand_page_access(brand_id, 'courier_service', 'view'));
DROP POLICY IF EXISTS courier_bookings_shared_insert ON public.courier_bookings;
CREATE POLICY courier_bookings_shared_insert ON public.courier_bookings
  FOR INSERT TO authenticated
  WITH CHECK (public.has_dashboard_brand_page_access(brand_id, 'courier_service', 'edit'));
DROP POLICY IF EXISTS courier_bookings_shared_update ON public.courier_bookings;
CREATE POLICY courier_bookings_shared_update ON public.courier_bookings
  FOR UPDATE TO authenticated
  USING (public.has_dashboard_brand_page_access(brand_id, 'courier_service', 'edit'))
  WITH CHECK (public.has_dashboard_brand_page_access(brand_id, 'courier_service', 'edit'));

-- Enable RLS on brands (the table currently has RLS disabled). Keep public brand
-- reads for anonymous storefronts and restore owner CRUD for normal merchant use.
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS brands_public_select ON public.brands;
CREATE POLICY brands_public_select ON public.brands
  FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS brands_owner_all ON public.brands;
CREATE POLICY brands_owner_all ON public.brands
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS shared_dashboard_brand_select ON public.brands;
CREATE POLICY shared_dashboard_brand_select ON public.brands
  FOR SELECT TO authenticated
  USING (
    public.has_dashboard_page_access(user_id, id, 'full_cod_service', 'view') OR
    public.has_dashboard_page_access(user_id, id, 'courier_service', 'view')
  );
DROP POLICY IF EXISTS shared_dashboard_brand_update ON public.brands;
CREATE POLICY shared_dashboard_brand_update ON public.brands
  FOR UPDATE TO authenticated
  USING (
    public.has_dashboard_page_access(user_id, id, 'full_cod_service', 'edit') OR
    public.has_dashboard_page_access(user_id, id, 'courier_service', 'edit')
  )
  WITH CHECK (
    public.has_dashboard_page_access(user_id, id, 'full_cod_service', 'edit') OR
    public.has_dashboard_page_access(user_id, id, 'courier_service', 'edit')
  );

-- Remove broad authenticated/anonymous write policies from configuration tables;
-- normal owner policies remain, and the delegated policies below are page-specific.
DROP POLICY IF EXISTS "Merchants can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Merchants can manage posts" ON public.posts;
DROP POLICY IF EXISTS "Allow public and client access for digital_services" ON public.digital_services;
DROP POLICY IF EXISTS "Allow all for authenticated and anon" ON public.sms_forwarder_settings;
DROP POLICY IF EXISTS "Allow authenticated read write gw" ON public.whatsapp_gateway_settings;
DROP POLICY IF EXISTS whatsapp_gateway_settings_all ON public.whatsapp_gateway_settings;

-- Preserve normal merchant access for tables that previously had no owner policy
-- (or had only broad policies), without reintroducing anonymous access.
DROP POLICY IF EXISTS whatsapp_gateway_settings_owner_all ON public.whatsapp_gateway_settings;
CREATE POLICY whatsapp_gateway_settings_owner_all ON public.whatsapp_gateway_settings
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS server_side_tracking_owner_all ON public.server_side_tracking;
CREATE POLICY server_side_tracking_owner_all ON public.server_side_tracking
  FOR ALL TO authenticated
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

-- Dashboard overview read-only resources.
DROP POLICY IF EXISTS shared_dashboard_payment_numbers_select ON public.payment_numbers;
CREATE POLICY shared_dashboard_payment_numbers_select ON public.payment_numbers
  FOR SELECT TO authenticated
  USING (
    public.has_dashboard_page_access(user_id, brand_id, 'dashboard', 'view') OR
    public.has_dashboard_page_access(user_id, brand_id, 'invoices', 'view') OR
    public.has_dashboard_page_access(user_id, brand_id, 'transactions', 'view') OR
    public.has_dashboard_page_access(user_id, brand_id, 'transaction_analysis', 'view') OR
    public.has_dashboard_page_access(user_id, brand_id, 'analytics', 'view') OR
    public.has_dashboard_page_access(user_id, brand_id, 'courier_service', 'view')
  );
DROP POLICY IF EXISTS shared_dashboard_webhooks_select ON public.webhooks;
CREATE POLICY shared_dashboard_webhooks_select ON public.webhooks
  FOR SELECT TO authenticated
  USING (public.has_dashboard_page_access(user_id, brand_id, 'dashboard', 'view'));
DROP POLICY IF EXISTS shared_dashboard_sms_forwarder_select ON public.sms_forwarder_settings;
CREATE POLICY shared_dashboard_sms_forwarder_select ON public.sms_forwarder_settings
  FOR SELECT TO authenticated
  USING (
    public.has_dashboard_page_access_text_brand(user_id, brand_id, 'dashboard', 'view')
  );

-- Digital Service page.
DROP POLICY IF EXISTS shared_digital_services_select ON public.digital_services;
CREATE POLICY shared_digital_services_select ON public.digital_services
  FOR SELECT TO authenticated
  USING (public.has_dashboard_page_access(client_id, brand_id, 'digital_service', 'view'));
DROP POLICY IF EXISTS shared_digital_services_insert ON public.digital_services;
CREATE POLICY shared_digital_services_insert ON public.digital_services
  FOR INSERT TO authenticated
  WITH CHECK (public.has_dashboard_page_access(client_id, brand_id, 'digital_service', 'edit'));
DROP POLICY IF EXISTS shared_digital_services_update ON public.digital_services;
CREATE POLICY shared_digital_services_update ON public.digital_services
  FOR UPDATE TO authenticated
  USING (public.has_dashboard_page_access(client_id, brand_id, 'digital_service', 'edit'))
  WITH CHECK (public.has_dashboard_page_access(client_id, brand_id, 'digital_service', 'edit'));

-- Marketplace page and invoice-backed views. Public checkout policies on invoices,
-- payment_links, and site tables are not changed here; the shared frontend also
-- performs active-grant RPC validation before showing shared data/actions.
DROP POLICY IF EXISTS shared_payment_links_select ON public.payment_links;
CREATE POLICY shared_payment_links_select ON public.payment_links
  FOR SELECT TO authenticated
  USING (
    public.has_dashboard_page_access(user_id, brand_id, 'payment_links', 'view') OR
    public.has_dashboard_page_access(user_id, brand_id, 'invoices', 'view') OR
    public.has_dashboard_page_access(user_id, brand_id, 'transactions', 'view') OR
    public.has_dashboard_page_access(user_id, brand_id, 'transaction_analysis', 'view') OR
    public.has_dashboard_page_access(user_id, brand_id, 'analytics', 'view')
  );
DROP POLICY IF EXISTS shared_payment_links_insert ON public.payment_links;
CREATE POLICY shared_payment_links_insert ON public.payment_links
  FOR INSERT TO authenticated
  WITH CHECK (public.has_dashboard_page_access(user_id, brand_id, 'payment_links', 'edit'));
DROP POLICY IF EXISTS shared_payment_links_update ON public.payment_links;
CREATE POLICY shared_payment_links_update ON public.payment_links
  FOR UPDATE TO authenticated
  USING (public.has_dashboard_page_access(user_id, brand_id, 'payment_links', 'edit'))
  WITH CHECK (public.has_dashboard_page_access(user_id, brand_id, 'payment_links', 'edit'));
DROP POLICY IF EXISTS shared_payment_links_delete ON public.payment_links;
CREATE POLICY shared_payment_links_delete ON public.payment_links
  FOR DELETE TO authenticated
  USING (public.has_dashboard_page_access(user_id, brand_id, 'payment_links', 'edit'));

DROP POLICY IF EXISTS shared_invoices_select ON public.invoices;
CREATE POLICY shared_invoices_select ON public.invoices
  FOR SELECT TO authenticated
  USING (
    public.has_dashboard_page_access(user_id, brand_id, 'invoices', 'view') OR
    public.has_dashboard_page_access(user_id, brand_id, 'transactions', 'view') OR
    public.has_dashboard_page_access(user_id, brand_id, 'transaction_analysis', 'view') OR
    public.has_dashboard_page_access(user_id, brand_id, 'analytics', 'view') OR
    public.has_dashboard_page_access(user_id, brand_id, 'courier_service', 'view')
  );
DROP POLICY IF EXISTS shared_invoices_update ON public.invoices;
CREATE POLICY shared_invoices_update ON public.invoices
  FOR UPDATE TO authenticated
  USING (
    public.has_dashboard_page_access(user_id, brand_id, 'invoices', 'edit') OR
    public.has_dashboard_page_access(user_id, brand_id, 'transactions', 'edit') OR
    public.has_dashboard_page_access(user_id, brand_id, 'transaction_analysis', 'edit') OR
    public.has_dashboard_page_access(user_id, brand_id, 'payment_links', 'edit')
  )
  WITH CHECK (
    public.has_dashboard_page_access(user_id, brand_id, 'invoices', 'edit') OR
    public.has_dashboard_page_access(user_id, brand_id, 'transactions', 'edit') OR
    public.has_dashboard_page_access(user_id, brand_id, 'transaction_analysis', 'edit') OR
    public.has_dashboard_page_access(user_id, brand_id, 'payment_links', 'edit')
  );
DROP POLICY IF EXISTS shared_invoices_delete ON public.invoices;
CREATE POLICY shared_invoices_delete ON public.invoices
  FOR DELETE TO authenticated
  USING (
    public.has_dashboard_page_access(user_id, brand_id, 'invoices', 'edit') OR
    public.has_dashboard_page_access(user_id, brand_id, 'transactions', 'edit') OR
    public.has_dashboard_page_access(user_id, brand_id, 'transaction_analysis', 'edit')
  );
DROP POLICY IF EXISTS shared_sms_events_select ON public.sms_events;
CREATE POLICY shared_sms_events_select ON public.sms_events
  FOR SELECT TO authenticated
  USING (
    user_id = (SELECT i.user_id FROM public.invoices AS i WHERE i.id = sms_events.invoice_id)
    AND (
      public.has_dashboard_invoice_page_access(invoice_id, 'invoices', 'view') OR
      public.has_dashboard_invoice_page_access(invoice_id, 'transactions', 'view') OR
      public.has_dashboard_invoice_page_access(invoice_id, 'transaction_analysis', 'view') OR
      public.has_dashboard_invoice_page_access(invoice_id, 'analytics', 'view')
    )
  );

-- Full COD and Courier pages update only the selected client's brand row. The
-- existing checkout-facing public SELECT policy on brands is intentionally kept.
DROP POLICY IF EXISTS shared_brands_full_cod_update ON public.brands;
CREATE POLICY shared_brands_full_cod_update ON public.brands
  FOR UPDATE TO authenticated
  USING (public.has_dashboard_page_access(user_id, id, 'full_cod_service', 'edit'))
  WITH CHECK (public.has_dashboard_page_access(user_id, id, 'full_cod_service', 'edit'));
DROP POLICY IF EXISTS shared_brands_courier_update ON public.brands;
CREATE POLICY shared_brands_courier_update ON public.brands
  FOR UPDATE TO authenticated
  USING (public.has_dashboard_page_access(user_id, id, 'courier_service', 'edit'))
  WITH CHECK (public.has_dashboard_page_access(user_id, id, 'courier_service', 'edit'));
DROP POLICY IF EXISTS shared_courier_bookings_delete ON public.courier_bookings;
CREATE POLICY shared_courier_bookings_delete ON public.courier_bookings
  FOR DELETE TO authenticated
  USING (public.has_dashboard_brand_page_access(brand_id, 'courier_service', 'edit'));

-- Website Builder, custom domain, tracking, and email pages share only the exact
-- selected client/brand data. Existing public SELECT for storefront content remains.
DROP POLICY IF EXISTS shared_site_settings_select ON public.site_settings;
CREATE POLICY shared_site_settings_select ON public.site_settings
  FOR SELECT TO authenticated
  USING (
    public.has_dashboard_page_access(client_id, brand_id, 'website_builder', 'view') OR
    public.has_dashboard_page_access(client_id, brand_id, 'custom_domain', 'view') OR
    public.has_dashboard_page_access(client_id, brand_id, 'server_side_tracking', 'view') OR
    public.has_dashboard_page_access(client_id, brand_id, 'email_service', 'view')
  );
DROP POLICY IF EXISTS shared_site_settings_insert ON public.site_settings;
DROP POLICY IF EXISTS shared_site_settings_update ON public.site_settings;
CREATE POLICY shared_site_settings_update ON public.site_settings
  FOR UPDATE TO authenticated
  USING (
    public.has_dashboard_page_access(client_id, brand_id, 'website_builder', 'edit') OR
    public.has_dashboard_page_access(client_id, brand_id, 'custom_domain', 'edit')
  )
  WITH CHECK (
    public.has_dashboard_page_access(client_id, brand_id, 'website_builder', 'edit') OR
    public.has_dashboard_page_access(client_id, brand_id, 'custom_domain', 'edit')
  );
DROP POLICY IF EXISTS shared_site_settings_delete ON public.site_settings;

DROP POLICY IF EXISTS shared_categories_select ON public.categories;
CREATE POLICY shared_categories_select ON public.categories
  FOR SELECT TO authenticated
  USING (public.has_dashboard_page_access(client_id, brand_id, 'website_builder', 'view'));
DROP POLICY IF EXISTS shared_categories_insert ON public.categories;
CREATE POLICY shared_categories_insert ON public.categories
  FOR INSERT TO authenticated
  WITH CHECK (public.has_dashboard_page_access(client_id, brand_id, 'website_builder', 'edit'));
DROP POLICY IF EXISTS shared_categories_update ON public.categories;
CREATE POLICY shared_categories_update ON public.categories
  FOR UPDATE TO authenticated
  USING (public.has_dashboard_page_access(client_id, brand_id, 'website_builder', 'edit'))
  WITH CHECK (public.has_dashboard_page_access(client_id, brand_id, 'website_builder', 'edit'));
DROP POLICY IF EXISTS shared_categories_delete ON public.categories;
CREATE POLICY shared_categories_delete ON public.categories
  FOR DELETE TO authenticated
  USING (public.has_dashboard_page_access(client_id, brand_id, 'website_builder', 'edit'));

DROP POLICY IF EXISTS shared_posts_select ON public.posts;
CREATE POLICY shared_posts_select ON public.posts
  FOR SELECT TO authenticated
  USING (public.has_dashboard_page_access(client_id, brand_id, 'website_builder', 'view'));
DROP POLICY IF EXISTS shared_posts_insert ON public.posts;
CREATE POLICY shared_posts_insert ON public.posts
  FOR INSERT TO authenticated
  WITH CHECK (public.has_dashboard_page_access(client_id, brand_id, 'website_builder', 'edit'));
DROP POLICY IF EXISTS shared_posts_update ON public.posts;
CREATE POLICY shared_posts_update ON public.posts
  FOR UPDATE TO authenticated
  USING (public.has_dashboard_page_access(client_id, brand_id, 'website_builder', 'edit'))
  WITH CHECK (public.has_dashboard_page_access(client_id, brand_id, 'website_builder', 'edit'));
DROP POLICY IF EXISTS shared_posts_delete ON public.posts;
CREATE POLICY shared_posts_delete ON public.posts
  FOR DELETE TO authenticated
  USING (public.has_dashboard_page_access(client_id, brand_id, 'website_builder', 'edit'));

DROP POLICY IF EXISTS shared_tracking_select ON public.server_side_tracking;
CREATE POLICY shared_tracking_select ON public.server_side_tracking
  FOR SELECT TO authenticated
  USING (public.has_dashboard_page_access(client_id, brand_id, 'server_side_tracking', 'view'));
DROP POLICY IF EXISTS shared_tracking_insert ON public.server_side_tracking;
CREATE POLICY shared_tracking_insert ON public.server_side_tracking
  FOR INSERT TO authenticated
  WITH CHECK (public.has_dashboard_page_access(client_id, brand_id, 'server_side_tracking', 'edit'));
DROP POLICY IF EXISTS shared_tracking_update ON public.server_side_tracking;
CREATE POLICY shared_tracking_update ON public.server_side_tracking
  FOR UPDATE TO authenticated
  USING (public.has_dashboard_page_access(client_id, brand_id, 'server_side_tracking', 'edit'))
  WITH CHECK (public.has_dashboard_page_access(client_id, brand_id, 'server_side_tracking', 'edit'));
DROP POLICY IF EXISTS shared_tracking_delete ON public.server_side_tracking;
CREATE POLICY shared_tracking_delete ON public.server_side_tracking
  FOR DELETE TO authenticated
  USING (public.has_dashboard_page_access(client_id, brand_id, 'server_side_tracking', 'edit'));

DROP POLICY IF EXISTS shared_brand_mailboxes_select ON public.brand_mailboxes;
CREATE POLICY shared_brand_mailboxes_select ON public.brand_mailboxes
  FOR SELECT TO authenticated
  USING (public.has_dashboard_page_access(client_id, brand_id, 'email_service', 'view'));
DROP POLICY IF EXISTS shared_incoming_emails_select ON public.incoming_emails;
CREATE POLICY shared_incoming_emails_select ON public.incoming_emails
  FOR SELECT TO authenticated
  USING (public.has_dashboard_brand_page_access(brand_id, 'email_service', 'view'));
DROP POLICY IF EXISTS shared_whatsapp_courier_select ON public.whatsapp_gateway_settings;
DROP POLICY IF EXISTS shared_whatsapp_courier_insert ON public.whatsapp_gateway_settings;
DROP POLICY IF EXISTS shared_whatsapp_courier_update ON public.whatsapp_gateway_settings;

-- Field-level guards prevent a valid page grant from changing unrelated columns
-- through direct PostgREST requests. Owners retain the existing merchant behavior.
CREATE OR REPLACE FUNCTION public.guard_shared_brand_page_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_allowed text[] := '{}'::text[];
BEGIN
  IF auth.uid() IS NULL OR auth.uid() = OLD.user_id THEN RETURN NEW; END IF;
  IF public.has_dashboard_page_access(OLD.user_id, OLD.id, 'full_cod_service', 'edit') THEN
    v_allowed := v_allowed || ARRAY['full_cod_active'];
  END IF;
  IF public.has_dashboard_page_access(OLD.user_id, OLD.id, 'courier_service', 'edit') THEN
    v_allowed := v_allowed || ARRAY['auto_courier_on_full_cod', 'auto_courier_on_advance'];
  END IF;
  IF cardinality(v_allowed) = 0 THEN RAISE EXCEPTION 'No active edit permission for these brand settings'; END IF;
  IF (to_jsonb(NEW) - v_allowed) IS DISTINCT FROM (to_jsonb(OLD) - v_allowed) THEN
    RAISE EXCEPTION 'This dashboard grant cannot change unrelated brand fields';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS brands_shared_page_column_guard ON public.brands;
CREATE TRIGGER brands_shared_page_column_guard BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.guard_shared_brand_page_columns();

CREATE OR REPLACE FUNCTION public.guard_shared_site_settings_page_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_allowed text[] := '{}'::text[];
BEGIN
  IF auth.uid() IS NULL OR auth.uid() = OLD.client_id THEN RETURN NEW; END IF;
  IF public.has_dashboard_page_access(OLD.client_id, OLD.brand_id, 'website_builder', 'edit') THEN
    v_allowed := v_allowed || ARRAY[
      'site_name', 'site_logo', 'site_name_color', 'site_name_size', 'primary_color',
      'text_size', 'show_default_home', 'default_home_content', 'default_home_format_type',
      'project_type', 'zip_url', 'app_type', 'meta_title', 'meta_description',
      'meta_keywords', 'og_image', 'canonical_domain'
    ];
  END IF;
  IF public.has_dashboard_page_access(OLD.client_id, OLD.brand_id, 'custom_domain', 'edit') THEN
    v_allowed := v_allowed || ARRAY[
      'domain', 'origin_url', 'subdomain', 'custom_domain_verified',
      'custom_hostname_id', 'ssl_status', 'domain_status', 'custom_domain_expires_at'
    ];
  END IF;
  IF cardinality(v_allowed) = 0 THEN RAISE EXCEPTION 'No active edit permission for these site settings'; END IF;
  IF (to_jsonb(NEW) - v_allowed) IS DISTINCT FROM (to_jsonb(OLD) - v_allowed) THEN
    RAISE EXCEPTION 'This dashboard grant cannot change unrelated site settings';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS site_settings_shared_page_column_guard ON public.site_settings;
CREATE TRIGGER site_settings_shared_page_column_guard BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.guard_shared_site_settings_page_columns();

CREATE OR REPLACE FUNCTION public.guard_shared_invoice_page_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_allowed text[] := '{}'::text[];
BEGIN
  IF auth.uid() IS NULL OR auth.uid() = OLD.user_id THEN RETURN NEW; END IF;
  IF public.has_dashboard_page_access(OLD.user_id, OLD.brand_id, 'invoices', 'edit') OR
     public.has_dashboard_page_access(OLD.user_id, OLD.brand_id, 'transactions', 'edit') OR
     public.has_dashboard_page_access(OLD.user_id, OLD.brand_id, 'transaction_analysis', 'edit') THEN
    v_allowed := v_allowed || ARRAY['status'];
  END IF;
  IF NEW.payment_link_id IS NULL AND
     public.has_dashboard_page_access(OLD.user_id, OLD.brand_id, 'payment_links', 'edit') THEN
    v_allowed := v_allowed || ARRAY['payment_link_id'];
  END IF;
  IF cardinality(v_allowed) = 0 THEN RAISE EXCEPTION 'No active edit permission for these invoice fields'; END IF;
  IF (to_jsonb(NEW) - v_allowed) IS DISTINCT FROM (to_jsonb(OLD) - v_allowed) THEN
    RAISE EXCEPTION 'This dashboard grant cannot change unrelated invoice fields';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS invoices_shared_page_column_guard ON public.invoices;
CREATE TRIGGER invoices_shared_page_column_guard BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.guard_shared_invoice_page_columns();

-- Restrictive policies are intentional here: they AND with legacy permissive
-- policies instead of being OR-ed with them. Anonymous checkout remains on its
-- existing policies, while authenticated freelancers cannot bypass page grants
-- through direct PostgREST table calls.
DROP POLICY IF EXISTS brands_authenticated_read_bound ON public.brands;
CREATE POLICY brands_authenticated_read_bound ON public.brands
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR
    public.has_dashboard_page_access(user_id, id, 'full_cod_service', 'view') OR
    public.has_dashboard_page_access(user_id, id, 'courier_service', 'view')
  );
DROP POLICY IF EXISTS brands_authenticated_update_bound ON public.brands;
CREATE POLICY brands_authenticated_update_bound ON public.brands
  AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id OR
    public.has_dashboard_page_access(user_id, id, 'full_cod_service', 'edit') OR
    public.has_dashboard_page_access(user_id, id, 'courier_service', 'edit')
  )
  WITH CHECK (
    auth.uid() = user_id OR
    public.has_dashboard_page_access(user_id, id, 'full_cod_service', 'edit') OR
    public.has_dashboard_page_access(user_id, id, 'courier_service', 'edit')
  );
DROP POLICY IF EXISTS brands_authenticated_insert_owner ON public.brands;
CREATE POLICY brands_authenticated_insert_owner ON public.brands
  AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS brands_authenticated_delete_owner ON public.brands;
CREATE POLICY brands_authenticated_delete_owner ON public.brands
  AS RESTRICTIVE FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS site_settings_authenticated_read_bound ON public.site_settings;
CREATE POLICY site_settings_authenticated_read_bound ON public.site_settings
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (
    auth.uid() = client_id OR
    public.has_dashboard_page_access(client_id, brand_id, 'website_builder', 'view') OR
    public.has_dashboard_page_access(client_id, brand_id, 'custom_domain', 'view') OR
    public.has_dashboard_page_access(client_id, brand_id, 'server_side_tracking', 'view') OR
    public.has_dashboard_page_access(client_id, brand_id, 'email_service', 'view')
  );
DROP POLICY IF EXISTS site_settings_authenticated_insert_owner ON public.site_settings;
CREATE POLICY site_settings_authenticated_insert_owner ON public.site_settings
  AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = client_id);
DROP POLICY IF EXISTS site_settings_authenticated_update_bound ON public.site_settings;
CREATE POLICY site_settings_authenticated_update_bound ON public.site_settings
  AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (
    auth.uid() = client_id OR
    public.has_dashboard_page_access(client_id, brand_id, 'website_builder', 'edit') OR
    public.has_dashboard_page_access(client_id, brand_id, 'custom_domain', 'edit')
  )
  WITH CHECK (
    auth.uid() = client_id OR
    public.has_dashboard_page_access(client_id, brand_id, 'website_builder', 'edit') OR
    public.has_dashboard_page_access(client_id, brand_id, 'custom_domain', 'edit')
  );
DROP POLICY IF EXISTS site_settings_authenticated_delete_owner ON public.site_settings;
CREATE POLICY site_settings_authenticated_delete_owner ON public.site_settings
  AS RESTRICTIVE FOR DELETE TO authenticated
  USING (auth.uid() = client_id);

DROP POLICY IF EXISTS invoices_authenticated_read_bound ON public.invoices;
CREATE POLICY invoices_authenticated_read_bound ON public.invoices
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR
    public.has_dashboard_page_access(user_id, brand_id, 'dashboard', 'view') OR
    public.has_dashboard_page_access(user_id, brand_id, 'invoices', 'view') OR
    public.has_dashboard_page_access(user_id, brand_id, 'transactions', 'view') OR
    public.has_dashboard_page_access(user_id, brand_id, 'transaction_analysis', 'view') OR
    public.has_dashboard_page_access(user_id, brand_id, 'analytics', 'view') OR
    public.has_dashboard_page_access(user_id, brand_id, 'courier_service', 'view')
  );
DROP POLICY IF EXISTS invoices_authenticated_insert_owner ON public.invoices;
CREATE POLICY invoices_authenticated_insert_owner ON public.invoices
  AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS invoices_authenticated_update_bound ON public.invoices;
CREATE POLICY invoices_authenticated_update_bound ON public.invoices
  AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id OR
    public.has_dashboard_page_access(user_id, brand_id, 'invoices', 'edit') OR
    public.has_dashboard_page_access(user_id, brand_id, 'transactions', 'edit') OR
    public.has_dashboard_page_access(user_id, brand_id, 'transaction_analysis', 'edit') OR
    public.has_dashboard_page_access(user_id, brand_id, 'payment_links', 'edit')
  )
  WITH CHECK (
    auth.uid() = user_id OR
    public.has_dashboard_page_access(user_id, brand_id, 'invoices', 'edit') OR
    public.has_dashboard_page_access(user_id, brand_id, 'transactions', 'edit') OR
    public.has_dashboard_page_access(user_id, brand_id, 'transaction_analysis', 'edit') OR
    public.has_dashboard_page_access(user_id, brand_id, 'payment_links', 'edit')
  );
DROP POLICY IF EXISTS invoices_authenticated_delete_bound ON public.invoices;
CREATE POLICY invoices_authenticated_delete_bound ON public.invoices
  AS RESTRICTIVE FOR DELETE TO authenticated
  USING (
    auth.uid() = user_id OR
    public.has_dashboard_page_access(user_id, brand_id, 'invoices', 'edit') OR
    public.has_dashboard_page_access(user_id, brand_id, 'transactions', 'edit') OR
    public.has_dashboard_page_access(user_id, brand_id, 'transaction_analysis', 'edit')
  );

COMMIT;
