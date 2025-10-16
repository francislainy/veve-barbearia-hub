-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to view bookings
CREATE POLICY "Anyone can view bookings"
ON public.bookings
FOR SELECT
USING (true);

-- Create policy to allow anyone to create bookings
CREATE POLICY "Anyone can create bookings"
ON public.bookings
FOR INSERT
WITH CHECK (true);

-- Create policy to allow anyone to delete bookings
CREATE POLICY "Anyone can delete bookings"
ON public.bookings
FOR DELETE
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();