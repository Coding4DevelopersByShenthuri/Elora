import { useState } from 'react';
import { 
  Play, Volume2, Mic, CheckCircle, Clock, Users, 
  Target, Award, BookOpen, MessageCircle, Repeat, Zap, TrendingUp,
  ArrowRight
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
      color: 'from-blue-500 to-cyan-500',
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
      color: 'from-emerald-500 to-green-500',
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
      color: 'from-violet-500 to-purple-500',
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
      color: 'from-amber-500 to-orange-500',
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
      color: 'from-rose-500 to-pink-500',
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
      color: 'from-indigo-500 to-blue-500',
      skills: ['Location Terms', 'Direction Giving', 'Transportation']
    }
  ];

  const quickActions = [
    {
      title: "Speech Practice",
      description: "AI-powered pronunciation and fluency training",
      icon: Mic,
      color: "bg-blue-500",
      gradient: "from-blue-500 to-cyan-500",
      link: "/practice/speaking"
    },
    {
      title: "Listening Comprehension",
      description: "Enhance auditory skills with native speaker content",
      icon: Volume2,
      color: "bg-emerald-500",
      gradient: "from-emerald-500 to-green-500",
      link: "/practice/listening"
    },
    {
      title: "Conversation Practice",
      description: "Real-time dialogue practice with AI conversation partner",
      icon: MessageCircle,
      color: "bg-violet-500",
      gradient: "from-violet-500 to-purple-500",
      link: "/practice/conversation"
    },
    {
      title: "Knowledge Review",
      description: "Reinforce learning with spaced repetition system",
      icon: Repeat,
      color: "bg-amber-500",
      gradient: "from-amber-500 to-orange-500",
      link: "/practice/review"
    }
  ];

  const stats = [
    { 
      label: "Vocabulary Mastered", 
      value: "156", 
      icon: BookOpen, 
      color: "text-blue-500",
      description: "Active words and phrases"
    },
    { 
      label: "Speaking Practice", 
      value: "45 min", 
      icon: Mic, 
      color: "text-emerald-500",
      description: "This week's practice"
    },
    { 
      label: "Learning Streak", 
      value: `${streak} days`, 
      icon: Zap, 
      color: "text-amber-500",
      description: "Consistent progress"
    },
    { 
      label: "Modules Completed", 
      value: "3/6", 
      icon: Award, 
      color: "text-violet-500",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 pb-20 pt-32">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-xl blur-md opacity-30 animate-pulse"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Foundation English
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6 leading-relaxed">
            Build essential communication skills with structured, professional learning pathways
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 px-4 py-1">
              <Clock className="w-3 h-3 mr-2" />
              Flexible Scheduling
            </Badge>
            <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 px-4 py-1">
              <Users className="w-3 h-3 mr-2" />
              Professional Context
            </Badge>
            <Badge variant="secondary" className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800 px-4 py-1">
              <Volume2 className="w-3 h-3 mr-2" />
              Speech Recognition
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
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Learning Journey</h3>
                  <p className="text-gray-600 dark:text-gray-400">Track your progress through foundation modules</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{progress}%</div>
                  <div className="text-gray-600 dark:text-gray-400">Overall Mastery</div>
                </div>
              </div>

              <Progress value={progress} className="h-3 bg-gray-100 dark:bg-gray-700 mb-8">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" />
              </Progress>

              {/* Weekly Goal */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">Weekly Learning Goal</span>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">3/5 sessions</span>
                </div>
                <Progress value={60} className="h-2 bg-blue-100 dark:bg-blue-900/30">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full" />
                </Progress>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Learning Metrics</h3>
              <div className="space-y-6">
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
            </CardContent>
          </Card>
        </div>

        {/* Practice Labs */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Practice Labs</h2>
              <p className="text-gray-600 dark:text-gray-400">Interactive exercises to reinforce your learning</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card 
                  key={index} 
                  className="group cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 shadow-sm hover:shadow-lg"
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
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 group-hover:border-blue-300"
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
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                className={cn(
                  "rounded-xl px-6 py-3 font-medium transition-all duration-300 border-2",
                  activeTab === tab.id 
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg border-transparent" 
                    : "bg-white/80 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 text-gray-700 dark:text-gray-300 hover:shadow-md"
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="w-4 h-4 mr-3" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Learning Modules Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Learning Modules</h2>
              <p className="text-gray-600 dark:text-gray-400">Structured curriculum for foundational English mastery</p>
            </div>
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
              {completedLessons.length}/{lessons.length} Completed
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson, index) => (
              <Card 
                key={index} 
                className={cn(
                  "group cursor-pointer border-2 transition-all duration-500 bg-white dark:bg-gray-800 hover:shadow-xl overflow-hidden",
                  lesson.completed 
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
                    lesson.color,
                    isHovered === index && "brightness-110"
                  )}>
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
                  <div className="p-6">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <span className="flex items-center gap-2 font-medium">
                        <Clock className="w-4 h-4" />
                        {lesson.duration}
                      </span>
                      <span className="flex items-center gap-2 font-medium">
                        <BookOpen className="w-4 h-4" />
                        {lesson.words} terms
                      </span>
                      <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs">
                        {lesson.level}
                      </Badge>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1 mb-6">
                      {lesson.skills.map((skill, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button 
                      className={cn(
                        "w-full font-semibold py-3 rounded-xl transition-all duration-300 group-hover:shadow-lg relative overflow-hidden",
                        lesson.completed
                          ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
                          : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
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
        <Card className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-xl overflow-hidden">
          <CardContent className="p-8 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            
            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Excellent Progress!</h3>
              <p className="text-blue-100 text-lg mb-6 leading-relaxed">
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
  );
};

export default BeginnersPage;