import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  // Check if we have a valid hash in the URL
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes('type=recovery')) {
      setError('Invalid or expired password reset link. Please request a new password reset email.');
    }
  }, []);

  // Countdown timer after successful password reset
  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (success && countdown === 0) {
      navigate('/login');
    }
  }, [success, countdown, navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        console.error('Error resetting password:', error);
        setError(error.message || 'Failed to reset password. Please try again.');
        return;
      }
      
      // Password reset successful
      setSuccess(true);
      
    } catch (err) {
      console.error('Unexpected error during password reset:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">Reset Your Password</h1>
        </CardHeader>
        <CardBody className="p-6">
          {error ? (
            <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-red-300">{error}</p>
                  <Button 
                    onClick={() => navigate('/login')} 
                    className="mt-4"
                    size="sm"
                  >
                    Return to Login
                  </Button>
                </div>
              </div>
            </div>
          ) : success ? (
            <div className="bg-success-900/30 border border-success-700/50 rounded-lg p-4 text-center">
              <CheckCircle className="h-12 w-12 text-success-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Password Reset Successful!</h2>
              <p className="text-gray-300 mb-4">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
              <p className="text-gray-400 mb-6">
                Redirecting to login page in {countdown} seconds...
              </p>
              <Button onClick={() => navigate('/login')}>
                Go to Login Now
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Lock className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-blue-300 text-sm">
                    Please enter your new password below. Choose a strong password that you haven't used before.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  label="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  fullWidth
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  fullWidth
                  required
                />
              </div>
              
              <div className="text-xs text-gray-400">
                Password must be at least 6 characters long
              </div>
              
              <Button
                type="submit"
                fullWidth
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Resetting Password...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </Button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-sm text-gray-400 hover:text-white"
                >
                  Return to Login
                </button>
              </div>
            </form>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;

