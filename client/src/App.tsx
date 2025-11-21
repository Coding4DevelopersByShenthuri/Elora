import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";

// ✅ Contexts & Providers
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

// ✅ Global Components
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/landing/Footer";
import FloatingIconsLayer from "@/components/common/FloatingIconsLayer";
import { LoadingScreen } from "@/components/landing/LoadingScreen";
import OfflineIndicator from "@/components/common/OfflineIndicator";
import CookieConsent from "@/components/common/CookieConsent";
import PageLoadingOverlay from "@/components/common/PageLoadingOverlay";

// ✅ Pages
import Index from "@/pages/Index";
import WhyPage from "@/pages/WhyPage";
import HowPage from "@/pages/HowPage";
import AboutPage from "@/pages/AboutPage";
import Profile from "@/pages/Profile";
import SearchPage from "@/pages/SearchPage";
import Settings from "@/pages/Settings";
import HelpPage from "@/pages/HelpPage";
import ContactPage from "@/pages/ContactPage";
import KidsPage from "@/pages/Kids";
import YoungKidsPage from "@/pages/YoungKids";
import TeenKidsPage from "@/pages/TeenKids";
import YoungKidsFavoritesPage from "@/pages/YoungKidsFavorites";
import TeenKidsFavoritesPage from "@/pages/TeenKidsFavorites";
import ParentalControlsPage from "@/pages/ParentalControlsPage";
import KidsGamePage from "@/pages/KidsGamePage";
import GameHistoryPage from "@/pages/GameHistoryPage";
import Adults from "@/pages/adults/adults";
import Beginners from "@/pages/adults/Beginners";
import Intermediates from "@/pages/adults/Intermediates";
import Advanced from "@/pages/adults/Advanced";
import QuickPracticeSession from "@/pages/adults/QuickPracticeSession";
import VideoLessons from "@/pages/adults/VideoLessons";
import VideoDetail from "@/pages/adults/VideoDetail";
import Lesson1Video from "@/pages/Lesson1Video";
import VirtualAI from "@/pages/VirtualAI";
import IeltsPte from "@/pages/IeltsPte";
import NotFound from "@/pages/NotFound";
import PricingPage from "@/pages/PricingPage";
import VerifyEmail from "@/pages/VerifyEmail";
import TermsAndConditionsPage from "@/pages/TermsAndConditionsPage";
import CertificatesPage from "@/pages/Certificates";
import AllCertificatesPage from "@/pages/AllCertificates";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminVideos from "@/pages/admin/AdminVideos";
import AdminLessons from "@/pages/admin/AdminLessons";
import AdminPractice from "@/pages/admin/AdminPractice";
import AdminProgress from "@/pages/admin/AdminProgress";
import AdminVocabulary from "@/pages/admin/AdminVocabulary";
import AdminAchievements from "@/pages/admin/AdminAchievements";
import AdminSurveys from "@/pages/admin/AdminSurveys";
import { Analytics } from "@/components/common/Analytics";
import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { PageEligibilityGuard } from "@/components/common/PageEligibilityGuard";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import type { ReactNode } from 'react';

// ✅ Import AuthModal, UserSurvey, and SurveyManager
import AuthModal from "@/components/auth/AuthModal";
import UserSurvey from "@/components/surveys/UserSurvey";
import LanguageSurvey from "@/components/surveys/LanguageSurvey";
import EnglishLevelSurvey from "@/components/surveys/EnglishLevelSurvey";
import LearningPurposeSurvey from "@/components/surveys/LearningPurposeSurvey";
import SpeakOutSurvey from "@/components/surveys/SpeakOutSurvey";
import AimSurvey from "@/components/surveys/AimSurvey";
import FluentUnderstandingSurvey from "@/components/surveys/FluentUnderstandingSurvey";
import LimitedWordsSurvey from "@/components/surveys/LimitedWordsSurvey";
import SentenceFormationSurvey from "@/components/surveys/SentenceFormationSurvey";
import CantSpeakSurvey from "@/components/surveys/CantSpeakSurvey";
import NeedFluencySurvey from "@/components/surveys/NeedFluencySurvey";
import HelloSurvey from "@/components/surveys/HelloSurvey";
import MoviesSurvey from "@/components/surveys/MoviesSurvey";
import VocabularySurvey from "@/components/surveys/VocabularySurvey";
import IntermediateVocabularySurvey from "@/components/surveys/IntermediateVocabularySurvey";
import AdvancedVocabularySurvey from "@/components/surveys/AdvancedVocabularySurvey";
import PersonalizationSurvey from "@/components/surveys/PersonalizationSurvey";
import InterestsSurvey from "@/components/surveys/InterestsSurvey";
import SurveyManager from "@/components/surveys/SurveyManager";
import { RouteLoadingProvider, useRouteLoading } from "@/contexts/RouteLoadingContext";
import NotificationObserver from "@/components/common/NotificationObserver";
import FavoritesPage from "@/pages/Favorites";
import { API } from "@/services/ApiService";

const queryClient = new QueryClient();

// ✅ Conditional Layout - Hide Navbar/Footer for Admin Pages
const ConditionalLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    // Admin pages (including login) get minimal layout (no Navbar, Footer, FloatingIcons, etc.)
    return (
      <div className="min-h-screen flex flex-col relative bg-background">
        <PageLoadingOverlay />
        <OfflineIndicator />
        <main className="flex-1">
          {children}
        </main>
        <Analytics />
      </div>
    );
  }

  // Regular pages get full layout with Navbar and Footer
  return (
    <div className="min-h-screen flex flex-col relative">
      <PageLoadingOverlay />
      <FloatingIconsLayer />
      <OfflineIndicator />
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CookieConsent />
      <Analytics />
    </div>
  );
};

// ✅ Smooth Page Transition Wrapper
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { startLoading, stopLoading, isOffline } = useRouteLoading();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (isOffline) {
      startLoading({ stickUntilOnline: true });
    } else {
      stopLoading();
    }
  }, [isOffline, location.pathname, startLoading, stopLoading]);

  return (
    <div
      key={location.pathname}
      className="transition-opacity duration-300 animate-fade-in"
    >
      {children}
    </div>
  );
};

// ✅ Helper function to analyze vocabulary selections and determine user level
const analyzeVocabularyLevel = (surveyData: any): 'beginner' | 'intermediate' | 'advanced' | null => {
  // Extract vocabulary arrays from survey data
  const beginnerWords = Array.isArray(surveyData?.vocabulary) ? surveyData.vocabulary : [];
  const intermediateWords = Array.isArray(surveyData?.intermediateVocabulary) ? surveyData.intermediateVocabulary : [];
  const advancedWords = Array.isArray(surveyData?.advancedVocabulary) ? surveyData.advancedVocabulary : [];

  // Count words selected from each level
  const beginnerCount = beginnerWords.length;
  const intermediateCount = intermediateWords.length;
  const advancedCount = advancedWords.length;

  console.log('📊 Vocabulary Analysis:', {
    beginner: beginnerCount,
    intermediate: intermediateCount,
    advanced: advancedCount,
    total: beginnerCount + intermediateCount + advancedCount
  });

  // If no vocabulary data, return null
  if (beginnerCount === 0 && intermediateCount === 0 && advancedCount === 0) {
    return null;
  }

  // Find the maximum count
  const maxCount = Math.max(beginnerCount, intermediateCount, advancedCount);

  // Check for clear winner (more than 2 words difference or at least 50% more)
  const counts = [
    { level: 'beginner' as const, count: beginnerCount },
    { level: 'intermediate' as const, count: intermediateCount },
    { level: 'advanced' as const, count: advancedCount }
  ].sort((a, b) => b.count - a.count);

  // If there's a clear winner (top count is significantly higher)
  if (counts[0].count > counts[1].count + 1 && counts[0].count >= 3) {
    return counts[0].level;
  }

  // Handle ties: Use intelligent tie-breaking
  const tiedLevels = counts.filter(c => c.count === maxCount && c.count > 0);
  
  if (tiedLevels.length === 1) {
    return tiedLevels[0].level;
  }

  // Multiple levels tied - use intelligent decision making
  console.log('🤔 Tie detected, using intelligent analysis...');
  
  // Get English level from earlier survey
  const englishLevel = surveyData?.englishLevel?.toLowerCase() || '';
  
  // Tie-breaking logic based on English level
  if (englishLevel) {
    const lowerLevels = ['beginner', 'pre-intermediate'];
    const midLevels = ['intermediate', 'upper-intermediate'];
    const higherLevels = ['advanced', 'proficient'];
    
    // If tied between beginner and intermediate
    if (tiedLevels.some(t => t.level === 'beginner') && tiedLevels.some(t => t.level === 'intermediate')) {
      if (lowerLevels.includes(englishLevel)) {
        return 'beginner';
      } else if (midLevels.includes(englishLevel) || higherLevels.includes(englishLevel)) {
        return 'intermediate';
      }
    }
    
    // If tied between intermediate and advanced
    if (tiedLevels.some(t => t.level === 'intermediate') && tiedLevels.some(t => t.level === 'advanced')) {
      if (lowerLevels.includes(englishLevel) || midLevels.includes(englishLevel)) {
        return 'intermediate';
      } else if (higherLevels.includes(englishLevel)) {
        return 'advanced';
      }
    }
    
    // If tied between beginner and advanced (unlikely but handle it)
    if (tiedLevels.some(t => t.level === 'beginner') && tiedLevels.some(t => t.level === 'advanced')) {
      // This is unusual - default to intermediate as middle ground
      return 'intermediate';
    }
  }

  // Additional tie-breaking: Use percentage of total words
  const totalWords = beginnerCount + intermediateCount + advancedCount;
  if (totalWords > 0) {
    const beginnerPercent = (beginnerCount / totalWords) * 100;
    const intermediatePercent = (intermediateCount / totalWords) * 100;
    const advancedPercent = (advancedCount / totalWords) * 100;

    // If one level has significantly higher percentage (>= 40%)
    if (beginnerPercent >= 40 && beginnerPercent > intermediatePercent + 10 && beginnerPercent > advancedPercent + 10) {
      return 'beginner';
    }
    if (intermediatePercent >= 40 && intermediatePercent > beginnerPercent + 10 && intermediatePercent > advancedPercent + 10) {
      return 'intermediate';
    }
    if (advancedPercent >= 40 && advancedPercent > beginnerPercent + 10 && advancedPercent > intermediatePercent + 10) {
      return 'advanced';
    }
  }

  // Final fallback: Prefer intermediate as middle ground, or the first tied level
  if (tiedLevels.length > 0) {
    // Prefer intermediate if it's in the tie
    const intermediateTied = tiedLevels.find(t => t.level === 'intermediate');
    if (intermediateTied) {
      return 'intermediate';
    }
    // Otherwise return the first (highest) tied level
    return tiedLevels[0].level;
  }

  // Ultimate fallback: Return the level with highest count
  return counts[0].level;
};

// ✅ Helper function to determine learning page based on survey responses
const getLearningPageFromSurvey = (surveyData: any): string => {
  const ageRange = surveyData?.ageRange;
  const englishLevel = surveyData?.englishLevel;
  const learningPurpose = surveyData?.learningPurpose || [];

  // Route kids to appropriate page based on age range
  // YoungKids: Ages 4-10
  if (ageRange === '4-10') {
    return '/kids/young';
  }
  
  // TeenKids: Ages 11-17
  if (ageRange === '11-17') {
    return '/kids/teen';
  }

  // Backward compatibility: If user has old '4-17' age range, 
  // we'll need to determine based on other factors or default to YoungKids
  // For now, defaulting to /kids page which will let them choose
  if (ageRange === '4-17') {
    // Try to determine based on English level if available
    // Younger kids typically have lower English levels
    if (englishLevel) {
      const lowerLevels = ['beginner', 'pre-intermediate'];
      const higherLevels = ['intermediate', 'upper-intermediate', 'advanced', 'proficient'];
      
      if (lowerLevels.includes(englishLevel.toLowerCase())) {
        return '/kids/young';
      } else if (higherLevels.includes(englishLevel.toLowerCase())) {
        return '/kids/teen';
      }
    }
    // Default to /kids page for backward compatibility (user can choose)
    return '/kids';
  }

  // If learning purpose includes IELTS/PTE exam preparation, redirect to IELTS/PTE page
  if (Array.isArray(learningPurpose) && learningPurpose.includes('Exam preparation (IELTS / PTE)')) {
    return '/ielts-pte';
  }

  // For adults: Use vocabulary analysis as primary method, fallback to English level
  // Step 13: A1-A2 Beginner vocabulary
  // Step 14: B1-B2 Intermediate vocabulary  
  // Step 15: C1-C2 Advanced vocabulary
  const vocabularyLevel = analyzeVocabularyLevel(surveyData);
  
  if (vocabularyLevel) {
    console.log(`✅ Vocabulary analysis determined level: ${vocabularyLevel}`);
    if (vocabularyLevel === 'beginner') {
      return '/adults/beginners';
    }
    if (vocabularyLevel === 'intermediate') {
      return '/adults/intermediates';
    }
    if (vocabularyLevel === 'advanced') {
      return '/adults/advanced';
    }
  }

  // Fallback to English level if vocabulary analysis didn't provide a result
  if (englishLevel) {
    const levelLower = englishLevel.toLowerCase();
    if (levelLower === 'beginner' || levelLower === 'pre-intermediate') {
      return '/adults/beginners';
    }
    if (levelLower === 'intermediate' || levelLower === 'upper-intermediate') {
      return '/adults/intermediates';
    }
    if (levelLower === 'advanced' || levelLower === 'proficient') {
      return '/adults/advanced';
    }
  }

  // Default fallback for adults
  return '/adults';
};

