// src/pages/adults/index.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, Target, Award, BookOpen, MessageCircle, 
  Mic, Volume2, CheckCircle, Star, TrendingUp, Zap,
  Users, Lightbulb, Crown, Globe, BarChart3,
  Clock, Calendar, ThumbsUp, Shield, Rocket,
  ArrowRight, GraduationCap, Brain, Languages
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const AdultsPage = () => {
  const [activeLevel, setActiveLevel] = useState('overview');
  const [progress, setProgress] = useState(42);
  const [streak, setStreak] = useState(7);
  const [fluencyScore, setFluencyScore] = useState(65);

  const levels = [
    { 
      id: 'beginners', 
      label: 'Beginner', 
      icon: Lightbulb, 
      color: 'from-blue-500 to-cyan-500',
      description: 'Build foundation with essential conversations',
      progress: 65,
      lessons: 12,
      skills: ['Basic Grammar', 'Everyday Vocabulary', 'Simple Conversations']
    },
    { 
      id: 'intermediates', 
      label: 'Intermediate', 
      icon: Brain, 
      color: 'from-purple-500 to-pink-500',
      description: 'Develop fluency with complex discussions',
      progress: 30,
      lessons: 18,
      skills: ['Advanced Grammar', 'Professional Communication', 'Cultural Context']
    },
    { 
      id: 'advanced', 
      label: 'Advanced', 
      icon: Crown, 
      color: 'from-orange-500 to-red-500',
      description: 'Master English for professional excellence',
      progress: 15,
      lessons: 24,
      skills: ['Debate Skills', 'Native Expressions', 'Executive Communication']
    }
  ];

  const learningPaths = [
    {
      title: "Conversation Mastery",
      description: "Develop natural speaking skills through real-life dialogues",
      icon: MessageCircle,
      color: "bg-blue-500",
      duration: "8 weeks",
      lessons: 32,
      level: "All Levels",
      progress: 45
    },
    {
      title: "Grammar & Structure",
      description: "Master English grammar from basic to advanced concepts",
      icon: BookOpen,
      color: "bg-green-500",
      duration: "6 weeks",
      lessons: 28,
      level: "Beginner → Advanced",
      progress: 60
    },
    {
      title: "Pronunciation Pro",
      description: "Perfect your accent and speaking clarity",
      icon: Mic,
      color: "bg-purple-500",
      duration: "4 weeks",
      lessons: 20,
      level: "All Levels",
      progress: 30
    },
    {
      title: "Business English",
      description: "Excel in professional settings and workplace communication",
      icon: GraduationCap,
      color: "bg-orange-500",
      duration: "10 weeks",
      lessons: 40,
      level: "Intermediate → Advanced",
      progress: 20
    }
  ];

  const quickActions = [
    {
      title: "Daily Conversation",
      description: "Practice speaking about everyday topics",
      icon: MessageCircle,
      color: "bg-blue-500",
      time: "10-15 min",
      level: "Beginner+"
    },
    {
      title: "Pronunciation Drill",
      description: "Improve your accent and clarity",
      icon: Volume2,
      color: "bg-green-500",
      time: "5-10 min",
      level: "All Levels"
    },
    {
      title: "Grammar Challenge",
      description: "Test and improve your grammar skills",
      icon: BookOpen,
      color: "bg-purple-500",
      time: "8-12 min",
      level: "All Levels"
    },
    {
      title: "Vocabulary Builder",
      description: "Learn new words in context",
      icon: Languages,
      color: "bg-orange-500",
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
      description: "Overall speaking fluency"
    },
    { 
      label: "Words Learned", 
      value: "428", 
      icon: BookOpen, 
      color: "text-green-500",
      description: "Active vocabulary"
    },
    { 
      label: "Current Streak", 
      value: `${streak} days`, 
      icon: Zap, 
      color: "text-orange-500",
      description: "Daily practice consistency"
    },
    { 
      label: "Lessons Completed", 
      value: "24", 
      icon: Award, 
      color: "text-purple-500",
      description: "Total lessons finished"
    },
  ];

  const recentActivity = [
    { action: "Completed", lesson: "Greetings Practice", time: "2 hours ago", score: 85 },
    { action: "Started", lesson: "Business Meetings", time: "1 day ago", score: null },
    { action: "Practiced", lesson: "Pronunciation Drill", time: "2 days ago", score: 78 },
    { action: "Completed", lesson: "Grammar Test", time: "3 days ago", score: 92 },
  ];

  const achievements = [
    { name: "Conversation Starter", earned: true, icon: MessageCircle, progress: 100 },
    { name: "Grammar Guru", earned: false, icon: BookOpen, progress: 75 },
    { name: "Pronunciation Pro", earned: false, icon: Mic, progress: 50 },
    { name: "Vocabulary Master", earned: true, icon: Languages, progress: 100 },
  ];

  const handleQuickStart = (actionIndex: number) => {
    // Simulate progress update
    setProgress(prev => Math.min(prev + 2, 100));
    setStreak(prev => prev + 1);
    setFluencyScore(prev => Math.min(prev + 1, 100));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-20 pt-32">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Users className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Adult English Learning
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-4">
            Personalized English learning paths for adults - from basic conversations to professional mastery
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <Target className="w-3 h-3 mr-1" />
              Goal-Oriented
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <Clock className="w-3 h-3 mr-1" />
              Self-Paced
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              <Shield className="w-3 h-3 mr-1" />
              Professional Focus
            </Badge>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              <Rocket className="w-3 h-3 mr-1" />
              Fast Progress
            </Badge>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Progress Card */}
          <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Your Learning Journey</h3>
                  <p className="text-sm text-gray-600">Track your progress across all levels and skills</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{progress}%</div>
                  <div className="text-sm text-gray-500">Overall Progress</div>
                </div>
              </div>
              
              <Progress value={progress} className="h-3 bg-gray-200 mb-8">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500" />
              </Progress>

              {/* Level Progress */}
              <div className="space-y-4">
                {levels.map((level, index) => {
                  const Icon = level.icon;
                  return (
                    <div key={level.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                      <div className={cn("p-2 rounded-lg text-white bg-gradient-to-r", level.color)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-gray-800">{level.label}</span>
                          <span className="text-sm font-medium text-gray-600">{level.progress}%</span>
                        </div>
                        <Progress value={level.progress} className="h-2 bg-gray-200">
                          <div className={cn("h-full rounded-full bg-gradient-to-r", level.color)} />
                        </Progress>
                        <p className="text-xs text-gray-500 mt-1">{level.description}</p>
                      </div>
                      <Link to={`/adults/${level.id}`}>
                        <Button variant="outline" size="sm" className="border-blue-200 text-blue-600">
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Stats & Achievements */}
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Performance</h3>
              
              {/* Stats */}
              <div className="space-y-4 mb-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg bg-gray-50", stat.color)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-baseline">
                          <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                          <span className="text-lg font-bold text-gray-900">{stat.value}</span>
                        </div>
                        <p className="text-xs text-gray-500">{stat.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Achievements */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Achievements</h4>
                <div className="grid grid-cols-2 gap-2">
                  {achievements.map((achievement, index) => {
                    const Icon = achievement.icon;
                    return (
                      <div key={index} className={cn(
                        "p-2 rounded-lg text-center border transition-all duration-300",
                        achievement.earned 
                          ? "bg-green-50 border-green-200 text-green-700" 
                          : "bg-gray-50 border-gray-200 text-gray-500"
                      )}>
                        <Icon className="w-4 h-4 mx-auto mb-1" />
                        <div className="text-xs font-medium">{achievement.name}</div>
                        {!achievement.earned && (
                          <Progress value={achievement.progress} className="h-1 mt-1 bg-gray-200">
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card 
                key={index} 
                className="group cursor-pointer border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm"
                onClick={() => handleQuickStart(index)}
              >
                <CardContent className="p-4 text-center">
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-white", action.color)}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">{action.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>{action.time}</span>
                    <Badge variant="outline" className="text-xs">{action.level}</Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Start Now
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Learning Paths */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Recommended Learning Paths</h2>
            <Button variant="outline" className="border-blue-200 text-blue-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              View All Paths
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {learningPaths.map((path, index) => {
              const Icon = path.icon;
              return (
                <Card 
                  key={index} 
                  className="group cursor-pointer border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm"
                >
                  <CardContent className="p-0 overflow-hidden rounded-xl">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn("p-3 rounded-lg text-white", path.color)}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {path.level}
                        </Badge>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{path.title}</h3>
                      <p className="text-gray-600 mb-4">{path.description}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {path.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {path.lessons} lessons
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium text-gray-800">{path.progress}%</span>
                        </div>
                        <Progress value={path.progress} className="h-2 bg-gray-200">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                        </Progress>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 px-6 py-4 border-t">
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                        Continue Path
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Activity & Next Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      activity.action === 'Completed' ? "bg-green-100 text-green-600" :
                      activity.action === 'Started' ? "bg-blue-100 text-blue-600" :
                      "bg-purple-100 text-purple-600"
                    )}>
                      {activity.action === 'Completed' && <CheckCircle className="w-4 h-4" />}
                      {activity.action === 'Started' && <Play className="w-4 h-4" />}
                      {activity.action === 'Practiced' && <Mic className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800">{activity.lesson}</span>
                        {activity.score && (
                          <Badge variant="secondary" className={cn(
                            "text-xs",
                            activity.score >= 90 ? "bg-green-100 text-green-700" :
                            activity.score >= 80 ? "bg-blue-100 text-blue-700" :
                            "bg-yellow-100 text-yellow-700"
                          )}>
                            {activity.score}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{activity.action} • {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommended Next Steps */}
          <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <ThumbsUp className="w-12 h-12 mx-auto mb-3 opacity-90" />
                <h3 className="text-xl font-bold mb-2">Ready for Your Next Lesson?</h3>
                <p className="text-blue-100">
                  Based on your progress, we recommend continuing with:
                </p>
              </div>
              
              <div className="bg-white/10 rounded-lg p-4 mb-4 backdrop-blur-sm">
                <h4 className="font-bold text-lg mb-2">Business Meeting Practice</h4>
                <p className="text-blue-200 text-sm mb-3">
                  Practice professional communication for workplace scenarios
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span>Intermediate Level</span>
                  <span>25 min</span>
                </div>
              </div>
              
              <Button className="w-full bg-white text-blue-600 hover:bg-gray-100 font-semibold">
                <Play className="w-4 h-4 mr-2" />
                Start Recommended Lesson
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdultsPage;