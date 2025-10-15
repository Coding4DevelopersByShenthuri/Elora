import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SurveyManagerProps {
  onShowSurvey: () => void;
}

const SurveyManager: React.FC<SurveyManagerProps> = ({ onShowSurvey }) => {
  const { user } = useAuth();

  useEffect(() => {
    // Check if user is logged in and hasn't completed the survey
    if (user && !user.surveyData) {
      // Show survey after a short delay to allow the app to settle
      const timer = setTimeout(() => {
        onShowSurvey();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [user, onShowSurvey]);

  // This component doesn't render anything, it just manages the survey logic
  return null;
};

export default SurveyManager;
