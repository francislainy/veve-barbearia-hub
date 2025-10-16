-- Add user_id column to bookings table to track booking ownership
ALTER TABLE public.bookings ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing bookings to have a user_id (set to NULL for now, as we don't know who created them)
-- In production, you'd want to handle this differently

-- Drop old policies
DROP POLICY IF EXISTS "Authenticated users can view bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;

-- Create new restrictive policies
-- Only barbeiros and admins can view all bookings
CREATE POLICY "Barbeiros and admins can view all bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'barbeiro'::app_role) OR 
    public.has_role(auth.uid(), 'admin'::app_role)
  );

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Authenticated users can create bookings for themselves
CREATE POLICY "Authenticated users can create their own bookings"
  ON public.bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add profile deletion policy for LGPD/GDPR compliance
CREATE POLICY "Users can delete their own profile"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add database constraints for input validation
ALTER TABLE public.bookings
  ADD CONSTRAINT name_length CHECK (length(name) >= 2 AND length(name) <= 100),
  ADD CONSTRAINT phone_format CHECK (phone ~ '^\d{10,11}$');

ALTER TABLE public.profiles
  ADD CONSTRAINT full_name_length CHECK (full_name IS NULL OR (length(full_name) >= 2 AND length(full_name) <= 100)),
  ADD CONSTRAINT phone_format CHECK (phone IS NULL OR phone ~ '^\d{10,11}$');