/*
  # Gamification System Schema

  1. New Tables
    - `smut_streaks`: Track user reading streaks
    - `daily_challenges`: Store daily challenges and themed content
    - `user_activities`: Log all user activities for points calculation
    - `unlocked_rewards`: Track rewards unlocked by users
    - `leaderboard_view`: Materialized view for leaderboard data

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data

  3. Functions
    - Automatic streak calculation
    - Points calculation with themed day multipliers
    - Challenge progress tracking
*/

-- Create smut_streaks table
CREATE TABLE IF NOT EXISTS smut_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  streak_type text NOT NULL CHECK (streak_type IN ('daily_reading', 'spicy_scenes', 'content_sharing', 'book_club')),
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, streak_type)
);

-- Create daily_challenges table
CREATE TABLE IF NOT EXISTS daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  theme jsonb NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  requirements jsonb NOT NULL,
  rewards jsonb NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'legendary')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create user_activities table
CREATE TABLE IF NOT EXISTS user_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  activity_type text NOT NULL CHECK (activity_type IN ('reading_session', 'spicy_scene_marked', 'content_shared', 'book_completed', 'club_participation')),
  activity_data jsonb DEFAULT '{}',
  points_earned integer DEFAULT 0,
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create unlocked_rewards table
CREATE TABLE IF NOT EXISTS unlocked_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  reward_type text NOT NULL CHECK (reward_type IN ('voice_clip', 'book_recommendation', 'club_access', 'badge')),
  reward_data jsonb NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  is_claimed boolean DEFAULT false,
  claimed_at timestamptz
);

-- Enable RLS
ALTER TABLE smut_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlocked_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for smut_streaks
CREATE POLICY "Users can view their own streaks"
  ON smut_streaks
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own streaks"
  ON smut_streaks
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own streaks"
  ON smut_streaks
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for daily_challenges
CREATE POLICY "Anyone can view active challenges"
  ON daily_challenges
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for user_activities
CREATE POLICY "Users can view their own activities"
  ON user_activities
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own activities"
  ON user_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for unlocked_rewards
