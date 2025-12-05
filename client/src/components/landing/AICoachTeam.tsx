import { useState } from 'react';

interface Character {
  id: string;
  name: string;
  image: string;
  position: 'front-left' | 'back-left' | 'center' | 'back-right' | 'front-right';
  isRobot: boolean;
}

const AICoachTeam = () => {
  const [hoveredCharacter, setHoveredCharacter] = useState<string | null>(null);

  const characters: Character[] = [
    {
      id: 'robot',
      name: 'Elora',
      image: '/Robo.png',
      position: 'center',
      isRobot: true,
    },
    {
      id: 'man1',
      name: 'Alex',
      image: '/man01.png',
      position: 'front-left',
      isRobot: false,
    },
    {
      id: 'woman1',
      name: 'Sarah',
      image: '/girl01.png',
      position: 'back-left',
      isRobot: false,
    },
    {
      id: 'man2',
      name: 'Marcus',
      image: '/man02.png',
      position: 'back-right',
      isRobot: false,
    },
    {
      id: 'woman2',
      name: 'Zara',
      image: '/girl02.png',
      position: 'front-right',
      isRobot: false,
    },
  ];

  const handleMouseEnter = (characterId: string) => {
    setHoveredCharacter(characterId);
  };

  const handleMouseLeave = () => {
    setHoveredCharacter(null);
  };

  const getCharacterStyle = (character: Character) => {
    const isHovered = hoveredCharacter === character.id;
    
    // When robot is hovered: everything (including robot) becomes grayscale
    // When other character is hovered: that character zooms, others (including robot) become grayscale
    const shouldBeGrayscale = hoveredCharacter === 'robot' 
      ? true // Robot hover: everything becomes grayscale
      : hoveredCharacter !== null && hoveredCharacter !== character.id; // Other character hover: others become grayscale

    const baseStyle: React.CSSProperties = {
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      filter: shouldBeGrayscale ? 'grayscale(100%)' : 'none',
      transform: isHovered && !character.isRobot ? 'scale(1.15) translateZ(0)' : 'scale(1) translateZ(0)',
      zIndex: isHovered ? 30 : character.isRobot ? 20 : character.position.includes('front') ? 10 : 5,
    };

    return baseStyle;
  };

  const getPositionClasses = (position: string) => {
    switch (position) {
      case 'front-left':
        // Positioned to overlap robot on left side, aligned with robot's vertical level
        // Mobile: match desktop proportions (55% from left on desktop, so ~55% on mobile too)
        return 'absolute top-[58%] left-[50%] sm:top-[58%] sm:left-[55%] md:top-[58%] md:left-[21%] lg:top-[58%] lg:left-[55%] -translate-y-1/2';
      case 'back-left':
        // Positioned at top, behind robot and front-left
        // Mobile: match desktop proportions (35% from left on desktop)
        return 'absolute top-[6%] left-[42%] sm:top-[6%] sm:left-[35%] md:top-[4%] md:left-[7%] lg:top-[6%] lg:left-[35%]';
      case 'center':
        // Centered, positioned to allow front characters to overlap
        return 'absolute top-[58%] left-1/2 -translate-x-1/2 -translate-y-1/2';
      case 'back-right':
        // Positioned at top, behind robot and front-right
        // Mobile: match desktop proportions (35% from right on desktop)
        return 'absolute top-[6%] right-[48%] sm:top-[6%] sm:right-[35%] md:top-[4%] md:right-[7%] lg:top-[6%] lg:right-[35%]';
      case 'front-right':
        // Positioned to overlap robot on right side, aligned with robot's vertical level
        // Mobile: match desktop proportions (55% from right on desktop)
        return 'absolute top-[58%] right-[50%] sm:top-[58%] sm:right-[55%] md:top-[58%] md:right-[16%] lg:top-[58%] lg:right-[55%] -translate-y-1/2';
      default:
        return '';
    }
  };

  const getBadgePosition = (position: string, isHovered: boolean) => {
    if (!isHovered) return { display: 'none' };
    
    switch (position) {
      case 'front-left':
        return { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' };
      case 'back-left':
        return { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px' };
      case 'back-right':
        return { top: '100%', right: '50%', transform: 'translateX(50%)', marginTop: '8px' };
      case 'front-right':
        return { bottom: '100%', right: '50%', transform: 'translateX(50%)', marginBottom: '8px' };
      default:
        return { display: 'none' };
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-orange-400/10 via-orange-300/10 to-orange-200/10 rounded-xl sm:rounded-2xl md:rounded-3xl p-2 sm:p-3 md:p-4 backdrop-blur-sm shadow-xl overflow-visible">
      <div className="bg-gradient-to-br from-white/30 via-white/25 to-white/20 backdrop-blur-md rounded-lg sm:rounded-xl md:rounded-2xl p-1.5 sm:p-2 md:p-3 shadow-2xl border border-orange-300/20 overflow-visible">

        {/* Team Display - Adjusted height and positioning to match image */}
        <div className="relative w-full h-[400px] sm:h-[340px] md:h-[460px] lg:h-[540px] overflow-visible">
          {characters.map((character) => {
            const isHovered = hoveredCharacter === character.id;
            const badgeStyle = getBadgePosition(character.position, isHovered && !character.isRobot);
            
            return (
              <div
                key={character.id}
                className={`${getPositionClasses(character.position)} cursor-pointer`}
                onMouseEnter={() => handleMouseEnter(character.id)}
                onMouseLeave={handleMouseLeave}
                style={getCharacterStyle(character)}
              >
                <div className="relative">
                  <img
                    src={character.image}
                    alt={character.name}
                    className={`transition-all duration-400 w-48 h-48 sm:w-48 sm:h-48 md:w-80 md:h-80 lg:w-96 lg:h-96 ${
                      character.id === 'man1' ? 'object-cover object-top' : 'object-contain'
                    }`}
                    draggable={false}
                  />
                  
                  {/* Badge for non-robot characters */}
                  {!character.isRobot && (
                    <div
                      className="absolute whitespace-nowrap bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-2 py-1 sm:px-2.5 sm:py-1 md:px-3 md:py-1.5 rounded-md sm:rounded-lg shadow-lg text-[8px] sm:text-[10px] md:text-sm font-semibold z-30 transition-all duration-300"
                      style={{
                        ...badgeStyle,
                        opacity: isHovered ? 1 : 0,
                        pointerEvents: isHovered ? 'auto' : 'none',
                      }}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] sm:text-[9px] md:text-xs opacity-90">AI Tutor</span>
                        <span className="font-bold text-[9px] sm:text-[10px] md:text-sm">{character.name}</span>
                      </div>
                      {/* Arrow pointing to character */}
                      <div 
                        className={`absolute w-0 h-0 border-l-2 border-r-2 border-t-2 md:border-l-4 md:border-r-4 md:border-t-4 border-transparent border-t-teal-500 ${
                          character.position.includes('back') ? '-top-0.5 sm:-top-1 left-1/2 -translate-x-1/2' : '-bottom-0.5 sm:-bottom-1 left-1/2 -translate-x-1/2 rotate-180'
                        }`}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 md:-top-4 md:-right-4 w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-orange-400 rounded-full flex items-center justify-center animate-bounce shadow-lg">
        <svg className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      </div>
      <div className="absolute -bottom-2 -left-2 sm:-bottom-3 sm:-left-3 md:-bottom-4 md:-left-4 w-3.5 h-3.5 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
        <svg className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
    </div>
  );
};

export default AICoachTeam;

