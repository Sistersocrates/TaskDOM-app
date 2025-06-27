export const STRIPE_PRODUCTS = {
  taskdom_subscription: {
    priceId: 'price_1RWi0RP9yQWszhcwl3D0EhBL',
    name: 'TaskDOM Subscription',
    description: 'Monthly subscription with 14-day free trial',
    mode: 'subscription' as const,
    trialPeriodDays: 14
  }
} as const;

export type StripeProduct = keyof typeof STRIPE_PRODUCTS;