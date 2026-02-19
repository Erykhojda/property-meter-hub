
-- Fix audit_logi INSERT policy - restrict to authenticated users only
DROP POLICY IF EXISTS "System insert audit" ON public.audit_logi;
CREATE POLICY "Authenticated insert audit" ON public.audit_logi FOR INSERT TO authenticated WITH CHECK (true);
