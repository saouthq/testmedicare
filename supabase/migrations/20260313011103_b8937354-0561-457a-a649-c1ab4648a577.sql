
-- ═══════════════════════════════════════════════════════════
-- Phase 4: Billing, Notifications, Chat
-- ═══════════════════════════════════════════════════════════

-- Invoice status enum
CREATE TYPE public.invoice_status AS ENUM ('paid', 'pending', 'overdue');

-- ─── Invoices ────────────────────────────────────────────────
CREATE TABLE public.invoices (
  id TEXT NOT NULL DEFAULT ('FAC-' || upper(substr(gen_random_uuid()::text, 1, 8))) PRIMARY KEY,
  doctor_id UUID,
  patient_id BIGINT REFERENCES public.patients(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL DEFAULT '',
  patient_avatar TEXT DEFAULT '',
  doctor_name TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'consultation',
  payment TEXT DEFAULT 'especes',
  status public.invoice_status NOT NULL DEFAULT 'pending',
  assurance TEXT DEFAULT '',
  created_by TEXT DEFAULT 'doctor',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can manage own invoices" ON public.invoices
  FOR ALL TO authenticated
  USING (doctor_id = auth.uid() OR has_role(auth.uid(), 'secretary') OR has_role(auth.uid(), 'admin'))
  WITH CHECK (doctor_id = auth.uid() OR has_role(auth.uid(), 'secretary') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Patients can view own invoices" ON public.invoices
  FOR SELECT TO authenticated
  USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE TRIGGER invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ─── Notifications ──────────────────────────────────────────
CREATE TABLE public.notifications (
  id TEXT NOT NULL DEFAULT ('notif-' || gen_random_uuid()::text) PRIMARY KEY,
  user_id UUID NOT NULL,
  target_role TEXT NOT NULL DEFAULT 'patient',
  type TEXT NOT NULL DEFAULT 'generic',
  title TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  read BOOLEAN NOT NULL DEFAULT false,
  action_link TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- ─── Chat Threads ───────────────────────────────────────────
CREATE TABLE public.chat_threads (
  id TEXT NOT NULL DEFAULT ('thread-' || gen_random_uuid()::text) PRIMARY KEY,
  participant_a_id TEXT NOT NULL DEFAULT '',
  participant_a_name TEXT NOT NULL DEFAULT '',
  participant_a_avatar TEXT DEFAULT '',
  participant_a_role TEXT DEFAULT 'patient',
  participant_b_id TEXT NOT NULL DEFAULT '',
  participant_b_name TEXT NOT NULL DEFAULT '',
  participant_b_avatar TEXT DEFAULT '',
  participant_b_role TEXT DEFAULT 'doctor',
  last_message TEXT DEFAULT '',
  last_message_at TIMESTAMPTZ DEFAULT now(),
  unread_a INTEGER DEFAULT 0,
  unread_b INTEGER DEFAULT 0,
  accepts_messages BOOLEAN DEFAULT true,
  category TEXT DEFAULT 'messages',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view their threads" ON public.chat_threads
  FOR ALL TO authenticated
  USING (participant_a_id = auth.uid()::text OR participant_b_id = auth.uid()::text)
  WITH CHECK (participant_a_id = auth.uid()::text OR participant_b_id = auth.uid()::text);

-- ─── Chat Messages ──────────────────────────────────────────
CREATE TABLE public.chat_messages (
  id TEXT NOT NULL DEFAULT ('msg-' || gen_random_uuid()::text) PRIMARY KEY,
  thread_id TEXT NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL DEFAULT '',
  sender_name TEXT DEFAULT '',
  text TEXT NOT NULL DEFAULT '',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Thread participants can manage messages" ON public.chat_messages
  FOR ALL TO authenticated
  USING (thread_id IN (
    SELECT id FROM public.chat_threads
    WHERE participant_a_id = auth.uid()::text OR participant_b_id = auth.uid()::text
  ))
  WITH CHECK (thread_id IN (
    SELECT id FROM public.chat_threads
    WHERE participant_a_id = auth.uid()::text OR participant_b_id = auth.uid()::text
  ));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
