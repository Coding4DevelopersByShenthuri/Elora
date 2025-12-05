import { useState, useEffect } from 'react';
import { 
  CheckCircle, Clock, 
  Target, BookOpen, Zap, Languages, Globe, Trophy, Crown,
  Lightbulb, GitBranch, Sparkles,
  BarChart, Globe2, Mic2, BookOpenCheck, ArrowRight,
  Rocket, Medal, Shield, Construction, TrendingUp, Users, Award as AwardIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  const [isLoaded, setIsLoaded] = useState(false);

  // Page load fade-in
  useEffect(() => {
    setIsLoaded(true);
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
      color: 'from-purple-500 via-indigo-500 to-blue-500',
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
      color: 'from-amber-500 via-orange-500 to-red-500',
      glowColor: 'rgba(249, 115, 22, 0.3)',
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
      color: 'from-emerald-500 via-teal-500 to-cyan-500',
      glowColor: 'rgba(16, 185, 129, 0.3)',
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
      color: 'from-pink-500 via-rose-500 to-fuchsia-500',
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
      color: 'from-cyan-500 via-blue-500 to-indigo-500',
      glowColor: 'rgba(59, 130, 246, 0.3)',
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
      color: 'from-indigo-500 via-purple-500 to-fuchsia-500',
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
      bgColor: "bg-purple-500/20",
      textColor: "text-purple-500",
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
      bgColor: "bg-red-500/20",
      textColor: "text-red-500",
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
      bgColor: "bg-emerald-500/20",
      textColor: "text-emerald-500",
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
      bgColor: "bg-amber-500/20",
      textColor: "text-amber-500",
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
      color: "text-purple-500",
      bgColor: "bg-purple-500/20",
      glowColor: "rgba(168, 85, 247, 0.2)",
      description: "Near-native fluency and sophistication"
    },
    { 
      label: "Vocabulary Excellence", 
      value: `${vocabularySize}+`, 
      icon: BookOpen, 
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/20",
      glowColor: "rgba(59, 130, 246, 0.2)",
      description: "Advanced professional vocabulary"
    },
    { 
      label: "Cultural Intelligence", 
      value: "82%", 
      icon: Globe, 
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/20",
      glowColor: "rgba(16, 185, 129, 0.2)",
      description: "Complex cultural context mastery"
    },
    { 
      label: "Expert Consistency", 
      value: `${streak} days`, 
      icon: Zap, 
      color: "text-orange-500",
      bgColor: "bg-orange-500/20",
      glowColor: "rgba(249, 115, 22, 0.2)",
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
    { name: "Debate Champion", earned: true, icon: Trophy, color: "text-amber-500", progress: 100 },
    { name: "Vocabulary Virtuoso", earned: true, icon: Languages, color: "text-cyan-500", progress: 100 },
    { name: "Cultural Ambassador", earned: false, icon: Globe, color: "text-emerald-500", progress: 75 },
    { name: "Executive Orator", earned: false, icon: Mic2, color: "text-purple-500", progress: 60 },
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
    <div className={`relative overflow-hidden min-h-screen ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
      {/* Background Elements - Same as Adults Page */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] rounded-full bg-accent/10 blur-3xl -z-10"></div>

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 pt-24 pb-16 space-y-10">
        {/* Coming Soon Section - Advanced Professional Design with Different Style */}
        <section className="py-6 sm:py-8 md:py-10 lg:py-12">
          <Card className="relative overflow-hidden border-2 border-emerald-500/20 dark:border-emerald-500/30 backdrop-blur-2xl bg-white/75 dark:bg-slate-900/75 shadow-2xl">
            {/* Asymmetrical Glass Morphism Background Accents */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-br from-emerald-500/8 via-teal-500/5 to-cyan-500/8 rounded-br-[100px] dark:from-emerald-500/12 dark:via-teal-500/8 dark:to-cyan-500/12"></div>
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-green-500/8 via-emerald-500/5 to-teal-500/8 rounded-tl-[100px] dark:from-green-500/12 dark:via-emerald-500/8 dark:to-teal-500/12"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl dark:bg-emerald-500/15"></div>
            <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl dark:bg-teal-500/15"></div>
            
            <CardContent className="relative z-10 p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16">
              {/* Split Layout: Left Side - Content, Right Side - Visual */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                
                {/* Left Side - Text Content */}
                <div className="space-y-6 sm:space-y-7 md:space-y-8 text-left">
                  {/* Status Badge */}
                  <div className="flex items-center gap-3">
                    <Badge className="px-4 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-semibold bg-emerald-500/20 dark:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-500/40 dark:border-emerald-500/50 shadow-md">
                      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 animate-pulse" />
                      In Development
                    </Badge>
                    <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/50 to-transparent"></div>
                  </div>

                  {/* Main Heading */}
                  <div className="space-y-3 sm:space-y-4">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-emerald-700 dark:text-emerald-400 leading-tight">
                      Coming
                      <span className="block text-green-600 dark:text-green-400 mt-1 sm:mt-2">Soon</span>
                    </h1>
                    <div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                  </div>

                  {/* Subheading */}
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 dark:text-white leading-snug">
                    Advanced English Mastery Program
                  </h2>

                  {/* Description */}
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                    We're crafting an elite learning experience with near-native fluency training, executive communication modules, and sophisticated cultural intelligence programs. Prepare for professional excellence.
                  </p>

                  {/* Progress Section */}
                  <div className="space-y-3 sm:space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm md:text-base font-semibold text-slate-700 dark:text-slate-300">Development Progress</span>
                      <span className="text-xs sm:text-sm md:text-base font-bold text-emerald-600 dark:text-emerald-400">40%</span>
                    </div>
                    <div className="relative h-3 sm:h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden border-2 border-slate-300 dark:border-slate-600 shadow-inner">
                      <div className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-md" style={{ width: '40%' }}></div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4">
                    <div className="text-center p-3 sm:p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 backdrop-blur-sm border border-emerald-200/60 dark:border-emerald-800/60">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
                      <div className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">Expert</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Level</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 rounded-xl bg-teal-50/80 dark:bg-teal-950/40 backdrop-blur-sm border border-teal-200/60 dark:border-teal-800/60">
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-teal-600 dark:text-teal-400" />
                      <div className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">AI</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Powered</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 rounded-xl bg-green-50/80 dark:bg-green-950/40 backdrop-blur-sm border border-green-200/60 dark:border-green-800/60">
                      <AwardIcon className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
                      <div className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">Elite</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Mastery</div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Visual Elements */}
                <div className="relative flex flex-col items-center justify-center space-y-6 sm:space-y-8">
                  {/* Central Icon with Orbs */}
                  <div className="relative">
                    {/* Animated Orbs */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 border-2 border-emerald-500/30 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
                      <div className="absolute w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 border-2 border-teal-500/30 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
                    </div>
                    
                    {/* Main Icon */}
                    <div className="relative bg-emerald-600 dark:bg-emerald-500 p-6 sm:p-8 md:p-10 lg:p-12 rounded-3xl shadow-2xl shadow-emerald-500/30 dark:shadow-emerald-500/20 transform transition-transform duration-500 hover:scale-105">
                      <Construction className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 text-white drop-shadow-lg" />
                      {/* Decorative corners */}
                      <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-emerald-400 rounded-tl-lg"></div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-emerald-400 rounded-tr-lg"></div>
                      <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-emerald-400 rounded-bl-lg"></div>
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-emerald-400 rounded-br-lg"></div>
                    </div>
                  </div>

                  {/* Feature Pills */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
                    <div className="px-4 py-2 rounded-full bg-emerald-50/80 dark:bg-emerald-950/40 backdrop-blur-sm border border-emerald-200/60 dark:border-emerald-800/60">
                      <span className="text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-300">Executive Communication</span>
                    </div>
                    <div className="px-4 py-2 rounded-full bg-teal-50/80 dark:bg-teal-950/40 backdrop-blur-sm border border-teal-200/60 dark:border-teal-800/60">
                      <span className="text-xs sm:text-sm font-medium text-teal-700 dark:text-teal-300">Cultural Intelligence</span>
                    </div>
                    <div className="px-4 py-2 rounded-full bg-green-50/80 dark:bg-green-950/40 backdrop-blur-sm border border-green-200/60 dark:border-green-800/60">
                      <span className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">Professional Excellence</span>
                    </div>
                  </div>

                  {/* Notification */}
                  <div className="w-full max-w-md p-4 sm:p-5 md:p-6 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-teal-50/80 to-green-50/80 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-green-950/40 backdrop-blur-sm border-2 border-emerald-200/60 dark:border-emerald-800/60 shadow-lg">
                    <p className="text-xs sm:text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 text-center flex items-center justify-center gap-2">
                      <Rocket className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-emerald-600 dark:text-emerald-400 animate-bounce" />
                      <span>Get notified when we launch!</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
      {/* 
        Old Content - Kept for future development
        Uncomment and restore the sections below when ready to activate the page
      */}
      {false && (
        <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 pt-24 pb-16 space-y-10">
        {/* Header Section */}
        <section>
          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#10b981] text-white shadow-xl dark:from-[#022c22] dark:via-[#065f46] dark:to-[#059669]">
            <span className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden />
            <span className="absolute -left-28 bottom-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" aria-hidden />
            <CardHeader className="space-y-3 py-4 sm:py-5 md:py-6 relative z-10">
              <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2 sm:space-y-3 lg:max-w-2xl">
                  <Badge className="bg-white/25 text-white uppercase tracking-wide text-xs sm:text-sm px-2 py-0.5 sm:px-3 sm:py-1">
                    Expert Level (Advanced)
                  </Badge>
                  <CardTitle className="text-xl sm:text-2xl md:text-3xl font-semibold text-white leading-tight">
                    Achieve professional excellence with near-native fluency, executive communication skills, and sophisticated cultural intelligence
                  </CardTitle>
                  <CardDescription className="text-white/85 text-sm sm:text-base leading-relaxed">
                    Master advanced English communication skills with personalized learning paths, AI-powered feedback, and real-world executive scenarios.
                  </CardDescription>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
                    <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs hover:bg-white/25">
                      <Crown className="w-3 h-3 mr-1" />
                      Expert Level
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs hover:bg-white/25">
                      <Lightbulb className="w-3 h-3 mr-1" />
                      Executive Communication
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs hover:bg-white/25">
                      <Target className="w-3 h-3 mr-1" />
                      Professional Excellence
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs hover:bg-white/25">
                      <Shield className="w-3 h-3 mr-1" />
                      Structured Learning
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs hover:bg-white/25">
                      <Rocket className="w-3 h-3 mr-1" />
                      Accelerated Progress
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </section>

        {/* Quick Stats Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="bg-card/80 backdrop-blur-xl border-primary/30 hover:border-primary/50 transition-all duration-300 dark:bg-slate-900/60 dark:border-emerald-500/30 dark:hover:border-emerald-400/50"
              >
                <CardContent className="p-4 sm:p-5">
                  <div className={cn("p-2 sm:p-3 rounded-lg mb-2 sm:mb-3 w-fit", stat.bgColor, stat.color)}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-1 dark:text-white">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Elite Progress Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Mastery Progress */}
          <Card className="lg:col-span-2 bg-card/80 backdrop-blur-xl border-primary/30 hover:border-primary/50 transition-all duration-300 dark:bg-slate-900/60 dark:border-emerald-500/30 dark:hover:border-emerald-400/50">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-foreground dark:text-white">Expert Progress Tracking</h3>
                  <p className="text-sm sm:text-base text-muted-foreground dark:text-cyan-100/70">Your journey to professional English mastery</p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent dark:from-emerald-400 dark:via-green-400 dark:to-teal-400">{progress}%</div>
                  <div className="text-sm sm:text-base text-muted-foreground dark:text-cyan-100/70">Mastery Achievement</div>
                </div>
              </div>

              <Progress value={progress} className="h-3 bg-muted dark:bg-slate-700/50 mb-8">
                <div className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full transition-all duration-500 dark:from-emerald-500 dark:via-green-500 dark:to-teal-500" />
              </Progress>
              
              {/* Mastery Metrics */}
              <div className="space-y-4 sm:space-y-6">
                <h4 className="font-semibold text-foreground dark:text-white text-base sm:text-lg">Expert Skill Development</h4>
                {masteryMetrics.map((metric, index) => (
                  <div key={index} className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-medium text-foreground dark:text-white">{metric.skill}</span>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xs text-muted-foreground dark:text-cyan-100/60 hidden sm:inline">Target: {metric.target}%</span>
                        <span className="text-xs sm:text-sm font-medium text-foreground dark:text-white w-10 sm:w-12 text-right">{metric.progress}%</span>
                      </div>
                    </div>
                    <Progress value={metric.progress} className="w-full h-2 bg-muted dark:bg-slate-700/50">
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
          <Card className="bg-card/80 backdrop-blur-xl border-primary/30 hover:border-primary/50 transition-all duration-300 dark:bg-slate-900/60 dark:border-emerald-500/30 dark:hover:border-emerald-400/50">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <h3 className="text-lg sm:text-xl font-semibold text-foreground dark:text-white mb-4 sm:mb-6">Expert Performance</h3>
              
              {/* Stats */}
              <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl bg-muted/50 backdrop-blur-sm border border-primary/20 hover:border-primary/50 transition-all duration-300 dark:bg-slate-700/30 dark:border-emerald-500/20 dark:hover:border-emerald-400/50">
                      <div className={cn("p-2 sm:p-3 rounded-xl", stat.bgColor, stat.color)}>
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline gap-2">
                          <span className="text-xs sm:text-sm font-medium text-muted-foreground dark:text-cyan-100/80 truncate">{stat.label}</span>
                          <span className="text-base sm:text-lg font-bold text-foreground dark:text-white flex-shrink-0">{stat.value}</span>
                        </div>
                        <p className="text-xs text-muted-foreground dark:text-cyan-100/60 mt-1">{stat.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Achievements */}
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-foreground dark:text-white mb-3 sm:mb-4">Expert Certifications</h4>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {achievements.map((achievement, index) => {
                    const Icon = achievement.icon;
                    const isEarned = achievement.earned;

                    return (
                      <div key={index} className={cn(
                        "p-2 sm:p-3 rounded-xl border transition-all duration-300 group cursor-pointer backdrop-blur-sm",
                        isEarned
                          ? "bg-gradient-to-br from-primary/30 to-secondary/20 border-primary/50 text-foreground dark:from-emerald-500/30 dark:to-green-500/20 dark:border-emerald-400/50 dark:text-cyan-200 hover:from-primary/40 hover:to-secondary/30 dark:hover:from-emerald-500/40 dark:hover:to-green-500/30"
                          : "bg-muted/30 border-border text-muted-foreground dark:bg-slate-700/30 dark:border-slate-600/50 dark:text-cyan-100/60 hover:bg-muted/50 dark:hover:bg-slate-700/50"
                      )}>
                        <Icon className={cn(
                          "w-3 h-3 sm:w-4 sm:h-5 mb-1 sm:mb-2 transition-transform duration-300 group-hover:scale-110",
                          achievement.color,
                          !isEarned && "opacity-50"
                        )} />
                        <div className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">{achievement.name}</div>
                        {!isEarned && (
                          <Progress value={achievement.progress} className="h-1 bg-muted dark:bg-slate-700/50">
                            <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full dark:from-emerald-500 dark:to-green-500" />
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
        <div>
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white mb-2">Expert Challenge Labs</h2>
            <p className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70">High-stakes simulations for professional excellence</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {challengeActivities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <Card 
                  key={index} 
                  className="group cursor-pointer bg-card/80 backdrop-blur-xl border-primary/30 hover:border-primary/50 transition-all duration-300 shadow-xl hover:shadow-2xl dark:bg-slate-900/60 dark:border-emerald-500/30 dark:hover:border-emerald-400/50"
                  onMouseEnter={() => setIsHovered(index)}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <CardContent className="p-4 sm:p-6 relative overflow-hidden">
                    <div className={cn(
                      "absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full -mr-6 -mt-6 transition-all duration-500 bg-gradient-to-r opacity-20",
                      activity.color,
                      isHovered === index ? "opacity-30 scale-150" : ""
                    )}></div>
                    
                    <div className={cn(
                      "w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-3 sm:mb-4 text-white relative z-10 transition-transform duration-300 bg-gradient-to-r shadow-lg",
                      activity.color,
                      isHovered === index && "scale-110"
                    )}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2 sm:mb-3 flex-wrap">
                      <h4 className="font-semibold text-foreground dark:text-white text-base sm:text-lg">{activity.title}</h4>
                      <Badge variant="outline" className={cn(
                        "text-xs border-0",
                        activity.difficulty === "Expert" ? "bg-red-500/20 text-red-600 border-red-400/30 dark:bg-red-500/20 dark:text-red-300 dark:border-red-400/30" :
                        activity.difficulty === "Very High" ? "bg-orange-500/20 text-orange-600 border-orange-400/30 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-400/30" :
                        "bg-amber-500/20 text-amber-600 border-amber-400/30 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-400/30"
                      )}>
                        {activity.difficulty}
                      </Badge>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70 mb-4 sm:mb-6 leading-relaxed">{activity.description}</p>
                    
                    <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs bg-muted/50 text-foreground dark:bg-slate-700/50 dark:text-cyan-200">
                        {activity.time}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-primary/20 text-primary border-primary/30 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-400/30">
                        {activity.participants}
                      </Badge>
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 text-white font-semibold transition-all duration-300 group-hover:shadow-lg dark:from-emerald-500 dark:via-green-500 dark:to-teal-500 dark:hover:from-emerald-600 dark:hover:via-green-600 dark:hover:to-teal-600"
                      onClick={() => handleStartChallenge(index)}
                    >
                      <Target className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
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
        <div>
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white">Expert Learning Modules</h2>
            <p className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70">Master sophisticated communication for professional leadership</p>
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
                      ? "bg-gradient-to-r from-primary via-secondary to-accent text-white shadow-lg border-transparent dark:from-emerald-500 dark:via-green-500 dark:to-teal-500" 
                      : "bg-card/40 border-primary/30 hover:border-primary/50 text-foreground hover:shadow-md dark:bg-slate-800/40 dark:border-emerald-500/30 dark:hover:border-emerald-400/50 dark:text-cyan-200"
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
                  "group cursor-pointer border-2 transition-all duration-500 bg-card/80 backdrop-blur-xl hover:shadow-2xl overflow-hidden",
                  lesson.completed 
                    ? "border-emerald-400/50 hover:border-emerald-300/70 dark:border-emerald-500/50 dark:hover:border-emerald-400/70" 
                    : "border-primary/30 hover:border-primary/50 dark:border-emerald-500/30 dark:hover:border-emerald-400/50"
                )}
                onMouseEnter={() => setIsHovered(index + 10)}
                onMouseLeave={() => setIsHovered(null)}
              >
                <CardContent className="p-0 overflow-hidden">
                  {/* Header with Gradient */}
                  <div className={cn(
                    "p-4 sm:p-6 text-white relative overflow-hidden transition-all duration-500 bg-gradient-to-r",
                    lesson.color,
                    isHovered === index + 10 && "brightness-110"
                  )} style={{ boxShadow: `0 0 30px ${lesson.glowColor}` }}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="text-3xl sm:text-4xl transform transition-transform duration-300 group-hover:scale-110">
                          {lesson.icon}
                        </div>
                        <div className="flex items-center gap-2">
                          {lesson.completed && (
                            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300 animate-pulse" />
                          )}
                          <Badge variant="secondary" className="bg-black/30 text-white border-0 backdrop-blur-sm text-xs">
                            {lesson.complexity}
                          </Badge>
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{lesson.title}</h3>
                      <p className="text-white/90 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">{lesson.description}</p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {lesson.skills?.map((skill, skillIndex) => (
                          <Badge key={skillIndex} variant="secondary" className="bg-white/20 text-white border-0 text-xs backdrop-blur-sm">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4 sm:p-6 bg-card/70 backdrop-blur-sm dark:bg-slate-900/70">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0 text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70 mb-3 sm:mb-4">
                      <span className="flex items-center gap-1 sm:gap-2 font-medium">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        {lesson.duration}
                      </span>
                      <span className="flex items-center gap-1 sm:gap-2 font-medium">
                        <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                        {lesson.focus}
                      </span>
                      <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-xs w-fit dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-400/30">
                        {lesson.level}
                      </Badge>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2 mb-4 sm:mb-6">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground dark:text-cyan-100/70">Module Progress</span>
                        <span className="font-medium text-foreground dark:text-white">{lesson.progress}%</span>
                      </div>
                      <Progress value={lesson.progress} className="h-2 bg-muted dark:bg-slate-700/50">
                        <div className={cn("h-full rounded-full bg-gradient-to-r", lesson.color)} />
                      </Progress>
                    </div>
                    
                    <Button 
                      className={cn(
                        "w-full font-semibold py-2 sm:py-3 rounded-xl transition-all duration-300 group-hover:shadow-lg relative overflow-hidden",
                        lesson.completed
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                          : "bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 text-white dark:from-emerald-500 dark:via-green-500 dark:to-teal-500 dark:hover:from-emerald-600 dark:hover:via-green-600 dark:hover:to-teal-600"
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
                            <Target className="w-4 h-4 mr-2" />
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
        <Card className="bg-gradient-to-r from-primary/20 via-secondary/30 to-accent/20 backdrop-blur-xl border-primary/50 text-foreground shadow-2xl overflow-hidden relative dark:from-emerald-500/20 dark:via-green-500/30 dark:to-teal-500/20 dark:border-emerald-400/50 dark:text-white">
          <span className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" aria-hidden />
          <span className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" aria-hidden />
          <CardContent className="p-4 sm:p-6 md:p-8 relative">
            <div className="relative z-10 text-center max-w-4xl mx-auto">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6 backdrop-blur-sm dark:bg-white/10">
                <Medal className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-foreground dark:text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-foreground dark:text-white">Expert English Certification</h3>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto px-2 dark:text-cyan-100">
                Earn professional recognition by demonstrating near-native fluency, executive communication skills, and sophisticated cultural intelligence
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-center mb-6 sm:mb-8">
                <div className="bg-white/10 rounded-xl p-4 sm:p-6 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/15 dark:bg-white/10 dark:border-white/20">
                  <BarChart className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-foreground dark:text-white" />
                  <h4 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 text-foreground dark:text-white">Comprehensive Assessment</h4>
                  <p className="text-muted-foreground text-xs sm:text-sm dark:text-cyan-200">Rigorous evaluation across all professional domains</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 sm:p-6 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/15 dark:bg-white/10 dark:border-white/20">
                  <Globe2 className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-foreground dark:text-white" />
                  <h4 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 text-foreground dark:text-white">Global Recognition</h4>
                  <p className="text-muted-foreground text-xs sm:text-sm dark:text-cyan-200">Internationally respected professional certification</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 sm:p-6 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/15 dark:bg-white/10 dark:border-white/20">
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-foreground dark:text-white" />
                  <h4 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 text-foreground dark:text-white">Elite Network</h4>
                  <p className="text-muted-foreground text-xs sm:text-sm dark:text-cyan-200">Join top-tier global professionals and leaders</p>
                </div>
              </div>

              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-primary/10 font-bold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg transition-all duration-300 hover:scale-105 dark:bg-white dark:text-emerald-600 dark:hover:bg-emerald-50"
              >
                <Crown className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Begin Certification Journey
                <Rocket className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
        </main>
      )}
    </div>
  );
};

export default AdvancedPage;
