// src/pages/adults/Beginners.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, Volume2, Mic, CheckCircle, Clock, Users, 
  Target, Award, BookOpen, MessageCircle, Repeat, 
  Star, ChevronRight, Shield, Zap, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const BeginnersPage = () => {
  const [activeTab, setActiveTab] = useState('lessons');
  const [currentLesson, setCurrentLesson] = useState(0);
  const [progress, setProgress] = useState(35);
  const [streak, setStreak] = useState(5);
  const [completedLessons, setCompletedLessons] = useState([0, 1, 2]);

  const tabs = [
    { id: 'lessons', label: 'Lessons', icon: BookOpen },
    { id: 'practice', label: 'Practice', icon: MessageCircle },
    { id: 'vocabulary', label: 'Vocabulary', icon: Target },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
  ];

  const lessons = [
    {
      title: "Greetings & Introductions",
      description: "Learn basic greetings and how to introduce yourself",
      duration: '15 min',
      level: 'Beginner',
      words: 25,
      completed: true,
      icon: '👋',
      color: 'from-blue-400 to-cyan-400'
    },
    {
      title: "Everyday Conversations",
      description: "Practice common daily conversations",
      duration: '20 min',
      level: 'Beginner',
      words: 40,
      completed: true,
      icon: '💬',
      color: 'from-green-400 to-emerald-400'
    },
    {
      title: "Asking Questions",
      description: "Learn how to ask and answer basic questions",
      duration: '18 min',
      level: 'Beginner',
      words: 35,
      completed: true,
      icon: '❓',
      color: 'from-purple-400 to-pink-400'
    },
    {
      title: "Shopping & Prices",
      description: "Essential phrases for shopping and understanding prices",
      duration: '25 min',
      level: 'Beginner',
      words: 50,
      completed: false,
      icon: '🛍️',
      color: 'from-orange-400 to-red-400'
    },
    {
      title: "Food & Restaurants",
      description: "Order food and understand menus in English",
      duration: '22 min',
      level: 'Beginner',
      words: 45,
      completed: false,
      icon: '🍕',
      color: 'from-yellow-400 to-orange-400'
    },
    {
      title: "Directions & Locations",
      description: "Ask for and give directions confidently",
      duration: '20 min',
      level: 'Beginner',
      words: 38,
      completed: false,
      icon: '🗺️',
      color: 'from-indigo-400 to-purple-400'
    }
  ];

  const quickActions = [
    {
      title: "Speak & Practice",
      description: "Practice pronunciation with AI feedback",
      icon: Mic,
      color: "bg-blue-500",
      link: "/practice/speaking"
    },
    {
      title: "Listen & Repeat",
      description: "Improve listening and speaking skills",
      icon: Volume2,
      color: "bg-green-500",
      link: "/practice/listening"
    },
    {
      title: "Daily Conversation",
      description: "Chat with AI about everyday topics",
      icon: MessageCircle,
      color: "bg-purple-500",
      link: "/practice/conversation"
    },
    {
      title: "Quick Review",
      description: "Review previous lessons and vocabulary",
      icon: Repeat,
      color: "bg-orange-500",
      link: "/practice/review"
    }
  ];

  const stats = [
    { label: "Words Learned", value: "156", icon: BookOpen, color: "text-blue-500" },
    { label: "Speaking Practice", value: "45 min", icon: Mic, color: "text-green-500" },
    { label: "Current Streak", value: `${streak} days`, icon: Zap, color: "text-orange-500" },
    { label: "Lessons Completed", value: "3/6", icon: Award, color: "text-purple-500" },
  ];

  const handleStartLesson = (lessonIndex: number) => {
    setCurrentLesson(lessonIndex);
    // Simulate lesson completion
    if (!completedLessons.includes(lessonIndex)) {
      setCompletedLessons(prev => [...prev, lessonIndex]);
      setProgress(prev => Math.min(prev + 16, 100));
      setStreak(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-20 pt-32">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Beginners English
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            Start your English journey with essential conversations and practical vocabulary
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <Clock className="w-3 h-3 mr-1" />
              30-45 min daily
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <Users className="w-3 h-3 mr-1" />
              Self-paced learning
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              <Volume2 className="w-3 h-3 mr-1" />
              Pronunciation focus
            </Badge>
          </div>
        </div>

        {/* Progress Section */}
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Your Progress</h3>
                <p className="text-sm text-gray-600">Complete all lessons to advance to Intermediate</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{progress}%</div>
                <div className="text-sm text-gray-500">Overall Progress</div>
              </div>
            </div>
            <Progress value={progress} className="h-3 bg-gray-200">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" />
            </Progress>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border border-gray-200">
                <CardContent className="p-4 text-center">
                  <Icon className={cn("w-6 h-6 mx-auto mb-2", stat.color)} />
                  <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card 
                key={index} 
                className="group cursor-pointer border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm"
              >
                <CardContent className="p-4 text-center">
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-white", action.color)}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">{action.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    Start Now
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                className={cn(
                  "rounded-lg px-4 py-2 font-medium transition-all duration-300",
                  activeTab === tab.id 
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg" 
                    : "bg-white/80 border border-gray-200 hover:border-blue-300 text-gray-700"
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson, index) => (
            <Card 
              key={index} 
              className={cn(
                "group cursor-pointer border-2 transition-all duration-300 bg-white/90 backdrop-blur-sm",
                lesson.completed 
                  ? "border-green-200 hover:border-green-300" 
                  : "border-gray-200 hover:border-blue-300"
              )}
            >
              <CardContent className="p-0 overflow-hidden rounded-xl">
                <div className={cn("p-6 text-white text-center bg-gradient-to-br", lesson.color)}>
                  <div className="text-4xl mb-3">{lesson.icon}</div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h3 className="text-xl font-bold">{lesson.title}</h3>
                    {lesson.completed && (
                      <CheckCircle className="w-5 h-5 text-green-300" />
                    )}
                  </div>
                  <p className="text-white/90 text-sm">{lesson.description}</p>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {lesson.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {lesson.words} words
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
                        : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
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

        {/* Motivation Section */}
        <Card className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white mt-8">
          <CardContent className="p-6 text-center">
            <Star className="w-8 h-8 mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">You're Doing Great!</h3>
            <p className="text-blue-100 mb-4">
              Consistency is key to language learning. Practice daily to see amazing progress!
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                🎯 Goal-oriented
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                🔊 Pronunciation Focus
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                💬 Real Conversations
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BeginnersPage;