// ✅ Route Definitions
const AppRoutes = () => {
  const { updateUserSurveyData, syncWithServer, user, isOnline } = useAuth();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Helper function to save survey step to MySQL database
  const saveSurveyStepToBackend = async (stepName: string, stepNumber: number, responseData: any) => {
    // Only save if user is authenticated, online, and not an admin
    if (!user || !isOnline || user.is_staff || user.is_superuser) {
      return;
    }
    
    try {
      const token = localStorage.getItem('speakbee_auth_token');
      if (token && token !== 'local-token') {
        await API.auth.saveSurveyStep(stepName, stepNumber, responseData);
        console.log(`✅ Survey step ${stepNumber} (${stepName}) saved to MySQL`);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to save survey step ${stepNumber} (${stepName}) to MySQL:`, error);
      // Don't throw - survey should continue even if backend save fails
    }
  };
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [isLanguageSurveyOpen, setIsLanguageSurveyOpen] = useState(false);
  const [surveyInProgress, setSurveyInProgress] = useState(false);
  
  // Debug: Track when survey states change
  useEffect(() => {
    if (isSurveyOpen) {
      console.log('✅ isSurveyOpen = TRUE - Step 1 should be visible');
    }
  }, [isSurveyOpen]);
  
  useEffect(() => {
    if (isLanguageSurveyOpen) {
      console.log('✅ isLanguageSurveyOpen = TRUE - Step 2 should be visible');
    }
  }, [isLanguageSurveyOpen]);
  
  // Track survey progress state for overlay
  useEffect(() => {
    const checkProgress = () => {
      const inProgress = sessionStorage.getItem('speakbee_survey_in_progress') === 'true';
      setSurveyInProgress(inProgress);
    };
    
    // Check initially
    checkProgress();
    
    // Listen for storage changes (when other tabs/windows update)
    window.addEventListener('storage', checkProgress);
    
    // Poll for changes (since storage event doesn't fire in same tab)
    const interval = setInterval(checkProgress, 100);
    
    return () => {
      window.removeEventListener('storage', checkProgress);
      clearInterval(interval);
    };
  }, []);
  const [isLearningPurposeSurveyOpen, setIsLearningPurposeSurveyOpen] = useState(false);
  const [isEnglishLevelSurveyOpen, setIsEnglishLevelSurveyOpen] = useState(false);
  const [isSpeakOutSurveyOpen, setIsSpeakOutSurveyOpen] = useState(false);
  const [isAimSurveyOpen, setIsAimSurveyOpen] = useState(false);
  const [isFluentUnderstandingSurveyOpen, setIsFluentUnderstandingSurveyOpen] = useState(false);
  const [isLimitedWordsSurveyOpen, setIsLimitedWordsSurveyOpen] = useState(false);
  const [isSentenceFormationSurveyOpen, setIsSentenceFormationSurveyOpen] = useState(false);
  const [isCantSpeakSurveyOpen, setIsCantSpeakSurveyOpen] = useState(false);
  const [isNeedFluencySurveyOpen, setIsNeedFluencySurveyOpen] = useState(false);
  const [isHelloSurveyOpen, setIsHelloSurveyOpen] = useState(false);
  const [isMoviesSurveyOpen, setIsMoviesSurveyOpen] = useState(false);
  const [isVocabularySurveyOpen, setIsVocabularySurveyOpen] = useState(false);
  const [isIntermediateVocabOpen, setIsIntermediateVocabOpen] = useState(false);
  const [isAdvancedVocabOpen, setIsAdvancedVocabOpen] = useState(false);
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
  const [isInterestsOpen, setIsInterestsOpen] = useState(false);

  // Restore survey step on page refresh
  useEffect(() => {
    const surveyInProgress = sessionStorage.getItem('speakbee_survey_in_progress');
    const surveyStep = sessionStorage.getItem('speakbee_survey_step');
    
    // If survey is in progress, restore the step the user was on
    if (surveyInProgress && surveyStep) {
      // Use a small delay to ensure all components are mounted
      const timer = setTimeout(() => {
        switch (surveyStep) {
          case 'user':
            setIsSurveyOpen(true);
            break;
          case 'language':
            setIsLanguageSurveyOpen(true);
            break;
          case 'englishLevel':
            setIsEnglishLevelSurveyOpen(true);
            break;
          case 'learningPurpose':
            setIsLearningPurposeSurveyOpen(true);
            break;
          case 'speakOut':
            setIsSpeakOutSurveyOpen(true);
            break;
          case 'aim':
            setIsAimSurveyOpen(true);
            break;
          case 'fluentUnderstanding':
            setIsFluentUnderstandingSurveyOpen(true);
            break;
          case 'limitedWords':
            setIsLimitedWordsSurveyOpen(true);
            break;
          case 'sentenceFormation':
            setIsSentenceFormationSurveyOpen(true);
            break;
          case 'cantSpeak':
            setIsCantSpeakSurveyOpen(true);
            break;
          case 'needFluency':
            setIsNeedFluencySurveyOpen(true);
            break;
          case 'movies':
            setIsMoviesSurveyOpen(true);
            break;
          case 'vocabulary':
            setIsVocabularySurveyOpen(true);
            break;
          case 'intermediateVocab':
            setIsIntermediateVocabOpen(true);
            break;
          case 'advancedVocab':
            setIsAdvancedVocabOpen(true);
            break;
          case 'interests':
            setIsInterestsOpen(true);
            break;
          case 'hello':
            setIsHelloSurveyOpen(true);
            break;
          case 'personalization':
            setIsPersonalizationOpen(true);
            break;
          default:
            // Unknown step, start from step 1
            setIsSurveyOpen(true);
            break;
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, []); // Only run once on mount

  // Save current step to sessionStorage whenever a survey dialog opens
  useEffect(() => {
    if (isSurveyOpen) {
      sessionStorage.setItem('speakbee_survey_in_progress', 'true');
      sessionStorage.setItem('speakbee_survey_step', 'user');
    }
  }, [isSurveyOpen]);

  useEffect(() => {
    if (isLanguageSurveyOpen) {
      sessionStorage.setItem('speakbee_survey_in_progress', 'true');
      sessionStorage.setItem('speakbee_survey_step', 'language');
    }
  }, [isLanguageSurveyOpen]);

  useEffect(() => {
    if (isEnglishLevelSurveyOpen) {
      sessionStorage.setItem('speakbee_survey_in_progress', 'true');
      sessionStorage.setItem('speakbee_survey_step', 'englishLevel');
    }
  }, [isEnglishLevelSurveyOpen]);

  useEffect(() => {
    if (isLearningPurposeSurveyOpen) {
      sessionStorage.setItem('speakbee_survey_in_progress', 'true');
      sessionStorage.setItem('speakbee_survey_step', 'learningPurpose');
    }
  }, [isLearningPurposeSurveyOpen]);

  useEffect(() => {
    if (isSpeakOutSurveyOpen) {
      sessionStorage.setItem('speakbee_survey_in_progress', 'true');
      sessionStorage.setItem('speakbee_survey_step', 'speakOut');
    }
  }, [isSpeakOutSurveyOpen]);

  useEffect(() => {
    if (isAimSurveyOpen) {
      sessionStorage.setItem('speakbee_survey_in_progress', 'true');
      sessionStorage.setItem('speakbee_survey_step', 'aim');
    }
  }, [isAimSurveyOpen]);

  useEffect(() => {
    if (isFluentUnderstandingSurveyOpen) {
      sessionStorage.setItem('speakbee_survey_in_progress', 'true');
      sessionStorage.setItem('speakbee_survey_step', 'fluentUnderstanding');
    }
  }, [isFluentUnderstandingSurveyOpen]);

  useEffect(() => {
    if (isLimitedWordsSurveyOpen) {
      sessionStorage.setItem('speakbee_survey_in_progress', 'true');
      sessionStorage.setItem('speakbee_survey_step', 'limitedWords');
    }
  }, [isLimitedWordsSurveyOpen]);

  useEffect(() => {
    if (isSentenceFormationSurveyOpen) {
      sessionStorage.setItem('speakbee_survey_in_progress', 'true');
      sessionStorage.setItem('speakbee_survey_step', 'sentenceFormation');
    }
  }, [isSentenceFormationSurveyOpen]);

  useEffect(() => {
    if (isCantSpeakSurveyOpen) {
      sessionStorage.setItem('speakbee_survey_in_progress', 'true');
      sessionStorage.setItem('speakbee_survey_step', 'cantSpeak');
    }
  }, [isCantSpeakSurveyOpen]);

  useEffect(() => {
    if (isNeedFluencySurveyOpen) {
      sessionStorage.setItem('speakbee_survey_in_progress', 'true');
      sessionStorage.setItem('speakbee_survey_step', 'needFluency');
    }
  }, [isNeedFluencySurveyOpen]);

  useEffect(() => {
    if (isMoviesSurveyOpen) {
      sessionStorage.setItem('speakbee_survey_in_progress', 'true');
      sessionStorage.setItem('speakbee_survey_step', 'movies');
    }
  }, [isMoviesSurveyOpen]);

  useEffect(() => {
    if (isVocabularySurveyOpen) {
      sessionStorage.setItem('speakbee_survey_in_progress', 'true');
      sessionStorage.setItem('speakbee_survey_step', 'vocabulary');
    }
  }, [isVocabularySurveyOpen]);

  useEffect(() => {
    if (isIntermediateVocabOpen) {
      sessionStorage.setItem('speakbee_survey_in_progress', 'true');
      sessionStorage.setItem('speakbee_survey_step', 'intermediateVocab');
    }
  }, [isIntermediateVocabOpen]);

  useEffect(() => {
    if (isAdvancedVocabOpen) {
      sessionStorage.setItem('speakbee_survey_in_progress', 'true');
      sessionStorage.setItem('speakbee_survey_step', 'advancedVocab');
    }
  }, [isAdvancedVocabOpen]);

  useEffect(() => {
    if (isInterestsOpen) {
      sessionStorage.setItem('speakbee_survey_in_progress', 'true');
      sessionStorage.setItem('speakbee_survey_step', 'interests');
    }
  }, [isInterestsOpen]);

  useEffect(() => {
    if (isHelloSurveyOpen) {
      sessionStorage.setItem('speakbee_survey_in_progress', 'true');
      sessionStorage.setItem('speakbee_survey_step', 'hello');
    }
  }, [isHelloSurveyOpen]);

  useEffect(() => {
    if (isPersonalizationOpen) {
      sessionStorage.setItem('speakbee_survey_in_progress', 'true');
      sessionStorage.setItem('speakbee_survey_step', 'personalization');
    }
  }, [isPersonalizationOpen]);

  // Handle custom event to open auth modal from other pages
  useEffect(() => {
    const handleOpenAuthModal = (event: Event) => {
      const customEvent = event as CustomEvent;
      setIsAuthModalOpen(true);
      // Store the mode in sessionStorage so AuthModal can read it
      if (customEvent.detail?.mode) {
        sessionStorage.setItem('speakbee_auth_mode', customEvent.detail.mode);
      }
    };

    window.addEventListener('openAuthModal', handleOpenAuthModal);
    
    return () => {
      window.removeEventListener('openAuthModal', handleOpenAuthModal);
    };
  }, []);

  return (
    <>
      <NotificationObserver />
      <Routes>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/why" element={<PageTransition><WhyPage /></PageTransition>} />
        <Route path="/how" element={<PageTransition><HowPage /></PageTransition>} />
        <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/search" element={<PageTransition><SearchPage /></PageTransition>} />
        <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
        <Route path="/help" element={<PageTransition><HelpPage /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
        <Route path="/virtual-ai" element={<PageTransition><VirtualAI /></PageTransition>} />
        <Route path="/kids" element={<PageTransition><KidsPage /></PageTransition>} />
        <Route 
          path="/kids/young" 
          element={
            <PageTransition>
              <ProtectedRoute>
                <PageEligibilityGuard pagePath="/kids/young">
                  <YoungKidsPage />
                </PageEligibilityGuard>
              </ProtectedRoute>
            </PageTransition>
          } 
        />
        <Route 
          path="/kids/teen" 
          element={
            <PageTransition>
              <ProtectedRoute>
                <PageEligibilityGuard pagePath="/kids/teen" fallbackPage="/kids/young">
                  <TeenKidsPage />
                </PageEligibilityGuard>
              </ProtectedRoute>
            </PageTransition>
          } 
        />
        <Route path="/kids/games/:gameId" element={<PageTransition><KidsGamePage /></PageTransition>} />
        <Route path="/kids/games/history" element={<PageTransition><GameHistoryPage /></PageTransition>} />
        <Route path="/favorites" element={<PageTransition><FavoritesPage /></PageTransition>} />
        <Route path="/favorites/young" element={<PageTransition><YoungKidsFavoritesPage /></PageTransition>} />
        <Route path="/favorites/teen" element={<PageTransition><TeenKidsFavoritesPage /></PageTransition>} />
        <Route path="/parental-controls" element={<PageTransition><ParentalControlsPage /></PageTransition>} />
        <Route path="/adults" element={<PageTransition><Adults /></PageTransition>} />
        <Route path="/adults/videos" element={<PageTransition><VideoLessons /></PageTransition>} />
        <Route path="/adults/videos/:slug" element={<PageTransition><VideoDetail /></PageTransition>} />
        <Route path="/lessons/1" element={<PageTransition><Lesson1Video /></PageTransition>} />
        <Route 
          path="/adults/beginners" 
          element={
            <PageTransition>
              <ProtectedRoute>
                <PageEligibilityGuard pagePath="/adults/beginners">
                  <Beginners />
                </PageEligibilityGuard>
              </ProtectedRoute>
            </PageTransition>
          } 
        />
        <Route 
          path="/adults/intermediates" 
          element={
            <PageTransition>
              <ProtectedRoute>
                <PageEligibilityGuard pagePath="/adults/intermediates" fallbackPage="/adults/beginners">
                  <Intermediates />
                </PageEligibilityGuard>
              </ProtectedRoute>
            </PageTransition>
          } 
        />
        <Route 
          path="/adults/advanced" 
          element={
            <PageTransition>
              <ProtectedRoute>
                <PageEligibilityGuard pagePath="/adults/advanced" fallbackPage="/adults/intermediates">
                  <Advanced />
                </PageEligibilityGuard>
              </ProtectedRoute>
            </PageTransition>
          } 
        />
        <Route path="/adults/practice" element={<PageTransition><QuickPracticeSession /></PageTransition>} />
        <Route path="/adults/practice/:sessionType" element={<PageTransition><QuickPracticeSession /></PageTransition>} />
        <Route 
          path="/ielts-pte" 
          element={
            <PageTransition>
              <ProtectedRoute>
                <IeltsPte />
              </ProtectedRoute>
            </PageTransition>
          } 
        />
        <Route path="/pricing" element={<PageTransition><PricingPage /></PageTransition>} />
        <Route path="/verify-email/:token" element={<PageTransition><VerifyEmail /></PageTransition>} />
        <Route path="/terms-and-conditions" element={<PageTransition><TermsAndConditionsPage /></PageTransition>} />
        <Route path="/certificates" element={<PageTransition><CertificatesPage /></PageTransition>} />
        <Route path="/my-certificates" element={<PageTransition><AllCertificatesPage /></PageTransition>} />
        
        {/* Admin Routes - Must come before catch-all route */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<PageTransition><AdminRouteGuard><AdminDashboard /></AdminRouteGuard></PageTransition>} />
        <Route path="/admin/users" element={<PageTransition><AdminRouteGuard><AdminUsers /></AdminRouteGuard></PageTransition>} />
        <Route path="/admin/lessons" element={<PageTransition><AdminRouteGuard><AdminLessons /></AdminRouteGuard></PageTransition>} />
        <Route path="/admin/practice" element={<PageTransition><AdminRouteGuard><AdminPractice /></AdminRouteGuard></PageTransition>} />
        <Route path="/admin/progress" element={<PageTransition><AdminRouteGuard><AdminProgress /></AdminRouteGuard></PageTransition>} />
        <Route path="/admin/vocabulary" element={<PageTransition><AdminRouteGuard><AdminVocabulary /></AdminRouteGuard></PageTransition>} />
        <Route path="/admin/achievements" element={<PageTransition><AdminRouteGuard><AdminAchievements /></AdminRouteGuard></PageTransition>} />
        <Route path="/admin/surveys" element={<PageTransition><AdminRouteGuard><AdminSurveys /></AdminRouteGuard></PageTransition>} />
        <Route path="/admin/videos" element={<PageTransition><AdminRouteGuard><AdminVideos /></AdminRouteGuard></PageTransition>} />
        <Route path="/admin/analytics" element={<PageTransition><AdminRouteGuard><AdminAnalytics /></AdminRouteGuard></PageTransition>} />
        <Route path="/admin/settings" element={<PageTransition><AdminRouteGuard><AdminSettings /></AdminRouteGuard></PageTransition>} />
        
        {/* Catch-all route must be last */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
      
      {/* Global Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
      
      {/* Survey Manager - handles showing survey after login */}
      <SurveyManager onShowSurvey={() => {
        console.log('📋 onShowSurvey callback called - setting isSurveyOpen to true');
        setIsSurveyOpen(true);
        // Mark survey as in progress when it first opens
        sessionStorage.setItem('speakbee_survey_in_progress', 'true');
        sessionStorage.setItem('speakbee_survey_step', 'user');
        console.log('✅ isSurveyOpen set to true, sessionStorage updated');
      }} />
      
      {/* Survey Overlay - Prevents blank page during transitions */}
      {/* Keep overlay visible if ANY survey step is open OR if survey is in progress */}
      {(() => {
        const anySurveyOpen = isSurveyOpen || isLanguageSurveyOpen || isEnglishLevelSurveyOpen || 
          isLearningPurposeSurveyOpen || isSpeakOutSurveyOpen || isAimSurveyOpen ||
          isFluentUnderstandingSurveyOpen || isLimitedWordsSurveyOpen || 
          isSentenceFormationSurveyOpen || isCantSpeakSurveyOpen || 
          isNeedFluencySurveyOpen || isHelloSurveyOpen || isMoviesSurveyOpen ||
          isVocabularySurveyOpen || isIntermediateVocabOpen || isAdvancedVocabOpen ||
          isInterestsOpen || isPersonalizationOpen;
        
        // Show overlay if any survey is open OR if survey is in progress (during transitions)
        if (anySurveyOpen || surveyInProgress) {
          return <div className="fixed inset-0 z-[9998] bg-white pointer-events-none" />;
        }
        return null;
      })()}

      {/* Global User Survey */}
      <UserSurvey 
        isOpen={isSurveyOpen}
        currentStep={1}
        totalSteps={17}
        onComplete={async (surveyData) => {
          console.log('📝 UserSurvey onComplete called, moving to step 2');
          
          // Save step 1 data to backend (ageRange)
          await saveSurveyStepToBackend('user', 1, { ageRange: surveyData.ageRange });
          
          // CRITICAL: Set sessionStorage flags FIRST before state changes
          // This ensures the refresh detection logic knows survey is active
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'language');
          setSurveyInProgress(true); // Update state for overlay
          console.log('✅ SessionStorage flags set for step 2');
          
          // Close current step first, then open next step
          // This prevents Radix UI Dialog conflicts when both are open
          console.log('🔒 Closing UserSurvey (step 1)...');
          setIsSurveyOpen(false);
          
          // Wait for current dialog to close, then open next one
          setTimeout(() => {
            console.log('🚀 Opening LanguageSurvey (step 2)...');
            setIsLanguageSurveyOpen(true);
            console.log('✅ Step 2 should now be visible');
          }, 200); // Wait for step 1 to fully close before opening step 2
        }}
        onSkip={() => {
          setIsSurveyOpen(false);
          setSurveyInProgress(false);
          // Clear survey progress flags and just_authenticated flag
          // This prevents the survey from showing again after skip
          sessionStorage.removeItem('speakbee_survey_in_progress');
          sessionStorage.removeItem('speakbee_survey_step');
          sessionStorage.removeItem('speakbee_survey_data');
          sessionStorage.removeItem('speakbee_just_authenticated');
        }}
      />

      <LanguageSurvey
        isOpen={isLanguageSurveyOpen}
        currentStep={2}
        totalSteps={17}
        onComplete={async (surveyData) => {
          console.log('📝 LanguageSurvey onComplete called, moving to step 3');
          
          // Save step 2 data to backend (nativeLanguage)
          await saveSurveyStepToBackend('language', 2, { nativeLanguage: surveyData.nativeLanguage });
          
          // Set flags FIRST before state changes
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'englishLevel');
          
          // Close current step first, then open next step
          console.log('🔒 Closing LanguageSurvey (step 2)...');
          setIsLanguageSurveyOpen(false);
          setTimeout(() => {
            console.log('🚀 Opening EnglishLevelSurvey (step 3)...');
            setIsEnglishLevelSurveyOpen(true);
          }, 200);
        }}
        onBack={() => {
          sessionStorage.setItem('speakbee_survey_step', 'user');
          setIsLanguageSurveyOpen(false);
          setIsSurveyOpen(true);
        }}
      />

      <EnglishLevelSurvey
        isOpen={isEnglishLevelSurveyOpen}
        currentStep={3}
        totalSteps={17}
        onComplete={async (surveyData) => {
          // Save step 3 data to backend (englishLevel)
          await saveSurveyStepToBackend('englishLevel', 3, { englishLevel: surveyData.englishLevel });
          
          // Set flags FIRST
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'learningPurpose');
          
          // Close current step first, then open next step
          setIsEnglishLevelSurveyOpen(false);
          setTimeout(() => {
            setIsLearningPurposeSurveyOpen(true);
          }, 200);
        }}
        onBack={() => {
          sessionStorage.setItem('speakbee_survey_step', 'language');
          setIsEnglishLevelSurveyOpen(false);
          setIsLanguageSurveyOpen(true);
        }}
      />

      <LearningPurposeSurvey
        isOpen={isLearningPurposeSurveyOpen}
        currentStep={4}
        totalSteps={17}
        onComplete={async (surveyData) => {
          // Save step 4 data to backend (learningPurpose)
          await saveSurveyStepToBackend('learningPurpose', 4, { learningPurpose: surveyData.learningPurpose });
          
          // Set flags FIRST
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'speakOut');
          
          // Open next step immediately, then close current step to prevent flash
          setIsSpeakOutSurveyOpen(true);
          requestAnimationFrame(() => {
            setIsLearningPurposeSurveyOpen(false);
          });
        }}
        onBack={() => {
          sessionStorage.setItem('speakbee_survey_step', 'englishLevel');
          setIsLearningPurposeSurveyOpen(false);
          setIsEnglishLevelSurveyOpen(true);
        }}
      />

      <SpeakOutSurvey
        isOpen={isSpeakOutSurveyOpen}
        currentStep={5}
        totalSteps={17}
        onComplete={async () => {
          // Save step 5 completion to backend
          const surveyDataStr = sessionStorage.getItem('speakbee_survey_data');
          const allData = surveyDataStr ? JSON.parse(surveyDataStr) : {};
          await saveSurveyStepToBackend('speakOut', 5, { stepCompleted: true, ...allData });
          
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'aim');
          setIsSpeakOutSurveyOpen(false);
          setTimeout(() => {
            setIsAimSurveyOpen(true);
          }, 200);
        }}
        onBack={() => {
          setIsSpeakOutSurveyOpen(false);
          setIsLearningPurposeSurveyOpen(true);
          sessionStorage.setItem('speakbee_survey_step', 'learningPurpose');
        }}
      />

      <AimSurvey
        isOpen={isAimSurveyOpen}
        currentStep={6}
        totalSteps={17}
        onComplete={async () => {
          // Save step 6 completion to backend
          const surveyDataStr = sessionStorage.getItem('speakbee_survey_data');
          const allData = surveyDataStr ? JSON.parse(surveyDataStr) : {};
          await saveSurveyStepToBackend('aim', 6, { stepCompleted: true, ...allData });
          
          // Keep survey in progress until final step
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'fluentUnderstanding');
          setIsAimSurveyOpen(false);
          setTimeout(() => {
            setIsFluentUnderstandingSurveyOpen(true);
          }, 200);
        }}
        onBack={() => {
          setIsAimSurveyOpen(false);
          setIsSpeakOutSurveyOpen(true);
          sessionStorage.setItem('speakbee_survey_step', 'speakOut');
        }}
      />

      <FluentUnderstandingSurvey
        isOpen={isFluentUnderstandingSurveyOpen}
        currentStep={7}
        totalSteps={17}
        onComplete={async () => {
          // Save step 7 completion to backend
          const surveyDataStr = sessionStorage.getItem('speakbee_survey_data');
          const allData = surveyDataStr ? JSON.parse(surveyDataStr) : {};
          await saveSurveyStepToBackend('fluentUnderstanding', 7, { stepCompleted: true, ...allData });
          
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'limitedWords');
          setIsFluentUnderstandingSurveyOpen(false);
          setTimeout(() => {
            setIsLimitedWordsSurveyOpen(true);
          }, 200);
        }}
        onBack={() => {
          setIsFluentUnderstandingSurveyOpen(false);
          setIsAimSurveyOpen(true);
          sessionStorage.setItem('speakbee_survey_step', 'aim');
        }}
      />

      <LimitedWordsSurvey
        isOpen={isLimitedWordsSurveyOpen}
        currentStep={8}
        totalSteps={17}
        onComplete={async () => {
          // Save step 8 completion to backend
          const surveyDataStr = sessionStorage.getItem('speakbee_survey_data');
          const allData = surveyDataStr ? JSON.parse(surveyDataStr) : {};
          await saveSurveyStepToBackend('limitedWords', 8, { stepCompleted: true, ...allData });
          
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'sentenceFormation');
          setIsLimitedWordsSurveyOpen(false);
          setTimeout(() => {
            setIsSentenceFormationSurveyOpen(true);
          }, 200);
        }}
        onBack={() => {
          setIsLimitedWordsSurveyOpen(false);
          setIsFluentUnderstandingSurveyOpen(true);
          sessionStorage.setItem('speakbee_survey_step', 'fluentUnderstanding');
        }}
      />

      <SentenceFormationSurvey
        isOpen={isSentenceFormationSurveyOpen}
        currentStep={9}
        totalSteps={17}
        onComplete={async () => {
          // Save step 9 completion to backend
          const surveyDataStr = sessionStorage.getItem('speakbee_survey_data');
          const allData = surveyDataStr ? JSON.parse(surveyDataStr) : {};
          await saveSurveyStepToBackend('sentenceFormation', 9, { stepCompleted: true, ...allData });
          
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'cantSpeak');
          setIsCantSpeakSurveyOpen(true);
          requestAnimationFrame(() => {
            setIsSentenceFormationSurveyOpen(false);
          });
        }}
        onBack={() => {
          setIsSentenceFormationSurveyOpen(false);
          setIsLimitedWordsSurveyOpen(true);
          sessionStorage.setItem('speakbee_survey_step', 'limitedWords');
        }}
      />

      <CantSpeakSurvey
        isOpen={isCantSpeakSurveyOpen}
        currentStep={10}
        totalSteps={17}
        onComplete={async () => {
          // Save step 10 completion to backend
          const surveyDataStr = sessionStorage.getItem('speakbee_survey_data');
          const allData = surveyDataStr ? JSON.parse(surveyDataStr) : {};
          await saveSurveyStepToBackend('cantSpeak', 10, { stepCompleted: true, ...allData });
          
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'needFluency');
          setIsCantSpeakSurveyOpen(false);
          setTimeout(() => {
            setIsNeedFluencySurveyOpen(true);
          }, 200);
        }}
        onBack={() => {
          setIsCantSpeakSurveyOpen(false);
          setIsSentenceFormationSurveyOpen(true);
          sessionStorage.setItem('speakbee_survey_step', 'sentenceFormation');
        }}
      />

      <NeedFluencySurvey
        isOpen={isNeedFluencySurveyOpen}
        currentStep={11}
        totalSteps={17}
        onComplete={async () => {
          // Save step 11 completion to backend
          const surveyDataStr = sessionStorage.getItem('speakbee_survey_data');
          const allData = surveyDataStr ? JSON.parse(surveyDataStr) : {};
          await saveSurveyStepToBackend('needFluency', 11, { stepCompleted: true, ...allData });
          
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'movies');
          setIsNeedFluencySurveyOpen(false);
          setTimeout(() => {
            setIsMoviesSurveyOpen(true);
          }, 200);
        }}
        onBack={() => {
          setIsNeedFluencySurveyOpen(false);
          setIsCantSpeakSurveyOpen(true);
          sessionStorage.setItem('speakbee_survey_step', 'cantSpeak');
        }}
      />

      <MoviesSurvey
        isOpen={isMoviesSurveyOpen}
        currentStep={12}
        totalSteps={17}
        onComplete={async () => {
          // Save step 12 completion to backend
          const surveyDataStr = sessionStorage.getItem('speakbee_survey_data');
          const allData = surveyDataStr ? JSON.parse(surveyDataStr) : {};
          await saveSurveyStepToBackend('movies', 12, { stepCompleted: true, ...allData });
          
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'vocabulary');
          setIsMoviesSurveyOpen(false);
          setTimeout(() => {
            setIsVocabularySurveyOpen(true);
          }, 200);
        }}
        onBack={() => {
          setIsMoviesSurveyOpen(false);
          setIsNeedFluencySurveyOpen(true);
          sessionStorage.setItem('speakbee_survey_step', 'needFluency');
        }}
      />

      <VocabularySurvey 
        isOpen={isVocabularySurveyOpen}
        currentStep={13}
        totalSteps={17}
        onComplete={async (surveyData) => {
          // Save step 13 data to backend (vocabulary words)
          // surveyData contains { vocabulary: string[], completedAt: string }
          await saveSurveyStepToBackend('vocabulary', 13, surveyData || { stepCompleted: true });
          
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'intermediateVocab');
          setIsVocabularySurveyOpen(false);
          setTimeout(() => {
            setIsIntermediateVocabOpen(true);
          }, 200);
        }}
        onBack={() => {
          setIsVocabularySurveyOpen(false);
          setIsMoviesSurveyOpen(true);
          sessionStorage.setItem('speakbee_survey_step', 'movies');
        }}
      />

      <IntermediateVocabularySurvey
        isOpen={isIntermediateVocabOpen}
        currentStep={14}
        totalSteps={17}
        onComplete={async (surveyData) => {
          // Save step 14 data to backend (intermediate vocabulary)
          // surveyData contains { intermediateVocabulary: string[], completedAt: string }
          await saveSurveyStepToBackend('intermediateVocab', 14, surveyData || { stepCompleted: true });
          
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'advancedVocab');
          setIsIntermediateVocabOpen(false);
          setTimeout(() => {
            setIsAdvancedVocabOpen(true);
          }, 200);
        }}
        onBack={() => {
          setIsIntermediateVocabOpen(false);
          setIsVocabularySurveyOpen(true);
          sessionStorage.setItem('speakbee_survey_step', 'vocabulary');
        }}
      />

      <AdvancedVocabularySurvey
        isOpen={isAdvancedVocabOpen}
        currentStep={15}
        totalSteps={17}
        onComplete={async (surveyData) => {
          // Save step 15 data to backend (advanced vocabulary)
          // surveyData contains { advancedVocabulary: string[], completedAt: string }
          await saveSurveyStepToBackend('advancedVocab', 15, surveyData || { stepCompleted: true });
          
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'interests');
          setIsAdvancedVocabOpen(false);
          setTimeout(() => {
            setIsInterestsOpen(true);
          }, 200);
        }}
        onBack={() => {
          setIsAdvancedVocabOpen(false);
          setIsIntermediateVocabOpen(true);
          sessionStorage.setItem('speakbee_survey_step', 'intermediateVocab');
        }}
      />

      <InterestsSurvey
        isOpen={isInterestsOpen}
        currentStep={16}
        totalSteps={17}
        onComplete={async (surveyData) => {
          // Save step 16 data to backend (interests)
          // surveyData contains { interests: string[], completedAt: string }
          await saveSurveyStepToBackend('interests', 16, surveyData || { stepCompleted: true });
          
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'hello');
          setIsInterestsOpen(false);
          setTimeout(() => {
            setIsHelloSurveyOpen(true);
          }, 200);
        }}
        onBack={() => {
          setIsInterestsOpen(false);
          setIsAdvancedVocabOpen(true);
          sessionStorage.setItem('speakbee_survey_step', 'advancedVocab');
        }}
      />

      <HelloSurvey
        isOpen={isHelloSurveyOpen}
        currentStep={17}
        totalSteps={17}
        onComplete={async () => {
          // Save step 17 completion to backend
          const surveyDataStr = sessionStorage.getItem('speakbee_survey_data');
          const allData = surveyDataStr ? JSON.parse(surveyDataStr) : {};
          await saveSurveyStepToBackend('hello', 17, { stepCompleted: true, ...allData });
          
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'personalization');
          setIsHelloSurveyOpen(false);
          setTimeout(() => {
            setIsPersonalizationOpen(true);
          }, 200);
        }}
        onBack={() => {
          setIsHelloSurveyOpen(false);
          setIsInterestsOpen(true);
          sessionStorage.setItem('speakbee_survey_step', 'interests');
        }}
      />

      <PersonalizationSurvey
        isOpen={isPersonalizationOpen}
        onComplete={async (surveyData) => {
          // Now that personalization is complete, save ALL survey data to MySQL
          try {
            // Save step 18 (personalization) to backend
            await saveSurveyStepToBackend('personalization', 18, {
              practiceGoalMinutes: surveyData?.practiceGoalMinutes,
              practiceStartTime: surveyData?.practiceStartTime,
              personalizationCompleted: true
            });
            
            // Collect all survey data from sessionStorage
            const surveyDataStr = sessionStorage.getItem('speakbee_survey_data');
            let allSurveyData: any = surveyData || {};
            
            if (surveyDataStr) {
              try {
                const parsedData = JSON.parse(surveyDataStr);
                allSurveyData = { ...parsedData, ...allSurveyData };
              } catch (e) {
                console.error('Error parsing survey data from sessionStorage:', e);
              }
            }

            // Mark as completed with personalization
            allSurveyData.personalizationCompleted = true;
            allSurveyData.completedAt = new Date().toISOString();

            // Save all survey data to MySQL via updateUserSurveyData
            if (updateUserSurveyData) {
              await updateUserSurveyData(allSurveyData);
              console.log('✅ All survey data saved to MySQL after personalization');
              
              // Sync user data with server to get updated survey data
              try {
                await syncWithServer();
              } catch (error) {
                console.warn('Failed to sync user data after survey completion:', error);
              }
            }

            // Clear session storage
            sessionStorage.removeItem('speakbee_survey_in_progress');
            sessionStorage.removeItem('speakbee_survey_step');
            sessionStorage.removeItem('speakbee_survey_data');

            // Clear the just_authenticated flag since survey is now complete
            sessionStorage.removeItem('speakbee_just_authenticated');
            
            // Determine the appropriate learning page based on survey responses
            const learningPage = getLearningPageFromSurvey(allSurveyData);
            
            // Store the initial route for eligibility checking
            const { InitialRouteService } = await import('@/services/InitialRouteService');
            InitialRouteService.setInitialRoute(learningPage as any);
            
            // Clear survey progress state
            setSurveyInProgress(false);
            sessionStorage.removeItem('speakbee_survey_in_progress');
            sessionStorage.removeItem('speakbee_survey_step');
            
            // Keep dialog open during redirect to prevent blank page
            console.log('✅ Survey completed! Redirecting to learning page:', learningPage);
            setTimeout(() => {
              // Close dialog and redirect to appropriate learning page
              setIsPersonalizationOpen(false);
              navigate(learningPage);
            }, 500);
          } catch (error) {
            console.error('Error saving survey data:', error);
            // Clear survey progress state even on error
            setSurveyInProgress(false);
            sessionStorage.removeItem('speakbee_survey_in_progress');
            sessionStorage.removeItem('speakbee_survey_step');
            
            // Even if save fails, determine and redirect to appropriate learning page
            const surveyDataStr = sessionStorage.getItem('speakbee_survey_data');
            let fallbackSurveyData: any = surveyData || {};
            if (surveyDataStr) {
              try {
                const parsedData = JSON.parse(surveyDataStr);
                fallbackSurveyData = { ...parsedData, ...fallbackSurveyData };
              } catch (e) {
                console.error('Error parsing survey data from sessionStorage:', e);
              }
            }
            const learningPage = getLearningPageFromSurvey(fallbackSurveyData);
            
            // Store the initial route for eligibility checking (even on error)
            try {
              const { InitialRouteService } = await import('@/services/InitialRouteService');
              InitialRouteService.setInitialRoute(learningPage as any);
            } catch (e) {
              console.error('Error setting initial route:', e);
            }
            
            setTimeout(() => {
              setIsPersonalizationOpen(false);
              navigate(learningPage);
            }, 500);
          }
        }}
        onBack={() => {
          setIsPersonalizationOpen(false);
          setIsHelloSurveyOpen(true);
          sessionStorage.setItem('speakbee_survey_step', 'hello');
        }}
      />
    </>
  );
};

// ✅ Main App Component
const App = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsInitialLoading(false), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  // Get Google Client ID from environment variables
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                {isInitialLoading ? (
                  <LoadingScreen />
                ) : (
                  <RouteLoadingProvider>
                    <ConditionalLayout>
                      <AppRoutes />
                    </ConditionalLayout>
                  </RouteLoadingProvider>
                )}
              </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
};

export default App;