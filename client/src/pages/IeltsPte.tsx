// src/pages/IeltsPte.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, Clock, Target, Award, BookOpen, MessageCircle, 
  Mic, Volume2, CheckCircle, Star, TrendingUp, Zap,
  Calendar, BarChart3, FileText, Timer, Shield,
  GraduationCap, Globe, Users, Lightbulb, Crown,
  Download, RotateCcw, Eye, PieChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const IeltsPtePage = () => {
  const [activeTest, setActiveTest] = useState('ielts');
  const [activeSection, setActiveSection] = useState('speaking');
  const [mockTestProgress, setMockTestProgress] = useState(65);
  const [targetScore, setTargetScore] = useState(7.5);
  const [currentScore, setCurrentScore] = useState(6.5);

  const testTypes = [
    { id: 'ielts', label: 'IELTS Academic', icon: GraduationCap, color: 'from-blue-500 to-cyan-500' },
    { id: 'pte', label: 'PTE Academic', icon: Globe, color: 'from-green-500 to-emerald-500' },
  ];

  const sections = [
    { id: 'speaking', label: 'Speaking', icon: Mic, color: 'bg-purple-500' },
    { id: 'writing', label: 'Writing', icon: FileText, color: 'bg-blue-500' },
    { id: 'reading', label: 'Reading', icon: BookOpen, color: 'bg-green-500' },
    { id: 'listening', label: 'Listening', icon: Volume2, color: 'bg-orange-500' },
  ];

  const speakingTests = [
    {
      title: "Full Speaking Test",
      description: "Complete IELTS/PTE speaking test with all parts",
      duration: '15 min',
      parts: '3 Parts',
      questions: 12,
      completed: true,
      score: 7.0,
      feedback: true,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: "Part 2 - Long Turn",
      description: "Practice individual long turn speaking tasks",
      duration: '4 min',
      parts: 'Cue Cards',
      questions: 5,
      completed: true,
      score: 6.5,
      feedback: true,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: "Part 3 - Discussion",
      description: "Advanced discussion on abstract topics",
      duration: '6 min',
      parts: 'Deep Discussion',
      questions: 8,
      completed: false,
      score: null,
      feedback: false,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: "Pronunciation Focus",
      description: "Targeted practice for pronunciation and fluency",
      duration: '10 min',
      parts: 'Drills & Practice',
      questions: 15,
      completed: false,
      score: null,
      feedback: false,
      color: 'from-orange-500 to-red-500'
    }
  ];

  const writingTests = [
    {
      title: "Task 2 - Essay Writing",
      description: "Practice academic essay writing with AI evaluation",
      duration: '40 min',
      words: '250+',
      topics: 8,
      completed: true,
      score: 6.5,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      title: "Task 1 - Report/Letter",
      description: "Data interpretation or formal letter writing",
      duration: '20 min',
      words: '150+',
      topics: 6,
      completed: false,
      score: null,
      color: 'from-teal-500 to-blue-500'
    }
  ];

  const performanceMetrics = [
    { skill: 'Fluency & Coherence', score: 7.0, target: 7.5, improvement: '+0.5' },
    { skill: 'Lexical Resource', score: 6.5, target: 7.5, improvement: '+1.0' },
    { skill: 'Grammatical Range', score: 7.0, target: 7.5, improvement: '+0.5' },
    { skill: 'Pronunciation', score: 6.0, target: 7.0, improvement: '+1.0' },
  ];

  const quickPractice = [
    {
      title: "Cue Card Practice",
      description: "Quick 2-minute speaking prompts",
      icon: MessageCircle,
      time: '2 min',
      type: 'Speaking',
      count: '25+ cards'
    },
    {
      title: "Essay Outlines",
      description: "Plan and structure essays quickly",
      icon: FileText,
      time: '5 min',
      type: 'Writing',
      count: '15+ topics'
    },
    {
      title: "Listening Drills",
      description: "Short audio comprehension exercises",
      icon: Volume2,
      time: '3 min',
      type: 'Listening',
      count: '30+ clips'
    },
    {
      title: "Reading Skimming",
      description: "Rapid reading comprehension practice",
      icon: BookOpen,
      time: '4 min',
      type: 'Reading',
      count: '20+ passages'
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
      color: "text-green-500",
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
      label: "Study Streak", 
      value: "16 days", 
      icon: Zap, 
      color: "text-orange-500",
      description: "Consistent practice"
    },
  ];

  const handleStartTest = (testIndex: number) => {
    // Simulate test completion and score improvement
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
    if (score >= 8.0) return 'text-green-600';
    if (score >= 7.0) return 'text-blue-600';
    if (score >= 6.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 pb-20 pt-32">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Shield className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              IELTS & PTE Preparation
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-4">
            Comprehensive test preparation with AI-powered feedback and realistic exam simulation
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <Timer className="w-3 h-3 mr-1" />
              Timed Tests
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <Mic className="w-3 h-3 mr-1" />
              AI Speaking Evaluation
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              <FileText className="w-3 h-3 mr-1" />
              Writing Assessment
            </Badge>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              <Download className="w-3 h-3 mr-1" />
              Exportable Reports
            </Badge>
          </div>
        </div>

        {/* Test Type Selection */}
        <div className="flex justify-center mb-8">
          <Tabs defaultValue="ielts" className="w-full max-w-2xl">
            <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm border border-gray-200 p-1 rounded-xl">
              {testTypes.map((test) => {
                const Icon = test.icon;
                return (
                  <TabsTrigger 
                    key={test.id}
                    value={test.id}
                    className={cn(
                      "flex items-center gap-3 py-3 text-lg font-semibold data-[state=active]:text-white",
                      `data-[state=active]:bg-gradient-to-r ${test.color}`
                    )}
                    onClick={() => setActiveTest(test.id)}
                  >
                    <Icon className="w-5 h-5" />
                    {test.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Progress Card */}
          <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {activeTest === 'ielts' ? 'IELTS' : 'PTE'} Preparation Progress
                  </h3>
                  <p className="text-sm text-gray-600">Your journey to achieving target scores</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{mockTestProgress}%</div>
                  <div className="text-sm text-gray-500">Preparation Complete</div>
                </div>
              </div>
              
              <Progress value={mockTestProgress} className="h-3 bg-gray-200 mb-8">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500" />
              </Progress>

              {/* Score Target */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{currentScore.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Current Score</div>
                </div>
                <div className="text-center">
                  <div className="text-lg text-gray-500">→</div>
                  <div className="text-xs text-gray-500">Target</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{targetScore.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Goal Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Stats */}
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Overview</h3>
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

        {/* Quick Practice Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickPractice.map((practice, index) => {
            const Icon = practice.icon;
            return (
              <Card 
                key={index} 
                className="group cursor-pointer border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm"
              >
                <CardContent className="p-4 text-center">
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-white", practice.icon === MessageCircle ? "bg-purple-500" : practice.icon === FileText ? "bg-blue-500" : practice.icon === Volume2 ? "bg-orange-500" : "bg-green-500")}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">{practice.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{practice.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>{practice.time}</span>
                    <span>{practice.count}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Start Practice
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Section Navigation & Tests */}
        <Tabs defaultValue="speaking" className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <TabsList className="grid w-full sm:w-auto grid-cols-2 lg:grid-cols-4 bg-white/80 backdrop-blur-sm border border-gray-200 p-1 rounded-lg">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <TabsTrigger 
                    key={section.id}
                    value={section.id}
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
                    onClick={() => setActiveSection(section.id)}
                  >
                    <Icon className="w-4 h-4" />
                    {section.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
            
            <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Full Test
            </Button>
          </div>

          {/* Tests Grid */}
          <TabsContent value={activeSection} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getCurrentTests().map((test, index) => (
                <Card 
                  key={index} 
                  className={cn(
                    "group cursor-pointer border-2 transition-all duration-300 bg-white/90 backdrop-blur-sm hover:shadow-lg",
                    test.completed 
                      ? "border-green-200 hover:border-green-300" 
                      : "border-gray-200 hover:border-blue-300"
                  )}
                >
                  <CardContent className="p-0 overflow-hidden rounded-xl">
                    <div className={cn("p-6 text-white bg-gradient-to-br", test.color)}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold mb-2">{test.title}</h3>
                          <p className="text-white/90 text-sm">{test.description}</p>
                        </div>
                        {test.completed && (
                          <CheckCircle className="w-6 h-6 text-green-300" />
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {test.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {test.parts}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {test.questions} Qs
                        </span>
                      </div>

                      {test.score && (
                        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">Last Score</span>
                          <div className="flex items-center gap-2">
                            <span className={cn("text-lg font-bold", getScoreColor(test.score))}>
                              {test.score}
                            </span>
                            {test.feedback && (
                              <Eye className="w-4 h-4 text-blue-500 cursor-pointer" />
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button 
                          className={cn(
                            "flex-1 font-semibold py-2 transition-all duration-300",
                            test.completed
                              ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                              : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                          )}
                          onClick={() => handleStartTest(index)}
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
                          <Button variant="outline" size="icon" className="border-blue-200 text-blue-600">
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Performance Analytics */}
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Detailed Performance Analysis</h3>
              <Button variant="outline" className="border-blue-200 text-blue-600">
                <PieChart className="w-4 h-4 mr-2" />
                View Full Report
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">{metric.skill}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Target: {metric.target}</span>
                      <span className={cn(
                        "text-sm font-bold",
                        metric.improvement.startsWith('+') ? "text-green-600" : "text-red-600"
                      )}>
                        {metric.improvement}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={(metric.score / metric.target) * 100} className="flex-1 h-2 bg-gray-200">
                      <div className={cn(
                        "h-full rounded-full transition-all duration-500",
                        metric.score >= metric.target ? "bg-green-500" : "bg-gradient-to-r from-blue-500 to-purple-500"
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

        {/* Exam Tips & Strategies */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white mt-8">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <h3 className="text-2xl font-bold mb-2">Exam Success Strategies</h3>
              <p className="text-blue-100 text-lg">
                Expert tips to maximize your {activeTest === 'ielts' ? 'IELTS' : 'PTE'} score
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Users className="w-8 h-8 mx-auto mb-2" />
                <h4 className="font-bold mb-1">Time Management</h4>
                <p className="text-blue-200 text-sm">Practice with strict timing for each section</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Star className="w-8 h-8 mx-auto mb-2" />
                <h4 className="font-bold mb-1">Score Optimization</h4>
                <p className="text-blue-200 text-sm">Focus on high-impact areas for maximum points</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Crown className="w-8 h-8 mx-auto mb-2" />
                <h4 className="font-bold mb-1">AI Feedback</h4>
                <p className="text-blue-200 text-sm">Get detailed analysis on speaking and writing</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IeltsPtePage;