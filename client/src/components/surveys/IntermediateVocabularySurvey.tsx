import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import SurveyProgress from '@/components/surveys/SurveyProgress';

interface IntermediateVocabularySurveyProps {
  isOpen: boolean;
  onComplete: (surveyData?: any) => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

// A set of B1–B2 level words to mirror the UI in the provided image
const INTERMEDIATE_WORDS: string[] = [
  'argument','explain','neighbor','opportunity','knowledge','relationship','challenge','prepare','disappointment','concentrate','compromise','creative','recommendation','responsibility','confident','decision','solution','environment','experience','ability','advantage','difference','education','encourage','discover','improvement','influence','opinion','behavior','communication','achievement','support','community','technology','tradition','competition','direction','security','exercise','transport'
];


const IntermediateVocabularySurvey: React.FC<IntermediateVocabularySurveyProps> = ({
  isOpen,
  onComplete,
  onBack,
  currentStep = 14,
  totalSteps = 15
}) => {
  const [animate, setAnimate] = React.useState(false);
  const [selectedWords, setSelectedWords] = React.useState<Set<string>>(new Set());

  const firstTwelve = React.useMemo(() => INTERMEDIATE_WORDS.slice(0, 12), []);
  const fourthRow = React.useMemo(() => INTERMEDIATE_WORDS.slice(12, 15), []);
  const remaining = React.useMemo(() => INTERMEDIATE_WORDS.slice(15), []);
  const remainingFullRows = React.useMemo(() => {
    const fullCount = Math.floor(remaining.length / 4) * 4;
    return remaining.slice(0, fullCount);
  }, [remaining.length]);
  const remainingLastRow = React.useMemo(() => {
    const fullCount = Math.floor(remaining.length / 4) * 4;
    return remaining.slice(fullCount);
  }, [remaining.length]);

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

  // Mobile custom row layout stays similar to A1 page for visual balance
  const mobileRowCounts = React.useMemo(() => [3, 4, 3, 3, 3, 3, 4, 3, 3], []);
  const mobileRows = React.useMemo(() => {
    const rows: string[][] = [];
    let start = 0;
    for (const count of mobileRowCounts) {
      rows.push(INTERMEDIATE_WORDS.slice(start, start + count));
      start += count;
    }
    return rows;
  }, [mobileRowCounts]);

  React.useEffect(() => {
    if (isOpen) {
      setAnimate(true);
      const t = setTimeout(() => setAnimate(false), 1600); // bounce once on enter
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const handleContinue = React.useCallback(() => {
    // Save selected words to sessionStorage
    const surveyData = {
      intermediateVocabulary: Array.from(selectedWords),
      completedAt: new Date().toISOString()
    };
    const existingData = sessionStorage.getItem('speakbee_survey_data');
    const allData = existingData ? JSON.parse(existingData) : {};
    const mergedData = { ...allData, ...surveyData };
    sessionStorage.setItem('speakbee_survey_data', JSON.stringify(mergedData));
    // Pass data to onComplete
    onComplete(surveyData);
  }, [onComplete, selectedWords]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="w-full h-full max-w-none max-h-none p-0 overflow-hidden border-0 bg-transparent m-0 rounded-none z-[9999]"
        title="Intermediate Vocabulary Survey"
        description="Select intermediate vocabulary words"
      >
        <div className="w-full h-screen bg-white flex flex-col md:flex-row relative">
          {/* Mobile layout */}
          <div className="md:hidden w-full h-full flex flex-col">
            <div className="bg-blue-50 p-6 pb-0 flex flex-col relative">
              <div className='flex items-center w-full mb-4 relative'>
                <img src="/logo01.png" alt="Elora Logo" className="w-20 h-20 object-contain ml-2" />
                {/* Inter image */}
                <div className="absolute left-1/2 transform -translate-x-1/2 top-[-10px]">
                  <img src="/Inter.png" alt="B1-B2 Level" className={`w-36 h-36 object-contain drop-shadow-sm ${animate ? 'iv-bounce-in' : ''}`} />
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
                <p className="text-gray-500 mb-5">B1-B2 Intermediate Level</p>

                <div className="max-w-xl mx-auto w-full">
                  {mobileRows.map((row, idx) => (
                    <div key={idx} className={`flex flex-wrap justify-center gap-2 ${idx > 0 ? 'mt-2' : ''}`}>
                      {row.map((w) => {
                        const isSelected = selectedWords.has(w);
                        return (
                          <button
                            key={w}
                            onClick={() => toggleWord(w)}
                            className={`rounded-2xl min-h-[48px] px-3 py-2 text-sm border transition-colors flex items-center justify-between gap-2 flex-shrink-0 ${isSelected ? 'bg-yellow-400 text-gray-900 border-yellow-400' : 'bg-white text-gray-800 border-gray-200 hover:border-blue-300'}`}
                            style={{ minWidth: 'fit-content', maxWidth: '100%' }}
                          >
                            <span className="text-left break-words whitespace-normal leading-tight">{w}</span>
                            <span className={`flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full border transition-colors ${isSelected ? 'bg-white border-yellow-500' : 'bg-white border-gray-300'}`}>
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
                <img src="/Inter.png" alt="B1-B2 Level" className={`w-[520px] h-auto object-contain drop-shadow-sm ${animate ? 'iv-bounce-in' : ''}`} />
              </div>
              <div className="absolute bottom-6 left-6">
                <img src="/logo01.png" alt="Elora Logo" className="w-32 h-32 object-contain" />
              </div>
            </div>

            {/* Right content */}
            <div className="w-1/2 bg-white p-8 lg:p-16 flex flex-col pt-8">
              <div className="max-w-xl mx-auto w-full">
                <SurveyProgress currentStep={currentStep!} totalSteps={totalSteps!} onBack={onBack} variant="desktop" />

                <h1 className="text-2xl md:text-[40px] leading-snug md:leading-[1.2] font-bold text-blue-900 mb-2 text-center">
                  Select all the words you know:
                </h1>
                <p className="text-gray-500 text-center mb-6">B1-B2 Intermediate Level</p>

                <div className="mt-2 max-h-[360px] overflow-y-auto pr-2">
                  <div className="flex flex-wrap gap-3 justify-center">
                    {firstTwelve.map((w) => {
                      const isSelected = selectedWords.has(w);
                      return (
                        <button
                          key={w}
                          onClick={() => toggleWord(w)}
                          className={`rounded-2xl min-h-[48px] px-4 py-2.5 text-sm border transition-colors flex items-center justify-center gap-2 flex-shrink-0 ${isSelected ? 'bg-yellow-400 text-gray-900 border-yellow-400' : 'bg-white text-gray-900 border-gray-200 hover:border-blue-300'}`}
                          style={{ minWidth: 'fit-content', maxWidth: '280px' }}
                        >
                          <span className="text-center break-words whitespace-normal leading-tight">{w}</span>
                          <span className={`flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full border transition-colors ${isSelected ? 'bg-white border-yellow-500' : 'bg-white border-gray-300'}`}>
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

                  {/* 4th row centered for desktop */}
                  <div className="mt-3 flex flex-wrap justify-center gap-3">
                    {fourthRow.map((w) => {
                      const isSelected = selectedWords.has(w);
                      return (
                        <button
                          key={w}
                          onClick={() => toggleWord(w)}
                          className={`rounded-2xl min-h-[48px] px-4 py-2.5 text-sm border transition-colors flex items-center justify-center gap-2 flex-shrink-0 ${isSelected ? 'bg-yellow-400 text-gray-900 border-yellow-400' : 'bg-white text-gray-900 border-gray-200 hover:border-blue-300'}`}
                          style={{ minWidth: 'fit-content', maxWidth: '280px' }}
                        >
                          <span className="text-center break-words whitespace-normal leading-tight">{w}</span>
                          <span className={`flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full border transition-colors ${isSelected ? 'bg-white border-yellow-500' : 'bg-white border-gray-300'}`}>
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

                  {/* Remaining words below */}
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-3 justify-center">
                      {remainingFullRows.map((w) => {
                        const isSelected = selectedWords.has(w);
                        return (
                          <button
                            key={w}
                            onClick={() => toggleWord(w)}
                            className={`rounded-2xl min-h-[48px] px-4 py-2.5 text-sm border transition-colors flex items-center justify-center gap-2 flex-shrink-0 ${isSelected ? 'bg-yellow-400 text-gray-900 border-yellow-400' : 'bg-white text-gray-900 border-gray-200 hover:border-blue-300'}`}
                            style={{ minWidth: 'fit-content', maxWidth: '280px' }}
                          >
                            <span className="text-center break-words whitespace-normal leading-tight">{w}</span>
                            <span className={`flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full border transition-colors ${isSelected ? 'bg-white border-yellow-500' : 'bg-white border-gray-300'}`}>
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
                    {remainingLastRow.length > 0 && (
                      <div className="mt-3 flex flex-wrap justify-center gap-3">
                        {remainingLastRow.map((w) => {
                          const isSelected = selectedWords.has(w);
                          return (
                            <button
                              key={w}
                              onClick={() => toggleWord(w)}
                              className={`rounded-2xl min-h-[48px] px-4 py-2.5 text-sm border transition-colors flex items-center justify-center gap-2 flex-shrink-0 ${isSelected ? 'bg-yellow-400 text-gray-900 border-yellow-400' : 'bg-white text-gray-900 border-gray-200 hover:border-blue-300'}`}
                              style={{ minWidth: 'fit-content', maxWidth: '280px' }}
                            >
                              <span className="text-center break-words whitespace-normal leading-tight">{w}</span>
                              <span className={`flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full border transition-colors ${isSelected ? 'bg-white border-yellow-500' : 'bg-white border-gray-300'}`}>
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
                    )}
                  </div>
                </div>

                <div className="mt-4 flex justify-center">
                  <button onClick={handleContinue} className="w-full max-w-sm rounded-xl px-5 py-3 bg-blue-600 text-white font-semibold shadow-sm">Continue</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Local styles: one-time bounce on enter */}
        <style>{`
          @keyframes iv-bounce-in-keyframes {
            0% { transform: translateY(20px) scale(0.98); opacity: 0; }
            25% { transform: translateY(-16px) scale(1.02); opacity: 1; }
            50% { transform: translateY(4px) scale(0.998); }
            75% { transform: translateY(-6px) scale(1.005); }
            100% { transform: translateY(0) scale(1); }
          }
          .iv-bounce-in { 
            animation: iv-bounce-in-keyframes 1.4s cubic-bezier(0.2, 0.8, 0.2, 1) 1; 
            transform-origin: center bottom; 
            will-change: transform, opacity; 
          }
          @media (prefers-reduced-motion: reduce) {
            .iv-bounce-in { animation: none; }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default IntermediateVocabularySurvey;


