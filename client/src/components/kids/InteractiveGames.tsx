import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Volume2, RefreshCw, Loader2, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import EnhancedTTS from '@/services/EnhancedTTS';
import { WhisperService } from '@/services/WhisperService';
import VoiceRecorder from './VoiceRecorder';
import HybridServiceManager from '@/services/HybridServiceManager';
import StoryWordsService, { type StoryWord } from '@/services/StoryWordsService';
import { useAuth } from '@/contexts/AuthContext';

type GameType = 'rhyme' | 'sentence' | 'echo' | 'menu';

const InteractiveGames = () => {
  const [currentGame, setCurrentGame] = useState<GameType>('menu');
  const [score, setScore] = useState(0);
  const { user } = useAuth();
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

  return (
    <div className="space-y-6">
      {currentGame === 'menu' && (
        <GameMenu 
          onSelectGame={setCurrentGame} 
          totalScore={score} 
          enrolledStories={enrolledStories}
          storyWords={storyWords}
        />
      )}
      {currentGame === 'rhyme' && (
        <RhymeTime 
          onBack={() => setCurrentGame('menu')} 
          onScoreUpdate={(points) => setScore(prev => prev + points)}
          storyWords={storyWords}
        />
      )}
      {currentGame === 'sentence' && (
        <SentenceBuilder 
          onBack={() => setCurrentGame('menu')} 
          onScoreUpdate={(points) => setScore(prev => prev + points)}
          storyWords={storyWords}
        />
      )}
      {currentGame === 'echo' && (
        <EchoChallenge 
          onBack={() => setCurrentGame('menu')} 
          onScoreUpdate={(points) => setScore(prev => prev + points)}
          storyWords={storyWords}
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
      id: 'rhyme' as GameType,
      title: 'Rhyme Time',
      description: 'Find words that rhyme and say them out loud!',
      emoji: '🎵',
      color: 'from-pink-400 to-rose-400'
    },
    {
      id: 'sentence' as GameType,
      title: 'Sentence Builder',
      description: 'Build sentences and speak them correctly!',
      emoji: '🧩',
      color: 'from-blue-400 to-cyan-400'
    },
    {
      id: 'echo' as GameType,
      title: 'Echo Challenge',
      description: 'Repeat sentences faster and faster!',
      emoji: '⚡',
      color: 'from-purple-400 to-indigo-400'
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto">
      {/* Story Enrollment Status */}
      <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="py-4 sm:py-6 text-center px-3 sm:px-4">
          <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500 mx-auto mb-2 sm:mb-3" />
          <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-500 mb-2">
            {enrolledStories.length} Story{enrolledStories.length !== 1 ? 's' : ''} Completed
          </div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-semibold mb-2">
            {storyWords.length} words available for games
          </p>
          {enrolledStories.length === 0 && (
            <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 font-medium">
              Complete stories to unlock more words for games! 📚
            </p>
          )}
        </CardContent>
      </Card>

      {/* Score Display */}
      <Card className="border-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
        <CardContent className="py-4 sm:py-6 text-center px-3 sm:px-4">
          <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-500 mx-auto mb-2 sm:mb-3" />
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-yellow-600 dark:text-yellow-500 mb-2">{totalScore}</div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-semibold">Total Game Points</p>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        {games.map((game, index) => {
          const cardBgColors = [
            'bg-pink-50/60 dark:bg-pink-900/10',
            'bg-blue-50/60 dark:bg-blue-900/10',
            'bg-purple-50/60 dark:bg-purple-900/10'
          ];
          const cardBorders = [
            'border-pink-200 dark:border-pink-600',
            'border-blue-200 dark:border-blue-600',
            'border-purple-200 dark:border-purple-600'
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

// Rhyme Time Game
const RhymeTime = ({ 
  onBack, 
  onScoreUpdate, 
  storyWords 
}: { 
  onBack: () => void; 
  onScoreUpdate: (points: number) => void;
  storyWords: StoryWord[];
}) => {
  const [currentPair, setCurrentPair] = useState(0);
  const [result, setResult] = useState<{ correct: boolean; message: string } | null>(null);

  // Generate rhyme pairs from story words
  const generateRhymePairs = (words: StoryWord[]) => {
    if (words.length === 0) {
      // Fallback to default words
      return [
        { word: 'cat', emoji: '🐱', hint: '🐱 Say: KAT', rhymes: ['hat', 'bat', 'mat', 'sat'], incorrect: ['dog', 'sun', 'car'] },
        { word: 'tree', emoji: '🌳', hint: '🌳 Say: TREE', rhymes: ['bee', 'sea', 'key', 'free'], incorrect: ['bird', 'house', 'ball'] },
        { word: 'sun', emoji: '☀️', hint: '☀️ Say: SUN', rhymes: ['run', 'fun', 'one', 'bun'], incorrect: ['moon', 'star', 'sky'] },
        { word: 'night', emoji: '🌙', hint: '🌙 Say: NITE', rhymes: ['light', 'right', 'bright', 'sight'], incorrect: ['dark', 'day', 'time'] }
      ];
    }

    // Use story words for rhyming (simplified rhyming logic)
    const rhymePairs = words.slice(0, 8).map((storyWord) => {
      const word = storyWord.word.toLowerCase();
      const rhymes = generateRhymes(word);
      const incorrect = generateIncorrectOptions(word);
      
      return {
        word: storyWord.word,
        emoji: storyWord.emoji,
        hint: storyWord.hint,
        rhymes: rhymes.slice(0, 3),
        incorrect: incorrect.slice(0, 1)
      };
    });

    return rhymePairs;
  };

  const generateRhymes = (word: string): string[] => {
    // Simple rhyming logic - in a real app, you'd use a proper rhyming dictionary
    const rhymes: Record<string, string[]> = {
      'cat': ['hat', 'bat', 'mat', 'sat', 'rat'],
      'dog': ['log', 'fog', 'bog', 'jog'],
      'sun': ['run', 'fun', 'bun', 'gun'],
      'tree': ['bee', 'see', 'free', 'key'],
      'fish': ['wish', 'dish', 'swish'],
      'bird': ['word', 'heard', 'herd'],
      'star': ['car', 'far', 'bar'],
      'moon': ['soon', 'tune', 'spoon'],
      'rabbit': ['habit', 'cabinet'],
      'forest': ['chorus', 'focus'],
      'magic': ['tragic', 'logic'],
      'planet': ['banquet', 'blanket'],
      'dinosaur': ['more', 'door', 'floor'],
      'unicorn': ['corn', 'born', 'thorn'],
      'pirate': ['pirate', 'irate'],
      'treasure': ['pleasure', 'measure'],
      'superhero': ['zero', 'hero'],
      'fairy': ['hairy', 'scary'],
      'sparkle': ['darkle', 'markle']
    };
    
    return rhymes[word] || ['hat', 'bat', 'mat'];
  };

  const generateIncorrectOptions = (word: string): string[] => {
    const incorrect: Record<string, string[]> = {
      'cat': ['dog', 'sun', 'car'],
      'dog': ['cat', 'bird', 'fish'],
      'sun': ['moon', 'star', 'sky'],
      'tree': ['bird', 'house', 'ball'],
      'fish': ['bird', 'cat', 'dog'],
      'bird': ['fish', 'cat', 'dog'],
      'star': ['moon', 'sun', 'sky'],
      'moon': ['sun', 'star', 'sky'],
      'rabbit': ['fish', 'bird', 'cat'],
      'forest': ['ocean', 'desert', 'mountain'],
      'magic': ['normal', 'real', 'ordinary'],
      'planet': ['star', 'moon', 'sky'],
      'dinosaur': ['bird', 'fish', 'cat'],
      'unicorn': ['horse', 'donkey', 'zebra'],
      'pirate': ['sailor', 'captain', 'soldier'],
      'treasure': ['trash', 'garbage', 'waste'],
      'superhero': ['villain', 'enemy', 'bad guy'],
      'fairy': ['witch', 'wizard', 'monster'],
      'sparkle': ['dull', 'dark', 'dim']
    };
    
    return incorrect[word] || ['dog', 'sun', 'car'];
  };

  const rhymePairs = generateRhymePairs(storyWords);

  const current = rhymePairs[currentPair];
  const allOptions = [...current.rhymes.slice(0, 3), ...current.incorrect.slice(0, 1)].sort(() => Math.random() - 0.5);

  const handleWordClick = async (word: string) => {
    const isCorrect = current.rhymes.includes(word);
    
    setResult({
      correct: isCorrect,
      message: isCorrect 
        ? `Perfect! "${word}" rhymes with "${current.word}"!` 
        : `Not quite! "${word}" doesn't rhyme with "${current.word}". Try again!`
    });

    await EnhancedTTS.speak(
      isCorrect ? 'Correct!' : 'Try again!',
      { rate: 1.0, emotion: isCorrect ? 'happy' : 'neutral' }
    );

    if (isCorrect) {
      onScoreUpdate(10);
      setTimeout(() => {
        setCurrentPair((prev) => (prev + 1) % rhymePairs.length);
        setResult(null);
      }, 2000);
    }
  };

  const speakWord = async () => {
    await EnhancedTTS.speak(`Find a word that rhymes with ${current.word}`, { rate: 0.9 });
  };

  return (
    <Card className="border-2 border-pink-300 dark:border-pink-600 bg-pink-50/50 dark:bg-pink-900/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
          <span className="flex items-center gap-3">
            🎵 Rhyme Time
          </span>
          <Button variant="outline" size="sm" onClick={onBack} className="rounded-xl border-2 border-pink-300 dark:border-pink-600 bg-pink-100/50 dark:bg-pink-900/20 hover:bg-pink-200/60 dark:hover:bg-pink-900/30 text-gray-900 dark:text-white font-semibold">
            Back to Menu
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Target Word */}
        <div className="text-center space-y-4">
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Find a word that rhymes with:
          </p>
          <div className="text-6xl font-extrabold text-pink-600 bg-pink-50 dark:bg-pink-900/20 rounded-2xl p-8 flex items-center justify-center gap-3">
            {current.emoji && <span className="text-7xl">{current.emoji}</span>}
            <span>{current.word}</span>
          </div>
          {current.hint && (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              {current.hint}
            </p>
          )}
          <Button
            variant="outline"
            onClick={speakWord}
            className="rounded-xl"
          >
            <Volume2 className="w-4 h-4 mr-2" />
            Hear the Word
          </Button>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4">
          {allOptions.map((word, idx) => (
            <Button
              key={idx}
              size="lg"
              variant="outline"
              onClick={() => handleWordClick(word)}
              disabled={result !== null}
              className={cn(
                "text-2xl font-bold h-24 rounded-2xl border-2",
                result?.correct && current.rhymes.includes(word) && "border-green-500 bg-green-50",
                result && !result.correct && "opacity-50"
              )}
            >
              {word}
            </Button>
          ))}
        </div>

        {/* Result */}
        {result && (
          <div className={cn(
            "text-center p-6 rounded-2xl",
            result.correct ? "bg-green-50 border-2 border-green-200" : "bg-red-50 border-2 border-red-200"
          )}>
            <div className="text-4xl mb-2">{result.correct ? '🎉' : '🤔'}</div>
            <p className="text-lg font-semibold">{result.message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Sentence Builder Game
const SentenceBuilder = ({ 
  onBack, 
  onScoreUpdate, 
  storyWords 
}: { 
  onBack: () => void; 
  onScoreUpdate: (points: number) => void;
  storyWords: StoryWord[];
}) => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Generate sentence levels from story words
  const generateSentenceLevels = (words: StoryWord[]) => {
    if (words.length === 0) {
      // Fallback to default levels
      return [
        {
          correct: ['The', 'cat', 'is', 'happy'],
          words: ['The', 'cat', 'is', 'happy', 'sad', 'dog'],
          image: '😺',
          storyTitle: 'Basic Words',
          category: 'animals'
        },
        {
          correct: ['I', 'like', 'to', 'play'],
          words: ['I', 'like', 'to', 'play', 'swim', 'run'],
          image: '🎮',
          storyTitle: 'Basic Words',
          category: 'actions'
        },
        {
          correct: ['The', 'sun', 'is', 'bright'],
          words: ['The', 'sun', 'is', 'bright', 'dark', 'moon'],
          image: '☀️',
          storyTitle: 'Basic Words',
          category: 'nature'
        }
      ];
    }

    // Create sentence levels using story words
    const levels = [];
    const storyWordsByCategory = words.reduce((acc, word) => {
      if (!acc[word.category]) acc[word.category] = [];
      acc[word.category].push(word);
      return acc;
    }, {} as Record<string, StoryWord[]>);

    // Generate 3 levels using different story themes
    const categories = Object.keys(storyWordsByCategory);
    for (let i = 0; i < Math.min(3, categories.length); i++) {
      const category = categories[i];
      const categoryWords = storyWordsByCategory[category];
      
      if (categoryWords.length >= 4) {
        const selectedWords = categoryWords.slice(0, 4);
        const correct = selectedWords.map(w => w.word);
        const incorrect = categoryWords.slice(4, 6).map(w => w.word);
        
        levels.push({
          correct,
          words: [...correct, ...incorrect],
          image: selectedWords[0].emoji,
          storyTitle: selectedWords[0].storyTitle,
          category: category
        });
      }
    }

    // Fill remaining levels with default if needed
    while (levels.length < 3) {
      levels.push({
        correct: ['The', 'cat', 'is', 'happy'],
        words: ['The', 'cat', 'is', 'happy', 'sad', 'dog'],
        image: '😺',
        storyTitle: 'Basic Words',
        category: 'animals'
      });
    }

    return levels;
  };

  const levels = generateSentenceLevels(storyWords);

  const current = levels[currentLevel];

  const handleWordClick = (word: string) => {
    if (!selectedWords.includes(word)) {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const handleRemoveWord = (index: number) => {
    setSelectedWords(selectedWords.filter((_, i) => i !== index));
  };

  const handleRecordingComplete = async (blob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Transcribe
      const result = await WhisperService.transcribe(blob);
      const transcript = result.transcript.toLowerCase().trim();
      const expected = current.correct.join(' ').toLowerCase();
      
      // Check if correct
      const isCorrect = transcript === expected || 
                       transcript.includes(expected) ||
                       selectedWords.join(' ').toLowerCase() === expected;
      
      setFeedbackMessage(
        isCorrect 
          ? '🎉 Perfect! You built and spoke the sentence correctly!' 
          : '🤔 Try again! Make sure you build the sentence correctly first.'
      );
      setShowFeedback(true);
      
      await EnhancedTTS.speak(
        isCorrect ? 'Excellent work!' : 'Try again!',
        { rate: 1.0, emotion: isCorrect ? 'happy' : 'neutral' }
      );
      
      if (isCorrect) {
        onScoreUpdate(20);
        
        // Save progress
        await HybridServiceManager.recordSession({
          sessionType: 'grammar',
          score: 100,
          duration: 2,
          details: { game: 'sentence-builder', level: currentLevel }
        });
        
        setTimeout(() => {
          setCurrentLevel((prev) => (prev + 1) % levels.length);
          setSelectedWords([]);
          setShowFeedback(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      setFeedbackMessage('Sorry, please try again!');
      setShowFeedback(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const speakSentence = async () => {
    if (selectedWords.length > 0) {
      await EnhancedTTS.speak(selectedWords.join(' '), { rate: 0.9 });
    }
  };

  return (
    <Card className="border-2 border-blue-300 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-900/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
          <span className="flex items-center gap-3">
            🧩 Sentence Builder
          </span>
          <Button variant="outline" size="sm" onClick={onBack} className="rounded-xl border-2 border-blue-300 dark:border-blue-600 bg-blue-100/50 dark:bg-blue-900/20 hover:bg-blue-200/60 dark:hover:bg-blue-900/30 text-gray-900 dark:text-white font-semibold">
            Back to Menu
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Level Indicator */}
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            Level {currentLevel + 1} of {levels.length}
          </p>
          <div className="text-8xl mb-4">{current.image}</div>
          <p className="text-sm text-gray-500 dark:text-gray-200 mb-2">
            Build the sentence by tapping the words below
          </p>
          {current.storyTitle && current.storyTitle !== 'Basic Words' && (
            <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-2 mb-2">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                Words from: {current.storyTitle}
              </p>
              {current.category && (
                <p className="text-xs text-blue-500 dark:text-blue-500">
                  Category: {current.category}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Selected Words (Sentence Area) */}
        <div className="min-h-24 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border-2 border-blue-200">
          {selectedWords.length === 0 ? (
            <p className="text-center text-gray-300 text-lg">Tap words to build your sentence</p>
          ) : (
            <div className="flex flex-wrap gap-2 justify-center">
              {selectedWords.map((word, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  onClick={() => handleRemoveWord(idx)}
                  className="text-2xl font-bold h-16 px-6 rounded-xl bg-white"
                >
                  {word}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Word Bank */}
        <div className="grid grid-cols-3 gap-3">
          {current.words.map((word, idx) => (
            <Button
              key={idx}
              size="lg"
              variant="outline"
              onClick={() => handleWordClick(word)}
              disabled={selectedWords.includes(word)}
              className={cn(
                "text-xl font-semibold h-16 rounded-xl",
                selectedWords.includes(word) && "opacity-30"
              )}
            >
              {word}
            </Button>
          ))}
        </div>

        {/* Actions */}
        {selectedWords.length > 0 && !isProcessing && !showFeedback && (
          <div className="space-y-4">
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={speakSentence}
                className="rounded-xl"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Hear It
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedWords([])}
                className="rounded-xl"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
            
            <div className="text-center">
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                Now speak the sentence!
              </p>
              <VoiceRecorder
                onRecordingComplete={handleRecordingComplete}
                maxDuration={10}
                showPlayback={false}
              />
            </div>
          </div>
        )}

        {/* Processing */}
        {isProcessing && (
          <div className="text-center py-6">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-3" />
            <p className="text-lg font-semibold">Checking...</p>
          </div>
        )}

        {/* Feedback */}
        {showFeedback && (
          <div className={cn(
            "text-center p-6 rounded-2xl border-2",
            feedbackMessage.includes('Perfect') 
              ? "bg-green-50 border-green-200" 
              : "bg-yellow-50 border-yellow-200"
          )}>
            <p className="text-xl font-semibold">{feedbackMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Echo Challenge Game
const EchoChallenge = ({ 
  onBack, 
  onScoreUpdate, 
  storyWords 
}: { 
  onBack: () => void; 
  onScoreUpdate: (points: number) => void;
  storyWords: StoryWord[];
}) => {
  const [level, setLevel] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Generate challenges from story words
  const generateChallenges = (words: StoryWord[]) => {
    if (words.length === 0) {
      // Fallback to default challenges
      return [
        { phrase: 'Hello friend', speed: 0.9, points: 10, storyTitle: 'Basic Words' },
        { phrase: 'I love English', speed: 1.0, points: 15, storyTitle: 'Basic Words' },
        { phrase: 'Learning is fun', speed: 1.1, points: 20, storyTitle: 'Basic Words' },
        { phrase: 'Practice makes perfect', speed: 1.2, points: 25, storyTitle: 'Basic Words' },
        { phrase: 'I can speak English well', speed: 1.3, points: 30, storyTitle: 'Basic Words' }
      ];
    }

    // Create challenges using story words
    const challenges = [];
    const shortWords = words.filter(w => w.word.length <= 6).slice(0, 15);
    
    if (shortWords.length >= 5) {
      // Create 5 challenges with increasing difficulty
      const phrases = [
        `${shortWords[0].word} ${shortWords[1].word}`,
        `The ${shortWords[2].word} is ${shortWords[3].word}`,
        `I see a ${shortWords[4].word}`,
        `${shortWords[5].word} and ${shortWords[6].word} are friends`,
        `The ${shortWords[7].word} loves to ${shortWords[8].word}`
      ];

      phrases.forEach((phrase, index) => {
        challenges.push({
          phrase,
          speed: 0.9 + (index * 0.1),
          points: 10 + (index * 5),
          storyTitle: shortWords[index]?.storyTitle || 'Story Words'
        });
      });
    }

    // Fill remaining challenges with default if needed
    while (challenges.length < 5) {
      challenges.push({
        phrase: 'Hello friend',
        speed: 0.9 + (challenges.length * 0.1),
        points: 10 + (challenges.length * 5),
        storyTitle: 'Basic Words'
      });
    }

    return challenges;
  };

  const challenges = generateChallenges(storyWords);

  const current = challenges[level];

  const playPhrase = async () => {
    setIsPlaying(true);
    try {
      await EnhancedTTS.speak(current.phrase, { rate: current.speed });
    } finally {
      setIsPlaying(false);
    }
  };

  const handleRecordingComplete = async (blob: Blob) => {
    setIsProcessing(true);
    
    try {
      const result = await WhisperService.transcribe(blob);
      const transcript = result.transcript.toLowerCase().trim();
      const expected = current.phrase.toLowerCase();
      
      // Calculate similarity
      const words = transcript.split(' ');
      const expectedWords = expected.split(' ');
      const matchCount = words.filter(w => expectedWords.includes(w)).length;
      const accuracy = (matchCount / expectedWords.length) * 100;
      
      const isCorrect = accuracy >= 80;
      
      setFeedback(
        isCorrect 
          ? `🎉 Amazing! You kept up with the speed! +${current.points} points!`
          : '🤔 Close! Try listening again and repeat carefully.'
      );
      
      await EnhancedTTS.speak(
        isCorrect ? 'Excellent!' : 'Try again!',
        { rate: 1.0, emotion: isCorrect ? 'happy' : 'neutral' }
      );
      
      if (isCorrect) {
        onScoreUpdate(current.points);
        
        setTimeout(() => {
          setLevel((prev) => (prev + 1) % challenges.length);
          setFeedback(null);
        }, 2500);
      }
    } catch (error) {
      console.error('Error:', error);
      setFeedback('Please try again!');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-2 border-purple-300 dark:border-purple-600 bg-purple-50/50 dark:bg-purple-900/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
          <span className="flex items-center gap-3">
            ⚡ Echo Challenge
          </span>
          <Button variant="outline" size="sm" onClick={onBack} className="rounded-xl border-2 border-purple-300 dark:border-purple-600 bg-purple-100/50 dark:bg-purple-900/20 hover:bg-purple-200/60 dark:hover:bg-purple-900/30 text-gray-900 dark:text-white font-semibold">
            Back to Menu
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Level Display */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            {challenges.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "w-4 h-4 rounded-full",
                  idx === level ? "bg-purple-500 scale-150" : idx < level ? "bg-green-500" : "bg-gray-300"
                )}
              />
            ))}
          </div>
          
          <h3 className="text-2xl font-bold text-purple-300">
            Level {level + 1} - Speed {current.speed.toFixed(1)}x
          </h3>
          
          <div className="text-4xl font-extrabold text-gray-800 dark:text-white bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8">
            {current.phrase}
          </div>
          
          {current.storyTitle && current.storyTitle !== 'Basic Words' && (
            <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-2 mb-2">
              <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                Words from: {current.storyTitle}
              </p>
            </div>
          )}
          
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Listen and repeat as fast as you can! ⚡
          </p>
        </div>

        {/* Play Button */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={playPhrase}
            disabled={isPlaying}
            className="rounded-2xl px-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500"
          >
            {isPlaying ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Playing...
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5 mr-2" />
                Play Phrase
              </>
            )}
          </Button>
        </div>

        {/* Recording */}
        {!isProcessing && !feedback && (
          <div className="space-y-4">
            <p className="text-center text-lg text-gray-600 dark:text-gray-300">
              Now you repeat it!
            </p>
            <VoiceRecorder
              onRecordingComplete={handleRecordingComplete}
              maxDuration={10}
              showPlayback={false}
            />
          </div>
        )}

        {/* Processing */}
        {isProcessing && (
          <div className="text-center py-6">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-3" />
            <p className="text-lg font-semibold">Checking your speed...</p>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className={cn(
            "text-center p-6 rounded-2xl border-2 animate-pulse",
            feedback.includes('Amazing') 
              ? "bg-green-50 border-green-200" 
              : "bg-yellow-50 border-yellow-200"
          )}>
            <p className="text-xl font-semibold">{feedback}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InteractiveGames;

