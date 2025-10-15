import React from 'react';

interface SurveyProgressProps {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  variant?: 'mobile' | 'desktop';
}

const SurveyProgress: React.FC<SurveyProgressProps> = ({
  currentStep,
  totalSteps,
  onBack,
  variant = 'desktop'
}) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  if (variant === 'mobile') {
    return (
      <div className="w-full px-4 mb-6">
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
        
        {/* Back button for mobile */}
        {onBack && currentStep > 1 && (
          <button
            onClick={onBack}
            className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:text-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}
      </div>
    );
  }

  // Desktop variant
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between gap-4">
        {/* Back button */}
        <button
          onClick={onBack}
          className={`text-blue-600 font-medium flex items-center gap-2 hover:text-blue-700 transition-colors ${
            onBack && currentStep > 1 ? '' : 'invisible'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Progress bar */}
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Step indicator */}
        <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
    </div>
  );
};

export default SurveyProgress;

