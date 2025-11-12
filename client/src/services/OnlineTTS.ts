/**
 * OnlineTTS Service
 * 
 * Provides online-only text-to-speech using Web Speech API
 * with unique voice profiles for each of the 8 stories.
 * 
 * Features:
 * - 8 unique voice profiles for different story characters
 * - Web Speech API only (no offline models)
 * - Adjustable playback speed
 * - Caption support
 * - Character-specific voice settings
 */

export interface VoiceProfile {
  name: string;
  pitch: number;      // 0-2 (default 1)
  rate: number;       // 0.1-10 (default 1)
  volume: number;     // 0-1 (default 1)
  voiceName?: string; // Specific browser voice name
  description: string;
}

export interface PlaybackOptions {
  speed?: 'normal' | 'slow' | 'slower';
  showCaptions?: boolean;
  onCaptionUpdate?: (text: string) => void;
}

export class OnlineTTS {
  private static synth: SpeechSynthesis | null = null;
  private static voices: SpeechSynthesisVoice[] = [];
  private static isInitialized = false;
  private static isStopping = false; // Track if we're intentionally stopping

  /**
   * Initialize the TTS service
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();

      // Voices load asynchronously in some browsers
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }

      this.isInitialized = true;
      console.log('✅ OnlineTTS initialized with Web Speech API');
    } else {
      throw new Error('Speech synthesis not supported in this browser');
    }
  }

  /**
   * Load available voices from the browser
   */
  private static loadVoices(): void {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    console.log(`📢 Loaded ${this.voices.length} browser voices`);
  }

  /**
   * Check if TTS is available
   */
  static isAvailable(): boolean {
    return this.isInitialized && this.synth !== null;
  }

  /**
   * Get adjusted playback rate based on speed setting
   */
  private static getAdjustedRate(baseRate: number, speed: 'normal' | 'slow' | 'slower'): number {
    switch (speed) {
      case 'slow': return baseRate * 0.7;    // 30% slower
      case 'slower': return baseRate * 0.5;  // 50% slower
      default: return baseRate;               // Normal speed
    }
  }

  /**
   * Get list of available voices for debugging
   */
  static getAvailableVoices(): SpeechSynthesisVoice[] {
    return [...this.voices];
  }

  /**
   * Log available voices for debugging
   */
  static logAvailableVoices(): void {
    console.log('📢 Available voices:');
    this.voices.forEach((voice, index) => {
      console.log(`${index + 1}. ${voice.name} (${voice.lang}) - ${(voice as any).gender || 'unknown'} - ${voice.localService ? 'local' : 'remote'}`);
    });
    
    // Check for specific voices we need
    const microsoftVoices = this.voices.filter(v => v.name.toLowerCase().includes('microsoft'));
    const markVoices = this.voices.filter(v => v.name.toLowerCase().includes('mark'));
    const ziraVoices = this.voices.filter(v => v.name.toLowerCase().includes('zira'));
    const davidVoices = this.voices.filter(v => v.name.toLowerCase().includes('david'));
    
    console.log('🎯 Voice availability check:');
    console.log(`   Microsoft voices: ${microsoftVoices.length} (${microsoftVoices.map(v => v.name).join(', ')})`);
    console.log(`   Mark voices: ${markVoices.length} (${markVoices.map(v => v.name).join(', ')})`);
    console.log(`   Zira voices: ${ziraVoices.length} (${ziraVoices.map(v => v.name).join(', ')})`);
    console.log(`   David voices: ${davidVoices.length} (${davidVoices.map(v => v.name).join(', ')})`);
    
    if (microsoftVoices.length === 0) {
      console.warn('⚠️ No Microsoft voices found! Stories will use generic Web Speech API voices.');
    }
  }

  /**
   * Get current voice mode
   */
  static getVoiceMode(): string {
    return 'Online (Web Speech API)';
  }

