-- Update database to only have admin and client roles
-- Run this in your Supabase SQL Editor

-- First, update any existing 'barbeiro' roles to 'admin'
UPDATE public.user_roles
SET role = 'admin'
WHERE role = 'barbeiro';

-- Drop the old enum and recreate with only admin and client
ALTER TABLE public.user_roles
ALTER COLUMN role TYPE TEXT;

DROP TYPE IF EXISTS public.app_role CASCADE;

CREATE TYPE public.app_role AS ENUM ('admin', 'client');

ALTER TABLE public.user_roles
ALTER COLUMN role TYPE app_role USING role::app_role;

-- Update the has_role function to work with the new enum
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

-- Update RLS policies to only use admin role (remove barbeiro references)
DROP POLICY IF EXISTS "Barbeiros and admins can delete bookings" ON public.bookings;
DROP POLICY IF EXISTS "Barbeiros and admins can update bookings" ON public.bookings;

CREATE POLICY "Admins can delete bookings"
  ON public.bookings
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update bookings"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Verify the changes
SELECT
  u.email,
  ur.role,
  ur.created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
ORDER BY u.email;
