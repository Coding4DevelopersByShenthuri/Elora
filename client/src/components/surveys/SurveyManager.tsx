import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface SurveyManagerProps {
  onShowSurvey: () => void;
}

const SurveyManager: React.FC<SurveyManagerProps> = ({ onShowSurvey }) => {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Skip survey if:
    // 1. User is not logged in
    // 2. User has already completed the survey (has surveyData)
    // 3. User is an admin (is_staff or is_superuser) - admins should never see surveys
    // 4. User is on an admin route - even if not marked as admin, if accessing admin portal, skip survey
    const isAdminRoute = location.pathname.startsWith('/admin');
    const isAdminUser = user && (user.is_staff || user.is_superuser);
    const hasCompletedSurvey = user && user.surveyData;
    
    // Only show survey to regular users (not admins) on non-admin routes who haven't completed it
    if (user && !hasCompletedSurvey && !isAdminUser && !isAdminRoute) {
      // Show survey after a short delay to allow the app to settle
      const timer = setTimeout(() => {
        onShowSurvey();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [user, location.pathname, onShowSurvey]);

  // This component doesn't render anything, it just manages the survey logic
  return null;
};

export default SurveyManager;
