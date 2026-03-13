
-- Fix: Replace permissive INSERT policy on appointments with proper check
DROP POLICY "Authenticated users can create appointments" ON public.appointments;

CREATE POLICY "Authenticated users can create appointments"
  ON public.appointments FOR INSERT TO authenticated
  WITH CHECK (
    doctor_id = auth.uid() 
    OR public.has_role(auth.uid(), 'patient')
    OR public.has_role(auth.uid(), 'secretary')
    OR public.has_role(auth.uid(), 'admin')
  );

-- Also allow anon to create appointments (public booking)
CREATE POLICY "Anon can create appointments for booking"
  ON public.appointments FOR INSERT TO anon
  WITH CHECK (created_by = 'public');
