import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import SurveyProgress from '@/components/surveys/SurveyProgress';

interface MoviesSurveyProps {
  isOpen: boolean;
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

const MoviesSurvey: React.FC<MoviesSurveyProps> = ({
  isOpen,
  onComplete,
  onBack,
  currentStep = 12,
  totalSteps = 12
}) => {
  const [animate, setAnimate] = React.useState(false);
  const options = React.useMemo(() => ['True', 'Partially true', "That's not true for me"], []);

  const handleSelect = React.useCallback(() => {
    onComplete();
  }, [onComplete]);

  React.useEffect(() => {
    if (isOpen) {
      setAnimate(true);
      const t = setTimeout(() => setAnimate(false), 1800);
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
                {/* Cinema image */}
                <div className="absolute left-1/2 transform -translate-x-1/2 top-[-8px]">
                  <img src="/cinema.png" alt="Cinema" className={`w-36 h-36 object-contain ${animate ? 'ms-pop-in' : ''}`} />
                </div>
              </div>
              <div className="w-full h-[1px] bg-gray-300 mx-auto mt-2 mb-6"></div>
            </div>

            <div className="flex-1 bg-white px-4 pb-24 flex flex-col items-center">
              <div className="text-center w-full">
                <SurveyProgress currentStep={currentStep!} totalSteps={totalSteps!} onBack={onBack} variant="mobile" />

                <h1 className="text-3xl font-bold text-blue-900 mb-4 leading-snug">
                  I struggle when watching English
                  <br />
                  movies.
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
                <img src="/cinema.png" alt="Cinema" className={`w-[520px] h-auto object-contain drop-shadow-sm ${animate ? 'ms-pop-in' : ''}`} />
              </div>
              <div className="absolute bottom-6 left-6">
                <img src="/logo01.png" alt="Elora Logo" className="w-32 h-32 object-contain" />
              </div>
            </div>

            {/* Right copy and options */}
            <div className="w-1/2 bg-white p-8 lg:p-16 flex flex-col pt-16">
              <div className="max-w-xl mx-auto w-full">
                <SurveyProgress currentStep={currentStep!} totalSteps={totalSteps!} onBack={onBack} variant="desktop" />

                <h1 className="text-2xl md:text-[40px] leading-snug md:leading-[1.2] font-bold text-blue-900 mb-6 text-center">
                  I struggle when watching English movies.
                </h1>
                <p className="text-gray-500 text-center mb-10">Is the following statement true for you?</p>

                <div className="space-y-4">
                  {options.map((label) => (
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
          /* Pop-in on enter */
          @keyframes ms-pop-in {
            0% { opacity: 0; transform: translateY(40px) scale(0.9) rotate(2deg); }
            40% { opacity: 1; transform: translateY(0) scale(1.04) rotate(0deg); }
            60% { transform: translateY(-12px) scale(0.995); }
            80% { transform: translateY(6px) scale(1.005); }
            100% { transform: translateY(0) scale(1); }
          }

          /* Combined float + periodic gentle shake bursts */
          @keyframes ms-float-shake {
            0% { transform: translateY(0) rotate(0deg); }
            18% { transform: translateY(-8px) rotate(0.2deg); }
            /* first shake burst */
            22% { transform: translate(-1px, -8px) rotate(-0.5deg); }
            26% { transform: translate(1px, -8px) rotate(0.5deg); }
            30% { transform: translate(-1px, -7px) rotate(-0.4deg); }
            34% { transform: translateY(-6px) rotate(0.2deg); }
            50% { transform: translateY(0) rotate(0deg); }
            66% { transform: translateY(8px) rotate(-0.2deg); }
            /* second shake burst */
            70% { transform: translate(1px, 8px) rotate(0.5deg); }
            74% { transform: translate(-1px, 8px) rotate(-0.5deg); }
            78% { transform: translate(1px, 7px) rotate(0.4deg); }
            82% { transform: translateY(6px) rotate(-0.2deg); }
            100% { transform: translateY(0) rotate(0deg); }
          }

          .ms-pop-in {
            animation: ms-pop-in 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) 1, ms-float-shake 5s ease-in-out 1.2s infinite;
            transform-origin: center bottom;
            will-change: transform, opacity;
          }
          @media (prefers-reduced-motion: reduce) {
            .ms-pop-in { animation: none; }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default MoviesSurvey;

 

