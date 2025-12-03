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
        // Target URL: http://54.179.120.126/api/verify-email/<token>/
        let apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        
        // Extract base origin (protocol + host, e.g., http://54.179.120.126)
        // This is the most reliable way to ensure we don't have double /api/api
        const originMatch = apiBaseUrl.match(/^(https?:\/\/[^\/]+)/);
        let baseOrigin = originMatch ? originMatch[1] : 'http://54.179.120.126';
        
        // If VITE_API_URL is set incorrectly (e.g., contains /api/api), extract origin before any /api
        if (!originMatch && apiBaseUrl.includes('/api')) {
          const parts = apiBaseUrl.split('/api');
          baseOrigin = parts[0] || 'http://54.179.120.126';
        }
        
        // Always rebuild the API base URL from origin + /api
        // This ensures we NEVER have double /api/api
        const finalApiBaseUrl = `${baseOrigin}/api`;
        
        // Token from React Router - encode it to be safe for URL
        const encodedToken = encodeURIComponent(token);
        
        // Construct the full verification URL
        // Final result: http://54.179.120.126/api/verify-email/<token>/
        const verifyUrl = `${finalApiBaseUrl}/verify-email/${encodedToken}/`;
        
        // Debug logging - always log in production to help diagnose issues
        console.log('🔍 Email Verification Debug:');
        console.log('  VITE_API_URL (raw):', import.meta.env.VITE_API_URL);
        console.log('  Base Origin:', baseOrigin);
        console.log('  Final API Base URL:', finalApiBaseUrl);
        console.log('  Token (first 20 chars):', token.substring(0, 20));
        console.log('  Token length:', token.length);
        console.log('  Full Verification URL:', verifyUrl);
        
        const response = await fetch(verifyUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Check if response is OK before parsing JSON
        if (!response.ok) {
          // Try to get error message from response
          let errorMessage = 'Verification failed';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || `Server error: ${response.status}`;
          } catch {
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
          setVerificationStatus('error');
          setMessage(errorMessage);
          console.error('Verification failed:', response.status, errorMessage);
          return;
        }

        const data = await response.json();

        if (data.success) {
          setVerificationStatus('success');
          setMessage(data.message || 'Email verified successfully!');
        } else {
          setVerificationStatus('error');
          setMessage(data.message || 'Verification failed');
        }
      } catch (error: any) {
        setVerificationStatus('error');
        const errorMessage = error?.message || 'An error occurred during verification. Please check your connection and try again.';
        setMessage(errorMessage);
        console.error('Verification error:', error);
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

