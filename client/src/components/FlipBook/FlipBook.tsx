import { useState } from 'react';
import { BookPage } from './BookPage';
import { FlippingPage } from './FlippingPage';
import { BackwardFlippingPage } from './BackwardFlippingPage';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BookPageData {
  id: number;
  content: React.ReactNode;
}

interface FlipBookProps {
  pages: BookPageData[];
}

export function FlipBook({ pages }: FlipBookProps) {
  const [currentSpread, setCurrentSpread] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'forward' | 'backward'>('forward');

  // Get the content for left and right pages based on current spread
  const getLeftPageContent = () => {
    const pageIndex = currentSpread * 2;
    return pageIndex < pages.length ? pages[pageIndex].content : null;
  };

  const getRightPageContent = () => {
    const pageIndex = currentSpread * 2 + 1;
    return pageIndex < pages.length ? pages[pageIndex].content : null;
  };

  const getNextRightPageContent = () => {
    const pageIndex = (currentSpread + 1) * 2 + 1;
    return pageIndex < pages.length ? pages[pageIndex].content : null;
  };

  const getNextLeftPageContent = () => {
    const pageIndex = (currentSpread + 1) * 2;
    return pageIndex < pages.length ? pages[pageIndex].content : null;
  };

  const getPrevLeftPageContent = () => {
    const pageIndex = (currentSpread - 1) * 2;
    return pageIndex >= 0 ? pages[pageIndex].content : null;
  };

  const getPrevRightPageContent = () => {
    const pageIndex = (currentSpread - 1) * 2 + 1;
    return pageIndex >= 0 && pageIndex < pages.length ? pages[pageIndex].content : null;
  };

  const handleNextPage = () => {
    if (isFlipping || (currentSpread + 1) * 2 >= pages.length) return;
    setFlipDirection('forward');
    setIsFlipping(true);
  };

  const handlePrevPage = () => {
    if (isFlipping || currentSpread <= 0) return;
    setFlipDirection('backward');
    setIsFlipping(true);
  };

  const handleForwardFlipComplete = () => {
    setCurrentSpread(prev => prev + 1);
    setIsFlipping(false);
  };

  const handleBackwardFlipComplete = () => {
    setCurrentSpread(prev => prev - 1);
    setIsFlipping(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 w-full h-full">
      {/* Book Container */}
      <div
        className="relative mb-2 sm:mb-3 md:mb-4 w-full max-w-full flex-shrink-0"
        style={{
          perspective: '1500px',
          perspectiveOrigin: 'center center'
        }}
      >
        <div 
          className="relative w-full max-w-[700px] mx-auto"
          style={{ 
            height: 'clamp(350px, 60vh, 550px)',
            minHeight: '350px',
            maxHeight: '550px',
            aspectRatio: '7/10'
          }}
        >
          {/* Book spine/binding */}
          <div className="absolute left-1/2 top-0 w-3 h-full bg-gradient-to-b from-teal-600 to-teal-800 dark:from-teal-500 dark:to-teal-700 rounded-sm shadow-lg z-20 transform -translate-x-1/2"></div>
          
          {/* Base book cover */}
          <div className="absolute w-full h-full bg-gradient-to-br from-teal-50 to-teal-100 dark:from-slate-800 dark:to-slate-900 border-2 border-teal-200 dark:border-teal-800 rounded-lg shadow-2xl"></div>
          
          {/* Previous left page (underneath, visible when current left page flips back) */}
          {flipDirection === 'backward' && getPrevLeftPageContent() && (
            <BookPage
              content={getPrevLeftPageContent()}
              isFlipping={false}
              isLeft={true}
              zIndex={1}
            />
          )}
          
          {/* Current left page (static when not flipping or when flipping forward) */}
          {(!isFlipping || flipDirection === 'forward') && getLeftPageContent() && (
            <BookPage
              content={getLeftPageContent()}
              isFlipping={false}
              isLeft={true}
              zIndex={5}
            />
          )}
          
          {/* Current right page (static when not flipping or when flipping backward) */}
          {(!isFlipping || flipDirection === 'backward') && getRightPageContent() && (
            <BookPage
              content={getRightPageContent()}
              isFlipping={false}
              isLeft={false}
              zIndex={5}
            />
          )}
          
          {/* Next right page (underneath, visible when current right page flips forward) */}
          {flipDirection === 'forward' && getNextRightPageContent() && (
            <BookPage
              content={getNextRightPageContent()}
              isFlipping={false}
              isLeft={false}
              zIndex={1}
            />
          )}
          
          {/* Forward flipping page animation */}
          {isFlipping && flipDirection === 'forward' && getRightPageContent() && (
            <FlippingPage
              frontContent={getRightPageContent()}
              backContent={getNextLeftPageContent()}
              isFlipping={true}
              onFlipComplete={handleForwardFlipComplete}
            />
          )}
          
          {/* Backward flipping page animation */}
          {isFlipping && flipDirection === 'backward' && getLeftPageContent() && (
            <BackwardFlippingPage
              frontContent={getLeftPageContent()}
              backContent={getPrevRightPageContent()}
              isFlipping={true}
              onFlipComplete={handleBackwardFlipComplete}
            />
          )}
        </div>
      </div>

      {/* Navigation Controls - Integrated into book bottom */}
      <div className="relative mt-2 sm:mt-3 md:mt-4 w-full max-w-[800px] flex-shrink-0">
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {/* Previous Button - Small, left side */}
          <Button
            onClick={handlePrevPage}
            disabled={currentSpread === 0 || isFlipping}
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full border border-teal-300 dark:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 text-teal-700 dark:text-teal-300 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-sm disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          {/* Page Counter - Small, center */}
          <div className="text-center px-2 sm:px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full border border-teal-200 dark:border-teal-800 shadow-sm">
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              {currentSpread * 2 + 1}-{Math.min(currentSpread * 2 + 2, pages.length)} / {pages.length}
            </span>
          </div>
          
          {/* Next Button - Small, right side */}
          <Button
            onClick={handleNextPage}
            disabled={(currentSpread + 1) * 2 >= pages.length || isFlipping}
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full border border-teal-300 dark:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 text-teal-700 dark:text-teal-300 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-sm disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

