import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, Play, HeartOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import KidsApi from '@/services/KidsApi';
import KidsProgressService from '@/services/KidsProgressService';
import { API } from '@/services/ApiService';
import TeenApi from '@/services/TeenApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const youngStories = [
  {
    title: 'The Magic Forest',
    description: 'Join Luna the rabbit on a magical listening adventure!',
    difficulty: 'Easy',
    duration: '7 min',
    words: 330,
    image: '🌳',
    gradient: 'from-green-400 to-emerald-400',
    bgGradient: 'from-green-200 to-emerald-300 dark:from-green-900 dark:to-emerald-900',
    animation: 'animate-float-slow',
    type: 'forest',
    ageGroup: 'young' as const,
    id: 'young-0',
  },
  {
    title: 'Space Adventure',
    description: 'Join Cosmo on a cosmic listening journey!',
    difficulty: 'Medium',
    duration: '7 min',
    words: 490,
    image: '🚀',
    gradient: 'from-purple-400 to-indigo-400',
    bgGradient: 'from-purple-200 to-indigo-300 dark:from-purple-900 dark:to-indigo-900',
    animation: 'animate-bounce',
    type: 'space',
    ageGroup: 'young' as const,
    id: 'young-1',
  },
  {
    title: 'Underwater World',
    description: 'Dive with Finn and discover ocean secrets!',
    difficulty: 'Easy',
    duration: '6 min',
    words: 450,
    image: '🐠',
    gradient: 'from-blue-400 to-cyan-400',
    bgGradient: 'from-blue-200 to-cyan-300 dark:from-blue-900 dark:to-cyan-900',
    animation: 'animate-float-medium',
    type: 'ocean',
    ageGroup: 'young' as const,
    id: 'young-2',
  },
  {
    title: 'Dinosaur Discovery',
    description: 'Explore prehistoric times with Dina!',
    difficulty: 'Hard',
    duration: '7 min',
    words: 550,
    image: '🦖',
    gradient: 'from-orange-400 to-red-400',
    bgGradient: 'from-orange-200 to-red-300 dark:from-orange-900 dark:to-red-900',
    animation: 'animate-float-slow',
    type: 'dinosaur',
    ageGroup: 'young' as const,
    id: 'young-3',
  },
  {
    title: 'Unicorn Magic',
    description: 'Join Stardust in a magical kingdom!',
    difficulty: 'Easy',
    duration: '5 min',
    words: 400,
    image: '🦄',
    gradient: 'from-pink-400 to-purple-400',
    bgGradient: 'from-pink-200 to-purple-300 dark:from-pink-900 dark:to-purple-900',
    animation: 'animate-float-medium',
    type: 'unicorn',
    ageGroup: 'young' as const,
    id: 'young-4',
  },
  {
    title: 'Pirate Treasure',
    description: 'Sail with Captain Finn on a treasure hunt!',
    difficulty: 'Medium',
    duration: '5 min',
    words: 350,
    image: '🏴‍☠️',
    gradient: 'from-amber-400 to-yellow-400',
    bgGradient: 'from-amber-200 to-yellow-300 dark:from-amber-900 dark:to-yellow-900',
    animation: 'animate-bounce',
    type: 'pirate',
    ageGroup: 'young' as const,
    id: 'young-5',
  },
  {
    title: 'Superhero School',
    description: 'Train with Captain Courage to be a hero!',
    difficulty: 'Medium',
    duration: '6 min',
    words: 420,
    image: '🦸',
    gradient: 'from-red-400 to-blue-500',
    bgGradient: 'from-red-200 to-blue-300 dark:from-red-900 dark:to-blue-900',
    animation: 'animate-float-fast',
    type: 'superhero',
    ageGroup: 'young' as const,
    id: 'young-6',
  },
  {
    title: 'Fairy Garden',
    description: 'Discover tiny wonders with Twinkle the fairy!',
    difficulty: 'Easy',
    duration: '5 min',
    words: 365,
    image: '🧚',
    gradient: 'from-violet-400 to-cyan-400',
    bgGradient: 'from-violet-200 to-cyan-300 dark:from-violet-900 dark:to-cyan-900',
    animation: 'animate-float-slow',
    type: 'fairy',
    ageGroup: 'young' as const,
    id: 'young-7',
  },
  {
    title: 'Rainbow Castle',
    description: 'Join Princess Aurora on a magical rainbow adventure!',
    difficulty: 'Easy',
    duration: '6 min',
    words: 350,
    image: '🌈',
    gradient: 'from-pink-400 to-purple-400',
    bgGradient: 'from-pink-200 to-purple-300 dark:from-pink-900 dark:to-purple-900',
    animation: 'animate-float-slow',
    type: 'rainbow',
    ageGroup: 'young' as const,
    id: 'young-8',
  },
  {
    title: 'Jungle Explorer',
    description: 'Join Captain Leo on an exciting jungle expedition!',
    difficulty: 'Medium',
    duration: '8 min',
    words: 350,
    image: '🦁',
    gradient: 'from-orange-400 to-yellow-400',
    bgGradient: 'from-orange-200 to-yellow-300 dark:from-orange-900 dark:to-yellow-900',
    animation: 'animate-float-slow',
    type: 'jungle',
    ageGroup: 'young' as const,
    id: 'young-9',
  },
];

