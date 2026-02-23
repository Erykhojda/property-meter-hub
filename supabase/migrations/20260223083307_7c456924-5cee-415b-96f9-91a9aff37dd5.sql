-- Fix ALL restrictive policies to permissive across all tables

-- inwestorzy
DROP POLICY IF EXISTS "Admins manage inwestorzy" ON public.inwestorzy;
DROP POLICY IF EXISTS "Zarzadca view assigned inwestorzy" ON public.inwestorzy;
CREATE POLICY "Admins manage inwestorzy" ON public.inwestorzy FOR ALL USING (is_admin());
CREATE POLICY "Zarzadca view assigned inwestorzy" ON public.inwestorzy FOR SELECT USING (
  EXISTS (SELECT 1 FROM inwestycje i WHERE i.inwestor_id = inwestorzy.id AND is_zarzadca_assigned_to_inwestycja(i.id))
);

-- inwestycje
DROP POLICY IF EXISTS "Admins manage inwestycje" ON public.inwestycje;
DROP POLICY IF EXISTS "Zarzadca view assigned inwestycje" ON public.inwestycje;
CREATE POLICY "Admins manage inwestycje" ON public.inwestycje FOR ALL USING (is_admin());
CREATE POLICY "Zarzadca view assigned inwestycje" ON public.inwestycje FOR SELECT USING (is_zarzadca_assigned_to_inwestycja(id));

-- budynki
DROP POLICY IF EXISTS "Admins manage budynki" ON public.budynki;
DROP POLICY IF EXISTS "Zarzadca view assigned budynki" ON public.budynki;
CREATE POLICY "Admins manage budynki" ON public.budynki FOR ALL USING (is_admin());
CREATE POLICY "Zarzadca view assigned budynki" ON public.budynki FOR SELECT USING (is_zarzadca_assigned_to_budynek(id));

-- lokale
DROP POLICY IF EXISTS "Admins manage lokale" ON public.lokale;
DROP POLICY IF EXISTS "Zarzadca view assigned lokale" ON public.lokale;
CREATE POLICY "Admins manage lokale" ON public.lokale FOR ALL USING (is_admin());
CREATE POLICY "Zarzadca view assigned lokale" ON public.lokale FOR SELECT USING (is_zarzadca_assigned_to_lokal(id));

-- mierniki
DROP POLICY IF EXISTS "Admins manage mierniki" ON public.mierniki;
DROP POLICY IF EXISTS "Zarzadca view assigned mierniki" ON public.mierniki;
CREATE POLICY "Admins manage mierniki" ON public.mierniki FOR ALL USING (is_admin());
CREATE POLICY "Zarzadca view assigned mierniki" ON public.mierniki FOR SELECT USING (is_zarzadca_assigned_to_miernik(id));

-- odczyty
DROP POLICY IF EXISTS "Admins manage odczyty" ON public.odczyty;
DROP POLICY IF EXISTS "Zarzadca view assigned odczyty" ON public.odczyty;
CREATE POLICY "Admins manage odczyty" ON public.odczyty FOR ALL USING (is_admin());
CREATE POLICY "Zarzadca view assigned odczyty" ON public.odczyty FOR SELECT USING (is_zarzadca_assigned_to_odczyt(punkt_pomiarowy_id));

-- punkty_pomiarowe
DROP POLICY IF EXISTS "Admins manage punkty" ON public.punkty_pomiarowe;
DROP POLICY IF EXISTS "Zarzadca view assigned punkty" ON public.punkty_pomiarowe;
CREATE POLICY "Admins manage punkty" ON public.punkty_pomiarowe FOR ALL USING (is_admin());
CREATE POLICY "Zarzadca view assigned punkty" ON public.punkty_pomiarowe FOR SELECT USING (is_zarzadca_assigned_to_punkt(id));

-- sync_logi
DROP POLICY IF EXISTS "Admins manage sync logi" ON public.sync_logi;
CREATE POLICY "Admins manage sync logi" ON public.sync_logi FOR ALL USING (is_admin());

-- audit_logi
DROP POLICY IF EXISTS "Admins view audit" ON public.audit_logi;
DROP POLICY IF EXISTS "Authenticated insert audit" ON public.audit_logi;
CREATE POLICY "Admins view audit" ON public.audit_logi FOR SELECT USING (is_admin());
CREATE POLICY "Authenticated insert audit" ON public.audit_logi FOR INSERT WITH CHECK (true);

-- profiles
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT USING (is_admin());
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- zarzadca_budynek
DROP POLICY IF EXISTS "Admins manage zarzadca_budynek" ON public.zarzadca_budynek;
DROP POLICY IF EXISTS "Zarzadca view own assignments" ON public.zarzadca_budynek;
CREATE POLICY "Admins manage zarzadca_budynek" ON public.zarzadca_budynek FOR ALL USING (is_admin());
CREATE POLICY "Zarzadca view own assignments" ON public.zarzadca_budynek FOR SELECT USING (zarzadca_user_id = auth.uid());