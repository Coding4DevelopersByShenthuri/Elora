import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import type { SurveyData } from '@/components/UserSurvey';
import SurveyProgress from '@/components/SurveyProgress';

interface LanguageSurveyProps {
  isOpen: boolean;
  onComplete: (surveyData: SurveyData) => void;
  onBack?: () => void;
}

const languages = [
  'English', 'Spanish', 'French', 'German', 'Hindi', 'Arabic', 'Bengali', 'Portuguese', 'Russian', 'Japanese', 'Korean', 'Turkish', 'Italian', 'Vietnamese', 'Polish', 'Ukrainian', 'Dutch', 'Persian', 'Urdu', 'Punjabi', 'Gujarati', 'Tamil', 'Telugu', 'Marathi', 'Malayalam', 'Kannada', 'Thai', 'Indonesian', 'Filipino', 'Swahili', 'Amharic', 'Yoruba', 'Igbo', 'Zulu', 'Other'
];

const LanguageSurvey: React.FC<LanguageSurveyProps> = ({ isOpen, onComplete, onBack }) => {
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>('');
  const { updateUserSurveyData } = useAuth();

  const handleContinue = () => {
    if (!selectedLanguage) return;
    const surveyData: SurveyData = {
      nativeLanguage: selectedLanguage,
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
            <div className="bg-blue-50 p-6 pb-0 flex flex-col relative">
              <div className='flex items-center w-full mb-4 relative'>
                <img src="/logo01.png" alt="Speak Bee Logo" className="w-20 h-20 object-contain ml-2" />
                <img src="/world.png" alt="Globe" className="w-40 h-32 object-contain absolute left-1/2 transform -translate-x-1/2" />
              </div>
              <div className="w-full h-[1px] bg-gray-300 mx-auto mt-2 mb-8"></div>
            </div>

            <div className="flex-1 bg-white px-4 flex flex-col items-center">
              <div className="text-center w-full">
                {/* Progress Indicator */}
                <SurveyProgress currentStep={2} totalSteps={2} onBack={onBack} variant="mobile" />
                
                <h1 className="text-2xl font-bold text-blue-900 mb-8">What is your native language?</h1>
                <div className="max-w-sm mx-auto w-full">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full border rounded-2xl px-4 py-3 text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">Choose an option</option>
                    {languages.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>

                  <button
                    onClick={handleContinue}
                    disabled={!selectedLanguage}
                    className={`mt-8 w-full rounded-2xl px-6 py-3 text-white font-semibold shadow-md ${selectedLanguage ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-300 cursor-not-allowed'}`}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex w-full h-full">
            {/* Left image panel */}
            <div className="w-1/2 bg-blue-50 flex items-center justify-center p-8 relative">
              <div className="text-center">
                <img src="/world.png" alt="Globe" className="w-72 h-72 lg:w-110 lg:h-90 mx-auto" />
              </div>
              <div className="absolute bottom-6 left-6">
                <img src="/logo01.png" alt="Speak Bee Logo" className="w-32 h-32 object-contain" />
              </div>
            </div>

            {/* Right form */}
            <div className="w-1/2 bg-white p-8 lg:p-35 flex flex-col justify-center">
              <div className="max-w-lg mx-auto w-full">
                {/* Progress Indicator */}
                <SurveyProgress currentStep={2} totalSteps={2} onBack={onBack} variant="desktop" />

                <h1 className="text-4xl font-bold text-blue-900 mb-8 text-center">What is your native language?</h1>

                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full border rounded-2xl px-4 py-3 text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="">Choose an option</option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>

                <button
                  onClick={handleContinue}
                  disabled={!selectedLanguage}
                  className={`mt-8 w-full rounded-2xl px-6 py-3 text-white font-semibold shadow-md ${selectedLanguage ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-300 cursor-not-allowed'}`}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LanguageSurvey;


