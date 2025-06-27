/*
  # Fix Duplicate RLS Policies

  1. Changes
     - Add DROP POLICY IF EXISTS statements before CREATE POLICY statements
     - Ensures policies are only created once
     - Prevents errors when migrations are rerun
  
  2. Tables Affected
     - stripe_customers
     - stripe_subscriptions
     - stripe_orders
     - reading_progress
     - reading_sessions
     - reading_bookmarks
     - smut_streaks
     - daily_challenges
     - user_activities
     - unlocked_rewards
     - social_shares
     - share_templates
     - user_profiles
*/

-- Fix stripe_customers policies
DROP POLICY IF EXISTS "Users can view their own customer data" ON "public"."stripe_customers";
CREATE POLICY "Users can view their own customer data" ON "public"."stripe_customers" 
  FOR SELECT USING ((user_id = auth.uid()) AND (deleted_at IS NULL));

-- Fix stripe_subscriptions policies
DROP POLICY IF EXISTS "Users can view their own subscription data" ON "public"."stripe_subscriptions";
CREATE POLICY "Users can view their own subscription data" ON "public"."stripe_subscriptions" 
  FOR SELECT USING (((customer_id IN ( SELECT stripe_customers.customer_id
   FROM stripe_customers
  WHERE ((stripe_customers.user_id = auth.uid()) AND (stripe_customers.deleted_at IS NULL)))) AND (deleted_at IS NULL)));

-- Fix stripe_orders policies
DROP POLICY IF EXISTS "Users can view their own order data" ON "public"."stripe_orders";
CREATE POLICY "Users can view their own order data" ON "public"."stripe_orders" 
  FOR SELECT USING (((customer_id IN ( SELECT stripe_customers.customer_id
   FROM stripe_customers
  WHERE ((stripe_customers.user_id = auth.uid()) AND (stripe_customers.deleted_at IS NULL)))) AND (deleted_at IS NULL)));

-- Fix reading_progress policies
DROP POLICY IF EXISTS "Users can delete their own reading progress" ON "public"."reading_progress";
DROP POLICY IF EXISTS "Users can insert their own reading progress" ON "public"."reading_progress";
DROP POLICY IF EXISTS "Users can update their own reading progress" ON "public"."reading_progress";
DROP POLICY IF EXISTS "Users can view their own reading progress" ON "public"."reading_progress";

CREATE POLICY "Users can delete their own reading progress" ON "public"."reading_progress" 
  FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own reading progress" ON "public"."reading_progress" 
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own reading progress" ON "public"."reading_progress" 
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view their own reading progress" ON "public"."reading_progress" 
  FOR SELECT USING (user_id = auth.uid());

-- Fix reading_sessions policies
DROP POLICY IF EXISTS "Users can insert their own reading sessions" ON "public"."reading_sessions";
DROP POLICY IF EXISTS "Users can update their own reading sessions" ON "public"."reading_sessions";
DROP POLICY IF EXISTS "Users can view their own reading sessions" ON "public"."reading_sessions";

CREATE POLICY "Users can insert their own reading sessions" ON "public"."reading_sessions" 
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own reading sessions" ON "public"."reading_sessions" 
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view their own reading sessions" ON "public"."reading_sessions" 
  FOR SELECT USING (user_id = auth.uid());

-- Fix reading_bookmarks policies
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON "public"."reading_bookmarks";
DROP POLICY IF EXISTS "Users can insert their own bookmarks" ON "public"."reading_bookmarks";
DROP POLICY IF EXISTS "Users can update their own bookmarks" ON "public"."reading_bookmarks";
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON "public"."reading_bookmarks";

CREATE POLICY "Users can delete their own bookmarks" ON "public"."reading_bookmarks" 
  FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own bookmarks" ON "public"."reading_bookmarks" 
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own bookmarks" ON "public"."reading_bookmarks" 
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view their own bookmarks" ON "public"."reading_bookmarks" 
  FOR SELECT USING (user_id = auth.uid());

