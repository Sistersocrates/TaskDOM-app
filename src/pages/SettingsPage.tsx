import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Bell, Shield, Volume2, Eye, Moon, CreditCard, Calendar, Clock, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { getSubscriptionStatus } from '../lib/stripe';
import { format } from 'date-fns';

const SettingsPage: React.FC = () => {
  const { user, updateSettings } = useUserStore();
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setIsLoadingSubscription(true);
        const sub = await getSubscriptionStatus();
        setSubscription(sub);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setIsLoadingSubscription(false);
      }
    };

    fetchSubscription();
  }, []);

  if (!user) return null;

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    return format(new Date(timestamp * 1000), 'MMMM d, yyyy');
  };

  const getSubscriptionStatusDisplay = () => {
    if (isLoadingSubscription) {
      return (
        <div className="flex items-center text-gray-400">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Loading...
        </div>
      );
    }

    if (!subscription) {
      return (
        <div className="flex items-center text-gray-400">
          <AlertCircle className="h-4 w-4 mr-2" />
          No active subscription
        </div>
      );
    }

    switch (subscription.subscription_status) {
      case 'active':
        return (
          <div className="flex items-center text-success-400">
            <CheckCircle className="h-4 w-4 mr-2" />
            Active
          </div>
        );
      case 'canceled':
        return (
          <div className="flex items-center text-error-400">
            <AlertCircle className="h-4 w-4 mr-2" />
            Canceled
          </div>
        );
      case 'past_due':
        return (
          <div className="flex items-center text-warning-400">
            <AlertCircle className="h-4 w-4 mr-2" />
            Past Due
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-400">
            {subscription.subscription_status || 'Unknown'}
          </div>
        );
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>

        {/* Subscription Information */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold flex items-center text-white">
              <CreditCard className="mr-2" />
              Subscription
            </h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {isLoadingSubscription ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            ) : subscription?.subscription_status === 'active' ? (
              <>
                <div className="bg-success-900/20 border border-success-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-success-300">Active Subscription</h3>
                    {getSubscriptionStatusDisplay()}
                  </div>
                  <p className="text-gray-300 text-sm">
                    You have full access to all premium features.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center text-gray-400 mb-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">Current Period</span>
                    </div>
                    <p className="text-white">
                      {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                    </p>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center text-gray-400 mb-1">
                      <CreditCard className="h-4 w-4 mr-2" />
                      <span className="text-sm">Payment Method</span>
                    </div>
                    <p className="text-white">
                      {subscription.payment_method_brand ? (
                        <>
                          {subscription.payment_method_brand.charAt(0).toUpperCase() + subscription.payment_method_brand.slice(1)} •••• {subscription.payment_method_last4}
                        </>
                      ) : (
                        'Not available'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" className="text-error-400 border-error-400 hover:bg-error-900/20">
                    Cancel Subscription
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-gray-300">
                    You don't have an active subscription. Upgrade to get access to all premium features.
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => navigate('/pricing')}>
                    View Plans
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Mode Preferences */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold flex items-center text-white">
              <Eye className="mr-2" />
              Mode Preferences
            </h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="flex items-center justify-between">
                <span className="text-white">Safe for Work Mode</span>
                <input
                  type="checkbox"
                  checked={user.settings.mode === 'sfw'}
                  onChange={(e) => updateSettings({ mode: e.target.checked ? 'sfw' : 'nsfw' })}
                  className="form-checkbox h-5 w-5 text-accent"
                />
              </label>
              <p className="text-sm text-gray-400 mt-1">
                Automatically filter explicit content and use professional voice lines
              </p>
            </div>

            <div>
              <label className="flex items-center justify-between">
                <span className="text-white">Dark Mode</span>
                <input
                  type="checkbox"
                  checked={true}
                  onChange={() => {}}
                  className="form-checkbox h-5 w-5 text-accent"
                  disabled
                />
              </label>
              <p className="text-sm text-gray-400 mt-1">
                Dark mode is always enabled in this version
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold flex items-center text-white">
              <Shield className="mr-2" />
              Privacy Settings
            </h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="flex items-center justify-between">
                <span className="text-white">Public Profile</span>
                <input
                  type="checkbox"
                  checked={true}
                  onChange={() => {}}
                  className="form-checkbox h-5 w-5 text-accent"
                />
              </label>
              <p className="text-sm text-gray-400 mt-1">
                Allow others to view your profile and reading activity
              </p>
            </div>

            <div>
              <label className="flex items-center justify-between">
                <span className="text-white">Show Reading Activity</span>
                <input
                  type="checkbox"
                  checked={true}
                  onChange={() => {}}
                  className="form-checkbox h-5 w-5 text-accent"
                />
              </label>
              <p className="text-sm text-gray-400 mt-1">
                Display your reading progress and activity in the community
              </p>
            </div>

            <div>
              <label className="flex items-center justify-between">
                <span className="text-white">Allow Friend Requests</span>
                <input
                  type="checkbox"
                  checked={true}
                  onChange={() => {}}
                  className="form-checkbox h-5 w-5 text-accent"
                />
              </label>
              <p className="text-sm text-gray-400 mt-1">
                Let other users send you friend requests
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold flex items-center text-white">
              <Bell className="mr-2" />
              Notifications
            </h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="flex items-center justify-between">
                <span className="text-white">Reading Reminders</span>
                <input
                  type="checkbox"
                  checked={user.settings.notifications.readingReminders}
                  onChange={(e) => updateSettings({
                    notifications: { ...user.settings.notifications, readingReminders: e.target.checked }
                  })}
                  className="form-checkbox h-5 w-5 text-accent"
                />
              </label>
              <p className="text-sm text-gray-400 mt-1">
                Receive reminders to maintain your reading streak
              </p>
            </div>

            <div>
              <label className="flex items-center justify-between">
                <span className="text-white">Book Club Updates</span>
                <input
                  type="checkbox"
                  checked={user.settings.notifications.clubUpdates}
                  onChange={(e) => updateSettings({
                    notifications: { ...user.settings.notifications, clubUpdates: e.target.checked }
                  })}
                  className="form-checkbox h-5 w-5 text-accent"
                />
              </label>
              <p className="text-sm text-gray-400 mt-1">
                Get notified about new discussions and events in your book clubs
              </p>
            </div>

            <div>
              <label className="flex items-center justify-between">
                <span className="text-white">Achievement Alerts</span>
                <input
                  type="checkbox"
                  checked={user.settings.notifications.achievements}
                  onChange={(e) => updateSettings({
                    notifications: { ...user.settings.notifications, achievements: e.target.checked }
                  })}
                  className="form-checkbox h-5 w-5 text-accent"
                />
              </label>
              <p className="text-sm text-gray-400 mt-1">
                Receive notifications when you earn new achievements
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Voice Assistant Debug */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold flex items-center text-white">
              <Volume2 className="mr-2" />
              Voice Assistant Debug
            </h2>
          </CardHeader>
          <CardBody>
            <pre className="bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto text-gray-300">
              {JSON.stringify({
                lastVoiceTrigger: '2025-03-15T14:30:00Z',
                voiceStyle: user.settings.voiceProfile,
                volume: 1.0,
                status: 'ready'
              }, null, 2)}
            </pre>
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;