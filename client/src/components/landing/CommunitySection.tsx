import { AnimatedTransition } from '@/components/common/AnimatedTransition';

interface CommunitySectionProps {
  show: boolean;
}

export const CommunitySection = ({
  show
}: CommunitySectionProps) => {
  return <AnimatedTransition show={show} animation="slide-up" duration={600}>
      <div className="mt-24 mb-16">
        
        
        
        
        
      </div>
    </AnimatedTransition>;
};