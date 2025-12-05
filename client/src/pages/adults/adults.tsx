import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Target, Award, BookOpen,
  TrendingUp, Zap, BarChart3,
  Clock, Shield, Rocket,
  ArrowRight, GraduationCap,
  Speech, BookMarked, Flame as FireIcon, Gem, Trophy
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
  ProgressAnalytics
} from '@/components/adults';
import { AdultsAPI } from '@/services/ApiService';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/utils/logger';

const AdultsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [progress, setProgress] = useState(42);
  const [streak, setStreak] = useState(7);
  const [fluencyScore, setFluencyScore] = useState(65);
  const [isLoaded, setIsLoaded] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [multiModePoints, setMultiModePoints] = useState(0);
  const [dailyConversationPoints, setDailyConversationPoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);


  // Load dashboard data
  useEffect(() => {
    // Only load data if user is authenticated and has a valid token
    const token = localStorage.getItem('speakbee_auth_token');
    if (!user || !token || token === 'local-token') {
      setLoading(false);
      return;
    }
    
    loadDashboardData();
    loadMultiModePoints();
    loadDailyConversationPoints();
  }, [user]);

  // Listen for updates
  useEffect(() => {
    const handleMultiModeUpdate = () => {
      loadMultiModePoints();
    };
    const handleDailyConversationUpdate = () => {
      loadDailyConversationPoints();
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

        // Update fluency score from dashboard
        if (result.data?.dashboard?.fluency_score !== undefined) {
          setFluencyScore(result.data.dashboard.fluency_score);
        }
      }
    } catch (error) {
      logger.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMultiModePoints = async () => {
    if (!user) return;
    const token = localStorage.getItem('speakbee_auth_token');
    if (!token || token === 'local-token') return;
    
    try {
      const result = await AdultsAPI.getMultiModePracticeHistory();
      if (result.success && 'data' in result && result.data?.data) {
        const sessions = result.data.data || [];
        const totalPoints = sessions.reduce((sum: number, s: any) => sum + (s.points_earned || 0), 0);
        setMultiModePoints(totalPoints);
        calculateTotalPoints();
      }
    } catch (error) {
      logger.error('Failed to load multi-mode points:', error);
    }
  };

  const loadDailyConversationPoints = () => {
    try {
      const progress = JSON.parse(
        localStorage.getItem('dailyConversationProgress') || '{}'
      );
      let totalPoints = 0;
      Object.values(progress).forEach((topic: any) => {
        if (topic && topic.scenario1 && topic.scenario2) {
          totalPoints += (topic.scenario1.points || 0) + (topic.scenario2.points || 0);
        }
      });
      setDailyConversationPoints(totalPoints);
      calculateTotalPoints();
    } catch (error) {
      logger.error('Error loading daily conversation points:', error);
      setDailyConversationPoints(0);
      calculateTotalPoints();
    }
  };

  const calculateTotalPoints = () => {
    const dashboardPoints = dashboardData?.total_points || 0;
    const total = dashboardPoints + multiModePoints + dailyConversationPoints;
    setTotalPoints(total);
  };

  // Recalculate when dashboard data or points change
  useEffect(() => {
    calculateTotalPoints();
  }, [dashboardData, multiModePoints, dailyConversationPoints]);

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
      label: "Total Points",
      value: totalPoints.toString(),
      icon: Gem,
      color: "text-purple-500",
      bgColor: "bg-purple-500/20",
      glowColor: "rgba(168, 85, 247, 0.2)",
      description: "Total points from all practice activities"
    },
  ];


  return (
    <div className={`relative overflow-hidden min-h-screen ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
      {/* Background Elements - Same as Home Page */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] rounded-full bg-accent/10 blur-3xl -z-10"></div>


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

          {/* Personalized Recommendations */}
          <div>
            <PersonalizedRecommendations />
          </div>

          {/* Progress Overview Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white mb-2">Your Learning Progress</h2>
              <p className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70">Track your achievements across all proficiency levels</p>
            </div>

            {/* Overall Progress Card */}
            <Card className="bg-gradient-to-br from-primary/20 via-secondary/30 to-accent/20 backdrop-blur-xl border-primary/50 shadow-2xl dark:from-emerald-500/20 dark:via-green-500/30 dark:to-teal-500/20 dark:border-emerald-400/50">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white mb-2">Overall Learning Progress</h3>
                    <p className="text-sm text-muted-foreground dark:text-cyan-100/70">Your journey across all levels</p>
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent dark:from-emerald-400 dark:via-green-400 dark:to-teal-400">
                      {progress}%
                    </div>
                    <div className="text-sm text-muted-foreground dark:text-cyan-100/70">Overall Mastery</div>
                  </div>
                </div>
                <Progress value={progress} className="h-4 bg-muted dark:bg-slate-700/50 mb-6">
                  <div className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full transition-all duration-500 dark:from-emerald-500 dark:via-green-500 dark:to-teal-500" />
                </Progress>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-card/50 backdrop-blur-sm p-4 rounded-lg border border-primary/20 dark:bg-slate-800/50 dark:border-emerald-500/20">
                    <div className="text-sm text-muted-foreground dark:text-cyan-100/70 mb-1">Foundation Level</div>
                    <div className="text-2xl font-bold text-foreground dark:text-white">{levels[0].progress}%</div>
                    <Progress value={levels[0].progress} className="h-2 mt-2 bg-muted dark:bg-slate-700/50">
                      <div className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-full" />
                    </Progress>
                  </div>
                  <div className="bg-card/50 backdrop-blur-sm p-4 rounded-lg border border-primary/20 dark:bg-slate-800/50 dark:border-emerald-500/20">
                    <div className="text-sm text-muted-foreground dark:text-cyan-100/70 mb-1">Intermediate Level</div>
                    <div className="text-2xl font-bold text-foreground dark:text-white">{levels[1].progress}%</div>
                    <Progress value={levels[1].progress} className="h-2 mt-2 bg-muted dark:bg-slate-700/50">
                      <div className="h-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-full" />
                    </Progress>
                  </div>
                  <div className="bg-card/50 backdrop-blur-sm p-4 rounded-lg border border-primary/20 dark:bg-slate-800/50 dark:border-emerald-500/20">
                    <div className="text-sm text-muted-foreground dark:text-cyan-100/70 mb-1">Advanced Level</div>
                    <div className="text-2xl font-bold text-foreground dark:text-white">{levels[2].progress}%</div>
                    <Progress value={levels[2].progress} className="h-2 mt-2 bg-muted dark:bg-slate-700/50">
                      <div className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-full" />
                    </Progress>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Resources Tab */}
          <div>
              <Tabs defaultValue="analytics" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-card/80 border-primary/30 mb-6 h-auto dark:bg-slate-900/60 dark:border-emerald-500/30">
                  <TabsTrigger value="analytics" className="text-xs sm:text-sm data-[state=active]:bg-primary/20 data-[state=active]:text-primary py-2 sm:py-3 dark:data-[state=active]:bg-emerald-500/20 dark:data-[state=active]:text-emerald-300">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                </TabsTrigger>
                <TabsTrigger value="lessons" className="text-xs sm:text-sm data-[state=active]:bg-primary/20 data-[state=active]:text-primary py-2 sm:py-3 dark:data-[state=active]:bg-emerald-500/20 dark:data-[state=active]:text-emerald-300">
                  <BookOpen className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Lessons</span>
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
              </TabsList>

                <TabsContent value="analytics" className="mt-0">
                  <ProgressAnalytics />
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
            </Tabs>
          </div>
          </div>
      </main>

    </div>
  );
};

export default AdultsPage;
