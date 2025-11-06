/*
  AdvancedPronunciationScorer: Montreal Forced Aligner (MFA) inspired pronunciation scoring
  Uses phoneme-level alignment, duration analysis, and acoustic features
  Provides detailed feedback on pronunciation accuracy
*/

export interface PhonemeAlignment {
  phoneme: string;
  start: number; // seconds
  end: number; // seconds
  duration: number;
  confidence: number;
}

export interface WordAlignment {
  word: string;
  start: number;
  end: number;
  phonemes: PhonemeAlignment[];
  score: number; // 0-100
}

export interface DetailedPronunciationScore {
  overall: number; // 0-100
  accuracy: number; // Phoneme correctness
  fluency: number; // Speech rate and rhythm
  prosody: number; // Stress and intonation
  clarity: number; // Articulation quality
  timing: number; // Duration accuracy
  
  wordScores: WordAlignment[];
  problemPhonemes: string[];
  recommendations: string[];
  
  metrics: {
    speechRate: number; // words per minute
    pauseCount: number;
    averagePauseDuration: number;
    speechDuration: number;
    totalDuration: number;
  };
}

export interface AcousticFeatures {
  pitch: number[]; // Fundamental frequency
  energy: number[]; // Voice energy
  mfcc: number[][]; // Mel-frequency cepstral coefficients
  formants: number[][]; // Vowel formants
}

class AdvancedPronunciationScorerClass {
  // IPA Phoneme dictionary for English (extended with kids vocabulary)
  private phonemeDict: Record<string, string[]> = {
    // Common words with phoneme breakdowns
    'hello': ['h', 'ə', 'ˈl', 'oʊ'],
    'world': ['w', 'ɜː', 'r', 'l', 'd'],
    'the': ['ð', 'ə'],
    'cat': ['k', 'æ', 't'],
    'dog': ['d', 'ɔː', 'ɡ'],
    'house': ['h', 'aʊ', 's'],
    'computer': ['k', 'ə', 'm', 'ˈp', 'j', 'uː', 't', 'ə', 'r'],
    'beautiful': ['ˈb', 'j', 'uː', 't', 'ɪ', 'f', 'ə', 'l'],
    'difficult': ['ˈd', 'ɪ', 'f', 'ɪ', 'k', 'ə', 'l', 't'],
    'pronunciation': ['p', 'r', 'ə', 'ˌn', 'ʌ', 'n', 's', 'i', 'ˈeɪ', 'ʃ', 'ə', 'n'],
    'education': ['ˌe', 'd', 'j', 'ʊ', 'ˈk', 'eɪ', 'ʃ', 'ə', 'n'],
    'important': ['ɪ', 'm', 'ˈp', 'ɔː', 'r', 't', 'ə', 'n', 't'],
    'interesting': ['ˈɪ', 'n', 't', 'r', 'ə', 's', 't', 'ɪ', 'ŋ'],
    
    // Kids vocabulary words
    'rabbit': ['r', 'æ', 'b', 'ɪ', 't'],
    'forest': ['f', 'ɔː', 'r', 'ɪ', 's', 't'],
    'planet': ['p', 'l', 'æ', 'n', 'ɪ', 't'],
    'dinosaur': ['d', 'aɪ', 'n', 'ə', 's', 'ɔː', 'r'],
    'unicorn': ['j', 'uː', 'n', 'ɪ', 'k', 'ɔː', 'r', 'n'],
    'pirate': ['p', 'aɪ', 'r', 'ə', 't'],
    'treasure': ['t', 'r', 'ɛ', 'ʒ', 'ə', 'r'],
    'parrot': ['p', 'æ', 'r', 'ə', 't'],
    'superhero': ['s', 'uː', 'p', 'ə', 'r', 'h', 'ɪə', 'r', 'oʊ'],
    'rescue': ['r', 'ɛ', 's', 'k', 'j', 'uː'],
    'fairy': ['f', 'ɛː', 'r', 'i'],
    'magic': ['m', 'æ', 'dʒ', 'ɪ', 'k'],
    'moonflower': ['m', 'uː', 'n', 'f', 'l', 'aʊ', 'ə', 'r'],
    'sparkle': ['s', 'p', 'ɑː', 'r', 'k', 'ə', 'l'],
    'luna': ['l', 'uː', 'n', 'ə'],
    'happy': ['h', 'æ', 'p', 'i'],
    'big': ['b', 'ɪ', 'ɡ'],
    'rainbow': ['r', 'eɪ', 'n', 'b', 'oʊ'],
    'captain': ['k', 'æ', 'p', 't', 'ɪ', 'n'],
    'finn': ['f', 'ɪ', 'n'],
    'buried': ['b', 'ɛ', 'r', 'i', 'd'],
    'training': ['t', 'r', 'eɪ', 'n', 'ɪ', 'ŋ'],
    'mission': ['m', 'ɪ', 'ʃ', 'ə', 'n'],
    'dust': ['d', 'ʌ', 's', 't'],
    'talking': ['t', 'ɔː', 'k', 'ɪ', 'ŋ'],
    'bunnies': ['b', 'ʌ', 'n', 'i', 'z'],
    'glowing': ['ɡ', 'l', 'oʊ', 'ɪ', 'ŋ'],
    'moonflowers': ['m', 'uː', 'n', 'f', 'l', 'aʊ', 'ə', 'r', 'z']
  };

