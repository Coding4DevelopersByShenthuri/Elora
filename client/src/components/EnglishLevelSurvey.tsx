import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import type { SurveyData } from '@/components/UserSurvey';
import SurveyProgress from '@/components/SurveyProgress';
import '../css/EnglishLevelSurvey.css';

interface EnglishLevelSurveyProps {
  isOpen: boolean;
  onComplete: (surveyData: SurveyData) => void;
  onBack?: () => void;
}

// SVG Components for each plant growth stage
const BeginnerIcon = () => (
  <div className="plant-icon beginner-icon">
    <svg viewBox="0 0 100 100" className="w-16 h-16">
      {/* Light blue circle background */}
      <circle cx="50" cy="50" r="45" fill="#E3F2FD" stroke="#BBDEFB" strokeWidth="2"/>
      {/* Seeds/Grains */}
      <ellipse cx="35" cy="45" rx="4" ry="6" fill="#FFD54F" transform="rotate(-15 35 45)"/>
      <ellipse cx="50" cy="40" rx="3" ry="5" fill="#FFD54F" transform="rotate(10 50 40)"/>
      <ellipse cx="65" cy="45" rx="4" ry="6" fill="#FFD54F" transform="rotate(-25 65 45)"/>
      <ellipse cx="42" cy="55" rx="3" ry="5" fill="#FFD54F" transform="rotate(20 42 55)"/>
      <ellipse cx="58" cy="60" rx="3" ry="5" fill="#FFD54F" transform="rotate(-10 58 60)"/>
      <ellipse cx="30" cy="60" rx="3" ry="5" fill="#FFD54F" transform="rotate(15 30 60)"/>
      {/* Soil */}
      <path d="M20 75 Q30 70 40 75 Q50 80 60 75 Q70 70 80 75 Q85 80 85 85 L15 85 Q15 80 20 75" fill="#5D4037"/>
    </svg>
  </div>
);

const PreIntermediateIcon = () => (
  <div className="plant-icon pre-intermediate-icon">
    <svg viewBox="0 0 100 100" className="w-16 h-16">
      {/* Light blue circle background */}
      <circle cx="50" cy="50" r="45" fill="#E3F2FD" stroke="#BBDEFB" strokeWidth="2"/>
      {/* Sprout */}
      <path d="M45 65 Q47 55 50 45 Q52 35 50 30" stroke="#4CAF50" strokeWidth="3" fill="none"/>
      <path d="M50 30 Q48 25 45 28" stroke="#4CAF50" strokeWidth="2" fill="none"/>
      {/* Soil */}
      <path d="M20 75 Q30 70 40 75 Q50 80 60 75 Q70 70 80 75 Q85 80 85 85 L15 85 Q15 80 20 75" fill="#5D4037"/>
    </svg>
  </div>
);

const IntermediateIcon = () => (
  <div className="plant-icon intermediate-icon">
    <svg viewBox="0 0 100 100" className="w-16 h-16">
      {/* Light blue circle background */}
      <circle cx="50" cy="50" r="45" fill="#E3F2FD" stroke="#BBDEFB" strokeWidth="2"/>
      {/* Plant with two leaves */}
      <path d="M45 65 Q47 55 50 45 Q52 35 50 30" stroke="#4CAF50" strokeWidth="3" fill="none"/>
      {/* Left leaf */}
      <ellipse cx="42" cy="40" rx="8" ry="4" fill="#4CAF50" transform="rotate(-30 42 40)"/>
      {/* Right leaf */}
      <ellipse cx="58" cy="40" rx="8" ry="4" fill="#8BC34A" transform="rotate(30 58 40)"/>
      {/* Soil */}
      <path d="M20 75 Q30 70 40 75 Q50 80 60 75 Q70 70 80 75 Q85 80 85 85 L15 85 Q15 80 20 75" fill="#5D4037"/>
    </svg>
  </div>
);

const UpperIntermediateIcon = () => (
  <div className="plant-icon upper-intermediate-icon">
    <svg viewBox="0 0 100 100" className="w-16 h-16">
      {/* Light blue circle background */}
      <circle cx="50" cy="50" r="45" fill="#E3F2FD" stroke="#BBDEFB" strokeWidth="2"/>
      {/* Plant with three leaves */}
      <path d="M45 65 Q47 55 50 45 Q52 35 50 30" stroke="#4CAF50" strokeWidth="3" fill="none"/>
      {/* Left leaf */}
      <ellipse cx="42" cy="40" rx="8" ry="4" fill="#4CAF50" transform="rotate(-30 42 40)"/>
      {/* Right leaf */}
      <ellipse cx="58" cy="40" rx="8" ry="4" fill="#8BC34A" transform="rotate(30 58 40)"/>
      {/* Top leaf */}
      <ellipse cx="50" cy="28" rx="6" ry="3" fill="#66BB6A" transform="rotate(0 50 28)"/>
      {/* Soil */}
      <path d="M20 75 Q30 70 40 75 Q50 80 60 75 Q70 70 80 75 Q85 80 85 85 L15 85 Q15 80 20 75" fill="#5D4037"/>
    </svg>
  </div>
);

