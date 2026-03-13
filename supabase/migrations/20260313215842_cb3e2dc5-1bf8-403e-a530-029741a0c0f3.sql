
-- ─── Consultations table ────────────────────────────────────
CREATE TABLE public.consultations (
  id text NOT NULL DEFAULT ('CONS-' || upper(substr(gen_random_uuid()::text, 1, 8))) PRIMARY KEY,
  appointment_id text REFERENCES public.appointments(id) ON DELETE SET NULL,
  doctor_id uuid NOT NULL,
  patient_id bigint REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name text NOT NULL DEFAULT '',
  doctor_name text NOT NULL DEFAULT '',
  date text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'in_progress',
  motif text DEFAULT '',
  symptoms text DEFAULT '',
  examination text DEFAULT '',
  diagnosis text DEFAULT '',
  conclusion text DEFAULT '',
  care_plan text DEFAULT '',
  notes text DEFAULT '',
  specialty text DEFAULT '',
  duration_minutes integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Consultation vitals ────────────────────────────────────
CREATE TABLE public.consultation_vitals (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  consultation_id text NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT '',
  value text NOT NULL DEFAULT '',
  unit text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Indexes ────────────────────────────────────────────────
CREATE INDEX idx_consultations_doctor ON public.consultations(doctor_id);
CREATE INDEX idx_consultations_patient ON public.consultations(patient_id);
CREATE INDEX idx_consultations_appointment ON public.consultations(appointment_id);
CREATE INDEX idx_vitals_consultation ON public.consultation_vitals(consultation_id);

-- ─── RLS ────────────────────────────────────────────────────
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_vitals ENABLE ROW LEVEL SECURITY;

-- Consultations RLS
CREATE POLICY "Doctors can manage own consultations"
ON public.consultations FOR ALL TO authenticated
USING (doctor_id = auth.uid())
WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Patients can view own consultations"
ON public.consultations FOR SELECT TO authenticated
USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all consultations"
ON public.consultations FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Vitals RLS (follows consultation access)
CREATE POLICY "Doctors can manage vitals for own consultations"
ON public.consultation_vitals FOR ALL TO authenticated
USING (consultation_id IN (SELECT id FROM public.consultations WHERE doctor_id = auth.uid()))
WITH CHECK (consultation_id IN (SELECT id FROM public.consultations WHERE doctor_id = auth.uid()));

CREATE POLICY "Patients can view own vitals"
ON public.consultation_vitals FOR SELECT TO authenticated
USING (consultation_id IN (
  SELECT c.id FROM public.consultations c
  JOIN public.patients p ON c.patient_id = p.id
  WHERE p.user_id = auth.uid()
));

-- ─── Updated_at trigger ─────────────────────────────────────
CREATE TRIGGER update_consultations_updated_at
  BEFORE UPDATE ON public.consultations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
