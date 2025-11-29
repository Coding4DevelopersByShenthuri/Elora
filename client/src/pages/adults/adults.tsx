import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Play, Target, Award, BookOpen, MessageCircle,
  Mic, Volume2, CheckCircle, TrendingUp, Zap, Lightbulb, Crown, BarChart3,
  Clock, ThumbsUp, Shield, Rocket,
  ArrowRight, GraduationCap, Brain, Languages, Star, Sparkles, Globe,
  Flame, Calendar, Trophy, RefreshCw, FileText, Layers,
  Speech, BookMarked, Flame as FireIcon, Gem, Headphones, PenTool, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  ProgressAnalytics,
  QuickAccessToolbar,
  DictionaryWidget,
  DailyGoalsWidget,
  BusinessEmailCoach,
  PronunciationAnalyzer,
  CulturalIntelligence
} from '@/components/adults';
import { AdultsAPI } from '@/services/ApiService';
import { useAuth } from '@/contexts/AuthContext';
import { allMultiModeModules, getTotalModulesByMode, getModuleById } from '@/data/multi-mode-modules-config';
import { logger } from '@/utils/logger';

const AdultsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [progress, setProgress] = useState(42);
  const [streak, setStreak] = useState(7);
  const [fluencyScore, setFluencyScore] = useState(65);
  const [isHovered, setIsHovered] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dailyConversationProgress, setDailyConversationProgress] = useState<any>(null);
  const [activeWidget, setActiveWidget] = useState<string | null>(null);
  const [multiModeProgress, setMultiModeProgress] = useState<any>(null);
  const [enrolledModules, setEnrolledModules] = useState<Set<string>>(new Set());


  // Load dashboard data
  useEffect(() => {
    // Only load data if user is authenticated and has a valid token
    const token = localStorage.getItem('speakbee_auth_token');
    if (!user || !token || token === 'local-token') {
      setLoading(false);
      return;
    }
    
    loadDashboardData();
    loadDailyConversationProgress();
    loadMultiModeProgress();
    loadEnrolledModules();
  }, [user]);

  // Load Multi-Mode Practice progress
  const loadMultiModeProgress = async () => {
    if (!user) return;
    
    // Check for valid token before making API call
    const token = localStorage.getItem('speakbee_auth_token');
    if (!token || token === 'local-token') {
      return;
    }
    
    try {
      const result = await AdultsAPI.getMultiModePracticeHistory();
      if (result.success && 'data' in result && result.data?.data) {
        const sessions = result.data.data || [];
        const totalPoints = sessions.reduce((sum: number, s: any) => sum + (s.points_earned || 0), 0);
        const totalSessions = sessions.length;
        const avgScore = sessions.length > 0 
          ? sessions.reduce((sum: number, s: any) => sum + (s.score || 0), 0) / sessions.length 
          : 0;
        
        // Track completed modules
        // A module is considered completed if:
        // 1. It has a completed session (completed_at is not null)
        // 2. The session has a score > 0 (user actually completed exercises)
        // 3. It has content_id (is a module, not just a mode practice)
        const completedModules = new Set<string>();
        sessions.forEach((session: any) => {
          if (session.completed_at && session.score > 0 && session.content_id) {
            // For listening modules, use content_id
            // For other modes, this will work when modules are added
            completedModules.add(session.content_id);
          }
        });
        
        setMultiModeProgress({
          totalPoints,
          totalSessions,
          avgScore: Math.round(avgScore),
          sessions,
          completedModules: Array.from(completedModules)
        });
      }
    } catch (error) {
      logger.error('Failed to load multi-mode progress:', error);
    }
  };

  // Load enrolled modules
  const loadEnrolledModules = () => {
    if (!user) return;
    const stored = localStorage.getItem(`enrolled_modules_${user.id}`);
    if (stored) {
      setEnrolledModules(new Set(JSON.parse(stored)));
    }
  };

  // Load daily conversation progress from localStorage
  const loadDailyConversationProgress = () => {
    try {
      const progress = JSON.parse(
        localStorage.getItem('dailyConversationProgress') || '{}'
      );
      setDailyConversationProgress(progress);
    } catch (error) {
      logger.error('Error loading daily conversation progress:', error);
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
    
    // Listen for Multi-Mode Practice updates
    const handleMultiModeUpdate = () => {
      loadMultiModeProgress();
      loadEnrolledModules();
    };
    window.addEventListener('multiModeProgressUpdated', handleMultiModeUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dailyConversationProgressUpdated', handleCustomStorage);
      window.removeEventListener('multiModeProgressUpdated', handleMultiModeUpdate);
    };
  }, []);

  const loadDashboardData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    // Check for valid token before making API call
    const token = localStorage.getItem('speakbee_auth_token');
    if (!token || token === 'local-token') {
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
        
        // Update streak from dashboard
        if (result.data?.dashboard?.current_streak !== undefined) {
          setStreak(result.data.dashboard.current_streak);
        }
      }
    } catch (error) {
      logger.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Page load fade-in
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const levels = [
    {
      id: 'beginners',
      label: 'Foundation Level',
      icon: GraduationCap,
      color: 'from-blue-500 via-cyan-500 to-teal-500',
      glowColor: 'rgba(59, 130, 246, 0.3)',
      description: 'Build essential communication skills for everyday situations',
      progress: dashboardData?.progress_summary?.adults_beginner?.progress_percentage || 65,
      lessons: 12,
      skills: ['Core Grammar', 'Essential Vocabulary', 'Daily Conversations'],
      duration: '4-6 weeks'
    },
    {
      id: 'intermediates',
      label: 'Intermediate Level',
      icon: Target,
      color: 'from-emerald-500 via-green-500 to-teal-500',
      glowColor: 'rgba(16, 185, 129, 0.3)',
      description: 'Develop professional communication and complex discussions',
      progress: dashboardData?.progress_summary?.adults_intermediate?.progress_percentage || 30,
      lessons: 18,
      skills: ['Advanced Grammar', 'Professional Communication', 'Cultural Context'],
      duration: '6-8 weeks'
    },
    {
      id: 'advanced',
      label: 'Advanced Level',
      icon: Award,
      color: 'from-purple-500 via-indigo-500 to-blue-500',
      glowColor: 'rgba(168, 85, 247, 0.3)',
      description: 'Master English for professional excellence and leadership',
      progress: dashboardData?.progress_summary?.adults_advanced?.progress_percentage || 15,
      lessons: 24,
      skills: ['Executive Communication', 'Native Expressions', 'Strategic Dialogue'],
      duration: '8-12 weeks'
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

  // Calculate total points from all enrolled components
  const getAllOverPoints = () => {
    let total = 0;
    
    // Daily Conversation points
    total += getDailyConversationPoints();
    
    // Multi-Mode Practice points
    if (multiModeProgress) {
      total += multiModeProgress.totalPoints || 0;
    }
    
    // Add other component points here as needed
    
    return total;
  };

  // Get Multi-Mode Practice progress percentage
  const getMultiModeProgress = () => {
    // Get total modules across all modes
    const totalModules = getTotalModulesByMode();
    
    if (totalModules.total === 0) return null;
    
    // Count completed modules (modules with at least one completed session)
    const completedModulesCount = multiModeProgress?.completedModules?.length || 0;
    
    // Calculate progress: (completed modules / total modules) * 100
    const progress = Math.round((completedModulesCount / totalModules.total) * 100);
    
    return Math.min(100, Math.max(0, progress));
  };

  // Get progress breakdown by mode
  const getProgressByMode = () => {
    const totalModules = getTotalModulesByMode();
    const completedModules = multiModeProgress?.completedModules || [];
    
    const breakdown = {
      listening: {
        total: totalModules.listening,
        completed: completedModules.filter((id: string) => {
          const module = getModuleById(id);
          return module?.mode === 'listening';
        }).length,
        progress: totalModules.listening > 0 
          ? Math.round((completedModules.filter((id: string) => {
              const module = getModuleById(id);
              return module?.mode === 'listening';
            }).length / totalModules.listening) * 100)
          : 0
      },
      speaking: {
        total: totalModules.speaking,
        completed: completedModules.filter((id: string) => {
          const module = getModuleById(id);
          return module?.mode === 'speaking';
        }).length,
        progress: totalModules.speaking > 0 
          ? Math.round((completedModules.filter((id: string) => {
              const module = getModuleById(id);
              return module?.mode === 'speaking';
            }).length / totalModules.speaking) * 100)
          : 0
      },
      reading: {
        total: totalModules.reading,
        completed: completedModules.filter((id: string) => {
          const module = getModuleById(id);
          return module?.mode === 'reading';
        }).length,
        progress: totalModules.reading > 0 
          ? Math.round((completedModules.filter((id: string) => {
              const module = getModuleById(id);
              return module?.mode === 'reading';
            }).length / totalModules.reading) * 100)
          : 0
      },
      writing: {
        total: totalModules.writing,
        completed: completedModules.filter((id: string) => {
          const module = getModuleById(id);
          return module?.mode === 'writing';
        }).length,
        progress: totalModules.writing > 0 
          ? Math.round((completedModules.filter((id: string) => {
              const module = getModuleById(id);
              return module?.mode === 'writing';
            }).length / totalModules.writing) * 100)
          : 0
      }
    };
    
    return breakdown;
  };

  const getEnrolledSummaryByMode = () => {
    const summary = {
      listening: 0,
      speaking: 0,
      reading: 0,
      writing: 0,
    };

    enrolledModules.forEach((moduleId) => {
      const module = getModuleById(moduleId);
      if (module) {
        summary[module.mode]++;
      }
    });

    return summary;
  };

  // Check if any topic is enrolled
  const hasAnyEnrolledTopic = () => {
    if (!dailyConversationProgress) return false;
    return Object.values(dailyConversationProgress).some((topic: any) => topic?.enrolled === true);
  };

const getDailyConversationEnrollmentCount = () => {
  if (!dailyConversationProgress) return 0;
  return Object.values(dailyConversationProgress).filter((topic: any) => topic?.enrolled).length;
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
      icon: Speech,
      color: "text-blue-500",
      bgColor: "bg-blue-500/20",
      glowColor: "rgba(59, 130, 246, 0.2)",
      description: "Professional speaking fluency"
    },
    {
      label: "Vocabulary Mastered",
      value: dashboardData?.progress_summary?.adults_beginner?.vocabulary_words || "428",
      icon: BookMarked,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/20",
      glowColor: "rgba(16, 185, 129, 0.2)",
      description: "Active professional vocabulary"
    },
    {
      label: "Learning Consistency",
      value: `${streak} days`,
      icon: FireIcon,
      color: "text-orange-500",
      bgColor: "bg-orange-500/20",
      glowColor: "rgba(249, 115, 22, 0.2)",
      description: "Daily practice streak"
    },
    {
      label: "All over points",
      value: getAllOverPoints().toString(),
      icon: Gem,
      color: "text-purple-500",
      bgColor: "bg-purple-500/20",
      glowColor: "rgba(168, 85, 247, 0.2)",
      description: "Total points from all practice activities"
    },
  ];

const dailyConversationEnrolledCount = getDailyConversationEnrollmentCount();

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500';
    if (score >= 80) return 'text-green-500';
    if (score >= 70) return 'text-teal-500';
    return 'text-emerald-600';
  };

  const handleToolbarClick = (tool: string) => {
    setActiveWidget(tool);
  };

  const handleCloseWidget = () => {
    setActiveWidget(null);
  };

  const renderWidget = () => {
    switch (activeWidget) {
      case 'dictionary':
        return <DictionaryWidget onClose={handleCloseWidget} />;
      case 'cultural':
        return <CulturalIntelligence onClose={handleCloseWidget} />;
      case 'pronunciation':
        return <PronunciationAnalyzer onClose={handleCloseWidget} />;
      default:
        return null;
    }
  };

  return (
    <div className={`relative overflow-hidden min-h-screen ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
      {/* Background Elements - Same as Home Page */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] rounded-full bg-accent/10 blur-3xl -z-10"></div>

      {/* Quick Access Toolbar */}
      {user && <QuickAccessToolbar onToolClick={handleToolbarClick} />}

      {/* Widget Modals */}
      {activeWidget && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleCloseWidget}
        >
          <div 
            className="w-full max-w-6xl max-h-[90vh] flex items-center justify-center animate-in fade-in-0 zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {renderWidget()}
          </div>
        </div>
      )}

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 pt-24 pb-16 space-y-10">
        <section>
          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#10b981] text-white shadow-xl dark:from-[#022c22] dark:via-[#065f46] dark:to-[#059669]">
            <span className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden />
            <span className="absolute -left-28 bottom-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" aria-hidden />
            <CardHeader className="space-y-3 py-4 sm:py-5 md:py-6 relative z-10">
              <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2 sm:space-y-3 lg:max-w-2xl">
                  <Badge className="bg-white/25 text-white uppercase tracking-wide text-xs sm:text-sm px-2 py-0.5 sm:px-3 sm:py-1">
                    Professional Learners (Adults)
                  </Badge>
                  <CardTitle className="text-xl sm:text-2xl md:text-3xl font-semibold text-white leading-tight">
                    Comprehensive lessons, interactive practice, and professional development for career advancement
                  </CardTitle>
                  <CardDescription className="text-white/85 text-sm sm:text-base leading-relaxed">
                    Master English communication skills with personalized learning paths, AI-powered feedback, and real-world business scenarios designed for professionals and executives.
                  </CardDescription>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
                    <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs hover:bg-white/25">
                      <Target className="w-3 h-3 mr-1" />
                      Career-Focused
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs hover:bg-white/25">
                      <Clock className="w-3 h-3 mr-1" />
                      Flexible Learning
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs hover:bg-white/25">
                      <Shield className="w-3 h-3 mr-1" />
                      Professional Curriculum
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs hover:bg-white/25">
                      <Rocket className="w-3 h-3 mr-1" />
                      Accelerated Progress
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </section>

          {/* Quick Stats Dashboard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={index}
                  className="bg-card/80 backdrop-blur-xl border-primary/30 hover:border-primary/50 transition-all duration-300 dark:bg-slate-900/60 dark:border-emerald-500/30 dark:hover:border-emerald-400/50"
                >
                  <CardContent className="p-4 sm:p-5">
                    <div className={cn("p-2 sm:p-3 rounded-lg mb-2 sm:mb-3 w-fit", stat.bgColor, stat.color)}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-1 dark:text-white">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Level Cards - Simplified */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {levels.map((level, index) => {
              const Icon = level.icon;
              return (
                <Card 
                  key={level.id}
                  className={cn(
                    "group relative bg-card/80 backdrop-blur-xl border-primary/30 hover:border-primary/50 transition-all duration-500 shadow-2xl overflow-hidden dark:bg-slate-900/60 dark:border-emerald-500/30 dark:hover:border-emerald-400/50"
                  )}
                  onMouseEnter={() => setIsHovered(index)}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <CardContent className="p-4 sm:p-6 relative z-10">
                    <div className={cn("p-3 rounded-xl text-white bg-gradient-to-r shadow-lg mb-4 w-fit", level.color)}>
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white">{level.label}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 dark:text-cyan-100/70">{level.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground dark:text-cyan-100/70">Progress</span>
                        <span className="font-semibold text-foreground dark:text-white">{level.progress}%</span>
                      </div>
                      <Progress value={level.progress} className="h-2 bg-muted dark:bg-slate-700/50">
                        <div className={cn("h-full rounded-full bg-gradient-to-r", level.color)} />
                      </Progress>
                    </div>

                    <Link to={`/adults/${level.id}`}>
                      <Button className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 text-white font-semibold transition-all duration-300 dark:from-emerald-500 dark:via-green-500 dark:to-teal-500 dark:hover:from-emerald-600 dark:hover:via-green-600 dark:hover:to-teal-600">
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
          <div>
            <PersonalizedRecommendations />
          </div>

          {/* Main Content Tabs - All Features Organized */}
          <div>
            <Tabs defaultValue="practice" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 bg-card/80 border-primary/30 mb-6 h-auto dark:bg-slate-900/60 dark:border-emerald-500/30">
                <TabsTrigger value="practice" className="text-xs sm:text-sm data-[state=active]:bg-primary/20 data-[state=active]:text-primary py-2 sm:py-3 dark:data-[state=active]:bg-emerald-500/20 dark:data-[state=active]:text-emerald-300">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Quick Practice</span>
                  <span className="sm:hidden">Practice</span>
                </TabsTrigger>
                <TabsTrigger value="lessons" className="text-xs sm:text-sm data-[state=active]:bg-primary/20 data-[state=active]:text-primary py-2 sm:py-3 dark:data-[state=active]:bg-emerald-500/20 dark:data-[state=active]:text-emerald-300">
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Common Lessons</span>
                  <span className="sm:hidden">Lessons</span>
                </TabsTrigger>
                <TabsTrigger value="challenges" className="text-xs sm:text-sm data-[state=active]:bg-primary/20 data-[state=active]:text-primary py-2 sm:py-3 dark:data-[state=active]:bg-emerald-500/20 dark:data-[state=active]:text-emerald-300">
                  <Trophy className="w-4 h-4 mr-2" />
                  Challenges
                </TabsTrigger>
                <TabsTrigger value="goals" className="text-xs sm:text-sm data-[state=active]:bg-primary/20 data-[state=active]:text-primary py-2 sm:py-3 dark:data-[state=active]:bg-emerald-500/20 dark:data-[state=active]:text-emerald-300">
                  <Target className="w-4 h-4 mr-2" />
                  Goals
                </TabsTrigger>
                <TabsTrigger value="review" className="text-xs sm:text-sm data-[state=active]:bg-primary/20 data-[state=active]:text-primary py-2 sm:py-3 dark:data-[state=active]:bg-emerald-500/20 dark:data-[state=active]:text-emerald-300">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Review
                </TabsTrigger>
                <TabsTrigger value="multimode" className="text-xs sm:text-sm data-[state=active]:bg-primary/20 data-[state=active]:text-primary py-2 sm:py-3 dark:data-[state=active]:bg-emerald-500/20 dark:data-[state=active]:text-emerald-300">
                  <Play className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Multi-Mode</span>
                  <span className="sm:hidden">Practice</span>
                </TabsTrigger>
                <TabsTrigger value="email" className="text-xs sm:text-sm data-[state=active]:bg-primary/20 data-[state=active]:text-primary py-2 sm:py-3 dark:data-[state=active]:bg-emerald-500/20 dark:data-[state=active]:text-emerald-300">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Email Coach</span>
                  <span className="sm:hidden">Email</span>
                </TabsTrigger>
                <TabsTrigger value="cultural" className="text-xs sm:text-sm data-[state=active]:bg-primary/20 data-[state=active]:text-primary py-2 sm:py-3 dark:data-[state=active]:bg-emerald-500/20 dark:data-[state=active]:text-emerald-300">
                  <Globe className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Cultural</span>
                  <span className="sm:hidden">Culture</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="text-xs sm:text-sm data-[state=active]:bg-primary/20 data-[state=active]:text-primary py-2 sm:py-3 dark:data-[state=active]:bg-emerald-500/20 dark:data-[state=active]:text-emerald-300">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              {/* Quick Practice Tab - Combined Daily Conversation + Microlearning */}
              <TabsContent value="practice" className="mt-0">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white mb-2">Quick Practice Sessions</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70 mb-4 sm:mb-6">Short, focused exercises for busy professionals</p>
                </div>

                  {/* Multi-Mode Practice */}
                  <Card className="bg-gradient-to-br from-teal-500/20 via-emerald-500/25 to-teal-600/20 backdrop-blur-xl border-teal-400/50 shadow-2xl relative dark:from-teal-500/20 dark:via-emerald-500/25 dark:to-teal-600/20 dark:border-teal-400/50">
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                      <Badge className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-0 shadow-lg px-2 sm:px-3 py-1 text-xs sm:text-sm dark:from-teal-500 dark:to-emerald-600">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Enrolled: {enrolledModules.size}
                      </Badge>
                    </div>
                    <CardContent className="p-4 sm:p-6 md:p-8">
                      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                        <div className="p-4 sm:p-6 rounded-2xl text-white bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 shadow-lg flex-shrink-0">
                          <Layers className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
                        </div>
                        <div className="flex-1 text-center sm:text-left w-full">
                          <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                            <h3 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white">Multi-Mode Practice</h3>
                            {getMultiModeProgress() !== null && (
                              <Badge variant="outline" className="bg-teal-700/95 text-white font-semibold border-teal-600/90 text-xs dark:bg-teal-600/40 dark:text-white dark:border-teal-500/70">
                                {getMultiModeProgress()}% Complete
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm sm:text-base text-muted-foreground dark:text-cyan-100/80 mb-3 sm:mb-4">
                            Practice listening, speaking, reading, and writing skills with comprehensive exercises
                          </p>
                          {/* Mode Eligibility Badges */}
                          {(() => {
                            const summary = getEnrolledSummaryByMode();
                            const badges = [
                              { id: 'listening', label: 'Listening', count: summary.listening, color: 'bg-teal-600/30 text-gray-800 font-semibold border-teal-500/60 dark:bg-teal-500/30 dark:text-white dark:border-teal-400/50' },
                              { id: 'speaking', label: 'Speaking', count: summary.speaking, color: 'bg-emerald-600/30 text-gray-800 font-semibold border-emerald-500/60 dark:bg-emerald-500/30 dark:text-white dark:border-emerald-400/50' },
                              { id: 'reading', label: 'Reading', count: summary.reading, color: 'bg-teal-500/30 text-gray-800 font-semibold border-teal-400/60 dark:bg-teal-400/30 dark:text-white dark:border-teal-300/50' },
                              { id: 'writing', label: 'Writing', count: summary.writing, color: 'bg-teal-700/30 text-gray-900 font-semibold border-teal-600/60 dark:bg-teal-600/30 dark:text-white dark:border-teal-500/50' },
                            ];
                            const hasAny = badges.some(badge => badge.count > 0);
                            if (!hasAny) return null;
                            return (
                              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                                {badges.map((badge) => (
                                  badge.count > 0 && (
                                    <Badge key={badge.id} variant="outline" className={`${badge.color} text-xs sm:text-sm`}>
                                      {badge.label} • {badge.count}
                                    </Badge>
                                  )
                                ))}
                              </div>
                            );
                          })()}
                          {/* Progress Display */}
                          {getMultiModeProgress() !== null && (
                            <div className="mb-3 sm:mb-4 space-y-2">
                              <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground dark:text-cyan-200/70 mb-1">
                                <span>Overall Progress</span>
                                <span className="font-semibold text-foreground dark:text-white">{getMultiModeProgress()}%</span>
                              </div>
                              <Progress 
                                value={getMultiModeProgress() || 0} 
                                className="h-2 bg-muted dark:bg-slate-700/50"
                              />
                              
                              {/* Enrolled Modules Badges */}
                              {enrolledModules.size > 0 && (
                                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground dark:text-cyan-200/60 mb-2">
                                  {Array.from(enrolledModules).map((moduleId) => {
                                    const module = getModuleById(moduleId);
                                    return (
                                      <Badge key={moduleId} variant="outline" className="bg-teal-600/30 text-gray-800 font-semibold border-teal-500/60 text-xs dark:bg-teal-500/30 dark:text-white dark:border-teal-400/50">
                                        {module?.title || moduleId}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              )}
                              {/* Points Display */}
                              {multiModeProgress && multiModeProgress.totalPoints > 0 && (
                                <div className="flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-teal-500/30 to-emerald-500/30 border border-teal-500/60 rounded-lg dark:from-teal-500/30 dark:to-emerald-500/30 dark:border-teal-400/50">
                                  <div className="flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-gray-800 dark:text-white" />
                                    <span className="text-xs sm:text-sm text-gray-800 font-semibold dark:text-white">Total Points</span>
                                  </div>
                                  <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                    {multiModeProgress.totalPoints}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 mb-3 sm:mb-4">
                            <Badge variant="outline" className="bg-teal-600/30 text-gray-800 font-semibold border-teal-500/60 text-xs dark:bg-teal-500/30 dark:text-white dark:border-teal-400/50">
                              All Modes
                            </Badge>
                            <Badge variant="outline" className="bg-emerald-600/30 text-gray-800 font-semibold border-emerald-500/60 text-xs dark:bg-emerald-500/30 dark:text-white dark:border-emerald-400/50">
                              Interactive
                            </Badge>
                          </div>
                          <Button
                            size="default"
                            className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700 font-semibold text-sm sm:text-base shadow-lg"
                            onClick={() => navigate('/adults/practice/multi-mode')}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {enrolledModules.size > 0 ? 'Continue Practice' : 'Start Practice'}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pronunciation Analyzer */}
                  <Card className="bg-gradient-to-br from-green-600/20 to-green-600/20 backdrop-blur-xl border-green-500/50 shadow-2xl dark:from-green-600/20 dark:to-green-600/20 dark:border-green-500/50">
                    <CardContent className="p-4 sm:p-6 md:p-8">
                      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                        <div className="p-4 sm:p-6 rounded-2xl text-white bg-green-600 shadow-lg flex-shrink-0">
                          <Mic className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
                        </div>
                        <div className="flex-1 text-center sm:text-left w-full">
                          <h3 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white mb-2">Pronunciation Analyzer</h3>
                          <p className="text-sm sm:text-base text-muted-foreground dark:text-cyan-100/80 mb-3 sm:mb-4">
                            Record and analyze your pronunciation with AI-powered feedback
                          </p>
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 mb-3 sm:mb-4">
                            <Badge variant="outline" className="bg-green-600/30 text-gray-800 font-semibold border-green-500/60 text-xs dark:bg-green-600/30 dark:text-white dark:border-green-500/50">
                              AI Feedback
                            </Badge>
                          </div>
                          <Button
                            size="default"
                            className="w-full sm:w-auto bg-green-600 text-white hover:bg-green-700 font-semibold text-sm sm:text-base shadow-lg"
                            onClick={() => setActiveWidget('pronunciation')}
                          >
                            <Mic className="w-4 h-4 mr-2" />
                            Analyze Pronunciation
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Daily Conversation - Prominent */}
                  <Card className="bg-gradient-to-br from-emerald-600/20 to-emerald-600/20 backdrop-blur-xl border-emerald-500/50 shadow-2xl relative dark:from-emerald-600/20 dark:to-emerald-600/20 dark:border-emerald-500/50">
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                      <Badge className="bg-emerald-600 text-white border-0 shadow-lg px-2 sm:px-3 py-1 text-xs sm:text-sm">
                        {dailyConversationEnrolledCount > 0 && (
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        )}
                        Enrolled: {dailyConversationEnrolledCount}
                      </Badge>
                    </div>
                    <CardContent className="p-4 sm:p-6 md:p-8">
                      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                        <div className="p-4 sm:p-6 rounded-2xl text-white bg-emerald-600 shadow-lg flex-shrink-0">
                          <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
                        </div>
                        <div className="flex-1 text-center sm:text-left w-full">
                          <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                            <h3 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white">Daily Conversation</h3>
                            {getOverallProgress() !== null && (
                              <Badge variant="outline" className="bg-emerald-700/95 text-white font-semibold border-emerald-600/90 text-xs dark:bg-emerald-600/40 dark:text-white dark:border-emerald-500/70">
                                {getOverallProgress()}% Complete
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm sm:text-base text-muted-foreground dark:text-cyan-100/80 mb-3 sm:mb-4">
                            Practice professional speaking about everyday topics with AI-powered feedback
                          </p>
                          {/* Progress Display - Show if any topic has progress */}
                          {getOverallProgress() !== null && (
                            <div className="mb-3 sm:mb-4 space-y-2">
                              <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground dark:text-cyan-200/70 mb-1">
                                <span>Overall Progress</span>
                                <span className="font-semibold text-foreground dark:text-white">{getOverallProgress()}%</span>
                              </div>
                              <Progress 
                                value={getOverallProgress() || 0} 
                                className="h-2 bg-muted dark:bg-slate-700/50"
                              />
                              {/* Enrolled Topics Summary */}
                              {dailyConversationProgress && Object.keys(dailyConversationProgress).length > 0 && (
                                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground dark:text-cyan-200/60 mb-2">
                                  {Object.entries(dailyConversationProgress).map(([topicId, topic]: [string, any]) => {
                                    if (topic?.enrolled) {
                                      const topicName = topicId === 'greetings' ? 'Greetings' : 
                                                       topicId === 'work' ? 'Work & Professional' : topicId;
                                      return (
                                        <Badge key={topicId} variant="outline" className="bg-emerald-600/30 text-gray-800 font-semibold border-emerald-500/60 text-xs dark:bg-emerald-600/30 dark:text-white dark:border-emerald-500/50">
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
                                <div className="flex items-center justify-between p-2 sm:p-3 bg-emerald-600/30 border border-emerald-500/60 rounded-lg dark:bg-emerald-600/30 dark:border-emerald-500/50">
                                  <div className="flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-gray-800 dark:text-white" />
                                    <span className="text-xs sm:text-sm text-gray-800 font-semibold dark:text-white">Total Points</span>
                                  </div>
                                  <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                    {getDailyConversationPoints()}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 mb-3 sm:mb-4">
                            <Badge variant="outline" className="bg-emerald-600/30 text-gray-800 font-semibold border-emerald-500/60 text-xs dark:bg-emerald-600/30 dark:text-white dark:border-emerald-500/50">
                              All Levels
                            </Badge>
                      </div>
                          <Button
                            size="default"
                            className="w-full sm:w-auto bg-emerald-600 text-white hover:bg-emerald-700 font-semibold text-sm sm:text-base shadow-lg"
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

              <TabsContent value="multimode" className="mt-0">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white mb-2">Multi-Mode Practice</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70 mb-4 sm:mb-6">Practice all language skills in one place</p>
                  </div>
                  <Card className="bg-gradient-to-br from-teal-500/20 via-emerald-500/25 to-teal-600/20 backdrop-blur-xl border-teal-400/50 shadow-2xl dark:from-teal-500/20 dark:via-emerald-500/25 dark:to-teal-600/20 dark:border-teal-400/50">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <p className="text-muted-foreground dark:text-cyan-100/80 mb-4">
                          Access comprehensive practice for listening, speaking, reading, and writing skills
                        </p>
                        <Button
                          size="default"
                          className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700 font-semibold shadow-lg"
                          onClick={() => navigate('/adults/practice/multi-mode')}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Open Multi-Mode Practice
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="email" className="mt-0">
                <BusinessEmailCoach onClose={() => {}} />
              </TabsContent>

              <TabsContent value="cultural" className="mt-0">
                <CulturalIntelligence onClose={() => {}} />
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <ProgressAnalytics />
              </TabsContent>
            </Tabs>
          </div>

          {/* Video Lessons - Separate Prominent Section */}
          <div>
            <Card className="bg-card/80 backdrop-blur-xl border-primary/30 shadow-2xl overflow-hidden dark:bg-slate-900/60 dark:border-emerald-500/30">
                    <CardContent className="p-0">
                <div className="h-auto min-h-[200px] sm:min-h-[240px] md:min-h-[280px] py-6 sm:py-8 md:py-10 bg-emerald-600 flex items-center justify-center relative overflow-hidden dark:bg-emerald-600">
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative z-10 text-center px-4 sm:px-6 md:px-8 w-full max-w-4xl mx-auto">
                    <Play className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 mx-auto mb-3 sm:mb-4 text-white" />
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 px-2">
                      Interactive Video Lessons
                    </h2>
                    <p className="text-white/90 text-xs sm:text-sm md:text-base max-w-2xl mx-auto mb-4 sm:mb-5 md:mb-6 px-2 leading-relaxed">
                      Engage with native speakers in real-world scenarios. Practice pronunciation, learn idioms, and master professional communication.
                    </p>
                    <Button
                      size="default"
                      className="bg-white text-primary hover:bg-primary/10 font-semibold text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-2.5 dark:bg-white dark:text-emerald-600 dark:hover:bg-emerald-50"
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
      </main>
    </div>
  );
};

export default AdultsPage;
