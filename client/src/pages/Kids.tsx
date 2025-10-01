import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Volume2, Star, Trophy, Play, BookOpen, 
  Mic, Award, Zap, Heart, Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const KidsPage = () => {
  const [activeCategory, setActiveCategory] = useState('stories');
  const [currentStory, setCurrentStory] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [points, setPoints] = useState(1250);
  const [streak, setStreak] = useState(3);

  const categories = [
    { id: 'stories', label: 'Story Time', icon: BookOpen, color: 'text-pink-500' },
    { id: 'vocabulary', label: 'Word Games', icon: Zap, color: 'text-blue-500' },
    { id: 'pronunciation', label: 'Speak & Repeat', icon: Mic, color: 'text-green-500' },
    { id: 'games', label: 'Fun Games', icon: Trophy, color: 'text-yellow-500' },
  ];

  const stories = [
    {
      title: "The Magic Forest",
      description: "Join Luna the rabbit on her adventure through the enchanted forest",
      difficulty: 'Easy',
      duration: '5 min',
      words: 45,
      image: '🌳',
      color: 'from-green-400 to-blue-400'
    },
    {
      title: "Space Adventure",
      description: "Blast off with Cosmo the astronaut to explore distant planets",
      difficulty: 'Medium',
      duration: '8 min',
      words: 68,
      image: '🚀',
      color: 'from-purple-400 to-pink-400'
    },
    {
      title: "Underwater World",
      description: "Dive deep with Finn the fish and meet ocean friends",
      difficulty: 'Easy',
      duration: '6 min',
      words: 52,
      image: '🐠',
      color: 'from-blue-400 to-teal-400'
    }
  ];

  const achievements = [
    { name: 'First Words', icon: Star, progress: 100, color: 'text-yellow-500' },
    { name: 'Story Master', icon: BookOpen, progress: 75, color: 'text-purple-500' },
    { name: 'Pronunciation Pro', icon: Mic, progress: 50, color: 'text-green-500' },
    { name: 'Vocabulary Builder', icon: Zap, progress: 25, color: 'text-blue-500' },
  ];

  const handleStartLesson = (storyIndex: number) => {
    setCurrentStory(storyIndex);
    setIsPlaying(true);
    // Simulate points earned
    setPoints(prev => prev + 50);
    setStreak(prev => prev + 1);
  };

  return (
    <div className="min-h-screen pb-20 pt-32">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-4xl font-bold text-teal-600 flex items-center gap-2">
              Kids Learning Zone
            </h1>
          </div>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            Fun stories, exciting games, and magical adventures to learn English!
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="glass-panel border-2 border-yellow-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <span className="text-2xl font-bold text-foreground">{points}</span>
              </div>
              <p className="text-sm text-muted-foreground">Points</p>
            </CardContent>
          </Card>
          
          <Card className="glass-panel border-2 border-orange-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-6 h-6 text-orange-500" />
                <span className="text-2xl font-bold text-foreground">{streak} days</span>
              </div>
              <p className="text-sm text-muted-foreground">Streak</p>
            </CardContent>
          </Card>
          
          <Card className="glass-panel border-2 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Award className="w-6 h-6 text-green-500" />
                <span className="text-2xl font-bold text-foreground">12/20</span>
              </div>
              <p className="text-sm text-muted-foreground">Achievements</p>
            </CardContent>
          </Card>
        </div>

        {/* Categories Navigation */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                className={cn(
                  "rounded-full px-6 py-3 text-lg font-semibold transition-all duration-300 bounce-hover",
                  activeCategory === category.id 
                    ? "colorful-gradient text-white shadow-lg glow-effect" 
                    : "bg-card/80 border-2 border-border hover:border-primary/50"
                )}
                onClick={() => setActiveCategory(category.id)}
              >
                <Icon className={cn("w-5 h-5 mr-2", category.color)} />
                {category.label}
              </Button>
            );
          })}
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stories.map((story, index) => (
            <Card 
              key={index} 
              className="group cursor-pointer interactive-card"
            >
              <CardContent className="p-0 overflow-hidden rounded-2xl">
                <div className={cn("p-6 text-white text-center bg-gradient-to-br", story.color)}>
                  <div className="text-6xl mb-4">{story.image}</div>
                  <h3 className="text-2xl font-bold mb-2">{story.title}</h3>
                  <p className="text-white/90 text-sm mb-4">{story.description}</p>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between text-sm text-muted-foreground mb-4">
                    <span>📚 {story.words} words</span>
                    <span>⏱️ {story.duration}</span>
                    <span>🎯 {story.difficulty}</span>
                  </div>
                  
                  <Button 
                    className="w-full colorful-gradient hover:shadow-lg text-white font-semibold py-3 rounded-xl transition-all duration-300 group-hover:scale-105"
                    onClick={() => handleStartLesson(index)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Adventure
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Achievements Section */}
        <div className="glass-panel rounded-2xl p-6 border-2 border-primary/20">
          <h2 className="text-2xl font-bold text-center mb-6 text-foreground flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Your Achievements
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <div key={index} className="text-center">
                  <div className="relative inline-block mb-2">
                    <Icon className={cn("w-8 h-8", achievement.color)} />
                    {achievement.progress === 100 && (
                      <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-2">{achievement.name}</p>
                  <Progress value={achievement.progress} className="h-2 bg-muted">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        achievement.progress === 100 ? "bg-yellow-500" : "bg-primary"
                      )}
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </Progress>
                  <span className="text-xs text-muted-foreground mt-1">{achievement.progress}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-4">Practice makes perfect! 🎯</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" className="rounded-full px-6 border-2 border-green-200 hover:border-green-300 bounce-hover">
              <Volume2 className="w-4 h-4 mr-2 text-green-500" />
              Listen & Repeat
            </Button>
            <Button variant="outline" className="rounded-full px-6 border-2 border-blue-200 hover:border-blue-300 bounce-hover">
              <Mic className="w-4 h-4 mr-2 text-blue-500" />
              Speak Now
            </Button>
            <Button variant="outline" className="rounded-full px-6 border-2 border-pink-200 hover:border-pink-300 bounce-hover">
              <Heart className="w-4 h-4 mr-2 text-pink-500" />
              Favorite Stories
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Elements for Playfulness */}
      <div className="fixed bottom-4 right-4 animate-bounce">
        <div className="floating-icon-primary p-3 rounded-full shadow-lg">
          <Zap className="w-6 h-6 text-primary" />
        </div>
      </div>

      {/* Additional Floating Icons */}
      <div className="fixed top-20 left-4 animate-float-slow floating-icon-secondary p-2 rounded-full">
        <Star className="w-5 h-5 text-secondary" />
      </div>
      <div className="fixed top-40 right-8 animate-float-medium floating-icon-accent p-2 rounded-full">
        <Heart className="w-5 h-5 text-accent" />
      </div>
      <div className="fixed bottom-40 left-8 animate-float-fast floating-icon-glow p-2 rounded-full">
        <Sparkles className="w-5 h-5 text-primary" />
      </div>
    </div>
  );
};

export default KidsPage;