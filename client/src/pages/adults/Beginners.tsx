import { useState, useEffect } from 'react';
import { 
  Play, Volume2, Mic, CheckCircle, Clock, Users, 
  Target, Award, BookOpen, MessageCircle, Repeat, Zap, TrendingUp,
  ArrowRight, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const BeginnersPage = () => {
  const [activeTab, setActiveTab] = useState('lessons');
  const [, setCurrentLesson] = useState(0);
  const [progress, setProgress] = useState(35);
  const [streak, setStreak] = useState(5);
  const [completedLessons, setCompletedLessons] = useState([0, 1, 2]);
  const [isHovered, setIsHovered] = useState<number | null>(null);
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

  const tabs = [
    { id: 'lessons', label: 'Learning Modules', icon: BookOpen },
    { id: 'practice', label: 'Practice Labs', icon: MessageCircle },
    { id: 'vocabulary', label: 'Vocabulary Builder', icon: Target },
    { id: 'progress', label: 'Progress Analytics', icon: TrendingUp },
  ];

  const lessons = [
    {
      title: "Greetings & Introductions",
      description: "Master basic greetings and professional self-introductions",
      duration: '15 min',
      level: 'Foundation',
      words: 25,
      completed: true,
      icon: '👋',
      color: 'from-cyan-400 via-blue-500 to-indigo-600',
      glowColor: 'rgba(34, 211, 238, 0.3)',
      skills: ['Formal Greetings', 'Self-Introduction', 'Basic Etiquette']
    },
    {
      title: "Everyday Conversations",
      description: "Practice common daily interactions and social exchanges",
      duration: '20 min',
      level: 'Foundation',
      words: 40,
      completed: true,
      icon: '💬',
      color: 'from-emerald-400 via-teal-500 to-cyan-600',
      glowColor: 'rgba(52, 211, 153, 0.3)',
      skills: ['Small Talk', 'Daily Interactions', 'Social Context']
    },
    {
      title: "Asking Questions",
      description: "Develop skills to ask and answer questions effectively",
      duration: '18 min',
      level: 'Foundation',
      words: 35,
      completed: true,
      icon: '❓',
      color: 'from-violet-400 via-purple-500 to-fuchsia-600',
      glowColor: 'rgba(139, 92, 246, 0.3)',
      skills: ['Question Forms', 'Response Patterns', 'Clarification']
    },
    {
      title: "Shopping & Transactions",
      description: "Essential phrases for retail and financial interactions",
      duration: '25 min',
      level: 'Foundation',
      words: 50,
      completed: false,
      icon: '🛍️',
      color: 'from-amber-400 via-orange-500 to-red-600',
      glowColor: 'rgba(251, 191, 36, 0.3)',
      skills: ['Price Inquiry', 'Payment Terms', 'Product Questions']
    },
    {
      title: "Dining & Hospitality",
      description: "Navigate restaurant scenarios and food-related conversations",
      duration: '22 min',
      level: 'Foundation',
      words: 45,
      completed: false,
      icon: '🍽️',
      color: 'from-rose-400 via-pink-500 to-fuchsia-600',
      glowColor: 'rgba(244, 63, 94, 0.3)',
      skills: ['Menu Reading', 'Ordering', 'Dining Etiquette']
    },
    {
      title: "Directions & Navigation",
      description: "Confidently ask for and provide location guidance",
      duration: '20 min',
      level: 'Foundation',
      words: 38,
      completed: false,
      icon: '🧭',
      color: 'from-indigo-400 via-blue-500 to-cyan-600',
      glowColor: 'rgba(99, 102, 241, 0.3)',
      skills: ['Location Terms', 'Direction Giving', 'Transportation']
    }
  ];

  const quickActions = [
    {
      title: "Speech Practice",
      description: "AI-powered pronunciation and fluency training",
      icon: Mic,
      color: "from-cyan-500 to-blue-600",
      gradient: "from-cyan-500 to-blue-600",
      link: "/practice/speaking"
    },
    {
      title: "Listening Comprehension",
      description: "Enhance auditory skills with native speaker content",
      icon: Volume2,
      color: "from-emerald-500 to-teal-600",
      gradient: "from-emerald-500 to-teal-600",
      link: "/practice/listening"
    },
    {
      title: "Conversation Practice",
      description: "Real-time dialogue practice with AI conversation partner",
      icon: MessageCircle,
      color: "from-violet-500 to-purple-600",
      gradient: "from-violet-500 to-purple-600",
      link: "/practice/conversation"
    },
    {
      title: "Knowledge Review",
      description: "Reinforce learning with spaced repetition system",
      icon: Repeat,
      color: "from-amber-500 to-orange-600",
      gradient: "from-amber-500 to-orange-600",
      link: "/practice/review"
    }
  ];

  const stats = [
    { 
      label: "Vocabulary Mastered", 
      value: "156", 
      icon: BookOpen, 
      color: "text-cyan-400",
      glowColor: "rgba(34, 211, 238, 0.2)",
      description: "Active words and phrases"
    },
    { 
      label: "Speaking Practice", 
      value: "45 min", 
      icon: Mic, 
      color: "text-emerald-400",
      glowColor: "rgba(52, 211, 153, 0.2)",
      description: "This week's practice"
    },
    { 
      label: "Learning Streak", 
      value: `${streak} days`, 
      icon: Zap, 
      color: "text-amber-400",
      glowColor: "rgba(251, 191, 36, 0.2)",
      description: "Consistent progress"
    },
    { 
      label: "Modules Completed", 
      value: "3/6", 
      icon: Award, 
      color: "text-purple-400",
      glowColor: "rgba(168, 85, 247, 0.2)",
      description: "Foundation level"
    },
  ];

  const handleStartLesson = (lessonIndex: number) => {
    setCurrentLesson(lessonIndex);
    if (!completedLessons.includes(lessonIndex)) {
      setCompletedLessons(prev => [...prev, lessonIndex]);
      setProgress(prev => Math.min(prev + 16, 100));
      setStreak(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
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
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-radial from-cyan-500/30 via-blue-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-radial from-indigo-500/25 via-blue-500/15 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/3 w-[700px] h-[700px] bg-gradient-radial from-cyan-500/20 via-teal-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Large Planet/Moon Spheres - Main Visual Elements */}
      {/* Main Large Planet - Bottom Left - Reduced Size */}
      <div className="fixed bottom-0 left-0 w-[140px] h-[140px] sm:w-[200px] sm:h-[200px] md:w-[280px] md:h-[280px] lg:w-[360px] lg:h-[360px] xl:w-[420px] xl:h-[420px] pointer-events-none opacity-60 sm:opacity-65 md:opacity-70 lg:opacity-75">
        <div className="relative w-full h-full">
          <img 
            src="/planets/zu7XaNtVpYwIGWuPT910tDPzo.avif" 
            alt="Planet" 
            className="absolute inset-0 rounded-full object-cover shadow-2xl"
            style={{ filter: 'grayscale(0.2) brightness(0.85)' }}
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-2xl" />
        </div>
      </div>

      {/* Secondary Planet - Top Right */}
      <div className="fixed top-24 right-2 sm:right-6 md:right-12 w-[100px] h-[100px] sm:w-[150px] sm:h-[150px] md:w-[200px] md:h-[200px] lg:w-[240px] lg:h-[240px] xl:w-[280px] xl:h-[280px] pointer-events-none opacity-40 sm:opacity-50 md:opacity-60 hidden sm:block">
        <div className="relative w-full h-full">
          <img 
            src="/planets/SEp7QE3Bk6RclE0R7rhBgcGIOI.avif" 
            alt="Planet" 
            className="absolute inset-0 rounded-full object-cover shadow-xl"
            style={{ filter: 'grayscale(0.3) brightness(0.75)' }}
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/15 to-indigo-500/15 blur-xl" />
        </div>
      </div>

      {/* Tertiary Planet - Middle Left */}
      <div className="fixed top-1/3 left-2 sm:left-8 md:left-16 w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] md:w-[160px] md:h-[160px] lg:w-[200px] lg:h-[200px] xl:w-[220px] xl:h-[220px] pointer-events-none opacity-30 sm:opacity-40 md:opacity-50 hidden md:block">
        <div className="relative w-full h-full">
          <img 
            src="/planets/F4RKAKmFyoRYVlTsUWN51wD1dg.avif" 
            alt="Planet" 
            className="absolute inset-0 rounded-full object-cover shadow-xl"
            style={{ filter: 'grayscale(0.3) brightness(0.7)' }}
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/15 to-cyan-500/15 blur-xl" />
        </div>
      </div>

      {/* Small Planet - Bottom Right */}
      <div className="fixed bottom-32 right-4 sm:right-12 md:right-20 w-[70px] h-[70px] sm:w-[100px] sm:h-[100px] md:w-[140px] md:h-[140px] lg:w-[160px] lg:h-[160px] xl:w-[180px] xl:h-[180px] pointer-events-none opacity-25 sm:opacity-30 md:opacity-40 hidden lg:block">
        <div className="relative w-full h-full">
          <img 
            src="/planets/K3uC2Tk4o2zjSbuWGs3t0MMuLVY.avif" 
            alt="Planet" 
            className="absolute inset-0 rounded-full object-cover shadow-lg"
            style={{ filter: 'grayscale(0.4) brightness(0.65)' }}
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/10 to-blue-500/10 blur-lg" />
        </div>
      </div>

      <div className="relative z-10 pb-12 sm:pb-16 md:pb-20 pt-20 sm:pt-24 md:pt-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur-2xl opacity-50 animate-pulse"></div>
                
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Foundation English
              </h1>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-cyan-100/80 max-w-2xl mx-auto mb-4 sm:mb-6 leading-relaxed px-2">
              Build essential communication skills with structured, professional learning pathways
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 px-2">
              <Badge variant="secondary" className="bg-cyan-500/20 backdrop-blur-sm text-cyan-300 border-cyan-400/30 px-2 sm:px-3 md:px-4 py-1 text-xs sm:text-sm">
                <Clock className="w-3 h-3 mr-1 sm:mr-2" />
                Flexible Scheduling
              </Badge>
              <Badge variant="secondary" className="bg-emerald-500/20 backdrop-blur-sm text-emerald-300 border-emerald-400/30 px-2 sm:px-3 md:px-4 py-1 text-xs sm:text-sm">
                <Users className="w-3 h-3 mr-1 sm:mr-2" />
                Professional Context
              </Badge>
              <Badge variant="secondary" className="bg-violet-500/20 backdrop-blur-sm text-violet-300 border-violet-400/30 px-2 sm:px-3 md:px-4 py-1 text-xs sm:text-sm">
                <Volume2 className="w-3 h-3 mr-1 sm:mr-2" />
                Speech Recognition
              </Badge>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-10 md:mb-12">
            {/* Main Progress Card */}
            <Card className="lg:col-span-2 bg-slate-900/60 backdrop-blur-xl border-cyan-500/30 shadow-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-white">Learning Journey</h3>
                    <p className="text-sm sm:text-base text-cyan-100/70">Track your progress through foundation modules</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{progress}%</div>
                    <div className="text-sm sm:text-base text-cyan-100/70">Overall Mastery</div>
                  </div>
                </div>

                <Progress value={progress} className="h-3 bg-slate-700/50 mb-8">
                  <div className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full transition-all duration-500" />
                </Progress>

                {/* Weekly Goal */}
                <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm p-4 rounded-xl border border-cyan-400/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">Weekly Learning Goal</span>
                    <span className="text-sm font-medium text-cyan-300">3/5 sessions</span>
                  </div>
                  <Progress value={60} className="h-2 bg-cyan-900/30">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                  </Progress>
                </div>
              </CardContent>
            </Card>

            {/* Stats Overview */}
            <Card className="bg-slate-900/60 backdrop-blur-xl border-cyan-500/30 shadow-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Learning Metrics</h3>
                <div className="space-y-4 sm:space-y-6">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-slate-700/30 backdrop-blur-sm border border-cyan-500/20 hover:border-cyan-400/50 transition-all duration-300">
                        <div className={cn("p-3 rounded-xl", stat.color)} style={{ backgroundColor: stat.glowColor }}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-baseline">
                            <span className="text-sm font-medium text-cyan-100/80">{stat.label}</span>
                            <span className="text-lg font-bold text-white">{stat.value}</span>
                          </div>
                          <p className="text-xs text-cyan-100/60">{stat.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Practice Labs */}
          <div className="mb-8 sm:mb-10 md:mb-12">
            <div className="mb-6 sm:mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Practice Labs</h2>
                <p className="text-sm sm:text-base text-cyan-100/70">Interactive exercises to reinforce your learning</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Card 
                    key={index} 
                    className="group cursor-pointer bg-slate-900/60 backdrop-blur-xl border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20"
                    onMouseEnter={() => setIsHovered(index)}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                    <CardContent className="p-6 relative overflow-hidden">
                      <div className={cn(
                        "absolute top-0 right-0 w-20 h-20 rounded-full -mr-6 -mt-6 transition-all duration-500 bg-gradient-to-r opacity-20",
                        action.color,
                        isHovered === index ? "opacity-30 scale-150" : ""
                      )}></div>
                      
                      <div className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-white relative z-10 transition-transform duration-300 bg-gradient-to-r shadow-lg",
                        action.color,
                        isHovered === index && "scale-110"
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      <h4 className="font-semibold text-white mb-3 text-lg">{action.title}</h4>
                      <p className="text-sm text-cyan-100/70 mb-6 leading-relaxed">{action.description}</p>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full border-cyan-400/30 text-black hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all duration-300"
                      >
                        Start Exercise
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "rounded-xl px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-medium transition-all duration-300 border-2 backdrop-blur-sm",
                    activeTab === tab.id 
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg border-transparent" 
                      : "bg-slate-800/40 border-cyan-500/30 hover:border-cyan-400/50 text-cyan-200 hover:shadow-md"
                  )}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3" />
                  {tab.label}
                </Button>
              );
            })}
          </div>

          {/* Learning Modules Grid */}
          <div className="mb-8 sm:mb-10 md:mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Learning Modules</h2>
                <p className="text-sm sm:text-base text-cyan-100/70">Structured curriculum for foundational English mastery</p>
              </div>
              <Badge variant="outline" className="bg-cyan-500/20 text-cyan-300 border-cyan-400/30 text-xs sm:text-sm w-fit">
                {completedLessons.length}/{lessons.length} Completed
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {lessons.map((lesson, index) => (
                <Card 
                  key={index} 
                  className={cn(
                    "group cursor-pointer border-2 transition-all duration-500 bg-slate-900/60 backdrop-blur-xl hover:shadow-2xl overflow-hidden",
                    lesson.completed 
                      ? "border-emerald-400/50 hover:border-emerald-300/70" 
                      : "border-cyan-500/30 hover:border-cyan-400/50"
                  )}
                  onMouseEnter={() => setIsHovered(index + 10)}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <CardContent className="p-0 overflow-hidden">
                    {/* Header with Gradient */}
                    <div className={cn(
                      "p-6 text-white relative overflow-hidden transition-all duration-500 bg-gradient-to-r",
                      lesson.color,
                      isHovered === index + 10 && "brightness-110"
                    )} style={{ boxShadow: `0 0 30px ${lesson.glowColor}` }}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                      
                      <div className="relative z-10 text-center">
                        <div className="text-4xl mb-4 transform transition-transform duration-300 group-hover:scale-110">
                          {lesson.icon}
                        </div>
                        <div className="flex items-center justify-center gap-3 mb-3">
                          <h3 className="text-xl font-bold">{lesson.title}</h3>
                          {lesson.completed && (
                            <CheckCircle className="w-5 h-5 text-emerald-300 animate-pulse" />
                          )}
                        </div>
                        <p className="text-white/90 text-sm leading-relaxed">{lesson.description}</p>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4 sm:p-6 bg-slate-900/70 backdrop-blur-sm">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0 text-xs sm:text-sm text-cyan-100/70 mb-3 sm:mb-4">
                        <span className="flex items-center gap-1 sm:gap-2 font-medium">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          {lesson.duration}
                        </span>
                        <span className="flex items-center gap-1 sm:gap-2 font-medium">
                          <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                          {lesson.words} terms
                        </span>
                        <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300 border-cyan-400/30 text-xs w-fit">
                          {lesson.level}
                        </Badge>
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1 mb-6">
                        {lesson.skills.map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-slate-700/50 text-cyan-200 border-cyan-500/30">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      
                      <Button 
                        className={cn(
                          "w-full font-semibold py-3 rounded-xl transition-all duration-300 group-hover:shadow-lg relative overflow-hidden",
                          lesson.completed
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                            : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                        )}
                        onClick={() => handleStartLesson(index)}
                      >
                        <span className="relative z-10 flex items-center justify-center">
                          {lesson.completed ? (
                            <>
                              <Repeat className="w-4 h-4 mr-2" />
                              Review Module
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Start Learning
                            </>
                          )}
                        </span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Motivation & Progress Section */}
          <Card className="bg-gradient-to-r from-cyan-500/20 via-blue-500/30 to-indigo-500/20 backdrop-blur-xl border-cyan-400/50 text-white shadow-2xl overflow-hidden relative">
            {/* Small planet sphere decoration */}
            <div className="absolute -bottom-10 -right-10 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 opacity-20 hidden sm:block">
              <img 
                src="/planets/F4RKAKmFyoRYVlTsUWN51wD1dg.avif" 
                alt="Planet decoration" 
                className="w-full h-full rounded-full object-cover"
                style={{ filter: 'grayscale(0.4) brightness(0.7)' }}
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-700/40 via-blue-600/40 to-indigo-800/40" />
            </div>
            <CardContent className="p-4 sm:p-6 md:p-8 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative z-10 text-center max-w-2xl mx-auto">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 backdrop-blur-sm">
                  <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">Excellent Progress!</h3>
                <p className="text-cyan-100 text-sm sm:text-base md:text-lg mb-4 sm:mb-6 leading-relaxed px-2">
                  Your consistent effort is building a strong foundation for English mastery. 
                  Continue with daily practice to accelerate your learning journey.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm">
                    🎯 Structured Learning
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm">
                    🔊 Professional Pronunciation
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm">
                    💼 Real-world Context
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BeginnersPage;
