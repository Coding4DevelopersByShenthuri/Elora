// src/pages/adults/Intermediates.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, Volume2, Mic, CheckCircle, Clock, Users, 
  Target, Award, BookOpen, MessageCircle, Repeat, 
  Star, ChevronRight, Shield, Zap, TrendingUp,
  Brain, Languages, GitMerge, ThumbsUp, BarChart3,
  Video, Headphones, PenTool, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const IntermediatesPage = () => {
  const [activeModule, setActiveModule] = useState('conversation');
  const [progress, setProgress] = useState(65);
  const [streak, setStreak] = useState(12);
  const [fluencyScore, setFluencyScore] = useState(72);

  const modules = [
    { id: 'conversation', label: 'Conversation', icon: MessageCircle },
    { id: 'grammar', label: 'Grammar', icon: Brain },
    { id: 'vocabulary', label: 'Vocabulary', icon: Languages },
    { id: 'pronunciation', label: 'Pronunciation', icon: Mic },
  ];

  const conversationLessons = [
    {
      title: "Business Meetings",
      description: "Participate confidently in professional meetings and discussions",
      duration: '25 min',
      level: 'Intermediate',
      focus: 'Professional Communication',
      completed: true,
      icon: '💼',
      color: 'from-blue-500 to-cyan-500',
      skills: ['Formal Language', 'Presentation', 'Negotiation']
    },
    {
      title: "Social Gatherings",
      description: "Navigate parties and social events with natural conversation",
      duration: '20 min',
      level: 'Intermediate',
      focus: 'Casual Communication',
      completed: true,
      icon: '🎉',
      color: 'from-purple-500 to-pink-500',
      skills: ['Small Talk', 'Storytelling', 'Cultural References']
    },
    {
      title: "Problem Solving",
      description: "Discuss and resolve issues in various contexts",
      duration: '30 min',
      level: 'Intermediate',
      focus: 'Critical Thinking',
      completed: false,
      icon: '🔧',
      color: 'from-orange-500 to-red-500',
      skills: ['Analytical Talk', 'Suggestions', 'Decision Making']
    },
    {
      title: "Cultural Topics",
      description: "Discuss movies, books, and cultural events fluently",
      duration: '28 min',
      level: 'Intermediate',
      focus: 'Cultural Literacy',
      completed: false,
      icon: '🎬',
      color: 'from-green-500 to-emerald-500',
      skills: ['Opinions', 'Analysis', 'Comparative Language']
    }
  ];

  const grammarLessons = [
    {
      title: "Conditional Sentences",
      description: "Master if-clauses and hypothetical situations",
      duration: '22 min',
      level: 'Intermediate',
      focus: 'Complex Grammar',
      completed: true,
      icon: '🔀',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      title: "Reported Speech",
      description: "Learn to report what others have said accurately",
      duration: '25 min',
      level: 'Intermediate',
      focus: 'Indirect Speech',
      completed: false,
      icon: '🗣️',
      color: 'from-teal-500 to-blue-500'
    }
  ];

  const practiceActivities = [
    {
      title: "Role-Play Scenarios",
      description: "Practice real-life situations with AI partners",
      icon: Users,
      color: "bg-blue-500",
      time: "15-20 min",
      type: "Interactive"
    },
    {
      title: "Debate Practice",
      description: "Argue different viewpoints on current topics",
      icon: GitMerge,
      color: "bg-purple-500",
      time: "20-25 min",
      type: "Advanced"
    },
    {
      title: "Story Building",
      description: "Create and narrate stories collaboratively",
      icon: PenTool,
      color: "bg-green-500",
      time: "15 min",
      type: "Creative"
    },
    {
      title: "Accent Training",
      description: "Improve pronunciation and intonation",
      icon: Headphones,
      color: "bg-orange-500",
      time: "10-15 min",
      type: "Technical"
    }
  ];

  const stats = [
    { 
      label: "Fluency Score", 
      value: `${fluencyScore}%`, 
      icon: TrendingUp, 
      color: "text-blue-500",
      description: "Speaking fluency and flow"
    },
    { 
      label: "Vocabulary Size", 
      value: "1,240", 
      icon: BookOpen, 
      color: "text-green-500",
      description: "Active words in use"
    },
    { 
      label: "Grammar Accuracy", 
      value: "78%", 
      icon: Brain, 
      color: "text-purple-500",
      description: "Sentence structure accuracy"
    },
    { 
      label: "Current Streak", 
      value: `${streak} days`, 
      icon: Zap, 
      color: "text-orange-500",
      description: "Consistent practice days"
    },
  ];

  const skillsProgress = [
    { skill: "Conversation Flow", progress: 75 },
    { skill: "Grammar Accuracy", progress: 78 },
    { skill: "Vocabulary Range", progress: 70 },
    { skill: "Pronunciation", progress: 65 },
    { skill: "Listening Comprehension", progress: 82 },
  ];

  const handleStartLesson = (lessonIndex: number) => {
    // Simulate progress update
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50 pb-20 pt-32">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Globe className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Intermediate English
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            Build fluency and confidence with complex conversations and advanced grammar
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <Brain className="w-3 h-3 mr-1" />
              Advanced Grammar
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              <MessageCircle className="w-3 h-3 mr-1" />
              Complex Conversations
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <Languages className="w-3 h-3 mr-1" />
              Expanded Vocabulary
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
                  <h3 className="text-xl font-semibold text-gray-800">Intermediate Progress</h3>
                  <p className="text-sm text-gray-600">Master complex language structures and fluent conversations</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-600">{progress}%</div>
                  <div className="text-sm text-gray-500">Module Completion</div>
                </div>
              </div>
              <Progress value={progress} className="h-3 bg-gray-200 mb-6">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500" />
              </Progress>
              
              {/* Skills Progress */}
              <div className="space-y-3">
                {skillsProgress.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{skill.skill}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={skill.progress} className="w-24 h-2 bg-gray-200">
                        <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
                      </Progress>
                      <span className="text-xs font-medium text-gray-600 w-8">{skill.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Performance</h3>
              <div className="space-y-4">
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
            </CardContent>
          </Card>
        </div>

        {/* Practice Activities */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {practiceActivities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <Card 
                key={index} 
                className="group cursor-pointer border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm"
              >
                <CardContent className="p-4">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-white", activity.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">{activity.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {activity.time}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="conversation" className="mb-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border border-gray-200 p-1 rounded-lg">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <TabsTrigger 
                  key={module.id}
                  value={module.id}
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
                  onClick={() => setActiveModule(module.id)}
                >
                  <Icon className="w-4 h-4" />
                  {module.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Lessons Grid */}
          <TabsContent value={activeModule} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getCurrentLessons().map((lesson, index) => (
                <Card 
                  key={index} 
                  className={cn(
                    "group cursor-pointer border-2 transition-all duration-300 bg-white/90 backdrop-blur-sm hover:shadow-lg",
                    lesson.completed 
                      ? "border-green-200 hover:border-green-300" 
                      : "border-gray-200 hover:border-purple-300"
                  )}
                >
                  <CardContent className="p-0 overflow-hidden rounded-xl">
                    <div className={cn("p-6 text-white bg-gradient-to-br", lesson.color)}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-3xl">{lesson.icon}</div>
                        {lesson.completed && (
                          <CheckCircle className="w-6 h-6 text-green-300" />
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{lesson.title}</h3>
                      <p className="text-white/90 text-sm mb-3">{lesson.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {lesson.skills?.map((skill, skillIndex) => (
                          <Badge key={skillIndex} variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {lesson.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {lesson.focus}
                        </span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                          {lesson.level}
                        </Badge>
                      </div>
                      
                      <Button 
                        className={cn(
                          "w-full font-semibold py-2 rounded-lg transition-all duration-300 group-hover:scale-105",
                          lesson.completed
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                            : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                        )}
                        onClick={() => handleStartLesson(index)}
                      >
                        {lesson.completed ? (
                          <>
                            <Repeat className="w-4 h-4 mr-2" />
                            Practice Again
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Start Lesson
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Advanced Features Section */}
        <Card className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <GitMerge className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <h3 className="text-2xl font-bold mb-2">Ready for Advanced Challenges?</h3>
              <p className="text-purple-100 text-lg">
                Take your English to the next level with complex debates, professional presentations, and cultural discussions
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Video className="w-8 h-8 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Video Analysis</h4>
                <p className="text-purple-200 text-sm">Analyze real conversations</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Progress Analytics</h4>
                <p className="text-purple-200 text-sm">Detailed performance insights</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <ThumbsUp className="w-8 h-8 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Peer Feedback</h4>
                <p className="text-purple-200 text-sm">Learn from community input</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntermediatesPage;