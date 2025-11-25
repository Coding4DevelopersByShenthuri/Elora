import { useState, useEffect } from 'react';
import {
  Trophy, Target, Zap, Calendar, Award, CheckCircle,
  Clock, TrendingUp, ArrowRight, Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AdultsAPI } from '@/services/ApiService';
import { useAuth } from '@/contexts/AuthContext';

interface WeeklyChallenge {
  id: number;
  challenge_id: string;
  title: string;
  description: string;
  category: string;
  start_date: string;
  end_date: string;
  points_reward: number;
  badge_icon?: string;
  requirement_type: string;
  requirement_value: number;
  requirement_description: string;
  user_progress?: {
    enrolled: boolean;
    completed: boolean;
    progress: number;
    progress_percentage: number;
    points_earned: number;
  };
}

export default function WeeklyChallenges() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const result = await AdultsAPI.getWeeklyChallenges();
      if (result.success) {
        setChallenges(result.data?.challenges || []);
      }
    } catch (error) {
      console.error('Failed to load challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (challengeId: number) => {
    try {
      const result = await AdultsAPI.enrollWeeklyChallenge(challengeId);
      if (result.success) {
        loadChallenges();
      }
    } catch (error) {
      console.error('Failed to enroll:', error);
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'speaking':
        return 'from-cyan-500 to-blue-600';
      case 'vocabulary':
        return 'from-emerald-500 to-teal-600';
      case 'grammar':
        return 'from-purple-500 to-pink-600';
      case 'pronunciation':
        return 'from-amber-500 to-orange-600';
      default:
        return 'from-indigo-500 to-purple-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Weekly Challenges</h2>
          <p className="text-sm text-cyan-100/70">
            Complete challenges to earn points and boost your learning
          </p>
        </div>
        <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-400/30">
          <Flame className="h-3 w-3 mr-1" />
          {challenges.length} Active
        </Badge>
      </div>

      {/* Challenges Grid */}
      {challenges.length === 0 ? (
        <Card className="bg-slate-900/60 backdrop-blur-xl border-purple-500/30">
          <CardContent className="p-12 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-cyan-300/50" />
            <p className="text-cyan-100/70">No active challenges at the moment. Check back soon!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {challenges.map((challenge) => {
            const isEnrolled = challenge.user_progress?.enrolled || false;
            const isCompleted = challenge.user_progress?.completed || false;
            const progress = challenge.user_progress?.progress_percentage || 0;
            const daysRemaining = getDaysRemaining(challenge.end_date);

            return (
              <Card
                key={challenge.id}
                className={cn(
                  "group bg-slate-900/60 backdrop-blur-xl border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 overflow-hidden relative",
                  isCompleted && "ring-2 ring-emerald-500/50"
                )}
              >
                {/* Gradient Header */}
                <div className={cn(
                  "h-24 bg-gradient-to-r flex items-center justify-between p-6",
                  getCategoryColor(challenge.category)
                )}>
                  <div className="flex items-center gap-3">
                    {challenge.badge_icon ? (
                      <span className="text-3xl">{challenge.badge_icon}</span>
                    ) : (
                      <Trophy className="h-8 w-8 text-white" />
                    )}
                    <div>
                      <CardTitle className="text-white text-lg font-bold">
                        {challenge.title}
                      </CardTitle>
                      <p className="text-white/80 text-xs">{challenge.category}</p>
                    </div>
                  </div>
                  {isCompleted && (
                    <CheckCircle className="h-6 w-6 text-white" />
                  )}
                </div>

                <CardContent className="p-6">
                  <p className="text-sm text-cyan-100/70 mb-4 line-clamp-2">
                    {challenge.description}
                  </p>

                  {/* Requirement */}
                  <div className="bg-slate-800/40 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-cyan-400" />
                      <span className="text-xs font-medium text-cyan-200">Challenge Goal</span>
                    </div>
                    <p className="text-sm text-white">
                      {challenge.requirement_description || `Complete ${challenge.requirement_value} ${challenge.requirement_type.replace('_', ' ')}`}
                    </p>
                  </div>

                  {/* Progress */}
                  {isEnrolled && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-cyan-100/70 mb-2">
                        <span>Your Progress</span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                      <Progress
                        value={progress}
                        className="h-2 bg-slate-700/50"
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex items-center justify-between text-xs text-cyan-100/60 mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {daysRemaining} days left
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      {challenge.points_reward} points
                    </span>
                    {isEnrolled && challenge.user_progress?.points_earned > 0 && (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Zap className="h-3 w-3" />
                        {challenge.user_progress.points_earned} earned
                      </span>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button
                    className={cn(
                      "w-full font-semibold transition-all duration-300",
                      isCompleted
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                        : isEnrolled
                        ? "bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white"
                        : "bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white"
                    )}
                    onClick={() => {
                      if (!isEnrolled && !isCompleted) {
                        handleEnroll(challenge.id);
                      }
                    }}
                    disabled={isCompleted}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Completed
                      </>
                    ) : isEnrolled ? (
                      <>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Continue Challenge
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4 mr-2" />
                        Join Challenge
                      </>
                    )}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

