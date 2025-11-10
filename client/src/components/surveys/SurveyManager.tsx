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
  const previousUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // CRITICAL REQUIREMENT: Survey shows ONLY ONCE per user lifetime
    // Show survey ONLY if:
    // 1. User just logged in (just_authenticated flag is set)
    // 2. User has NOT completed survey (check server's survey_completed_at)
    // 3. User is not admin
    // 4. User is not on admin route
    // 5. Survey hasn't been triggered in this session
    
    if (!user) {
      // No user - reset trigger ref
      hasTriggeredRef.current = false;
      previousUserIdRef.current = null;
      return;
    }

    const isAdminRoute = location.pathname.startsWith('/admin');
    const isAdminUser = user.is_staff || user.is_superuser;
    
    // Check if user just authenticated (set by AuthContext after login)
    const justAuthenticated = sessionStorage.getItem('speakbee_just_authenticated') === 'true';
    
    // Check if survey is completed - use server's survey_completed_at as source of truth
    // This is the ONLY way to determine if user has taken the survey before
    const surveyData = user?.surveyData as SurveyData | undefined;
    const hasCompletedSurvey = Boolean(surveyData?.completedAt);
    
    // Clear stale survey flags if user just authenticated
    if (justAuthenticated) {
      const surveyInProgress = sessionStorage.getItem('speakbee_survey_in_progress');
      if (surveyInProgress) {
        console.log('🧹 Clearing stale survey flags on new login');
        sessionStorage.removeItem('speakbee_survey_in_progress');
        sessionStorage.removeItem('speakbee_survey_step');
      }
    }
    
    // Debug logging
    console.log('🔍 SurveyManager Check:', {
      userId: user.id,
      justAuthenticated,
      hasCompletedSurvey,
      isAdminUser,
      isAdminRoute,
      hasTriggered: hasTriggeredRef.current,
      surveyCompletedAt: surveyData?.completedAt || 'none'
    });
    
    // CRITICAL: If user has completed survey, NEVER show it again (once in lifetime)
    if (hasCompletedSurvey) {
      sessionStorage.removeItem('speakbee_just_authenticated');
      sessionStorage.removeItem('speakbee_survey_in_progress');
      sessionStorage.removeItem('speakbee_survey_step');
      console.log('✅ Survey already completed - will NEVER show again');
      return;
    }
    
    // Skip if admin
    if (isAdminUser || isAdminRoute) {
      console.log('⏸️ Admin user/route - skipping survey');
      return;
    }
    
    // ONLY trigger if user just authenticated AND hasn't completed survey
    if (justAuthenticated && !hasTriggeredRef.current) {
      console.log('✅ User just logged in and survey not completed - showing survey NOW!');
      
      // Mark as triggered immediately
      hasTriggeredRef.current = true;
      
      // Clear the flag immediately so it doesn't trigger again
      sessionStorage.removeItem('speakbee_just_authenticated');
      
      // Show survey immediately (no delay to prevent blank page)
      console.log('🚀 Calling onShowSurvey()...');
      onShowSurvey();
      console.log('✅ onShowSurvey() called');
    } else if (!justAuthenticated && !hasTriggeredRef.current) {
      // User is logged in but didn't just authenticate
      // This means they're returning to the app - don't show survey
      console.log('ℹ️ User logged in but not a new login - not showing survey');
    }
    
    // Update previous user ID
    previousUserIdRef.current = user.id;
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, location.pathname]); // Check user and location changes

  // This component doesn't render anything, it just manages the survey logic
  return null;
};

export default SurveyManager;
