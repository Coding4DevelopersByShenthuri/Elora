import { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Lightbulb,
  Smile,
  Mic,
  BarChart,
  Star,
  CheckCircle,
  Award,
  PenTool,
  BookOpen,
  Shield,
  Clock,
  Cpu,
  Database,
  Sliders,
  Sparkles,
  Zap,
  Target,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { WaitlistModal } from '@/components/waitlist/WaitlistModal';

const FeatureCard = ({
  icon,
  title,
  description,
  color = 'primary'
}: {
  icon: React.ReactNode,
  title: string,
  description: string,
  color?: string
}) => {
  return (
    <div className="flex flex-col items-start p-6 glass-panel rounded-lg h-full">
      <div className={`w-12 h-12 flex items-center justify-center rounded-full bg-${color}/10 mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-primary">{title}</h3>
      <p className="text-foreground/80">{description}</p>
    </div>
  );
};


const FeatureShowcase = ({
  title,
  description,
  image,
  features,
  reversed = false
}: {
  title: string,
  description: string,
  image: string,
  features: { icon: React.ReactNode, text: string }[],
  reversed?: boolean
}) => {
  return (
    <div className={`flex flex-col ${reversed ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 my-16`}>
      <div className="w-full md:w-1/2">
        <div className="glass-panel rounded-lg overflow-hidden h-full">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
      </div>
      <div className="w-full md:w-1/2 flex flex-col justify-center">
        <h3 className="text-2xl font-bold mb-3 text-primary">{title}</h3>
        <p className="text-foreground/80 mb-6">{description}</p>
        <div className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 mt-1 flex-shrink-0 text-primary">
                {feature.icon}
              </div>
              <p className="text-foreground/80">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ValueProp = ({
  icon,
  title,
  description
}: {
  icon: React.ReactNode,
  title: string,
  description: string
}) => {
  return (
    <div className="flex flex-col items-center text-center p-6">
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-foreground/80">{description}</p>
    </div>
  );
};

const HowPage = () => {
  const [, setLoading] = useState(true);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollPosition = window.scrollY;
        const parallaxFactor = 0.4;
        heroRef.current.style.transform = `translateY(${scrollPosition * parallaxFactor}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
      <div className="absolute top-1/3 right-0 w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl -z-10"></div>
      <div className="absolute bottom-1/3 left-0 w-[250px] h-[250px] rounded-full bg-accent/5 blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-24">
        {/* Hero Section - Model Image Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left Side - Student Image */}
          <div className="relative">
            <div className="relative">
              {/* Student Image */}
              <div className="w-80 h-80 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden flex items-center justify-center">
                <img 
                  src="/How.png" 
                  alt="How Elora Works" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Background shapes */}
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-primary/10 rounded-2xl rotate-12"></div>
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-secondary/10 rounded-2xl -rotate-12"></div>
              
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-6 h-6 bg-orange-400 rounded-full animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-4 h-4 bg-orange-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>How It Works</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              How <span className="text-primary">Elora</span> Works
            </h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              There's powerful AI and advanced speech technology behind our English Trainer, 
              but we've made it simple and intuitive to use for learners of all ages.
            </p>

            {/* Decorative elements */}
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Workflow Section - Model Image Style */}
        <div className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Left Side - Title */}
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                How the App <span className="relative">
                  <span className="text-primary">Works</span>
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-orange-400" viewBox="0 0 200 12" fill="none">
                    <path d="M2 8C50 2 100 10 150 6C180 4 200 8 200 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </span>
              </h2>
            </div>

            {/* Right Side - Description */}
            <div className="relative">
              <div className="absolute -top-4 -right-4 w-6 h-6 text-primary">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Simple steps to start your English learning journey with AI-powered guidance. 
                Our platform makes it easy for learners to improve their language skills effectively.
              </p>
              {/* Decorative arrow */}
              <div className="absolute -bottom-8 -left-8 w-16 h-16 text-primary opacity-60">
                <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                  <path d="M20 20C40 10 60 30 80 20C85 18 90 22 90 25C90 30 85 35 80 30C70 25 50 15 30 25C25 27 20 25 20 20Z" stroke="currentColor" strokeWidth="2" fill="currentColor"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Four Step Cards - Model Image Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                number: 1,
                title: "Choose Your Module",
                description: "Select the category that fits your learning needs: Kids, Adults, or IELTS/PTE exam practice.",
                icon: <Target className="w-8 h-8" />,
                color: "from-primary to-primary/80"
              },
              {
                number: 2,
                title: "Learn & Practice",
                description: "Engage in interactive lessons offline with AI-powered conversation simulations and pronunciation feedback.",
                icon: <BookOpen className="w-8 h-8" />,
                color: "from-primary to-primary/80"
              },
              {
                number: 3,
                title: "Track Progress",
                description: "Monitor your improvements with offline progress tracking, achievement badges, and scores.",
                icon: <BarChart className="w-8 h-8" />,
                color: "from-primary to-primary/80"
              },
              {
                number: 4,
                title: "Master English",
                description: "Apply your skills in real conversations. Our AI provides personalized feedback to enhance fluency.",
                icon: <Award className="w-8 h-8" />,
                color: "from-primary to-primary/80"
              }
            ].map((step, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/90 backdrop-blur-sm relative">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform duration-300`}>
                      {step.icon}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="w-8 h-8 mb-4 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-teal-800">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>


        {/* Feature Showcases */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-center mb-12">Designed for Smarter English Learning</h2>

          <FeatureShowcase
          //@ts-ignore
          title={
            <span className="text-teal-600">
              Interactive Learning Modules
            </span>
          }
            description="Elora offers category-based modules for Kids, Adults, and IELTS/PTE learners, tailored to your skill level and learning goals."
            image="./image6.png"
            features={[
              { icon: <CheckCircle size={24} />, text: "Kids: Vocabulary games, story listening, pronunciation practice" },
              { icon: <CheckCircle size={24} />, text: "Adults: Structured lessons, daily conversation tasks, quizzes" },
              { icon: <CheckCircle size={24} />, text: "IELTS/PTE: Speaking mock tests, cue card practice, timed tasks" },
              { icon: <CheckCircle size={24} />, text: "Offline AI-powered practice for personalized feedback" },
            ]}
          />

          <FeatureShowcase
          //@ts-ignore
            title={
              <span className="text-teal-600">
                Real-Time Pronunciation & Conversation.
              </span>
            }
            description="Practice speaking and get instant feedback with our offline Small Language Model, improving your fluency and confidence."
            image="./image5.png"
            features={[
              { icon: <CheckCircle size={24} />, text: "Speech-to-text with pronunciation scoring" },
              { icon: <CheckCircle size={24} />, text: "AI conversation simulator for offline practice" },
              { icon: <CheckCircle size={24} />, text: "Grammar and vocabulary exercises integrated into lessons" },
              { icon: <CheckCircle size={24} />, text: "Gamified learning with badges, streaks, and progress tracking" },
            ]}
            reversed={true}
          />


          <FeatureShowcase
          //@ts-ignore
            title={
              <span className="text-teal-600">
                Access Lessons & Feedback Instantly.
              </span>
            }
            description="Quickly find the lessons, exercises, and practice sessions you need. Elora helps you navigate your learning path efficiently and stay on track."
            image="./image7.png"
            features={[
              { icon: <CheckCircle size={24} />, text: "Instant access to Kids, Adults, and IELTS/PTE modules" },
              { icon: <CheckCircle size={24} />, text: "Search lessons, exercises, and conversation practice offline" },
              { icon: <CheckCircle size={24} />, text: "Quickly revisit saved progress, scores, and achievements" },
              { icon: <CheckCircle size={24} />, text: "AI-powered suggestions to guide your next practice session" },
            ]}
            reversed={true}
          />

          <FeatureShowcase
          //@ts-ignore
            title={
              <span className="text-teal-600">
                AI-Powered Learning Insights.
              </span>
            }
            description="Elora's AI helps you discover patterns in your learning, providing personalized guidance and suggestions to improve your English skills efficiently."
            image="./image8.png"
            features={[
              { icon: <CheckCircle size={24} />, text: "AI analyzes your progress to suggest next lessons and exercises" },
              { icon: <CheckCircle size={24} />, text: "Highlights strengths and areas for improvement in speaking and grammar" },
              { icon: <CheckCircle size={24} />, text: "Weekly insights show your learning streaks and achievements" },
              { icon: <CheckCircle size={24} />, text: "Adaptive AI feedback improves pronunciation, vocabulary, and conversation skills" },
            ]}
          />


          <FeatureShowcase
          //@ts-ignore
            title={
              <span className="text-teal-600">
                Your Private Learning Hub.
              </span>
            }
            description="Elora keeps your learning progress and data completely private. All exercises, lessons, and feedback are stored locally, giving you full control and offline access."
            image="./image9.png"
            features={[
              { icon: <CheckCircle size={24} />, text: "All learning data stored locally on your device" },
              { icon: <CheckCircle size={24} />, text: "Offline AI features – pronunciation scoring, conversation simulator, and lessons" },
              { icon: <CheckCircle size={24} />, text: "No internet required for practicing or tracking progress" },
              { icon: <CheckCircle size={24} />, text: "Secure and private environment for all learners" },
            ]}
            reversed={true}
          />

          <FeatureShowcase
          //@ts-ignore
            title={
              <span className="text-teal-600">
                Your Personal English Coach.
              </span>
            }
            description="Elora acts as an extension of your learning journey, guiding you through interactive lessons, practice exercises, and real-time feedback across all your devices."
            image="./image10.png"
            features={[
              { icon: <CheckCircle size={24} />, text: "Works offline on all your devices: Android, iOS, Windows, and macOS" },
              { icon: <CheckCircle size={24} />, text: "Interactive speech-to-text and conversation practice with AI feedback" },
              { icon: <CheckCircle size={24} />, text: "Category-based modules for Kids, Adults, and IELTS/PTE learners" },
              { icon: <CheckCircle size={24} />, text: "Track your progress with gamified achievements, scores, and streaks" },
            ]}
          />
        </div>



        {/* Who is it for section */}
        <div className="mb-20 glass-panel p-10 rounded-lg">
          <h2 className="text-3xl font-bold text-center mb-12">
            Designed for learners of all ages and levels
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Smile className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-bold text-lg">Kids</h3>
              <p className="text-foreground/70 mt-2">Interactive lessons to make learning fun and engaging.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-bold text-lg">Beginners</h3>
              <p className="text-foreground/70 mt-2">Step-by-step modules to build a strong foundation in English.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mic className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-bold text-lg">Intermediate</h3>
              <p className="text-foreground/70 mt-2">Practice real conversations and improve fluency with AI feedback.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Award className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-bold text-lg">Advanced & Exam Prep</h3>
              <p className="text-foreground/70 mt-2">IELTS/PTE exam simulations and performance tracking for success.</p>
            </div>
          </div>
        </div>
      </div>

      <WaitlistModal isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} />
    </div>
  );
};

export default HowPage;