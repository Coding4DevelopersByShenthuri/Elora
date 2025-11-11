/**
 * Page Eligibility Guard Component
 * 
 * Protects routes by checking if the user has unlocked the page.
 * Shows a locked page UI with progress indicators if not eligible.
 */

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import PageEligibilityService, { type PageEligibility, type PagePath } from '@/services/PageEligibilityService';
import InitialRouteService from '@/services/InitialRouteService';

interface PageEligibilityGuardProps {
  children: React.ReactNode;
  pagePath: PagePath;
  fallbackPage?: PagePath; // Where to redirect if not eligible
}

export const PageEligibilityGuard = ({ 
  children, 
  pagePath, 
  fallbackPage 
}: PageEligibilityGuardProps) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [eligibility, setEligibility] = useState<PageEligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkEligibility = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Check if eligibility check is required based on initial route
        const requiresCheck = InitialRouteService.requiresEligibilityCheck(pagePath as any);
        
        // If no eligibility check is required, allow access immediately
        if (!requiresCheck) {
          console.log(`✅ No eligibility check required for ${pagePath} - allowing access`);
          setLoading(false);
          return;
        }

        console.log(`🔒 Eligibility check required for ${pagePath} - checking progress...`);
        
        // Check eligibility
        const result = await PageEligibilityService.getEligibility(pagePath);
        setEligibility(result);
        
        // If page is unlocked, allow access
        if (result?.is_unlocked) {
          setLoading(false);
          return;
        }

        // If not unlocked, don't redirect immediately - let the locked page UI show
        // The redirect will happen only if user explicitly navigates away
        // This allows the page to render and show modals/blocked UI
      } catch (err) {
        console.error('Error checking page eligibility:', err);
        setError('Failed to check page eligibility');
      } finally {
        setLoading(false);
      }
    };

    checkEligibility();
  }, [isAuthenticated, pagePath, fallbackPage, navigate, location.pathname]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 px-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Checking page access...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If not authenticated, show auth prompt
  if (!isAuthenticated) {
    return <>{children}</>; // Let the page handle auth
  }

  // Check if eligibility check is even required
  const requiresCheck = InitialRouteService.requiresEligibilityCheck(pagePath as any);
  
  // If no eligibility check is required, allow access
  if (!requiresCheck) {
    return <>{children}</>;
  }

  // If page is unlocked, render children
  if (eligibility?.is_unlocked) {
    return <>{children}</>;
  }

  // If error occurred, show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 px-8 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If eligibility check is required but page is not unlocked
  // Still render children so they can show modals when they mount
  // The page component will handle showing the blocked modal
  return <>{children}</>;
};

export default PageEligibilityGuard;