const teenStories = [
  {
    title: 'Mystery Detective',
    description: 'Solve complex mysteries while sharpening critical thinking and English comprehension.',
    difficulty: 'Hard',
    duration: '12 min',
    words: 800,
    image: '🕵️',
    gradient: 'from-slate-500 to-slate-700',
    bgGradient: 'from-slate-200 to-slate-300 dark:from-slate-900 dark:to-slate-950',
    animation: 'animate-float-slow',
    type: 'mystery',
    ageGroup: 'teen' as const,
    id: 'teen-0',
  },
  {
    title: 'Space Explorer',
    description: 'Navigate scientific missions that test your vocabulary, logic, and teamwork.',
    difficulty: 'Hard',
    duration: '15 min',
    words: 950,
    image: '🚀',
    gradient: 'from-indigo-500 to-blue-600',
    bgGradient: 'from-blue-200 to-indigo-300 dark:from-indigo-900 dark:to-slate-900',
    animation: 'animate-bounce',
    type: 'space',
    ageGroup: 'teen' as const,
    id: 'teen-1',
  },
  {
    title: 'Environmental Hero',
    description: 'Design solutions for real-world climate challenges and communicate your ideas clearly.',
    difficulty: 'Medium',
    duration: '10 min',
    words: 700,
    image: '🌍',
    gradient: 'from-emerald-400 to-green-500',
    bgGradient: 'from-emerald-200 to-green-300 dark:from-emerald-900 dark:to-green-950',
    animation: 'animate-float-medium',
    type: 'environment',
    ageGroup: 'teen' as const,
    id: 'teen-2',
  },
  {
    title: 'Tech Innovator',
    description: 'Prototype emerging technology and pitch futuristic solutions with persuasive language.',
    difficulty: 'Hard',
    duration: '12 min',
    words: 850,
    image: '💻',
    gradient: 'from-purple-500 to-fuchsia-500',
    bgGradient: 'from-purple-200 to-fuchsia-300 dark:from-purple-900 dark:to-fuchsia-950',
    animation: 'animate-float-fast',
    type: 'technology',
    ageGroup: 'teen' as const,
    id: 'teen-3',
  },
  {
    title: 'Global Citizen',
    description: 'Work through cultural case studies and build empathy-driven communication skills.',
    difficulty: 'Medium',
    duration: '11 min',
    words: 750,
    image: '🌐',
    gradient: 'from-orange-400 to-rose-500',
    bgGradient: 'from-orange-200 to-rose-300 dark:from-orange-900 dark:to-rose-950',
    animation: 'animate-float-slow',
    type: 'culture',
    ageGroup: 'teen' as const,
    id: 'teen-4',
  },
  {
    title: 'Future Leader',
    description: 'Lead a team through strategic challenges and develop confident presentation skills.',
    difficulty: 'Hard',
    duration: '13 min',
    words: 900,
    image: '👑',
    gradient: 'from-amber-400 to-yellow-500',
    bgGradient: 'from-amber-200 to-yellow-300 dark:from-amber-900 dark:to-yellow-950',
    animation: 'animate-bounce',
    type: 'leadership',
    ageGroup: 'teen' as const,
    id: 'teen-5',
  },
  {
    title: 'Scientific Discovery',
    description: 'Investigate experiments, interpret data, and report findings like a research professional.',
    difficulty: 'Hard',
    duration: '14 min',
    words: 950,
    image: '🔬',
    gradient: 'from-cyan-400 to-blue-500',
    bgGradient: 'from-cyan-200 to-blue-300 dark:from-cyan-900 dark:to-blue-950',
    animation: 'animate-float-medium',
    type: 'science',
    ageGroup: 'teen' as const,
    id: 'teen-6',
  },
  {
    title: 'Social Media Expert',
    description: 'Craft impactful digital campaigns focused on safety, ethics, and persuasive messaging.',
    difficulty: 'Medium',
    duration: '9 min',
    words: 650,
    image: '📱',
    gradient: 'from-pink-400 to-purple-500',
    bgGradient: 'from-pink-200 to-purple-300 dark:from-pink-900 dark:to-purple-950',
    animation: 'animate-float-fast',
    type: 'digital',
    ageGroup: 'teen' as const,
    id: 'teen-7',
  },
  {
    title: 'AI Ethics Explorer',
    description: 'Debate responsible AI with evidence-based arguments and collaborative solutions.',
    difficulty: 'Hard',
    duration: '14 min',
    words: 980,
    image: '🤖',
    gradient: 'from-indigo-500 to-violet-600',
    bgGradient: 'from-indigo-200 to-violet-300 dark:from-indigo-900 dark:to-violet-950',
    animation: 'animate-float-medium',
    type: 'ai',
    ageGroup: 'teen' as const,
    id: 'teen-8',
  },
  {
    title: 'Digital Security Guardian',
    description: 'Protect data, decode cyber threats, and master professional communication about online safety.',
    difficulty: 'Hard',
    duration: '13 min',
    words: 920,
    image: '🔐',
    gradient: 'from-rose-500 to-red-600',
    bgGradient: 'from-rose-200 to-red-300 dark:from-rose-900 dark:to-red-950',
    animation: 'animate-float-slow',
    type: 'cybersecurity',
    ageGroup: 'teen' as const,
    id: 'teen-9',
  },
];

