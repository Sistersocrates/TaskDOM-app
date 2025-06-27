/*
  # Create User Profile Trigger

  1. Functions
    - `create_user_profile` - Automatically creates a user profile when a new user signs up
  
  2. Triggers
    - Trigger on auth.users table to create profiles automatically
*/

-- Create function to automatically create user profiles
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    username,
    display_name,
    profile_picture
  ) VALUES (
    NEW.id,
    SPLIT_PART(NEW.email, '@', 1),
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_profile();