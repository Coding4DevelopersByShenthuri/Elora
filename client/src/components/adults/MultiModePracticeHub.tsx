import { useState, useEffect } from 'react';
import { Headphones, Mic, BookOpen, PenTool, Play, Pause, CheckCircle, X, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { AdultsAPI } from '@/services/ApiService';
import { useAuth } from '@/contexts/AuthContext';

interface MultiModePracticeHubProps {
  onClose: () => void;
}

const MODES = [
  { id: 'listening', label: 'Listening', icon: Headphones, color: 'text-blue-400', bgColor: 'from-blue-500/20 to-cyan-500/20' },
  { id: 'speaking', label: 'Speaking', icon: Mic, color: 'text-green-400', bgColor: 'from-green-500/20 to-emerald-500/20' },
  { id: 'reading', label: 'Reading', icon: BookOpen, color: 'text-purple-400', bgColor: 'from-purple-500/20 to-pink-500/20' },
  { id: 'writing', label: 'Writing', icon: PenTool, color: 'text-amber-400', bgColor: 'from-amber-500/20 to-orange-500/20' },
];

interface PracticeSession {
  id: number;
  mode: string;
  score: number;
  points_earned: number;
  duration_minutes: number;
  items_completed: number;
  items_correct: number;
  started_at: string;
  completed_at?: string;
}

export default function MultiModePracticeHub({ onClose }: MultiModePracticeHubProps) {
  const { user } = useAuth();
  const [activeMode, setActiveMode] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<number | null>(null);
  const [sessionHistory, setSessionHistory] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPracticeActive, setIsPracticeActive] = useState(false);
  const [practiceProgress, setPracticeProgress] = useState({
    items_completed: 0,
    items_correct: 0,
    items_incorrect: 0,
    time_spent: 0,
  });

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    try {
      const result = await AdultsAPI.getMultiModePracticeHistory();
      if (result.success && 'data' in result) {
        setSessionHistory(result.data?.data || []);
      }
    } catch (error) {
      console.error('Failed to load practice history:', error);
    }
  };

  const handleStartPractice = async (mode: 'listening' | 'speaking' | 'reading' | 'writing') => {
    try {
      setLoading(true);
      const result = await AdultsAPI.startMultiModePractice({
        mode,
        content_type: 'general',
        content_id: '',
      });

      if (result.success && 'data' in result && result.data?.data) {
        setActiveMode(mode);
        setCurrentSession(result.data.data.id);
        setIsPracticeActive(true);
        setPracticeProgress({
          items_completed: 0,
          items_correct: 0,
          items_incorrect: 0,
          time_spent: 0,
        });
      }
    } catch (error) {
      console.error('Failed to start practice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePractice = async (score: number) => {
    if (!currentSession || !activeMode) return;

    try {
      const result = await AdultsAPI.completeMultiModePractice(currentSession, {
        score,
        points_earned: practiceProgress.items_correct * 10,
        duration_minutes: practiceProgress.time_spent / 60,
        items_completed: practiceProgress.items_completed,
        items_correct: practiceProgress.items_correct,
        items_incorrect: practiceProgress.items_incorrect,
      });

      if (result.success) {
        setIsPracticeActive(false);
        setActiveMode(null);
        setCurrentSession(null);
        loadHistory();
      }
    } catch (error) {
      console.error('Failed to complete practice:', error);
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    setPracticeProgress((prev) => ({
      ...prev,
      items_completed: prev.items_completed + 1,
      items_correct: isCorrect ? prev.items_correct + 1 : prev.items_correct,
      items_incorrect: !isCorrect ? prev.items_incorrect + 1 : prev.items_incorrect,
    }));
  };

  const currentScore = practiceProgress.items_completed > 0
    ? Math.round((practiceProgress.items_correct / practiceProgress.items_completed) * 100)
    : 0;

  const showCloseButton = onClose && typeof onClose === 'function';
  
  return (
    <Card className={cn(
      "bg-slate-900/95 backdrop-blur-xl border-purple-500/30 shadow-2xl w-full flex flex-col mx-auto",
      showCloseButton ? "max-w-4xl max-h-[90vh]" : ""
    )}>
      <CardHeader className="border-b border-purple-500/30">
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Headphones className="h-5 w-5 text-cyan-400" />
            Multi-Mode Practice
          </span>
          {showCloseButton && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
        {!isPracticeActive ? (
          <Tabs defaultValue="modes" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="w-full bg-slate-800/50 border-b border-purple-500/30 rounded-none">
              <TabsTrigger value="modes" className="flex-1">Practice Modes</TabsTrigger>
              <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
            </TabsList>

            <TabsContent value="modes" className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MODES.map((mode) => {
                  const Icon = mode.icon;
                  const modeHistory = sessionHistory.filter(s => s.mode === mode.id);
                  const avgScore = modeHistory.length > 0
                    ? modeHistory.reduce((sum, s) => sum + s.score, 0) / modeHistory.length
                    : 0;

                  return (
                    <Card
                      key={mode.id}
                      className={cn(
                        'border-purple-500/30 hover:border-purple-400/50 transition-all cursor-pointer',
                        'bg-gradient-to-br',
                        mode.bgColor
                      )}
                      onClick={() => handleStartPractice(mode.id as 'listening' | 'speaking' | 'reading' | 'writing')}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={cn('p-3 rounded-lg bg-slate-900/50', mode.color)}>
                            <Icon className="h-8 w-8" />
                          </div>
                          <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                            {modeHistory.length} sessions
                          </Badge>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">{mode.label}</h3>
                        <p className="text-cyan-100/70 text-sm mb-4">
                          Practice your {mode.label.toLowerCase()} skills with interactive exercises
                        </p>

                        {modeHistory.length > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <TrendingUp className="h-4 w-4 text-green-400" />
                            <span className="text-cyan-100/70">
                              Avg Score: <span className="text-white font-semibold">{Math.round(avgScore)}%</span>
                            </span>
                          </div>
                        )}

                        <Button
                          className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartPractice(mode.id as 'listening' | 'speaking' | 'reading' | 'writing');
                          }}
                          disabled={loading}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Practice
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="history" className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {sessionHistory.length === 0 ? (
                  <div className="text-center py-8 text-cyan-100/70">
                    No practice sessions yet. Start practicing to see your history!
                  </div>
                ) : (
                  sessionHistory.slice(0, 20).map((session) => {
                    const modeConfig = MODES.find(m => m.id === session.mode);
                    const Icon = modeConfig?.icon || Headphones;

                    return (
                      <Card key={session.id} className="border-purple-500/30 bg-slate-800/30">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-purple-500/20">
                                <Icon className="h-5 w-5 text-purple-300" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-white capitalize">
                                  {session.mode} Practice
                                </h4>
                                <div className="flex items-center gap-4 text-sm text-cyan-100/70 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {Math.round(session.duration_minutes)} min
                                  </span>
                                  <span>{session.items_completed} items</span>
                                  <span className={cn(
                                    session.score >= 80 ? 'text-green-400' :
                                    session.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                                  )}>
                                    {Math.round(session.score)}% score
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-cyan-100/70">
                                {new Date(session.started_at).toLocaleDateString()}
                              </div>
                              <Badge className="bg-green-500/20 text-green-300 border-green-400/30 mt-1">
                                +{session.points_earned} pts
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex-1 flex flex-col p-6">
            {activeMode && (
              <>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white capitalize mb-1">
                        {activeMode} Practice
                      </h3>
                      <p className="text-cyan-100/70">
                        Practice in progress
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleCompletePractice(currentScore)}
                    >
                      Finish Practice
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <Card className="bg-slate-800/50 border-purple-500/30">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-white">{practiceProgress.items_completed}</div>
                        <div className="text-xs text-cyan-100/70">Items</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-green-500/30">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-400">{practiceProgress.items_correct}</div>
                        <div className="text-xs text-cyan-100/70">Correct</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-blue-500/30">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-400">{currentScore}%</div>
                        <div className="text-xs text-cyan-100/70">Score</div>
                      </CardContent>
                    </Card>
                  </div>

                  <Progress
                    value={currentScore}
                    className="h-3 bg-slate-700/50 mb-4"
                  >
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                  </Progress>
                </div>

                {/* Practice Content Area */}
                <Card className="flex-1 border-purple-500/30 bg-slate-800/30">
                  <CardContent className="p-8 flex items-center justify-center h-full">
                    <div className="text-center space-y-6 max-w-md">
                      <div className="text-6xl mb-4">📝</div>
                      <h4 className="text-xl font-semibold text-white">
                        Practice Content
                      </h4>
                      <p className="text-cyan-100/70">
                        Practice content will be implemented based on the selected mode.
                        This is a placeholder for the actual practice interface.
                      </p>
                      <div className="flex gap-3 justify-center pt-4">
                        <Button
                          size="lg"
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => handleAnswer(true)}
                        >
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Correct
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                          onClick={() => handleAnswer(false)}
                        >
                          <X className="h-5 w-5 mr-2" />
                          Incorrect
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

