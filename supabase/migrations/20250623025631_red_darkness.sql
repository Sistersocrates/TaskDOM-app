/*
  # Social Sharing System

  1. New Tables
    - `social_shares`: Track user sharing activity
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `share_type` (enum: 'progress', 'streak', 'tbr', 'reading_list', 'achievement', 'book_review')
      - `content` (jsonb, the shared content data)
      - `platforms` (text[], the platforms where content was shared)
      - `share_url` (text, the generated share URL)
      - `metadata` (jsonb, additional metadata for the share)
      - `created_at` (timestamp)

    - `share_templates`: Store customizable sharing templates
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users, nullable for system templates)
      - `share_type` (enum: 'progress', 'streak', 'tbr', 'reading_list', 'achievement', 'book_review')
      - `title` (text, the template title)
      - `content` (text, the template content with placeholders)
      - `hashtags` (text[], default hashtags)
      - `is_default` (boolean, whether this is a default template)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Allow reading of default templates for all users

  3. Functions
    - Generate share URL with metadata
    - Track sharing analytics
*/

-- Create share type enum
CREATE TYPE share_type AS ENUM (
  'progress',
  'streak',
  'tbr',
  'reading_list',
  'achievement',
  'book_review'
);

-- Create social_shares table
CREATE TABLE IF NOT EXISTS social_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  share_type share_type NOT NULL,
  content jsonb NOT NULL,
  platforms text[] DEFAULT '{}',
  share_url text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create share_templates table
CREATE TABLE IF NOT EXISTS share_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  share_type share_type NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  hashtags text[] DEFAULT '{}',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social_shares
CREATE POLICY "Users can view their own shares"
  ON social_shares
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own shares"
  ON social_shares
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for share_templates
CREATE POLICY "Users can view their own templates and default templates"
  ON share_templates
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_default = true);

CREATE POLICY "Users can insert their own templates"
  ON share_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND is_default = false);

CREATE POLICY "Users can update their own templates"
  ON share_templates
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND is_default = false);

CREATE POLICY "Users can delete their own templates"
  ON share_templates
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() AND is_default = false);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_social_shares_user ON social_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_type ON social_shares(share_type);
CREATE INDEX IF NOT EXISTS idx_share_templates_user ON share_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_share_templates_type ON share_templates(share_type);
CREATE INDEX IF NOT EXISTS idx_share_templates_default ON share_templates(is_default);

-- Function to generate a share URL with metadata
CREATE OR REPLACE FUNCTION generate_share_url(
  p_share_type share_type,
  p_content jsonb,
  p_base_url text DEFAULT 'https://taskdom.app/share'
)
RETURNS text AS $$
DECLARE
  share_id text;
  final_url text;
BEGIN
  -- Generate a unique ID for the share
  share_id := encode(gen_random_bytes(8), 'hex');
  
  -- Construct the URL with the share ID
  final_url := p_base_url || '/' || share_id;
  
  RETURN final_url;
END;
$$ LANGUAGE plpgsql;

-- Function to track share analytics
CREATE OR REPLACE FUNCTION track_share_analytics(
  p_share_id uuid,
  p_platform text,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
  UPDATE social_shares
  SET 
    platforms = array_append(platforms, p_platform),
    metadata = jsonb_set(
      metadata, 
      '{analytics}', 
      COALESCE(metadata->'analytics', '[]'::jsonb) || 
      jsonb_build_object(
        'platform', p_platform,
        'timestamp', now(),
        'data', p_metadata
      )
    )
  WHERE id = p_share_id;
END;
$$ LANGUAGE plpgsql;

-- Insert default share templates
INSERT INTO share_templates (share_type, title, content, hashtags, is_default)
VALUES
  (
    'progress',
    '📚 Reading Progress Update!',
    'Just finished {{pages_read}} pages of "{{book_title}}" by {{author}}. {{percentage}}% complete! 🔥',
    ARRAY['BookProgress', 'CurrentlyReading', 'BookLover', 'ReadingGoals'],
    true
  ),
  (
    'progress',
    '📖 Currently Reading',
    'Making great progress on "{{book_title}}" - {{percentage}}% done and loving every page! What are you reading?',
    ARRAY['AmReading', 'BookWorm', 'ReadersOfInstagram', 'BookCommunity'],
    true
  ),
  (
    'streak',
    '🔥 {{days}} Day Reading Streak!',
    'I''ve been reading consistently for {{days}} days straight! Building this habit one page at a time 📚💪',
    ARRAY['ReadingStreak', 'ReadingHabit', 'BookGoals', 'DailyReading'],
    true
  ),
  (
    'streak',
    '📚 Streak Status: ON FIRE!',
    '{{days}} days of reading in a row! Who else is building their reading habit? Let''s motivate each other! 🔥',
    ARRAY['BookStreak', 'ReadingChallenge', 'BookishHabits', 'ReadMore'],
    true
  ),
  (
    'tbr',
    '📚 My To-Be-Read List',
    'Check out my TBR pile! {{total_books}} amazing books waiting to be devoured. Any recommendations? 📖',
    ARRAY['TBR', 'ToBeRead', 'BookRecommendations', 'BookList'],
    true
  ),
  (
    'reading_list',
    '📚 My Reading Library',
    '{{total_books}} books in my collection! Currently reading {{currently_reading}} and finished {{completed}} this year 🎉',
    ARRAY['BookCollection', 'ReadingStats', 'BookLibrary', 'BookLover'],
    true
  ),
  (
    'achievement',
    '🏆 Achievement Unlocked!',
    'Just {{achievement_description}}! {{details}} 🎉',
    ARRAY['BookAchievement', 'ReadingGoals', 'BookMilestone', 'ReadingWin'],
    true
  ),
  (
    'book_review',
    '📖 Book Review: {{book_title}}',
    'Just finished "{{book_title}}" by {{author}}. {{rating_stars}} {{review_text}}',
    ARRAY['BookReview', 'BookRecommendation', 'JustFinished', 'BookRating'],
    true
  );