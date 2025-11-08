import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Play, Sparkles, ArrowLeft, HeartOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouteLoading } from '@/contexts/RouteLoadingContext';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import KidsProgressService from '@/services/KidsProgressService';
import KidsApi from '@/services/KidsApi';

const YoungKidsFavorites = () => {
  const navigate = useNavigate();
  const { stopLoading } = useRouteLoading();
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id ? String(user.id) : 'local-user';
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Young Kids stories data
  const youngKidsStories = [
    {
      title: "The Magic Forest",
      description: "Join Luna the rabbit on a magical listening adventure!",
      difficulty: 'Easy',
      duration: '7 min',
      words: 330,
      image: '🌳',
      gradient: 'from-green-400 to-emerald-400',
      bgGradient: 'from-green-200 to-emerald-300 dark:from-green-900 dark:to-emerald-900',
      animation: 'animate-float-slow',
      type: 'forest',
      ageGroup: 'young',
      id: 'young-0'
    },
    {
      title: "Space Adventure",
      description: "Join Cosmo on a cosmic listening journey!",
      difficulty: 'Medium',
      duration: '7 min',
      words: 490,
      image: '🚀',
      gradient: 'from-purple-400 to-indigo-400',
      bgGradient: 'from-purple-200 to-indigo-300 dark:from-purple-900 dark:to-indigo-900',
      animation: 'animate-bounce',
      type: 'space',
      ageGroup: 'young',
      id: 'young-1'
    },
    {
      title: "Underwater World",
      description: "Dive with Finn and discover ocean secrets!",
      difficulty: 'Easy',
      duration: '6 min',
      words: 450,
      image: '🐠',
      gradient: 'from-blue-400 to-cyan-400',
      bgGradient: 'from-blue-200 to-cyan-300 dark:from-blue-900 dark:to-cyan-900',
      animation: 'animate-float-medium',
      type: 'ocean',
      ageGroup: 'young',
      id: 'young-2'
    },
    {
      title: "Dinosaur Discovery",
      description: "Explore prehistoric times with Dina!",
      difficulty: 'Hard',
      duration: '7 min',
      words: 550,
      image: '🦖',
      gradient: 'from-orange-400 to-red-400',
      bgGradient: 'from-orange-200 to-red-300 dark:from-orange-900 dark:to-red-900',
      animation: 'animate-float-slow',
      type: 'dinosaur',
      ageGroup: 'young',
      id: 'young-3'
    },
    {
      title: "Unicorn Magic",
      description: "Join Stardust in a magical kingdom!",
      difficulty: 'Easy',
      duration: '5 min',
      words: 400,
      image: '🦄',
      gradient: 'from-pink-400 to-purple-400',
      bgGradient: 'from-pink-200 to-purple-300 dark:from-pink-900 dark:to-purple-900',
      animation: 'animate-float-medium',
      type: 'unicorn',
      ageGroup: 'young',
      id: 'young-4'
    },
    {
      title: "Pirate Treasure",
      description: "Sail with Captain Finn on a treasure hunt!",
      difficulty: 'Medium',
      duration: '5 min',
      words: 350,
      image: '🏴‍☠️',
      gradient: 'from-amber-400 to-yellow-400',
      bgGradient: 'from-amber-200 to-yellow-300 dark:from-amber-900 dark:to-yellow-900',
      animation: 'animate-bounce',
      type: 'pirate',
      ageGroup: 'young',
      id: 'young-5'
    },
    {
      title: "Superhero School",
      description: "Train with Captain Courage to be a hero!",
      difficulty: 'Medium',
      duration: '6 min',
      words: 420,
      image: '🦸',
      gradient: 'from-red-400 to-blue-500',
      bgGradient: 'from-red-200 to-blue-300 dark:from-red-900 dark:to-blue-900',
      animation: 'animate-float-fast',
      type: 'superhero',
      ageGroup: 'young',
      id: 'young-6'
    },
    {
      title: "Fairy Garden",
      description: "Discover tiny wonders with Twinkle the fairy!",
      difficulty: 'Easy',
      duration: '5 min',
      words: 365,
      image: '🧚',
      gradient: 'from-violet-400 to-cyan-400',
      bgGradient: 'from-violet-200 to-cyan-300 dark:from-violet-900 dark:to-cyan-900',
      animation: 'animate-float-slow',
      type: 'fairy',
      ageGroup: 'young',
      id: 'young-7'
    },
    {
      title: "Rainbow Castle",
      description: "Join Princess Aurora on a magical rainbow adventure!",
      difficulty: 'Easy',
      duration: '6 min',
      words: 350,
      image: '🌈',
      gradient: 'from-pink-400 to-purple-400',
      bgGradient: 'from-pink-200 to-purple-300 dark:from-pink-900 dark:to-purple-900',
      animation: 'animate-float-slow',
      type: 'rainbow',
      ageGroup: 'young',
      id: 'young-8'
    },
    {
      title: "Jungle Explorer",
      description: "Join Captain Leo on an exciting jungle expedition!",
      difficulty: 'Medium',
      duration: '8 min',
      words: 350,
      image: '🦁',
      gradient: 'from-orange-400 to-yellow-400',
      bgGradient: 'from-orange-200 to-yellow-300 dark:from-orange-900 dark:to-yellow-900',
      animation: 'animate-float-slow',
      type: 'jungle',
      ageGroup: 'young',
      id: 'young-9'
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
            // Convert old number-based favorites to new string-based format and filter for young kids only
            const convertedFavorites = Array.isArray(fav) ? fav.map((f: any) => {
              if (typeof f === 'number') {
                return `young-${f}`;
              }
              return f;
            }).filter((f: string) => f.startsWith('young-')) : [];
            setFavorites(convertedFavorites);
          } catch {
            const localProgress = await KidsProgressService.get(userId);
            const fav = (localProgress as any).details?.favorites ?? [];
            const convertedFavorites = Array.isArray(fav) ? fav.map((f: any) => {
              if (typeof f === 'number') {
                return `young-${f}`;
              }
              return f;
            }).filter((f: string) => f.startsWith('young-')) : [];
            setFavorites(convertedFavorites);
          }
        } else {
          const localProgress = await KidsProgressService.get(userId);
          const fav = (localProgress as any).details?.favorites ?? [];
          const convertedFavorites = Array.isArray(fav) ? fav.map((f: any) => {
            if (typeof f === 'number') {
              return `young-${f}`;
            }
            return f;
          }).filter((f: string) => f.startsWith('young-')) : [];
          setFavorites(convertedFavorites);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        const offline = !navigator.onLine;
        setIsLoading(offline);
        if (!offline) {
          stopLoading();
        }
      }
    };

    loadFavorites();
  }, [isAuthenticated, userId, navigate, stopLoading]);

  useEffect(() => {
    const handleOnline = () => {
      setIsLoading(false);
      stopLoading();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [stopLoading]);

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
    const story = youngKidsStories.find(s => s.id === storyId);
    if (!story) return;
    
    navigate('/kids/young', { 
      state: { 
        startStory: storyId,
        storyType: story.type,
        storyTitle: story.title
      } 
    });
  };

  const favoriteStories = youngKidsStories.filter(story => favorites.includes(story.id));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 pt-24 pb-16">
        <div className="text-center space-y-3">
          
          <p className="text-base font-semibold text-muted-foreground">Loading your favourites…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <main className="container mx-auto max-w-6xl px-4 pt-24 space-y-10">
        <section>
          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-[#1B4332] via-[#2D6A4F] to-[#74C69D] text-white shadow-xl">
            <span className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden />
            <span className="absolute -left-24 bottom-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" aria-hidden />
            <CardContent className="relative z-10 space-y-6 p-6 md:p-10">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="space-y-4 md:max-w-2xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/kids')}
                      className="rounded-full border-white/40 bg-white/10 px-4 py-2 text-white shadow-sm transition hover:bg-white/20 hover:text-white"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Kids Zone
                    </Button>
                    <Badge className="rounded-full bg-white/20 text-white">Favourites hub</Badge>
                  </div>
                  <div className="space-y-3">
                    <h1 className="text-3xl font-semibold leading-tight text-white md:text-4xl">
                      Your Favourite Stories
                    </h1>
                    <p className="text-base text-white/85 md:text-lg">
                      {favoriteStories.length === 0
                        ? 'Save the adventures you love most and launch them in a single tap.'
                        : `You have ${favoriteStories.length} treasured ${favoriteStories.length === 1 ? 'story' : 'stories'} ready to replay anytime.`}
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 text-sm">
                  <div className="rounded-2xl bg-white/15 px-4 py-3 text-white shadow-sm backdrop-blur">
                    <p className="text-xs uppercase tracking-wide text-white/70">Saved adventures</p>
                    <p className="text-2xl font-semibold">{favoriteStories.length}</p>
                  </div>
                  <div className="rounded-2xl bg-white/15 px-4 py-3 text-white shadow-sm backdrop-blur">
                    <p className="text-xs uppercase tracking-wide text-white/70">Quick launch</p>
                    <p className="text-sm">Tap a card to jump straight into story time.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          {favoriteStories.length === 0 ? (
            <Card className="border-dashed border-primary/30 bg-background/60 text-center shadow-sm">
              <CardContent className="space-y-6 py-12">
                <div className="relative inline-flex">
                  <div className="text-6xl animate-bounce" aria-hidden>💔</div>
                  <Sparkles className="absolute -right-2 -top-2 h-6 w-6 text-primary animate-pulse" aria-hidden />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-foreground">No favourites yet</h2>
                  <p className="mx-auto max-w-md text-sm text-muted-foreground md:text-base">
                    Complete a story and tap the heart icon to pin it here for quick replay.
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={() => navigate('/kids/young')}
                  className="mx-auto inline-flex items-center rounded-full bg-gradient-to-r from-[#1B4332] to-[#74C69D] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:from-[#74C69D] hover:to-[#1B4332] hover:shadow-lg"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Explore story library
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <h2 className="text-lg font-semibold text-foreground">Favourite adventures</h2>
                <p className="text-sm text-muted-foreground">
                  Curated from the stories you heart in the kids learning zone.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {favoriteStories.map((story) => (
                  <Card
                    key={story.id}
                    className="group flex h-full flex-col overflow-hidden border border-muted bg-card/60 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
                  >
                    <CardContent className="flex flex-1 flex-col p-0">
                      <div
                        className={cn(
                          'relative overflow-hidden bg-gradient-to-br p-5 text-white',
                          story.bgGradient
                        )}
                      >
                        <div className="absolute right-4 top-4 flex items-center gap-2 text-xs font-semibold">
                          <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur">
                            Ages 4-10
                          </span>
                        </div>
                        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/20 blur-2xl" aria-hidden />
                        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white/20 blur-2xl" aria-hidden />
                        <div className="relative z-10 space-y-3 text-center">
                          <div className={cn('text-6xl transition-transform duration-300 group-hover:scale-110', story.animation)} aria-hidden>
                            {story.image}
                          </div>
                          <h3 className="text-lg font-semibold leading-tight md:text-xl">
                            {story.title}
                          </h3>
                          <p className="text-xs text-white/85 md:text-sm">
                            {story.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col justify-between space-y-4 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1 font-semibold">
                            <BookOpen className="h-3 w-3" />
                            {story.words} words
                          </span>
                          <span className="inline-flex items-center gap-1 font-semibold">
                            ⏱ {story.duration}
                          </span>
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold',
                              story.difficulty === 'Easy' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
                              story.difficulty === 'Medium' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
                              story.difficulty === 'Hard' && 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                            )}
                          >
                            🎯 {story.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(story.id);
                            }}
                            className="h-10 w-10 rounded-full border-2 border-rose-300 text-rose-500 transition hover:bg-rose-100 dark:border-rose-600 dark:text-rose-400 dark:hover:bg-rose-900/30"
                          >
                            <HeartOff className="h-4 w-4" />
                          </Button>
                          <Button
                            className="flex-1 rounded-full bg-gradient-to-r from-[#1B4332] to-[#74C69D] text-sm font-semibold text-white shadow-sm transition hover:from-[#74C69D] hover:to-[#1B4332] hover:shadow-lg"
                            onClick={() => handleStartStory(story.id)}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Start adventure
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </section>

        {favoriteStories.length > 0 && (
          <section>
            <Card className="border border-primary/20 bg-primary/5 shadow-sm">
              <CardContent className="flex flex-col gap-4 p-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-primary">
                    {favoriteStories.length} {favoriteStories.length === 1 ? 'story saved' : 'stories saved'}
                  </p>
                  <p className="text-sm text-muted-foreground md:max-w-lg">
                    Keep exploring to unlock new adventures and enrich your word decks automatically.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/kids/young')}
                    className="rounded-full border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Browse more stories
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </main>
    </div>
  );
};

export default YoungKidsFavorites;

