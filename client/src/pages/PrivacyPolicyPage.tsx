import { useEffect } from 'react';
import { Calendar, ShieldCheck } from 'lucide-react';

const PrivacyPolicyPage = () => {
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
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline">Privacy Policy</span>
              <span className="sm:hidden">Privacy</span>
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
            Privacy Policy
          </h1>
          <p className="text-muted-foreground mb-6">
            This page describes, in simple language, how Elora handles your data. It is intended
            to complement the legal Terms and Conditions and can be updated as the product evolves.
          </p>
          <p className="text-muted-foreground mb-4">
            We collect only the information necessary to provide and improve Elora, such as account
            details, learning progress, and limited device data. Voice and learning interactions are
            processed according to the data protection principles already outlined in our Terms and
            Conditions agreement.
          </p>
          <p className="text-muted-foreground mb-4">
            For full legal details about data processing, your rights, and security measures,
            please refer to the&nbsp;
            <a href="/terms-and-conditions" className="text-primary underline">
              Terms and Conditions
            </a>
            &nbsp;page, especially the sections on Privacy and Data Protection.
          </p>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;


