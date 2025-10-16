-- Complete database setup for Veve Barbearia Hub
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. Create bookings table
-- ============================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  service_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. Create user roles enum and table
-- ============================================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'client');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'client',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. Create profiles table
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. Create services table
-- ============================================
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. Create time_slots table
-- ============================================
CREATE TABLE IF NOT EXISTS public.time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time TEXT NOT NULL UNIQUE,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;

-- Now add foreign key constraint for service_id
ALTER TABLE public.bookings
DROP CONSTRAINT IF EXISTS bookings_service_id_fkey;

ALTER TABLE public.bookings
ADD CONSTRAINT bookings_service_id_fkey
FOREIGN KEY (service_id) REFERENCES public.services(id);

-- ============================================
-- 6. Create helper functions
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- ============================================
-- 7. Create triggers
-- ============================================
DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_time_slots_updated_at ON public.time_slots;
CREATE TRIGGER update_time_slots_updated_at
BEFORE UPDATE ON public.time_slots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 8. Create indexes for better performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON public.bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(date);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- ============================================
-- 9. RLS Policies for bookings
-- ============================================
DROP POLICY IF EXISTS "Anyone can view bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can delete bookings" ON public.bookings;
DROP POLICY IF EXISTS "Authenticated users can view bookings" ON public.bookings;
DROP POLICY IF EXISTS "Barbeiros and admins can delete bookings" ON public.bookings;
DROP POLICY IF EXISTS "Barbeiros and admins can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;

CREATE POLICY "Anyone can create bookings"
  ON public.bookings
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view their own bookings when not authenticated"
  ON public.bookings
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Barbeiros and admins can delete bookings"
  ON public.bookings
  FOR DELETE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'barbeiro') OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Barbeiros and admins can update bookings"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'barbeiro') OR
    public.has_role(auth.uid(), 'admin')
  );

-- ============================================
-- 10. RLS Policies for profiles
-- ============================================
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 11. RLS Policies for user_roles
-- ============================================
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 12. RLS Policies for services
-- ============================================
DROP POLICY IF EXISTS "Anyone can view active services" ON public.services;
DROP POLICY IF EXISTS "Only admins can insert services" ON public.services;
DROP POLICY IF EXISTS "Only admins can update services" ON public.services;
DROP POLICY IF EXISTS "Only admins can delete services" ON public.services;

CREATE POLICY "Anyone can view active services"
  ON public.services
  FOR SELECT
  USING (is_active = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can insert services"
  ON public.services
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update services"
  ON public.services
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete services"
  ON public.services
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 13. RLS Policies for time_slots
-- ============================================
DROP POLICY IF EXISTS "Anyone can view time slots" ON public.time_slots;
DROP POLICY IF EXISTS "Only admins can insert time slots" ON public.time_slots;
DROP POLICY IF EXISTS "Only admins can update time slots" ON public.time_slots;
DROP POLICY IF EXISTS "Only admins can delete time slots" ON public.time_slots;

CREATE POLICY "Anyone can view time slots"
  ON public.time_slots
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert time slots"
  ON public.time_slots
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update time slots"
  ON public.time_slots
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete time slots"
  ON public.time_slots
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 14. Insert default data
-- ============================================

-- Insert default services
INSERT INTO public.services (name, category, price, duration_minutes)
VALUES
  ('Corte de cabelo', 'Cabelo', 40.00, 30),
  ('Pézinho', 'Cabelo', 15.00, 15),
  ('Penteado', 'Cabelo', 20.00, 20),
  ('Barba', 'Barba', 30.00, 20),
  ('Cavanhaque', 'Barba', 30.00, 20),
  ('Sobrancelha', 'Sobrancelha', 15.00, 10),
  ('Progressiva', 'Química', 60.00, 60),
  ('Pigmentação', 'Química', 30.00, 45),
  ('Alisante', 'Química', 30.00, 60),
  ('Luzes', 'Química', 80.00, 90)
ON CONFLICT DO NOTHING;

-- Insert default time slots
INSERT INTO public.time_slots (time, is_available)
VALUES
  ('09:00', true),
  ('09:30', true),
  ('10:00', true),
  ('10:30', true),
  ('11:00', true),
  ('11:30', true),
  ('12:00', true),
  ('12:30', true),
  ('13:00', true),
  ('13:30', true),
  ('14:00', true),
  ('14:30', true),
  ('15:00', true),
  ('15:30', true),
  ('16:00', true),
  ('16:30', true),
  ('17:00', true),
  ('17:30', true),
  ('18:00', true)
ON CONFLICT (time) DO NOTHING;
