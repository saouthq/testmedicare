
-- ═══════════════════════════════════════════════════════
-- Phase 10: Missing tables for full production readiness
-- ═══════════════════════════════════════════════════════

-- 1. Subscriptions (doctor plans)
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free',
  activity text NOT NULL DEFAULT 'generaliste',
  specialty text DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  stripe_id text DEFAULT '',
  trial_ends_at timestamptz,
  current_period_start timestamptz DEFAULT now(),
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own subscription" ON public.subscriptions FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own subscription" ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage all subscriptions" ON public.subscriptions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- 2. Pharmacy stock
CREATE TABLE public.pharmacy_stock (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pharmacy_id uuid NOT NULL,
  name text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  quantity integer NOT NULL DEFAULT 0,
  threshold integer NOT NULL DEFAULT 10,
  status text NOT NULL DEFAULT 'ok',
  price text NOT NULL DEFAULT '0 DT',
  expiry text DEFAULT '',
  supplier text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pharmacy_stock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pharmacy can manage own stock" ON public.pharmacy_stock FOR ALL TO authenticated USING (pharmacy_id = auth.uid()) WITH CHECK (pharmacy_id = auth.uid());
CREATE POLICY "Admins can manage all stock" ON public.pharmacy_stock FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- 3. Cabinets
CREATE TABLE public.cabinets (
  id text PRIMARY KEY DEFAULT ('cab-' || gen_random_uuid()::text),
  name text NOT NULL DEFAULT '',
  address text DEFAULT '',
  phone text DEFAULT '',
  owner_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cabinets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage own cabinets" ON public.cabinets FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Admins can manage all cabinets" ON public.cabinets FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Cabinet members (doctors + secretaries)
CREATE TABLE public.cabinet_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cabinet_id text NOT NULL REFERENCES public.cabinets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  user_name text NOT NULL DEFAULT '',
  user_email text DEFAULT '',
  user_phone text DEFAULT '',
  role text NOT NULL DEFAULT 'secretary',
  status text NOT NULL DEFAULT 'invited',
  permissions jsonb DEFAULT '[]'::jsonb,
  joined_at timestamptz DEFAULT now(),
  last_login timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cabinet_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cabinet owners can manage members" ON public.cabinet_members FOR ALL TO authenticated
  USING (cabinet_id IN (SELECT id FROM public.cabinets WHERE owner_id = auth.uid()))
  WITH CHECK (cabinet_id IN (SELECT id FROM public.cabinets WHERE owner_id = auth.uid()));
CREATE POLICY "Members can view own membership" ON public.cabinet_members FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all members" ON public.cabinet_members FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- 4. Favorite doctors (patient)
CREATE TABLE public.favorite_doctors (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  patient_user_id uuid NOT NULL,
  doctor_id uuid NOT NULL,
  doctor_name text NOT NULL DEFAULT '',
  specialty text DEFAULT '',
  avatar text DEFAULT '',
  accepts_messages boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(patient_user_id, doctor_id)
);

ALTER TABLE public.favorite_doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can manage own favorites" ON public.favorite_doctors FOR ALL TO authenticated USING (patient_user_id = auth.uid()) WITH CHECK (patient_user_id = auth.uid());

-- 5. Health records (documents, vaccinations, surgeries, habits, family history, measures)
CREATE TABLE public.health_records (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  patient_user_id uuid NOT NULL,
  record_type text NOT NULL DEFAULT 'document',
  title text NOT NULL DEFAULT '',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  date text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can manage own health records" ON public.health_records FOR ALL TO authenticated USING (patient_user_id = auth.uid()) WITH CHECK (patient_user_id = auth.uid());
CREATE POLICY "Doctors can view patient health records" ON public.health_records FOR SELECT TO authenticated USING (has_role(auth.uid(), 'doctor'));
CREATE POLICY "Admins can view all health records" ON public.health_records FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER set_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_pharmacy_stock_updated_at BEFORE UPDATE ON public.pharmacy_stock FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_cabinets_updated_at BEFORE UPDATE ON public.cabinets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_health_records_updated_at BEFORE UPDATE ON public.health_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();
