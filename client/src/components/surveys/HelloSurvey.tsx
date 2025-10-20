import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import SurveyProgress from '@/components/surveys/SurveyProgress';

interface HelloSurveyProps {
  isOpen: boolean;
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

const HelloSurvey: React.FC<HelloSurveyProps> = ({
  isOpen,
  onComplete,
  onBack,
  currentStep = 12,
  totalSteps = 12
}) => {
  const [animate, setAnimate] = React.useState(false);
  const options = React.useMemo(() => ['True', 'Partially true', "That's not true for me"], []);

  const handleSelect = React.useCallback(() => {
    // For now, any selection advances the flow
    onComplete();
  }, [onComplete]);

  React.useEffect(() => {
    if (isOpen) {
      setAnimate(true);
      const t = setTimeout(() => setAnimate(false), 1600);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="w-full h-full max-w-none max-h-none p-0 overflow-hidden border-0 bg-transparent m-0 rounded-none">
        <div className="w-full h-screen bg-white flex flex-col md:flex-row relative">
          {/* Mobile layout */}
          <div className="md:hidden w-full h-full flex flex-col">
            <div className="bg-blue-50 p-6 pb-0 flex flex-col relative">
              <div className='flex items-center w-full mb-4 relative'>
                <img src="/logo01.png" alt="Elora Logo" className="w-20 h-20 object-contain ml-2" />
                {/* Hello image - centered in header with bounce then float */}
                <div className="absolute left-1/2 transform -translate-x-1/2 top-[-10px]">
                  <img src="/Hello.png" alt="Hello" className={`w-40 h-40 object-contain ${animate ? 'hs-bounce-float' : ''}`} />
                </div>
              </div>
              <div className="w-full h-[1px] bg-gray-300 mx-auto mt-2 mb-6"></div>
            </div>

            <div className="flex-1 bg-white px-4 pb-24 flex flex-col items-center">
              <div className="text-center w-full">
                <SurveyProgress currentStep={currentStep!} totalSteps={totalSteps!} onBack={onBack} variant="mobile" />

                <h1 className="text-3xl font-bold text-blue-900 mb-4 leading-snug">
                  I don't have a friend to practice speaking with whenever I want.
                </h1>
                <p className="text-gray-500 mb-8">Is the following statement true for you?</p>

                <div className="max-w-sm mx-auto w-full space-y-3">
                  {options.map((label) => (
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
                <img src="/Hello.png" alt="Hello" className={`w-[520px] h-auto object-contain drop-shadow-sm ${animate ? 'hs-bounce-float' : ''}`} />
              </div>
              <div className="absolute bottom-6 left-6">
                <img src="/logo01.png" alt="Elora Logo" className="w-32 h-32 object-contain" />
              </div>
            </div>

            {/* Right copy and button */}
            <div className="w-1/2 bg-white p-8 lg:p-16 flex flex-col pt-16">
              <div className="max-w-xl mx-auto w-full">
                <SurveyProgress currentStep={currentStep!} totalSteps={totalSteps!} onBack={onBack} variant="desktop" />

                <h1 className="text-2xl md:text-[40px] leading-snug md:leading-[1.2] font-bold text-blue-900 mb-10 md:mb-8 text-center">
                  I don't have a friend to
                  <br className="hidden md:block" />
                  practice speaking with
                  <br className="hidden md:block" />
                  whenever I want.
                </h1>
                <p className="text-gray-500 mb-5 text-center">Is the following statement true for you?</p>

                <div className="max-w-md mx-auto w-full space-y-4">
                  {options.map((label) => (
                    <button
                      key={label}
                      onClick={handleSelect}
                      className="w-full rounded-2xl px-5 py-4 bg-white text-gray-800 border border-gray-200 hover:border-blue-300 shadow-sm text-left"
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
          /* Strong initial bounce, then gentle continuous float */
          @keyframes hs-hello-bounce {
            0% { opacity: 0; transform: translateY(-90px) scale(0.9) rotate(-1.5deg); }
            40% { opacity: 1; transform: translateY(0) scale(1.08) rotate(0deg); }
            60% { transform: translateY(-24px) scale(0.99); }
            80% { transform: translateY(10px) scale(1.01); }
            100% { transform: translateY(0) scale(1); }
          }
          @keyframes hs-hello-float {
            0% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
            100% { transform: translateY(0); }
          }
          .hs-bounce-float {
            animation: hs-hello-bounce 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) 1, hs-hello-float 5s ease-in-out 1.1s infinite;
            transform-origin: center bottom;
            will-change: transform, opacity;
          }
          @media (prefers-reduced-motion: reduce) {
            .hs-bounce-float { animation: none; }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default HelloSurvey;