  /**
   * Stop/cancel any currently playing speech
   */
  static stop(): void {
    if (this.synth) {
      this.isStopping = true; // Mark that we're intentionally stopping
      this.synth.cancel();
      // Reset the flag after a short delay to allow error handlers to see it
      setTimeout(() => {
        this.isStopping = false;
      }, 100);
    }
  }

  /**
   * Strip emojis from text before TTS
   */
  private static stripEmojis(text: string): string {
    // Remove all emoji characters and emoji-related text
    return text
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols and Pictographs
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
      .replace(/[\u{2600}-\u{26FF}]/gu, '') // Misc symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, '') // Dingbats
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols and Pictographs
      .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess Symbols
      .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols and Pictographs Extended-A
      .replace(/[\u{FE00}-\u{FE0F}]/gu, '') // Variation Selectors
      .replace(/[\u{E0020}-\u{E007F}]/gu, '') // Tag Characters
      .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  /**
   * Speak text using a specific voice profile
   */
  static async speak(
    text: string,
    voiceProfile: VoiceProfile,
    options?: PlaybackOptions
  ): Promise<void> {
    if (!this.isInitialized || !this.synth) {
      throw new Error('TTS not initialized');
    }

    // Strip emojis from text before speaking
    const cleanText = this.stripEmojis(text);
    
    if (!cleanText) {
      console.warn('⚠️ Text is empty after emoji removal, skipping TTS');
      return Promise.resolve();
    }

    const speed = options?.speed || 'normal';
    const adjustedRate = this.getAdjustedRate(voiceProfile.rate, speed);

    // Show caption if requested (use original text for display, but speak clean text)
    if (options?.showCaptions && options?.onCaptionUpdate) {
      options.onCaptionUpdate(text);
    }

    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech gracefully
      this.isStopping = true;
      this.synth!.cancel();
      // Reset the flag after a short delay
      setTimeout(() => {
        this.isStopping = false;
      }, 50);

      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      // Set voice if specified - with fallback logic
      if (voiceProfile.voiceName) {
        console.log(`🎤 Voice selection for ${voiceProfile.name}:`, {
          targetVoice: voiceProfile.voiceName,
          availableVoices: this.voices.length,
          voiceProfile: voiceProfile
        });
        
        // Try exact match first
        let voice = this.voices.find(v => v.name === voiceProfile.voiceName);
        
        // If exact match not found, try partial match
        if (!voice) {
          voice = this.voices.find(v => 
            v.name.toLowerCase().includes(voiceProfile.voiceName!.toLowerCase()) ||
            voiceProfile.voiceName!.toLowerCase().includes(v.name.toLowerCase())
          );
        }
        
        // If still not found, try to find a similar voice by gender/age
        if (!voice) {
          const targetName = voiceProfile.voiceName.toLowerCase();
          if (targetName.includes('female') || targetName.includes('woman') || targetName.includes('zira') || targetName.includes('susan')) {
            voice = this.voices.find(v => v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('susan') || v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman'));
          } else if (targetName.includes('male') || targetName.includes('man') || targetName.includes('mark') || targetName.includes('david')) {
            voice = this.voices.find(v => v.name.toLowerCase().includes('mark') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('man'));
          }
        }
        
        // If still not found, try to find ANY Microsoft voice as fallback
        if (!voice && this.voices.length > 0) {
          // Try to find any Microsoft voice first
          voice = this.voices.find(v => v.name.toLowerCase().includes('microsoft'));
          
          // If no Microsoft voice, try to find any English voice
          if (!voice) {
            voice = this.voices.find(v => v.lang.startsWith('en'));
          }
          
          // Last resort: use first available voice
          if (!voice) {
            voice = this.voices[0];
          }
          
          console.log(`🔄 Using fallback voice: ${voice.name} for ${voiceProfile.name}`, {
            reason: voice.name.toLowerCase().includes('microsoft') ? 'Microsoft voice found' : 
                   voice.lang.startsWith('en') ? 'English voice found' : 'First available voice'
          });
        }
        
        if (voice) {
          utterance.voice = voice;
          console.log(`✅ Voice selected: ${voice.name} for ${voiceProfile.name}`, {
            voiceName: voice.name,
            voiceLang: voice.lang,
            voiceLocalService: voice.localService,
            targetVoice: voiceProfile.voiceName,
            isExactMatch: voice.name === voiceProfile.voiceName,
            isMicrosoftVoice: voice.name.toLowerCase().includes('microsoft'),
            isGoogleVoice: voice.name.toLowerCase().includes('google')
          });
        } else {
          console.warn(`⚠️ Voice "${voiceProfile.voiceName}" not found, using default voice for ${voiceProfile.name}`);
          console.log('Available voices:', this.voices.map(v => v.name));
        }
      } else {
        console.log(`🎤 No specific voice requested for ${voiceProfile.name}, using default`);
      }

      // Set voice parameters
      utterance.pitch = voiceProfile.pitch;
      utterance.rate = adjustedRate;
      utterance.volume = voiceProfile.volume;
      utterance.lang = 'en-US';

      utterance.onend = () => {
        // Clear caption after delay
        if (options?.showCaptions && options?.onCaptionUpdate) {
          setTimeout(() => options.onCaptionUpdate?.(''), 500);
        }
        resolve();
      };

      utterance.onerror = (error) => {
        // Check if this is an expected interruption from our stop() call
        if (this.isStopping && (error.error === 'interrupted' || error.error === 'canceled')) {
          // This is an expected interruption, don't log as error
          console.log('🔄 TTS intentionally stopped');
          resolve(); // Don't reject, just resolve
          return;
        }
        
        // Log genuine errors
        console.error('TTS error:', error);
        console.error('TTS error details:', {
          error: error.error,
          type: error.type,
          charIndex: error.charIndex,
            utterance: cleanText.substring(0, 100) + '...'
        });
        
        // Try to recover from common TTS errors
        if (error.error === 'interrupted' || error.error === 'canceled') {
          console.log('🔄 TTS was interrupted or canceled, this is usually recoverable');
          resolve(); // Don't reject, just resolve
        } else {
          reject(error);
        }
      };

      this.synth!.speak(utterance);
    });
  }

}

