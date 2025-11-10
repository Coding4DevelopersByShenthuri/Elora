import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import KidsApi from '@/services/KidsApi';
import KidsProgressService from '@/services/KidsProgressService';
import TeenApi from '@/services/TeenApi';
import { GeminiService } from '@/services/GeminiService';
import StoryWordsService from '@/services/StoryWordsService';

type GameType = 'tongue-twister' | 'word-chain' | 'story-telling' | 'pronunciation-challenge' | 'conversation-practice' | 
  'debate-club' | 'critical-thinking' | 'research-challenge' | 'presentation-master' | 'ethics-discussion';

interface InteractiveGamesProps {
  isTeenKids?: boolean;
}

const InteractiveGames = ({ isTeenKids }: InteractiveGamesProps = {}) => {
  const location = useLocation();
  
  // Auto-detect if we're in teen kids context
  const isTeenContext = isTeenKids !== undefined ? isTeenKids : 
    location.pathname.includes('/kids/teen') || 
    document.referrer.includes('/kids/teen') ||
    (() => {
      try {
        const userId = localStorage.getItem('speakbee_current_user') 
          ? JSON.parse(localStorage.getItem('speakbee_current_user')!).id || 'anonymous'
          : 'anonymous';
        const enrolledStories = StoryWordsService.getEnrolledStories(userId);
        const teenStoryIds = ['mystery-detective', 'space-explorer-teen', 'environmental-hero', 'tech-innovator', 
          'global-citizen', 'future-leader', 'scientific-discovery', 'social-media-expert', 
          'ai-ethics-explorer', 'digital-security-guardian'];
        return enrolledStories.some(e => teenStoryIds.includes(e.storyId));
      } catch {
        return false;
      }
    })();
  const navigate = useNavigate();
  const [gameScore, setGameScore] = useState(0);
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
          if (isTeenContext) {
            const dashboard = await TeenApi.getDashboard(token);
            const points = (dashboard as any)?.points ?? (dashboard as any)?.progress?.points ?? 0;
            setGameScore(Number(points));
            return;
          }
          const progress = await KidsApi.getProgress(token);
          const gamesPoints = (progress as any)?.details?.games?.points || 0;
          setGameScore(Number(gamesPoints));
        } else if (!isTeenContext) {
          const progress = await KidsProgressService.get(userId);
          const gamesPoints = (progress as any)?.details?.games?.points || 0;
          setGameScore(Number(gamesPoints));
        } else {
          setGameScore(0);
        }
      } catch (error) {
        console.error('Error loading game score:', error);
      }
    };
    loadScore();
  }, [isAuthenticated, userId]);

  // Start a new game - navigate to the game page with context
  const startGame = (gameType: GameType) => {
    if (isTeenContext) {
      navigate(`/kids/games/${gameType}?teen=true`);
    } else {
      navigate(`/kids/games/${gameType}`);
    }
  };


  return (
    <div className="space-y-6">
      <GameMenu 
        onSelectGame={startGame}
        totalScore={gameScore} 
        isGeminiReady={GeminiService.isReady()}
        isTeenKids={isTeenContext}
      />
    </div>
  );
};

