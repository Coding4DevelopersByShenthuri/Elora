import { useState, useEffect } from 'react';
import { Mic, Volume2, TrendingUp, Clock, X, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AdultsAPI } from '@/services/ApiService';
import { useAuth } from '@/contexts/AuthContext';

interface PronunciationPractice {
  id: number;
  target_text: string;
  target_phonetic?: string;
  accuracy_score: number;
  pronunciation_score: number;
  fluency_score: number;
  phonetic_analysis?: any;
  mistakes?: string[];
  feedback?: string;
  suggestions?: string[];
  practiced_at: string;
}

interface PronunciationAnalyzerProps {
  onClose: () => void;
}

export default function PronunciationAnalyzer({ onClose }: PronunciationAnalyzerProps) {
  const { user } = useAuth();
  const [targetText, setTargetText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [practiceHistory, setPracticeHistory] = useState<PronunciationPractice[]>([]);
  const [statistics, setStatistics] = useState<{
    total_practices: number;
    average_accuracy: number;
    average_pronunciation: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<PronunciationPractice | null>(null);

  useEffect(() => {
    if (user) {
      loadHistory();
      loadStatistics();
    }
  }, [user]);

  const loadHistory = async () => {
    try {
      const result = await AdultsAPI.getPronunciationHistory();
      if (result.success) {
        setPracticeHistory(result.data?.data || []);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const result = await AdultsAPI.getPronunciationStatistics();
      if (result.success) {
        setStatistics(result.data?.data);
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const handleRecord = () => {
    setIsRecording(true);
    // TODO: Implement actual audio recording using Web Audio API or MediaRecorder
    // For now, simulate recording
    setTimeout(() => {
      setIsRecording(false);
      handleSubmit();
    }, 3000);
  };

  const handleSubmit = async () => {
    if (!targetText.trim()) return;

    try {
      setLoading(true);
      // TODO: Get actual audio blob/URL from recording
      const result = await AdultsAPI.submitPronunciationPractice({
        target_text: targetText,
        user_audio_url: '', // Will be filled with actual recording
      });

      if (result.success) {
        setCurrentFeedback(result.data?.data);
        loadHistory();
        loadStatistics();
      }
    } catch (error) {
      console.error('Failed to submit pronunciation:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card className="bg-slate-900/95 backdrop-blur-xl border-purple-500/30 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col mx-auto">
      <CardHeader className="border-b border-purple-500/30">
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-amber-400" />
            Pronunciation Analyzer
          </span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
        <Tabs defaultValue="practice" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full bg-slate-800/50 border-b border-purple-500/30 rounded-none">
            <TabsTrigger value="practice" className="flex-1">Practice</TabsTrigger>
            <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
            <TabsTrigger value="statistics" className="flex-1">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="practice" className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-6">
              <Card className="border-purple-500/30 bg-slate-800/30">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-cyan-100/80 mb-2 block">
                        Text to Pronounce
                      </label>
                      <Input
                        value={targetText}
                        onChange={(e) => setTargetText(e.target.value)}
                        placeholder="Enter text you want to practice pronouncing..."
                        className="bg-slate-700/50 border-purple-500/30 text-white text-lg h-12"
                      />
                    </div>

                    <div className="flex items-center justify-center py-8">
                      <Button
                        size="lg"
                        className={cn(
                          'h-24 w-24 rounded-full transition-all',
                          isRecording
                            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                            : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                        )}
                        onClick={handleRecord}
                        disabled={!targetText.trim() || loading || isRecording}
                      >
                        {isRecording ? (
                          <Pause className="h-8 w-8" />
                        ) : (
                          <Mic className="h-8 w-8" />
                        )}
                      </Button>
                    </div>

                    {isRecording && (
                      <div className="text-center">
                        <p className="text-red-400 font-semibold animate-pulse">Recording...</p>
                        <p className="text-sm text-cyan-100/70 mt-1">Speak clearly into your microphone</p>
                      </div>
                    )}

                    <Button
                      onClick={handleSubmit}
                      disabled={!targetText.trim() || loading || isRecording}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      {loading ? 'Analyzing...' : 'Submit for Analysis'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {currentFeedback && (
                <Card className="border-green-500/30 bg-green-500/10">
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Analysis Results</h4>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className={cn('text-3xl font-bold mb-2', getScoreColor(currentFeedback.accuracy_score))}>
                          {Math.round(currentFeedback.accuracy_score)}%
                        </div>
                        <div className="text-sm text-cyan-100/70 mb-2">Accuracy</div>
                        <Progress value={currentFeedback.accuracy_score} className="h-2" />
                      </div>
                      <div className="text-center">
                        <div className={cn('text-3xl font-bold mb-2', getScoreColor(currentFeedback.pronunciation_score))}>
                          {Math.round(currentFeedback.pronunciation_score)}%
                        </div>
                        <div className="text-sm text-cyan-100/70 mb-2">Pronunciation</div>
                        <Progress value={currentFeedback.pronunciation_score} className="h-2" />
                      </div>
                      <div className="text-center">
                        <div className={cn('text-3xl font-bold mb-2', getScoreColor(currentFeedback.fluency_score))}>
                          {Math.round(currentFeedback.fluency_score)}%
                        </div>
                        <div className="text-sm text-cyan-100/70 mb-2">Fluency</div>
                        <Progress value={currentFeedback.fluency_score} className="h-2" />
                      </div>
                    </div>

                    {currentFeedback.mistakes && currentFeedback.mistakes.length > 0 && (
                      <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                        <p className="text-sm font-semibold text-red-300 mb-2">Areas to Improve:</p>
                        <ul className="list-disc list-inside text-sm text-cyan-100/80 space-y-1">
                          {currentFeedback.mistakes.map((mistake, idx) => (
                            <li key={idx}>{mistake}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {currentFeedback.suggestions && currentFeedback.suggestions.length > 0 && (
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <p className="text-sm font-semibold text-blue-300 mb-2">Suggestions:</p>
                        <ul className="list-disc list-inside text-sm text-cyan-100/80 space-y-1">
                          {currentFeedback.suggestions.map((suggestion, idx) => (
                            <li key={idx}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="flex-1 overflow-y-auto p-6">
            <div className="space-y-3">
              {practiceHistory.length === 0 ? (
                <div className="text-center py-8 text-cyan-100/70">
                  No practice sessions yet. Start practicing to see your history!
                </div>
              ) : (
                practiceHistory.map((practice) => (
                  <Card key={practice.id} className="border-purple-500/30 bg-slate-800/30">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-2">{practice.target_text}</h4>
                          {practice.target_phonetic && (
                            <p className="text-sm text-cyan-300/70 mb-2">{practice.target_phonetic}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className={cn('text-xl font-bold', getScoreColor(practice.pronunciation_score))}>
                            {Math.round(practice.pronunciation_score)}%
                          </div>
                          <div className="text-xs text-cyan-100/70 mt-1">
                            {new Date(practice.practiced_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4 text-xs text-cyan-100/60">
                        <span>Accuracy: {Math.round(practice.accuracy_score)}%</span>
                        <span>Pronunciation: {Math.round(practice.pronunciation_score)}%</span>
                        <span>Fluency: {Math.round(practice.fluency_score)}%</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="statistics" className="flex-1 overflow-y-auto p-6">
            {statistics ? (
              <div className="max-w-2xl mx-auto space-y-6">
                <Card className="border-purple-500/30 bg-slate-800/30">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-6">Your Statistics</h3>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-white mb-2">
                          {statistics.total_practices}
                        </div>
                        <div className="text-sm text-cyan-100/70">Total Practices</div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-green-400 mb-2">
                          {Math.round(statistics.average_accuracy)}%
                        </div>
                        <div className="text-sm text-cyan-100/70">Avg Accuracy</div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-400 mb-2">
                          {Math.round(statistics.average_pronunciation)}%
                        </div>
                        <div className="text-sm text-cyan-100/70">Avg Pronunciation</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8 text-cyan-100/70">
                No statistics available yet. Start practicing to track your progress!
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

