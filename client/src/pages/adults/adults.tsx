import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Play, Target, Award, BookOpen, MessageCircle,
  Mic, Volume2, CheckCircle, TrendingUp, Zap, Lightbulb, Crown, BarChart3,
  Clock, ThumbsUp, Shield, Rocket,
  ArrowRight, GraduationCap, Brain, Languages
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import Footer from '@/components/landing/Footer';

const AdultsPage = () => {
  const [activeLevel, setActiveLevel] = useState('overview');
  const [progress, setProgress] = useState(42);
  const [streak, setStreak] = useState(7);
  const [fluencyScore, setFluencyScore] = useState(65);
  const [isHovered, setIsHovered] = useState<number | null>(null);
  const [activePath, setActivePath] = useState<number | null>(null);

  const levels = [
    {
      id: 'beginners',
      label: 'Foundation Level',
      icon: Lightbulb,
      color: 'from-blue-500 to-cyan-500',
      description: 'Build essential communication skills for everyday situations',
      progress: 65,
      lessons: 12,
      skills: ['Core Grammar', 'Essential Vocabulary', 'Daily Conversations'],
      duration: '4-6 weeks'
    },
    {
      id: 'intermediates',
      label: 'Intermediate Level',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      description: 'Develop professional communication and complex discussions',
      progress: 30,
      lessons: 18,
      skills: ['Advanced Grammar', 'Professional Communication', 'Cultural Context'],
      duration: '6-8 weeks'
    },
    {
      id: 'advanced',
      label: 'Advanced Level',
      icon: Crown,
      color: 'from-amber-500 to-orange-500',
      description: 'Master English for professional excellence and leadership',
      progress: 15,
      lessons: 24,
      skills: ['Executive Communication', 'Native Expressions', 'Strategic Dialogue'],
      duration: '8-12 weeks'
    }
  ];

  const learningPaths = [
    {
      title: "Professional Communication",
      description: "Master workplace communication, meetings, and professional interactions",
      icon: MessageCircle,
      color: "bg-blue-500",
      gradient: "from-blue-500 to-cyan-500",
      duration: "8 weeks",
      lessons: 32,
      level: "All Levels",
      progress: 45,
      skills: ['Meetings', 'Presentations', 'Professional Etiquette']
    },
    {
      title: "Grammar & Structure Mastery",
      description: "Comprehensive grammar from foundational to advanced professional writing",
      icon: BookOpen,
      color: "bg-emerald-500",
      gradient: "from-emerald-500 to-green-500",
      duration: "6 weeks",
      lessons: 28,
      level: "Foundation → Advanced",
      progress: 60,
      skills: ['Syntax', 'Professional Writing', 'Complex Structures']
    },
    {
      title: "Pronunciation Excellence",
      description: "Perfect your accent and speaking clarity for professional settings",
      icon: Mic,
      color: "bg-purple-500",
      gradient: "from-purple-500 to-pink-500",
      duration: "4 weeks",
      lessons: 20,
      level: "All Levels",
      progress: 30,
      skills: ['Intonation', 'Clarity', 'Professional Tone']
    },
    {
      title: "Business English Mastery",
      description: "Excel in corporate environments and executive communication",
      icon: GraduationCap,
      color: "bg-amber-500",
      gradient: "from-amber-500 to-orange-500",
      duration: "10 weeks",
      lessons: 40,
      level: "Intermediate → Advanced",
      progress: 20,
      skills: ['Reports', 'Emails', 'Strategic Communication']
    }
  ];

  const quickActions = [
    {
      title: "Daily Conversation",
      description: "Practice professional speaking about everyday topics",
      icon: MessageCircle,
      color: "bg-blue-500",
      gradient: "from-blue-500 to-cyan-500",
      time: "10-15 min",
      level: "Foundation+"
    },
    {
      title: "Pronunciation Drill",
      description: "Improve your accent and speaking clarity",
      icon: Volume2,
      color: "bg-emerald-500",
      gradient: "from-emerald-500 to-green-500",
      time: "5-10 min",
      level: "All Levels"
    },
    {
      title: "Grammar Challenge",
      description: "Test and improve your professional grammar skills",
      icon: BookOpen,
      color: "bg-purple-500",
      gradient: "from-purple-500 to-pink-500",
      time: "8-12 min",
      level: "All Levels"
    },
    {
      title: "Vocabulary Builder",
      description: "Learn professional terminology in context",
      icon: Languages,
      color: "bg-amber-500",
      gradient: "from-amber-500 to-orange-500",
      time: "6-8 min",
      level: "All Levels"
    }
  ];

  const stats = [
    {
      label: "Fluency Score",
      value: `${fluencyScore}%`,
      icon: TrendingUp,
      color: "text-blue-500",
      description: "Professional speaking fluency"
    },
    {
      label: "Vocabulary Mastered",
      value: "428",
      icon: BookOpen,
      color: "text-emerald-500",
      description: "Active professional vocabulary"
    },
    {
      label: "Learning Consistency",
      value: `${streak} days`,
      icon: Zap,
      color: "text-amber-500",
      description: "Daily practice streak"
    },
    {
      label: "Modules Completed",
      value: "24",
      icon: Award,
      color: "text-purple-500",
      description: "Total learning modules"
    },
  ];

  const recentActivity = [
    { action: "Completed", lesson: "Professional Greetings", time: "2 hours ago", score: 85 },
    { action: "Started", lesson: "Business Meeting Skills", time: "1 day ago", score: null },
    { action: "Practiced", lesson: "Pronunciation Refinement", time: "2 days ago", score: 78 },
    { action: "Completed", lesson: "Advanced Grammar Test", time: "3 days ago", score: 92 },
  ];

  const achievements = [
    { name: "Professional Communicator", earned: true, icon: MessageCircle, progress: 100 },
    { name: "Grammar Expert", earned: false, icon: BookOpen, progress: 75 },
    { name: "Clear Speaker", earned: false, icon: Mic, progress: 50 },
    { name: "Vocabulary Specialist", earned: true, icon: Languages, progress: 100 },
  ];

  const handleQuickStart = (actionIndex: number) => {
    setProgress(prev => Math.min(prev + 2, 100));
    setStreak(prev => prev + 1);
    setFluencyScore(prev => Math.min(prev + 1, 100));
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-blue-600 dark:text-blue-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 dark:from-slate-900 dark:via-blue-950/10 dark:to-purple-950/10 pb-20 pt-32">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-xl blur-md opacity-30 animate-pulse"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Professional English Mastery
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6 leading-relaxed">
            Advanced English learning designed for professionals seeking career advancement and executive communication excellence
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 px-4 py-1">
              <Target className="w-3 h-3 mr-2" />
              Career-Focused
            </Badge>
            <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 px-4 py-1">
              <Clock className="w-3 h-3 mr-2" />
              Flexible Learning
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 px-4 py-1">
              <Shield className="w-3 h-3 mr-2" />
              Professional Curriculum
            </Badge>
            <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 px-4 py-1">
              <Rocket className="w-3 h-3 mr-2" />
              Accelerated Progress
            </Badge>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Progress Card */}
          <Card className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Learning Progress</h3>
                  <p className="text-gray-600 dark:text-gray-400">Track your advancement across professional levels</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{progress}%</div>
                  <div className="text-gray-600 dark:text-gray-400">Overall Mastery</div>
                </div>
              </div>

              <Progress value={progress} className="h-3 bg-gray-100 dark:bg-gray-700 mb-8">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500" />
              </Progress>

              {/* Level Progress */}
              <div className="space-y-6">
                {levels.map((level, index) => {
                  const Icon = level.icon;
                  return (
                    <div key={level.id} className="flex items-center gap-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600">
                      <div className={cn("p-3 rounded-xl text-white bg-gradient-to-r", level.color)}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-gray-900 dark:text-white">{level.label}</span>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{level.progress}% Complete</span>
                        </div>
                        <Progress value={level.progress} className="h-2 bg-gray-100 dark:bg-gray-600">
                          <div className={cn("h-full rounded-full bg-gradient-to-r", level.color)} />
                        </Progress>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{level.description}</p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex gap-2">
                            {level.skills.map((skill, i) => (
                              <Badge key={i} variant="outline" className="text-xs bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">{level.duration}</span>
                        </div>
                      </div>
                      <Link to={`/adults/${level.id}`}>
                        <Button variant="outline" size="sm" className="border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Stats & Achievements */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Performance Metrics</h3>

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
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Professional Certifications</h4>
                <div className="grid grid-cols-2 gap-3">
                  {achievements.map((achievement, index) => {
                    const Icon = achievement.icon;
                    const isEarned = achievement.earned;

                    return (
                      <div key={index} className={cn(
                        "p-4 rounded-xl border transition-all duration-300 group cursor-pointer",
                        isEarned
                          ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                          : "bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                      )}>
                        <Icon className={cn(
                          "w-5 h-5 mb-2 transition-transform duration-300 group-hover:scale-110",
                          isEarned
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-400 dark:text-gray-500"
                        )} />
                        <div className="text-sm font-medium mb-2">{achievement.name}</div>
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

        {/* Quick Practice Sessions */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Quick Practice Sessions</h2>
              <p className="text-gray-600 dark:text-gray-400">Short, focused exercises for busy professionals</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card
                  key={index}
                  className="group cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 shadow-sm hover:shadow-lg"
                  onClick={() => handleQuickStart(index)}
                  onMouseEnter={() => setIsHovered(index)}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <CardContent className="p-6 relative overflow-hidden">
                    <div className={cn(
                      "absolute top-0 right-0 w-20 h-20 rounded-full -mr-6 -mt-6 transition-all duration-500",
                      action.color,
                      isHovered === index ? "opacity-20 scale-150" : "opacity-10"
                    )}></div>
                    
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-white relative z-10 transition-transform duration-300",
                      action.color,
                      isHovered === index && "scale-110"
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">{action.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{action.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span>{action.time}</span>
                      <Badge variant="outline" className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {action.level}
                      </Badge>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 group-hover:border-blue-300"
                    >
                      <Play className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                      Start Session
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Professional Learning Paths */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Professional Learning Paths</h2>
              <p className="text-gray-600 dark:text-gray-400">Structured programs for career advancement and professional development</p>
            </div>
            <Button variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <BarChart3 className="w-4 h-4 mr-2" />
              View All Programs
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {learningPaths.map((path, index) => {
              const Icon = path.icon;
              return (
                <Card
                  key={index}
                  className="group cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 overflow-hidden"
                  onMouseEnter={() => setActivePath(index)}
                  onMouseLeave={() => setActivePath(null)}
                >
                  <CardContent className="p-0">
                    <div className="p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div className={cn("p-4 rounded-xl text-white", path.color)}>
                          <Icon className="w-7 h-7" />
                        </div>
                        <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                          {path.level}
                        </Badge>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{path.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{path.description}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {path.duration}
                        </span>
                        <span className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          {path.lessons} modules
                        </span>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="font-medium text-gray-900 dark:text-white">{path.progress}% Complete</span>
                        </div>
                        <Progress value={path.progress} className="h-2 bg-gray-100 dark:bg-gray-700">
                          <div className={cn("h-full rounded-full bg-gradient-to-r", path.gradient)} />
                        </Progress>
                      </div>

                      <div className="flex gap-2">
                        {path.skills.map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 px-8 py-6 border-t border-gray-200 dark:border-gray-600">
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold transition-all duration-300 group-hover:shadow-lg">
                        Continue Program
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Activity & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 transition-colors duration-200 hover:bg-white dark:hover:bg-gray-700">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      activity.action === 'Completed' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" :
                        activity.action === 'Started' ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" :
                          "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
                    )}>
                      {activity.action === 'Completed' && <CheckCircle className="w-5 h-5" />}
                      {activity.action === 'Started' && <Play className="w-5 h-5" />}
                      {activity.action === 'Practiced' && <Mic className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">{activity.lesson}</span>
                        {activity.score && (
                          <Badge variant="secondary" className={cn(
                            "text-xs font-medium",
                            getScoreColor(activity.score).includes('green') ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" :
                            getScoreColor(activity.score).includes('blue') ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800" :
                            "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                          )}>
                            {activity.score}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{activity.action} • {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommended Next Steps */}
          <Card className="bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-xl overflow-hidden">
            <CardContent className="p-8 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ThumbsUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Continue Your Progress</h3>
                <p className="text-blue-100 text-lg mb-6 leading-relaxed">
                  Based on your learning pattern, we recommend advancing with professional communication skills
                </p>

                <div className="bg-white/10 rounded-2xl p-6 mb-6 backdrop-blur-sm border border-white/20">
                  <h4 className="font-bold text-lg mb-3 text-white">Business Meeting Mastery</h4>
                  <p className="text-blue-100 text-sm mb-4 leading-relaxed">
                    Develop executive communication skills for professional meetings and presentations
                  </p>
                  <div className="flex items-center justify-between text-sm text-blue-200">
                    <span>Intermediate Level</span>
                    <span>25-30 minutes</span>
                  </div>
                </div>

                <Button className="w-full bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 text-base transition-all duration-300 hover:scale-105">
                  <Play className="w-5 h-5 mr-2" />
                  Start Recommended Module
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AdultsPage;