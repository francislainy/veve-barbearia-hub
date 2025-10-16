-- Migration to clean up all existing data and start fresh
-- WARNING: This will delete ALL users and bookings!
-- Only run this if you want to completely reset the database

-- Delete all bookings
TRUNCATE TABLE public.bookings CASCADE;

-- Delete all user roles
TRUNCATE TABLE public.user_roles CASCADE;

-- Delete all profiles
TRUNCATE TABLE public.profiles CASCADE;

-- Note: We cannot delete auth.users directly from here for security reasons
-- You need to delete users through Supabase Dashboard → Authentication → Users
-- Or use the cleanup script below

RAISE NOTICE 'Database tables cleared. Now delete users from Supabase Dashboard → Authentication → Users, then create fresh admin account.';

