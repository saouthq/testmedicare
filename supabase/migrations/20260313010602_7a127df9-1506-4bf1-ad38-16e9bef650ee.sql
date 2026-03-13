
-- Phase 2: Core business tables — patients, appointments, availability, leaves, blocked_slots, tarifs

-- 1. Appointment status enum
CREATE TYPE public.appointment_status AS ENUM (
  'pending', 'confirmed', 'arrived', 'in_waiting', 'in_progress', 'done', 'cancelled', 'absent'
);

-- 2. Appointment type enum
CREATE TYPE public.appointment_type AS ENUM (
  'consultation', 'suivi', 'premiere_visite', 'controle', 'teleconsultation', 'urgence'
);

-- 3. Leave type enum
CREATE TYPE public.leave_type AS ENUM ('conge', 'formation', 'maladie', 'personnel');

-- 4. Leave status enum
CREATE TYPE public.leave_status AS ENUM ('upcoming', 'active', 'past');

-- 5. Patients table
CREATE TABLE public.patients (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  dob TEXT DEFAULT '',
  blood_type TEXT DEFAULT '',
  insurance TEXT DEFAULT '',
  insurance_number TEXT DEFAULT '',
  treating_doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  treating_doctor_name TEXT DEFAULT '',
  gouvernorat TEXT DEFAULT 'Tunis',
  allergies JSONB DEFAULT '[]'::jsonb,
  antecedents JSONB DEFAULT '[]'::jsonb,
  notes TEXT DEFAULT '',
  balance NUMERIC(10,3) DEFAULT 0,
  avatar TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Appointments table
CREATE TABLE public.appointments (
  id TEXT PRIMARY KEY DEFAULT ('apt-' || gen_random_uuid()::text),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration INTEGER NOT NULL DEFAULT 30,
  patient_name TEXT NOT NULL,
  patient_id BIGINT REFERENCES public.patients(id) ON DELETE SET NULL,
  patient_avatar TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  motif TEXT DEFAULT '',
  type public.appointment_type NOT NULL DEFAULT 'consultation',
  status public.appointment_status NOT NULL DEFAULT 'pending',
  insurance TEXT DEFAULT '',
  doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_name TEXT NOT NULL DEFAULT '',
  teleconsultation BOOLEAN DEFAULT false,
  notes TEXT DEFAULT '',
  internal_note TEXT DEFAULT '',
  is_new BOOLEAN DEFAULT false,
  arrived_at TEXT DEFAULT '',
  wait_time INTEGER DEFAULT 0,
  tags JSONB DEFAULT '[]'::jsonb,
  created_by TEXT DEFAULT 'patient',
  payment_status TEXT DEFAULT 'pending',
  paid_amount NUMERIC(10,3) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Doctor availability table
CREATE TABLE public.doctor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_name TEXT NOT NULL, -- 'Lundi', 'Mardi', etc.
  active BOOLEAN DEFAULT true,
  start_time TIME NOT NULL DEFAULT '08:00',
  end_time TIME NOT NULL DEFAULT '18:00',
  break_start TIME,
  break_end TIME,
  slot_duration INTEGER DEFAULT 30,
  UNIQUE(doctor_id, day_name)
);

-- 8. Doctor leaves table
CREATE TABLE public.doctor_leaves (
  id BIGSERIAL PRIMARY KEY,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  doctor_name TEXT DEFAULT '',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  motif TEXT DEFAULT '',
  type public.leave_type NOT NULL DEFAULT 'conge',
  replacement_doctor TEXT DEFAULT '',
  notify_patients BOOLEAN DEFAULT true,
  status public.leave_status NOT NULL DEFAULT 'upcoming',
  affected_appointments INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Blocked slots table
CREATE TABLE public.blocked_slots (
  id TEXT PRIMARY KEY DEFAULT ('blk-' || gen_random_uuid()::text),
  doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  doctor_name TEXT DEFAULT '',
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration INTEGER NOT NULL DEFAULT 30,
  reason TEXT DEFAULT '',
  recurring BOOLEAN DEFAULT false,
  recurring_days JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Tarifs / actes table
CREATE TABLE public.tarifs (
  id BIGSERIAL PRIMARY KEY,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC(10,3) NOT NULL DEFAULT 0,
  conventionne BOOLEAN DEFAULT true,
  duration INTEGER DEFAULT 30,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Enable RLS on all tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarifs ENABLE ROW LEVEL SECURITY;

-- 12. RLS Policies for patients
CREATE POLICY "Doctors can view their patients"
  ON public.patients FOR SELECT TO authenticated
  USING (treating_doctor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Patients can view own record"
  ON public.patients FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Doctors can insert patients"
  ON public.patients FOR INSERT TO authenticated
  WITH CHECK (treating_doctor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Doctors can update their patients"
  ON public.patients FOR UPDATE TO authenticated
  USING (treating_doctor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- 13. RLS Policies for appointments
CREATE POLICY "Doctors can view their appointments"
  ON public.appointments FOR SELECT TO authenticated
  USING (doctor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Patients can view own appointments"
  ON public.appointments FOR SELECT TO authenticated
  USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can create appointments"
  ON public.appointments FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Doctors can update their appointments"
  ON public.appointments FOR UPDATE TO authenticated
  USING (doctor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Public can view appointments for booking (anon)
CREATE POLICY "Anon can view available slots"
  ON public.appointments FOR SELECT TO anon
  USING (true);

-- 14. RLS Policies for doctor_availability
CREATE POLICY "Anyone can view availability"
  ON public.doctor_availability FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Doctors can manage own availability"
  ON public.doctor_availability FOR ALL TO authenticated
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

-- 15. RLS Policies for doctor_leaves
CREATE POLICY "Doctors can view own leaves"
  ON public.doctor_leaves FOR SELECT TO authenticated
  USING (doctor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Doctors can manage own leaves"
  ON public.doctor_leaves FOR ALL TO authenticated
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

-- 16. RLS Policies for blocked_slots
CREATE POLICY "Anyone can view blocked slots"
  ON public.blocked_slots FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Doctors can manage own blocked slots"
  ON public.blocked_slots FOR ALL TO authenticated
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

-- 17. RLS Policies for tarifs
CREATE POLICY "Anyone can view tarifs"
  ON public.tarifs FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Doctors can manage own tarifs"
  ON public.tarifs FOR ALL TO authenticated
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

-- 18. Updated_at triggers
CREATE TRIGGER patients_updated_at BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 19. Enable Realtime for appointments
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
