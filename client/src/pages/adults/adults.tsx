import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Play, Target, Award, BookOpen, MessageCircle,
  Mic, Volume2, CheckCircle, TrendingUp, Zap, Lightbulb, Crown, BarChart3,
  Clock, ThumbsUp, Shield, Rocket,
  ArrowRight, GraduationCap, Brain, Languages, Star, Sparkles, Globe,
  Flame, Calendar, Trophy, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  CommonLessonsLibrary,
  WeeklyChallenges,
  LearningGoals,
  PersonalizedRecommendations,
  SpacedRepetition,
  MicrolearningModules,
  ProgressAnalytics
} from '@/components/adults';
import { AdultsAPI } from '@/services/ApiService';
import { useAuth } from '@/contexts/AuthContext';

const AdultsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [progress, setProgress] = useState(42);
  const [streak, setStreak] = useState(7);
  const [fluencyScore, setFluencyScore] = useState(65);
  const [isHovered, setIsHovered] = useState<number | null>(null);
  const [stars, setStars] = useState<Array<{ x: number; y: number; size: number; delay: number; opacity: number }>>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dailyConversationProgress, setDailyConversationProgress] = useState<any>(null);

  // Generate animated stars with varying opacity - Performance optimized
  useEffect(() => {
    const generateStars = () => {
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
    
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if ((isMobile && stars.length > 100) || (!isMobile && stars.length < 150)) {
        generateStars();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
    loadDailyConversationProgress();
  }, [user]);

  // Load daily conversation progress from localStorage
  const loadDailyConversationProgress = () => {
    try {
      const progress = JSON.parse(
        localStorage.getItem('dailyConversationProgress') || '{}'
      );
      setDailyConversationProgress(progress);
    } catch (error) {
      console.error('Error loading daily conversation progress:', error);
      setDailyConversationProgress({});
    }
  };

  // Listen for storage changes to update progress in real-time
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dailyConversationProgress') {
        loadDailyConversationProgress();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (for same-tab updates)
    const handleCustomStorage = () => {
      loadDailyConversationProgress();
    };
    window.addEventListener('dailyConversationProgressUpdated', handleCustomStorage);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dailyConversationProgressUpdated', handleCustomStorage);
    };
  }, []);

  const loadDashboardData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await AdultsAPI.getDashboard();
      if (result.success && 'data' in result) {
        setDashboardData(result.data?.dashboard);
        
        // Update progress from dashboard
        if (result.data?.dashboard?.progress_summary) {
          const summary = result.data.dashboard.progress_summary;
          const totalProgress = Object.values(summary).reduce((acc: number, cat: any) => {
            return acc + (cat?.progress_percentage || 0);
          }, 0) / Object.keys(summary).length;
          setProgress(Math.round(totalProgress));
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Page load fade-in
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
      progress: dashboardData?.progress_summary?.adults_beginner?.progress_percentage || 65,
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
      progress: dashboardData?.progress_summary?.adults_intermediate?.progress_percentage || 30,
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
      progress: dashboardData?.progress_summary?.adults_advanced?.progress_percentage || 15,
      lessons: 24,
      skills: ['Executive Communication', 'Native Expressions', 'Strategic Dialogue'],
      duration: '8-12 weeks',
      constellation: 'Pegasus',
      planetImage: '/planets/Yo4hcrPNqAQh1DJiOgz3TH1rI.avif'
    }
  ];

  // Calculate total points from all daily conversation topics
  const getDailyConversationPoints = () => {
    if (!dailyConversationProgress) return 0;
    let totalPoints = 0;
    Object.values(dailyConversationProgress).forEach((topic: any) => {
      if (topic && topic.scenario1 && topic.scenario2) {
        totalPoints += (topic.scenario1.points || 0) + (topic.scenario2.points || 0);
      }
    });
    return totalPoints;
  };

  // Check if any topic is enrolled
  const hasAnyEnrolledTopic = () => {
    if (!dailyConversationProgress) return false;
    return Object.values(dailyConversationProgress).some((topic: any) => topic?.enrolled === true);
  };

  // Get overall progress across all topics
  const getOverallProgress = () => {
    if (!dailyConversationProgress) return null;
    const topics = Object.values(dailyConversationProgress).filter((topic: any) => topic?.average !== undefined);
    if (topics.length === 0) return null;
    const totalAverage = topics.reduce((sum: number, topic: any) => sum + (topic.average || 0), 0);
    return Math.round(totalAverage / topics.length);
  };

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
      value: dashboardData?.progress_summary?.adults_beginner?.vocabulary_words || "428",
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
      label: "Daily Conversation Points",
      value: getDailyConversationPoints().toString(),
      icon: Trophy,
      color: "text-amber-400",
      glowColor: "rgba(245, 158, 11, 0.2)",
      description: "Points earned from practice"
    },
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

          {/* Quick Stats Dashboard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={index}
                  className="bg-slate-900/60 backdrop-blur-xl border-purple-500/30 hover:border-purple-400/50 transition-all duration-300"
                >
                  <CardContent className="p-4 sm:p-5">
                    <div className={cn("p-2 sm:p-3 rounded-lg mb-2 sm:mb-3 w-fit", stat.color)} style={{ backgroundColor: stat.glowColor }}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-cyan-100/70">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Level Cards - Simplified */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {levels.map((level, index) => {
              const Icon = level.icon;
              return (
                <Card 
                  key={level.id}
                  className={cn(
                    "group relative bg-slate-900/60 backdrop-blur-xl border-purple-500/30 hover:border-purple-400/50 transition-all duration-500 shadow-2xl overflow-hidden space-card-enter"
                  )}
                  onMouseEnter={() => setIsHovered(index)}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <div className="absolute -bottom-10 -right-10 sm:-bottom-16 sm:-right-16 w-32 h-32 sm:w-48 sm:h-48 opacity-20 sm:opacity-25 group-hover:opacity-40 transition-opacity duration-500">
                    <img 
                      src={level.planetImage}
                      alt={`${level.label} planet`}
                      className="w-full h-full rounded-full object-cover"
                      style={{ filter: 'grayscale(0.4) brightness(0.7)' }}
                    />
                  </div>

                  <CardContent className="p-4 sm:p-6 relative z-10">
                    <div className={cn("p-3 rounded-xl text-white bg-gradient-to-r shadow-lg mb-4 w-fit", level.color)}>
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl sm:text-2xl font-bold text-white">{level.label}</h3>
                      <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-400/30 text-xs">
                        {level.constellation}
                      </Badge>
                    </div>
                    <p className="text-sm text-cyan-100/70 mb-4">{level.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-cyan-100/70">Progress</span>
                        <span className="font-semibold text-white">{level.progress}%</span>
                      </div>
                      <Progress value={level.progress} className="h-2 bg-slate-700/50">
                        <div className={cn("h-full rounded-full bg-gradient-to-r", level.color)} />
                      </Progress>
                    </div>

                    <Link to={`/adults/${level.id}`}>
                      <Button className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold transition-all duration-300">
                        Explore Level
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Personalized Recommendations - Prominent */}
          <div className="mb-8 sm:mb-10 md:mb-12">
            <PersonalizedRecommendations />
          </div>

          {/* Main Content Tabs - All Features Organized */}
          <div className="mb-8 sm:mb-10 md:mb-12">
            <Tabs defaultValue="practice" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 bg-slate-900/60 border-purple-500/30 mb-6 h-auto">
                <TabsTrigger value="practice" className="text-xs sm:text-sm data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 py-2 sm:py-3">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Quick Practice</span>
                  <span className="sm:hidden">Practice</span>
                </TabsTrigger>
                <TabsTrigger value="lessons" className="text-xs sm:text-sm data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 py-2 sm:py-3">
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Common Lessons</span>
                  <span className="sm:hidden">Lessons</span>
                </TabsTrigger>
                <TabsTrigger value="challenges" className="text-xs sm:text-sm data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 py-2 sm:py-3">
                  <Trophy className="w-4 h-4 mr-2" />
                  Challenges
                </TabsTrigger>
                <TabsTrigger value="goals" className="text-xs sm:text-sm data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 py-2 sm:py-3">
                  <Target className="w-4 h-4 mr-2" />
                  Goals
                </TabsTrigger>
                <TabsTrigger value="review" className="text-xs sm:text-sm data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 py-2 sm:py-3">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Review
                </TabsTrigger>
                <TabsTrigger value="analytics" className="text-xs sm:text-sm data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 py-2 sm:py-3">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              {/* Quick Practice Tab - Combined Daily Conversation + Microlearning */}
              <TabsContent value="practice" className="mt-0">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Quick Practice Sessions</h2>
                    <p className="text-xs sm:text-sm text-cyan-100/70 mb-4 sm:mb-6">Short, focused exercises for busy professionals</p>
                </div>

                  {/* Daily Conversation - Prominent */}
                  <Card className="bg-gradient-to-br from-cyan-500/20 via-purple-500/30 to-pink-500/20 backdrop-blur-xl border-purple-400/50 shadow-2xl relative">
                    {/* Enrolled/Completed Badge - Show if any topic is enrolled */}
                    {hasAnyEnrolledTopic() && (
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                        <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 shadow-lg px-2 sm:px-3 py-1 text-xs sm:text-sm">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Enrolled
                        </Badge>
                      </div>
                    )}
                    <CardContent className="p-4 sm:p-6 md:p-8">
                      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                        <div className={cn("p-4 sm:p-6 rounded-2xl text-white bg-gradient-to-r shadow-lg flex-shrink-0", "from-cyan-500 to-blue-600")}>
                          <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
                        </div>
                        <div className="flex-1 text-center sm:text-left w-full">
                          <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                            <h3 className="text-xl sm:text-2xl font-bold text-white">Daily Conversation</h3>
                            {getOverallProgress() !== null && (
                              <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-400/50 text-xs">
                                {getOverallProgress()}% Complete
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm sm:text-base text-cyan-100/80 mb-3 sm:mb-4">
                            Practice professional speaking about everyday topics with AI-powered feedback
                          </p>
                          {/* Progress Display - Show if any topic has progress */}
                          {getOverallProgress() !== null && (
                            <div className="mb-3 sm:mb-4 space-y-2">
                              <div className="flex items-center justify-between text-xs sm:text-sm text-cyan-200/70 mb-1">
                                <span>Overall Progress</span>
                                <span className="font-semibold">{getOverallProgress()}%</span>
                              </div>
                              <Progress 
                                value={getOverallProgress() || 0} 
                                className="h-2 bg-slate-700/50"
                              />
                              {/* Enrolled Topics Summary */}
                              {dailyConversationProgress && Object.keys(dailyConversationProgress).length > 0 && (
                                <div className="flex flex-wrap gap-2 text-xs text-cyan-200/60 mb-2">
                                  {Object.entries(dailyConversationProgress).map(([topicId, topic]: [string, any]) => {
                                    if (topic?.enrolled) {
                                      const topicName = topicId === 'greetings' ? 'Greetings' : 
                                                       topicId === 'work' ? 'Work & Professional' : topicId;
                                      return (
                                        <Badge key={topicId} variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs">
                                          {topicName}
                                        </Badge>
                                      );
                                    }
                                    return null;
                                  })}
                                </div>
                              )}
                              {/* Points Display */}
                              {getDailyConversationPoints() > 0 && (
                                <div className="flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/30 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-amber-400" />
                                    <span className="text-xs sm:text-sm text-amber-200 font-medium">Total Points</span>
                                  </div>
                                  <span className="text-base sm:text-lg font-bold text-amber-300">
                                    {getDailyConversationPoints()}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 mb-3 sm:mb-4">
                            <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-400/30 text-xs">
                              All Levels
                            </Badge>
                      </div>
                          <Button
                            size="default"
                            className="w-full sm:w-auto bg-white text-purple-600 hover:bg-cyan-50 font-semibold text-sm sm:text-base"
                            onClick={() => navigate('/adults/practice/daily-conversation')}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {hasAnyEnrolledTopic() ? 'Continue Practice' : 'Start Daily Conversation'}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Microlearning Modules */}
              <div>
        
                    <MicrolearningModules />
              </div>
            </div>
              </TabsContent>

              <TabsContent value="lessons" className="mt-0">
                <CommonLessonsLibrary />
              </TabsContent>

              <TabsContent value="challenges" className="mt-0">
                <WeeklyChallenges />
              </TabsContent>

              <TabsContent value="goals" className="mt-0">
                <LearningGoals />
              </TabsContent>

              <TabsContent value="review" className="mt-0">
                <SpacedRepetition />
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <ProgressAnalytics />
              </TabsContent>
            </Tabs>
          </div>

          {/* Video Lessons - Separate Prominent Section */}
          <div className="mb-8 sm:mb-10 md:mb-12">
            <Card className="bg-slate-900/60 backdrop-blur-xl border-purple-500/30 shadow-2xl overflow-hidden">
                    <CardContent className="p-0">
                <div className={cn("h-auto min-h-[200px] sm:min-h-[240px] md:min-h-[280px] py-6 sm:py-8 md:py-10 bg-gradient-to-r flex items-center justify-center relative overflow-hidden", "from-cyan-500 via-purple-500 to-pink-500")}>
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative z-10 text-center px-4 sm:px-6 md:px-8 w-full max-w-4xl mx-auto">
                    <Play className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 mx-auto mb-3 sm:mb-4 text-white" />
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 px-2">
                      Interactive Video Lessons
                    </h2>
                    <p className="text-cyan-100/90 text-xs sm:text-sm md:text-base max-w-2xl mx-auto mb-4 sm:mb-5 md:mb-6 px-2 leading-relaxed">
                      Engage with native speakers in real-world scenarios. Practice pronunciation, learn idioms, and master professional communication.
                    </p>
                    <Button
                      size="default"
                      className="bg-white text-purple-600 hover:bg-cyan-50 font-semibold text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-2.5"
                      onClick={() => navigate('/adults/videos')}
                    >
                      Explore 150+ Video Lessons
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                    </Button>
                  </div>
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
