import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'elora_cookie_consent';
const COOKIE_PREFERENCES_KEY = 'elora_cookie_preferences';

interface CookiePreferences {
  functional: boolean;
  statistics: boolean;
  marketing: boolean;
}

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [viewingPolicy, setViewingPolicy] = useState<'cookie' | 'privacy' | null>(null);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    functional: true, // Always active
    statistics: true,
    marketing: true,
  });

  useEffect(() => {
    // Check if user has already accepted cookies
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent || consent !== 'accepted') {
      setIsVisible(true);
    }

    // Load saved preferences if they exist
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(parsed);
      } catch (e) {
        console.error('Error parsing cookie preferences:', e);
      }
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
    setIsVisible(false);
  };

  const toggleCategory = (category: 'statistics' | 'marketing') => {
    setPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const toggleExpand = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Black backdrop overlay - matches Dialog component pattern */}
      <div className="fixed inset-0 z-50 bg-black/80 animate-fade-in" />
      
      {/* Cookie consent popup */}
      <div className="fixed bottom-0 left-0 right-0 z-[51] animate-slide-up p-2 sm:p-3 md:p-4">
        <div className="mx-auto w-full max-w-[99%]">
          <div className="bg-card border rounded-lg shadow-lg p-3 sm:p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="flex items-center gap-3">
                {viewingPolicy && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewingPolicy(null)}
                    className="h-8 w-8"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <img
                  src="/logo01.png"
                  alt="Elora Logo"
                  className="h-10 w-auto sm:h-14 md:h-16 lg:h-20"
                />
              </div>
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-foreground flex-1 text-center">
                {viewingPolicy === 'cookie' ? 'Cookie Policy' : viewingPolicy === 'privacy' ? 'Privacy Policy' : 'Manage Cookie Consent'}
              </h2>
              <div className="w-10 sm:w-14 md:w-16 lg:w-20" /> {/* Spacer for centering */}
            </div>

            {/* Policy Content or Cookie Consent Form */}
            {viewingPolicy ? (
              <div className="max-h-[60vh] overflow-y-auto">
                <div className="space-y-3 text-sm md:text-base text-muted-foreground leading-relaxed">
                  {viewingPolicy === 'cookie' ? (
                    <>
                      <div className="space-y-2">
                        <h3 className="text-base md:text-lg font-semibold text-foreground">Cookie Policy</h3>
                        <p>
                          Cookies are small text files stored on your device when you visit our website. They enable core functionality, enhance user experience, and provide analytics insights.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm md:text-base font-semibold text-foreground">Cookie Categories</h4>
                        <ul className="list-disc list-inside space-y-1.5 ml-3 text-sm">
                          <li><strong className="text-foreground">Functional:</strong> Required for website operation (always active)</li>
                          <li><strong className="text-foreground">Statistics:</strong> Anonymous usage analytics to improve our services</li>
                          <li><strong className="text-foreground">Marketing:</strong> Personalized content and advertising based on interests</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm md:text-base font-semibold text-foreground">Your Control</h4>
                        <p className="text-sm">
                          Manage cookie preferences using the controls above or your browser settings. Disabling certain cookies may limit website functionality.
                        </p>
                      </div>
                      
                      <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                        Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <h3 className="text-base md:text-lg font-semibold text-foreground">Privacy Policy</h3>
                        <p>
                          Elora is committed to protecting your privacy. This policy outlines how we collect, use, and safeguard your personal information in compliance with applicable data protection laws.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm md:text-base font-semibold text-foreground">Data Collection</h4>
                        <p className="text-sm">
                          We collect information you provide directly (account registration, preferences) and automatically (cookies, device information, usage analytics) to deliver and improve our services.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm md:text-base font-semibold text-foreground">Data Usage</h4>
                        <ul className="list-disc list-inside space-y-1.5 ml-3 text-sm">
                          <li>Service delivery and platform optimization</li>
                          <li>Personalized learning experience</li>
                          <li>Usage analytics and performance monitoring</li>
                          <li>Communications regarding your account</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm md:text-base font-semibold text-foreground">Your Rights</h4>
                        <p className="text-sm">
                          You have the right to access, modify, or delete your personal data at any time. You may withdraw consent or object to data processing through your account settings or by contacting support.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm md:text-base font-semibold text-foreground">Security & Privacy</h4>
                        <p className="text-sm">
                          We implement industry-standard security measures to protect your data. We do not sell your personal information to third parties. Your data is processed in accordance with applicable privacy regulations.
                        </p>
                      </div>
                      
                      <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                        Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 mb-3 md:mb-4">
              {/* Left: Description */}
              <div className="space-y-2 md:space-y-3 lg:col-span-1">
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  To provide the best experiences, we use technologies like cookies to store and/or access device information.
                </p>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Consenting to these technologies will allow us to process data such as browsing behavior or unique IDs on this site. Not consenting or withdrawing consent, may adversely affect certain features and functions.
                </p>
              </div>

              {/* Middle: Cookie Categories */}
              <div className="space-y-2 lg:col-span-1">
                {/* Functional Cookies - Always Active */}
                <div className="bg-muted rounded-md p-3 border hover:border-primary/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-1">
                        <Label className="text-sm md:text-base font-semibold text-foreground cursor-pointer">
                          Functional
                        </Label>
                        <p className="text-xs sm:text-sm text-primary font-medium mt-1">
                          Always active
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleExpand('functional')}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label="Toggle functional cookies details"
                    >
                      {expandedCategory === 'functional' ? (
                        <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </button>
                  </div>
                  {expandedCategory === 'functional' && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        These cookies are essential for the website to function properly. They enable core features such as security, network management, and accessibility.
                      </p>
                    </div>
                  )}
                </div>

                {/* Statistics Cookies */}
                <div className="bg-muted rounded-md p-3 border hover:border-primary/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Switch
                        checked={preferences.statistics}
                        onCheckedChange={() => toggleCategory('statistics')}
                        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                      />
                      <div className="flex-1">
                        <Label className="text-sm md:text-base font-semibold text-foreground cursor-pointer">
                          Statistics
                        </Label>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleExpand('statistics')}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label="Toggle statistics cookies details"
                    >
                      {expandedCategory === 'statistics' ? (
                        <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </button>
                  </div>
                  {expandedCategory === 'statistics' && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                      </p>
                    </div>
                  )}
                </div>

                {/* Marketing Cookies */}
                <div className="bg-muted rounded-md p-3 border hover:border-primary/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Switch
                        checked={preferences.marketing}
                        onCheckedChange={() => toggleCategory('marketing')}
                        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                      />
                      <div className="flex-1">
                        <Label className="text-sm md:text-base font-semibold text-foreground cursor-pointer">
                          Marketing
                        </Label>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleExpand('marketing')}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label="Toggle marketing cookies details"
                    >
                      {expandedCategory === 'marketing' ? (
                        <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </button>
                  </div>
                  {expandedCategory === 'marketing' && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        These cookies are used to deliver advertisements and track you across the internet. They help us show you relevant content based on your interests.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex flex-col items-start sm:items-center justify-start gap-2 lg:col-span-1">
                <Button
                  onClick={handleAccept}
                  size="default"
                  className="w-full sm:w-auto min-w-[140px]"
                >
                  Accept
                </Button>
                <Button
                  onClick={handleSavePreferences}
                  variant="outline"
                  size="default"
                  className="w-full sm:w-auto"
                >
                  Save preferences
                </Button>
              </div>
            </div>

            {!viewingPolicy && (
              <>
                {/* Footer Links */}
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border">
                  <button
                    onClick={() => setViewingPolicy('cookie')}
                    className="text-sm text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
                  >
                    Cookie Policy
                  </button>
                  <button
                    onClick={() => setViewingPolicy('privacy')}
                    className="text-sm text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
                  >
                    Privacy Policy
                  </button>
                </div>
              </>
            )}
            </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CookieConsent;
