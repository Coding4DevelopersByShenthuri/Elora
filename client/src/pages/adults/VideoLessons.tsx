import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Play, Search, Filter, Clock, Star, Mic, Volume2,
  BookOpen, TrendingUp, CheckCircle, ArrowRight, BarChart3,
  ChevronLeft, Grid, List, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { VideosAPI, buildMediaUrl } from '@/services/ApiService';

interface VideoLesson {
  id: number;
  slug: string;
  title: string;
  description?: string;
  thumbnail?: string;
  thumbnail_url?: string;
  video_file?: string;
  video_file_url?: string;
  video_url?: string;
  duration: number; // in seconds
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'pronunciation' | 'conversation' | 'grammar' | 'business' | 'daily';
  rating: number;
  views: number;
  speaking_exercises: number;
  progress?: {
    watched_seconds: number;
    completed: boolean;
    completion_percentage: number;
    quizzes_answered: number;
    quizzes_correct: number;
    total_points: number;
  };
  tags: string[];
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

const VideoLessons = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [lessons, setLessons] = useState<VideoLesson[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<VideoLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(searchParams.get('difficulty') || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch videos from API
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        const response = await VideosAPI.getVideos({
          difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchQuery || undefined,
        });
        
        if (response.success && 'data' in response && response.data) {
          // Map API response to component format
          const mappedLessons: VideoLesson[] = response.data.map((video: any) => {
            const thumbnailUrl = buildMediaUrl(video.thumbnail_url) || buildMediaUrl(video.thumbnail);
            const videoFileUrl = buildMediaUrl(video.video_file_url) || buildMediaUrl(video.video_file);
            const externalVideoUrl = video.video_url && (video.video_url.startsWith('http://') || video.video_url.startsWith('https://'))
              ? video.video_url
              : buildMediaUrl(video.video_url);
            
            return {
              id: video.id,
              slug: video.slug,
              title: video.title,
              description: video.description || '',
              thumbnail: thumbnailUrl || '/Lesson01_Thumb.png',
              thumbnail_url: thumbnailUrl,
              video_file_url: videoFileUrl,
              video_url: externalVideoUrl,
              duration: video.duration || 0,
              difficulty: video.difficulty,
              category: video.category,
              rating: video.rating || 0,
              views: video.views || 0,
              speaking_exercises: video.speaking_exercises || 0,
              tags: video.tags || [],
              is_active: video.is_active,
              order: video.order || 0,
              created_at: video.created_at,
              updated_at: video.updated_at,
              // Progress will be fetched separately if needed
              progress: undefined,
            };
          });
          
          setLessons(mappedLessons);
        } else {
          console.error('Failed to fetch videos:', response);
          setLessons([]);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
        setLessons([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [selectedDifficulty, selectedCategory, searchQuery]);

  // Update filtered lessons when lessons change (filtering is done by API)
  useEffect(() => {
    setFilteredLessons(lessons);

    // Update URL params
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedDifficulty !== 'all') params.set('difficulty', selectedDifficulty);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    setSearchParams(params, { replace: true });
  }, [lessons, searchQuery, selectedDifficulty, selectedCategory, setSearchParams]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-primary/20 text-primary border-primary/30 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-400/30';
      case 'intermediate':
        return 'bg-secondary/20 text-secondary border-secondary/30 dark:bg-green-500/20 dark:text-green-300 dark:border-green-400/30';
      case 'advanced':
        return 'bg-accent/20 text-accent border-accent/30 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-400/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/30 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-400/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'pronunciation':
        return Mic;
      case 'conversation':
        return Volume2;
      case 'grammar':
        return BookOpen;
      case 'business':
        return BarChart3;
      default:
        return Play;
    }
  };

  if (isLoading) {
    return (
      <div className="relative overflow-hidden min-h-screen flex items-center justify-center">
        <div className="text-foreground dark:text-white text-xl">Loading video lessons...</div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Background Elements - Matching Adults Page */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] rounded-full bg-accent/10 blur-3xl -z-10"></div>

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 pt-24 pb-16 space-y-10">
        {/* Back Button */}
        <div className="mb-4 sm:mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/adults')}
            className="text-primary hover:text-primary/80 hover:bg-primary/10 text-xs sm:text-sm dark:text-emerald-300 dark:hover:text-emerald-200 dark:hover:bg-emerald-500/20"
            size="sm"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Back to Adults Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>

        {/* Top Container */}
        <section>
          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#10b981] text-white shadow-xl dark:from-[#022c22] dark:via-[#065f46] dark:to-[#059669]">
            <span className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-3xl" aria-hidden />
            <span className="absolute -left-20 bottom-0 h-32 w-32 rounded-full bg-white/10 blur-3xl" aria-hidden />
            <CardHeader className="space-y-2 py-3 sm:py-4 md:py-5 relative z-10">
              <div className="flex flex-col gap-2 sm:gap-3">
                <div className="space-y-1 sm:space-y-2">
                  <Badge className="bg-white/25 text-white uppercase tracking-wide text-xs sm:text-sm px-2 py-0.5 sm:px-3 sm:py-1">
                    Interactive Video Lessons
                  </Badge>
                  <CardTitle className="text-lg sm:text-xl md:text-2xl font-semibold text-white leading-tight">
                    Interactive Video Lessons
                  </CardTitle>
                  <CardDescription className="text-white/85 text-sm sm:text-base leading-relaxed">
                    Engage with native speakers through interactive videos. Practice speaking, improve pronunciation, and master real-world English conversations.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </section>

        {/* Topics Filter Bar */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { label: 'All', value: 'all' },
            { label: 'Conversation', value: 'conversation' },
            { label: 'Pronunciation', value: 'pronunciation' },
            { label: 'Grammar', value: 'grammar' },
            { label: 'Business', value: 'business' },
            { label: 'Daily Life', value: 'daily' },
          ].map((topic) => (
            <button
              key={topic.value}
              onClick={() => {
                setSelectedCategory(topic.value);
                const newParams = new URLSearchParams(searchParams);
                if (topic.value === 'all') {
                  newParams.delete('category');
                } else {
                  newParams.set('category', topic.value);
                }
                setSearchParams(newParams);
              }}
              className={cn(
                'px-4 py-1.5 rounded-full border text-sm whitespace-nowrap transition-colors',
                selectedCategory === topic.value
                  ? 'border-primary bg-primary/20 text-primary dark:border-emerald-400 dark:bg-emerald-500/20 dark:text-emerald-200'
                  : 'border-primary/30 bg-card/50 text-foreground hover:bg-primary/10 dark:border-emerald-500/30 dark:bg-slate-800/50 dark:text-white dark:hover:bg-emerald-500/20'
              )}
            >
              {topic.label}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-primary dark:text-emerald-400" />
            <Input
              type="text"
              placeholder="Search video lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 sm:pl-10 h-10 sm:h-11 bg-card/80 backdrop-blur-xl border-primary/30 text-foreground placeholder:text-muted-foreground focus:border-primary/50 text-sm sm:text-base dark:bg-slate-900/60 dark:border-emerald-500/30 dark:text-white dark:placeholder:text-cyan-100/50 dark:focus:border-emerald-400/50"
            />
          </div>

          {/* Filter Toggle and View Mode */}
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-primary/30 text-primary hover:bg-primary/20 text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4 dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
            >
              <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Filters</span>
              {showFilters && <X className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />}
            </Button>

            {/* View Mode Toggle */}
            <div className="flex gap-1 sm:gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'h-9 sm:h-10 w-9 sm:w-10 p-0',
                  viewMode === 'grid' 
                    ? 'bg-primary dark:bg-emerald-500' 
                    : 'border-primary/30 text-primary hover:bg-primary/20 dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-500/20'
                )}
                aria-label="Grid view"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={cn(
                  'h-9 sm:h-10 w-9 sm:w-10 p-0',
                  viewMode === 'list' 
                    ? 'bg-primary dark:bg-emerald-500' 
                    : 'border-primary/30 text-primary hover:bg-primary/20 dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-500/20'
                )}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="p-4 sm:p-6 bg-card/80 backdrop-blur-xl border border-primary/30 rounded-xl space-y-4 sm:space-y-5 dark:bg-slate-900/60 dark:border-emerald-500/30">
              {/* Difficulty Filter */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-foreground dark:text-cyan-200 mb-2 block">Difficulty</label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'beginner', 'intermediate', 'advanced'].map((difficulty) => (
                    <Button
                      key={difficulty}
                      variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDifficulty(difficulty)}
                      className={cn(
                        'text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3',
                        selectedDifficulty === difficulty
                          ? 'bg-primary dark:bg-emerald-500'
                          : 'border-primary/30 text-primary hover:bg-primary/20 dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-500/20'
                      )}
                    >
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-xs sm:text-sm font-medium text-foreground dark:text-cyan-200 mb-2 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'pronunciation', label: 'Pronunciation' },
                    { value: 'conversation', label: 'Conversation' },
                    { value: 'grammar', label: 'Grammar' },
                    { value: 'business', label: 'Business' },
                    { value: 'daily', label: 'Daily Life' }
                  ].map((category) => (
                    <Button
                      key={category.value}
                      variant={selectedCategory === category.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.value)}
                      className={cn(
                        'text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3',
                        selectedCategory === category.value
                          ? 'bg-primary dark:bg-emerald-500'
                          : 'border-primary/30 text-primary hover:bg-primary/20 dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-500/20'
                      )}
                    >
                      {category.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedDifficulty !== 'all' || selectedCategory !== 'all' || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedDifficulty('all');
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="text-primary hover:text-primary/80 text-xs sm:text-sm h-8 sm:h-9 dark:text-emerald-300 dark:hover:text-emerald-200"
                >
                  Clear all filters
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 sm:mb-6 text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70">
          Showing {filteredLessons.length} of {lessons.length} video lessons
        </div>

        {/* Lessons Grid/List */}
        {filteredLessons.length === 0 ? (
          <Card className="bg-card/80 backdrop-blur-xl border-primary/30 dark:bg-slate-900/60 dark:border-emerald-500/30">
            <CardContent className="p-8 sm:p-12 text-center">
              <div className="text-muted-foreground dark:text-cyan-100/70 text-base sm:text-lg mb-4">No video lessons found</div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDifficulty('all');
                  setSelectedCategory('all');
                }}
                className="border-primary/30 text-primary hover:bg-primary/20 text-sm sm:text-base h-9 sm:h-10 dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
              >
                Clear filters
              </Button>
            </CardContent>
          </Card>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
                  : 'space-y-3 sm:space-y-4'
              }
            >
              {filteredLessons.map((lesson) => {
                const CategoryIcon = getCategoryIcon(lesson.category);
                return (
                  <Card
                    key={lesson.id}
                    className={cn(
                      'group cursor-pointer bg-card/80 backdrop-blur-xl border-primary/30 hover:border-primary/50 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden dark:bg-slate-900/60 dark:border-emerald-500/30 dark:hover:border-emerald-400/50',
                      viewMode === 'list' && 'flex flex-col sm:flex-row'
                    )}
                    onClick={() => {
                      navigate(`/adults/videos/${lesson.slug}`);
                    }}
                  >
                    {/* Thumbnail */}
                    <div
                      className={cn(
                        'relative overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 dark:from-emerald-500/20 dark:to-green-500/20',
                        viewMode === 'grid' 
                          ? 'aspect-video' 
                          : viewMode === 'list'
                          ? 'w-full sm:w-64 h-40 sm:h-auto sm:flex-shrink-0'
                          : ''
                      )}
                    >
                      {/* Thumbnail */}
                      {(lesson.thumbnail_url || lesson.thumbnail) && (
                        <img
                          src={lesson.thumbnail_url || buildMediaUrl(lesson.thumbnail) || ''}
                          alt={lesson.title}
                          className={cn(
                            'absolute inset-0 w-full h-full object-cover',
                            viewMode === 'list' ? 'object-cover' : 'object-cover'
                          )}
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            // Try fallback if thumbnail_url failed
                            if (lesson.thumbnail_url && lesson.thumbnail) {
                              target.src = buildMediaUrl(lesson.thumbnail) || '';
                            } else {
                              target.style.display = 'none';
                            }
                          }}
                        />
                      )}
                      {/* Fallback play icon when image fails */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="p-4 rounded-full bg-black/30 backdrop-blur-sm">
                          <Play className="w-8 h-8 text-white opacity-80" />
                        </div>
                      </div>
                      
                      {/* Progress Overlay */}
                      {lesson.progress && lesson.progress.completion_percentage > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted dark:bg-slate-800/50">
                          <div
                            className="h-full bg-primary dark:bg-emerald-500 transition-all duration-300"
                            style={{ width: `${lesson.progress.completion_percentage}%` }}
                          />
                        </div>
                      )}

                      {/* Completed Badge */}
                      {lesson.progress?.completed && (
                        <div className="absolute top-2 right-2">
                          <div className="p-1.5 rounded-full bg-emerald-500/90 backdrop-blur-sm">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}

                      {/* Duration Badge */}
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-black/60 backdrop-blur-sm text-white border-0">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDuration(lesson.duration)}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className={cn('p-4 sm:p-6 flex-1 flex flex-col', viewMode === 'list' && 'sm:flex-1')}>
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <div className={cn('p-1.5 sm:p-2 rounded-lg', getDifficultyColor(lesson.difficulty))}>
                            <CategoryIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                          </div>
                          <Badge className={cn('text-xs', getDifficultyColor(lesson.difficulty))}>
                            {lesson.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 flex-shrink-0">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-amber-600 dark:fill-amber-400" />
                          <span className="text-xs sm:text-sm font-medium text-foreground dark:text-white">{lesson.rating}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg sm:text-xl font-bold text-foreground dark:text-white mb-2 group-hover:text-primary dark:group-hover:text-emerald-300 transition-colors line-clamp-2">
                        {lesson.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-2 flex-1">
                        {lesson.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-3 sm:gap-4 text-xs text-muted-foreground dark:text-cyan-100/60 mb-3 sm:mb-4 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Mic className="w-3 h-3" />
                          <span className="whitespace-nowrap">{lesson.speaking_exercises} exercises</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span className="whitespace-nowrap">{lesson.views.toLocaleString()} views</span>
                        </span>
                      </div>

                      {/* Progress */}
                      {lesson.progress && (
                        <div className="mb-3 sm:mb-4">
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-muted-foreground dark:text-cyan-100/70">Progress</span>
                            <span className="text-foreground dark:text-white font-medium">
                              {lesson.progress.completion_percentage}%
                            </span>
                          </div>
                          <Progress
                            value={lesson.progress.completion_percentage}
                            className="h-1.5 sm:h-2 bg-muted dark:bg-slate-700/50"
                          />
                          <div className="flex items-center justify-between text-xs mt-2 text-muted-foreground dark:text-cyan-100/60">
                            <span className="text-xs">
                              {lesson.progress.quizzes_correct}/{lesson.progress.quizzes_answered} correct
                            </span>
                            <span className="text-xs">{lesson.progress.total_points} points</span>
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <Button
                        className={cn(
                          'w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm sm:text-base h-9 sm:h-10 dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600',
                          lesson.progress?.completed && 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700'
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/adults/videos/${lesson.slug}`);
                        }}
                      >
                        {lesson.progress?.completed ? (
                          <>
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                            <span className="hidden xs:inline">Review Lesson</span>
                            <span className="xs:hidden">Review</span>
                          </>
                        ) : lesson.progress ? (
                          <>
                            <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                            <span className="hidden xs:inline">Continue Learning</span>
                            <span className="xs:hidden">Continue</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                            Start Lesson
                          </>
                        )}
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    );
  };

export default VideoLessons;

