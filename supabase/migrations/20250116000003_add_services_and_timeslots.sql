-- Create services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create time_slots table
CREATE TABLE public.time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time TEXT NOT NULL UNIQUE,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add service_id to bookings table
ALTER TABLE public.bookings
ADD COLUMN service_id UUID REFERENCES public.services(id);

-- Enable RLS on services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Enable RLS on time_slots
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;

-- Services policies
CREATE POLICY "Anyone can view active services"
  ON public.services
  FOR SELECT
  USING (is_active = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can insert services"
  ON public.services
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update services"
  ON public.services
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete services"
  ON public.services
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Time slots policies
CREATE POLICY "Anyone can view time slots"
  ON public.time_slots
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert time slots"
  ON public.time_slots
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update time slots"
  ON public.time_slots
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete time slots"
  ON public.time_slots
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_time_slots_updated_at
  BEFORE UPDATE ON public.time_slots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default services (from the current hardcoded list)
INSERT INTO public.services (name, category, price, duration_minutes) VALUES
  ('Corte de cabelo', 'Cabelo', 40.00, 30),
  ('Pézinho', 'Cabelo', 15.00, 15),
  ('Penteado', 'Cabelo', 20.00, 20),
  ('Barba', 'Barba', 30.00, 20),
  ('Cavanhaque', 'Barba', 30.00, 20),
  ('Sobrancelha', 'Sobrancelha', 15.00, 10),
  ('Progressiva', 'Química', 60.00, 60),
  ('Pigmentação', 'Química', 30.00, 45),
  ('Alisante', 'Química', 30.00, 60),
  ('Luzes', 'Química', 40.00, 90),
  ('Platinado', 'Química', 120.00, 120);

-- Insert default time slots (9am to 6pm, every 30 minutes)
INSERT INTO public.time_slots (time) VALUES
  ('09:00'), ('09:30'), ('10:00'), ('10:30'),
  ('11:00'), ('11:30'), ('12:00'), ('12:30'),
  ('13:00'), ('13:30'), ('14:00'), ('14:30'),
  ('15:00'), ('15:30'), ('16:00'), ('16:30'),
  ('17:00'), ('17:30'), ('18:00');

