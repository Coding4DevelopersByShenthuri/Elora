import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Clock, Award, Eye, Trophy, ArrowLeft, Filter, Trash2 } from 'lucide-react';
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>(searchParams.get('game') || 'all');

  // Game titles mapping - shared games have different titles for teen vs young
  const youngGameTitles: Record<string, { title: string; emoji: string }> = {
    'tongue-twister': { title: 'Tongue Twisters', emoji: '👅' },
    'word-chain': { title: 'Word Chain', emoji: '🔗' },
    'story-telling': { title: 'Story Telling', emoji: '📖' },
    'pronunciation-challenge': { title: 'Pronunciation Master', emoji: '🎯' },
    'conversation-practice': { title: 'Chat Practice', emoji: '💬' }
  };

  const teenGameTitles: Record<string, { title: string; emoji: string }> = {
    'tongue-twister': { title: 'Pro Tongue Twisters', emoji: '⚡' },
    'word-chain': { title: 'Advanced Word Chain', emoji: '🧠' },
    'story-telling': { title: 'Creative Story Lab', emoji: '📝' },
    'pronunciation-challenge': { title: 'Precision Pronunciation', emoji: '🎯' },
    'conversation-practice': { title: 'Pro Conversation', emoji: '💬' },
    'debate-club': { title: 'Debate Club', emoji: '⚖️' },
    'critical-thinking': { title: 'Critical Thinking Challenge', emoji: '🧩' },
    'research-challenge': { title: 'Research Challenge', emoji: '🔬' },
    'presentation-master': { title: 'Presentation Master', emoji: '📊' },
    'ethics-discussion': { title: 'Ethics Discussion', emoji: '🤔' },
    'innovation-lab': { title: 'Innovation Lab', emoji: '🚀' },
    'leadership-challenge': { title: 'Leadership Challenge', emoji: '👑' }
  };

  // Determine if a game is from teen context (teen-only games or game title indicates teen)
  const isTeenGame = (gameType: string, gameTitle?: string): boolean => {
    const teenOnlyGames = ['debate-club', 'critical-thinking', 'research-challenge', 
                          'presentation-master', 'ethics-discussion', 'innovation-lab', 'leadership-challenge'];
    if (teenOnlyGames.includes(gameType)) return true;
    
    // Check if title matches teen game titles
    if (gameTitle) {
      const teenTitles = Object.values(teenGameTitles).map(t => t.title);
      if (teenTitles.includes(gameTitle)) return true;
    }
    
    return false;
  };

  // Get game title based on game type and context
  const getGameTitle = (gameType: string, gameTitle?: string): { title: string; emoji: string } => {
    // If we have a saved game title, use it (preserves context)
    if (gameTitle && (teenGameTitles[gameType]?.title === gameTitle || youngGameTitles[gameType]?.title === gameTitle)) {
      const teenMatch = Object.values(teenGameTitles).find(t => t.title === gameTitle);
      const youngMatch = Object.values(youngGameTitles).find(t => t.title === gameTitle);
      if (teenMatch) return teenMatch;
      if (youngMatch) return youngMatch;
    }
    
    // Determine context from game type
    if (isTeenGame(gameType, gameTitle)) {
      return teenGameTitles[gameType] || { title: gameTitle || gameType, emoji: '🎮' };
    }
    
    return youngGameTitles[gameType] || teenGameTitles[gameType] || { title: gameTitle || gameType, emoji: '🎮' };
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

  // Load game history with automatic cleanup
  useEffect(() => {
    const loadHistory = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Auto-cleanup old sessions (runs automatically in getGameHistory)
        await GameHistoryService.autoCleanupOldSessions(userId);
        
        // Load history (will also auto-clean expired sessions)
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
  const totalSessions = allSessions.length;
  const completedSessions = allSessions.filter(s => s.completed).length;
  const totalPoints = allSessions.reduce((sum, session) => sum + (session.score || 0), 0);
  const favoriteGameType = allSessions.reduce<Record<string, number>>((acc, session) => {
    acc[session.gameType] = (acc[session.gameType] || 0) + 1;
    return acc;
  }, {});
  const topGameType = Object.entries(favoriteGameType).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const topGameInfo = topGameType ? getGameTitle(topGameType) : null;

  const handleDeleteSession = async (sessionId: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    if (deletingId) return;
    setDeletingId(sessionId);
    try {
      // Delete game session history (points are preserved - stored separately in user progress)
      await GameHistoryService.deleteGameSession(userId, sessionId);
      setAllSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
      }
      console.log('✅ Game session history deleted (points preserved)');
    } catch (error) {
      console.error('Failed to delete game session:', error);
    } finally {
      setDeletingId(null);
    }
  };

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
    <div className="min-h-screen bg-muted/20 pb-16 pt-24 md:pt-32">
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 sm:px-6">
        <section className="mx-auto w-full">
          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-[#1B4332] via-[#2D6A4F] to-[#74C69D] text-white shadow-xl">
            <span className="absolute -right-28 -top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden />
            <span className="absolute -left-24 bottom-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" aria-hidden />
            <CardContent className="relative z-10 space-y-4 p-4 md:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2 lg:max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => navigate(-1)}
                      className="rounded-full border-white/40 bg-white/15 px-3 py-1.5 text-sm text-white transition hover:bg-white/25"
                    >
                      <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                      Back
                    </Button>
                    <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold uppercase tracking-wide text-white/80">
                      Game progress
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h1 className="text-2xl font-semibold leading-tight text-white md:text-3xl">
                      Game History
                    </h1>
                    <p className="text-sm text-white/85 md:text-base">
                      Review your recent adventures and track your progress.
                    </p>
                  </div>
                </div>
                <div className="grid w-full gap-2 text-sm sm:grid-cols-3 lg:w-auto">
                  <div className="rounded-xl bg-white/15 px-3 py-2 text-white shadow-sm backdrop-blur">
                    <p className="text-xs uppercase tracking-wide text-white/70">Sessions</p>
                    <p className="text-xl font-semibold">{totalSessions}</p>
                  </div>
                  <div className="rounded-xl bg-white/15 px-3 py-2 text-white shadow-sm backdrop-blur">
                    <p className="text-xs uppercase tracking-wide text-white/70">Total points</p>
                    <p className="text-xl font-semibold">{totalPoints}</p>
                  </div>
                  <div className="rounded-xl bg-white/15 px-3 py-2 text-white shadow-sm backdrop-blur">
                    <p className="text-xs uppercase tracking-wide text-white/70">Completed</p>
                    <p className="text-xl font-semibold">{completedSessions}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white/10 p-2.5 backdrop-blur">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                  <Filter className="h-4 w-4" />
                  Filter by game
                </div>
                <div className="flex flex-1 flex-wrap gap-1.5 overflow-x-auto pb-1">
                  <Button
                    variant={filter === 'all' ? 'default' : 'ghost'}
                    onClick={() => setFilter('all')}
                    className={`rounded-full px-3 py-1.5 text-xs ${filter === 'all' ? 'bg-white text-sky-600 shadow-sm hover:bg-white/90' : 'text-white hover:bg-white/10'}`}
                  >
                    All ({totalSessions})
                  </Button>
                  {uniqueGameTypes.map((gameType) => {
                    const count = allSessions.filter(s => s.gameType === gameType).length;
                    const info = getGameTitle(gameType);
                    const isActive = filter === gameType;
                    return (
                      <Button
                        key={gameType}
                        variant={isActive ? 'default' : 'ghost'}
                        onClick={() => setFilter(gameType)}
                        className={`rounded-full px-3 py-1.5 text-xs ${isActive ? 'bg-white text-sky-600 shadow-sm hover:bg-white/90' : 'text-white hover:bg-white/10'}`}
                      >
                        <span className="mr-1">{info.emoji}</span>
                        {info.title} ({count})
                      </Button>
                    );
                  })}
                </div>
              </div>
              {topGameInfo && (
                <div className="rounded-xl bg-white/15 px-3 py-2 text-sm text-white shadow-sm backdrop-blur">
                  <p className="font-semibold text-xs md:text-sm">
                    Top game: <span className="ml-1">{topGameInfo.emoji} {topGameInfo.title}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {loading && (
          <Card className="border border-dashed border-muted p-8 text-center shadow-sm">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-sky-600" />
            <p className="text-sm text-muted-foreground">Loading your game adventures…</p>
          </Card>
        )}

        {!loading && filteredSessions.length === 0 && (
          <Card className="border border-dashed border-muted p-10 text-center shadow-sm">
            <History className="mx-auto mb-4 h-12 w-12 text-sky-500" />
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              No game history yet
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {filter === 'all'
                ? 'Complete some games to see your progress here!'
                : 'No sessions found for this game type.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                onClick={() => navigate('/kids/young?section=games')}
                className="rounded-full bg-gradient-to-r from-[#1B4332] to-[#74C69D] px-6 py-2 text-sm text-white transition hover:from-[#74C69D] hover:to-[#1B4332]"
              >
                Play Young Kids Games
              </Button>
              <Button
                onClick={() => navigate('/kids/teen?section=games')}
                variant="outline"
                className="rounded-full border-2 border-[#1B4332] px-6 py-2 text-sm text-[#1B4332] transition hover:bg-[#1B4332] hover:text-white"
              >
                Play Teen Kids Games
              </Button>
            </div>
          </Card>
        )}

        {!loading && filteredSessions.length > 0 && (
          <div className="space-y-4">
            {filteredSessions.map((session) => {
              const gameInfo = getGameTitle(session.gameType, session.gameTitle);
              const isTeen = isTeenGame(session.gameType, session.gameTitle);
              return (
                <Card
                  key={session.id}
                  className="border border-muted bg-card/70 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg cursor-pointer"
                  onClick={() => setSelectedSession(session)}
                >
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <div className="mb-3 flex items-center gap-3">
                          <span className="text-2xl sm:text-3xl">{gameInfo.emoji}</span>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-base font-semibold text-foreground sm:text-lg md:text-xl">
                              {session.gameTitle || gameInfo.title}
                            </h3>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                              <Clock className="h-4 w-4" />
                              <span>{formatDate(session.startTime)}</span>
                              {session.completed && (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                  Completed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                          <div className="inline-flex items-center gap-1 font-semibold text-foreground">
                            <Trophy className="h-4 w-4 text-amber-500" />
                            {session.score} points
                          </div>
                          <div className="inline-flex items-center gap-1 text-muted-foreground">
                            <Award className="h-4 w-4 text-sky-500" />
                            Round {session.rounds}
                          </div>
                          <span className="rounded-full bg-muted px-2 py-1 text-xs font-semibold capitalize text-foreground">
                            {session.difficulty}
                          </span>
                          {session.endTime && (
                            <span className="text-muted-foreground">
                              {getDuration(session.startTime, session.endTime)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSession(session);
                          }}
                          className="w-full rounded-full sm:w-auto"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          className="w-full rounded-full text-red-600 hover:text-red-700 sm:w-auto"
                          disabled={deletingId === session.id}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {deletingId === session.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4" onClick={() => setSelectedSession(null)}>
            <Card
              className="w-full max-w-4xl max-h-[95vh] overflow-y-auto border border-primary/30"
              onClick={(e) => e.stopPropagation()}
            >
              <CardContent className="space-y-4 p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
                    Game session details
                  </h2>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedSession(null)}
                      className="w-full sm:w-auto"
                    >
                      Close
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => selectedSession && handleDeleteSession(selectedSession.id)}
                      disabled={!selectedSession || deletingId === selectedSession.id}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {deletingId === selectedSession?.id ? 'Deleting...' : 'Delete session'}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                    <div className="text-xs text-muted-foreground">Score</div>
                    <div className="text-base font-semibold text-amber-600">{selectedSession.score}</div>
                  </div>
                  <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2">
                    <div className="text-xs text-muted-foreground">Rounds</div>
                    <div className="text-base font-semibold text-sky-600">{selectedSession.rounds}</div>
                  </div>
                  <div className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-2">
                    <div className="text-xs text-muted-foreground">Difficulty</div>
                    <div className="text-base font-semibold capitalize text-purple-600">{selectedSession.difficulty}</div>
                  </div>
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div className={`text-base font-semibold ${selectedSession.completed ? 'text-emerald-600' : 'text-orange-600'}`}>
                      {selectedSession.completed ? 'Completed' : 'Incomplete'}
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-muted bg-card/70 px-3 py-2 text-sm text-muted-foreground sm:px-4 sm:py-3">
                  <div><strong>Started:</strong> {formatDate(selectedSession.startTime)}</div>
                  {selectedSession.endTime && <div><strong>Ended:</strong> {formatDate(selectedSession.endTime)}</div>}
                </div>
                {selectedSession.conversationHistory && selectedSession.conversationHistory.length > 0 && (
                  <div className="max-h-[320px] overflow-y-auto rounded-lg border border-muted bg-card/60 p-3 sm:p-4">
                    <h4 className="mb-3 text-sm font-semibold text-foreground sm:text-base">Conversation flow</h4>
                    <div className="space-y-2 sm:space-y-3">
                      {selectedSession.conversationHistory.map((msg, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'rounded-lg border p-3 text-xs sm:text-sm',
                            msg.role === 'user'
                              ? 'ml-auto max-w-[85%] border-sky-200 bg-sky-50'
                              : 'mr-auto max-w-[85%] border-muted bg-card'
                          )}
                        >
                          <div className="mb-1 text-xs font-semibold text-muted-foreground">
                            {msg.role === 'user' ? 'You' : 'AI Teacher'}
                          </div>
                          <p className={cn(
                            'whitespace-pre-wrap leading-relaxed',
                            msg.role === 'user' ? 'text-sky-900' : 'text-foreground'
                          )}>
                            {msg.content}
                          </p>
                          {msg.hasErrors && (
                            <div className="mt-2 text-xs text-orange-500">
                              ⚠️ AI detected some mistakes
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default GameHistoryPage;

