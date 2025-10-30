import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import EnhancedTTS from '@/services/EnhancedTTS';
import { WhisperService } from '@/services/WhisperService';
import KidsVoiceRecorder from './KidsVoiceRecorder';
import StoryWordsService, { type StoryWord } from '@/services/StoryWordsService';
import { useAuth } from '@/contexts/AuthContext';
import KidsApi from '@/services/KidsApi';
import KidsProgressService from '@/services/KidsProgressService';

type GameType = 'tongue-twister' | 'word-chain' | 'story-telling' | 'pronunciation-challenge' | 'conversation-practice' | 'menu';

const InteractiveGames = () => {
  const [currentGame, setCurrentGame] = useState<GameType>('menu');
  const [gameScore, setGameScore] = useState(0);
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id ? String(user.id) : 'local-user';
  const [enrolledStories, setEnrolledStories] = useState<string[]>([]);
  const [storyWords, setStoryWords] = useState<StoryWord[]>([]);

  // Load enrolled stories and words when component mounts
  useEffect(() => {
    const loadStoryData = () => {
      const enrollments = StoryWordsService.getEnrolledStories(userId);
      const completedStoryIds = enrollments
        .filter(e => e.completed && e.wordsExtracted)
        .map(e => e.storyId);
      
      setEnrolledStories(completedStoryIds);
      
      // Load words for all games
      const allWords = StoryWordsService.getWordsFromEnrolledStories(userId);
      setStoryWords(allWords);
    };

    loadStoryData();
  }, [userId]);

  // Handle score updates with backend sync
  const handleScoreUpdate = async (points: number, _gameType: string) => {
    setGameScore(prev => prev + points);
    
    if (!isAuthenticated) return;
    
    try {
      const token = localStorage.getItem('speakbee_auth_token');
      if (token && token !== 'local-token') {
        // Update via API
        const current = await KidsApi.getProgress(token);
        const currentPoints = (current as any).points || 0;
        const details = { ...((current as any).details || {}) };
        details.games = details.games || {};
        details.games.points = Number(details.games.points || 0) + points;
        const arr = Array.isArray(details.games.types) ? details.games.types : [];
        if (_gameType && !arr.includes(_gameType)) arr.push(_gameType);
        details.games.types = arr;
        await KidsApi.updateProgress(token, {
          points: currentPoints + points,
          details
        });
      } else {
        // Update locally
        await KidsProgressService.update(userId, (progress) => {
          const anyP: any = progress as any;
          const details = { ...(anyP.details || {}) };
          details.games = details.games || {};
          details.games.points = Number(details.games.points || 0) + points;
          const arr = Array.isArray(details.games.types) ? details.games.types : [];
          if (_gameType && !arr.includes(_gameType)) arr.push(_gameType);
          details.games.types = arr;
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

  return (
    <div className="space-y-6">
      {currentGame === 'menu' && (
        <GameMenu 
          onSelectGame={setCurrentGame} 
          totalScore={gameScore} 
          enrolledStories={enrolledStories}
          storyWords={storyWords}
        />
      )}
      {currentGame === 'tongue-twister' && (
        <TongueTwisterGame 
          onBack={() => setCurrentGame('menu')} 
          onScoreUpdate={(points) => handleScoreUpdate(points, 'tongue-twister')}
        />
      )}
      {currentGame === 'word-chain' && (
        <WordChainGame 
          onBack={() => setCurrentGame('menu')} 
          onScoreUpdate={(points) => handleScoreUpdate(points, 'word-chain')}
        />
      )}
      {currentGame === 'story-telling' && (
        <StoryTellingGame 
          onBack={() => setCurrentGame('menu')} 
          onScoreUpdate={(points) => handleScoreUpdate(points, 'story-telling')}
        />
      )}
      {currentGame === 'pronunciation-challenge' && (
        <PronunciationChallenge 
          onBack={() => setCurrentGame('menu')} 
          onScoreUpdate={(points) => handleScoreUpdate(points, 'pronunciation-challenge')}
        />
      )}
      {currentGame === 'conversation-practice' && (
        <ConversationPractice 
          onBack={() => setCurrentGame('menu')} 
          onScoreUpdate={(points) => handleScoreUpdate(points, 'conversation-practice')}
        />
      )}
    </div>
  );
};

// Game Menu
const GameMenu = ({ 
  onSelectGame, 
  totalScore, 
  enrolledStories, 
  storyWords 
}: { 
  onSelectGame: (game: GameType) => void; 
  totalScore: number;
  enrolledStories: string[];
  storyWords: StoryWord[];
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
      description: 'Create and tell your own stories!',
      emoji: '📖',
      color: 'from-green-400 to-emerald-400'
    },
    {
      id: 'pronunciation-challenge' as GameType,
      title: 'Pronunciation Master',
      description: 'Perfect your pronunciation with fun challenges!',
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
      {/* Story Enrollment Status */}
      <Card className="border-2 border-blue-300/50 bg-blue-50/40 dark:bg-blue-900/10 backdrop-blur-sm shadow-lg">
        <CardContent className="py-4 sm:py-6 text-center px-3 sm:px-4">
          <div className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-300 mb-2">
            {enrolledStories.length} Story{enrolledStories.length !== 1 ? 's' : ''} Completed
          </div>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200 font-semibold mb-2">
            {storyWords.length} words available for games
          </p>
          {enrolledStories.length === 0 && (
            <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 font-medium">
              Complete stories to unlock more words for games!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Score Display */}
      <Card className="border-2 border-yellow-300/50 bg-yellow-50/40 dark:bg-yellow-900/10 backdrop-blur-sm shadow-lg">
        <CardContent className="py-4 sm:py-6 text-center px-3 sm:px-4">
          <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-2 sm:mb-3" />
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-yellow-700 dark:text-yellow-300 mb-2">{totalScore}</div>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200 font-semibold">Current Session Points</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Points sync to your total score!</p>
        </CardContent>
      </Card>

      {/* Game Selection */}
      <div className="text-center mb-4 sm:mb-6 px-3 sm:px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#118AB2] bg-clip-text text-transparent mb-2 drop-shadow-sm">
          Choose Your Game!
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 font-medium">
          Pick a fun game to practice English! 🎮
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
                cardBorders[index]
              )}
              onClick={() => onSelectGame(game.id)}
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
                <Button className="w-full rounded-lg sm:rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] hover:from-[#4ECDC4] hover:to-[#FF6B6B] text-sm sm:text-base font-bold transition-all hover:scale-105">
                  Play Now!
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// Tongue Twister Game - Improves pronunciation and articulation
const TongueTwisterGame = ({ 
  onBack, 
  onScoreUpdate
}: { 
  onBack: () => void; 
  onScoreUpdate: (points: number) => void;
}) => {
  const [currentTwister, setCurrentTwister] = useState(0);
  const [result, setResult] = useState<{ correct: boolean; message: string } | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [spokenText, setSpokenText] = useState('');

  const tongueTwisters = [
    {
      text: "She sells seashells by the seashore",
      difficulty: "Easy",
      emoji: "🐚",
      hint: "Focus on 's' sounds"
    },
    {
      text: "Peter Piper picked a peck of pickled peppers",
      difficulty: "Medium", 
      emoji: "🌶️",
      hint: "Focus on 'p' sounds"
    },
    {
      text: "How much wood would a woodchuck chuck",
      difficulty: "Hard",
      emoji: "🪵",
      hint: "Focus on 'w' sounds"
    },
    {
      text: "Red leather, yellow leather",
      difficulty: "Easy",
      emoji: "👞",
      hint: "Focus on 'l' and 'th' sounds"
    },
    {
      text: "Unique New York, New York's unique",
      difficulty: "Medium",
      emoji: "🗽",
      hint: "Focus on 'u' and 'n' sounds"
    }
  ];

  const current = tongueTwisters[currentTwister];

  const handleCorrectPronunciation = async (blob: Blob, _score: number) => {
    setAttempts(prev => prev + 1);
    
    try {
      // Get the actual transcribed text
      const result = await WhisperService.transcribe(blob);
      const transcribedText = result.transcript.toLowerCase().trim();
      setSpokenText(transcribedText);
      
      // Calculate similarity with the tongue twister
      const similarity = calculateSimilarity(transcribedText, current.text.toLowerCase());
      const isGoodAttempt = similarity >= 40; // More lenient for tongue twisters
      
      setResult({
        correct: isGoodAttempt,
        message: isGoodAttempt 
          ? `🎉 Excellent! You said it ${similarity.toFixed(0)}% correctly!` 
          : `🤔 Good try! You said it ${similarity.toFixed(0)}% correctly. Keep practicing!`
      });

      await EnhancedTTS.speak(
        isGoodAttempt ? 'Great job!' : 'Keep practicing!',
        { rate: 1.0, emotion: isGoodAttempt ? 'happy' : 'neutral' }
      );

      if (isGoodAttempt) {
        onScoreUpdate(15);
        setTimeout(() => {
          setCurrentTwister((prev) => (prev + 1) % tongueTwisters.length);
          setResult(null);
          setAttempts(0);
          setSpokenText('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      setResult({
        correct: false,
        message: 'Sorry, please try again!'
      });
    }
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    const matches = words1.filter(word => words2.includes(word)).length;
    return (matches / Math.max(words1.length, words2.length)) * 100;
  };


  const speakTwister = async () => {
    await EnhancedTTS.speak(current.text, { rate: 0.7 });
  };

  return (
    <Card className="border-2 border-red-300 dark:border-red-600 bg-red-50/50 dark:bg-red-900/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
          <span className="flex items-center gap-3">
            👅 Tongue Twisters
          </span>
          <Button variant="outline" size="sm" onClick={onBack} className="rounded-xl border-2 border-red-300 dark:border-red-600 bg-red-100/50 dark:bg-red-900/20 hover:bg-red-200/60 dark:hover:bg-red-900/30 text-gray-900 dark:text-white font-semibold">
            Back to Menu
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Twister */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-4xl">{current.emoji}</span>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              {current.difficulty} Level
            </span>
          </div>
          
          <div className="text-2xl sm:text-3xl font-bold text-red-600 bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 leading-relaxed">
            "{current.text}"
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            💡 {current.hint}
          </p>
          
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={speakTwister}
              className="rounded-xl"
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Hear It
            </Button>
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              Attempts: {attempts}
            </span>
          </div>
        </div>

        {/* Spoken Text Display */}
        {spokenText && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
            <h3 className="text-lg font-bold text-center mb-3">You said:</h3>
            <p className="text-center text-xl font-semibold text-gray-700 dark:text-gray-300 italic">
              "{spokenText}"
            </p>
          </div>
        )}

        {/* Recording */}
        {!result && (
          <div className="text-center space-y-4">
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Now you try! Speak the tongue twister:
            </p>
            <KidsVoiceRecorder
              targetWord="tongue twister"
              onCorrectPronunciation={handleCorrectPronunciation}
              maxDuration={15}
              autoAnalyze={true}
            />
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={cn(
            "text-center p-6 rounded-2xl border-2",
            result.correct ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"
          )}>
            <div className="text-4xl mb-2">{result.correct ? '🎉' : '🤔'}</div>
            <p className="text-lg font-semibold">{result.message}</p>
            {!result.correct && (
              <Button 
                onClick={() => {
                  setResult(null);
                  setSpokenText('');
                }}
                className="mt-3 bg-red-500 hover:bg-red-600 text-white"
              >
                Try Again
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Word Chain Game - Improves vocabulary and speaking fluency
const WordChainGame = ({ 
  onBack, 
  onScoreUpdate
}: { 
  onBack: () => void; 
  onScoreUpdate: (points: number) => void;
}) => {
  const [currentWord, setCurrentWord] = useState('');
  const [chain, setChain] = useState<string[]>([]);
  const [result, setResult] = useState<{ correct: boolean; message: string } | null>(null);
  const [score, setScore] = useState(0);
  const [spokenWord, setSpokenWord] = useState('');

  const startWords = [
    'cat', 'dog', 'sun', 'moon', 'tree', 'house', 'car', 'book', 'ball', 'fish',
    'bird', 'star', 'rain', 'snow', 'fire', 'water', 'earth', 'wind', 'light', 'dark'
  ];

  const getNextWord = (lastWord: string): string => {
    const lastLetter = lastWord.toLowerCase().slice(-1);
    const availableWords = startWords.filter(word => 
      word.toLowerCase().startsWith(lastLetter) && 
      !chain.includes(word)
    );
    
    if (availableWords.length === 0) {
      return startWords[Math.floor(Math.random() * startWords.length)];
    }
    
    return availableWords[Math.floor(Math.random() * availableWords.length)];
  };

  const startNewChain = () => {
    const firstWord = startWords[Math.floor(Math.random() * startWords.length)];
    setCurrentWord(firstWord);
    setChain([firstWord]);
    setScore(0);
    setResult(null);
    setSpokenWord('');
  };

  const handleCorrectPronunciation = async (blob: Blob, _score: number) => {
    try {
      const result = await WhisperService.transcribe(blob);
      const transcribedWord = result.transcript.toLowerCase().trim();
      setSpokenWord(transcribedWord);
      
      // Check if word starts with last letter of current word
      const lastLetter = currentWord.toLowerCase().slice(-1);
      const isCorrect = transcribedWord.startsWith(lastLetter) && 
                       transcribedWord.length > 1 && 
                       !chain.includes(transcribedWord);
      
      if (isCorrect) {
        const newChain = [...chain, transcribedWord];
        setChain(newChain);
        setCurrentWord(transcribedWord);
        setScore(prev => prev + 10);
        
        setResult({
          correct: true,
          message: `🎉 Great! "${transcribedWord}" starts with "${lastLetter}"! Chain: ${newChain.length} words`
        });

        await EnhancedTTS.speak(
          `Excellent! ${transcribedWord} starts with ${lastLetter}`,
          { rate: 1.0, emotion: 'happy' }
        );

        onScoreUpdate(10);
        
        // Get next word
        setTimeout(() => {
          const nextWord = getNextWord(transcribedWord);
          setCurrentWord(nextWord);
          setResult(null);
          setSpokenWord('');
        }, 2000);
      } else {
        setResult({
          correct: false,
          message: `🤔 "${transcribedWord}" doesn't start with "${lastLetter}". Try again!`
        });

        await EnhancedTTS.speak(
          'Try again! Think of a word that starts with the last letter.',
          { rate: 0.9, emotion: 'neutral' }
        );
      }
    } catch (error) {
      console.error('Error:', error);
      setResult({
        correct: false,
        message: 'Sorry, please try again!'
      });
    }
  };

  const speakCurrentWord = async () => {
    await EnhancedTTS.speak(`The current word is ${currentWord}. Think of a word that starts with ${currentWord.slice(-1)}`, { rate: 0.8 });
  };

  return (
    <Card className="border-2 border-blue-300 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-900/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
          <span className="flex items-center gap-3">
            🔗 Word Chain
          </span>
          <Button variant="outline" size="sm" onClick={onBack} className="rounded-xl border-2 border-blue-300 dark:border-blue-600 bg-blue-100/50 dark:bg-blue-900/20 hover:bg-blue-200/60 dark:hover:bg-blue-900/30 text-gray-900 dark:text-white font-semibold">
            Back to Menu
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Game Info */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">Score</div>
              <div className="text-3xl font-bold">{score}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">Chain</div>
              <div className="text-3xl font-bold">{chain.length}</div>
            </div>
          </div>
          
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Say a word that starts with the last letter of the current word!
          </p>
          </div>

        {/* Current Word */}
        <div className="text-center space-y-4">
          <div className="text-4xl font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6">
            {currentWord.toUpperCase()}
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Think of a word that starts with <span className="font-bold text-blue-600">{currentWord.slice(-1).toUpperCase()}</span>
          </p>
          
          <Button
            variant="outline"
            onClick={speakCurrentWord}
            className="rounded-xl"
          >
            <Volume2 className="w-4 h-4 mr-2" />
            Hear Instructions
          </Button>
        </div>

        {/* Spoken Word Display */}
        {spokenWord && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
            <h3 className="text-lg font-bold text-center mb-3">You said:</h3>
            <p className="text-center text-xl font-semibold text-gray-700 dark:text-gray-300 italic">
              "{spokenWord}"
            </p>
          </div>
        )}

        {/* Word Chain Display */}
        {chain.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
            <h3 className="text-lg font-bold text-center mb-3">Your Word Chain:</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {chain.map((word, index) => (
                <span 
                  key={index}
                  className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-semibold"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recording */}
        {!result && (
          <div className="text-center space-y-4">
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Speak your word now:
            </p>
            <KidsVoiceRecorder
              targetWord="word"
              onCorrectPronunciation={handleCorrectPronunciation}
              maxDuration={10}
              autoAnalyze={true}
            />
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={cn(
            "text-center p-6 rounded-2xl border-2",
            result.correct ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"
          )}>
            <div className="text-4xl mb-2">{result.correct ? '🎉' : '🤔'}</div>
            <p className="text-lg font-semibold">{result.message}</p>
            {!result.correct && (
              <Button 
                onClick={() => setResult(null)}
                className="mt-3 bg-blue-500 hover:bg-blue-600 text-white"
              >
                Try Again
              </Button>
            )}
          </div>
        )}

        {/* Start Button */}
        {chain.length === 0 && (
          <div className="text-center">
            <Button 
              onClick={startNewChain}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg"
            >
              Start New Chain
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Story Telling Game - Improves narrative speaking and creativity
const StoryTellingGame = ({ 
  onBack, 
  onScoreUpdate
}: { 
  onBack: () => void; 
  onScoreUpdate: (points: number) => void;
}) => {
  const [currentPrompt, setCurrentPrompt] = useState<any>(null);
  const [result, setResult] = useState<{ correct: boolean; message: string } | null>(null);
  const [story, setStory] = useState('');

  const storyPrompts = [
    {
      title: "My Pet Adventure",
      prompt: "Tell me about your pet or an animal you'd like to have. What does it look like? What does it like to do?",
      emoji: "🐕",
      keywords: ["pet", "animal", "looks", "likes", "does"]
    },
    {
      title: "Magic Day",
      prompt: "If you had one magic power for a day, what would it be? What would you do with it?",
      emoji: "✨",
      keywords: ["magic", "power", "day", "would", "do"]
    },
    {
      title: "Space Journey",
      prompt: "Imagine you're going to space! What planet would you visit first? What would you see there?",
      emoji: "🚀",
      keywords: ["space", "planet", "visit", "see", "there"]
    },
    {
      title: "Best Friend",
      prompt: "Tell me about your best friend. What makes them special? What do you like to do together?",
      emoji: "👫",
      keywords: ["friend", "special", "together", "like", "do"]
    },
    {
      title: "Dream House",
      prompt: "Describe your dream house. What rooms would it have? What would be in your bedroom?",
      emoji: "🏠",
      keywords: ["house", "rooms", "bedroom", "would", "have"]
    }
  ];

  const getRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * storyPrompts.length);
    setCurrentPrompt(storyPrompts[randomIndex]);
    setStory('');
    setResult(null);
  };

  const handleCorrectPronunciation = async (blob: Blob, _score: number) => {
    try {
      const result = await WhisperService.transcribe(blob);
      const transcript = result.transcript.toLowerCase().trim();
      setStory(transcript);
      
      // Check if story contains key elements
      const keywordMatches = currentPrompt.keywords.filter((keyword: string) => 
        transcript.includes(keyword)
      ).length;
      
      const storyLength = transcript.split(' ').length;
      const isGoodStory = keywordMatches >= 2 && storyLength >= 10;
      
      setResult({
        correct: isGoodStory,
        message: isGoodStory 
          ? `🎉 Wonderful story! You used ${keywordMatches} key words and told a ${storyLength}-word story!` 
          : `🤔 Good start! Try to include more details and use words like: ${currentPrompt.keywords.slice(0, 3).join(', ')}`
      });

      await EnhancedTTS.speak(
        isGoodStory ? 'What a great story!' : 'Try adding more details!',
        { rate: 1.0, emotion: isGoodStory ? 'happy' : 'neutral' }
      );

      if (isGoodStory) {
        onScoreUpdate(20);
      }
    } catch (error) {
      console.error('Error:', error);
      setResult({
        correct: false,
        message: 'Sorry, please try again!'
      });
    }
  };

  const speakPrompt = async () => {
    await EnhancedTTS.speak(currentPrompt.prompt, { rate: 0.8 });
  };

  return (
    <Card className="border-2 border-green-300 dark:border-green-600 bg-green-50/50 dark:bg-green-900/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
          <span className="flex items-center gap-3">
            📖 Story Telling
          </span>
          <Button variant="outline" size="sm" onClick={onBack} className="rounded-xl border-2 border-green-300 dark:border-green-600 bg-green-100/50 dark:bg-green-900/20 hover:bg-green-200/60 dark:hover:bg-green-900/30 text-gray-900 dark:text-white font-semibold">
            Back to Menu
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Story Prompt */}
        {currentPrompt && (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-4xl">{currentPrompt.emoji}</span>
              <span className="text-lg font-bold text-green-600">{currentPrompt.title}</span>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6">
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                {currentPrompt.prompt}
              </p>
            </div>
            
            <Button
              variant="outline"
              onClick={speakPrompt}
              className="rounded-xl"
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Hear the Prompt
            </Button>
          </div>
        )}

        {/* Story Display */}
        {story && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
            <h3 className="text-lg font-bold text-center mb-3">You said:</h3>
            <p className="text-center text-xl font-semibold text-gray-700 dark:text-gray-300 italic">
              "{story}"
            </p>
          </div>
        )}

        {/* Recording */}
        {!result && (
          <div className="text-center space-y-4">
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Now tell your story! Speak for at least 10 seconds:
            </p>
            <KidsVoiceRecorder
              targetWord="story"
              onCorrectPronunciation={handleCorrectPronunciation}
              maxDuration={60}
              autoAnalyze={true}
            />
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={cn(
            "text-center p-6 rounded-2xl border-2",
            result.correct ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"
          )}>
            <div className="text-4xl mb-2">{result.correct ? '🎉' : '🤔'}</div>
            <p className="text-lg font-semibold">{result.message}</p>
            <div className="flex gap-3 justify-center mt-4">
              <Button 
                onClick={() => {
                  setResult(null);
                  setStory('');
                }}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Try Again
              </Button>
              <Button 
                onClick={getRandomPrompt}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                New Story
              </Button>
            </div>
          </div>
        )}

        {/* Start Button */}
        {!currentPrompt && (
          <div className="text-center">
            <Button 
              onClick={getRandomPrompt}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg"
            >
              Start Story Telling
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Pronunciation Challenge Game - Focuses on specific sounds
const PronunciationChallenge = ({ 
  onBack, 
  onScoreUpdate
}: { 
  onBack: () => void; 
  onScoreUpdate: (points: number) => void;
}) => {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [result, setResult] = useState<{ correct: boolean; message: string } | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [spokenText, setSpokenText] = useState('');

  const pronunciationChallenges = [
    {
      sound: "TH",
      words: ["think", "thought", "three", "through", "thick"],
      emoji: "👅",
      instruction: "Put your tongue between your teeth and blow air out",
      difficulty: "Hard"
    },
    {
      sound: "R",
      words: ["red", "rabbit", "rain", "run", "right"],
      emoji: "🔴",
      instruction: "Curl your tongue back and vibrate",
      difficulty: "Medium"
    },
    {
      sound: "L",
      words: ["love", "light", "long", "little", "laugh"],
      emoji: "💡",
      instruction: "Touch the tip of your tongue to the roof of your mouth",
      difficulty: "Easy"
    },
    {
      sound: "S",
      words: ["snake", "sun", "sister", "smile", "sweet"],
      emoji: "🐍",
      instruction: "Keep your tongue behind your teeth and hiss like a snake",
      difficulty: "Easy"
    },
    {
      sound: "SH",
      words: ["shoe", "ship", "sheep", "shy", "shout"],
      emoji: "👟",
      instruction: "Make your lips round and blow air out",
      difficulty: "Medium"
    }
  ];

  const current = pronunciationChallenges[currentChallenge];

  const handleCorrectPronunciation = async (blob: Blob, _score: number) => {
    setAttempts(prev => prev + 1);
    
    try {
      const result = await WhisperService.transcribe(blob);
      const transcript = result.transcript.toLowerCase().trim();
      setSpokenText(transcript);
      
      // Check if any of the target words were spoken
      const spokenWords = current.words.filter(word => 
        transcript.includes(word.toLowerCase())
      );
      
      const isCorrect = spokenWords.length >= 2;
      
      setResult({
        correct: isCorrect,
        message: isCorrect 
          ? `🎉 Excellent! You said ${spokenWords.length} words correctly: ${spokenWords.join(', ')}` 
          : `🤔 Good try! You said ${spokenWords.length} words. Practice the ${current.sound} sound more.`
      });
      
      await EnhancedTTS.speak(
        isCorrect ? 'Great pronunciation!' : 'Keep practicing!',
        { rate: 1.0, emotion: isCorrect ? 'happy' : 'neutral' }
      );
      
      if (isCorrect) {
        onScoreUpdate(15);
        setTimeout(() => {
          setCurrentChallenge((prev) => (prev + 1) % pronunciationChallenges.length);
          setResult(null);
          setAttempts(0);
          setSpokenText('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      setResult({
        correct: false,
        message: 'Sorry, please try again!'
      });
    }
  };

  const speakWords = async () => {
    const wordsToSpeak = current.words.slice(0, 3).join(', ');
    await EnhancedTTS.speak(`Listen to these words: ${wordsToSpeak}`, { rate: 0.7 });
  };

  return (
    <Card className="border-2 border-purple-300 dark:border-purple-600 bg-purple-50/50 dark:bg-purple-900/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
          <span className="flex items-center gap-3">
            🎯 Pronunciation Master
          </span>
          <Button variant="outline" size="sm" onClick={onBack} className="rounded-xl border-2 border-purple-300 dark:border-purple-600 bg-purple-100/50 dark:bg-purple-900/20 hover:bg-purple-200/60 dark:hover:bg-purple-900/30 text-gray-900 dark:text-white font-semibold">
            Back to Menu
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Challenge */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-4xl">{current.emoji}</span>
            <span className="text-lg font-bold text-purple-600">{current.sound} Sound</span>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              {current.difficulty}
            </span>
        </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-3">
              Practice these words:
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {current.words.map((word, index) => (
                <span 
                  key={index}
                  className="bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-semibold"
                >
                  {word}
                </span>
              ))}
            </div>
        </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              💡 {current.instruction}
            </p>
        </div>

            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
              onClick={speakWords}
                className="rounded-xl"
              >
                <Volume2 className="w-4 h-4 mr-2" />
              Hear Words
              </Button>
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              Attempts: {attempts}
            </span>
          </div>
            </div>
            
        {/* Spoken Text Display */}
        {spokenText && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
            <h3 className="text-lg font-bold text-center mb-3">You said:</h3>
            <p className="text-center text-xl font-semibold text-gray-700 dark:text-gray-300 italic">
              "{spokenText}"
            </p>
          </div>
        )}

        {/* Recording */}
        {!result && (
          <div className="text-center space-y-4">
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Now say as many of these words as you can:
            </p>
            <KidsVoiceRecorder
              targetWord="pronunciation"
              onCorrectPronunciation={handleCorrectPronunciation}
              maxDuration={15}
              autoAnalyze={true}
            />
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={cn(
            "text-center p-6 rounded-2xl border-2",
            result.correct ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"
          )}>
            <div className="text-4xl mb-2">{result.correct ? '🎉' : '🤔'}</div>
            <p className="text-lg font-semibold">{result.message}</p>
            {!result.correct && (
              <Button 
                onClick={() => {
                  setResult(null);
                  setSpokenText('');
                }}
                className="mt-3 bg-purple-500 hover:bg-purple-600 text-white"
              >
                Try Again
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Conversation Practice Game - Simulates real conversations
const ConversationPractice = ({ 
  onBack, 
  onScoreUpdate
}: { 
  onBack: () => void; 
  onScoreUpdate: (points: number) => void;
}) => {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [result, setResult] = useState<{ correct: boolean; message: string } | null>(null);
  const [conversation, setConversation] = useState<string[]>([]);
  const [spokenText, setSpokenText] = useState('');

  const conversationScenarios = [
    {
      title: "At the Store",
      emoji: "🛒",
      context: "You're at a grocery store and need help finding something",
      aiResponse: "Hello! How can I help you today?",
      expectedKeywords: ["hello", "looking", "find", "help", "thank"]
    },
    {
      title: "Making Friends",
      emoji: "👋",
      context: "You're meeting a new classmate at school",
      aiResponse: "Hi there! I'm new here. What's your name?",
      expectedKeywords: ["hi", "hello", "name", "nice", "meet"]
    },
    {
      title: "Ordering Food",
      emoji: "🍕",
      context: "You're at a restaurant and want to order",
      aiResponse: "Welcome! What would you like to order today?",
      expectedKeywords: ["would", "like", "order", "please", "thank"]
    },
    {
      title: "Asking for Help",
      emoji: "❓",
      context: "You're lost and need directions",
      aiResponse: "Excuse me, can you help me? I'm looking for the library.",
      expectedKeywords: ["excuse", "help", "looking", "where", "directions"]
    },
    {
      title: "Sharing News",
      emoji: "📰",
      context: "You want to tell someone about something exciting that happened",
      aiResponse: "Guess what happened to me today!",
      expectedKeywords: ["guess", "what", "happened", "today", "exciting"]
    }
  ];

  const current = conversationScenarios[currentScenario];

  const handleCorrectPronunciation = async (blob: Blob, _score: number) => {
    try {
      const result = await WhisperService.transcribe(blob);
      const transcript = result.transcript.toLowerCase().trim();
      setSpokenText(transcript);
      setConversation(prev => [...prev, transcript]);
      
      // Check if response contains expected keywords
      const keywordMatches = current.expectedKeywords.filter((keyword: string) => 
        transcript.includes(keyword)
      ).length;
      
      const responseLength = transcript.split(' ').length;
      const isGoodResponse = keywordMatches >= 2 && responseLength >= 3;
      
      setResult({
        correct: isGoodResponse,
        message: isGoodResponse 
          ? `🎉 Great response! You used ${keywordMatches} key words and gave a ${responseLength}-word answer!` 
          : `🤔 Good try! Try to use words like: ${current.expectedKeywords.slice(0, 3).join(', ')}`
      });
      
      await EnhancedTTS.speak(
        isGoodResponse ? 'That was a great response!' : 'Try to be more conversational!',
        { rate: 1.0, emotion: isGoodResponse ? 'happy' : 'neutral' }
      );

      if (isGoodResponse) {
        onScoreUpdate(25);
      }
    } catch (error) {
      console.error('Error:', error);
      setResult({
        correct: false,
        message: 'Sorry, please try again!'
      });
    }
  };

  const speakContext = async () => {
    await EnhancedTTS.speak(`${current.context}. The person says: "${current.aiResponse}"`, { rate: 0.8 });
  };

  const startNewConversation = () => {
    const randomIndex = Math.floor(Math.random() * conversationScenarios.length);
    setCurrentScenario(randomIndex);
    setConversation([]);
    setResult(null);
    setSpokenText('');
  };

  return (
    <Card className="border-2 border-orange-300 dark:border-orange-600 bg-orange-50/50 dark:bg-orange-900/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
          <span className="flex items-center gap-3">
            💬 Chat Practice
          </span>
          <Button variant="outline" size="sm" onClick={onBack} className="rounded-xl border-2 border-orange-300 dark:border-orange-600 bg-orange-100/50 dark:bg-orange-900/20 hover:bg-orange-200/60 dark:hover:bg-orange-900/30 text-gray-900 dark:text-white font-semibold">
            Back to Menu
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scenario */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-4xl">{current.emoji}</span>
            <span className="text-lg font-bold text-orange-600">{current.title}</span>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-6">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              {current.context}
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-orange-400">
              <p className="text-gray-600 dark:text-gray-400 italic">
                "{current.aiResponse}"
              </p>
            </div>
        </div>

          <Button
            variant="outline"
            onClick={speakContext}
            className="rounded-xl"
          >
            <Volume2 className="w-4 h-4 mr-2" />
            Hear the Situation
          </Button>
        </div>

        {/* Spoken Text Display */}
        {spokenText && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
            <h3 className="text-lg font-bold text-center mb-3">You said:</h3>
            <p className="text-center text-xl font-semibold text-gray-700 dark:text-gray-300 italic">
              "{spokenText}"
            </p>
          </div>
        )}

        {/* Conversation History */}
        {conversation.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
            <h3 className="text-lg font-bold text-center mb-3">Your Conversation:</h3>
            <div className="space-y-2">
              {conversation.map((response, index) => (
                <div key={index} className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-3">
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">You:</span> "{response}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recording */}
        {!result && (
          <div className="text-center space-y-4">
            <p className="text-lg text-gray-600 dark:text-gray-300">
              How would you respond? Speak naturally:
            </p>
            <KidsVoiceRecorder
              targetWord="response"
              onCorrectPronunciation={handleCorrectPronunciation}
              maxDuration={20}
              autoAnalyze={true}
            />
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={cn(
            "text-center p-6 rounded-2xl border-2",
            result.correct ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"
          )}>
            <div className="text-4xl mb-2">{result.correct ? '🎉' : '🤔'}</div>
            <p className="text-lg font-semibold">{result.message}</p>
            <div className="flex gap-3 justify-center mt-4">
              <Button 
                onClick={() => {
                  setResult(null);
                  setSpokenText('');
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Continue
              </Button>
              <Button 
                onClick={startNewConversation}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                New Scenario
              </Button>
            </div>
          </div>
        )}

        {/* Start Button */}
        {conversation.length === 0 && (
          <div className="text-center">
            <Button 
              onClick={startNewConversation}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg"
            >
              Start Conversation
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InteractiveGames;

