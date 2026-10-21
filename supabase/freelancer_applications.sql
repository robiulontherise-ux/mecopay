-- Freelancer application workflow.
-- Review and run manually in Supabase SQL Editor; this file is not auto-applied.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_influencer boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_freelancer boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_editor boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.freelancer_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  service_categories text[] NOT NULL
    CHECK (
      cardinality(service_categories) > 0
      AND service_categories <@ ARRAY[
        'design', 'video', 'social', 'writing', 'marketing'
      ]::text[]
    ),

  portfolio_url text,
  portfolio_links text[] NOT NULL DEFAULT '{}',
  experience_years integer CHECK (experience_years IS NULL OR experience_years >= 0),
  experience_summary text,
  tools text[] NOT NULL DEFAULT '{}',
  languages text[] NOT NULL DEFAULT '{}',
  weekly_capacity integer CHECK (weekly_capacity IS NULL OR weekly_capacity >= 0),
  rate_note text,

  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  applicant_note text,
  admin_note text,
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamptz,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- A user may keep historical rejected applications, but only one pending row.
CREATE UNIQUE INDEX IF NOT EXISTS freelancer_one_pending_application_per_user
  ON public.freelancer_applications (user_id)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS freelancer_applications_status_created_idx
  ON public.freelancer_applications (status, created_at DESC);

CREATE INDEX IF NOT EXISTS freelancer_applications_user_created_idx
  ON public.freelancer_applications (user_id, created_at DESC);
