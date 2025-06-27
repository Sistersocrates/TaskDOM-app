import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleAuthCallback } from '../lib/supabase';
import { Loader2, AlertCircle } from 'lucide-react';
import { useUserStore } from '../store/userStore';

const AuthCallbackPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { initialize } = useUserStore();

  useEffect(() => {
    const processAuthCallback = async () => {
      try {
        const { data, error } = await handleAuthCallback();
        
        if (error) {
          console.error('Error handling auth callback:', error);
          setError('Authentication failed. Please try again.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }
        
        if (data?.session) {
          // Successfully authenticated
          await initialize();
          navigate('/');
        } else {
          setError('No session data returned. Please try again.');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err) {
        console.error('Unexpected error during auth callback:', err);
        setError('An unexpected error occurred. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    processAuthCallback();
  }, [navigate, initialize]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 text-center">
        {error ? (
          <div>
            <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">Authentication Error</h1>
            <p className="text-gray-400 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting you back...</p>
          </div>
        ) : (
          <div>
            <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">Completing Sign In</h1>
            <p className="text-gray-400">Please wait while we complete the authentication process...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackPage;