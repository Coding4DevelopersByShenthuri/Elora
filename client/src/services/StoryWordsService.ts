/**
 * StoryWordsService: Extracts vocabulary words from completed stories
 * for use in Word Games section
 */

export interface StoryWord {
  word: string;
  hint: string;
  emoji: string;
  storyId: string;
  storyTitle: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

export interface StoryPhrase {
  phrase: string;
  phonemes: string;
  emoji?: string;
  storyId: string;
  storyTitle: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface StoryEnrollment {
  storyId: string;
  storyTitle: string;
  storyType: string;
  completed: boolean;
  completedAt?: number;
  score?: number;
  wordsExtracted: boolean;
}

export class StoryWordsService {
  private static STORAGE_KEY = 'speakbee_story_enrollments';
  
  // Story vocabulary data - extracted from each story
  private static STORY_VOCABULARY: Record<string, StoryWord[]> = {
    'magic-forest': [
      { word: 'rabbit', hint: '🐰 Say: RAB-it', emoji: '🐰', storyId: 'magic-forest', storyTitle: 'Magic Forest Adventure', difficulty: 'easy', category: 'animals' },
      { word: 'forest', hint: '🌲 Say: FOR-est', emoji: '🌲', storyId: 'magic-forest', storyTitle: 'Magic Forest Adventure', difficulty: 'easy', category: 'nature' },
      { word: 'magic', hint: '✨ Say: MAJ-ik', emoji: '✨', storyId: 'magic-forest', storyTitle: 'Magic Forest Adventure', difficulty: 'easy', category: 'fantasy' },
      { word: 'whisper', hint: '🤫 Say: WIS-per', emoji: '🤫', storyId: 'magic-forest', storyTitle: 'Magic Forest Adventure', difficulty: 'medium', category: 'actions' },
      { word: 'butterfly', hint: '🦋 Say: BUT-er-fly', emoji: '🦋', storyId: 'magic-forest', storyTitle: 'Magic Forest Adventure', difficulty: 'easy', category: 'animals' },
      { word: 'river', hint: '🌊 Say: RIV-er', emoji: '🌊', storyId: 'magic-forest', storyTitle: 'Magic Forest Adventure', difficulty: 'easy', category: 'nature' },
      { word: 'stars', hint: '⭐ Say: STARZ', emoji: '⭐', storyId: 'magic-forest', storyTitle: 'Magic Forest Adventure', difficulty: 'easy', category: 'nature' },
      { word: 'kindness', hint: '💝 Say: KIND-ness', emoji: '💝', storyId: 'magic-forest', storyTitle: 'Magic Forest Adventure', difficulty: 'medium', category: 'emotions' }
    ],
    'space-adventure': [
      { word: 'planet', hint: '🪐 Say: PLAN-it', emoji: '🪐', storyId: 'space-adventure', storyTitle: 'Space Adventure', difficulty: 'easy', category: 'space' },
      { word: 'astronaut', hint: '👨‍🚀 Say: AS-tro-not', emoji: '👨‍🚀', storyId: 'space-adventure', storyTitle: 'Space Adventure', difficulty: 'medium', category: 'space' },
      { word: 'rocket', hint: '🚀 Say: ROCK-it', emoji: '🚀', storyId: 'space-adventure', storyTitle: 'Space Adventure', difficulty: 'easy', category: 'space' },
      { word: 'alien', hint: '👽 Say: AY-lee-en', emoji: '👽', storyId: 'space-adventure', storyTitle: 'Space Adventure', difficulty: 'easy', category: 'space' },
      { word: 'explore', hint: '🔍 Say: ex-PLOR', emoji: '🔍', storyId: 'space-adventure', storyTitle: 'Space Adventure', difficulty: 'medium', category: 'actions' },
      { word: 'teamwork', hint: '🤝 Say: TEAM-work', emoji: '🤝', storyId: 'space-adventure', storyTitle: 'Space Adventure', difficulty: 'medium', category: 'values' },
      { word: 'galaxy', hint: '🌌 Say: GAL-ax-ee', emoji: '🌌', storyId: 'space-adventure', storyTitle: 'Space Adventure', difficulty: 'medium', category: 'space' },
      { word: 'adventure', hint: '🗺️ Say: ad-VEN-chur', emoji: '🗺️', storyId: 'space-adventure', storyTitle: 'Space Adventure', difficulty: 'medium', category: 'actions' }
    ],
    'underwater-world': [
      { word: 'fish', hint: '🐠 Say: FISH', emoji: '🐠', storyId: 'underwater-world', storyTitle: 'Underwater World', difficulty: 'easy', category: 'animals' },
      { word: 'ocean', hint: '🌊 Say: O-shun', emoji: '🌊', storyId: 'underwater-world', storyTitle: 'Underwater World', difficulty: 'easy', category: 'nature' },
      { word: 'coral', hint: '🪸 Say: KOR-al', emoji: '🪸', storyId: 'underwater-world', storyTitle: 'Underwater World', difficulty: 'easy', category: 'nature' },
      { word: 'swim', hint: '🏊 Say: SWIM', emoji: '🏊', storyId: 'underwater-world', storyTitle: 'Underwater World', difficulty: 'easy', category: 'actions' },
      { word: 'friendship', hint: '👫 Say: FREND-ship', emoji: '👫', storyId: 'underwater-world', storyTitle: 'Underwater World', difficulty: 'medium', category: 'values' },
      { word: 'protect', hint: '🛡️ Say: pro-TEKT', emoji: '🛡️', storyId: 'underwater-world', storyTitle: 'Underwater World', difficulty: 'medium', category: 'actions' },
      { word: 'beautiful', hint: '💎 Say: BYOO-ti-ful', emoji: '💎', storyId: 'underwater-world', storyTitle: 'Underwater World', difficulty: 'medium', category: 'descriptions' },
      { word: 'treasure', hint: '💎 Say: TREZH-er', emoji: '💎', storyId: 'underwater-world', storyTitle: 'Underwater World', difficulty: 'easy', category: 'objects' }
    ],
    'dinosaur-discovery': [
      { word: 'dinosaur', hint: '🦖 Say: DY-no-sawr', emoji: '🦖', storyId: 'dinosaur-discovery', storyTitle: 'Dinosaur Discovery', difficulty: 'easy', category: 'animals' },
      { word: 'fossil', hint: '🦴 Say: FOS-il', emoji: '🦴', storyId: 'dinosaur-discovery', storyTitle: 'Dinosaur Discovery', difficulty: 'medium', category: 'science' },
      { word: 'discover', hint: '🔍 Say: dis-KUV-er', emoji: '🔍', storyId: 'dinosaur-discovery', storyTitle: 'Dinosaur Discovery', difficulty: 'medium', category: 'actions' },
      { word: 'museum', hint: '🏛️ Say: myoo-ZEE-um', emoji: '🏛️', storyId: 'dinosaur-discovery', storyTitle: 'Dinosaur Discovery', difficulty: 'medium', category: 'places' },
      { word: 'scientist', hint: '👩‍🔬 Say: SY-en-tist', emoji: '👩‍🔬', storyId: 'dinosaur-discovery', storyTitle: 'Dinosaur Discovery', difficulty: 'hard', category: 'professions' },
      { word: 'ancient', hint: '🏺 Say: AYN-shent', emoji: '🏺', storyId: 'dinosaur-discovery', storyTitle: 'Dinosaur Discovery', difficulty: 'hard', category: 'descriptions' },
      { word: 'excavate', hint: '⛏️ Say: EKS-ka-vate', emoji: '⛏️', storyId: 'dinosaur-discovery', storyTitle: 'Dinosaur Discovery', difficulty: 'hard', category: 'actions' },
      { word: 'prehistoric', hint: '🦕 Say: pree-his-TOR-ik', emoji: '🦕', storyId: 'dinosaur-discovery', storyTitle: 'Dinosaur Discovery', difficulty: 'hard', category: 'descriptions' }
    ],
    'unicorn-magic': [
      { word: 'unicorn', hint: '🦄 Say: YOU-ni-corn', emoji: '🦄', storyId: 'unicorn-magic', storyTitle: 'Unicorn Magic Adventure', difficulty: 'easy', category: 'fantasy' },
      { word: 'rainbow', hint: '🌈 Say: RAIN-bow', emoji: '🌈', storyId: 'unicorn-magic', storyTitle: 'Unicorn Magic Adventure', difficulty: 'easy', category: 'nature' },
      { word: 'sparkle', hint: '✨ Say: SPAR-kul', emoji: '✨', storyId: 'unicorn-magic', storyTitle: 'Unicorn Magic Adventure', difficulty: 'easy', category: 'fantasy' },
      { word: 'magical', hint: '🪄 Say: MAJ-i-kal', emoji: '🪄', storyId: 'unicorn-magic', storyTitle: 'Unicorn Magic Adventure', difficulty: 'medium', category: 'descriptions' },
      { word: 'dream', hint: '💭 Say: DREEM', emoji: '💭', storyId: 'unicorn-magic', storyTitle: 'Unicorn Magic Adventure', difficulty: 'easy', category: 'concepts' },
      { word: 'wish', hint: '🌟 Say: WISH', emoji: '🌟', storyId: 'unicorn-magic', storyTitle: 'Unicorn Magic Adventure', difficulty: 'easy', category: 'actions' },
      { word: 'wonderful', hint: '😍 Say: WUN-der-ful', emoji: '😍', storyId: 'unicorn-magic', storyTitle: 'Unicorn Magic Adventure', difficulty: 'medium', category: 'descriptions' },
      { word: 'imagination', hint: '🎭 Say: i-maj-i-NAY-shun', emoji: '🎭', storyId: 'unicorn-magic', storyTitle: 'Unicorn Magic Adventure', difficulty: 'hard', category: 'concepts' }
    ],
    'pirate-treasure': [
      { word: 'pirate', hint: '🏴‍☠️ Say: PY-rate', emoji: '🏴‍☠️', storyId: 'pirate-treasure', storyTitle: 'Pirate Treasure Adventure', difficulty: 'easy', category: 'characters' },
      { word: 'treasure', hint: '💎 Say: TREZH-er', emoji: '💎', storyId: 'pirate-treasure', storyTitle: 'Pirate Treasure Adventure', difficulty: 'easy', category: 'objects' },
      { word: 'ship', hint: '🚢 Say: SHIP', emoji: '🚢', storyId: 'pirate-treasure', storyTitle: 'Pirate Treasure Adventure', difficulty: 'easy', category: 'transport' },
      { word: 'map', hint: '🗺️ Say: MAP', emoji: '🗺️', storyId: 'pirate-treasure', storyTitle: 'Pirate Treasure Adventure', difficulty: 'easy', category: 'objects' },
      { word: 'captain', hint: '⚓ Say: CAP-tin', emoji: '⚓', storyId: 'pirate-treasure', storyTitle: 'Pirate Treasure Adventure', difficulty: 'medium', category: 'professions' },
      { word: 'adventure', hint: '🗺️ Say: ad-VEN-chur', emoji: '🗺️', storyId: 'pirate-treasure', storyTitle: 'Pirate Treasure Adventure', difficulty: 'medium', category: 'actions' },
      { word: 'island', hint: '🏝️ Say: I-land', emoji: '🏝️', storyId: 'pirate-treasure', storyTitle: 'Pirate Treasure Adventure', difficulty: 'easy', category: 'places' },
      { word: 'parrot', hint: '🦜 Say: PAIR-ut', emoji: '🦜', storyId: 'pirate-treasure', storyTitle: 'Pirate Treasure Adventure', difficulty: 'easy', category: 'animals' }
    ],
    'superhero-school': [
      { word: 'superhero', hint: '🦸 Say: SOO-per-hero', emoji: '🦸', storyId: 'superhero-school', storyTitle: 'Superhero School Adventure', difficulty: 'easy', category: 'characters' },
      { word: 'rescue', hint: '🚁 Say: RES-kyoo', emoji: '🚁', storyId: 'superhero-school', storyTitle: 'Superhero School Adventure', difficulty: 'medium', category: 'actions' },
      { word: 'training', hint: '💪 Say: TRAIN-ing', emoji: '💪', storyId: 'superhero-school', storyTitle: 'Superhero School Adventure', difficulty: 'medium', category: 'actions' },
      { word: 'courage', hint: '🦁 Say: KUR-ij', emoji: '🦁', storyId: 'superhero-school', storyTitle: 'Superhero School Adventure', difficulty: 'medium', category: 'values' },
      { word: 'mission', hint: '🎯 Say: MISH-un', emoji: '🎯', storyId: 'superhero-school', storyTitle: 'Superhero School Adventure', difficulty: 'medium', category: 'concepts' },
      { word: 'protect', hint: '🛡️ Say: pro-TEKT', emoji: '🛡️', storyId: 'superhero-school', storyTitle: 'Superhero School Adventure', difficulty: 'medium', category: 'actions' },
      { word: 'brave', hint: '🦅 Say: BRAVE', emoji: '🦅', storyId: 'superhero-school', storyTitle: 'Superhero School Adventure', difficulty: 'easy', category: 'descriptions' },
      { word: 'teamwork', hint: '🤝 Say: TEAM-work', emoji: '🤝', storyId: 'superhero-school', storyTitle: 'Superhero School Adventure', difficulty: 'medium', category: 'values' }
    ],
    'fairy-garden': [
      { word: 'fairy', hint: '🧚 Say: FAIR-ee', emoji: '🧚', storyId: 'fairy-garden', storyTitle: 'Fairy Garden Adventure', difficulty: 'easy', category: 'fantasy' },
      { word: 'garden', hint: '🌺 Say: GAR-den', emoji: '🌺', storyId: 'fairy-garden', storyTitle: 'Fairy Garden Adventure', difficulty: 'easy', category: 'places' },
      { word: 'magic', hint: '✨ Say: MAJ-ik', emoji: '✨', storyId: 'fairy-garden', storyTitle: 'Fairy Garden Adventure', difficulty: 'easy', category: 'fantasy' },
      { word: 'flower', hint: '🌸 Say: FLOW-er', emoji: '🌸', storyId: 'fairy-garden', storyTitle: 'Fairy Garden Adventure', difficulty: 'easy', category: 'nature' },
      { word: 'wings', hint: '🦋 Say: WINGZ', emoji: '🦋', storyId: 'fairy-garden', storyTitle: 'Fairy Garden Adventure', difficulty: 'easy', category: 'body' },
      { word: 'dust', hint: '✨ Say: DUST', emoji: '✨', storyId: 'fairy-garden', storyTitle: 'Fairy Garden Adventure', difficulty: 'easy', category: 'objects' },
      { word: 'tiny', hint: '🔍 Say: TY-nee', emoji: '🔍', storyId: 'fairy-garden', storyTitle: 'Fairy Garden Adventure', difficulty: 'easy', category: 'descriptions' },
      { word: 'moonflower', hint: '🌙🌸 Say: MOON-flow-er', emoji: '🌙🌸', storyId: 'fairy-garden', storyTitle: 'Fairy Garden Adventure', difficulty: 'medium', category: 'nature' }
    ],
    'rainbow-castle': [
      { word: 'princess', hint: '👸 Say: PRIN-sess', emoji: '👸', storyId: 'rainbow-castle', storyTitle: 'Rainbow Castle Adventure', difficulty: 'easy', category: 'characters' },
      { word: 'castle', hint: '🏰 Say: KAS-ul', emoji: '🏰', storyId: 'rainbow-castle', storyTitle: 'Rainbow Castle Adventure', difficulty: 'easy', category: 'places' },
      { word: 'rainbow', hint: '🌈 Say: RAIN-bow', emoji: '🌈', storyId: 'rainbow-castle', storyTitle: 'Rainbow Castle Adventure', difficulty: 'easy', category: 'nature' },
      { word: 'crown', hint: '👑 Say: KROWN', emoji: '👑', storyId: 'rainbow-castle', storyTitle: 'Rainbow Castle Adventure', difficulty: 'easy', category: 'objects' },
      { word: 'dance', hint: '💃 Say: DANS', emoji: '💃', storyId: 'rainbow-castle', storyTitle: 'Rainbow Castle Adventure', difficulty: 'easy', category: 'actions' },
      { word: 'sing', hint: '🎵 Say: SING', emoji: '🎵', storyId: 'rainbow-castle', storyTitle: 'Rainbow Castle Adventure', difficulty: 'easy', category: 'actions' },
      { word: 'celebration', hint: '🎉 Say: sel-eh-BRAY-shun', emoji: '🎉', storyId: 'rainbow-castle', storyTitle: 'Rainbow Castle Adventure', difficulty: 'medium', category: 'concepts' },
      { word: 'friendship', hint: '👫 Say: FREND-ship', emoji: '👫', storyId: 'rainbow-castle', storyTitle: 'Rainbow Castle Adventure', difficulty: 'medium', category: 'values' }
    ],
    'jungle-explorer': [
      { word: 'jungle', hint: '🌴 Say: JUNG-ul', emoji: '🌴', storyId: 'jungle-explorer', storyTitle: 'Jungle Explorer Adventure', difficulty: 'easy', category: 'places' },
      { word: 'explorer', hint: '🗺️ Say: ex-PLOR-er', emoji: '🗺️', storyId: 'jungle-explorer', storyTitle: 'Jungle Explorer Adventure', difficulty: 'medium', category: 'professions' },
      { word: 'tiger', hint: '🐅 Say: TY-ger', emoji: '🐅', storyId: 'jungle-explorer', storyTitle: 'Jungle Explorer Adventure', difficulty: 'easy', category: 'animals' },
      { word: 'monkey', hint: '🐵 Say: MUN-kee', emoji: '🐵', storyId: 'jungle-explorer', storyTitle: 'Jungle Explorer Adventure', difficulty: 'easy', category: 'animals' },
      { word: 'vine', hint: '🌿 Say: VINE', emoji: '🌿', storyId: 'jungle-explorer', storyTitle: 'Jungle Explorer Adventure', difficulty: 'easy', category: 'nature' },
      { word: 'roar', hint: '🦁 Say: ROR', emoji: '🦁', storyId: 'jungle-explorer', storyTitle: 'Jungle Explorer Adventure', difficulty: 'easy', category: 'sounds' },
      { word: 'adventure', hint: '🗺️ Say: ad-VEN-chur', emoji: '🗺️', storyId: 'jungle-explorer', storyTitle: 'Jungle Explorer Adventure', difficulty: 'medium', category: 'actions' },
      { word: 'brave', hint: '🦅 Say: BRAVE', emoji: '🦅', storyId: 'jungle-explorer', storyTitle: 'Jungle Explorer Adventure', difficulty: 'easy', category: 'descriptions' }
    ]
  };
  
  // Story phrases data - extracted from each story for pronunciation practice
  private static STORY_PHRASES: Record<string, StoryPhrase[]> = {
    'magic-forest': [
      { phrase: 'Hello Luna', phonemes: '👋 Say: heh-LOW LOO-nah', emoji: '👋🐰', storyId: 'magic-forest', storyTitle: 'Magic Forest Adventure', difficulty: 'easy' },
      { phrase: 'Magic forest', phonemes: '✨🌲 Say: MAJ-ik FOR-est', emoji: '✨🌲', storyId: 'magic-forest', storyTitle: 'Magic Forest Adventure', difficulty: 'easy' },
      { phrase: 'Happy rabbit', phonemes: '😊🐰 Say: HAP-ee RAB-it', emoji: '😊🐰', storyId: 'magic-forest', storyTitle: 'Magic Forest Adventure', difficulty: 'easy' }
    ],
    'space-adventure': [
      { phrase: 'We are flying to the stars', phonemes: '🚀✨ Say: WE ARE FLY-ing TO THE STARZ', emoji: '🚀✨', storyId: 'space-adventure', storyTitle: 'Space Adventure', difficulty: 'easy' },
      { phrase: 'Hello Cosmo', phonemes: '👋 Say: heh-LOW KOZ-mo', emoji: '👋👨‍🚀', storyId: 'space-adventure', storyTitle: 'Space Adventure', difficulty: 'easy' },
      { phrase: 'Blast off', phonemes: '🚀 Say: BLAST OFF', emoji: '🚀', storyId: 'space-adventure', storyTitle: 'Space Adventure', difficulty: 'easy' }
    ],
    'underwater-world': [
      { phrase: 'Hello Finn', phonemes: '👋 Say: heh-LOW FIN', emoji: '👋🐠', storyId: 'underwater-world', storyTitle: 'Underwater World', difficulty: 'easy' },
      { phrase: 'Swimming is so much fun', phonemes: '🏊 Say: SWIM-ing IS SO MUCH FUN', emoji: '🏊🐠', storyId: 'underwater-world', storyTitle: 'Underwater World', difficulty: 'medium' },
      { phrase: 'Beautiful ocean', phonemes: '🌊 Say: BYOO-ti-ful O-shun', emoji: '🌊', storyId: 'underwater-world', storyTitle: 'Underwater World', difficulty: 'easy' }
    ],
    'dinosaur-discovery': [
      { phrase: 'Hello Dina', phonemes: '👋 Say: heh-LOW DEE-nah', emoji: '👋🦕', storyId: 'dinosaur-discovery', storyTitle: 'Dinosaur Discovery', difficulty: 'easy' },
      { phrase: 'Big dinosaur', phonemes: '🦖 Say: BIG DY-no-sawr', emoji: '🦖', storyId: 'dinosaur-discovery', storyTitle: 'Dinosaur Discovery', difficulty: 'easy' },
      { phrase: 'Ancient fossil', phonemes: '🦴 Say: AYN-shent FOS-il', emoji: '🦴', storyId: 'dinosaur-discovery', storyTitle: 'Dinosaur Discovery', difficulty: 'medium' }
    ],
    'unicorn-magic': [
      { phrase: 'Hello Stardust', phonemes: '👋 Say: heh-LOW STAR-dust', emoji: '👋🦄', storyId: 'unicorn-magic', storyTitle: 'Unicorn Magic Adventure', difficulty: 'easy' },
      { phrase: 'Rainbow unicorn', phonemes: '🌈🦄 Say: RAIN-bow YOU-ni-corn', emoji: '🌈🦄', storyId: 'unicorn-magic', storyTitle: 'Unicorn Magic Adventure', difficulty: 'easy' },
      { phrase: 'Magic sparkles', phonemes: '✨⭐ Say: MAJ-ik SPAR-kulz', emoji: '✨⭐', storyId: 'unicorn-magic', storyTitle: 'Unicorn Magic Adventure', difficulty: 'medium' }
    ],
    'pirate-treasure': [
      { phrase: 'Hello Captain Finn', phonemes: '👋⚓ Say: heh-LOW CAP-tin FIN', emoji: '👋⚓', storyId: 'pirate-treasure', storyTitle: 'Pirate Treasure Adventure', difficulty: 'easy' },
      { phrase: 'Pirate treasure', phonemes: '🏴‍☠️💎 Say: PY-rate TREZH-er', emoji: '🏴‍☠️💎', storyId: 'pirate-treasure', storyTitle: 'Pirate Treasure Adventure', difficulty: 'easy' },
      { phrase: 'Buried treasure', phonemes: '🏝️💰 Say: BER-eed TREZH-er', emoji: '🏝️💰', storyId: 'pirate-treasure', storyTitle: 'Pirate Treasure Adventure', difficulty: 'medium' }
    ],
    'superhero-school': [
      { phrase: 'Hello Captain Courage', phonemes: '👋🛡️ Say: heh-LOW CAP-tin KUR-ij', emoji: '👋🛡️', storyId: 'superhero-school', storyTitle: 'Superhero School Adventure', difficulty: 'easy' },
      { phrase: 'Superhero training', phonemes: '🦸‍♂️💪 Say: SOO-per-hero TRAIN-ing', emoji: '🦸‍♂️💪', storyId: 'superhero-school', storyTitle: 'Superhero School Adventure', difficulty: 'medium' },
      { phrase: 'Rescue mission', phonemes: '🚁🆘 Say: RES-kyoo MISH-un', emoji: '🚁🆘', storyId: 'superhero-school', storyTitle: 'Superhero School Adventure', difficulty: 'medium' }
    ],
    'fairy-garden': [
      { phrase: 'Hello Twinkle', phonemes: '👋 Say: heh-LOW TWIN-kul', emoji: '👋🧚', storyId: 'fairy-garden', storyTitle: 'Fairy Garden Adventure', difficulty: 'easy' },
      { phrase: 'Fairy dust', phonemes: '🧚✨ Say: FAIR-ee DUST', emoji: '🧚✨', storyId: 'fairy-garden', storyTitle: 'Fairy Garden Adventure', difficulty: 'easy' },
      { phrase: 'Magic sparkles', phonemes: '✨⭐ Say: MAJ-ik SPAR-kulz', emoji: '✨⭐', storyId: 'fairy-garden', storyTitle: 'Fairy Garden Adventure', difficulty: 'medium' }
    ],
    'rainbow-castle': [
      { phrase: 'Hello Princess Aurora', phonemes: '👋👸 Say: heh-LOW PRIN-sess aw-ROR-ah', emoji: '👋👸', storyId: 'rainbow-castle', storyTitle: 'Rainbow Castle Adventure', difficulty: 'easy' },
      { phrase: 'Rainbow castle', phonemes: '🌈🏰 Say: RAIN-bow KAS-ul', emoji: '🌈🏰', storyId: 'rainbow-castle', storyTitle: 'Rainbow Castle Adventure', difficulty: 'easy' },
      { phrase: 'Beautiful crown', phonemes: '👑 Say: BYOO-ti-ful KROWN', emoji: '👑', storyId: 'rainbow-castle', storyTitle: 'Rainbow Castle Adventure', difficulty: 'medium' }
    ],
    'jungle-explorer': [
      { phrase: 'Hello Captain Leo', phonemes: '👋 Say: heh-LOW CAP-tin LEE-oh', emoji: '👋🦁', storyId: 'jungle-explorer', storyTitle: 'Jungle Explorer Adventure', difficulty: 'easy' },
      { phrase: 'Jungle adventure', phonemes: '🌴🗺️ Say: JUNG-ul ad-VEN-chur', emoji: '🌴🗺️', storyId: 'jungle-explorer', storyTitle: 'Jungle Explorer Adventure', difficulty: 'medium' },
      { phrase: 'Talking bunnies', phonemes: '🐰💬 Say: TAWK-ing BUN-eez', emoji: '🐰💬', storyId: 'jungle-explorer', storyTitle: 'Jungle Explorer Adventure', difficulty: 'easy' }
    ]
  };

  /**
   * Get all enrolled stories for a user
   */
  static getEnrolledStories(userId: string): StoryEnrollment[] {
    try {
      const data = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading enrolled stories:', error);
      return [];
    }
  }

  /**
   * Enroll a user in a story (mark as completed)
   */
  static enrollInStory(userId: string, storyId: string, storyTitle: string, storyType: string, score: number = 0): void {
    try {
      const enrollments = this.getEnrolledStories(userId);
      const existingIndex = enrollments.findIndex(e => e.storyId === storyId);
      
      const enrollment: StoryEnrollment = {
        storyId,
        storyTitle,
        storyType,
        completed: true,
        completedAt: Date.now(),
        score,
        wordsExtracted: true
      };

      if (existingIndex >= 0) {
        enrollments[existingIndex] = enrollment;
      } else {
        enrollments.push(enrollment);
      }

      localStorage.setItem(`${this.STORAGE_KEY}_${userId}`, JSON.stringify(enrollments));
    } catch (error) {
      console.error('Error enrolling in story:', error);
    }
  }

  /**
   * Get vocabulary words from completed stories
   */
  static getWordsFromEnrolledStories(userId: string): StoryWord[] {
    const enrollments = this.getEnrolledStories(userId);
    const completedStoryIds = enrollments
      .filter(e => e.completed && e.wordsExtracted)
      .map(e => e.storyId);

    const allWords: StoryWord[] = [];
    
    completedStoryIds.forEach(storyId => {
      const storyWords = this.STORY_VOCABULARY[storyId] || [];
      allWords.push(...storyWords);
    });

    return allWords;
  }

  /**
   * Get phrases from completed stories for pronunciation practice
   */
  static getPhrasesFromEnrolledStories(userId: string): StoryPhrase[] {
    const enrollments = this.getEnrolledStories(userId);
    const completedStoryIds = enrollments
      .filter(e => e.completed && e.wordsExtracted) // Assuming wordsExtracted is true for phrases
      .map(e => e.storyId);

    const allPhrases: StoryPhrase[] = [];
    
    completedStoryIds.forEach(storyId => {
      const storyPhrases = this.STORY_PHRASES[storyId] || [];
      allPhrases.push(...storyPhrases);
    });

    return allPhrases;
  }

  /**
   * Get words for specific game types
   */
  static getWordsForGame(userId: string, gameType: 'rhyme' | 'sentence' | 'echo'): StoryWord[] {
    const allWords = this.getWordsFromEnrolledStories(userId);
    
    if (allWords.length === 0) {
      // Fallback to default words if no stories completed
      return this.getDefaultWords();
    }

    switch (gameType) {
      case 'rhyme':
        // Return words that work well for rhyming games
        return allWords.filter(word => 
          word.difficulty === 'easy' || word.difficulty === 'medium'
        ).slice(0, 20);
      
      case 'sentence':
        // Return words that work well for sentence building
        return allWords.filter(word => 
          ['animals', 'objects', 'actions', 'descriptions'].includes(word.category)
        ).slice(0, 30);
      
      case 'echo':
        // Return phrases/words that work well for echo challenges
        return allWords.filter(word => 
          word.word.length <= 8 // Shorter words are better for echo
        ).slice(0, 15);
      
      default:
        return allWords.slice(0, 20);
    }
  }

  /**
   * Get default words when no stories are completed
   */
  private static getDefaultWords(): StoryWord[] {
    return [
      { word: 'cat', hint: '🐱 Say: KAT', emoji: '🐱', storyId: 'default', storyTitle: 'Basic Words', difficulty: 'easy', category: 'animals' },
      { word: 'dog', hint: '🐶 Say: DOG', emoji: '🐶', storyId: 'default', storyTitle: 'Basic Words', difficulty: 'easy', category: 'animals' },
      { word: 'sun', hint: '☀️ Say: SUN', emoji: '☀️', storyId: 'default', storyTitle: 'Basic Words', difficulty: 'easy', category: 'nature' },
      { word: 'moon', hint: '🌙 Say: MOON', emoji: '🌙', storyId: 'default', storyTitle: 'Basic Words', difficulty: 'easy', category: 'nature' },
      { word: 'happy', hint: '😊 Say: HAP-ee', emoji: '😊', storyId: 'default', storyTitle: 'Basic Words', difficulty: 'easy', category: 'emotions' },
      { word: 'play', hint: '🎮 Say: PLAY', emoji: '🎮', storyId: 'default', storyTitle: 'Basic Words', difficulty: 'easy', category: 'actions' },
      { word: 'book', hint: '📚 Say: BOOK', emoji: '📚', storyId: 'default', storyTitle: 'Basic Words', difficulty: 'easy', category: 'objects' },
      { word: 'house', hint: '🏠 Say: HOWS', emoji: '🏠', storyId: 'default', storyTitle: 'Basic Words', difficulty: 'easy', category: 'places' }
    ];
  }

  /**
   * Check if a story is enrolled/completed
   */
  static isStoryEnrolled(userId: string, storyId: string): boolean {
    const enrollments = this.getEnrolledStories(userId);
    return enrollments.some(e => e.storyId === storyId && e.completed);
  }

  /**
   * Get enrollment statistics
   */
  static getEnrollmentStats(userId: string): {
    totalStories: number;
    completedStories: number;
    totalWords: number;
    storiesWithWords: string[];
  } {
    const enrollments = this.getEnrolledStories(userId);
    const completedStories = enrollments.filter(e => e.completed);
    const words = this.getWordsFromEnrolledStories(userId);
    
    return {
      totalStories: Object.keys(this.STORY_VOCABULARY).length,
      completedStories: completedStories.length,
      totalWords: words.length,
      storiesWithWords: completedStories.map(e => e.storyTitle)
    };
  }
}

export default StoryWordsService;
