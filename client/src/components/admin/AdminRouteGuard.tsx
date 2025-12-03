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
    // Check if user is logged in
    const token = localStorage.getItem('speakbee_auth_token');
    const isAdmin = localStorage.getItem('speakbee_is_admin') === 'true';
    
    // Check if we have authentication
    if (!token || token === 'local-token') {
      setIsChecking(false);
      navigate('/admin/login', { replace: true });
      return;
    }

    // If we have user from context, check admin status
    if (user) {
      if (!user.is_staff && !user.is_superuser) {
        setIsChecking(false);
        navigate('/admin/login', { replace: true });
        return;
      }
      // User is admin, allow access
      setIsChecking(false);
    } else if (!isAdmin) {
      // If no user context but we have token, verify admin status
      // This will be handled by the backend which will return 403 if not admin
      // For now, trust the isAdmin flag
      if (!isAdmin) {
        setIsChecking(false);
        navigate('/admin/login', { replace: true });
        return;
      }
      setIsChecking(false);
    } else {
      // Has admin flag, allow access (will verify with backend)
      setIsChecking(false);
    }
  }, [user, isAuthenticated, navigate]);

  // Show loading while checking authentication
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

