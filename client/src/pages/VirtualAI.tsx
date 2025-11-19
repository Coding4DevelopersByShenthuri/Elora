import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnimatedTransition } from '@/components/common/AnimatedTransition';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'elora_virtual_ai_user_name';

// Generate sparkle positions
const generateSparkles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    size: 0.5 + Math.random() * 0.5,
  }));
};

export default function VirtualAI() {
  const [userName, setUserName] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [showNameInput, setShowNameInput] = useState(true); // Default to showing name input
  const [isInitialized, setIsInitialized] = useState(false);
  const [sparkles, setSparkles] = useState(generateSparkles(8));
  const [isHovered, setIsHovered] = useState(false);
  const [typingAnimation, setTypingAnimation] = useState('');
  const nameTagRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has already provided their name
    const savedName = localStorage.getItem(STORAGE_KEY);
    console.log('VirtualAI: Checking for saved name:', savedName); // Debug log
    if (savedName && savedName.trim()) {
      setUserName(savedName.trim());
      setShowNameInput(false);
      console.log('VirtualAI: Found saved name, hiding input screen'); // Debug log
    } else {
      // First visit - show name input
      setShowNameInput(true);
      console.log('VirtualAI: No saved name, showing input screen'); // Debug log
    }
    setIsInitialized(true);
  }, []);

  // Real-time typing animation effect
  useEffect(() => {
    if (inputValue.trim()) {
      let currentIndex = 0;
      const name = inputValue.trim();
      setTypingAnimation('');
      
      const typingInterval = setInterval(() => {
        if (currentIndex < name.length) {
          setTypingAnimation(name.substring(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
        }
      }, 50); // Typing speed

      return () => clearInterval(typingInterval);
    } else {
      setTypingAnimation('');
    }
  }, [inputValue]);


  const handleContinue = () => {
    if (inputValue.trim()) {
      const name = inputValue.trim();
      // Save the name to localStorage
      localStorage.setItem(STORAGE_KEY, name);
      setUserName(name);
      setShowNameInput(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      handleContinue();
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Wait for initialization to prevent flash
  if (!isInitialized) {
    return null; // Return null during initialization to prevent flash
  }

  // If user has provided their name, show the main Virtual AI interface
  if (!showNameInput && userName) {
    return (
      <AnimatedTransition show={true}>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 pt-20 pb-10 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="bg-card rounded-lg shadow-lg p-6 mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, {userName}! 👋
              </h1>
              <p className="text-muted-foreground">
                Your Virtual AI assistant is ready to help you learn English.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  localStorage.removeItem(STORAGE_KEY);
                  setShowNameInput(true);
                  setUserName('');
                  setInputValue('');
                }}
              >
                Change Name
              </Button>
            </div>
            {/* Main Virtual AI interface will go here */}
            <div className="bg-card rounded-lg shadow-lg p-8 text-center">
              <p className="text-muted-foreground">
                Virtual AI features coming soon...
              </p>
            </div>
          </div>
        </div>
      </AnimatedTransition>
    );
  }

  // Show name input screen (first visit)
  return (
    <AnimatedTransition show={true}>
      <div className="min-h-screen flex flex-col relative">
        {/* Navigation Button */}
        <div className="absolute top-0 left-0 px-4 py-3 sm:py-4 pt-20 sm:pt-24 lg:pt-28 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="rounded-full hover:bg-primary/10 text-primary h-8 w-8 sm:h-9 sm:w-9 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        {/* Split Screen Container - Header and Content */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-screen pt-20 sm:pt-24 lg:pt-28">
          {/* Left Panel - Light Blue Background */}
          <div className="w-full lg:w-1/2 bg-sky-100 dark:bg-sky-900/30 flex flex-col">
            {/* Name Tag Content */}
            <div className="flex-1 flex items-start lg:items-start justify-center p-4 sm:p-8 lg:p-12 xl:p-16 lg:pt-24 xl:pt-28 relative overflow-hidden">
            {/* Background floating particles */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-blue-300/30 rounded-full animate-float-particle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${3 + Math.random() * 4}s`,
                  }}
                />
              ))}
            </div>
            
            <div className="max-w-md w-full py-4 sm:py-6 lg:py-8 relative z-10">
              {/* Name Tag Card */}
              <div 
                className="relative group"
                ref={nameTagRef}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {/* Enhanced 3D Shadow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-xl sm:rounded-2xl blur-2xl transform rotate-[-2deg] opacity-50 group-hover:opacity-75 transition-opacity duration-500 -z-10"></div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden transform rotate-[-2deg] group-hover:rotate-0 transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative"
                  style={{
                    transformStyle: 'preserve-3d',
                    perspective: '1000px',
                  }}
                >
                  {/* Animated Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-blue-400/20 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10 animate-pulse"></div>
                  
                  {/* Name Tag Header - Blue Section */}
                  <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 p-4 sm:p-6 relative overflow-hidden group-hover:from-blue-500 group-hover:via-blue-400 group-hover:to-blue-500 transition-all duration-500">
                    {/* Animated Background Gradient Shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    <div className="relative z-10">
                      {/* HELLO Text with Enhanced Interactive Effects */}
                      <h2 
                        className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white text-center mb-1 sm:mb-2 tracking-tight transition-all duration-300 transform group-hover:scale-110"
                        style={{
                          textShadow: isHovered 
                            ? '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.4)' 
                            : '0 2px 4px rgba(0,0,0,0.2)',
                          filter: isHovered ? 'brightness(1.2)' : 'brightness(1)',
                        }}
                      >
                        <span className="inline-block animate-hello-bounce">H</span>
                        <span className="inline-block animate-hello-bounce" style={{ animationDelay: '0.1s' }}>E</span>
                        <span className="inline-block animate-hello-bounce" style={{ animationDelay: '0.2s' }}>L</span>
                        <span className="inline-block animate-hello-bounce" style={{ animationDelay: '0.3s' }}>L</span>
                        <span className="inline-block animate-hello-bounce" style={{ animationDelay: '0.4s' }}>O</span>
                      </h2>
                      
                      {/* MY NAME IS Text with Enhanced Animation */}
                      <p 
                        className="text-[10px] sm:text-xs text-white/95 text-center font-semibold tracking-widest uppercase transition-all duration-300"
                        style={{
                          opacity: isHovered ? 1 : 0.95,
                          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                        }}
                      >
                        +MY NAME IS+
                      </p>
                    </div>
                  </div>
                  
                  {/* Name Tag Body - White Section with Typing Effect */}
                  <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 min-h-[100px] sm:min-h-[120px] md:min-h-[140px] flex items-center justify-center transition-all duration-300 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 relative overflow-hidden">
                    {/* Subtle background pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute inset-0" style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(59, 130, 246, 0.1) 10px, rgba(59, 130, 246, 0.1) 20px)',
                      }}></div>
                    </div>
                    
                    {typingAnimation || inputValue.trim() ? (
                      <div className="text-foreground text-center animate-fade-in relative z-10">
                        <p 
                          className="text-lg sm:text-xl md:text-2xl font-bold break-words px-2 transform group-hover:scale-105 transition-transform duration-300 text-black dark:text-gray-900"
                          style={{
                            fontFamily: "'Dancing Script', 'Brush Script MT', 'Lucida Handwriting', 'Kalam', cursive",
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                          }}
                        >
                          {typingAnimation || inputValue.trim()}
                          {typingAnimation && typingAnimation.length < inputValue.trim().length && (
                            <span className="inline-block w-0.5 h-6 bg-black dark:bg-gray-900 ml-1 animate-blink"></span>
                          )}
                        </p>
                      </div>
                    ) : (
                      <div className="text-muted-foreground/60 text-center relative z-10">
                        <p className="text-xs sm:text-sm italic animate-pulse">Your name will appear here</p>
                      </div>
                    )}
                    
                    {/* Celebration particles when name is entered */}
                    {inputValue.trim() && !typingAnimation && (
                      <div className="absolute inset-0 pointer-events-none">
                        {Array.from({ length: 15 }).map((_, i) => {
                          const angle = (i / 15) * Math.PI * 2;
                          const distance = 80 + Math.random() * 40;
                          const x = Math.cos(angle) * distance;
                          const y = Math.sin(angle) * distance;
                          return (
                            <div
                              key={i}
                              className="absolute w-2 h-2 rounded-full animate-celebration"
                              style={{
                                left: '50%',
                                top: '50%',
                                background: ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'][i % 4],
                                animationDelay: `${i * 0.05}s`,
                                '--end-x': `${x}px`,
                                '--end-y': `${y}px`,
                              } as React.CSSProperties}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Enhanced Animated Decorative icon in bottom-left */}
                <div 
                  className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-xl transform rotate-[-5deg] group-hover:rotate-[5deg] group-hover:scale-110 transition-all duration-300 group-hover:shadow-blue-500/50 z-20"
                  style={{
                    filter: isHovered ? 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.6))' : 'none',
                  }}
                >
                  <div className="text-white text-lg sm:text-xl md:text-2xl font-bold group-hover:animate-spin transition-transform duration-300">Q</div>
                </div>
                
                {/* Enhanced Floating Particles Effect */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full animate-particle-float"
                      style={{
                        width: `${4 + Math.random() * 4}px`,
                        height: `${4 + Math.random() * 4}px`,
                        background: ['#3b82f6', '#8b5cf6', '#ec4899'][i % 3],
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${2 + Math.random() * 2}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Right Panel - White Background */}
          <div className="w-full lg:w-1/2 bg-white dark:bg-gray-900 flex flex-col">
            {/* Form Content */}
            <div className="flex-1 flex items-start lg:items-start justify-center p-4 sm:p-8 lg:p-12 xl:p-16 lg:pt-24 xl:pt-28">
              <div className="max-w-md w-full space-y-6 sm:space-y-8 md:space-y-10 py-4 sm:py-6 lg:py-8">
              {/* Question - Aligned with HELLO section */}
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-3">
                  What's your name?
                </h1>
              </div>

              {/* Input Field */}
              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full h-12 sm:h-14 text-base sm:text-lg px-4 sm:px-5 rounded-lg sm:rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-700/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 placeholder:text-muted-foreground/60 shadow-sm"
                  autoFocus
                />

                {/* Continue Button */}
                <Button
                  onClick={handleContinue}
                  disabled={!inputValue.trim()}
                  className={cn(
                    "w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-lg sm:rounded-xl shadow-lg",
                    "bg-gradient-to-r from-blue-500 to-blue-600",
                    "hover:from-blue-600 hover:to-blue-700",
                    "text-white border-0",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-500 disabled:hover:to-blue-600",
                    "transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  )}
                >
                  Continue
                </Button>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes sparkle-float {
          0%, 100% {
            transform: translateY(0) translateX(0) scale(1) rotate(0deg);
            opacity: 0.6;
          }
          25% {
            transform: translateY(-15px) translateX(5px) scale(1.3) rotate(90deg);
            opacity: 1;
          }
          50% {
            transform: translateY(-20px) translateX(-5px) scale(1.1) rotate(180deg);
            opacity: 0.9;
          }
          75% {
            transform: translateY(-10px) translateX(3px) scale(1.2) rotate(270deg);
            opacity: 1;
          }
        }
        
        @keyframes hello-bounce {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-8px) scale(1.1);
          }
        }
        
        @keyframes float-particle {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(20px);
            opacity: 0;
          }
        }
        
        @keyframes particle-float {
          0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-50px) translateX(30px) scale(0);
            opacity: 0;
          }
        }
        
        @keyframes celebration {
          0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(var(--end-x, 100px), var(--end-y, 100px)) scale(0) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes blink {
          0%, 50% {
            opacity: 1;
          }
          51%, 100% {
            opacity: 0;
          }
        }
        
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        
        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.8), 0 0 60px rgba(147, 51, 234, 0.5);
          }
        }
        
        .animate-sparkle-float {
          animation: sparkle-float 3s ease-in-out infinite;
        }
        
        .animate-hello-bounce {
          animation: hello-bounce 2s ease-in-out infinite;
        }
        
        .animate-float-particle {
          animation: float-particle 8s linear infinite;
        }
        
        .animate-particle-float {
          animation: particle-float 3s ease-out infinite;
        }
        
        .animate-celebration {
          animation: celebration 1.5s ease-out forwards;
        }
        
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
      `}</style>
    </AnimatedTransition>
  );
}

