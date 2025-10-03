import { useState } from 'react';
import { 
  Play, Mic, CheckCircle, Clock, Users, 
  Target, BookOpen, MessageCircle, Repeat, Zap, TrendingUp,
  Brain, Languages, GitMerge, ThumbsUp, BarChart3,
  Video, Headphones, PenTool, ArrowRight, Rocket} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const IntermediatesPage = () => {
  const [activeModule, setActiveModule] = useState('conversation');
  const [progress, setProgress] = useState(65);
  const [streak] = useState(12);
  const [fluencyScore, setFluencyScore] = useState(72);
  const [isHovered, setIsHovered] = useState<number | null>(null);
  const [] = useState('modules');

  const modules = [
    { id: 'conversation', label: 'Advanced Conversation', icon: MessageCircle, color: 'from-blue-500 to-cyan-500' },
    { id: 'grammar', label: 'Complex Grammar', icon: Brain, color: 'from-purple-500 to-pink-500' },
    { id: 'vocabulary', label: 'Professional Vocabulary', icon: Languages, color: 'from-emerald-500 to-green-500' },
    { id: 'pronunciation', label: 'Speech Refinement', icon: Mic, color: 'from-amber-500 to-orange-500' },
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
      color: 'from-blue-500 to-cyan-500',
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
      color: 'from-purple-500 to-pink-500',
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
      color: 'from-amber-500 to-orange-500',
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
      color: 'from-emerald-500 to-green-500',
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
      color: 'from-indigo-500 to-purple-500',
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
      color: 'from-teal-500 to-blue-500',
      skills: ['Speech Reporting', 'Tense Shifting', 'Context Adaptation'],
      progress: 75
    }
  ];

  const practiceActivities = [
    {
      title: "Role-Play Scenarios",
      description: "Professional simulations with AI-powered feedback",
      icon: Users,
      color: "bg-blue-500",
      gradient: "from-blue-500 to-cyan-500",
      time: "15-20 min",
      type: "Interactive",
      level: "Intermediate+"
    },
    {
      title: "Debate Practice",
      description: "Advanced argumentation and viewpoint development",
      icon: GitMerge,
      color: "bg-purple-500",
      gradient: "from-purple-500 to-pink-500",
      time: "20-25 min",
      type: "Advanced",
      level: "Intermediate+"
    },
    {
      title: "Story Building",
      description: "Creative narrative development and delivery",
      icon: PenTool,
      color: "bg-emerald-500",
      gradient: "from-emerald-500 to-green-500",
      time: "15 min",
      type: "Creative",
      level: "All Levels"
    },
    {
      title: "Accent Training",
      description: "Professional pronunciation and intonation refinement",
      icon: Headphones,
      color: "bg-amber-500",
      gradient: "from-amber-500 to-orange-500",
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
      description: "Speaking fluency and natural flow"
    },
    { 
      label: "Vocabulary Mastery", 
      value: "1,240", 
      icon: BookOpen, 
      color: "text-emerald-500",
      description: "Active professional vocabulary"
    },
    { 
      label: "Grammar Accuracy", 
      value: "78%", 
      icon: Brain, 
      color: "text-purple-500",
      description: "Complex structure proficiency"
    },
    { 
      label: "Learning Consistency", 
      value: `${streak} days`, 
      icon: Zap, 
      color: "text-amber-500",
      description: "Continuous progress streak"
    },
  ];

  const skillsProgress = [
    { skill: "Conversation Flow", progress: 75, color: "from-blue-500 to-cyan-500" },
    { skill: "Grammar Accuracy", progress: 78, color: "from-purple-500 to-pink-500" },
    { skill: "Vocabulary Range", progress: 70, color: "from-emerald-500 to-green-500" },
    { skill: "Pronunciation", progress: 65, color: "from-amber-500 to-orange-500" },
    { skill: "Listening Comprehension", progress: 82, color: "from-indigo-500 to-blue-500" },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 dark:from-slate-900 dark:via-blue-950/10 dark:to-purple-950/10 pb-20 pt-32">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-xl blur-md opacity-30 animate-pulse"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Intermediate Mastery
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6 leading-relaxed">
            Advance your English with complex conversations, professional vocabulary, and sophisticated communication skills
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 px-4 py-1">
              <Brain className="w-3 h-3 mr-2" />
              Advanced Grammar
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 px-4 py-1">
              <MessageCircle className="w-3 h-3 mr-2" />
              Professional Dialogue
            </Badge>
            <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 px-4 py-1">
              <Languages className="w-3 h-3 mr-2" />
              Expanded Vocabulary
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
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Advanced Progress Tracking</h3>
                  <p className="text-gray-600 dark:text-gray-400">Monitor your journey toward English mastery</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{progress}%</div>
                  <div className="text-gray-600 dark:text-gray-400">Overall Mastery</div>
                </div>
              </div>

              <Progress value={progress} className="h-3 bg-gray-100 dark:bg-gray-700 mb-8">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500" />
              </Progress>
              
              {/* Skills Progress */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Skill Development</h4>
                {skillsProgress.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{skill.skill}</span>
                    <div className="flex items-center gap-3">
                      <Progress value={skill.progress} className="w-32 h-2 bg-gray-100 dark:bg-gray-700">
                        <div className={cn("h-full rounded-full bg-gradient-to-r", skill.color)} />
                      </Progress>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-12">{skill.progress}%</span>
                    </div>
                  </div>
                ))}
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
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Certifications</h4>
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

        {/* Practice Labs */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Advanced Practice Labs</h2>
              <p className="text-gray-600 dark:text-gray-400">Interactive exercises for professional communication</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {practiceActivities.map((activity, index) => {
              const Icon = activity.icon;
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
                    
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">{activity.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{activity.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-700">
                        {activity.time}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                        {activity.level}
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

        {/* Learning Modules */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Learning Modules</h2>
              <p className="text-gray-600 dark:text-gray-400">Master complex language structures and professional communication</p>
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
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg border-transparent" 
                      : "bg-white/80 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 text-gray-700 dark:text-gray-300 hover:shadow-md"
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
                  "group cursor-pointer border-2 transition-all duration-500 bg-white dark:bg-gray-800 hover:shadow-xl overflow-hidden",
                  lesson.completed 
                    ? "border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-600" 
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
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
                        {lesson.completed && (
                          <CheckCircle className="w-6 h-6 text-emerald-300 animate-pulse" />
                        )}
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
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <span className="flex items-center gap-2 font-medium">
                        <Clock className="w-4 h-4" />
                        {lesson.duration}
                      </span>
                      <span className="flex items-center gap-2 font-medium">
                        <Target className="w-4 h-4" />
                        {lesson.focus}
                      </span>
                      <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs">
                        {lesson.level}
                      </Badge>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Module Progress</span>
                        <span className="font-medium text-gray-900 dark:text-white">{lesson.progress}%</span>
                      </div>
                      <Progress value={lesson.progress} className="h-2 bg-gray-100 dark:bg-gray-700">
                        <div className={cn("h-full rounded-full bg-gradient-to-r", lesson.color)} />
                      </Progress>
                    </div>
                    
                    <Button 
                      className={cn(
                        "w-full font-semibold py-3 rounded-xl transition-all duration-300 group-hover:shadow-lg relative overflow-hidden",
                        lesson.completed
                          ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
                          : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
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
        <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl overflow-hidden">
          <CardContent className="p-8 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            
            <div className="relative z-10 text-center max-w-4xl mx-auto">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Ready for Advanced Challenges?</h3>
              <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                Elevate your English to professional levels with complex debates, executive presentations, and sophisticated cultural discussions
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/15">
                  <Video className="w-8 h-8 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Video Analysis</h4>
                  <p className="text-blue-200 text-sm">Analyze authentic professional conversations</p>
                </div>
                <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/15">
                  <BarChart3 className="w-8 h-8 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Advanced Analytics</h4>
                  <p className="text-blue-200 text-sm">Detailed performance insights and growth tracking</p>
                </div>
                <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/15">
                  <ThumbsUp className="w-8 h-8 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Expert Feedback</h4>
                  <p className="text-blue-200 text-sm">Professional coaching and community insights</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntermediatesPage;