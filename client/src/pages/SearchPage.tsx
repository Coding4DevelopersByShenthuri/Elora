
import React from 'react';
import Search from '@/components/search';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { useAnimateIn } from '@/lib/animations';
import Footer from '@/components/landing/Footer';

const SearchPage = () => {
  const showContent = useAnimateIn(false, 300);
  
  return (
    <div className="max-w-full mx-auto px-4 pt-24 pb-6">
      <AnimatedTransition show={showContent} animation="slide-up">
        <Search />
      </AnimatedTransition>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SearchPage;
