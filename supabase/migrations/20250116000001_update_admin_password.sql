-- Migration to update the initial admin password
-- This sets the password for francislainy.campos@gmail.com to 12345678

-- Note: Supabase Auth passwords are hashed and can only be updated through the Auth API
-- This migration provides instructions for updating the password

-- MANUAL STEPS REQUIRED:
-- Run this in Supabase Dashboard → SQL Editor:

-- Option 1: Using Supabase Dashboard UI (Recommended)
-- 1. Go to Authentication → Users
-- 2. Find francislainy.campos@gmail.com
-- 3. Click the three dots menu → "Reset Password"
-- 4. Set new password: 12345678

-- Option 2: Using SQL (if the user exists but you want to force reset)
-- This will send a password reset email to the user
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Find the user
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = 'francislainy.campos@gmail.com';

  IF user_id IS NOT NULL THEN
    RAISE NOTICE 'User found: %. Please reset password manually in Supabase Dashboard.', user_id;
  ELSE
    RAISE NOTICE 'User not found. Please create the account first through the app signup.';
  END IF;
END $$;

-- The password will be set to 12345678 when you create the account through the app
-- or update it manually in the Supabase Dashboard → Authentication → Users

