import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Volume2, Mic, CheckCircle, Clock, ArrowLeft, ArrowRight, MessageCircle,
  BookOpen, Languages, Zap, Star, Target,
  Users, Lightbulb, AlertCircle, Briefcase, ShoppingBag, Globe, PlayCircle, MicOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { IntegratedProgressService } from '@/services/IntegratedProgressService';
import { useToast } from '@/hooks/use-toast';
import OnlineTTS from '@/services/OnlineTTS';
import SpeechService from '@/services/SpeechService';

// Daily Conversation Topics
const dailyConversationTopics = [
  {
    id: 'greetings',
    title: 'Greetings & Introductions',
    description: 'Master professional greetings and introductions',
    duration: '10-15 min',
    level: 'Foundation+',
    icon: Users,
    color: 'from-cyan-500 to-blue-600',
    scenarios: [
      {
        title: 'Meeting Someone New',
        dialogue: [
          { speaker: 'You', text: "Hello, I'm [Your Name]. Nice to meet you." },
          { speaker: 'Partner', text: "Hi, I'm [Partner Name]. Pleasure to meet you too." },
          { speaker: 'You', text: "What do you do for a living?" },
          { speaker: 'Partner', text: "I work in marketing. How about you?" }
        ],
        keyPhrases: [
          'Nice to meet you',
          'What do you do?',
          'I work in...',
          'How about you?'
        ],
        practicePoints: [
          'Practice introducing yourself clearly',
          'Ask follow-up questions',
          'Use appropriate professional language'
        ]
      },
      {
        title: 'Casual Greetings',
        dialogue: [
          { speaker: 'You', text: "Hey, how's it going?" },
          { speaker: 'Partner', text: "Pretty good, thanks! How about you?" },
          { speaker: 'You', text: "Can't complain! What have you been up to?" },
          { speaker: 'Partner', text: "Just working on a new project. It's keeping me busy." }
        ],
        keyPhrases: [
          "How's it going?",
          "What have you been up to?",
          "Can't complain",
          "Keeping me busy"
        ],
        practicePoints: [
          'Use casual expressions naturally',
          'Maintain conversation flow',
          'Show interest in the other person'
        ]
      }
    ]
  },
  {
    id: 'work',
    title: 'Work & Professional Life',
    description: 'Discuss work, careers, and professional situations',
    duration: '12-18 min',
    level: 'Foundation+',
    icon: Briefcase,
    color: 'from-purple-500 to-pink-600',
    scenarios: [
      {
        title: 'Discussing Your Job',
        dialogue: [
          { speaker: 'You', text: "I work as a software engineer at a tech company." },
          { speaker: 'Partner', text: "That sounds interesting! What does your typical day look like?" },
          { speaker: 'You', text: "I spend most of my time coding and attending meetings." },
          { speaker: 'Partner', text: "Do you enjoy it?" }
        ],
        keyPhrases: [
          'I work as...',
          'What does your typical day look like?',
          'I spend most of my time...',
          'Do you enjoy it?'
        ],
        practicePoints: [
          'Describe your role clearly',
          'Talk about daily responsibilities',
          'Express opinions about work'
        ]
      },
      {
        title: 'Job Interview',
        dialogue: [
          { speaker: 'Interviewer', text: "Tell me about yourself." },
          { speaker: 'You', text: "I have five years of experience in project management." },
          { speaker: 'Interviewer', text: "What are your strengths?" },
          { speaker: 'You', text: "I'm organized, detail-oriented, and work well in teams." }
        ],
        keyPhrases: [
          'Tell me about yourself',
          'I have X years of experience',
          'What are your strengths?',
          'I work well in teams'
        ],
        practicePoints: [
          'Present yourself professionally',
          'Highlight relevant experience',
          'Answer interview questions confidently'
        ]
      }
    ]
  },
  {
    id: 'daily-routines',
    title: 'Daily Routines',
    description: 'Talk about your daily activities and habits',
    duration: '10-15 min',
    level: 'Foundation+',
    icon: Clock,
    color: 'from-emerald-500 to-teal-600',
    scenarios: [
      {
        title: 'Morning Routine',
        dialogue: [
          { speaker: 'You', text: "I usually wake up at 6:30 AM." },
          { speaker: 'Partner', text: "That's early! What's your morning routine?" },
          { speaker: 'You', text: "I exercise, have breakfast, and then head to work." },
          { speaker: 'Partner', text: "I wish I had that kind of discipline!" }
        ],
        keyPhrases: [
          'I usually wake up at...',
          "What's your morning routine?",
          'I exercise, have breakfast...',
          'I wish I had...'
        ],
        practicePoints: [
          'Describe routines using time expressions',
          'Use frequency adverbs (usually, always, sometimes)',
          'Compare routines with others'
        ]
      }
    ]
  },
  {
    id: 'hobbies',
    title: 'Hobbies & Interests',
    description: 'Discuss your interests and leisure activities',
    duration: '10-15 min',
    level: 'Foundation+',
    icon: Star,
    color: 'from-amber-500 to-orange-600',
    scenarios: [
      {
        title: 'Talking About Hobbies',
        dialogue: [
          { speaker: 'You', text: "I love reading in my free time." },
          { speaker: 'Partner', text: "What kind of books do you like?" },
          { speaker: 'You', text: "I prefer science fiction and mystery novels." },
          { speaker: 'Partner', text: "That's interesting! I'm more into non-fiction." }
        ],
        keyPhrases: [
          'I love... in my free time',
          'What kind of... do you like?',
          'I prefer...',
          "I'm more into..."
        ],
        practicePoints: [
          'Express preferences clearly',
          'Ask about others\' interests',
          'Make comparisons'
        ]
      }
    ]
  },
  {
    id: 'travel',
    title: 'Travel & Transportation',
    description: 'Navigate travel conversations and directions',
    duration: '12-18 min',
    level: 'Foundation+',
    icon: Globe,
    color: 'from-indigo-500 to-blue-600',
    scenarios: [
      {
        title: 'Asking for Directions',
        dialogue: [
          { speaker: 'You', text: "Excuse me, could you tell me how to get to the train station?" },
          { speaker: 'Partner', text: "Sure! Go straight for two blocks, then turn left." },
          { speaker: 'You', text: "Is it far?" },
          { speaker: 'Partner', text: "No, it's about a 5-minute walk." }
        ],
        keyPhrases: [
          'Could you tell me how to get to...?',
          'Go straight for...',
          'Turn left/right',
          "It's about a X-minute walk"
        ],
        practicePoints: [
          'Ask for directions politely',
          'Give clear directions',
          'Understand distance and time'
        ]
      }
    ]
  },
  {
    id: 'shopping',
    title: 'Shopping & Dining',
    description: 'Handle shopping and restaurant conversations',
    duration: '10-15 min',
    level: 'Foundation+',
    icon: ShoppingBag,
    color: 'from-rose-500 to-pink-600',
    scenarios: [
      {
        title: 'At a Restaurant',
        dialogue: [
          { speaker: 'Waiter', text: "Good evening! Do you have a reservation?" },
          { speaker: 'You', text: "Yes, it's under Smith." },
          { speaker: 'Waiter', text: "Perfect. Would you like to see the menu?" },
          { speaker: 'You', text: "Yes, please. And could we have a table by the window?" }
        ],
        keyPhrases: [
          'Do you have a reservation?',
          "It's under...",
          'Would you like to...?',
          'Could we have...?'
        ],
        practicePoints: [
          'Make restaurant reservations',
          'Order food politely',
          'Make special requests'
        ]
      }
    ]
  }
];