  // Common pronunciation issues and their patterns
  private commonErrors = [
    {
      pattern: /th/gi,
      phoneme: 'θ/ð',
      difficulty: 'high',
      tip: 'Place tongue between teeth and blow air gently'
    },
    {
      pattern: /r/gi,
      phoneme: 'r',
      difficulty: 'medium',
      tip: 'Curl tongue back without touching the roof of your mouth'
    },
    {
      pattern: /l/gi,
      phoneme: 'l',
      difficulty: 'medium',
      tip: 'Touch the tip of your tongue to the ridge behind your teeth'
    },
    {
      pattern: /v/gi,
      phoneme: 'v',
      difficulty: 'medium',
      tip: 'Touch your top teeth to your lower lip and vibrate'
    },
    {
      pattern: /w/gi,
      phoneme: 'w',
      difficulty: 'low',
      tip: 'Round your lips and make a sound from your throat'
    }
  ];

  /**
   * Score pronunciation with advanced phoneme analysis
   */
  async scoreDetailed(
    expectedText: string,
    spokenText: string,
    audioData?: Blob,
    _referenceAudio?: Blob
  ): Promise<DetailedPronunciationScore> {
    // Tokenize texts
    const expectedWords = this.tokenize(expectedText);
    const spokenWords = this.tokenize(spokenText);

    // Extract acoustic features if audio provided
    let acousticFeatures: AcousticFeatures | null = null;
    if (audioData) {
      acousticFeatures = await this.extractAcousticFeatures(audioData);
    }

    // Perform phoneme-level alignment
    const wordAlignments = await this.alignWords(expectedWords, spokenWords, acousticFeatures);

    // Calculate component scores
    const accuracy = this.calculatePhonemeAccuracy(wordAlignments);
    const fluency = this.calculateFluencyScore(spokenWords, acousticFeatures);
    const prosody = this.calculateProsodyScore(acousticFeatures);
    const clarity = this.calculateClarityScore(acousticFeatures, wordAlignments);
    const timing = this.calculateTimingScore(wordAlignments);

    // Overall score (weighted average)
    const overall = Math.round(
      accuracy * 0.35 +
      fluency * 0.25 +
      prosody * 0.20 +
      clarity * 0.10 +
      timing * 0.10
    );

    // Identify problem phonemes
    const problemPhonemes = this.identifyProblemPhonemes(wordAlignments);

    // Generate recommendations
    const recommendations = this.generateDetailedRecommendations(
      wordAlignments,
      problemPhonemes,
      { accuracy, fluency, prosody, clarity, timing }
    );

    // Calculate metrics
    const metrics = this.calculateSpeechMetrics(spokenText, audioData, acousticFeatures);

    return {
      overall,
      accuracy,
      fluency,
      prosody,
      clarity,
      timing,
      wordScores: wordAlignments,
      problemPhonemes,
      recommendations,
      metrics
    };
  }

