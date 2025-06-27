/*
  # User Profiles Schema

  1. New Tables
    - `user_profiles`: Stores extended user information
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `display_name` (text)
      - `pronouns` (text)
      - `profile_picture` (text)
      - `preferred_genres` (text[])
      - `praise_style` (text)
      - `role` (text)
      - `daily_reading_goal` (jsonb)
      - `settings` (jsonb)
      - `clubs` (text[])
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add function to create default profile on user signup

  3. Triggers
    - Create user profile on signup
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  username text UNIQUE,
  display_name text,
  pronouns text,
  profile_picture text,
  preferred_genres text[],
  praise_style text,
  role text DEFAULT 'reader',
  daily_reading_goal jsonb DEFAULT '{"type": "minutes", "amount": 30}'::jsonb,
  settings jsonb DEFAULT '{"mode": "nsfw", "voiceProfile": "flirty", "spiceTolerance": 5, "notifications": {"readingReminders": true, "clubUpdates": true, "achievements": true}}'::jsonb,
  clubs text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Function to create a user profile on signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (
    id,
    username,
    display_name,
    pronouns,
    profile_picture,
    preferred_genres,
    praise_style,
    role
  ) VALUES (
    NEW.id,
    SPLIT_PART(NEW.email, '@', 1),
    SPLIT_PART(NEW.email, '@', 1),
    'they/them',
    'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
    ARRAY['romance', 'fantasy'],
    'flirty',
    'reader'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Function to update username
CREATE OR REPLACE FUNCTION update_username(
  p_username text
)
RETURNS boolean AS $$
DECLARE
  username_exists boolean;
BEGIN
  -- Check if username exists
  SELECT EXISTS (
    SELECT 1 FROM user_profiles WHERE username = p_username AND id != auth.uid()
  ) INTO username_exists;
  
  IF username_exists THEN
    RETURN false;
  END IF;
  
  -- Update username
  UPDATE user_profiles
  SET 
    username = p_username,
    updated_at = now()
  WHERE id = auth.uid();
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user profile
CREATE OR REPLACE FUNCTION update_user_profile(
  p_display_name text DEFAULT NULL,
  p_pronouns text DEFAULT NULL,
  p_profile_picture text DEFAULT NULL,
  p_preferred_genres text[] DEFAULT NULL,
  p_praise_style text DEFAULT NULL,
  p_daily_reading_goal jsonb DEFAULT NULL
)
RETURNS user_profiles AS $$
DECLARE
  result user_profiles;
BEGIN
  UPDATE user_profiles
  SET 
    display_name = COALESCE(p_display_name, display_name),
    pronouns = COALESCE(p_pronouns, pronouns),
    profile_picture = COALESCE(p_profile_picture, profile_picture),
    preferred_genres = COALESCE(p_preferred_genres, preferred_genres),
    praise_style = COALESCE(p_praise_style, praise_style),
    daily_reading_goal = COALESCE(p_daily_reading_goal, daily_reading_goal),
    updated_at = now()
  WHERE id = auth.uid()
  RETURNING * INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;