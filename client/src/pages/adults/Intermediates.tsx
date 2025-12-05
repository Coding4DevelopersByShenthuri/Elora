import { useState, useEffect } from 'react';
import { 
  Play, Mic, CheckCircle, Clock, Users, 
  Target, BookOpen, MessageCircle, Repeat, Zap, TrendingUp,
  Brain, Languages, GitMerge, ThumbsUp, BarChart3,
  Video, Headphones, PenTool, ArrowRight, Rocket, Shield,
  Construction, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const IntermediatesPage = () => {
  const [activeModule, setActiveModule] = useState('conversation');
  const [progress, setProgress] = useState(65);
  const [streak] = useState(12);
  const [fluencyScore, setFluencyScore] = useState(72);
  const [isHovered, setIsHovered] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Page load fade-in
  useEffect(() => {
    setIsLoaded(true);
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
      color: 'from-blue-500 via-cyan-500 to-teal-500',
      glowColor: 'rgba(59, 130, 246, 0.3)',
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
      color: 'from-purple-500 via-pink-500 to-rose-500',
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
      color: 'from-amber-500 via-orange-500 to-red-500',
      glowColor: 'rgba(249, 115, 22, 0.3)',
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
      color: 'from-emerald-500 via-teal-500 to-cyan-500',
      glowColor: 'rgba(16, 185, 129, 0.3)',
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
      color: 'from-indigo-500 via-purple-500 to-fuchsia-500',
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
      color: 'from-teal-500 via-cyan-500 to-blue-500',
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
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-500/20",
      textColor: "text-blue-500",
      time: "15-20 min",
      type: "Interactive",
      level: "Intermediate+"
    },
    {
      title: "Debate Practice",
      description: "Advanced argumentation and viewpoint development",
      icon: GitMerge,
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-500/20",
      textColor: "text-purple-500",
      time: "20-25 min",
      type: "Advanced",
      level: "Intermediate+"
    },
    {
      title: "Story Building",
      description: "Creative narrative development and delivery",
      icon: PenTool,
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-500/20",
      textColor: "text-emerald-500",
      time: "15 min",
      type: "Creative",
      level: "All Levels"
    },
    {
      title: "Accent Training",
      description: "Professional pronunciation and intonation refinement",
      icon: Headphones,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-500/20",
      textColor: "text-amber-500",
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
      color: "text-blue-500",
      bgColor: "bg-blue-500/20",
      glowColor: "rgba(59, 130, 246, 0.2)",
      description: "Speaking fluency and natural flow"
    },
    { 
      label: "Vocabulary Mastery", 
      value: "1,240", 
      icon: BookOpen, 
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/20",
      glowColor: "rgba(16, 185, 129, 0.2)",
      description: "Active professional vocabulary"
    },
    { 
      label: "Grammar Accuracy", 
      value: "78%", 
      icon: Brain, 
      color: "text-purple-500",
      bgColor: "bg-purple-500/20",
      glowColor: "rgba(168, 85, 247, 0.2)",
      description: "Complex structure proficiency"
    },
    { 
      label: "Learning Consistency", 
      value: `${streak} days`, 
      icon: Zap, 
      color: "text-orange-500",
      bgColor: "bg-orange-500/20",
      glowColor: "rgba(249, 115, 22, 0.2)",
      description: "Continuous progress streak"
    },
  ];

  const skillsProgress = [
    { skill: "Conversation Flow", progress: 75, color: "from-blue-500 to-cyan-600" },
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
    <div className={`relative overflow-hidden min-h-screen ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
      {/* Background Elements - Same as Adults Page */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] rounded-full bg-accent/10 blur-3xl -z-10"></div>

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 pt-24 pb-16 space-y-10">
        {/* Coming Soon Section - Intermediate Professional Design with Unique Vertical Style */}
        <section className="py-6 sm:py-8 md:py-10 lg:py-12">
          <Card className="relative overflow-hidden border-2 border-emerald-500/25 dark:border-emerald-500/35 backdrop-blur-2xl bg-white/70 dark:bg-slate-900/70 shadow-2xl">
            {/* Diagonal Glass Morphism Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/6 via-transparent to-teal-500/6 dark:from-emerald-500/10 dark:via-transparent dark:to-teal-500/10"></div>
            <div className="absolute top-1/2 left-0 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl -ml-48 -mt-48 dark:bg-emerald-500/12"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-500/8 rounded-full blur-3xl -mr-40 -mb-40 dark:bg-teal-500/12"></div>
            
            <CardContent className="relative z-10 p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14">
              {/* Vertical Center-Aligned Layout */}
              <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10 md:space-y-12 text-center">
                
                {/* Top Badge with Line */}
                <div className="flex flex-col items-center gap-4">
                  <Badge className="px-4 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-semibold bg-emerald-500/20 dark:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-500/40 dark:border-emerald-500/50 shadow-md">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 animate-pulse" />
                    In Development
                  </Badge>
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </div>

                {/* Main Heading - Split Design */}
                <div className="space-y-3 sm:space-y-4">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-tight">
                    <span className="block text-emerald-700 dark:text-emerald-400">Coming</span>
                    <span className="block text-green-600 dark:text-green-400 -mt-2 sm:-mt-3">Soon</span>
                  </h1>
                  <div className="flex items-center justify-center gap-3 sm:gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-emerald-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-emerald-500/50 to-emerald-500/50"></div>
                  </div>
                </div>

                {/* Subheading */}
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 dark:text-white px-2">
                  Intermediate English Mastery Program
                </h2>

                {/* Description */}
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto px-2">
                  We're building an advanced learning experience with complex conversations, professional vocabulary expansion, and sophisticated communication skills. Get ready for your next level of English proficiency!
                </p>

                {/* Icon with Vertical Timeline */}
                <div className="relative flex flex-col items-center space-y-6 sm:space-y-8 py-6 sm:py-8">
                  {/* Vertical Timeline Line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500/30 via-emerald-500/50 to-teal-500/30 transform -translate-x-1/2"></div>
                  
                  {/* Central Icon */}
                  <div className="relative z-10">
                    <div className="absolute inset-0 bg-emerald-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                    <div className="relative bg-emerald-600 dark:bg-emerald-500 p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl shadow-emerald-500/30 dark:shadow-emerald-500/20 transform transition-transform duration-500 hover:scale-105">
                      <Construction className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-white drop-shadow-lg" />
                    </div>
                  </div>

                  {/* Timeline Items */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 w-full max-w-3xl">
                    <div className="relative flex flex-col items-center text-center space-y-3">
                      <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50/80 dark:bg-emerald-950/40 backdrop-blur-sm border-2 border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center shadow-lg">
                        <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-800/50 shadow-md">
                        <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white mb-1">Advanced Grammar</h3>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Complex structures</p>
                      </div>
                    </div>

                    <div className="relative flex flex-col items-center text-center space-y-3">
                      <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-teal-50/80 dark:bg-teal-950/40 backdrop-blur-sm border-2 border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center shadow-lg">
                        <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-teal-200/50 dark:border-teal-800/50 shadow-md">
                        <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white mb-1">Professional Dialogue</h3>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Real-world scenarios</p>
                      </div>
                    </div>

                    <div className="relative flex flex-col items-center text-center space-y-3">
                      <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-50/80 dark:bg-green-950/40 backdrop-blur-sm border-2 border-green-200/60 dark:border-green-800/60 flex items-center justify-center shadow-lg">
                        <Languages className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-green-200/50 dark:border-green-800/50 shadow-md">
                        <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white mb-1">Expanded Vocabulary</h3>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Rich expressions</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="space-y-4 sm:space-y-5 pt-4 sm:pt-6">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs sm:text-sm md:text-base font-semibold text-slate-700 dark:text-slate-300">Development Progress</span>
                    <span className="text-xs sm:text-sm md:text-base font-bold text-emerald-600 dark:text-emerald-400">50%</span>
                  </div>
                  <div className="relative h-3 sm:h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden border-2 border-slate-300 dark:border-slate-600 shadow-inner max-w-md mx-auto">
                    <div className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-md" style={{ width: '50%' }}></div>
                  </div>
                </div>

                {/* Notification CTA */}
                <div className="pt-4 sm:pt-6">
                  <div className="p-4 sm:p-5 md:p-6 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-teal-50/80 to-green-50/80 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-green-950/40 backdrop-blur-sm border-2 border-emerald-200/60 dark:border-emerald-800/60 shadow-lg max-w-xl mx-auto">
                    <p className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 flex-wrap">
                      <Rocket className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-emerald-600 dark:text-emerald-400 animate-bounce" />
                      <span>Stay tuned for updates on this exciting new program!</span>
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
                    Intermediate Level
                  </Badge>
                  <CardTitle className="text-xl sm:text-2xl md:text-3xl font-semibold text-white leading-tight">
                    Advance your English with complex conversations, professional vocabulary, and sophisticated communication skills
                  </CardTitle>
                  <CardDescription className="text-white/85 text-sm sm:text-base leading-relaxed">
                    Master intermediate English communication skills with personalized learning paths, AI-powered feedback, and real-world professional scenarios.
                  </CardDescription>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
                    <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs hover:bg-white/25">
                      <Brain className="w-3 h-3 mr-1" />
                      Advanced Grammar
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs hover:bg-white/25">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Professional Dialogue
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs hover:bg-white/25">
                      <Languages className="w-3 h-3 mr-1" />
                      Expanded Vocabulary
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

        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Progress Card */}
          <Card className="lg:col-span-2 bg-card/80 backdrop-blur-xl border-primary/30 hover:border-primary/50 transition-all duration-300 dark:bg-slate-900/60 dark:border-emerald-500/30 dark:hover:border-emerald-400/50">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-foreground dark:text-white">Advanced Progress Tracking</h3>
                  <p className="text-sm sm:text-base text-muted-foreground dark:text-cyan-100/70">Monitor your journey toward English mastery</p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent dark:from-emerald-400 dark:via-green-400 dark:to-teal-400">{progress}%</div>
                  <div className="text-sm sm:text-base text-muted-foreground dark:text-cyan-100/70">Overall Mastery</div>
                </div>
              </div>

              <Progress value={progress} className="h-3 bg-muted dark:bg-slate-700/50 mb-8">
                <div className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full transition-all duration-500 dark:from-emerald-500 dark:via-green-500 dark:to-teal-500" />
              </Progress>
              
              {/* Skills Progress */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground dark:text-white mb-4 text-base sm:text-lg">Skill Development</h4>
                {skillsProgress.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between gap-2 sm:gap-3">
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground dark:text-cyan-100/80 flex-shrink-0">{skill.skill}</span>
                    <div className="flex items-center gap-2 sm:gap-3 flex-1">
                      <Progress value={skill.progress} className="flex-1 h-2 bg-muted dark:bg-slate-700/50">
                        <div className={cn("h-full rounded-full bg-gradient-to-r", skill.color)} />
                      </Progress>
                      <span className="text-xs sm:text-sm font-medium text-foreground dark:text-white w-10 sm:w-12 text-right">{skill.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats & Achievements */}
          <Card className="bg-card/80 backdrop-blur-xl border-primary/30 hover:border-primary/50 transition-all duration-300 dark:bg-slate-900/60 dark:border-emerald-500/30 dark:hover:border-emerald-400/50">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <h3 className="text-lg sm:text-xl font-semibold text-foreground dark:text-white mb-4 sm:mb-6">Performance Metrics</h3>

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
                <h4 className="text-base sm:text-lg font-semibold text-foreground dark:text-white mb-3 sm:mb-4">Certifications</h4>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {achievements.map((achievement, index) => {
                    const Icon = achievement.icon;
                    const isEarned = achievement.earned;

                    return (
                      <div key={index} className={cn(
                        "p-2 sm:p-3 rounded-xl border transition-all duration-300 backdrop-blur-sm",
                        isEarned
                          ? "bg-gradient-to-br from-primary/30 to-secondary/20 border-primary/50 text-foreground dark:from-emerald-500/30 dark:to-green-500/20 dark:border-emerald-400/50 dark:text-cyan-200"
                          : "bg-muted/30 border-border text-muted-foreground dark:bg-slate-700/30 dark:border-slate-600/50 dark:text-cyan-100/60"
                      )}>
                        <Icon className={cn(
                          "w-3 h-3 sm:w-4 sm:h-4 mb-1 sm:mb-2",
                          isEarned
                            ? "text-primary dark:text-emerald-300"
                            : "text-muted-foreground dark:text-slate-500"
                        )} />
                        <div className="text-xs sm:text-sm font-medium mb-1">{achievement.name}</div>
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

        {/* Practice Labs */}
        <div>
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white mb-2">Advanced Practice Labs</h2>
            <p className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70">Interactive exercises for professional communication</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {practiceActivities.map((activity, index) => {
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
                    
                    <h4 className="font-semibold text-foreground dark:text-white mb-2 sm:mb-3 text-base sm:text-lg">{activity.title}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70 mb-4 sm:mb-6 leading-relaxed">{activity.description}</p>
                    
                    <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs bg-muted/50 text-foreground dark:bg-slate-700/50 dark:text-cyan-200">
                        {activity.time}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-primary/20 text-primary border-primary/30 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-400/30">
                        {activity.level}
                      </Badge>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-primary/30 text-foreground hover:bg-primary/20 hover:border-primary/50 transition-all duration-300 dark:border-emerald-500/30 dark:text-white dark:hover:bg-emerald-500/20 dark:hover:border-emerald-400/50"
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
        <div>
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white">Advanced Learning Modules</h2>
            <p className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70">Master complex language structures and professional communication</p>
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
                        {lesson.completed && (
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300 animate-pulse" />
                        )}
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
        <Card className="bg-gradient-to-r from-primary/20 via-secondary/30 to-accent/20 backdrop-blur-xl border-primary/50 text-foreground shadow-2xl overflow-hidden relative dark:from-emerald-500/20 dark:via-green-500/30 dark:to-teal-500/20 dark:border-emerald-400/50 dark:text-white">
          <span className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" aria-hidden />
          <span className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" aria-hidden />
          <CardContent className="p-4 sm:p-6 md:p-8 relative">
            <div className="relative z-10 text-center max-w-4xl mx-auto">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 backdrop-blur-sm dark:bg-white/10">
                <Rocket className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-foreground dark:text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-foreground dark:text-white">Ready for Advanced Challenges?</h3>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed dark:text-cyan-100">
                Elevate your English to professional levels with complex debates, executive presentations, and sophisticated cultural discussions
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-center">
                <div className="bg-white/10 rounded-xl p-4 sm:p-6 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/15 dark:bg-white/10 dark:border-white/20">
                  <Video className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 text-foreground dark:text-white" />
                  <h4 className="font-semibold mb-1 sm:mb-2 text-foreground dark:text-white">Video Analysis</h4>
                  <p className="text-muted-foreground text-xs sm:text-sm dark:text-cyan-200">Analyze authentic professional conversations</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 sm:p-6 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/15 dark:bg-white/10 dark:border-white/20">
                  <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 text-foreground dark:text-white" />
                  <h4 className="font-semibold mb-1 sm:mb-2 text-foreground dark:text-white">Advanced Analytics</h4>
                  <p className="text-muted-foreground text-xs sm:text-sm dark:text-cyan-200">Detailed performance insights and growth tracking</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 sm:p-6 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/15 dark:bg-white/10 dark:border-white/20">
                  <ThumbsUp className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 text-foreground dark:text-white" />
                  <h4 className="font-semibold mb-1 sm:mb-2 text-foreground dark:text-white">Expert Feedback</h4>
                  <p className="text-muted-foreground text-xs sm:text-sm dark:text-cyan-200">Professional coaching and community insights</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </main>
      )}
    </div>
  );
};

export default IntermediatesPage;
