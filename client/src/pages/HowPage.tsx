import { useState, useEffect, useRef } from 'react';
import { useAnimateIn } from '@/lib/animations';
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
  Plug,
  Sliders
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

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

const WorkflowStep = ({
  number,
  title,
  description,
  color = "primary"
}: {
  number: number,
  title: string,
  description: string,
  color?: string
}) => {
  return (
    <div className="relative">
      <div className={`absolute top-0 left-0 w-10 h-10 rounded-full bg-${color} dark:text-black text-white flex items-center justify-center font-bold text-lg z-10`}>
        {number}
      </div>
      <div className="pl-16">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-foreground/80">{description}</p>
      </div>
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
  const [loading, setLoading] = useState(true);
  const showContent = useAnimateIn(false, 300);
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
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center mb-24">
          <div ref={heroRef} className="relative w-full max-w-3xl mx-auto">
            <div className="absolute -z-10 w-[300px] h-[300px] rounded-full bg-gradient-to-r from-primary/30 to-accent/30 blur-3xl left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="glass-panel rounded-full py-5 px-8 inline-block mx-auto mb-12">
              <h1 className="text-2xl md:text-3xl font-bold text-primary">How does Speak Bee work?</h1>
            </div>

            <p className="text-xl text-center text-foreground/80 max-w-2xl mx-auto mb-12">
              There's powerful AI and advanced speech technology behind our English Trainer, but we've made it simple and intuitive to use for learners of all ages.
            </p>

            <div className="flex justify-center">
              <Button size="lg" className="rounded-full" asChild>
                <Link to="/">
                  Start exploring
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Workflow Section */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-center mb-12">How the App Works</h2>

          <div className="relative">
            <div className="absolute left-5 top-6 w-0.5 h-[calc(100%-60px)] bg-gradient-to-b from-primary via-accent to-primary/30"></div>

            <div className="space-y-16 pl-4">
              <WorkflowStep
                number={1}
                title="Choose Your Module"
                description="Select the category that fits your learning needs: Kids, Adults (Beginner → Advanced), or IELTS/PTE exam practice."
              />
              <WorkflowStep
                number={2}
                title="Learn & Practice"
                description="Engage in interactive lessons offline with AI-powered conversation simulations, pronunciation feedback, and grammar/vocabulary exercises."
              />
              <WorkflowStep
                number={3}
                title="Track Progress"
                description="Monitor your improvements with offline progress tracking, achievement badges, scores, and streaks to stay motivated."
              />
              <WorkflowStep
                number={4}
                title="Master English"
                description="Apply your skills in real conversations and exam-like scenarios. Our offline Small Language Model provides personalized feedback to enhance fluency, pronunciation, and confidence."
              />
            </div>
          </div>
        </div>


        {/* Feature Showcases */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-center mb-12">Designed for Smarter English Learning</h2>

          <FeatureShowcase
          title={
            <span className="text-teal-600">
              Interactive Learning Modules
            </span>
          }
            description="Speak Bee offers category-based modules for Kids, Adults, and IELTS/PTE learners, tailored to your skill level and learning goals."
            image="./image6.png"
            features={[
              { icon: <CheckCircle size={24} />, text: "Kids: Vocabulary games, story listening, pronunciation practice" },
              { icon: <CheckCircle size={24} />, text: "Adults: Structured lessons, daily conversation tasks, quizzes" },
              { icon: <CheckCircle size={24} />, text: "IELTS/PTE: Speaking mock tests, cue card practice, timed tasks" },
              { icon: <CheckCircle size={24} />, text: "Offline AI-powered practice for personalized feedback" },
            ]}
          />

          <FeatureShowcase
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
            title={
              <span className="text-teal-600">
                Access Lessons & Feedback Instantly.
              </span>
            }
            description="Quickly find the lessons, exercises, and practice sessions you need. Speak Bee helps you navigate your learning path efficiently and stay on track."
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
            title={
              <span className="text-teal-600">
                AI-Powered Learning Insights.
              </span>
            }
            description="Speak Bee's AI helps you discover patterns in your learning, providing personalized guidance and suggestions to improve your English skills efficiently."
            image="./image8.png"
            features={[
              { icon: <CheckCircle size={24} />, text: "AI analyzes your progress to suggest next lessons and exercises" },
              { icon: <CheckCircle size={24} />, text: "Highlights strengths and areas for improvement in speaking and grammar" },
              { icon: <CheckCircle size={24} />, text: "Weekly insights show your learning streaks and achievements" },
              { icon: <CheckCircle size={24} />, text: "Adaptive AI feedback improves pronunciation, vocabulary, and conversation skills" },
            ]}
          />


          <FeatureShowcase
            title={
              <span className="text-teal-600">
                Your Private Learning Hub.
              </span>
            }
            description="Speak Bee keeps your learning progress and data completely private. All exercises, lessons, and feedback are stored locally, giving you full control and offline access."
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
            title={
              <span className="text-teal-600">
                Your Personal English Coach.
              </span>
            }
            description="Speak Bee acts as an extension of your learning journey, guiding you through interactive lessons, practice exercises, and real-time feedback across all your devices."
            image="./image10.png"
            features={[
              { icon: <CheckCircle size={24} />, text: "Works offline on all your devices: Android, iOS, Windows, and macOS" },
              { icon: <CheckCircle size={24} />, text: "Interactive speech-to-text and conversation practice with AI feedback" },
              { icon: <CheckCircle size={24} />, text: "Category-based modules for Kids, Adults, and IELTS/PTE learners" },
              { icon: <CheckCircle size={24} />, text: "Track your progress with gamified achievements, scores, and streaks" },
            ]}
          />
        </div>

        {/* Values Section */}
        <div className="py-16 px-4 rounded-lg glass-panel my-24">
          <h2 className="text-3xl font-bold text-center mb-3">We believe learning should be effortless</h2>
          <p className="text-xl text-center text-foreground/80 max-w-3xl mx-auto mb-16">
            Focus on improving your English skills while Speak Bee handles the rest — practice, feedback, and progress tracking.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ValueProp
              icon={<Brain className="w-8 h-8 text-primary" />}
              title="Learn with AI"
              description="Speak Bee uses offline AI to provide real-time conversation practice, pronunciation scoring, and personalized feedback."
            />
            <ValueProp
              icon={<Shield className="w-8 h-8 text-primary" />}
              title="Offline & Secure"
              description="All lessons, scores, and progress data stay on your device, ensuring privacy while learning anytime, anywhere."
            />
            <ValueProp
              icon={<Lightbulb className="w-8 h-8 text-primary" />}
              title="Fun and Engaging"
              description="Gamified lessons, achievements, and streaks make learning enjoyable for kids, adults, and exam learners alike."
            />
          </div>

          <div className="flex justify-center mt-16">
            <Button size="lg" className="rounded-full" asChild>
              <Link to="/">
                Start Your English Journey
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BookOpen className="w-8 h-8 text-primary" />}
              title="Lesson Modules"
              description="Access category-based lessons for Kids, Adults, and IELTS/PTE learners with offline content packs."
            />
            <FeatureCard
              icon={<Mic className="w-8 h-8 text-primary" />}
              title="Offline AI Practice"
              description="Engage in conversation simulations, pronunciation scoring, and grammar/vocabulary exercises without internet."
            />
            <FeatureCard
              icon={<PenTool className="w-8 h-8 text-primary" />}
              title="Personalized Feedback"
              description="Receive real-time, AI-powered feedback tailored to your performance and learning progress."
            />
            <FeatureCard
              icon={<BarChart className="w-8 h-8 text-primary" />}
              title="Progress Tracking"
              description="Monitor achievements, streaks, and scores to stay motivated and improve consistently."
            />
            <FeatureCard
              icon={<Clock className="w-8 h-8 text-primary" />}
              title="Exam Simulation"
              description="Practice IELTS/PTE speaking tasks and cue cards with offline AI scoring to prepare effectively."
            />
            <FeatureCard
              icon={<Star className="w-8 h-8 text-primary" />}
              title="Gamified Learning"
              description="Earn badges, points, and unlock achievements to make learning fun and engaging."
            />
          </div>
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


        {/* Technical Details */}
        <div className="mt-20 glass-panel p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-6 text-center text-primary">Technical Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="flex items-center text-xl font-bold mb-3 gap-2">
                <Cpu className="w-6 h-6 text-primary" />
                AI & Speech Technology
              </h3>
              <p className="text-foreground/80 mb-4">
                Speak Bee leverages cutting-edge AI and offline speech models to provide pronunciation feedback, interactive conversations, and personalized learning paths.
              </p>

              <h3 className="flex items-center text-xl font-bold mb-3 gap-2">
                <Database className="w-6 h-6 text-primary" />
                Data Security
              </h3>
              <p className="text-foreground/80">
                All learner data is securely stored and encrypted, ensuring privacy while tracking progress and achievements safely.
              </p>
            </div>

            <div>
              <h3 className="flex items-center text-xl font-bold mb-3 gap-2">
                <Plug className="w-6 h-6 text-primary" />
                Integration
              </h3>
              <p className="text-foreground/80 mb-4">
                Seamlessly connect with educational tools, cloud storage, and learning resources to enhance your study workflow.
              </p>

              <h3 className="flex items-center text-xl font-bold mb-3 gap-2">
                <Sliders className="w-6 h-6 text-primary" />
                Personalization
              </h3>
              <p className="text-foreground/80">
                Customize modules, track learning goals, and receive adaptive exercises tailored to your progress and fluency level.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HowPage;