import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import ManagePage from "@/pages/ManagePage";
import Profile from "@/pages/Profile";
import Import from "@/pages/Import";
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
import IeltsPte from "@/pages/IeltsPte";
import NotFound from "@/pages/NotFound";
import PricingPage from "@/pages/PricingPage";
import VerifyEmail from "@/pages/VerifyEmail";
import TermsAndConditionsPage from "@/pages/TermsAndConditionsPage";
import CertificatesPage from "@/pages/Certificates";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminLessons from "@/pages/admin/AdminLessons";
import AdminPractice from "@/pages/admin/AdminPractice";
import AdminProgress from "@/pages/admin/AdminProgress";
import AdminVocabulary from "@/pages/admin/AdminVocabulary";
import AdminAchievements from "@/pages/admin/AdminAchievements";
import AdminSurveys from "@/pages/admin/AdminSurveys";
import { Analytics } from "@/components/common/Analytics";
import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
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

// ✅ Route Definitions
const AppRoutes = () => {
  const { updateUserSurveyData, syncWithServer, user, isOnline } = useAuth();
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
        <Route path="/manage" element={<PageTransition><ManagePage /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/import" element={<PageTransition><Import /></PageTransition>} />
        <Route path="/search" element={<PageTransition><SearchPage /></PageTransition>} />
        <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
        <Route path="/help" element={<PageTransition><HelpPage /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
        <Route path="/kids" element={<PageTransition><KidsPage /></PageTransition>} />
        <Route path="/kids/young" element={<PageTransition><YoungKidsPage /></PageTransition>} />
        <Route path="/kids/teen" element={<PageTransition><TeenKidsPage /></PageTransition>} />
        <Route path="/kids/games/:gameId" element={<PageTransition><KidsGamePage /></PageTransition>} />
        <Route path="/kids/games/history" element={<PageTransition><GameHistoryPage /></PageTransition>} />
        <Route path="/favorites" element={<PageTransition><FavoritesPage /></PageTransition>} />
        <Route path="/favorites/young" element={<PageTransition><YoungKidsFavoritesPage /></PageTransition>} />
        <Route path="/favorites/teen" element={<PageTransition><TeenKidsFavoritesPage /></PageTransition>} />
        <Route path="/parental-controls" element={<PageTransition><ParentalControlsPage /></PageTransition>} />
        <Route path="/adults" element={<PageTransition><Adults /></PageTransition>} />
        <Route path="/adults/beginners" element={<PageTransition><Beginners /></PageTransition>} />
        <Route path="/adults/intermediates" element={<PageTransition><Intermediates /></PageTransition>} />
        <Route path="/adults/advanced" element={<PageTransition><Advanced /></PageTransition>} />
        <Route path="/ielts-pte" element={<PageTransition><IeltsPte /></PageTransition>} />
        <Route path="/pricing" element={<PageTransition><PricingPage /></PageTransition>} />
        <Route path="/verify-email/:token" element={<PageTransition><VerifyEmail /></PageTransition>} />
        <Route path="/terms-and-conditions" element={<PageTransition><TermsAndConditionsPage /></PageTransition>} />
        <Route path="/certificates" element={<PageTransition><CertificatesPage /></PageTransition>} />
        
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
        setIsSurveyOpen(true);
        // Mark survey as in progress when it first opens
        sessionStorage.setItem('speakbee_survey_in_progress', 'true');
        sessionStorage.setItem('speakbee_survey_step', 'user');
      }} />
      
      {/* Global User Survey */}
      <UserSurvey 
        isOpen={isSurveyOpen}
        currentStep={1}
        totalSteps={17}
        onComplete={async (surveyData) => {
          console.log('UserSurvey onComplete called, moving to step 2');
          
          // Save step 1 data to backend (ageRange)
          await saveSurveyStepToBackend('user', 1, { ageRange: surveyData.ageRange });
          
          // CRITICAL: Set sessionStorage flags FIRST before state changes
          // This ensures the refresh detection logic knows survey is active
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'language');
          console.log('SessionStorage flags set:', {
            inProgress: sessionStorage.getItem('speakbee_survey_in_progress'),
            step: sessionStorage.getItem('speakbee_survey_step')
          });
          
          // Close current step first, then open next step after a brief delay
          // This ensures the Dialog component properly closes before the next one opens
          setIsSurveyOpen(false);
          console.log('Step 1 closed, opening step 2...');
          // Use a small delay to ensure smooth transition between dialogs
          setTimeout(() => {
            setIsLanguageSurveyOpen(true);
            console.log('Step 2 opened');
          }, 100);
        }}
        onSkip={() => {
          setIsSurveyOpen(false);
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
          // Save step 2 data to backend (nativeLanguage)
          await saveSurveyStepToBackend('language', 2, { nativeLanguage: surveyData.nativeLanguage });
          
          // Set flags FIRST before state changes
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'englishLevel');
          
          // Then update state
          setIsLanguageSurveyOpen(false);
          setIsEnglishLevelSurveyOpen(true);
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
          
          // Then update state
          setIsEnglishLevelSurveyOpen(false);
          setIsLearningPurposeSurveyOpen(true);
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
          
          // Then update state
          setIsLearningPurposeSurveyOpen(false);
          setIsSpeakOutSurveyOpen(true);
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
          
          setIsSpeakOutSurveyOpen(false);
          setIsAimSurveyOpen(true);
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'aim');
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
          
          setIsAimSurveyOpen(false);
          setIsFluentUnderstandingSurveyOpen(true);
          // Keep survey in progress until final step
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'fluentUnderstanding');
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
          
          setIsFluentUnderstandingSurveyOpen(false);
          setIsLimitedWordsSurveyOpen(true);
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'limitedWords');
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
          
          setIsLimitedWordsSurveyOpen(false);
          setIsSentenceFormationSurveyOpen(true);
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'sentenceFormation');
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
          
          setIsSentenceFormationSurveyOpen(false);
          setIsCantSpeakSurveyOpen(true);
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'cantSpeak');
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
          
          setIsCantSpeakSurveyOpen(false);
          setIsNeedFluencySurveyOpen(true);
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'needFluency');
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
          
          setIsNeedFluencySurveyOpen(false);
          setIsMoviesSurveyOpen(true);
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'movies');
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
          
          setIsMoviesSurveyOpen(false);
          setIsVocabularySurveyOpen(true);
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'vocabulary');
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
          
          setIsVocabularySurveyOpen(false);
          setIsIntermediateVocabOpen(true);
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'intermediateVocab');
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
          
          setIsIntermediateVocabOpen(false);
          setIsAdvancedVocabOpen(true);
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'advancedVocab');
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
          
          setIsAdvancedVocabOpen(false);
          setIsInterestsOpen(true);
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'interests');
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
          
          setIsInterestsOpen(false);
          setIsHelloSurveyOpen(true);
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'hello');
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
          
          setIsHelloSurveyOpen(false);
          setIsPersonalizationOpen(true);
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'personalization');
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
          setIsPersonalizationOpen(false);
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

            // Smart redirect: send user to recommended page based on survey
            // Use the saved survey data for redirect decision
            try {
              const age = (allSurveyData.ageRange || '').toLowerCase();
              const purposes: string[] = Array.isArray(allSurveyData.learningPurpose) 
                ? allSurveyData.learningPurpose.map((p: any) => String(p).toLowerCase()) 
                : [];
              const englishLevel = (allSurveyData.englishLevel || '').toLowerCase();

              let target = '/';
              
              // Priority order: Check specific age ranges first, then general, then purposes, then levels
              // Kids - Young (4-11 or 4-10)
              if (
                age.includes('4-11') ||
                age.includes('4 – 11') ||
                age.includes('4–11') ||
                age.includes('4 to 11') ||
                age.includes('4-10') || // legacy support
                age.includes('4 – 10') ||
                age.includes('4–10') ||
                age.includes('4 to 10')
              ) {
                target = '/kids/young';
              } 
              // Kids - Teen (11-17 or 12-17)
              else if (
                age.includes('11-17') ||
                age.includes('11 – 17') ||
                age.includes('11–17') ||
                age.includes('11 to 17') ||
                age.includes('12-17') ||
                age.includes('12 – 17') ||
                age.includes('12–17') ||
                age.includes('12 to 17')
              ) {
                target = '/kids/teen';
              }
              // Kids - General (4-17) - catch-all for kids
              else if (
                age.includes('4-17') ||
                age.includes('4 – 17') ||
                age.includes('4–17') ||
                age.includes('4 to 17') ||
                age.startsWith('4') // Any age starting with 4 (kids)
              ) {
                target = '/kids';
              }
              // IELTS/PTE (exam preparation)
              else if (purposes.includes('ielts') || purposes.includes('pte')) {
                target = '/ielts-pte';
              } 
              // Adults by English level
              else if (englishLevel.includes('beginner') || englishLevel.includes('a1') || englishLevel.includes('a2')) {
                target = '/adults/beginners';
              } else if (englishLevel.includes('intermediate') || englishLevel.includes('b1') || englishLevel.includes('b2')) {
                target = '/adults/intermediates';
              } else if (englishLevel.includes('advanced') || englishLevel.includes('c1') || englishLevel.includes('c2')) {
                target = '/adults/advanced';
              } else {
                // Default to adults page if no specific match
                target = '/adults';
              }

              // Clear the just_authenticated flag since survey is now complete
              sessionStorage.removeItem('speakbee_just_authenticated');
              
              // Redirect to recommended learning page based on survey categories
              console.log('🔄 Redirecting to:', target, 'based on survey data:', { age, purposes, englishLevel });
              setTimeout(() => {
                window.location.href = target;
              }, 800);
            } catch (error) {
              console.error('Error redirecting after survey completion:', error);
              // Clear flags even on error
              sessionStorage.removeItem('speakbee_just_authenticated');
              // Fallback to home if redirect fails
              setTimeout(() => {
                window.location.href = '/';
              }, 800);
            }
          } catch (error) {
            console.error('Error saving survey data:', error);
            // Even if save fails, try to redirect based on available data
            setTimeout(() => {
              window.location.href = '/';
            }, 800);
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