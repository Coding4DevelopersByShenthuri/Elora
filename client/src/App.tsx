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

// ✅ Import AuthModal
import AuthModal from "@/components/AuthModal";

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