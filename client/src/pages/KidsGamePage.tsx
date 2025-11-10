import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trophy, Loader2, AlertCircle, ArrowLeft, Volume2, RotateCcw, Star, Award, StopCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import EnhancedTTS from '@/services/EnhancedTTS';
import { WhisperService } from '@/services/WhisperService';
import KidsVoiceRecorder from '@/components/kids/KidsVoiceRecorder';
import { useAuth } from '@/contexts/AuthContext';
import KidsApi from '@/services/KidsApi';
import KidsProgressService from '@/services/KidsProgressService';
import { GeminiService } from '@/services/GeminiService';
import GameHistoryService, { type GameSession } from '@/services/GameHistoryService';

// Helper function to find a female voice ID for TTS
const findFemaleVoiceId = (): string | undefined => {
  try {
    const femaleVoices = EnhancedTTS.getVoicesByFilter({ lang: 'en', gender: 'female' });
    if (femaleVoices.length > 0) {
      return femaleVoices[0].id;
    }
    const allVoices = EnhancedTTS.getVoices();
    const anyFemale = allVoices.find(v => v.gender === 'female');
    return anyFemale?.id;
  } catch (error) {
    console.warn('Could not find female voice, using default:', error);
    return undefined;
  }
};

// Helper function to format AI response (remove JSON structure)
const formatAIResponse = (content: string): string => {
  if (!content) return '';
  
  let formatted = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  
  // If the content is raw JSON, try to extract readable text from it
  if (formatted.startsWith('{')) {
    try {
      const parsed = JSON.parse(formatted);
      const parts = [];
      
      if (parsed.content) parts.push(parsed.content);
      if (parsed.feedback) parts.push(parsed.feedback);
      if (parsed.nextStep) parts.push(parsed.nextStep);
      if (parsed.gameInstruction) parts.push(parsed.gameInstruction);
      
      if (parts.length > 0) {
        formatted = parts.join(' ');
      } else {
        // If no parts found, just remove JSON structure
        formatted = formatted.replace(/^\{\s*/, '').replace(/\s*\}$/, '');
      }
    } catch (e) {
      // If parsing fails, try to extract string values using regex
      const stringMatches = formatted.match(/"([^"]+)":\s*"([^"]+)"/g);
      if (stringMatches) {
        const textParts: string[] = [];
        stringMatches.forEach(match => {
          const keyValue = match.match(/"([^"]+)":\s*"([^"]+)"/);
          if (keyValue) {
            const key = keyValue[1];
            const value = keyValue[2];
            if (key === 'content' || key === 'feedback' || key === 'nextStep' || key === 'gameInstruction') {
              textParts.push(value);
            }
          }
        });
        if (textParts.length > 0) {
          formatted = textParts.join(' ');
        } else {
          formatted = formatted.replace(/^\{\s*/, '').replace(/\s*\}$/, '');
        }
      } else {
        formatted = formatted.replace(/^\{\s*/, '').replace(/\s*\}$/, '');
      }
    }
  }
  
  return formatted.trim();
};

type GameType = 'tongue-twister' | 'word-chain' | 'story-telling' | 'pronunciation-challenge' | 'conversation-practice' |
                'debate-club' | 'critical-thinking' | 'research-challenge' | 'presentation-master' | 'ethics-discussion';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isEditable?: boolean;
  hasErrors?: boolean;
}

// Young kids games (ages 4-10)
const youngGameTitles: Record<string, { title: string; emoji: string; description: string }> = {
  'tongue-twister': { title: 'Tongue Twisters', emoji: '👅', description: 'Master tricky phrases to improve pronunciation!' },
  'word-chain': { title: 'Word Chain', emoji: '🔗', description: 'Connect words by speaking them in sequence!' },
  'story-telling': { title: 'Story Telling', emoji: '📖', description: 'Create and tell your own stories with AI!' },
  'pronunciation-challenge': { title: 'Pronunciation Master', emoji: '🎯', description: 'Perfect your pronunciation with AI challenges!' },
  'conversation-practice': { title: 'Chat Practice', emoji: '💬', description: 'Practice real conversations with AI!' }
};

