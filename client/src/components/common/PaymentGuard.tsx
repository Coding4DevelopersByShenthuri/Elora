import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CreditCard, Lock } from 'lucide-react';

interface PaymentGuardProps {
  children: React.ReactNode;
  requirePayment?: boolean;
}

/**
 * PaymentGuard component protects lesson pages and requires subscription/payment
 * After survey completion, users must subscribe before accessing lessons
 */
const PaymentGuard: React.FC<PaymentGuardProps> = ({ 
  children, 
  requirePayment = true 
}) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [hasSubscription, setHasSubscription] = React.useState<boolean>(false);
  const [isChecking, setIsChecking] = React.useState<boolean>(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!requirePayment) {
        setHasSubscription(true);
        setIsChecking(false);
        return;
      }

      if (!isAuthenticated || !user) {
        // User not logged in - redirect to home
        navigate('/');
        return;
      }

      // Check if user has completed survey
      const surveyCompleted = Boolean(
        user.surveyData?.completedAt || 
        user.surveyData?.personalizationCompleted
      );

      if (!surveyCompleted) {
        // User hasn't completed survey - they shouldn't be here
        // This shouldn't happen if SurveyManager is working correctly
        navigate('/');
        return;
      }

      // TODO: Check actual subscription status from backend
      // For now, check localStorage for subscription status
      // In production, this should check the backend API
      const subscriptionStatus = localStorage.getItem(`speakbee_subscription_${user.id}`);
      const hasActiveSubscription = subscriptionStatus === 'active';

      // For development: Allow access if subscription check is not implemented yet
      // In production, remove this and require actual subscription
      const isDevelopment = import.meta.env.DEV;
      
      if (hasActiveSubscription || isDevelopment) {
        setHasSubscription(true);
      } else {
        setHasSubscription(false);
      }

      setIsChecking(false);
    };

    checkSubscription();
  }, [user, isAuthenticated, requirePayment, navigate]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking subscription...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (requirePayment && !hasSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full">
          <Alert className="border-blue-200 bg-blue-50">
            <Lock className="h-5 w-5 text-blue-600" />
            <AlertTitle className="text-lg font-semibold text-blue-900">
              Subscription Required
            </AlertTitle>
            <AlertDescription className="mt-2 text-blue-800">
              <p className="mb-4">
                To access lessons and learning content, please subscribe to a plan that fits your needs.
              </p>
              <p className="text-sm text-blue-700 mb-4">
                Choose from our flexible pricing options designed for different learning goals.
              </p>
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={() => navigate('/pricing')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  View Pricing Plans
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="flex-1"
                >
                  Go Home
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PaymentGuard;

