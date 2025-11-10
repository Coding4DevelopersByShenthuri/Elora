import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import SurveyProgress from '@/components/surveys/SurveyProgress';

interface InterestsSurveyProps {
  isOpen: boolean;
  onComplete: (surveyData?: any) => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

const INTEREST_OPTIONS: string[] = [
  '🧪 Science','📚 Literature','🌍 Languages','🏛️ Politics','🧠 Psychology','💬 Philosophy','🌐 Sociology','🚀 Entrepreneurship','📰 News','💰 Finance','🪐 Astronomy','➗ Mathematics','🏛️ Architecture','🎥 Animation', '📈 Marketing', '🖋️ Journalism', '💻 Software', '🎤 Pop Culture', '🍳 Cooking', '🥑 Food', '🧳 Travel', '🐾 Pets', '🛍️ Shopping', '🍿Movies', '🤖 Technology', '⚽ Sports', '🎻 Music', '🥗 Health & Fitness', '💅🏻 Fashion', '🏺 Culture', '💼 Jobs', '♻️ Environment', '🏰 History', '📱 Social Media', '🎨Art & Creativity'
];

const ROW_LAYOUT: number[] = [2,2,2,2,3,2,2,2,3,3,3,2,3,2,2];

const InterestsSurvey: React.FC<InterestsSurveyProps> = ({
  isOpen,
  onComplete,
  onBack,
  currentStep = 16,
  totalSteps = 17
}) => {
  const [bounce, setBounce] = React.useState(false);
  const [floatOn, setFloatOn] = React.useState(false);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const toggle = React.useCallback((option: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(option)) next.delete(option); else next.add(option);
      return next;
    });
  }, []);

  const mobileRows = React.useMemo(() => {
    const rows: string[][] = [];
    let start = 0;
    for (const count of ROW_LAYOUT) {
      rows.push(INTEREST_OPTIONS.slice(start, start + count));
      start += count;
    }
    return rows;
  }, []);

  const desktopRows = React.useMemo(() => {
    const rows: string[][] = [];
    let start = 0;
    for (const count of ROW_LAYOUT) {
      rows.push(INTEREST_OPTIONS.slice(start, start + count));
      start += count;
    }
    return rows;
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      setBounce(true);
      setFloatOn(false);
      const t = setTimeout(() => {
        setBounce(false);
        setFloatOn(true);
      }, 1400);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const handleContinue = React.useCallback(() => {
    // Save to sessionStorage only (not MySQL) during steps 1-16
    const surveyData = {
      interests: Array.from(selected),
      completedAt: new Date().toISOString()
    };
    const existingData = sessionStorage.getItem('speakbee_survey_data');
    const allData = existingData ? JSON.parse(existingData) : {};
    const mergedData = { ...allData, ...surveyData };
    sessionStorage.setItem('speakbee_survey_data', JSON.stringify(mergedData));
    // Pass data to onComplete
    onComplete(surveyData);
  }, [onComplete, selected]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="w-full h-full max-w-none max-h-none p-0 overflow-hidden border-0 bg-transparent m-0 rounded-none">
        <div className="w-full h-screen bg-white flex flex-col md:flex-row relative">
          {/* Mobile */}
          <div className="md:hidden w-full h-full flex flex-col">
            <div className="bg-blue-50 p-6 pb-0 flex flex-col relative">
              <div className='flex items-center w-full mb-4 relative'>
                <img src="/logo01.png" alt="Elora Logo" className="w-20 h-20 object-contain ml-2" />
                <div className="absolute left-1/2 transform -translate-x-1/2 top-[-10px]">
                  <img src="/paint.png" alt="Interests" className={`w-36 h-36 object-contain drop-shadow-sm ${bounce ? 'is-bounce' : ''} ${floatOn ? 'is-float' : ''}`} />
                </div>
              </div>
              <div className="w-full h-[1px] bg-gray-300 mx-auto mt-2 mb-6"></div>
            </div>

            <div className="flex-1 bg-white px-4 pb-10 flex flex-col items-center overflow-y-auto">
              <div className="text-center w-full">
                <SurveyProgress currentStep={currentStep!} totalSteps={totalSteps!} onBack={onBack} variant="mobile" />

                <h1 className="text-3xl font-bold text-blue-900 mb-2 leading-snug">
                  What's your personal
                  <br />
                  interests?
                </h1>
                <p className="text-gray-500 mb-5">The choice won't limit your experience</p>

                <div className="max-w-xl mx-auto w-full">
                  {mobileRows.map((row, idx) => (
                    <div key={idx} className={`${row.length === 3 ? 'grid grid-cols-3' : row.length === 2 ? 'grid grid-cols-2' : 'grid grid-cols-1'} gap-y-1 gap-x-1.5 ${idx > 0 ? 'mt-1' : ''} justify-items-center`}>
                      {row.map((opt) => {
                        const isSelected = selected.has(opt);
                        return (
                          <button
                            key={opt}
                            onClick={() => toggle(opt)}
                            className={`rounded-2xl h-12 px-3 text-[17px] leading-tight border transition-colors min-w-0 w-full flex items-center justify-between gap-2 ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800 border-gray-200 hover:border-blue-300'}`}
                          >
                            <span className="truncate text-left">{opt}</span>
                            <span className={`flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full border transition-colors ${isSelected ? 'bg-white border-green-500' : 'bg-white border-gray-300'}`}>
                              {isSelected && (
                                <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M5 10l3 3 7-7" />
                                </svg>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>

                <div className="mt-6 mb-4 flex justify-center">
                  <button onClick={handleContinue} className="w-full max-w-sm rounded-xl px-4 py-3 bg-blue-600 text-white font-semibold shadow-sm">Continue</button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex w-full h-full">
            <div className="w-1/2 bg-blue-50 flex items-center justify-center p-8 relative">
              <div className="relative">
                <img src="/paint.png" alt="Interests" className={`w-[520px] h-auto object-contain drop-shadow-sm ${bounce ? 'is-bounce' : ''} ${floatOn ? 'is-float' : ''}`} />
              </div>
              <div className="absolute bottom-6 left-6">
                <img src="/logo01.png" alt="Elora Logo" className="w-32 h-32 object-contain" />
              </div>
            </div>

            <div className="w-1/2 bg-white p-8 lg:p-16 flex flex-col pt-16">
              <div className="max-w-xl mx-auto w-full">
                <SurveyProgress currentStep={currentStep!} totalSteps={totalSteps!} onBack={onBack} variant="desktop" />

                <h1 className="text-2xl md:text-[40px] leading-snug md:leading-[1.2] font-bold text-blue-900 mb-2 text-center">
                  What's your personal interests?
                </h1>
                <p className="text-gray-500 text-center mb-8">The choice won't limit your experience</p>

                <div className="mt-2 max-h-[300px] overflow-y-auto pr-2">
                  <div className="flex flex-col gap-2">
                    {desktopRows.map((row, idx) => (
                      <div key={idx} className={`grid ${row.length === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
                        {row.map((opt) => {
                          const isSelected = selected.has(opt);
                          return (
                            <button
                              key={opt}
                              onClick={() => toggle(opt)}
                              className={`rounded-2xl h-12 px-3 text-[18px] leading-tight border transition-colors min-w-0 w-full max-w-[220px] justify-self-center flex items-center justify-between gap-2 ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-900 border-gray-200 hover:border-blue-300'}`}
                            >
                              <span className="truncate text-left">{opt}</span>
                              <span className={`flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full border transition-colors ${isSelected ? 'bg-white border-green-500' : 'bg-white border-gray-300'}`}>
                                {isSelected && (
                                  <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 10l3 3 7-7" />
                                  </svg>
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex justify-center">
                  <button onClick={handleContinue} className="w-full max-w-sm rounded-xl px-5 py-3 bg-blue-600 text-white font-semibold shadow-sm">Continue</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Local animation styles */}
        <style>{`
          @keyframes is-bounce-keyframes {
            0% { transform: translateY(20px) scale(0.98); opacity: 0; }
            25% { transform: translateY(-16px) scale(1.02); opacity: 1; }
            50% { transform: translateY(4px) scale(0.998); }
            75% { transform: translateY(-6px) scale(1.005); }
            100% { transform: translateY(0) scale(1); }
          }
          .is-bounce { animation: is-bounce-keyframes 1.4s cubic-bezier(0.2, 0.8, 0.2, 1) 1; transform-origin: center bottom; }
          @keyframes is-float-keyframes { 0% { transform: translateY(0); } 50% { transform: translateY(-6px); } 100% { transform: translateY(0); } }
          .is-float { animation: is-float-keyframes 5s ease-in-out infinite; }
          @media (prefers-reduced-motion: reduce) { .is-bounce, .is-float { animation: none; } }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default InterestsSurvey;


