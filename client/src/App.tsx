import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";

// ✅ Contexts & Providers
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { prefetchAppShell } from "@/services/OfflinePrefetch";

// ✅ Global Components
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/landing/Footer";
import FloatingIconsLayer from "@/components/common/FloatingIconsLayer";
import { LoadingScreen } from "@/components/landing/LoadingScreen";
import OfflineIndicator from "@/components/common/OfflineIndicator";
import CookieConsent from "@/components/common/CookieConsent";

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
import ModelManagerPage from "@/pages/ModelManager";
import ParentalControlsPage from "@/pages/ParentalControlsPage";
import KidsGamePage from "@/pages/KidsGamePage";
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
import InterestsSurvey from "@/components/surveys/InterestsSurvey";
import SurveyManager from "@/components/surveys/SurveyManager";

const queryClient = new QueryClient();

// ✅ Smooth Page Transition Wrapper
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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
  const [isInterestsOpen, setIsInterestsOpen] = useState(false);

  // Handle survey state on page refresh - ALWAYS start from first survey page
  useEffect(() => {
    const surveyInProgress = sessionStorage.getItem('speakbee_survey_in_progress');
    const stepInSession = sessionStorage.getItem('speakbee_survey_step');
    const userData = localStorage.getItem('speakbee_current_user');

    let isSurveyComplete = false;
    let hasAnySurveyAnswer = false;

    // Inspect saved user data for completion or partial answers
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const data = user?.surveyData || {};
        isSurveyComplete = Boolean(
          data.ageRange &&
          data.nativeLanguage &&
          Array.isArray(data.learningPurpose) && data.learningPurpose.length &&
          data.englishLevel
        );
        hasAnySurveyAnswer = Boolean(
          data.ageRange ||
          data.nativeLanguage ||
          (Array.isArray(data.learningPurpose) && data.learningPurpose.length) ||
          data.englishLevel
        );
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // If survey is complete, clear flags
    if (isSurveyComplete) {
      sessionStorage.removeItem('speakbee_survey_in_progress');
      sessionStorage.removeItem('speakbee_survey_step');
      return;
    }

    // If survey is not complete but there are partial answers OR prior survey flags, open Step 1
    if (hasAnySurveyAnswer || surveyInProgress === 'true' || stepInSession) {
      setIsSurveyOpen(true);
      sessionStorage.setItem('speakbee_survey_in_progress', 'true');
      sessionStorage.setItem('speakbee_survey_step', 'user');
      return;
    }
  }, []);

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
        <Route path="/kids/certificates" element={<PageTransition><CertificatesPage /></PageTransition>} />
        <Route path="/kids/games/:gameId" element={<PageTransition><KidsGamePage /></PageTransition>} />
        <Route path="/favorites/young" element={<PageTransition><YoungKidsFavoritesPage /></PageTransition>} />
        <Route path="/favorites/teen" element={<PageTransition><TeenKidsFavoritesPage /></PageTransition>} />
        <Route path="/model-manager" element={<PageTransition><ModelManagerPage /></PageTransition>} />
        <Route path="/parental-controls" element={<PageTransition><ParentalControlsPage /></PageTransition>} />
        <Route path="/adults" element={<PageTransition><Adults /></PageTransition>} />
        <Route path="/adults/beginners" element={<PageTransition><Beginners /></PageTransition>} />
        <Route path="/adults/intermediates" element={<PageTransition><Intermediates /></PageTransition>} />
        <Route path="/adults/advanced" element={<PageTransition><Advanced /></PageTransition>} />
        <Route path="/ielts-pte" element={<PageTransition><IeltsPte /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        <Route path="/pricing" element={<PageTransition><PricingPage /></PageTransition>} />
        <Route path="/verify-email/:token" element={<PageTransition><VerifyEmail /></PageTransition>} />
        <Route path="/terms-and-conditions" element={<PageTransition><TermsAndConditionsPage /></PageTransition>} />
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
        totalSteps={15}
        onComplete={() => {
          setIsSurveyOpen(false);
          setIsLanguageSurveyOpen(true);
          // Mark survey as in progress
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'language');
        }}
        onSkip={() => {
          setIsSurveyOpen(false);
          // Clear survey progress flag
          sessionStorage.removeItem('speakbee_survey_in_progress');
          sessionStorage.removeItem('speakbee_survey_step');
        }}
      />

      <LanguageSurvey
        isOpen={isLanguageSurveyOpen}
        currentStep={2}
        totalSteps={15}
        onComplete={() => {
          setIsLanguageSurveyOpen(false);
          setIsEnglishLevelSurveyOpen(true);
          // Keep survey in progress
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'englishLevel');
        }}
        onBack={() => {
          setIsLanguageSurveyOpen(false);
          setIsSurveyOpen(true);
          sessionStorage.setItem('speakbee_survey_step', 'user');
        }}
      />

      <EnglishLevelSurvey
        isOpen={isEnglishLevelSurveyOpen}
        currentStep={3}
        totalSteps={15}
        onComplete={() => {
          setIsEnglishLevelSurveyOpen(false);
          setIsLearningPurposeSurveyOpen(true);
          // Keep in progress until final step completes
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'learningPurpose');
        }}
        onBack={() => {
          setIsEnglishLevelSurveyOpen(false);
          setIsLanguageSurveyOpen(true);
          sessionStorage.setItem('speakbee_survey_step', 'language');
        }}
      />

      <LearningPurposeSurvey
        isOpen={isLearningPurposeSurveyOpen}
        currentStep={4}
        totalSteps={15}
        onComplete={() => {
          setIsLearningPurposeSurveyOpen(false);
          setIsSpeakOutSurveyOpen(true);
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
          sessionStorage.setItem('speakbee_survey_step', 'speakOut');
        }}
        onBack={() => {
          setIsLearningPurposeSurveyOpen(false);
          setIsEnglishLevelSurveyOpen(true);
          sessionStorage.setItem('speakbee_survey_step', 'englishLevel');
        }}
      />

      <SpeakOutSurvey
        isOpen={isSpeakOutSurveyOpen}
        currentStep={5}
        totalSteps={15}
        onComplete={() => {
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
        totalSteps={15}
        onComplete={() => {
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
        totalSteps={15}
        onComplete={() => {
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
        totalSteps={15}
        onComplete={() => {
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
        totalSteps={15}
        onComplete={() => {
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
        totalSteps={15}
        onComplete={() => {
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
        totalSteps={15}
        onComplete={() => {
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
        totalSteps={15}
        onComplete={() => {
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
        onComplete={() => {
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
        onComplete={() => {
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
        onComplete={() => {
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
        onComplete={() => {
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
        onComplete={() => {
          setIsHelloSurveyOpen(false);
          // Survey completed - clear the flag
          sessionStorage.removeItem('speakbee_survey_in_progress');
          sessionStorage.removeItem('speakbee_survey_step');
        }}
        onBack={() => {
          setIsHelloSurveyOpen(false);
          setIsInterestsOpen(true);
          sessionStorage.setItem('speakbee_survey_step', 'interests');
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

  // Ask service worker to pre-cache key routes shortly after mount
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const id = window.setTimeout(() => {
        prefetchAppShell();
      }, 1200);
      return () => window.clearTimeout(id);
    }
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
                <div className="min-h-screen flex flex-col relative">
                  <FloatingIconsLayer />
                  <OfflineIndicator />
                  <Navbar />
                  <main className="flex-1">
                    <AppRoutes />
                  </main>
                  <Footer />
                  <CookieConsent />
                </div>
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