/*
  EnhancedTTS: Advanced text-to-speech with multiple voices and emotions
  Uses Web Speech API with enhanced voice selection and prosody control
*/

export interface Voice {
  id: string;
  name: string;
  lang: string;
  gender: 'male' | 'female' | 'neutral';
  age: 'child' | 'adult' | 'senior';
  quality: 'standard' | 'premium';
}

export interface TTSOptions {
  voice?: string; // Voice ID
  rate?: number; // 0.1 - 10 (default 1)
  pitch?: number; // 0 - 2 (default 1)
  volume?: number; // 0 - 1 (default 1)
  emotion?: 'neutral' | 'happy' | 'sad' | 'excited' | 'calm';
  emphasis?: string[]; // Words to emphasize
}

class EnhancedTTSClass {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private customVoices: Voice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();

      // Voices load asynchronously in some browsers
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  /**
   * Load available voices
   */
  private loadVoices(): void {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    this.categorizeVoices();
  }

  /**
   * Categorize voices by characteristics
   */
  private categorizeVoices(): void {
    this.customVoices = this.voices.map((voice, index) => {
      // Detect gender from voice name (heuristic)
      const nameLower = voice.name.toLowerCase();
      let gender: 'male' | 'female' | 'neutral' = 'neutral';
      
      if (nameLower.includes('female') || nameLower.includes('woman') || 
          nameLower.includes('samantha') || nameLower.includes('victoria')) {
        gender = 'female';
      } else if (nameLower.includes('male') || nameLower.includes('man') || 
                 nameLower.includes('daniel') || nameLower.includes('alex')) {
        gender = 'male';
      }

      // Detect age (simplified)
      const age: 'child' | 'adult' | 'senior' = 
        nameLower.includes('child') || nameLower.includes('kid') ? 'child' : 'adult';

      // Detect quality
      const quality: 'standard' | 'premium' = 
        voice.localService ? 'premium' : 'standard';

      return {
        id: `voice-${index}`,
        name: voice.name,
        lang: voice.lang,
        gender,
        age,
        quality
      };
    });
  }

  /**
   * Get all available voices
   */
  getVoices(): Voice[] {
    return this.customVoices;
  }

  /**
   * Get voices filtered by criteria
   */
  getVoicesByFilter(filter: {
    lang?: string;
    gender?: 'male' | 'female' | 'neutral';
    age?: 'child' | 'adult' | 'senior';
  }): Voice[] {
    return this.customVoices.filter(voice => {
      if (filter.lang && !voice.lang.startsWith(filter.lang)) return false;
      if (filter.gender && voice.gender !== filter.gender) return false;
      if (filter.age && voice.age !== filter.age) return false;
      return true;
    });
  }

  /**
   * Get recommended voice for user level
   */
  getRecommendedVoice(userLevel: 'beginner' | 'intermediate' | 'advanced'): Voice | null {
    // For beginners, use slower, clearer voices
    if (userLevel === 'beginner') {
      const voices = this.getVoicesByFilter({ lang: 'en', gender: 'female' });
      return voices[0] || this.customVoices[0] || null;
    }

    // For intermediate/advanced, use natural voices
    const voices = this.getVoicesByFilter({ lang: 'en' });
    return voices[0] || this.customVoices[0] || null;
  }

  /**
   * Speak text with enhanced options
   */
  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    if (!this.synth) {
      throw new Error('Speech synthesis not supported');
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    // Process text for emphasis
    const processedText = this.processText(text, options);

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(processedText);

      // Set voice
      if (options.voice) {
        const voiceIndex = parseInt(options.voice.replace('voice-', ''));
        if (this.voices[voiceIndex]) {
          utterance.voice = this.voices[voiceIndex];
        }
      }

      // Set prosody based on emotion
      const prosody = this.getEmotionProsody(options.emotion);
      utterance.rate = options.rate ?? prosody.rate;
      utterance.pitch = options.pitch ?? prosody.pitch;
      utterance.volume = options.volume ?? 1;

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      this.synth!.speak(utterance);
    });
  }

  /**
   * Process text for emphasis and emotion
   */
  private processText(text: string, options: TTSOptions): string {
    let processed = text;

    // Add SSML-like emphasis (browsers that support it)
    if (options.emphasis && options.emphasis.length > 0) {
      options.emphasis.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        // Some browsers support SSML tags
        processed = processed.replace(regex, `<emphasis>${word}</emphasis>`);
      });
    }

    return processed;
  }

  /**
   * Get prosody settings for emotion
   */
  private getEmotionProsody(emotion?: string): { rate: number; pitch: number } {
    switch (emotion) {
      case 'happy':
      case 'excited':
        return { rate: 1.1, pitch: 1.2 };
      case 'sad':
        return { rate: 0.9, pitch: 0.8 };
      case 'calm':
        return { rate: 0.95, pitch: 1.0 };
      default:
        return { rate: 1.0, pitch: 1.0 };
    }
  }

  /**
   * Speak with word-by-word highlighting (for reading practice)
   */
  async speakWithHighlight(
    text: string,
    onWordHighlight: (word: string, index: number) => void,
    options: TTSOptions = {}
  ): Promise<void> {
    if (!this.synth) {
      throw new Error('Speech synthesis not supported');
    }

    const words = text.split(/\s+/);
    
    for (let i = 0; i < words.length; i++) {
      onWordHighlight(words[i], i);
      await this.speak(words[i], options);
      await new Promise(resolve => setTimeout(resolve, 100)); // Pause between words
    }
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  /**
   * Pause current speech
   */
  pause(): void {
    if (this.synth) {
      this.synth.pause();
    }
  }

  /**
   * Resume paused speech
   */
  resume(): void {
    if (this.synth) {
      this.synth.resume();
    }
  }

  /**
   * Check if speaking
   */
  isSpeaking(): boolean {
    return this.synth?.speaking || false;
  }

  /**
   * Check if paused
   */
  isPaused(): boolean {
    return this.synth?.paused || false;
  }

  /**
   * Check if TTS is supported
   */
  isSupported(): boolean {
    return this.synth !== null;
  }
}

// Singleton instance
export const EnhancedTTS = new EnhancedTTSClass();
export default EnhancedTTS;

