-- Allow users to delete their own bookings
-- This enables clients to cancel their own appointments

-- Add policy for users to delete their own bookings
CREATE POLICY "Users can delete their own bookings"
  ON public.bookings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

