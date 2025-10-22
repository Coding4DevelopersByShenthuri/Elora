import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Play, 
  Volume2, 
  Mic, 
  BookOpen, 
  Award, 
  Star,
  ArrowRight,
  CheckCircle,
  Brain,
  Shield,
  Heart,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAnimateIn } from '@/lib/animations';
import { ManageSection } from '@/components/landing/ManageSection';
import { DeploySection } from '@/components/landing/DeploySection';
import UseCasesSection from '@/components/landing/UseCasesSection';

const Index = () => {
  const showManage = useAnimateIn(false, 700);
  const showDeploy = useAnimateIn(false, 900);
  const showUseCases = useAnimateIn(false, 1100);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Original features array
  const features = [
    {
      icon: <Mic className="w-8 h-8" />,
      title: "AI-Powered Speaking Practice",
      description: "Practice conversations with our advanced AI that provides real-time feedback on pronunciation and fluency.",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Comprehensive Learning Modules",
      description: "Structured lessons for kids, adults, and exam candidates with offline access to all content.",
      color: "from-teal-500 to-cyan-600"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "100% Offline & Private",
      description: "All your learning data stays on your device. No internet required, complete privacy guaranteed.",
      color: "from-blue-500 to-indigo-600"
    }
  ];
  
  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Background Elements - NO CHANGES */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] rounded-full bg-accent/10 blur-3xl -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* Hero Section */}
        <div className="pt-32 sm:pt-28 md:pt-32 lg:pt-36 pb-12 sm:pb-16 md:pb-20 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 xl:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-6 md:space-y-8">
              <div className="space-y-4 md:space-y-6">
                <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary/20 text-primary font-semibold text-xs md:text-base shadow-md border-2 border-primary/30">
                  <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">AI-Powered English Learning</span>
                </div>
                
                {/* Mobile View - Optimized layout */}
                <h1 className="block md:hidden text-3xl sm:text-4xl font-bold leading-tight">
                  <span className="block">Master English with Your</span>
                  <span className="block mt-1">
                    <span className="text-[#529641]">Personal </span>
                    <span className="relative inline-block">
                      <span className="text-[#529641]">AI Tutor</span>
                      <svg className="absolute -bottom-0.5 left-0 w-full h-1.5 text-orange-400" viewBox="0 0 200 12" fill="none">
                        <path d="M2 8C50 2 100 10 150 6C180 4 200 8 200 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                    </span>
                  </span>
                </h1>

                {/* Desktop View - No quotation marks */}
                <h1 className="hidden md:block md:text-5xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                  Master English with Your <span className="text-[#529641] md:inline-block">Personal</span>
                  <span className="relative inline-block mt-2">
                    <span className="text-[#529641]">AI Tutor</span>
                    <svg className="absolute -bottom-1 md:-bottom-2 left-0 w-full h-2 md:h-3 text-orange-400" viewBox="0 0 200 12" fill="none">
                      <path d="M2 8C50 2 100 10 150 6C180 4 200 8 200 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  </span>
                </h1>
                
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
                  Practice speaking, listening, and conversation skills with our advanced AI technology. 
                  Works completely offline, respects your privacy, and adapts to your learning pace.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 md:px-8 md:py-4 text-base md:text-lg rounded-full shadow-lg hover:shadow-xl transition-shadow">
                  <Play className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Start Learning Free
                </Button>
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white px-4 py-2 md:px-8 md:py-4 text-base md:text-lg rounded-full">
                  <Volume2 className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-4 md:gap-8 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
                  <span>100% Offline/Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
                  <span>Privacy First</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
                  <span>AI-Powered</span>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className="relative mt-8 lg:mt-0">
              <div className="relative bg-gradient-to-br from-orange-400/10 via-orange-300/10 to-orange-200/10 rounded-2xl md:rounded-3xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
                <div className="bg-gradient-to-br from-white/30 via-white/25 to-white/20 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-6 shadow-2xl border border-orange-300/20">
                  <div className="flex items-center justify-center mb-4 md:mb-6">
                    <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#52b788] via-[#40916c] to-[#2d6a4f] rounded-full flex items-center justify-center shadow-lg">
                      <Brain className="w-8 h-8 md:w-10 md:h-10 text-white" />
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20 rounded-full"></div>
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-center mb-3 md:mb-4 bg-gradient-to-r from-[#1b4332] to-[#1b4332] bg-clip-text text-transparent">
                    Your AI <span className="relative inline-block text-teal-500 bg-clip-text" style={{ WebkitTextFillColor: 'currentColor' }}>
                      English
                      <svg className="absolute -bottom-0.5 left-0 w-full h-1 text-orange-500" viewBox="0 0 200 12" fill="none">
                        <path d="M2 8C50 2 100 10 150 6C180 4 200 8 200 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                    </span> Coach
                  </h3>
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center gap-3 p-2 md:p-3 bg-gradient-to-r from-[#d8f3dc] to-[#b7e4c7] rounded-lg border border-[#74c69d]/30 hover:shadow-md transition-all duration-300">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#52b788] to-[#40916c] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mic className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <span className="text-xs md:text-sm font-medium text-[#1b4332]">Speaking Practice</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 md:p-3 bg-gradient-to-r from-[#b7e4c7] to-[#95d5b2] rounded-lg border border-[#52b788]/30 hover:shadow-md transition-all duration-300">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#40916c] to-[#2d6a4f] rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <span className="text-xs md:text-sm font-medium text-[#1b4332]">Interactive Lessons</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 md:p-3 bg-gradient-to-r from-[#95d5b2] to-[#74c69d] rounded-lg border border-[#40916c]/30 hover:shadow-md transition-all duration-300">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#2d6a4f] to-[#1b4332] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Award className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <span className="text-xs md:text-sm font-medium text-[#1b4332]">Progress Tracking</span>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 w-6 h-6 md:w-8 md:h-8 bg-orange-400 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                  <Star className="w-3 h-3 md:w-4 md:h-4 text-white" />
                </div>
                <div className="absolute -bottom-3 -left-3 md:-bottom-4 md:-left-4 w-5 h-5 md:w-6 md:h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                  <Heart className="w-2 h-2 md:w-3 md:h-3 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 md:py-16 lg:py-20 relative">
          {/* Decorative circle - Green */}
          <div className="absolute top-10 right-10 w-20 h-20 text-green-500 opacity-30 hidden lg:block">
            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="3" strokeDasharray="5,5"/>
            </svg>
          </div>
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
              Why Choose <span className="relative inline-block">
                <span className="text-[#529641]">Elora</span>
                <svg className="absolute -bottom-1 md:-bottom-2 left-0 w-full h-2 md:h-3 text-orange-400" viewBox="0 0 200 12" fill="none">
                  <path d="M2 8C50 2 100 10 150 6C180 4 200 8 200 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </span>?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              Experience the future of English learning with our cutting-edge AI technology designed for learners of all levels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 relative">
            {/* Decorative squiggle - Orange */}
            <div className="absolute -left-12 top-1/2 w-24 h-24 text-orange-500 opacity-40 hidden xl:block">
              <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                <path d="M10 50Q30 20 50 50T90 50" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm relative">
                <CardContent className="p-6 md:p-8 text-center">
                  {/* Random decorative dots */}
                  {index === 0 && (
                    <div className="absolute -top-3 -right-3 w-6 h-6 text-green-500 opacity-70">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                        <circle cx="12" cy="12" r="10"/>
                      </svg>
                    </div>
                  )}
                  {index === 1 && (
                    <div className="absolute -bottom-2 -left-2 w-8 h-8 text-orange-500 opacity-60">
                      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                        <path d="M50 10L60 40L90 50L60 60L50 90L40 60L10 50L40 40Z" fill="currentColor"/>
                      </svg>
                    </div>
                  )}
                  <div className={`w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 rounded-xl md:rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-black">{feature.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Learning Benefits Section */}
        <div className="py-12 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center mb-10 md:mb-16">
            {/* Left Side - Title */}
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
                An Easier Way to <span className="relative inline-block">
                  <span className="text-[#529641]">Learn</span>
                  <svg className="absolute -bottom-1 md:-bottom-2 left-0 w-full h-2 md:h-3 text-orange-400" viewBox="0 0 200 12" fill="none">
                    <path d="M2 8C50 2 100 10 150 6C180 4 200 8 200 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </span> and <span className="relative inline-block">
                  <span className="text-orange-500">Speak</span>
                  <svg className="absolute -bottom-1 md:-bottom-2 left-0 w-full h-2 md:h-3 text-green-500" viewBox="0 0 200 12" fill="none">
                    <path d="M2 8C50 2 100 10 150 6C180 4 200 8 200 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </span>
              </h2>
            </div>

            {/* Right Side - Description */}
            <div className="relative">
              <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 w-5 h-5 md:w-6 md:h-6 text-primary hidden sm:block">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              {/* Decorative wavy arrow - Orange */}
              <div className="absolute -bottom-8 -left-8 w-16 h-16 text-orange-500 opacity-60 hidden sm:block">
                <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                  <path d="M20 20C40 10 60 30 80 20C85 18 90 22 90 25C90 30 85 35 80 30C70 25 50 15 30 25C25 27 20 25 20 20Z" stroke="currentColor" strokeWidth="2" fill="currentColor"/>
                </svg>
              </div>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
                When learners have reliable access to AI-powered English training and the freedom to choose what and when they learn, 
                more skills are developed and language fluency stays on track.
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Our Services Section */}
        <div className="py-12 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 xl:gap-16 items-center">
            {/* Left Side - Student Image Area */}
            <div className="relative order-2 lg:order-1">
              <div className="relative">
                {/* Student image */}
                <div className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 mx-auto rounded-full overflow-hidden">
                  <img 
                    src="/student.jpg" 
                    alt="Student learning" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Background shapes */}
                <div className="absolute -top-6 -left-6 md:-top-8 md:-left-8 w-24 h-24 md:w-32 md:h-32 bg-primary/10 rounded-xl md:rounded-2xl rotate-12 hidden sm:block"></div>
                <div className="absolute -bottom-6 -right-6 md:-bottom-8 md:-right-8 w-20 h-20 md:w-24 md:h-24 bg-secondary/10 rounded-xl md:rounded-2xl -rotate-12 hidden sm:block"></div>
                
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-5 h-5 md:w-6 md:h-6 bg-orange-400 rounded-full animate-pulse"></div>
                <div className="absolute bottom-4 left-4 w-3 h-3 md:w-4 md:h-4 bg-orange-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
              </div>
            </div>

            {/* Right Side - Statistics */}
            <div className="space-y-6 md:space-y-8 order-1 lg:order-2">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
                  Why Choose Our <span className="relative inline-block">
                    <span className="text-[#529641]">Services</span>?
                    <svg className="absolute -bottom-1 md:-bottom-2 left-0 w-full h-2 md:h-3 text-orange-400" viewBox="0 0 200 12" fill="none">
                      <path d="M2 8C50 2 100 10 150 6C180 4 200 8 200 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  </span>
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
                  Schools and districts save time and money, so they can focus on full-time staff and student outcomes. 
                  Learners work on their own terms while making a difference in their language skills.
                </p>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                {[
                  { number: "3k+", label: "Highly Trained AI Models", color: "bg-orange-400" },
                  { number: "300+", label: "Learning Centers Worldwide", color: "bg-orange-400" },
                  { number: "48+", label: "Countries We Serve", color: "bg-orange-400" }
                ].map((stat, index) => (
                  <div key={index} className={`${stat.color} rounded-xl md:rounded-2xl p-4 md:p-6 text-white text-center transform hover:scale-105 transition-transform duration-300`}>
                    <div className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">{stat.number}</div>
                    <div className="text-xs md:text-sm font-medium leading-tight">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Decorative elements */}
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Testimonials Section */}
        <div className="py-12 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start mb-10 md:mb-16">
            {/* Left Side - Title */}
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
                What Our <span className="relative inline-block">
                  <span className="text-[#529641]">Lovely</span>
                  <svg className="absolute -bottom-1 md:-bottom-2 left-0 w-full h-2 md:h-3 text-orange-400" viewBox="0 0 200 12" fill="none">
                    <path d="M2 8C50 2 100 10 150 6C180 4 200 8 200 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </span> Learners Say
              </h2>
            </div>

            {/* Right Side - Description */}
            <div className="relative">
              <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 w-5 h-5 md:w-6 md:h-6 text-primary hidden sm:block">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              {/* Decorative spiral - Green */}
              <div className="absolute top-1/2 -left-10 w-16 h-16 text-green-500 opacity-50 hidden md:block">
                <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                  <path d="M50 10C30 10 10 30 10 50C10 70 30 90 50 90C70 90 90 70 90 50C90 35 80 25 65 25C55 25 45 35 45 45C45 55 55 60 60 60" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
                We recently heard from Sarah Johnson, who started learning with Elora in the spring of 2024. 
                Below, she shares her story of how she was able to improve her English skills quickly.
              </p>
              {/* Decorative lines */}
              <div className="absolute -bottom-6 -right-6 md:-bottom-8 md:-right-8 w-10 md:w-12 h-1 bg-primary/60 rounded-full hidden sm:block"></div>
              <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 w-6 md:w-8 h-1 bg-primary/40 rounded-full hidden sm:block"></div>
            </div>
          </div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                name: "James Hown",
                role: "English Teacher",
                location: "Texas",
                content: "Elora has revolutionized how my students learn English. The offline AI features work perfectly even in areas with poor internet connectivity.",
                rating: 5,
                image: "👨‍🏫"
              },
              {
                name: "Wade Warren", 
                role: "IELTS Candidate",
                location: "NY",
                content: "The speaking practice modules helped me improve my IELTS score from 6.0 to 8.5. The AI feedback is incredibly accurate and helpful.",
                rating: 5,
                image: "👨‍💼"
              },
              {
                name: "Jenny Wilson",
                role: "Parent",
                location: "Illinois", 
                content: "My 8-year-old daughter loves the interactive stories and games. It's amazing how much her English has improved in just 3 months.",
                rating: 5,
                image: "👩‍👧"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center mb-4 md:mb-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl md:text-2xl mr-3 md:mr-4 flex-shrink-0">
                      {testimonial.image}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-base md:text-lg text-black truncate">{testimonial.name}</h4>
                      <p className="text-muted-foreground text-xs md:text-sm truncate">{testimonial.role} in {testimonial.location}</p>
                      <div className="flex text-yellow-400 mt-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 md:w-4 md:h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Landing Components */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* Manage Section - Features with Interactive Illustrations */}
        <ManageSection show={showManage} />

        {/* Use Cases Section - Interactive Training for Different User Types */}
        <UseCasesSection show={showUseCases} />

        {/* Deploy Section - Learn & Improve */}
        <DeploySection show={showDeploy} />

        {/* Call to Action */}
        <div className="py-8 md:py-10 lg:py-12">
          <div className="bg-gradient-to-br from-[#529641] to-[#3d7031] rounded-2xl md:rounded-3xl p-8 md:p-12 lg:p-16 text-center text-white">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white font-bold mb-4 md:mb-6">
              Ready to Master English?
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 opacity-90 max-w-2xl mx-auto text-white px-4">
              Join thousands of learners who are already improving their English skills with our AI-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Button size="lg" className="bg-white text-[#529641] hover:bg-white/90 px-6 py-3 md:px-8 md:py-4 text-base md:text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
                <Play className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Start Your Journey
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-[#529641] px-6 py-3 md:px-8 md:py-4 text-base md:text-lg rounded-full transition-all">
                <Link to="/about" className="flex items-center text-green-600">
                  Learn More
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
