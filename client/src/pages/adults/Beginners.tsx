import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, Volume2, Mic, CheckCircle, Clock, Users, 
  Target, Award, BookOpen, MessageCircle, Repeat, Zap, TrendingUp,
  ArrowRight, Shield, Rocket, Layers, Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { QuickAccessToolbar, DictionaryWidget, CulturalIntelligence } from '@/components/adults';
import { useAuth } from '@/contexts/AuthContext';
import { getTotalModulesByMode, getModuleById } from '@/data/multi-mode-modules-config';
import { AdultsAPI } from '@/services/ApiService';
import { logger } from '@/utils/logger';

const BeginnersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('lessons');
  const [, setCurrentLesson] = useState(0);
  const [progress, setProgress] = useState(35);
  const [streak, setStreak] = useState(5);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [isHovered, setIsHovered] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeWidget, setActiveWidget] = useState<string | null>(null);
  const [multiModeProgress, setMultiModeProgress] = useState<any>(null);
  const [enrolledModules, setEnrolledModules] = useState<Set<string>>(new Set());
  const [dailyConversationProgress, setDailyConversationProgress] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [vocabularyWords, setVocabularyWords] = useState(0);
  const [speakingPractice, setSpeakingPractice] = useState(0);

  // Page load fade-in
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Load all data
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const token = localStorage.getItem('speakbee_auth_token');
    if (!token || token === 'local-token') {
      setLoading(false);
      return;
    }
    
    loadDashboardData();
    loadMultiModeProgress();
    loadEnrolledModules();
    loadDailyConversationProgress();
  }, [user]);

  // Listen for updates
  useEffect(() => {
    const handleMultiModeUpdate = () => {
      loadMultiModeProgress();
      loadEnrolledModules();
    };
    const handleDailyConversationUpdate = () => {
      loadDailyConversationProgress();
    };
    
    window.addEventListener('multiModeProgressUpdated', handleMultiModeUpdate);
    window.addEventListener('dailyConversationProgressUpdated', handleDailyConversationUpdate);
    
    return () => {
      window.removeEventListener('multiModeProgressUpdated', handleMultiModeUpdate);
      window.removeEventListener('dailyConversationProgressUpdated', handleDailyConversationUpdate);
    };
  }, []);

  const loadDashboardData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
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
        if (result.data?.dashboard?.progress_summary?.adults_beginner) {
          const beginnerData = result.data.dashboard.progress_summary.adults_beginner;
          setProgress(beginnerData.progress_percentage || 35);
          setVocabularyWords(beginnerData.vocabulary_words || 0);
        }
        
        // Update streak from dashboard
        if (result.data?.dashboard?.current_streak !== undefined) {
          setStreak(result.data.dashboard.current_streak);
        }

        // Load completed lessons from lesson progress
        // This would need to be fetched from the API if available
        // For now, we'll use the progress percentage to estimate
      }
    } catch (error) {
      logger.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMultiModeProgress = async () => {
    if (!user) return;
    const token = localStorage.getItem('speakbee_auth_token');
    if (!token || token === 'local-token') return;
    
    try {
      const result = await AdultsAPI.getMultiModePracticeHistory();
      if (result.success && 'data' in result && result.data?.data) {
        const sessions = result.data.data || [];
        const totalPoints = sessions.reduce((sum: number, s: any) => sum + (s.points_earned || 0), 0);
        const completedModules = new Set<string>();
        sessions.forEach((session: any) => {
          if (session.completed_at && session.score > 0 && session.content_id) {
            completedModules.add(session.content_id);
          }
        });
        
        setMultiModeProgress({
          totalPoints,
          totalSessions: sessions.length,
          completedModules: Array.from(completedModules)
        });
      }
    } catch (error) {
      logger.error('Failed to load multi-mode progress:', error);
    }
  };

  const loadEnrolledModules = () => {
    if (!user) return;
    const stored = localStorage.getItem(`enrolled_modules_${user.id}`);
    if (stored) {
      setEnrolledModules(new Set(JSON.parse(stored)));
    }
  };

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

  const getMultiModeProgress = () => {
    const totalModules = getTotalModulesByMode();
    if (totalModules.total === 0) return null;
    const completedModulesCount = multiModeProgress?.completedModules?.length || 0;
    const progress = Math.round((completedModulesCount / totalModules.total) * 100);
    return Math.min(100, Math.max(0, progress));
  };

  const getEnrolledSummaryByMode = () => {
    const summary = { listening: 0, speaking: 0, reading: 0, writing: 0 };
    enrolledModules.forEach((moduleId) => {
      const module = getModuleById(moduleId);
      if (module) summary[module.mode]++;
    });
    return summary;
  };

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

  const getDailyConversationEnrollmentCount = () => {
    if (!dailyConversationProgress) return 0;
    return Object.values(dailyConversationProgress).filter((topic: any) => topic?.enrolled).length;
  };

  const getOverallProgress = () => {
    if (!dailyConversationProgress) return null;
    const topics = Object.values(dailyConversationProgress).filter((topic: any) => topic?.average !== undefined);
    if (topics.length === 0) return null;
    const totalAverage = topics.reduce((sum: number, topic: any) => sum + (topic.average || 0), 0);
    return Math.round(totalAverage / topics.length);
  };

  const hasAnyEnrolledTopic = () => {
    if (!dailyConversationProgress) return false;
    return Object.values(dailyConversationProgress).some((topic: any) => topic?.enrolled === true);
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
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'lessons', label: 'Learning Modules', icon: BookOpen },
    { id: 'practice', label: 'Practice Labs', icon: MessageCircle },
    { id: 'vocabulary', label: 'Vocabulary Builder', icon: Target },
    { id: 'progress', label: 'Progress Analytics', icon: TrendingUp },
  ];

  const lessons = [
    {
      title: "Greetings & Introductions",
      description: "Master basic greetings and professional self-introductions",
      duration: '15 min',
      level: 'Foundation',
      words: 25,
      completed: true,
      icon: '👋',
      color: 'from-blue-500 via-cyan-500 to-teal-500',
      glowColor: 'rgba(59, 130, 246, 0.3)',
      skills: ['Formal Greetings', 'Self-Introduction', 'Basic Etiquette']
    },
    {
      title: "Everyday Conversations",
      description: "Practice common daily interactions and social exchanges",
      duration: '20 min',
      level: 'Foundation',
      words: 40,
      completed: true,
      icon: '💬',
      color: 'from-emerald-500 via-green-500 to-teal-500',
      glowColor: 'rgba(16, 185, 129, 0.3)',
      skills: ['Small Talk', 'Daily Interactions', 'Social Context']
    },
    {
      title: "Asking Questions",
      description: "Develop skills to ask and answer questions effectively",
      duration: '18 min',
      level: 'Foundation',
      words: 35,
      completed: true,
      icon: '❓',
      color: 'from-purple-500 via-indigo-500 to-blue-500',
      glowColor: 'rgba(168, 85, 247, 0.3)',
      skills: ['Question Forms', 'Response Patterns', 'Clarification']
    },
    {
      title: "Shopping & Transactions",
      description: "Essential phrases for retail and financial interactions",
      duration: '25 min',
      level: 'Foundation',
      words: 50,
      completed: false,
      icon: '🛍️',
      color: 'from-amber-500 via-orange-500 to-red-500',
      glowColor: 'rgba(249, 115, 22, 0.3)',
      skills: ['Price Inquiry', 'Payment Terms', 'Product Questions']
    },
    {
      title: "Dining & Hospitality",
      description: "Navigate restaurant scenarios and food-related conversations",
      duration: '22 min',
      level: 'Foundation',
      words: 45,
      completed: false,
      icon: '🍽️',
      color: 'from-rose-500 via-pink-500 to-fuchsia-500',
      glowColor: 'rgba(244, 63, 94, 0.3)',
      skills: ['Menu Reading', 'Ordering', 'Dining Etiquette']
    },
    {
      title: "Directions & Navigation",
      description: "Confidently ask for and provide location guidance",
      duration: '20 min',
      level: 'Foundation',
      words: 38,
      completed: false,
      icon: '🧭',
      color: 'from-indigo-500 via-blue-500 to-cyan-500',
      glowColor: 'rgba(99, 102, 241, 0.3)',
      skills: ['Location Terms', 'Direction Giving', 'Transportation']
    }
  ];

  const quickActions = [
    {
      title: "Speech Practice",
      description: "AI-powered pronunciation and fluency training",
      icon: Mic,
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-500/20",
      textColor: "text-blue-500",
      gradient: "from-blue-500 to-cyan-600",
      link: "/practice/speaking"
    },
    {
      title: "Listening Comprehension",
      description: "Enhance auditory skills with native speaker content",
      icon: Volume2,
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-500/20",
      textColor: "text-emerald-500",
      gradient: "from-emerald-500 to-teal-600",
      link: "/practice/listening"
    },
    {
      title: "Conversation Practice",
      description: "Real-time dialogue practice with AI conversation partner",
      icon: MessageCircle,
      color: "from-violet-500 to-purple-600",
      bgColor: "bg-violet-500/20",
      textColor: "text-violet-500",
      gradient: "from-violet-500 to-purple-600",
      link: "/practice/conversation"
    },
    {
      title: "Knowledge Review",
      description: "Reinforce learning with spaced repetition system",
      icon: Repeat,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-500/20",
      textColor: "text-amber-500",
      gradient: "from-amber-500 to-orange-600",
      link: "/practice/review"
    }
  ];

  // Calculate completed lessons count based on progress
  const getCompletedLessonsCount = () => {
    if (progress >= 100) return lessons.length;
    if (progress >= 83) return 5;
    if (progress >= 67) return 4;
    if (progress >= 50) return 3;
    if (progress >= 33) return 2;
    if (progress >= 17) return 1;
    return 0;
  };

  const stats = [
    { 
      label: "Vocabulary Mastered", 
      value: vocabularyWords.toString(), 
      icon: BookOpen, 
      color: "text-blue-500",
      bgColor: "bg-blue-500/20",
      glowColor: "rgba(59, 130, 246, 0.2)",
      description: "Active words and phrases"
    },
    { 
      label: "Speaking Practice", 
      value: dashboardData?.progress_summary?.adults_beginner?.practice_time_minutes 
        ? `${Math.round(dashboardData.progress_summary.adults_beginner.practice_time_minutes)} min`
        : "0 min", 
      icon: Mic, 
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/20",
      glowColor: "rgba(16, 185, 129, 0.2)",
      description: "Total practice time"
    },
    { 
      label: "Learning Streak", 
      value: `${streak} days`, 
      icon: Zap, 
      color: "text-orange-500",
      bgColor: "bg-orange-500/20",
      glowColor: "rgba(249, 115, 22, 0.2)",
      description: "Consistent progress"
    },
    { 
      label: "Modules Completed", 
      value: `${getCompletedLessonsCount()}/${lessons.length}`, 
      icon: Award, 
      color: "text-purple-500",
      bgColor: "bg-purple-500/20",
      glowColor: "rgba(168, 85, 247, 0.2)",
      description: "Foundation level"
    },
  ];

  const handleStartLesson = (lessonIndex: number) => {
    setCurrentLesson(lessonIndex);
    if (!completedLessons.includes(lessonIndex)) {
      setCompletedLessons(prev => [...prev, lessonIndex]);
      setProgress(prev => Math.min(prev + 16, 100));
      setStreak(prev => prev + 1);
    }
  };

  return (
    <div className={`relative overflow-hidden min-h-screen ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
      {/* Background Elements - Same as Adults Page */}
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
        {/* Header Section */}
        <section>
          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#10b981] text-white shadow-xl dark:from-[#022c22] dark:via-[#065f46] dark:to-[#059669]">
            <span className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden />
            <span className="absolute -left-28 bottom-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" aria-hidden />
            <CardHeader className="space-y-3 py-4 sm:py-5 md:py-6 relative z-10">
              <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2 sm:space-y-3 lg:max-w-2xl">
                  <Badge className="bg-white/25 text-white uppercase tracking-wide text-xs sm:text-sm px-2 py-0.5 sm:px-3 sm:py-1">
                    Foundation Level (Beginners)
                  </Badge>
                  <CardTitle className="text-xl sm:text-2xl md:text-3xl font-semibold text-white leading-tight">
                    Build essential communication skills with structured, professional learning pathways
                  </CardTitle>
                  <CardDescription className="text-white/85 text-sm sm:text-base leading-relaxed">
                    Master foundational English communication skills with personalized learning paths, AI-powered feedback, and real-world scenarios designed for beginners.
                  </CardDescription>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
                    <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs hover:bg-white/25">
                      <Clock className="w-3 h-3 mr-1" />
                      Flexible Scheduling
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs hover:bg-white/25">
                      <Users className="w-3 h-3 mr-1" />
                      Professional Context
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs hover:bg-white/25">
                      <Volume2 className="w-3 h-3 mr-1" />
                      Speech Recognition
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs hover:bg-white/25">
                      <Shield className="w-3 h-3 mr-1" />
                      Structured Learning
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

        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Progress Card */}
          <Card className="lg:col-span-2 bg-card/80 backdrop-blur-xl border-primary/30 hover:border-primary/50 transition-all duration-300 dark:bg-slate-900/60 dark:border-emerald-500/30 dark:hover:border-emerald-400/50">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-foreground dark:text-white">Learning Journey</h3>
                  <p className="text-sm sm:text-base text-muted-foreground dark:text-cyan-100/70">Track your progress through foundation modules</p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent dark:from-emerald-400 dark:via-green-400 dark:to-teal-400">{progress}%</div>
                  <div className="text-sm sm:text-base text-muted-foreground dark:text-cyan-100/70">Overall Mastery</div>
                </div>
              </div>

              <Progress value={progress} className="h-3 bg-muted dark:bg-slate-700/50 mb-8">
                <div className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full transition-all duration-500 dark:from-emerald-500 dark:via-green-500 dark:to-teal-500" />
              </Progress>

              {/* Weekly Goal */}
              <div className="bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-sm p-4 rounded-xl border border-primary/30 dark:from-emerald-500/20 dark:to-green-500/20 dark:border-emerald-400/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground dark:text-white">Weekly Learning Goal</span>
                  <span className="text-sm font-medium text-primary dark:text-emerald-300">3/5 sessions</span>
                </div>
                <Progress value={60} className="h-2 bg-muted dark:bg-slate-700/50">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                </Progress>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <Card className="bg-card/80 backdrop-blur-xl border-primary/30 hover:border-primary/50 transition-all duration-300 dark:bg-slate-900/60 dark:border-emerald-500/30 dark:hover:border-emerald-400/50">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <h3 className="text-lg sm:text-xl font-semibold text-foreground dark:text-white mb-4 sm:mb-6">Learning Metrics</h3>
              <div className="space-y-4 sm:space-y-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 backdrop-blur-sm border border-primary/20 hover:border-primary/50 transition-all duration-300 dark:bg-slate-700/30 dark:border-emerald-500/20 dark:hover:border-emerald-400/50">
                      <div className={cn("p-3 rounded-xl", stat.bgColor, stat.color)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-baseline">
                          <span className="text-sm font-medium text-muted-foreground dark:text-cyan-100/80">{stat.label}</span>
                          <span className="text-lg font-bold text-foreground dark:text-white">{stat.value}</span>
                        </div>
                        <p className="text-xs text-muted-foreground dark:text-cyan-100/60">{stat.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Practice Labs */}
        <div>
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white mb-2">Practice Labs</h2>
            <p className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70">Interactive exercises to reinforce your learning</p>
          </div>

          {/* Multi-Mode Practice */}
          <Card className="bg-gradient-to-br from-teal-500/20 via-emerald-500/25 to-teal-600/20 backdrop-blur-xl border-teal-400/50 shadow-2xl relative mb-6 dark:from-teal-500/20 dark:via-emerald-500/25 dark:to-teal-600/20 dark:border-teal-400/50">
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

          {/* Daily Conversation */}
          <Card className="bg-gradient-to-br from-emerald-600/20 to-emerald-600/20 backdrop-blur-xl border-emerald-500/50 shadow-2xl relative mb-6 dark:from-emerald-600/20 dark:to-emerald-600/20 dark:border-emerald-500/50">
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
              <Badge className="bg-emerald-600 text-white border-0 shadow-lg px-2 sm:px-3 py-1 text-xs sm:text-sm">
                {getDailyConversationEnrollmentCount() > 0 && (
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                )}
                Enrolled: {getDailyConversationEnrollmentCount()}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card 
                  key={index} 
                  className="group cursor-pointer bg-card/80 backdrop-blur-xl border-primary/30 hover:border-primary/50 transition-all duration-300 shadow-xl hover:shadow-2xl dark:bg-slate-900/60 dark:border-emerald-500/30 dark:hover:border-emerald-400/50"
                  onMouseEnter={() => setIsHovered(index)}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <CardContent className="p-4 sm:p-6 relative overflow-hidden">
                    <div className={cn(
                      "absolute top-0 right-0 w-20 h-20 rounded-full -mr-6 -mt-6 transition-all duration-500 bg-gradient-to-r opacity-20",
                      action.color,
                      isHovered === index ? "opacity-30 scale-150" : ""
                    )}></div>
                    
                    <div className={cn(
                      "w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 text-white relative z-10 transition-transform duration-300 bg-gradient-to-r shadow-lg",
                      action.color,
                      isHovered === index && "scale-110"
                    )}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    
                    <h4 className="font-semibold text-foreground dark:text-white mb-2 sm:mb-3 text-base sm:text-lg">{action.title}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70 mb-4 sm:mb-6 leading-relaxed">{action.description}</p>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-primary/30 text-foreground hover:bg-primary/20 hover:border-primary/50 transition-all duration-300 dark:border-emerald-500/30 dark:text-white dark:hover:bg-emerald-500/20 dark:hover:border-emerald-400/50"
                    >
                      Start Exercise
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Interactive Video Lessons */}
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

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                size="sm"
                className={cn(
                  "rounded-xl px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-medium transition-all duration-300 border-2 backdrop-blur-sm",
                  activeTab === tab.id 
                    ? "bg-gradient-to-r from-primary via-secondary to-accent text-white shadow-lg border-transparent dark:from-emerald-500 dark:via-green-500 dark:to-teal-500" 
                    : "bg-card/40 border-primary/30 hover:border-primary/50 text-foreground hover:shadow-md dark:bg-slate-800/40 dark:border-emerald-500/30 dark:hover:border-emerald-400/50 dark:text-cyan-200"
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Learning Modules Grid */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white">Learning Modules</h2>
              <p className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70">Structured curriculum for foundational English mastery</p>
            </div>
            <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 text-xs sm:text-sm w-fit dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-400/30">
              {getCompletedLessonsCount()}/{lessons.length} Completed
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {lessons.map((lesson, index) => {
              const isCompleted = index < getCompletedLessonsCount();
              return (
              <Card 
                key={index} 
                className={cn(
                  "group cursor-pointer border-2 transition-all duration-500 bg-card/80 backdrop-blur-xl hover:shadow-2xl overflow-hidden",
                  isCompleted 
                    ? "border-emerald-400/50 hover:border-emerald-300/70 dark:border-emerald-500/50 dark:hover:border-emerald-400/70" 
                    : "border-primary/30 hover:border-primary/50 dark:border-emerald-500/30 dark:hover:border-emerald-400/50"
                )}
                onMouseEnter={() => setIsHovered(index + 10)}
                onMouseLeave={() => setIsHovered(null)}
              >
                <CardContent className="p-0 overflow-hidden">
                  {/* Header with Gradient */}
                  <div className={cn(
                    "p-4 sm:p-6 text-white relative overflow-hidden transition-all duration-500 bg-gradient-to-r",
                    lesson.color,
                    isHovered === index + 10 && "brightness-110"
                  )} style={{ boxShadow: `0 0 30px ${lesson.glowColor}` }}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                    
                    <div className="relative z-10 text-center">
                      <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 transform transition-transform duration-300 group-hover:scale-110">
                        {lesson.icon}
                      </div>
                      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <h3 className="text-lg sm:text-xl font-bold">{lesson.title}</h3>
                        {isCompleted && (
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300 animate-pulse" />
                        )}
                      </div>
                      <p className="text-white/90 text-xs sm:text-sm leading-relaxed">{lesson.description}</p>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4 sm:p-6 bg-card/70 backdrop-blur-sm dark:bg-slate-900/70">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0 text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70 mb-3 sm:mb-4">
                      <span className="flex items-center gap-1 sm:gap-2 font-medium">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        {lesson.duration}
                      </span>
                      <span className="flex items-center gap-1 sm:gap-2 font-medium">
                        <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                        {lesson.words} terms
                      </span>
                      <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-xs w-fit dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-400/30">
                        {lesson.level}
                      </Badge>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
                      {lesson.skills.map((skill, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-muted/50 text-foreground border-primary/30 dark:bg-slate-700/50 dark:text-cyan-200 dark:border-emerald-500/30">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button 
                      className={cn(
                        "w-full font-semibold py-2 sm:py-3 rounded-xl transition-all duration-300 group-hover:shadow-lg relative overflow-hidden",
                        isCompleted
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                          : "bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 text-white dark:from-emerald-500 dark:via-green-500 dark:to-teal-500 dark:hover:from-emerald-600 dark:hover:via-green-600 dark:hover:to-teal-600"
                      )}
                      onClick={() => handleStartLesson(index)}
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        {isCompleted ? (
                          <>
                            <Repeat className="w-4 h-4 mr-2" />
                            Review Module
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Start Learning
                          </>
                        )}
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              );
            })}
          </div>
        </div>

        {/* Motivation & Progress Section */}
        <Card className="bg-gradient-to-r from-primary/20 via-secondary/30 to-accent/20 backdrop-blur-xl border-primary/50 text-foreground shadow-2xl overflow-hidden relative dark:from-emerald-500/20 dark:via-green-500/30 dark:to-teal-500/20 dark:border-emerald-400/50 dark:text-white">
          <span className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" aria-hidden />
          <span className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" aria-hidden />
          <CardContent className="p-4 sm:p-6 md:p-8 relative">
            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 backdrop-blur-sm dark:bg-white/10">
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-foreground dark:text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-foreground dark:text-white">Excellent Progress!</h3>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg mb-4 sm:mb-6 leading-relaxed px-2 dark:text-cyan-100">
                Your consistent effort is building a strong foundation for English mastery. 
                Continue with daily practice to accelerate your learning journey.
              </p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                <Badge variant="secondary" className="bg-white/20 text-foreground border-0 backdrop-blur-sm dark:bg-white/20 dark:text-white">
                  🎯 Structured Learning
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-foreground border-0 backdrop-blur-sm dark:bg-white/20 dark:text-white">
                  🔊 Professional Pronunciation
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-foreground border-0 backdrop-blur-sm dark:bg-white/20 dark:text-white">
                  💼 Real-world Context
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BeginnersPage;
