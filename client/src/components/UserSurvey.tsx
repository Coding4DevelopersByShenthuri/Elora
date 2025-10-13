import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import SurveyProgress from '@/components/SurveyProgress';

export interface SurveyData {
  ageRange?: string;
  nativeLanguage?: string;
  completedAt: string;
}

interface UserSurveyProps {
  isOpen: boolean;
  onComplete: (surveyData: SurveyData) => void;
  onSkip: () => void;
}

const ageOptions = [
  {
    id: '18-24',
    range: '18-24',
    character: '/man.png',
    description: 'Young person with glasses and headphones'
  },
  {
    id: '25-34',
    range: '25-34',
    character: '/girl.png',
    description: 'Person with orange hair and red top'
  },
  {
    id: '35-44',
    range: '35-44',
    character: '/uncle.png',
    description: 'Person with red beard and green top'
  },
  {
    id: '45+',
    range: '45+',
    character: '/aunt.png',
    description: 'Older person with glasses and blue scarf'
  }
];

const UserSurvey: React.FC<UserSurveyProps> = ({ isOpen, onComplete }) => {
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const { updateUserSurveyData } = useAuth();

  // Trigger animation when component mounts or isOpen changes
  React.useEffect(() => {
    if (isOpen) {
      setShouldAnimate(true);
      // Reset animation state after it completes
      const timer = setTimeout(() => {
        setShouldAnimate(false);
      }, 1200); // Match total animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSelect = (ageId: string) => {
    setSelectedAge(ageId);
    const surveyData: SurveyData = {
      ageRange: ageId,
      completedAt: new Date().toISOString()
    };
    updateUserSurveyData(surveyData);
    onComplete(surveyData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { }}>
      <DialogContent className="w-full h-full max-w-none max-h-none p-0 overflow-hidden border-0 bg-transparent m-0 rounded-none">
        <div className="w-full h-screen bg-white flex flex-col md:flex-row relative">
          {/* Mobile Layout - REVISED HEADER */}
          <div className="md:hidden w-full h-full flex flex-col">
            {/* Mobile Header (Top Section) - Logo background removed, logo size increased */}
            <div className="bg-blue-50 p-6 pb-0 flex flex-col relative">
              <div className='flex items-center w-full mb-4 relative'>
                {/* Logo - Positioned on the left */}
                <img
                  src="/logo01.png"
                  alt="Speak Bee Logo"
                  className="w-20 h-20 object-contain ml-2"
                />
                
                {/* Calendar Icon - Centered */}
                <img
                  src="/calender.png"
                  alt="Calendar"
                  className={`w-32 h-32 object-contain absolute left-1/2 transform -translate-x-1/2 ${
                    shouldAnimate ? 'animate-calendar-bounce' : ''
                  }`}
                />
              </div>
              <div className="w-full h-[1px] bg-gray-300 mx-auto mt-2 mb-8"></div> {/* Dividing line */}
            </div>
            
            {/* Mobile Survey Content - NO CHANGES TO CONTENT BLOCK */}
            <div className="flex-1 bg-white px-4 flex flex-col items-center">
              <div className="text-center w-full">
                {/* Progress Indicator */}
                <SurveyProgress currentStep={1} totalSteps={2} variant="mobile" />
                
                <h1 className="text-2xl font-bold text-blue-900 mb-8">
                  What is your age?
                </h1>

                {/* Grid container to match the image layout */}
                <div className="grid grid-cols-2 gap-4 place-items-center w-full max-w-sm mx-auto">
                  {ageOptions.map((option) => {
                    const isSelected = selectedAge === option.id;

                    return (
                      <button
                        key={option.id}
                        onClick={() => handleSelect(option.id)}
                        className={`
                          rounded-xl border-2 transition-all duration-200 overflow-hidden w-full text-left aspect-[1/1] flex flex-col shadow-lg
                          ${
                            isSelected
                              ? 'border-[#4D8FCE]' // Using the button bar color for selection border
                              : 'border-white hover:shadow-xl'
                          }
                          bg-white
                        `}
                        style={{ maxWidth: '160px' }} 
                      >
                        <div className="flex flex-col w-full h-full">
                          {/* Top part with character and light blue background */}
                          <div className="flex-1 bg-blue-50 flex items-end justify-center pt-2">
                            <img
                              src={option.character}
                              alt={option.description}
                              className="w-3/4 h-3/4 object-contain mb-[-10px]" 
                            />
                          </div>
                          {/* Bottom part with age range and dark blue background/text */}
                          <div 
                            className={`
                              bg-[#4D8FCE] text-white px-3 py-2 flex items-center justify-between
                              ${isSelected ? 'bg-[#3A70B0]' : ''}
                            `}
                          >
                            <span className="text-sm font-medium">Age: {option.range}</span>
                            <svg
                              className="w-3 h-3 text-white flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout - NO CHANGES MADE */}
          <div className="hidden md:flex w-full h-full">
            {/* Left Panel - Calendar Section */}
            <div className="w-1/2 bg-blue-50 flex items-center justify-center p-8 relative">
              <div className="text-center">
                <img
                  src="/calender.png"
                  alt="Calendar"
                  className={`w-72 h-72 lg:w-96 lg:h-96 mx-auto ${
                    shouldAnimate ? 'animate-calendar-bounce' : ''
                  }`}
                />
              </div>
              
              {/* Logo in bottom left corner */}
              <div className="absolute bottom-6 left-6">
                <img
                  src="/logo01.png"
                  alt="Speak Bee Logo"
                  className="w-32 h-32 object-contain"
                />
              </div>
            </div>

            {/* Right Panel - Survey Section */}
            <div className="w-1/2 bg-white p-8 lg:p-35 flex flex-col justify-center">
              <div className="max-w-lg mx-auto w-full">
                {/* Progress Indicator */}
                <SurveyProgress currentStep={1} totalSteps={2} variant="desktop" />
                
                <h1 className="text-4xl font-bold text-blue-900 mb-10 text-center">
                  What is your age?
                </h1>
              </div>
              
              <div className="text-center mb-8">

                <div className="grid grid-cols-2 gap-4 gap-y-2 mb-6 place-items-center max-w-lg mx-auto px-4">
                  {ageOptions.map((option) => {
                    const isSelected = selectedAge === option.id;

                    return (
                      <button
                        key={option.id}
                        onClick={() => handleSelect(option.id)}
                        className={`rounded-3xl border-2 border-blue-400 transition-all duration-200 overflow-hidden w-full max-w-[208px] text-left aspect-square flex flex-col ${
                          isSelected
                            ? 'border-blue-600 shadow-lg'
                            : 'hover:shadow-md'
                        }`}
                      >
                        <div className="flex flex-col w-full h-full">
                          <div className="flex-1 bg-blue-50 flex items-end justify-center pb-0">
                            <img
                              src={option.character}
                              alt={option.description}
                              className="w-40 h-40 object-contain mb-[-30px]"
                            />
                          </div>
                          <div className="bg-blue-400 text-white px-4 py-3 flex items-center justify-between">
                            <span className="text-base font-medium">Age: {option.range}</span>
                            <svg
                              className="w-5 h-5 text-white flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {null}
              </div>
            </div>
          </div>
        </div>

        {/* Add custom CSS for realistic bounce animation with jump and shake */}
        <style>{`
          @keyframes calendar-bounce {
            /* Initial jump up */
            0% {
              transform: translateY(0) scale(1) rotate(0deg);
            }
            /* Jump up with slight scale */
            15% {
              transform: translateY(-35px) scale(1.05) rotate(-1deg);
            }
            /* First bounce down */
            30% {
              transform: translateY(-10px) scale(1.02) rotate(0.5deg);
            }
            /* Second smaller jump */
            45% {
              transform: translateY(-20px) scale(1.03) rotate(-0.5deg);
            }
            /* Second bounce down */
            60% {
              transform: translateY(-5px) scale(1.01) rotate(0.3deg);
            }
            /* Shake effect */
            70% {
              transform: translateY(-2px) scale(1) rotate(2deg);
            }
            75% {
              transform: translateY(-2px) scale(1) rotate(-2deg);
            }
            80% {
              transform: translateY(-2px) scale(1) rotate(1deg);
            }
            85% {
              transform: translateY(-2px) scale(1) rotate(-1deg);
            }
            /* Final settle */
            100% {
              transform: translateY(0) scale(1) rotate(0deg);
            }
          }

          .animate-calendar-bounce {
            animation: calendar-bounce 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            transform-origin: center bottom;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default UserSurvey;