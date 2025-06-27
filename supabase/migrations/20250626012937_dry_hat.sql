/*
  # Update Reading Progress Functions

  1. New Functions
    - Improved update_reading_percentage function with better error handling
    - Added upsert_reading_progress function for reliable progress updates

  2. Security
    - Created as SECURITY DEFINER to ensure it works regardless of RLS
    - Added proper error handling to prevent transaction failures

  3. Changes
    - Dropped and recreated the trigger for more reliable execution
    - Added proper error handling in progress updates
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_reading_percentage ON public.reading_progress;

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
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE NOTICE 'Error updating reading percentage: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update reading percentage
CREATE TRIGGER trigger_update_reading_percentage
  BEFORE INSERT OR UPDATE ON public.reading_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_reading_percentage();

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
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error upserting reading progress: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;