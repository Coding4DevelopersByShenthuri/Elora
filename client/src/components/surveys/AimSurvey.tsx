import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import SurveyProgress from '@/components/surveys/SurveyProgress';

interface AimSurveyProps {
  isOpen: boolean;
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

const AimSurvey: React.FC<AimSurveyProps> = ({
  isOpen,
  onComplete,
  onBack,
  currentStep = 6,
  totalSteps = 6
}) => {
  const OPTIONS = [
    'Speak confidently with natives',
    'Watch movies without subtitles',
    'Understand conversations effortlessly',
    'Read texts fluently'
  ];

  const [shouldAnimate, setShouldAnimate] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setShouldAnimate(true);
      const t = setTimeout(() => setShouldAnimate(false), 1300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const handleSelect = () => {
    onComplete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="w-full h-full max-w-none max-h-none p-0 overflow-hidden border-0 bg-transparent m-0 rounded-none">
        <div className="w-full h-screen bg-white flex flex-col md:flex-row relative">
          {/* Mobile layout */}
          <div className="md:hidden w-full h-full flex flex-col">
            <div className="bg-blue-50 p-6 pb-0 flex flex-col relative">
              <div className='flex items-center w-full mb-4 relative'>
                <img src="/logo01.png" alt="Speak Bee Logo" className="w-20 h-20 object-contain ml-2" />
                {/* Mobile illustration - centered */}
                <img src="/aim.png" alt="Aim" className={`w-38 h-38 object-contain absolute left-1/2 transform -translate-x-1/2 ${shouldAnimate ? 'aim-bounce-once' : ''}`} />
              </div>
              <div className="w-full h-[1px] bg-gray-300 mx-auto mt-2 mb-6"></div>
            </div>

            <div className="flex-1 bg-white px-4 pb-6 flex flex-col items-center">
              <div className="text-center w-full">
                <SurveyProgress currentStep={currentStep} totalSteps={totalSteps} onBack={onBack} variant="mobile" />

                <h1 className="text-3xl font-bold text-blue-900 mb-6 leading-snug">
                  What level do you
                  <br />
                  aim to achieve?
                </h1>

                <div className="max-w-sm mx-auto w-full space-y-3">
                  {OPTIONS.map((label) => (
                    <button
                      key={label}
                      onClick={handleSelect}
                      className="w-full rounded-2xl px-4 py-3 bg-white text-gray-800 border border-gray-200 hover:border-blue-300 shadow-sm text-left"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop layout */}
          <div className="hidden md:flex w-full h-full">
            {/* Left illustration */}
            <div className="w-1/2 bg-blue-50 flex items-center justify-center p-8 relative">
              <div className="relative">
                <img src="/aim.png" alt="Aim" className={`w-[420px] h-auto object-contain drop-shadow-sm ${shouldAnimate ? 'aim-bounce-once' : ''}`} />
              </div>
              <div className="absolute bottom-6 left-6">
                <img src="/logo01.png" alt="Speak Bee Logo" className="w-32 h-32 object-contain" />
              </div>
            </div>

            {/* Right copy and options */}
            <div className="w-1/2 bg-white p-8 lg:p-16 flex flex-col pt-16">
              <div className="max-w-xl mx-auto w-full">
                <SurveyProgress currentStep={currentStep} totalSteps={totalSteps} onBack={onBack} variant="desktop" />

                <h1 className="text-2xl md:text-[40px] leading-snug md:leading-[1.2] font-bold text-blue-900 mb-10 md:mb-14 text-center">
                  What level do you aim to achieve?
                </h1>

                <div className="space-y-4">
                  {OPTIONS.map((label) => (
                    <button
                      key={label}
                      onClick={handleSelect}
                      className="w-full rounded-2xl px-6 py-4 bg-white text-gray-900 border border-gray-200 hover:border-blue-300 text-left shadow-sm"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes aim-bounce-once {
            0% { transform: translateY(0) scale(1) rotate(0deg); }
            15% { transform: translateY(-20px) scale(1.04) rotate(-1deg); }
            30% { transform: translateY(6px) scale(1.0) rotate(0.6deg); }
            45% { transform: translateY(-10px) scale(1.02) rotate(-0.5deg); }
            60% { transform: translateY(3px) scale(1.0) rotate(0.3deg); }
            70% { transform: translateY(0) rotate(2deg); }
            80% { transform: translateY(0) rotate(-2deg); }
            90% { transform: translateY(0) rotate(1deg); }
            100% { transform: translateY(0) scale(1) rotate(0deg); }
          }
          .aim-bounce-once {
            animation: aim-bounce-once 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) 1;
            transform-origin: center bottom;
            will-change: transform;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default AimSurvey;


