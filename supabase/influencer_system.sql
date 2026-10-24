BEGIN;

-- Replace the old application-style influencer fields with admin-managed assignment fields.
ALTER TABLE public.influencer_profiles
  DROP COLUMN IF EXISTS bio,
  DROP COLUMN IF EXISTS niches,
  DROP COLUMN IF EXISTS languages,
  DROP COLUMN IF EXISTS audience_countries,
  DROP COLUMN IF EXISTS platform_accounts,
  DROP COLUMN IF EXISTS audience_summary,
  DROP COLUMN IF EXISTS rate_card,
  DROP COLUMN IF EXISTS profile_status,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS platform text,
  ADD COLUMN IF NOT EXISTS profile_url text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS admin_note text,
  ADD COLUMN IF NOT EXISTS assigned_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.influencer_profiles
  DROP CONSTRAINT IF EXISTS influencer_profiles_status_check;
ALTER TABLE public.influencer_profiles
  ADD CONSTRAINT influencer_profiles_status_check CHECK (status IN ('active','paused','inactive'));

CREATE UNIQUE INDEX IF NOT EXISTS influencer_profiles_user_id_uidx
  ON public.influencer_profiles(user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'influencer_profiles_user_id_fkey'
  ) THEN
    ALTER TABLE public.influencer_profiles
      ADD CONSTRAINT influencer_profiles_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.influencer_coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_profile_id uuid NOT NULL REFERENCES public.influencer_profiles(id) ON DELETE CASCADE,
  coupon_code text NOT NULL,
  customer_discount_percent numeric(5,2) NOT NULL DEFAULT 0 CHECK (customer_discount_percent >= 0 AND customer_discount_percent <= 100),
  commission_percent numeric(5,2) NOT NULL DEFAULT 0 CHECK (commission_percent >= 0 AND commission_percent <= 100),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','expired')),
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS influencer_coupons_code_lower_uidx ON public.influencer_coupons (lower(coupon_code));
CREATE INDEX IF NOT EXISTS influencer_coupons_profile_idx ON public.influencer_coupons (influencer_profile_id, status);

CREATE TABLE IF NOT EXISTS public.influencer_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_profile_id uuid NOT NULL REFERENCES public.influencer_profiles(id) ON DELETE CASCADE,
  coupon_id uuid NOT NULL REFERENCES public.influencer_coupons(id) ON DELETE RESTRICT,
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  order_amount numeric(14,2) NOT NULL DEFAULT 0,
  discount_amount numeric(14,2) NOT NULL DEFAULT 0,
  commission_amount numeric(14,2) NOT NULL DEFAULT 0,
  order_status text NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending','paid','cancelled','refunded')),
  payout_status text NOT NULL DEFAULT 'pending' CHECK (payout_status IN ('pending','approved','paid','rejected')),
  used_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS influencer_conversions_invoice_uidx ON public.influencer_conversions(invoice_id) WHERE invoice_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS influencer_conversions_profile_idx ON public.influencer_conversions (influencer_profile_id, order_status, payout_status);

CREATE TABLE IF NOT EXISTS public.influencer_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_profile_id uuid NOT NULL REFERENCES public.influencer_profiles(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  approved_amount numeric(14,2) NOT NULL DEFAULT 0,
  paid_amount numeric(14,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','paid','rejected')),
  payment_method text,
  payment_reference text,
  admin_note text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (period_end >= period_start)
);
CREATE INDEX IF NOT EXISTS influencer_payouts_profile_idx ON public.influencer_payouts (influencer_profile_id, status, period_end DESC);

ALTER TABLE public.influencer_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_payouts ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.influencer_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.influencer_coupons TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.influencer_conversions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.influencer_payouts TO authenticated;

DROP POLICY IF EXISTS influencer_coupons_owner_admin_select ON public.influencer_coupons;
CREATE POLICY influencer_coupons_owner_admin_select ON public.influencer_coupons FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.influencer_profiles ip WHERE ip.id = influencer_profile_id AND ip.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin IS TRUE)
);
DROP POLICY IF EXISTS influencer_coupons_admin_write ON public.influencer_coupons;
CREATE POLICY influencer_coupons_admin_write ON public.influencer_coupons FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin IS TRUE)
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin IS TRUE)
);

DROP POLICY IF EXISTS influencer_conversions_owner_admin_select ON public.influencer_conversions;
CREATE POLICY influencer_conversions_owner_admin_select ON public.influencer_conversions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.influencer_profiles ip WHERE ip.id = influencer_profile_id AND ip.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin IS TRUE)
);
DROP POLICY IF EXISTS influencer_payouts_owner_admin_select ON public.influencer_payouts;
CREATE POLICY influencer_payouts_owner_admin_select ON public.influencer_payouts FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.influencer_profiles ip WHERE ip.id = influencer_profile_id AND ip.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin IS TRUE)
);
DROP POLICY IF EXISTS influencer_payouts_admin_write ON public.influencer_payouts;
CREATE POLICY influencer_payouts_admin_write ON public.influencer_payouts FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin IS TRUE)
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin IS TRUE)
);

CREATE OR REPLACE FUNCTION public.admin_set_influencer(p_email text, p_enabled boolean DEFAULT true)
RETURNS public.profiles
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
DECLARE v_profile public.profiles;
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin IS TRUE) THEN
    RAISE EXCEPTION 'Admin permission required';
  END IF;
  UPDATE public.profiles SET is_influencer = p_enabled, updated_at = now()
  WHERE lower(email) = lower(trim(p_email))
  RETURNING * INTO v_profile;
  IF NOT FOUND THEN RAISE EXCEPTION 'No profile found for this email'; END IF;
  IF p_enabled THEN
    INSERT INTO public.influencer_profiles (user_id, status, assigned_at)
    VALUES (v_profile.id, 'active', now())
    ON CONFLICT (user_id) DO UPDATE SET status = 'active', updated_at = now();
  END IF;
  RETURN v_profile;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_set_influencer(text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_influencer(text, boolean) TO authenticated;

COMMIT;
