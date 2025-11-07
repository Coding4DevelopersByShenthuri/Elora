import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Clock, Award, Eye, Trophy, ArrowLeft, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import GameHistoryService, { type GameSession } from '@/services/GameHistoryService';
import { Loader2 } from 'lucide-react';

const GameHistoryPage = () => {
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id ? String(user.id) : 'local-user';
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allSessions, setAllSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<GameSession | null>(null);
  const [filter, setFilter] = useState<string>(searchParams.get('game') || 'all');

  // Game titles mapping
  const gameTitles: Record<string, { title: string; emoji: string }> = {
    'tongue-twister': { title: 'Tongue Twisters', emoji: '👅' },
    'word-chain': { title: 'Word Chain', emoji: '🔗' },
    'story-telling': { title: 'Story Telling', emoji: '📖' },
    'pronunciation-challenge': { title: 'Pronunciation Master', emoji: '🎯' },
    'conversation-practice': { title: 'Chat Practice', emoji: '💬' },
    'debate-club': { title: 'Debate Club', emoji: '⚖️' },
    'critical-thinking': { title: 'Critical Thinking', emoji: '🧠' },
    'research-challenge': { title: 'Research Challenge', emoji: '🔬' },
    'presentation-master': { title: 'Presentation Master', emoji: '📊' },
    'ethics-discussion': { title: 'Ethics Discussion', emoji: '🤔' },
  };

  // Add styles for select options in dark mode
  useEffect(() => {
    const styleId = 'game-history-select-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        select option {
          background-color: white !important;
          color: #111827 !important;
        }
        @media (prefers-color-scheme: dark) {
          select option {
            background-color: #1f2937 !important;
            color: white !important;
          }
        }
        .dark select option {
          background-color: #1f2937 !important;
          color: white !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Load game history
  useEffect(() => {
    const loadHistory = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const history = await GameHistoryService.getGameHistory(userId, true);
        console.log('📊 Loaded game history:', history);
        setAllSessions(history);
      } catch (error) {
        console.error('Error loading game history:', error);
        setAllSessions([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [userId, isAuthenticated]);

  // Update URL when filter changes
  useEffect(() => {
    if (filter === 'all') {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ game: filter }, { replace: true });
    }
  }, [filter, setSearchParams]);

  const filteredSessions = filter === 'all'
    ? allSessions
    : allSessions.filter(s => s.gameType === filter);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDuration = (startTime: number, endTime?: number) => {
    if (!endTime) return 'Incomplete';
    const minutes = Math.floor((endTime - startTime) / 60000);
    return `${minutes} min`;
  };

  const uniqueGameTypes = Array.from(new Set(allSessions.map(s => s.gameType)));

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6">
          <p className="text-center text-gray-600">Please log in to view your game history.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 sm:pb-20 pt-24 sm:pt-32 md:pt-40 relative overflow-hidden">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-4 sm:mb-6 relative px-10 sm:px-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="rounded-xl absolute left-0 sm:left-0"
            >
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#118AB2] bg-clip-text text-transparent text-center">
              Game History
            </h1>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center sm:justify-start">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-xs sm:text-sm rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2 sm:px-4 py-1.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 w-full sm:w-auto min-w-[200px]"
            >
              <option value="all" className="text-gray-900 dark:text-white bg-white dark:bg-gray-800">All Games ({allSessions.length})</option>
              {uniqueGameTypes.map((gameType) => {
                const count = allSessions.filter(s => s.gameType === gameType).length;
                const gameInfo = gameTitles[gameType] || { title: gameType, emoji: '🎮' };
                return (
                  <option key={gameType} value={gameType} className="text-gray-900 dark:text-white bg-white dark:bg-gray-800">
                    {gameInfo.emoji} {gameInfo.title} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <Card className="p-8 sm:p-12 text-center">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto mb-3 sm:mb-4 text-purple-600" />
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Loading game history...</p>
          </Card>
        )}

        {/* Empty State */}
        {!loading && filteredSessions.length === 0 && (
          <Card className="p-8 sm:p-12 text-center border-2 border-purple-200 dark:border-purple-700">
            <History className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2">
              No game history yet
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">
              {filter === 'all'
                ? "Complete some games to see your progress here!"
                : "No sessions found for this game type."}
            </p>
            <Button
              onClick={() => navigate('/kids/young?section=games')}
              className="bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] hover:from-[#4ECDC4] hover:to-[#FF6B6B] text-white text-xs sm:text-sm"
            >
              Play Games Now
            </Button>
          </Card>
        )}

        {/* Sessions List */}
        {!loading && filteredSessions.length > 0 && (
          <div className="space-y-4">
            {filteredSessions.map((session) => {
              const gameInfo = gameTitles[session.gameType] || { title: session.gameTitle, emoji: '🎮' };
              return (
                <Card
                  key={session.id}
                  className="border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-pointer"
                  onClick={() => setSelectedSession(session)}
                >
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex-1 w-full sm:w-auto">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <span className="text-2xl sm:text-3xl flex-shrink-0">{gameInfo.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 dark:text-white truncate">
                              {session.gameTitle || gameInfo.title}
                            </h3>
                            <div className="flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap">
                              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                {formatDate(session.startTime)}
                              </span>
                              {session.completed && (
                                <span className="px-1.5 sm:px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full whitespace-nowrap">
                                  Completed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {session.score} points
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              Round {session.rounds}
                            </span>
                          </div>
                          <span className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 capitalize whitespace-nowrap">
                            {session.difficulty}
                          </span>
                          {session.endTime && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {getDuration(session.startTime, session.endTime)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSession(session);
                        }}
                        className="flex-shrink-0 w-full sm:w-auto"
                      >
                        <Eye className="w-4 h-4 sm:mr-1" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Session Detail Modal */}
        {selectedSession && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50" onClick={() => setSelectedSession(null)}>
            <Card
              className="w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border-2 border-purple-300 dark:border-purple-700"
              onClick={(e) => e.stopPropagation()}
            >
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
                    Game Session Details
                  </h2>
                  <Button variant="outline" size="sm" onClick={() => setSelectedSession(null)} className="w-full sm:w-auto">
                    Close
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Session Info */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2 sm:p-3 border-2 border-yellow-200">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Score</div>
                      <div className="text-base sm:text-lg font-bold text-yellow-600">{selectedSession.score}</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 sm:p-3 border-2 border-blue-200">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Rounds</div>
                      <div className="text-base sm:text-lg font-bold text-blue-600">{selectedSession.rounds}</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 sm:p-3 border-2 border-purple-200">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Difficulty</div>
                      <div className="text-base sm:text-lg font-bold text-purple-600 capitalize">{selectedSession.difficulty}</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 sm:p-3 border-2 border-green-200">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</div>
                      <div className={`text-base sm:text-lg font-bold ${selectedSession.completed ? 'text-green-600' : 'text-orange-600'}`}>
                        {selectedSession.completed ? 'Completed' : 'Incomplete'}
                      </div>
                    </div>
                  </div>

                  {/* Date Info */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 sm:p-3 border-2 border-gray-200">
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <div><strong>Started:</strong> {formatDate(selectedSession.startTime)}</div>
                      {selectedSession.endTime && (
                        <div><strong>Ended:</strong> {formatDate(selectedSession.endTime)}</div>
                      )}
                    </div>
                  </div>

                  {/* Conversation History */}
                  {selectedSession.conversationHistory && selectedSession.conversationHistory.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border-2 border-gray-200 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
                      <h4 className="font-bold text-sm sm:text-base text-gray-800 dark:text-white mb-2 sm:mb-3">Conversation Flow</h4>
                      <div className="space-y-2 sm:space-y-3">
                        {selectedSession.conversationHistory.map((msg, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "rounded-lg p-2 sm:p-3",
                              msg.role === 'user'
                                ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 ml-auto max-w-[90%] sm:max-w-[85%]"
                                : "bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 mr-auto max-w-[90%] sm:max-w-[85%]"
                            )}
                          >
                            <div className="text-xs font-bold mb-1 text-gray-600 dark:text-gray-400">
                              {msg.role === 'user' ? 'You' : 'AI Teacher'}
                            </div>
                            <p className={cn(
                              "text-xs sm:text-sm whitespace-pre-wrap",
                              msg.role === 'user'
                                ? "text-blue-900 dark:text-blue-100"
                                : "text-gray-800 dark:text-gray-200"
                            )}>
                              {msg.content}
                            </p>
                            {msg.hasErrors && (
                              <div className="mt-1 sm:mt-2 text-xs text-orange-600 dark:text-orange-400">
                                ⚠️ AI detected some mistakes
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameHistoryPage;