  /**
   * Align words and phonemes between expected and spoken
   * Uses flexible matching for better accuracy with long phrases and single words
   * Enhanced for kids' pronunciations with better fuzzy matching
   */
  private async alignWords(
    expectedWords: string[],
    spokenWords: string[],
    _acousticFeatures: AcousticFeatures | null
  ): Promise<WordAlignment[]> {
    const alignments: WordAlignment[] = [];
    let currentTime = 0;
    let spokenIndex = 0;

    for (let i = 0; i < expectedWords.length; i++) {
      const expectedWord = expectedWords[i].toLowerCase().trim();
      
      // Try to find best matching spoken word using flexible matching
      let bestMatch = '';
      let bestScore = 0;
      let bestMatchIndex = -1;
      
      // For single words (Word Games), also check string similarity as fallback
      const isSingleWord = expectedWords.length === 1;
      
      // Look ahead up to 5 words for better matching (increased for longer phrases)
      const maxLookAhead = Math.max(5, Math.floor(expectedWords.length * 0.5));
      for (let j = spokenIndex; j < Math.min(spokenIndex + maxLookAhead, spokenWords.length); j++) {
        const spokenWord = spokenWords[j].toLowerCase().trim();
        
        // Calculate similarity score using phonemes
        const expectedPhonemes = this.getPhonemes(expectedWord);
        const spokenPhonemes = this.getPhonemes(spokenWord);
        let score = this.calculateWordSimilarity(expectedPhonemes, spokenPhonemes);
        
        // For single words, also check direct string similarity (fuzzy match)
        if (isSingleWord) {
          const stringSimilarity = this.calculateStringSimilarity(expectedWord, spokenWord);
          // Use the higher of the two scores (phoneme or string-based)
          score = Math.max(score, stringSimilarity * 0.9); // Weight string similarity slightly less
        }
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = spokenWord;
          bestMatchIndex = j;
        }
      }
      
      // Use best match or fall back to word at current index
      // More lenient threshold for single words (kids might have slight mispronunciations)
      const threshold = isSingleWord ? 0.5 : 0.3;
      
      let spokenWord = bestMatchIndex >= 0 ? bestMatch : (spokenWords[spokenIndex] || '');
      
      // If best match is poor but acceptable for kids, still use it
      if (bestMatchIndex >= 0 && bestScore < threshold && spokenIndex < spokenWords.length) {
        // For single words, be more lenient - accept if similarity > 0.4
        if (isSingleWord && bestScore >= 0.4) {
          spokenWord = bestMatch;
          spokenIndex = bestMatchIndex + 1;
        } else {
          // This might be an extra word in the transcription, skip it
          spokenWord = spokenWords[spokenIndex] || '';
        }
      } else if (bestMatchIndex >= spokenIndex) {
        spokenIndex = bestMatchIndex + 1;
      }

      // Get phonemes for expected word
      const expectedPhonemes = this.getPhonemes(expectedWord);
      const spokenPhonemes = this.getPhonemes(spokenWord);

      // Align phonemes
      const phonemeAlignments = this.alignPhonemes(
        expectedPhonemes,
        spokenPhonemes,
        currentTime
      );

      // Calculate word score
      const wordScore = this.scoreWord(expectedPhonemes, spokenPhonemes);

      // Estimate duration (average 0.3s per phoneme)
      const duration = phonemeAlignments.length * 0.3;

      alignments.push({
        word: expectedWord,
        start: currentTime,
        end: currentTime + duration,
        phonemes: phonemeAlignments,
        score: wordScore
      });

      currentTime += duration + 0.1; // Add 0.1s pause between words
    }

