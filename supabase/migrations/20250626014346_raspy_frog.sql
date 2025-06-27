/*
  # Create Policy Helper Functions

  1. New Functions
     - create_select_policy: Creates a SELECT policy if it doesn't exist
     - create_insert_policy: Creates an INSERT policy if it doesn't exist
     - create_update_policy: Creates an UPDATE policy if it doesn't exist
     - create_delete_policy: Creates a DELETE policy if it doesn't exist
  
  2. Purpose
     - Simplifies policy creation in future migrations
     - Ensures policies are created idempotently
     - Standardizes policy creation patterns
*/

-- Helper function to create SELECT policies
CREATE OR REPLACE FUNCTION create_select_policy(
  policy_name TEXT,
  table_name TEXT,
  using_expression TEXT,
  schema_name TEXT DEFAULT 'public'
) RETURNS VOID AS $$
BEGIN
  PERFORM ensure_policy(
    policy_name,
    table_name,
    schema_name,
    'SELECT',
    format('CREATE POLICY %L ON %I.%I FOR SELECT USING (%s)',
           policy_name, schema_name, table_name, using_expression)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to create INSERT policies
CREATE OR REPLACE FUNCTION create_insert_policy(
  policy_name TEXT,
  table_name TEXT,
  check_expression TEXT,
  schema_name TEXT DEFAULT 'public'
) RETURNS VOID AS $$
BEGIN
  PERFORM ensure_policy(
    policy_name,
    table_name,
    schema_name,
    'INSERT',
    format('CREATE POLICY %L ON %I.%I FOR INSERT WITH CHECK (%s)',
           policy_name, schema_name, table_name, check_expression)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to create UPDATE policies
CREATE OR REPLACE FUNCTION create_update_policy(
  policy_name TEXT,
  table_name TEXT,
  using_expression TEXT,
  check_expression TEXT,
  schema_name TEXT DEFAULT 'public'
) RETURNS VOID AS $$
BEGIN
  PERFORM ensure_policy(
    policy_name,
    table_name,
    schema_name,
    'UPDATE',
    format('CREATE POLICY %L ON %I.%I FOR UPDATE USING (%s) WITH CHECK (%s)',
           policy_name, schema_name, table_name, using_expression, check_expression)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to create DELETE policies
CREATE OR REPLACE FUNCTION create_delete_policy(
  policy_name TEXT,
  table_name TEXT,
  using_expression TEXT,
  schema_name TEXT DEFAULT 'public'
) RETURNS VOID AS $$
BEGIN
  PERFORM ensure_policy(
    policy_name,
    table_name,
    schema_name,
    'DELETE',
    format('CREATE POLICY %L ON %I.%I FOR DELETE USING (%s)',
           policy_name, schema_name, table_name, using_expression)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_select_policy IS 'Creates a SELECT policy if it does not already exist';
COMMENT ON FUNCTION create_insert_policy IS 'Creates an INSERT policy if it does not already exist';
COMMENT ON FUNCTION create_update_policy IS 'Creates an UPDATE policy if it does not already exist';
COMMENT ON FUNCTION create_delete_policy IS 'Creates a DELETE policy if it does not already exist';