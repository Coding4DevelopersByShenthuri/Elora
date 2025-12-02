import { Button } from '@/components/ui/button';
import { AnimatedTransition } from '@/components/common/AnimatedTransition';
import { Link } from 'react-router-dom';

interface CallToActionProps {
  show: boolean;
}

export const CallToAction = ({ show }: CallToActionProps) => {
  return (
    <>
      <AnimatedTransition show={show} animation="slide-up" duration={600}>
        <div className="py-16 md:py-24 mb-24 md:mb-32 text-primary-foreground rounded-2xl text-center bg-teal-600">
          <h2 className="text-4xl font-bold mb-4 md:text-7xl">
            Improve Your English Today!
          </h2>
          <p className="text-xl mb-10">
            Learn spoken English offline with our AI-powered trainer—anytime, anywhere.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 py-6 text-base font-medium bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10 transition-all duration-300"
              asChild
            >
              <Link to="/pricing">
                Start Now
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 py-6 text-base font-medium bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10 transition-all duration-300"
              asChild
            >
              <Link to="/how">
                See How It Works
              </Link>
            </Button>
          </div>
        </div>
      </AnimatedTransition>
    </>
  );
};