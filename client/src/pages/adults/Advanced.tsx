// src/pages/adults/Advanced.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, Volume2, Mic, CheckCircle, Clock, Users, 
  Target, Award, BookOpen, MessageCircle, Repeat, 
  Star, ChevronRight, Shield, Zap, TrendingUp,
  Brain, Languages, GitMerge, ThumbsUp, BarChart3,
  Video, Headphones, PenTool, Globe, Trophy, Crown,
  Lightbulb, GitBranch, Sparkles, TargetIcon,
  BarChart, Globe2, Mic2, BookOpenCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const AdvancedPage = () => {
  const [activeModule, setActiveModule] = useState('mastery');
  const [progress, setProgress] = useState(85);
  const [streak, setStreak] = useState(28);
  const [fluencyScore, setFluencyScore] = useState(89);
  const [vocabularySize, setVocabularySize] = useState(2850);

  const modules = [
    { id: 'mastery', label: 'Language Mastery', icon: Crown },
    { id: 'professional', label: 'Professional', icon: Trophy },
    { id: 'academic', label: 'Academic', icon: BookOpenCheck },
    { id: 'cultural', label: 'Cultural Fluency', icon: Globe2 },
  ];

  const masteryLessons = [
    {
      title: "Advanced Debates & Persuasion",
      description: "Master the art of persuasive speaking and complex argumentation",
      duration: '35 min',
      level: 'Advanced',
      focus: 'Persuasive Techniques',
      completed: true,
      icon: '💎',
      color: 'from-purple-500 to-indigo-500',
      skills: ['Rhetorical Devices', 'Counter-arguments', 'Emotional Appeal'],
      complexity: 'High'
    },
    {
      title: "Idioms & Native Expressions",
      description: "Incorporate advanced idioms and colloquial expressions naturally",
      duration: '30 min',
      level: 'Advanced',
      focus: 'Native Fluency',
      completed: true,
      icon: '🎯',
      color: 'from-orange-500 to-red-500',
      skills: ['Cultural Context', 'Appropriate Usage', 'Nuanced Meaning'],
      complexity: 'High'
    },
    {
      title: "Advanced Storytelling",
      description: "Craft and deliver compelling narratives with emotional impact",
      duration: '40 min',
      level: 'Advanced',
      focus: 'Narrative Excellence',
      completed: false,
      icon: '📖',
      color: 'from-green-500 to-teal-500',
      skills: ['Plot Development', 'Character Voices', 'Suspense Building'],
      complexity: 'Very High'
    },
    {
      title: "Sophisticated Humor & Wit",
      description: "Understand and use advanced humor, sarcasm, and wit appropriately",
      duration: '32 min',
      level: 'Advanced',
      focus: 'Cultural Intelligence',
      completed: false,
      icon: '🎭',
      color: 'from-pink-500 to-rose-500',
      skills: ['Timing', 'Context Awareness', 'Delivery'],
      complexity: 'Very High'
    }
  ];

  const professionalLessons = [
    {
      title: "Executive Presentations",
      description: "Deliver powerful presentations to senior leadership and stakeholders",
      duration: '45 min',
      level: 'Advanced',
      focus: 'Leadership Communication',
      completed: false,
      icon: '👔',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: "Negotiation Mastery",
      description: "Advanced negotiation techniques and diplomatic language",
      duration: '38 min',
      level: 'Advanced',
      focus: 'Strategic Communication',
      completed: false,
      icon: '🤝',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  const challengeActivities = [
    {
      title: "Real-time Debate Arena",
      description: "Live debates on complex topics with AI opponents",
      icon: GitBranch,
      color: "bg-purple-500",
      time: "25-35 min",
      type: "Competitive",
      difficulty: "Expert"
    },
    {
      title: "Press Conference Simulation",
      description: "Handle tough questions and press interactions",
      icon: Mic2,
      color: "bg-red-500",
      time: "30 min",
      type: "Professional",
      difficulty: "Expert"
    },
    {
      title: "Cultural Ambassador",
      description: "Explain complex cultural concepts to international audiences",
      icon: Globe,
      color: "bg-green-500",
      time: "35 min",
      type: "Diplomatic",
      difficulty: "Advanced"
    },
    {
      title: "Improvised Speaking",
      description: "Speak spontaneously on unexpected topics",
      icon: Sparkles,
      color: "bg-orange-500",
      time: "20 min",
      type: "Creative",
      difficulty: "Very High"
    }
  ];

  const stats = [
    { 
      label: "Fluency Mastery", 
      value: `${fluencyScore}%`, 
      icon: Crown, 
      color: "text-purple-500",
      description: "Near-native fluency level"
    },
    { 
      label: "Vocabulary Size", 
      value: `${vocabularySize}+`, 
      icon: BookOpen, 
      color: "text-blue-500",
      description: "Advanced word knowledge"
    },
    { 
      label: "Cultural IQ", 
      value: "82%", 
      icon: Globe, 
      color: "text-green-500",
      description: "Cultural context understanding"
    },
    { 
      label: "Current Streak", 
      value: `${streak} days`, 
      icon: Zap, 
      color: "text-orange-500",
      description: "Elite consistency"
    },
  ];

  const masteryMetrics = [
    { skill: "Advanced Vocabulary", progress: 88, target: 95 },
    { skill: "Grammatical Precision", progress: 92, target: 98 },
    { skill: "Pronunciation Excellence", progress: 85, target: 95 },
    { skill: "Cultural Appropriateness", progress: 82, target: 90 },
    { skill: "Speaking Confidence", progress: 89, target: 95 },
  ];

  const achievements = [
    { name: "Debate Champion", earned: true, icon: Trophy, color: "text-yellow-500" },
    { name: "Vocabulary Virtuoso", earned: true, icon: Languages, color: "text-blue-500" },
    { name: "Cultural Ambassador", earned: false, icon: Globe, color: "text-green-500" },
    { name: "Presentation Pro", earned: false, icon: Mic2, color: "text-purple-500" },
  ];

  const handleStartChallenge = (challengeIndex: number) => {
    // Simulate progress update for advanced challenges
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-20 pt-32">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Crown className="w-10 h-10 text-yellow-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
              Advanced English Mastery
            </h1>
          </div>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-4">
            Achieve near-native fluency with sophisticated language, cultural intelligence, and professional excellence
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
              <Crown className="w-3 h-3 mr-1" />
              Elite Level
            </Badge>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              <Lightbulb className="w-3 h-3 mr-1" />
              Sophisticated Content
            </Badge>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              <TargetIcon className="w-3 h-3 mr-1" />
              Professional Excellence
            </Badge>
          </div>
        </div>

        {/* Elite Progress Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Mastery Progress */}
          <Card className="lg:col-span-2 bg-slate-800/60 backdrop-blur-sm border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-white">Mastery Journey</h3>
                  <p className="text-sm text-gray-400">From advanced to near-native proficiency</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-yellow-400">{progress}%</div>
                  <div className="text-sm text-gray-400">Mastery Progress</div>
                </div>
              </div>
              <Progress value={progress} className="h-3 bg-slate-700 mb-8">
                <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500" />
              </Progress>
              
              {/* Mastery Metrics */}
              <div className="space-y-4">
                {masteryMetrics.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-300">{metric.skill}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Target: {metric.target}%</span>
                        <span className="text-sm font-medium text-white w-12 text-right">{metric.progress}%</span>
                      </div>
                    </div>
                    <Progress value={metric.progress} className="w-full h-2 bg-slate-700">
                      <div className={cn(
                        "h-full rounded-full transition-all duration-500",
                        metric.progress >= metric.target ? "bg-green-500" : "bg-gradient-to-r from-yellow-500 to-orange-500"
                      )} />
                    </Progress>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Elite Stats & Achievements */}
          <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-700">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Elite Performance</h3>
              
              {/* Stats */}
              <div className="space-y-4 mb-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg bg-slate-700/50", stat.color)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-baseline">
                          <span className="text-sm font-medium text-gray-300">{stat.label}</span>
                          <span className="text-lg font-bold text-white">{stat.value}</span>
                        </div>
                        <p className="text-xs text-gray-400">{stat.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Achievements */}
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Elite Achievements</h4>
                <div className="grid grid-cols-2 gap-2">
                  {achievements.map((achievement, index) => {
                    const Icon = achievement.icon;
                    return (
                      <div key={index} className={cn(
                        "p-2 rounded-lg text-center border transition-all duration-300",
                        achievement.earned 
                          ? "bg-green-500/10 border-green-500/30 text-green-300" 
                          : "bg-slate-700/30 border-slate-600 text-gray-500"
                      )}>
                        <Icon className={cn("w-4 h-4 mx-auto mb-1", achievement.color)} />
                        <div className="text-xs font-medium">{achievement.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Elite Challenge Activities */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {challengeActivities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <Card 
                key={index} 
                className="group cursor-pointer border border-slate-700 hover:border-yellow-500/50 hover:shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300 bg-slate-800/40 backdrop-blur-sm"
              >
                <CardContent className="p-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-3 text-white", activity.color)}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-white text-lg">{activity.title}</h4>
                    <Badge variant="outline" className={cn(
                      "text-xs border-0",
                      activity.difficulty === "Expert" ? "bg-red-500/20 text-red-300" :
                      activity.difficulty === "Very High" ? "bg-orange-500/20 text-orange-300" :
                      "bg-yellow-500/20 text-yellow-300"
                    )}>
                      {activity.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{activity.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="bg-slate-700/50 text-gray-300 text-xs">
                      {activity.time}
                    </Badge>
                    <Badge variant="outline" className="bg-slate-600/50 text-gray-300 text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold"
                    onClick={() => handleStartChallenge(index)}
                  >
                    <TargetIcon className="w-4 h-4 mr-2" />
                    Accept Challenge
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Mastery Modules */}
        <Tabs defaultValue="mastery" className="mb-8">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/60 backdrop-blur-sm border border-slate-700 p-1 rounded-lg">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <TabsTrigger 
                  key={module.id}
                  value={module.id}
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white text-gray-300"
                  onClick={() => setActiveModule(module.id)}
                >
                  <Icon className="w-4 h-4" />
                  {module.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Elite Lessons Grid */}
          <TabsContent value={activeModule} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getCurrentLessons().map((lesson, index) => (
                <Card 
                  key={index} 
                  className={cn(
                    "group cursor-pointer border-2 transition-all duration-300 bg-slate-800/40 backdrop-blur-sm hover:shadow-2xl hover:shadow-purple-500/10",
                    lesson.completed 
                      ? "border-green-500/30 hover:border-green-400/50" 
                      : "border-slate-700 hover:border-yellow-500/50"
                  )}
                >
                  <CardContent className="p-0 overflow-hidden rounded-xl">
                    <div className={cn("p-6 text-white bg-gradient-to-br", lesson.color)}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-3xl">{lesson.icon}</div>
                        <div className="flex items-center gap-2">
                          {lesson.completed && (
                            <CheckCircle className="w-6 h-6 text-green-300" />
                          )}
                          <Badge variant="secondary" className="bg-black/30 text-white border-0">
                            {lesson.complexity}
                          </Badge>
                        </div>
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
                      <div className="flex justify-between text-sm text-gray-400 mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {lesson.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {lesson.focus}
                        </span>
                        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-0 text-xs">
                          {lesson.level}
                        </Badge>
                      </div>
                      
                      <Button 
                        className={cn(
                          "w-full font-semibold py-3 rounded-lg transition-all duration-300 group-hover:scale-105",
                          lesson.completed
                            ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white"
                            : "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white"
                        )}
                        onClick={() => handleStartChallenge(index)}
                      >
                        {lesson.completed ? (
                          <>
                            <Crown className="w-4 h-4 mr-2" />
                            Master Again
                          </>
                        ) : (
                          <>
                            <TargetIcon className="w-4 h-4 mr-2" />
                            Begin Mastery
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

        {/* Elite Certification Section */}
        <Card className="bg-gradient-to-r from-yellow-600 via-orange-600 to-pink-600 text-white">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-90" />
              <h3 className="text-3xl font-bold mb-2">Advanced English Certification</h3>
              <p className="text-yellow-100 text-lg max-w-2xl mx-auto">
                Earn your elite certification by completing all advanced modules and demonstrating near-native proficiency
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20">
                <BarChart className="w-10 h-10 mx-auto mb-3" />
                <h4 className="font-bold text-lg mb-2">Comprehensive Assessment</h4>
                <p className="text-yellow-200 text-sm">Rigorous testing across all language domains</p>
              </div>
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20">
                <Globe2 className="w-10 h-10 mx-auto mb-3" />
                <h4 className="font-bold text-lg mb-2">Global Recognition</h4>
                <p className="text-yellow-200 text-sm">Internationally recognized certification</p>
              </div>
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20">
                <Sparkles className="w-10 h-10 mx-auto mb-3" />
                <h4 className="font-bold text-lg mb-2">Elite Community</h4>
                <p className="text-yellow-200 text-sm">Join top-tier English speakers worldwide</p>
              </div>
            </div>
            <div className="text-center mt-6">
              <Button 
                size="lg" 
                className="bg-white text-orange-600 hover:bg-gray-100 font-bold px-8 py-3 text-lg"
              >
                <Crown className="w-5 h-5 mr-2" />
                Start Certification Journey
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedPage;