
-- Fix overly permissive INSERT on notifications: restrict to authenticated users inserting for themselves or via system
DROP POLICY "System can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated can insert notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'secretary'));
