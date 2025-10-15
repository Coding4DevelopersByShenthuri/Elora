import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import SurveyProgress from '@/components/surveys/SurveyProgress';

interface FluentUnderstandingSurveyProps {
  isOpen: boolean;
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

const FluentUnderstandingSurvey: React.FC<FluentUnderstandingSurveyProps> = ({
  isOpen,
  onComplete,
  onBack,
  currentStep = 7,
  totalSteps = 7
}) => {
  const [animateFloat, setAnimateFloat] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setAnimateFloat(true);
      const timer = setTimeout(() => setAnimateFloat(false), 2500);
      return () => clearTimeout(timer);
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
                <div className="absolute left-1/2 transform -translate-x-1/2 top-[-6px]">
                  <div className={`relative w-36 h-36 ${animateFloat ? 'float-container' : ''}`}>
                    <img src="/question.png" alt="Questions" className={`w-full h-full object-contain ${animateFloat ? 'float-image' : ''}`} />
                    {/* Floating question marks */}
                    {animateFloat && (
                      <>
                        <span className="qm qm-1">?</span>
                        <span className="qm qm-2">?</span>
                        <span className="qm qm-3">?</span>
                        <span className="qm qm-4">?</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="w-full h-[1px] bg-gray-300 mx-auto mt-2 mb-6"></div>
            </div>

            <div className="flex-1 bg-white px-4 pb-6 flex flex-col items-center">
              <div className="text-center w-full">
                <SurveyProgress currentStep={currentStep} totalSteps={totalSteps} onBack={onBack} variant="mobile" />

                <h1 className="text-3xl font-bold text-blue-900 mb-2 leading-snug">
                  I don't understand when
                  <br />
                  fluent English is spoken.
                </h1>
                <p className="text-gray-500 mb-5">Is the following statement true for you?</p>

                <div className="max-w-sm mx-auto w-full space-y-3">
                  {['True', 'Partially true', "That's not true for me"].map((label) => (
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
              <div className={`relative w-[420px] h-[420px] ${animateFloat ? 'float-container' : ''}`}>
                <img src="/question.png" alt="Questions" className={`w-full h-full object-contain drop-shadow-sm ${animateFloat ? 'float-image' : ''}`} />
                {animateFloat && (
                  <>
                    <span className="qm qm-1">?</span>
                    <span className="qm qm-2">?</span>
                    <span className="qm qm-3">?</span>
                    <span className="qm qm-4">?</span>
                    <span className="qm qm-5">?</span>
                  </>
                )}
              </div>
              <div className="absolute bottom-6 left-6">
                <img src="/logo01.png" alt="Speak Bee Logo" className="w-32 h-32 object-contain" />
              </div>
            </div>

            {/* Right copy and options */}
            <div className="w-1/2 bg-white p-8 lg:p-16 flex flex-col pt-16">
              <div className="max-w-xl mx-auto w-full">
                <SurveyProgress currentStep={currentStep} totalSteps={totalSteps} onBack={onBack} variant="desktop" />

                <h1 className="text-2xl md:text-[40px] leading-snug md:leading-[1.2] font-bold text-blue-900 mb-4 md:mb-6 text-center">
                  I don't understand when fluent English is spoken.
                </h1>
                <p className="text-gray-500 text-center mb-10">Is the following statement true for you?</p>

                <div className="space-y-4">
                  {['True', 'Partially true', "That's not true for me"].map((label) => (
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
          @keyframes float-image {
            0% { transform: translateY(0) scale(1) rotate(0deg); }
            20% { transform: translateY(-10px) scale(1.02) rotate(-1deg); }
            40% { transform: translateY(6px) scale(1.0) rotate(0.6deg); }
            60% { transform: translateY(-6px) scale(1.01) rotate(-0.4deg); }
            80% { transform: translateY(3px) scale(1.0) rotate(0.2deg); }
            100% { transform: translateY(0) scale(1) rotate(0deg); }
          }
          .float-image {
            animation: float-image 2.2s ease-in-out 1;
            transform-origin: center bottom;
            will-change: transform;
          }

          @keyframes float-up-down {
            0% { transform: translateY(0) scale(1); opacity: 0; }
            10% { opacity: 1; }
            50% { transform: translateY(-14px) scale(1.05); }
            100% { transform: translateY(0) scale(1); opacity: 1; }
          }
          .qm {
            position: absolute;
            font-weight: 800;
            color: #2563eb; /* blue-600 */
            filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
            opacity: 0.9;
            animation: float-up-down 2.2s ease-in-out 1;
          }
          .qm-1 { top: -6%; left: 14%; font-size: 26px; animation-delay: .05s; }
          .qm-2 { top: 6%; right: -8%; font-size: 30px; color:#0ea5e9; animation-delay: .15s; }
          .qm-3 { bottom: 12%; left: -10%; font-size: 24px; color:#3b82f6; animation-delay: .1s; }
          .qm-4 { bottom: -6%; right: 6%; font-size: 22px; color:#1d4ed8; animation-delay: .2s; }
          .qm-5 { top: 36%; left: -12%; font-size: 20px; color:#38bdf8; animation-delay: .25s; }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default FluentUnderstandingSurvey;


