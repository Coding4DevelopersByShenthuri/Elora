/*
  VocabularyBuilder: Spaced repetition system for vocabulary learning
  Implements SM-2 algorithm for optimal review scheduling
*/

export interface VocabularyWord {
  id: string;
  word: string;
  definition: string;
  example: string;
  phonetic?: string;
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'other';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  
  // Spaced repetition data
  easinessFactor: number; // 1.3 - 2.5
  interval: number; // days until next review
  repetitions: number; // number of successful reviews
  nextReviewDate: string;
  lastReviewDate?: string;
  
  // Learning stats
  timesReviewed: number;
  timesCorrect: number;
  timesIncorrect: number;
  averageResponseTime: number; // seconds
  
  // Status
  status: 'new' | 'learning' | 'reviewing' | 'mastered';
}

export interface ReviewSession {
  wordId: string;
  correct: boolean;
  responseTime: number;
  quality: number; // 0-5 (SM-2 quality rating)
  date: string;
}

class VocabularyBuilderClass {
  /**
   * Create a new vocabulary word
   */
  createWord(
    word: string,
    definition: string,
    example: string,
    options: Partial<VocabularyWord> = {}
  ): VocabularyWord {
    return {
      id: `word-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      word,
      definition,
      example,
      phonetic: options.phonetic,
      partOfSpeech: options.partOfSpeech || 'other',
      difficulty: options.difficulty || 'beginner',
      category: options.category,
      
      // Initial spaced repetition values
      easinessFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReviewDate: new Date().toISOString(),
      
      // Initial stats
      timesReviewed: 0,
      timesCorrect: 0,
      timesIncorrect: 0,
      averageResponseTime: 0,
      
      status: 'new'
    };
  }

  /**
   * Get words due for review
   */
  getDueWords(words: VocabularyWord[]): VocabularyWord[] {
    const now = new Date();
    return words.filter(word => {
      const nextReview = new Date(word.nextReviewDate);
      return nextReview <= now;
    }).sort((a, b) => {
      // Prioritize by status: new > learning > reviewing
      const statusOrder = { new: 0, learning: 1, reviewing: 2, mastered: 3 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  }

  /**
   * Record review result and update word using SM-2 algorithm
   */
  recordReview(word: VocabularyWord, session: ReviewSession): VocabularyWord {
    const updated = { ...word };
    
    // Update stats
    updated.timesReviewed += 1;
    if (session.correct) {
      updated.timesCorrect += 1;
    } else {
      updated.timesIncorrect += 1;
    }
    
    // Update average response time
    updated.averageResponseTime = 
      (updated.averageResponseTime * (updated.timesReviewed - 1) + session.responseTime) / 
      updated.timesReviewed;
    
    updated.lastReviewDate = session.date;

    // Apply SM-2 algorithm
    const { easinessFactor, interval, repetitions } = this.calculateSM2(
      updated.easinessFactor,
      updated.interval,
      updated.repetitions,
      session.quality
    );

    updated.easinessFactor = easinessFactor;
    updated.interval = interval;
    updated.repetitions = repetitions;

    // Calculate next review date
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);
    updated.nextReviewDate = nextDate.toISOString();

    // Update status
    updated.status = this.determineStatus(updated);

    return updated;
  }

  /**
   * SM-2 Algorithm for spaced repetition
   * Based on SuperMemo 2 algorithm
   */
  private calculateSM2(
    currentEF: number,
    currentInterval: number,
    currentRepetitions: number,
    quality: number // 0-5
  ): { easinessFactor: number; interval: number; repetitions: number } {
    let easinessFactor = currentEF;
    let interval = currentInterval;
    let repetitions = currentRepetitions;

    // Update easiness factor
    easinessFactor = easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    
    // Ensure EF stays within bounds
    if (easinessFactor < 1.3) easinessFactor = 1.3;
    if (easinessFactor > 2.5) easinessFactor = 2.5;

    // Update interval and repetitions
    if (quality < 3) {
      // Incorrect response - restart
      repetitions = 0;
      interval = 1;
    } else {
      // Correct response
      repetitions += 1;
      
      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 6;
      } else {
        interval = Math.round(interval * easinessFactor);
      }
    }

    return { easinessFactor, interval, repetitions };
  }

  /**
   * Determine word status based on learning progress
   */
  private determineStatus(word: VocabularyWord): VocabularyWord['status'] {
    if (word.repetitions === 0) {
      return 'new';
    } else if (word.repetitions < 3) {
      return 'learning';
    } else if (word.interval < 21) {
      return 'reviewing';
    } else {
      return 'mastered';
    }
  }

  /**
   * Convert user performance to SM-2 quality rating (0-5)
   */
  performanceToQuality(correct: boolean, responseTime: number): number {
    if (!correct) {
      return responseTime < 10 ? 1 : 0; // Quick wrong answer vs slow
    }

    // Correct answer - rate based on response time
    if (responseTime < 3) return 5; // Perfect recall
    if (responseTime < 5) return 4; // Good recall
    if (responseTime < 10) return 3; // Acceptable recall
    return 3; // Slow but correct
  }

  /**
   * Get vocabulary statistics
   */
  getStatistics(words: VocabularyWord[]): {
    total: number;
    new: number;
    learning: number;
    reviewing: number;
    mastered: number;
    dueToday: number;
    accuracy: number;
    averageInterval: number;
  } {
    const dueWords = this.getDueWords(words);
    const totalReviews = words.reduce((sum, w) => sum + w.timesReviewed, 0);
    const totalCorrect = words.reduce((sum, w) => sum + w.timesCorrect, 0);
    const totalIntervals = words.reduce((sum, w) => sum + w.interval, 0);

    return {
      total: words.length,
      new: words.filter(w => w.status === 'new').length,
      learning: words.filter(w => w.status === 'learning').length,
      reviewing: words.filter(w => w.status === 'reviewing').length,
      mastered: words.filter(w => w.status === 'mastered').length,
      dueToday: dueWords.length,
      accuracy: totalReviews > 0 ? (totalCorrect / totalReviews) * 100 : 0,
      averageInterval: words.length > 0 ? totalIntervals / words.length : 0
    };
  }

  /**
   * Get words by difficulty
   */
  getWordsByDifficulty(
    words: VocabularyWord[],
    difficulty: VocabularyWord['difficulty']
  ): VocabularyWord[] {
    return words.filter(w => w.difficulty === difficulty);
  }

  /**
   * Get words by category
   */
  getWordsByCategory(words: VocabularyWord[], category: string): VocabularyWord[] {
    return words.filter(w => w.category === category);
  }

  /**
   * Get words by status
   */
  getWordsByStatus(
    words: VocabularyWord[],
    status: VocabularyWord['status']
  ): VocabularyWord[] {
    return words.filter(w => w.status === status);
  }

  /**
   * Get recommended daily review count
   */
  getRecommendedDailyReviews(words: VocabularyWord[]): number {
    const dueWords = this.getDueWords(words);
    const newWords = words.filter(w => w.status === 'new').length;
    
    // Recommend reviewing all due words + 5-10 new words per day
    const newWordsToday = Math.min(10, newWords);
    return dueWords.length + newWordsToday;
  }

  /**
   * Get learning forecast for next N days
   */
  getForecast(words: VocabularyWord[], days: number = 7): Array<{
    date: string;
    dueCount: number;
    newCount: number;
  }> {
    const forecast: Array<{ date: string; dueCount: number; newCount: number }> = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dueCount = words.filter(w => {
        const reviewDate = new Date(w.nextReviewDate).toISOString().split('T')[0];
        return reviewDate === dateStr;
      }).length;

      forecast.push({
        date: dateStr,
        dueCount,
        newCount: i === 0 ? Math.min(10, words.filter(w => w.status === 'new').length) : 0
      });
    }

    return forecast;
  }

  /**
   * Export vocabulary list
   */
  exportWords(words: VocabularyWord[]): string {
    return JSON.stringify(words, null, 2);
  }

  /**
   * Import vocabulary list
   */
  importWords(json: string): VocabularyWord[] {
    try {
      const words = JSON.parse(json);
      return Array.isArray(words) ? words : [];
    } catch {
      return [];
    }
  }
}

// Singleton instance
export const VocabularyBuilder = new VocabularyBuilderClass();
export default VocabularyBuilder;

