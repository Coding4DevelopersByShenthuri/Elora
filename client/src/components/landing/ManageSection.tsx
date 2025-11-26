import { useState } from 'react';
import { AnimatedTransition } from '@/components/common/AnimatedTransition';
import CustomIllustration from './FeatureIllustrations/CustomIllustration';
import { FeatureIcon } from './FeatureIllustrations/FeatureIcon';

interface ManageSectionProps {
  show: boolean;
}

export const ManageSection = ({ show }: ManageSectionProps) => {
  const [activeFeature, setActiveFeature] = useState<number | null>(0);

  const features = [
    { title: "Online", description: "Practice anywhere—our AI coach runs fully on your device with internet, in Future planning to implement Offline-First." },
    { title: "Voice Recognition", description: "Speak naturally and get instant feedback on pronunciation and fluency." },
    { title: "AI Coaching", description: "Personalized guidance on grammar, vocabulary, and sentence structure." },
    { title: "Learning Levels", description: "Beginner, intermediate, and advanced modes tailored to your journey." },
    { title: "Intelligence", description: "AI-powered insights that extract what they mention from every pinned topic." },
    { title: "Interactive Dialogues", description: "Collect data from any source or device directly into your second brain." },
    { title: "Progress Tracking", description: "Clip any type of content with built-in extraction tools." },
    { title: "Search", description: "Find what you're looking for with intelligent, precision-focused search capabilities." },
    { title: "Contextual Learning", description: "Keep all your work secure in a private, controlled space." },
    { title: "Private & Secure", description: "All data stays on your device—no cloud, no sharing, full privacy." },
    { title: "Gamified Practice", description: "Earn points, unlock levels, and stay motivated with fun challenges." },
    { title: "D/L mode", description: "Toggle between dark and simplified interface with custom color modes for focus." },
    { title: "Multi-Mode Practice", description: "Switch between listening, speaking, reading, and writing exercises." },
    { title: "Offline Dictionary", description: "Look up meanings, synonyms, and usage examples instantly without internet access." },
    { title: "Roleplay Modes", description: "Practice interviews, travel talks, and casual chats." },
    { title: "Flashcards", description: "Review words quickly with smart AI flashcards." },
  ];

  const handleFeatureClick = (index: number) => {
    setActiveFeature(index === activeFeature ? null : index);
  };

  return (
    <AnimatedTransition show={show} animation="slide-up" duration={600}>
      <div className="py-8 sm:py-12 md:py-16 lg:py-24">
        <div className="flex flex-col items-center text-center gap-2 mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-[#529641]">Features</h2>
          <p className="text-foreground max-w-3xl text-base sm:text-lg md:text-xl mt-2 px-4">
            Your first and only personal AI English coach works Online.
          </p>
        </div>

        <CustomIllustration featureIndex={activeFeature ?? 0} className="transition-all duration-500" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mt-8 sm:mt-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex flex-col items-center text-center transition-all duration-300 ${
                activeFeature === index ? 'scale-105' : 'hover:scale-102'
              } cursor-pointer`}
              onClick={() => handleFeatureClick(index)}
            >
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-2 sm:mb-4 transition-all duration-300 ${
                  activeFeature === index ? 'bg-primary/20 ring-2 ring-primary/50' : 'bg-primary/10'
                }`}
              >
                <FeatureIcon index={index} size={24} />
              </div>
              <h3 className="font-bold mb-1 sm:mb-2 text-xs sm:text-sm md:text-base line-clamp-2">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </AnimatedTransition>
  );
};
