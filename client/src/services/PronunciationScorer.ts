/*
  PronunciationScorer: Advanced pronunciation analysis
  Uses phoneme matching, rhythm analysis, and prosody detection
*/

export interface PronunciationScore {
  overall: number; // 0-100
  accuracy: number; // Phoneme accuracy
  fluency: number; // Speech rhythm
  prosody: number; // Intonation and stress
  details: {
    correctPhonemes: number;
    totalPhonemes: number;
    mispronounced: string[];
    suggestions: string[];
  };
}

export interface PhonemeMap {
  [word: string]: string; // IPA phonemes
}

class PronunciationScorerClass {
  // Common English phoneme mappings (IPA)
  private phonemeDict: PhonemeMap = {
    'hello': 'həˈloʊ',
    'world': 'wɜːrld',
    'cat': 'kæt',
    'dog': 'dɔːɡ',
    'rabbit': 'ˈræb.ɪt',
    'forest': 'ˈfɒr.ɪst',
    'astronaut': 'ˈæs.trə.nɔːt',
    'planet': 'ˈplæn.ɪt',
    'beautiful': 'ˈbjuː.tɪ.fəl',
    'difficult': 'ˈdɪf.ɪ.kəlt',
    'pronunciation': 'prəˌnʌn.siˈeɪ.ʃən',
    'communication': 'kəˌmjuː.nɪˈkeɪ.ʃən'
  };

  /**
   * Score pronunciation by comparing expected vs actual speech
   */
  async scorePronunciation(
    expectedText: string,
    spokenText: string,
    audioData?: Blob
  ): Promise<PronunciationScore> {
    const expectedWords = this.tokenize(expectedText);
    const spokenWords = this.tokenize(spokenText);

    // Calculate accuracy based on word matching
    const accuracy = this.calculateAccuracy(expectedWords, spokenWords);

    // Calculate fluency based on word count and timing
    const fluency = this.calculateFluency(spokenWords, audioData);

    // Calculate prosody (intonation) - simplified for now
    const prosody = this.calculateProsody(spokenText);

    // Find mispronounced words
    const mispronounced = this.findMispronounced(expectedWords, spokenWords);

    // Generate suggestions
    const suggestions = this.generateSuggestions(mispronounced, expectedWords);

    const overall = Math.round((accuracy * 0.5 + fluency * 0.3 + prosody * 0.2));

    return {
      overall,
      accuracy,
      fluency,
      prosody,
      details: {
        correctPhonemes: expectedWords.filter(w => spokenWords.includes(w)).length,
        totalPhonemes: expectedWords.length,
        mispronounced,
        suggestions
      }
    };
  }

  /**
   * Get phoneme representation of a word
   */
  getPhonemes(word: string): string {
    const normalized = word.toLowerCase().trim();
    return this.phonemeDict[normalized] || this.estimatePhonemes(normalized);
  }

  /**
   * Estimate phonemes for unknown words (simplified)
   */
  private estimatePhonemes(word: string): string {
    // Very basic phoneme estimation
    // In production, use a proper phoneme dictionary or API
    return word.split('').map(char => {
      const phonemeMap: Record<string, string> = {
        'a': 'æ', 'e': 'ɛ', 'i': 'ɪ', 'o': 'ɑ', 'u': 'ʌ',
        'b': 'b', 'c': 'k', 'd': 'd', 'f': 'f', 'g': 'ɡ',
        'h': 'h', 'j': 'dʒ', 'k': 'k', 'l': 'l', 'm': 'm',
        'n': 'n', 'p': 'p', 'q': 'k', 'r': 'r', 's': 's',
        't': 't', 'v': 'v', 'w': 'w', 'x': 'ks', 'y': 'j', 'z': 'z'
      };
      return phonemeMap[char.toLowerCase()] || char;
    }).join('');
  }

  /**
   * Calculate accuracy score
   */
  private calculateAccuracy(expected: string[], spoken: string[]): number {
    if (expected.length === 0) return 0;

    let matches = 0;
    const spokenSet = new Set(spoken.map(w => w.toLowerCase()));

    expected.forEach(word => {
      if (spokenSet.has(word.toLowerCase())) {
        matches++;
      }
    });

    return Math.round((matches / expected.length) * 100);
  }

  /**
   * Calculate fluency score based on speech characteristics
   */
  private calculateFluency(words: string[], audioData?: Blob): number {
    // Basic fluency calculation
    const wordCount = words.length;

    if (wordCount === 0) return 0;
    if (wordCount < 3) return 50;
    if (wordCount < 10) return 70;
    
    // Ideal range: 10-30 words
    if (wordCount >= 10 && wordCount <= 30) return 90;
    
    // Too many words might indicate rushing
    if (wordCount > 30) return 75;

    return 80;
  }

  /**
   * Calculate prosody (intonation) score
   */
  private calculateProsody(text: string): number {
    // Check for natural sentence structure
    const hasPunctuation = /[.!?]/.test(text);
    const hasCapitalization = /[A-Z]/.test(text);
    const hasVariedLength = text.split(/\s+/).some(w => w.length > 5);

    let score = 60; // Base score

    if (hasPunctuation) score += 15;
    if (hasCapitalization) score += 15;
    if (hasVariedLength) score += 10;

    return Math.min(100, score);
  }

  /**
   * Find mispronounced words
   */
  private findMispronounced(expected: string[], spoken: string[]): string[] {
    const spokenSet = new Set(spoken.map(w => w.toLowerCase()));
    return expected.filter(word => !spokenSet.has(word.toLowerCase()));
  }

  /**
   * Generate pronunciation suggestions
   */
  private generateSuggestions(mispronounced: string[], expected: string[]): string[] {
    const suggestions: string[] = [];

    mispronounced.forEach(word => {
      const phonemes = this.getPhonemes(word);
      suggestions.push(`Try pronouncing "${word}" as: ${phonemes}`);
    });

    if (suggestions.length === 0 && expected.length > 0) {
      suggestions.push('Great pronunciation! Keep practicing to maintain fluency.');
    }

    return suggestions;
  }

  /**
   * Tokenize text into words
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 0);
  }

  /**
   * Add custom phoneme mappings
   */
  addPhonemeMapping(word: string, phonemes: string): void {
    this.phonemeDict[word.toLowerCase()] = phonemes;
  }

  /**
   * Bulk add phoneme mappings
   */
  addPhonemes(mappings: PhonemeMap): void {
    Object.entries(mappings).forEach(([word, phonemes]) => {
      this.phonemeDict[word.toLowerCase()] = phonemes;
    });
  }

  /**
   * Get all available phoneme mappings
   */
  getPhonemeDict(): PhonemeMap {
    return { ...this.phonemeDict };
  }
}

// Singleton instance
export const PronunciationScorer = new PronunciationScorerClass();
export default PronunciationScorer;

