-- Allow admins to view all profiles
-- This is needed for the user management section in the admin panel

-- First, drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a new combined policy that allows:
-- 1. Users to view their own profile
-- 2. Admins to view all profiles
CREATE POLICY "Users can view own profile and admins can view all"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    public.has_role(auth.uid(), 'admin'::app_role)
  );

-- Also allow admins to view all user roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

CREATE POLICY "Users can view own roles and admins can view all"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    public.has_role(auth.uid(), 'admin'::app_role)
  );

-- Allow admins to manage user roles (add/remove admin privileges)
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
CREATE POLICY "Admins can insert user roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;
CREATE POLICY "Admins can delete user roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete profiles (for user deletion feature)
DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;
CREATE POLICY "Admins can delete any profile"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
