import { useState } from 'react';
import { AnimatedTransition } from '@/components/common/AnimatedTransition';
import { cn } from '@/lib/utils';
import type { UserType } from './UseCasesTypes';
import { userCasesData, booksData } from './UserCasesData';

// Import individual case components
import KidsCase from './UserCases/KidsCase';
import BeginnersCase from './UserCases/BeginnersCase';
import IntermediateCase from './UserCases/IntermediateCase';
import AdvanceCase from './UserCases/AdvanceCase';
import IeltscandidatesCase from './UserCases/IeltscandidatesCase';
import EveryoneCase from './UserCases/EveryoneCase';

interface UseCasesSectionProps {
  show: boolean;
}

const UseCasesSection = ({ show }: UseCasesSectionProps) => {
  const [activeUserType, setActiveUserType] = useState<UserType>('Kids');
  const currentCase = userCasesData[activeUserType];

  return (
    <AnimatedTransition show={show} animation="slide-up" duration={600}>
      <div className="py-12 md:py-24 lg:py-32 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto mb-12 md:mb-16">
          {/* Updated Title - Responsive */}
          <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl text-center mb-8 md:mb-12 tracking-tight text-teal-600 font-bold leading-tight">
            Interactive Spoken English Training for Everyone
          </h2>
          
          {/* User Type Tabs - Responsive */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 mb-8 md:mb-10 px-2">
            {Object.keys(userCasesData).map((type) => (
              <button
                key={type}
                className={cn(
                  "relative pb-1 px-2 sm:px-3 text-sm sm:text-base md:text-lg",
                  "transition-all duration-300 transform hover:scale-105",
                  activeUserType === type
                    ? "text-primary font-semibold scale-110"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setActiveUserType(type as UserType)}
              >
                {type}
                {activeUserType === type && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
          
          {/* Case Display - Responsive */}
          <div
            className={cn(
              "rounded-xl overflow-hidden transition-all duration-500",
              "mx-2 sm:mx-4 md:mx-0",
              currentCase.background
            )}
          >
            <div className="p-6 sm:p-8 md:p-12 lg:p-16 bg-teal-700/30">
              <div className="text-center mb-6 md:mb-8">
                <p className="uppercase tracking-wide text-xs sm:text-sm font-medium mb-4 md:mb-6 text-white/90">
                  Made for {activeUserType}
                </p>
                <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium mb-3 md:mb-4 text-white leading-tight">
                  {currentCase.title} 
                  <span className="block italic font-light text-lg sm:text-xl md:text-2xl lg:text-3xl mt-2 md:mt-3">
                    {currentCase.subtitle}
                  </span>
                </h3>
              </div>
              
              {/* Render the appropriate component based on activeUserType */}
              <div className="max-w-4xl mx-auto">
                {activeUserType === 'Kids' && <KidsCase data={currentCase} />}
                {activeUserType === 'Beginners' && <BeginnersCase data={currentCase} />}
                {activeUserType === 'Intermediates' && <IntermediateCase data={currentCase} />}
                {activeUserType === 'Advanced' && <AdvanceCase data={currentCase} />}
                {activeUserType === 'IELTS' && <IeltscandidatesCase data={currentCase} />}
                {activeUserType === 'Everyone' && <EveryoneCase data={currentCase} books={booksData} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedTransition>
  );
};

export default UseCasesSection;