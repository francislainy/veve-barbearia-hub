-- COMPREHENSIVE FIX for RLS policies
-- Run this in Supabase SQL Editor to completely reset and fix all policies

-- STEP 1: Drop ALL existing policies on profiles table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.profiles';
    END LOOP;
END $$;

-- STEP 2: Drop ALL existing policies on user_roles table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_roles' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.user_roles';
    END LOOP;
END $$;

-- STEP 3: Create simple, non-recursive policies

-- Allow ALL authenticated users to SELECT from profiles
CREATE POLICY "allow_authenticated_select_profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to INSERT their own profile
CREATE POLICY "allow_users_insert_own_profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to UPDATE their own profile
CREATE POLICY "allow_users_update_own_profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to DELETE their own profile (for LGPD compliance)
CREATE POLICY "allow_users_delete_own_profile"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow ALL authenticated users to SELECT from user_roles (needed for role checks)
CREATE POLICY "allow_authenticated_select_user_roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users can INSERT user_roles (we'll validate in app who can do this)
-- For now, this is permissive - you can restrict it later through application logic
CREATE POLICY "allow_authenticated_insert_user_roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users can DELETE user_roles
CREATE POLICY "allow_authenticated_delete_user_roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (true);

-- Show confirmation message
DO $$
BEGIN
  RAISE NOTICE 'RLS policies have been reset successfully!';
  RAISE NOTICE 'All authenticated users can now read profiles and user_roles.';
  RAISE NOTICE 'Admin permissions will be enforced at the application level.';
END $$;
