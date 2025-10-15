import { AnimatedTransition } from '@/components/common/AnimatedTransition';

interface FAQSectionProps {
  showFAQs?: boolean;
}

export const FAQSection = ({
  showFAQs = true
}: FAQSectionProps) => {
  return <AnimatedTransition show={showFAQs} animation="slide-up" duration={600}>
      
    </AnimatedTransition>;
};