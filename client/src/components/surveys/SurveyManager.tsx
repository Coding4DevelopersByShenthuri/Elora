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

  useEffect(() => {
    // Skip survey if:
    // 1. User is not logged in
    // 2. User has already completed the survey (has surveyData)
    // 3. User is an admin (is_staff or is_superuser) - admins should never see surveys
    // 4. User is on an admin route - even if not marked as admin, if accessing admin portal, skip survey
    // 5. Survey is already in progress (check sessionStorage)
    // 6. We've already triggered the survey once
    const isAdminRoute = location.pathname.startsWith('/admin');
    const isAdminUser = user && (user.is_staff || user.is_superuser);
    const surveyData = user?.surveyData as SurveyData | undefined;
    const hasCompletedSurvey = Boolean(
      surveyData &&
      surveyData.personalizationCompleted === true && // Survey is only complete after personalization
      (
        surveyData.completedAt ||
        (
          surveyData.ageRange &&
          surveyData.nativeLanguage &&
          surveyData.englishLevel &&
          Array.isArray(surveyData.learningPurpose) &&
          surveyData.learningPurpose.length > 0
        )
      )
    );
    
    // Check if survey is already in progress
    const surveyInProgress = sessionStorage.getItem('speakbee_survey_in_progress');
    const surveyStep = sessionStorage.getItem('speakbee_survey_step');
    
    // If survey is already in progress or we've already triggered it, don't show step 1 again
    if (surveyInProgress || surveyStep || hasTriggeredRef.current) {
      return;
    }
    
    // Only show survey to regular users (not admins) on non-admin routes who haven't completed it
    if (user && !hasCompletedSurvey && !isAdminUser && !isAdminRoute) {
      // Mark that we've triggered the survey
      hasTriggeredRef.current = true;
      
      // Show survey after a short delay to allow the app to settle
      const timer = setTimeout(() => {
        onShowSurvey();
      }, 500);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, location.pathname]); // onShowSurvey is stable and doesn't need to be in deps

  // This component doesn't render anything, it just manages the survey logic
  return null;
};

export default SurveyManager;
