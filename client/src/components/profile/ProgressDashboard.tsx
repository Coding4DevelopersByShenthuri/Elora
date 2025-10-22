import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, TrendingUp, Flame, Clock, Target, Award, 
  BookOpen, BarChart3, Calendar
} from 'lucide-react';
import { ProgressTracker } from '@/services/ProgressTracker';
import { AchievementSystem, type Achievement } from '@/services/AchievementSystem';
import { useAuth } from '@/contexts/AuthContext';

export default function ProgressDashboard() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<any>(null);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const [prog, weekly, insightsData] = await Promise.all([
        ProgressTracker.getUserProgress(user.id),
        ProgressTracker.getWeeklyStats(user.id),
        ProgressTracker.getLearningInsights(user.id)
      ]);

      setProgress(prog);
      setWeeklyStats(weekly);
      setInsights(insightsData);
      setAchievements(AchievementSystem.getAllAchievements());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !progress) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const levelProgress = AchievementSystem.getLevelProgress(progress.totalPoints);
  const stats = AchievementSystem.getStatistics();

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Your Progress
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your learning journey
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              Level {progress.level}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {progress.totalPoints} points
            </div>
          </div>
        </div>
      </div>

      {/* Level Progress */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Level {levelProgress.currentLevel}
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Level {levelProgress.nextLevel}
          </span>
        </div>
        <Progress value={levelProgress.progress} className="h-3" />
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
          {levelProgress.nextLevelPoints - progress.totalPoints} points to next level
        </p>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {progress.currentStreak}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Day Streak
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {progress.lessonsCompleted}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Lessons Done
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(progress.practiceTime)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Minutes
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.unlocked}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Achievements
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Weekly Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              This Week
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Lessons
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {weeklyStats?.totalLessons || 0}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Practice Time
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(weeklyStats?.totalTime || 0)}m
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Avg Score
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(weeklyStats?.averageScore || 0)}%
                </div>
              </div>
            </div>
          </Card>

          {/* Next Achievements */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Next Achievements
            </h3>
            <div className="space-y-3">
              {AchievementSystem.getNextAchievements(3).map(achievement => (
                <div key={achievement.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <div className="font-medium text-sm">
                          {achievement.title}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {achievement.description}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">
                      +{achievement.points}
                    </Badge>
                  </div>
                  <Progress value={achievement.progress} className="h-2" />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">All Achievements</h3>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stats.unlocked} / {stats.total} unlocked
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map(achievement => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    achievement.unlocked
                      ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                      : 'border-gray-200 dark:border-gray-700 opacity-60'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-3xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <Badge
                          variant={achievement.unlocked ? 'default' : 'outline'}
                          className={
                            achievement.tier === 'platinum'
                              ? 'bg-purple-500'
                              : achievement.tier === 'gold'
                              ? 'bg-yellow-500'
                              : achievement.tier === 'silver'
                              ? 'bg-gray-400'
                              : 'bg-orange-600'
                          }
                        >
                          {achievement.tier}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {achievement.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          +{achievement.points} points
                        </span>
                        {!achievement.unlocked && (
                          <span className="text-xs font-medium">
                            {Math.round(achievement.progress)}% complete
                          </span>
                        )}
                      </div>
                      {!achievement.unlocked && (
                        <Progress value={achievement.progress} className="h-1 mt-2" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Learning Insights
            </h3>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    insight.type === 'strength'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : insight.type === 'weakness'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : insight.type === 'milestone'
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                      : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{insight.icon}</span>
                    <div>
                      <h4 className="font-semibold">{insight.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {insights.length === 0 && (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Complete more lessons to see insights</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

