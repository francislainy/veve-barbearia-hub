-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'barbeiro', 'cliente');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'cliente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Update bookings RLS policies
DROP POLICY IF EXISTS "Anyone can view bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can delete bookings" ON public.bookings;

-- New bookings policies with authentication
CREATE POLICY "Authenticated users can view bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create bookings"
  ON public.bookings
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Barbeiros and admins can delete bookings"
  ON public.bookings
  FOR DELETE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'barbeiro') OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Barbeiros and admins can update bookings"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'barbeiro') OR 
    public.has_role(auth.uid(), 'admin')
  );

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile and assign default role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, user_id, full_name, phone)
  VALUES (
    NEW.id,
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  
  -- Assign default role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'cliente');
  
  RETURN NEW;
END;
$$;

-- Trigger to handle new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();