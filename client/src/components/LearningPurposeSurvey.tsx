import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import type { SurveyData } from '@/components/UserSurvey';
import SurveyProgress from '@/components/SurveyProgress';

interface LearningPurposeSurveyProps {
	isOpen: boolean;
	onComplete: (surveyData: SurveyData) => void;
	onBack?: () => void;
	currentStep?: number;
	totalSteps?: number;
}

const PURPOSE_OPTIONS = [
	'Daily conversations',
	'Work and career',
	'Exam preparation (IELTS / TOEFL)',
	'Moving or traveling abroad',
	'For educational purposes',
	'Communicating with partners',
    'Brain training and practice',
	'Other'
];

const LearningPurposeSurvey: React.FC<LearningPurposeSurveyProps> = ({ isOpen, onComplete, onBack, currentStep = 1, totalSteps = 3 }) => {
	const { updateUserSurveyData } = useAuth();
	const [selectedPurposes, setSelectedPurposes] = React.useState<string[]>([]);
	const [shouldAnimate, setShouldAnimate] = React.useState(false);

	React.useEffect(() => {
		if (isOpen) {
			setShouldAnimate(true);
			const timer = setTimeout(() => setShouldAnimate(false), 1200);
			return () => clearTimeout(timer);
		}
	}, [isOpen]);

	const togglePurpose = (purpose: string) => {
		setSelectedPurposes((prev) =>
			prev.includes(purpose) ? prev.filter((p) => p !== purpose) : [...prev, purpose]
		);
	};

	const handleContinue = () => {
		if (!selectedPurposes.length) return;
		const surveyData: SurveyData = {
			learningPurpose: selectedPurposes,
			completedAt: new Date().toISOString()
		};
		updateUserSurveyData(surveyData as any);
		onComplete(surveyData);
	};

	return (
		<Dialog open={isOpen} onOpenChange={() => {}}>
			<DialogContent className="w-full h-full max-w-none max-h-none p-0 overflow-hidden border-0 bg-transparent m-0 rounded-none">
				<div className="w-full h-screen bg-white flex flex-col md:flex-row relative">
					{/* Mobile Layout */}
					<div className="md:hidden w-full h-full flex flex-col">
						<div className="bg-blue-50 p-6 pb-0 flex flex-col relative">
							<div className='flex items-center w-full mb-4 relative'>
								<img src="/logo01.png" alt="Speak Bee Logo" className="w-20 h-20 object-contain ml-2" />
								<img src="/Book.png" alt="Book" className={`w-32 h-32 object-contain absolute left-1/2 transform -translate-x-1/2 ${shouldAnimate ? 'animate-calendar-bounce' : ''}`} />
							</div>
							<div className="w-full h-[1px] bg-gray-300 mx-auto mt-2 mb-6"></div>
						</div>

						<div className="flex-1 bg-white px-4 flex flex-col items-center">
							<div className="text-center w-full">
								<SurveyProgress currentStep={currentStep} totalSteps={totalSteps} onBack={onBack} variant="mobile" />
								<h1 className="text-2xl font-bold text-blue-900 mb-6">Why do you want to learn?</h1>
								<div className="max-w-sm mx-auto w-full space-y-3 overflow-y-auto" style={{ maxHeight: '360px' }}>
									{PURPOSE_OPTIONS.map((option) => {
										const selected = selectedPurposes.includes(option);
										return (
											<button
												key={option}
												onClick={() => togglePurpose(option)}
												className={`w-full rounded-2xl px-4 py-3 bg-white text-gray-800 border ${selected ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'} text-left`}
											>
												{option}
											</button>
										);
									})}
								</div>
								<button
									onClick={handleContinue}
									disabled={!selectedPurposes.length}
									className={`mt-6 w-full max-w-sm rounded-2xl px-6 py-3 text-white font-semibold shadow-md ${selectedPurposes.length ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-300 cursor-not-allowed'}`}
								>
									Continue
								</button>
							</div>
						</div>
					</div>

					{/* Desktop Layout */}
					<div className="hidden md:flex w-full h-full">
						<div className="w-1/2 bg-blue-50 flex items-center justify-center p-8 relative">
							<div className="text-center">
								<img src="/Book.png" alt="Book" className={`w-72 h-72 lg:w-96 lg:h-96 mx-auto ${shouldAnimate ? 'animate-calendar-bounce' : ''}`} />
							</div>
							<div className="absolute bottom-6 left-6">
								<img src="/logo01.png" alt="Speak Bee Logo" className="w-32 h-32 object-contain" />
							</div>
						</div>

						<div className="w-1/2 bg-white p-8 lg:p-16 flex flex-col pt-16">
							<div className="max-w-lg mx-auto w-full">
								<SurveyProgress currentStep={currentStep} totalSteps={totalSteps} onBack={onBack} variant="desktop" />
								<h1 className="text-4xl font-bold text-blue-900 mb-8 text-center">Why do you want to learn?</h1>
								<div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
									{PURPOSE_OPTIONS.map((option) => {
										const selected = selectedPurposes.includes(option);
										return (
											<button
												key={option}
												onClick={() => togglePurpose(option)}
												className={`w-full rounded-2xl px-5 py-4 bg-white text-gray-900 border ${selected ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'} text-left`}
											>
												{option}
											</button>
										);
									})}
								</div>
								<button
									onClick={handleContinue}
									disabled={!selectedPurposes.length}
									className={`mt-8 w-full rounded-2xl px-6 py-3 text-white font-semibold shadow-md ${selectedPurposes.length ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-300 cursor-not-allowed'}`}
								>
									Continue
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Reuse the calendar bounce for subtle pop-in */}
				<style>{`
					@keyframes calendar-bounce {
						0% { transform: translateY(0) scale(1) rotate(0deg); }
						15% { transform: translateY(-35px) scale(1.05) rotate(-1deg); }
						30% { transform: translateY(-10px) scale(1.02) rotate(0.5deg); }
						45% { transform: translateY(-20px) scale(1.03) rotate(-0.5deg); }
						60% { transform: translateY(-5px) scale(1.01) rotate(0.3deg); }
						70% { transform: translateY(-2px) scale(1) rotate(2deg); }
						75% { transform: translateY(-2px) scale(1) rotate(-2deg); }
						80% { transform: translateY(-2px) scale(1) rotate(1deg); }
						85% { transform: translateY(-2px) scale(1) rotate(-1deg); }
						100% { transform: translateY(0) scale(1) rotate(0deg); }
					}
					.animate-calendar-bounce { animation: calendar-bounce 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55); transform-origin: center bottom; }
				`}</style>
			</DialogContent>
		</Dialog>
	);
};

export default LearningPurposeSurvey;


