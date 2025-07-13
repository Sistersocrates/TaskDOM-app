import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import AuthModal from '../components/auth/AuthModal';
import Button from '../components/ui/Button';

const LoginPage: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [authMode, setAuthMode] = useState<'sign_in' | 'sign_up'>('sign_in');
  const navigate = useNavigate();

  const openSignIn = () => {
    setAuthMode('sign_in');
    setShowAuthModal(true);
  };

  const openSignUp = () => {
    setAuthMode('sign_up');
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    navigate('/');
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-gradient-to-br from-accent to-accent-hover rounded-lg flex items-center justify-center">
            <BookOpen className="h-10 w-10 text-accent-text" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-4 text-white font-cinzel">TaskDOM</h1>
        <p className="text-gray-400 mb-8">Your spicy reading companion</p>
        
        <div className="flex flex-col space-y-4">
          <Button 
            onClick={openSignIn}
            size="lg"
            className="w-full"
          >
            Sign In
          </Button>
          
          <Button 
            onClick={openSignUp}
            variant="outline"
            size="lg"
            className="w-full"
          >
            Create Account
          </Button>
          
          <p className="text-sm text-gray-500 mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
          initialView={authMode}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
};

export default LoginPage;