/*
  # Create Ensure Policy Function

  1. New Functions
     - ensure_policy: A utility function to safely create policies without errors
     - This function checks if a policy exists before creating it
  
  2. Purpose
     - Prevents duplicate policy errors in future migrations
     - Makes policy creation idempotent
     - Provides a reusable function for all future policy creations
*/

-- Create a function to safely create policies
CREATE OR REPLACE FUNCTION ensure_policy(
  policy_name TEXT,
  table_name TEXT,
  schema_name TEXT DEFAULT 'public',
  operation TEXT DEFAULT 'ALL',
  command TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  policy_exists BOOLEAN;
BEGIN
  -- Check if the policy already exists
  SELECT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = schema_name 
      AND tablename = table_name 
      AND policyname = policy_name
  ) INTO policy_exists;
  
  -- If policy doesn't exist, create it
  IF NOT policy_exists AND command IS NOT NULL THEN
    EXECUTE command;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION ensure_policy IS 'Safely creates a policy if it does not already exist';

-- Example usage:
-- SELECT ensure_policy(
--   'Users can view their own data',
--   'my_table',
--   'public',
--   'SELECT',
--   'CREATE POLICY "Users can view their own data" ON public.my_table FOR SELECT USING (user_id = auth.uid())'
-- );