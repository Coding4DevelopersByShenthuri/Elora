import { useEffect } from 'react';
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

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('speakbee_auth_token');
    const isAdmin = localStorage.getItem('speakbee_is_admin') === 'true';
    
    // Check if we have authentication
    if (!token || token === 'local-token') {
      navigate('/admin/login');
      return;
    }

    // If we have user from context, check admin status
    if (user) {
      if (!user.is_staff && !user.is_superuser) {
        navigate('/admin/login');
        return;
      }
    } else if (!isAdmin) {
      // If no user context but we have token, verify admin status
      // This will be handled by the backend which will return 403 if not admin
      // For now, trust the isAdmin flag
      if (!isAdmin) {
        navigate('/admin/login');
        return;
      }
    }
  }, [user, isAuthenticated, navigate]);

  // Show loading while checking or during redirect
  const token = localStorage.getItem('speakbee_auth_token');
  const isAdmin = localStorage.getItem('speakbee_is_admin') === 'true';
  
  // If no token, will redirect - show loading
  if (!token || token === 'local-token') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user exists but not admin, will redirect
  if (user && !user.is_staff && !user.is_superuser && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

