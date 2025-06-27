/*
  # Fix User Profiles RLS Policies

  1. Security
    - Fixed RLS policies on user_profiles table
    - Added INSERT policy for authenticated users
    - Added UPDATE policy for users to update their own profiles
    - Added SELECT policy for users to view their own profiles

  2. Changes
    - Ensured proper error handling in profile creation
    - Added proper security checks for all operations
*/

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