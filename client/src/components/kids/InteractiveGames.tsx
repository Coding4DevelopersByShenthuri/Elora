import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trophy, Loader2, Sparkles, AlertCircle, Settings } from 'lucide-react';
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

type GameType = 'tongue-twister' | 'word-chain' | 'story-telling' | 'pronunciation-challenge' | 'conversation-practice';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
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

      setGameContent(response.content);
      if (response.gameInstruction) {
        setGameInstruction(response.gameInstruction);
      }
      if (response.questions) {
        setQuestions(response.questions);
      }

      // Add AI response to conversation
      setConversationHistory([{
        role: 'assistant',
        content: response.content,
        timestamp: Date.now()
      }]);

      // Speak the AI's response if sound is enabled (use female voice)
      if (isSoundEnabled && response.content) {
        const femaleVoiceId = findFemaleVoiceId();
        await EnhancedTTS.speak(response.content, { 
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

  // Handle user input (text or voice)
  const handleUserInput = async (input: string) => {
    if (!input.trim() || isLoading || !GeminiService.isReady()) return;

    setIsLoading(true);
    setError(null);

    // Add user message to conversation
    const userMessage: ConversationMessage = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    };
    setConversationHistory(prev => [...prev, userMessage]);

    try {
      // Get conversation history for context
      const history = conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await GeminiService.continueGame(
        currentGame as GameType,
        input,
        history
      );

      // Add AI response to conversation
      const assistantMessage: ConversationMessage = {
        role: 'assistant',
        content: response.content,
        timestamp: Date.now()
      };
      setConversationHistory(prev => [...prev, assistantMessage]);

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
      if (isSoundEnabled && response.content) {
        const femaleVoiceId = findFemaleVoiceId();
        await EnhancedTTS.speak(response.content, { 
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

  // Handle voice input
  const handleVoiceInput = async (blob: Blob, _score: number) => {
    try {
      const result = await WhisperService.transcribe(blob);
      const transcript = result.transcript.trim();
      if (transcript) {
        await handleUserInput(transcript);
      }
    } catch (error) {
      console.error('Voice transcription error:', error);
      setError('Failed to understand your voice. Please try again or type your response.');
    }
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
      {/* Status Badge */}
      <Card className="border-2 border-blue-300/50 bg-blue-50/40 dark:bg-blue-900/10 backdrop-blur-sm shadow-lg">
        <CardContent className="py-4 sm:py-6 text-center px-3 sm:px-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            {isGeminiReady ? (
              <>
                <Sparkles className="w-5 h-5 text-green-600" />
                <span className="text-lg font-bold text-green-700 dark:text-green-300">
                  AI Games Ready!
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
                  Setup Required
                </span>
              </>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isGeminiReady 
              ? 'All games are powered by Google Gemini AI for endless fun!'
              : 'Please configure your API key to start playing AI games.'}
          </p>
        </CardContent>
      </Card>

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
          Choose Your AI Game! 🤖
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
  onVoiceInput
}: {
  gameType: GameType;
  gameContent: string;
  gameInstruction: string;
  questions: Array<{ question: string; correctAnswer: string; options?: string[] }>;
  conversationHistory: ConversationMessage[];
  isLoading: boolean;
  error: string | null;
  onBack: () => void; 
  onUserInput: (input: string) => void;
  onVoiceInput: (blob: Blob, score: number) => void;
}) => {
  const [textInput, setTextInput] = useState('');

  const gameTitles: Record<GameType, string> = {
    'tongue-twister': '👅 Tongue Twisters',
    'word-chain': '🔗 Word Chain',
    'story-telling': '📖 Story Telling',
    'pronunciation-challenge': '🎯 Pronunciation Master',
    'conversation-practice': '💬 Chat Practice'
  };

  const handleSubmit = () => {
    if (textInput.trim()) {
      onUserInput(textInput.trim());
      setTextInput('');
    }
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

        {/* Game Content */}
        {gameContent && (
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

        {/* Conversation History */}
        {conversationHistory.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {conversationHistory.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "rounded-lg p-3",
                  msg.role === 'user'
                    ? "bg-blue-100 dark:bg-blue-900/30 ml-auto max-w-[80%]"
                    : "bg-gray-100 dark:bg-gray-700 mr-auto max-w-[80%]"
                )}
              >
                <p className="text-sm font-semibold mb-1">
                  {msg.role === 'user' ? 'You' : 'AI Teacher'}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {msg.content}
            </p>
          </div>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Type your response..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="flex-1"
              disabled={isLoading}
            />
              <Button 
              onClick={handleSubmit}
              disabled={isLoading || !textInput.trim()}
              className="bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4]"
            >
              Send
              </Button>
          </div>

          {/* Voice Input */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Or speak your response:</p>
            <KidsVoiceRecorder
              targetWord="response"
              onCorrectPronunciation={onVoiceInput}
              maxDuration={30}
              autoAnalyze={true}
            />
          </div>
            </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveGames;
