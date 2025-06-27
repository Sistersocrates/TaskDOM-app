/*
  # Fix User Profile Creation

  1. Changes
     - Creates an improved database trigger for user profile creation
     - Adds proper error handling to prevent transaction failures
     - Implements idempotent profile creation (checks if profile exists first)
     - Fixes RLS policies for user_profiles table

  2. Security
     - Uses SECURITY DEFINER to bypass RLS during profile creation
     - Adds proper RLS policies for user_profiles table
*/

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.create_user_profile();

-- Create improved function to automatically create user profiles
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
DECLARE
  profile_exists BOOLEAN;
BEGIN
  -- First check if profile already exists to avoid duplicate key errors
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles WHERE id = NEW.id
  ) INTO profile_exists;
  
  -- Only insert if profile doesn't exist
  IF NOT profile_exists THEN
    INSERT INTO public.user_profiles (
      id,
      username,
      display_name,
      profile_picture,
      role,
      created_at
    ) VALUES (
      NEW.id,
      SPLIT_PART(NEW.email, '@', 1),
      COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg'),
      'reader',
      NOW()
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE NOTICE 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a new trigger to automatically create user profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_profile();

-- Make sure RLS is enabled on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;

-- Create policy to allow users to view their own profile
CREATE POLICY "Users can view their own profile" 
  ON public.user_profiles 
  FOR SELECT 
  TO authenticated 
  USING (id = auth.uid());

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
  ON public.user_profiles 
  FOR UPDATE 
  TO authenticated 
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Create policy to allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" 
  ON public.user_profiles 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (id = auth.uid());

-- Create a function to check if a profile exists and create it if not
CREATE OR REPLACE FUNCTION public.ensure_user_profile(
  user_id UUID,
  username TEXT DEFAULT NULL,
  display_name TEXT DEFAULT NULL,
  profile_picture TEXT DEFAULT 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg'
) RETURNS public.user_profiles AS $$
DECLARE
  profile_exists BOOLEAN;
  user_email TEXT;
  v_result public.user_profiles;
BEGIN
  -- Check if profile already exists
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles WHERE id = user_id
  ) INTO profile_exists;
  
  -- Get user email if needed
  IF NOT profile_exists THEN
    SELECT email INTO user_email FROM auth.users WHERE id = user_id;
    
    -- Insert new profile
    INSERT INTO public.user_profiles (
      id,
      username,
      display_name,
      profile_picture,
      role,
      created_at
    ) VALUES (
      user_id,
      COALESCE(username, SPLIT_PART(user_email, '@', 1)),
      COALESCE(display_name, SPLIT_PART(user_email, '@', 1)),
      profile_picture,
      'reader',
      NOW()
    )
    ON CONFLICT (id) DO NOTHING
    RETURNING * INTO v_result;
  ELSE
    -- Get existing profile
    SELECT * INTO v_result FROM public.user_profiles WHERE id = user_id;
  END IF;
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error ensuring user profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;