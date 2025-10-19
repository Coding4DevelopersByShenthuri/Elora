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
      <div className="py-16 md:py-24">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-2 mb-12">
          <h2 className="text-3xl font-bold md:text-6xl">
            <span className="text-orange-500">Learn</span>
            <span className="text-foreground"> & </span>
            <span className="relative inline-block">
              <span className="text-[#529641]">Improve</span>
              <svg className="absolute -bottom-1 md:-bottom-2 left-0 w-full h-2 md:h-3 text-orange-400" viewBox="0 0 200 12" fill="none">
                <path d="M2 8C50 2 100 10 150 6C180 4 200 8 200 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </span>
          </h2>
          <p className="text-foreground max-w-3xl text-xl md:text-xl mt-2">
            Experience offline AI-powered English training designed to enhance your speaking and comprehension skills.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {learningFeatures.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </AnimatedTransition>
  );
};