// Teen games (ages 11-17)
const teenGameTitles: Record<string, { title: string; emoji: string; description: string }> = {
  'debate-club': { title: 'Debate Club', emoji: '⚖️', description: 'Engage in structured debates on real-world topics! Develop critical arguments and persuasive speaking skills.' },
  'critical-thinking': { title: 'Critical Thinking Challenge', emoji: '🧠', description: 'Solve complex problems and analyze arguments! Strengthen your logical reasoning abilities.' },
  'research-challenge': { title: 'Research Challenge', emoji: '🔬', description: 'Present findings on advanced topics with AI feedback! Practice academic research skills.' },
  'presentation-master': { title: 'Presentation Master', emoji: '📊', description: 'Practice professional presentations and public speaking! Build confidence for real-world scenarios.' },
  'ethics-discussion': { title: 'Ethics Discussion', emoji: '🤔', description: 'Explore ethical dilemmas and moral reasoning! Develop thoughtful perspectives on complex issues.' },
  'pronunciation-challenge': { title: 'Advanced Pronunciation', emoji: '🎯', description: 'Master complex phrases and professional speech! Perfect your pronunciation for academic and professional contexts.' },
  'conversation-practice': { title: 'Professional Conversation', emoji: '💼', description: 'Practice business and academic conversations! Build confidence in professional settings.' }
};

