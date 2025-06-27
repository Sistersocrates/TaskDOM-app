/*
  # Fix user_spicy_scene_stats view security setting

  1. Changes
     - Drop and recreate the user_spicy_scene_stats view with SECURITY INVOKER
     - This ensures the view enforces the permissions of the querying user
     - Maintains the same query logic and functionality

  2. Security
     - Improves security by enforcing row-level security policies of the querying user
     - Prevents potential data leakage across user boundaries
*/

-- Drop the existing view
DROP VIEW IF EXISTS public.user_spicy_scene_stats;

-- Recreate the view with SECURITY INVOKER
CREATE VIEW public.user_spicy_scene_stats AS
SELECT 
  user_id,
  COUNT(*) AS total_scenes,
  COUNT(DISTINCT book_id) AS books_with_scenes,
  MAX(created_at) AS last_scene_added
FROM 
  public.reading_bookmarks
WHERE 
  bookmark_type = 'spicy_scene'
GROUP BY 
  user_id;

-- Grant appropriate permissions
GRANT SELECT ON public.user_spicy_scene_stats TO authenticated;