type StoryDefinition = (typeof youngStories)[number] | (typeof teenStories)[number];

const storyCatalog = [...youngStories, ...teenStories].reduce<Record<string, StoryDefinition>>(
  (map, story) => {
    map[story.id] = story;
    return map;
  },
  {}
);

type AudienceFilter = 'all' | 'young' | 'teen';

const FavoritesPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<AudienceFilter>('all');

  useEffect(() => {
    const requestedAudience = searchParams.get('audience');
    if (requestedAudience === 'young' || requestedAudience === 'teen') {
      setActiveFilter(requestedAudience);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!isAuthenticated) {
        navigate('/kids');
        return;
      }

      try {
        const token = localStorage.getItem('speakbee_auth_token');
        const aggregated = new Set<string>();

        if (token && token !== 'local-token') {
          try {
            const response = await API.kids.getFavorites();
            const data = Array.isArray((response as any)?.data) ? (response as any).data : response;
            if (Array.isArray(data)) {
              data.forEach((item: any) => aggregated.add(String(item.story_id)));
            }
          } catch (error) {
            console.warn('Favorites endpoint not available, falling back to kids progress:', error);
            try {
              const progress = await KidsApi.getProgress(token);
              const raw = (progress as any)?.details?.favorites ?? [];
              if (Array.isArray(raw)) {
                raw.forEach((f: any) => {
                  if (typeof f === 'number') {
                    aggregated.add(`young-${f}`);
                  } else {
                    aggregated.add(String(f));
                  }
                });
              }
            } catch (progressError) {
              console.warn('Unable to load kids favorites from progress:', progressError);
            }
          }

          try {
            const teenDashboard = await TeenApi.getDashboard(token);
            const teenFavorites = Array.isArray((teenDashboard as any)?.favorites)
              ? (teenDashboard as any).favorites
              : [];
            teenFavorites.forEach((id: any) => aggregated.add(String(id)));
          } catch (error) {
            console.warn('Unable to load teen favorites:', error);
          }
        } else if (user?.id) {
          try {
            const local = await KidsProgressService.get(String(user.id));
            const raw = (local as any)?.details?.favorites ?? [];
            if (Array.isArray(raw)) {
              raw.forEach((f: any) => {
                if (typeof f === 'number') {
                  aggregated.add(`young-${f}`);
                } else {
                  aggregated.add(String(f));
                }
              });
            }
          } catch (error) {
            console.warn('Unable to load offline favorites:', error);
          }
        }

        setFavorites(Array.from(aggregated));
      } catch (error) {
        console.error('Failed to load favorites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, [isAuthenticated, navigate, user?.id]);

  const favoriteStories = useMemo(() => {
    return favorites
      .map((id) => storyCatalog[id])
      .filter(Boolean)
      .filter((story) => {
        if (activeFilter === 'all') return true;
        return story?.ageGroup === activeFilter;
      });
  }, [favorites, activeFilter]);

  const stats = useMemo(() => {
    const youngCount = favorites.filter((id) => id.startsWith('young-')).length;
    const teenCount = favorites.filter((id) => id.startsWith('teen-')).length;
    return {
      total: favorites.length,
      young: youngCount,
      teen: teenCount,
    };
  }, [favorites]);

  const toggleFavorite = async (storyId: string) => {
    const willAdd = !favorites.includes(storyId);
    const previous = favorites;
    const next = willAdd ? [...favorites, storyId] : favorites.filter((id) => id !== storyId);
    setFavorites(next);

    try {
      const token = localStorage.getItem('speakbee_auth_token');
      if (storyId.startsWith('teen-')) {
        if (token && token !== 'local-token') {
          await TeenApi.toggleFavorite(token, { storyId, add: willAdd });
        } else {
          console.warn('Teen favorites require an online teen profile.');
          setFavorites(previous);
        }
        return;
      }

      if (token && token !== 'local-token') {
        await API.kids.toggleFavorite(storyId, willAdd);
        const progress = await KidsApi.getProgress(token);
        const details = { ...((progress as any).details || {}), favorites: next };
        await KidsApi.updateProgress(token, { details });
      } else if (user?.id) {
        await KidsProgressService.update(String(user.id), (p) => {
          const progress: any = p as any;
          const details = { ...(progress.details || {}) };
          details.favorites = next;
          return { ...progress, details } as any;
        });
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      setFavorites(previous);
    }
  };

  const handleStartStory = (storyId: string) => {
    const story = storyCatalog[storyId];
    if (!story) return;

    const target = story.ageGroup === 'teen' ? '/kids/teen' : '/kids/young';
    navigate(target, {
      state: {
        startStory: storyId,
        storyType: story.type,
        storyTitle: story.title,
      },
    });
  };

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
                      <BookOpen className="mr-2 h-4 w-4" />
                      Back to Kids Zone
                    </Button>
                    <Badge className="rounded-full bg-white/20 text-white">Favourite hub</Badge>
                    <Badge className="rounded-full bg-white/20 text-white">
                      Young: {stats.young} · Teen: {stats.teen}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <h1 className="text-3xl font-semibold leading-tight text-white md:text-4xl">
                      All your favourite adventures, in one place
                    </h1>
                    <p className="text-base text-white/85 md:text-lg">
                      {stats.total === 0
                        ? 'Save the adventures you love most and relaunch them instantly.'
                        : `You have ${stats.total} curated ${stats.total === 1 ? 'story' : 'stories'} ready to explore again.`}
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 text-sm">
                  <div className="rounded-2xl bg-white/15 px-4 py-3 text-white shadow-sm backdrop-blur">
                    <p className="text-xs uppercase tracking-wide text-white/70">Young favourites</p>
                    <p className="text-2xl font-semibold">{stats.young}</p>
                  </div>
                  <div className="rounded-2xl bg-white/15 px-4 py-3 text-white shadow-sm backdrop-blur">
                    <p className="text-xs uppercase tracking-wide text-white/70">Teen favourites</p>
                    <p className="text-2xl font-semibold">{stats.teen}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['all', 'young', 'teen'] as AudienceFilter[]).map((filter) => (
                  <Button
                    key={filter}
                    variant={activeFilter === filter ? 'default' : 'ghost'}
                    onClick={() => setActiveFilter(filter)}
                    className={cn(
                      'rounded-full px-4 py-2 text-sm font-semibold transition',
                      activeFilter === filter
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-white hover:bg-white/10'
                    )}
                  >
                    {filter === 'all'
                      ? 'All stories'
                      : filter === 'young'
                      ? 'Young favourites'
                      : 'Teen favourites'}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          {favoriteStories.length === 0 ? (
            <Card className="border-dashed border-primary/30 bg-background/60 text-center shadow-sm">
              <CardContent className="space-y-6 py-12">
                <div className="relative inline-flex">
                  <div className="text-6xl animate-bounce" aria-hidden>
                    💫
                  </div>
                  
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-foreground">No favourites yet</h2>
                  <p className="mx-auto max-w-md text-sm text-muted-foreground md:text-base">
                    Complete a story and tap the heart icon to pin it here for quick replay.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button
                    size="lg"
                    onClick={() => navigate('/kids/young')}
                    className="inline-flex items-center rounded-full bg-gradient-to-r from-[#1B4332] to-[#74C69D] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:from-[#74C69D] hover:to-[#1B4332] hover:shadow-lg"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Explore young stories
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/kids/teen')}
                    className="rounded-full border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
                  >
                    Explore teen stories
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {favoriteStories.map((story) => (
                  <Card
                    key={story.id}
                    className="group flex h-full flex-col overflow-hidden border border-muted bg-card/70 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
                  >
                    <CardContent className="flex flex-1 flex-col p-0">
                      <div
                        className={cn(
                          'relative overflow-hidden bg-gradient-to-br p-5 text-white',
                          story.bgGradient
                        )}
                      >
                        <div className="absolute right-4 top-4 flex items-center gap-2 text-xs font-semibold">
                          <span
                            className={cn(
                              'rounded-full px-3 py-1 backdrop-blur',
                              story.ageGroup === 'young'
                                ? 'bg-white/20'
                                : 'bg-white/30'
                            )}
                          >
                            {story.ageGroup === 'young' ? 'Ages 4-10' : 'Ages 11-17'}
                          </span>
                        </div>
                        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/20 blur-2xl" aria-hidden />
                        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white/20 blur-2xl" aria-hidden />
                        <div className="relative z-10 space-y-3 text-center">
                          <div
                            className={cn(
                              'text-6xl transition-transform duration-300 group-hover:scale-110',
                              story.animation
                            )}
                            aria-hidden
                          >
                            {story.image}
                          </div>
                          <h3 className="text-lg font-semibold leading-tight md:text-xl">{story.title}</h3>
                          <p className="text-xs text-white/85 md:text-sm">{story.description}</p>
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
                              story.difficulty === 'Easy' &&
                                'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
                              story.difficulty === 'Medium' &&
                                'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
                              story.difficulty === 'Hard' &&
                                'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
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
                            className="h-10 w-10 rounded-full border-2 border-rose-300 text-rose-600 transition hover:bg-rose-100 dark:border-rose-600 dark:text-rose-400 dark:hover:bg-rose-900/30"
                            aria-label="Remove from favorites"
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
                    {stats.total} {stats.total === 1 ? 'story saved' : 'stories saved'}
                  </p>
                  <p className="text-sm text-muted-foreground md:max-w-lg">
                    Keep exploring to unlock new adventures and enrich your learning playlists automatically.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/kids/teen')}
                    className="rounded-full border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
                  >
                    Explore teen missions
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => navigate('/kids/young')}
                    className="rounded-full bg-gradient-to-r from-[#1B4332] to-[#74C69D] text-white shadow-sm hover:from-[#74C69D] hover:to-[#1B4332]"
                  >
                    Explore young missions
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

export default FavoritesPage;
