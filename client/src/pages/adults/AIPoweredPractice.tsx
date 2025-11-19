import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Mic, MessageCircle, BookOpen, Brain, Languages,
  CheckCircle, TrendingUp, Zap, Clock, Star, Target, Volume2,
  ArrowLeft, ArrowRight, RotateCcw, Play, Pause, Send,
  BarChart3, Award, Lightbulb, Activity, Bot, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface PracticeSession {
  id: string;
  type: 'conversation' | 'speaking' | 'grammar' | 'vocabulary';
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed: boolean;
  score?: number;
}

const AIPoweredPractice = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'conversation' | 'speaking' | 'grammar' | 'vocabulary'>('conversation');
  const [isPracticeActive, setIsPracticeActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<PracticeSession | null>(null);
  const [userMessage, setUserMessage] = useState('');
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'ai'; content: string; timestamp: Date }>>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [practiceProgress, setPracticeProgress] = useState(65);
  const [overallScore, setOverallScore] = useState(78);
  const [stars, setStars] = useState<Array<{ x: number; y: number; size: number; delay: number; opacity: number }>>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [currentGrammarQuestion, setCurrentGrammarQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [vocabularyWords, setVocabularyWords] = useState<Array<{ word: string; definition: string; example: string; learned: boolean }>>([]);

  const grammarQuestions = [
    {
      question: "Choose the correct form: I _____ to the conference tomorrow.",
      options: ["will go", "go", "am go", "going"],
      correct: "will go",
      explanation: "We use 'will go' to express future plans or decisions."
    },
    {
      question: "Complete the sentence: She has been _____ English for five years.",
      options: ["study", "studying", "studied", "studies"],
      correct: "studying",
      explanation: "We use 'has been + verb-ing' for actions that started in the past and continue to the present."
    },
    {
      question: "Which sentence is grammatically correct?",
      options: [
        "If I would have time, I would help you.",
        "If I had time, I would help you.",
        "If I have time, I would help you.",
        "If I will have time, I would help you."
      ],
      correct: "If I had time, I would help you.",
      explanation: "In second conditional sentences, we use 'if + past simple, would + infinitive'."
    },
    {
      question: "Choose the correct passive voice: The report _____ by the team yesterday.",
      options: ["was completed", "completed", "is completed", "completes"],
      correct: "was completed",
      explanation: "Past passive voice uses 'was/were + past participle'."
    },
    {
      question: "Which sentence uses the correct article?",
      options: [
        "I need an advice.",
        "I need a advice.",
        "I need advice.",
        "I need the advice."
      ],
      correct: "I need advice.",
      explanation: "'Advice' is an uncountable noun and doesn't take an article in this context."
    }
  ];

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const generateStars = () => {
      const isMobile = window.innerWidth < 768;
      const starCount = isMobile ? 100 : 200;
      
      const newStars = Array.from({ length: starCount }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 3,
        opacity: Math.random() * 0.8 + 0.2
      }));
      setStars(newStars);
    };
    generateStars();
  }, []);

  useEffect(() => {
    // Initialize vocabulary words
    setVocabularyWords([
      { word: "accomplish", definition: "to achieve or complete successfully", example: "We need to accomplish our goals this quarter.", learned: false },
      { word: "collaborate", definition: "to work together on a project", example: "The teams will collaborate on the new initiative.", learned: false },
      { word: "innovative", definition: "introducing new ideas or methods", example: "Their innovative approach solved the problem.", learned: false },
      { word: "leverage", definition: "to use something to maximum advantage", example: "We can leverage our existing network.", learned: false },
      { word: "facilitate", definition: "to make an action or process easier", example: "This tool will facilitate better communication.", learned: false }
    ]);
  }, []);

  const practiceSessions: PracticeSession[] = [
    {
      id: '1',
      type: 'conversation',
      title: 'Business Meeting Practice',
      description: 'Practice professional conversations in meeting scenarios',
      duration: 15,
      difficulty: 'intermediate',
      completed: true,
      score: 85
    },
    {
      id: '2',
      type: 'speaking',
      title: 'Pronunciation Mastery',
      description: 'Improve your accent and speaking clarity',
      duration: 10,
      difficulty: 'beginner',
      completed: false
    },
    {
      id: '3',
      type: 'grammar',
      title: 'Advanced Grammar Challenge',
      description: 'Master complex grammar structures',
      duration: 20,
      difficulty: 'advanced',
      completed: true,
      score: 92
    },
    {
      id: '4',
      type: 'vocabulary',
      title: 'Professional Vocabulary Builder',
      description: 'Expand your business English vocabulary',
      duration: 12,
      difficulty: 'intermediate',
      completed: false
    }
  ];

  const handleSendMessage = () => {
    if (!userMessage.trim()) return;

    // Add user message to conversation
    const newUserMessage = { role: 'user' as const, content: userMessage, timestamp: new Date() };
    setConversationHistory(prev => [...prev, newUserMessage]);
    setUserMessage('');

    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiResponses = [
        "That's a great point! Let me help you explore that further. Can you tell me more about your perspective?",
        "I understand what you're saying. From a professional standpoint, how would you approach this differently?",
        "Excellent question! In business contexts, we often find that... What are your thoughts on this?",
        "That's insightful! Let's dive deeper into this topic. Can you provide an example from your experience?",
        "I appreciate your input! This is exactly the kind of discussion we need. How do you see this applying to your work?"
      ];
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      const aiMessage = { role: 'ai' as const, content: randomResponse, timestamp: new Date() };
      setConversationHistory(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleStartConversation = () => {
    setIsPracticeActive(true);
    setConversationHistory([
      {
        role: 'ai',
        content: "Hello! I'm your AI practice partner. I'm here to help you improve your English through conversation. Let's start with a topic: What's a recent professional achievement you'd like to discuss?",
        timestamp: new Date()
      }
    ]);
  };

  const handleGrammarAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    const question = grammarQuestions[currentGrammarQuestion];
    const correct = answer === question.correct;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setPracticeProgress(prev => Math.min(prev + 2, 100));
      setOverallScore(prev => Math.min(prev + 1, 100));
    }
  };

  const handleNextGrammarQuestion = () => {
    if (currentGrammarQuestion < grammarQuestions.length - 1) {
      setCurrentGrammarQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      // All questions completed
      setPracticeProgress(prev => Math.min(prev + 10, 100));
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // In a real app, this would start audio recording
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // In a real app, this would stop recording and process audio
    // Simulate feedback
    setTimeout(() => {
      alert("Great job! Your pronunciation is improving. Your accent clarity score: 8.5/10");
    }, 500);
  };

  const handleLearnVocabulary = (index: number) => {
    const updated = [...vocabularyWords];
    updated[index].learned = !updated[index].learned;
    setVocabularyWords(updated);
    if (updated[index].learned) {
      setPracticeProgress(prev => Math.min(prev + 2, 100));
    }
  };

  const stats = [
    {
      label: "Overall Score",
      value: `${overallScore}%`,
      icon: TrendingUp,
      color: "text-purple-400",
      glowColor: "rgba(168, 85, 247, 0.2)"
    },
    {
      label: "Practice Streak",
      value: "12 days",
      icon: Zap,
      color: "text-amber-400",
      glowColor: "rgba(251, 191, 36, 0.2)"
    },
    {
      label: "Sessions Completed",
      value: "47",
      icon: CheckCircle,
      color: "text-emerald-400",
      glowColor: "rgba(52, 211, 153, 0.2)"
    },
    {
      label: "Improvement Rate",
      value: "+15%",
      icon: Activity,
      color: "text-cyan-400",
      glowColor: "rgba(34, 211, 238, 0.2)"
    }
  ];

  const parallaxTransform1 = `translateY(${scrollY * 0.1}px)`;
  const parallaxTransform2 = `translateY(${scrollY * 0.15}px)`;

  return (
    <div className={`min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 ${isLoaded ? 'space-fade-in' : 'opacity-0'}`}>
      {/* Deep Space Background with Stars */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {stars.map((star, index) => (
          <div
            key={index}
            className="absolute rounded-full bg-white space-star"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              opacity: star.opacity,
              boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, ${star.opacity})`
            }}
          />
        ))}
      </div>

      {/* Nebula Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-radial from-purple-500/30 via-indigo-500/20 to-transparent rounded-full blur-3xl nebula-effect animate-pulse" />
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-radial from-cyan-500/25 via-blue-500/15 to-transparent rounded-full blur-3xl nebula-effect animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Background Planets */}
      <div 
        className="fixed bottom-0 left-0 w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] pointer-events-none opacity-60 parallax-slow"
        style={{ transform: parallaxTransform1 }}
      >
        <img 
          src="/planets/eReia3yfybtZ8P5576d6kF8NJIM.avif" 
          alt="Planet" 
          className="w-full h-full rounded-full object-cover"
          style={{ filter: 'grayscale(0.2) brightness(0.85)' }}
        />
      </div>

      <div className="relative z-10 pb-12 sm:pb-16 md:pb-20 pt-20 sm:pt-24 md:pt-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <Button
              variant="ghost"
              onClick={() => navigate('/adults')}
              className="mb-6 text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Adults
            </Button>

            <div className="flex items-center gap-4 mb-4">
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  AI-Powered Practice
                </h1>
                <p className="text-cyan-100/80 mt-2">Personalized speaking practice with instant feedback</p>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="bg-slate-900/60 backdrop-blur-xl border-purple-500/30 shadow-xl">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-4">
                      <div className={cn("p-3 rounded-xl", stat.color)} style={{ backgroundColor: stat.glowColor }}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-sm text-cyan-100/70">{stat.label}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Progress Bar */}
          <Card className="bg-slate-900/60 backdrop-blur-xl border-purple-500/30 shadow-xl mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-white">Overall Progress</span>
                <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {practiceProgress}%
                </span>
              </div>
              <Progress value={practiceProgress} className="h-3 bg-slate-700/50">
                <div className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500" />
              </Progress>
            </CardContent>
          </Card>

          {/* Practice Tabs */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-6 border-b border-purple-500/30">
              {[
                { id: 'conversation', label: 'Conversation', icon: MessageCircle },
                { id: 'speaking', label: 'Speaking', icon: Mic },
                { id: 'grammar', label: 'Grammar', icon: BookOpen },
                { id: 'vocabulary', label: 'Vocabulary', icon: Languages }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setIsPracticeActive(false);
                      setShowFeedback(false);
                      setSelectedAnswer(null);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 font-medium transition-all duration-300 border-b-2",
                      activeTab === tab.id
                        ? "text-purple-300 border-purple-400 bg-purple-500/10"
                        : "text-cyan-100/70 border-transparent hover:text-purple-300 hover:border-purple-500/50"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Practice Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Practice Area */}
            <div className="lg:col-span-2">
              {activeTab === 'conversation' && (
                <Card className="bg-slate-900/60 backdrop-blur-xl border-purple-500/30 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-white">AI Conversation Practice</h3>
                      {!isPracticeActive && (
                        <Button
                          onClick={handleStartConversation}
                          className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Conversation
                        </Button>
                      )}
                    </div>

                    {isPracticeActive ? (
                      <div className="space-y-4">
                        {/* Conversation History */}
                        <div className="h-[400px] overflow-y-auto space-y-4 p-4 bg-slate-800/40 rounded-xl border border-purple-500/20">
                          {conversationHistory.map((msg, index) => (
                            <div
                              key={index}
                              className={cn(
                                "flex",
                                msg.role === 'user' ? "justify-end" : "justify-start"
                              )}
                            >
                              <div
                                className={cn(
                                  "max-w-[80%] rounded-2xl p-4",
                                  msg.role === 'user'
                                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                                    : "bg-slate-700/60 text-cyan-100 border border-purple-500/30"
                                )}
                              >
                                {msg.role === 'ai' && (
                                  <div className="flex items-center gap-2 mb-2">
                                    <Bot className="w-4 h-4 text-purple-400" />
                                    <span className="text-xs font-medium text-purple-300">AI Practice Partner</span>
                                  </div>
                                )}
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Input Area */}
                        <div className="flex gap-2">
                          <Textarea
                            value={userMessage}
                            onChange={(e) => setUserMessage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                            placeholder="Type your message here... (Press Enter to send)"
                            className="bg-slate-800/60 border-purple-500/30 text-white placeholder:text-cyan-100/50 min-h-[100px]"
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={!userMessage.trim()}
                            className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white"
                          >
                            <Send className="w-5 h-5" />
                          </Button>
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsPracticeActive(false);
                            setConversationHistory([]);
                          }}
                          className="w-full border-purple-400/30 text-purple-300 hover:bg-purple-500/20"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset Conversation
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Bot className="w-16 h-16 mx-auto mb-4 text-purple-400 opacity-50" />
                        <p className="text-cyan-100/70">Click "Start Conversation" to begin practicing with AI</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'speaking' && (
                <Card className="bg-slate-900/60 backdrop-blur-xl border-purple-500/30 shadow-xl">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-6">Pronunciation Practice</h3>
                    
                    <div className="space-y-6">
                      <div className="text-center p-8 bg-slate-800/40 rounded-xl border border-purple-500/20">
                        <div className="text-2xl font-semibold text-white mb-4">
                          "The quick brown fox jumps over the lazy dog"
                        </div>
                        <p className="text-cyan-100/70 mb-6">Try to pronounce this sentence clearly and naturally</p>
                        
                        <div className="flex items-center justify-center gap-4">
                          {!isRecording ? (
                            <Button
                              onClick={handleStartRecording}
                              size="lg"
                              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                            >
                              <Mic className="w-5 h-5 mr-2" />
                              Start Recording
                            </Button>
                          ) : (
                            <Button
                              onClick={handleStopRecording}
                              size="lg"
                              className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white animate-pulse"
                            >
                              <Pause className="w-5 h-5 mr-2" />
                              Stop Recording
                            </Button>
                          )}
                        </div>

                        {isRecording && (
                          <div className="mt-4 flex items-center justify-center gap-2 text-rose-400">
                            <div className="w-3 h-3 bg-rose-400 rounded-full animate-pulse" />
                            <span className="text-sm">Recording in progress...</span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-cyan-400" />
                          Tips for Better Pronunciation
                        </h4>
                        <ul className="text-sm text-cyan-100/80 space-y-1 list-disc list-inside">
                          <li>Speak slowly and clearly</li>
                          <li>Pay attention to word stress and intonation</li>
                          <li>Practice difficult sounds repeatedly</li>
                          <li>Record yourself and compare with native speakers</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'grammar' && (
                <Card className="bg-slate-900/60 backdrop-blur-xl border-purple-500/30 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-white">Grammar Challenge</h3>
                      <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                        Question {currentGrammarQuestion + 1} of {grammarQuestions.length}
                      </Badge>
                    </div>

                    {currentGrammarQuestion < grammarQuestions.length ? (
                      <div className="space-y-6">
                        <div className="p-6 bg-slate-800/40 rounded-xl border border-purple-500/20">
                          <div className="mb-6">
                            <div className="text-lg font-semibold text-white mb-6">
                              {grammarQuestions[currentGrammarQuestion].question}
                            </div>
                            <div className="space-y-3">
                              {grammarQuestions[currentGrammarQuestion].options.map((option, index) => (
                                <button
                                  key={index}
                                  onClick={() => !showFeedback && handleGrammarAnswer(option)}
                                  disabled={showFeedback}
                                  className={cn(
                                    "w-full text-left p-4 rounded-lg border-2 transition-all duration-200",
                                    showFeedback
                                      ? option === grammarQuestions[currentGrammarQuestion].correct
                                        ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                                        : selectedAnswer === option
                                        ? "bg-rose-500/20 border-rose-400 text-rose-300"
                                        : "bg-slate-700/40 border-slate-600 text-cyan-100/70"
                                      : "bg-slate-700/40 border-slate-600 text-white hover:border-purple-400 hover:bg-purple-500/10"
                                  )}
                                >
                                  <span className="font-medium">{String.fromCharCode(65 + index)}. {option}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {showFeedback && (
                            <div className={cn(
                              "p-4 rounded-lg border-2",
                              isCorrect
                                ? "bg-emerald-500/20 border-emerald-400"
                                : "bg-amber-500/20 border-amber-400"
                            )}>
                              <div className={cn(
                                "font-semibold mb-2 flex items-center gap-2",
                                isCorrect ? "text-emerald-300" : "text-amber-300"
                              )}>
                                {isCorrect ? (
                                  <>
                                    <CheckCircle className="w-5 h-5" />
                                    Correct!
                                  </>
                                ) : (
                                  <>
                                    <X className="w-5 h-5" />
                                    Incorrect
                                  </>
                                )}
                              </div>
                              <p className="text-sm text-cyan-100/80">
                                {grammarQuestions[currentGrammarQuestion].explanation}
                              </p>
                            </div>
                          )}
                        </div>

                        {showFeedback && (
                          <Button
                            onClick={handleNextGrammarQuestion}
                            className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white"
                          >
                            {currentGrammarQuestion < grammarQuestions.length - 1 ? (
                              <>
                                Next Question <ArrowRight className="w-4 h-4 ml-2" />
                              </>
                            ) : (
                              <>
                                Complete Challenge <CheckCircle className="w-4 h-4 ml-2" />
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Award className="w-16 h-16 mx-auto mb-4 text-amber-400" />
                        <h4 className="text-xl font-bold text-white mb-2">Congratulations!</h4>
                        <p className="text-cyan-100/70 mb-6">You've completed the grammar challenge!</p>
                        <Button
                          onClick={() => {
                            setCurrentGrammarQuestion(0);
                            setSelectedAnswer(null);
                            setShowFeedback(false);
                          }}
                          className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Try Again
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'vocabulary' && (
                <Card className="bg-slate-900/60 backdrop-blur-xl border-purple-500/30 shadow-xl">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-6">Vocabulary Builder</h3>
                    
                    <div className="space-y-4">
                      {vocabularyWords.map((word, index) => (
                        <Card
                          key={index}
                          className={cn(
                            "bg-slate-800/40 border-2 transition-all duration-300",
                            word.learned
                              ? "border-emerald-500/50 bg-emerald-500/10"
                              : "border-purple-500/30 hover:border-purple-400/50"
                          )}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-lg font-bold text-white">{word.word}</h4>
                                  {word.learned && (
                                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Learned
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-cyan-100/80 mb-2">{word.definition}</p>
                                <p className="text-sm text-purple-300 italic">"{word.example}"</p>
                              </div>
                              <Button
                                variant="ghost"
                                onClick={() => handleLearnVocabulary(index)}
                                className={cn(
                                  "ml-4",
                                  word.learned ? "text-emerald-400 hover:text-emerald-300" : "text-purple-300 hover:text-purple-200"
                                )}
                              >
                                {word.learned ? (
                                  <CheckCircle className="w-6 h-6" />
                                ) : (
                                  <Star className="w-6 h-6" />
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="bg-slate-900/60 backdrop-blur-xl border-purple-500/30 shadow-xl">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Practice Sessions</h3>
                  <div className="space-y-3">
                    {practiceSessions.map((session) => (
                      <div
                        key={session.id}
                        className="p-4 rounded-lg bg-slate-800/40 border border-purple-500/20 hover:border-purple-400/50 transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-white">{session.title}</h4>
                            <p className="text-sm text-cyan-100/70">{session.description}</p>
                          </div>
                          {session.completed && (
                            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 ml-2" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="outline" className="text-xs bg-slate-700/50 text-cyan-200 border-cyan-500/30">
                            <Clock className="w-3 h-3 mr-1" />
                            {session.duration} min
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-300 border-purple-400/30">
                            {session.difficulty}
                          </Badge>
                          {session.score && (
                            <Badge variant="outline" className="text-xs bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
                              {session.score}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-cyan-500/20 backdrop-blur-xl border-purple-400/50 shadow-xl">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-400" />
                    AI Insights
                  </h3>
                  <p className="text-cyan-100 text-sm leading-relaxed mb-4">
                    Based on your practice, you're showing strong improvement in conversational English. 
                    Focus on grammar structures to reach the next level!
                  </p>
                  <div className="flex items-center gap-2 text-sm text-cyan-200">
                    <TrendingUp className="w-4 h-4" />
                    <span>+15% improvement this week</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPoweredPractice;
