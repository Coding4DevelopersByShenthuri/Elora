import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Headphones, Mic, BookOpen, PenTool, Play, Pause, CheckCircle, Clock, TrendingUp, Volume2, Eye, EyeOff, Trash2, AlertCircle, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { AdultsAPI } from '@/services/ApiService';
import { useAuth } from '@/contexts/AuthContext';
import { listeningModules, getListeningModuleData, type ListeningModuleData } from '@/data/listening-modules/listening-modules-config';
import OnlineTTS from '@/services/OnlineTTS';
import { useToast } from '@/hooks/use-toast';
import { IntegratedProgressService } from '@/services/IntegratedProgressService';

const MODES = [
  { 
    id: 'listening', 
    label: 'Listening', 
    icon: Headphones, 
    iconColor: 'text-teal-600 dark:text-teal-300',
    iconBg: 'bg-teal-500/20 dark:bg-teal-500/30',
    containerColor: 'from-teal-500/20 via-teal-500/25 to-teal-600/20',
    borderColor: 'border-teal-400/50 dark:border-teal-400/50',
    buttonColor: 'bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600'
  },
  { 
    id: 'speaking', 
    label: 'Speaking', 
    icon: Mic, 
    iconColor: 'text-green-600 dark:text-green-300',
    iconBg: 'bg-green-500/20 dark:bg-green-500/30',
    containerColor: 'from-green-500/20 via-green-500/25 to-green-600/20',
    borderColor: 'border-green-400/50 dark:border-green-400/50',
    buttonColor: 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
  },
  { 
    id: 'reading', 
    label: 'Reading', 
    icon: BookOpen, 
    iconColor: 'text-emerald-600 dark:text-emerald-300',
    iconBg: 'bg-emerald-500/20 dark:bg-emerald-500/30',
    containerColor: 'from-emerald-500/20 via-emerald-500/25 to-emerald-600/20',
    borderColor: 'border-emerald-400/50 dark:border-emerald-400/50',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600'
  },
  { 
    id: 'writing', 
    label: 'Writing', 
    icon: PenTool, 
    iconColor: 'text-cyan-600 dark:text-cyan-300',
    iconBg: 'bg-cyan-500/20 dark:bg-cyan-500/30',
    containerColor: 'from-cyan-500/20 via-cyan-500/25 to-cyan-600/20',
    borderColor: 'border-cyan-400/50 dark:border-cyan-400/50',
    buttonColor: 'bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600'
  },
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
  content_id?: string;
  content_type?: string;
  details?: {
    module_id?: string;
    module_title?: string;
    [key: string]: any;
  };
}

const MultiModePracticePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeMode, setActiveMode] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [moduleData, setModuleData] = useState<ListeningModuleData | null>(null);
  const [currentSession, setCurrentSession] = useState<number | null>(null);
  const [sessionHistory, setSessionHistory] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPracticeActive, setIsPracticeActive] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ttsAvailable, setTtsAvailable] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<'normal' | 'slow' | 'slower'>('normal');
  const [userAnswers, setUserAnswers] = useState<Record<string, string | number | boolean>>({});
  const [showResults, setShowResults] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number | null>(null);
  const [enrolledModules, setEnrolledModules] = useState<Set<string>>(new Set());
  const [startTime, setStartTime] = useState<number | null>(null);
  const [practiceProgress, setPracticeProgress] = useState({
    items_completed: 0,
    items_correct: 0,
    items_incorrect: 0,
    time_spent: 0,
  });

  // Page load fade-in
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (user) {
      loadHistory();
      loadEnrolledModules();
      // Run automatic cleanup check on mount
      checkAndCleanupOldSessions();
    }
  }, [user]);

  // Load enrolled modules from localStorage
  const loadEnrolledModules = () => {
    if (!user) return;
    const stored = localStorage.getItem(`enrolled_modules_${user.id}`);
    if (stored) {
      setEnrolledModules(new Set(JSON.parse(stored)));
    }
  };

  // Save enrolled modules to localStorage
  const saveEnrolledModule = (moduleId: string) => {
    if (!user) return;
    const newEnrolled = new Set(enrolledModules);
    newEnrolled.add(moduleId);
    setEnrolledModules(newEnrolled);
    localStorage.setItem(`enrolled_modules_${user.id}`, JSON.stringify(Array.from(newEnrolled)));
  };

  // Automatic cleanup: Check and delete sessions older than 30 days
  const checkAndCleanupOldSessions = async () => {
    try {
      const lastCleanup = localStorage.getItem('last_history_cleanup');
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      // Only run cleanup once per day
      if (lastCleanup && (now - parseInt(lastCleanup)) < oneDay) {
        return;
      }
      
      // Delete sessions older than 30 days
      const result = await AdultsAPI.deleteMultiModePracticeSessions(undefined, true, 30);
      if (result.success && 'data' in result && result.data?.deleted_count > 0) {
        localStorage.setItem('last_history_cleanup', now.toString());
        // Reload history after cleanup
        loadHistory();
        console.log(`Auto-cleanup: Deleted ${result.data.deleted_count} old session(s)`);
      }
    } catch (error) {
      console.error('Auto-cleanup error:', error);
    }
  };

  // Initialize TTS for listening practice
  useEffect(() => {
    const initTTS = async () => {
      try {
        await OnlineTTS.initialize();
        setTtsAvailable(OnlineTTS.isAvailable());
      } catch (error) {
        console.error('Failed to initialize TTS:', error);
        setTtsAvailable(false);
      }
    };
    initTTS();

    return () => {
      OnlineTTS.stop();
    };
  }, []);

  // Reset state when module changes
  useEffect(() => {
    if (moduleData) {
      setShowTranscript(false);
      setIsPlaying(false);
      setUserAnswers({});
      setShowResults(false);
      setCurrentExerciseIndex(0); // Start with first exercise
      setStartTime(Date.now());
      // Mark module as enrolled when user starts it
      if (selectedModule) {
        saveEnrolledModule(selectedModule);
      }
    }
  }, [moduleData, selectedModule]);

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

  const handleDeleteSession = async (sessionId: number) => {
    try {
      setDeletingSessionId(sessionId);
      const result = await AdultsAPI.deleteMultiModePracticeSession(sessionId);
      if (result.success) {
        toast({
          title: "Session Deleted",
          description: "The practice session has been deleted successfully.",
        });
        // Reload history
        loadHistory();
      } else {
        const errorMessage = 'message' in result ? result.message : "Failed to delete the session. Please try again.";
        toast({
          title: "Delete Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      toast({
        title: "Delete Failed",
        description: "An error occurred while deleting the session.",
        variant: "destructive",
      });
    } finally {
      setDeletingSessionId(null);
    }
  };

  const handleDeleteAllSessions = async () => {
    try {
      const sessionIds = sessionHistory.map(s => s.id);
      const result = await AdultsAPI.deleteMultiModePracticeSessions(sessionIds);
      if (result.success && 'data' in result) {
        toast({
          title: "All Sessions Deleted",
          description: `Deleted ${result.data?.deleted_count || sessionIds.length} session(s) successfully.`,
        });
        // Reload history
        loadHistory();
      } else {
        const errorMessage = 'message' in result ? result.message : "Failed to delete sessions. Please try again.";
        toast({
          title: "Delete Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to delete all sessions:', error);
      toast({
        title: "Delete Failed",
        description: "An error occurred while deleting sessions.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOldSessions = async () => {
    try {
      const result = await AdultsAPI.deleteMultiModePracticeSessions(undefined, true, 30);
      if (result.success && 'data' in result) {
        toast({
          title: "Old Sessions Deleted",
          description: `Deleted ${result.data?.deleted_count || 0} session(s) older than 30 days.`,
        });
        // Reload history
        loadHistory();
      } else {
        const errorMessage = 'message' in result ? result.message : "Failed to delete old sessions. Please try again.";
        toast({
          title: "Delete Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to delete old sessions:', error);
      toast({
        title: "Delete Failed",
        description: "An error occurred while deleting old sessions.",
        variant: "destructive",
      });
    }
  };

  const handleStartPractice = async (mode: 'listening' | 'speaking' | 'reading' | 'writing') => {
    if (mode === 'listening') {
      // For listening, show module selection
      setActiveMode('listening');
      return;
    }

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

  const handleSelectListeningModule = async (moduleId: string) => {
    try {
      setLoading(true);
      const data = await getListeningModuleData(moduleId);
      if (data) {
        setSelectedModule(moduleId);
        setModuleData(data);
        setIsPracticeActive(true);
        // Mark as enrolled when user selects the module
        saveEnrolledModule(moduleId);
        
        // Start practice session
        const result = await AdultsAPI.startMultiModePractice({
          mode: 'listening',
          content_type: 'listening_module',
          content_id: moduleId,
        });

        if (result.success && 'data' in result && result.data?.data) {
          setCurrentSession(result.data.data.id);
        }
      }
    } catch (error) {
      console.error('Failed to load module:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/adults');
  };

  const handlePlayAudio = async () => {
    if (!moduleData) return;
    
    try {
      setIsPlaying(true);
      // Use a more expressive voice for listening practice
      // Try Microsoft Mark (male) or David for better expressiveness
      // Falls back to Zira or any available Microsoft/English voice
      const listeningVoiceProfile = {
        name: 'Expressive Business',
        pitch: 1.1, // Slightly higher pitch for expressiveness
        rate: 0.95, // Slightly slower for clarity
        volume: 1.0,
        voiceName: 'Microsoft Mark - English (United States)', // More expressive male voice, will fallback if not available
        description: 'Expressive professional voice for business listening practice'
      };
      await OnlineTTS.speak(moduleData.transcript, listeningVoiceProfile, {
        speed: playbackSpeed,
        showCaptions: false,
        onCaptionUpdate: () => {}
      });
    } catch (error) {
      console.error('Failed to play audio:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleStopAudio = () => {
    OnlineTTS.stop();
    setIsPlaying(false);
  };

  const handleAnswerChange = (exerciseId: string, answer: string | number | boolean) => {
    setUserAnswers(prev => ({
      ...prev,
      [exerciseId]: answer
    }));
    
    // Auto-advance to next question after a short delay
    if (moduleData && currentExerciseIndex !== null) {
      const currentIndex = moduleData.exercises.findIndex(ex => ex.id === exerciseId);
      if (currentIndex !== -1 && currentIndex < moduleData.exercises.length - 1) {
        setTimeout(() => {
          setCurrentExerciseIndex(currentIndex + 1);
          // Scroll to next exercise
          const nextExerciseElement = document.getElementById(`exercise-${moduleData.exercises[currentIndex + 1].id}`);
          if (nextExerciseElement) {
            nextExerciseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500); // 500ms delay for visual feedback
      }
    }
  };

  const handleSubmitAnswers = async () => {
    if (!moduleData || !user) return;
    
    let correct = 0;
    let total = moduleData.exercises.length;
    let totalPoints = 0;
    
    moduleData.exercises.forEach(exercise => {
      if (userAnswers[exercise.id] === exercise.correctAnswer) {
        correct++;
        totalPoints += exercise.points;
      }
    });
    
    const score = Math.round((correct / total) * 100);
    const timeSpent = startTime ? Math.round((Date.now() - startTime) / 1000 / 60) : 0; // in minutes
    
    setPracticeProgress(prev => ({
      ...prev,
      items_completed: total,
      items_correct: correct,
      items_incorrect: total - correct,
      time_spent: timeSpent
    }));
    
    setShowResults(true);
    
    // Save points and progress to backend
    try {
      // Save via IntegratedProgressService
      await IntegratedProgressService.recordPracticeSession(user.id, {
        type: 'listening',
        duration: timeSpent,
        score: score,
        words_practiced: total,
        sentences_practiced: 0,
        mistakes_count: total - correct,
        details: {
          module_id: selectedModule,
          module_title: moduleData.module.title,
          exercises_completed: total,
          exercises_correct: correct,
          points_earned: totalPoints
        }
      });

      // Also save as multi-mode practice session
      if (currentSession) {
        await AdultsAPI.completeMultiModePractice(currentSession, {
          score: score,
          items_completed: total,
          items_correct: correct,
          items_incorrect: total - correct,
          duration_minutes: timeSpent,
          points_earned: totalPoints,
          details: {
            module_id: selectedModule,
            module_title: moduleData.module.title,
            exercises_completed: total,
            exercises_correct: correct,
            points_earned: totalPoints
          }
        });
      } else {
        // Create a new session if one doesn't exist
        const startResult = await AdultsAPI.startMultiModePractice({
          mode: 'listening',
          content_type: 'listening_module',
          content_id: selectedModule || '',
        });
        
        if (startResult.success && 'data' in startResult && startResult.data?.data) {
          const sessionId = startResult.data.data.id;
          await AdultsAPI.completeMultiModePractice(sessionId, {
            score: score,
            items_completed: total,
            items_correct: correct,
            items_incorrect: total - correct,
            duration_minutes: timeSpent,
            points_earned: totalPoints,
            details: {
              module_id: selectedModule,
              module_title: moduleData.module.title,
              exercises_completed: total,
              exercises_correct: correct,
              points_earned: totalPoints
            }
          });
        }
      }

      toast({
        title: "Progress Saved!",
        description: `You earned ${totalPoints} points! Your progress has been saved.`,
      });

      // Reload history to show the new session
      loadHistory();
      
      // Notify adults page to refresh progress
      window.dispatchEvent(new CustomEvent('multiModeProgressUpdated'));
    } catch (error) {
      console.error('Failed to save progress:', error);
      toast({
        title: "Progress Saved Locally",
        description: "Your progress was saved locally. It will sync when online.",
        variant: "default",
      });
    }
  };


  return (
    <div className={`relative overflow-hidden min-h-screen ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
      {/* Background Elements - Matching Adults Page */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] rounded-full bg-accent/10 blur-3xl -z-10"></div>

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 pt-24 pb-16 space-y-10">
        {/* Header with Back Button */}
        <div className="mb-4 sm:mb-6">
          <Button
            variant="ghost"
            onClick={
              isPracticeActive && activeMode === 'listening' && moduleData
                ? () => {
                    setIsPracticeActive(false);
                    setSelectedModule(null);
                    setModuleData(null);
                    setActiveMode('listening');
                  }
                : activeMode === 'listening' && !selectedModule
                ? () => setActiveMode(null)
                : handleBack
            }
            className="text-primary hover:text-primary/80 hover:bg-primary/10 mb-3 sm:mb-4 text-xs sm:text-sm dark:text-emerald-300 dark:hover:text-emerald-200 dark:hover:bg-emerald-500/20"
            size="sm"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">
              {isPracticeActive && activeMode === 'listening' && moduleData
                ? 'Back to Modules'
                : activeMode === 'listening' && !selectedModule
                ? 'Back to Modes'
                : 'Back to Adults Dashboard'}
            </span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>

        {/* Top Container - Only show when not in practice mode */}
        {!isPracticeActive && !activeMode && (
          <section>
            <Card className="relative overflow-hidden border-none bg-gradient-to-br from-[#065f46] via-[#047857] to-[#10b981] text-white shadow-xl dark:from-[#064e3b] dark:via-[#047857] dark:to-[#059669]">
              <span className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-3xl" aria-hidden />
              <span className="absolute -left-20 bottom-0 h-32 w-32 rounded-full bg-white/10 blur-3xl" aria-hidden />
              <CardHeader className="space-y-2 py-3 sm:py-4 md:py-5 relative z-10">
                <div className="flex flex-col gap-2 sm:gap-3">
                  <div className="space-y-1 sm:space-y-2">
                    <Badge className="bg-white/25 text-white uppercase tracking-wide text-xs sm:text-sm px-2 py-0.5 sm:px-3 sm:py-1">
                      Multi-Mode Practice
                    </Badge>
                    <CardTitle className="text-lg sm:text-xl md:text-2xl font-semibold text-white leading-tight">
                      Practice listening, speaking, reading, and writing skills with comprehensive exercises
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </section>
        )}

        {/* Top Container for Listening Module Selection */}
        {activeMode === 'listening' && !selectedModule && !isPracticeActive && (
          <section>
            <Card className="relative overflow-hidden border-none bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#10b981] text-white shadow-xl dark:from-[#022c22] dark:via-[#065f46] dark:to-[#059669]">
              <span className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-3xl" aria-hidden />
              <span className="absolute -left-20 bottom-0 h-32 w-32 rounded-full bg-white/10 blur-3xl" aria-hidden />
              <CardHeader className="space-y-2 py-3 sm:py-4 md:py-5 relative z-10">
                <div className="flex flex-col gap-2 sm:gap-3">
                  <div className="space-y-1 sm:space-y-2">
                    <Badge className="bg-white/25 text-white uppercase tracking-wide text-xs sm:text-sm px-2 py-0.5 sm:px-3 sm:py-1">
                      Listening Practice
                    </Badge>
                    <CardTitle className="text-lg sm:text-xl md:text-2xl font-semibold text-white leading-tight">
                      Choose a Listening Module
                    </CardTitle>
                    <CardDescription className="text-white/85 text-sm sm:text-base leading-relaxed">
                      Select a module to practice your listening skills
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </section>
        )}

        {/* Conditional Header for active practice */}
        {isPracticeActive && activeMode === 'listening' && moduleData && (
          <div className="mb-4 sm:mb-6 md:mb-8">
            <div className="text-center mb-4 sm:mb-6 md:mb-8 px-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground dark:text-white mb-2 sm:mb-3 md:mb-4">
                {moduleData.module.title}
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground dark:text-cyan-100/80 max-w-2xl mx-auto leading-relaxed">
                {moduleData.module.description}
              </p>
            </div>
          </div>
        )}

          {/* Listening Module Selection */}
          {activeMode === 'listening' && !selectedModule && (
            <div className="mb-4 sm:mb-6 md:mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {listeningModules.map((module) => (
                  <Card
                    key={module.id}
                    className={cn(
                      'relative overflow-hidden group cursor-pointer rounded-2xl bg-card/80 backdrop-blur-xl border-primary/30 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl dark:bg-slate-900/60 dark:border-emerald-500/30 dark:hover:border-emerald-400/50'
                    )}
                    onClick={() => handleSelectListeningModule(module.id)}
                  >
                    <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', module.color)} />
                    <CardContent className="p-4 sm:p-5 md:p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-full bg-primary/20 border border-primary/30 text-2xl dark:bg-emerald-500/20 dark:border-emerald-400/30">
                            {module.icon}
                          </div>
                          <div>
                            <h3 className="text-lg sm:text-xl font-semibold text-foreground dark:text-white">{module.title}</h3>
                            <p className="text-xs text-muted-foreground dark:text-cyan-100/60">{module.duration} • {module.category}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 capitalize text-xs dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-400/30">
                          {module.difficulty}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground dark:text-cyan-100/75 text-xs sm:text-sm line-clamp-3 min-h-[48px]">{module.description}</p>
                      <Button
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs sm:text-sm py-2 sm:py-2.5 dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectListeningModule(module.id);
                        }}
                        disabled={loading}
                        size="sm"
                      >
                        <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Start Module
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Practice Modes - Displayed like Daily Conversation topics */}
          {!isPracticeActive && !activeMode && (
            <Tabs defaultValue="modes" className="w-full">
              <TabsList className="w-full bg-card/80 border-primary/30 rounded-lg mb-4 sm:mb-6 h-auto dark:bg-slate-900/60 dark:border-emerald-500/30">
                <TabsTrigger value="modes" className="flex-1 text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 data-[state=active]:bg-primary/20 data-[state=active]:text-primary dark:data-[state=active]:bg-emerald-500/20 dark:data-[state=active]:text-emerald-300">
                  <span className="hidden sm:inline">Practice Modes</span>
                  <span className="sm:hidden">Modes</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1 text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 data-[state=active]:bg-primary/20 data-[state=active]:text-primary dark:data-[state=active]:bg-emerald-500/20 dark:data-[state=active]:text-emerald-300">
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="modes" className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
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
                          'group cursor-pointer backdrop-blur-xl transition-all duration-300 hover:shadow-2xl relative border',
                          'bg-gradient-to-br',
                          mode.containerColor,
                          mode.borderColor,
                          'hover:border-opacity-70'
                        )}
                        onClick={() => handleStartPractice(mode.id as 'listening' | 'speaking' | 'reading' | 'writing')}
                      >
                        <CardContent className="p-4 sm:p-5 md:p-6">
                          <div className="flex items-start justify-between mb-3 sm:mb-4">
                            <div className={cn('p-2 sm:p-3 rounded-lg', mode.iconBg, mode.iconColor)}>
                              <Icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                            </div>
                            {modeHistory.length > 0 && (
                              <Badge variant="outline" className={cn('text-xs', mode.iconBg, mode.iconColor, 'border-current/30')}>
                                {modeHistory.length} {modeHistory.length === 1 ? 'session' : 'sessions'}
                              </Badge>
                            )}
                          </div>

                          <h3 className="text-lg sm:text-xl font-bold text-foreground dark:text-white mb-2">{mode.label}</h3>
                          <p className="text-muted-foreground dark:text-cyan-100/70 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                            Practice your {mode.label.toLowerCase()} skills with interactive exercises
                          </p>

                          {modeHistory.length > 0 && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm mb-3 sm:mb-4">
                              <TrendingUp className={cn('h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0', mode.iconColor)} />
                              <span className="text-muted-foreground dark:text-cyan-100/70">
                                Avg: <span className="text-foreground dark:text-white font-semibold">{Math.round(avgScore)}%</span>
                              </span>
                            </div>
                          )}

                          <Button
                            className={cn('w-full text-white text-xs sm:text-sm py-2 sm:py-2.5', mode.buttonColor)}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartPractice(mode.id as 'listening' | 'speaking' | 'reading' | 'writing');
                            }}
                            disabled={loading}
                            size="sm"
                          >
                            <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Start Practice</span>
                            <span className="sm:hidden">Start</span>
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                {sessionHistory.length > 0 && (
                  <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500/30 text-red-600 hover:bg-red-500/20 hover:text-red-700 text-xs sm:text-sm dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/20 dark:hover:text-red-200"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Delete Old (30+ days)</span>
                          <span className="sm:hidden">Delete Old</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border-primary/30 dark:bg-slate-900 dark:border-emerald-500/30">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-foreground dark:text-white flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                            Delete Old Sessions?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground dark:text-cyan-100/80">
                            This will permanently delete all practice sessions older than 30 days. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-muted text-muted-foreground border-border hover:bg-muted/80 dark:bg-slate-800 dark:text-cyan-100 dark:border-slate-700 dark:hover:bg-slate-700">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteOldSessions}
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            Delete Old Sessions
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500/30 text-red-600 hover:bg-red-500/20 hover:text-red-700 text-xs sm:text-sm dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/20 dark:hover:text-red-200"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Delete All</span>
                          <span className="sm:hidden">Delete All</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border-primary/30 dark:bg-slate-900 dark:border-emerald-500/30">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-foreground dark:text-white flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                            Delete All Sessions?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground dark:text-cyan-100/80">
                            This will permanently delete all {sessionHistory.length} practice session(s). This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-muted text-muted-foreground border-border hover:bg-muted/80 dark:bg-slate-800 dark:text-cyan-100 dark:border-slate-700 dark:hover:bg-slate-700">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAllSessions}
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            Delete All
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}

                <div className="space-y-2 sm:space-y-3">
                  {sessionHistory.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 text-muted-foreground dark:text-cyan-100/70 text-sm sm:text-base px-4">
                      No practice sessions yet. Start practicing to see your history!
                    </div>
                  ) : (
                    sessionHistory.slice(0, 20).map((session) => {
                      const modeConfig = MODES.find(m => m.id === session.mode);
                      const Icon = modeConfig?.icon || Headphones;
                      const isDeleting = deletingSessionId === session.id;
                      const sessionDate = new Date(session.started_at);
                      const daysAgo = Math.floor((Date.now() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
                      
                      // Get module name from details or content_id
                      const getModuleName = () => {
                        if (session.details?.module_title) {
                          return session.details.module_title;
                        }
                        if (session.content_id) {
                          const moduleNames: Record<string, string> = {
                            'business-meetings': 'Business Meetings',
                            'daily-conversations': 'Daily Conversations',
                            'academic-lectures': 'Academic Lectures',
                            'news-reports': 'News Reports',
                            'phone-conversations': 'Phone Conversations',
                            'interviews': 'Interviews'
                          };
                          return moduleNames[session.content_id] || session.content_id;
                        }
                        return null;
                      };
                      
                      const moduleName = getModuleName();
                      
                      return (
                        <Card key={session.id} className="bg-card/80 backdrop-blur-xl border-primary/30 hover:border-primary/50 transition-all dark:bg-slate-900/60 dark:border-emerald-500/30 dark:hover:border-emerald-400/50">
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center justify-between gap-2 sm:gap-4">
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                <div className={cn('p-1.5 sm:p-2 rounded-lg flex-shrink-0', modeConfig?.iconBg || 'bg-primary/20 dark:bg-emerald-500/20', modeConfig?.iconColor || 'text-primary dark:text-emerald-400')}>
                                  <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5')} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-foreground dark:text-white capitalize text-sm sm:text-base">
                                      {session.mode}
                                    </span>
                                    {moduleName && (
                                      <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 text-xs dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-400/30">
                                        {moduleName}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70 mt-1">
                                    {sessionDate.toLocaleDateString()} {daysAgo > 0 && `(${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago)`}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="text-right flex-shrink-0">
                                  <div className="text-base sm:text-lg font-bold text-foreground dark:text-white">{session.score}%</div>
                                  <div className="text-xs text-muted-foreground dark:text-cyan-100/70">{session.items_completed} items</div>
                                  {session.points_earned > 0 && (
                                    <div className="text-xs text-amber-600 dark:text-amber-300 font-semibold mt-1">
                                      {session.points_earned} pts
                                    </div>
                                  )}
                                </div>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-500/20 flex-shrink-0 dark:text-red-300 dark:hover:text-red-400 dark:hover:bg-red-500/20"
                                      disabled={isDeleting}
                                    >
                                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-card border-primary/30 dark:bg-slate-900 dark:border-emerald-500/30">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-foreground dark:text-white flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                                        Delete Session?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription className="text-muted-foreground dark:text-cyan-100/80">
                                        Are you sure you want to delete this {session.mode}{moduleName ? ` - ${moduleName}` : ''} practice session from {sessionDate.toLocaleDateString()}? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="bg-muted text-muted-foreground border-border hover:bg-muted/80 dark:bg-slate-800 dark:text-cyan-100 dark:border-slate-700 dark:hover:bg-slate-700">
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteSession(session.id)}
                                        className="bg-red-500 hover:bg-red-600 text-white"
                                        disabled={isDeleting}
                                      >
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
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
          )}

          {/* Listening Module Active View */}
          {isPracticeActive && activeMode === 'listening' && moduleData && (
            <div className="space-y-4 sm:space-y-6">
              {/* Audio Player Section */}
              <Card className="bg-gradient-to-br from-teal-500/20 via-emerald-500/25 to-teal-600/20 backdrop-blur-xl border-teal-400/50 dark:from-teal-500/20 dark:via-emerald-500/25 dark:to-teal-600/20 dark:border-teal-400/50">
                <CardContent className="p-4 sm:p-5 md:p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-base sm:text-lg font-semibold text-foreground dark:text-white mb-2">Listen to the Audio</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/80">
                        Click play to listen to the {moduleData.module.title.toLowerCase()} audio. Listen carefully before answering the questions.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {isPlaying ? (
                        <Button
                          onClick={handleStopAudio}
                          className="bg-red-500 hover:bg-red-600 text-white"
                          size="lg"
                        >
                          <Pause className="h-5 w-5 mr-2" />
                          <span className="hidden sm:inline">Stop</span>
                        </Button>
                      ) : (
                        <Button
                          onClick={handlePlayAudio}
                          disabled={!ttsAvailable}
                          className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
                          size="lg"
                        >
                          <Volume2 className="h-5 w-5 mr-2" />
                          <span className="hidden sm:inline">Play Audio</span>
                          <span className="sm:hidden">Play</span>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => setShowTranscript(!showTranscript)}
                        className="border-primary/30 text-primary hover:bg-primary/20 dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                        size="lg"
                      >
                        {showTranscript ? (
                          <>
                            <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            <span className="hidden sm:inline">Hide Transcript</span>
                            <span className="sm:hidden">Hide</span>
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            <span className="hidden sm:inline">Show Transcript</span>
                            <span className="sm:hidden">Show</span>
                          </>
                        )}
                      </Button>
                      
                      {/* Speed Controller */}
                      <div className="flex items-center gap-2 border border-primary/30 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 bg-card/50 dark:border-emerald-500/30 dark:bg-slate-800/50">
                        <Gauge className="h-4 w-4 text-primary dark:text-emerald-300" />
                        <select
                          value={playbackSpeed}
                          onChange={(e) => setPlaybackSpeed(e.target.value as 'normal' | 'slow' | 'slower')}
                          className="bg-transparent text-foreground dark:text-cyan-300 text-xs sm:text-sm border-none outline-none cursor-pointer"
                          disabled={isPlaying}
                        >
                          <option value="slower" className="bg-card dark:bg-slate-800">0.5x (Slower)</option>
                          <option value="slow" className="bg-card dark:bg-slate-800">0.7x (Slow)</option>
                          <option value="normal" className="bg-card dark:bg-slate-800">1.0x (Normal)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  {!ttsAvailable && (
                    <div className="mt-3 p-2 bg-amber-500/20 border border-amber-500/30 rounded text-xs text-amber-700 dark:text-amber-200 text-center">
                      Audio playback not available. Please enable browser audio permissions or use the transcript.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Transcript Section - Toggleable */}
              {showTranscript && (
                <Card className="bg-card/80 backdrop-blur-xl border-primary/30 dark:bg-slate-900/60 dark:border-emerald-500/30">
                  <CardContent className="p-4 sm:p-5 md:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base sm:text-lg font-semibold text-foreground dark:text-white">Transcript</h3>
                      <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 text-xs dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-400/30">
                        Reference Only
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm md:text-base text-muted-foreground dark:text-cyan-100/80 leading-relaxed">{moduleData.transcript}</p>
                  </CardContent>
                </Card>
              )}
              
              {/* Exercises Section */}
              <Card className="bg-card/80 backdrop-blur-xl border-primary/30 dark:bg-slate-900/60 dark:border-emerald-500/30">
                <CardContent className="p-4 sm:p-5 md:p-6">
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-foreground dark:text-white mb-2 sm:mb-3">Listening Comprehension Exercises</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70 mb-4">
                        Answer the questions based on what you heard. Listen to the audio first before answering.
                      </p>
                      <div className="space-y-2 sm:space-y-3">
                        {moduleData.exercises.map((exercise, index) => {
                          const userAnswer = userAnswers[exercise.id];
                          const isCorrect = showResults && userAnswer === exercise.correctAnswer;
                          const isIncorrect = showResults && userAnswer !== undefined && userAnswer !== exercise.correctAnswer;
                          const isCurrentExercise = currentExerciseIndex === index;
                          const isAnswered = userAnswer !== undefined;
                          
                          return (
                            <Card 
                              id={`exercise-${exercise.id}`}
                              key={exercise.id} 
                              className={cn(
                                "bg-card/60 backdrop-blur-sm border-primary/20 transition-all dark:bg-slate-800/50 dark:border-emerald-500/20",
                                isCurrentExercise && !showResults && "ring-2 ring-primary/50 border-primary/50 dark:ring-emerald-400/50 dark:border-emerald-400/50",
                                isCorrect && "border-green-500/50 bg-green-500/10 dark:border-green-500/50 dark:bg-green-500/10",
                                isIncorrect && "border-red-500/50 bg-red-500/10 dark:border-red-500/50 dark:bg-red-500/10",
                                isAnswered && !isCurrentExercise && !showResults && "opacity-60"
                              )}
                            >
                              <CardContent className="p-3 sm:p-4">
                                <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs sm:text-sm font-semibold text-primary dark:text-emerald-300">Exercise {index + 1}</span>
                                    {showResults && isCorrect && (
                                      <Badge className="bg-green-500/20 text-green-700 border-green-400/30 text-xs dark:bg-green-500/20 dark:text-green-300 dark:border-green-400/30">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Correct
                                      </Badge>
                                    )}
                                    {showResults && isIncorrect && (
                                      <Badge className="bg-red-500/20 text-red-700 border-red-400/30 text-xs dark:bg-red-500/20 dark:text-red-300 dark:border-red-400/30">
                                        Incorrect
                                      </Badge>
                                    )}
                                  </div>
                                  <Badge variant="outline" className="bg-primary/20 text-primary text-xs dark:bg-emerald-500/20 dark:text-emerald-300">
                                    {exercise.points} pts
                                  </Badge>
                                </div>
                                <p className="text-sm sm:text-base text-foreground dark:text-white mb-3">{exercise.question}</p>
                                
                                {(exercise.type === 'multiple-choice' || exercise.type === 'comprehension') && exercise.options && (
                                  <div className="space-y-1.5 sm:space-y-2">
                                    {exercise.options.map((option, optIndex) => {
                                      const isSelected = userAnswer === optIndex;
                                      const isCorrectOption = showResults && optIndex === exercise.correctAnswer;
                                      
                                      return (
                                        <button
                                          key={optIndex}
                                          onClick={() => !showResults && handleAnswerChange(exercise.id, optIndex)}
                                          disabled={showResults}
                                          className={cn(
                                            "w-full text-left p-2 sm:p-2.5 rounded text-xs sm:text-sm transition-all",
                                            "bg-muted/50 hover:bg-muted border-2 dark:bg-slate-700/30 dark:hover:bg-slate-700/50",
                                            isSelected && !showResults && "border-primary bg-primary/20 dark:border-emerald-400 dark:bg-emerald-500/20",
                                            isCorrectOption && showResults && "border-green-500 bg-green-500/20 dark:border-green-400 dark:bg-green-500/20",
                                            isSelected && isIncorrect && showResults && "border-red-500 bg-red-500/20 dark:border-red-400 dark:bg-red-500/20",
                                            !isSelected && showResults && "border-transparent",
                                            showResults && "cursor-default",
                                            "text-foreground dark:text-white"
                                          )}
                                        >
                                          <span className="font-semibold mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                                          {option}
                                          {isCorrectOption && showResults && (
                                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 inline-block ml-2" />
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                                
                                {exercise.type === 'true-false' && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => !showResults && handleAnswerChange(exercise.id, true)}
                                      disabled={showResults}
                                      className={cn(
                                        "flex-1 p-2 sm:p-3 rounded text-xs sm:text-sm font-semibold transition-all border-2 text-foreground dark:text-white",
                                        userAnswer === true && !showResults && "bg-primary/20 border-primary dark:bg-emerald-500/20 dark:border-emerald-400",
                                        userAnswer === true && showResults && exercise.correctAnswer === true && "bg-green-500/20 border-green-500 dark:bg-green-500/20 dark:border-green-400",
                                        userAnswer === true && showResults && exercise.correctAnswer !== true && "bg-red-500/20 border-red-500 dark:bg-red-500/20 dark:border-red-400",
                                        userAnswer !== true && "bg-muted/50 border-transparent hover:bg-muted dark:bg-slate-700/30 dark:hover:bg-slate-700/50",
                                        showResults && "cursor-default"
                                      )}
                                    >
                                      True
                                    </button>
                                    <button
                                      onClick={() => !showResults && handleAnswerChange(exercise.id, false)}
                                      disabled={showResults}
                                      className={cn(
                                        "flex-1 p-2 sm:p-3 rounded text-xs sm:text-sm font-semibold transition-all border-2 text-foreground dark:text-white",
                                        userAnswer === false && !showResults && "bg-primary/20 border-primary dark:bg-emerald-500/20 dark:border-emerald-400",
                                        userAnswer === false && showResults && exercise.correctAnswer === false && "bg-green-500/20 border-green-500 dark:bg-green-500/20 dark:border-green-400",
                                        userAnswer === false && showResults && exercise.correctAnswer !== false && "bg-red-500/20 border-red-500 dark:bg-red-500/20 dark:border-red-400",
                                        userAnswer !== false && "bg-muted/50 border-transparent hover:bg-muted dark:bg-slate-700/30 dark:hover:bg-slate-700/50",
                                        showResults && "cursor-default"
                                      )}
                                    >
                                      False
                                    </button>
                                  </div>
                                )}
                                
                                {exercise.type === 'fill-blank' && (
                                  <div className="space-y-2">
                                    <input
                                      type="text"
                                      value={userAnswer as string || ''}
                                      onChange={(e) => !showResults && handleAnswerChange(exercise.id, e.target.value)}
                                      disabled={showResults}
                                      placeholder="Type your answer here..."
                                      className={cn(
                                        "w-full p-2 sm:p-3 rounded bg-muted/50 border-2 text-foreground text-xs sm:text-sm dark:bg-slate-700/30 dark:text-white",
                                        "focus:outline-none focus:border-primary dark:focus:border-emerald-400",
                                        showResults && isCorrect && "border-green-500 bg-green-500/20 dark:border-green-400 dark:bg-green-500/20",
                                        showResults && isIncorrect && "border-red-500 bg-red-500/20 dark:border-red-400 dark:bg-red-500/20"
                                      )}
                                    />
                                    {showResults && (
                                      <div className="text-xs sm:text-sm">
                                        <span className="text-muted-foreground dark:text-cyan-100/70">Correct answer: </span>
                                        <span className="text-green-600 dark:text-green-400 font-semibold">{exercise.correctAnswer}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {showResults && exercise.explanation && (
                                  <div className="mt-3 p-2 sm:p-3 bg-primary/10 border border-primary/30 rounded dark:bg-emerald-500/10 dark:border-emerald-500/30">
                                    <p className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/80">
                                      <span className="font-semibold text-primary dark:text-emerald-300">Explanation: </span>
                                      {exercise.explanation}
                                    </p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                      
                      {!showResults && (
                        <div className="mt-4 sm:mt-6 text-center">
                          <Button
                            onClick={handleSubmitAnswers}
                            disabled={Object.keys(userAnswers).length !== moduleData.exercises.length}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600"
                            size="lg"
                          >
                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            Submit Answers
                          </Button>
                        </div>
                      )}
                      
                      {showResults && (
                        <div className="mt-4 sm:mt-6 p-4 sm:p-5 bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-lg dark:from-emerald-500/20 dark:to-green-500/20 dark:border-emerald-400/30">
                          <div className="text-center">
                            <h4 className="text-lg sm:text-xl font-bold text-foreground dark:text-white mb-2">Your Score</h4>
                            <div className="text-3xl sm:text-4xl font-bold text-primary dark:text-emerald-400 mb-2">
                              {Math.round((practiceProgress.items_correct / practiceProgress.items_completed) * 100)}%
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/80">
                              {practiceProgress.items_correct} out of {practiceProgress.items_completed} correct
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-foreground dark:text-white mb-2 sm:mb-3">Vocabulary</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {moduleData.vocabulary.map((vocab, index) => (
                          <Card key={index} className="bg-card/60 backdrop-blur-sm border-primary/20 dark:bg-slate-800/50 dark:border-emerald-500/20">
                            <CardContent className="p-2.5 sm:p-3">
                              <div className="font-semibold text-foreground dark:text-white mb-1 text-sm sm:text-base">{vocab.word}</div>
                              <div className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70">{vocab.definition}</div>
                              {vocab.example && (
                                <div className="text-xs text-muted-foreground dark:text-cyan-100/60 mt-1 italic">"{vocab.example}"</div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-foreground dark:text-white mb-2 sm:mb-3">Tips</h3>
                      <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/80 pl-2">
                        {moduleData.tips.map((tip, index) => (
                          <li key={index} className="leading-relaxed">{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <Button onClick={() => {
                  setIsPracticeActive(false);
                  setSelectedModule(null);
                  setModuleData(null);
                  setActiveMode(null);
                }} variant="outline" className="text-primary hover:text-primary/80 hover:bg-primary/10 text-xs sm:text-sm dark:text-emerald-300 dark:hover:text-emerald-200 dark:hover:bg-emerald-500/20" size="sm">
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Back to Modules</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </div>
            </div>
          )}

          {/* Other Practice Modes Active View */}
          {isPracticeActive && activeMode !== 'listening' && (
            <div className="text-center py-8 sm:py-12 px-4">
              <p className="text-sm sm:text-base text-muted-foreground dark:text-cyan-100/80 mb-4">Practice session is active. Implementation coming soon...</p>
              <Button onClick={() => {
                setIsPracticeActive(false);
                setActiveMode(null);
                setSelectedModule(null);
                setModuleData(null);
              }} variant="outline" className="text-primary hover:text-primary/80 hover:bg-primary/10 text-xs sm:text-sm dark:text-emerald-300 dark:hover:text-emerald-200 dark:hover:bg-emerald-500/20" size="sm">
                <span className="hidden sm:inline">Back to Modes</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </div>
          )}
      </main>
    </div>
  );
};

export default MultiModePracticePage;

