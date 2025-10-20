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
  Download,
  Smartphone,
  Monitor,
  Apple,
  Chrome,
  Sparkles,
  Zap,
  Target,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
              {/* Student placeholder - using a gradient circle as placeholder */}
              <div className="w-80 h-80 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <div className="w-60 h-60 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                  <Brain className="w-24 h-24 text-primary" />
                </div>
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
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                      {step.icon}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="w-8 h-8 mb-4 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-primary">{step.title}</h3>
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

        {/* Values Section */}
        <div className="py-16 px-4 rounded-lg glass-panel my-24">
          <h2 className="text-3xl font-bold text-center mb-3">We believe learning should be effortless</h2>
          <p className="text-xl text-center text-foreground/80 max-w-3xl mx-auto mb-16">
            Focus on improving your English skills while Elora handles the rest — practice, feedback, and progress tracking.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ValueProp
              icon={<Brain className="w-8 h-8 text-primary" />}
              title="Learn with AI"
              description="Elora uses offline AI to provide real-time conversation practice, pronunciation scoring, and personalized feedback."
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
        <div className="mt-20 glass-panel p-8 rounded-lg mb-24">
          <h2 className="text-3xl font-bold mb-6 text-center text-primary">Powered by Advanced Technology</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-600/20 flex items-center justify-center flex-shrink-0 text-teal-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Offline AI Technology</h3>
                <p className="text-muted-foreground text-sm">
                  Advanced machine learning models run locally on your device, providing instant feedback without internet.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-600/20 flex items-center justify-center flex-shrink-0 text-teal-600">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Speech Recognition</h3>
                <p className="text-muted-foreground text-sm">
                  Cutting-edge speech-to-text technology analyzes your pronunciation and provides detailed feedback.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-600/20 flex items-center justify-center flex-shrink-0 text-teal-600">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Adaptive Learning</h3>
                <p className="text-muted-foreground text-sm">
                  Content adjusts to your pace and skill level, ensuring optimal learning efficiency.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div>
              <h3 className="flex items-center text-xl font-bold mb-3 gap-2">
                <Cpu className="w-6 h-6 text-primary" />
                AI & Speech Technology
              </h3>
              <p className="text-foreground/80 mb-4">
                Elora leverages cutting-edge AI and offline speech models to provide pronunciation feedback, interactive conversations, and personalized learning paths.
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
                <Sliders className="w-6 h-6 text-primary" />
                Personalization
              </h3>
              <p className="text-foreground/80">
                Customize modules, track learning goals, and receive adaptive exercises tailored to your progress and fluency level.
              </p>
            </div>
          </div>
        </div>

        {/* Download Section */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-1.5 bg-teal-600/10 rounded-xl mb-6">
              <div className="bg-background px-4 py-2 rounded-lg shadow-sm">
                <Download size={22} className="inline-block mr-2 text-teal-600" />
                <span className="font-semibold text-teal-600">Get Started Today</span>
              </div>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-teal-600">
              Download Elora
            </h2>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Available on all your devices. Download once and learn English offline, anytime, anywhere.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
            {[
              {
                icon: <Smartphone className="w-8 h-8" />,
                title: "Android",
                description: "For phones and tablets. Android 8.0+"
              },
              {
                icon: <Apple className="w-8 h-8" />,
                title: "iOS",
                description: "iPhone and iPad. iOS 14.0+"
              },
              {
                icon: <Monitor className="w-8 h-8" />,
                title: "Windows",
                description: "Desktop app. Windows 10/11"
              },
              {
                icon: <Apple className="w-8 h-8" />,
                title: "macOS",
                description: "Native Mac app. macOS 11+"
              },
              {
                icon: <Chrome className="w-8 h-8" />,
                title: "Web App",
                description: "Works on any browser"
              }
            ].map((platform, idx) => (
              <div key={idx} className="glass-panel rounded-xl p-6 md:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-teal-600 rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-500"></div>
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-600/20 to-teal-600/10 flex items-center justify-center mb-4 text-teal-600 group-hover:scale-110 transition-transform duration-300">
                    {platform.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{platform.title}</h3>
                  <p className="text-muted-foreground text-sm mb-6">{platform.description}</p>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white transition-all duration-300"
                    onClick={() => setIsWaitlistOpen(true)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* System Requirements */}
          <div className="glass-panel rounded-2xl p-8 md:p-12 bg-gradient-to-br from-teal-600/5 to-transparent mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center text-teal-600">
              System Requirements
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div>
                <h4 className="font-bold text-lg mb-3 flex items-center">
                  <Smartphone className="w-5 h-5 mr-2 text-teal-600" />
                  Mobile
                </h4>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• Android 8.0+ or iOS 14.0+</li>
                  <li>• 2GB RAM minimum (4GB recommended)</li>
                  <li>• 500MB storage space</li>
                  <li>• Microphone for speech practice</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-3 flex items-center">
                  <Monitor className="w-5 h-5 mr-2 text-teal-600" />
                  Desktop
                </h4>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• Windows 10/11 or macOS 11+</li>
                  <li>• 4GB RAM minimum (8GB recommended)</li>
                  <li>• 1GB storage space</li>
                  <li>• Microphone for speech practice</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-3 flex items-center">
                  <Chrome className="w-5 h-5 mr-2 text-teal-600" />
                  Web App
                </h4>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• Modern browser (Chrome, Edge, Safari)</li>
                  <li>• IndexedDB support required</li>
                  <li>• 500MB available storage</li>
                  <li>• Web Speech API support</li>
                </ul>
              </div>
            </div>
          </div>

          {/* FAQ about Download */}
          <div className="max-w-4xl mx-auto">
            <div className="glass-panel rounded-xl p-6 md:p-8">
              <h4 className="font-bold text-xl mb-4 text-center">Download FAQ</h4>
              
              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold mb-2 text-teal-600">Does it work completely offline?</h5>
                  <p className="text-muted-foreground text-sm">
                    Yes! After the initial download and setup, all features work 100% offline. No internet connection required for lessons, AI feedback, or progress tracking.
                  </p>
                </div>

                <div>
                  <h5 className="font-semibold mb-2 text-teal-600">Can I use it on multiple devices?</h5>
                  <p className="text-muted-foreground text-sm">
                    Absolutely! Download on all your devices. While each device maintains its own offline data, you can optionally sync progress across devices when connected.
                  </p>
                </div>

                <div>
                  <h5 className="font-semibold mb-2 text-teal-600">How big is the download?</h5>
                  <p className="text-muted-foreground text-sm">
                    The base app is around 150MB. Additional lesson packs and AI models are downloaded based on your selection (100-300MB per pack), ensuring you only download what you need.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <WaitlistModal isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} />
    </div>
  );
};

export default HowPage;