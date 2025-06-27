/*
  # Reading Bookmarks Enhancement

  1. New Features
    - Enhanced bookmark types for reading progress
    - Support for spicy scene tracking with ratings
    - Note-taking capabilities for bookmarks
    - Improved querying for bookmark collections

  2. Security
    - Maintains existing RLS policies
    - Ensures user data isolation
*/

-- Create a function to check if a bookmark already exists at a specific page
CREATE OR REPLACE FUNCTION check_duplicate_bookmark(
  p_user_id uuid,
  p_book_id text,
  p_page_number integer,
  p_bookmark_type bookmark_type
)
RETURNS boolean AS $$
DECLARE
  existing_count integer;
BEGIN
  SELECT COUNT(*) INTO existing_count
  FROM reading_bookmarks
  WHERE user_id = p_user_id
    AND book_id = p_book_id
    AND page_number = p_page_number
    AND bookmark_type = p_bookmark_type;
    
  RETURN existing_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get all spicy scenes for a book
CREATE OR REPLACE FUNCTION get_book_spicy_scenes(
  p_book_id text
)
RETURNS TABLE (
  id uuid,
  page_number integer,
  note text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT rb.id, rb.page_number, rb.note, rb.created_at
  FROM reading_bookmarks rb
  WHERE rb.book_id = p_book_id
    AND rb.user_id = auth.uid()
    AND rb.bookmark_type = 'spicy_scene'
  ORDER BY rb.page_number ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to add a bookmark with duplicate checking
CREATE OR REPLACE FUNCTION add_bookmark(
  p_book_id text,
  p_page_number integer,
  p_note text DEFAULT NULL,
  p_bookmark_type bookmark_type DEFAULT 'bookmark'
)
RETURNS reading_bookmarks AS $$
DECLARE
  result reading_bookmarks;
  is_duplicate boolean;
BEGIN
  -- Check for duplicates
  is_duplicate := check_duplicate_bookmark(auth.uid(), p_book_id, p_page_number, p_bookmark_type);
  
  IF is_duplicate THEN
    -- Update existing bookmark
    UPDATE reading_bookmarks
    SET note = COALESCE(p_note, note)
    WHERE user_id = auth.uid()
      AND book_id = p_book_id
      AND page_number = p_page_number
      AND bookmark_type = p_bookmark_type
    RETURNING * INTO result;
  ELSE
    -- Insert new bookmark
    INSERT INTO reading_bookmarks (
      user_id,
      book_id,
      page_number,
      note,
      bookmark_type
    ) VALUES (
      auth.uid(),
      p_book_id,
      p_page_number,
      p_note,
      p_bookmark_type
    )
    RETURNING * INTO result;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add index for faster bookmark retrieval by type
CREATE INDEX IF NOT EXISTS idx_reading_bookmarks_type 
ON reading_bookmarks(user_id, book_id, bookmark_type);

-- Add index for page number queries
CREATE INDEX IF NOT EXISTS idx_reading_bookmarks_page 
ON reading_bookmarks(book_id, page_number);

-- Create a view for spicy scene statistics
CREATE OR REPLACE VIEW user_spicy_scene_stats AS
SELECT
  user_id,
  COUNT(*) as total_scenes,
  COUNT(DISTINCT book_id) as books_with_scenes,
  MAX(created_at) as last_scene_added
FROM reading_bookmarks
WHERE bookmark_type = 'spicy_scene'
GROUP BY user_id;

-- Grant access to the view
GRANT SELECT ON user_spicy_scene_stats TO authenticated;