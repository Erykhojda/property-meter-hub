
-- ============================================================
-- SCORE (Appartme) - Full Database Schema
-- ============================================================

-- 1. Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'zarzadca');
CREATE TYPE public.media_type AS ENUM ('woda', 'cieplo', 'energia');
CREATE TYPE public.data_quality AS ENUM ('validated', 'estimated', 'missing');
CREATE TYPE public.sync_status AS ENUM ('success', 'partial', 'failed');

-- 2. User Roles (NEVER on profile)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Profiles (display info only)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Hierarchy tables
CREATE TABLE public.inwestorzy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nazwa TEXT NOT NULL,
  nip TEXT,
  adres TEXT,
  kontakt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.inwestorzy ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.inwestycje (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inwestor_id UUID NOT NULL REFERENCES public.inwestorzy(id) ON DELETE CASCADE,
  nazwa TEXT NOT NULL,
  opis TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.inwestycje ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.budynki (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inwestycja_id UUID NOT NULL REFERENCES public.inwestycje(id) ON DELETE CASCADE,
  nazwa TEXT NOT NULL,
  adres TEXT NOT NULL,
  kod_pocztowy TEXT,
  miasto TEXT,
  liczba_lokali INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.budynki ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.lokale (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budynek_id UUID NOT NULL REFERENCES public.budynki(id) ON DELETE CASCADE,
  numer TEXT NOT NULL,
  pietro INTEGER DEFAULT 0,
  powierzchnia NUMERIC(8,2),
  typ TEXT DEFAULT 'mieszkalne',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lokale ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.mierniki (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lokal_id UUID NOT NULL REFERENCES public.lokale(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  typ media_type NOT NULL,
  nazwa TEXT,
  data_instalacji DATE,
  status TEXT DEFAULT 'active',
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mierniki ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.punkty_pomiarowe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  miernik_id UUID NOT NULL REFERENCES public.mierniki(id) ON DELETE CASCADE,
  nazwa TEXT NOT NULL,
  jednostka TEXT NOT NULL DEFAULT 'm3',
  typ media_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.punkty_pomiarowe ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.odczyty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  punkt_pomiarowy_id UUID NOT NULL REFERENCES public.punkty_pomiarowe(id) ON DELETE CASCADE,
  wartosc NUMERIC(12,4) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  jednostka TEXT NOT NULL DEFAULT 'm3',
  jakosc_danych data_quality NOT NULL DEFAULT 'validated',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.odczyty ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_odczyty_punkt_timestamp ON public.odczyty(punkt_pomiarowy_id, timestamp DESC);
CREATE INDEX idx_odczyty_timestamp ON public.odczyty(timestamp DESC);

-- 5. Zarządca-Budynek assignments
CREATE TABLE public.zarzadca_budynek (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zarzadca_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  budynek_id UUID NOT NULL REFERENCES public.budynki(id) ON DELETE CASCADE,
  data_od DATE NOT NULL DEFAULT CURRENT_DATE,
  data_do DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (zarzadca_user_id, budynek_id)
);
ALTER TABLE public.zarzadca_budynek ENABLE ROW LEVEL SECURITY;

-- 6. Sync logs
CREATE TABLE public.sync_logi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status sync_status NOT NULL,
  budynki_count INTEGER DEFAULT 0,
  rekordy_count INTEGER DEFAULT 0,
  bledy_count INTEGER DEFAULT 0,
  szczegoly JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sync_logi ENABLE ROW LEVEL SECURITY;

-- 7. Audit log
CREATE TABLE public.audit_logi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  akcja TEXT NOT NULL,
  encja TEXT NOT NULL,
  encja_id TEXT,
  szczegoly JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logi ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper Functions (SECURITY DEFINER to prevent RLS recursion)
-- ============================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

CREATE OR REPLACE FUNCTION public.is_zarzadca_assigned_to_budynek(_budynek_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.zarzadca_budynek
    WHERE zarzadca_user_id = auth.uid()
      AND budynek_id = _budynek_id
      AND (data_do IS NULL OR data_do >= CURRENT_DATE)
  )
$$;

CREATE OR REPLACE FUNCTION public.is_zarzadca_assigned_to_inwestycja(_inwestycja_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.zarzadca_budynek zb
    JOIN public.budynki b ON b.id = zb.budynek_id
    WHERE zb.zarzadca_user_id = auth.uid()
      AND b.inwestycja_id = _inwestycja_id
      AND (zb.data_do IS NULL OR zb.data_do >= CURRENT_DATE)
  )
$$;

CREATE OR REPLACE FUNCTION public.is_zarzadca_assigned_to_lokal(_lokal_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.zarzadca_budynek zb
    JOIN public.lokale l ON l.budynek_id = zb.budynek_id
    WHERE zb.zarzadca_user_id = auth.uid()
      AND l.id = _lokal_id
      AND (zb.data_do IS NULL OR zb.data_do >= CURRENT_DATE)
  )
$$;

CREATE OR REPLACE FUNCTION public.is_zarzadca_assigned_to_miernik(_miernik_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.zarzadca_budynek zb
    JOIN public.lokale l ON l.budynek_id = zb.budynek_id
    JOIN public.mierniki m ON m.lokal_id = l.id
    WHERE zb.zarzadca_user_id = auth.uid()
      AND m.id = _miernik_id
      AND (zb.data_do IS NULL OR zb.data_do >= CURRENT_DATE)
  )
$$;

CREATE OR REPLACE FUNCTION public.is_zarzadca_assigned_to_punkt(_punkt_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.zarzadca_budynek zb
    JOIN public.lokale l ON l.budynek_id = zb.budynek_id
    JOIN public.mierniki m ON m.lokal_id = l.id
    JOIN public.punkty_pomiarowe pp ON pp.miernik_id = m.id
    WHERE zb.zarzadca_user_id = auth.uid()
      AND pp.id = _punkt_id
      AND (zb.data_do IS NULL OR zb.data_do >= CURRENT_DATE)
  )
$$;

CREATE OR REPLACE FUNCTION public.is_zarzadca_assigned_to_odczyt(_odczyt_punkt_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_zarzadca_assigned_to_punkt(_odczyt_punkt_id)
$$;

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_inwestorzy_updated_at BEFORE UPDATE ON public.inwestorzy FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_inwestycje_updated_at BEFORE UPDATE ON public.inwestycje FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_budynki_updated_at BEFORE UPDATE ON public.budynki FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_lokale_updated_at BEFORE UPDATE ON public.lokale FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_mierniki_updated_at BEFORE UPDATE ON public.mierniki FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- RLS Policies
-- ============================================================

-- profiles
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT USING (public.is_admin());

-- user_roles
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.is_admin());
CREATE POLICY "Users view own role" ON public.user_roles FOR SELECT USING (user_id = auth.uid());

-- inwestorzy
CREATE POLICY "Admins manage inwestorzy" ON public.inwestorzy FOR ALL USING (public.is_admin());
CREATE POLICY "Zarzadca view assigned inwestorzy" ON public.inwestorzy FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.inwestycje i
    WHERE i.inwestor_id = inwestorzy.id
      AND public.is_zarzadca_assigned_to_inwestycja(i.id)
  )
);

-- inwestycje
CREATE POLICY "Admins manage inwestycje" ON public.inwestycje FOR ALL USING (public.is_admin());
CREATE POLICY "Zarzadca view assigned inwestycje" ON public.inwestycje FOR SELECT USING (public.is_zarzadca_assigned_to_inwestycja(id));

-- budynki
CREATE POLICY "Admins manage budynki" ON public.budynki FOR ALL USING (public.is_admin());
CREATE POLICY "Zarzadca view assigned budynki" ON public.budynki FOR SELECT USING (public.is_zarzadca_assigned_to_budynek(id));

-- lokale
CREATE POLICY "Admins manage lokale" ON public.lokale FOR ALL USING (public.is_admin());
CREATE POLICY "Zarzadca view assigned lokale" ON public.lokale FOR SELECT USING (public.is_zarzadca_assigned_to_lokal(id));

-- mierniki
CREATE POLICY "Admins manage mierniki" ON public.mierniki FOR ALL USING (public.is_admin());
CREATE POLICY "Zarzadca view assigned mierniki" ON public.mierniki FOR SELECT USING (public.is_zarzadca_assigned_to_miernik(id));

-- punkty_pomiarowe
CREATE POLICY "Admins manage punkty" ON public.punkty_pomiarowe FOR ALL USING (public.is_admin());
CREATE POLICY "Zarzadca view assigned punkty" ON public.punkty_pomiarowe FOR SELECT USING (public.is_zarzadca_assigned_to_punkt(id));

-- odczyty
CREATE POLICY "Admins manage odczyty" ON public.odczyty FOR ALL USING (public.is_admin());
CREATE POLICY "Zarzadca view assigned odczyty" ON public.odczyty FOR SELECT USING (public.is_zarzadca_assigned_to_odczyt(punkt_pomiarowy_id));

-- zarzadca_budynek
CREATE POLICY "Admins manage assignments" ON public.zarzadca_budynek FOR ALL USING (public.is_admin());
CREATE POLICY "Zarzadca view own assignments" ON public.zarzadca_budynek FOR SELECT USING (zarzadca_user_id = auth.uid());

-- sync_logi
CREATE POLICY "Admins manage sync logi" ON public.sync_logi FOR ALL USING (public.is_admin());

-- audit_logi
CREATE POLICY "Admins view audit" ON public.audit_logi FOR SELECT USING (public.is_admin());
CREATE POLICY "System insert audit" ON public.audit_logi FOR INSERT WITH CHECK (true);
