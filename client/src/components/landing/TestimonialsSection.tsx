import { AnimatedTransition } from '@/components/common/AnimatedTransition';
import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface TestimonialsSectionProps {
  showTestimonials: boolean;
}

export const TestimonialsSection = ({ showTestimonials }: TestimonialsSectionProps) => {
  // Updated testimonials content for your Spoken English Training App
  const testimonials = [
    {
      quote: "This app helped me improve my English pronunciation drastically!",
      name: "Maran S.",
      role: "Student",
      rating: 5,
    },
    {
      quote: "I can practice speaking English anywhere without needing the internet.",
      name: "Anika P.",
      role: "Freelancer",
      rating: 4,
    },
    {
      quote: "The AI feedback is accurate and helps me correct my mistakes in real-time.",
      name: "Ravi K.",
      role: "Teacher",
      rating: 3.5,
    },
    {
      quote: "I feel more confident speaking English in meetings and presentations now.",
      name: "Samantha L.",
      role: "Software Developer",
      rating: 4.5,
    },
    {
      quote: "The app's exercises are interactive and easy to follow.",
      name: "Daniel T.",
      role: "University Student",
      rating: 3,
    },
    {
      quote: "I love that I can train my English speaking skills offline anytime.",
      name: "Priya M.",
      role: "Entrepreneur",
      rating: 5,
    },
  ];

  // Component to render star ratings
  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1 mb-2">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
        />
      ))}
    </div>
  );

  return (
    <AnimatedTransition show={showTestimonials} animation="slide-up" duration={600}>
      <div className="py-16 md:py-24">
        {/* Section heading */}
        <div className="flex flex-col items-center gap-2 mb-12 text-center">
          <h2 className="text-4xl font-bold text-teal-600 md:text-8xl">
            What users say<br />
            about Elora
          </h2>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="bg-card border border-border/50 p-6 rounded-lg shadow-sm h-full"
            >
              <StarRating rating={testimonial.rating} />
              <p className="text-lg font-medium mb-4">{testimonial.quote}</p>
              <div className="mt-4">
                <p className="font-bold">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AnimatedTransition>
  );
};
