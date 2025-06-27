/*
  # Fix View Security Syntax

  1. Changes
     - Corrects the syntax for setting security context on views
     - Recreates the stripe_user_subscriptions view with proper SECURITY DEFINER syntax
     - Recreates the stripe_user_orders view with proper SECURITY DEFINER syntax

  2. Security
     - Ensures views run with definer privileges for proper access control
*/

-- Drop existing views if they exist
DROP VIEW IF EXISTS public.stripe_user_subscriptions;
DROP VIEW IF EXISTS public.stripe_user_orders;

-- Recreate stripe_user_subscriptions view with correct security syntax
CREATE OR REPLACE VIEW public.stripe_user_subscriptions 
SECURITY DEFINER
AS 
SELECT 
  sc.customer_id,
  ss.subscription_id,
  ss.status as subscription_status,
  ss.price_id,
  ss.current_period_start,
  ss.current_period_end,
  ss.cancel_at_period_end,
  ss.payment_method_brand,
  ss.payment_method_last4
FROM 
  public.stripe_customers sc
JOIN 
  public.stripe_subscriptions ss ON sc.customer_id = ss.customer_id
WHERE 
  sc.deleted_at IS NULL
  AND ss.deleted_at IS NULL;

-- Recreate stripe_user_orders view with correct security syntax
CREATE OR REPLACE VIEW public.stripe_user_orders 
SECURITY DEFINER
AS 
SELECT 
  sc.customer_id,
  so.id as order_id,
  so.checkout_session_id,
  so.payment_intent_id,
  so.amount_subtotal,
  so.amount_total,
  so.currency,
  so.payment_status,
  so.status as order_status,
  so.created_at as order_date
FROM 
  public.stripe_customers sc
JOIN 
  public.stripe_orders so ON sc.customer_id = so.customer_id
WHERE 
  sc.deleted_at IS NULL
  AND so.deleted_at IS NULL;

-- Grant appropriate permissions
GRANT SELECT ON public.stripe_user_subscriptions TO authenticated;
GRANT SELECT ON public.stripe_user_orders TO authenticated;