const AdvancedIcon = () => (
  <div className="plant-icon advanced-icon">
    <svg viewBox="0 0 100 100" className="w-16 h-16">
      {/* Light blue circle background */}
      <circle cx="50" cy="50" r="45" fill="#E3F2FD" stroke="#BBDEFB" strokeWidth="2"/>
      {/* Plant with flower */}
      <path d="M45 65 Q47 55 50 45 Q52 35 50 30" stroke="#4CAF50" strokeWidth="3" fill="none"/>
      {/* Leaves */}
      <ellipse cx="42" cy="40" rx="8" ry="4" fill="#4CAF50" transform="rotate(-30 42 40)"/>
      <ellipse cx="58" cy="40" rx="8" ry="4" fill="#8BC34A" transform="rotate(30 58 40)"/>
      {/* Flower */}
      <circle cx="50" cy="25" r="8" fill="#FFD54F"/>
      <circle cx="50" cy="25" r="6" fill="#FFA726"/>
      <circle cx="50" cy="25" r="4" fill="#FF8F00"/>
      {/* Soil */}
      <path d="M20 75 Q30 70 40 75 Q50 80 60 75 Q70 70 80 75 Q85 80 85 85 L15 85 Q15 80 20 75" fill="#5D4037"/>
    </svg>
  </div>
);

const ProficientIcon = () => (
  <div className="plant-icon proficient-icon">
    <svg viewBox="0 0 100 100" className="w-16 h-16">
      {/* Light blue circle background */}
      <circle cx="50" cy="50" r="45" fill="#E3F2FD" stroke="#BBDEFB" strokeWidth="2"/>
      {/* Tree trunk */}
      <rect x="47" y="55" width="6" height="15" fill="#8D6E63" rx="1"/>
      {/* Tree canopy */}
      <circle cx="50" cy="45" r="20" fill="#4CAF50"/>
      <circle cx="45" cy="40" r="12" fill="#66BB6A"/>
      <circle cx="55" cy="40" r="12" fill="#4CAF50"/>
      <circle cx="50" cy="35" r="10" fill="#8BC34A"/>
      {/* Soil */}
      <path d="M20 75 Q30 70 40 75 Q50 80 60 75 Q70 70 80 75 Q85 80 85 85 L15 85 Q15 80 20 75" fill="#5D4037"/>
    </svg>
  </div>
);

const englishLevels = [
  { id: 'beginner', label: 'Beginner', icon: BeginnerIcon },
  { id: 'pre-intermediate', label: 'Pre Intermediate', icon: PreIntermediateIcon },
  { id: 'intermediate', label: 'Intermediate', icon: IntermediateIcon },
  { id: 'upper-intermediate', label: 'Upper Intermediate', icon: UpperIntermediateIcon },
  { id: 'advanced', label: 'Advanced', icon: AdvancedIcon },
  { id: 'proficient', label: 'Proficient', icon: ProficientIcon },
];

const EnglishLevelSurvey: React.FC<EnglishLevelSurveyProps> = ({ isOpen, onComplete, onBack }) => {
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
    updateUserSurveyData(surveyData);
    onComplete(surveyData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="w-full h-full max-w-none max-h-none p-0 overflow-hidden border-0 bg-transparent m-0 rounded-none">
        <div className="w-full h-screen bg-white flex flex-col md:flex-row relative">
          {/* Mobile */}
          <div className="md:hidden w-full h-full flex flex-col">
            <div className="bg-blue-50 p-2 pb-0 h-[190px] flex flex-col relative">
              <div className='flex items-center w-full mb-4 relative'>
                {/* Logo - Positioned on the left */}
                <img src="/logo01.png" alt="Speak Bee Logo" className="w-16 h-16 object-contain ml-2" />
                
                {/* Images illustration - Centered */}
                <div className={`images-container absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
                  shouldAnimate ? 'images-animation' : ''
                }`}>
                  <img src="/need.png" alt="Level A1 - need" className="level-image a1-image" />
                  <img src="/require.png" alt="Level B1 - require" className="level-image b1-image" />
                  <img src="/necessitate.png" alt="Level C1 - necessitate" className="level-image c1-image" />
                </div>
              </div>
              <div className="w-full h-[1px] bg-gray-300 mx-auto mt-1 mb-4"></div>
            </div>

            <div className="flex-1 bg-white px-4 flex flex-col items-center">
              <div className="text-center w-full">
                {/* Progress Indicator */}
                <SurveyProgress currentStep={3} totalSteps={3} onBack={onBack} variant="mobile" />
                
                <h1 className="text-2xl font-bold text-blue-900 mb-8">What is your English level?</h1>
                
                {/* Level Selection Grid */}
                <div className="max-w-sm mx-auto w-full grid grid-cols-2 gap-3">
                  {englishLevels.map((level) => {
                    const IconComponent = level.icon;
                    return (
                      <button
                        key={level.id}
                        onClick={() => handleLevelSelect(level.id)}
                        className={`level-card ${selectedLevel === level.id ? 'selected' : ''}`}
                      >
                        <IconComponent />
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
                <img src="/logo01.png" alt="Speak Bee Logo" className="w-32 h-32 object-contain" />
              </div>
            </div>

            {/* Right form */}
            <div className="w-1/2 bg-white p-8 lg:p-16 flex flex-col pt-16">
              <div className="max-w-lg mx-auto w-full">
                {/* Progress Indicator */}
                <SurveyProgress currentStep={3} totalSteps={3} onBack={onBack} variant="desktop" />
                
                <h1 className="text-4xl font-bold text-blue-900 mb-10 text-center">
                  What is your English level?
                </h1>
                
                {/* Level Selection Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {englishLevels.map((level) => {
                    const IconComponent = level.icon;
                    return (
                      <button
                        key={level.id}
                        onClick={() => handleLevelSelect(level.id)}
                        className={`level-card desktop ${selectedLevel === level.id ? 'selected' : ''}`}
                      >
                        <IconComponent />
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
