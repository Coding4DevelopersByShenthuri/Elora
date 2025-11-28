import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Play, CheckCircle, Clock, Star, ArrowRight,
  Search, Filter, TrendingUp, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { AdultsAPI } from '@/services/ApiService';
import { useAuth } from '@/contexts/AuthContext';

interface CommonLesson {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_minutes: number;
  points_reward: number;
  thumbnail_url?: string;
  views: number;
  completion_count: number;
  average_score: number;
}

interface Enrollment {
  id: number;
  lesson: CommonLesson;
  enrolled_at: string;
  started_at?: string;
  completed_at?: string;
  completed: boolean;
  progress_percentage: number;
  score: number;
  time_spent_minutes: number;
  attempts: number;
}

export default function CommonLessonsLibrary() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lessons, setLessons] = useState<CommonLesson[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [categoryFilter, difficultyFilter, searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [lessonsRes, enrollmentsRes] = await Promise.all([
        AdultsAPI.getCommonLessons({
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined,
          search: searchQuery || undefined,
        }),
        AdultsAPI.getCommonLessonEnrollments(),
      ]);

      if (lessonsRes.success && 'data' in lessonsRes) {
        setLessons(lessonsRes.data?.lessons || []);
      }
      if (enrollmentsRes.success && 'data' in enrollmentsRes) {
        setEnrollments(enrollmentsRes.data?.enrollments || []);
      }
    } catch (error) {
      console.error('Failed to load common lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (lessonId: number) => {
    try {
      const result = await AdultsAPI.enrollCommonLesson(lessonId);
      if (result.success) {
        loadData();
      }
    } catch (error) {
      console.error('Failed to enroll:', error);
    }
  };

  const getEnrollment = (lessonId: number) => {
    return enrollments.find(e => e.lesson.id === lessonId);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'from-cyan-500 to-blue-600';
      case 'intermediate':
        return 'from-purple-500 to-pink-600';
      case 'advanced':
        return 'from-amber-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'grammar':
        return '📚';
      case 'vocabulary':
        return '📖';
      case 'pronunciation':
        return '🗣️';
      case 'conversation':
        return '💬';
      case 'business':
        return '💼';
      case 'culture':
        return '🌍';
      case 'idioms':
        return '✨';
      default:
        return '📝';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white mb-2">Common Lessons Library</h2>
        <p className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70 mb-4 sm:mb-6">Shared lessons across all adult levels - Build foundational skills</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary dark:text-emerald-300" />
          <Input
            placeholder="Search lessons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/60 backdrop-blur-xl border-primary/30 text-foreground placeholder:text-muted-foreground dark:bg-slate-900/60 dark:border-emerald-500/30 dark:text-white dark:placeholder:text-cyan-100/50"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-card/60 backdrop-blur-xl border-primary/30 text-foreground dark:bg-slate-900/60 dark:border-emerald-500/30 dark:text-white">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="grammar">Grammar</SelectItem>
            <SelectItem value="vocabulary">Vocabulary</SelectItem>
            <SelectItem value="pronunciation">Pronunciation</SelectItem>
            <SelectItem value="conversation">Conversation</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="culture">Culture</SelectItem>
            <SelectItem value="idioms">Idioms</SelectItem>
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-card/60 backdrop-blur-xl border-primary/30 text-foreground dark:bg-slate-900/60 dark:border-emerald-500/30 dark:text-white">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lessons Grid */}
      {lessons.length === 0 ? (
        <Card className="bg-card/60 backdrop-blur-xl border-primary/30 dark:bg-slate-900/60 dark:border-emerald-500/30">
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary dark:text-emerald-300" />
            <p className="text-muted-foreground dark:text-cyan-100/70">No lessons found. Try adjusting your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {lessons.map((lesson) => {
            const enrollment = getEnrollment(lesson.id);
            const isEnrolled = !!enrollment;
            const isCompleted = enrollment?.completed || false;

            return (
              <Card
                key={lesson.id}
                className={cn(
                  "group bg-card/80 backdrop-blur-xl border-primary/30 hover:border-primary/50 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden dark:bg-slate-900/60 dark:border-emerald-500/30 dark:hover:border-emerald-400/50",
                  isCompleted && "ring-2 ring-emerald-500/50"
                )}
              >
                <CardHeader className="p-0">
                  <div className={cn(
                    "h-32 bg-gradient-to-r flex items-center justify-center text-4xl",
                    getDifficultyColor(lesson.difficulty)
                  )}>
                    {getCategoryIcon(lesson.category)}
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-foreground dark:text-white mb-2 line-clamp-2">
                        {lesson.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground dark:text-cyan-100/70 line-clamp-2 mb-3">
                        {lesson.description}
                      </p>
                    </div>
                    {isCompleted && (
                      <CheckCircle className="h-5 w-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0 ml-2" />
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="text-xs bg-primary/20 text-primary border-primary/30 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-400/30">
                      {lesson.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-primary/20 text-primary border-primary/30 dark:bg-slate-700/50 dark:text-cyan-200 dark:border-cyan-500/30">
                      {lesson.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-amber-500/20 text-amber-700 border-amber-400/30 dark:text-amber-300 dark:border-amber-400/30">
                      <Star className="h-3 w-3 mr-1" />
                      {lesson.average_score.toFixed(1)}
                    </Badge>
                  </div>

                  {isEnrolled && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground dark:text-cyan-100/70 mb-2">
                        <span>Progress</span>
                        <span className="text-foreground dark:text-white">{enrollment.progress_percentage.toFixed(0)}%</span>
                      </div>
                      <Progress
                        value={enrollment.progress_percentage}
                        className="h-2 bg-muted dark:bg-slate-700/50"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground dark:text-cyan-100/60 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {lesson.duration_minutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      {lesson.points_reward} pts
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {lesson.completion_count} completed
                    </span>
                  </div>

                  <Button
                    className={cn(
                      "w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-300 dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600",
                      isEnrolled && isCompleted && "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                    )}
                    onClick={() => {
                      if (!isEnrolled) {
                        handleEnroll(lesson.id);
                      } else {
                        navigate(`/adults/common-lessons/${lesson.id}`);
                      }
                    }}
                  >
                    {isEnrolled ? (
                      isCompleted ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Continue
                        </>
                      )
                    ) : (
                      <>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Enroll Now
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

