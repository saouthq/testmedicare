
-- ═══════════════════════════════════════════════════════════
-- Phase 5: Directory, Reviews, Documents, Protocols, Admin
-- ═══════════════════════════════════════════════════════════

-- ─── Doctors Directory (public profile) ─────────────────────
CREATE TABLE public.doctors_directory (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  specialty TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT 'Tunis',
  address TEXT DEFAULT '',
  lat DOUBLE PRECISION DEFAULT 0,
  lng DOUBLE PRECISION DEFAULT 0,
  consultation_price NUMERIC DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  bio TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  languages TEXT[] DEFAULT '{"Français","Arabe"}',
  accepts_new_patients BOOLEAN DEFAULT true,
  teleconsultation BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.doctors_directory ENABLE ROW LEVEL SECURITY;

-- Public read access for directory
CREATE POLICY "Anyone can view doctors directory" ON public.doctors_directory
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Doctors can manage own directory profile" ON public.doctors_directory
  FOR ALL TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can manage all directory profiles" ON public.doctors_directory
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER doctors_directory_updated_at
  BEFORE UPDATE ON public.doctors_directory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ─── Clinics Directory ──────────────────────────────────────
CREATE TABLE public.clinics_directory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT 'Tunis',
  address TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  services JSONB DEFAULT '[]'::jsonb,
  doctors_count INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  photo_url TEXT DEFAULT '',
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.clinics_directory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view clinics" ON public.clinics_directory
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage clinics" ON public.clinics_directory
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- ─── Hospitals Directory ────────────────────────────────────
CREATE TABLE public.hospitals_directory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT 'Tunis',
  address TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  type TEXT DEFAULT 'public',
  departments JSONB DEFAULT '[]'::jsonb,
  beds_count INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  photo_url TEXT DEFAULT '',
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hospitals_directory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view hospitals" ON public.hospitals_directory
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage hospitals" ON public.hospitals_directory
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- ─── Pharmacies Directory ───────────────────────────────────
CREATE TABLE public.pharmacies_directory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT 'Tunis',
  address TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  is_guard BOOLEAN DEFAULT false,
  guard_date TEXT DEFAULT '',
  lat DOUBLE PRECISION DEFAULT 0,
  lng DOUBLE PRECISION DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  photo_url TEXT DEFAULT '',
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pharmacies_directory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pharmacies" ON public.pharmacies_directory
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage pharmacies" ON public.pharmacies_directory
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- ─── Medicines ──────────────────────────────────────────────
CREATE TABLE public.medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT '',
  dci TEXT DEFAULT '',
  form TEXT DEFAULT '',
  category TEXT DEFAULT '',
  lab TEXT DEFAULT '',
  price NUMERIC DEFAULT 0,
  description TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view medicines" ON public.medicines
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage medicines" ON public.medicines
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- ─── Reviews ────────────────────────────────────────────────
CREATE TABLE public.reviews (
  id TEXT NOT NULL DEFAULT ('rev-' || gen_random_uuid()::text) PRIMARY KEY,
  appointment_id TEXT DEFAULT '',
  patient_id BIGINT REFERENCES public.patients(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL DEFAULT '',
  doctor_id UUID,
  doctor_name TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 5,
  text TEXT DEFAULT '',
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Patients can insert reviews" ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage reviews" ON public.reviews
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- ─── Doctor Documents (templates) ───────────────────────────
CREATE TABLE public.doctor_documents (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  doctor_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'autre',
  content TEXT DEFAULT '',
  variables JSONB DEFAULT '[]'::jsonb,
  usage_count INTEGER DEFAULT 0,
  last_used TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.doctor_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can manage own documents" ON public.doctor_documents
  FOR ALL TO authenticated
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

-- ─── Doctor Protocols ───────────────────────────────────────
CREATE TABLE public.doctor_protocols (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  doctor_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'consultation',
  specialty TEXT DEFAULT '',
  description TEXT DEFAULT '',
  steps JSONB DEFAULT '[]'::jsonb,
  meds JSONB DEFAULT '[]'::jsonb,
  examens JSONB DEFAULT '[]'::jsonb,
  duration TEXT DEFAULT '',
  favorite BOOLEAN DEFAULT false,
  is_template BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  last_used TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.doctor_protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can manage own protocols" ON public.doctor_protocols
  FOR ALL TO authenticated
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

-- Templates visible to all doctors
CREATE POLICY "All doctors can view templates" ON public.doctor_protocols
  FOR SELECT TO authenticated
  USING (is_template = true AND has_role(auth.uid(), 'doctor'));

-- ─── Audit Logs ─────────────────────────────────────────────
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL DEFAULT '',
  entity_type TEXT DEFAULT '',
  entity_id TEXT DEFAULT '',
  details JSONB DEFAULT '{}'::jsonb,
  user_id UUID,
  user_name TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'secretary'));

-- ─── Support Tickets ────────────────────────────────────────
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  subject TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open',
  conversation JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tickets" ON public.support_tickets
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all tickets" ON public.support_tickets
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