/**
 * Story Character Voice Profiles
 * Each of the 8 stories uses actual Google/Microsoft voices
 */
export const STORY_VOICES: Record<string, VoiceProfile> = {
  // 1. Magic Forest Adventure - Luna (cheerful 6-year-old girl)
  Luna: {
    name: 'Luna',
    pitch: 1.6,        // Higher pitch for sweet, young girl
    rate: 0.9,         // Slightly slower for gentle magical tone
    volume: 0.85,      // Softer for gentle rabbit
    voiceName: 'Microsoft Zira - English (United States)', // Microsoft's young female voice
    description: 'Sweet, gentle rabbit voice with magical wonder - high pitch, gentle pace'
  },
  
  // 2. Space Adventure - Cosmo (excited 7-year-old boy)
  Cosmo: {
    name: 'Cosmo',
    pitch: 1.2,        // Slightly higher for excited boy
    rate: 1.1,         // Faster for enthusiastic astronaut
    volume: 1.0,       // Full volume for confident voice
    voiceName: 'Microsoft Mark - English (United States)', // Microsoft's young male voice
    description: 'Confident, adventurous astronaut voice with cosmic enthusiasm - energetic pace'
  },
  
  // 3. Underwater World - Finn (gentle 6-year-old boy)
  Finn: {
    name: 'Finn',
    pitch: 1.4,        // Higher pitch for bubbly, cheerful fish
    rate: 0.85,        // Slightly slower for gentle underwater flow
    volume: 0.9,       // Softer volume for gentle fish
    voiceName: 'Microsoft David - English (United States)', // Microsoft's young male voice
    description: 'Bubbly, cheerful fish voice with underwater flow - higher pitch, gentle pace'
  },
  
  // 4. Dinosaur Discovery - Dina (bold 8-year-old girl)
  Dina: {
    name: 'Dina',
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0,
    voiceName: 'Microsoft Zira - English (United States)', // Microsoft's young female voice
    description: 'Curious, enthusiastic explorer voice with scientific wonder'
  },
  
  // 5. Unicorn Magic - Stardust (sweet 5-year-old girl)
  Stardust: {
    name: 'Stardust',
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0,
    voiceName: 'Microsoft Zira - English (United States)', // Microsoft's young female voice
    description: 'Enchanting, graceful unicorn voice with dreamy magical quality'
  },
  
  // 6. Pirate Treasure - Captain Finn (brave 8-year-old boy)
  CaptainFinn: {
    name: 'Captain Finn',
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0,
    voiceName: 'Microsoft Mark - English (United States)', // Microsoft's male voice
    description: 'Bold, adventurous pirate captain voice'
  },
  
  // 7. Superhero School - Captain Courage (determined 7-year-old)
  CaptainCourage: {
    name: 'Captain Courage',
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0,
    voiceName: 'Microsoft Mark - English (United States)', // Microsoft's male voice
    description: 'Heroic, confident superhero voice with powerful determination'
  },
  
  // 8. Fairy Garden - Twinkle (whimsical 6-year-old girl)
  Twinkle: {
    name: 'Twinkle',
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0,
    voiceName: 'Microsoft Zira - English (United States)', // Microsoft's young female voice
    description: 'Delicate, twinkling fairy voice with sweet magical tone'
  },
  
  // 9. Rainbow Castle - Aurora (elegant 7-year-old princess)
  Aurora: {
    name: 'Aurora',
    pitch: 1.0,
    rate: 0.95,
    volume: 1.0,
    voiceName: 'Microsoft Zira - English (United States)', // Microsoft's young female voice
    description: 'Graceful, royal princess voice with magical elegance'
  },
  
  // 10. Jungle Explorer - Leo (adventurous 8-year-old captain)
  Leo: {
    name: 'Leo',
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0,
    voiceName: 'Microsoft Mark - English (United States)', // Microsoft's young male voice
    description: 'Bold, adventurous explorer voice with jungle wisdom'
  },

  // 11. Mystery Detective - Detective (analytical 14-year-old investigator)
  Detective: {
    name: 'Detective',
    pitch: 0.95,        // Slightly lower for mature, analytical tone
    rate: 0.85,         // Slower for thoughtful, investigative pace
    volume: 0.95,       // Clear but measured
    voiceName: 'Google US English Female', // Google's alternative voice for uniqueness
    description: 'Analytical, sharp detective voice with investigative determination'
  },

  // Teen: Space Explorer - Astra (unique voice never used before)
  AstraTeen: {
    name: 'Astra',
    pitch: 1.05,      // Slightly bright but mature
    rate: 1.0,        // Natural pace for technical narration
    volume: 1.0,      // Clear and present
    voiceName: 'Microsoft David - English (United States)', // Unique Microsoft voice
    description: 'Calm, confident science narrator with futuristic clarity for teens'
  },

  // Teen: Environmental Hero - Terra (nature-focused 15-year-old activist)
  TerraTeen: {
    name: 'Terra',
    pitch: 1.05,      // Warm, natural tone
    rate: 0.92,       // Thoughtful environmental pace
    volume: 0.95,     // Clear and passionate
    voiceName: 'Google UK English Female',
    description: 'Warm, passionate environmental activist voice with eco-consciousness'
  },

  // Teen: Tech Innovator - Nova (tech-savvy 16-year-old innovator)
  NovaTeen: {
    name: 'Nova',
    pitch: 1.08,      // Bright and forward-thinking
    rate: 1.05,       // Quick, innovative pace
    volume: 1.0,      // Clear and dynamic
    voiceName: 'Google US English Female',
    description: 'Dynamic, tech-forward innovator voice with cutting-edge energy'
  },

  // Teen: Global Citizen - Kai (worldly 15-year-old traveler)
  KaiTeen: {
    name: 'Kai',
    pitch: 1.08,      // Balanced, worldly tone
    rate: 0.93,       // Respectful, global pace
    volume: 0.98,     // Warm and inclusive
    voiceName: 'Google UK English Male',
    description: 'Culturally aware, inclusive global citizen voice with worldly wisdom'
  },

  // Teen: Future Leader - Valor (confident 16-year-old leader)
  ValorTeen: {
    name: 'Valor',
    pitch: 0.93,      // Authoritative but approachable
    rate: 0.88,       // Measured, leadership pace
    volume: 1.0,      // Confident and inspiring
    voiceName: 'Google US English Male',
    description: 'Inspiring, confident leader voice with motivational determination'
  },

  // Teen: Scientific Discovery - Quest (analytical 15-year-old scientist)
  QuestTeen: {
    name: 'Quest',
    pitch: 0.99,      // Professional scientist tone
    rate: 0.92,       // Methodical scientific pace
    volume: 0.98,     // Precise and engaging
    voiceName: 'Microsoft Zira - English (United States)',
    description: 'Analytical, precision-focused scientific researcher voice with methodical clarity'
  },

  // Teen: Social Media Expert - Pixel (digital-native 14-year-old)
  PixelTeen: {
    name: 'Pixel',
    pitch: 1.12,      // Young, digital-native energy
    rate: 1.08,       // Quick, online-savvy pace
    volume: 0.93,     // Bright and modern
    voiceName: 'Microsoft Mark - English (United States)',
    description: 'Bright, digital-native voice with modern online intelligence'
  },

  // Teen: AI Ethics Explorer - Aria (clear, responsible 15-year-old narrator)
  AIEthicsTeen: {
    name: 'Aria',
    pitch: 1.02,       // Balanced, professional teen tone
    rate: 0.96,       // Thoughtful, clear pacing for ethics topics
    volume: 1.0,      // Present and clear
    // Unique Microsoft online voice not used elsewhere in the project
    voiceName: 'Microsoft Aria Online (Natural) - English (United States)',
    description: 'Calm, trustworthy narrator voice for responsible AI topics'
  },

  // Teen: Digital Security Guardian - Cipher (confident 15-year-old cybersecurity guide)
  DigitalSecurityTeen: {
    name: 'Cipher',
    pitch: 0.94,      // Calm, confident technical tone
    rate: 0.97,       // Clear, steady pacing for security concepts
    volume: 1.0,      // Present and authoritative
    // Unique Microsoft online voice not used elsewhere in the project
    voiceName: 'Microsoft Guy Online (Natural) - English (United States)',
    description: 'Confident, trustworthy cybersecurity guide voice for teens'
  },

  // Teen Story 11: Climate Action Leader - ClimateLeader (passionate 16-year-old environmental leader)
  ClimateLeader: {
    name: 'ClimateLeader',
    pitch: 1.05,      // Passionate, inspiring tone
    rate: 0.95,       // Measured, impactful pace for climate discussions
    volume: 1.0,      // Clear and inspiring
    voiceName: 'Google US English Female',
    description: 'Passionate, inspiring climate action leader voice with environmental determination'
  },

  // Teen Story 12: Startup Founder - StartupFounder (dynamic 17-year-old entrepreneur)
  StartupFounder: {
    name: 'StartupFounder',
    pitch: 1.08,      // Dynamic, forward-thinking tone
    rate: 1.05,       // Quick, innovative pace for startup pitch
    volume: 1.0,      // Confident and energetic
    voiceName: 'Google US English Male',
    description: 'Dynamic, entrepreneurial startup founder voice with innovative energy'
  },

  // Teen Story 13: International Diplomat - Diplomat (diplomatic 16-year-old negotiator)
  Diplomat: {
    name: 'Diplomat',
    pitch: 1.0,       // Balanced, diplomatic tone
    rate: 0.92,       // Thoughtful, respectful pace for negotiations
    volume: 0.98,     // Clear and professional
    voiceName: 'Google UK English Female',
    description: 'Diplomatic, culturally aware international negotiator voice with global perspective'
  },

  // Teen Story 14: Medical Researcher - MedicalResearcher (analytical 16-year-old scientist)
  MedicalResearcher: {
    name: 'MedicalResearcher',
    pitch: 0.98,      // Professional, analytical tone
    rate: 0.93,       // Methodical, precise pace for medical research
    volume: 0.99,     // Clear and authoritative
    voiceName: 'Microsoft Zira - English (United States)',
    description: 'Analytical, precision-focused medical researcher voice with scientific clarity'
  },

  // Teen Story 15: Social Impact Innovator - SocialInnovator (compassionate 15-year-old changemaker)
  SocialInnovator: {
    name: 'SocialInnovator',
    pitch: 1.06,      // Warm, compassionate tone
    rate: 0.94,       // Thoughtful, empathetic pace for social impact
    volume: 0.97,     // Warm and inspiring
    voiceName: 'Google US English Female',
    description: 'Compassionate, empathetic social impact innovator voice with community focus'
  },

  // Teen Story 16: Data Science Analyst - DataAnalyst (analytical 16-year-old data expert)
  DataAnalyst: {
    name: 'DataAnalyst',
    pitch: 0.97,      // Professional, analytical tone
    rate: 0.96,       // Clear, data-driven pace for analytics
    volume: 1.0,      // Precise and engaging
    voiceName: 'Microsoft David - English (United States)',
    description: 'Analytical, data-driven analyst voice with technical precision'
  },

  // Teen Story 17: Environmental Engineer - EnvironmentalEngineer (innovative 16-year-old engineer)
  EnvironmentalEngineer: {
    name: 'EnvironmentalEngineer',
    pitch: 1.03,      // Innovative, solution-focused tone
    rate: 0.95,       // Methodical, engineering pace
    volume: 1.0,      // Clear and technical
    voiceName: 'Google UK English Male',
    description: 'Innovative, solution-focused environmental engineer voice with technical expertise'
  },

  // Teen Story 18: Content Creator Strategist - ContentCreator (creative 15-year-old strategist)
  ContentCreator: {
    name: 'ContentCreator',
    pitch: 1.1,       // Creative, engaging tone
    rate: 1.02,       // Dynamic, content-focused pace
    volume: 0.95,     // Bright and modern
    voiceName: 'Microsoft Mark - English (United States)',
    description: 'Creative, engaging content creator voice with modern digital intelligence'
  },

  // Teen Story 19: Ethical AI Developer - AIEthicsDeveloper (uses existing AIEthicsTeen)
  AIEthicsDeveloper: {
    name: 'AIEthicsDeveloper',
    pitch: 1.02,      // Balanced, professional teen tone
    rate: 0.96,       // Thoughtful, clear pacing for ethics topics
    volume: 1.0,      // Present and clear
    voiceName: 'Microsoft Aria Online (Natural) - English (United States)',
    description: 'Calm, trustworthy narrator voice for responsible AI development'
  },

  // Teen Story 20: Global Innovation Summit - InnovationSummit (inspiring 17-year-old presenter)
  InnovationSummit: {
    name: 'InnovationSummit',
    pitch: 1.04,      // Inspiring, global tone
    rate: 0.98,       // Confident, summit-level pace
    volume: 1.0,      // Powerful and inspiring
    voiceName: 'Google US English Male',
    description: 'Inspiring, global innovation summit presenter voice with breakthrough energy'
  },

  // Story 11: Enchanted Garden - Petal (sweet 6-year-old flower)
  GardenFlower: {
    name: 'Petal',
    pitch: 1.5,        // Higher pitch for sweet, gentle flower
    rate: 0.88,       // Gentle, flowing pace like petals in the wind
    volume: 0.9,      // Soft and delicate
    voiceName: 'Google US English Female',
    description: 'Sweet, gentle flower voice with magical garden wonder - high pitch, gentle pace'
  },

  // Story 12: Dragon's Treasure - Spark (friendly 7-year-old dragon)
  DragonGuard: {
    name: 'Spark',
    pitch: 1.3,       // Slightly higher for friendly dragon
    rate: 0.95,       // Confident but warm pace
    volume: 0.95,     // Strong but friendly
    voiceName: 'Google UK English Male',
    description: 'Friendly, protective dragon voice with warm wisdom - confident pace'
  },

  // Story 13: Magic School - Wizard (wise 8-year-old student)
  MagicWizard: {
    name: 'Wizard',
    pitch: 1.2,       // Bright and magical
    rate: 1.0,        // Enthusiastic learning pace
    volume: 1.0,      // Clear and present
    voiceName: 'Microsoft David - English (United States)',
    description: 'Enthusiastic, magical student voice with learning wonder'
  },

  // Story 14: Ocean Explorer - Coral (adventurous 7-year-old explorer)
  OceanExplorer: {
    name: 'Coral',
    pitch: 1.4,       // Bubbly and adventurous
    rate: 0.9,        // Deep ocean flow pace
    volume: 0.92,     // Clear underwater voice
    voiceName: 'Google US English Female',
    description: 'Bubbly, adventurous ocean explorer voice with deep sea wonder'
  },

  // Story 15: Time Machine - Chrono (curious 8-year-old time traveler)
  TimeTraveler: {
    name: 'Chrono',
    pitch: 1.1,       // Curious and thoughtful
    rate: 0.92,       // Thoughtful time-travel pace
    volume: 0.98,     // Clear through time
    voiceName: 'Microsoft Mark - English (United States)',
    description: 'Curious, thoughtful time traveler voice with temporal wonder'
  },

  // Story 16: Friendly Robot - Robo (helpful 6-year-old robot)
  FriendlyRobot: {
    name: 'Robo',
    pitch: 1.3,       // Friendly and mechanical
    rate: 0.85,       // Steady robot pace
    volume: 0.9,      // Clear mechanical voice
    voiceName: 'Google UK English Male',
    description: 'Friendly, helpful robot voice with mechanical warmth'
  },

  // Story 17: Secret Cave - Crystal (mysterious 7-year-old explorer)
  CaveExplorer: {
    name: 'Crystal',
    pitch: 1.2,       // Mysterious but friendly
    rate: 0.88,       // Careful cave exploration pace
    volume: 0.93,     // Echoing cave voice
    voiceName: 'Google US English Female',
    description: 'Mysterious, adventurous cave explorer voice with crystalline wonder'
  },

  // Story 18: Flying Carpet - Sky (free-spirited 6-year-old)
  FlyingAdventurer: {
    name: 'Sky',
    pitch: 1.5,       // High and free-spirited
    rate: 1.05,       // Fast flying pace
    volume: 0.95,     // Clear in the sky
    voiceName: 'Microsoft Zira - English (United States)',
    description: 'Free-spirited, soaring flying carpet voice with sky-high wonder'
  },

  // Story 19: Lost Kingdom - Royal (noble 8-year-old prince/princess)
  KingdomRoyal: {
    name: 'Royal',
    pitch: 1.0,       // Noble and regal
    rate: 0.9,        // Royal, measured pace
    volume: 1.0,      // Commanding but kind
    voiceName: 'Google UK English Female',
    description: 'Noble, regal kingdom voice with royal wisdom and kindness'
  },

  // Story 20: Grand Adventure - Hero (brave 8-year-old ultimate hero)
  GrandHero: {
    name: 'Hero',
    pitch: 1.15,      // Brave and inspiring
    rate: 1.0,        // Epic adventure pace
    volume: 1.0,      // Powerful and inspiring
    voiceName: 'Microsoft Mark - English (United States)',
    description: 'Brave, inspiring ultimate hero voice with epic adventure spirit'
  }
};

export default OnlineTTS;
