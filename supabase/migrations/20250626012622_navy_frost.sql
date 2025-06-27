/*
  # Fix User Profile Creation and RLS Policies

  1. New Functions
    - Improved create_user_profile function with better error handling
    - Added upsert_user_profile function for reliable profile creation

  2. Security
    - Fixed RLS policies on user_profiles table
    - Added INSERT policy for authenticated users
    - Added UPDATE policy for users to update their own profiles

  3. Changes
    - Dropped and recreated the trigger for more reliable execution
    - Added proper error handling in profile creation
*/

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.create_user_profile();

-- Create improved function to automatically create user profiles
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
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
  )
  ON CONFLICT (id) DO NOTHING;
  
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

-- Create a function to upsert user profiles (for manual creation/updates)
CREATE OR REPLACE FUNCTION public.upsert_user_profile(
  p_id UUID,
  p_username TEXT,
  p_display_name TEXT,
  p_profile_picture TEXT DEFAULT 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
  p_role TEXT DEFAULT 'reader'
)
RETURNS public.user_profiles AS $$
DECLARE
  v_result public.user_profiles;
BEGIN
  -- Insert or update the user profile
  INSERT INTO public.user_profiles (
    id,
    username,
    display_name,
    profile_picture,
    role,
    updated_at
  ) VALUES (
    p_id,
    p_username,
    p_display_name,
    p_profile_picture,
    p_role,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    display_name = EXCLUDED.display_name,
    profile_picture = EXCLUDED.profile_picture,
    role = EXCLUDED.role,
    updated_at = NOW()
  RETURNING * INTO v_result;
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error upserting user profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix RLS policies on user_profiles table
-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;

-- Make sure RLS is enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

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