-- Migration to create first admin user and admin management functions
-- This creates the initial admin user: francislainy.campos@gmail.com

-- Function to promote user to admin/barbeiro (only callable by admins)
CREATE OR REPLACE FUNCTION public.promote_user_role(
  target_user_email TEXT,
  new_role app_role
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
  result JSONB;
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only admins can promote users'
    );
  END IF;

  -- Find the target user
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = target_user_email;

  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Add the role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'User promoted successfully',
    'user_id', target_user_id,
    'role', new_role
  );
END;
$$;

-- Function to create a new user with admin/barbeiro role (only callable by admins)
CREATE OR REPLACE FUNCTION public.create_admin_user(
  user_email TEXT,
  user_password TEXT,
  user_role app_role DEFAULT 'admin'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id UUID;
  result JSONB;
BEGIN
  -- Check if caller is admin (skip this check if no users exist yet - for initial setup)
  IF EXISTS (SELECT 1 FROM auth.users) AND NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only admins can create admin users'
    );
  END IF;

  -- Note: This function is a placeholder for the logic
  -- The actual user creation will be done via Supabase Auth API from the frontend
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Please use the admin panel to create new admin users'
  );
END;
$$;

-- Create initial admin user
-- Note: We'll use a DO block that only runs if the user doesn't exist
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Check if admin user already exists
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'francislainy.campos@gmail.com';

  -- If user exists, promote to admin
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    RAISE NOTICE 'User francislainy.campos@gmail.com promoted to admin';
  ELSE
    RAISE NOTICE 'User francislainy.campos@gmail.com not found. Please create account first, then run migration again.';
  END IF;
END $$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.promote_user_role(TEXT, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_admin_user(TEXT, TEXT, app_role) TO authenticated;

-- Add policy to allow admins to view all user roles
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
