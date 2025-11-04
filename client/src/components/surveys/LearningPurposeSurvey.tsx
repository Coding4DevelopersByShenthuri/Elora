import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import type { SurveyData } from '@/components/surveys/UserSurvey';
import SurveyProgress from '@/components/surveys/SurveyProgress';

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
	'Exam preparation (IELTS / PTE)',
	'Moving or traveling abroad',
	'For educational purposes',
	'Communicating with partners',
    'Brain training and practice',
	'Other'
];

const LearningPurposeSurvey: React.FC<LearningPurposeSurveyProps> = ({ isOpen, onComplete, onBack, currentStep = 1, totalSteps = 3 }) => {
	const { updateUserSurveyData } = useAuth();
	const [selectedPurposes, setSelectedPurposes] = React.useState<string[]>([]);
	const [shouldBounce, setShouldBounce] = React.useState(false);

	React.useEffect(() => {
		if (isOpen) {
			setShouldBounce(true);
			const t = setTimeout(() => setShouldBounce(false), 900);
			return () => clearTimeout(t);
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
		// Save step 4 (learningPurpose) response to MySQL
		updateUserSurveyData(surveyData as any, 'learningPurpose', 4);
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
								<img src="/logo01.png" alt="Elora Logo" className="w-20 h-20 object-contain ml-2" />
                                {/* Book visual with subtle wobble animation */}
                                <div className="absolute left-1/2 transform -translate-x-1/2">
                                    <div className={`relative w-32 h-32 ${shouldBounce ? 'book-bounce-once' : ''}`}>
                                        <img src="/Book.png" alt="Book" className="w-full h-full object-contain book-idle" />
                                    </div>
                                </div>
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
                                <div className={`relative w-72 h-72 lg:w-96 lg:h-96 mx-auto ${shouldBounce ? 'book-bounce-once' : ''}`}>
                                    <img src="/Book.png" alt="Book" className="w-full h-full object-contain book-idle" />
                                </div>
							</div>
							<div className="absolute bottom-6 left-6">
								<img src="/logo01.png" alt="Elora Logo" className="w-32 h-32 object-contain" />
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

                {/* Subtle wobble animation ideal for a closed book */}
                <style>{`
                    /* Stronger one-time bounce on open (wrapper-level so wobble can run on image) */
                    @keyframes book-bounce-once {
                        0% { transform: translateY(16px) scale(0.98) rotateZ(0deg); }
                        20% { transform: translateY(-24px) scale(1.07) rotateZ(-2deg); }
                        45% { transform: translateY(8px) scale(0.99) rotateZ(1.2deg); }
                        65% { transform: translateY(-12px) scale(1.03) rotateZ(-0.8deg); }
                        82% { transform: translateY(4px) scale(1.005) rotateZ(0.4deg); }
                        100% { transform: translateY(0) scale(1) rotateZ(0deg); }
                    }
                    .book-bounce-once {
                        animation: book-bounce-once 1.2s cubic-bezier(.2,.8,.2,1.2) 1;
                        transform-origin: 50% 90%;
                        will-change: transform;
                    }

                    @keyframes book-wobble {
                        0% { transform: translateY(0) rotateZ(0deg) rotateY(0deg); }
                        20% { transform: translateY(-2px) rotateZ(-1.2deg) rotateY(-0.6deg); }
                        40% { transform: translateY(0) rotateZ(0.8deg) rotateY(0.4deg); }
                        60% { transform: translateY(1px) rotateZ(-0.8deg) rotateY(-0.3deg); }
                        80% { transform: translateY(0) rotateZ(0.6deg) rotateY(0.2deg); }
                        100% { transform: translateY(0) rotateZ(0deg) rotateY(0deg); }
                    }
                    .book-idle {
                        animation: book-wobble 3.2s ease-in-out infinite;
                        transform-origin: 50% 85%;
                        will-change: transform;
                    }
                `}</style>
			</DialogContent>
		</Dialog>
	);
};

export default LearningPurposeSurvey;


