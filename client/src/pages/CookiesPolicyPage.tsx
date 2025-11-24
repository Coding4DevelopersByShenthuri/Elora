import { useEffect } from 'react';
import { Cookie, Calendar } from 'lucide-react';

const CookiesPolicyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pt-24 sm:pt-28 md:pt-32 lg:pt-36">
      {/* Background elements - match subtle app styling */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent -z-10 pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/3 left-0 w-[250px] h-[250px] rounded-full bg-accent/5 blur-3xl -z-10 pointer-events-none" />

      <header className="w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Cookie className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline">Cookie Policy</span>
              <span className="sm:hidden">Cookies</span>
            </div>
          </div>
          <div className="hidden md:flex items-center text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 mr-2" />
            Last Updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </header>

      <main className="container px-4 md:px-8 py-8 md:py-12 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            Cookie Policy
          </h1>
          <p className="text-muted-foreground mb-6">
            This page explains, in simple terms, how Elora uses cookies and similar technologies.
            It is intended as a friendly overview that works alongside the formal Terms and
            Conditions.
          </p>
          <p className="text-muted-foreground mb-4">
            Elora may use cookies or local storage to remember your preferences, keep you signed in,
            and help us understand how the app is used so we can improve it. We do not sell your
            data, and any analytics are used only to enhance your learning experience.
          </p>
          <p className="text-muted-foreground mb-4">
            You can adjust cookie-related preferences using the in-app&nbsp;
            <strong>Cookie Consent</strong> banner or controls. For more details on how your data is
            handled overall, please review the&nbsp;
            <a href="/terms-and-conditions" className="text-primary underline">
              Terms and Conditions
            </a>
            &nbsp;page and any related privacy sections.
          </p>
        </div>
      </main>
    </div>
  );
};

export default CookiesPolicyPage;


