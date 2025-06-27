/*
  # Update User Profile Trigger

  1. Changes
     - Improve the create_user_profile trigger function
     - Make it idempotent to prevent duplicate profile creation
     - Add better error handling
  
  2. Purpose
     - Prevents "duplicate key value violates unique constraint" errors
     - Ensures user profiles are created exactly once
     - Provides more robust user onboarding
*/

-- Drop the existing trigger function if it exists
DROP FUNCTION IF EXISTS create_user_profile CASCADE;

-- Create an improved trigger function that checks if profile exists first
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if a profile already exists for this user
  IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = NEW.id) THEN
    -- Insert a new profile only if one doesn't exist
    INSERT INTO public.user_profiles (
      id,
      username,
      display_name,
      profile_picture
    ) VALUES (
      NEW.id,
      COALESCE(NEW.email, '')::text,
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))::text,
      COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg')::text
    )
    ON CONFLICT (id) DO NOTHING; -- Extra safety to prevent duplicates
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'Error in create_user_profile trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created' 
    AND tgrelid = 'auth.users'::regclass
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();
  END IF;
END
$$;

-- Create a function to ensure a user profile exists
CREATE OR REPLACE FUNCTION ensure_user_profile(user_id uuid)
RETURNS void AS $$
DECLARE
  user_email text;
  user_name text;
  user_avatar text;
BEGIN
  -- Check if profile exists
  IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = user_id) THEN
    -- Get user data from auth.users
    SELECT 
      email,
      COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
      COALESCE(raw_user_meta_data->>'avatar_url', 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg')
    INTO user_email, user_name, user_avatar
    FROM auth.users
    WHERE id = user_id;
    
    -- Insert profile if user exists
    IF user_email IS NOT NULL THEN
      INSERT INTO public.user_profiles (
        id,
        username,
        display_name,
        profile_picture
      ) VALUES (
        user_id,
        user_email,
        user_name,
        user_avatar
      )
      ON CONFLICT (id) DO NOTHING;
    END IF;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in ensure_user_profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION ensure_user_profile IS 'Ensures a user profile exists for the given user ID';