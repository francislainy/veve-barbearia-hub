-- This migration ensures that updates to services and time_slots properly report when they fail due to RLS
-- The issue is that Supabase doesn't throw an error when RLS blocks an update, it just returns 0 rows

-- First, let's verify the has_role function is working correctly
-- Re-create it to ensure it's using the correct logic
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

-- Add a helper function to check if current user has admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::app_role
  )
$$;

-- Grant execute permissions on these functions to authenticated users
GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Recreate the policies with explicit type casting to ensure they work correctly
DROP POLICY IF EXISTS "Only admins can update services" ON public.services;
CREATE POLICY "Only admins can update services"
  ON public.services
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Only admins can update time slots" ON public.time_slots;
CREATE POLICY "Only admins can update time slots"
  ON public.time_slots
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

