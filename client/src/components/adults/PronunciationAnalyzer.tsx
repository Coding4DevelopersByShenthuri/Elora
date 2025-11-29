import { useState, useEffect, useRef } from 'react';
import { Mic, Volume2, TrendingUp, Clock, X, Play, Pause, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  user_audio_url?: string;
}

interface PronunciationAnalyzerProps {
  onClose: () => void;
}

export default function PronunciationAnalyzer({ onClose }: PronunciationAnalyzerProps) {
  const { user } = useAuth();
  const [targetText, setTargetText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [practiceHistory, setPracticeHistory] = useState<PronunciationPractice[]>([]);
  const [statistics, setStatistics] = useState<{
    total_practices: number;
    average_accuracy: number;
    average_pronunciation: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<PronunciationPractice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recognitionResult, setRecognitionResult] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (user) {
      loadHistory();
      loadStatistics();
    }

    return () => {
      // Cleanup on unmount
      stopRecording();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [user]);

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, isPaused]);

  const loadHistory = async () => {
    try {
      const result = await AdultsAPI.getPronunciationHistory();
      if (result.success && 'data' in result) {
        setPracticeHistory(result.data?.data || []);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const result = await AdultsAPI.getPronunciationStatistics();
      if (result.success && 'data' in result) {
        setStatistics(result.data?.data);
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      setError(null);
      setRecognitionResult('');
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Initialize MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start speech recognition if available
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          setRecognitionResult(finalTranscript || interimTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
        };

        recognition.start();
        recognitionRef.current = recognition;
      }
    } catch (error: any) {
      console.error('Error starting recording:', error);
      setError(error.message || 'Failed to access microphone. Please check your permissions.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const handleSubmit = async () => {
    if (!targetText.trim()) {
      setError('Please enter text to practice');
      return;
    }

    if (!audioBlob) {
      setError('Please record your pronunciation first');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Convert blob to base64 or upload to server
      // For now, we'll create a data URL (in production, upload to server)
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        
        // Submit to API
        const result = await AdultsAPI.submitPronunciationPractice({
          target_text: targetText,
          user_audio_url: base64Audio, // In production, upload to server and get URL
          user_audio_duration: recordingTime,
          target_phonetic: '', // Can be generated on server
        });

        if (result.success && 'data' in result) {
          setCurrentFeedback(result.data?.data);
          setTargetText('');
          setAudioBlob(null);
          setAudioUrl(null);
          setRecordingTime(0);
          setRecognitionResult('');
          loadHistory();
          loadStatistics();
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (error: any) {
      console.error('Failed to submit pronunciation:', error);
      setError(error.message || 'Failed to analyze pronunciation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const playRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 dark:text-emerald-400';
    if (score >= 60) return 'text-amber-500 dark:text-amber-400';
    return 'text-rose-500 dark:text-rose-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/20 border-emerald-500/30 dark:bg-emerald-500/20 dark:border-emerald-400/30';
    if (score >= 60) return 'bg-amber-500/20 border-amber-500/30 dark:bg-amber-500/20 dark:border-amber-400/30';
    return 'bg-rose-500/20 border-rose-500/30 dark:bg-rose-500/20 dark:border-rose-400/30';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen w-full flex items-start justify-center p-4 pt-8 pb-8">
        <Card className="bg-card/95 backdrop-blur-xl border-primary/30 shadow-2xl w-full max-w-7xl flex flex-col dark:bg-slate-900/95 dark:border-emerald-500/30 my-8">
          <CardHeader className="border-b border-primary/30 dark:border-emerald-500/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground dark:text-white flex items-center gap-2">
                <Mic className="h-5 w-5 text-primary dark:text-emerald-300" />
                Pronunciation Analyzer
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-foreground dark:text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
            <Tabs defaultValue="practice" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="w-full bg-card/60 backdrop-blur-xl border-b border-primary/30 rounded-none dark:bg-slate-800/50 dark:border-emerald-500/30">
                <TabsTrigger value="practice" className="flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary dark:data-[state=active]:bg-emerald-500/20 dark:data-[state=active]:text-emerald-300">
                  Practice
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary dark:data-[state=active]:bg-emerald-500/20 dark:data-[state=active]:text-emerald-300">
                  History
                </TabsTrigger>
                <TabsTrigger value="statistics" className="flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary dark:data-[state=active]:bg-emerald-500/20 dark:data-[state=active]:text-emerald-300">
                  Statistics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="practice" className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-foreground dark:text-white mb-2">Practice Pronunciation</h2>
                    <p className="text-muted-foreground dark:text-cyan-100/70">
                      Enter text and record your pronunciation to get AI-powered feedback
                    </p>
                  </div>

                  {/* Input Section */}
                  <Card className="bg-card/60 backdrop-blur-xl border-primary/30 dark:bg-slate-800/50 dark:border-emerald-500/30">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-foreground dark:text-cyan-200 mb-2 block">
                            Text to Practice
                          </label>
                          <Textarea
                            value={targetText}
                            onChange={(e) => setTargetText(e.target.value)}
                            placeholder="Enter the text you want to practice pronouncing (e.g., 'Hello, how are you today?')"
                            className="bg-card/60 border-primary/30 text-foreground dark:bg-slate-700/50 dark:border-emerald-500/30 dark:text-white min-h-[100px] text-lg"
                            disabled={isRecording || loading}
                          />
                          <p className="text-xs text-muted-foreground dark:text-cyan-100/60 mt-2">
                            Tip: Start with short phrases, then practice longer sentences
                          </p>
                        </div>

                        {/* Recording Controls */}
                        <div className="flex flex-col items-center justify-center py-6 space-y-4">
                          {!isRecording && !audioBlob && (
                            <Button
                              size="lg"
                              className={cn(
                                'h-20 w-20 rounded-full transition-all shadow-lg',
                                'bg-primary hover:bg-primary/90 text-primary-foreground',
                                'dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600'
                              )}
                              onClick={startRecording}
                              disabled={!targetText.trim() || loading}
                            >
                              <Mic className="h-8 w-8" />
                            </Button>
                          )}

                          {isRecording && (
                            <div className="flex flex-col items-center space-y-4">
                              <div className="flex items-center gap-4">
                                <Button
                                  size="lg"
                                  variant="outline"
                                  className={cn(
                                    'h-16 w-16 rounded-full border-2',
                                    isPaused
                                      ? 'border-primary text-primary dark:border-emerald-500 dark:text-emerald-300'
                                      : 'border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400'
                                  )}
                                  onClick={pauseRecording}
                                >
                                  {isPaused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
                                </Button>
                                <Button
                                  size="lg"
                                  className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 text-white"
                                  onClick={stopRecording}
                                >
                                  <X className="h-6 w-6" />
                                </Button>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-red-500 dark:text-red-400 mb-1">
                                  {formatTime(recordingTime)}
                                </div>
                                <p className="text-sm text-muted-foreground dark:text-cyan-100/70">
                                  {isPaused ? 'Paused' : 'Recording...'}
                                </p>
                              </div>
                              {recognitionResult && (
                                <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-lg dark:bg-emerald-500/10 dark:border-emerald-500/30 max-w-md">
                                  <p className="text-sm text-foreground dark:text-white">
                                    <span className="font-semibold">Recognized:</span> {recognitionResult}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {audioBlob && !isRecording && (
                            <div className="flex flex-col items-center space-y-4">
                              <div className="flex items-center gap-4">
                                <Button
                                  size="lg"
                                  variant="outline"
                                  className="border-primary/30 text-primary hover:bg-primary/20 dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                                  onClick={playRecording}
                                >
                                  <Play className="h-5 w-5 mr-2" />
                                  Play Recording
                                </Button>
                                <Button
                                  size="lg"
                                  variant="outline"
                                  className="border-primary/30 text-primary hover:bg-primary/20 dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                                  onClick={() => {
                                    setAudioBlob(null);
                                    setAudioUrl(null);
                                    setRecordingTime(0);
                                    setRecognitionResult('');
                                    if (audioUrl) {
                                      URL.revokeObjectURL(audioUrl);
                                      setAudioUrl(null);
                                    }
                                  }}
                                >
                                  Record Again
                                </Button>
                              </div>
                              <p className="text-sm text-muted-foreground dark:text-cyan-100/70">
                                Duration: {formatTime(recordingTime)}
                              </p>
                            </div>
                          )}
                        </div>

                        {error && (
                          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg dark:bg-rose-500/10 dark:border-rose-500/30">
                            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                              <AlertCircle className="h-4 w-4" />
                              <p className="text-sm">{error}</p>
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={handleSubmit}
                          disabled={!targetText.trim() || !audioBlob || loading || isRecording}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Analyze Pronunciation
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Feedback Section */}
                  {currentFeedback && (
                    <Card className={cn('border-2', getScoreBgColor(currentFeedback.pronunciation_score))}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-lg font-semibold text-foreground dark:text-white">Analysis Results</h4>
                          <Badge className={cn('text-sm', getScoreColor(currentFeedback.pronunciation_score))}>
                            {Math.round(currentFeedback.pronunciation_score)}% Overall
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="text-center p-4 bg-card/50 rounded-lg dark:bg-slate-800/50">
                            <div className={cn('text-3xl font-bold mb-2', getScoreColor(currentFeedback.accuracy_score))}>
                              {Math.round(currentFeedback.accuracy_score)}%
                            </div>
                            <div className="text-sm text-muted-foreground dark:text-cyan-100/70 mb-2">Accuracy</div>
                            <Progress value={currentFeedback.accuracy_score} className="h-2 bg-muted dark:bg-slate-700/50" />
                          </div>
                          <div className="text-center p-4 bg-card/50 rounded-lg dark:bg-slate-800/50">
                            <div className={cn('text-3xl font-bold mb-2', getScoreColor(currentFeedback.pronunciation_score))}>
                              {Math.round(currentFeedback.pronunciation_score)}%
                            </div>
                            <div className="text-sm text-muted-foreground dark:text-cyan-100/70 mb-2">Pronunciation</div>
                            <Progress value={currentFeedback.pronunciation_score} className="h-2 bg-muted dark:bg-slate-700/50" />
                          </div>
                          <div className="text-center p-4 bg-card/50 rounded-lg dark:bg-slate-800/50">
                            <div className={cn('text-3xl font-bold mb-2', getScoreColor(currentFeedback.fluency_score))}>
                              {Math.round(currentFeedback.fluency_score)}%
                            </div>
                            <div className="text-sm text-muted-foreground dark:text-cyan-100/70 mb-2">Fluency</div>
                            <Progress value={currentFeedback.fluency_score} className="h-2 bg-muted dark:bg-slate-700/50" />
                          </div>
                        </div>

                        {currentFeedback.feedback && (
                          <div className="mb-4 p-4 bg-primary/10 border border-primary/30 rounded-lg dark:bg-emerald-500/10 dark:border-emerald-500/30">
                            <p className="text-sm font-semibold text-primary dark:text-emerald-300 mb-2">Feedback:</p>
                            <p className="text-sm text-foreground dark:text-cyan-50/90">{currentFeedback.feedback}</p>
                          </div>
                        )}

                        {currentFeedback.mistakes && currentFeedback.mistakes.length > 0 && (
                          <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg dark:bg-rose-500/10 dark:border-rose-500/30">
                            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-2">Areas to Improve:</p>
                            <ul className="list-disc list-inside text-sm text-foreground dark:text-cyan-50/90 space-y-1">
                              {currentFeedback.mistakes.map((mistake, idx) => (
                                <li key={idx}>{mistake}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {currentFeedback.suggestions && currentFeedback.suggestions.length > 0 && (
                          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg dark:bg-emerald-500/10 dark:border-emerald-500/30">
                            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-2">Suggestions:</p>
                            <ul className="list-disc list-inside text-sm text-foreground dark:text-cyan-50/90 space-y-1">
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
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-xl font-semibold text-foreground dark:text-white mb-4">Practice History</h3>
                  {practiceHistory.length === 0 ? (
                    <Card className="bg-card/60 backdrop-blur-xl border-primary/30 dark:bg-slate-800/50 dark:border-emerald-500/30">
                      <CardContent className="p-12 text-center">
                        <Mic className="h-12 w-12 mx-auto mb-4 text-primary dark:text-emerald-300 opacity-50" />
                        <p className="text-muted-foreground dark:text-cyan-100/70">
                          No practice sessions yet. Start practicing to see your history!
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {practiceHistory.map((practice) => (
                        <Card key={practice.id} className="bg-card/60 backdrop-blur-xl border-primary/30 hover:border-primary/50 dark:bg-slate-800/50 dark:border-emerald-500/30 dark:hover:border-emerald-400/50">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground dark:text-white mb-2">{practice.target_text}</h4>
                                {practice.target_phonetic && (
                                  <p className="text-sm text-muted-foreground dark:text-cyan-300/70 mb-2">{practice.target_phonetic}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <div className={cn('text-xl font-bold', getScoreColor(practice.pronunciation_score))}>
                                  {Math.round(practice.pronunciation_score)}%
                                </div>
                                <div className="text-xs text-muted-foreground dark:text-cyan-100/70 mt-1">
                                  {new Date(practice.practiced_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-4 text-xs text-muted-foreground dark:text-cyan-100/60">
                              <span>Accuracy: {Math.round(practice.accuracy_score)}%</span>
                              <span>Pronunciation: {Math.round(practice.pronunciation_score)}%</span>
                              <span>Fluency: {Math.round(practice.fluency_score)}%</span>
                            </div>
                            {(practice.user_audio_url || (practice as any).user_audio_url_full) && (
                              <div className="mt-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-primary/30 text-primary hover:bg-primary/20 dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                                  onClick={() => {
                                    const audioUrl = (practice as any).user_audio_url_full || practice.user_audio_url;
                                    if (audioUrl) {
                                      const audio = new Audio(audioUrl);
                                      audio.play();
                                    }
                                  }}
                                >
                                  <Play className="h-3 w-3 mr-2" />
                                  Play Recording
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="statistics" className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-xl font-semibold text-foreground dark:text-white mb-6">Your Statistics</h3>
                  {statistics ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-card/60 backdrop-blur-xl border-primary/30 dark:bg-slate-800/50 dark:border-emerald-500/30">
                        <CardContent className="p-6 text-center">
                          <div className="text-4xl font-bold text-foreground dark:text-white mb-2">
                            {statistics.total_practices}
                          </div>
                          <div className="text-sm text-muted-foreground dark:text-cyan-100/70">Total Practices</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-card/60 backdrop-blur-xl border-primary/30 dark:bg-slate-800/50 dark:border-emerald-500/30">
                        <CardContent className="p-6 text-center">
                          <div className="text-4xl font-bold text-emerald-500 dark:text-emerald-400 mb-2">
                            {Math.round(statistics.average_accuracy)}%
                          </div>
                          <div className="text-sm text-muted-foreground dark:text-cyan-100/70">Avg Accuracy</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-card/60 backdrop-blur-xl border-primary/30 dark:bg-slate-800/50 dark:border-emerald-500/30">
                        <CardContent className="p-6 text-center">
                          <div className="text-4xl font-bold text-primary dark:text-emerald-300 mb-2">
                            {Math.round(statistics.average_pronunciation)}%
                          </div>
                          <div className="text-sm text-muted-foreground dark:text-cyan-100/70">Avg Pronunciation</div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <Card className="bg-card/60 backdrop-blur-xl border-primary/30 dark:bg-slate-800/50 dark:border-emerald-500/30">
                      <CardContent className="p-12 text-center">
                        <TrendingUp className="h-12 w-12 mx-auto mb-4 text-primary dark:text-emerald-300 opacity-50" />
                        <p className="text-muted-foreground dark:text-cyan-100/70">
                          No statistics available yet. Start practicing to track your progress!
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
