import { useEffect, useRef } from 'react';

interface FlippingPageProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  isFlipping: boolean;
  onFlipComplete: () => void;
}

export function FlippingPage({ frontContent, backContent, isFlipping, onFlipComplete }: FlippingPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFlipping && containerRef.current) {
      containerRef.current.style.transform = 'rotateY(-180deg)';
      
      const timer = setTimeout(() => {
        onFlipComplete();
      }, 1200);

      return () => clearTimeout(timer);
    } else if (containerRef.current) {
      containerRef.current.style.transform = 'rotateY(0deg)';
    }
  }, [isFlipping, onFlipComplete]);

  return (
    <div
      ref={containerRef}
      className="absolute right-0 w-1/2 h-full transition-transform duration-[1200ms] ease-in-out"
      style={{
        transformStyle: 'preserve-3d',
        transformOrigin: 'left center',
        zIndex: 10
      }}
    >
      {/* Front of flipping page (current right page) */}
      <div
        className="absolute w-full h-full bg-white dark:bg-slate-900 border-2 border-teal-200 dark:border-teal-800 rounded-r-lg shadow-lg p-6"
        style={{
          backfaceVisibility: 'hidden',
          transform: 'rotateY(0deg)'
        }}
      >
        <div className="h-full overflow-hidden">
          {frontContent}
        </div>
      </div>
      
      {/* Back of flipping page (becomes new left page) */}
      <div
        className="absolute w-full h-full bg-white dark:bg-slate-900 border-2 border-teal-200 dark:border-teal-800 rounded-l-lg shadow-lg p-6"
        style={{
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)'
        }}
      >
        <div className="h-full overflow-hidden">
          {backContent}
        </div>
      </div>
    </div>
  );
}

