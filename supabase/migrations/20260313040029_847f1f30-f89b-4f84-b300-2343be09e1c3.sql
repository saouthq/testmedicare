
-- ═══════════════════════════════════════════════════════
-- Phase 10b: Remaining tables for full completion
-- ═══════════════════════════════════════════════════════

-- 1. Admin config (key-value store for all admin settings)
CREATE TABLE public.admin_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by text DEFAULT 'system',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage config" ON public.admin_config FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can read config" ON public.admin_config FOR SELECT TO authenticated USING (true);

-- 2. Promotions
CREATE TABLE public.promotions (
  id text PRIMARY KEY DEFAULT ('promo-' || gen_random_uuid()::text),
  name text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'free_months',
  value numeric NOT NULL DEFAULT 0,
  start_date text DEFAULT '',
  end_date text DEFAULT '',
  target text DEFAULT 'all',
  status text NOT NULL DEFAULT 'active',
  new_doctors_only boolean DEFAULT true,
  require_signup_during_period boolean DEFAULT true,
  auto_apply boolean DEFAULT true,
  require_code boolean DEFAULT false,
  promo_code text DEFAULT '',
  notes text DEFAULT '',
  usage_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage promotions" ON public.promotions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view active promotions" ON public.promotions FOR SELECT TO authenticated USING (status = 'active');

-- 3. Organizations
CREATE TABLE public.organizations (
  id text PRIMARY KEY DEFAULT ('org-' || gen_random_uuid()::text),
  name text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'clinic',
  address text DEFAULT '',
  city text DEFAULT 'Tunis',
  phone text DEFAULT '',
  email text DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  members_count integer DEFAULT 0,
  subscription_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage organizations" ON public.organizations FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- 4. Campaigns
CREATE TABLE public.campaigns (
  id text PRIMARY KEY DEFAULT ('camp-' || gen_random_uuid()::text),
  name text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'sms',
  target text DEFAULT 'all',
  subject text DEFAULT '',
  content text DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  recipients_count integer DEFAULT 0,
  sent_count integer DEFAULT 0,
  open_rate numeric DEFAULT 0,
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_by text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage campaigns" ON public.campaigns FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- 5. Secretary call log
CREATE TABLE public.call_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  doctor_id uuid NOT NULL,
  caller text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  call_type text NOT NULL DEFAULT 'incoming',
  time text DEFAULT '',
  date text DEFAULT '',
  duration text DEFAULT '',
  motif text DEFAULT '',
  handled boolean DEFAULT false,
  note text DEFAULT '',
  follow_up text DEFAULT '',
  priority boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.call_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors and secretaries can manage call log" ON public.call_log FOR ALL TO authenticated
  USING (doctor_id = auth.uid() OR has_role(auth.uid(), 'secretary') OR has_role(auth.uid(), 'admin'))
  WITH CHECK (doctor_id = auth.uid() OR has_role(auth.uid(), 'secretary') OR has_role(auth.uid(), 'admin'));

-- 6. Secretary SMS log
CREATE TABLE public.sms_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  doctor_id uuid NOT NULL,
  recipient text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  message text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  sms_type text DEFAULT 'manual',
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sms_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors and secretaries can manage sms log" ON public.sms_log FOR ALL TO authenticated
  USING (doctor_id = auth.uid() OR has_role(auth.uid(), 'secretary') OR has_role(auth.uid(), 'admin'))
  WITH CHECK (doctor_id = auth.uid() OR has_role(auth.uid(), 'secretary') OR has_role(auth.uid(), 'admin'));

-- Triggers
CREATE TRIGGER set_admin_config_updated_at BEFORE UPDATE ON public.admin_config FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_promotions_updated_at BEFORE UPDATE ON public.promotions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at();
