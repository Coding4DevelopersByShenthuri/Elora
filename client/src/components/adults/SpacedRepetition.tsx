import { useState, useEffect } from 'react';
import {
  RefreshCw, CheckCircle, XCircle, Clock, TrendingUp,
  BookOpen, Zap, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AdultsAPI } from '@/services/ApiService';
import { useAuth } from '@/contexts/AuthContext';

interface SpacedRepetitionItem {
  id: number;
  item_type: string;
  item_id: string;
  item_content: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_date: string;
  days_until_review: number;
  times_reviewed: number;
  times_correct: number;
  times_incorrect: number;
  last_reviewed?: string;
  mastery_level: number;
}

export default function SpacedRepetition() {
  const { user } = useAuth();
  const [items, setItems] = useState<SpacedRepetitionItem[]>([]);
  const [dueItems, setDueItems] = useState<SpacedRepetitionItem[]>([]);
  const [currentItem, setCurrentItem] = useState<SpacedRepetitionItem | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewMode, setReviewMode] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const [allItemsRes, dueItemsRes] = await Promise.all([
        AdultsAPI.getSpacedRepetitionItems(),
        AdultsAPI.getSpacedRepetitionDue(),
      ]);

      if (allItemsRes.success && 'data' in allItemsRes) {
        setItems(allItemsRes.data?.items || []);
      }
      if (dueItemsRes.success && 'data' in dueItemsRes) {
        const due = dueItemsRes.data?.items || [];
        setDueItems(due);
        if (due.length > 0 && !currentItem) {
          setCurrentItem(due[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load spaced repetition items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (quality: number) => {
    if (!currentItem) return;

    try {
      const result = await AdultsAPI.reviewSpacedRepetitionItem(currentItem.id, quality);
      if (result.success) {
        // Move to next item
        const currentIndex = dueItems.findIndex(item => item.id === currentItem.id);
        const nextItem = dueItems[currentIndex + 1];
        
        if (nextItem) {
          setCurrentItem(nextItem);
        } else {
          // All items reviewed
          setCurrentItem(null);
          setReviewMode(false);
        }
        
        setShowAnswer(false);
        loadItems();
      }
    } catch (error) {
      console.error('Failed to review item:', error);
    }
  };

  const startReview = () => {
    if (dueItems.length > 0) {
      setCurrentItem(dueItems[0]);
      setReviewMode(true);
      setShowAnswer(false);
    }
  };

  const getItemTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      vocabulary: 'Vocabulary',
      phrase: 'Phrase',
      grammar_rule: 'Grammar Rule',
      idiom: 'Idiom',
    };
    return labels[type] || type;
  };

  const getMasteryColor = (level: number) => {
    if (level >= 80) return 'text-emerald-400';
    if (level >= 60) return 'text-cyan-400';
    if (level >= 40) return 'text-amber-400';
    return 'text-rose-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white mb-2">Spaced Repetition</h2>
        <p className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70 mb-4 sm:mb-6">Review vocabulary and concepts at optimal intervals for better retention</p>
        {dueItems.length > 0 && !reviewMode && (
          <div className="flex justify-end">
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600"
              onClick={startReview}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Start Review ({dueItems.length} due)
            </Button>
          </div>
        )}
      </div>

      {/* Review Mode */}
      {reviewMode && currentItem ? (
        <Card className="bg-card/80 backdrop-blur-xl border-primary/30 dark:bg-slate-900/60 dark:border-emerald-500/30">
          <CardContent className="p-6 sm:p-8">
            <div className="text-center space-y-6">
              {/* Item Content */}
              <div className="space-y-4">
                <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-400/30">
                  {getItemTypeLabel(currentItem.item_type)}
                </Badge>
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-8 min-h-[200px] flex items-center justify-center dark:bg-emerald-500/10 dark:border-emerald-500/20">
                  <p className="text-2xl sm:text-3xl font-semibold text-foreground dark:text-white">
                    {currentItem.item_content}
                  </p>
                </div>
              </div>

              {/* Show Answer Button */}
              {!showAnswer && (
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600"
                  onClick={() => setShowAnswer(true)}
                >
                  Show Answer
                </Button>
              )}

              {/* Quality Buttons */}
              {showAnswer && (
                <div className="space-y-4">
                  <p className="text-muted-foreground dark:text-cyan-100/70 text-sm">
                    How well did you remember this?
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { quality: 0, label: 'Again', icon: XCircle, color: 'from-rose-500 to-red-600' },
                      { quality: 1, label: 'Hard', icon: Clock, color: 'from-orange-500 to-amber-600' },
                      { quality: 2, label: 'Good', icon: CheckCircle, color: 'from-cyan-500 to-blue-600' },
                      { quality: 3, label: 'Easy', icon: Zap, color: 'from-emerald-500 to-teal-600' },
                    ].map(({ quality, label, icon: Icon, color }) => (
                      <Button
                        key={quality}
                        className={cn(
                          "bg-gradient-to-r text-white font-semibold h-auto py-4 flex flex-col items-center gap-2",
                          color
                        )}
                        onClick={() => handleReview(quality)}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs">{label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress */}
              <div className="pt-4 border-t border-primary/20 dark:border-emerald-500/20">
                <div className="flex items-center justify-between text-xs text-muted-foreground dark:text-cyan-100/70 mb-2">
                  <span>
                    {dueItems.findIndex(item => item.id === currentItem.id) + 1} of {dueItems.length}
                  </span>
                  <span className={cn("text-foreground dark:text-white", getMasteryColor(currentItem.mastery_level))}>
                    {currentItem.mastery_level.toFixed(0)}% mastery
                  </span>
                </div>
                <Progress
                  value={(dueItems.findIndex(item => item.id === currentItem.id) + 1) / dueItems.length * 100}
                  className="h-2 bg-muted dark:bg-slate-700/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-card/80 backdrop-blur-xl border-primary/30 dark:bg-slate-900/60 dark:border-emerald-500/30">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary dark:bg-emerald-500">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground dark:text-white">{dueItems.length}</p>
                    <p className="text-xs text-muted-foreground dark:text-cyan-100/70">Items Due</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur-xl border-primary/30 dark:bg-slate-900/60 dark:border-emerald-500/30">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary dark:bg-emerald-500">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground dark:text-white">{items.length}</p>
                    <p className="text-xs text-muted-foreground dark:text-cyan-100/70">Total Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur-xl border-primary/30 dark:bg-slate-900/60 dark:border-emerald-500/30">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary dark:bg-emerald-500">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground dark:text-white">
                      {items.length > 0
                        ? Math.round(items.reduce((sum, item) => sum + item.mastery_level, 0) / items.length)
                        : 0}%
                    </p>
                    <p className="text-xs text-muted-foreground dark:text-cyan-100/70">Avg Mastery</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Items List */}
          {items.length === 0 ? (
            <Card className="bg-card/60 backdrop-blur-xl border-primary/30 dark:bg-slate-900/60 dark:border-emerald-500/30">
              <CardContent className="p-12 text-center">
                <RefreshCw className="h-12 w-12 mx-auto mb-4 text-primary dark:text-emerald-300" />
                <p className="text-muted-foreground dark:text-cyan-100/70">No items in your spaced repetition system yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground dark:text-white">Your Items</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {items.slice(0, 10).map((item) => (
                  <Card
                    key={item.id}
                    className={cn(
                      "bg-card/60 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all dark:bg-slate-800/40 dark:border-emerald-500/20 dark:hover:border-emerald-400/50",
                      item.days_until_review === 0 && "ring-2 ring-primary/50 dark:ring-emerald-500/50"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs bg-primary/20 text-primary border-primary/30 dark:bg-slate-700/50 dark:text-cyan-200 dark:border-cyan-500/30">
                              {getItemTypeLabel(item.item_type)}
                            </Badge>
                            {item.days_until_review === 0 && (
                              <Badge variant="outline" className="text-xs bg-primary/20 text-primary border-primary/30 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-400/30">
                                Due Now
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium text-foreground dark:text-white truncate">{item.item_content}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground dark:text-cyan-100/60">
                            <span className={cn("text-foreground dark:text-white", getMasteryColor(item.mastery_level))}>
                              {item.mastery_level.toFixed(0)}% mastery
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {item.days_until_review === 0
                                ? 'Due today'
                                : `${item.days_until_review} days`}
                            </span>
                          </div>
                        </div>
                        <Progress
                          value={item.mastery_level}
                          className="w-16 h-2 bg-muted dark:bg-slate-700/50 ml-4"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

