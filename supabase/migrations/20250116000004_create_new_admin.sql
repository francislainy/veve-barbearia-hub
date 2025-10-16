-- Create new admin user: francislainy.campos+admin@gmail.com with password: 12345678
-- This replaces the previous francislainy admin user

-- First, let's create a function to handle the admin creation if it doesn't already exist
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
      crypt('12345678', gen_salt('bf')), -- Password: 12345678
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

    -- Also assign barbeiro role (so they can access the admin panel)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, 'barbeiro')
    ON CONFLICT (user_id, role) DO NOTHING;

    RAISE NOTICE 'New admin user created: francislainy.campos+admin@gmail.com';
  ELSE
    -- User already exists, just make sure they have admin and barbeiro roles
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, 'barbeiro')
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Update password to ensure it's 12345678
    UPDATE auth.users
    SET encrypted_password = crypt('12345678', gen_salt('bf')),
        updated_at = NOW()
    WHERE id = new_user_id;

    RAISE NOTICE 'Admin user already exists, updated roles and password: francislainy.campos+admin@gmail.com';
  END IF;
END $$;

-- Optional: Remove the old francislainy admin if desired
-- Uncomment the following lines if you want to delete the old admin
/*
DO $$
DECLARE
  old_admin_id UUID;
BEGIN
  SELECT id INTO old_admin_id
  FROM auth.users
  WHERE email = 'francislainy@example.com';

  IF old_admin_id IS NOT NULL THEN
    -- Delete user roles
    DELETE FROM public.user_roles WHERE user_id = old_admin_id;

    -- Delete profile
    DELETE FROM public.profiles WHERE user_id = old_admin_id;

    -- Delete from auth.users
    DELETE FROM auth.users WHERE id = old_admin_id;

    RAISE NOTICE 'Old admin user deleted: francislainy@example.com';
  END IF;
END $$;
*/