-- Fix smut_streaks policies
DROP POLICY IF EXISTS "Users can insert their own streaks" ON "public"."smut_streaks";
DROP POLICY IF EXISTS "Users can update their own streaks" ON "public"."smut_streaks";
DROP POLICY IF EXISTS "Users can view their own streaks" ON "public"."smut_streaks";

CREATE POLICY "Users can insert their own streaks" ON "public"."smut_streaks" 
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own streaks" ON "public"."smut_streaks" 
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view their own streaks" ON "public"."smut_streaks" 
  FOR SELECT USING (user_id = auth.uid());

-- Fix daily_challenges policies
DROP POLICY IF EXISTS "Anyone can view active challenges" ON "public"."daily_challenges";
CREATE POLICY "Anyone can view active challenges" ON "public"."daily_challenges" 
  FOR SELECT USING (is_active = true);

-- Fix user_activities policies
DROP POLICY IF EXISTS "Users can insert their own activities" ON "public"."user_activities";
DROP POLICY IF EXISTS "Users can view their own activities" ON "public"."user_activities";

CREATE POLICY "Users can insert their own activities" ON "public"."user_activities" 
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view their own activities" ON "public"."user_activities" 
  FOR SELECT USING (user_id = auth.uid());

-- Fix unlocked_rewards policies
DROP POLICY IF EXISTS "Users can insert their own rewards" ON "public"."unlocked_rewards";
DROP POLICY IF EXISTS "Users can update their own rewards" ON "public"."unlocked_rewards";
DROP POLICY IF EXISTS "Users can view their own rewards" ON "public"."unlocked_rewards";

CREATE POLICY "Users can insert their own rewards" ON "public"."unlocked_rewards" 
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own rewards" ON "public"."unlocked_rewards" 
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view their own rewards" ON "public"."unlocked_rewards" 
  FOR SELECT USING (user_id = auth.uid());

-- Fix social_shares policies
DROP POLICY IF EXISTS "Users can insert their own shares" ON "public"."social_shares";
DROP POLICY IF EXISTS "Users can view their own shares" ON "public"."social_shares";

CREATE POLICY "Users can insert their own shares" ON "public"."social_shares" 
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view their own shares" ON "public"."social_shares" 
  FOR SELECT USING (user_id = auth.uid());

-- Fix share_templates policies
DROP POLICY IF EXISTS "Users can delete their own templates" ON "public"."share_templates";
DROP POLICY IF EXISTS "Users can insert their own templates" ON "public"."share_templates";
DROP POLICY IF EXISTS "Users can update their own templates" ON "public"."share_templates";
DROP POLICY IF EXISTS "Users can view their own templates and default templates" ON "public"."share_templates";

CREATE POLICY "Users can delete their own templates" ON "public"."share_templates" 
  FOR DELETE USING ((user_id = auth.uid()) AND (is_default = false));
CREATE POLICY "Users can insert their own templates" ON "public"."share_templates" 
  FOR INSERT WITH CHECK ((user_id = auth.uid()) AND (is_default = false));
CREATE POLICY "Users can update their own templates" ON "public"."share_templates" 
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK ((user_id = auth.uid()) AND (is_default = false));
CREATE POLICY "Users can view their own templates and default templates" ON "public"."share_templates" 
  FOR SELECT USING ((user_id = auth.uid()) OR (is_default = true));

-- Fix user_profiles policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON "public"."user_profiles";
DROP POLICY IF EXISTS "Users can update their own profile" ON "public"."user_profiles";
DROP POLICY IF EXISTS "Users can view their own profile" ON "public"."user_profiles";

CREATE POLICY "Users can insert their own profile" ON "public"."user_profiles" 
  FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON "public"."user_profiles" 
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Users can view their own profile" ON "public"."user_profiles" 
  FOR SELECT USING (id = auth.uid());