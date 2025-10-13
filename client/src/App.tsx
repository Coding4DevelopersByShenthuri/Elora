import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ✅ Contexts & Providers
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

// ✅ Global Components
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import FloatingIconsLayer from "@/components/FloatingIconsLayer";
import { LoadingScreen } from "@/components/landing/LoadingScreen";
import OfflineIndicator from "@/components/OfflineIndicator";

// ✅ Pages
import Index from "@/pages/Index";
import WhyPage from "@/pages/WhyPage";
import HowPage from "@/pages/HowPage";
import ManagePage from "@/pages/ManagePage";
import Profile from "@/pages/Profile";
import Import from "@/pages/Import";
import SearchPage from "@/pages/SearchPage";
import Settings from "@/pages/Settings";
import HelpPage from "@/pages/HelpPage";
import ContactPage from "@/pages/ContactPage";
import KidsPage from "@/pages/Kids";
import Adults from "@/pages/adults/adults";
import Beginners from "@/pages/adults/Beginners";
import Intermediates from "@/pages/adults/Intermediates";
import Advanced from "@/pages/adults/Advanced";
import IeltsPte from "@/pages/IeltsPte";
import NotFound from "@/pages/NotFound";
import PricingPage from "@/pages/PricingPage";

// ✅ Import AuthModal, UserSurvey, and SurveyManager
import AuthModal from "@/components/AuthModal";
import UserSurvey from "@/components/UserSurvey";
import LanguageSurvey from "@/components/LanguageSurvey";
import EnglishLevelSurvey from "@/components/EnglishLevelSurvey";
import LearningPurposeSurvey from "@/components/LearningPurposeSurvey";
import SpeakOutSurvey from "@/components/SpeakOutSurvey";
import AimSurvey from "@/components/AimSurvey";
import FluentUnderstandingSurvey from "@/components/FluentUnderstandingSurvey";
import SurveyManager from "@/components/SurveyManager";

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

  // Handle survey state on page refresh - redirect to first survey page
  useEffect(() => {
    const surveyInProgress = sessionStorage.getItem('speakbee_survey_in_progress');
    const surveyStep = sessionStorage.getItem('speakbee_survey_step');
    const userData = localStorage.getItem('speakbee_current_user');
    
    // Check if survey is complete
    if (userData) {
      try {
        const user = JSON.parse(userData);
        // If survey is fully completed, clear the flag
        if (
          user.surveyData?.ageRange &&
          user.surveyData?.nativeLanguage &&
          user.surveyData?.learningPurpose?.length &&
          user.surveyData?.englishLevel
        ) {
          sessionStorage.removeItem('speakbee_survey_in_progress');
          sessionStorage.removeItem('speakbee_survey_step');
          return;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    // If survey is in progress and not completed, restore the last open step
    if (surveyInProgress === 'true') {
      switch (surveyStep) {
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
        case 'user':
        default:
          setIsSurveyOpen(true);
      }
    }
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/why" element={<PageTransition><WhyPage /></PageTransition>} />
        <Route path="/how" element={<PageTransition><HowPage /></PageTransition>} />
        <Route path="/manage" element={<PageTransition><ManagePage /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/import" element={<PageTransition><Import /></PageTransition>} />
        <Route path="/search" element={<PageTransition><SearchPage /></PageTransition>} />
        <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
        <Route path="/help" element={<PageTransition><HelpPage /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
        <Route path="/kids" element={<PageTransition><KidsPage /></PageTransition>} />
        <Route path="/adults" element={<PageTransition><Adults /></PageTransition>} />
        <Route path="/adults/beginners" element={<PageTransition><Beginners /></PageTransition>} />
        <Route path="/adults/intermediates" element={<PageTransition><Intermediates /></PageTransition>} />
        <Route path="/adults/advanced" element={<PageTransition><Advanced /></PageTransition>} />
        <Route path="/ielts-pte" element={<PageTransition><IeltsPte /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        <Route path="/pricing" element={<PageTransition><PricingPage /></PageTransition>} />
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
        totalSteps={7}
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
        totalSteps={7}
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
        totalSteps={7}
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
        totalSteps={7}
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
        totalSteps={7}
        onComplete={() => {
          setIsFluentUnderstandingSurveyOpen(false);
          // Survey completed - clear the flag
          sessionStorage.removeItem('speakbee_survey_in_progress');
          sessionStorage.removeItem('speakbee_survey_step');
        }}
        onBack={() => {
          setIsFluentUnderstandingSurveyOpen(false);
          setIsAimSurveyOpen(true);
          sessionStorage.setItem('speakbee_survey_step', 'aim');
        }}
      />
    </>
  );
};

// ✅ Main App Component
const App = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsInitialLoading(false), 800);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
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
                </div>
              )}
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;