    return alignments;
  }

  /**
   * Calculate string similarity using Levenshtein distance
   * Useful for direct word matching when phonemes might differ
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    
    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;

    // Create matrix for dynamic programming
    const matrix: number[][] = Array(len1 + 1)
      .fill(null)
      .map(() => Array(len2 + 1).fill(0));

    // Initialize base cases
    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    // Fill matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // deletion
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);
    return 1 - distance / maxLen;
  }

  /**
   * Calculate similarity between two words based on their phonemes
   * Enhanced with better fuzzy matching for kids' pronunciations
   */
  private calculateWordSimilarity(expectedPhonemes: string[], spokenPhonemes: string[]): number {
    if (expectedPhonemes.length === 0 || spokenPhonemes.length === 0) return 0;
    
    // Use dynamic programming for flexible matching
    const dp: number[][] = Array(expectedPhonemes.length + 1)
      .fill(0)
      .map(() => Array(spokenPhonemes.length + 1).fill(0));
    
    // Initialize base cases with less penalty for kids
    for (let i = 1; i <= expectedPhonemes.length; i++) {
      dp[i][0] = dp[i-1][0] - 0.3; // Reduced penalty from -1 to -0.3
    }
    for (let j = 1; j <= spokenPhonemes.length; j++) {
      dp[0][j] = dp[0][j-1] - 0.3; // Reduced penalty from -1 to -0.3
    }
    
    // Fill DP table with improved matching
    for (let i = 1; i <= expectedPhonemes.length; i++) {
      for (let j = 1; j <= spokenPhonemes.length; j++) {
        const match = this.phonemeSimilarity(expectedPhonemes[i-1], spokenPhonemes[j-1]);
        dp[i][j] = Math.max(
          dp[i-1][j-1] + match,
          dp[i-1][j] - 0.2, // Reduced penalty from -0.5 to -0.2
          dp[i][j-1] - 0.2  // Reduced penalty from -0.5 to -0.2
        );
      }
    }
    
    // Normalize to 0-1 range with bonus for partial matches
    const maxScore = Math.max(expectedPhonemes.length, spokenPhonemes.length);
    const rawScore = dp[expectedPhonemes.length][spokenPhonemes.length];
    const normalized = Math.max(0, rawScore / maxScore);
    
    // Bonus if lengths are similar (kids might add/remove sounds but still be understood)
    const lengthRatio = Math.min(expectedPhonemes.length, spokenPhonemes.length) / 
                       Math.max(expectedPhonemes.length, spokenPhonemes.length);
    if (lengthRatio > 0.7) {
      return Math.min(1.0, normalized + 0.1 * lengthRatio);
    }
    
    return normalized;
  }

  /**
   * Align phonemes between expected and spoken
   */
  private alignPhonemes(
    expectedPhonemes: string[],
    spokenPhonemes: string[],
    startTime: number
  ): PhonemeAlignment[] {
    const alignments: PhonemeAlignment[] = [];
    const avgDuration = 0.1; // Average phoneme duration in seconds

    for (let i = 0; i < expectedPhonemes.length; i++) {
      const expected = expectedPhonemes[i];
      const spoken = spokenPhonemes[i] || '';

      // Calculate confidence based on similarity
      const confidence = expected === spoken ? 1.0 : this.phonemeSimilarity(expected, spoken);

      alignments.push({
        phoneme: expected,
        start: startTime + i * avgDuration,
        end: startTime + (i + 1) * avgDuration,
        duration: avgDuration,
        confidence
      });
    }

    return alignments;
  }

  /**
   * Get phonemes for a word
   */
  private getPhonemes(word: string): string[] {
    const normalized = word.toLowerCase().trim();
    
    if (this.phonemeDict[normalized]) {
      return this.phonemeDict[normalized];
    }

    // Fallback: simple grapheme-to-phoneme
    return this.graphemeToPhoneme(normalized);
  }

  /**
   * Simple grapheme-to-phoneme conversion (fallback)
   */
  private graphemeToPhoneme(word: string): string[] {
    const phonemeMap: Record<string, string> = {
      'a': 'æ', 'e': 'ɛ', 'i': 'ɪ', 'o': 'ɑ', 'u': 'ʌ',
      'b': 'b', 'c': 'k', 'd': 'd', 'f': 'f', 'g': 'ɡ',
      'h': 'h', 'j': 'dʒ', 'k': 'k', 'l': 'l', 'm': 'm',
      'n': 'n', 'p': 'p', 'q': 'k', 'r': 'r', 's': 's',
      't': 't', 'v': 'v', 'w': 'w', 'x': 'ks', 'y': 'j', 'z': 'z'
    };

    return word.split('').map(char => phonemeMap[char.toLowerCase()] || char);
  }

  /**
   * Calculate phoneme similarity
   */
  private phonemeSimilarity(p1: string, p2: string): number {
    if (p1 === p2) return 1.0;
    if (!p1 || !p2) return 0.0;

    // Group similar phonemes
    const similarGroups = [
      ['p', 'b'], ['t', 'd'], ['k', 'ɡ'], // Stops
      ['f', 'v'], ['θ', 'ð'], ['s', 'z'], // Fricatives
      ['m', 'n', 'ŋ'], // Nasals
      ['l', 'r'], // Liquids
      ['i', 'ɪ'], ['u', 'ʊ'], ['e', 'ɛ'], ['o', 'ɔ'] // Vowels
    ];

    for (const group of similarGroups) {
      if (group.includes(p1) && group.includes(p2)) {
        return 0.7; // Similar phonemes
      }
    }

    return 0.3; // Different phonemes
  }

  /**
   * Score a word based on phoneme accuracy
   * Enhanced with better matching for kids' pronunciations
   */
  private scoreWord(expected: string[], spoken: string[]): number {
    if (expected.length === 0) return 0;

    // Use the improved word similarity method which uses dynamic programming
    const similarity = this.calculateWordSimilarity(expected, spoken);
    
    // Convert similarity (0-1) to score (0-100)
    let score = Math.round(similarity * 100);
    
    // Additional bonus for single words (common in Word Games)
    // Kids might have slight variations but if the core word is recognized, give bonus
    if (expected.length <= 5 && spoken.length > 0) {
      // For short words, be more lenient
      const lengthMatch = Math.min(expected.length, spoken.length) / 
                         Math.max(expected.length, spoken.length);
      if (lengthMatch > 0.6 && similarity > 0.5) {
        // Give bonus if length is similar and similarity is decent
        score = Math.min(100, score + 10);
      }
    }
    
    return score;
  }

  /**
   * Calculate phoneme accuracy score
   */
  private calculatePhonemeAccuracy(alignments: WordAlignment[]): number {
    if (alignments.length === 0) return 0;

    const totalScore = alignments.reduce((sum, word) => sum + word.score, 0);
    return Math.round(totalScore / alignments.length);
  }

  /**
   * Calculate fluency score
   */
  private calculateFluencyScore(
    words: string[],
    acousticFeatures: AcousticFeatures | null
  ): number {
    const wordCount = words.length;

    // Base fluency on word count
    let score = 50;

    if (wordCount >= 5) score += 10;
    if (wordCount >= 10) score += 10;
    if (wordCount >= 15) score += 10;
    if (wordCount >= 20) score += 10;

    // Bonus for acoustic consistency (if available)
    if (acousticFeatures) {
      const energyVariance = this.calculateVariance(acousticFeatures.energy);
      if (energyVariance < 0.3) score += 10; // Consistent energy = better fluency
    }

    return Math.min(100, score);
  }

  /**
   * Calculate prosody (intonation) score
   */
  private calculateProsodyScore(acousticFeatures: AcousticFeatures | null): number {
    if (!acousticFeatures || !acousticFeatures.pitch.length) {
      return 70; // Default score
    }

    let score = 60;

    // Check for pitch variation (good intonation has variation)
    const pitchVariance = this.calculateVariance(acousticFeatures.pitch);
    if (pitchVariance > 0.1 && pitchVariance < 0.5) {
      score += 20; // Good pitch variation
    } else if (pitchVariance > 0.05) {
      score += 10; // Some variation
    }

    // Check for pitch range
    const pitchRange = Math.max(...acousticFeatures.pitch) - Math.min(...acousticFeatures.pitch);
    if (pitchRange > 50) {
      score += 10; // Good dynamic range
    }

    // Energy modulation
    const energyVariance = this.calculateVariance(acousticFeatures.energy);
    if (energyVariance > 0.1 && energyVariance < 0.4) {
      score += 10; // Good energy modulation
    }

    return Math.min(100, score);
  }

  /**
   * Calculate clarity score
   */
  private calculateClarityScore(
    acousticFeatures: AcousticFeatures | null,
    alignments: WordAlignment[]
  ): number {
    let score = 70; // Base score

    // Check phoneme confidence
    const avgConfidence = alignments.reduce((sum, word) => {
      const wordConfidence = word.phonemes.reduce((s, p) => s + p.confidence, 0) / word.phonemes.length;
      return sum + wordConfidence;
    }, 0) / alignments.length;

    score = Math.round(avgConfidence * 100);

    // Bonus for clear acoustic features
    if (acousticFeatures) {
      const avgEnergy = this.average(acousticFeatures.energy);
      if (avgEnergy > 0.5) score += 10; // Sufficient volume
    }

    return Math.min(100, score);
  }

  /**
   * Calculate timing score
   */
  private calculateTimingScore(alignments: WordAlignment[]): number {
    if (alignments.length === 0) return 70;

    let score = 70;

    // Check for consistent timing
    const durations = alignments.map(w => w.end - w.start);
    const avgDuration = this.average(durations);
    const variance = this.calculateVariance(durations);

    // Prefer consistent duration (low variance)
    if (variance < 0.1) {
      score += 15;
    } else if (variance < 0.2) {
      score += 10;
    }

    // Check for appropriate speech rate
    if (avgDuration > 0.2 && avgDuration < 0.5) {
      score += 15; // Good pacing
    }

    return Math.min(100, score);
  }

  /**
   * Identify problem phonemes
   */
  private identifyProblemPhonemes(alignments: WordAlignment[]): string[] {
    const problemPhonemes = new Set<string>();

    for (const word of alignments) {
      for (const phoneme of word.phonemes) {
        if (phoneme.confidence < 0.7) {
          problemPhonemes.add(phoneme.phoneme);
        }
      }
    }

    return Array.from(problemPhonemes);
  }

  /**
   * Generate detailed recommendations
   */
  private generateDetailedRecommendations(
    alignments: WordAlignment[],
    problemPhonemes: string[],
    scores: { accuracy: number; fluency: number; prosody: number; clarity: number; timing: number }
  ): string[] {
    const recommendations: string[] = [];

    // Accuracy recommendations
    if (scores.accuracy < 70) {
      recommendations.push('Focus on pronouncing each sound clearly and accurately');
      
      // Specific phoneme tips
      for (const phoneme of problemPhonemes.slice(0, 3)) {
        const error = this.commonErrors.find(e => e.phoneme.includes(phoneme));
        if (error) {
          recommendations.push(`"${phoneme}" sound: ${error.tip}`);
        }
      }
    }

    // Fluency recommendations
    if (scores.fluency < 70) {
      recommendations.push('Practice speaking at a steady, natural pace');
      recommendations.push('Read the sentence aloud multiple times to build fluency');
    }

    // Prosody recommendations
    if (scores.prosody < 70) {
      recommendations.push('Add more intonation - let your voice rise and fall naturally');
      recommendations.push('Emphasize important words in the sentence');
    }

    // Clarity recommendations
    if (scores.clarity < 70) {
      recommendations.push('Speak more clearly - open your mouth wider');
      recommendations.push('Increase your volume slightly for better clarity');
    }

    // Timing recommendations
    if (scores.timing < 70) {
      recommendations.push('Work on consistent word timing and pacing');
      recommendations.push('Use a metronome to practice steady rhythm');
    }

    // Word-specific recommendations
    const poorWords = alignments.filter(w => w.score < 60);
    if (poorWords.length > 0) {
      const wordList = poorWords.slice(0, 3).map(w => w.word).join(', ');
      recommendations.push(`Practice these words: ${wordList}`);
    }

    // If everything is good
    if (recommendations.length === 0) {
      recommendations.push('Excellent pronunciation! Keep up the great work!');
      recommendations.push('Try practicing with longer, more complex sentences');
    }

    return recommendations;
  }

  /**
   * Calculate speech metrics
   */
  private calculateSpeechMetrics(
    text: string,
    audioData: Blob | undefined,
    _acousticFeatures: AcousticFeatures | null
  ): DetailedPronunciationScore['metrics'] {
    const words = this.tokenize(text);
    const wordCount = words.length;

    // Estimate durations (if audio not available)
    const estimatedDuration = wordCount * 0.5; // 0.5s per word average
    const speechDuration = audioData ? estimatedDuration : estimatedDuration;
    const totalDuration = speechDuration * 1.2; // Add pauses

    // Estimate speech rate (words per minute)
    const speechRate = Math.round((wordCount / totalDuration) * 60);

    // Estimate pauses
    const pauseCount = Math.max(0, Math.floor(wordCount / 5)); // Pause every ~5 words
    const averagePauseDuration = 0.3; // 300ms average pause

    return {
      speechRate,
      pauseCount,
      averagePauseDuration,
      speechDuration,
      totalDuration
    };
  }

  /**
   * Extract acoustic features from audio (placeholder)
   */
  private async extractAcousticFeatures(_audioData: Blob): Promise<AcousticFeatures> {
    try {
      // In production, this would use Web Audio API for feature extraction
      // For now, generate placeholder features
      
      const sampleCount = 100;
      const pitch: number[] = Array.from({ length: sampleCount }, () => 100 + Math.random() * 100);
      const energy: number[] = Array.from({ length: sampleCount }, () => 0.3 + Math.random() * 0.4);
      const mfcc: number[][] = Array.from({ length: 13 }, () => 
        Array.from({ length: sampleCount }, () => Math.random() * 2 - 1)
      );
      const formants: number[][] = Array.from({ length: 3 }, () =>
        Array.from({ length: sampleCount }, () => 500 + Math.random() * 2000)
      );

      return { pitch, energy, mfcc, formants };
    } catch (error) {
      console.error('Failed to extract acoustic features:', error);
      return { pitch: [], energy: [], mfcc: [], formants: [] };
    }
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
   * Calculate average of array
   */
  private average(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  /**
   * Calculate variance of array
   */
  private calculateVariance(arr: number[]): number {
    if (arr.length === 0) return 0;
    const avg = this.average(arr);
    const squaredDiffs = arr.map(val => Math.pow(val - avg, 2));
    return this.average(squaredDiffs);
  }

  /**
   * Add custom phoneme mapping
   */
  addPhonemeMapping(word: string, phonemes: string[]): void {
    this.phonemeDict[word.toLowerCase()] = phonemes;
  }

  /**
   * Bulk add phoneme mappings
   */
  addPhonemeMappings(mappings: Record<string, string[]>): void {
    Object.entries(mappings).forEach(([word, phonemes]) => {
      this.phonemeDict[word.toLowerCase()] = phonemes;
    });
  }

  /**
   * Score pronunciation for kids - SIMPLIFIED
   * Just returns a simple score based on string matching, no complex analysis
   */
  async scoreForKids(
    expectedText: string,
    spokenText: string,
    _audioData?: Blob
  ): Promise<DetailedPronunciationScore> {
    // Simplified scoring for kids - just use string similarity
    const expectedWords = this.tokenize(expectedText);
    const spokenWords = this.tokenize(spokenText);
    const isSingleWord = expectedWords.length === 1;
    
    let overallScore = 0;
    
    // Calculate simple similarity score
    if (isSingleWord && spokenWords.length > 0) {
      const expectedWord = expectedWords[0].toLowerCase().trim();
      const spokenWord = spokenWords[0].toLowerCase().trim();
      
      if (expectedWord === spokenWord) {
        overallScore = 100;
      } else {
        const similarity = this.calculateStringSimilarity(expectedWord, spokenWord);
        overallScore = Math.round(similarity * 100);
      }
    } else {
      // For phrases, check word matching
      const matchingWords = expectedWords.filter(ew => {
        const ewLower = ew.toLowerCase();
        return spokenText.toLowerCase().includes(ewLower) ||
               spokenWords.some(sw => this.calculateStringSimilarity(ewLower, sw.toLowerCase()) >= 0.60);
      });
      const matchRatio = matchingWords.length / expectedWords.length;
      overallScore = Math.round(matchRatio * 100);
    }
    
    // If similarity check passed, give high score
    const fullSimilarity = this.calculateStringSimilarity(
      expectedText.toLowerCase().trim(),
      spokenText.toLowerCase().trim()
    );
    if (fullSimilarity > 0.60) {
      overallScore = Math.max(overallScore, Math.round(fullSimilarity * 100));
    }
    
    // Return simplified score structure
    return {
      overall: Math.min(100, overallScore),
      accuracy: overallScore,
      fluency: 80, // Default good fluency for kids
      prosody: 80, // Default good prosody
      clarity: 80, // Default good clarity
      timing: 80, // Default good timing
      wordScores: [],
      problemPhonemes: [],
      recommendations: overallScore >= 80 
        ? ['🌟 Great job! You said it correctly!'] 
        : ['👍 Good try! Keep practicing!'],
      metrics: {
        speechRate: 120,
        pauseCount: 0,
        averagePauseDuration: 0,
        speechDuration: 1,
        totalDuration: 1
      }
    };
  }


  /**
   * Quick check if pronunciation is correct for kids (used for auto-stop)
   * VERY LENIENT for kids - accepts even partial matches
   */
  async isCorrectForKids(expectedText: string, spokenText: string, _audioData?: Blob): Promise<boolean> {
    // Normalize inputs
    const expectedWords = this.tokenize(expectedText);
    const spokenWords = this.tokenize(spokenText);
    const isSingleWord = expectedWords.length === 1;
    
    // If no transcript, we can't determine correctness
    if (!spokenText || spokenText.trim().length === 0) {
      console.log('⚠️ No transcript provided for matching');
      return false;
    }
    
    const expectedLower = expectedText.toLowerCase().trim();
    const spokenLower = spokenText.toLowerCase().trim();
    
    console.log(`🔍 Matching: expected="${expectedText}" vs spoken="${spokenText}"`);
    
    // 1. Check exact match (case-insensitive)
    if (expectedLower === spokenLower) {
      console.log(`✅ Exact match: "${spokenText}" matches "${expectedText}"`);
      return true;
    }
    
    // 2. Check if transcript contains the target word/phrase (or vice versa)
    if (spokenLower.includes(expectedLower) || expectedLower.includes(spokenLower)) {
      console.log(`✅ Contains match: "${expectedText}" found in "${spokenText}"`);
      return true;
    }
    
    // 3. For single words, check direct string similarity (VERY lenient - 50% threshold)
    if (isSingleWord && spokenWords.length > 0) {
      const expectedWord = expectedWords[0].toLowerCase().trim();
      const spokenWord = spokenWords[0].toLowerCase().trim();
      
      // Quick string similarity check - VERY lenient for kids (50% threshold)
      const stringSimilarity = this.calculateStringSimilarity(expectedWord, spokenWord);
      console.log(`📊 Similarity: "${spokenWord}" vs "${expectedWord}" = ${(stringSimilarity * 100).toFixed(1)}%`);
      
      if (stringSimilarity >= 0.50) {
        console.log(`✅ Similarity match: "${spokenWord}" matches "${expectedWord}" (${(stringSimilarity * 100).toFixed(1)}%)`);
        return true;
      }
      
      // Check if any spoken word is similar enough
      for (const word of spokenWords) {
        const wordLower = word.toLowerCase().trim();
        const sim = this.calculateStringSimilarity(expectedWord, wordLower);
        if (sim >= 0.50) {
          console.log(`✅ Word match: "${word}" matches "${expectedWord}" (${(sim * 100).toFixed(1)}%)`);
          return true;
        }
      }
      
      // Check first 2-3 characters match (for partial words - VERY lenient for kids)
      if (expectedWord.length >= 2 && spokenWord.length >= 2) {
        const firstChars = Math.min(2, Math.min(expectedWord.length, spokenWord.length));
        const expectedPrefix = expectedWord.substring(0, firstChars);
        const spokenPrefix = spokenWord.substring(0, firstChars);
        if (expectedPrefix === spokenPrefix) {
          console.log(`✅ Prefix match: "${spokenWord}" starts with "${expectedPrefix}"`);
          return true;
        }
      }
      
      // Check if any part of the word matches (even more lenient)
      if (expectedWord.length >= 3) {
        for (let i = 0; i <= expectedWord.length - 2; i++) {
          const substring = expectedWord.substring(i, i + 2);
          if (spokenWord.includes(substring)) {
            console.log(`✅ Substring match: "${spokenWord}" contains "${substring}" from "${expectedWord}"`);
            return true;
          }
        }
      }
    }
    
    // 4. For phrases, check if most key words are present (VERY lenient - 50% threshold)
    if (expectedWords.length > 1) {
      const matchingWords = expectedWords.filter(ew => {
        const ewLower = ew.toLowerCase();
        return spokenLower.includes(ewLower) || 
               spokenWords.some(sw => {
                 const swLower = sw.toLowerCase();
                 return swLower.includes(ewLower) || 
                        this.calculateStringSimilarity(ewLower, swLower) >= 0.50;
               });
      });
      
      // If 50% of words match, consider it correct (VERY lenient for kids)
      const matchRatio = matchingWords.length / expectedWords.length;
      console.log(`📊 Phrase match ratio: ${matchingWords.length}/${expectedWords.length} = ${(matchRatio * 100).toFixed(1)}%`);
      if (matchRatio >= 0.50) {
        console.log(`✅ Phrase match: ${matchingWords.length}/${expectedWords.length} words matched (${(matchRatio * 100).toFixed(1)}%)`);
        return true;
      }
    }
    
    // 5. Final fallback: simple string similarity on full text (VERY lenient - 50% threshold)
    const fullSimilarity = this.calculateStringSimilarity(expectedLower, spokenLower);
    console.log(`📊 Full text similarity: ${(fullSimilarity * 100).toFixed(1)}%`);
    if (fullSimilarity >= 0.50) {
      console.log(`✅ Full text similarity match: ${(fullSimilarity * 100).toFixed(1)}%`);
      return true;
    }
    
    console.log(`❌ No match found: expected="${expectedText}" vs spoken="${spokenText}"`);
    return false;
  }
}

// Singleton instance
export const AdvancedPronunciationScorer = new AdvancedPronunciationScorerClass();
export default AdvancedPronunciationScorer;

