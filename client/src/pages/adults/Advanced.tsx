import { useState, useEffect } from 'react';
import { 
  CheckCircle, Clock, 
  Target, BookOpen, Zap, Languages, Globe, Trophy, Crown,
  Lightbulb, GitBranch, Sparkles, TargetIcon,
  BarChart, Globe2, Mic2, BookOpenCheck, ArrowRight,
  Rocket, Medal, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const AdvancedPage = () => {
  const [activeModule, setActiveModule] = useState('mastery');
  const [progress, setProgress] = useState(85);
  const [streak] = useState(28);
  const [fluencyScore, setFluencyScore] = useState(89);
  const [vocabularySize, setVocabularySize] = useState(2850);
  const [isHovered, setIsHovered] = useState<number | null>(null);
  const [, setActiveChallenge] = useState<number | null>(null);
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
    { 
      id: 'mastery', 
      label: 'Language Mastery', 
      icon: Crown, 
      color: 'from-purple-500 to-indigo-600',
      description: 'Achieve near-native fluency and sophistication'
    },
    { 
      id: 'professional', 
      label: 'Executive Communication', 
      icon: Trophy, 
      color: 'from-cyan-500 to-blue-600',
      description: 'Master professional and leadership communication'
    },
    { 
      id: 'academic', 
      label: 'Academic Excellence', 
      icon: BookOpenCheck, 
      color: 'from-emerald-500 to-teal-600',
      description: 'Excel in academic and research contexts'
    },
    { 
      id: 'cultural', 
      label: 'Cultural Intelligence', 
      icon: Globe2, 
      color: 'from-amber-500 to-orange-600',
      description: 'Navigate complex cultural contexts with ease'
    },
  ];

  const masteryLessons = [
    {
      title: "Advanced Debates & Persuasion",
      description: "Master the art of persuasive speaking and complex argumentation in professional settings",
      duration: '35 min',
      level: 'Expert',
      focus: 'Persuasive Excellence',
      completed: true,
      icon: '💎',
      color: 'from-purple-400 via-indigo-500 to-blue-600',
      glowColor: 'rgba(168, 85, 247, 0.3)',
      skills: ['Rhetorical Mastery', 'Strategic Counter-arguments', 'Emotional Intelligence'],
      complexity: 'Expert Level',
      progress: 100
    },
    {
      title: "Idioms & Native Expressions",
      description: "Incorporate advanced idioms and colloquial expressions with native-like precision",
      duration: '30 min',
      level: 'Expert',
      focus: 'Native Fluency',
      completed: true,
      icon: '🎯',
      color: 'from-amber-400 via-orange-500 to-red-600',
      glowColor: 'rgba(251, 191, 36, 0.3)',
      skills: ['Cultural Context', 'Appropriate Usage', 'Nuanced Meaning'],
      complexity: 'Advanced',
      progress: 100
    },
    {
      title: "Advanced Storytelling",
      description: "Craft and deliver compelling narratives with emotional impact and professional polish",
      duration: '40 min',
      level: 'Expert',
      focus: 'Narrative Excellence',
      completed: false,
      icon: '📖',
      color: 'from-emerald-400 via-teal-500 to-cyan-600',
      glowColor: 'rgba(52, 211, 153, 0.3)',
      skills: ['Plot Architecture', 'Character Development', 'Audience Engagement'],
      complexity: 'Expert Level',
      progress: 75
    },
    {
      title: "Sophisticated Humor & Wit",
      description: "Understand and deploy advanced humor, sarcasm, and wit in professional contexts",
      duration: '32 min',
      level: 'Expert',
      focus: 'Cultural Intelligence',
      completed: false,
      icon: '🎭',
      color: 'from-pink-400 via-rose-500 to-fuchsia-600',
      glowColor: 'rgba(244, 63, 94, 0.3)',
      skills: ['Timing Precision', 'Context Awareness', 'Professional Delivery'],
      complexity: 'Advanced',
      progress: 60
    }
  ];

  const professionalLessons = [
    {
      title: "Executive Presentations",
      description: "Deliver powerful, persuasive presentations to C-level executives and stakeholders",
      duration: '45 min',
      level: 'Expert',
      focus: 'Leadership Communication',
      completed: false,
      icon: '👔',
      color: 'from-cyan-400 via-blue-500 to-indigo-600',
      glowColor: 'rgba(34, 211, 238, 0.3)',
      skills: ['Executive Presence', 'Data Storytelling', 'Stakeholder Management'],
      complexity: 'Expert Level',
      progress: 80
    },
    {
      title: "Negotiation Mastery",
      description: "Advanced negotiation techniques and diplomatic language for high-stakes scenarios",
      duration: '38 min',
      level: 'Expert',
      focus: 'Strategic Communication',
      completed: false,
      icon: '🤝',
      color: 'from-indigo-400 via-purple-500 to-fuchsia-600',
      glowColor: 'rgba(99, 102, 241, 0.3)',
      skills: ['Tactical Language', 'Conflict Resolution', 'Win-Win Framing'],
      complexity: 'Expert Level',
      progress: 65
    }
  ];

  const challengeActivities = [
    {
      title: "Real-time Debate Arena",
      description: "Live debates on complex global topics with AI-powered expert opponents",
      icon: GitBranch,
      color: "from-purple-500 to-indigo-600",
      gradient: "from-purple-500 to-indigo-600",
      time: "25-35 min",
      type: "Competitive",
      difficulty: "Expert",
      participants: "Live AI Judges"
    },
    {
      title: "Press Conference Simulation",
      description: "Handle intense media scrutiny and tough questions in high-pressure scenarios",
      icon: Mic2,
      color: "from-red-500 to-orange-600",
      gradient: "from-red-500 to-orange-600",
      time: "30 min",
      type: "Professional",
      difficulty: "Expert",
      participants: "Simulated Media"
    },
    {
      title: "Cultural Ambassador",
      description: "Explain complex cultural concepts and bridge communication gaps internationally",
      icon: Globe,
      color: "from-emerald-500 to-teal-600",
      gradient: "from-emerald-500 to-teal-600",
      time: "35 min",
      type: "Diplomatic",
      difficulty: "Advanced",
      participants: "International Panel"
    },
    {
      title: "Improvised Speaking",
      description: "Speak spontaneously on unexpected topics with professional coherence and impact",
      icon: Sparkles,
      color: "from-amber-500 to-orange-600",
      gradient: "from-amber-500 to-orange-600",
      time: "20 min",
      type: "Creative",
      difficulty: "Very High",
      participants: "AI Coaches"
    }
  ];

  const stats = [
    { 
      label: "Fluency Mastery", 
      value: `${fluencyScore}%`, 
      icon: Crown, 
      color: "text-purple-400",
      glowColor: "rgba(168, 85, 247, 0.2)",
      description: "Near-native fluency and sophistication"
    },
    { 
      label: "Vocabulary Excellence", 
      value: `${vocabularySize}+`, 
      icon: BookOpen, 
      color: "text-cyan-400",
      glowColor: "rgba(34, 211, 238, 0.2)",
      description: "Advanced professional vocabulary"
    },
    { 
      label: "Cultural Intelligence", 
      value: "82%", 
      icon: Globe, 
      color: "text-emerald-400",
      glowColor: "rgba(52, 211, 153, 0.2)",
      description: "Complex cultural context mastery"
    },
    { 
      label: "Expert Consistency", 
      value: `${streak} days`, 
      icon: Zap, 
      color: "text-amber-400",
      glowColor: "rgba(251, 191, 36, 0.2)",
      description: "Elite learning discipline"
    },
  ];

  const masteryMetrics = [
    { skill: "Advanced Vocabulary", progress: 88, target: 95, color: "from-purple-500 to-indigo-600" },
    { skill: "Grammatical Precision", progress: 92, target: 98, color: "from-cyan-500 to-blue-600" },
    { skill: "Pronunciation Excellence", progress: 85, target: 95, color: "from-emerald-500 to-teal-600" },
    { skill: "Cultural Appropriateness", progress: 82, target: 90, color: "from-amber-500 to-orange-600" },
    { skill: "Executive Presence", progress: 89, target: 95, color: "from-pink-500 to-rose-600" },
  ];

  const achievements = [
    { name: "Debate Champion", earned: true, icon: Trophy, color: "text-amber-400", progress: 100 },
    { name: "Vocabulary Virtuoso", earned: true, icon: Languages, color: "text-cyan-400", progress: 100 },
    { name: "Cultural Ambassador", earned: false, icon: Globe, color: "text-emerald-400", progress: 75 },
    { name: "Executive Orator", earned: false, icon: Mic2, color: "text-purple-400", progress: 60 },
  ];

  const handleStartChallenge = (challengeIndex: number) => {
    setActiveChallenge(challengeIndex);
    setProgress(prev => Math.min(prev + 3, 100));
    setFluencyScore(prev => Math.min(prev + 1, 100));
    setVocabularySize(prev => prev + 15);
  };

  const getCurrentLessons = () => {
    switch (activeModule) {
      case 'mastery': return masteryLessons;
      case 'professional': return professionalLessons;
      default: return masteryLessons;
    }
  };

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
              opacity: star.opacity || (0.6 + Math.random() * 0.4),
              boxShadow: `0 0 ${(star.size || 2) * 2}px rgba(255, 255, 255, ${star.opacity || 0.6})`
            }}
          />
        ))}
      </div>

      {/* Nebula and Cosmic Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-radial from-purple-500/30 via-indigo-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-radial from-indigo-500/25 via-amber-500/15 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/3 w-[700px] h-[700px] bg-gradient-radial from-purple-500/20 via-amber-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Large Planet/Moon Spheres - Main Visual Elements */}
      {/* Main Large Planet - Bottom Left - Reduced Size */}
      <div className="fixed bottom-0 left-0 w-[100px] h-[100px] sm:w-[140px] sm:h-[140px] md:w-[180px] md:h-[180px] lg:w-[220px] lg:h-[220px] xl:w-[260px] xl:h-[260px] pointer-events-none opacity-60 sm:opacity-65 md:opacity-70 lg:opacity-75 xl:opacity-80">
        <div className="relative w-full h-full">
          <img 
            src="/planets/Yo4hcrPNqAQh1DJiOgz3TH1rI.avif" 
            alt="Planet" 
            className="absolute inset-0 rounded-full object-cover shadow-2xl"
            style={{ filter: 'grayscale(0.2) brightness(0.85)' }}
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-amber-500/20 blur-2xl" />
        </div>
      </div>

      {/* Secondary Planet - Top Right */}
      <div className="fixed top-16 right-2 sm:right-6 md:right-10 w-[100px] h-[100px] sm:w-[150px] sm:h-[150px] md:w-[200px] md:h-[200px] lg:w-[260px] lg:h-[260px] xl:w-[300px] xl:h-[300px] pointer-events-none opacity-45 sm:opacity-55 md:opacity-65 lg:opacity-70 hidden sm:block">
        <div className="relative w-full h-full">
          <img 
            src="/planets/eReia3yfybtZ8P5576d6kF8NJIM.avif" 
            alt="Planet" 
            className="absolute inset-0 rounded-full object-cover shadow-xl"
            style={{ filter: 'grayscale(0.3) brightness(0.75)' }}
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/15 to-amber-500/15 blur-xl" />
        </div>
      </div>

      {/* Tertiary Planet - Middle Right */}
      <div className="fixed top-1/2 right-4 sm:right-12 md:right-20 w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] md:w-[180px] md:h-[180px] lg:w-[220px] lg:h-[220px] xl:w-[250px] xl:h-[250px] pointer-events-none opacity-35 sm:opacity-45 md:opacity-55 lg:opacity-60 hidden md:block">
        <div className="relative w-full h-full">
          <img 
            src="/planets/FOIQJjlpuUktsmNqzA3QoB8f2oU.avif" 
            alt="Planet" 
            className="absolute inset-0 rounded-full object-cover shadow-xl"
            style={{ filter: 'grayscale(0.3) brightness(0.7)' }}
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/15 to-indigo-500/15 blur-xl" />
        </div>
      </div>

      {/* Small Planet - Top Left */}
      <div className="fixed top-24 left-2 sm:left-12 md:left-20 w-[70px] h-[70px] sm:w-[100px] sm:h-[100px] md:w-[150px] md:h-[150px] lg:w-[180px] lg:h-[180px] xl:w-[200px] xl:h-[200px] pointer-events-none opacity-30 sm:opacity-35 md:opacity-45 lg:opacity-50 hidden lg:block">
        <div className="relative w-full h-full">
          <img 
            src="/planets/axheyaAfqpR4fyF8ixffC9kL8kU.avif" 
            alt="Planet" 
            className="absolute inset-0 rounded-full object-cover shadow-lg"
            style={{ filter: 'grayscale(0.4) brightness(0.65)' }}
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/10 blur-lg" />
        </div>
      </div>

      <div className="relative z-10 pb-12 sm:pb-16 md:pb-20 pt-20 sm:pt-24 md:pt-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-xl blur-2xl opacity-50 animate-pulse"></div>
                
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-indigo-400 to-amber-400 bg-clip-text text-transparent">
                Expert English Mastery
              </h1>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-purple-100/80 max-w-2xl mx-auto mb-4 sm:mb-6 leading-relaxed px-2">
              Achieve professional excellence with near-native fluency, executive communication skills, and sophisticated cultural intelligence
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 px-2">
              <Badge variant="secondary" className="bg-purple-500/20 backdrop-blur-sm text-purple-300 border-purple-400/30 px-2 sm:px-3 md:px-4 py-1 text-xs sm:text-sm">
                <Crown className="w-3 h-3 mr-1 sm:mr-2" />
                Expert Level
              </Badge>
              <Badge variant="secondary" className="bg-cyan-500/20 backdrop-blur-sm text-cyan-300 border-cyan-400/30 px-2 sm:px-3 md:px-4 py-1 text-xs sm:text-sm">
                <Lightbulb className="w-3 h-3 mr-1 sm:mr-2" />
                Executive Communication
              </Badge>
              <Badge variant="secondary" className="bg-emerald-500/20 backdrop-blur-sm text-emerald-300 border-emerald-400/30 px-2 sm:px-3 md:px-4 py-1 text-xs sm:text-sm">
                <TargetIcon className="w-3 h-3 mr-1 sm:mr-2" />
                Professional Excellence
              </Badge>
            </div>
          </div>

          {/* Elite Progress Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-10 md:mb-12">
            {/* Mastery Progress */}
            <Card className="lg:col-span-2 bg-slate-800/40 backdrop-blur-xl border-purple-500/30 shadow-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-white">Expert Progress Tracking</h3>
                    <p className="text-sm sm:text-base text-purple-100/70">Your journey to professional English mastery</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">{progress}%</div>
                    <div className="text-sm sm:text-base text-purple-100/70">Mastery Achievement</div>
                  </div>
                </div>

                <Progress value={progress} className="h-3 bg-slate-700/50 mb-8">
                  <div className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-amber-500 rounded-full transition-all duration-500" />
                </Progress>
                
                {/* Mastery Metrics */}
                <div className="space-y-4 sm:space-y-6">
                  <h4 className="font-semibold text-white text-base sm:text-lg">Expert Skill Development</h4>
                  {masteryMetrics.map((metric, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">{metric.skill}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-purple-100/60">Target: {metric.target}%</span>
                          <span className="text-sm font-medium text-white w-12 text-right">{metric.progress}%</span>
                        </div>
                      </div>
                      <Progress value={metric.progress} className="w-full h-2 bg-slate-700/50">
                        <div className={cn(
                          "h-full rounded-full transition-all duration-500 bg-gradient-to-r",
                          metric.color,
                          metric.progress >= metric.target && "animate-pulse"
                        )} />
                      </Progress>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Elite Stats & Achievements */}
            <Card className="bg-slate-800/40 backdrop-blur-xl border-purple-500/30 shadow-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Expert Performance</h3>
                
                {/* Stats */}
                <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-slate-700/30 backdrop-blur-sm border border-purple-500/20 hover:border-purple-400/50 transition-all duration-300">
                        <div className={cn("p-3 rounded-xl", stat.color)} style={{ backgroundColor: stat.glowColor }}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-baseline">
                            <span className="text-sm font-medium text-white">{stat.label}</span>
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
                  <h4 className="text-lg font-semibold text-white mb-4">Expert Certifications</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {achievements.map((achievement, index) => {
                      const Icon = achievement.icon;
                      const isEarned = achievement.earned;

                      return (
                        <div key={index} className={cn(
                          "p-4 rounded-xl border transition-all duration-300 group cursor-pointer backdrop-blur-sm",
                          isEarned
                            ? "bg-gradient-to-br from-purple-500/30 to-indigo-500/20 border-purple-400/50 text-purple-200 hover:from-purple-500/40 hover:to-indigo-500/30"
                            : "bg-slate-700/30 border-slate-600/50 text-purple-100/60 hover:bg-slate-700/50"
                        )}>
                          <Icon className={cn(
                            "w-5 h-5 mb-2 transition-transform duration-300 group-hover:scale-110",
                            achievement.color,
                            !isEarned && "opacity-50"
                          )} />
                          <div className="text-sm font-medium mb-2">{achievement.name}</div>
                          {!isEarned && (
                            <Progress value={achievement.progress} className="h-1 bg-slate-700/50">
                              <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" />
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

          {/* Expert Challenge Labs */}
          <div className="mb-8 sm:mb-10 md:mb-12">
            <div className="mb-6 sm:mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Expert Challenge Labs</h2>
                <p className="text-sm sm:text-base text-purple-100/70">High-stakes simulations for professional excellence</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {challengeActivities.map((activity, index) => {
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
                      
                      <div className="flex items-center gap-2 mb-3">
                        <h4 className="font-semibold text-white text-lg">{activity.title}</h4>
                        <Badge variant="outline" className={cn(
                          "text-xs border-0",
                          activity.difficulty === "Expert" ? "bg-red-500/20 text-red-300 border-red-400/30" :
                          activity.difficulty === "Very High" ? "bg-orange-500/20 text-orange-300 border-orange-400/30" :
                          "bg-amber-500/20 text-amber-300 border-amber-400/30"
                        )}>
                          {activity.difficulty}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-purple-100/70 mb-6 leading-relaxed">{activity.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="secondary" className="text-xs bg-slate-700/50 text-purple-200">
                          {activity.time}
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-300 border-purple-400/30">
                          {activity.participants}
                        </Badge>
                      </div>
                      
                      <Button 
                        className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/30"
                        onClick={() => handleStartChallenge(index)}
                      >
                        <TargetIcon className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                        Start Challenge
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Expert Learning Modules */}
          <div className="mb-8 sm:mb-10 md:mb-12">
            <div className="mb-6 sm:mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Expert Learning Modules</h2>
                <p className="text-sm sm:text-base text-purple-100/70">Master sophisticated communication for professional leadership</p>
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
                        ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg border-transparent" 
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
                          <div className="flex items-center gap-2">
                            {lesson.completed && (
                              <CheckCircle className="w-6 h-6 text-emerald-300 animate-pulse" />
                            )}
                            <Badge variant="secondary" className="bg-black/30 text-white border-0 backdrop-blur-sm">
                              {lesson.complexity}
                            </Badge>
                          </div>
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
                            : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
                        )}
                        onClick={() => handleStartChallenge(index)}
                      >
                        <span className="relative z-10 flex items-center justify-center">
                          {lesson.completed ? (
                            <>
                              <Crown className="w-4 h-4 mr-2" />
                              Master Again
                            </>
                          ) : (
                            <>
                              <TargetIcon className="w-4 h-4 mr-2" />
                              Continue Mastery
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

          {/* Elite Certification Section */}
          <Card className="bg-gradient-to-r from-purple-600/30 via-indigo-600/40 to-amber-600/30 backdrop-blur-xl border-purple-400/50 text-white shadow-2xl overflow-hidden">
            <CardContent className="p-4 sm:p-6 md:p-8 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative z-10 text-center max-w-4xl mx-auto">
                <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 backdrop-blur-sm">
                  <Medal className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-white">Expert English Certification</h3>
                <p className="text-purple-100 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto px-2">
                  Earn professional recognition by demonstrating near-native fluency, executive communication skills, and sophisticated cultural intelligence
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-center mb-6 sm:mb-8">
                  <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/15">
                    <BarChart className="w-10 h-10 mx-auto mb-3" />
                    <h4 className="font-bold text-lg mb-2">Comprehensive Assessment</h4>
                    <p className="text-purple-200 text-sm">Rigorous evaluation across all professional domains</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/15">
                    <Globe2 className="w-10 h-10 mx-auto mb-3" />
                    <h4 className="font-bold text-lg mb-2">Global Recognition</h4>
                    <p className="text-purple-200 text-sm">Internationally respected professional certification</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/15">
                    <Sparkles className="w-10 h-10 mx-auto mb-3" />
                    <h4 className="font-bold text-lg mb-2">Elite Network</h4>
                    <p className="text-purple-200 text-sm">Join top-tier global professionals and leaders</p>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="bg-white text-purple-600 hover:bg-purple-50 font-bold px-8 py-4 text-lg transition-all duration-300 hover:scale-105"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Begin Certification Journey
                  <Rocket className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdvancedPage;
