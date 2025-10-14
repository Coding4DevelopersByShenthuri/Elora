import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import SurveyProgress from '@/components/SurveyProgress';

interface SpeakOutSurveyProps {
  isOpen: boolean;
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

const SpeakOutSurvey: React.FC<SpeakOutSurveyProps> = ({
  isOpen,
  onComplete,
  onBack,
  currentStep = 5,
  totalSteps = 5
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="w-full h-full max-w-none max-h-none p-0 overflow-hidden border-0 bg-transparent m-0 rounded-none">
        <div className="w-full h-screen bg-white flex flex-col md:flex-row relative">
          {/* Mobile layout */}
          <div className="md:hidden w-full h-full flex flex-col">
            <div className="bg-blue-50 p-6 pb-0 flex flex-col relative">
              <div className='flex items-center w-full mb-4 relative'>
                <img src="/logo01.png" alt="Speak Bee Logo" className="w-20 h-20 object-contain ml-2" />
                {/* Mobile illustration - centered and lifted into the blue header */}
                <div className="absolute left-1/2 -translate-x-1/2 top-[-10px]">
                  <div className="relative w-36 h-36">
                    <img src="/Robot.png" alt="Robot" className="w-full h-full object-contain" />
                    <img src="/girl.jpg" alt="Girl" className="absolute right-[-24px] top-[5%] w-16 h-16 rounded-2xl object-cover shadow-md border border-white" />
                  </div>
                </div>
              </div>
              <div className="w-full h-[1px] bg-gray-300 mx-auto mt-2 mb-6"></div>
            </div>

            <div className="flex-1 bg-white px-4 pb-24 flex flex-col items-center">
              <div className="text-center w-full">
                <SurveyProgress currentStep={currentStep} totalSteps={totalSteps} onBack={onBack} variant="mobile" />

                <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-4 leading-snug">
                  Speak out loud to learn English.<br />
                  With <span className="text-teal-600">Speak Bee</span>,<br />
                  it’s simple and fun.
                </h1>
              </div>
            </div>

            {/* Mobile fixed bottom continue */}
            <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
              <button
                onClick={onComplete}
                className="w-full rounded-2xl px-6 py-3 text-white font-semibold shadow-md bg-blue-500 hover:bg-blue-600"
              >
                Continue
              </button>
            </div>
          </div>

          {/* Desktop layout */}
          <div className="hidden md:flex w-full h-full">
            {/* Left illustration */}
            <div className="w-1/2 bg-blue-50 flex items-center justify-center p-8 relative">
              <div className="relative">
                {/* Robot (transparent png/gif) */}
                <img src="/Robot.png" alt="Robot" className="w-[460px] h-auto object-contain drop-shadow-sm" />
                {/* Small rounded avatar of a girl - increased size */}
                <img src="/girl.jpg" alt="Girl" className="absolute right-[-28px] top-[20%] w-28 h-28 lg:w-32 lg:h-32 rounded-2xl object-cover shadow-lg border border-white" />
              </div>

              {/* Logo in bottom-left */}
              <div className="absolute bottom-6 left-6">
                <img src="/logo01.png" alt="Speak Bee Logo" className="w-32 h-32 object-contain" />
              </div>
            </div>

            {/* Right copy and button */}
            <div className="w-1/2 bg-white p-8 lg:p-16 flex flex-col pt-16">
              <div className="max-w-xl mx-auto w-full">
                <SurveyProgress currentStep={currentStep} totalSteps={totalSteps} onBack={onBack} variant="desktop" />

                <h1 className="text-2xl md:text-[40px] leading-snug md:leading-[1.2] font-bold text-blue-900 mb-10 md:mb-24 text-center">
                  Speak out loud to learn English. With <span className="text-yellow-600">Speak Bee</span>, it's simple and fun.
                </h1>

                <div className="flex justify-center">
                  <button
                    onClick={onComplete}
                    className="rounded-2xl px-10 py-4 text-white font-semibold shadow-md bg-blue-500 hover:bg-blue-600"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpeakOutSurvey;


