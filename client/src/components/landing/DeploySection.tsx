import React from 'react';
import { Activity, TrendingUp, Layout, Maximize } from 'lucide-react';
import { AnimatedTransition } from '@/components/common/AnimatedTransition';

interface DeploySectionProps {
  show: boolean;
}

export const DeploySection = ({ show }: DeploySectionProps) => {
  const learningFeatures = [
    {
      icon: <Activity size={32} className="text-primary" />,
      title: "Offline Practice",
      description: "Train your spoken English entirely offline without needing an internet connection."
    },
    {
      icon: <TrendingUp size={32} className="text-primary" />,
      title: "Personalized Learning",
      description: "Receive exercises tailored to your level and progress for faster improvement."
    },
    {
      icon: <Layout size={32} className="text-primary" />,
      title: "AI Assistance",
      description: "Get real-time feedback on pronunciation, grammar, and sentence structure using a small local language model."
    },
    {
      icon: <Maximize size={32} className="text-primary" />,
      title: "Comprehensive Training",
      description: "Practice speaking, listening, reading, and writing in one complete offline solution."
    }
  ];

  return (
    <AnimatedTransition show={show} animation="slide-up" duration={600}>
      <div className="py-8 sm:py-12 md:py-16 lg:py-24">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-2 mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold">
            <span className="text-orange-500">Learn</span>
            <span className="text-foreground"> & </span>
            <span className="relative inline-block">
              <span className="text-[#529641]">Improve</span>
              <svg className="absolute -bottom-1 md:-bottom-2 left-0 w-full h-2 md:h-3 text-orange-400" viewBox="0 0 200 12" fill="none">
                <path d="M2 8C50 2 100 10 150 6C180 4 200 8 200 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </span>
          </h2>
          <p className="text-foreground max-w-3xl text-base sm:text-lg md:text-xl mt-2 px-4">
            Experience offline AI-powered English training designed to enhance your speaking and comprehension skills.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {learningFeatures.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                {React.cloneElement(feature.icon, { size: 24, className: "sm:w-7 sm:h-7 md:w-8 md:h-8" })}
              </div>
              <h3 className="font-bold mb-2 text-xs sm:text-sm md:text-base">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </AnimatedTransition>
  );
};
