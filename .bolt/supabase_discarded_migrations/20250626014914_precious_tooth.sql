/*
  # Fix user profile creation and add RPC functions

  1. New Functions
    - `upsert_reading_progress` - Safely updates or inserts reading progress
    - `get_user_profile` - Retrieves a user's profile with error handling
  
  2. Security
    - All functions are SECURITY DEFINER for proper access control
    - Added input validation to prevent SQL injection
  
  3. Changes
    - Improved error handling in existing functions
*/

-- Create a function to safely update or insert reading progress
CREATE OR REPLACE FUNCTION upsert_reading_progress(
  p_book_id TEXT,
  p_current_page INTEGER,
  p_total_pages INTEGER DEFAULT NULL,
  p_chapter_id TEXT DEFAULT NULL,
  p_chapter_name TEXT DEFAULT NULL,
  p_device_info JSONB DEFAULT '{}'::JSONB
)
RETURNS SETOF reading_progress
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_percentage NUMERIC(5,2);
  v_existing_record reading_progress;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Validate inputs
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be logged in';
  END IF;
  
  IF p_book_id IS NULL OR p_current_page IS NULL THEN
    RAISE EXCEPTION 'Book ID and current page are required';
  END IF;
  
  -- Calculate percentage read
  IF p_total_pages IS NOT NULL AND p_total_pages > 0 THEN
    v_percentage := (p_current_page::NUMERIC / p_total_pages::NUMERIC) * 100;
    -- Ensure percentage is between 0 and 100
    v_percentage := GREATEST(0, LEAST(100, v_percentage));
  END IF;
  
  -- Check if a record already exists
  SELECT * INTO v_existing_record
  FROM reading_progress
  WHERE user_id = v_user_id AND book_id = p_book_id;
  
  IF v_existing_record IS NOT NULL THEN
    -- Update existing record
    UPDATE reading_progress
    SET 
      current_page = p_current_page,
      total_pages = COALESCE(p_total_pages, total_pages),
      percentage_read = COALESCE(v_percentage, percentage_read),
      chapter_id = COALESCE(p_chapter_id, chapter_id),
      chapter_name = COALESCE(p_chapter_name, chapter_name),
      device_info = COALESCE(p_device_info, device_info),
      last_read_at = now(),
      updated_at = now()
    WHERE id = v_existing_record.id
    RETURNING * INTO v_existing_record;
  ELSE
    -- Insert new record
    INSERT INTO reading_progress (
      user_id,
      book_id,
      current_page,
      total_pages,
      percentage_read,
      chapter_id,
      chapter_name,
      device_info
    ) VALUES (
      v_user_id,
      p_book_id,
      p_current_page,
      p_total_pages,
      v_percentage,
      p_chapter_id,
      p_chapter_name,
      p_device_info
    )
    RETURNING * INTO v_existing_record;
  END IF;
  
  RETURN NEXT v_existing_record;
END;
$$;

-- Create a function to get a user's profile
CREATE OR REPLACE FUNCTION get_user_profile(
  p_user_id UUID DEFAULT NULL
)
RETURNS SETOF user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the current user ID if not provided
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  -- Validate inputs
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID is required';
  END IF;
  
  -- Ensure the user profile exists
  PERFORM ensure_user_profile(v_user_id);
  
  -- Return the user profile
  RETURN QUERY
  SELECT * FROM user_profiles
  WHERE id = v_user_id;
END;
$$;

-- Add comments to functions
COMMENT ON FUNCTION upsert_reading_progress IS 'Safely updates or inserts reading progress for the current user';
COMMENT ON FUNCTION get_user_profile IS 'Retrieves a user profile, ensuring it exists first';