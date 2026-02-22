
-- Drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users view own role" ON public.user_roles;

-- Recreate as PERMISSIVE (default)
CREATE POLICY "Admins manage roles"
ON public.user_roles
FOR ALL
USING (is_admin());

CREATE POLICY "Users view own role"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());
