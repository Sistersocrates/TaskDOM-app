/*
  # Reading Progress Sync System

  1. New Tables
    - `reading_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `book_id` (text, book identifier)
      - `current_page` (integer)
      - `total_pages` (integer)
      - `percentage_read` (decimal)
      - `chapter_id` (text, optional)
      - `chapter_name` (text, optional)
      - `reading_session_id` (uuid, optional)
      - `device_info` (jsonb, device/browser info)
      - `last_read_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `reading_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `book_id` (text)
      - `start_time` (timestamp)
      - `end_time` (timestamp, nullable)
      - `pages_read` (integer)
      - `minutes_read` (integer)
      - `device_info` (jsonb)
      - `created_at` (timestamp)

    - `reading_bookmarks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `book_id` (text)
      - `page_number` (integer)
      - `note` (text, optional)
      - `bookmark_type` (enum: 'bookmark', 'highlight', 'note', 'spicy_scene')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add indexes for performance

  3. Functions
    - Automatic progress calculation
    - Conflict resolution for concurrent updates
*/

-- Create reading progress table
CREATE TABLE IF NOT EXISTS reading_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  book_id text NOT NULL,
  current_page integer DEFAULT 0,
  total_pages integer DEFAULT 0,
  percentage_read decimal(5,2) DEFAULT 0.00,
  chapter_id text,
  chapter_name text,
  reading_session_id uuid,
  device_info jsonb DEFAULT '{}',
  last_read_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Create reading sessions table
CREATE TABLE IF NOT EXISTS reading_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  book_id text NOT NULL,
  start_time timestamptz DEFAULT now(),
  end_time timestamptz,
  pages_read integer DEFAULT 0,
  minutes_read integer DEFAULT 0,
  device_info jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create bookmark types enum
CREATE TYPE bookmark_type AS ENUM ('bookmark', 'highlight', 'note', 'spicy_scene');

-- Create reading bookmarks table
CREATE TABLE IF NOT EXISTS reading_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  book_id text NOT NULL,
  page_number integer NOT NULL,
  note text,
  bookmark_type bookmark_type DEFAULT 'bookmark',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reading_progress
CREATE POLICY "Users can view their own reading progress"
  ON reading_progress
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own reading progress"
  ON reading_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reading progress"
  ON reading_progress
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own reading progress"
  ON reading_progress
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for reading_sessions
CREATE POLICY "Users can view their own reading sessions"
  ON reading_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own reading sessions"
  ON reading_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reading sessions"
  ON reading_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for reading_bookmarks
CREATE POLICY "Users can view their own bookmarks"
  ON reading_bookmarks
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own bookmarks"
  ON reading_bookmarks
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own bookmarks"
  ON reading_bookmarks
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own bookmarks"
  ON reading_bookmarks
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_book ON reading_progress(user_id, book_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_last_read ON reading_progress(last_read_at);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_book ON reading_sessions(user_id, book_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_start_time ON reading_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_reading_bookmarks_user_book ON reading_bookmarks(user_id, book_id);

-- Function to automatically update percentage_read
CREATE OR REPLACE FUNCTION update_reading_percentage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_pages > 0 THEN
    NEW.percentage_read = ROUND((NEW.current_page::decimal / NEW.total_pages::decimal) * 100, 2);
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate percentage
CREATE TRIGGER trigger_update_reading_percentage
  BEFORE INSERT OR UPDATE ON reading_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_reading_percentage();

-- Function to handle progress conflicts (last write wins with timestamp check)
CREATE OR REPLACE FUNCTION upsert_reading_progress(
  p_book_id text,
  p_current_page integer,
  p_total_pages integer DEFAULT NULL,
  p_chapter_id text DEFAULT NULL,
  p_chapter_name text DEFAULT NULL,
  p_device_info jsonb DEFAULT '{}'
)
RETURNS reading_progress AS $$
DECLARE
  result reading_progress;
  current_user_id uuid := auth.uid();
BEGIN
  -- Insert or update reading progress
  INSERT INTO reading_progress (
    user_id,
    book_id,
    current_page,
    total_pages,
    chapter_id,
    chapter_name,
    device_info,
    last_read_at
  ) VALUES (
    current_user_id,
    p_book_id,
    p_current_page,
    COALESCE(p_total_pages, (SELECT total_pages FROM reading_progress WHERE user_id = current_user_id AND book_id = p_book_id)),
    p_chapter_id,
    p_chapter_name,
    p_device_info,
    now()
  )
  ON CONFLICT (user_id, book_id)
  DO UPDATE SET
    current_page = GREATEST(reading_progress.current_page, p_current_page),
    total_pages = COALESCE(p_total_pages, reading_progress.total_pages),
    chapter_id = COALESCE(p_chapter_id, reading_progress.chapter_id),
    chapter_name = COALESCE(p_chapter_name, reading_progress.chapter_name),
    device_info = p_device_info,
    last_read_at = now()
  WHERE reading_progress.last_read_at <= now() - INTERVAL '5 seconds'
  RETURNING * INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;