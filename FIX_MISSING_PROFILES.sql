-- Fix missing profiles for existing users
-- Run this in your Supabase SQL Editor

-- Step 1: Create profiles for all auth users that don't have profiles yet
INSERT INTO public.profiles (id, user_id, full_name, created_at, updated_at)
SELECT
  gen_random_uuid(),
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)) as full_name,
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
WHERE p.user_id IS NULL;

-- Step 2: Ensure the current admin user (francislainycampos+admin@gmail.com) has admin role
INSERT INTO public.user_roles (user_id, role)
SELECT
  au.id,
  'admin'::app_role
FROM auth.users au
WHERE au.email = 'francislainycampos+admin@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = au.id AND ur.role = 'admin'::app_role
  );

-- Step 3: Verify the results
SELECT
  'Profiles created' as status,
  COUNT(*) as count
FROM public.profiles;

SELECT
  'Users with admin role' as status,
  COUNT(*) as count
FROM public.user_roles
WHERE role = 'admin'::app_role;

-- Step 4: Show all users with their profiles and roles
SELECT
  au.email,
  p.full_name,
  p.created_at,
  ARRAY_AGG(ur.role) as roles
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
LEFT JOIN public.user_roles ur ON ur.user_id = au.id
GROUP BY au.id, au.email, p.full_name, p.created_at
ORDER BY au.created_at;
