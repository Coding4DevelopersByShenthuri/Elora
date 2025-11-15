import { useState, useEffect } from 'react';
import { 
  Play, Mic, CheckCircle, Clock, Users, 
  Target, BookOpen, MessageCircle, Repeat, Zap, TrendingUp,
  Brain, Languages, GitMerge, ThumbsUp, BarChart3,
  Video, Headphones, PenTool, ArrowRight, Rocket, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const IntermediatesPage = () => {
  const [activeModule, setActiveModule] = useState('conversation');
  const [progress, setProgress] = useState(65);
  const [streak] = useState(12);
  const [fluencyScore, setFluencyScore] = useState(72);
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

  const modules = [
    { id: 'conversation', label: 'Advanced Conversation', icon: MessageCircle, color: 'from-cyan-500 to-blue-600' },
    { id: 'grammar', label: 'Complex Grammar', icon: Brain, color: 'from-purple-500 to-pink-600' },
    { id: 'vocabulary', label: 'Professional Vocabulary', icon: Languages, color: 'from-emerald-500 to-teal-600' },
    { id: 'pronunciation', label: 'Speech Refinement', icon: Mic, color: 'from-amber-500 to-orange-600' },
  ];

  const conversationLessons = [
    {
      title: "Business Meetings",
      description: "Master professional meeting participation, presentations, and negotiations",
      duration: '25 min',
      level: 'Intermediate',
      focus: 'Professional Communication',
      completed: true,
      icon: '💼',
      color: 'from-cyan-400 via-blue-500 to-indigo-600',
      glowColor: 'rgba(34, 211, 238, 0.3)',
      skills: ['Formal Language', 'Presentation Skills', 'Negotiation Tactics'],
      progress: 100
    },
    {
      title: "Social Gatherings",
      description: "Excel in social events with natural conversation and cultural awareness",
      duration: '20 min',
      level: 'Intermediate',
      focus: 'Social Intelligence',
      completed: true,
      icon: '🎉',
      color: 'from-purple-400 via-pink-500 to-rose-600',
      glowColor: 'rgba(168, 85, 247, 0.3)',
      skills: ['Small Talk Mastery', 'Storytelling', 'Cultural Context'],
      progress: 100
    },
    {
      title: "Problem Solving",
      description: "Develop critical thinking and analytical discussion skills",
      duration: '30 min',
      level: 'Intermediate',
      focus: 'Analytical Communication',
      completed: false,
      icon: '🔧',
      color: 'from-amber-400 via-orange-500 to-red-600',
      glowColor: 'rgba(251, 191, 36, 0.3)',
      skills: ['Analytical Dialogue', 'Solution Proposals', 'Decision Framing'],
      progress: 65
    },
    {
      title: "Cultural Topics",
      description: "Discuss arts, media, and cultural events with depth and insight",
      duration: '28 min',
      level: 'Intermediate',
      focus: 'Cultural Literacy',
      completed: false,
      icon: '🎬',
      color: 'from-emerald-400 via-teal-500 to-cyan-600',
      glowColor: 'rgba(52, 211, 153, 0.3)',
      skills: ['Opinion Expression', 'Critical Analysis', 'Comparative Discussion'],
      progress: 40
    }
  ];

  const grammarLessons = [
    {
      title: "Conditional Sentences",
      description: "Master complex if-clauses and hypothetical scenarios",
      duration: '22 min',
      level: 'Intermediate',
      focus: 'Advanced Structures',
      completed: true,
      icon: '🔀',
      color: 'from-indigo-400 via-purple-500 to-fuchsia-600',
      glowColor: 'rgba(99, 102, 241, 0.3)',
      skills: ['Hypotheticals', 'Probability', 'Complex Conditions'],
      progress: 100
    },
    {
      title: "Reported Speech",
      description: "Accurately convey others' statements and thoughts",
      duration: '25 min',
      level: 'Intermediate',
      focus: 'Indirect Communication',
      completed: false,
      icon: '🗣️',
      color: 'from-teal-400 via-cyan-500 to-blue-600',
      glowColor: 'rgba(20, 184, 166, 0.3)',
      skills: ['Speech Reporting', 'Tense Shifting', 'Context Adaptation'],
      progress: 75
    }
  ];

  const practiceActivities = [
    {
      title: "Role-Play Scenarios",
      description: "Professional simulations with AI-powered feedback",
      icon: Users,
      color: "from-cyan-500 to-blue-600",
      gradient: "from-cyan-500 to-blue-600",
      time: "15-20 min",
      type: "Interactive",
      level: "Intermediate+"
    },
    {
      title: "Debate Practice",
      description: "Advanced argumentation and viewpoint development",
      icon: GitMerge,
      color: "from-purple-500 to-pink-600",
      gradient: "from-purple-500 to-pink-600",
      time: "20-25 min",
      type: "Advanced",
      level: "Intermediate+"
    },
    {
      title: "Story Building",
      description: "Creative narrative development and delivery",
      icon: PenTool,
      color: "from-emerald-500 to-teal-600",
      gradient: "from-emerald-500 to-teal-600",
      time: "15 min",
      type: "Creative",
      level: "All Levels"
    },
    {
      title: "Accent Training",
      description: "Professional pronunciation and intonation refinement",
      icon: Headphones,
      color: "from-amber-500 to-orange-600",
      gradient: "from-amber-500 to-orange-600",
      time: "10-15 min",
      type: "Technical",
      level: "Intermediate+"
    }
  ];

  const stats = [
    { 
      label: "Fluency Score", 
      value: `${fluencyScore}%`, 
      icon: TrendingUp, 
      color: "text-cyan-400",
      glowColor: "rgba(34, 211, 238, 0.2)",
      description: "Speaking fluency and natural flow"
    },
    { 
      label: "Vocabulary Mastery", 
      value: "1,240", 
      icon: BookOpen, 
      color: "text-emerald-400",
      glowColor: "rgba(52, 211, 153, 0.2)",
      description: "Active professional vocabulary"
    },
    { 
      label: "Grammar Accuracy", 
      value: "78%", 
      icon: Brain, 
      color: "text-purple-400",
      glowColor: "rgba(168, 85, 247, 0.2)",
      description: "Complex structure proficiency"
    },
    { 
      label: "Learning Consistency", 
      value: `${streak} days`, 
      icon: Zap, 
      color: "text-amber-400",
      glowColor: "rgba(251, 191, 36, 0.2)",
      description: "Continuous progress streak"
    },
  ];

  const skillsProgress = [
    { skill: "Conversation Flow", progress: 75, color: "from-cyan-500 to-blue-600" },
    { skill: "Grammar Accuracy", progress: 78, color: "from-purple-500 to-pink-600" },
    { skill: "Vocabulary Range", progress: 70, color: "from-emerald-500 to-teal-600" },
    { skill: "Pronunciation", progress: 65, color: "from-amber-500 to-orange-600" },
    { skill: "Listening Comprehension", progress: 82, color: "from-indigo-500 to-blue-600" },
  ];

  const achievements = [
    { name: "Advanced Speaker", earned: true, icon: MessageCircle, progress: 100 },
    { name: "Grammar Expert", earned: false, icon: Brain, progress: 85 },
    { name: "Vocabulary Master", earned: true, icon: Languages, progress: 100 },
    { name: "Pronunciation Pro", earned: false, icon: Mic, progress: 70 },
  ];

  const handleStartLesson = () => {
    setProgress(prev => Math.min(prev + 8, 100));
    setFluencyScore(prev => Math.min(prev + 3, 100));
  };

  const getCurrentLessons = () => {
    switch (activeModule) {
      case 'conversation': return conversationLessons;
      case 'grammar': return grammarLessons;
      default: return conversationLessons;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950">
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
              opacity: star.opacity || (0.6 + Math.random() * 0.4),
              boxShadow: `0 0 ${(star.size || 2) * 2}px rgba(255, 255, 255, ${star.opacity || 0.6})`
            }}
          />
        ))}
      </div>

      {/* Nebula and Cosmic Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-radial from-purple-500/30 via-pink-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-radial from-pink-500/25 via-rose-500/15 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/3 w-[700px] h-[700px] bg-gradient-radial from-purple-500/20 via-indigo-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Large Planet/Moon Spheres - Main Visual Elements */}
      {/* Main Large Planet - Bottom Left - Reduced Size */}
      <div className="fixed bottom-0 left-0 w-[100px] h-[100px] sm:w-[140px] sm:h-[140px] md:w-[180px] md:h-[180px] lg:w-[220px] lg:h-[220px] xl:w-[260px] xl:h-[260px] pointer-events-none opacity-60 sm:opacity-65 md:opacity-70 lg:opacity-75">
        <div className="relative w-full h-full">
          <img 
            src="/planets/YZWPZTXZtvH1iH4rCX0Uh48wmtQ.avif" 
            alt="Planet" 
            className="absolute inset-0 rounded-full object-cover shadow-2xl"
            style={{ filter: 'grayscale(0.2) brightness(0.85)' }}
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-2xl" />
        </div>
      </div>

      {/* Secondary Planet - Top Right */}
      <div className="fixed top-20 right-2 sm:right-6 md:right-12 w-[120px] h-[120px] sm:w-[180px] sm:h-[180px] md:w-[240px] md:h-[240px] lg:w-[280px] lg:h-[280px] xl:w-[320px] xl:h-[320px] pointer-events-none opacity-45 sm:opacity-55 md:opacity-65 hidden sm:block">
        <div className="relative w-full h-full">
          <img 
            src="/planets/FOIQJjlpuUktsmNqzA3QoB8f2oU.avif" 
            alt="Planet" 
            className="absolute inset-0 rounded-full object-cover shadow-xl"
            style={{ filter: 'grayscale(0.3) brightness(0.75)' }}
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500/15 to-rose-500/15 blur-xl" />
        </div>
      </div>

      {/* Tertiary Planet - Middle Right */}
      <div className="fixed top-1/2 right-4 sm:right-12 md:right-24 w-[90px] h-[90px] sm:w-[140px] sm:h-[140px] md:w-[180px] md:h-[180px] lg:w-[210px] lg:h-[210px] xl:w-[240px] xl:h-[240px] pointer-events-none opacity-35 sm:opacity-45 md:opacity-55 hidden md:block">
        <div className="relative w-full h-full">
          <img 
            src="/planets/axheyaAfqpR4fyF8ixffC9kL8kU.avif" 
            alt="Planet" 
            className="absolute inset-0 rounded-full object-cover shadow-xl"
            style={{ filter: 'grayscale(0.3) brightness(0.7)' }}
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/15 to-indigo-500/15 blur-xl" />
        </div>
      </div>

      {/* Small Planet - Top Left */}
      <div className="fixed top-28 left-2 sm:left-8 md:left-16 w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] md:w-[160px] md:h-[160px] lg:w-[180px] lg:h-[180px] xl:w-[200px] xl:h-[200px] pointer-events-none opacity-30 sm:opacity-35 md:opacity-45 hidden lg:block">
        <div className="relative w-full h-full">
          <img 
            src="/planets/3cNnbBNWbjHl4OiEl7rG5h7xczY.avif" 
            alt="Planet" 
            className="absolute inset-0 rounded-full object-cover shadow-lg"
            style={{ filter: 'grayscale(0.4) brightness(0.65)' }}
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500/10 to-purple-500/10 blur-lg" />
        </div>
      </div>

      <div className="relative z-10 pb-12 sm:pb-16 md:pb-20 pt-20 sm:pt-24 md:pt-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl blur-2xl opacity-50 animate-pulse"></div>
                
            </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
              Intermediate Mastery
            </h1>
          </div>
            <p className="text-sm sm:text-base md:text-lg text-purple-100/80 max-w-2xl mx-auto mb-4 sm:mb-6 leading-relaxed px-2">
            Advance your English with complex conversations, professional vocabulary, and sophisticated communication skills
          </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 px-2">
              <Badge variant="secondary" className="bg-purple-500/20 backdrop-blur-sm text-purple-300 border-purple-400/30 px-2 sm:px-3 md:px-4 py-1 text-xs sm:text-sm">
                <Brain className="w-3 h-3 mr-1 sm:mr-2" />
              Advanced Grammar
            </Badge>
              <Badge variant="secondary" className="bg-pink-500/20 backdrop-blur-sm text-pink-300 border-pink-400/30 px-2 sm:px-3 md:px-4 py-1 text-xs sm:text-sm">
                <MessageCircle className="w-3 h-3 mr-1 sm:mr-2" />
              Professional Dialogue
            </Badge>
              <Badge variant="secondary" className="bg-emerald-500/20 backdrop-blur-sm text-emerald-300 border-emerald-400/30 px-2 sm:px-3 md:px-4 py-1 text-xs sm:text-sm">
                <Languages className="w-3 h-3 mr-1 sm:mr-2" />
              Expanded Vocabulary
            </Badge>
          </div>
        </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-10 md:mb-12">
            {/* Main Progress Card */}
            <Card className="lg:col-span-2 bg-slate-800/40 backdrop-blur-xl border-purple-500/30 shadow-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-white">Advanced Progress Tracking</h3>
                    <p className="text-sm sm:text-base text-purple-100/70">Monitor your journey toward English mastery</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{progress}%</div>
                    <div className="text-sm sm:text-base text-purple-100/70">Overall Mastery</div>
                  </div>
                </div>

                <Progress value={progress} className="h-3 bg-slate-700/50 mb-8">
                  <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-full transition-all duration-500" />
              </Progress>
              
              {/* Skills Progress */}
              <div className="space-y-4">
                  <h4 className="font-semibold text-white mb-4">Skill Development</h4>
                {skillsProgress.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-purple-100/80">{skill.skill}</span>
                    <div className="flex items-center gap-3">
                        <Progress value={skill.progress} className="w-32 h-2 bg-slate-700/50">
                        <div className={cn("h-full rounded-full bg-gradient-to-r", skill.color)} />
                      </Progress>
                        <span className="text-sm font-medium text-white w-12">{skill.progress}%</span>
                      </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats & Achievements */}
            <Card className="bg-slate-800/40 backdrop-blur-xl border-purple-500/30 shadow-2xl">
            <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-white mb-6">Performance Metrics</h3>

              {/* Stats */}
              <div className="space-y-6 mb-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                      <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-slate-700/30 backdrop-blur-sm border border-purple-500/20 hover:border-purple-400/50 transition-all duration-300">
                        <div className={cn("p-3 rounded-xl", stat.color)} style={{ backgroundColor: stat.glowColor }}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm font-medium text-purple-100/80">{stat.label}</span>
                            <span className="text-lg font-bold text-white">{stat.value}</span>
                          </div>
                          <p className="text-xs text-purple-100/60">{stat.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Achievements */}
              <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Certifications</h4>
                <div className="grid grid-cols-2 gap-3">
                  {achievements.map((achievement, index) => {
                    const Icon = achievement.icon;
                    const isEarned = achievement.earned;

                    return (
                      <div key={index} className={cn(
                          "p-3 rounded-xl border transition-all duration-300 backdrop-blur-sm",
                        isEarned
                            ? "bg-gradient-to-br from-purple-500/30 to-pink-500/20 border-purple-400/50 text-purple-200"
                            : "bg-slate-700/30 border-slate-600/50 text-purple-100/60"
                      )}>
                        <Icon className={cn(
                          "w-4 h-4 mb-2",
                          isEarned
                              ? "text-purple-300"
                              : "text-slate-500"
                        )} />
                        <div className="text-sm font-medium mb-1">{achievement.name}</div>
                        {!isEarned && (
                            <Progress value={achievement.progress} className="h-1 bg-slate-700/50">
                              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                          </Progress>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Practice Labs */}
          <div className="mb-8 sm:mb-10 md:mb-12">
            <div className="mb-6 sm:mb-8">
            <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Advanced Practice Labs</h2>
                <p className="text-sm sm:text-base text-purple-100/70">Interactive exercises for professional communication</p>
              </div>
          </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {practiceActivities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <Card 
                  key={index} 
                    className="group cursor-pointer bg-slate-800/40 backdrop-blur-xl border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20"
                  onMouseEnter={() => setIsHovered(index)}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <CardContent className="p-6 relative overflow-hidden">
                    <div className={cn(
                        "absolute top-0 right-0 w-20 h-20 rounded-full -mr-6 -mt-6 transition-all duration-500 bg-gradient-to-r opacity-20",
                      activity.color,
                        isHovered === index ? "opacity-30 scale-150" : ""
                    )}></div>
                    
                    <div className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-white relative z-10 transition-transform duration-300 bg-gradient-to-r shadow-lg",
                      activity.color,
                      isHovered === index && "scale-110"
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                      <h4 className="font-semibold text-white mb-3 text-lg">{activity.title}</h4>
                      <p className="text-sm text-purple-100/70 mb-6 leading-relaxed">{activity.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                        <Badge variant="secondary" className="text-xs bg-slate-700/50 text-purple-200">
                        {activity.time}
                      </Badge>
                        <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-300 border-purple-400/30">
                        {activity.level}
                      </Badge>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                        className="w-full border-purple-400/30 text-purple-500 hover:bg-purple-500/20 hover:border-purple-400/50 transition-all duration-300"
                    >
                      Start Practice
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Learning Modules */}
          <div className="mb-8 sm:mb-10 md:mb-12">
            <div className="mb-6 sm:mb-8">
            <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Advanced Learning Modules</h2>
                <p className="text-sm sm:text-base text-purple-100/70">Master complex language structures and professional communication</p>
              </div>
          </div>

          {/* Module Navigation */}
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Button
                  key={module.id}
                  variant={activeModule === module.id ? "default" : "outline"}
                    size="sm"
                  className={cn(
                      "rounded-xl px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-medium transition-all duration-300 border-2 backdrop-blur-sm",
                    activeModule === module.id 
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg border-transparent" 
                        : "bg-slate-800/40 border-purple-500/30 hover:border-purple-400/50 text-purple-200 hover:shadow-md"
                  )}
                  onClick={() => setActiveModule(module.id)}
                >
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3" />
                  {module.label}
                </Button>
              );
            })}
          </div>

          {/* Lessons Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {getCurrentLessons().map((lesson, index) => (
              <Card 
                key={index} 
                className={cn(
                    "group cursor-pointer border-2 transition-all duration-500 bg-slate-800/40 backdrop-blur-xl hover:shadow-2xl overflow-hidden",
                  lesson.completed 
                      ? "border-emerald-400/50 hover:border-emerald-300/70" 
                      : "border-purple-500/30 hover:border-purple-400/50"
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
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-4xl transform transition-transform duration-300 group-hover:scale-110">
                          {lesson.icon}
                        </div>
                        {lesson.completed && (
                          <CheckCircle className="w-6 h-6 text-emerald-300 animate-pulse" />
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-3">{lesson.title}</h3>
                      <p className="text-white/90 text-sm leading-relaxed mb-4">{lesson.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {lesson.skills?.map((skill, skillIndex) => (
                          <Badge key={skillIndex} variant="secondary" className="bg-white/20 text-white border-0 text-xs backdrop-blur-sm">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                    <div className="p-4 sm:p-6 bg-slate-800/60 backdrop-blur-sm">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0 text-xs sm:text-sm text-purple-100/70 mb-3 sm:mb-4">
                        <span className="flex items-center gap-1 sm:gap-2 font-medium">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        {lesson.duration}
                      </span>
                        <span className="flex items-center gap-1 sm:gap-2 font-medium">
                          <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                        {lesson.focus}
                      </span>
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-400/30 text-xs w-fit">
                        {lesson.level}
                      </Badge>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center justify-between text-sm">
                          <span className="text-purple-100/70">Module Progress</span>
                          <span className="font-medium text-white">{lesson.progress}%</span>
                      </div>
                        <Progress value={lesson.progress} className="h-2 bg-slate-700/50">
                        <div className={cn("h-full rounded-full bg-gradient-to-r", lesson.color)} />
                      </Progress>
                    </div>
                    
                    <Button 
                      className={cn(
                        "w-full font-semibold py-3 rounded-xl transition-all duration-300 group-hover:shadow-lg relative overflow-hidden",
                        lesson.completed
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                            : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      )}
                      onClick={handleStartLesson}
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
                            Continue Learning
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

        {/* Advanced Features Section */}
          <Card className="bg-gradient-to-r from-purple-500/20 via-pink-500/30 to-rose-500/20 backdrop-blur-xl border-purple-400/50 text-white shadow-2xl overflow-hidden">
          <CardContent className="p-8 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            
            <div className="relative z-10 text-center max-w-4xl mx-auto">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Ready for Advanced Challenges?</h3>
                <p className="text-purple-100 text-lg mb-8 leading-relaxed">
                Elevate your English to professional levels with complex debates, executive presentations, and sophisticated cultural discussions
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/15">
                  <Video className="w-8 h-8 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Video Analysis</h4>
                    <p className="text-purple-200 text-sm">Analyze authentic professional conversations</p>
                </div>
                <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/15">
                  <BarChart3 className="w-8 h-8 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Advanced Analytics</h4>
                    <p className="text-purple-200 text-sm">Detailed performance insights and growth tracking</p>
                </div>
                <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/15">
                  <ThumbsUp className="w-8 h-8 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Expert Feedback</h4>
                    <p className="text-purple-200 text-sm">Professional coaching and community insights</p>
                  </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default IntermediatesPage;
