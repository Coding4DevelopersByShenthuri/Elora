import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Play, CheckCircle, Clock, Star, ArrowRight,
  Filter, Sparkles, TrendingUp, SearchX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { AdultsAPI } from '@/services/ApiService';
import { useAuth } from '@/contexts/AuthContext';

interface MicrolearningModule {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  content: any;
  duration_minutes: number;
  points_reward: number;
  thumbnail_url?: string;
  is_active: boolean;
  is_featured: boolean;
  views: number;
  completion_count: number;
  user_progress?: {
    completed: boolean;
    score: number;
    attempts: number;
  };
}

export default function MicrolearningModules() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [modules, setModules] = useState<MicrolearningModule[]>([]);
  const [featuredModules, setFeaturedModules] = useState<MicrolearningModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showFeatured, setShowFeatured] = useState(true);

  useEffect(() => {
    loadModules();
  }, [categoryFilter]);

  const loadModules = async () => {
    try {
      setLoading(true);
      const [allModulesRes, featuredRes] = await Promise.all([
        AdultsAPI.getMicrolearningModules(categoryFilter !== 'all' ? categoryFilter : undefined),
        AdultsAPI.getFeaturedMicrolearning(),
      ]);

      if (allModulesRes.success && 'data' in allModulesRes) {
        setModules(allModulesRes.data?.modules || []);
      }
      if (featuredRes.success && 'data' in featuredRes) {
        setFeaturedModules(featuredRes.data?.modules || []);
      }
    } catch (error) {
      console.error('Failed to load microlearning modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      quick_tip: 'Quick Tip',
      vocabulary_boost: 'Vocabulary Boost',
      grammar_refresher: 'Grammar Refresher',
      pronunciation_tip: 'Pronunciation Tip',
      idiom_of_day: 'Idiom of the Day',
      business_phrase: 'Business Phrase',
    };
    return labels[category] || category;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'quick_tip':
        return '💡';
      case 'vocabulary_boost':
        return '📚';
      case 'grammar_refresher':
        return '📖';
      case 'pronunciation_tip':
        return '🗣️';
      case 'idiom_of_day':
        return '✨';
      case 'business_phrase':
        return '💼';
      default:
        return '📝';
    }
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
        <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white mb-2">Microlearning Modules</h2>
        <p className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70 mb-4 sm:mb-6">Quick 5-10 minute lessons for busy professionals</p>
        <div className="flex gap-2 mb-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-card/60 backdrop-blur-xl border-primary/30 text-foreground dark:bg-slate-900/60 dark:border-emerald-500/30 dark:text-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="quick_tip">Quick Tips</SelectItem>
              <SelectItem value="vocabulary_boost">Vocabulary</SelectItem>
              <SelectItem value="grammar_refresher">Grammar</SelectItem>
              <SelectItem value="pronunciation_tip">Pronunciation</SelectItem>
              <SelectItem value="idiom_of_day">Idioms</SelectItem>
              <SelectItem value="business_phrase">Business</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Featured Modules */}
      {showFeatured && featuredModules.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-lg font-semibold text-foreground dark:text-white">Featured This Week</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredModules.map((module) => {
              const isCompleted = module.user_progress?.completed || false;

              return (
                <Card
                  key={module.id}
                  className={cn(
                    "group bg-card/80 backdrop-blur-xl border-primary/30 hover:border-primary/50 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden dark:bg-slate-900/60 dark:border-emerald-500/30 dark:hover:border-emerald-400/50",
                    isCompleted && "ring-2 ring-emerald-500/50"
                  )}
                >
                  <CardHeader className="p-0">
                    <div className={cn(
                      "h-24 bg-gradient-to-r flex items-center justify-center text-4xl",
                      getDifficultyColor(module.difficulty)
                    )}>
                      {getCategoryIcon(module.category)}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <CardTitle className="text-lg font-bold text-foreground dark:text-white line-clamp-2 flex-1">
                        {module.title}
                      </CardTitle>
                      {isCompleted && (
                        <CheckCircle className="h-5 w-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0 ml-2" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground dark:text-cyan-100/70 line-clamp-2 mb-4">
                      {module.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground dark:text-cyan-100/60 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {module.duration_minutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {module.points_reward} pts
                      </span>
                      <Badge variant="outline" className="text-xs bg-amber-500/20 text-amber-700 border-amber-400/30 dark:text-amber-300 dark:border-amber-400/30">
                        Featured
                      </Badge>
                    </div>
                    <Button
                      className={cn(
                        "w-full font-semibold transition-all duration-300",
                        isCompleted
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700"
                          : "bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600"
                      )}
                      onClick={() => navigate(`/adults/microlearning/${module.id}`)}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Review
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start Now
                        </>
                      )}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* All Modules */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground dark:text-white">All Modules</h3>
        {modules.length === 0 ? (
          <Card className="bg-card/60 backdrop-blur-xl border-primary/30 dark:bg-slate-900/60 dark:border-emerald-500/30">
            <CardContent className="p-12 text-center">
              <SearchX className="h-12 w-12 mx-auto mb-4 text-primary dark:text-emerald-300" />
              <p className="text-muted-foreground dark:text-cyan-100/70">No modules found. Try adjusting your filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {modules.map((module) => {
              const isCompleted = module.user_progress?.completed || false;

              return (
                <Card
                  key={module.id}
                  className={cn(
                    "group bg-card/80 backdrop-blur-xl border-primary/30 hover:border-primary/50 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden dark:bg-slate-900/60 dark:border-emerald-500/30 dark:hover:border-emerald-400/50",
                    isCompleted && "ring-2 ring-emerald-500/50"
                  )}
                >
                  <CardHeader className="p-0">
                    <div className={cn(
                      "h-24 bg-gradient-to-r flex items-center justify-center text-4xl",
                      getDifficultyColor(module.difficulty)
                    )}>
                      {getCategoryIcon(module.category)}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-foreground dark:text-white mb-2 line-clamp-2">
                          {module.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground dark:text-cyan-100/70 line-clamp-2 mb-3">
                          {module.description}
                        </p>
                      </div>
                      {isCompleted && (
                        <CheckCircle className="h-5 w-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0 ml-2" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline" className="text-xs bg-primary/20 text-primary border-primary/30 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-400/30">
                        {getCategoryLabel(module.category)}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-primary/20 text-primary border-primary/30 dark:bg-slate-700/50 dark:text-cyan-200 dark:border-cyan-500/30">
                        {module.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground dark:text-cyan-100/60 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {module.duration_minutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {module.points_reward} pts
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {module.completion_count} completed
                      </span>
                    </div>
                    <Button
                      className={cn(
                        "w-full font-semibold transition-all duration-300",
                        isCompleted
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700"
                          : "bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600"
                      )}
                      onClick={() => navigate(`/adults/microlearning/${module.id}`)}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Review
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start Module
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
    </div>
  );
}

