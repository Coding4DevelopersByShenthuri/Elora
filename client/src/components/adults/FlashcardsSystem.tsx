import { useState, useEffect } from 'react';
import { FileText, RotateCw, CheckCircle, X, Plus, BookOpen, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
}

interface FlashcardsSystemProps {
  onClose: () => void;
  defaultDeckId?: number | null;
}

export default function FlashcardsSystem({ onClose, defaultDeckId = null }: FlashcardsSystemProps) {
  const { user } = useAuth();
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<number | null>(null);
  const [cardsDue, setCardsDue] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'review' | 'browse'>('review');

  useEffect(() => {
    if (user) {
      loadDecks();
      if (defaultDeckId) {
        setSelectedDeck(defaultDeckId);
        loadCardsDue(defaultDeckId);
      } else {
        loadCardsDue();
      }
    }
  }, [user, defaultDeckId]);

  useEffect(() => {
    if (selectedDeck) {
      loadCardsDue(selectedDeck);
    }
  }, [selectedDeck]);

  const loadDecks = async () => {
    try {
      const result = await AdultsAPI.getFlashcardDecks();
      if (result.success && 'data' in result) {
        setDecks(result.data?.data || []);
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
    if (cardsDue.length === 0) return;

    const currentCard = cardsDue[currentCardIndex];
    try {
      const result = await AdultsAPI.submitFlashcardReview({
        flashcard_id: currentCard.id,
        quality,
        time_spent_seconds: 5, // TODO: Track actual time
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

  const currentCard = cardsDue[currentCardIndex];
  const progress = cardsDue.length > 0
    ? ((currentCardIndex + 1) / cardsDue.length) * 100
    : 0;

  return (
    <Card className="bg-slate-900/95 backdrop-blur-xl border-purple-500/30 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col mx-auto">
      <CardHeader className="border-b border-purple-500/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-400" />
            Flashcards
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={mode === 'review' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setMode('review');
                loadCardsDue(selectedDeck || undefined);
              }}
              className={mode === 'review' ? 'bg-purple-500/20' : ''}
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Review
            </Button>
            <Button
              variant={mode === 'browse' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('browse')}
              className={mode === 'browse' ? 'bg-purple-500/20' : ''}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Browse
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {mode === 'review' && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-cyan-100/70">
                Card {currentCardIndex + 1} of {cardsDue.length}
              </span>
              <span className="text-cyan-100/70">
                {cardsDue.length - currentCardIndex - 1} remaining
              </span>
            </div>
            <Progress value={progress} className="h-2 bg-slate-700/50">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
            </Progress>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-cyan-300/70">Loading flashcards...</div>
          </div>
        ) : mode === 'review' ? (
          <>
            {cardsDue.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  All Caught Up!
                </h3>
                <p className="text-cyan-100/70 mb-4">
                  You've reviewed all your flashcards for today. Come back tomorrow for more reviews.
                </p>
                <Button onClick={() => loadCardsDue(selectedDeck || undefined)}>
                  <RotateCw className="h-4 w-4 mr-2" />
                  Check Again
                </Button>
              </div>
            ) : currentCard ? (
              <div className="flex-1 flex flex-col p-6">
                {/* Flashcard */}
                <div
                  className={cn(
                    'flex-1 flex items-center justify-center perspective-1000',
                    'min-h-[300px]'
                  )}
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  <div
                    className={cn(
                      'relative w-full max-w-lg h-full transform-style-preserve-3d transition-transform duration-500',
                      isFlipped && 'rotate-y-180'
                    )}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Front */}
                    <div
                      className={cn(
                        'absolute inset-0 backface-hidden rounded-xl border-2 p-8',
                        'bg-gradient-to-br from-blue-600 to-purple-600 border-blue-400/50',
                        'flex flex-col items-center justify-center text-center',
                        isFlipped && 'rotate-y-180'
                      )}
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <div className="text-white">
                        <p className="text-sm text-blue-200/70 mb-4">Front</p>
                        {currentCard.dictionary_entry ? (
                          <>
                            <h3 className="text-3xl font-bold mb-2">
                              {currentCard.dictionary_entry.word}
                            </h3>
                            <p className="text-lg text-blue-100/90">
                              {currentCard.front}
                            </p>
                          </>
                        ) : (
                          <h3 className="text-3xl font-bold">
                            {currentCard.front}
                          </h3>
                        )}
                      </div>
                      <p className="text-blue-200/70 text-sm mt-4">
                        Click to flip
                      </p>
                    </div>

                    {/* Back */}
                    <div
                      className={cn(
                        'absolute inset-0 backface-hidden rounded-xl border-2 p-8 rotate-y-180',
                        'bg-gradient-to-br from-purple-600 to-pink-600 border-purple-400/50',
                        'flex flex-col items-center justify-center text-center',
                        isFlipped && 'rotate-y-0'
                      )}
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <div className="text-white">
                        <p className="text-sm text-purple-200/70 mb-4">Back</p>
                        {currentCard.dictionary_entry ? (
                          <>
                            <h3 className="text-2xl font-bold mb-2">
                              {currentCard.dictionary_entry.word}
                            </h3>
                            <p className="text-lg text-purple-100/90 mb-4">
                              {currentCard.dictionary_entry.definition}
                            </p>
                          </>
                        ) : (
                          <h3 className="text-3xl font-bold">
                            {currentCard.back}
                          </h3>
                        )}
                        {currentCard.back && !currentCard.dictionary_entry && (
                          <p className="text-lg text-purple-100/90 mt-4">
                            {currentCard.back}
                          </p>
                        )}
                      </div>
                      <p className="text-purple-200/70 text-sm mt-4">
                        Click to flip
                      </p>
                    </div>
                  </div>
                </div>

                {/* Review Controls */}
                <div className="border-t border-purple-500/30 pt-6 mt-6">
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handleReview(0)}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                    >
                      <X className="h-5 w-5 mr-2" />
                      Again (0)
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handleReview(1)}
                      className="border-orange-500/30 text-orange-400 hover:bg-orange-500/20"
                    >
                      Hard (1)
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handleReview(3)}
                      className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                    >
                      Good (3)
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handleReview(5)}
                      className="border-green-500/30 text-green-400 hover:bg-green-500/20"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Easy (5)
                    </Button>
                  </div>

                  {/* Stats */}
                  {currentCard.times_reviewed > 0 && (
                    <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                      <div className="flex items-center gap-2 text-cyan-300/70">
                        <TrendingUp className="h-4 w-4" />
                        <span>Mastery: {Math.round(currentCard.mastery_level)}%</span>
                      </div>
                      <div className="text-cyan-300/70">
                        Reviewed: {currentCard.times_reviewed} times
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex-1 p-6">
            <p className="text-cyan-100/70 text-center py-8">
              Browse mode - coming soon! Create decks and manage your flashcards.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

