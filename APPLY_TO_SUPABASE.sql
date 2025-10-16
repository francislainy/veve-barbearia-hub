-- ============================================================================
-- COMPLETE MIGRATION SCRIPT FOR VEVE BARBEARIA
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/vcvnifkiomqzfzpsveuc/sql
-- ============================================================================

-- 1. CREATE SERVICES TABLE
-- ============================================================================
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

-- 2. CREATE TIME SLOTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time TEXT NOT NULL UNIQUE,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. ADD SERVICE_ID TO BOOKINGS TABLE
-- ============================================================================
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.services(id);

-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;

-- 5. CREATE POLICIES FOR SERVICES
-- ============================================================================
DROP POLICY IF EXISTS "Anyone can view active services" ON public.services;
CREATE POLICY "Anyone can view active services"
  ON public.services
  FOR SELECT
  USING (is_active = true OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Only admins can insert services" ON public.services;
CREATE POLICY "Only admins can insert services"
  ON public.services
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can update services" ON public.services;
CREATE POLICY "Only admins can update services"
  ON public.services
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can delete services" ON public.services;
CREATE POLICY "Only admins can delete services"
  ON public.services
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 6. CREATE POLICIES FOR TIME SLOTS
-- ============================================================================
DROP POLICY IF EXISTS "Anyone can view time slots" ON public.time_slots;
CREATE POLICY "Anyone can view time slots"
  ON public.time_slots
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admins can insert time slots" ON public.time_slots;
CREATE POLICY "Only admins can insert time slots"
  ON public.time_slots
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can update time slots" ON public.time_slots;
CREATE POLICY "Only admins can update time slots"
  ON public.time_slots
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can delete time slots" ON public.time_slots;
CREATE POLICY "Only admins can delete time slots"
  ON public.time_slots
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 7. CREATE TRIGGERS FOR UPDATED_AT
-- ============================================================================
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_time_slots_updated_at
  BEFORE UPDATE ON public.time_slots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 8. INSERT DEFAULT SERVICES
-- ============================================================================
INSERT INTO public.services (name, category, price, duration_minutes) VALUES
  ('Corte de cabelo', 'Cabelo', 40.00, 30),
  ('Pézinho', 'Cabelo', 15.00, 15),
  ('Penteado', 'Cabelo', 20.00, 20),
  ('Barba', 'Barba', 30.00, 20),
  ('Cavanhaque', 'Barba', 30.00, 20),
  ('Sobrancelha', 'Sobrancelha', 15.00, 10),
  ('Progressiva', 'Química', 60.00, 60),
  ('Pigmentação', 'Química', 30.00, 45),
  ('Alisante', 'Química', 30.00, 60),
  ('Luzes', 'Química', 40.00, 90),
  ('Platinado', 'Química', 120.00, 120)
ON CONFLICT DO NOTHING;

-- 9. INSERT DEFAULT TIME SLOTS
-- ============================================================================
INSERT INTO public.time_slots (time) VALUES
  ('09:00'), ('09:30'), ('10:00'), ('10:30'),
  ('11:00'), ('11:30'), ('12:00'), ('12:30'),
  ('13:00'), ('13:30'), ('14:00'), ('14:30'),
  ('15:00'), ('15:30'), ('16:00'), ('16:30'),
  ('17:00'), ('17:30'), ('18:00')
ON CONFLICT DO NOTHING;

-- 10. CREATE ADMIN USER
-- ============================================================================
DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Check if user already exists
  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = 'francislainy.campos+admin@gmail.com';

  -- If user doesn't exist, create it
  IF new_user_id IS NULL THEN
    -- Insert the user into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'francislainy.campos+admin@gmail.com',
      crypt('12345678', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Administrator","phone":""}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO new_user_id;

    -- Insert into profiles
    INSERT INTO public.profiles (id, user_id, full_name, phone)
    VALUES (new_user_id, new_user_id, 'Administrator', '');

    -- Assign admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, 'admin');

    -- Also assign barbeiro role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, 'barbeiro')
    ON CONFLICT (user_id, role) DO NOTHING;

    RAISE NOTICE 'New admin user created: francislainy.campos+admin@gmail.com';
  ELSE
    -- User already exists, ensure roles and update password
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, 'barbeiro')
    ON CONFLICT (user_id, role) DO NOTHING;

    UPDATE auth.users
    SET encrypted_password = crypt('12345678', gen_salt('bf')),
        updated_at = NOW()
    WHERE id = new_user_id;

    RAISE NOTICE 'Admin user updated: francislainy.campos+admin@gmail.com';
  END IF;
END $$;

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================
-- You can now login with:
-- Email: francislainy.campos+admin@gmail.com
-- Password: 12345678
-- ============================================================================

