import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Headphones, Mic, BookOpen, PenTool, Play, Pause, CheckCircle, Clock, TrendingUp, Volume2, Eye, EyeOff, Trash2, AlertCircle, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  const [stars, setStars] = useState<Array<{ x: number; y: number; size: number; delay: number; opacity: number }>>([]);
  const [scrollY, setScrollY] = useState(0);
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

  // Generate animated stars - same as adults page
  useEffect(() => {
    const generateStars = () => {
      const isMobile = window.innerWidth < 768;
      const starCount = isMobile ? 100 : 200;
      
      const newStars = Array.from({ length: starCount }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 3,
        opacity: Math.random() * 0.8 + 0.2
      }));
      setStars(newStars);
    };
    generateStars();
    
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if ((isMobile && stars.length > 100) || (!isMobile && stars.length < 150)) {
        generateStars();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Page load fade-in
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Parallax scroll effect for planets
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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

  // Parallax transforms for planets
  const parallaxTransform1 = `translateY(${scrollY * 0.1}px)`;
  const parallaxTransform2 = `translateY(${scrollY * 0.15}px)`;
  const parallaxTransform3 = `translateY(${scrollY * 0.08}px)`;
  const parallaxTransform4 = `translateY(${scrollY * 0.12}px)`;

  return (
    <div className={`min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 ${isLoaded ? 'space-fade-in' : 'opacity-0'}`}>
      {/* Deep Space Background with Stars */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {stars.map((star, index) => (
          <div
            key={index}
            className="absolute rounded-full bg-white space-star"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              opacity: star.opacity,
              boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, ${star.opacity})`
            }}
          />
        ))}
      </div>

      {/* Nebula and Cosmic Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-radial from-purple-500/30 via-indigo-500/20 to-transparent rounded-full blur-3xl nebula-effect animate-pulse" />
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-radial from-cyan-500/25 via-blue-500/15 to-transparent rounded-full blur-3xl nebula-effect animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/3 w-[700px] h-[700px] bg-gradient-radial from-pink-500/20 via-rose-500/10 to-transparent rounded-full blur-3xl nebula-effect animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Large Planet/Moon Spheres - Main Visual Elements with Parallax */}
      <div 
        className="fixed bottom-0 left-0 w-[100px] h-[100px] sm:w-[140px] sm:h-[140px] md:w-[180px] md:h-[180px] lg:w-[220px] lg:h-[220px] xl:w-[260px] xl:h-[260px] pointer-events-none opacity-60 sm:opacity-65 md:opacity-70 lg:opacity-75 xl:opacity-80 parallax-slow"
        style={{ transform: parallaxTransform1 }}
      >
        <div className="relative w-full h-full">
          <img 
            src="/planets/eReia3yfybtZ8P5576d6kF8NJIM.avif" 
            alt="Planet" 
            className="absolute inset-0 rounded-full object-cover shadow-2xl"
            style={{ filter: 'grayscale(0.2) brightness(0.85)' }}
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 blur-2xl" />
        </div>
      </div>

      <div 
        className="fixed top-20 right-2 sm:right-4 md:right-10 w-[100px] h-[100px] sm:w-[150px] sm:h-[150px] md:w-[200px] md:h-[200px] lg:w-[250px] lg:h-[250px] xl:w-[300px] xl:h-[300px] pointer-events-none opacity-40 sm:opacity-50 md:opacity-60 hidden sm:block parallax-slow"
        style={{ transform: parallaxTransform2 }}
      >
        <div className="relative w-full h-full">
          <img 
            src="/planets/SEp7QE3Bk6RclE0R7rhBgcGIOI.avif" 
            alt="Planet" 
            className="absolute inset-0 rounded-full object-cover shadow-xl"
            style={{ filter: 'grayscale(0.3) brightness(0.75)' }}
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/15 to-pink-500/15 blur-xl" />
        </div>
      </div>

      <div 
        className="fixed top-1/2 right-4 md:right-20 w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] md:w-[180px] md:h-[180px] lg:w-[220px] lg:h-[220px] xl:w-[250px] xl:h-[250px] pointer-events-none opacity-30 sm:opacity-40 md:opacity-50 hidden md:block parallax-slow"
        style={{ transform: parallaxTransform3 }}
      >
        <div className="relative w-full h-full">
          <img 
            src="/planets/K3uC2Tk4o2zjSbuWGs3t0MMuLVY.avif" 
            alt="Planet" 
            className="absolute inset-0 rounded-full object-cover shadow-xl"
            style={{ filter: 'grayscale(0.3) brightness(0.7)' }}
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/15 to-blue-500/15 blur-xl" />
        </div>
      </div>

      <div 
        className="fixed top-32 left-2 sm:left-4 md:left-20 w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] md:w-[160px] md:h-[160px] lg:w-[180px] lg:h-[180px] xl:w-[200px] xl:h-[200px] pointer-events-none opacity-25 sm:opacity-30 md:opacity-40 hidden lg:block parallax-slow"
        style={{ transform: parallaxTransform4 }}
      >
        <div className="relative w-full h-full">
          <img 
            src="/planets/F4RKAKmFyoRYVlTsUWN51wD1dg.avif" 
            alt="Planet" 
            className="absolute inset-0 rounded-full object-cover shadow-lg"
            style={{ filter: 'grayscale(0.4) brightness(0.65)' }}
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 blur-lg" />
        </div>
      </div>

      <div className="relative z-10 pb-12 pt-20 sm:pt-24 md:pt-28 lg:pt-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Back Button */}
          <div className="mb-4 sm:mb-6 md:mb-8">
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
              className="text-cyan-300 hover:text-cyan-200 hover:bg-purple-500/20 mb-3 sm:mb-4 text-xs sm:text-sm"
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
            <div className="text-center mb-4 sm:mb-6 md:mb-8 px-2">
              {isPracticeActive && activeMode === 'listening' && moduleData ? (
                <>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 sm:mb-3 md:mb-4">
                    {moduleData.module.title}
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg text-cyan-100/80 max-w-2xl mx-auto leading-relaxed">
                    {moduleData.module.description}
                  </p>
                </>
              ) : activeMode === 'listening' && !selectedModule ? (
                <>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 sm:mb-3 md:mb-4">
                    Choose a Listening Module
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg text-cyan-100/80 max-w-2xl mx-auto leading-relaxed">
                    Select a module to practice your listening skills
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 sm:mb-3 md:mb-4">
                    Multi-Mode Practice
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg text-cyan-100/80 max-w-2xl mx-auto leading-relaxed px-2">
                    Practice listening, speaking, reading, and writing skills with comprehensive exercises
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Listening Module Selection */}
          {activeMode === 'listening' && !selectedModule && (
            <div className="mb-4 sm:mb-6 md:mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {listeningModules.map((module) => (
                  <Card
                    key={module.id}
                    className={cn(
                      'relative overflow-hidden group cursor-pointer rounded-2xl bg-slate-900/80 border border-slate-800/70 hover:border-cyan-400/40 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/20'
                    )}
                    onClick={() => handleSelectListeningModule(module.id)}
                  >
                    <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', module.color)} />
                    <CardContent className="p-4 sm:p-5 md:p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-full bg-slate-800/80 border border-slate-700/70 text-2xl">
                            {module.icon}
                          </div>
                          <div>
                            <h3 className="text-lg sm:text-xl font-semibold text-white">{module.title}</h3>
                            <p className="text-xs text-cyan-100/60">{module.duration} • {module.category}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-slate-800/70 text-cyan-200 border-cyan-400/30 capitalize text-xs">
                          {module.difficulty}
                        </Badge>
                      </div>
                      <p className="text-cyan-100/75 text-xs sm:text-sm line-clamp-3 min-h-[48px]">{module.description}</p>
                      <Button
                        className="w-full bg-cyan-500/90 hover:bg-cyan-400 text-slate-900 font-semibold text-xs sm:text-sm py-2 sm:py-2.5 border border-cyan-300/40"
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
              <TabsList className="w-full bg-slate-800/50 border-b border-purple-500/30 rounded-none mb-4 sm:mb-6 h-auto">
                <TabsTrigger value="modes" className="flex-1 text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4">
                  <span className="hidden sm:inline">Practice Modes</span>
                  <span className="sm:hidden">Modes</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1 text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4">
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
                          'group cursor-pointer bg-slate-900/60 backdrop-blur-xl border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 relative',
                          'bg-gradient-to-br',
                          mode.bgColor
                        )}
                        onClick={() => handleStartPractice(mode.id as 'listening' | 'speaking' | 'reading' | 'writing')}
                      >
                        <CardContent className="p-4 sm:p-5 md:p-6">
                          <div className="flex items-start justify-between mb-3 sm:mb-4">
                            <div className={cn('p-2 sm:p-3 rounded-lg bg-slate-900/50', mode.color)}>
                              <Icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                            </div>
                            {modeHistory.length > 0 && (
                              <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-400/30 text-xs">
                                {modeHistory.length} {modeHistory.length === 1 ? 'session' : 'sessions'}
                              </Badge>
                            )}
                          </div>

                          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{mode.label}</h3>
                          <p className="text-cyan-100/70 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                            Practice your {mode.label.toLowerCase()} skills with interactive exercises
                          </p>

                          {modeHistory.length > 0 && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm mb-3 sm:mb-4">
                              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 flex-shrink-0" />
                              <span className="text-cyan-100/70">
                                Avg: <span className="text-white font-semibold">{Math.round(avgScore)}%</span>
                              </span>
                            </div>
                          )}

                          <Button
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-xs sm:text-sm py-2 sm:py-2.5"
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
                          className="border-red-500/30 text-red-300 hover:bg-red-500/20 hover:text-red-200 text-xs sm:text-sm"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Delete Old (30+ days)</span>
                          <span className="sm:hidden">Delete Old</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-slate-900 border-purple-500/30">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-400" />
                            Delete Old Sessions?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-cyan-100/80">
                            This will permanently delete all practice sessions older than 30 days. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-slate-800 text-cyan-100 border-slate-700 hover:bg-slate-700">
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
                          className="border-red-500/30 text-red-300 hover:bg-red-500/20 hover:text-red-200 text-xs sm:text-sm"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Delete All</span>
                          <span className="sm:hidden">Delete All</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-slate-900 border-purple-500/30">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                            Delete All Sessions?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-cyan-100/80">
                            This will permanently delete all {sessionHistory.length} practice session(s). This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-slate-800 text-cyan-100 border-slate-700 hover:bg-slate-700">
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
                    <div className="text-center py-8 sm:py-12 text-cyan-100/70 text-sm sm:text-base px-4">
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
                        <Card key={session.id} className="bg-slate-900/60 backdrop-blur-xl border-purple-500/30 hover:border-purple-400/50 transition-all">
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center justify-between gap-2 sm:gap-4">
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                <div className={cn('p-1.5 sm:p-2 rounded-lg flex-shrink-0', modeConfig?.bgColor || 'from-blue-500/20 to-cyan-500/20')}>
                                  <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5', modeConfig?.color || 'text-blue-400')} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-white capitalize text-sm sm:text-base">
                                      {session.mode}
                                    </span>
                                    {moduleName && (
                                      <Badge variant="outline" className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30 text-xs">
                                        {moduleName}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-xs sm:text-sm text-cyan-100/70 mt-1">
                                    {sessionDate.toLocaleDateString()} {daysAgo > 0 && `(${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago)`}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="text-right flex-shrink-0">
                                  <div className="text-base sm:text-lg font-bold text-white">{session.score}%</div>
                                  <div className="text-xs text-cyan-100/70">{session.items_completed} items</div>
                                  {session.points_earned > 0 && (
                                    <div className="text-xs text-amber-300 font-semibold mt-1">
                                      {session.points_earned} pts
                                    </div>
                                  )}
                                </div>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-300 hover:text-red-400 hover:bg-red-500/20 flex-shrink-0"
                                      disabled={isDeleting}
                                    >
                                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-slate-900 border-purple-500/30">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-white flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5 text-red-400" />
                                        Delete Session?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription className="text-cyan-100/80">
                                        Are you sure you want to delete this {session.mode}{moduleName ? ` - ${moduleName}` : ''} practice session from {sessionDate.toLocaleDateString()}? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="bg-slate-800 text-cyan-100 border-slate-700 hover:bg-slate-700">
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
              <Card className="bg-gradient-to-br from-blue-500/20 via-indigo-500/30 to-purple-500/20 backdrop-blur-xl border-blue-400/50">
                <CardContent className="p-4 sm:p-5 md:p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Listen to the Audio</h3>
                      <p className="text-xs sm:text-sm text-cyan-100/80">
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
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
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
                        className="border-purple-500/30 text-cyan-300 hover:bg-purple-500/20"
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
                      <div className="flex items-center gap-2 border border-purple-500/30 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 bg-slate-800/50">
                        <Gauge className="h-4 w-4 text-cyan-300" />
                        <select
                          value={playbackSpeed}
                          onChange={(e) => setPlaybackSpeed(e.target.value as 'normal' | 'slow' | 'slower')}
                          className="bg-transparent text-cyan-300 text-xs sm:text-sm border-none outline-none cursor-pointer"
                          disabled={isPlaying}
                        >
                          <option value="slower" className="bg-slate-800">0.5x (Slower)</option>
                          <option value="slow" className="bg-slate-800">0.7x (Slow)</option>
                          <option value="normal" className="bg-slate-800">1.0x (Normal)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  {!ttsAvailable && (
                    <div className="mt-3 p-2 bg-amber-500/20 border border-amber-500/30 rounded text-xs text-amber-200 text-center">
                      Audio playback not available. Please enable browser audio permissions or use the transcript.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Transcript Section - Toggleable */}
              {showTranscript && (
                <Card className="bg-slate-900/60 backdrop-blur-xl border-purple-500/30">
                  <CardContent className="p-4 sm:p-5 md:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base sm:text-lg font-semibold text-white">Transcript</h3>
                      <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-400/30 text-xs">
                        Reference Only
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm md:text-base text-cyan-100/80 leading-relaxed">{moduleData.transcript}</p>
                  </CardContent>
                </Card>
              )}
              
              {/* Exercises Section */}
              <Card className="bg-slate-900/60 backdrop-blur-xl border-purple-500/30">
                <CardContent className="p-4 sm:p-5 md:p-6">
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Listening Comprehension Exercises</h3>
                      <p className="text-xs sm:text-sm text-cyan-100/70 mb-4">
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
                                "bg-slate-800/50 border-purple-500/20 transition-all",
                                isCurrentExercise && !showResults && "ring-2 ring-blue-400/50 border-blue-400/50",
                                isCorrect && "border-green-500/50 bg-green-500/10",
                                isIncorrect && "border-red-500/50 bg-red-500/10",
                                isAnswered && !isCurrentExercise && !showResults && "opacity-60"
                              )}
                            >
                              <CardContent className="p-3 sm:p-4">
                                <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs sm:text-sm font-semibold text-purple-300">Exercise {index + 1}</span>
                                    {showResults && isCorrect && (
                                      <Badge className="bg-green-500/20 text-green-300 border-green-400/30 text-xs">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Correct
                                      </Badge>
                                    )}
                                    {showResults && isIncorrect && (
                                      <Badge className="bg-red-500/20 text-red-300 border-red-400/30 text-xs">
                                        Incorrect
                                      </Badge>
                                    )}
                                  </div>
                                  <Badge variant="outline" className="bg-blue-500/20 text-blue-300 text-xs">
                                    {exercise.points} pts
                                  </Badge>
                                </div>
                                <p className="text-sm sm:text-base text-white mb-3">{exercise.question}</p>
                                
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
                                            "bg-slate-700/30 hover:bg-slate-700/50 border-2",
                                            isSelected && !showResults && "border-blue-400 bg-blue-500/20",
                                            isCorrectOption && showResults && "border-green-400 bg-green-500/20",
                                            isSelected && isIncorrect && showResults && "border-red-400 bg-red-500/20",
                                            !isSelected && showResults && "border-transparent",
                                            showResults && "cursor-default"
                                          )}
                                        >
                                          <span className="font-semibold mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                                          {option}
                                          {isCorrectOption && showResults && (
                                            <CheckCircle className="h-4 w-4 text-green-400 inline-block ml-2" />
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
                                        "flex-1 p-2 sm:p-3 rounded text-xs sm:text-sm font-semibold transition-all border-2",
                                        userAnswer === true && !showResults && "bg-blue-500/20 border-blue-400",
                                        userAnswer === true && showResults && exercise.correctAnswer === true && "bg-green-500/20 border-green-400",
                                        userAnswer === true && showResults && exercise.correctAnswer !== true && "bg-red-500/20 border-red-400",
                                        userAnswer !== true && "bg-slate-700/30 border-transparent hover:bg-slate-700/50",
                                        showResults && "cursor-default"
                                      )}
                                    >
                                      True
                                    </button>
                                    <button
                                      onClick={() => !showResults && handleAnswerChange(exercise.id, false)}
                                      disabled={showResults}
                                      className={cn(
                                        "flex-1 p-2 sm:p-3 rounded text-xs sm:text-sm font-semibold transition-all border-2",
                                        userAnswer === false && !showResults && "bg-blue-500/20 border-blue-400",
                                        userAnswer === false && showResults && exercise.correctAnswer === false && "bg-green-500/20 border-green-400",
                                        userAnswer === false && showResults && exercise.correctAnswer !== false && "bg-red-500/20 border-red-400",
                                        userAnswer !== false && "bg-slate-700/30 border-transparent hover:bg-slate-700/50",
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
                                        "w-full p-2 sm:p-3 rounded bg-slate-700/30 border-2 text-white text-xs sm:text-sm",
                                        "focus:outline-none focus:border-blue-400",
                                        showResults && isCorrect && "border-green-400 bg-green-500/20",
                                        showResults && isIncorrect && "border-red-400 bg-red-500/20"
                                      )}
                                    />
                                    {showResults && (
                                      <div className="text-xs sm:text-sm">
                                        <span className="text-cyan-100/70">Correct answer: </span>
                                        <span className="text-green-400 font-semibold">{exercise.correctAnswer}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {showResults && exercise.explanation && (
                                  <div className="mt-3 p-2 sm:p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                                    <p className="text-xs sm:text-sm text-cyan-100/80">
                                      <span className="font-semibold text-blue-300">Explanation: </span>
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
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                            size="lg"
                          >
                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            Submit Answers
                          </Button>
                        </div>
                      )}
                      
                      {showResults && (
                        <div className="mt-4 sm:mt-6 p-4 sm:p-5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 rounded-lg">
                          <div className="text-center">
                            <h4 className="text-lg sm:text-xl font-bold text-white mb-2">Your Score</h4>
                            <div className="text-3xl sm:text-4xl font-bold text-cyan-400 mb-2">
                              {Math.round((practiceProgress.items_correct / practiceProgress.items_completed) * 100)}%
                            </div>
                            <p className="text-xs sm:text-sm text-cyan-100/80">
                              {practiceProgress.items_correct} out of {practiceProgress.items_completed} correct
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Vocabulary</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {moduleData.vocabulary.map((vocab, index) => (
                          <Card key={index} className="bg-slate-800/50 border-purple-500/20">
                            <CardContent className="p-2.5 sm:p-3">
                              <div className="font-semibold text-white mb-1 text-sm sm:text-base">{vocab.word}</div>
                              <div className="text-xs sm:text-sm text-cyan-100/70">{vocab.definition}</div>
                              {vocab.example && (
                                <div className="text-xs text-cyan-100/60 mt-1 italic">"{vocab.example}"</div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Tips</h3>
                      <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-cyan-100/80 pl-2">
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
                }} variant="outline" className="text-cyan-300 text-xs sm:text-sm" size="sm">
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
              <p className="text-sm sm:text-base text-cyan-100/80 mb-4">Practice session is active. Implementation coming soon...</p>
              <Button onClick={() => {
                setIsPracticeActive(false);
                setActiveMode(null);
                setSelectedModule(null);
                setModuleData(null);
              }} variant="outline" className="text-xs sm:text-sm" size="sm">
                <span className="hidden sm:inline">Back to Modes</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiModePracticePage;

