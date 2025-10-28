import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VerifyEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        // Call the backend API to verify the email
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/verify-email/${token}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (data.success) {
          setVerificationStatus('success');
          setMessage(data.message || 'Email verified successfully!');
        } else {
          setVerificationStatus('error');
          setMessage(data.message || 'Verification failed');
        }
      } catch (error) {
        setVerificationStatus('error');
        setMessage('An error occurred during verification');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        {verificationStatus === 'loading' && (
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin mx-auto text-teal-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Verifying Your Email
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait...
            </p>
          </div>
        )}

        {verificationStatus === 'success' && (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Email Verified!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {message}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              Your account has been activated. Please login with your email and password.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => {
                  // Open login modal
                  window.dispatchEvent(new CustomEvent('openAuthModal', { 
                    detail: { mode: 'login' } 
                  }));
                  navigate('/');
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-2 rounded-lg transition-colors font-semibold"
              >
                Login Now
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="px-6 py-2 rounded-lg transition-colors"
              >
                Go to Homepage
              </Button>
            </div>
          </div>
        )}

        {verificationStatus === 'error' && (
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {message}
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => navigate('/')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Go to Homepage
              </Button>
              <Button
                onClick={() => {
                  // Trigger auth modal to open in login mode
                  window.dispatchEvent(new CustomEvent('openAuthModal', { 
                    detail: { mode: 'login' } 
                  }));
                  navigate('/');
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Try to Login
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;

