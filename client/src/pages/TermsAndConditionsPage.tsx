import { useEffect, useState, useRef } from 'react';
import { Calendar, Search, ChevronRight, FileText, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TERMS_AND_CONDITIONS } from '@/data/terms-and-conditions';
import { cn } from '@/lib/utils';

const TermsAndConditionsPage = () => {
  const [activeSection, setActiveSection] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Parse sections for Table of Contents
  const sections = [
    "The Agreement", "Introduction", "Definitions/Terminology", "User Obligations",
    "Product/Service Details", "Intellectual Property Rights", "Service Specifications",
    "Payment and Financial Terms", "User Responsibilities and Conduct", "Privacy and Data Protection",
    "Disclaimer of Warranties", "Limitation of Liability", "Modifications to Terms",
    "Termination and Suspension", "Special User Categories", "Governing Law and Dispute Resolution",
    "Contact Information and Support", "Entire Agreement", "Severability", "No Waiver", "Assignment"
  ];

  const subHeadings = [
    "Accurate Information", "Compliance with Laws", "Lawful Use", "Account Security",
    "Our Intellectual Property", "Your Content", "License Grant", "Technical Requirements",
    "Offline Capabilities", "Service Models", "Payment Terms", "Free Trial Offers",
    "Permitted Uses", "Prohibited Activities", "Data Processing Architecture", "Data Collection",
    "Data Security", "By You", "By Elora", "Effect of Termination",
    "For Parents/Guardians (Kids Module)", "For Educational Institutions", "For Examination Candidates",
    "Governing Law", "Dispute Resolution", "Class Action Waiver"
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Setup Intersection Observer for active section highlighting
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -35% 0px' }
    );

    document.querySelectorAll('section[id]').forEach((section) => {
      observerRef.current?.observe(section);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  // Show "back to top" button after scrolling
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 140; // Sticky app + page header offset
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSection(id);
    }
  };

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // content parser that generates a structured React tree
  const parseContent = () => {
    const lines = TERMS_AND_CONDITIONS.split('\n');
    const contentNodes: React.ReactNode[] = [];
    let currentSectionId = '';
    let inList = false;
    let listItems: React.ReactNode[] = [];

    const flushList = () => {
      if (inList && listItems.length > 0) {
        contentNodes.push(
          <ul key={`list-${contentNodes.length}`} className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground marker:text-primary">
            {listItems}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    lines.forEach((line, i) => {
      const text = line.trim();
      if (!text) return;

      // Skip metadata
      if (i < 10 && (text.includes('Last Updated:') || text.includes('www.') || text.includes('@'))) return;
      if (text === 'Terms and Conditions Agreement') return;

      // Major Section
      if (sections.some(s => text.includes(s))) {
        flushList();
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        currentSectionId = id;
        contentNodes.push(
          <section key={i} id={id} className="scroll-mt-24 mb-10 border-t border-border/40 pt-10 first:border-0 first:pt-0">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2 group">
              {text}
              <a href={`#${id}`} className="opacity-0 group-hover:opacity-100 text-primary transition-opacity ml-2" aria-label="Anchor link">#</a>
            </h2>
          </section>
        );
        return;
      }

      // Sub Section
      if (subHeadings.some(s => text.includes(s) && text.length < 60)) {
        flushList();
        contentNodes.push(
          <h3 key={i} className="text-lg font-semibold text-foreground/90 mt-6 mb-3">
            {text}
          </h3>
        );
        return;
      }

      // List Item
      if (text.startsWith('- ')) {
        inList = true;
        listItems.push(
          <li key={i} className="pl-1">
            {text.substring(2)}
          </li>
        );
        return;
      }

      // CAPS disclaimer
      if (text.length > 20 && text === text.toUpperCase() && !text.includes('http')) {
        flushList();
        contentNodes.push(
          <div key={i} className="my-6 p-4 bg-primary/5 border-l-4 border-primary rounded-r-lg">
            <p className="text-sm font-bold text-primary/80 uppercase tracking-wide leading-relaxed">
              {text}
            </p>
          </div>
        );
        return;
      }

      // Regular Paragraph
      flushList();
      
      // If we just started a section, append paragraph to it? 
      // React structure is flat here for simplicity, relying on section anchors for nav
      contentNodes.push(
        <p key={i} className="mb-4 text-muted-foreground leading-7 text-[15px]">
          {text}
        </p>
      );
    });

    flushList();
    return contentNodes;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pt-24 sm:pt-28 md:pt-32 lg:pt-36">
      {/* Background elements - light green tint in light mode, consistent with home hero styling */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#d8f3dc] to-transparent dark:from-primary/5 -z-10 pointer-events-none"></div>
      <div className="absolute top-1/3 right-0 w-[300px] h-[300px] rounded-full bg-[#b7e4c7]/80 dark:bg-primary/5 blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/3 left-0 w-[250px] h-[250px] rounded-full bg-[#d8f3dc]/80 dark:bg-accent/5 blur-3xl -z-10 pointer-events-none"></div>

      {/* Top Navigation Bar (non-sticky to avoid overlapping global navbar) */}
      <header className="w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <FileText className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline">Terms &amp; Conditions</span>
              <span className="sm:hidden">Terms</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center text-sm text-muted-foreground mr-4">
              <Calendar className="h-3.5 w-3.5 mr-2" />
              Last Updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 md:px-8 py-8 md:py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar Navigation (Table of Contents) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-32 max-h-[calc(100vh-10rem)] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Search className="h-4 w-4" />
                On this page
              </h4>
              <nav className="flex flex-col space-y-1 border-l border-border/50">
                {sections.map((section) => {
                  const id = section.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  const isActive = activeSection === id;
                  return (
                    <a
                      key={section}
                      href={`#${id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(id);
                      }}
                      className={cn(
                        "group flex items-center justify-between py-2 pl-4 pr-2 text-sm transition-all hover:text-primary",
                        isActive 
                          ? "border-l-2 border-primary -ml-[1px] font-medium text-primary bg-primary/5" 
                          : "text-muted-foreground hover:border-l-2 hover:border-border hover:-ml-[1px]"
                      )}
                    >
                      <span className="truncate">{section}</span>
                      {isActive && <ChevronRight className="h-3 w-3 opacity-50" />}
                    </a>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-1 lg:col-span-9 lg:pl-8">
            <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
              <div className="mt-4 md:mt-6 mb-10 border-b border-border/40 pb-8">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
                  Terms and Conditions Agreement
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Please read these terms carefully before using the Elora services. By using Elora, you agree to be bound by these terms.
                </p>
              </div>
              
              {/* Render Parsed Content */}
              <div className="legal-content">
                {parseContent()}
              </div>

              {/* Mobile-only footer info */}
              <div className="mt-16 pt-8 border-t border-border text-sm text-muted-foreground lg:hidden">
                <p>Last Updated: {new Date().toLocaleDateString()}</p>
                <p className="mt-2">Contact: elora.toinfo@gmail.com</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Back to top button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={handleBackToTop}
          className="fixed bottom-5 right-4 md:right-6 z-40 rounded-full bg-primary text-primary-foreground shadow-lg p-2 md:p-3 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors"
          aria-label="Back to top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default TermsAndConditionsPage;