// Game Menu Component
const GameMenu = ({
  onSelectGame,
  totalScore,
  isGeminiReady,
  isTeenKids = false
}: {
  onSelectGame: (game: GameType) => void; 
  totalScore: number;
  isGeminiReady: boolean;
  isTeenKids?: boolean;
}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  // Base games for young kids
  const youngGames = [
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

  // Advanced games for teen kids
  const teenGames = [
    {
      id: 'debate-club' as GameType,
      title: 'Debate Club',
      description: 'Engage in structured debates on real-world topics!',
      emoji: '⚖️',
      color: 'from-indigo-400 to-purple-400'
    },
    {
      id: 'critical-thinking' as GameType,
      title: 'Critical Thinking',
      description: 'Solve complex problems and analyze arguments!',
      emoji: '🧠',
      color: 'from-violet-400 to-fuchsia-400'
    },
    {
      id: 'research-challenge' as GameType,
      title: 'Research Challenge',
      description: 'Present findings on advanced topics with AI feedback!',
      emoji: '🔬',
      color: 'from-cyan-400 to-blue-400'
    },
    {
      id: 'presentation-master' as GameType,
      title: 'Presentation Master',
      description: 'Practice professional presentations and public speaking!',
      emoji: '📊',
      color: 'from-emerald-400 to-teal-400'
    },
    {
      id: 'ethics-discussion' as GameType,
      title: 'Ethics Discussion',
      description: 'Explore ethical dilemmas and moral reasoning!',
      emoji: '🤔',
      color: 'from-rose-400 to-pink-400'
    },
    {
      id: 'pronunciation-challenge' as GameType,
      title: 'Advanced Pronunciation',
      description: 'Master complex phrases and professional speech!',
      emoji: '🎯',
      color: 'from-purple-400 to-indigo-400'
    },
    {
      id: 'conversation-practice' as GameType,
      title: 'Professional Conversation',
      description: 'Practice business and academic conversations!',
      emoji: '💼',
      color: 'from-orange-400 to-yellow-400'
    }
  ];

  const games = isTeenKids ? teenGames : youngGames;
  const cardsPerPage = 6;
  const totalPages = Math.ceil(games.length / cardsPerPage);
  const startIndex = (currentPage - 1) * cardsPerPage;
  const paginatedGames = games.slice(startIndex, startIndex + cardsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [isTeenKids]);

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

      {/* Game Selection with History Button */}
      <div className="text-center mb-4 sm:mb-6 px-3 sm:px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#118AB2] bg-clip-text text-transparent mb-2 drop-shadow-sm">
          {isTeenKids ? 'Choose Your Advanced Challenge!' : 'Choose Your AI Game!'}
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 font-medium mb-4">
          {isTeenKids ? 'Pick an advanced challenge powered by AI! 🚀' : 'Pick a fun game powered by AI! 🎮'}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/kids/games/history')}
          className="rounded-xl border-2 border-purple-300 dark:border-purple-600 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 bg-purple-50/40 dark:bg-purple-900/10"
        >
          <History className="w-4 h-4 mr-2" />
          View All Game History
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedGames.map((game, index) => {
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
          
          const colorIndex = startIndex + index;
          return (
            <Card
              key={game.id}
              className={cn(
                "h-full border-2 hover:border-[#FF6B6B] dark:hover:border-[#FF6B6B] transition-all duration-300 group backdrop-blur-sm",
                cardBgColors[colorIndex % cardBgColors.length],
                cardBorders[colorIndex % cardBorders.length],
                !isGeminiReady && "opacity-60"
              )}
            >
              <CardContent className="flex h-full flex-col justify-between gap-5 p-6 text-center">
                <div className={cn(
                  "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto rounded-full flex items-center justify-center text-3xl sm:text-4xl md:text-5xl bg-gradient-to-br",
                  game.color,
                  "group-hover:scale-110 transition-transform duration-300"
                )}>
                  {game.emoji}
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {game.title}
                  </h3>
                  <p className="text-sm text-gray-800 dark:text-gray-300 font-medium leading-relaxed">
                    {game.description}
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button 
                    className="flex-1 rounded-lg px-4 py-3 bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] hover:from-[#4ECDC4] hover:to-[#FF6B6B] text-sm font-bold transition-all"
                    disabled={!isGeminiReady}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectGame(game.id);
                    }}
                  >
                    {isGeminiReady ? 'Play Now!' : 'Setup Required'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg px-3 py-3 border-2 hover:border-purple-400 dark:hover:border-purple-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/kids/games/history?game=${game.id}`);
                    }}
                    title="View this game's history"
                  >
                    <History className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-dashed border-purple-200 bg-purple-50/40 p-4 dark:border-purple-700 dark:bg-purple-900/10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

        </div>
  );
};

export default InteractiveGames;
