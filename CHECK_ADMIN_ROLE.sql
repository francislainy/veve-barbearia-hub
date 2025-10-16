-- Check if admin user exists and has admin role
-- Run this in your Supabase SQL Editor

-- 1. List all users and their roles
SELECT
  u.email,
  ur.role,
  ur.created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
ORDER BY u.email;

-- 2. Check specifically for admin users
SELECT
  u.email,
  u.id as user_id,
  ur.role
FROM auth.users u
INNER JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'admin';

-- 3. If no admin exists, create one (replace with your email)
-- Uncomment and modify the email below if needed:
/*
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the user ID for your email
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'your-email@example.com'
  LIMIT 1;

  -- Insert admin role if user exists
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    RAISE NOTICE 'Admin role assigned to user: %', admin_user_id;
  ELSE
    RAISE NOTICE 'User not found with that email';
  END IF;
END $$;
*/