CREATE POLICY "Users can view their own rewards"
  ON unlocked_rewards
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own rewards"
  ON unlocked_rewards
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own rewards"
  ON unlocked_rewards
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_smut_streaks_user_type ON smut_streaks(user_id, streak_type);
CREATE INDEX IF NOT EXISTS idx_smut_streaks_activity_date ON smut_streaks(last_activity_date);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(date);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_date ON user_activities(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_unlocked_rewards_user ON unlocked_rewards(user_id);

-- Function to calculate themed day multipliers
CREATE OR REPLACE FUNCTION get_themed_day_multiplier(
  activity_type text,
  activity_date date DEFAULT CURRENT_DATE
)
RETURNS decimal AS $$
DECLARE
  day_of_week integer;
  multiplier decimal := 1.0;
BEGIN
  day_of_week := EXTRACT(DOW FROM activity_date);
  
  -- Apply themed day multipliers based on day of week
  CASE day_of_week
    WHEN 0 THEN -- Sunday (Sinful Sunday)
      CASE activity_type
        WHEN 'reading_session' THEN multiplier := 1.5;
        WHEN 'spicy_scene_marked' THEN multiplier := 2.0;
        WHEN 'content_shared' THEN multiplier := 1.3;
        ELSE multiplier := 1.0;
      END CASE;
    WHEN 1 THEN -- Monday (Manic Monday)
      CASE activity_type
        WHEN 'reading_session' THEN multiplier := 1.3;
        WHEN 'spicy_scene_marked' THEN multiplier := 1.5;
        WHEN 'content_shared' THEN multiplier := 1.2;
        ELSE multiplier := 1.0;
      END CASE;
    WHEN 2 THEN -- Tuesday (Tempting Tuesday)
      CASE activity_type
        WHEN 'reading_session' THEN multiplier := 1.2;
        WHEN 'spicy_scene_marked' THEN multiplier := 1.8;
        WHEN 'content_shared' THEN multiplier := 1.4;
        ELSE multiplier := 1.0;
      END CASE;
    WHEN 3 THEN -- Wednesday (Wild Wednesday)
      CASE activity_type
        WHEN 'reading_session' THEN multiplier := 1.4;
        WHEN 'spicy_scene_marked' THEN multiplier := 1.7;
        WHEN 'content_shared' THEN multiplier := 1.5;
        ELSE multiplier := 1.0;
      END CASE;
    WHEN 4 THEN -- Thursday (Thirsty Thursday)
      CASE activity_type
        WHEN 'reading_session' THEN multiplier := 1.6;
        WHEN 'spicy_scene_marked' THEN multiplier := 2.2;
        WHEN 'content_shared' THEN multiplier := 1.3;
        ELSE multiplier := 1.0;
      END CASE;
    WHEN 5 THEN -- Friday (Feral Friday)
      CASE activity_type
        WHEN 'reading_session' THEN multiplier := 2.0;
        WHEN 'spicy_scene_marked' THEN multiplier := 3.0;
        WHEN 'content_shared' THEN multiplier := 2.0;
        ELSE multiplier := 1.0;
      END CASE;
    WHEN 6 THEN -- Saturday (Sultry Saturday)
      CASE activity_type
        WHEN 'reading_session' THEN multiplier := 1.7;
        WHEN 'spicy_scene_marked' THEN multiplier := 2.1;
        WHEN 'content_shared' THEN multiplier := 1.6;
        ELSE multiplier := 1.0;
      END CASE;
  END CASE;
  
  RETURN multiplier;
END;
$$ LANGUAGE plpgsql;

-- Function to update streak automatically
CREATE OR REPLACE FUNCTION update_user_streak(
  p_user_id uuid,
  p_streak_type text,
  p_activity_date date DEFAULT CURRENT_DATE
)
RETURNS void AS $$
DECLARE
  existing_streak smut_streaks%ROWTYPE;
  days_diff integer;
  new_streak integer;
BEGIN
  -- Get existing streak
  SELECT * INTO existing_streak
  FROM smut_streaks
  WHERE user_id = p_user_id AND streak_type = p_streak_type;
  
  IF existing_streak.id IS NOT NULL THEN
    -- Calculate days difference
    days_diff := p_activity_date - existing_streak.last_activity_date;
    
    IF days_diff = 1 THEN
      -- Continue streak
      new_streak := existing_streak.current_streak + 1;
    ELSIF days_diff > 1 THEN
      -- Streak broken, reset
      new_streak := 1;
    ELSE
      -- Same day, no change
      new_streak := existing_streak.current_streak;
    END IF;
    
    -- Update existing streak
    UPDATE smut_streaks
    SET 
      current_streak = new_streak,
      longest_streak = GREATEST(existing_streak.longest_streak, new_streak),
      last_activity_date = p_activity_date,
      updated_at = now()
    WHERE id = existing_streak.id;
  ELSE
    -- Create new streak
    INSERT INTO smut_streaks (user_id, streak_type, current_streak, longest_streak, last_activity_date)
    VALUES (p_user_id, p_streak_type, 1, 1, p_activity_date);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create leaderboard view
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
  u.id as user_id,
  u.raw_user_meta_data->>'username' as username,
  u.raw_user_meta_data->>'display_name' as display_name,
  u.raw_user_meta_data->>'profile_picture' as profile_picture,
  COALESCE(SUM(ua.points_earned), 0) as total_points,
  COALESCE(MAX(ss.longest_streak), 0) as longest_streak,
  COALESCE(MAX(ss.current_streak), 0) as current_streak,
  u.raw_user_meta_data->>'favorite_genre' as favorite_genre,
  ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(ua.points_earned), 0) DESC) as rank
FROM auth.users u
LEFT JOIN user_activities ua ON u.id = ua.user_id
LEFT JOIN smut_streaks ss ON u.id = ss.user_id
WHERE ua.date >= CURRENT_DATE - INTERVAL '7 days' OR ua.date IS NULL
GROUP BY u.id, u.raw_user_meta_data
ORDER BY total_points DESC;

-- Grant permissions
GRANT SELECT ON leaderboard_view TO authenticated;