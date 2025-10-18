import { useState } from 'react';
import { 
  Play, Clock, Target, Award, BookOpen, MessageCircle, 
  Mic, Volume2, CheckCircle, TrendingUp, Zap,
  Calendar, FileText, Timer,
  GraduationCap, Globe, Users, Lightbulb,
  Download, RotateCcw, Eye, PieChart, ArrowRight, Rocket, Medal, TargetIcon, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
      color: "bg-purple-500",
      gradient: "from-purple-500 to-pink-500",
      time: '2 min',
      type: 'Speaking',
      count: '25+ cards',
      difficulty: 'Easy'
    },
    {
      title: "Essay Outlines",
      description: "Plan and structure essays quickly with templates",
      icon: FileText,
      color: "bg-blue-500",
      gradient: "from-blue-500 to-cyan-500",
      time: '5 min',
      type: 'Writing',
      count: '15+ topics',
      difficulty: 'Medium'
    },
    {
      title: "Listening Drills",
      description: "Short audio comprehension exercises with transcripts",
      icon: Volume2,
      color: "bg-amber-500",
      gradient: "from-amber-500 to-orange-500",
      time: '3 min',
      type: 'Listening',
      count: '30+ clips',
      difficulty: 'Easy'
    },
    {
      title: "Reading Skimming",
      description: "Rapid reading comprehension practice techniques",
      icon: BookOpen,
      color: "bg-emerald-500",
      gradient: "from-emerald-500 to-green-500",
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
      description: "Full practice tests"
    },
    { 
      label: "Target Score", 
      value: targetScore.toFixed(1), 
      icon: Target, 
      color: "text-emerald-500",
      description: `${activeTest === 'ielts' ? 'IELTS' : 'PTE'} Goal`
    },
    { 
      label: "Current Estimate", 
      value: currentScore.toFixed(1), 
      icon: TrendingUp, 
      color: "text-purple-500",
      description: "Based on recent tests"
    },
    { 
      label: "Study Consistency", 
      value: "16 days", 
      icon: Zap, 
      color: "text-amber-500",
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
    if (score >= 8.0) return 'text-green-600 dark:text-green-400';
    if (score >= 7.0) return 'text-blue-600 dark:text-blue-400';
    if (score >= 6.0) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="min-h-screen pb-20 pt-32">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-xl blur-md opacity-30 animate-pulse"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Professional Test Preparation
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6 leading-relaxed">
            Comprehensive IELTS and PTE Academic preparation with AI-powered evaluation, realistic simulations, and expert strategies
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 px-4 py-1">
              <Timer className="w-3 h-3 mr-2" />
              Timed Simulations
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 px-4 py-1">
              <Mic className="w-3 h-3 mr-2" />
              AI Speech Analysis
            </Badge>
            <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 px-4 py-1">
              <FileText className="w-3 h-3 mr-2" />
              Writing Evaluation
            </Badge>
            <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 px-4 py-1">
              <Download className="w-3 h-3 mr-2" />
              Progress Reports
            </Badge>
          </div>
        </div>

        {/* Test Type Selection */}
        <div className="flex justify-center mb-12">
          <Tabs defaultValue="ielts" className="w-full max-w-4xl">
            <TabsList className="grid w-full grid-cols-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-2xl shadow-sm">
              {testTypes.map((test) => {
                const Icon = test.icon;
                return (
                  <TabsTrigger 
                    key={test.id}
                    value={test.id}
                    className={cn(
                      "flex items-center gap-4 py-4 text-lg font-semibold transition-all duration-300 rounded-xl",
                      "data-[state=active]:text-white data-[state=active]:shadow-lg",
                      `data-[state=active]:bg-gradient-to-r ${test.color}`
                    )}
                    onClick={() => setActiveTest(test.id)}
                  >
                    <Icon className="w-6 h-6" />
                    <div className="text-left">
                      <div>{test.label}</div>
                      <div className="text-xs opacity-80 font-normal">{test.description}</div>
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Progress Card */}
          <Card className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {activeTest === 'ielts' ? 'IELTS Academic' : 'PTE Academic'} Progress
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">Track your preparation journey and target achievement</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{mockTestProgress}%</div>
                  <div className="text-gray-600 dark:text-gray-400">Preparation Complete</div>
                </div>
              </div>
              
              <Progress value={mockTestProgress} className="h-3 bg-gray-100 dark:bg-gray-700 mb-8">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500" />
              </Progress>

              {/* Score Target Visualization */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{currentScore.toFixed(1)}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Current Score</div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-lg text-gray-500 dark:text-gray-400">→</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Progress</div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{targetScore.toFixed(1)}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Target Score</div>
                  </div>
                </div>
                <Progress value={((currentScore - 4) / (targetScore - 4)) * 100} className="h-2 bg-gray-200 dark:bg-gray-600">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" />
                </Progress>
              </div>
            </CardContent>
          </Card>

          {/* Performance Stats */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Performance Overview</h3>
              
              {/* Stats */}
              <div className="space-y-6 mb-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <div className={cn("p-3 rounded-xl bg-gray-50 dark:bg-gray-700", stat.color)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-baseline">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stat.label}</span>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{stat.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Achievements */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Section Mastery</h4>
                <div className="grid grid-cols-2 gap-3">
                  {achievements.map((achievement, index) => {
                    const Icon = achievement.icon;
                    const isEarned = achievement.earned;

                    return (
                      <div key={index} className={cn(
                        "p-3 rounded-xl border transition-all duration-300",
                        isEarned
                          ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                          : "bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                      )}>
                        <Icon className={cn(
                          "w-4 h-4 mb-2",
                          isEarned
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-400 dark:text-gray-500"
                        )} />
                        <div className="text-sm font-medium mb-1">{achievement.name}</div>
                        {!isEarned && (
                          <Progress value={achievement.progress} className="h-1 bg-gray-200 dark:bg-gray-600">
                            <div className="h-full bg-blue-500 rounded-full" />
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
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Quick Practice Labs</h2>
              <p className="text-gray-600 dark:text-gray-400">Targeted exercises for efficient skill development</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickPractice.map((practice, index) => {
              const Icon = practice.icon;
              return (
                <Card 
                  key={index} 
                  className="group cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 shadow-sm hover:shadow-lg"
                  onMouseEnter={() => setActivePractice(index)}
                  onMouseLeave={() => setActivePractice(null)}
                >
                  <CardContent className="p-6 relative overflow-hidden">
                    <div className={cn(
                      "absolute top-0 right-0 w-20 h-20 rounded-full -mr-6 -mt-6 transition-all duration-500",
                      practice.color,
                      activePractice === index ? "opacity-20 scale-150" : "opacity-10"
                    )}></div>
                    
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-white relative z-10 transition-transform duration-300",
                      practice.color,
                      activePractice === index && "scale-110"
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">{practice.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{practice.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {practice.time}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                        {practice.difficulty}
                      </Badge>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 group-hover:border-blue-300"
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
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Test Section Practice</h2>
              <p className="text-gray-600 dark:text-gray-400">Comprehensive preparation for all exam sections</p>
            </div>
            
            <Button className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Full Test
            </Button>
          </div>

          {/* Section Navigation */}
          <div className="flex flex-wrap gap-3 mb-8">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "default" : "outline"}
                  className={cn(
                    "rounded-xl px-6 py-3 font-medium transition-all duration-300 border-2",
                    activeSection === section.id 
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg border-transparent" 
                      : "bg-white/80 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 text-gray-700 dark:text-gray-300 hover:shadow-md"
                  )}
                  onClick={() => setActiveSection(section.id)}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {section.label}
                </Button>
              );
            })}
          </div>

          {/* Tests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {getCurrentTests().map((test, index) => (
              <Card 
                key={index} 
                className={cn(
                  "group cursor-pointer border-2 transition-all duration-500 bg-white dark:bg-gray-800 hover:shadow-xl overflow-hidden",
                  test.completed 
                    ? "border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-600" 
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                )}
                onMouseEnter={() => setIsHovered(index)}
                onMouseLeave={() => setIsHovered(null)}
              >
                <CardContent className="p-0 overflow-hidden">
                  {/* Header with Gradient */}
                  <div className={cn(
                    "p-6 text-white relative overflow-hidden transition-all duration-500",
                    test.color,
                    isHovered === index && "brightness-110"
                  )}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold mb-2">{test.title}</h3>
                          <p className="text-white/90 text-sm leading-relaxed">{test.description}</p>
                        </div>
                        {test.completed && (
                          <CheckCircle className="w-6 h-6 text-emerald-300 animate-pulse" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {test.skills?.map((skill, skillIndex) => (
                          <Badge key={skillIndex} variant="secondary" className="bg-white/20 text-white border-0 text-xs backdrop-blur-sm">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <span className="flex items-center gap-2 font-medium">
                        <Clock className="w-4 h-4" />
                        {test.duration}
                      </span>
                      {"parts" in test && typeof (test as any).parts !== "undefined" ? (
                        <span className="flex items-center gap-2 font-medium">
                          <MessageCircle className="w-4 h-4" />
                          {(test as any).parts}
                        </span>
                      ) : "topics" in test && typeof (test as any).topics !== "undefined" ? (
                        <span className="flex items-center gap-2 font-medium">
                          <MessageCircle className="w-4 h-4" />
                          {(test as any).topics} Topics
                        </span>
                      ) : null}
                      {"questions" in test && typeof (test as any).questions !== "undefined" ? (
                        <span className="flex items-center gap-2 font-medium">
                          <Target className="w-4 h-4" />
                          {(test as any).questions} Qs
                        </span>
                      ) : "words" in test && typeof (test as any).words !== "undefined" ? (
                        <span className="flex items-center gap-2 font-medium">
                          <Target className="w-4 h-4" />
                          {(test as any).words} Words
                        </span>
                      ) : null}
                    </div>

                    {/* Progress & Score */}
                    <div className="space-y-3 mb-6">
                      {test.score && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Score</span>
                          <div className="flex items-center gap-3">
                            <span className={cn("text-lg font-bold", getScoreColor(test.score))}>
                              {test.score}
                            </span>
                            {"feedback" in test && test.feedback && (
                              <Eye className="w-4 h-4 text-blue-500 cursor-pointer hover:scale-110 transition-transform" />
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="font-medium text-gray-900 dark:text-white">{test.progress}%</span>
                        </div>
                        <Progress value={test.progress} className="h-2 bg-gray-100 dark:bg-gray-700">
                          <div className={cn("h-full rounded-full bg-gradient-to-r", test.color)} />
                        </Progress>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        className={cn(
                          "flex-1 font-semibold py-3 rounded-xl transition-all duration-300 group-hover:shadow-lg",
                          test.completed
                            ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
                            : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
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
                        <Button variant="outline" size="icon" className="border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">
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
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Detailed Performance Analytics</h3>
                <p className="text-gray-600 dark:text-gray-400">Track your progress across all assessment criteria</p>
              </div>
              <Button variant="outline" className="border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                <PieChart className="w-4 h-4 mr-2" />
                Full Report
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{metric.skill}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Target: {metric.target}</span>
                      <span className={cn(
                        "text-sm font-bold",
                        metric.improvement.startsWith('+') ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      )}>
                        {metric.improvement}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Progress value={(metric.score / metric.target) * 100} className="flex-1 h-3 bg-gray-100 dark:bg-gray-700">
                      <div className={cn(
                        "h-full rounded-full transition-all duration-500 bg-gradient-to-r",
                        metric.color,
                        metric.score >= metric.target && "animate-pulse"
                      )} />
                    </Progress>
                    <span className={cn(
                      "text-lg font-bold w-12 text-right",
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
        <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl overflow-hidden">
          <CardContent className="p-8 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            
            <div className="relative z-10 text-center max-w-4xl mx-auto">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Exam Success Strategies</h3>
              <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                Expert techniques and proven strategies to maximize your {activeTest === 'ielts' ? 'IELTS' : 'PTE'} Academic score
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-8">
                <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/15">
                  <Users className="w-10 h-10 mx-auto mb-3" />
                  <h4 className="font-bold text-lg mb-2">Time Management</h4>
                  <p className="text-blue-200 text-sm">Master section timing and question pacing strategies</p>
                </div>
                <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/15">
                  <TargetIcon className="w-10 h-10 mx-auto mb-3" />
                  <h4 className="font-bold text-lg mb-2">Score Optimization</h4>
                  <p className="text-blue-200 text-sm">Focus on high-impact areas for maximum point gains</p>
                </div>
                <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/15">
                  <Medal className="w-10 h-10 mx-auto mb-3" />
                  <h4 className="font-bold text-lg mb-2">AI-Powered Feedback</h4>
                  <p className="text-blue-200 text-sm">Detailed analysis and improvement recommendations</p>
                </div>
              </div>

              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 font-bold px-8 py-3 text-lg transition-all duration-300 hover:scale-105"
              >
                <Lightbulb className="w-5 h-5 mr-2" />
                Explore Strategies
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IeltsPtePage;