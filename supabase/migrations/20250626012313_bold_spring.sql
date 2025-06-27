/*
  # Update Reading Progress Function

  1. Functions
    - `update_reading_percentage` - Calculates percentage read based on current and total pages
    - `upsert_reading_progress` - Handles creating or updating reading progress with proper percentage calculation
*/

-- Create function to update reading percentage
CREATE OR REPLACE FUNCTION public.update_reading_percentage()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate percentage read if both current_page and total_pages are provided
  IF NEW.current_page IS NOT NULL AND NEW.total_pages IS NOT NULL AND NEW.total_pages > 0 THEN
    NEW.percentage_read := (NEW.current_page::numeric / NEW.total_pages::numeric) * 100;
  END IF;
  
  -- Update the last_read_at timestamp
  NEW.last_read_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to upsert reading progress
CREATE OR REPLACE FUNCTION public.upsert_reading_progress(
  p_book_id TEXT,
  p_current_page INTEGER,
  p_total_pages INTEGER DEFAULT NULL,
  p_chapter_id TEXT DEFAULT NULL,
  p_chapter_name TEXT DEFAULT NULL,
  p_device_info JSONB DEFAULT '{}'::JSONB
)
RETURNS public.reading_progress AS $$
DECLARE
  v_user_id UUID;
  v_result public.reading_progress;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Check if a record already exists
  SELECT * INTO v_result
  FROM public.reading_progress
  WHERE user_id = v_user_id AND book_id = p_book_id;
  
  IF v_result.id IS NULL THEN
    -- Insert new record
    INSERT INTO public.reading_progress (
      user_id,
      book_id,
      current_page,
      total_pages,
      chapter_id,
      chapter_name,
      device_info,
      last_read_at
    ) VALUES (
      v_user_id,
      p_book_id,
      p_current_page,
      p_total_pages,
      p_chapter_id,
      p_chapter_name,
      p_device_info,
      NOW()
    )
    RETURNING * INTO v_result;
  ELSE
    -- Update existing record
    UPDATE public.reading_progress
    SET
      current_page = p_current_page,
      total_pages = COALESCE(p_total_pages, total_pages),
      chapter_id = COALESCE(p_chapter_id, chapter_id),
      chapter_name = COALESCE(p_chapter_name, chapter_name),
      device_info = COALESCE(p_device_info, device_info),
      last_read_at = NOW(),
      updated_at = NOW()
    WHERE id = v_result.id
    RETURNING * INTO v_result;
  END IF;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;