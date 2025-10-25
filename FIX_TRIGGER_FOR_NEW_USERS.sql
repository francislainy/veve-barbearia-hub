-- COMPLETE FIX: Make trigger work for new user signups
-- This ensures new users automatically get profiles when they register
-- Run this in your Supabase SQL Editor

-- Step 1: Drop the existing trigger and function to start fresh
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 2: Create the corrected trigger function
-- This function creates both a profile and assigns the default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_exists BOOLEAN;
BEGIN
  -- Check if profile already exists (in case trigger fires multiple times)
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = NEW.id
  ) INTO profile_exists;

  IF NOT profile_exists THEN
    -- Insert profile with separate id and user_id
    INSERT INTO public.profiles (id, user_id, full_name, phone, created_at, updated_at)
    VALUES (
      gen_random_uuid(),  -- Generate a new UUID for the profile id
      NEW.id,             -- Use auth user id as user_id
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      NOW(),
      NOW()
    );

    -- Assign default role (client)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'client'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;

    RAISE NOTICE 'Profile created for user: % (email: %)', NEW.id, NEW.email;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error for debugging
    RAISE WARNING 'Error in handle_new_user for user % (email: %): %', NEW.id, NEW.email, SQLERRM;
    -- Return NEW to allow user creation to continue even if profile creation fails
    RETURN NEW;
END;
$$;

-- Step 3: Create the trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;

-- Step 5: Fix any existing users missing profiles
INSERT INTO public.profiles (id, user_id, full_name, phone, created_at, updated_at)
SELECT
  gen_random_uuid(),
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  COALESCE(au.raw_user_meta_data->>'phone', ''),
  NOW(),
  NOW()
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = au.id
);

-- Step 6: Fix any existing users missing roles
INSERT INTO public.user_roles (user_id, role)
SELECT
  au.id,
  'client'::app_role
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur WHERE ur.user_id = au.id
);

-- Step 7: Verify the trigger is properly installed
SELECT
  n.nspname as schema,
  t.tgname as trigger_name,
  c.relname as table_name,
  p.proname as function_name,
  CASE t.tgenabled
    WHEN 'O' THEN 'enabled'
    WHEN 'D' THEN 'disabled'
    WHEN 'R' THEN 'replica'
    WHEN 'A' THEN 'always'
    ELSE 'unknown'
  END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname = 'on_auth_user_created'
  AND n.nspname = 'auth'
  AND c.relname = 'users';

-- Step 8: Show current state of users and profiles
SELECT
  au.email,
  au.created_at as user_created_at,
  p.id as profile_id,
  p.full_name,
  p.created_at as profile_created_at,
  COALESCE(ARRAY_AGG(ur.role) FILTER (WHERE ur.role IS NOT NULL), ARRAY[]::app_role[]) as roles
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
LEFT JOIN public.user_roles ur ON ur.user_id = au.id
GROUP BY au.id, au.email, au.created_at, p.id, p.full_name, p.created_at
ORDER BY au.created_at DESC;

-- Step 9: Instructions for testing
-- After running this script:
-- 1. Try creating a new test user in your app
-- 2. Check the Authentication > Users tab - you should see the new user
-- 3. Check the profiles table - the user should appear there immediately
-- 4. If it doesn't work, check the Supabase logs for any error messages

