import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Play, Search, Filter, Clock, Star, Mic, Volume2,
  BookOpen, TrendingUp, CheckCircle, ArrowRight, BarChart3,
  ChevronLeft, Grid, List, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface VideoLesson {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
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
  const [stars, setStars] = useState<Array<{ x: number; y: number; size: number; delay: number; opacity: number }>>([]);

  // Generate animated stars with varying opacity
  useEffect(() => {
    const generateStars = () => {
      const newStars = Array.from({ length: 200 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 3,
        opacity: Math.random() * 0.8 + 0.2
      }));
      setStars(newStars);
    };
    generateStars();
  }, []);

  // Mock data - replace with API call
  useEffect(() => {
    const mockLessons: VideoLesson[] = [
      {
        id: '1',
        slug: 'professional-greetings',
        title: 'Professional Greetings & Introductions',
        description: 'Master formal greetings for business meetings, job interviews, and professional networking events with native speakers.',
        thumbnail: '/video-thumbs/greetings.jpg',
        duration: 325, // 5:25
        difficulty: 'beginner',
        category: 'business',
        rating: 4.8,
        views: 1250,
        speaking_exercises: 8,
        progress: {
          watched_seconds: 195,
          completed: false,
          completion_percentage: 60,
          quizzes_answered: 5,
          quizzes_correct: 4,
          total_points: 45
        },
        tags: ['greetings', 'business', 'formal', 'networking']
      },
      {
        id: '2',
        slug: 'daily-conversations',
        title: 'Daily Conversations - Coffee Shop Scenarios',
        description: 'Practice natural English conversations for ordering coffee, making small talk, and interacting in everyday situations.',
        thumbnail: '/video-thumbs/daily.jpg',
        duration: 420, // 7:00
        difficulty: 'beginner',
        category: 'daily',
        rating: 4.9,
        views: 2100,
        speaking_exercises: 12,
        progress: undefined,
        tags: ['daily', 'conversation', 'casual', 'practice']
      },
      {
        id: '3',
        slug: 'pronunciation-r-sounds',
        title: 'Master R and L Sounds',
        description: 'Perfect your pronunciation of challenging R and L sounds with guided practice and real-time feedback.',
        thumbnail: '/video-thumbs/pronunciation.jpg',
        duration: 280, // 4:40
        difficulty: 'intermediate',
        category: 'pronunciation',
        rating: 4.7,
        views: 890,
        speaking_exercises: 15,
        progress: {
          watched_seconds: 280,
          completed: true,
          completion_percentage: 100,
          quizzes_answered: 15,
          quizzes_correct: 14,
          total_points: 150
        },
        tags: ['pronunciation', 'sounds', 'practice', 'feedback']
      },
      {
        id: '4',
        slug: 'business-meetings',
        title: 'Participating in Business Meetings',
        description: 'Learn to express opinions, ask questions, and contribute effectively in professional meetings.',
        thumbnail: '/video-thumbs/meetings.jpg',
        duration: 540, // 9:00
        difficulty: 'advanced',
        category: 'business',
        rating: 4.8,
        views: 1560,
        speaking_exercises: 10,
        progress: {
          watched_seconds: 320,
          completed: false,
          completion_percentage: 59,
          quizzes_answered: 6,
          quizzes_correct: 5,
          total_points: 55
        },
        tags: ['business', 'meetings', 'professional', 'communication']
      },
      {
        id: '5',
        slug: 'telephone-english',
        title: 'Telephone English - Making Calls',
        description: 'Practice making and receiving phone calls in English with professional scenarios and common phrases.',
        thumbnail: '/video-thumbs/phone.jpg',
        duration: 360, // 6:00
        difficulty: 'intermediate',
        category: 'conversation',
        rating: 4.6,
        views: 980,
        speaking_exercises: 9,
        progress: undefined,
        tags: ['phone', 'telephone', 'calls', 'professional']
      },
      {
        id: '6',
        slug: 'presentation-skills',
        title: 'Giving Effective Presentations',
        description: 'Master the art of presenting in English with tips on structure, language, and delivery techniques.',
        thumbnail: '/video-thumbs/presentation.jpg',
        duration: 600, // 10:00
        difficulty: 'advanced',
        category: 'business',
        rating: 4.9,
        views: 2340,
        speaking_exercises: 12,
        progress: undefined,
        tags: ['presentations', 'public-speaking', 'business', 'skills']
      }
    ];

    setLessons(mockLessons);
    setIsLoading(false);
  }, []);

  // Filter lessons based on search and filters
  useEffect(() => {
    let filtered = [...lessons];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(lesson =>
        lesson.title.toLowerCase().includes(query) ||
        lesson.description.toLowerCase().includes(query) ||
        lesson.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(lesson => lesson.difficulty === selectedDifficulty);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(lesson => lesson.category === selectedCategory);
    }

    setFilteredLessons(filtered);

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
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30';
      case 'intermediate':
        return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      case 'advanced':
        return 'bg-amber-500/20 text-amber-300 border-amber-400/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-400/30';
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
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading video lessons...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
      {/* Deep Space Background with Stars */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {stars.map((star, index) => (
          <div
            key={index}
            className="absolute rounded-full bg-white animate-pulse"
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
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-radial from-purple-500/30 via-indigo-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-radial from-cyan-500/25 via-blue-500/15 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/3 w-[700px] h-[700px] bg-gradient-radial from-pink-500/20 via-rose-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Large Planet/Moon Spheres - Main Visual Elements */}
      {/* Main Large Planet - Bottom Left */}
      <div className="fixed bottom-0 left-0 w-[100px] h-[100px] sm:w-[140px] sm:h-[140px] md:w-[180px] md:h-[180px] lg:w-[220px] lg:h-[220px] xl:w-[260px] xl:h-[260px] pointer-events-none opacity-60 sm:opacity-65 md:opacity-70 lg:opacity-75 xl:opacity-80">
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

      {/* Secondary Planet - Top Right */}
      <div className="fixed top-20 right-2 sm:right-4 md:right-10 w-[100px] h-[100px] sm:w-[150px] sm:h-[150px] md:w-[200px] md:h-[200px] lg:w-[250px] lg:h-[250px] xl:w-[300px] xl:h-[300px] pointer-events-none opacity-40 sm:opacity-50 md:opacity-60 hidden sm:block">
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

      {/* Tertiary Planet - Middle Right */}
      <div className="fixed top-1/2 right-4 md:right-20 w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] md:w-[180px] md:h-[180px] lg:w-[220px] lg:h-[220px] xl:w-[250px] xl:h-[250px] pointer-events-none opacity-30 sm:opacity-40 md:opacity-50 hidden md:block">
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

      {/* Small Planet - Top Left */}
      <div className="fixed top-32 left-2 sm:left-4 md:left-20 w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] md:w-[160px] md:h-[160px] lg:w-[180px] lg:h-[180px] xl:w-[200px] xl:h-[200px] pointer-events-none opacity-25 sm:opacity-30 md:opacity-40 hidden lg:block">
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

      {/* Header */}
      <div className="relative z-10 pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-12 md:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/adults')}
            className="mb-4 sm:mb-6 text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10 text-sm sm:text-base"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Back to Adults Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>

          {/* Title Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Interactive Video Lessons
              </h1>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-cyan-100/80 max-w-3xl leading-relaxed">
              Engage with native speakers through interactive videos. Practice speaking, improve pronunciation, and master real-world English conversations.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
              <Input
                type="text"
                placeholder="Search video lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 sm:pl-10 h-10 sm:h-11 bg-slate-900/60 backdrop-blur-xl border-purple-500/30 text-white placeholder:text-cyan-100/50 focus:border-purple-400/50 text-sm sm:text-base"
              />
            </div>

            {/* Filter Toggle and View Mode */}
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-purple-400/30 text-purple-300 hover:bg-purple-500/20 text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
              >
                <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Filters</span>
                {showFilters && <X className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />}
              </Button>

              {/* View Mode Toggle - Hidden on small screens, shown on mobile+ */}
              <div className="flex gap-1 sm:gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'h-9 sm:h-10 w-9 sm:w-10 p-0',
                    viewMode === 'grid' ? 'bg-purple-500' : 'border-purple-400/30 text-purple-300 hover:bg-purple-500/20'
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
                    viewMode === 'list' ? 'bg-purple-500' : 'border-purple-400/30 text-purple-300 hover:bg-purple-500/20'
                  )}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xl border border-purple-500/30 rounded-xl space-y-4 sm:space-y-5">
                {/* Difficulty Filter */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-cyan-200 mb-2 block">Difficulty</label>
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
                            ? 'bg-purple-500'
                            : 'border-purple-400/30 text-purple-300 hover:bg-purple-500/20'
                        )}
                      >
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-cyan-200 mb-2 block">Category</label>
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
                            ? 'bg-purple-500'
                            : 'border-purple-400/30 text-purple-300 hover:bg-purple-500/20'
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
                    className="text-cyan-300 hover:text-cyan-200 text-xs sm:text-sm h-8 sm:h-9"
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-4 sm:mb-6 text-xs sm:text-sm text-cyan-100/70">
            Showing {filteredLessons.length} of {lessons.length} video lessons
          </div>

          {/* Lessons Grid/List */}
          {filteredLessons.length === 0 ? (
            <Card className="bg-slate-900/60 backdrop-blur-xl border-purple-500/30">
              <CardContent className="p-8 sm:p-12 text-center">
                <div className="text-cyan-100/70 text-base sm:text-lg mb-4">No video lessons found</div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDifficulty('all');
                    setSelectedCategory('all');
                  }}
                  className="border-purple-400/30 text-purple-300 hover:bg-purple-500/20 text-sm sm:text-base h-9 sm:h-10"
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
                      'group cursor-pointer bg-slate-900/60 backdrop-blur-xl border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 overflow-hidden',
                      viewMode === 'list' && 'flex flex-col sm:flex-row'
                    )}
                    onClick={() => navigate(`/adults/videos/${lesson.slug}`)}
                  >
                    {/* Thumbnail */}
                    <div
                      className={cn(
                        'relative overflow-hidden bg-gradient-to-br from-cyan-500/20 to-purple-500/20',
                        viewMode === 'grid' 
                          ? 'aspect-video' 
                          : viewMode === 'list'
                          ? 'w-full sm:w-64 h-40 sm:h-auto sm:flex-shrink-0'
                          : ''
                      )}
                    >
                      {/* Placeholder for video thumbnail */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="p-4 rounded-full bg-white/10 backdrop-blur-sm">
                          <Play className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      
                      {/* Progress Overlay */}
                      {lesson.progress && lesson.progress.completion_percentage > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800/50">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
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
                        <div className="flex items-center gap-1 text-amber-400 flex-shrink-0">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-amber-400" />
                          <span className="text-xs sm:text-sm font-medium">{lesson.rating}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors line-clamp-2">
                        {lesson.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-cyan-100/70 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-2 flex-1">
                        {lesson.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-3 sm:gap-4 text-xs text-cyan-100/60 mb-3 sm:mb-4 flex-wrap">
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
                            <span className="text-cyan-100/70">Progress</span>
                            <span className="text-white font-medium">
                              {lesson.progress.completion_percentage}%
                            </span>
                          </div>
                          <Progress
                            value={lesson.progress.completion_percentage}
                            className="h-1.5 sm:h-2 bg-slate-700/50"
                          />
                          <div className="flex items-center justify-between text-xs mt-2 text-cyan-100/60">
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
                          'w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold text-sm sm:text-base h-9 sm:h-10',
                          lesson.progress?.completed && 'bg-emerald-500 hover:bg-emerald-600'
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
        </div>
      </div>
    </div>
  );
};

export default VideoLessons;

