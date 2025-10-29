import { useState, useRef, useEffect } from 'react';
import { FileText, ArrowLeft, Check, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { TERMS_AND_CONDITIONS } from '@/data/terms-and-conditions';
import '../styles/TermsAndConditionsPage.css';

const TermsAndConditionsPage = () => {
  const navigate = useNavigate();
  const termsContentRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Helper function to format terms content with proper HTML structure
  const formatTermsContent = (text: string) => {
    const lines = text.split('\n');
    const formattedLines: React.ReactElement[] = [];
    let currentSection: string[] = [];
    let key = 0;

    const majorHeadings = ['The Agreement', 'Introduction', 'Definitions/Terminology', 'User Obligations', 
      'Product/Service Details', 'Intellectual Property Rights', 'Service Specifications', 
      'Payment and Financial Terms', 'User Responsibilities and Conduct', 'Privacy and Data Protection',
      'Disclaimer of Warranties', 'Limitation of Liability', 'Modifications to Terms', 
      'Termination and Suspension', 'Special User Categories', 'Governing Law and Dispute Resolution',
      'Contact Information and Support', 'Entire Agreement', 'Severability', 'No Waiver', 'Assignment'];

    const subHeadings = ['Accurate Information', 'Compliance with Laws', 'Lawful Use', 'Account Security',
      'Our Intellectual Property', 'Your Content', 'License Grant', 'Technical Requirements', 
      'Offline Capabilities', 'Service Models', 'Payment Terms', 'Free Trial Offers',
      'Permitted Uses', 'Prohibited Activities', 'Data Processing Architecture', 'Data Collection',
      'Data Security', 'By You', 'By Elora', 'Effect of Termination',
      'For Parents/Guardians (Kids Module)', 'For Educational Institutions', 'For Examination Candidates',
      'Governing Law', 'Dispute Resolution', 'Class Action Waiver'];

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      
      if (majorHeadings.includes(trimmedLine)) {
        formattedLines.push(<h1 key={key++}>{trimmedLine}</h1>);
      } else if (subHeadings.includes(trimmedLine)) {
        formattedLines.push(<h2 key={key++}>{trimmedLine}</h2>);
      } else if (trimmedLine.startsWith('- ')) {
        if (currentSection.length > 0) {
          formattedLines.push(<p key={key++}>{currentSection.join(' ')}</p>);
          currentSection = [];
        }
        formattedLines.push(<li key={key++}>{trimmedLine.substring(2)}</li>);
      } else if (trimmedLine.length > 0) {
        currentSection.push(trimmedLine);
      } else if (currentSection.length > 0) {
        formattedLines.push(<p key={key++}>{currentSection.join(' ')}</p>);
        currentSection = [];
      }
    });

    if (currentSection.length > 0) {
      formattedLines.push(<p key={key++}>{currentSection.join(' ')}</p>);
    }

    return formattedLines;
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight - target.clientHeight;
    const scrollPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    setScrollPosition(scrollPercent);
    setShowScrollTop(scrollTop > 400);
  };

  const scrollToTop = () => {
    if (termsContentRef.current) {
      termsContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Reset scroll position when component mounts
  useEffect(() => {
    if (termsContentRef.current) {
      termsContentRef.current.scrollTop = 0;
    }
  }, []);

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Background elements - matching other pages */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
      <div className="absolute top-1/3 right-0 w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl -z-10"></div>
      <div className="absolute bottom-1/3 left-0 w-[250px] h-[250px] rounded-full bg-accent/5 blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-24 sm:pt-28 md:pt-32 lg:pt-36 pb-12 md:pb-16 lg:pb-24">
        {/* Header Section */}
        <div className="mb-8 md:mb-12">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 text-primary hover:text-primary/80 hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Terms and Conditions Agreement
              </h1>
              <p className="text-sm text-muted-foreground">
                Last Updated: {new Date().toLocaleDateString()} | www.speakbee.com | elora.toinfo@gmail.com
              </p>
            </div>
          </div>

          {/* Scroll Progress Bar */}
          <div className="w-full bg-primary/10 rounded-full h-2 mb-6 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-300"
              style={{ width: `${scrollPosition}%` }}
            />
          </div>
        </div>

        {/* Terms Content Container */}
        <div className="relative">
          <div
            ref={termsContentRef}
            className="terms-scroll-container bg-card/80 backdrop-blur-md border border-border/50 rounded-xl shadow-lg p-6 md:p-8 lg:p-10 max-h-[calc(100vh-28rem)] overflow-y-auto scroll-smooth"
            onScroll={handleScroll}
          >
            <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none dark:prose-invert">
              <div className="terms-content-wrapper">
                {formatTermsContent(TERMS_AND_CONDITIONS)}
              </div>
            </div>
          </div>

          {/* Scroll to Top Button */}
          {showScrollTop && (
            <Button
              onClick={scrollToTop}
              className="fixed bottom-8 right-8 rounded-full w-12 h-12 p-0 shadow-lg bg-primary hover:bg-primary/90 z-50"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Footer Section */}
        <div className="mt-8 pt-8 border-t border-border/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              Questions? Contact us at <strong className="text-primary">elora.toinfo@gmail.com</strong>
            </p>
            <Button
              onClick={() => navigate(-1)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Check className="w-4 h-4 mr-2" />
              I Understand
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsPage;
