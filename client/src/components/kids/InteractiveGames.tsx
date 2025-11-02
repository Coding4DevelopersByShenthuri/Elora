import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import KidsApi from '@/services/KidsApi';
import KidsProgressService from '@/services/KidsProgressService';
import { GeminiService } from '@/services/GeminiService';

type GameType = 'tongue-twister' | 'word-chain' | 'story-telling' | 'pronunciation-challenge' | 'conversation-practice';

const InteractiveGames = () => {
  const navigate = useNavigate();
  const [currentGame, setCurrentGame] = useState<'menu' | 'settings'>('menu');
  const [gameScore, setGameScore] = useState(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id ? String(user.id) : 'local-user';

  // Initialize Gemini Service
  useEffect(() => {
    const initGemini = async () => {
      try {
        await GeminiService.initialize();
      } catch (error) {
        console.error('Failed to initialize Gemini:', error);
      }
    };
    initGemini();
  }, []);

  // Load game score from progress
  useEffect(() => {
    const loadScore = async () => {
      if (!isAuthenticated) return;
      try {
        const token = localStorage.getItem('speakbee_auth_token');
        if (token && token !== 'local-token') {
          const progress = await KidsApi.getProgress(token);
          const gamesPoints = (progress as any)?.details?.games?.points || 0;
          setGameScore(Number(gamesPoints));
        } else {
          const progress = await KidsProgressService.get(userId);
          const gamesPoints = (progress as any)?.details?.games?.points || 0;
          setGameScore(Number(gamesPoints));
        }
      } catch (error) {
        console.error('Error loading game score:', error);
      }
    };
    loadScore();
  }, [isAuthenticated, userId]);

  // Start a new game - navigate to the game page
  const startGame = (gameType: GameType) => {
    navigate(`/kids/games/${gameType}`);
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

export default InteractiveGames;
