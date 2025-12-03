import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

/**
 * Admin Route Guard
 * Protects admin routes and redirects to login if not authenticated or not admin
 */
export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Set timeout to prevent infinite loading
    const checkTimeout = setTimeout(() => {
      if (isChecking) {
        console.warn('Admin auth check timeout - redirecting to login');
        setIsChecking(false);
        navigate('/admin/login', { replace: true });
      }
    }, 3000); // 3 second timeout

    // Check if user is logged in
    const token = localStorage.getItem('speakbee_auth_token');
    const isAdmin = sessionStorage.getItem('speakbee_is_admin') === 'true' || 
                    localStorage.getItem('speakbee_is_admin') === 'true';
    
    // Check if we have authentication
    if (!token || token === 'local-token') {
      clearTimeout(checkTimeout);
      setIsChecking(false);
      navigate('/admin/login', { replace: true });
      return;
    }

    // If we have user from context, check admin status
    if (user) {
      clearTimeout(checkTimeout);
      if (!user.is_staff && !user.is_superuser) {
        setIsChecking(false);
        navigate('/admin/login', { replace: true });
        return;
      }
      // User is admin, allow access
      setIsChecking(false);
    } else if (isAdmin) {
      // Has admin flag, allow access (will verify with backend on first API call)
      clearTimeout(checkTimeout);
      setIsChecking(false);
    } else {
      // No user context and no admin flag - wait a bit for AuthContext to load
      // But don't wait forever
      const waitForUser = setTimeout(() => {
        clearTimeout(checkTimeout);
        if (!user && !isAdmin) {
          setIsChecking(false);
          navigate('/admin/login', { replace: true });
        }
      }, 2000); // Wait 2 seconds for user to load
      
      return () => {
        clearTimeout(waitForUser);
        clearTimeout(checkTimeout);
      };
    }

    return () => {
      clearTimeout(checkTimeout);
    };
  }, [user, isAuthenticated, navigate, isChecking]);

  // Show loading while checking authentication (with timeout protection)
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

