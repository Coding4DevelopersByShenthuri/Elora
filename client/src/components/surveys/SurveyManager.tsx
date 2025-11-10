import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { SurveyData } from '@/components/surveys/UserSurvey';

interface SurveyManagerProps {
  onShowSurvey: () => void;
}

const SurveyManager: React.FC<SurveyManagerProps> = ({ onShowSurvey }) => {
  const { user } = useAuth();
  const location = useLocation();
  const hasTriggeredRef = useRef(false);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Skip survey if:
    // 1. User is not logged in
    // 2. User has already completed the survey (check server's survey_completed_at)
    // 3. User is an admin (is_staff or is_superuser) - admins should never see surveys
    // 4. User is on an admin route - even if not marked as admin, if accessing admin portal, skip survey
    // 5. Survey is already in progress (check sessionStorage)
    // 6. We've already triggered the survey once in this session
    // 7. User didn't just log in/register (check for "just authenticated" flag)
    
    const isAdminRoute = location.pathname.startsWith('/admin');
    const isAdminUser = user && (user.is_staff || user.is_superuser);
    
    // Check if user just authenticated (set by AuthContext after login/registration)
    const justAuthenticated = sessionStorage.getItem('speakbee_just_authenticated') === 'true';
    
    // Check if survey is already in progress
    const surveyInProgress = sessionStorage.getItem('speakbee_survey_in_progress');
    const surveyStep = sessionStorage.getItem('speakbee_survey_step');
    
    // Check if survey is completed - use server's survey_completed_at as source of truth
    // The server's survey_completed_at is the definitive source
    const surveyData = user?.surveyData as SurveyData | undefined;
    const hasCompletedSurvey = Boolean(
      surveyData?.completedAt || // Server's survey_completed_at field (primary check)
      (surveyData?.personalizationCompleted === true && surveyData?.completedAt) // Fallback check
    );
    
    // CRITICAL: If user has completed survey on server, never show it again
    if (hasCompletedSurvey) {
      // Clear any stale flags
      sessionStorage.removeItem('speakbee_just_authenticated');
      sessionStorage.removeItem('speakbee_survey_in_progress');
      sessionStorage.removeItem('speakbee_survey_step');
      hasCheckedRef.current = true;
      return;
    }
    
    // If survey is already in progress, don't trigger again (user might have refreshed)
    if (surveyInProgress || surveyStep) {
      hasCheckedRef.current = true;
      return;
    }
    
    // If we've already checked and triggered in this session, don't check again
    // UNLESS user just authenticated (which means they just logged in/registered)
    if (hasCheckedRef.current && !justAuthenticated) {
      return;
    }
    
    // Only trigger survey if:
    // 1. User is logged in
    // 2. User just authenticated (login/registration/email verification + login)
    // 3. User hasn't completed survey (checked above)
    // 4. User is not admin
    // 5. User is not on admin route
    // 6. Survey hasn't been triggered yet in this session
    if (
      user && 
      justAuthenticated && 
      !hasCompletedSurvey && 
      !isAdminUser && 
      !isAdminRoute &&
      !hasTriggeredRef.current
    ) {
      // Mark that we've triggered the survey
      hasTriggeredRef.current = true;
      hasCheckedRef.current = true;
      
      // IMPORTANT: Clear the "just authenticated" flag AFTER triggering survey
      // This prevents the survey from showing again on subsequent page loads
      // The flag will be set again only when user logs in again
      sessionStorage.removeItem('speakbee_just_authenticated');
      
      // Show survey after a short delay to allow the app to settle
      const timer = setTimeout(() => {
        onShowSurvey();
      }, 800);

      return () => clearTimeout(timer);
    } else if (user && !justAuthenticated && !hasCompletedSurvey) {
      // User is logged in but didn't just authenticate - mark as checked
      // This prevents checking on every route change
      hasCheckedRef.current = true;
    } else if (user && hasCompletedSurvey) {
      // User has completed survey - ensure flags are cleared
      sessionStorage.removeItem('speakbee_just_authenticated');
      hasCheckedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, location.pathname]); // onShowSurvey is stable and doesn't need to be in deps

  // This component doesn't render anything, it just manages the survey logic
  return null;
};

export default SurveyManager;
