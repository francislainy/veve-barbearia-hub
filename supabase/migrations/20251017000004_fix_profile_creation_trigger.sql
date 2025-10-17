-- Fix the handle_new_user function to properly create profiles with explicit UUID generation
-- This ensures new users automatically get profiles when they sign up

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile with explicit UUID generation
  INSERT INTO public.profiles (id, user_id, full_name, phone, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NOW(),
    NOW()
  );

  -- Assign default role (cliente)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'cliente'::app_role);

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't prevent user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

