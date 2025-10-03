import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, Volume2, Mic, CheckCircle, Clock, Users, 
  Target, Award, BookOpen, MessageCircle, Repeat, 
  Star, ChevronRight, Shield, Zap, TrendingUp,
  Brain, Languages, GitMerge, ThumbsUp, BarChart3,
  Video, Headphones, PenTool, Globe, Trophy, Crown,
  Lightbulb, GitBranch, Sparkles, TargetIcon,
  BarChart, Globe2, Mic2, BookOpenCheck, ArrowRight,
  Rocket, ShieldCheck, Medal, StarIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import Footer from '@/components/landing/Footer';

const AdvancedPage = () => {
  const [activeModule, setActiveModule] = useState('mastery');
  const [progress, setProgress] = useState(85);
  const [streak, setStreak] = useState(28);
  const [fluencyScore, setFluencyScore] = useState(89);
  const [vocabularySize, setVocabularySize] = useState(2850);
  const [isHovered, setIsHovered] = useState<number | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<number | null>(null);

  const modules = [
    { 
      id: 'mastery', 
      label: 'Language Mastery', 
      icon: Crown, 
      color: 'from-purple-500 to-indigo-500',
      description: 'Achieve near-native fluency and sophistication'
    },
    { 
      id: 'professional', 
      label: 'Executive Communication', 
      icon: Trophy, 
      color: 'from-blue-500 to-cyan-500',
      description: 'Master professional and leadership communication'
    },
    { 
      id: 'academic', 
      label: 'Academic Excellence', 
      icon: BookOpenCheck, 
      color: 'from-emerald-500 to-green-500',
      description: 'Excel in academic and research contexts'
    },
    { 
      id: 'cultural', 
      label: 'Cultural Intelligence', 
      icon: Globe2, 
      color: 'from-amber-500 to-orange-500',
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
      color: 'from-purple-500 to-indigo-500',
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
      color: 'from-amber-500 to-orange-500',
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
      color: 'from-emerald-500 to-green-500',
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
      color: 'from-pink-500 to-rose-500',
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
      color: 'from-blue-500 to-cyan-500',
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
      color: 'from-indigo-500 to-purple-500',
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
      color: "bg-purple-500",
      gradient: "from-purple-500 to-indigo-500",
      time: "25-35 min",
      type: "Competitive",
      difficulty: "Expert",
      participants: "Live AI Judges"
    },
    {
      title: "Press Conference Simulation",
      description: "Handle intense media scrutiny and tough questions in high-pressure scenarios",
      icon: Mic2,
      color: "bg-red-500",
      gradient: "from-red-500 to-orange-500",
      time: "30 min",
      type: "Professional",
      difficulty: "Expert",
      participants: "Simulated Media"
    },
    {
      title: "Cultural Ambassador",
      description: "Explain complex cultural concepts and bridge communication gaps internationally",
      icon: Globe,
      color: "bg-emerald-500",
      gradient: "from-emerald-500 to-green-500",
      time: "35 min",
      type: "Diplomatic",
      difficulty: "Advanced",
      participants: "International Panel"
    },
    {
      title: "Improvised Speaking",
      description: "Speak spontaneously on unexpected topics with professional coherence and impact",
      icon: Sparkles,
      color: "bg-amber-500",
      gradient: "from-amber-500 to-orange-500",
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
      description: "Near-native fluency and sophistication"
    },
    { 
      label: "Vocabulary Excellence", 
      value: `${vocabularySize}+`, 
      icon: BookOpen, 
      color: "text-blue-500",
      description: "Advanced professional vocabulary"
    },
    { 
      label: "Cultural Intelligence", 
      value: "82%", 
      icon: Globe, 
      color: "text-emerald-500",
      description: "Complex cultural context mastery"
    },
    { 
      label: "Expert Consistency", 
      value: `${streak} days`, 
      icon: Zap, 
      color: "text-amber-500",
      description: "Elite learning discipline"
    },
  ];

  const masteryMetrics = [
    { skill: "Advanced Vocabulary", progress: 88, target: 95, color: "from-purple-500 to-indigo-500" },
    { skill: "Grammatical Precision", progress: 92, target: 98, color: "from-blue-500 to-cyan-500" },
    { skill: "Pronunciation Excellence", progress: 85, target: 95, color: "from-emerald-500 to-green-500" },
    { skill: "Cultural Appropriateness", progress: 82, target: 90, color: "from-amber-500 to-orange-500" },
    { skill: "Executive Presence", progress: 89, target: 95, color: "from-pink-500 to-rose-500" },
  ];

  const achievements = [
    { name: "Debate Champion", earned: true, icon: Trophy, color: "text-yellow-500", progress: 100 },
    { name: "Vocabulary Virtuoso", earned: true, icon: Languages, color: "text-blue-500", progress: 100 },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 dark:from-slate-900 dark:via-purple-950/20 dark:to-slate-900 pb-20 pt-32">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 rounded-xl blur-md opacity-30 animate-pulse"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 dark:from-purple-300 dark:to-indigo-300 bg-clip-text text-transparent">
              Expert English Mastery
            </h1>
          </div>
          <p className="text-lg text-gray-300 dark:text-gray-400 max-w-3xl mx-auto mb-6 leading-relaxed">
            Achieve professional excellence with near-native fluency, executive communication skills, and sophisticated cultural intelligence
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="secondary" className="bg-purple-500/20 dark:bg-purple-900/30 text-purple-300 dark:text-purple-400 border-purple-500/30 dark:border-purple-800 px-4 py-1">
              <Crown className="w-3 h-3 mr-2" />
              Expert Level
            </Badge>
            <Badge variant="secondary" className="bg-blue-500/20 dark:bg-blue-900/30 text-blue-300 dark:text-blue-400 border-blue-500/30 dark:border-blue-800 px-4 py-1">
              <Lightbulb className="w-3 h-3 mr-2" />
              Executive Communication
            </Badge>
            <Badge variant="secondary" className="bg-emerald-500/20 dark:bg-emerald-900/30 text-emerald-300 dark:text-emerald-400 border-emerald-500/30 dark:border-emerald-800 px-4 py-1">
              <TargetIcon className="w-3 h-3 mr-2" />
              Professional Excellence
            </Badge>
          </div>
        </div>

        {/* Elite Progress Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Mastery Progress */}
          <Card className="lg:col-span-2 bg-slate-800/60 dark:bg-gray-800 border border-slate-700 dark:border-gray-700 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-semibold text-white dark:text-white">Expert Progress Tracking</h3>
                  <p className="text-gray-400 dark:text-gray-400">Your journey to professional English mastery</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-400 dark:text-purple-400">{progress}%</div>
                  <div className="text-gray-400 dark:text-gray-400">Mastery Achievement</div>
                </div>
              </div>

              <Progress value={progress} className="h-3 bg-slate-700 dark:bg-gray-700 mb-8">
                <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500" />
              </Progress>
              
              {/* Mastery Metrics */}
              <div className="space-y-6">
                <h4 className="font-semibold text-white dark:text-white text-lg">Expert Skill Development</h4>
                {masteryMetrics.map((metric, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-300 dark:text-gray-300">{metric.skill}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 dark:text-gray-400">Target: {metric.target}%</span>
                        <span className="text-sm font-medium text-white dark:text-white w-12 text-right">{metric.progress}%</span>
                      </div>
                    </div>
                    <Progress value={metric.progress} className="w-full h-2 bg-slate-700 dark:bg-gray-700">
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
          <Card className="bg-slate-800/60 dark:bg-gray-800 border border-slate-700 dark:border-gray-700 shadow-xl">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-white dark:text-white mb-6">Expert Performance</h3>
              
              {/* Stats */}
              <div className="space-y-6 mb-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <div className={cn("p-3 rounded-xl bg-slate-700/50 dark:bg-gray-700", stat.color)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-baseline">
                          <span className="text-sm font-medium text-gray-300 dark:text-gray-300">{stat.label}</span>
                          <span className="text-lg font-bold text-white dark:text-white">{stat.value}</span>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-400">{stat.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Achievements */}
              <div>
                <h4 className="text-lg font-semibold text-white dark:text-white mb-4">Expert Certifications</h4>
                <div className="grid grid-cols-2 gap-3">
                  {achievements.map((achievement, index) => {
                    const Icon = achievement.icon;
                    const isEarned = achievement.earned;

                    return (
                      <div key={index} className={cn(
                        "p-4 rounded-xl border transition-all duration-300 group cursor-pointer",
                        isEarned
                          ? "bg-purple-500/10 border-purple-500/30 text-purple-300 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400 hover:bg-purple-500/20"
                          : "bg-slate-700/30 border-slate-600 dark:bg-gray-700 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-slate-600/30"
                      )}>
                        <Icon className={cn(
                          "w-5 h-5 mb-2 transition-transform duration-300 group-hover:scale-110",
                          achievement.color,
                          !isEarned && "opacity-50"
                        )} />
                        <div className="text-sm font-medium mb-2">{achievement.name}</div>
                        {!isEarned && (
                          <Progress value={achievement.progress} className="h-1 bg-slate-600 dark:bg-gray-600">
                            <div className="h-full bg-purple-500 rounded-full" />
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
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white dark:text-white mb-2">Expert Challenge Labs</h2>
              <p className="text-gray-400 dark:text-gray-400">High-stakes simulations for professional excellence</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {challengeActivities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <Card 
                  key={index} 
                  className="group cursor-pointer bg-slate-800/40 dark:bg-gray-800 border border-slate-700 dark:border-gray-700 hover:border-purple-500/50 dark:hover:border-purple-600 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-500/10"
                  onMouseEnter={() => setIsHovered(index)}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <CardContent className="p-6 relative overflow-hidden">
                    <div className={cn(
                      "absolute top-0 right-0 w-20 h-20 rounded-full -mr-6 -mt-6 transition-all duration-500",
                      activity.color,
                      isHovered === index ? "opacity-20 scale-150" : "opacity-10"
                    )}></div>
                    
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-white relative z-10 transition-transform duration-300",
                      activity.color,
                      isHovered === index && "scale-110"
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="font-semibold text-white dark:text-white text-lg">{activity.title}</h4>
                      <Badge variant="outline" className={cn(
                        "text-xs border-0",
                        activity.difficulty === "Expert" ? "bg-red-500/20 text-red-300" :
                        activity.difficulty === "Very High" ? "bg-orange-500/20 text-orange-300" :
                        "bg-yellow-500/20 text-yellow-300"
                      )}>
                        {activity.difficulty}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-400 dark:text-gray-400 mb-6 leading-relaxed">{activity.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary" className="text-xs bg-slate-700/50 dark:bg-gray-700 text-gray-300">
                        {activity.time}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-purple-500/20 dark:bg-purple-900/20 text-purple-300 dark:text-purple-400">
                        {activity.participants}
                      </Badge>
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold transition-all duration-300 group-hover:shadow-lg"
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
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white dark:text-white">Expert Learning Modules</h2>
              <p className="text-gray-400 dark:text-gray-400">Master sophisticated communication for professional leadership</p>
            </div>
          </div>

          {/* Module Navigation */}
          <div className="flex flex-wrap gap-3 mb-8">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Button
                  key={module.id}
                  variant={activeModule === module.id ? "default" : "outline"}
                  className={cn(
                    "rounded-xl px-6 py-3 font-medium transition-all duration-300 border-2",
                    activeModule === module.id 
                      ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg border-transparent" 
                      : "bg-slate-800/40 dark:bg-gray-800 border-slate-700 dark:border-gray-700 hover:border-purple-500/50 dark:hover:border-purple-600 text-gray-300 dark:text-gray-300 hover:shadow-md"
                  )}
                  onClick={() => setActiveModule(module.id)}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {module.label}
                </Button>
              );
            })}
          </div>

          {/* Lessons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {getCurrentLessons().map((lesson, index) => (
              <Card 
                key={index} 
                className={cn(
                  "group cursor-pointer border-2 transition-all duration-500 bg-slate-800/40 dark:bg-gray-800 hover:shadow-2xl hover:shadow-purple-500/10 overflow-hidden",
                  lesson.completed 
                    ? "border-emerald-500/30 dark:border-emerald-800 hover:border-emerald-400/50 dark:hover:border-emerald-600" 
                    : "border-slate-700 dark:border-gray-700 hover:border-purple-500/50 dark:hover:border-purple-600"
                )}
                onMouseEnter={() => setIsHovered(index + 10)}
                onMouseLeave={() => setIsHovered(null)}
              >
                <CardContent className="p-0 overflow-hidden">
                  {/* Header with Gradient */}
                  <div className={cn(
                    "p-6 text-white relative overflow-hidden transition-all duration-500",
                    lesson.color,
                    isHovered === index + 10 && "brightness-110"
                  )}>
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
                  <div className="p-6">
                    <div className="flex justify-between text-sm text-gray-400 dark:text-gray-400 mb-4">
                      <span className="flex items-center gap-2 font-medium">
                        <Clock className="w-4 h-4" />
                        {lesson.duration}
                      </span>
                      <span className="flex items-center gap-2 font-medium">
                        <Target className="w-4 h-4" />
                        {lesson.focus}
                      </span>
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 dark:text-purple-400 border-0 text-xs">
                        {lesson.level}
                      </Badge>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 dark:text-gray-400">Module Progress</span>
                        <span className="font-medium text-white dark:text-white">{lesson.progress}%</span>
                      </div>
                      <Progress value={lesson.progress} className="h-2 bg-slate-700 dark:bg-gray-700">
                        <div className={cn("h-full rounded-full bg-gradient-to-r", lesson.color)} />
                      </Progress>
                    </div>
                    
                    <Button 
                      className={cn(
                        "w-full font-semibold py-3 rounded-xl transition-all duration-300 group-hover:shadow-lg relative overflow-hidden",
                        lesson.completed
                          ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
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
        <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-2xl overflow-hidden">
          <CardContent className="p-8 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            
            <div className="relative z-10 text-center max-w-4xl mx-auto">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Medal className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Expert English Certification</h3>
              <p className="text-purple-100 text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
                Earn professional recognition by demonstrating near-native fluency, executive communication skills, and sophisticated cultural intelligence
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-8">
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
                className="bg-white text-purple-600 hover:bg-gray-100 font-bold px-8 py-4 text-lg transition-all duration-300 hover:scale-105"
              >
                <Crown className="w-5 h-5 mr-2" />
                Begin Certification Journey
                <Rocket className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AdvancedPage;