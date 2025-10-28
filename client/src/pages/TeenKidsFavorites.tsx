import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Play, Sparkles, ArrowLeft, HeartOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import KidsProgressService from '@/services/KidsProgressService';
import KidsApi from '@/services/KidsApi';

const TeenKidsFavorites = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id ? String(user.id) : 'local-user';
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Teen Kids stories data
  const teenKidsStories = [
    {
      title: "Mystery Detective",
      description: "Solve crimes and mysteries while learning advanced English!",
      difficulty: 'Hard',
      duration: '12 min',
      words: 800,
      image: '🕵️',
      gradient: 'from-gray-400 to-slate-400',
      bgGradient: 'from-gray-200 to-slate-300 dark:from-gray-900 dark:to-slate-900',
      animation: 'animate-float-slow',
      type: 'mystery',
      ageGroup: 'teen',
      id: 'teen-0'
    },
    {
      title: "Space Explorer",
      description: "Navigate complex space missions and scientific discoveries!",
      difficulty: 'Hard',
      duration: '15 min',
      words: 950,
      image: '🚀',
      gradient: 'from-blue-400 to-indigo-400',
      bgGradient: 'from-blue-200 to-indigo-300 dark:from-blue-900 dark:to-indigo-900',
      animation: 'animate-bounce',
      type: 'space',
      ageGroup: 'teen',
      id: 'teen-1'
    },
    {
      title: "Environmental Hero",
      description: "Learn about climate change and environmental solutions!",
      difficulty: 'Medium',
      duration: '10 min',
      words: 700,
      image: '🌍',
      gradient: 'from-green-400 to-emerald-400',
      bgGradient: 'from-green-200 to-emerald-300 dark:from-green-900 dark:to-emerald-900',
      animation: 'animate-float-medium',
      type: 'environment',
      ageGroup: 'teen',
      id: 'teen-2'
    },
    {
      title: "Tech Innovator",
      description: "Explore the world of technology and innovation!",
      difficulty: 'Hard',
      duration: '12 min',
      words: 850,
      image: '💻',
      gradient: 'from-purple-400 to-pink-400',
      bgGradient: 'from-purple-200 to-pink-300 dark:from-purple-900 dark:to-pink-900',
      animation: 'animate-float-fast',
      type: 'technology',
      ageGroup: 'teen',
      id: 'teen-3'
    },
    {
      title: "Global Citizen",
      description: "Learn about different cultures and global issues!",
      difficulty: 'Medium',
      duration: '11 min',
      words: 750,
      image: '🌐',
      gradient: 'from-orange-400 to-red-400',
      bgGradient: 'from-orange-200 to-red-300 dark:from-orange-900 dark:to-red-900',
      animation: 'animate-float-slow',
      type: 'culture',
      ageGroup: 'teen',
      id: 'teen-4'
    },
    {
      title: "Future Leader",
      description: "Develop leadership skills and critical thinking!",
      difficulty: 'Hard',
      duration: '13 min',
      words: 900,
      image: '👑',
      gradient: 'from-yellow-400 to-orange-400',
      bgGradient: 'from-yellow-200 to-orange-300 dark:from-yellow-900 dark:to-orange-900',
      animation: 'animate-bounce',
      type: 'leadership',
      ageGroup: 'teen',
      id: 'teen-5'
    },
    {
      title: "Scientific Discovery",
      description: "Explore scientific concepts and research methods!",
      difficulty: 'Hard',
      duration: '14 min',
      words: 950,
      image: '🔬',
      gradient: 'from-cyan-400 to-blue-400',
      bgGradient: 'from-cyan-200 to-blue-300 dark:from-cyan-900 dark:to-blue-900',
      animation: 'animate-float-medium',
      type: 'science',
      ageGroup: 'teen',
      id: 'teen-6'
    },
    {
      title: "Social Media Expert",
      description: "Navigate digital communication and online safety!",
      difficulty: 'Medium',
      duration: '9 min',
      words: 650,
      image: '📱',
      gradient: 'from-pink-400 to-purple-400',
      bgGradient: 'from-pink-200 to-purple-300 dark:from-pink-900 dark:to-purple-900',
      animation: 'animate-float-fast',
      type: 'digital',
      ageGroup: 'teen',
      id: 'teen-7'
    }
  ];

  // Load favorites on mount
  useEffect(() => {
    const loadFavorites = async () => {
      if (!isAuthenticated) {
        navigate('/kids');
        return;
      }

      try {
        const token = localStorage.getItem('speakbee_auth_token');
        if (token && token !== 'local-token') {
          try {
            const serverProgress = await KidsApi.getProgress(token);
            const fav = (serverProgress as any)?.details?.favorites ?? [];
            // Convert old number-based favorites to new string-based format and filter for teen kids only
            const convertedFavorites = Array.isArray(fav) ? fav.map((f: any) => {
              if (typeof f === 'number') {
                return `teen-${f}`;
              }
              return f;
            }).filter((f: string) => f.startsWith('teen-')) : [];
            setFavorites(convertedFavorites);
          } catch {
            const localProgress = await KidsProgressService.get(userId);
            const fav = (localProgress as any).details?.favorites ?? [];
            const convertedFavorites = Array.isArray(fav) ? fav.map((f: any) => {
              if (typeof f === 'number') {
                return `teen-${f}`;
              }
              return f;
            }).filter((f: string) => f.startsWith('teen-')) : [];
            setFavorites(convertedFavorites);
          }
        } else {
          const localProgress = await KidsProgressService.get(userId);
          const fav = (localProgress as any).details?.favorites ?? [];
          const convertedFavorites = Array.isArray(fav) ? fav.map((f: any) => {
            if (typeof f === 'number') {
              return `teen-${f}`;
            }
            return f;
          }).filter((f: string) => f.startsWith('teen-')) : [];
          setFavorites(convertedFavorites);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, [isAuthenticated, userId, navigate]);

  const toggleFavorite = async (storyId: string) => {
    const next = favorites.includes(storyId)
      ? favorites.filter(id => id !== storyId)
      : [...favorites, storyId];
    setFavorites(next);
    
    try {
      const token = localStorage.getItem('speakbee_auth_token');
      if (token && token !== 'local-token') {
        try {
          const current = await KidsApi.getProgress(token);
          const details = { ...((current as any).details || {}), favorites: next };
          await KidsApi.updateProgress(token, { details });
          return;
        } catch (error) {
          console.error('Error updating favorites on server:', error);
        }
      }
      
      await KidsProgressService.update(userId, (p) => {
        const details = { ...(p as any).details };
        details.favorites = next;
        return { ...p, details } as any;
      });
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const handleStartStory = (storyId: string) => {
    const story = teenKidsStories.find(s => s.id === storyId);
    if (!story) return;
    
    navigate('/kids/teen', { 
      state: { 
        startStory: storyId,
        storyType: story.type,
        storyTitle: story.title
      } 
    });
  };

  const favoriteStories = teenKidsStories.filter(story => favorites.includes(story.id));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-16">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-[#4ECDC4] animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 sm:pb-16 md:pb-20 pt-20 sm:pt-24 md:pt-28 lg:pt-32 relative overflow-hidden">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:max-w-7xl relative z-10">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate('/kids')}
          className="mb-1 sm:mb-1.5 md:mb-2 rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border-2 border-[#4ECDC4] hover:bg-[#4ECDC4]/10 text-[#118AB2] dark:text-[#4ECDC4] font-semibold transition-all hover:scale-105"
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          <span className="hidden xs:inline">Back to Kids Zone</span>
          <span className="xs:hidden">Back</span>
        </Button>

        {/* Header */}
        <div className="text-center mb-3 sm:mb-4 md:mb-6 relative">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#118AB2] bg-clip-text text-transparent mb-1 sm:mb-1.5 md:mb-2 px-2 mt-12">
            My Favorite Stories
          </h1>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-gray-500 dark:text-gray-300 max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl mx-auto px-3 sm:px-4">
            {favoriteStories.length === 0 
              ? "You haven't added any favorites yet. Start exploring amazing stories!"
              : `You have ${favoriteStories.length} treasured ${favoriteStories.length === 1 ? 'story' : 'stories'} in your collection!`
            }
          </p>
        </div>

        {/* Content */}
        {favoriteStories.length === 0 ? (
          <div className="text-center py-3 sm:py-4 md:py-6 lg:py-8 px-2 sm:px-4">
            <div className="mb-2 sm:mb-3 md:mb-4">
              <div className="relative inline-block">
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl animate-bounce">💔</div>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#4ECDC4] absolute -top-1 sm:-top-2 -right-1 sm:-right-2 animate-pulse" />
              </div>
            </div>
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800 dark:text-white mb-1.5 sm:mb-2">
              No Favorites Yet
            </h2>
            <Button
              onClick={() => navigate('/kids/teen')}
              className="bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] hover:from-[#4ECDC4] hover:to-[#118AB2] text-white font-bold py-2.5 sm:py-3 md:py-4 px-5 sm:px-6 md:px-8 lg:px-10 rounded-lg sm:rounded-xl md:rounded-2xl text-xs sm:text-sm md:text-base lg:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            >
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1.5 sm:mr-2" />
              Explore Stories
            </Button>
          </div>
        ) : (
          <div className="mb-3 sm:mb-4 md:mb-6 lg:mb-8 px-1 sm:px-2 md:px-0">
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8">
              {favoriteStories.map((story) => {
                return (
                  <Card 
                    key={story.id}
                    className="group hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 dark:border-gray-700 hover:border-[#4ECDC4] dark:hover:border-[#4ECDC4] overflow-hidden bg-white dark:bg-gray-800 hover:scale-[1.02] transform rounded-xl sm:rounded-2xl w-full"
                  >
                    <CardContent className="p-0">
                      {/* Story Header with Gradient */}
                      <div className={cn(
                        "p-4 sm:p-5 md:p-6 relative overflow-hidden bg-gradient-to-br",
                        story.bgGradient
                      )}>
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 bg-white/20 dark:bg-black/20 rounded-full -mr-8 sm:-mr-10 md:-mr-12 -mt-8 sm:-mt-10 md:-mt-12"></div>
                        <div className="absolute bottom-0 left-0 w-14 sm:w-16 md:w-20 h-14 sm:h-16 md:h-20 bg-white/20 dark:bg-black/20 rounded-full -ml-7 sm:-ml-8 md:-ml-10 -mb-7 sm:-mb-8 md:-mb-10"></div>
                        
                        {/* Story Content */}
                        <div className="relative z-10 text-center">
                          {/* Age Group Badge */}
                          <div className={cn(
                            "absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold",
                            story.ageGroup === 'young' 
                              ? "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" 
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          )}>
                            {story.ageGroup === 'young' ? 'Ages 4-10' : 'Ages 11-17'}
                          </div>
                          
                          <div className={cn("text-4xl sm:text-5xl md:text-6xl mb-2 sm:mb-3 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6", story.animation)}>
                            {story.image}
                          </div>
                          <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1.5 sm:mb-2 text-gray-900 dark:text-white leading-tight px-1">
                            {story.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2 px-1">
                            {story.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Story Details */}
                      <div className="p-3 sm:p-4 md:p-5 bg-white dark:bg-gray-800">
                        {/* Stats */}
                        <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-gray-200 dark:border-gray-700">
                          <span className="flex items-center gap-0.5 sm:gap-1 font-semibold">
                            <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="hidden xs:inline">{story.words}</span>
                            <span className="xs:hidden">{story.words}w</span>
                          </span>
                          <span className="flex items-center gap-0.5 sm:gap-1 font-semibold">
                            <span className="hidden xs:inline">⏱️</span>
                            {story.duration}
                          </span>
                          <span className={cn(
                            "font-bold px-1.5 sm:px-2 py-0.5 rounded-full text-xs",
                            story.difficulty === 'Easy' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                            story.difficulty === 'Medium' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                            story.difficulty === 'Hard' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          )}>
                            {story.difficulty}
                          </span>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-1.5 sm:gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(story.id);
                            }}
                            className="flex-shrink-0 border-2 border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:scale-110 transition-all duration-200 rounded-lg w-9 h-9 sm:w-10 sm:h-10 p-0 flex items-center justify-center"
                            aria-label="Remove from favorites"
                          >
                            <HeartOff className="w-4 h-4 sm:w-5 sm:h-5" />
                          </Button>
                          <Button
                            className="flex-1 bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] hover:from-[#4ECDC4] hover:to-[#118AB2] text-white font-bold py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                            onClick={() => handleStartStory(story.id)}
                          >
                            <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 flex-shrink-0" />
                            <span className="hidden xs:inline">Start Adventure</span>
                            <span className="xs:hidden">Start</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        {favoriteStories.length > 0 && (
          <div className="text-center px-2 sm:px-4 md:px-6">
            <Card className="inline-block w-full sm:w-auto bg-gradient-to-r from-[#FF6B6B]/10 via-[#4ECDC4]/10 to-[#118AB2]/10 border-2 border-[#4ECDC4]/30 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl">
              <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 font-semibold mb-3 sm:mb-4">
                {favoriteStories.length} {favoriteStories.length === 1 ? 'story' : 'stories'} in your collection
              </p>
              <div className="flex gap-3 sm:gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/kids/teen')}
                  className="flex-1 sm:w-auto border-2 border-[#4ECDC4] hover:bg-[#4ECDC4]/10 text-[#118AB2] dark:text-[#4ECDC4] rounded-lg sm:rounded-xl px-4 sm:px-6 py-2 text-sm sm:text-base font-semibold transition-all hover:scale-105"
                >
                  <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Browse More Stories
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeenKidsFavorites;

