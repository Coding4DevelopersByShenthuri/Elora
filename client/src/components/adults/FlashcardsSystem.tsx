import { useState, useEffect, useRef } from 'react';
import { FileText, RotateCw, CheckCircle, X, BookOpen, TrendingUp, Clock, Target, Award, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { AdultsAPI } from '@/services/ApiService';
import { useAuth } from '@/contexts/AuthContext';

interface Flashcard {
  id: number;
  front: string;
  back: string;
  dictionary_entry?: {
    word: string;
    definition: string;
  };
  times_reviewed: number;
  times_correct: number;
  times_incorrect: number;
  mastery_level: number;
  next_review_date: string;
  last_reviewed?: string;
  days_until_review: number;
}

interface FlashcardDeck {
  id: number;
  title: string;
  description?: string;
  card_count: number;
  is_default?: boolean;
}

interface FlashcardsSystemProps {
  onClose: () => void;
  defaultDeckId?: number | null;
}

export default function FlashcardsSystem({ onClose, defaultDeckId = null }: FlashcardsSystemProps) {
  const { user } = useAuth();
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<number | null>(defaultDeckId);
  const [cardsDue, setCardsDue] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewStartTime, setReviewStartTime] = useState<number | null>(null);
  const [showDeckSelector, setShowDeckSelector] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadDecks();
      if (defaultDeckId) {
        loadCardsDue(defaultDeckId);
      } else {
        loadCardsDue();
      }
    }
  }, [user, defaultDeckId]);

  useEffect(() => {
    if (selectedDeck !== null) {
      loadCardsDue(selectedDeck);
    }
  }, [selectedDeck]);

  useEffect(() => {
    if (cardsDue.length > 0 && currentCardIndex < cardsDue.length) {
      setReviewStartTime(Date.now());
      setIsFlipped(false);
    }
  }, [currentCardIndex, cardsDue.length]);

  const loadDecks = async () => {
    try {
      const result = await AdultsAPI.getFlashcardDecks();
      if (result.success && 'data' in result) {
        const decksData = result.data?.data || [];
        setDecks(decksData);
        // Auto-select default deck if available
        if (!selectedDeck && decksData.length > 0) {
          const defaultDeck = decksData.find((d: FlashcardDeck) => d.is_default) || decksData[0];
          setSelectedDeck(defaultDeck.id);
        }
      }
    } catch (error) {
      console.error('Failed to load decks:', error);
    }
  };

  const loadCardsDue = async (deckId?: number) => {
    try {
      setLoading(true);
      const result = await AdultsAPI.getFlashcardsDue(deckId);
      if (result.success && 'data' in result) {
        const cards = result.data?.data || [];
        setCardsDue(cards);
        setCurrentCardIndex(0);
        setIsFlipped(false);
      }
    } catch (error) {
      console.error('Failed to load cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (quality: number) => {
    if (cardsDue.length === 0 || !cardsDue[currentCardIndex]) return;

    const currentCard = cardsDue[currentCardIndex];
    const timeSpent = reviewStartTime ? Math.round((Date.now() - reviewStartTime) / 1000) : 5;

    try {
      const result = await AdultsAPI.submitFlashcardReview({
        flashcard_id: currentCard.id,
        quality,
        time_spent_seconds: timeSpent,
      });

      if (result.success) {
        // Move to next card or finish
        if (currentCardIndex < cardsDue.length - 1) {
          setCurrentCardIndex(currentCardIndex + 1);
          setIsFlipped(false);
        } else {
          // All cards reviewed, reload
          loadCardsDue(selectedDeck || undefined);
        }
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  const handleDeckChange = (deckId: string) => {
    const id = deckId === 'all' ? null : parseInt(deckId);
    setSelectedDeck(id);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const currentCard = cardsDue[currentCardIndex];
  const progress = cardsDue.length > 0
    ? ((currentCardIndex + 1) / cardsDue.length) * 100
    : 0;

  const selectedDeckName = selectedDeck 
    ? decks.find(d => d.id === selectedDeck)?.title || 'Selected Deck'
    : 'All Decks';

  const totalStats = cardsDue.reduce((acc, card) => {
    acc.totalReviewed += card.times_reviewed;
    acc.totalCorrect += card.times_correct;
    acc.totalIncorrect += card.times_incorrect;
    acc.totalMastery += card.mastery_level;
    return acc;
  }, { totalReviewed: 0, totalCorrect: 0, totalIncorrect: 0, totalMastery: 0 });

  const averageMastery = cardsDue.length > 0 ? totalStats.totalMastery / cardsDue.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white mb-2">Flashcard Review</h2>
        <p className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70 mb-4 sm:mb-6">Practice vocabulary with spaced repetition for better retention</p>
      </div>

      <Card className="bg-card/80 backdrop-blur-xl border-primary/30 shadow-2xl w-full max-w-7xl mx-auto flex flex-col dark:bg-slate-900/60 dark:border-emerald-500/30">
        {onClose && (
          <CardHeader className="border-b border-primary/30 dark:border-emerald-500/30">
            <div className="flex items-center justify-end">
              <Button variant="ghost" size="icon" onClick={onClose} className="text-foreground dark:text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
        )}

        <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
          {/* Deck Selector and Stats */}
          <div className="p-4 sm:p-6 border-b border-primary/20 dark:border-emerald-500/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1 w-full sm:w-auto">
                <Select value={selectedDeck?.toString() || 'all'} onValueChange={handleDeckChange}>
                  <SelectTrigger className="w-full sm:w-[250px] bg-card/60 backdrop-blur-xl border-primary/30 text-foreground dark:bg-slate-800/50 dark:border-emerald-500/30 dark:text-white">
                    <SelectValue placeholder="Select a deck" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Decks</SelectItem>
                    {decks.map((deck) => (
                      <SelectItem key={deck.id} value={deck.id.toString()}>
                        {deck.title} ({deck.card_count} cards)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {cardsDue.length > 0 && (
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary dark:text-emerald-300" />
                    <span className="text-muted-foreground dark:text-cyan-100/70">
                      {cardsDue.length} due
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary dark:text-emerald-300" />
                    <span className="text-muted-foreground dark:text-cyan-100/70">
                      {Math.round(averageMastery)}% mastery
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {cardsDue.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground dark:text-cyan-100/70">
                    Card {currentCardIndex + 1} of {cardsDue.length}
                  </span>
                  <span className="text-muted-foreground dark:text-cyan-100/70">
                    {cardsDue.length - currentCardIndex - 1} remaining
                  </span>
                </div>
                <Progress value={progress} className="h-2 bg-muted dark:bg-slate-700/50">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent dark:from-emerald-500 dark:via-green-500 dark:to-teal-500" />
                </Progress>
              </div>
            )}
          </div>

          {/* Main Content */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-emerald-400 mx-auto mb-4"></div>
                <p className="text-muted-foreground dark:text-cyan-100/70">Loading flashcards...</p>
              </div>
            </div>
          ) : cardsDue.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center">
              <CheckCircle className="h-16 w-16 text-emerald-500 dark:text-emerald-400 mb-4" />
              <h3 className="text-xl font-semibold text-foreground dark:text-white mb-2">
                All Caught Up!
              </h3>
              <p className="text-muted-foreground dark:text-cyan-100/70 mb-6 max-w-md">
                You've reviewed all your flashcards for today. Come back tomorrow for more reviews, or create new flashcards to continue learning.
              </p>
              <div className="flex gap-3">
                <Button 
                  onClick={() => loadCardsDue(selectedDeck || undefined)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600"
                >
                  <RotateCw className="h-4 w-4 mr-2" />
                  Check Again
                </Button>
                {onClose && (
                  <Button 
                    variant="outline"
                    onClick={onClose}
                    className="border-primary/30 text-primary hover:bg-primary/20 dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                  >
                    Close
                  </Button>
                )}
              </div>
            </div>
          ) : currentCard ? (
            <div className="flex-1 flex flex-col p-4 sm:p-6">
              {/* Flashcard */}
              <div
                ref={cardRef}
                className={cn(
                  'flex-1 flex items-center justify-center min-h-[300px] sm:min-h-[400px] cursor-pointer',
                  'perspective-1000'
                )}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div
                  className={cn(
                    'relative w-full max-w-lg h-full transition-transform duration-500',
                    'transform-style-preserve-3d',
                    isFlipped && '[transform:rotateY(180deg)]'
                  )}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front */}
                  <div
                    className={cn(
                      'absolute inset-0 rounded-xl border-2 p-6 sm:p-8',
                      'bg-gradient-to-br from-primary via-secondary to-accent',
                      'border-primary/50 dark:border-emerald-400/50',
                      'flex flex-col items-center justify-center text-center',
                      'backface-hidden',
                      isFlipped && '[transform:rotateY(180deg)]'
                    )}
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="text-white w-full">
                      <Badge className="mb-4 bg-white/20 text-white border-white/30">
                        Front
                      </Badge>
                      {currentCard.dictionary_entry ? (
                        <>
                          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
                            {currentCard.dictionary_entry.word}
                          </h3>
                          {currentCard.front && (
                            <p className="text-base sm:text-lg text-white/90">
                              {currentCard.front}
                            </p>
                          )}
                        </>
                      ) : (
                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                          {currentCard.front}
                        </h3>
                      )}
                    </div>
                    <p className="text-white/70 text-xs sm:text-sm mt-6">
                      Click to reveal answer
                    </p>
                  </div>

                  {/* Back */}
                  <div
                    className={cn(
                      'absolute inset-0 rounded-xl border-2 p-6 sm:p-8',
                      'bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600',
                      'border-emerald-400/50 dark:border-emerald-400/50',
                      'flex flex-col items-center justify-center text-center',
                      'backface-hidden [transform:rotateY(180deg)]',
                      isFlipped && '[transform:rotateY(0deg)]'
                    )}
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="text-white w-full">
                      <Badge className="mb-4 bg-white/20 text-white border-white/30">
                        Back
                      </Badge>
                      {currentCard.dictionary_entry ? (
                        <>
                          <h3 className="text-xl sm:text-2xl font-bold mb-3">
                            {currentCard.dictionary_entry.word}
                          </h3>
                          <p className="text-base sm:text-lg text-white/90 mb-4">
                            {currentCard.dictionary_entry.definition}
                          </p>
                          {currentCard.back && (
                            <p className="text-sm text-white/80">
                              {currentCard.back}
                            </p>
                          )}
                        </>
                      ) : (
                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                          {currentCard.back}
                        </h3>
                      )}
                    </div>
                    <p className="text-white/70 text-xs sm:text-sm mt-6">
                      Click to see question
                    </p>
                  </div>
                </div>
              </div>

              {/* Review Controls */}
              <div className="border-t border-primary/20 dark:border-emerald-500/20 pt-6 mt-6">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleReview(0)}
                    className="border-red-500/30 text-red-600 hover:bg-red-500/20 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/20"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="hidden sm:inline">Again</span>
                    <span className="sm:hidden">0</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleReview(1)}
                    className="border-orange-500/30 text-orange-600 hover:bg-orange-500/20 dark:border-orange-500/30 dark:text-orange-400 dark:hover:bg-orange-500/20"
                  >
                    Hard
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleReview(3)}
                    className="border-blue-500/30 text-blue-600 hover:bg-blue-500/20 dark:border-blue-500/30 dark:text-blue-400 dark:hover:bg-blue-500/20"
                  >
                    Good
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleReview(5)}
                    className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                  >
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Easy
                  </Button>
                </div>

                {/* Card Stats */}
                {currentCard.times_reviewed > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground dark:text-cyan-100/70">
                      <TrendingUp className="h-4 w-4 text-primary dark:text-emerald-300" />
                      <span>Mastery: {Math.round(currentCard.mastery_level)}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground dark:text-cyan-100/70">
                      <RotateCw className="h-4 w-4 text-primary dark:text-emerald-300" />
                      <span>Reviewed: {currentCard.times_reviewed}x</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground dark:text-cyan-100/70">
                      <CheckCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                      <span>Correct: {currentCard.times_correct}</span>
                    </div>
                    {currentCard.days_until_review > 0 && (
                      <div className="flex items-center gap-2 text-muted-foreground dark:text-cyan-100/70">
                        <Clock className="h-4 w-4 text-primary dark:text-emerald-300" />
                        <span>Next: {currentCard.days_until_review}d</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
