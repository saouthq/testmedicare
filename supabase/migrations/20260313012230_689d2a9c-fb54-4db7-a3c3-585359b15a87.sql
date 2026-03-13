
-- ══════════════════════════════════════════════════════════════
-- Phase 6: OTP table + Storage buckets
-- ══════════════════════════════════════════════════════════════

-- 1) OTP codes table for SMS verification
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL UNIQUE,
  code text NOT NULL DEFAULT '',
  verified boolean NOT NULL DEFAULT false,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '5 minutes'),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Only service role (edge functions) can manage OTP codes
CREATE POLICY "Service role only" ON public.otp_codes
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2) Storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('documents', 'documents', false),
  ('lab-results', 'lab-results', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: avatars (public read, authenticated upload)
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage policies: documents (owner access only)
CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage policies: lab-results (doctor + lab + patient access)
CREATE POLICY "Doctors and labs can manage lab results" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'lab-results' AND (
      public.has_role(auth.uid(), 'doctor') OR
      public.has_role(auth.uid(), 'laboratory') OR
      public.has_role(auth.uid(), 'admin')
    )
  )
  WITH CHECK (
    bucket_id = 'lab-results' AND (
      public.has_role(auth.uid(), 'doctor') OR
      public.has_role(auth.uid(), 'laboratory') OR
      public.has_role(auth.uid(), 'admin')
    )
  );

CREATE POLICY "Patients can view own lab results" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'lab-results' AND (storage.foldername(name))[1] = auth.uid()::text);