const KidsGamePage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [currentRound, setCurrentRound] = useState(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [currentDifficulty, setCurrentDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [gameCompleted, setGameCompleted] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [sessionAge, setSessionAge] = useState<number | null>(null); // Store age for consistency during session
  const [gameTimeLimit] = useState<number>(8 * 60 * 1000); // 8 minutes in milliseconds
  const [timeRemaining, setTimeRemaining] = useState<number>(8 * 60 * 1000); // Time remaining in milliseconds
  const [gameEndReason, setGameEndReason] = useState<'time-up' | 'user-requested' | 'ai-ended' | 'completed' | null>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const conversationContainerRef = useRef<HTMLDivElement>(null);

  const isTeenContext = searchParams.get('teen') === 'true';
  const currentGame = gameId as GameType;

  // Validate game ID based on context
  useEffect(() => {
    const youngGames: GameType[] = ['tongue-twister', 'word-chain', 'story-telling', 'pronunciation-challenge', 'conversation-practice'];
    const teenGames: GameType[] = ['debate-club', 'critical-thinking', 'research-challenge', 'presentation-master', 'ethics-discussion', 'pronunciation-challenge', 'conversation-practice'];
    
    if (!gameId) {
      navigate(isTeenContext ? '/kids/teen?section=games' : '/kids/young?section=games');
      return;
    }
    
    if (isTeenContext) {
      // For teen context, allow teen games and shared games (pronunciation-challenge, conversation-practice)
      if (!teenGames.includes(currentGame)) {
        navigate('/kids/teen?section=games');
      }
    } else {
      // For young context, only allow young games
      if (!youngGames.includes(currentGame)) {
        navigate('/kids/young?section=games');
      }
    }
  }, [gameId, currentGame, navigate, isTeenContext]);

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

  // Auto-scroll conversation history when new messages are added
  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [conversationHistory]);

  // Handle score updates with backend sync (defined early for use in other functions)
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

  // Handle game ending with proportional points calculation
  const handleGameEnd = async (reason: 'time-up' | 'user-requested' | 'ai-ended' | 'completed') => {
    if (gameCompleted) return;
    
    setGameCompleted(true);
    setGameEndReason(reason);
    
    const currentTime = Date.now();
    const timeElapsed = currentTime - sessionStartTime;
    const timePlayedRatio = Math.min(1, timeElapsed / gameTimeLimit);
    const isFullCompletion = reason === 'time-up' || reason === 'completed';
    
    // Calculate points based on completion status
    let finalScore = gameScore;
    let completionBonus = 0;
    
    if (isFullCompletion) {
      // Full completion: award full bonus points
      completionBonus = Math.max(50, currentRound * 3);
      finalScore = gameScore + completionBonus;
    } else {
      // Early end: calculate proportional points based on time played
      const basePoints = gameScore;
      const fullCompletionBonus = Math.max(50, currentRound * 3);
      const proportionalBonus = Math.round(fullCompletionBonus * timePlayedRatio);
      completionBonus = proportionalBonus;
      finalScore = basePoints + proportionalBonus;
    }
    
    // Update score if there's a bonus
    if (completionBonus > 0) {
      await handleScoreUpdate(completionBonus, currentGame);
    }
    
    // Save game history
    if (isAuthenticated && currentSessionId) {
      const gameTitles = isTeenContext ? teenGameTitles : youngGameTitles;
      const gameInfo = gameTitles[currentGame];
      
      const session: GameSession = {
        id: currentSessionId,
        gameType: currentGame,
        gameTitle: gameInfo?.title || currentGame,
        startTime: sessionStartTime || Date.now() - (currentRound * 30000),
        endTime: currentTime,
        score: finalScore,
        rounds: currentRound,
        difficulty: currentDifficulty,
        conversationHistory: conversationHistory,
        completed: isFullCompletion
      };
      
      try {
        await GameHistoryService.saveGameSession(userId, session);
        console.log(`✅ Game end (${reason}) - session saved:`, session.id);
      } catch (error) {
        console.error('Error saving game end:', error);
      }
    }
    
    // Generate appropriate ending message
    let endingMessage: ConversationMessage;
    const minutesPlayed = Math.floor(timeElapsed / 60000);
    const secondsPlayed = Math.floor((timeElapsed % 60000) / 1000);
    
    if (isFullCompletion) {
      endingMessage = {
        role: 'assistant',
        content: `🎉 Excellent work! You completed the full game session and earned ${finalScore} points! You played for the full ${Math.floor(gameTimeLimit / 60000)} minutes. Great job!`,
        timestamp: Date.now()
      };
    } else {
      endingMessage = {
        role: 'assistant',
        content: `Good effort! You played for ${minutesPlayed} minute${minutesPlayed !== 1 ? 's' : ''} and ${secondsPlayed} second${secondsPlayed !== 1 ? 's' : ''}, earning ${finalScore} points. ${reason === 'user-requested' ? 'Thanks for playing!' : 'Keep practicing to earn more points!'}`,
        timestamp: Date.now()
      };
    }
    
    setConversationHistory(prev => [...prev, endingMessage]);
    
    // Play completion message
    if (isSoundEnabled) {
      const completionMessage = isFullCompletion
        ? `Time's up! Great job completing the full game! You earned ${finalScore} points!`
        : `You played for ${minutesPlayed} minute${minutesPlayed !== 1 ? 's' : ''} and earned ${finalScore} points. Great effort!`;
      EnhancedTTS.speak(completionMessage, { 
        voice: findFemaleVoiceId(),
        rate: 0.9, 
        emotion: 'excited' 
      }).catch(() => {});
    }
  };

  // Handle time-based game ending (for backward compatibility)
  const handleTimeBasedGameEnd = async () => {
    await handleGameEnd('time-up');
  };

  // Handle user-requested game ending
  const handleUserRequestedEnd = async () => {
    await handleGameEnd('user-requested');
  };

  // Start game automatically when component mounts
  useEffect(() => {
    if (currentGame && GeminiService.isReady()) {
      startGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGame]);

  // Time-based game ending - automatically end game after 8 minutes
  useEffect(() => {
    if (!sessionStartTime || gameCompleted) return;

    const updateTimer = () => {
      const timeElapsed = Date.now() - sessionStartTime;
      const remaining = gameTimeLimit - timeElapsed;

      if (remaining <= 0) {
        // Time limit reached - end the game
        handleTimeBasedGameEnd();
        setTimeRemaining(0);
        return;
      }

      setTimeRemaining(remaining);
    };

    // Update timer every second
    const interval = setInterval(updateTimer, 1000);
    updateTimer(); // Initial update

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStartTime, gameCompleted, gameTimeLimit]);

  // Save game session periodically and on unmount
  useEffect(() => {
    // Function to save current game session
    const saveCurrentSession = async () => {
      if (isAuthenticated && currentSessionId && conversationHistory.length > 0) {
        const gameTitles = isTeenContext ? teenGameTitles : youngGameTitles;
        const gameInfo = gameTitles[currentGame];
        
        const session: GameSession = {
          id: currentSessionId,
          gameType: currentGame,
          gameTitle: gameInfo?.title || currentGame,
          startTime: sessionStartTime || Date.now() - (currentRound * 30000),
          endTime: gameCompleted ? Date.now() : undefined,
          score: gameScore,
          rounds: currentRound,
          difficulty: currentDifficulty,
          conversationHistory: conversationHistory,
          completed: gameCompleted
        };
        
        try {
          await GameHistoryService.saveGameSession(userId, session);
          console.log('✅ Game session saved:', session.id, gameCompleted ? 'completed' : 'in progress');
        } catch (error) {
          console.error('Error saving game session:', error);
        }
      }
    };

    // Save session every 30 seconds during active play
    const saveInterval = setInterval(() => {
      if (!gameCompleted && conversationHistory.length > 0) {
        saveCurrentSession();
      }
    }, 30000); // Save every 30 seconds

    // Cleanup: save on unmount
    return () => {
      clearInterval(saveInterval);
      // Save final state on unmount
      if (isAuthenticated && currentSessionId && conversationHistory.length > 0) {
        saveCurrentSession();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, currentSessionId, conversationHistory, gameScore, currentRound, currentDifficulty, gameCompleted, sessionStartTime]);


  // Start a new game
  const startGame = async () => {
    if (!GeminiService.isReady()) {
      setError('AI service not ready. Please check your internet connection and ensure you are logged in.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGameContent('');
    setGameInstruction('');
    setQuestions([]);
    setConversationHistory([]);
    setCurrentRound(0);
    setConsecutiveCorrect(0);
    setCurrentDifficulty('beginner');
    setGameCompleted(false);
    setGameScore(0); // Reset game score for new game
    setSessionAge(null); // Reset age for new game session
    setTimeRemaining(gameTimeLimit); // Reset time remaining
    setGameEndReason(null); // Reset end reason
    
    // Create new session ID and track start time
    const sessionId = `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setCurrentSessionId(sessionId);
    setSessionStartTime(Date.now());

    try {
      // Use age-appropriate settings: 14 for teens (middle of 11-17), random age 4-10 for young kids to add variety
      // This ensures games are tailored for the 4-10 age range with varied content
      // Age is randomized per session to add variety, but stays consistent during the session
      const playerAge = isTeenContext ? 14 : (sessionAge || Math.floor(Math.random() * 7) + 4); // Random age between 4-10, consistent per session
      if (!sessionAge && !isTeenContext) {
        setSessionAge(playerAge); // Store age for this session
      }
      
      const response = await GeminiService.generateGame({
        gameType: currentGame,
        context: {
          age: playerAge,
          level: currentDifficulty,
          completedStories: [],
          interests: [] // Can be expanded later with user interests
        }
      });

      const formattedContent = formatAIResponse(response.content);
      
      setGameContent(formattedContent);
      if (response.gameInstruction) {
        setGameInstruction(response.gameInstruction);
      }
      if (response.questions) {
        setQuestions(response.questions);
      }

      const initialHistory: ConversationMessage[] = [{
        role: 'assistant' as const,
        content: formattedContent,
        timestamp: Date.now()
      }];
      setConversationHistory(initialHistory);
      
      // Save initial game session when game starts
      if (isAuthenticated && currentSessionId) {
        const gameTitles = isTeenContext ? teenGameTitles : youngGameTitles;
        const gameInfo = gameTitles[currentGame];
        
        const session: GameSession = {
          id: currentSessionId,
          gameType: currentGame,
          gameTitle: gameInfo?.title || currentGame,
          startTime: sessionStartTime,
          endTime: undefined,
          score: 0,
          rounds: 0,
          difficulty: currentDifficulty,
          conversationHistory: initialHistory,
          completed: false
        };
        
        // Save initial session
        GameHistoryService.saveGameSession(userId, session).catch(error => {
          console.warn('Error saving initial game session:', error);
        });
      }

      if (isSoundEnabled && formattedContent) {
        const femaleVoiceId = findFemaleVoiceId();
        await EnhancedTTS.speak(formattedContent, { 
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

  // Handle user input
  const handleUserInput = async (input: string, existingMessage?: ConversationMessage) => {
    if (!input.trim() || !GeminiService.isReady()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    let updatedHistory = [...conversationHistory];
    
    if (!existingMessage) {
      const userMessage: ConversationMessage = {
        role: 'user',
        content: input,
        timestamp: Date.now(),
        isEditable: true,
        hasErrors: false
      };
      updatedHistory = [...conversationHistory, userMessage];
      setConversationHistory(updatedHistory);
    }

    try {
      const history = updatedHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Use same age context for consistency during the game session
      const playerAge = isTeenContext ? 14 : (sessionAge || 7); // Use stored session age or default
      
      const response = await GeminiService.generateGame({
        gameType: currentGame,
        userInput: input,
        conversationHistory: history,
        context: {
          age: playerAge,
          level: currentDifficulty,
          completedStories: []
        }
      });
      
      // Auto-advance difficulty based on performance
      if (currentRound >= 5 && currentDifficulty === 'beginner') {
        setCurrentDifficulty('intermediate');
      } else if (currentRound >= 15 && currentDifficulty === 'intermediate') {
        setCurrentDifficulty('advanced');
      }

      const formattedContent = formatAIResponse(response.content);

      const assistantMessage: ConversationMessage = {
        role: 'assistant',
        content: formattedContent,
        timestamp: Date.now()
      };
      const newHistory: ConversationMessage[] = [...conversationHistory, assistantMessage];
      setConversationHistory(newHistory);
      
      // Auto-save game session after each AI response (to ensure progress is saved)
      if (isAuthenticated && currentSessionId && newHistory.length > 0) {
        const gameTitles = isTeenContext ? teenGameTitles : youngGameTitles;
        const gameInfo = gameTitles[currentGame];
        
        const session: GameSession = {
          id: currentSessionId,
          gameType: currentGame,
          gameTitle: gameInfo?.title || currentGame,
          startTime: sessionStartTime || Date.now() - (currentRound * 30000),
          endTime: gameCompleted ? Date.now() : undefined,
          score: gameScore,
          rounds: currentRound,
          difficulty: currentDifficulty,
          conversationHistory: newHistory,
          completed: gameCompleted
        };
        
        // Save asynchronously without blocking UI
        GameHistoryService.saveGameSession(userId, session).catch(error => {
          console.warn('Background save failed (will retry):', error);
        });
      }

      const errorKeywords = ['wrong', 'incorrect', 'mistake', 'try again', 'not quite', 'almost', 'better', 'correction'];
      const hasErrors = errorKeywords.some(keyword => 
        formattedContent.toLowerCase().includes(keyword)
      );

      if (hasErrors && existingMessage) {
        setConversationHistory(prev => {
          const updated = [...prev];
          const userIndex = updated.findIndex((msg, idx) => 
            msg.role === 'user' && msg.content === input && idx < updated.length - 1
          );
          if (userIndex !== -1) {
            updated[userIndex] = {
              ...updated[userIndex],
              hasErrors: true,
              isEditable: true
            };
          }
          return updated;
        });
      }

      if (response.questions) {
        setQuestions(response.questions);
      }
      if (response.gameInstruction) {
        setGameInstruction(response.gameInstruction);
      }

      // Always award points when AI responds (even if no explicit points in response)
      // Award based on correctness and round number
      let pointsToAward = 0;
      if (response.points && response.points > 0) {
        pointsToAward = response.points;
      } else {
        // Award default points based on round and difficulty
        const basePoints = currentDifficulty === 'beginner' ? 5 : currentDifficulty === 'intermediate' ? 10 : 15;
        pointsToAward = basePoints + consecutiveCorrect;
      }
      
      if (pointsToAward > 0) {
        handleScoreUpdate(pointsToAward, currentGame);
        
        // Update stats
        setConsecutiveCorrect(prev => prev + 1);
        setCurrentRound(prev => prev + 1);
      }
      
      // Check if user requested to end the game
      const endGamePhrases = [
        'end game', 'finish', 'stop', 'done', 'done for today', "i'm done", "let's stop", 
        'finish game', 'end this game', 'i want to stop', 'can we stop', 'i want to end',
        'end the game', 'stop playing', 'finish playing', 'i am done', 'we are done',
        'can you end', 'please end', 'end now', 'stop now', 'finish now'
      ];
      const userRequestedEnd = endGamePhrases.some(phrase => input.toLowerCase().includes(phrase));
      
      // Check if AI wants to end the game
      const aiEndIndicators = [
        'great job', 'completed', 'excellent', 'finished', 'well done', 'congratulations',
        'game over', 'session complete', 'that\'s all', 'we\'re done'
      ];
      const aiWantsToEnd = aiEndIndicators.some(indicator => 
        formattedContent.toLowerCase().includes(indicator) && 
        (formattedContent.toLowerCase().includes('completed') || 
         formattedContent.toLowerCase().includes('finished') ||
         formattedContent.toLowerCase().includes('done'))
      );
      
      // Check if game should end (max rounds, explicit end signal, user request, or AI decision)
      const shouldEndGame = response.gameEnd || userRequestedEnd || aiWantsToEnd || currentRound >= 20;
      
      if (shouldEndGame && !gameCompleted) {
        // Determine end reason
        let endReason: 'user-requested' | 'ai-ended' | 'completed' = 'completed';
        if (userRequestedEnd) {
          endReason = 'user-requested';
        } else if (aiWantsToEnd || response.gameEnd) {
          endReason = 'ai-ended';
        }
        
        // End the game with appropriate reason
        await handleGameEnd(endReason);
      }

      if (isSoundEnabled && formattedContent) {
        const femaleVoiceId = findFemaleVoiceId();
        await EnhancedTTS.speak(formattedContent, { 
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

  // Handle voice input - optimized for immediate detection
  const handleVoiceInput = async (blob: Blob, _score: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use Whisper with optimized settings for games/conversations
      const result = await WhisperService.transcribe(blob, {
        language: 'en',
        prompt: conversationHistory.length > 0 
          ? conversationHistory[conversationHistory.length - 1].content 
          : gameContent // Use context to improve recognition
      });
      
      const transcript = result.transcript.trim();
      
      if (transcript && transcript.length >= 2) { // Accept transcripts with at least 2 characters
        console.log('✅ Game voice input received:', transcript);
        
        // Stop sparkles/floating icons when speech is detected correctly
        window.dispatchEvent(new CustomEvent('game-speech-detected', { 
          detail: { transcript, gameType: currentGame } 
        }));
        
        // Award points for speaking (engagement bonus)
        const engagementPoints = 2;
        handleScoreUpdate(engagementPoints, currentGame);
        
        const userMessage: ConversationMessage = {
          role: 'user',
          content: transcript,
          timestamp: Date.now(),
          isEditable: true,
          hasErrors: false
        };
        setConversationHistory(prev => [...prev, userMessage]);
        
        // Process immediately - AI will respond right away and award more points
        await handleUserInput(transcript, userMessage);
      } else {
        // If transcript is too short or empty, give user a chance to try again
        setError('I couldn\'t hear you clearly. Please try speaking again. Speak a bit louder or closer to the microphone.');
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('Voice transcription error:', error);
      
      // More user-friendly error messages
      if (error.message?.includes('timeout')) {
        setError('I\'m still listening! Please speak clearly and try again.');
      } else if (error.message?.includes('No speech')) {
        setError('I didn\'t hear anything. Please click the microphone and speak again.');
      } else {
        setError('Let\'s try again! Please speak clearly into the microphone.');
      }
      setIsLoading(false);
    }
  };

  // Update user message
  const updateUserMessage = async (messageIndex: number, newContent: string) => {
    if (!newContent.trim()) return;
    
    setConversationHistory(prev => {
      const updated = [...prev];
      if (updated[messageIndex] && updated[messageIndex].role === 'user') {
        const originalMessage = updated[messageIndex];
        const newContentTrimmed = newContent.trim();
        
        updated[messageIndex] = {
          ...originalMessage,
          content: newContentTrimmed,
          hasErrors: false
        };
        
        if (originalMessage.hasErrors && newContentTrimmed !== originalMessage.content) {
          setIsLoading(true);
          handleUserInput(newContentTrimmed, updated[messageIndex]).catch(err => {
            console.error('Error resending message:', err);
            setIsLoading(false);
          });
        }
      }
      return updated;
    });
  };

  const startEditing = (index: number, currentContent: string) => {
    setEditingIndex(index);
    setEditValue(currentContent);
  };

  const saveEdit = (index: number) => {
    if (editValue.trim()) {
      updateUserMessage(index, editValue.trim());
      setEditingIndex(null);
      setEditValue('');
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  // Replay AI message
  const replayAIMessage = async (content: string) => {
    if (!isSoundEnabled || !content.trim()) return;
    
    try {
      const femaleVoiceId = findFemaleVoiceId();
      await EnhancedTTS.speak(content, { 
        voice: femaleVoiceId,
        rate: 0.9, 
        emotion: 'happy' 
      });
    } catch (error) {
      console.error('Error replaying AI message:', error);
    }
  };

  // Get game info based on context
  const gameTitles = isTeenContext ? teenGameTitles : youngGameTitles;
  const gameInfo = gameTitles[currentGame];
  
  if (!currentGame || !gameInfo) {
    return null;
  }

  return (
    <div className="min-h-screen pb-16 sm:pb-20 pt-24 sm:pt-32 md:pt-40 relative overflow-hidden">
      {/* Celebration Overlay - Sparkles removed per user request */}
      {/* {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </div>
          ))}
        </div>
      )} */}

      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
        <Card className="border-2 border-purple-300/50 bg-purple-50/40 dark:bg-purple-900/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2 text-gray-900 dark:text-white">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl">{gameInfo.emoji}</span>
                <span className="text-base sm:text-lg md:text-xl">{gameInfo.title}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto flex-wrap">
                {!gameCompleted && sessionStartTime > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleUserRequestedEnd}
                    className="rounded-xl text-red-600 hover:bg-red-50 text-xs sm:text-sm flex-1 sm:flex-initial"
                    disabled={isLoading || gameCompleted}
                  >
                    <StopCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                    <span className="hidden sm:inline">End Game</span>
                    <span className="sm:hidden">End</span>
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={startGame}
                  className="rounded-xl text-green-600 hover:bg-green-50 text-xs sm:text-sm flex-1 sm:flex-initial"
                  disabled={isLoading}
                >
                  <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Restart</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(isTeenContext ? '/kids/teen?section=games' : '/kids/young?section=games')} 
                  className="rounded-xl text-blue-600 text-xs sm:text-sm flex-1 sm:flex-initial"
                >
                  <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Back to Games</span>
                  <span className="sm:hidden">Back</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                  className="rounded-xl text-xs sm:text-sm flex-shrink-0"
                  title={isSoundEnabled ? 'Sound On' : 'Sound Off'}
                >
                  {isSoundEnabled ? '🔊' : '🔇'}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Display */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 sm:p-4 border-2 border-yellow-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                  <span className="text-lg sm:text-xl font-bold text-yellow-700 dark:text-yellow-300">
                    {gameScore} Points
                  </span>
                </div>
                {currentRound > 0 && (
                  <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Round {currentRound}
                      </span>
                    </div>
                    {consecutiveCorrect > 0 && (
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {consecutiveCorrect} in a row! 🔥
                        </span>
                      </div>
                    )}
                    <div className={cn(
                      "px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold whitespace-nowrap",
                      currentDifficulty === 'beginner' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                      currentDifficulty === 'intermediate' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                      currentDifficulty === 'advanced' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    )}>
                      {currentDifficulty.toUpperCase()}
                    </div>
                  </div>
                )}
              </div>
              {/* Time Remaining Display */}
              {!gameCompleted && sessionStartTime > 0 && (
                <div className="mt-3 pt-3 border-t border-yellow-300 dark:border-yellow-700">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">
                      Time Remaining:
                    </span>
                    <span className={cn(
                      "text-xs sm:text-sm font-bold",
                      timeRemaining <= 60000 ? "text-red-600 dark:text-red-400" : "text-gray-800 dark:text-gray-200"
                    )}>
                      {Math.floor(timeRemaining / 60000)}:{(Math.floor((timeRemaining % 60000) / 1000)).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-yellow-200 dark:bg-yellow-800 rounded-full h-2">
                    <div 
                      className={cn(
                        "h-2 rounded-full transition-all duration-1000",
                        timeRemaining <= 60000 ? "bg-red-500" : "bg-yellow-500"
                      )}
                      style={{ width: `${Math.min(100, (timeRemaining / gameTimeLimit) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 rounded-lg p-3 sm:p-4">
                <p className="text-red-700 dark:text-red-300 text-xs sm:text-sm">{error}</p>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                <span className="text-xs sm:text-sm">AI is thinking...</span>
              </div>
            )}

            {/* Game Instruction */}
            {gameInstruction && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 sm:p-4 border-2 border-blue-200">
                <div className="flex items-start justify-between gap-2 mb-1 sm:mb-2">
                  <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">
                    AI Teacher
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => replayAIMessage(gameInstruction)}
                    className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 flex-shrink-0"
                    disabled={!isSoundEnabled}
                    title="Replay instruction"
                  >
                    <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                  </Button>
                </div>
                <p className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300 font-semibold">{gameInstruction}</p>
              </div>
            )}

            {/* Game Content */}
            {gameContent && conversationHistory.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between gap-2 mb-1 sm:mb-2">
                  <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">
                    AI Teacher
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => replayAIMessage(gameContent)}
                    className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0"
                    disabled={!isSoundEnabled}
                    title="Replay message"
                  >
                    <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                  </Button>
                </div>
                <p className="text-xs sm:text-sm md:text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {gameContent}
                </p>
              </div>
            )}

            {/* Questions */}
            {questions.length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                {questions.map((q, idx) => (
                  <div key={idx} className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 sm:p-4 border-2 border-yellow-200">
                    <h4 className="font-bold text-base sm:text-lg mb-2">{q.question}</h4>
                    {q.options && (
                      <div className="space-y-2 mt-2 sm:mt-3">
                        {q.options.map((opt, optIdx) => (
                          <Button 
                            key={optIdx}
                            variant="outline"
                            className="w-full text-left justify-start text-xs sm:text-sm"
                            onClick={() => handleUserInput(opt)}
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
              <div 
                ref={conversationContainerRef}
                className="space-y-3 sm:space-y-4 max-h-[calc(100vh-400px)] sm:max-h-[calc(100vh-500px)] overflow-y-auto pb-4"
                style={{ scrollBehavior: 'smooth' }}
              >
                {conversationHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "rounded-lg p-3 sm:p-4 transition-all",
                      msg.role === 'user'
                        ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 ml-auto max-w-[90%] sm:max-w-[85%]"
                        : "bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 mr-auto max-w-[90%] sm:max-w-[85%]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1 sm:mb-2">
                      <p className="text-xs sm:text-sm font-bold">
                        {msg.role === 'user' ? 'You' : 'AI Teacher'}
                      </p>
                      <div className="flex items-center gap-1 sm:gap-2">
                        {msg.role === 'assistant' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => replayAIMessage(msg.content)}
                            className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                            disabled={!isSoundEnabled}
                            title="Replay message"
                          >
                            <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </Button>
                        )}
                        {msg.role === 'user' && msg.isEditable && !isLoading && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(idx, msg.content)}
                            className="h-5 sm:h-6 px-1.5 sm:px-2 text-xs flex-shrink-0"
                            disabled={editingIndex === idx}
                          >
                            {editingIndex === idx ? 'Editing...' : '✏️ Edit'}
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {editingIndex === idx ? (
                      <div className="space-y-2">
                        <Input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && saveEdit(idx)}
                          className="w-full text-xs sm:text-sm"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => saveEdit(idx)}
                            className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                            disabled={!editValue.trim()}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                            className="text-xs sm:text-sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className={cn(
                          "text-xs sm:text-sm whitespace-pre-wrap leading-relaxed",
                          msg.role === 'user' 
                            ? "text-blue-900 dark:text-blue-100" 
                            : "text-gray-800 dark:text-gray-200"
                        )}>
                          {msg.content}
                        </p>
                        {msg.hasErrors && (
                          <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-2">
                            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
                            <p className="text-xs text-orange-600 dark:text-orange-400 italic">
                              AI detected some mistakes. Click Edit to correct!
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={conversationEndRef} />
              </div>
            )}

            {/* Game Completion Message */}
            {gameCompleted && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 sm:p-6 border-2 border-green-300 dark:border-green-700">
                <div className="text-center space-y-3 sm:space-y-4">
                  <div className="text-3xl sm:text-4xl mb-2">🎉</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200">
                    Game Completed!
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    You earned <span className="font-bold text-green-600 dark:text-green-400">{gameScore} points</span> in this game! 🎉
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Points have been saved to your total score!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                    <Button
                      onClick={startGame}
                      className="bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] hover:from-[#4ECDC4] hover:to-[#FF6B6B] text-white text-xs sm:text-sm"
                    >
                      Play Again
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate(isTeenContext ? '/kids/teen?section=games' : '/kids/young?section=games')}
                      className="text-xs sm:text-sm"
                    >
                      Back to Games
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Voice Input at Bottom of Game Container */}
            {!gameCompleted && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-2 sm:p-3 md:p-4 border-2 border-purple-200 dark:border-purple-700 shadow-lg mt-3 sm:mt-4">
                <div className="text-center space-y-2">
                  <p className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">
                    🎤 Speak Your Response
                  </p>
                  <div className="flex justify-center">
                    <KidsVoiceRecorder
                      targetWord="response"
                      onCorrectPronunciation={handleVoiceInput}
                      maxDuration={30}
                      autoAnalyze={false}
                      skipPronunciationCheck={true}
                      disabled={isLoading || gameCompleted}
                    />
                  </div>
                </div>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KidsGamePage;

