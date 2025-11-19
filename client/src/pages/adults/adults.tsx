import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Play, Target, Award, BookOpen, MessageCircle,
  Mic, Volume2, CheckCircle, TrendingUp, Zap, Lightbulb, Crown, BarChart3,
  Clock, ThumbsUp, Shield, Rocket,
  ArrowRight, GraduationCap, Brain, Languages, Star, Sparkles, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const AdultsPage = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(42);
  const [streak, setStreak] = useState(7);
  const [fluencyScore, setFluencyScore] = useState(65);
  const [isHovered, setIsHovered] = useState<number | null>(null);
  const [stars, setStars] = useState<Array<{ x: number; y: number; size: number; delay: number; opacity: number }>>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Generate animated stars with varying opacity - Performance optimized
  useEffect(() => {
    const generateStars = () => {
      // Reduce star count on mobile for better performance
      const isMobile = window.innerWidth < 768;
      const starCount = isMobile ? 100 : 200;
      
      const newStars = Array.from({ length: starCount }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 3,
        opacity: Math.random() * 0.8 + 0.2
      }));
      setStars(newStars);
    };
    generateStars();
    
    // Handle window resize for responsive star count
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if ((isMobile && stars.length > 100) || (!isMobile && stars.length < 150)) {
        generateStars();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Page load fade-in and theme transition
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Parallax scroll effect for planets
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const levels = [
    {
      id: 'beginners',
      label: 'Foundation Level',
      icon: Lightbulb,
      color: 'from-cyan-400 via-blue-500 to-indigo-600',
      glowColor: 'rgba(34, 211, 238, 0.3)',
      description: 'Build essential communication skills for everyday situations',
      progress: 65,
      lessons: 12,
      skills: ['Core Grammar', 'Essential Vocabulary', 'Daily Conversations'],
      duration: '4-6 weeks',
      constellation: 'Orion',
      planetImage: '/planets/zu7XaNtVpYwIGWuPT910tDPzo.avif'
    },
    {
      id: 'intermediates',
      label: 'Intermediate Level',
      icon: Brain,
      color: 'from-purple-400 via-pink-500 to-rose-600',
      glowColor: 'rgba(168, 85, 247, 0.3)',
      description: 'Develop professional communication and complex discussions',
      progress: 30,
      lessons: 18,
      skills: ['Advanced Grammar', 'Professional Communication', 'Cultural Context'],
      duration: '6-8 weeks',
      constellation: 'Cassiopeia',
      planetImage: '/planets/YZWPZTXZtvH1iH4rCX0Uh48wmtQ.avif'
    },
    {
      id: 'advanced',
      label: 'Advanced Level',
      icon: Crown,
      color: 'from-amber-400 via-orange-500 to-red-600',
      glowColor: 'rgba(251, 191, 36, 0.3)',
      description: 'Master English for professional excellence and leadership',
      progress: 15,
      lessons: 24,
      skills: ['Executive Communication', 'Native Expressions', 'Strategic Dialogue'],
      duration: '8-12 weeks',
      constellation: 'Pegasus',
      planetImage: '/planets/Yo4hcrPNqAQh1DJiOgz3TH1rI.avif'
    }
  ];

  const learningPaths = [
    {
      title: "Professional Communication",
      description: "Master workplace communication, meetings, and professional interactions",
      icon: MessageCircle,
      color: "from-cyan-500 to-blue-600",
      gradient: "from-cyan-500 to-blue-600",
      duration: "8 weeks",
      lessons: 32,
      level: "All Levels",
      progress: 45,
      skills: ['Meetings', 'Presentations', 'Professional Etiquette'],
      stars: 4.8
    },
    {
      title: "Grammar & Structure Mastery",
      description: "Comprehensive grammar from foundational to advanced professional writing",
      icon: BookOpen,
      color: "from-emerald-500 to-teal-600",
      gradient: "from-emerald-500 to-teal-600",
      duration: "6 weeks",
      lessons: 28,
      level: "Foundation → Advanced",
      progress: 60,
      skills: ['Syntax', 'Professional Writing', 'Complex Structures'],
      stars: 4.9
    },
    {
      title: "Pronunciation Excellence",
      description: "Perfect your accent and speaking clarity for professional settings",
      icon: Mic,
      color: "from-purple-500 to-pink-600",
      gradient: "from-purple-500 to-pink-600",
      duration: "4 weeks",
      lessons: 20,
      level: "All Levels",
      progress: 30,
      skills: ['Intonation', 'Clarity', 'Professional Tone'],
      stars: 4.7
    },
    {
      title: "Business English Mastery",
      description: "Excel in corporate environments and executive communication",
      icon: GraduationCap,
      color: "from-amber-500 to-orange-600",
      gradient: "from-amber-500 to-orange-600",
      duration: "10 weeks",
      lessons: 40,
      level: "Intermediate → Advanced",
      progress: 20,
      skills: ['Reports', 'Emails', 'Strategic Communication'],
      stars: 4.8
    }
  ];

  const quickActions = [
    {
      title: "Daily Conversation",
      description: "Practice professional speaking about everyday topics",
      icon: MessageCircle,
      color: "from-cyan-500 to-blue-600",
      gradient: "from-cyan-500 to-blue-600",
      time: "10-15 min",
      level: "Foundation+",
      difficulty: "Easy",
      sessionType: "daily-conversation"
    },
    {
      title: "Pronunciation Drill",
      description: "Improve your accent and speaking clarity",
      icon: Volume2,
      color: "from-emerald-500 to-teal-600",
      gradient: "from-emerald-500 to-teal-600",
      time: "5-10 min",
      level: "All Levels",
      difficulty: "Medium",
      sessionType: "pronunciation"
    },
    {
      title: "Grammar Challenge",
      description: "Test and improve your professional grammar skills",
      icon: BookOpen,
      color: "from-purple-500 to-pink-600",
      gradient: "from-purple-500 to-pink-600",
      time: "8-12 min",
      level: "All Levels",
      difficulty: "Medium",
      sessionType: "grammar"
    },
    {
      title: "Vocabulary Builder",
      description: "Learn professional terminology in context",
      icon: Languages,
      color: "from-amber-500 to-orange-600",
      gradient: "from-amber-500 to-orange-600",
      time: "6-8 min",
      level: "All Levels",
      difficulty: "Easy",
      sessionType: "vocabulary"
    }
  ];

  const stats = [
    {
      label: "Fluency Score",
      value: `${fluencyScore}%`,
      icon: TrendingUp,
      color: "text-cyan-400",
      glowColor: "rgba(34, 211, 238, 0.2)",
      description: "Professional speaking fluency"
    },
    {
      label: "Vocabulary Mastered",
      value: "428",
      icon: BookOpen,
      color: "text-emerald-400",
      glowColor: "rgba(52, 211, 153, 0.2)",
      description: "Active professional vocabulary"
    },
    {
      label: "Learning Consistency",
      value: `${streak} days`,
      icon: Zap,
      color: "text-amber-400",
      glowColor: "rgba(251, 191, 36, 0.2)",
      description: "Daily practice streak"
    },
    {
      label: "Modules Completed",
      value: "24",
      icon: Award,
      color: "text-purple-400",
      glowColor: "rgba(168, 85, 247, 0.2)",
      description: "Total learning modules"
    },
  ];

  const recentActivity = [
    { action: "Completed", lesson: "Professional Greetings", time: "2 hours ago", score: 85 },
    { action: "Started", lesson: "Business Meeting Skills", time: "1 day ago", score: null },
    { action: "Practiced", lesson: "Pronunciation Refinement", time: "2 days ago", score: 78 },
    { action: "Completed", lesson: "Advanced Grammar Test", time: "3 days ago", score: 92 },
  ];

  const achievements = [
    { name: "Professional Communicator", earned: true, icon: MessageCircle, progress: 100 },
    { name: "Grammar Expert", earned: false, icon: BookOpen, progress: 75 },
    { name: "Clear Speaker", earned: false, icon: Mic, progress: 50 },
    { name: "Vocabulary Specialist", earned: true, icon: Languages, progress: 100 },
  ];

  const learningResources = [
    {
      title: "Interactive Video Lessons",
      description: "Engage with native speakers in real-world scenarios",
      icon: Play,
      count: "150+ videos",
      color: "from-cyan-500 to-blue-600"
    },
    {
      title: "AI-Powered Practice",
      description: "Personalized speaking practice with instant feedback",
      icon: Sparkles,
      count: "24/7 available",
      color: "from-purple-500 to-pink-600"
    },
    {
      title: "Grammar Mastery Course",
      description: "Comprehensive grammar from basics to advanced",
      icon: BookOpen,
      count: "200+ exercises",
      color: "from-emerald-500 to-teal-600"
    },
    {
      title: "Cultural Immersion",
      description: "Learn through authentic cultural contexts",
      icon: Globe,
      count: "50+ scenarios",
      color: "from-amber-500 to-orange-600"
    }
  ];


  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 80) return 'text-cyan-400';
    if (score >= 70) return 'text-amber-400';
    return 'text-rose-400';
  };

  // Parallax transform for planets
  const parallaxTransform1 = `translateY(${scrollY * 0.1}px)`;
  const parallaxTransform2 = `translateY(${scrollY * 0.15}px)`;
  const parallaxTransform3 = `translateY(${scrollY * 0.08}px)`;
  const parallaxTransform4 = `translateY(${scrollY * 0.12}px)`;

  return (
    <div className={`min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 ${isLoaded ? 'space-fade-in' : 'opacity-0'}`}>
      {/* Theme Transition Overlay */}
      {!isLoaded && (
        <div className="fixed inset-0 bg-gradient-to-b from-green-50 via-green-100 to-slate-950 z-50 transition-opacity duration-500" />
      )}

      {/* Deep Space Background with Stars */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {stars.map((star, index) => (
          <div
            key={index}
            className="absolute rounded-full bg-white space-star"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              opacity: star.opacity,
              boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, ${star.opacity})`
            }}
          />
        ))}
      </div>

      {/* Nebula and Cosmic Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-radial from-purple-500/30 via-indigo-500/20 to-transparent rounded-full blur-3xl nebula-effect animate-pulse" />
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-radial from-cyan-500/25 via-blue-500/15 to-transparent rounded-full blur-3xl nebula-effect animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/3 w-[700px] h-[700px] bg-gradient-radial from-pink-500/20 via-rose-500/10 to-transparent rounded-full blur-3xl nebula-effect animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Large Planet/Moon Spheres - Main Visual Elements with Parallax */}
      {/* Main Large Planet - Bottom Left - Reduced Size */}
      <div 
        className="fixed bottom-0 left-0 w-[100px] h-[100px] sm:w-[140px] sm:h-[140px] md:w-[180px] md:h-[180px] lg:w-[220px] lg:h-[220px] xl:w-[260px] xl:h-[260px] pointer-events-none opacity-60 sm:opacity-65 md:opacity-70 lg:opacity-75 xl:opacity-80 parallax-slow"
        style={{ transform: parallaxTransform1 }}
      >
        <div className="relative w-full h-full">
          <img 
            src="/planets/eReia3yfybtZ8P5576d6kF8NJIM.avif" 
            alt="Planet" 
            className="absolute inset-0 rounded-full object-cover shadow-2xl"
            style={{ filter: 'grayscale(0.2) brightness(0.85)' }}
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 blur-2xl" />
        </div>
      </div>

      {/* Secondary Planet - Top Right */}
      <div 
        className="fixed top-20 right-2 sm:right-4 md:right-10 w-[100px] h-[100px] sm:w-[150px] sm:h-[150px] md:w-[200px] md:h-[200px] lg:w-[250px] lg:h-[250px] xl:w-[300px] xl:h-[300px] pointer-events-none opacity-40 sm:opacity-50 md:opacity-60 hidden sm:block parallax-slow"
        style={{ transform: parallaxTransform2 }}
      >
        <div className="relative w-full h-full">
          <img 
            src="/planets/SEp7QE3Bk6RclE0R7rhBgcGIOI.avif" 
            alt="Planet" 
            className="absolute inset-0 rounded-full object-cover shadow-xl"
            style={{ filter: 'grayscale(0.3) brightness(0.75)' }}
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/15 to-pink-500/15 blur-xl" />
        </div>
      </div>

      {/* Tertiary Planet - Middle Right */}
      <div 
        className="fixed top-1/2 right-4 md:right-20 w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] md:w-[180px] md:h-[180px] lg:w-[220px] lg:h-[220px] xl:w-[250px] xl:h-[250px] pointer-events-none opacity-30 sm:opacity-40 md:opacity-50 hidden md:block parallax-slow"
        style={{ transform: parallaxTransform3 }}
      >
        <div className="relative w-full h-full">
          <img 
            src="/planets/K3uC2Tk4o2zjSbuWGs3t0MMuLVY.avif" 
            alt="Planet" 
            className="absolute inset-0 rounded-full object-cover shadow-xl"
            style={{ filter: 'grayscale(0.3) brightness(0.7)' }}
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/15 to-blue-500/15 blur-xl" />
        </div>
      </div>

      {/* Small Planet - Top Left */}
      <div 
        className="fixed top-32 left-2 sm:left-4 md:left-20 w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] md:w-[160px] md:h-[160px] lg:w-[180px] lg:h-[180px] xl:w-[200px] xl:h-[200px] pointer-events-none opacity-25 sm:opacity-30 md:opacity-40 hidden lg:block parallax-slow"
        style={{ transform: parallaxTransform4 }}
      >
        <div className="relative w-full h-full">
          <img 
            src="/planets/F4RKAKmFyoRYVlTsUWN51wD1dg.avif" 
            alt="Planet" 
            className="absolute inset-0 rounded-full object-cover shadow-lg"
            style={{ filter: 'grayscale(0.4) brightness(0.65)' }}
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 blur-lg" />
        </div>
      </div>

      <div className="relative z-10 pb-12 sm:pb-16 md:pb-20 pt-20 sm:pt-24 md:pt-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl blur-2xl opacity-50 animate-pulse"></div>
    
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Professional English Mastery
              </h1>
            </div>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-cyan-100/80 max-w-3xl mx-auto mb-4 sm:mb-6 md:mb-8 leading-relaxed px-2">
              Advanced English learning designed for professionals seeking career advancement and executive communication excellence
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 px-2">
              <Badge variant="secondary" className="bg-cyan-500/20 backdrop-blur-sm text-cyan-300 border-cyan-400/30 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 text-xs sm:text-sm">
                <Target className="w-3 h-3 mr-1 sm:mr-2" />
                Career-Focused
              </Badge>
              <Badge variant="secondary" className="bg-emerald-500/20 backdrop-blur-sm text-emerald-300 border-emerald-400/30 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 text-xs sm:text-sm">
                <Clock className="w-3 h-3 mr-1 sm:mr-2" />
                Flexible Learning
              </Badge>
              <Badge variant="secondary" className="bg-purple-500/20 backdrop-blur-sm text-purple-300 border-purple-400/30 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 text-xs sm:text-sm">
                <Shield className="w-3 h-3 mr-1 sm:mr-2" />
                Professional Curriculum
              </Badge>
              <Badge variant="secondary" className="bg-amber-500/20 backdrop-blur-sm text-amber-300 border-amber-400/30 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 text-xs sm:text-sm">
                <Rocket className="w-3 h-3 mr-1 sm:mr-2" />
                Accelerated Progress
              </Badge>
            </div>
          </div>

          {/* Level Cards with Planet Spheres */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 md:mb-16">
            {levels.map((level, index) => {
              const Icon = level.icon;
              const isActive = isHovered === index;
              return (
                <Card 
                  key={level.id}
                  className={cn(
                    "group relative bg-slate-900/60 backdrop-blur-xl border-purple-500/30 hover:border-purple-400/50 transition-all duration-500 shadow-2xl overflow-hidden space-card-enter",
                    isActive && "space-active-glow"
                  )}
                  onMouseEnter={() => setIsHovered(index)}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  {/* Planet Sphere Background */}
                  <div className="absolute -bottom-10 -right-10 sm:-bottom-16 sm:-right-16 md:-bottom-20 md:-right-20 w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 opacity-20 sm:opacity-25 md:opacity-30 group-hover:opacity-40 sm:group-hover:opacity-45 md:group-hover:opacity-50 transition-opacity duration-500">
                    <img 
                      src={level.planetImage}
                      alt={`${level.label} planet`}
                      className="w-full h-full rounded-full object-cover"
                      style={{ filter: 'grayscale(0.4) brightness(0.7)' }}
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-700/40 via-slate-600/40 to-slate-800/40" />
                  </div>

                  <CardContent className="p-4 sm:p-6 md:p-8 relative z-10 space-depth-indicator">
                    <div className={cn("p-3 sm:p-4 rounded-xl text-white bg-gradient-to-r shadow-lg mb-4 sm:mb-6 w-fit", level.color)} style={{ boxShadow: `0 0 20px ${level.glowColor}` }}>
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                    </div>
                    
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{level.label}</h3>
                    <p className="text-sm sm:text-base text-cyan-100/70 mb-4 sm:mb-6">{level.description}</p>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-cyan-100/70">Progress</span>
                        <span className="text-sm font-semibold text-white">{level.progress}%</span>
                      </div>
                      <Progress value={level.progress} className="h-2 bg-slate-700/50">
                        <div className={cn("h-full rounded-full bg-gradient-to-r", level.color)} />
                      </Progress>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {level.skills.slice(0, 2).map((skill, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-slate-800/50 text-cyan-200 border-cyan-500/30">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <Link to={`/adults/${level.id}`}>
                      <Button className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold transition-all duration-300 focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900">
                        Explore Level
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-10 md:mb-12">
            {/* Main Progress Card */}
            <Card className="lg:col-span-2 bg-slate-900/60 backdrop-blur-xl border-purple-500/30 shadow-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-white">Learning Progress</h3>
                    <p className="text-sm sm:text-base text-cyan-100/70">Track your advancement across professional levels</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">{progress}%</div>
                    <div className="text-sm sm:text-base text-cyan-100/70">Overall Mastery</div>
                  </div>
                </div>

                <Progress value={progress} className="h-3 bg-slate-700/50 mb-8">
                  <div className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500" />
                </Progress>

                {/* Level Progress */}
                <div className="space-y-4 sm:space-y-6">
                  {levels.map((level) => {
                    const Icon = level.icon;
                    return (
                      <div key={level.id} className="group relative p-4 sm:p-6 bg-slate-800/40 backdrop-blur-sm rounded-xl border border-purple-500/20 transition-all duration-300 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20">
                        <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl" style={{ background: `linear-gradient(to right, ${level.glowColor}, transparent)` }}></div>
                        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                          <div className={cn("p-2 sm:p-3 rounded-xl text-white bg-gradient-to-r shadow-lg w-fit", level.color)} style={{ boxShadow: `0 0 20px ${level.glowColor}` }}>
                            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div className="flex-1 w-full">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-base sm:text-lg font-semibold text-white">{level.label}</span>
                                <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-400/30 text-xs">
                                  {level.constellation}
                                </Badge>
                              </div>
                              <span className="text-xs sm:text-sm font-medium text-cyan-100/80">{level.progress}% Complete</span>
                            </div>
                            <Progress value={level.progress} className="h-2 bg-slate-700/50">
                              <div className={cn("h-full rounded-full bg-gradient-to-r", level.color)} />
                            </Progress>
                            <p className="text-xs sm:text-sm text-cyan-100/70 mt-2">{level.description}</p>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mt-3">
                              <div className="flex flex-wrap gap-1 sm:gap-2">
                                {level.skills.map((skill, i) => (
                                  <Badge key={i} variant="outline" className="text-xs bg-slate-700/50 text-cyan-200 border-cyan-500/30">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                              <span className="text-xs text-cyan-100/60">{level.duration}</span>
                            </div>
                          </div>
                          <Link to={`/adults/${level.id}`} className="sm:self-start">
                            <Button variant="outline" size="sm" className="w-full sm:w-auto border-purple-400/30 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400/50 transition-colors focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-900">
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Stats & Achievements */}
            <Card className="bg-slate-900/60 backdrop-blur-xl border-purple-500/30 shadow-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Performance Metrics</h3>

                {/* Stats */}
                <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/40 backdrop-blur-sm border border-purple-500/20 hover:border-purple-400/50 transition-all duration-300">
                        <div className={cn("p-3 rounded-xl", stat.color)} style={{ backgroundColor: stat.glowColor }}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-baseline">
                            <span className="text-sm font-medium text-cyan-100/80">{stat.label}</span>
                            <span className="text-lg font-bold text-white">{stat.value}</span>
                          </div>
                          <p className="text-xs text-cyan-100/60">{stat.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Achievements */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Professional Certifications</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {achievements.map((achievement, index) => {
                      const Icon = achievement.icon;
                      const isEarned = achievement.earned;

                      return (
                        <div key={index} className={cn(
                          "p-4 rounded-xl border transition-all duration-300 group cursor-pointer backdrop-blur-sm",
                          isEarned
                            ? "bg-gradient-to-br from-purple-500/30 to-cyan-500/20 border-purple-400/50 text-purple-200 hover:from-purple-500/40 hover:to-cyan-500/30"
                            : "bg-slate-800/40 border-slate-600/50 text-cyan-100/60 hover:bg-slate-700/50"
                        )}>
                          <Icon className={cn(
                            "w-5 h-5 mb-2 transition-transform duration-300 group-hover:scale-110",
                            isEarned
                              ? "text-purple-300"
                              : "text-slate-500"
                          )} />
                          <div className="text-sm font-medium mb-2">{achievement.name}</div>
                          {!isEarned && (
                            <Progress value={achievement.progress} className="h-1 bg-slate-700/50">
                              <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full" />
                            </Progress>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Learning Resources Section */}
          <div className="mb-8 sm:mb-10 md:mb-12">
            <div className="mb-6 sm:mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Learning Resources</h2>
                <p className="text-sm sm:text-base text-cyan-100/70">Comprehensive materials for your journey</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {learningResources.map((resource, index) => {
                const Icon = resource.icon;
                return (
                  <Card
                    key={index}
                    className="group cursor-pointer bg-slate-900/60 backdrop-blur-xl border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 space-card-enter focus-within:ring-2 focus-within:ring-purple-400 focus-within:ring-offset-2 focus-within:ring-offset-slate-900"
                    onMouseEnter={() => setIsHovered(index + 100)}
                    onMouseLeave={() => setIsHovered(null)}
                    onClick={() => {
                      if (resource.title === "Interactive Video Lessons") {
                        navigate('/adults/videos');
                      } else if (resource.title === "AI-Powered Practice") {
                        navigate('/adults/ai-practice');
                      }
                    }}
                  >
                    <CardContent className="p-6 relative overflow-hidden">
                      <div className={cn(
                        "absolute top-0 right-0 w-20 h-20 rounded-full -mr-6 -mt-6 transition-all duration-500 bg-gradient-to-r opacity-20",
                        resource.color,
                        isHovered === index + 100 ? "opacity-30 scale-150" : ""
                      )}></div>
                      
                      <div className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-white relative z-10 transition-transform duration-300 bg-gradient-to-r shadow-lg",
                        resource.color,
                        isHovered === index + 100 && "scale-110"
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      <h4 className="font-semibold text-white mb-3 text-lg">{resource.title}</h4>
                      <p className="text-sm text-cyan-100/70 mb-4 leading-relaxed">{resource.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-300 border-purple-400/30">
                          {resource.count}
                        </Badge>
                        {(resource.title === "Interactive Video Lessons" || resource.title === "AI-Powered Practice") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-cyan-300 hover:text-cyan-300 hover:bg-transparent p-0 h-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (resource.title === "Interactive Video Lessons") {
                                navigate('/adults/videos');
                              } else if (resource.title === "AI-Powered Practice") {
                                navigate('/adults/ai-practice');
                              }
                            }}
                          >
                            Explore <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Quick Practice Sessions */}
          <div className="mb-8 sm:mb-10 md:mb-12">
            <div className="mb-6 sm:mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Quick Practice Sessions</h2>
                <p className="text-sm sm:text-base text-cyan-100/70">Short, focused exercises for busy professionals</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Card
                    key={index}
                    className="group cursor-pointer bg-slate-900/60 backdrop-blur-xl border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 space-card-enter focus-within:ring-2 focus-within:ring-purple-400 focus-within:ring-offset-2 focus-within:ring-offset-slate-900"
                    onClick={() => navigate(`/adults/practice/${action.sessionType}`)}
                    onMouseEnter={() => setIsHovered(index)}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                    <CardContent className="p-6 relative overflow-hidden">
                      <div className={cn(
                        "absolute top-0 right-0 w-20 h-20 rounded-full -mr-6 -mt-6 transition-all duration-500 bg-gradient-to-r opacity-20",
                        action.color,
                        isHovered === index ? "opacity-30 scale-150" : ""
                      )}></div>
                      
                      <div className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-white relative z-10 transition-transform duration-300 bg-gradient-to-r shadow-lg",
                        action.color,
                        isHovered === index && "scale-110"
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      <h4 className="font-semibold text-white mb-3 text-lg">{action.title}</h4>
                      <p className="text-sm text-cyan-100/70 mb-6 leading-relaxed">{action.description}</p>
                      
                      <div className="flex items-center justify-between text-sm text-cyan-100/60 mb-4">
                        <span>{action.time}</span>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs bg-slate-700/50 text-cyan-200 border-cyan-500/30">
                            {action.level}
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-300 border-purple-400/30">
                            {action.difficulty}
                          </Badge>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-purple-400/30 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400/50 transition-all duration-300 focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/adults/practice/${action.sessionType}`);
                        }}
                      >
                        <Play className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                        Start Session
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Professional Learning Paths */}
          <div className="mb-8 sm:mb-10 md:mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
              <div className="mb-2 sm:mb-0">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Professional Learning Paths</h2>
                <p className="text-sm sm:text-base text-cyan-100/70">Structured programs for career advancement and professional development</p>
              </div>
              <Button variant="outline" size="sm" className="w-full sm:w-auto border-purple-400/30 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400/50 transition-colors focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-900">
                <BarChart3 className="w-4 h-4 mr-2" />
                View All Programs
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {learningPaths.map((path, index) => {
                const Icon = path.icon;
                return (
                  <Card
                    key={index}
                    className="group cursor-pointer bg-slate-900/60 backdrop-blur-xl border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 overflow-hidden"
                    onMouseEnter={() => setIsHovered(index + 200)}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                    <CardContent className="p-0">
                      <div className="p-8">
                        <div className="flex items-start justify-between mb-6">
                          <div className={cn("p-4 rounded-xl text-white bg-gradient-to-r shadow-lg", path.color)}>
                            <Icon className="w-7 h-7" />
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                              {path.level}
                            </Badge>
                            <div className="flex items-center gap-1 text-amber-400">
                              <Star className="w-4 h-4 fill-amber-400" />
                              <span className="text-sm font-medium">{path.stars}</span>
                            </div>
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-3">{path.title}</h3>
                        <p className="text-cyan-100/70 mb-6 leading-relaxed">{path.description}</p>

                        <div className="flex items-center gap-4 text-sm text-cyan-100/60 mb-6">
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {path.duration}
                          </span>
                          <span className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            {path.lessons} modules
                          </span>
                        </div>

                        <div className="space-y-3 mb-6">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-cyan-100/70">Progress</span>
                            <span className="font-medium text-white">{path.progress}% Complete</span>
                          </div>
                          <Progress value={path.progress} className="h-2 bg-slate-700/50">
                            <div className={cn("h-full rounded-full bg-gradient-to-r", path.gradient)} />
                          </Progress>
                        </div>

                        <div className="flex gap-2">
                          {path.skills.map((skill, i) => (
                            <Badge key={i} variant="outline" className="text-xs bg-slate-700/50 text-cyan-200 border-cyan-500/30">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="bg-slate-800/40 backdrop-blur-sm px-8 py-6 border-t border-purple-500/20">
                        <Button className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/30 focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900">
                          Continue Program
                          <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Recent Activity & Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {/* Recent Activity */}
            <Card className="bg-slate-900/60 backdrop-blur-xl border-purple-500/30 shadow-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/40 backdrop-blur-sm border border-purple-500/20 transition-colors duration-200 hover:bg-slate-800/60 hover:border-purple-400/50">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        activity.action === 'Completed' ? "bg-emerald-500/30 text-emerald-400 border border-emerald-400/30" :
                          activity.action === 'Started' ? "bg-cyan-500/30 text-cyan-400 border border-cyan-400/30" :
                            "bg-purple-500/30 text-purple-400 border border-purple-400/30"
                      )}>
                        {activity.action === 'Completed' && <CheckCircle className="w-5 h-5" />}
                        {activity.action === 'Started' && <Play className="w-5 h-5" />}
                        {activity.action === 'Practiced' && <Mic className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-white">{activity.lesson}</span>
                          {activity.score && (
                            <Badge variant="secondary" className={cn(
                              "text-xs font-medium",
                              getScoreColor(activity.score).includes('emerald') ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30" :
                              getScoreColor(activity.score).includes('cyan') ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/30" :
                              "bg-amber-500/20 text-amber-300 border-amber-400/30"
                            )}>
                              {activity.score}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-cyan-100/60">{activity.action} • {activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommended Next Steps */}
            <Card className="bg-gradient-to-br from-cyan-500/20 via-purple-500/30 to-pink-500/20 backdrop-blur-xl border-purple-400/50 text-white shadow-2xl overflow-hidden">
              <CardContent className="p-4 sm:p-6 md:p-8 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                
                <div className="relative z-10 text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 backdrop-blur-sm">
                    <ThumbsUp className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">Continue Your Progress</h3>
                  <p className="text-cyan-100 text-sm sm:text-base md:text-lg mb-4 sm:mb-6 leading-relaxed">
                    Based on your learning pattern, we recommend advancing with professional communication skills
                  </p>

                  <div className="bg-white/10 rounded-2xl p-6 mb-6 backdrop-blur-sm border border-white/20">
                    <h4 className="font-bold text-lg mb-3 text-white">Business Meeting Mastery</h4>
                    <p className="text-cyan-100 text-sm mb-4 leading-relaxed">
                      Develop executive communication skills for professional meetings and presentations
                    </p>
                    <div className="flex items-center justify-between text-sm text-cyan-200">
                      <span>Intermediate Level</span>
                      <span>25-30 minutes</span>
                    </div>
                  </div>

                  <Button className="w-full bg-white text-purple-600 hover:bg-cyan-50 font-semibold py-3 text-base transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900">
                    <Play className="w-5 h-5 mr-2" />
                    Start Recommended Module
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdultsPage;
