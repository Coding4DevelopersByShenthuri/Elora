import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import SurveyProgress from '@/components/surveys/SurveyProgress';

export interface SurveyData {
  ageRange?: string;
  nativeLanguage?: string;
  englishLevel?: string;
  learningPurpose?: string[];
  interests?: string[];
  practiceGoalMinutes?: number;
  practiceStartTime?: string;
  personalizationCompleted?: boolean;
  completedAt: string;
}

interface UserSurveyProps {
  isOpen: boolean;
  onComplete: (surveyData: SurveyData) => void;
  onSkip: () => void;
  currentStep?: number;
  totalSteps?: number;
}

const ageOptions = [
  {
    id: '4-17',
    range: '4-17',
    character: '/kid.png',
    description: 'Young child with a backpack'
  },
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

const UserSurvey: React.FC<UserSurveyProps> = ({ isOpen, onComplete, currentStep = 1, totalSteps = 10 }) => {
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

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
    // Save to sessionStorage only (not MySQL) during steps 1-16
    const existingData = sessionStorage.getItem('speakbee_survey_data');
    const allData = existingData ? JSON.parse(existingData) : {};
    const mergedData = { ...allData, ...surveyData };
    sessionStorage.setItem('speakbee_survey_data', JSON.stringify(mergedData));
    onComplete(surveyData);
  };

  // Debug: Log when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      console.log('✅ UserSurvey (Step 1) is now OPEN');
    } else {
      console.log('❌ UserSurvey (Step 1) is now CLOSED');
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={() => { }}>
      <DialogContent 
        className="w-full h-full max-w-none max-h-none p-0 md:p-0 overflow-hidden border-0 bg-transparent m-0 rounded-none z-[9999]"
        title="User Survey"
        description="Select your age range"
      >
        <div className="w-full min-h-screen md:h-screen bg-white flex flex-col md:flex-row relative">
          {/* Mobile Layout - REVISED HEADER */}
          <div className="md:hidden w-full flex flex-col flex-1 overflow-hidden">
            {/* Mobile Header (Top Section) - Logo background removed, logo size increased */}
            <div className="bg-blue-50 px-5 pt-5 pb-3 flex flex-col relative">
              <div className='flex items-center w-full mb-3 relative justify-between'>
                {/* Logo - Positioned on the left */}
                <img
                  src="/logo01.png"
                  alt="Elora Logo"
                  className="w-16 h-16 object-contain ml-1.5"
                />
                
                {/* Calendar Icon - Centered */}
                <img
                  src="/calender.png"
                  alt="Calendar"
                  className={`w-28 h-28 object-contain absolute left-1/2 transform -translate-x-1/2 ${
                    shouldAnimate ? 'animate-calendar-bounce' : ''
                  }`}
                />
              </div>
              <div className="w-full h-[1px] bg-gray-300 mx-auto mt-1 mb-6"></div> {/* Dividing line */}
            </div>
            
            {/* Mobile Survey Content */}
            <div className="flex-1 bg-white px-4 pb-6 flex flex-col items-center">
              <div className="text-center w-full max-w-md mx-auto">
                {/* Progress Indicator */}
                <SurveyProgress currentStep={currentStep} totalSteps={totalSteps} variant="mobile" />
                
                <h1 className="text-xl font-bold text-blue-900 mb-6">
                  What is your age?
                </h1>

                {/* Age options */}
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 w-full">
                  {ageOptions.map((option) => {
                    const isSelected = selectedAge === option.id;

                    return (
                      <button
                        key={option.id}
                        onClick={() => handleSelect(option.id)}
                        className={`
                          basis-[45%] sm:basis-[28%] max-w-[140px] sm:max-w-[150px] min-h-[150px]
                          rounded-xl border-2 transition-all duration-200 overflow-hidden text-left flex flex-col shadow-lg
                          ${
                            isSelected
                              ? 'border-[#4D8FCE]' // Using the button bar color for selection border
                              : 'border-white hover:shadow-xl'
                          }
                          bg-white
                        `}
                      >
                        <div className="flex flex-col w-full h-full">
                          {/* Top part with character and light blue background */}
                          <div className="flex-1 bg-blue-50 flex items-center justify-center py-3">
                            <img
                              src={option.character}
                              alt={option.description}
                              className="w-20 h-20 object-contain"
                            />
                          </div>
                          {/* Bottom part with age range and dark blue background/text */}
                          <div 
                            className={`
                              bg-[#4D8FCE] text-white px-3 py-2 flex items-center justify-between min-h-[44px]
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
          <div className="hidden md:flex w-full h-full flex-1">
            {/* Left Panel - Calendar Section */}
            <div className="md:w-5/12 lg:w-1/2 bg-blue-50 flex items-center justify-center p-6 lg:p-12 relative">
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
                  alt="Elora Logo"
                  className="w-32 h-32 object-contain"
                />
              </div>
            </div>

            {/* Right Panel - Survey Section */}
            <div className="md:w-7/12 lg:w-1/2 bg-white px-8 lg:px-16 py-10 lg:py-14 flex flex-col justify-center overflow-y-auto">
              <div className="max-w-2xl mx-auto w-full">
                {/* Progress Indicator */}
                <SurveyProgress currentStep={currentStep} totalSteps={totalSteps} variant="desktop" />
                
                <h1 className="text-3xl lg:text-4xl font-bold text-blue-900 mb-10 text-center">
                  What is your age?
                </h1>
              </div>
              
              <div className="text-center mb-8">

                <div className="flex flex-wrap justify-center gap-5 gap-y-6 mb-6 max-w-3xl mx-auto px-4">
                  {ageOptions.map((option) => {
                    const isSelected = selectedAge === option.id;

                    return (
                      <button
                        key={option.id}
                        onClick={() => handleSelect(option.id)}
                        className={`rounded-3xl border-2 transition-all duration-200 overflow-hidden text-left flex flex-col
                          basis-[22%] max-w-[180px] min-w-[160px] aspect-[4/5] xl:max-w-[200px] xl:min-w-[180px]
                          ${isSelected ? 'border-blue-600 shadow-lg' : 'border-blue-300 hover:shadow-md'}
                        `}
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