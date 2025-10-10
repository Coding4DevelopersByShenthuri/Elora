import { useState, useEffect, useRef } from 'react';
import { 
  Volume2, Star, Trophy, Play, BookOpen, 
  Mic, Award, Zap, Heart, Sparkles,
  Rabbit, Fish, Rocket, Cloud,
  Sun, CloudRain, CloudSnow
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import KidsProgressService from '@/services/KidsProgressService';
import KidsApi from '@/services/KidsApi';
import SpeechService from '@/services/SpeechService';
import ReadAloud from '@/components/kids/ReadAloud';
import Vocabulary from '@/components/kids/Vocabulary';
import Pronunciation from '@/components/kids/Pronunciation';

const KidsPage = () => {
  const [activeCategory, setActiveCategory] = useState('stories');
  const [currentStory, setCurrentStory] = useState(0);
  const [, setIsPlaying] = useState(false);
  const { user } = useAuth();
  const userId = user?.id ? String(user.id) : 'local-user';
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [floatingIcons, setFloatingIcons] = useState<Array<{id: number; type: string; x: number; y: number}>>([]);
  const [bounceAnimation, setBounceAnimation] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load progress and generate floating icons
  useEffect(() => {
    // Load kids progress
    (async () => {
      try {
        const token = localStorage.getItem('speakbee_auth_token');
        if (token && token !== 'local-token') {
          try {
            const server = await KidsApi.getProgress(token);
            setPoints(server.points ?? 0);
            setStreak(server.streak ?? 0);
            const fav = (server as any)?.details?.favorites ?? [];
            setFavorites(Array.isArray(fav) ? fav : []);
          } catch {
            const prog = await KidsProgressService.get(userId);
            setPoints(prog.points);
            setStreak(prog.streak);
            const fav = (prog as any).details?.favorites ?? [];
            setFavorites(Array.isArray(fav) ? fav : []);
          }
        } else {
          const prog = await KidsProgressService.get(userId);
          setPoints(prog.points);
          setStreak(prog.streak);
          const fav = (prog as any).details?.favorites ?? [];
          setFavorites(Array.isArray(fav) ? fav : []);
        }
      } catch {}
    })();

    const icons = ['star', 'heart', 'sparkles', 'zap'];
    const newFloatingIcons = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      type: icons[Math.floor(Math.random() * icons.length)],
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
    }));
    setFloatingIcons(newFloatingIcons);
  }, []);

  // Pointer/touch following disabled per request

  const categories = [
    { id: 'stories', label: 'Story Time', icon: BookOpen, emoji: '📚' },
    { id: 'vocabulary', label: 'Word Games', icon: Zap, emoji: '🎮' },
    { id: 'pronunciation', label: 'Speak & Repeat', icon: Mic, emoji: '🎤' },
    { id: 'games', label: 'Fun Games', icon: Trophy, emoji: '🏆' },
  ];

  const stories = [
    {
      title: "The Magic Forest",
      description: "Join Luna the rabbit on her adventure through the enchanted forest",
      difficulty: 'Easy',
      duration: '5 min',
      words: 45,
      image: '🌳',
      character: Rabbit,
      gradient: 'from-green-400 to-emerald-400',
      bgGradient: 'from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900',
      animation: 'animate-float-slow'
    },
    {
      title: "Space Adventure",
      description: "Blast off with Cosmo the astronaut to explore distant planets",
      difficulty: 'Medium',
      duration: '8 min',
      words: 68,
      image: '🚀',
      character: Rocket,
      gradient: 'from-purple-400 to-indigo-400',
      bgGradient: 'from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900',
      animation: 'animate-bounce'
    },
    {
      title: "Underwater World",
      description: "Dive deep with Finn the fish and meet ocean friends",
      difficulty: 'Easy',
      duration: '6 min',
      words: 52,
      image: '🐠',
      character: Fish,
      gradient: 'from-blue-400 to-cyan-400',
      bgGradient: 'from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900',
      animation: 'animate-float-medium'
    }
  ];

  const achievements = [
    { name: 'First Words', icon: Star, progress: Math.min(100, Math.round((points / 1000) * 100)), emoji: '🌟' },
    { name: 'Story Master', icon: BookOpen, progress: Math.min(100, favorites.length * 20), emoji: '📖' },
    { name: 'Pronunciation Pro', icon: Mic, progress: 50, emoji: '🎤' },
    { name: 'Vocabulary Builder', icon: Zap, progress: 25, emoji: '⚡' },
  ];
  const completedAchievements = achievements.filter(a => a.progress === 100).length;

  // Offline kids lesson content for new modules
  const readAloudLesson = {
    id: 'magic-forest-1',
    title: 'Magic Forest – Read Aloud',
    text: 'Luna the rabbit hops through the forest to meet friendly animals.',
    targetWords: ['rabbit', 'forest', 'animals']
  };

  const vocabWords = [
    { word: 'rabbit', hint: '/ˈræb.ɪt/' },
    { word: 'forest', hint: '/ˈfɒr.ɪst/' },
    { word: 'planet', hint: '/ˈplæn.ɪt/' }
  ];

  const pronounceItems = [
    { phrase: 'Hello Luna', phonemes: '/həˈləʊ ˈluː.nə/' },
    { phrase: 'Magic forest', phonemes: '/ˈmædʒ.ɪk ˈfɒr.ɪst/' },
    { phrase: 'Happy rabbit', phonemes: '/ˈhæp.i ˈræb.ɪt/' }
  ];

  const handleStartLesson = async (storyIndex: number) => {
    setCurrentStory(storyIndex);
    setIsPlaying(true);
    setBounceAnimation(true);
    
    // Add celebration effects
    const newPoints = points + 50;
    const newStreak = streak + 1;
    setPoints(newPoints);
    setStreak(newStreak);
    // Persist to server first, fallback to local
    try {
      const token = localStorage.getItem('speakbee_auth_token');
      const updateDetails = (details: any) => {
        details.readAloud = details.readAloud || {};
        const key = `story-${storyIndex}`;
        const prev = details.readAloud[key] || { bestScore: 0, attempts: 0 };
        details.readAloud[key] = { bestScore: Math.max(prev.bestScore, 80), attempts: prev.attempts + 1 };
        return details;
      };
      if (token && token !== 'local-token') {
        const current = await KidsApi.getProgress(token);
        const details = updateDetails((current as any).details || {});
        await KidsApi.updateProgress(token, { points: newPoints, streak: newStreak, details });
      } else {
        await KidsProgressService.update(userId, (p) => {
          const details = updateDetails((p as any).details || {});
          return { ...p, points: newPoints, streak: newStreak, details } as any;
        });
      }
    } catch {
      try {
        await KidsProgressService.update(userId, (p) => {
          const details = { ...(p as any).details };
          details.readAloud = details.readAloud || {};
          const key = `story-${storyIndex}`;
          const prev = details.readAloud[key] || { bestScore: 0, attempts: 0 };
          details.readAloud[key] = { bestScore: Math.max(prev.bestScore, 80), attempts: prev.attempts + 1 };
          return { ...p, points: newPoints, streak: newStreak, details } as any;
        });
      } catch {}
    }
    
    // Reset bounce animation
    setTimeout(() => setBounceAnimation(false), 1000);
    
    // Add floating particles
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      type: ['star', 'heart', 'sparkles'][Math.floor(Math.random() * 3)],
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    setFloatingIcons(prev => [...prev, ...newParticles]);
    
    // Remove particles after animation
    setTimeout(() => {
      setFloatingIcons(prev => prev.filter(icon => !newParticles.find(p => p.id === icon.id)));
    }, 2000);

    // Speak story intro (offline TTS baseline)
    try {
      const story = stories[storyIndex];
      if (SpeechService.isTTSSupported()) {
        await SpeechService.speak(`${story.title}. ${story.description}`, { rate: 0.95 });
      }
    } catch {}
  };

  const toggleFavorite = async (index: number) => {
    const next = favorites.includes(index)
      ? favorites.filter(i => i !== index)
      : [...favorites, index];
    setFavorites(next);
    try {
      const token = localStorage.getItem('speakbee_auth_token');
      if (token && token !== 'local-token') {
        try {
          const current = await KidsApi.getProgress(token);
          const details = { ...((current as any).details || {}), favorites: next };
          await KidsApi.updateProgress(token, { details });
          return;
        } catch {}
      }
      await KidsProgressService.update(userId, (p) => {
        const details = { ...(p as any).details };
        details.favorites = next;
        return { ...p, details } as any;
      });
    } catch {}
  };

  const getIconComponent = (type: string) => {
    switch (type) {
      case 'star': return Star;
      case 'heart': return Heart;
      case 'sparkles': return Sparkles;
      case 'zap': return Zap;
      default: return Star;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'star': return 'text-yellow-400 dark:text-yellow-300';
      case 'heart': return 'text-pink-400 dark:text-pink-300';
      case 'sparkles': return 'text-purple-400 dark:text-purple-300';
      case 'zap': return 'text-blue-400 dark:text-blue-300';
      default: return 'text-yellow-400 dark:text-yellow-300';
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="min-h-screen pb-20 pt-32 bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 dark:from-slate-900 dark:via-blue-950/10 dark:to-purple-950/10 relative overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 animate-float-slow">
          <Cloud className="w-12 h-12 text-blue-200/60 dark:text-blue-700/60" />
        </div>
        <div className="absolute top-20 right-20 animate-float-medium">
          <Sun className="w-16 h-16 text-yellow-200/60 dark:text-yellow-800/60" />
        </div>
        <div className="absolute bottom-20 left-20 animate-float-fast">
          <CloudRain className="w-14 h-14 text-blue-300/60 dark:text-blue-600/60" />
        </div>
        <div className="absolute bottom-10 right-10 animate-bounce">
          <CloudSnow className="w-12 h-12 text-cyan-200/60 dark:text-cyan-700/60" />
        </div>
      </div>

      {/* Floating Icons */}
      {floatingIcons.map((icon) => {
        const IconComponent = getIconComponent(icon.type);
        return (
          <div
            key={icon.id}
            className="absolute pointer-events-none animate-float-random"
            style={{
              left: `${icon.x}%`,
              top: `${icon.y}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <IconComponent className={cn("w-6 h-6", getIconColor(icon.type))} />
          </div>
        );
      })}

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] rounded-full blur-md opacity-60 animate-pulse"></div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#118AB2] bg-clip-text text-transparent">
              Kids Learning Zone
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
            Fun stories, exciting games, and magical adventures to learn English! 🎉
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-yellow-200 dark:border-yellow-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Trophy className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />
                <span className="text-3xl font-bold text-gray-800 dark:text-white">{points}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Sparkle Points ✨</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-green-200 dark:border-green-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Zap className="w-8 h-8 text-green-500 dark:text-green-400 animate-pulse" />
                <span className="text-3xl font-bold text-gray-800 dark:text-white">{streak} days</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Learning Streak 🔥</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Award className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                <span className="text-3xl font-bold text-gray-800 dark:text-white">{completedAchievements}/{achievements.length}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Super Achievements 🏆</p>
            </CardContent>
          </Card>
        </div>

        {/* Categories Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => {
            return (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                className={cn(
                  "rounded-2xl px-8 py-4 text-lg font-bold transition-all duration-300 relative overflow-hidden group",
                  activeCategory === category.id 
                    ? "bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] text-white shadow-2xl transform hover:scale-110" 
                    : "bg-white/90 dark:bg-gray-800/90 border-2 border-gray-200 dark:border-gray-600 hover:border-[#FF6B6B] dark:hover:border-[#FF6B6B] hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg"
                )}
                onClick={() => setActiveCategory(category.id)}
              >
                <span className="text-2xl mr-3">{category.emoji}</span>
                {category.label}
                {activeCategory === category.id && (
                  <Sparkles className="w-4 h-4 ml-2 animate-spin" />
                )}
              </Button>
            );
          })}
        </div>

        {/* Stories Grid or Module Content */}
        {activeCategory === 'stories' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {stories.map((story, index) => {
              const CharacterIcon = story.character;
              return (
                <Card 
                  key={index} 
                  className={cn(
                    "group cursor-pointer bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-transparent hover:border-[#FF6B6B] transition-all duration-500 hover:shadow-2xl overflow-hidden",
                    bounceAnimation && currentStory === index && "animate-bounce"
                  )}
                  onMouseEnter={() => setCurrentStory(index)}
                >
                  <CardContent className="p-0 overflow-hidden rounded-3xl">
                    <div className={cn(
                      "p-8 relative overflow-hidden bg-gradient-to-br",
                      story.bgGradient
                    )}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 dark:bg-black/20 rounded-full -mr-16 -mt-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 dark:bg-black/20 rounded-full -ml-12 -mb-12"></div>
                      <div className="relative z-10 text-center">
                        <div className={cn("text-6xl mb-4 transform transition-transform duration-300 group-hover:scale-110", story.animation)}>
                          {story.image}
                        </div>
                        <CharacterIcon className="w-12 h-12 mx-auto mb-3 text-gray-600 dark:text-gray-300 opacity-80" />
                        <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
                          {story.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                          {story.description}
                        </p>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-6">
                        <span className="flex items-center gap-1 font-semibold">📚 {story.words} words</span>
                        <span className="flex items-center gap-1 font-semibold">⏱️ {story.duration}</span>
                        <span className={cn(
                          "font-semibold",
                          story.difficulty === 'Easy' && "text-green-500 dark:text-green-400",
                          story.difficulty === 'Medium' && "text-yellow-500 dark:text-yellow-400",
                          story.difficulty === 'Hard' && "text-red-500 dark:text-red-400"
                        )}>
                          🎯 {story.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <Button size="sm" variant="outline" onClick={() => toggleFavorite(index)} className={cn("rounded-xl", favorites.includes(index) && "border-pink-500 text-pink-600")}>❤</Button>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{favorites.includes(index) ? 'In favorites' : 'Add to favorites'}</span>
                      </div>
                      <Button 
                        className={cn(
                          "w-full bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] hover:from-[#4ECDC4] hover:to-[#FF6B6B] text-white font-bold py-4 rounded-2xl transition-all duration-300 group-hover:shadow-xl relative overflow-hidden",
                          bounceAnimation && currentStory === index && "animate-pulse"
                        )}
                        onClick={() => handleStartLesson(index)}
                      >
                        <span className="relative z-10 flex items-center justify-center">
                          <Play className="w-5 h-5 mr-2" />
                          Start Adventure!
                        </span>
                        <div className="absolute inset-0 bg-white/20 transform scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {activeCategory === 'vocabulary' && (
          <div className="mb-12">
            <Vocabulary words={vocabWords} />
          </div>
        )}
        {activeCategory === 'pronunciation' && (
          <div className="mb-12">
            <Pronunciation items={pronounceItems} />
          </div>
        )}
        {activeCategory === 'games' && (
          <div className="mb-12">
            <ReadAloud lesson={readAloudLesson} />
          </div>
        )}

        {/* Achievements Section */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-600 rounded-3xl p-8 shadow-xl mb-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500 dark:text-yellow-400 animate-bounce" />
            Your Super Achievements!
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => {
              const isComplete = achievement.progress === 100;
              return (
                <div key={index} className="text-center group cursor-pointer transform hover:scale-110 transition-transform duration-300">
                  <div className="relative inline-block mb-3">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-2 transition-all duration-300",
                      isComplete 
                        ? "bg-gradient-to-r from-yellow-400 to-orange-400 shadow-lg" 
                        : "bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600"
                    )}>
                      <span className="text-2xl">{achievement.emoji}</span>
                      {isComplete && (
                        <Sparkles className="w-4 h-4 text-white absolute -top-1 -right-1 animate-ping" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-800 dark:text-white mb-3">{achievement.name}</p>
                  <Progress value={achievement.progress} className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full mb-2">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        isComplete ? "bg-gradient-to-r from-yellow-400 to-orange-400" : "bg-gradient-to-r from-blue-400 to-purple-400"
                      )}
                    />
                  </Progress>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{achievement.progress}% Complete</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 font-semibold">Ready for more fun? Let's play! 🎯</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              variant="outline" 
              className="rounded-2xl px-8 py-4 border-2 border-green-300 dark:border-green-600 hover:border-green-400 dark:hover:border-green-500 bg-white/90 dark:bg-gray-800/90 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-300 hover:scale-105 group"
              onClick={() => setActiveCategory('pronunciation')}
            >
              <Volume2 className="w-5 h-5 mr-2 text-green-500 dark:text-green-400 group-hover:animate-bounce" />
              <span className="font-semibold text-gray-700 dark:text-gray-200">Listen & Repeat</span>
            </Button>
            <Button 
              variant="outline" 
              className="rounded-2xl px-8 py-4 border-2 border-blue-300 dark:border-blue-600 hover:border-blue-400 dark:hover:border-blue-500 bg-white/90 dark:bg-gray-800/90 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 hover:scale-105 group"
              onClick={() => setActiveCategory('pronunciation')}
            >
              <Mic className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400 group-hover:animate-pulse" />
              <span className="font-semibold text-gray-700 dark:text-gray-200">Speak Now</span>
            </Button>
            <Button 
              variant="outline" 
              className="rounded-2xl px-8 py-4 border-2 border-pink-300 dark:border-pink-600 hover:border-pink-400 dark:hover:border-pink-500 bg-white/90 dark:bg-gray-800/90 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all duration-300 hover:scale-105 group"
              onClick={() => setActiveCategory('stories')}
            >
              <Heart className="w-5 h-5 mr-2 text-pink-500 dark:text-pink-400 group-hover:animate-pulse" />
              <span className="font-semibold text-gray-700 dark:text-gray-200">Favorite Stories</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Interactive Floating Elements */}
      <div className="fixed bottom-6 right-6 animate-bounce cursor-pointer hover:scale-110 transition-transform duration-300 z-20">
        <div className="bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] p-4 rounded-full shadow-2xl">
          <Zap className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Additional Animated Icons */}
      <div className="fixed top-24 left-6 animate-float-slow cursor-pointer hover:scale-110 transition-transform duration-300 z-20">
        <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-2xl shadow-lg border-2 border-yellow-200 dark:border-yellow-700">
          <Star className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
        </div>
      </div>
      <div className="fixed top-48 right-10 animate-float-medium cursor-pointer hover:scale-110 transition-transform duration-300 z-20">
        <div className="bg-pink-100 dark:bg-pink-900 p-3 rounded-2xl shadow-lg border-2 border-pink-200 dark:border-pink-700">
          <Heart className="w-6 h-6 text-pink-500 dark:text-pink-400" />
        </div>
      </div>
      <div className="fixed bottom-40 left-10 animate-float-fast cursor-pointer hover:scale-110 transition-transform duration-300 z-20">
        <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-2xl shadow-lg border-2 border-purple-200 dark:border-purple-700">
          <Sparkles className="w-6 h-6 text-purple-500 dark:text-purple-400" />
        </div>
      </div>

      {/* Add custom animations to global CSS */}
      <style>{`
        @keyframes float-random {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(10px) rotate(240deg); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-float-random {
          animation: float-random 6s ease-in-out infinite;
        }
        .animate-gradient {
          background: linear-gradient(-45deg, #FF6B6B, #4ECDC4, #118AB2, #FFD166);
          background-size: 400% 400%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default KidsPage;