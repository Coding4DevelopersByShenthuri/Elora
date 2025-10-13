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
  const [isEnglishLevelSurveyOpen, setIsEnglishLevelSurveyOpen] = useState(false);

  // Handle survey state on page refresh - redirect to first survey page
  useEffect(() => {
    const surveyInProgress = sessionStorage.getItem('speakbee_survey_in_progress');
    const userData = localStorage.getItem('speakbee_current_user');
    
    // Check if survey is complete
    if (userData) {
      try {
        const user = JSON.parse(userData);
        // If survey is fully completed, clear the flag
        if (user.surveyData?.ageRange && user.surveyData?.nativeLanguage && user.surveyData?.englishLevel) {
          sessionStorage.removeItem('speakbee_survey_in_progress');
          return;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    // If survey is in progress and not completed, redirect to first page
    if (surveyInProgress === 'true') {
      setIsSurveyOpen(true);
      setIsLanguageSurveyOpen(false);
      setIsEnglishLevelSurveyOpen(false);
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
      }} />
      
      {/* Global User Survey */}
      <UserSurvey 
        isOpen={isSurveyOpen}
        onComplete={() => {
          setIsSurveyOpen(false);
          setIsLanguageSurveyOpen(true);
          // Mark survey as in progress
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
        }}
        onSkip={() => {
          setIsSurveyOpen(false);
          // Clear survey progress flag
          sessionStorage.removeItem('speakbee_survey_in_progress');
        }}
      />

      <LanguageSurvey
        isOpen={isLanguageSurveyOpen}
        onComplete={() => {
          setIsLanguageSurveyOpen(false);
          setIsEnglishLevelSurveyOpen(true);
          // Keep survey in progress
          sessionStorage.setItem('speakbee_survey_in_progress', 'true');
        }}
        onBack={() => {
          setIsLanguageSurveyOpen(false);
          setIsSurveyOpen(true);
        }}
      />

      <EnglishLevelSurvey
        isOpen={isEnglishLevelSurveyOpen}
        onComplete={() => {
          setIsEnglishLevelSurveyOpen(false);
          // Survey completed - clear the flag
          sessionStorage.removeItem('speakbee_survey_in_progress');
        }}
        onBack={() => {
          setIsEnglishLevelSurveyOpen(false);
          setIsLanguageSurveyOpen(true);
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