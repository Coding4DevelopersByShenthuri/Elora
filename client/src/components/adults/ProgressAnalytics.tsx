import { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, Target, Award,
  Clock, BookOpen, Zap, Calendar, ArrowUp, ArrowDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { AdultsAPI } from '@/services/ApiService';
import { useAuth } from '@/contexts/AuthContext';

interface AnalyticsSummary {
  summary: {
    [key: string]: {
      total_points: number;
      lessons_completed: number;
      practice_time_minutes: number;
      average_score: number;
      progress_percentage: number;
      streak: number;
    };
  };
  totals: {
    total_points: number;
    total_lessons: number;
    total_time_minutes: number;
    average_score: number;
  };
}

export default function ProgressAnalytics() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodType, setPeriodType] = useState<string>('weekly');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadAnalytics();
  }, [periodType]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const result = await AdultsAPI.getAnalyticsSummary();
      if (result.success && 'data' in result) {
        setSummary(result.data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      adults_beginner: 'Beginner',
      adults_intermediate: 'Intermediate',
      adults_advanced: 'Advanced',
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'adults_beginner':
        return 'from-cyan-500 to-blue-600';
      case 'adults_intermediate':
        return 'from-purple-500 to-pink-600';
      case 'adults_advanced':
        return 'from-amber-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!summary) {
    return (
      <Card className="bg-slate-900/60 backdrop-blur-xl border-purple-500/30">
        <CardContent className="p-12 text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-cyan-300/50" />
          <p className="text-cyan-100/70">No analytics data available yet.</p>
        </CardContent>
      </Card>
    );
  }

  const categories = Object.keys(summary.summary);
  const displayCategories = selectedCategory === 'all'
    ? categories
    : [selectedCategory].filter(c => categories.includes(c));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Progress Analytics</h2>
          <p className="text-sm text-cyan-100/70">
            Detailed insights into your learning journey
          </p>
        </div>
        <Select value={periodType} onValueChange={setPeriodType}>
          <SelectTrigger className="w-full sm:w-[180px] bg-slate-800/60 border-purple-500/30 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">This Week</SelectItem>
            <SelectItem value="monthly">This Month</SelectItem>
            <SelectItem value="daily">Today</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/60 backdrop-blur-xl border-purple-500/30">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{summary.totals.total_points}</p>
                <p className="text-xs text-cyan-100/70">Total Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/60 backdrop-blur-xl border-purple-500/30">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{summary.totals.total_lessons}</p>
                <p className="text-xs text-cyan-100/70">Lessons Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/60 backdrop-blur-xl border-purple-500/30">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{formatTime(summary.totals.total_time_minutes)}</p>
                <p className="text-xs text-cyan-100/70">Practice Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/60 backdrop-blur-xl border-purple-500/30">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{summary.totals.average_score.toFixed(1)}%</p>
                <p className="text-xs text-cyan-100/70">Average Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px] bg-slate-800/60 border-purple-500/30 text-white">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {getCategoryLabel(cat)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {displayCategories.map((category) => {
          const data = summary.summary[category];
          const color = getCategoryColor(category);

          return (
            <Card
              key={category}
              className="bg-slate-900/60 backdrop-blur-xl border-purple-500/30"
            >
              <CardHeader className="pb-3">
                <div className={cn(
                  "h-12 w-12 rounded-xl bg-gradient-to-r flex items-center justify-center text-2xl mb-3",
                  color
                )}>
                  {category === 'adults_beginner' ? '🌱' : category === 'adults_intermediate' ? '📈' : '👑'}
                </div>
                <CardTitle className="text-xl font-bold text-white">
                  {getCategoryLabel(category)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-cyan-100/80">Overall Progress</span>
                    <span className="text-white font-semibold">{data.progress_percentage.toFixed(0)}%</span>
                  </div>
                  <Progress
                    value={data.progress_percentage}
                    className="h-3 bg-slate-700/50"
                  />
                </div>

                {/* Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-cyan-100/70 flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      Points
                    </span>
                    <span className="text-white font-semibold">{data.total_points}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-cyan-100/70 flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      Lessons
                    </span>
                    <span className="text-white font-semibold">{data.lessons_completed}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-cyan-100/70 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Time
                    </span>
                    <span className="text-white font-semibold">{formatTime(data.practice_time_minutes)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-cyan-100/70 flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      Score
                    </span>
                    <span className="text-white font-semibold">{data.average_score.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-cyan-100/70 flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Streak
                    </span>
                    <span className="text-white font-semibold">{data.streak} days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

