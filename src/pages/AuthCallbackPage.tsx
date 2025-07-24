import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleAuthCallback, supabase } from '../lib/supabase';
import { Loader2, AlertCircle } from 'lucide-react';
import { useUserStore } from '../store/userStore';

const AuthCallbackPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { initialize } = useUserStore();

  useEffect(() => {
    const processAuthCallback = async () => {
      try {
        console.log('AuthCallbackPage: Starting callback process');
        setIsLoading(true);
        
        // First, try to handle the OAuth callback
        const { data, error } = await handleAuthCallback();
        
        // Check if user is already signed in (even if callback had issues)
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && session.user) {
          console.log('AuthCallbackPage: User session found, authentication successful');
          // User is authenticated, initialize and redirect
          await initialize();
          console.log('AuthCallbackPage: User store initialized, redirecting to dashboard');
          navigate('/dashboard');
          return;
        }
        
        if (error) {
          console.error('AuthCallbackPage: Error handling auth callback:', error);
          setError(error.message || 'Authentication failed. Please try again.');
          setIsLoading(false);
          setTimeout(() => navigate('/login'), 5000);
          return;
        }
        
        if (data?.session && data?.user) {
          console.log('AuthCallbackPage: Successfully authenticated via callback, initializing user store');
          // Successfully authenticated via callback
          await initialize();
          console.log('AuthCallbackPage: User store initialized, redirecting to dashboard');
          navigate('/dashboard');
        } else {
          console.warn('AuthCallbackPage: No session data returned');
          setError('No session data returned. Please try signing in again.');
          setIsLoading(false);
          setTimeout(() => navigate('/login'), 5000);
        }
      } catch (err) {
        console.error('AuthCallbackPage: Unexpected error during auth callback:', err);
        setError('An unexpected error occurred. Please try again.');
        setIsLoading(false);
        setTimeout(() => navigate('/login'), 5000);
      }
    };

    processAuthCallback();
  }, [navigate, initialize]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 text-center">
        {error ? (
          <div>
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">Authentication Error</h1>
            <p className="text-gray-400 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting you back to login...</p>
            <button 
              onClick={() => navigate('/login')}
              className="mt-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <div>
            <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">
              {isLoading ? 'Completing Sign In' : 'Redirecting...'}
            </h1>
            <p className="text-gray-400">
              {isLoading 
                ? 'Please wait while we complete the authentication process...' 
                : 'Taking you to your dashboard...'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackPage;