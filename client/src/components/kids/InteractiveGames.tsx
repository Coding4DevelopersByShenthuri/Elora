import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trophy, Loader2, AlertCircle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import EnhancedTTS from '@/services/EnhancedTTS';
import { WhisperService } from '@/services/WhisperService';
import KidsVoiceRecorder from './KidsVoiceRecorder';
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
    // Fallback: try to find any female voice
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
  
  // Remove JSON code blocks
  let formatted = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  
  // If content is JSON-like, try to parse and extract meaningful text
  if (formatted.startsWith('{')) {
    try {
      const parsed = JSON.parse(formatted);
      const parts = [];
      
      if (parsed.content) parts.push(parsed.content);
      if (parsed.feedback) parts.push(parsed.feedback);
      if (parsed.nextStep) parts.push(parsed.nextStep);
      
      if (parts.length > 0) {
        formatted = parts.join('\n\n');
      }
    } catch (e) {
      // If parsing fails, just use the content as-is but clean it up
      formatted = formatted.replace(/^\{\s*/, '').replace(/\s*\}$/, '');
    }
  }
  
  return formatted.trim();
};

type GameType = 'tongue-twister' | 'word-chain' | 'story-telling' | 'pronunciation-challenge' | 'conversation-practice';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isEditable?: boolean; // If true, user can edit this message
  hasErrors?: boolean; // If true, AI detected errors in this message
}

const InteractiveGames = () => {
  const [currentGame, setCurrentGame] = useState<GameType | 'menu' | 'settings'>('menu');
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
  const startGame = async (gameType: GameType) => {
    if (!GeminiService.isReady()) {
      setError('AI service not ready. Please check your internet connection and ensure you are logged in.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentGame(gameType);
    setGameContent('');
    setGameInstruction('');
    setQuestions([]);
    setConversationHistory([]);

    try {
      const response = await GeminiService.generateGame({
        gameType,
        context: {
          age: 7, // Default age for young kids
          level: 'beginner',
          completedStories: []
        }
      });

      // Format the response content properly (remove JSON structure if present)
      const formattedContent = formatAIResponse(response.content);
      
      setGameContent(formattedContent);
      if (response.gameInstruction) {
        setGameInstruction(response.gameInstruction);
      }
      if (response.questions) {
        setQuestions(response.questions);
      }

      // Add AI response to conversation (only once, clean content)
      setConversationHistory([{
        role: 'assistant',
        content: formattedContent,
        timestamp: Date.now()
      }]);

      // Speak the AI's response if sound is enabled (use female voice)
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

  // Handle user input - process with AI and detect meaning
  const handleUserInput = async (input: string, existingMessage?: ConversationMessage) => {
    if (!input.trim() || !GeminiService.isReady()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // If message already exists in conversation, update it; otherwise add it
    if (existingMessage) {
      // Message already added in handleVoiceInput
    } else {
      // This shouldn't happen with voice-only, but keep as fallback
      const userMessage: ConversationMessage = {
        role: 'user',
        content: input,
        timestamp: Date.now(),
        isEditable: true,
        hasErrors: false
      };
      setConversationHistory(prev => [...prev, userMessage]);
    }

    try {
      // Get conversation history for context (exclude editable flag)
      const history = conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await GeminiService.continueGame(
        currentGame as GameType,
        input,
        history
      );

      // Format the response content properly (remove JSON structure)
      const formattedContent = formatAIResponse(response.content);

      // Add AI response to conversation (only once, clean content)
      const assistantMessage: ConversationMessage = {
        role: 'assistant',
        content: formattedContent,
        timestamp: Date.now()
      };
      setConversationHistory(prev => [...prev, assistantMessage]);

      // Check if AI detected errors in user's response
      const errorKeywords = ['wrong', 'incorrect', 'mistake', 'try again', 'not quite', 'almost', 'better', 'correction'];
      const hasErrors = errorKeywords.some(keyword => 
        formattedContent.toLowerCase().includes(keyword)
      );

      // Update user message if errors detected
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
              isEditable: true // Make editable if errors detected
            };
          }
          return updated;
        });
      }

      // Update game state if needed
      if (response.questions) {
        setQuestions(response.questions);
      }
      if (response.gameInstruction) {
        setGameInstruction(response.gameInstruction);
      }

      // Award points if provided
      if (response.points && response.points > 0) {
        handleScoreUpdate(response.points, currentGame as string);
      }

      // Speak the AI's response if sound is enabled (use female voice)
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

  // Handle voice input - automatically transcribe and send
  const handleVoiceInput = async (blob: Blob, _score: number) => {
    try {
      setIsLoading(true);
      const result = await WhisperService.transcribe(blob);
      const transcript = result.transcript.trim();
      
      if (transcript) {
        // Add user message to conversation immediately (will be editable)
        const userMessage: ConversationMessage = {
          role: 'user',
          content: transcript,
          timestamp: Date.now(),
          isEditable: true,
          hasErrors: false
        };
        setConversationHistory(prev => [...prev, userMessage]);
        
        // Process with AI (AI will detect meaning and respond)
        await handleUserInput(transcript, userMessage);
      } else {
        setError('I couldn\'t hear what you said. Please try speaking again.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Voice transcription error:', error);
      setError('Failed to understand your voice. Please try speaking again.');
      setIsLoading(false);
    }
  };

  // Update user message in conversation (for editing)
  const updateUserMessage = async (messageIndex: number, newContent: string) => {
    if (!newContent.trim()) return;
    
    // Get current state to check if we need to resend
    setConversationHistory(prev => {
      const updated = [...prev];
      if (updated[messageIndex] && updated[messageIndex].role === 'user') {
        const originalMessage = updated[messageIndex];
        const newContentTrimmed = newContent.trim();
        
        // Update the message content
        updated[messageIndex] = {
          ...originalMessage,
          content: newContentTrimmed,
          hasErrors: false // Reset error flag when editing
        };
        
        // If message was edited and had errors, resend to AI
        if (originalMessage.hasErrors && newContentTrimmed !== originalMessage.content) {
          // Resend to AI with updated content
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


  return (
    <div className="space-y-6">
      {/* Settings */}
      {currentGame === 'settings' && (
        <Card className="border-2 border-purple-300/50 bg-purple-50/40 dark:bg-purple-900/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
              <span className="flex items-center gap-3">
                <Settings className="w-5 h-5" />
                Settings
              </span>
              <Button variant="outline" size="sm" onClick={() => setCurrentGame('menu')}>
                Back to Menu
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">Sound Effects</label>
              <Button
                variant={isSoundEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              >
                {isSoundEnabled ? 'On' : 'Off'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Menu */}
      {currentGame === 'menu' && (
        <GameMenu 
          onSelectGame={startGame}
          onOpenSettings={() => setCurrentGame('settings')}
          totalScore={gameScore} 
          isGeminiReady={GeminiService.isReady()}
        />
      )}

      {/* Game Views */}
      {currentGame !== 'menu' && currentGame !== 'settings' && (
        <GameView
          gameType={currentGame}
          gameContent={gameContent}
          gameInstruction={gameInstruction}
          questions={questions}
          conversationHistory={conversationHistory}
          isLoading={isLoading}
          error={error}
          onBack={() => {
            setCurrentGame('menu');
            setGameContent('');
            setGameInstruction('');
            setQuestions([]);
            setConversationHistory([]);
          }}
      onUserInput={handleUserInput}
      onVoiceInput={handleVoiceInput}
      onUpdateMessage={updateUserMessage}
        />
      )}
    </div>
  );
};

// Game Menu Component
const GameMenu = ({ 
  onSelectGame, 
  onOpenSettings,
  totalScore, 
  isGeminiReady
}: { 
  onSelectGame: (game: GameType) => void; 
  onOpenSettings: () => void;
  totalScore: number;
  isGeminiReady: boolean;
}) => {
  const games = [
    {
      id: 'tongue-twister' as GameType,
      title: 'Tongue Twisters',
      description: 'Master tricky phrases to improve pronunciation!',
      emoji: '👅',
      color: 'from-red-400 to-pink-400'
    },
    {
      id: 'word-chain' as GameType,
      title: 'Word Chain',
      description: 'Connect words by speaking them in sequence!',
      emoji: '🔗',
      color: 'from-blue-400 to-cyan-400'
    },
    {
      id: 'story-telling' as GameType,
      title: 'Story Telling',
      description: 'Create and tell your own stories with AI!',
      emoji: '📖',
      color: 'from-green-400 to-emerald-400'
    },
    {
      id: 'pronunciation-challenge' as GameType,
      title: 'Pronunciation Master',
      description: 'Perfect your pronunciation with AI challenges!',
      emoji: '🎯',
      color: 'from-purple-400 to-indigo-400'
    },
    {
      id: 'conversation-practice' as GameType,
      title: 'Chat Practice',
      description: 'Practice real conversations with AI!',
      emoji: '💬',
      color: 'from-orange-400 to-yellow-400'
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 w-full lg:max-w-7xl xl:max-w-[1400px] mx-auto">

      {/* Score Display */}
      <Card className="border-2 border-yellow-300/50 bg-yellow-50/40 dark:bg-yellow-900/10 backdrop-blur-sm shadow-lg">
        <CardContent className="py-4 sm:py-6 text-center px-3 sm:px-4">
          <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-2 sm:mb-3" />
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-yellow-700 dark:text-yellow-300 mb-2">
            {totalScore}
          </div>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200 font-semibold">
            Current Session Points
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Points sync to your total score!
          </p>
        </CardContent>
      </Card>

      {/* Game Selection */}
      <div className="text-center mb-4 sm:mb-6 px-3 sm:px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#118AB2] bg-clip-text text-transparent mb-2 drop-shadow-sm">
          Choose Your AI Game!
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 font-medium">
          Pick a fun game powered by AI! 🎮
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6">
        {games.map((game, index) => {
          const cardBgColors = [
            'bg-red-50/60 dark:bg-red-900/10',
            'bg-blue-50/60 dark:bg-blue-900/10',
            'bg-green-50/60 dark:bg-green-900/10',
            'bg-purple-50/60 dark:bg-purple-900/10',
            'bg-orange-50/60 dark:bg-orange-900/10'
          ];
          const cardBorders = [
            'border-red-200 dark:border-red-600',
            'border-blue-200 dark:border-blue-600',
            'border-green-200 dark:border-green-600',
            'border-purple-200 dark:border-purple-600',
            'border-orange-200 dark:border-orange-600'
          ];
          
          return (
            <Card
              key={game.id}
              className={cn(
                "border-2 hover:border-[#FF6B6B] dark:hover:border-[#FF6B6B] transition-all duration-300 hover:scale-105 cursor-pointer group backdrop-blur-sm",
                cardBgColors[index],
                cardBorders[index],
                !isGeminiReady && "opacity-60"
              )}
              onClick={() => isGeminiReady && onSelectGame(game.id)}
            >
              <CardContent className="p-4 sm:p-5 md:p-6 text-center space-y-3 sm:space-y-4">
                <div className={cn(
                  "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto rounded-full flex items-center justify-center text-3xl sm:text-4xl md:text-5xl bg-gradient-to-br",
                  game.color,
                  "group-hover:scale-110 transition-transform duration-300"
                )}>
                  {game.emoji}
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {game.title}
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-800 dark:text-gray-300 font-medium">
                  {game.description}
                </p>
                <Button 
                  className="w-full rounded-lg sm:rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] hover:from-[#4ECDC4] hover:to-[#FF6B6B] text-sm sm:text-base font-bold transition-all hover:scale-105"
                  disabled={!isGeminiReady}
                >
                  {isGeminiReady ? 'Play Now!' : 'Setup Required'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Settings Button */}
      <div className="text-center pt-4">
            <Button
              variant="outline"
          onClick={onOpenSettings}
              className="rounded-xl"
            >
          <Settings className="w-4 h-4 mr-2" />
          Settings
            </Button>
          </div>
        </div>
  );
};

// Game View Component
const GameView = ({
  gameType,
  gameContent,
  gameInstruction,
  questions,
  conversationHistory,
  isLoading,
  error,
  onBack, 
  onUserInput,
  onVoiceInput,
  onUpdateMessage
}: {
  gameType: GameType;
  gameContent: string;
  gameInstruction: string;
  questions: Array<{ question: string; correctAnswer: string; options?: string[] }>;
  conversationHistory: ConversationMessage[];
  isLoading: boolean;
  error: string | null;
  onBack: () => void; 
  onUserInput: (input: string, existingMessage?: ConversationMessage) => void;
  onVoiceInput: (blob: Blob, score: number) => void;
  onUpdateMessage: (index: number, content: string) => void;
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const gameTitles: Record<GameType, string> = {
    'tongue-twister': '👅 Tongue Twisters',
    'word-chain': '🔗 Word Chain',
    'story-telling': '📖 Story Telling',
    'pronunciation-challenge': '🎯 Pronunciation Master',
    'conversation-practice': '💬 Chat Practice'
  };

  const startEditing = (index: number, currentContent: string) => {
    setEditingIndex(index);
    setEditValue(currentContent);
  };

  const saveEdit = (index: number) => {
    if (editValue.trim()) {
      onUpdateMessage(index, editValue.trim());
      setEditingIndex(null);
      setEditValue('');
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  return (
    <Card className="border-2 border-purple-300/50 bg-purple-50/40 dark:bg-purple-900/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
          <span className="flex items-center gap-3">
            {gameTitles[gameType]}
          </span>
          <Button variant="outline" size="sm" onClick={onBack} className="rounded-xl">
            Back to Menu
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
            <p className="text-gray-700 dark:text-gray-300 font-semibold">{gameInstruction}</p>
          </div>
        )}

        {/* Game Content - Only show if no conversation history (initial game start) */}
        {gameContent && conversationHistory.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700">
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
              {gameContent}
            </p>
          </div>
        )}

        {/* Questions (for Quiz mode) */}
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
                        onClick={() => onUserInput(opt)}
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

        {/* Conversation History - Voice Only Flow - Chat Style */}
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

        {/* Voice Input - Primary and Only Input Method */}
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
              onCorrectPronunciation={onVoiceInput}
              maxDuration={30}
              autoAnalyze={true}
              disabled={isLoading}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveGames;