const QuickPracticeSession = () => {
  const { sessionType } = useParams<{ sessionType: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [stars, setStars] = useState<Array<{ x: number; y: number; size: number; delay: number; opacity: number }>>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [userResponses, setUserResponses] = useState<Record<number, string>>({});
  const [practiceScores, setPracticeScores] = useState<Record<number, number>>({});
  const [isSpeaking, setIsSpeaking] = useState<Record<number, boolean>>({});
  const [isListening, setIsListening] = useState<Record<number, boolean>>({});
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [ttsInitialized, setTtsInitialized] = useState(false);
  const [sttAvailable, setSttAvailable] = useState(false);
  const [overallScore, setOverallScore] = useState(0);
  const recognitionRef = useRef<any>(null);

  // Initialize TTS and STT
  useEffect(() => {
    const initServices = async () => {
      // Initialize TTS
      try {
        await OnlineTTS.initialize();
        setTtsInitialized(true);
        console.log('✅ TTS initialized for practice session');
      } catch (error) {
        console.error('Failed to initialize TTS:', error);
        toast({
          title: "Audio Not Available",
          description: "Text-to-speech is not available in your browser.",
          variant: "default"
        });
      }

      // Check STT availability
      const sttSupported = SpeechService.isSTTSupported();
      setSttAvailable(sttSupported);
      if (!sttSupported) {
        toast({
          title: "Speech Recognition Not Available",
          description: "Your browser doesn't support speech recognition. Please use Chrome or Edge for voice practice.",
          variant: "default"
        });
      }
    };
    initServices();
  }, [toast]);

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors
        }
      }
    };
  }, []);

  // Generate animated stars
  useEffect(() => {
    const generateStars = () => {
      const newStars = Array.from({ length: 200 }, () => ({
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

  // Get session configuration based on type
  const getSessionConfig = () => {
    switch (sessionType) {
      case 'daily-conversation':
        return {
          title: 'Daily Conversation',
          description: 'Practice professional speaking about everyday topics',
          icon: MessageCircle,
          color: 'from-cyan-500 to-blue-600',
          topics: dailyConversationTopics
        };
      case 'pronunciation':
        return {
          title: 'Pronunciation Drill',
          description: 'Improve your accent and speaking clarity',
          icon: Volume2,
          color: 'from-emerald-500 to-teal-600',
          topics: []
        };
      case 'grammar':
        return {
          title: 'Grammar Challenge',
          description: 'Test and improve your professional grammar skills',
          icon: BookOpen,
          color: 'from-purple-500 to-pink-600',
          topics: []
        };
      case 'vocabulary':
        return {
          title: 'Vocabulary Builder',
          description: 'Learn professional terminology in context',
          icon: Languages,
          color: 'from-amber-500 to-orange-600',
          topics: []
        };
      default:
        return {
          title: 'Practice Session',
          description: 'Select a practice session to begin',
          icon: Target,
          color: 'from-cyan-500 to-blue-600',
          topics: []
        };
    }
  };

  const config = getSessionConfig();
  const Icon = config.icon;
  const selectedTopicData = dailyConversationTopics.find(t => t.id === selectedTopic);
  const currentScenarioData = selectedTopicData?.scenarios[currentScenario];

  const handleStartPractice = (topicId: string) => {
    setSelectedTopic(topicId);
    setCurrentScenario(0);
  };

  const handleNextScenario = () => {
    if (selectedTopicData && currentScenario < selectedTopicData.scenarios.length - 1) {
      setCurrentScenario(currentScenario + 1);
    }
  };

  const handlePreviousScenario = () => {
    if (currentScenario > 0) {
      setCurrentScenario(currentScenario - 1);
    }
  };

  // If no session type, show selection
  if (!sessionType) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {stars.map((star, index) => (
            <div
              key={index}
              className="absolute rounded-full bg-white animate-pulse"
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

        <div className="relative z-10 pb-12 pt-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/adults')}
              className="mb-8 text-cyan-300 hover:text-cyan-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Adults Page
            </Button>

            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                Quick Practice Sessions
              </h1>
              <p className="text-cyan-100/80 text-lg">Select a practice session to begin</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                { type: 'daily-conversation', title: 'Daily Conversation', icon: MessageCircle, color: 'from-cyan-500 to-blue-600' },
                { type: 'pronunciation', title: 'Pronunciation Drill', icon: Volume2, color: 'from-emerald-500 to-teal-600' },
                { type: 'grammar', title: 'Grammar Challenge', icon: BookOpen, color: 'from-purple-500 to-pink-600' },
                { type: 'vocabulary', title: 'Vocabulary Builder', icon: Languages, color: 'from-amber-500 to-orange-600' }
              ].map((session) => {
                const SessionIcon = session.icon;
                return (
                  <Card
                    key={session.type}
                    className="group cursor-pointer bg-slate-900/60 backdrop-blur-xl border-purple-500/30 hover:border-purple-400/50 transition-all duration-300"
                    onClick={() => navigate(`/adults/practice/${session.type}`)}
                  >
                    <CardContent className="p-8">
                      <div className={cn("w-16 h-16 rounded-xl flex items-center justify-center mb-6 text-white bg-gradient-to-r", session.color)}>
                        <SessionIcon className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">{session.title}</h3>
                      <Button className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600">
                        Start Practice
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Speak text using TTS
  const speakText = async (text: string, index: number) => {
    if (!ttsInitialized) {
      toast({
        title: "Audio Not Ready",
        description: "Please wait for audio to initialize",
        variant: "default"
      });
      return;
    }

    try {
      setIsSpeaking(prev => ({ ...prev, [index]: true }));
      
      // Use a professional adult voice profile
      const adultVoiceProfile = {
        name: 'Professional',
        pitch: 1.0,
        rate: 0.9, // Slightly slower for clarity
        volume: 1.0,
        voiceName: 'Microsoft Zira - English (United States)',
        description: 'Professional adult conversation voice'
      };

      await OnlineTTS.speak(text, adultVoiceProfile);
    } catch (error) {
      console.error('Error speaking text:', error);
      toast({
        title: "Audio Error",
        description: "Failed to play audio. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSpeaking(prev => ({ ...prev, [index]: false }));
    }
  };

  // Calculate score for user response
  const calculateResponseScore = (userResponse: string, expectedText: string): number => {
    if (!userResponse.trim()) return 0;
    
    const userLower = userResponse.toLowerCase().trim();
    const expectedLower = expectedText.toLowerCase().trim();
    
    // Exact match
    if (userLower === expectedLower) return 100;
    
    // Check for key phrases
    const keyPhrases = expectedLower.split(/[.!?]/).filter(p => p.trim().length > 5);
    let matches = 0;
    keyPhrases.forEach(phrase => {
      if (userLower.includes(phrase.trim())) matches++;
    });
    
    // Word overlap
    const userWords = new Set(userLower.split(/\s+/));
    const expectedWords = new Set(expectedLower.split(/\s+/));
    const commonWords = [...userWords].filter(w => expectedWords.has(w));
    const wordScore = (commonWords.length / Math.max(expectedWords.size, 1)) * 50;
    
    // Phrase match score
    const phraseScore = (matches / Math.max(keyPhrases.length, 1)) * 30;
    
    // Length similarity (20 points)
    const lengthDiff = Math.abs(userResponse.length - expectedText.length);
    const maxLength = Math.max(userResponse.length, expectedText.length);
    const lengthScore = Math.max(0, 20 - (lengthDiff / maxLength) * 20);
    
    return Math.min(100, Math.round(wordScore + phraseScore + lengthScore));
  };

  // Start listening for user speech
  const startListening = async (index: number) => {
    if (!sttAvailable) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Please use Chrome or Edge browser for voice practice.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsListening(prev => ({ ...prev, [index]: true }));
      setInterimTranscript('');

      const result = await SpeechService.startRecognition({
        lang: 'en-US',
        interimResults: true,
        continuous: false,
        timeoutMs: 15000, // 15 seconds max
        autoStopOnSilence: true,
        silenceTimeoutMs: 2000, // Stop after 2 seconds of silence
        onInterimResult: (transcript, isFinal) => {
          if (!isFinal) {
            setInterimTranscript(transcript);
          }
        }
      });

      // Process the result
      const spokenText = result.transcript.trim();
      if (spokenText) {
        handlePracticeResponse(index, spokenText);
        toast({
          title: "Response Recorded",
          description: `You said: "${spokenText.substring(0, 50)}${spokenText.length > 50 ? '...' : ''}"`,
        });
      } else {
        toast({
          title: "No Speech Detected",
          description: "Please try speaking again.",
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error('Speech recognition error:', error);
      if (error.message !== 'STT timeout' && error.message !== 'No speech detected') {
        toast({
          title: "Recognition Error",
          description: error.message || "Failed to recognize speech. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsListening(prev => ({ ...prev, [index]: false }));
      setInterimTranscript('');
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore
      }
    }
    setIsListening({});
    setInterimTranscript('');
  };

  // Handle user practice response (from speech or manual)
  const handlePracticeResponse = (index: number, response: string) => {
    setUserResponses(prev => ({ ...prev, [index]: response }));
    
    if (currentScenarioData) {
      const expectedLine = currentScenarioData.dialogue[index];
      if (expectedLine && expectedLine.speaker === 'You') {
        const score = calculateResponseScore(response, expectedLine.text);
        setPracticeScores(prev => ({ ...prev, [index]: score }));
        
        // Update overall score
        const allScores = { ...practiceScores, [index]: score };
        const userLines = currentScenarioData.dialogue
          .map((line, idx) => line.speaker === 'You' ? idx : -1)
          .filter(idx => idx !== -1);
        const userScores = userLines.map(idx => allScores[idx] || 0);
        const avgScore = userScores.length > 0 
          ? Math.round(userScores.reduce((a, b) => a + b, 0) / userScores.length)
          : 0;
        setOverallScore(avgScore);

        // Auto-advance to next line if score is good
        if (score >= 70 && index < currentScenarioData.dialogue.length - 1) {
          setTimeout(() => {
            const nextIndex = index + 1;
            if (nextIndex < currentScenarioData.dialogue.length) {
              const nextLine = currentScenarioData.dialogue[nextIndex];
              // If next line is from partner, auto-play it
              if (nextLine.speaker !== 'You') {
                speakText(nextLine.text, nextIndex).then(() => {
                  // After partner speaks, check if next is user line
                  const userLineIndex = nextIndex + 1;
                  if (userLineIndex < currentScenarioData.dialogue.length) {
                    const userLine = currentScenarioData.dialogue[userLineIndex];
                    if (userLine.speaker === 'You') {
                      setTimeout(() => {
                        toast({
                          title: "Your Turn! 🎤",
                          description: `Speak: "${userLine.text}"`,
                        });
                      }, 1000);
                    }
                  }
                });
              } else {
                // Next line is also "You" - prompt immediately
                setTimeout(() => {
                  toast({
                    title: "Your Turn! 🎤",
                    description: `Speak: "${nextLine.text}"`,
                  });
                }, 500);
              }
            }
          }, 1500);
        }
      }
    }
  };


  const handleStartPracticeSession = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to start a practice session",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSessionActive(true);
      setSessionStartTime(new Date());
      setUserResponses({});
      setPracticeScores({});
      setOverallScore(0);
      
      toast({
        title: "Practice Session Started",
        description: "Listen to the dialogue, then practice your responses. You'll get points based on accuracy!",
      });
      
      console.log('Practice session started:', {
        userId: user.id,
        topic: selectedTopic,
        scenario: currentScenario,
        startTime: new Date()
      });
    } catch (error) {
      console.error('Error starting practice session:', error);
      toast({
        title: "Error",
        description: "Failed to start practice session. Please try again.",
        variant: "destructive"
      });
      setIsSessionActive(false);
      setSessionStartTime(null);
    }
  };

  const handleEndPracticeSession = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save your practice session",
        variant: "destructive"
      });
      return;
    }

    if (!sessionStartTime) {
      toast({
        title: "No Active Session",
        description: "Please start a practice session first",
        variant: "destructive"
      });
      return;
    }

    const durationMinutes = Math.max(1, Math.round((new Date().getTime() - sessionStartTime.getTime()) / 60000));
    const finalScore = overallScore > 0 ? overallScore : 85; // Default score if no practice done
    const sentencesPracticed = Object.keys(userResponses).length;
    
    // Calculate points based on score
    const pointsEarned = Math.round(finalScore / 10) + (sentencesPracticed * 2);
    
    try {
      console.log('Saving practice session:', {
        userId: user.id,
        type: 'conversation',
        duration: durationMinutes,
        score: finalScore,
        sentences_practiced: sentencesPracticed,
        points_earned: pointsEarned,
        topic: selectedTopic,
        scenario: currentScenario
      });

      const result = await IntegratedProgressService.recordPracticeSession(user.id, {
        type: 'conversation',
        duration: durationMinutes,
        score: finalScore,
        sentences_practiced: sentencesPracticed,
        words_practiced: Object.values(userResponses).join(' ').split(/\s+/).length,
        mistakes_count: Math.max(0, 100 - finalScore),
        details: {
          topic: selectedTopic,
          scenario: currentScenario,
          session_type: 'daily-conversation',
          topic_title: selectedTopicData?.title,
          scenario_title: currentScenarioData?.title,
          practice_scores: practiceScores,
          user_responses: userResponses
        }
      });

      if (result.success) {
        toast({
          title: "🎉 Session Saved Successfully!",
          description: `Score: ${finalScore}% | Points: ${pointsEarned} | Duration: ${durationMinutes} min | Sentences: ${sentencesPracticed}`,
        });
        
        // Reset session state
        setIsSessionActive(false);
        setSessionStartTime(null);
        setUserResponses({});
        setPracticeScores({});
        setOverallScore(0);
      } else {
        toast({
          title: "Save Failed",
          description: result.message || "Failed to save your session. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving practice session:', error);
      toast({
        title: "Error",
        description: "An error occurred while saving your session. Please check your connection and try again.",
        variant: "destructive"
      });
    }
  };

  // Show Daily Conversation content
  if (sessionType === 'daily-conversation') {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
        {/* Background Stars */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {stars.map((star, index) => (
            <div
              key={index}
              className="absolute rounded-full bg-white animate-pulse"
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

        {/* Planet Images - Responsive */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Planet 1 - Top Right */}
          <div className="absolute top-10 right-4 sm:right-8 md:right-16 lg:right-24 w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] md:w-[120px] md:h-[120px] lg:w-[150px] lg:h-[150px] opacity-40 sm:opacity-50 md:opacity-60">
            <img 
              src="/planets/SEp7QE3Bk6RclE0R7rhBgcGIOI.avif" 
              alt="Planet" 
              className="w-full h-full rounded-full object-cover shadow-xl"
              style={{ filter: 'grayscale(0.3) brightness(0.75)' }}
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/15 to-pink-500/15 blur-xl" />
          </div>

          {/* Planet 2 - Bottom Left */}
          <div className="absolute bottom-10 left-4 sm:left-8 md:left-16 lg:left-24 w-[50px] h-[50px] sm:w-[70px] sm:h-[70px] md:w-[100px] md:h-[100px] lg:w-[130px] lg:h-[130px] opacity-30 sm:opacity-40 md:opacity-50">
            <img 
              src="/planets/K3uC2Tk4o2zjSbuWGs3t0MMuLVY.avif" 
              alt="Planet" 
              className="w-full h-full rounded-full object-cover shadow-xl"
              style={{ filter: 'grayscale(0.3) brightness(0.7)' }}
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/15 to-blue-500/15 blur-xl" />
          </div>
        </div>

        {/* Nebula Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-radial from-cyan-500/20 via-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-purple-500/20 via-pink-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 pb-12 pt-20 sm:pt-24 md:pt-28 lg:pt-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <div className="text-center mb-6 sm:mb-8">
                {/* Removed icon from title */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3 sm:mb-4">
                  {config.title}
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-cyan-100/80 max-w-2xl mx-auto">{config.description}</p>
              </div>
            </div>

            {!selectedTopic ? (
              /* Topic Selection */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dailyConversationTopics.map((topic) => {
                  const TopicIcon = topic.icon;
                  return (
                    <Card
                      key={topic.id}
                      className="group cursor-pointer bg-slate-900/60 backdrop-blur-xl border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20"
                      onClick={() => handleStartPractice(topic.id)}
                    >
                      <CardContent className="p-6">
                        <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-white bg-gradient-to-r", topic.color)}>
                          <TopicIcon className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{topic.title}</h3>
                        <p className="text-sm text-cyan-100/70 mb-4">{topic.description}</p>
                        <div className="flex items-center justify-between text-sm text-cyan-100/60">
                          <Badge variant="outline" className="bg-slate-700/50 text-cyan-200 border-cyan-500/30">
                            {topic.duration}
                          </Badge>
                          <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                            {topic.level}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              /* Practice Interface - Wider Container */
              <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto">
                <Card className="bg-slate-900/60 backdrop-blur-xl border-purple-500/30 shadow-2xl">
                  <CardContent className="p-4 sm:p-6 md:p-8">
                    {/* Topic Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{selectedTopicData?.title}</h2>
                        <p className="text-sm sm:text-base text-cyan-100/70">{selectedTopicData?.description}</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedTopic(null)}
                        className="border-purple-400/30 text-purple-300 hover:bg-purple-500/20 w-full sm:w-auto"
                      >
                        Change Topic
                      </Button>
                    </div>

                    {/* Scenario Navigation */}
                    {selectedTopicData && selectedTopicData.scenarios.length > 1 && (
                      <div className="flex items-center justify-between mb-6">
                        <Button
                          variant="outline"
                          onClick={handlePreviousScenario}
                          disabled={currentScenario === 0}
                          className="border-purple-400/30 text-purple-400"
                        >
                          Previous
                        </Button>
                        <span className="text-cyan-100/70">
                          Scenario {currentScenario + 1} of {selectedTopicData.scenarios.length}
                        </span>
                        <Button
                          variant="outline"
                          onClick={handleNextScenario}
                          disabled={currentScenario === selectedTopicData.scenarios.length - 1}
                          className="border-purple-400/30 text-purple-400"
                        >
                          Next
                        </Button>
                      </div>
                    )}

                    {/* Current Scenario */}
                    {currentScenarioData && (
                      <div className="space-y-4 sm:space-y-6">
                        {/* Dialogue - Chat Style */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                              {currentScenarioData.title}
                            </h3>
                            {ttsInitialized && currentScenarioData && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  for (let i = 0; i < currentScenarioData.dialogue.length; i++) {
                                    await speakText(currentScenarioData.dialogue[i].text, i);
                                    // Small delay between lines
                                    await new Promise(resolve => setTimeout(resolve, 500));
                                  }
                                }}
                                className="border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/20"
                              >
                                <PlayCircle className="w-4 h-4 mr-2" />
                                Play All Dialogue
                              </Button>
                            )}
                          </div>
                          
                          {/* Instructions */}
                          {!isSessionActive && (
                            <div className="mb-4 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                              <div className="flex items-start gap-3">
                                <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <h4 className="font-semibold text-white mb-1 text-sm">Ready to Practice?</h4>
                                  <p className="text-xs sm:text-sm text-cyan-100/80">
                                    Click "Start Practice Session" to begin. You'll be able to listen to each line and practice your responses!
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {isSessionActive && (
                            <div className="mb-4 p-4 bg-cyan-500/20 border border-cyan-400/30 rounded-lg">
                              <div className="flex items-start gap-3">
                                <Lightbulb className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <h4 className="font-semibold text-white mb-1 text-sm">How to Practice (Voice Mode):</h4>
                                  <ul className="text-xs sm:text-sm text-cyan-100/80 space-y-1 list-disc list-inside">
                                    <li>Click the speaker icon 🔊 to hear each line read aloud</li>
                                    <li>For "You" lines, click the microphone 🎤 button and <strong>speak</strong> your response</li>
                                    <li>The system will listen and transcribe what you say</li>
                                    <li>Get instant feedback and scores (0-100%) based on accuracy</li>
                                    <li><strong>Points Formula:</strong> (Score ÷ 10) + (2 points per sentence practiced)</li>
                                    <li>Example: 85% score + 3 sentences = 8 + 6 = <strong>14 points</strong></li>
                                  </ul>
                                  {!sttAvailable && (
                                    <div className="mt-2 p-2 bg-amber-500/20 border border-amber-400/30 rounded text-xs text-amber-200">
                                      ⚠️ Speech recognition requires Chrome or Edge browser
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Score Display */}
                          {isSessionActive && overallScore > 0 && (
                            <div className="mb-4 p-4 bg-emerald-500/20 border border-emerald-400/30 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm text-emerald-300 font-medium">Current Score</div>
                                  <div className="text-2xl font-bold text-white">{overallScore}%</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-emerald-300 font-medium">Points Earned</div>
                                  <div className="text-2xl font-bold text-white">
                                    {Math.round(overallScore / 10) + (Object.keys(userResponses).length * 2)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="space-y-3 bg-slate-800/40 rounded-xl p-4 sm:p-6 border border-purple-500/20">
                            {currentScenarioData.dialogue.map((line, index) => {
                              const isUser = line.speaker === 'You' || line.speaker === 'Interviewer' || line.speaker === 'Waiter';
                              const isPartner = line.speaker === 'Partner';
                              const isUserLine = line.speaker === 'You';
                              const userResponse = userResponses[index] || '';
                              const lineScore = practiceScores[index];
                              const isCurrentlySpeaking = isSpeaking[index];
                              
                              return (
                                <div key={index} className="space-y-2">
                                  <div
                                    className={cn(
                                      "flex items-start gap-3",
                                      isPartner && "flex-row-reverse"
                                    )}
                                  >
                                    {/* Message Bubble with Icon Inside */}
                                    <div className={cn(
                                      "flex-1 max-w-[85%] sm:max-w-[75%]",
                                      isPartner && "flex flex-col items-end"
                                    )}>
                                      <div className={cn(
                                        "p-3 sm:p-4 rounded-lg flex items-start gap-3",
                                        isUser
                                          ? "bg-cyan-500/20 border border-cyan-400/30"
                                          : "bg-purple-500/20 border border-purple-400/30"
                                      )}>
                                        {/* Avatar Inside Message */}
                                        <div className={cn(
                                          "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0",
                                          isUser
                                            ? "bg-cyan-500/30"
                                            : "bg-purple-500/30"
                                        )}>
                                          {isUser ? (
                                            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" />
                                          ) : (
                                            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
                                          )}
                                        </div>
                                        
                                        {/* Message Content */}
                                        <div className="flex-1 min-w-0">
                                          <div className="font-semibold text-white mb-1 text-xs sm:text-sm">{line.speaker}</div>
                                          <div className="text-cyan-100/90 text-sm sm:text-base">{line.text}</div>
                                        </div>
                                        
                                        {/* Audio Button Inside Message - Now Functional */}
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => speakText(line.text, index)}
                                          disabled={isCurrentlySpeaking || !ttsInitialized}
                                          className={cn(
                                            "flex-shrink-0",
                                            isCurrentlySpeaking 
                                              ? "text-cyan-400 animate-pulse" 
                                              : "text-cyan-300 hover:text-cyan-100"
                                          )}
                                        >
                                          {isCurrentlySpeaking ? (
                                            <PlayCircle className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                                          ) : (
                                            <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Voice Practice for "You" lines */}
                                  {isSessionActive && isUserLine && (
                                    <div className="ml-0 sm:ml-12 space-y-3">
                                      <div className="p-4 bg-cyan-500/10 border border-cyan-400/30 rounded-lg">
                                        <div className="flex items-center justify-between mb-3">
                                          <div>
                                            <div className="text-sm font-semibold text-white mb-1">Your Response:</div>
                                            <div className="text-xs text-cyan-200/70 mb-2">Try to say: "{line.text}"</div>
                                          </div>
                                          {!sttAvailable && (
                                            <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-400/30 text-xs">
                                              Use Chrome/Edge
                                            </Badge>
                                          )}
                                        </div>
                                        
                                        {/* Show what user said */}
                                        {(userResponse || interimTranscript) && (
                                          <div className="mb-3 p-3 bg-slate-700/50 rounded-lg border border-cyan-500/20">
                                            <div className="text-xs text-cyan-200/60 mb-1">You said:</div>
                                            <div className="text-sm text-white font-medium">
                                              {interimTranscript || userResponse}
                                              {interimTranscript && <span className="animate-pulse">|</span>}
                                            </div>
                                          </div>
                                        )}

                                        {/* Microphone Button */}
                                        <div className="flex items-center gap-3">
                                          <Button
                                            onClick={() => {
                                              if (isListening[index]) {
                                                stopListening();
                                              } else {
                                                startListening(index);
                                              }
                                            }}
                                            disabled={!sttAvailable || isSpeaking[index]}
                                            className={cn(
                                              "flex-1 py-6 text-base font-semibold transition-all duration-300",
                                              isListening[index]
                                                ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                                                : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                                            )}
                                          >
                                            {isListening[index] ? (
                                              <>
                                                <MicOff className="w-5 h-5 mr-2 animate-pulse" />
                                                Listening... Click to Stop
                                              </>
                                            ) : (
                                              <>
                                                <Mic className="w-5 h-5 mr-2" />
                                                Click to Speak
                                              </>
                                            )}
                                          </Button>
                                          
                                          {/* Score Display */}
                                          {lineScore !== undefined && (
                                            <div className={cn(
                                              "px-4 py-6 rounded-lg text-lg font-bold min-w-[80px] text-center border-2",
                                              lineScore >= 80 ? "bg-emerald-500/30 text-emerald-300 border-emerald-400/50" :
                                              lineScore >= 60 ? "bg-amber-500/30 text-amber-300 border-amber-400/50" :
                                              "bg-rose-500/30 text-rose-300 border-rose-400/50"
                                            )}>
                                              {lineScore}%
                                            </div>
                                          )}
                                        </div>

                                        {/* Feedback */}
                                        {lineScore !== undefined && (
                                          <div className="mt-3">
                                            {lineScore === 100 ? (
                                              <div className="p-3 bg-emerald-500/20 border border-emerald-400/30 rounded-lg flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5 text-emerald-300" />
                                                <span className="text-sm text-emerald-200 font-medium">Perfect! Excellent pronunciation! 🎉</span>
                                              </div>
                                            ) : lineScore >= 80 ? (
                                              <div className="p-3 bg-emerald-500/20 border border-emerald-400/30 rounded-lg">
                                                <div className="text-sm text-emerald-200 font-medium mb-1">Great job! Very close!</div>
                                                <div className="text-xs text-emerald-200/70">Try to match: "{line.text}"</div>
                                              </div>
                                            ) : lineScore >= 60 ? (
                                              <div className="p-3 bg-amber-500/20 border border-amber-400/30 rounded-lg">
                                                <div className="text-sm text-amber-200 font-medium mb-1">Good effort! Keep practicing!</div>
                                                <div className="text-xs text-amber-200/70">Expected: "{line.text}"</div>
                                              </div>
                                            ) : (
                                              <div className="p-3 bg-rose-500/20 border border-rose-400/30 rounded-lg">
                                                <div className="text-sm text-rose-200 font-medium mb-1">Keep trying! Listen to the example again.</div>
                                                <div className="text-xs text-rose-200/70">Click the speaker icon above to hear: "{line.text}"</div>
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {/* Instructions */}
                                        {!userResponse && !isListening[index] && (
                                          <div className="mt-3 text-xs text-cyan-200/60 flex items-center gap-2">
                                            <Lightbulb className="w-3 h-3" />
                                            <span>Click the microphone button and speak your response clearly</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Key Phrases */}
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                            <Target className="w-5 h-5 text-emerald-400" />
                            Key Phrases
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {currentScenarioData.keyPhrases.map((phrase, index) => (
                              <div
                                key={index}
                                className="p-3 bg-slate-800/40 rounded-lg border border-emerald-500/20"
                              >
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                                  <span className="text-cyan-100">{phrase}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Practice Points */}
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-amber-400" />
                            Practice Points
                          </h3>
                          <div className="space-y-2">
                            {currentScenarioData.practicePoints.map((point, index) => (
                              <div
                                key={index}
                                className="p-3 bg-slate-800/40 rounded-lg border border-amber-500/20 flex items-start gap-3"
                              >
                                <Zap className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                <span className="text-cyan-100">{point}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Practice Button */}
                        <div className="pt-4 sm:pt-6 border-t border-purple-500/20">
                          {!isSessionActive ? (
                            <div className="space-y-3">
                              {!user && (
                                <div className="p-3 bg-amber-500/20 border border-amber-400/30 rounded-lg">
                                  <p className="text-amber-300 text-sm text-center">
                                    Please log in to track your practice sessions
                                  </p>
                                </div>
                              )}
                              <div className="space-y-3">
                                <Button
                                  className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-4 sm:py-6 text-base sm:text-lg disabled:opacity-50"
                                  onClick={handleStartPracticeSession}
                                  disabled={!user}
                                >
                                  <Mic className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                  {user ? 'Start Voice Practice Session' : 'Login to Start Session'}
                                </Button>
                                {sttAvailable && (
                                  <p className="text-xs text-center text-cyan-200/70">
                                    🎤 Voice recognition ready! You'll speak your responses.
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center justify-center gap-2 text-cyan-300">
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                                <span className="text-sm sm:text-base">
                                  Session in progress... ({sessionStartTime ? Math.max(1, Math.round((new Date().getTime() - sessionStartTime.getTime()) / 60000)) : 0} min)
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Button
                                  variant="outline"
                                  className="w-full border-purple-400/30 text-purple-300 hover:bg-purple-500/20 py-4 sm:py-6 text-base sm:text-lg"
                                  onClick={() => {
                                    setIsSessionActive(false);
                                    setSessionStartTime(null);
                                    toast({
                                      title: "Session Cancelled",
                                      description: "Your session has been cancelled. No data was saved.",
                                    });
                                  }}
                                >
                                  Cancel Session
                                </Button>
                                <Button
                                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-4 sm:py-6 text-base sm:text-lg"
                                  onClick={handleEndPracticeSession}
                                >
                                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                  Complete & Save ({overallScore > 0 ? overallScore : 85}% Score)
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Placeholder for other session types
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
      <div className="relative z-10 pb-12 pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/adults/practice')}
            className="mb-8 text-cyan-300 hover:text-cyan-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Practice Sessions
          </Button>

          <Card className="bg-slate-900/60 backdrop-blur-xl border-purple-500/30 max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white bg-gradient-to-r", config.color)}>
                <Icon className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">{config.title}</h1>
              <p className="text-cyan-100/70 mb-6">{config.description}</p>
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <p className="text-cyan-100/60">This practice session is coming soon!</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuickPracticeSession;

