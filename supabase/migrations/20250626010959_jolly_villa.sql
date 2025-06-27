-- First, drop existing tables if they exist
DROP TABLE IF EXISTS public.stripe_orders CASCADE;
DROP TABLE IF EXISTS public.stripe_subscriptions CASCADE;
DROP TABLE IF EXISTS public.stripe_customers CASCADE;
DROP VIEW IF EXISTS public.stripe_user_orders CASCADE;
DROP VIEW IF EXISTS public.stripe_user_subscriptions CASCADE;

-- Create stripe_customers table
CREATE TABLE public.stripe_customers (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  customer_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Create unique index on user_id
CREATE UNIQUE INDEX stripe_customers_user_id_key ON public.stripe_customers(user_id);

-- Enable RLS on stripe_customers
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own customer data
CREATE POLICY "Users can view their own customer data" 
  ON public.stripe_customers 
  FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid() AND deleted_at IS NULL);

-- Create stripe_subscriptions table
CREATE TABLE public.stripe_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES public.stripe_customers(customer_id),
  subscription_id TEXT,
  price_id TEXT,
  current_period_start BIGINT,
  current_period_end BIGINT,
  cancel_at_period_end BOOLEAN DEFAULT false,
  payment_method_brand TEXT,
  payment_method_last4 TEXT,
  status public.stripe_subscription_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Create unique index on customer_id
CREATE UNIQUE INDEX stripe_subscriptions_customer_id_key ON public.stripe_subscriptions(customer_id);

-- Enable RLS on stripe_subscriptions
ALTER TABLE public.stripe_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own subscription data
CREATE POLICY "Users can view their own subscription data" 
  ON public.stripe_subscriptions 
  FOR SELECT 
  TO authenticated 
  USING (
    customer_id IN (
      SELECT customer_id FROM public.stripe_customers 
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    ) 
    AND deleted_at IS NULL
  );

-- Create stripe_orders table
CREATE TABLE public.stripe_orders (
  id BIGSERIAL PRIMARY KEY,
  checkout_session_id TEXT NOT NULL,
  payment_intent_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  amount_subtotal BIGINT NOT NULL,
  amount_total BIGINT NOT NULL,
  currency TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  status public.stripe_order_status DEFAULT 'pending'::public.stripe_order_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Enable RLS on stripe_orders
ALTER TABLE public.stripe_orders ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own order data
CREATE POLICY "Users can view their own order data" 
  ON public.stripe_orders 
  FOR SELECT 
  TO authenticated 
  USING (
    customer_id IN (
      SELECT customer_id FROM public.stripe_customers 
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    ) 
    AND deleted_at IS NULL
  );

-- Create view for user subscriptions with security invoker
CREATE OR REPLACE VIEW public.stripe_user_subscriptions WITH (security_invoker = true) AS
SELECT 
  c.customer_id,
  s.subscription_id,
  s.status as subscription_status,
  s.price_id,
  s.current_period_start,
  s.current_period_end,
  s.cancel_at_period_end,
  s.payment_method_brand,
  s.payment_method_last4
FROM 
  public.stripe_customers c
JOIN 
  public.stripe_subscriptions s ON c.customer_id = s.customer_id
WHERE 
  c.deleted_at IS NULL AND s.deleted_at IS NULL;

-- Create view for user orders with security invoker
CREATE OR REPLACE VIEW public.stripe_user_orders WITH (security_invoker = true) AS
SELECT 
  c.customer_id,
  o.id as order_id,
  o.checkout_session_id,
  o.payment_intent_id,
  o.amount_subtotal,
  o.amount_total,
  o.currency,
  o.payment_status,
  o.status as order_status,
  o.created_at as order_date
FROM 
  public.stripe_customers c
JOIN 
  public.stripe_orders o ON c.customer_id = o.customer_id
WHERE 
  c.deleted_at IS NULL AND o.deleted_at IS NULL;

-- Grant permissions to authenticated users
GRANT SELECT ON public.stripe_user_subscriptions TO authenticated;
GRANT SELECT ON public.stripe_user_orders TO authenticated;