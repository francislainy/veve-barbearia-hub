-- Fix admin role for francislainy.campos+admin@gmail.com
-- Run this in your Supabase SQL Editor

DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Find the admin user
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'francislainy.campos+admin@gmail.com';

  IF admin_user_id IS NOT NULL THEN
    -- Remove any existing client role
    DELETE FROM public.user_roles
    WHERE user_id = admin_user_id AND role = 'client';

    -- Add admin role if it doesn't exist
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    RAISE NOTICE 'Admin role assigned to user: %', admin_user_id;
  ELSE
    RAISE NOTICE 'User not found: francislainy.campos+admin@gmail.com';
  END IF;
END $$;

-- Verify the role was assigned
SELECT
  u.email,
  ur.role,
  ur.created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'francislainy.campos+admin@gmail.com';
