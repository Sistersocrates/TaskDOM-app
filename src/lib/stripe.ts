import { STRIPE_PRODUCTS, StripeProduct } from '../stripe-config';

async function createCheckoutSession(productId: StripeProduct) {
  const product = STRIPE_PRODUCTS[productId];
  
  if (!product) {
    throw new Error(`Invalid product ID: ${productId}`);
  }

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      price_id: product.priceId,
      success_url: `${window.location.origin}/checkout/success`,
      cancel_url: `${window.location.origin}/checkout/cancel`,
      mode: product.mode,
      trial_period_days: product.trialPeriodDays
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create checkout session');
  }

  const { url } = await response.json();
  return url;
}

export async function redirectToCheckout(productId: StripeProduct) {
  try {
    const url = await createCheckoutSession(productId);
    window.location.href = url;
  } catch (error) {
    console.error('Error redirecting to checkout:', error);
    throw error;
  }
}

export async function getSubscriptionStatus() {
  try {
    const { data, error } = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/stripe_user_subscriptions`, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    }).then(res => res.json());

    if (error) throw error;
    
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return null;
  }
}