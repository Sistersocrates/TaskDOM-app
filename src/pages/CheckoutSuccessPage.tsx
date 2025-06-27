import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { Card, CardBody } from '../components/ui/Card';
import { CheckCircle, Loader2, Calendar } from 'lucide-react';
import Button from '../components/ui/Button';
import { getSubscriptionStatus } from '../lib/stripe';
import { format, addDays } from 'date-fns';

const CheckoutSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        setIsLoading(true);
        const sub = await getSubscriptionStatus();
        setSubscription(sub);
      } catch (error) {
        console.error('Error fetching subscription status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, []);

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    return format(new Date(timestamp * 1000), 'MMMM d, yyyy');
  };

  const isTrialing = subscription?.subscription_status === 'trialing';
  const trialEndDate = subscription?.current_period_end 
    ? formatDate(subscription.current_period_end)
    : format(addDays(new Date(), 14), 'MMMM d, yyyy');

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardBody className="text-center p-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-16 w-16 text-accent animate-spin mb-4" />
                <p className="text-lg text-white">Verifying your subscription...</p>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-6">
                  <CheckCircle className="h-16 w-16 text-success-500" />
                </div>
                
                <h1 className="text-2xl font-bold mb-4 text-white">
                  {isTrialing ? 'Your Free Trial Has Started!' : 'Payment Successful!'}
                </h1>
                <p className="text-gray-300 mb-6">
                  {isTrialing 
                    ? `Your 14-day free trial has been activated. Enjoy full access to all premium features until ${trialEndDate}.`
                    : 'Thank you for subscribing to TaskDOM. Your account has been upgraded and you now have access to all premium features.'}
                </p>
                
                {isTrialing && (
                  <div className="bg-accent/20 border border-accent/30 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-accent-text mb-2 flex items-center justify-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Trial Period Details
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Your free trial will end on <span className="font-semibold">{trialEndDate}</span>. 
                      You won't be charged until after this date, and you can cancel anytime before then.
                    </p>
                  </div>
                )}
                
                <div className="space-y-4">
                  <Button
                    onClick={() => navigate('/settings')}
                    fullWidth
                  >
                    View Subscription Details
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                    fullWidth
                  >
                    Return to Home
                  </Button>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CheckoutSuccessPage;