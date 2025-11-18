/**
 * Protected Route Component
 * 
 * Protects routes by requiring authentication.
 * Shows AuthModal if user is not authenticated.
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/auth/AuthModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (!isAuthenticated) {
      // Check if there are any existing users in localStorage
      const speakbeeUsers = JSON.parse(localStorage.getItem("speakbee_users") || "[]");
      const legacyUsers = JSON.parse(localStorage.getItem('users') || "[]");
      
      const hasExistingUsers = speakbeeUsers.length > 0 || legacyUsers.length > 0;
      
      // If there are existing users, show login form, otherwise show registration
      setAuthMode(hasExistingUsers ? 'login' : 'register');
      setShowAuthModal(true);
    } else {
      setShowAuthModal(false);
    }
  }, [isAuthenticated, location.pathname]);

  // If authenticated, render children
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Handle successful authentication
  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // The page will automatically render once isAuthenticated becomes true
  };

  // If not authenticated, show auth modal and prevent access to content
  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in to access this page</p>
        </div>
      </div>
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => {
          // Don't allow closing without authentication - redirect to home
          window.location.href = '/';
        }}
        initialMode={authMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default ProtectedRoute;

