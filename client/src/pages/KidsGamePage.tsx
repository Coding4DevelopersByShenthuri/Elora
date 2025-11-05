import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trophy, Loader2, AlertCircle, ArrowLeft, Volume2, Sparkles, RotateCcw, Star, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import EnhancedTTS from '@/services/EnhancedTTS';
import { WhisperService } from '@/services/WhisperService';
import KidsVoiceRecorder from '@/components/kids/KidsVoiceRecorder';
import { useAuth } from '@/contexts/AuthContext';
import KidsApi from '@/services/KidsApi';
import KidsProgressService from '@/services/KidsProgressService';
import { GeminiService } from '@/services/GeminiService';

// Helper function to find a female voice ID for TTS
const findFemaleVoiceId = (): string | undefined => {
  try {
    const femaleVoices = EnhancedTTS.getVoicesByFilter({ lang: 'en', gender: 'female' });
    if (femaleVoices.length > 0) {
      return femaleVoices[0].id;
    }
    const allVoices = EnhancedTTS.getVoices();
    const anyFemale = allVoices.find(v => v.gender === 'female');
    return anyFemale?.id;
  } catch (error) {
    console.warn('Could not find female voice, using default:', error);
    return undefined;
  }
};

// Helper function to format AI response (remove JSON structure)
const formatAIResponse = (content: string): string => {
  if (!content) return '';
  
  let formatted = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  
  // If the content is raw JSON, try to extract readable text from it
  if (formatted.startsWith('{')) {
    try {
      const parsed = JSON.parse(formatted);
      const parts = [];
      
      if (parsed.content) parts.push(parsed.content);
      if (parsed.feedback) parts.push(parsed.feedback);
      if (parsed.nextStep) parts.push(parsed.nextStep);
      if (parsed.gameInstruction) parts.push(parsed.gameInstruction);
      
      if (parts.length > 0) {
        formatted = parts.join(' ');
      } else {
        // If no parts found, just remove JSON structure
        formatted = formatted.replace(/^\{\s*/, '').replace(/\s*\}$/, '');
      }
    } catch (e) {
      // If parsing fails, try to extract string values using regex
      const stringMatches = formatted.match(/"([^"]+)":\s*"([^"]+)"/g);
      if (stringMatches) {
        const textParts: string[] = [];
        stringMatches.forEach(match => {
          const keyValue = match.match(/"([^"]+)":\s*"([^"]+)"/);
          if (keyValue) {
            const key = keyValue[1];
            const value = keyValue[2];
            if (key === 'content' || key === 'feedback' || key === 'nextStep' || key === 'gameInstruction') {
              textParts.push(value);
            }
          }
        });
        if (textParts.length > 0) {
          formatted = textParts.join(' ');
        } else {
          formatted = formatted.replace(/^\{\s*/, '').replace(/\s*\}$/, '');
        }
      } else {
        formatted = formatted.replace(/^\{\s*/, '').replace(/\s*\}$/, '');
      }
    }
  }
  
  return formatted.trim();
};

type GameType = 'tongue-twister' | 'word-chain' | 'story-telling' | 'pronunciation-challenge' | 'conversation-practice';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isEditable?: boolean;
  hasErrors?: boolean;
}

const gameTitles: Record<GameType, { title: string; emoji: string; description: string }> = {
  'tongue-twister': { title: 'Tongue Twisters', emoji: '👅', description: 'Master tricky phrases to improve pronunciation!' },
  'word-chain': { title: 'Word Chain', emoji: '🔗', description: 'Connect words by speaking them in sequence!' },
  'story-telling': { title: 'Story Telling', emoji: '📖', description: 'Create and tell your own stories with AI!' },
  'pronunciation-challenge': { title: 'Pronunciation Master', emoji: '🎯', description: 'Perfect your pronunciation with AI challenges!' },
  'conversation-practice': { title: 'Chat Practice', emoji: '💬', description: 'Practice real conversations with AI!' }
};

const KidsGamePage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [gameScore, setGameScore] = useState(0);
  const [gameContent, setGameContent] = useState<string>('');
  const [gameInstruction, setGameInstruction] = useState<string>('');
  const [questions, setQuestions] = useState<Array<{ question: string; correctAnswer: string; options?: string[] }>>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id ? String(user.id) : 'local-user';
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [currentDifficulty, setCurrentDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [gameCompleted, setGameCompleted] = useState(false);

  const currentGame = gameId as GameType;

  // Validate game ID
  useEffect(() => {
    const validGames: GameType[] = ['tongue-twister', 'word-chain', 'story-telling', 'pronunciation-challenge', 'conversation-practice'];
    if (!gameId || !validGames.includes(currentGame)) {
      navigate('/kids/young?section=games');
    }
  }, [gameId, currentGame, navigate]);

  // Initialize Gemini Service
  useEffect(() => {
    const initGemini = async () => {
      try {
        await GeminiService.initialize();
      } catch (error) {
        console.error('Failed to initialize Gemini:', error);
        setError('Failed to initialize AI game service');
      }
    };
    initGemini();
  }, []);

  // Start game automatically when component mounts
  useEffect(() => {
    if (currentGame && GeminiService.isReady()) {
      startGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGame]);

  // Handle score updates with backend sync
  const handleScoreUpdate = async (points: number, gameType: string) => {
    setGameScore(prev => prev + points);
    
    if (!isAuthenticated) return;
    
    try {
      const token = localStorage.getItem('speakbee_auth_token');
      if (token && token !== 'local-token') {
        const current = await KidsApi.getProgress(token);
        const currentPoints = (current as any)?.points || 0;
        const details = { ...((current as any).details || {}) };
        details.games = details.games || {};
        details.games.points = Number(details.games.points || 0) + points;
        const arr = Array.isArray(details.games.types) ? details.games.types : [];
        if (gameType && !arr.includes(gameType)) arr.push(gameType);
        details.games.types = arr;
        details.games.attempts = Number(details.games.attempts || 0) + 1;
        await KidsApi.updateProgress(token, {
          points: currentPoints + points,
          details
        });
      } else {
        await KidsProgressService.update(userId, (progress) => {
          const anyP: any = progress as any;
          const details = { ...(anyP.details || {}) };
          details.games = details.games || {};
          details.games.points = Number(details.games.points || 0) + points;
          const arr = Array.isArray(details.games.types) ? details.games.types : [];
          if (gameType && !arr.includes(gameType)) arr.push(gameType);
          details.games.types = arr;
          details.games.attempts = Number(details.games.attempts || 0) + 1;
          return {
            ...progress,
            points: progress.points + points,
            details
          } as any;
        });
      }
    } catch (error) {
      console.error('Error updating game score:', error);
    }
  };

  // Start a new game
  const startGame = async () => {
    if (!GeminiService.isReady()) {
      setError('AI service not ready. Please check your internet connection and ensure you are logged in.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGameContent('');
    setGameInstruction('');
    setQuestions([]);
    setConversationHistory([]);
    setCurrentRound(0);
    setConsecutiveCorrect(0);
    setShowCelebration(false);
    setCurrentDifficulty('beginner');
    setGameCompleted(false);
    setGameScore(0); // Reset game score for new game

    try {
      const response = await GeminiService.generateGame({
        gameType: currentGame,
        context: {
          age: 7,
          level: currentDifficulty,
          completedStories: []
        }
      });

      const formattedContent = formatAIResponse(response.content);
      
      setGameContent(formattedContent);
      if (response.gameInstruction) {
        setGameInstruction(response.gameInstruction);
      }
      if (response.questions) {
        setQuestions(response.questions);
      }

      setConversationHistory([{
        role: 'assistant',
        content: formattedContent,
        timestamp: Date.now()
      }]);

      if (isSoundEnabled && formattedContent) {
        const femaleVoiceId = findFemaleVoiceId();
        await EnhancedTTS.speak(formattedContent, { 
          voice: femaleVoiceId,
          rate: 0.9, 
          emotion: 'happy' 
        }).catch(() => {});
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start game. Please try again.');
      console.error('Game start error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user input
  const handleUserInput = async (input: string, existingMessage?: ConversationMessage) => {
    if (!input.trim() || !GeminiService.isReady()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    let updatedHistory = [...conversationHistory];
    
    if (!existingMessage) {
      const userMessage: ConversationMessage = {
        role: 'user',
        content: input,
        timestamp: Date.now(),
        isEditable: true,
        hasErrors: false
      };
      updatedHistory = [...conversationHistory, userMessage];
      setConversationHistory(updatedHistory);
    }

    try {
      const history = updatedHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await GeminiService.continueGame(
        currentGame,
        input,
        history
      );
      
      // Auto-advance difficulty based on performance
      if (currentRound >= 5 && currentDifficulty === 'beginner') {
        setCurrentDifficulty('intermediate');
      } else if (currentRound >= 15 && currentDifficulty === 'intermediate') {
        setCurrentDifficulty('advanced');
      }

      const formattedContent = formatAIResponse(response.content);

      const assistantMessage: ConversationMessage = {
        role: 'assistant',
        content: formattedContent,
        timestamp: Date.now()
      };
      setConversationHistory(prev => [...prev, assistantMessage]);

      const errorKeywords = ['wrong', 'incorrect', 'mistake', 'try again', 'not quite', 'almost', 'better', 'correction'];
      const hasErrors = errorKeywords.some(keyword => 
        formattedContent.toLowerCase().includes(keyword)
      );

      if (hasErrors && existingMessage) {
        setConversationHistory(prev => {
          const updated = [...prev];
          const userIndex = updated.findIndex((msg, idx) => 
            msg.role === 'user' && msg.content === input && idx < updated.length - 1
          );
          if (userIndex !== -1) {
            updated[userIndex] = {
              ...updated[userIndex],
              hasErrors: true,
              isEditable: true
            };
          }
          return updated;
        });
      }

      if (response.questions) {
        setQuestions(response.questions);
      }
      if (response.gameInstruction) {
        setGameInstruction(response.gameInstruction);
      }

      // Always award points when AI responds (even if no explicit points in response)
      // Award based on correctness and round number
      let pointsToAward = 0;
      if (response.points && response.points > 0) {
        pointsToAward = response.points;
      } else {
        // Award default points based on round and difficulty
        const basePoints = currentDifficulty === 'beginner' ? 5 : currentDifficulty === 'intermediate' ? 10 : 15;
        pointsToAward = basePoints + consecutiveCorrect;
      }
      
      if (pointsToAward > 0) {
        handleScoreUpdate(pointsToAward, currentGame);
        
        // Show celebration for points
        setShowCelebration(true);
        setConsecutiveCorrect(prev => prev + 1);
        setCurrentRound(prev => prev + 1);
        setTimeout(() => setShowCelebration(false), 3000);
      }
      
      // Check if game should end (max rounds or explicit end signal)
      const shouldEndGame = response.gameEnd || currentRound >= 20 || 
        (formattedContent.toLowerCase().includes('great job') && formattedContent.toLowerCase().includes('completed')) ||
        (formattedContent.toLowerCase().includes('excellent') && formattedContent.toLowerCase().includes('finished'));
      
      if (shouldEndGame && !gameCompleted) {
        // Award completion bonus first
        const completionBonus = Math.max(50, currentRound * 3);
        if (completionBonus > 0) {
          await handleScoreUpdate(completionBonus, currentGame);
        }
        
        setGameCompleted(true);
        
        // Show final celebration
        setShowCelebration(true);
        
        // Play completion message with updated score
        setTimeout(() => {
          const finalScore = gameScore + completionBonus;
          if (isSoundEnabled) {
            const completionMessage = `Congratulations! You completed the game with ${finalScore} points! Great job!`;
            EnhancedTTS.speak(completionMessage, { 
              voice: findFemaleVoiceId(),
              rate: 0.9, 
              emotion: 'excited' 
            }).catch(() => {});
          }
        }, 500);
        
        setTimeout(() => {
          setShowCelebration(false);
        }, 5000);
      }

      if (isSoundEnabled && formattedContent) {
        const femaleVoiceId = findFemaleVoiceId();
        await EnhancedTTS.speak(formattedContent, { 
          voice: femaleVoiceId,
          rate: 0.9, 
          emotion: 'happy' 
        }).catch(() => {});
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process your input. Please try again.');
      console.error('Input processing error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle voice input - optimized for immediate detection
  const handleVoiceInput = async (blob: Blob, _score: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use Whisper with optimized settings for games/conversations
      const result = await WhisperService.transcribe(blob, {
        language: 'en',
        prompt: conversationHistory.length > 0 
          ? conversationHistory[conversationHistory.length - 1].content 
          : gameContent // Use context to improve recognition
      });
      
      const transcript = result.transcript.trim();
      
      if (transcript && transcript.length >= 2) { // Accept transcripts with at least 2 characters
        console.log('✅ Game voice input received:', transcript);
        
        // Award points for speaking (engagement bonus)
        const engagementPoints = 2;
        handleScoreUpdate(engagementPoints, currentGame);
        
        const userMessage: ConversationMessage = {
          role: 'user',
          content: transcript,
          timestamp: Date.now(),
          isEditable: true,
          hasErrors: false
        };
        setConversationHistory(prev => [...prev, userMessage]);
        
        // Process immediately - AI will respond right away and award more points
        await handleUserInput(transcript, userMessage);
      } else {
        // If transcript is too short or empty, give user a chance to try again
        setError('I couldn\'t hear you clearly. Please try speaking again. Speak a bit louder or closer to the microphone.');
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('Voice transcription error:', error);
      
      // More user-friendly error messages
      if (error.message?.includes('timeout')) {
        setError('I\'m still listening! Please speak clearly and try again.');
      } else if (error.message?.includes('No speech')) {
        setError('I didn\'t hear anything. Please click the microphone and speak again.');
      } else {
        setError('Let\'s try again! Please speak clearly into the microphone.');
      }
      setIsLoading(false);
    }
  };

  // Update user message
  const updateUserMessage = async (messageIndex: number, newContent: string) => {
    if (!newContent.trim()) return;
    
    setConversationHistory(prev => {
      const updated = [...prev];
      if (updated[messageIndex] && updated[messageIndex].role === 'user') {
        const originalMessage = updated[messageIndex];
        const newContentTrimmed = newContent.trim();
        
        updated[messageIndex] = {
          ...originalMessage,
          content: newContentTrimmed,
          hasErrors: false
        };
        
        if (originalMessage.hasErrors && newContentTrimmed !== originalMessage.content) {
          setIsLoading(true);
          handleUserInput(newContentTrimmed, updated[messageIndex]).catch(err => {
            console.error('Error resending message:', err);
            setIsLoading(false);
          });
        }
      }
      return updated;
    });
  };

  const startEditing = (index: number, currentContent: string) => {
    setEditingIndex(index);
    setEditValue(currentContent);
  };

  const saveEdit = (index: number) => {
    if (editValue.trim()) {
      updateUserMessage(index, editValue.trim());
      setEditingIndex(null);
      setEditValue('');
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  // Replay AI message
  const replayAIMessage = async (content: string) => {
    if (!isSoundEnabled || !content.trim()) return;
    
    try {
      const femaleVoiceId = findFemaleVoiceId();
      await EnhancedTTS.speak(content, { 
        voice: femaleVoiceId,
        rate: 0.9, 
        emotion: 'happy' 
      });
    } catch (error) {
      console.error('Error replaying AI message:', error);
    }
  };

  if (!currentGame || !gameTitles[currentGame]) {
    return null;
  }

  const gameInfo = gameTitles[currentGame];

  return (
    <div className="min-h-screen pb-16 sm:pb-20 pt-24 sm:pt-32 md:pt-40 relative overflow-hidden">
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </div>
          ))}
        </div>
      )}

      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
        <Card className="border-2 border-purple-300/50 bg-purple-50/40 dark:bg-purple-900/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{gameInfo.emoji}</span>
                <span>{gameInfo.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={startGame}
                  className="rounded-xl text-green-600 hover:bg-green-50"
                  disabled={isLoading}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restart
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/kids/young?section=games')} 
                  className="rounded-xl text-blue-600"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Games
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                  className="rounded-xl"
                >
                  {isSoundEnabled ? '🔊' : '🔇'}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Display */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border-2 border-yellow-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
                    {gameScore} Points
                  </span>
                </div>
                {currentRound > 0 && (
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Round {currentRound}
                      </span>
                    </div>
                    {consecutiveCorrect > 0 && (
                      <div className="flex items-center gap-1">
                        <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {consecutiveCorrect} in a row! 🔥
                        </span>
                      </div>
                    )}
                    <div className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap",
                      currentDifficulty === 'beginner' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                      currentDifficulty === 'intermediate' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                      currentDifficulty === 'advanced' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    )}>
                      {currentDifficulty.toUpperCase()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 rounded-lg p-4">
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">AI is thinking...</span>
              </div>
            )}

            {/* Game Instruction */}
            {gameInstruction && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border-2 border-blue-200">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    AI Teacher
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => replayAIMessage(gameInstruction)}
                    className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                    disabled={!isSoundEnabled}
                    title="Replay instruction"
                  >
                    <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </Button>
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-semibold">{gameInstruction}</p>
              </div>
            )}

            {/* Game Content */}
            {gameContent && conversationHistory.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    AI Teacher
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => replayAIMessage(gameContent)}
                    className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                    disabled={!isSoundEnabled}
                    title="Replay message"
                  >
                    <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </Button>
                </div>
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {gameContent}
                </p>
              </div>
            )}

            {/* Questions */}
            {questions.length > 0 && (
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={idx} className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border-2 border-yellow-200">
                    <h4 className="font-bold text-lg mb-2">{q.question}</h4>
                    {q.options && (
                      <div className="space-y-2 mt-3">
                        {q.options.map((opt, optIdx) => (
                          <Button 
                            key={optIdx}
                            variant="outline"
                            className="w-full text-left justify-start"
                            onClick={() => handleUserInput(opt)}
                          >
                            {opt}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Conversation History */}
            {conversationHistory.length > 0 && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {conversationHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "rounded-lg p-4 transition-all",
                      msg.role === 'user'
                        ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 ml-auto max-w-[85%]"
                        : "bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 mr-auto max-w-[85%]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-bold">
                        {msg.role === 'user' ? 'You' : 'AI Teacher'}
                      </p>
                      <div className="flex items-center gap-2">
                        {msg.role === 'assistant' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => replayAIMessage(msg.content)}
                            className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                            disabled={!isSoundEnabled}
                            title="Replay message"
                          >
                            <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </Button>
                        )}
                        {msg.role === 'user' && msg.isEditable && !isLoading && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(idx, msg.content)}
                            className="h-6 px-2 text-xs"
                            disabled={editingIndex === idx}
                          >
                            {editingIndex === idx ? 'Editing...' : '✏️ Edit'}
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {editingIndex === idx ? (
                      <div className="space-y-2">
                        <Input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && saveEdit(idx)}
                          className="w-full text-sm"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => saveEdit(idx)}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={!editValue.trim()}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className={cn(
                          "text-sm whitespace-pre-wrap leading-relaxed",
                          msg.role === 'user' 
                            ? "text-blue-900 dark:text-blue-100" 
                            : "text-gray-800 dark:text-gray-200"
                        )}>
                          {msg.content}
                        </p>
                        {msg.hasErrors && (
                          <div className="flex items-center gap-2 mt-2">
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                            <p className="text-xs text-orange-600 dark:text-orange-400 italic">
                              AI detected some mistakes. Click Edit to correct!
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Game Completion Message */}
            {gameCompleted && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-2 border-green-300 dark:border-green-700">
                <div className="text-center space-y-4">
                  <div className="text-4xl mb-2">🎉</div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    Game Completed!
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    You earned <span className="font-bold text-green-600 dark:text-green-400">{gameScore} points</span> in this game! 🎉
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Points have been saved to your total score!
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={startGame}
                      className="bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] hover:from-[#4ECDC4] hover:to-[#FF6B6B] text-white"
                    >
                      Play Again
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/kids/young?section=games')}
                    >
                      Back to Games
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Voice Input */}
            {!gameCompleted && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-700">
              <div className="text-center space-y-4">
                <div>
                  <p className="text-base font-bold text-gray-800 dark:text-gray-200 mb-2">
                    🎤 Speak Your Response
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click the microphone and speak! The AI will listen and understand what you say.
                  </p>
                </div>
                <KidsVoiceRecorder
                  targetWord="response"
                  onCorrectPronunciation={handleVoiceInput}
                  maxDuration={30}
                  autoAnalyze={false}
                  skipPronunciationCheck={true}
                  disabled={isLoading || gameCompleted}
                />
              </div>
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KidsGamePage;

