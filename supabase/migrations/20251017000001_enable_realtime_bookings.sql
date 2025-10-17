-- Enable real-time for the bookings table
-- This ensures that changes to bookings are broadcast to all connected clients

-- Drop existing publication if it exists
DROP PUBLICATION IF EXISTS supabase_realtime;

-- Create publication for real-time
CREATE PUBLICATION supabase_realtime FOR TABLE bookings;

-- Alternatively, if you want all tables to have real-time:
-- CREATE PUBLICATION supabase_realtime FOR ALL TABLES;

-- Grant necessary permissions
ALTER PUBLICATION supabase_realtime OWNER TO postgres;

