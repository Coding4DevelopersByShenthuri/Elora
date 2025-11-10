import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import SurveyProgress from '@/components/surveys/SurveyProgress';

interface AdvancedVocabularySurveyProps {
  isOpen: boolean;
  onComplete: (surveyData?: any) => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

// C1–C2 Advanced vocabulary (mirrors the provided mock)
const ADVANCED_WORDS: string[] = [
  'ambiguity','intricate','articulate',
  'ingenuity','resilience','altruism',
  'introspection','meticulous',
  'inevitable','ephemeral','serendipity',
  'austerity','vindicate','omnipotent',
  'perspicacious'
];

const AdvancedVocabularySurvey: React.FC<AdvancedVocabularySurveyProps> = ({
  isOpen,
  onComplete,
  onBack,
  currentStep = 15,
  totalSteps = 16
}) => {
  const [bounce, setBounce] = React.useState(false);
  const [floatOn, setFloatOn] = React.useState(false);
  const [selectedWords, setSelectedWords] = React.useState<Set<string>>(new Set());

  const toggleWord = React.useCallback((word: string) => {
    setSelectedWords(prev => {
      const updated = new Set(prev);
      if (updated.has(word)) {
        updated.delete(word);
      } else {
        updated.add(word);
      }
      return updated;
    });
  }, []);

  // Mobile layout rows to visually balance like the mock
  const mobileRows = React.useMemo(() => {
    const layout = [3,3,2,3,3,1];
    const rows: string[][] = [];
    let start = 0;
    for (const count of layout) {
      rows.push(ADVANCED_WORDS.slice(start, start + count));
      start += count;
    }
    return rows;
  }, []);

  const desktopRows = React.useMemo(() => {
    const layout = [3,3,2,3,3,1];
    const rows: string[][] = [];
    let start = 0;
    for (const count of layout) {
      rows.push(ADVANCED_WORDS.slice(start, start + count));
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
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const handleContinue = React.useCallback(() => {
    // Save selected words to sessionStorage
    const surveyData = {
      advancedVocabulary: Array.from(selectedWords),
      completedAt: new Date().toISOString()
    };
    const existingData = sessionStorage.getItem('speakbee_survey_data');
    const allData = existingData ? JSON.parse(existingData) : {};
    const mergedData = { ...allData, ...surveyData };
    sessionStorage.setItem('speakbee_survey_data', JSON.stringify(mergedData));
    // Pass data to onComplete
    onComplete(surveyData);
  }, [onComplete, selectedWords]);

  // Debug: Log when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      console.log('✅ AdvancedVocabularySurvey (Step 15) is now OPEN');
    } else {
      console.log('❌ AdvancedVocabularySurvey (Step 15) is now CLOSED');
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="w-full h-full max-w-none max-h-none p-0 overflow-hidden border-0 bg-transparent m-0 rounded-none z-[9999]"
        title="Advanced Vocabulary Survey"
        description="Select advanced vocabulary words"
      >
        <div className="w-full h-screen bg-white flex flex-col md:flex-row relative">
          {/* Mobile layout */}
          <div className="md:hidden w-full h-full flex flex-col">
            <div className="bg-blue-50 p-6 pb-0 flex flex-col relative">
              <div className='flex items-center w-full mb-4 relative'>
                <img src="/logo01.png" alt="Elora Logo" className="w-20 h-20 object-contain ml-2" />
                {/* Advanced image */}
                <div className="absolute left-1/2 transform -translate-x-1/2 top-[-10px]">
                  <img src="/Ad.png" alt="C1-C2 Advanced" className={`w-36 h-36 object-contain drop-shadow-sm ${bounce ? 'adv-bounce-in' : ''} ${floatOn ? 'adv-float' : ''}`} />
                </div>
              </div>
              <div className="w-full h-[1px] bg-gray-300 mx-auto mt-2 mb-6"></div>
            </div>

            <div className="flex-1 bg-white px-4 pb-10 flex flex-col items-center overflow-y-auto">
              <div className="text-center w-full">
                <SurveyProgress currentStep={currentStep!} totalSteps={totalSteps!} onBack={onBack} variant="mobile" />

                <h1 className="text-3xl font-bold text-blue-900 mb-2 leading-snug">
                  Select all the words you
                  <br />
                  know:
                </h1>
                <p className="text-gray-500 mb-5">C1-C2 Advanced Level</p>

                <div className="max-w-xl mx-auto w-full">
                  {mobileRows.map((row, idx) => (
                    <div key={idx} className={`${(idx === 0 || idx === 1 || idx === 3 || idx === 4) ? 'grid grid-cols-3' : (idx === 2 ? 'grid grid-cols-2' : 'grid grid-cols-1')} gap-y-1 gap-x-1.5 ${idx > 0 ? 'mt-1' : ''} justify-items-center`}>
                      {row.map((w) => {
                        const isSelected = selectedWords.has(w);
                        return (
                          <button
                            key={w}
                            onClick={() => toggleWord(w)}
                            className={`rounded-2xl h-12 px-2 text-sm border transition-colors min-w-0 w-[140px] flex items-center justify-between gap-1 ${isSelected ? 'bg-rose-200 text-gray-900 border-rose-300' : 'bg-white text-gray-800 border-gray-200 hover:border-blue-300'}`}
                          >
                            <span className="truncate">{w}</span>
                            <span className={`flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full border transition-colors ${isSelected ? 'bg-white border-rose-500' : 'bg-white border-gray-300'}`}>
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

          {/* Desktop layout */}
          <div className="hidden md:flex w-full h-full">
            {/* Left illustration */}
            <div className="w-1/2 bg-blue-50 flex items-center justify-center p-8 relative">
              <div className="relative">
                <img src="/Ad.png" alt="C1-C2 Advanced" className={`w-[520px] h-auto object-contain drop-shadow-sm ${bounce ? 'adv-bounce-in' : ''} ${floatOn ? 'adv-float' : ''}`} />
              </div>
              <div className="absolute bottom-6 left-6">
                <img src="/logo01.png" alt="Elora Logo" className="w-32 h-32 object-contain" />
              </div>
            </div>

            {/* Right content */}
            <div className="w-1/2 bg-white p-8 lg:p-16 flex flex-col pt-16">
              <div className="max-w-xl mx-auto w-full">
                <SurveyProgress currentStep={currentStep!} totalSteps={totalSteps!} onBack={onBack} variant="desktop" />

                <h1 className="text-2xl md:text-[40px] leading-snug md:leading-[1.2] font-bold text-blue-900 mb-2 text-center">
                  Select all the words you know:
                </h1>
                <p className="text-gray-500 text-center mb-8">C1-C2 Advanced Level</p>

                <div className="mt-2 max-h-[420px] overflow-y-auto pr-2">
                  {desktopRows.map((row, idx) => (
                    <div
                      key={idx}
                      className={`${idx === 0 || idx === 1 || idx === 3 || idx === 4 ? 'grid grid-cols-3 justify-items-center gap-2' : ''} ${idx === 2 ? 'flex justify-center gap-2' : ''} ${idx === 5 ? 'flex justify-center' : ''} ${idx > 0 ? 'mt-2' : ''}`}
                    >
                      {row.map((w) => {
                        const isSelected = selectedWords.has(w);
                        return (
                          <button
                            key={w}
                            onClick={() => toggleWord(w)}
                            className={`rounded-2xl h-12 px-3 text-[15px] border transition-colors min-w-0 w-full max-w-[200px] flex items-center justify-between gap-2 ${isSelected ? 'bg-rose-200 text-gray-900 border-rose-300' : 'bg-white text-gray-900 border-gray-200 hover:border-blue-300'}`}
                          >
                            <span className="truncate">{w}</span>
                            <span className={`flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full border transition-colors ${isSelected ? 'bg-white border-rose-500' : 'bg-white border-gray-300'}`}>
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

                <div className="mt-6 flex justify-center">
                  <button onClick={handleContinue} className="w-full max-w-sm rounded-xl px-5 py-3 bg-blue-600 text-white font-semibold shadow-sm">Continue</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Local styles: bounce once, then gentle float */}
        <style>{`
          @keyframes adv-bounce-in-keyframes {
            0% { transform: translateY(24px) scale(0.98); opacity: 0; }
            25% { transform: translateY(-18px) scale(1.02); opacity: 1; }
            50% { transform: translateY(6px) scale(0.998); }
            75% { transform: translateY(-6px) scale(1.004); }
            100% { transform: translateY(0) scale(1); }
          }
          .adv-bounce-in {
            animation: adv-bounce-in-keyframes 1.4s cubic-bezier(0.2, 0.8, 0.2, 1) 1;
            transform-origin: center bottom;
            will-change: transform, opacity;
          }
          @keyframes adv-float-keyframes {
            0% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
            100% { transform: translateY(0); }
          }
          .adv-float { 
            animation: adv-float-keyframes 5s ease-in-out infinite; 
            will-change: transform; 
          }
          @media (prefers-reduced-motion: reduce) {
            .adv-bounce-in, .adv-float { animation: none; }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedVocabularySurvey;


