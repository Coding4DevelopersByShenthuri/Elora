import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import type { SurveyData } from '@/components/surveys/UserSurvey';
import SurveyProgress from '@/components/surveys/SurveyProgress';
import '../../styles/EnglishLevelSurvey.css';

interface EnglishLevelSurveyProps {
  isOpen: boolean;
  onComplete: (surveyData: SurveyData) => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

// Replaced in-grid SVG level icons with image assets.

const englishLevels = [
  { id: 'beginner', label: 'Beginner', image: '/beginner.png' },
  { id: 'pre-intermediate', label: 'Pre Intermediate', image: '/Preintermediate.png' },
  { id: 'intermediate', label: 'Intermediate', image: '/Intermediate.png' },
  { id: 'upper-intermediate', label: 'Upper Intermediate', image: '/UpperIntermediate.png' },
  { id: 'advanced', label: 'Advanced', image: '/advance.png' },
  { id: 'proficient', label: 'Proficient', image: '/pro.png' },
];

const EnglishLevelSurvey: React.FC<EnglishLevelSurveyProps> = ({ isOpen, onComplete, onBack, currentStep = 3, totalSteps = 3 }) => {
  const [selectedLevel, setSelectedLevel] = React.useState<string>('');
  const [shouldAnimate, setShouldAnimate] = React.useState(false);
  const { updateUserSurveyData } = useAuth();

  // Trigger animation when component mounts or isOpen changes
  React.useEffect(() => {
    if (isOpen) {
      setShouldAnimate(true);
      // Reset animation state after it completes
      const timer = setTimeout(() => {
        setShouldAnimate(false);
      }, 3300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleLevelSelect = (levelId: string) => {
    setSelectedLevel(levelId);
    const surveyData: SurveyData = {
      englishLevel: levelId,
      completedAt: new Date().toISOString()
    };
    // Save step 3 (englishLevel) response to MySQL
    updateUserSurveyData(surveyData, 'englishLevel', 3);
    onComplete(surveyData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="w-full h-full max-w-none max-h-none p-0 overflow-hidden border-0 bg-transparent m-0 rounded-none">
        <div className="w-full h-screen bg-white flex flex-col md:flex-row relative">
          {/* Mobile */}
          <div className="md:hidden w-full h-full flex flex-col">
            <div className="bg-blue-50 p-6 pb-0 flex flex-col relative">
              <div className='flex items-center w-full mb-4 relative'>
                {/* Logo - Positioned on the left */}
                <img src="/logo01.png" alt="Elora Logo" className="w-20 h-20 object-contain ml-2" />
                
                {/* Images illustration - Centered */}
                <div className={`images-container absolute left-1/2 transform -translate-x-1/2 ${
                  shouldAnimate ? 'images-animation' : ''
                }`}>
                  <img src="/need.png" alt="Level A1 - need" className="level-image a1-image" />
                  <img src="/require.png" alt="Level B1 - require" className="level-image b1-image" />
                  <img src="/necessitate.png" alt="Level C1 - necessitate" className="level-image c1-image" />
                </div>
              </div>
              <div className="w-full h-[1px] bg-gray-300 mx-auto mt-2 mb-8"></div>
            </div>

            <div className="flex-1 bg-white px-4 flex flex-col items-center">
              <div className="text-center w-full">
                {/* Progress Indicator */}
                <SurveyProgress currentStep={currentStep} totalSteps={totalSteps} onBack={onBack} variant="mobile" />
                
                <h1 className="text-2xl font-bold text-blue-900 mb-8">What is your English level?</h1>
                
                {/* Level Selection Grid */}
                <div className="max-w-sm mx-auto w-full grid grid-cols-2 gap-3">
                  {englishLevels.map((level) => {
                    return (
                      <button
                        key={level.id}
                        onClick={() => handleLevelSelect(level.id)}
                        className={`level-card ${selectedLevel === level.id ? 'selected' : ''}`}
                      >
                        <img src={level.image} alt={`${level.label} level`} className="w-16 h-16 object-contain mb-2" />
                        <span className="level-label">{level.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex w-full h-full">
            {/* Left image panel */}
            <div className="w-1/2 bg-blue-50 flex items-center justify-center p-8 relative">
              <div className="text-center">
                <div className={`images-container ${shouldAnimate ? 'images-animation' : ''}`}>
                  <img src="/need.png" alt="Level A1 - need" className="level-image a1-image" />
                  <img src="/require.png" alt="Level B1 - require" className="level-image b1-image" />
                  <img src="/necessitate.png" alt="Level C1 - necessitate" className="level-image c1-image" />
                </div>
              </div>
              
              {/* Logo in bottom left corner */}
              <div className="absolute bottom-6 left-6">
                <img src="/logo01.png" alt="Elora Logo" className="w-32 h-32 object-contain" />
              </div>
            </div>

            {/* Right form */}
            <div className="w-1/2 bg-white p-8 lg:p-16 flex flex-col pt-16">
              <div className="max-w-lg mx-auto w-full">
                {/* Progress Indicator */}
                <SurveyProgress currentStep={currentStep} totalSteps={totalSteps} onBack={onBack} variant="desktop" />
                
                <h1 className="text-4xl font-bold text-blue-900 mb-10 text-center">
                  What is your English level?
                </h1>
                
                {/* Level Selection Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {englishLevels.map((level) => {
                    return (
                      <button
                        key={level.id}
                        onClick={() => handleLevelSelect(level.id)}
                        className={`level-card desktop ${selectedLevel === level.id ? 'selected' : ''}`}
                      >
                        <img src={level.image} alt={`${level.label} level`} className="w-20 h-20 object-contain mb-2" />
                        <span className="level-label">{level.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnglishLevelSurvey;
