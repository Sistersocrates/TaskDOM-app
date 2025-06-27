import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Check, Loader2, X, Shield, BookOpen, Volume2, Users, BarChart, Clock, Calendar } from 'lucide-react';
import { STRIPE_PRODUCTS } from '../stripe-config';
import { redirectToCheckout, getSubscriptionStatus } from '../lib/stripe';
import { useUserStore } from '../store/userStore';

const PricingPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const { isAuthenticated } = useUserStore();

  useEffect(() => {
    const fetchSubscription = async () => {
      if (isAuthenticated) {
        setIsLoadingSubscription(true);
        try {
          const sub = await getSubscriptionStatus();
          setSubscription(sub);
        } catch (error) {
          console.error('Error fetching subscription:', error);
        } finally {
          setIsLoadingSubscription(false);
        }
      } else {
        setIsLoadingSubscription(false);
      }
    };

    fetchSubscription();
  }, [isAuthenticated]);

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      await redirectToCheckout('taskdom_subscription');
    } catch (error) {
      console.error('Error during checkout:', error);
      // You should show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  const isSubscribed = subscription?.subscription_status === 'active' || 
                       subscription?.subscription_status === 'trialing';

  const features = [
    {
      icon: <BookOpen className="h-5 w-5 text-accent" />,
      text: 'Unlimited reading tracking'
    },
    {
      icon: <Volume2 className="h-5 w-5 text-accent" />,
      text: 'Voice assistant with custom styles'
    },
    {
      icon: <BarChart className="h-5 w-5 text-accent" />,
      text: 'Advanced analytics'
    },
    {
      icon: <Users className="h-5 w-5 text-accent" />,
      text: 'Book club hosting'
    },
    {
      icon: <Shield className="h-5 w-5 text-accent" />,
      text: 'Priority support'
    },
    {
      icon: <Clock className="h-5 w-5 text-accent" />,
      text: 'Early access to new features'
    }
  ];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white sm:text-5xl sm:tracking-tight lg:text-6xl font-cinzel">
            Simple, transparent pricing
          </h1>
          <p className="mt-5 text-xl text-gray-400">
            Everything you need to enhance your reading experience
          </p>
        </div>

        <div className="mt-12">
          <Card className="overflow-hidden">
            <CardHeader className="px-6 py-12 text-center bg-gradient-to-r from-accent to-accent-hover">
              <h3 className="text-2xl font-semibold text-white">
                {STRIPE_PRODUCTS.taskdom_subscription.name}
              </h3>
              <div className="mt-4">
                <span className="text-5xl font-bold text-white">$9.99</span>
                <span className="text-xl font-medium text-accent-text">/month</span>
              </div>
              <div className="mt-2 inline-block bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                <Calendar className="inline-block h-4 w-4 mr-1" />
                14-day free trial
              </div>
              <p className="mt-4 text-accent-text">
                {STRIPE_PRODUCTS.taskdom_subscription.description}
              </p>
            </CardHeader>

            <CardBody className="px-6 pt-6 pb-8">
              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-6 w-6 text-success-500" />
                    </div>
                    <div className="ml-3 flex items-center">
                      {feature.icon}
                      <p className="ml-2 text-base text-gray-300">{feature.text}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {isLoadingSubscription ? (
                  <Button
                    disabled
                    fullWidth
                    size="lg"
                    className="flex items-center justify-center"
                  >
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </Button>
                ) : isSubscribed ? (
                  <div className="bg-success-900/20 border border-success-700/30 text-success-300 p-4 rounded-lg flex items-center justify-center">
                    <Check className="mr-2 h-5 w-5" />
                    You're already subscribed!
                  </div>
                ) : (
                  <Button
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    fullWidth
                    size="lg"
                    className="flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Start 14-Day Free Trial'
                    )}
                  </Button>
                )}
              </div>

              <p className="mt-4 text-sm text-center text-gray-500">
                No credit card required for trial. Cancel anytime.
              </p>
            </CardBody>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold text-white">
            Frequently Asked Questions
          </h2>
          <dl className="mt-8 space-y-6">
            <div>
              <dt className="text-lg font-medium text-white">
                How does the free trial work?
              </dt>
              <dd className="mt-2 text-base text-gray-400">
                You'll get full access to all premium features for 14 days. We'll send you a reminder before your trial ends, and you won't be charged until the trial period is over.
              </dd>
            </div>
            <div>
              <dt className="text-lg font-medium text-white">
                Can I cancel my subscription?
              </dt>
              <dd className="mt-2 text-base text-gray-400">
                Yes, you can cancel your subscription at any time. If you cancel during your trial period, you won't be charged at all.
              </dd>
            </div>
            <div>
              <dt className="text-lg font-medium text-white">
                What payment methods do you accept?
              </dt>
              <dd className="mt-2 text-base text-gray-400">
                We accept all major credit cards including Visa, Mastercard, and American Express.
              </dd>
            </div>
            <div>
              <dt className="text-lg font-medium text-white">
                What happens after the trial ends?
              </dt>
              <dd className="mt-2 text-base text-gray-400">
                After your 14-day trial ends, your subscription will automatically convert to a paid monthly subscription at $9.99/month unless you cancel.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </MainLayout>
  );
};

export default PricingPage;