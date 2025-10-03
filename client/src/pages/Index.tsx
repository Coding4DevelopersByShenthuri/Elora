import { useEffect } from 'react';
import { useAnimateIn } from '@/lib/animations';
import { HeroSection } from '@/components/landing/HeroSection';
import { ManageSection } from '@/components/landing/ManageSection';
import { DesignSection } from '@/components/landing/DesignSection';
import { DeploySection } from '@/components/landing/DeploySection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { CallToAction } from '@/components/landing/CallToAction';
import Footer from '@/components/landing/Footer';
import UseCasesSection from '@/components/landing/UseCasesSection';

const Index = () => {
  const showHero = useAnimateIn(false, 300);
  const showManage = useAnimateIn(false, 600);
  const showDesign = useAnimateIn(false, 900);
  const showDeploy = useAnimateIn(false, 1200);
  const showUseCases = useAnimateIn(false, 1500);
  const showTestimonials = useAnimateIn(false, 1800);
  const showCallToAction = useAnimateIn(false, 2100);
  
  useEffect(() => {
    // Ensure we start at top when page sections animate in
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
      <div className="absolute top-1/3 right-0 w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl -z-10"></div>
      <div className="absolute bottom-1/3 left-0 w-[250px] h-[250px] rounded-full bg-accent/5 blur-3xl -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
        <div className="flex flex-col">
          {/* Hero Section */}
          <HeroSection showTitle={showHero} />
          
          {/* Manage Section */}
          <ManageSection show={showManage} />
          
          {/* Design Section */}
          <DesignSection show={showDesign} />
          
          {/* Deploy Section */}
          <DeploySection show={showDeploy} />
          
          {/* Use Cases Section */}
          <UseCasesSection show={showUseCases} />
          
          {/* Testimonials Section */}
          <TestimonialsSection showTestimonials={showTestimonials} />
          
          {/* Call to Action */}
          <CallToAction show={showCallToAction} />

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Index;
