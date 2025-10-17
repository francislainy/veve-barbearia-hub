-- EMERGENCY FIX: Disable RLS temporarily to get user management working
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor)

-- Disable RLS on profiles table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on user_roles table
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Show confirmation
DO $$
BEGIN
  RAISE NOTICE '⚠️ RLS has been DISABLED on profiles and user_roles tables';
  RAISE NOTICE 'This is a temporary fix to get user management working';
  RAISE NOTICE 'You should re-enable and properly configure RLS in production';
END $$;

