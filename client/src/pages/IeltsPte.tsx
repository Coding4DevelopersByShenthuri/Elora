import { useState, useEffect } from 'react';
import { 
  Play, Clock, Target, Award, BookOpen, MessageCircle, 
  Mic, Volume2, CheckCircle, TrendingUp, Zap,
  Calendar, FileText, Timer,
  GraduationCap, Globe, Users, Lightbulb,
  Download, RotateCcw, Eye, PieChart, ArrowRight, Rocket, Medal, Shield,
  Construction, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const IeltsPtePage = () => {
  const [activeTest, setActiveTest] = useState('ielts');
  const [activeSection, setActiveSection] = useState('speaking');
  const [mockTestProgress, setMockTestProgress] = useState(65);
  const [targetScore] = useState(7.5);
  const [currentScore, setCurrentScore] = useState(6.5);
  const [isHovered, setIsHovered] = useState<number | null>(null);
  const [activePractice, setActivePractice] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Page load fade-in
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const testTypes = [
    { 
      id: 'ielts', 
      label: 'IELTS Academic', 
      icon: GraduationCap, 
      color: 'from-blue-500 to-cyan-500',
      description: 'International English Language Testing System'
    },
    { 
      id: 'pte', 
      label: 'PTE Academic', 
      icon: Globe, 
      color: 'from-emerald-500 to-green-500',
      description: 'Pearson Test of English Academic'
    },
  ];

  const sections = [
    { id: 'speaking', label: 'Speaking', icon: Mic, color: 'bg-purple-500', gradient: 'from-purple-500 to-pink-500' },
    { id: 'writing', label: 'Writing', icon: FileText, color: 'bg-blue-500', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'reading', label: 'Reading', icon: BookOpen, color: 'bg-emerald-500', gradient: 'from-emerald-500 to-green-500' },
    { id: 'listening', label: 'Listening', icon: Volume2, color: 'bg-amber-500', gradient: 'from-amber-500 to-orange-500' },
  ];

  const speakingTests = [
    {
      title: "Full Speaking Test",
      description: "Complete IELTS/PTE speaking test simulation with AI evaluation",
      duration: '15 min',
      parts: '3 Parts',
      questions: 12,
      completed: true,
      score: 7.0,
      feedback: true,
      color: 'from-purple-500 to-pink-500',
      skills: ['Fluency', 'Pronunciation', 'Coherence'],
      progress: 100
    },
    {
      title: "Part 2 - Long Turn",
      description: "Practice individual long turn speaking tasks with detailed feedback",
      duration: '4 min',
      parts: 'Cue Cards',
      questions: 5,
      completed: true,
      score: 6.5,
      feedback: true,
      color: 'from-blue-500 to-cyan-500',
      skills: ['Structure', 'Vocabulary', 'Timing'],
      progress: 100
    },
    {
      title: "Part 3 - Discussion",
      description: "Advanced discussion on abstract topics and complex ideas",
      duration: '6 min',
      parts: 'Deep Discussion',
      questions: 8,
      completed: false,
      score: null,
      feedback: false,
      color: 'from-emerald-500 to-green-500',
      skills: ['Analysis', 'Opinion', 'Debate'],
      progress: 60
    },
    {
      title: "Pronunciation Focus",
      description: "Targeted practice for pronunciation clarity and fluency",
      duration: '10 min',
      parts: 'Drills & Practice',
      questions: 15,
      completed: false,
      score: null,
      feedback: false,
      color: 'from-amber-500 to-orange-500',
      skills: ['Articulation', 'Intonation', 'Stress'],
      progress: 40
    }
  ];

  const writingTests = [
    {
      title: "Task 2 - Essay Writing",
      description: "Practice academic essay writing with AI evaluation and scoring",
      duration: '40 min',
      words: '250+',
      topics: 8,
      completed: true,
      score: 6.5,
      color: 'from-indigo-500 to-purple-500',
      skills: ['Structure', 'Arguments', 'Vocabulary'],
      progress: 100
    },
    {
      title: "Task 1 - Report/Letter",
      description: "Data interpretation or formal letter writing practice",
      duration: '20 min',
      words: '150+',
      topics: 6,
      completed: false,
      score: null,
      color: 'from-teal-500 to-blue-500',
      skills: ['Analysis', 'Format', 'Clarity'],
      progress: 75
    }
  ];

  const performanceMetrics = [
    { skill: 'Fluency & Coherence', score: 7.0, target: 7.5, improvement: '+0.5', color: 'from-purple-500 to-pink-500' },
    { skill: 'Lexical Resource', score: 6.5, target: 7.5, improvement: '+1.0', color: 'from-blue-500 to-cyan-500' },
    { skill: 'Grammatical Range', score: 7.0, target: 7.5, improvement: '+0.5', color: 'from-emerald-500 to-green-500' },
    { skill: 'Pronunciation', score: 6.0, target: 7.0, improvement: '+1.0', color: 'from-amber-500 to-orange-500' },
  ];

  const quickPractice = [
    {
      title: "Cue Card Practice",
      description: "Quick 2-minute speaking prompts with instant feedback",
      icon: MessageCircle,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/20",
      textColor: "text-purple-500",
      time: '2 min',
      type: 'Speaking',
      count: '25+ cards',
      difficulty: 'Easy'
    },
    {
      title: "Essay Outlines",
      description: "Plan and structure essays quickly with templates",
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/20",
      textColor: "text-blue-500",
      time: '5 min',
      type: 'Writing',
      count: '15+ topics',
      difficulty: 'Medium'
    },
    {
      title: "Listening Drills",
      description: "Short audio comprehension exercises with transcripts",
      icon: Volume2,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-500/20",
      textColor: "text-amber-500",
      time: '3 min',
      type: 'Listening',
      count: '30+ clips',
      difficulty: 'Easy'
    },
    {
      title: "Reading Skimming",
      description: "Rapid reading comprehension practice techniques",
      icon: BookOpen,
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-emerald-500/20",
      textColor: "text-emerald-500",
      time: '4 min',
      type: 'Reading',
      count: '20+ passages',
      difficulty: 'Medium'
    }
  ];

  const stats = [
    { 
      label: "Mock Tests Completed", 
      value: "8", 
      icon: Award, 
      color: "text-blue-500",
      bgColor: "bg-blue-500/20",
      description: "Full practice tests"
    },
    { 
      label: "Target Score", 
      value: targetScore.toFixed(1), 
      icon: Target, 
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/20",
      description: `${activeTest === 'ielts' ? 'IELTS' : 'PTE'} Goal`
    },
    { 
      label: "Current Estimate", 
      value: currentScore.toFixed(1), 
      icon: TrendingUp, 
      color: "text-purple-500",
      bgColor: "bg-purple-500/20",
      description: "Based on recent tests"
    },
    { 
      label: "Study Consistency", 
      value: "16 days", 
      icon: Zap, 
      color: "text-orange-500",
      bgColor: "bg-orange-500/20",
      description: "Learning streak"
    },
  ];

  const achievements = [
    { name: "Speaking Pro", earned: true, icon: Mic, progress: 100 },
    { name: "Writing Expert", earned: false, icon: FileText, progress: 75 },
    { name: "Reading Master", earned: true, icon: BookOpen, progress: 100 },
    { name: "Listening Ace", earned: false, icon: Volume2, progress: 60 },
  ];

  const handleStartTest = () => {
    setMockTestProgress(prev => Math.min(prev + 5, 100));
    setCurrentScore(prev => Math.min(prev + 0.1, 9.0));
  };

  const getCurrentTests = () => {
    switch (activeSection) {
      case 'speaking': return speakingTests;
      case 'writing': return writingTests;
      default: return speakingTests;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.0) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 7.0) return 'text-blue-600 dark:text-blue-400';
    if (score >= 6.0) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className={`relative overflow-hidden min-h-screen ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
      {/* Background Elements - Same as Adults Page */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] rounded-full bg-accent/10 blur-3xl -z-10"></div>

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 pt-24 pb-16 space-y-10">
        {/* Coming Soon Section - Modern Professional Design with Glass Morphism */}
        <section className="py-6 sm:py-8 md:py-10 lg:py-12">
          <Card className="relative overflow-hidden border-2 border-emerald-500/30 dark:border-emerald-500/40 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 shadow-2xl">
            {/* Glass Morphism Background Accents */}
            <div className="absolute top-0 right-0 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 sm:-mr-40 sm:-mt-40 md:-mr-48 md:-mt-48 dark:bg-emerald-500/15"></div>
            <div className="absolute bottom-0 left-0 w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 bg-green-500/10 rounded-full blur-3xl -ml-28 -mb-28 sm:-ml-36 sm:-mb-36 md:-ml-40 md:-mb-40 dark:bg-green-500/15"></div>
            
            <CardContent className="relative z-10 p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 text-center">
              {/* Modern Icon Container */}
              <div className="flex justify-center mb-4 sm:mb-6 md:mb-8">
                <div className="relative group">
                  <div className="absolute inset-0 bg-emerald-500 rounded-xl sm:rounded-2xl blur-xl opacity-30 group-hover:opacity-50 animate-pulse transition-opacity duration-500"></div>
                  <div className="relative bg-emerald-600 dark:bg-emerald-500 p-4 sm:p-5 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-2xl shadow-emerald-500/30 dark:shadow-emerald-500/20 transform transition-transform duration-500 group-hover:scale-105">
                    <Construction className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-white drop-shadow-lg" />
                  </div>
                </div>
              </div>

              {/* Modern Badge */}
              <Badge className="mb-4 sm:mb-5 md:mb-6 lg:mb-7 px-3 py-1 sm:px-4 sm:py-1.5 md:px-5 md:py-2 text-xs sm:text-sm font-semibold bg-emerald-500/20 dark:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-500/40 dark:border-emerald-500/50 shadow-md">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-1.5 sm:mr-2 animate-pulse" />
                In Development
              </Badge>

              {/* Modern Main Heading */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-4 sm:mb-5 md:mb-6 lg:mb-7 text-emerald-700 dark:text-emerald-400 leading-tight px-2">
                Coming Soon
              </h1>

              {/* Modern Subheading */}
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-4 sm:mb-5 md:mb-6 lg:mb-7 text-slate-800 dark:text-white px-2">
                IELTS & PTE Academic Preparation
              </h2>

              {/* Modern Description */}
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 dark:text-slate-300 mb-6 sm:mb-8 md:mb-9 lg:mb-10 max-w-3xl mx-auto leading-relaxed font-medium px-2">
                We're working hard to bring you comprehensive test preparation with AI-powered evaluation, realistic simulations, and expert strategies. Stay tuned for an exceptional learning experience!
              </p>

              {/* Modern Features Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8 mb-8 sm:mb-10 md:mb-11 lg:mb-12 max-w-5xl mx-auto px-2">
                <div className="group p-4 sm:p-5 md:p-6 lg:p-7 rounded-xl sm:rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 backdrop-blur-sm border-2 border-emerald-200/60 dark:border-emerald-800/60 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-3 sm:mb-4 rounded-lg sm:rounded-xl bg-emerald-600 dark:bg-emerald-500 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <Mic className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-800 dark:text-white mb-2">AI Speech Analysis</h3>
                  <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300">Real-time pronunciation feedback</p>
                </div>
                <div className="group p-4 sm:p-5 md:p-6 lg:p-7 rounded-xl sm:rounded-2xl bg-green-50/80 dark:bg-green-950/40 backdrop-blur-sm border-2 border-green-200/60 dark:border-green-800/60 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-3 sm:mb-4 rounded-lg sm:rounded-xl bg-green-600 dark:bg-green-500 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-800 dark:text-white mb-2">Writing Evaluation</h3>
                  <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300">Automated essay scoring</p>
                </div>
                <div className="group p-4 sm:p-5 md:p-6 lg:p-7 rounded-xl sm:rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 backdrop-blur-sm border-2 border-teal-200/60 dark:border-teal-800/60 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-3 sm:mb-4 rounded-lg sm:rounded-xl bg-teal-600 dark:bg-teal-500 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-800 dark:text-white mb-2">Mock Tests</h3>
                  <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300">Full test simulations</p>
                </div>
              </div>

              {/* Modern Progress Indicator */}
              <div className="max-w-md sm:max-w-lg mx-auto mb-6 sm:mb-8 md:mb-10 px-2">
                <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                  <span className="text-xs sm:text-sm md:text-base font-semibold text-slate-700 dark:text-slate-300">Development Progress</span>
                  <span className="text-xs sm:text-sm md:text-base font-bold text-emerald-600 dark:text-emerald-400">20%</span>
                </div>
                <div className="relative h-2.5 sm:h-3 md:h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden border-2 border-slate-300 dark:border-slate-600 shadow-inner">
                  <div className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-md" style={{ width: '20%' }}></div>
                </div>
              </div>

              {/* Modern Notification CTA */}
              <div className="p-4 sm:p-5 md:p-6 lg:p-7 xl:p-8 rounded-xl sm:rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 backdrop-blur-sm border-2 border-emerald-200/60 dark:border-emerald-800/60 shadow-lg">
                <p className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-slate-700 dark:text-slate-200 mb-0 flex flex-col sm:flex-row items-center justify-center gap-2 px-2">
                  <span className="flex items-center gap-2">
                    <Rocket className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-emerald-600 dark:text-emerald-400 animate-bounce" />
                    <span className="text-center">We'll notify you as soon as this feature is available!</span>
                  </span>
                </p>
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
        <section>
          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#10b981] text-white shadow-xl dark:from-[#022c22] dark:via-[#065f46] dark:to-[#059669]">
            <span className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden />
            <span className="absolute -left-28 bottom-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" aria-hidden />
            <CardHeader className="space-y-3 py-4 sm:py-5 md:py-6 relative z-10">
              <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2 sm:space-y-3 lg:max-w-2xl">
                  <Badge className="bg-white/25 text-white uppercase tracking-wide text-xs sm:text-sm px-2 py-0.5 sm:px-3 sm:py-1">
                    Professional Test Preparation
                  </Badge>
                  <CardTitle className="text-xl sm:text-2xl md:text-3xl font-semibold text-white leading-tight">
                    Comprehensive IELTS and PTE Academic preparation with AI-powered evaluation, realistic simulations, and expert strategies
                  </CardTitle>
                  <CardDescription className="text-white/85 text-sm sm:text-base leading-relaxed">
                    Master your test preparation with personalized learning paths, AI-powered feedback, and comprehensive practice materials designed for exam success.
                  </CardDescription>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
                    <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs hover:bg-white/25">
                      <Timer className="w-3 h-3 mr-1" />
                      Timed Simulations
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs hover:bg-white/25">
                      <Mic className="w-3 h-3 mr-1" />
                      AI Speech Analysis
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs hover:bg-white/25">
                      <FileText className="w-3 h-3 mr-1" />
                      Writing Evaluation
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

        {/* Test Type Selection */}
        <div className="flex justify-center">
          <Tabs value={activeTest} className="w-full max-w-4xl" onValueChange={setActiveTest}>
            <TabsList className="grid w-full grid-cols-2 bg-card/80 backdrop-blur-xl border-primary/30 p-1 sm:p-2 rounded-xl sm:rounded-2xl shadow-sm dark:bg-slate-900/60 dark:border-emerald-500/30">
              {testTypes.map((test) => {
                const Icon = test.icon;
                return (
                  <TabsTrigger 
                    key={test.id}
                    value={test.id}
                    className={cn(
                      "flex items-center gap-2 sm:gap-4 py-2 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg font-semibold transition-all duration-300 rounded-lg sm:rounded-xl",
                      "data-[state=active]:text-white data-[state=active]:shadow-lg",
                      `data-[state=active]:bg-gradient-to-r ${test.color}`
                    )}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    <div className="text-left">
                      <div className="text-sm sm:text-base">{test.label}</div>
                      <div className="text-xs opacity-80 font-normal hidden sm:block">{test.description}</div>
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

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
                  <h3 className="text-xl sm:text-2xl font-semibold text-foreground dark:text-white">
                    {activeTest === 'ielts' ? 'IELTS Academic' : 'PTE Academic'} Progress
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground dark:text-cyan-100/70">Track your preparation journey and target achievement</p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent dark:from-emerald-400 dark:via-green-400 dark:to-teal-400">{mockTestProgress}%</div>
                  <div className="text-sm sm:text-base text-muted-foreground dark:text-cyan-100/70">Preparation Complete</div>
                </div>
              </div>
              
              <Progress value={mockTestProgress} className="h-3 bg-muted dark:bg-slate-700/50 mb-6 sm:mb-8">
                <div className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full transition-all duration-500 dark:from-emerald-500 dark:via-green-500 dark:to-teal-500" />
              </Progress>

              {/* Score Target Visualization */}
              <div className="bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-primary/30 dark:from-emerald-500/20 dark:to-green-500/20 dark:border-emerald-400/30">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="text-center flex-1">
                    <div className="text-xl sm:text-2xl font-bold text-foreground dark:text-white">{currentScore.toFixed(1)}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70">Current Score</div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-base sm:text-lg text-muted-foreground dark:text-cyan-100/50">→</div>
                    <div className="text-xs text-muted-foreground dark:text-cyan-100/50">Progress</div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{targetScore.toFixed(1)}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70">Target Score</div>
                  </div>
                </div>
                <Progress value={((currentScore - 4) / (targetScore - 4)) * 100} className="h-2 bg-muted dark:bg-slate-700/50">
                  <div className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full dark:from-emerald-500 dark:to-green-500" />
                </Progress>
              </div>
            </CardContent>
          </Card>

          {/* Performance Stats */}
          <Card className="bg-card/80 backdrop-blur-xl border-primary/30 hover:border-primary/50 transition-all duration-300 dark:bg-slate-900/60 dark:border-emerald-500/30 dark:hover:border-emerald-400/50">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <h3 className="text-lg sm:text-xl font-semibold text-foreground dark:text-white mb-4 sm:mb-6">Performance Overview</h3>
              
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
                <h4 className="text-base sm:text-lg font-semibold text-foreground dark:text-white mb-3 sm:mb-4">Section Mastery</h4>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {achievements.map((achievement, index) => {
                    const Icon = achievement.icon;
                    const isEarned = achievement.earned;

                    return (
                      <div key={index} className={cn(
                        "p-2 sm:p-3 rounded-xl border transition-all duration-300",
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

        {/* Quick Practice Labs */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white mb-2">Quick Practice Labs</h2>
              <p className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70">Targeted exercises for efficient skill development</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {quickPractice.map((practice, index) => {
              const Icon = practice.icon;
              return (
                <Card 
                  key={index} 
                  className="group cursor-pointer bg-card/80 backdrop-blur-xl border-primary/30 hover:border-primary/50 transition-all duration-300 shadow-xl hover:shadow-2xl dark:bg-slate-900/60 dark:border-emerald-500/30 dark:hover:border-emerald-400/50"
                  onMouseEnter={() => setActivePractice(index)}
                  onMouseLeave={() => setActivePractice(null)}
                >
                  <CardContent className="p-4 sm:p-6 relative overflow-hidden">
                    <div className={cn(
                      "absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full -mr-6 -mt-6 transition-all duration-500 bg-gradient-to-r opacity-20",
                      practice.color,
                      activePractice === index ? "opacity-30 scale-150" : ""
                    )}></div>
                    
                    <div className={cn(
                      "w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-3 sm:mb-4 text-white relative z-10 transition-transform duration-300 bg-gradient-to-r shadow-lg",
                      practice.color,
                      activePractice === index && "scale-110"
                    )}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    
                    <h4 className="font-semibold text-foreground dark:text-white mb-2 sm:mb-3 text-base sm:text-lg">{practice.title}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70 mb-4 sm:mb-6 leading-relaxed">{practice.description}</p>
                    
                    <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs bg-muted/50 text-foreground dark:bg-slate-700/50 dark:text-cyan-200">
                        {practice.time}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-primary/20 text-primary border-primary/30 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-400/30">
                        {practice.difficulty}
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

        {/* Test Sections & Practice */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white">Test Section Practice</h2>
              <p className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70">Comprehensive preparation for all exam sections</p>
            </div>
            
            <Button className="bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 text-white dark:from-emerald-500 dark:via-green-500 dark:to-teal-500 dark:hover:from-emerald-600 dark:hover:via-green-600 dark:hover:to-teal-600">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Full Test
            </Button>
          </div>

          {/* Section Navigation */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "default" : "outline"}
                  className={cn(
                    "rounded-xl px-4 sm:px-6 py-2 sm:py-3 font-medium transition-all duration-300 border-2",
                    activeSection === section.id 
                      ? "bg-gradient-to-r from-primary via-secondary to-accent text-white shadow-lg border-transparent dark:from-emerald-500 dark:via-green-500 dark:to-teal-500" 
                      : "bg-card/40 border-primary/30 hover:border-primary/50 text-foreground hover:shadow-md dark:bg-slate-800/40 dark:border-emerald-500/30 dark:hover:border-emerald-400/50 dark:text-cyan-200"
                  )}
                  onClick={() => setActiveSection(section.id)}
                >
                  <Icon className="w-4 h-4 mr-2 sm:mr-3" />
                  {section.label}
                </Button>
              );
            })}
          </div>

          {/* Tests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {getCurrentTests().map((test, index) => (
              <Card 
                key={index} 
                className={cn(
                  "group cursor-pointer border-2 transition-all duration-500 bg-card/80 backdrop-blur-xl hover:shadow-2xl overflow-hidden",
                  test.completed 
                    ? "border-emerald-400/50 hover:border-emerald-300/70 dark:border-emerald-500/50 dark:hover:border-emerald-400/70" 
                    : "border-primary/30 hover:border-primary/50 dark:border-emerald-500/30 dark:hover:border-emerald-400/50"
                )}
                onMouseEnter={() => setIsHovered(index)}
                onMouseLeave={() => setIsHovered(null)}
              >
                <CardContent className="p-0 overflow-hidden">
                  {/* Header with Gradient */}
                  <div className={cn(
                    "p-4 sm:p-6 text-white relative overflow-hidden transition-all duration-500 bg-gradient-to-r",
                    test.color,
                    isHovered === index && "brightness-110"
                  )}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold mb-2">{test.title}</h3>
                          <p className="text-white/90 text-xs sm:text-sm leading-relaxed">{test.description}</p>
                        </div>
                        {test.completed && (
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300 animate-pulse flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {test.skills?.map((skill, skillIndex) => (
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
                        {test.duration}
                      </span>
                      {"parts" in test && typeof (test as any).parts !== "undefined" ? (
                        <span className="flex items-center gap-1 sm:gap-2 font-medium">
                          <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                          {(test as any).parts}
                        </span>
                      ) : "topics" in test && typeof (test as any).topics !== "undefined" ? (
                        <span className="flex items-center gap-1 sm:gap-2 font-medium">
                          <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                          {(test as any).topics} Topics
                        </span>
                      ) : null}
                      {"questions" in test && typeof (test as any).questions !== "undefined" ? (
                        <span className="flex items-center gap-1 sm:gap-2 font-medium">
                          <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                          {(test as any).questions} Qs
                        </span>
                      ) : "words" in test && typeof (test as any).words !== "undefined" ? (
                        <span className="flex items-center gap-1 sm:gap-2 font-medium">
                          <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                          {(test as any).words} Words
                        </span>
                      ) : null}
                    </div>

                    {/* Progress & Score */}
                    <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                      {test.score && (
                        <div className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 dark:bg-slate-700/50 rounded-lg">
                          <span className="text-xs sm:text-sm font-medium text-muted-foreground dark:text-cyan-100/70">Last Score</span>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <span className={cn("text-base sm:text-lg font-bold", getScoreColor(test.score))}>
                              {test.score}
                            </span>
                            {"feedback" in test && test.feedback && (
                              <Eye className="w-4 h-4 text-primary cursor-pointer hover:scale-110 transition-transform dark:text-emerald-400" />
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-muted-foreground dark:text-cyan-100/70">Progress</span>
                          <span className="font-medium text-foreground dark:text-white">{test.progress}%</span>
                        </div>
                        <Progress value={test.progress} className="h-2 bg-muted dark:bg-slate-700/50">
                          <div className={cn("h-full rounded-full bg-gradient-to-r", test.color)} />
                        </Progress>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        className={cn(
                          "flex-1 font-semibold py-2 sm:py-3 rounded-xl transition-all duration-300 group-hover:shadow-lg",
                          test.completed
                            ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
                            : "bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 text-white dark:from-emerald-500 dark:via-green-500 dark:to-teal-500 dark:hover:from-emerald-600 dark:hover:via-green-600 dark:hover:to-teal-600"
                        )}
                        onClick={handleStartTest}
                      >
                        {test.completed ? (
                          <>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Retake Test
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Start Test
                          </>
                        )}
                      </Button>
                      {test.completed && (
                        <Button variant="outline" size="icon" className="border-primary/30 text-foreground hover:bg-primary/20 dark:border-emerald-500/30 dark:text-white dark:hover:bg-emerald-500/20">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Performance Analytics */}
        <Card className="bg-card/80 backdrop-blur-xl border-primary/30 shadow-sm dark:bg-slate-900/60 dark:border-emerald-500/30">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground dark:text-white">Detailed Performance Analytics</h3>
                <p className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70">Track your progress across all assessment criteria</p>
              </div>
              <Button variant="outline" className="border-primary/30 text-foreground hover:bg-primary/20 dark:border-emerald-500/30 dark:text-white dark:hover:bg-emerald-500/20">
                <PieChart className="w-4 h-4 mr-2" />
                Full Report
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm sm:text-base text-foreground dark:text-white">{metric.skill}</span>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/60">Target: {metric.target}</span>
                      <span className={cn(
                        "text-xs sm:text-sm font-bold",
                        metric.improvement.startsWith('+') ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                      )}>
                        {metric.improvement}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Progress value={(metric.score / metric.target) * 100} className="flex-1 h-2 sm:h-3 bg-muted dark:bg-slate-700/50">
                      <div className={cn(
                        "h-full rounded-full transition-all duration-500 bg-gradient-to-r",
                        metric.color,
                        metric.score >= metric.target && "animate-pulse"
                      )} />
                    </Progress>
                    <span className={cn(
                      "text-base sm:text-lg font-bold w-10 sm:w-12 text-right",
                      getScoreColor(metric.score)
                    )}>
                      {metric.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Exam Success Strategies */}
        <Card className="bg-gradient-to-r from-primary/20 via-secondary/30 to-accent/20 backdrop-blur-xl border-primary/50 text-foreground shadow-2xl overflow-hidden relative dark:from-emerald-500/20 dark:via-green-500/30 dark:to-teal-500/20 dark:border-emerald-400/50 dark:text-white">
          <span className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" aria-hidden />
          <span className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" aria-hidden />
          <CardContent className="p-4 sm:p-6 md:p-8 relative">
            <div className="relative z-10 text-center max-w-4xl mx-auto">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 backdrop-blur-sm dark:bg-white/10">
                <Rocket className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-foreground dark:text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-foreground dark:text-white">Exam Success Strategies</h3>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed dark:text-cyan-100">
                Expert techniques and proven strategies to maximize your {activeTest === 'ielts' ? 'IELTS' : 'PTE'} Academic score
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-center mb-6 sm:mb-8">
                <div className="bg-white/10 rounded-xl p-4 sm:p-6 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/15 dark:bg-white/10 dark:border-white/20">
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-foreground dark:text-white" />
                  <h4 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 text-foreground dark:text-white">Time Management</h4>
                  <p className="text-muted-foreground text-xs sm:text-sm dark:text-cyan-200">Master section timing and question pacing strategies</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 sm:p-6 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/15 dark:bg-white/10 dark:border-white/20">
                  <Target className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-foreground dark:text-white" />
                  <h4 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 text-foreground dark:text-white">Score Optimization</h4>
                  <p className="text-muted-foreground text-xs sm:text-sm dark:text-cyan-200">Focus on high-impact areas for maximum point gains</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 sm:p-6 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/15 dark:bg-white/10 dark:border-white/20">
                  <Medal className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-foreground dark:text-white" />
                  <h4 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 text-foreground dark:text-white">AI-Powered Feedback</h4>
                  <p className="text-muted-foreground text-xs sm:text-sm dark:text-cyan-200">Detailed analysis and improvement recommendations</p>
                </div>
              </div>

              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-primary/10 font-bold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg transition-all duration-300 hover:scale-105 dark:bg-white dark:text-emerald-600 dark:hover:bg-emerald-50"
              >
                <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Explore Strategies
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      )}
    </div>
  );
};

export default IeltsPtePage;
