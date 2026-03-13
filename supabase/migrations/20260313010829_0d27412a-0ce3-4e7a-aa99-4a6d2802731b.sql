
-- ═══════════════════════════════════════════════════════════
-- Phase 3: Prescriptions, Pharmacy Prescriptions, Lab Demands
-- ═══════════════════════════════════════════════════════════

-- Prescription status enum
CREATE TYPE public.prescription_status AS ENUM ('active', 'expired');

-- Pharmacy prescription status enum
CREATE TYPE public.pharmacy_rx_status AS ENUM ('received', 'preparing', 'ready_pickup', 'dispensed', 'unavailable', 'cancelled');

-- Lab demand status enum
CREATE TYPE public.lab_demand_status AS ENUM ('received', 'in_progress', 'results_ready', 'transmitted');

-- Lab demand priority enum
CREATE TYPE public.lab_priority AS ENUM ('normal', 'urgent');

-- ─── Prescriptions (doctor creates) ─────────────────────────
CREATE TABLE public.prescriptions (
  id TEXT NOT NULL DEFAULT ('ORD-' || extract(year from now())::text || '-' || substr(gen_random_uuid()::text, 1, 6)) PRIMARY KEY,
  doctor_id UUID NOT NULL,
  doctor_name TEXT NOT NULL DEFAULT '',
  patient_id BIGINT REFERENCES public.patients(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL DEFAULT to_char(now(), 'DD Mon YYYY'),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  status public.prescription_status NOT NULL DEFAULT 'active',
  total TEXT NOT NULL DEFAULT '0 DT',
  assurance TEXT DEFAULT '',
  pharmacy TEXT DEFAULT '',
  sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Doctors see their own prescriptions
CREATE POLICY "Doctors can manage own prescriptions" ON public.prescriptions
  FOR ALL TO authenticated
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

-- Patients can view their prescriptions
CREATE POLICY "Patients can view own prescriptions" ON public.prescriptions
  FOR SELECT TO authenticated
  USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

-- Admins can view all
CREATE POLICY "Admins can view all prescriptions" ON public.prescriptions
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE TRIGGER prescriptions_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ─── Pharmacy Prescriptions (pharmacy receives) ─────────────
CREATE TABLE public.pharmacy_prescriptions (
  id TEXT NOT NULL DEFAULT ('phrx-' || gen_random_uuid()::text) PRIMARY KEY,
  prescription_id TEXT REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  pharmacy_id UUID,
  patient_name TEXT NOT NULL DEFAULT '',
  patient_avatar TEXT DEFAULT '',
  doctor_name TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL DEFAULT '',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  status public.pharmacy_rx_status NOT NULL DEFAULT 'received',
  total TEXT DEFAULT '0 DT',
  assurance TEXT DEFAULT '',
  urgent BOOLEAN DEFAULT false,
  patient_phone TEXT DEFAULT '',
  pickup_time TEXT DEFAULT '',
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pharmacy_prescriptions ENABLE ROW LEVEL SECURITY;

-- Pharmacy users see their prescriptions
CREATE POLICY "Pharmacy can manage own rx" ON public.pharmacy_prescriptions
  FOR ALL TO authenticated
  USING (pharmacy_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  WITH CHECK (pharmacy_id = auth.uid() OR has_role(auth.uid(), 'admin'));

-- Doctors can view prescriptions they created (via prescription_id)
CREATE POLICY "Doctors can view related pharmacy rx" ON public.pharmacy_prescriptions
  FOR SELECT TO authenticated
  USING (prescription_id IN (SELECT id FROM public.prescriptions WHERE doctor_id = auth.uid()));

-- Patients can view their pharmacy rx
CREATE POLICY "Patients can view own pharmacy rx" ON public.pharmacy_prescriptions
  FOR SELECT TO authenticated
  USING (prescription_id IN (
    SELECT p.id FROM public.prescriptions p
    JOIN public.patients pt ON p.patient_id = pt.id
    WHERE pt.user_id = auth.uid()
  ));

CREATE TRIGGER pharmacy_prescriptions_updated_at
  BEFORE UPDATE ON public.pharmacy_prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ─── Lab Demands (doctor creates → lab processes) ───────────
CREATE TABLE public.lab_demands (
  id TEXT NOT NULL DEFAULT ('DEM-' || upper(substr(gen_random_uuid()::text, 1, 8))) PRIMARY KEY,
  patient_id BIGINT REFERENCES public.patients(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL DEFAULT '',
  patient_dob TEXT DEFAULT '',
  patient_avatar TEXT DEFAULT '',
  assurance TEXT DEFAULT '',
  num_assurance TEXT DEFAULT '',
  doctor_id UUID NOT NULL,
  prescriber_name TEXT NOT NULL DEFAULT '',
  lab_id UUID,
  examens JSONB NOT NULL DEFAULT '[]'::jsonb,
  status public.lab_demand_status NOT NULL DEFAULT 'received',
  date TEXT NOT NULL DEFAULT '',
  priority public.lab_priority NOT NULL DEFAULT 'normal',
  amount TEXT DEFAULT '0 DT',
  pdfs JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT DEFAULT '',
  results_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lab_demands ENABLE ROW LEVEL SECURITY;

-- Doctors can create and view demands
CREATE POLICY "Doctors can manage own lab demands" ON public.lab_demands
  FOR ALL TO authenticated
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

-- Lab can see demands assigned to them
CREATE POLICY "Lab can manage assigned demands" ON public.lab_demands
  FOR ALL TO authenticated
  USING (lab_id = auth.uid() OR has_role(auth.uid(), 'laboratory'))
  WITH CHECK (lab_id = auth.uid() OR has_role(auth.uid(), 'laboratory'));

-- Patients can view own lab demands
CREATE POLICY "Patients can view own lab demands" ON public.lab_demands
  FOR SELECT TO authenticated
  USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

-- Admins
CREATE POLICY "Admins can view all lab demands" ON public.lab_demands
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER lab_demands_updated_at
  BEFORE UPDATE ON public.lab_demands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Enable realtime on prescriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.prescriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pharmacy_prescriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lab_demands;
