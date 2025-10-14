import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import SurveyProgress from '@/components/SurveyProgress';

interface SentenceFormationSurveyProps {
  isOpen: boolean;
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

const SentenceFormationSurvey: React.FC<SentenceFormationSurveyProps> = ({
  isOpen,
  onComplete,
  onBack,
  currentStep = 9,
  totalSteps = 9
}) => {
  const [animate, setAnimate] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setAnimate(true);
      const t = setTimeout(() => setAnimate(false), 1400);
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
                {/* Illustration - centered */}
                <div className="absolute left-1/2 transform -translate-x-1/2 top-[-6px]">
                  <img src="/speaker.png" alt="Speaker" className={`w-32 h-32 object-contain ${animate ? 'sf-bounce-in' : ''}`} />
                </div>
              </div>
              <div className="w-full h-[1px] bg-gray-300 mx-auto mt-2 mb-6"></div>
            </div>

            <div className="flex-1 bg-white px-4 pb-6 flex flex-col items-center">
              <div className="text-center w-full">
                <SurveyProgress currentStep={currentStep!} totalSteps={totalSteps!} onBack={onBack} variant="mobile" />

                <h1 className="text-3xl font-bold text-blue-900 mb-3 leading-snug">
                  I always form sentences
                  <br />
                  incorrectly when speaking.
                </h1>
                <p className="text-gray-500 mb-5">Is the following statement true for you?</p>

                <div className="max-w-sm mx-auto w-full space-y-3">
                  {['True', 'Partially true', "That\'s not true for me"].map((label) => (
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
              <img src="/speaker.png" alt="Speaker" className={`w-[400px] h-auto object-contain drop-shadow-sm ${animate ? 'sf-bounce-in' : ''}`} />
              <div className="absolute bottom-6 left-6">
                <img src="/logo01.png" alt="Speak Bee Logo" className="w-32 h-32 object-contain" />
              </div>
            </div>

            {/* Right copy and options */}
            <div className="w-1/2 bg-white p-8 lg:p-16 flex flex-col pt-16">
              <div className="max-w-xl mx-auto w-full">
                <SurveyProgress currentStep={currentStep!} totalSteps={totalSteps!} onBack={onBack} variant="desktop" />

                <h1 className="text-2xl md:text-[40px] leading-snug md:leading-[1.2] font-bold text-blue-900 mb-4 md:mb-6 text-center">
                  I always form sentences incorrectly when speaking.
                </h1>
                <p className="text-gray-500 text-center mb-10">Is the following statement true for you?</p>

                <div className="space-y-4">
                  {['True', 'Partially true', "That\'s not true for me"].map((label) => (
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

        {/* Local styles */}
        <style>{`
          @keyframes sf-bounce-in {
            0% { opacity: 0; transform: translateY(-40px) scale(0.85) rotate(-3deg); }
            40% { opacity: 1; transform: translateY(0) scale(1.02) rotate(0deg); }
            60% { transform: translateY(-14px) scale(0.98); }
            80% { transform: translateY(6px) scale(1.01); }
            100% { transform: translateY(0) scale(1); }
          }
          .sf-bounce-in {
            animation: sf-bounce-in 1.4s cubic-bezier(0.22, 1, 0.36, 1) 1;
            transform-origin: center bottom;
            will-change: transform, opacity;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default SentenceFormationSurvey;


