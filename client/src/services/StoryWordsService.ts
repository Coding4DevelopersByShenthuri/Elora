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
  
  // Define which stories belong to which age group
  // YOUNG_KIDS_STORIES: ONLY these 20 stories appear in Young Kids Word Games & Speak & Repeat
  // Stories 1-10: The Magic Forest, Space Adventure, Underwater World, Dinosaur Discovery,
  //              Unicorn Magic, Pirate Treasure, Superhero School, Fairy Garden, Rainbow Castle, Jungle Explorer
  // Stories 11-20: The Enchanted Garden, Dragon's Treasure, The Magic School, Ocean Explorer,
  //                The Time Machine, The Friendly Robot, The Secret Cave, The Flying Carpet,
  //                The Lost Kingdom, The Grand Adventure
  private static YOUNG_KIDS_STORIES = new Set([
    'magic-forest',           // 1. The Magic Forest
    'space-adventure',        // 2. Space Adventure
    'underwater-world',       // 3. Underwater World
    'dinosaur-discovery',     // 4. Dinosaur Discovery
    'unicorn-magic',          // 5. Unicorn Magic
    'pirate-treasure',        // 6. Pirate Treasure
    'superhero-school',       // 7. Superhero School
    'fairy-garden',           // 8. Fairy Garden
    'rainbow-castle',         // 9. Rainbow Castle
    'jungle-explorer',        // 10. Jungle Explorer
    // Template stories (11-20) for young kids
    'enchanted-garden',       // 11. The Enchanted Garden
    'dragons-treasure',       // 12. Dragon's Treasure
    'magic-school',           // 13. The Magic School
    'ocean-explorer',         // 14. Ocean Explorer
    'time-machine',           // 15. The Time Machine
    'friendly-robot',         // 16. The Friendly Robot
    'secret-cave',            // 17. The Secret Cave
    'flying-carpet',          // 18. The Flying Carpet
    'lost-kingdom',           // 19. The Lost Kingdom
    'grand-adventure'         // 20. The Grand Adventure
  ]);

  // TEEN_KIDS_STORIES: ONLY these 20 stories appear in Teen Kids Advanced Vocabulary & Speaking Lab
  // Stories 1-10: Mystery Detective, Space Explorer, Environmental Hero, Tech Innovator,
  //              Global Citizen, Future Leader, Scientific Discovery, Social Media Expert,
  //              AI Ethics Explorer, Digital Security Guardian
  // Stories 11-20: Climate Action Leader, Startup Founder, International Diplomat, Medical Researcher,
  //                Social Impact Innovator, Data Science Analyst, Environmental Engineer,
  //                Content Creator Strategist, Ethical AI Developer, Global Innovation Summit
  private static TEEN_KIDS_STORIES = new Set([
    'mystery-detective',        // 1. Mystery Detective
    'space-explorer-teen',       // 2. Space Explorer
    'environmental-hero',        // 3. Environmental Hero
    'tech-innovator',            // 4. Tech Innovator
    'global-citizen',            // 5. Global Citizen
    'future-leader',             // 6. Future Leader
    'scientific-discovery',      // 7. Scientific Discovery
    'social-media-expert',       // 8. Social Media Expert
    'ai-ethics-explorer',        // 9. AI Ethics Explorer
    'digital-security-guardian', // 10. Digital Security Guardian
    // Template stories (11-20) for teen
    'climate-action',            // 11. Climate Action Leader
    'startup',                   // 12. Startup Founder
    'diplomacy',                 // 13. International Diplomat
    'medical-research',          // 14. Medical Researcher
    'social-impact',             // 15. Social Impact Innovator
    'data-science',              // 16. Data Science Analyst
    'engineering',               // 17. Environmental Engineer
    'content-strategy',          // 18. Content Creator Strategist
    'ethical-ai',                // 19. Ethical AI Developer
    'innovation-summit'          // 20. Global Innovation Summit
  ]);
  
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
    ],
    // Template stories (11-20) vocabulary for young kids
    'enchanted-garden': [
      { word: 'enchanted', hint: '✨ Say: en-CHANT-ed', emoji: '✨', storyId: 'enchanted-garden', storyTitle: 'The Enchanted Garden', difficulty: 'medium', category: 'fantasy' },
      { word: 'garden', hint: '🌺 Say: GAR-den', emoji: '🌺', storyId: 'enchanted-garden', storyTitle: 'The Enchanted Garden', difficulty: 'easy', category: 'places' },
      { word: 'bloom', hint: '🌸 Say: BLOOM', emoji: '🌸', storyId: 'enchanted-garden', storyTitle: 'The Enchanted Garden', difficulty: 'easy', category: 'actions' },
      { word: 'butterfly', hint: '🦋 Say: BUT-er-fly', emoji: '🦋', storyId: 'enchanted-garden', storyTitle: 'The Enchanted Garden', difficulty: 'easy', category: 'animals' },
      { word: 'wonder', hint: '🌟 Say: WUN-der', emoji: '🌟', storyId: 'enchanted-garden', storyTitle: 'The Enchanted Garden', difficulty: 'easy', category: 'emotions' },
      { word: 'peaceful', hint: '🕊️ Say: PEES-ful', emoji: '🕊️', storyId: 'enchanted-garden', storyTitle: 'The Enchanted Garden', difficulty: 'medium', category: 'descriptions' },
      { word: 'nature', hint: '🌿 Say: NAY-chur', emoji: '🌿', storyId: 'enchanted-garden', storyTitle: 'The Enchanted Garden', difficulty: 'medium', category: 'concepts' },
      { word: 'beautiful', hint: '💐 Say: BYOO-ti-ful', emoji: '💐', storyId: 'enchanted-garden', storyTitle: 'The Enchanted Garden', difficulty: 'medium', category: 'descriptions' }
    ],
    'dragons-treasure': [
      { word: 'dragon', hint: '🐉 Say: DRAG-un', emoji: '🐉', storyId: 'dragons-treasure', storyTitle: 'Dragon\'s Treasure', difficulty: 'easy', category: 'fantasy' },
      { word: 'treasure', hint: '💎 Say: TREZH-ur', emoji: '💎', storyId: 'dragons-treasure', storyTitle: 'Dragon\'s Treasure', difficulty: 'medium', category: 'objects' },
      { word: 'cave', hint: '🕳️ Say: KAYV', emoji: '🕳️', storyId: 'dragons-treasure', storyTitle: 'Dragon\'s Treasure', difficulty: 'easy', category: 'places' },
      { word: 'sparkle', hint: '✨ Say: SPAR-kul', emoji: '✨', storyId: 'dragons-treasure', storyTitle: 'Dragon\'s Treasure', difficulty: 'easy', category: 'actions' },
      { word: 'gold', hint: '🪙 Say: GOLD', emoji: '🪙', storyId: 'dragons-treasure', storyTitle: 'Dragon\'s Treasure', difficulty: 'easy', category: 'objects' },
      { word: 'friend', hint: '🤝 Say: FREND', emoji: '🤝', storyId: 'dragons-treasure', storyTitle: 'Dragon\'s Treasure', difficulty: 'easy', category: 'concepts' },
      { word: 'share', hint: '💝 Say: SHAIR', emoji: '💝', storyId: 'dragons-treasure', storyTitle: 'Dragon\'s Treasure', difficulty: 'easy', category: 'actions' },
      { word: 'kindness', hint: '💖 Say: KIND-ness', emoji: '💖', storyId: 'dragons-treasure', storyTitle: 'Dragon\'s Treasure', difficulty: 'medium', category: 'values' }
    ],
    'magic-school': [
      { word: 'school', hint: '🏫 Say: SKOOL', emoji: '🏫', storyId: 'magic-school', storyTitle: 'Magic School', difficulty: 'easy', category: 'places' },
      { word: 'learn', hint: '📚 Say: LURN', emoji: '📚', storyId: 'magic-school', storyTitle: 'Magic School', difficulty: 'easy', category: 'actions' },
      { word: 'teacher', hint: '👩‍🏫 Say: TEE-chur', emoji: '👩‍🏫', storyId: 'magic-school', storyTitle: 'Magic School', difficulty: 'easy', category: 'professions' },
      { word: 'spell', hint: '✨ Say: SPEL', emoji: '✨', storyId: 'magic-school', storyTitle: 'Magic School', difficulty: 'easy', category: 'concepts' },
      { word: 'book', hint: '📖 Say: BOOK', emoji: '📖', storyId: 'magic-school', storyTitle: 'Magic School', difficulty: 'easy', category: 'objects' },
      { word: 'wisdom', hint: '🧠 Say: WIZ-dum', emoji: '🧠', storyId: 'magic-school', storyTitle: 'Magic School', difficulty: 'medium', category: 'concepts' },
      { word: 'friends', hint: '👫 Say: FRENDZ', emoji: '👫', storyId: 'magic-school', storyTitle: 'Magic School', difficulty: 'easy', category: 'concepts' },
      { word: 'discover', hint: '🔍 Say: dis-KUV-er', emoji: '🔍', storyId: 'magic-school', storyTitle: 'Magic School', difficulty: 'medium', category: 'actions' }
    ],
    'ocean-explorer': [
      { word: 'ocean', hint: '🌊 Say: O-shun', emoji: '🌊', storyId: 'ocean-explorer', storyTitle: 'Ocean Explorer', difficulty: 'easy', category: 'places' },
      { word: 'dive', hint: '🤿 Say: DIV', emoji: '🤿', storyId: 'ocean-explorer', storyTitle: 'Ocean Explorer', difficulty: 'easy', category: 'actions' },
      { word: 'coral', hint: '🪸 Say: KOR-al', emoji: '🪸', storyId: 'ocean-explorer', storyTitle: 'Ocean Explorer', difficulty: 'easy', category: 'nature' },
      { word: 'fish', hint: '🐠 Say: FISH', emoji: '🐠', storyId: 'ocean-explorer', storyTitle: 'Ocean Explorer', difficulty: 'easy', category: 'animals' },
      { word: 'wave', hint: '🌊 Say: WAYV', emoji: '🌊', storyId: 'ocean-explorer', storyTitle: 'Ocean Explorer', difficulty: 'easy', category: 'nature' },
      { word: 'swim', hint: '🏊 Say: SWIM', emoji: '🏊', storyId: 'ocean-explorer', storyTitle: 'Ocean Explorer', difficulty: 'easy', category: 'actions' },
      { word: 'deep', hint: '🌑 Say: DEEP', emoji: '🌑', storyId: 'ocean-explorer', storyTitle: 'Ocean Explorer', difficulty: 'easy', category: 'descriptions' },
      { word: 'explore', hint: '🗺️ Say: eks-PLOR', emoji: '🗺️', storyId: 'ocean-explorer', storyTitle: 'Ocean Explorer', difficulty: 'medium', category: 'actions' }
    ],
    'time-machine': [
      { word: 'time', hint: '⏰ Say: TYM', emoji: '⏰', storyId: 'time-machine', storyTitle: 'Time Machine', difficulty: 'easy', category: 'concepts' },
      { word: 'machine', hint: '⚙️ Say: ma-SHEEN', emoji: '⚙️', storyId: 'time-machine', storyTitle: 'Time Machine', difficulty: 'medium', category: 'objects' },
      { word: 'past', hint: '⏪ Say: PAST', emoji: '⏪', storyId: 'time-machine', storyTitle: 'Time Machine', difficulty: 'easy', category: 'concepts' },
      { word: 'future', hint: '⏩ Say: FYOO-chur', emoji: '⏩', storyId: 'time-machine', storyTitle: 'Time Machine', difficulty: 'medium', category: 'concepts' },
      { word: 'journey', hint: '🚀 Say: JUR-nee', emoji: '🚀', storyId: 'time-machine', storyTitle: 'Time Machine', difficulty: 'medium', category: 'concepts' },
      { word: 'history', hint: '📜 Say: HIS-tor-ee', emoji: '📜', storyId: 'time-machine', storyTitle: 'Time Machine', difficulty: 'medium', category: 'concepts' },
      { word: 'adventure', hint: '🗺️ Say: ad-VEN-chur', emoji: '🗺️', storyId: 'time-machine', storyTitle: 'Time Machine', difficulty: 'medium', category: 'actions' },
      { word: 'discover', hint: '🔍 Say: dis-KUV-er', emoji: '🔍', storyId: 'time-machine', storyTitle: 'Time Machine', difficulty: 'medium', category: 'actions' }
    ],
    'friendly-robot': [
      { word: 'robot', hint: '🤖 Say: RO-bot', emoji: '🤖', storyId: 'friendly-robot', storyTitle: 'Friendly Robot', difficulty: 'easy', category: 'characters' },
      { word: 'friend', hint: '🤝 Say: FREND', emoji: '🤝', storyId: 'friendly-robot', storyTitle: 'Friendly Robot', difficulty: 'easy', category: 'concepts' },
      { word: 'help', hint: '🆘 Say: HELP', emoji: '🆘', storyId: 'friendly-robot', storyTitle: 'Friendly Robot', difficulty: 'easy', category: 'actions' },
      { word: 'kind', hint: '💝 Say: KYND', emoji: '💝', storyId: 'friendly-robot', storyTitle: 'Friendly Robot', difficulty: 'easy', category: 'descriptions' },
      { word: 'smart', hint: '🧠 Say: SMART', emoji: '🧠', storyId: 'friendly-robot', storyTitle: 'Friendly Robot', difficulty: 'easy', category: 'descriptions' },
      { word: 'play', hint: '🎮 Say: PLAY', emoji: '🎮', storyId: 'friendly-robot', storyTitle: 'Friendly Robot', difficulty: 'easy', category: 'actions' },
      { word: 'together', hint: '👥 Say: to-GETH-er', emoji: '👥', storyId: 'friendly-robot', storyTitle: 'Friendly Robot', difficulty: 'medium', category: 'concepts' },
      { word: 'teamwork', hint: '🤝 Say: TEAM-work', emoji: '🤝', storyId: 'friendly-robot', storyTitle: 'Friendly Robot', difficulty: 'medium', category: 'values' }
    ],
    'secret-cave': [
      { word: 'cave', hint: '🕳️ Say: KAYV', emoji: '🕳️', storyId: 'secret-cave', storyTitle: 'Secret Cave', difficulty: 'easy', category: 'places' },
      { word: 'secret', hint: '🤫 Say: SEE-kret', emoji: '🤫', storyId: 'secret-cave', storyTitle: 'Secret Cave', difficulty: 'easy', category: 'concepts' },
      { word: 'treasure', hint: '💎 Say: TREZH-ur', emoji: '💎', storyId: 'secret-cave', storyTitle: 'Secret Cave', difficulty: 'medium', category: 'objects' },
      { word: 'map', hint: '🗺️ Say: MAP', emoji: '🗺️', storyId: 'secret-cave', storyTitle: 'Secret Cave', difficulty: 'easy', category: 'objects' },
      { word: 'explore', hint: '🔍 Say: eks-PLOR', emoji: '🔍', storyId: 'secret-cave', storyTitle: 'Secret Cave', difficulty: 'medium', category: 'actions' },
      { word: 'brave', hint: '🦅 Say: BRAVE', emoji: '🦅', storyId: 'secret-cave', storyTitle: 'Secret Cave', difficulty: 'easy', category: 'descriptions' },
      { word: 'discover', hint: '🌟 Say: dis-KUV-er', emoji: '🌟', storyId: 'secret-cave', storyTitle: 'Secret Cave', difficulty: 'medium', category: 'actions' },
      { word: 'adventure', hint: '🗺️ Say: ad-VEN-chur', emoji: '🗺️', storyId: 'secret-cave', storyTitle: 'Secret Cave', difficulty: 'medium', category: 'actions' }
    ],
    'flying-carpet': [
      { word: 'carpet', hint: '毯 Say: KAR-pet', emoji: '毯', storyId: 'flying-carpet', storyTitle: 'Flying Carpet', difficulty: 'easy', category: 'objects' },
      { word: 'fly', hint: '✈️ Say: FLY', emoji: '✈️', storyId: 'flying-carpet', storyTitle: 'Flying Carpet', difficulty: 'easy', category: 'actions' },
      { word: 'sky', hint: '☁️ Say: SKY', emoji: '☁️', storyId: 'flying-carpet', storyTitle: 'Flying Carpet', difficulty: 'easy', category: 'places' },
      { word: 'cloud', hint: '☁️ Say: KLOWD', emoji: '☁️', storyId: 'flying-carpet', storyTitle: 'Flying Carpet', difficulty: 'easy', category: 'nature' },
      { word: 'wind', hint: '💨 Say: WIND', emoji: '💨', storyId: 'flying-carpet', storyTitle: 'Flying Carpet', difficulty: 'easy', category: 'nature' },
      { word: 'magic', hint: '✨ Say: MAJ-ik', emoji: '✨', storyId: 'flying-carpet', storyTitle: 'Flying Carpet', difficulty: 'easy', category: 'fantasy' },
      { word: 'journey', hint: '🚀 Say: JUR-nee', emoji: '🚀', storyId: 'flying-carpet', storyTitle: 'Flying Carpet', difficulty: 'medium', category: 'concepts' },
      { word: 'freedom', hint: '🕊️ Say: FREE-dum', emoji: '🕊️', storyId: 'flying-carpet', storyTitle: 'Flying Carpet', difficulty: 'medium', category: 'concepts' }
    ],
    'lost-kingdom': [
      { word: 'kingdom', hint: '🏰 Say: KING-dum', emoji: '🏰', storyId: 'lost-kingdom', storyTitle: 'Lost Kingdom', difficulty: 'medium', category: 'places' },
      { word: 'king', hint: '👑 Say: KING', emoji: '👑', storyId: 'lost-kingdom', storyTitle: 'Lost Kingdom', difficulty: 'easy', category: 'characters' },
      { word: 'queen', hint: '👸 Say: KWEEN', emoji: '👸', storyId: 'lost-kingdom', storyTitle: 'Lost Kingdom', difficulty: 'easy', category: 'characters' },
      { word: 'castle', hint: '🏰 Say: KAS-ul', emoji: '🏰', storyId: 'lost-kingdom', storyTitle: 'Lost Kingdom', difficulty: 'easy', category: 'places' },
      { word: 'find', hint: '🔍 Say: FYND', emoji: '🔍', storyId: 'lost-kingdom', storyTitle: 'Lost Kingdom', difficulty: 'easy', category: 'actions' },
      { word: 'rescue', hint: '🚁 Say: RES-kyoo', emoji: '🚁', storyId: 'lost-kingdom', storyTitle: 'Lost Kingdom', difficulty: 'medium', category: 'actions' },
      { word: 'brave', hint: '🦅 Say: BRAVE', emoji: '🦅', storyId: 'lost-kingdom', storyTitle: 'Lost Kingdom', difficulty: 'easy', category: 'descriptions' },
      { word: 'hero', hint: '🦸 Say: HEER-oh', emoji: '🦸', storyId: 'lost-kingdom', storyTitle: 'Lost Kingdom', difficulty: 'easy', category: 'characters' }
    ],
    'grand-adventure': [
      { word: 'adventure', hint: '🗺️ Say: ad-VEN-chur', emoji: '🗺️', storyId: 'grand-adventure', storyTitle: 'Grand Adventure', difficulty: 'medium', category: 'actions' },
      { word: 'journey', hint: '🚀 Say: JUR-nee', emoji: '🚀', storyId: 'grand-adventure', storyTitle: 'Grand Adventure', difficulty: 'medium', category: 'concepts' },
      { word: 'brave', hint: '🦅 Say: BRAVE', emoji: '🦅', storyId: 'grand-adventure', storyTitle: 'Grand Adventure', difficulty: 'easy', category: 'descriptions' },
      { word: 'friends', hint: '👫 Say: FRENDZ', emoji: '👫', storyId: 'grand-adventure', storyTitle: 'Grand Adventure', difficulty: 'easy', category: 'concepts' },
      { word: 'discover', hint: '🔍 Say: dis-KUV-er', emoji: '🔍', storyId: 'grand-adventure', storyTitle: 'Grand Adventure', difficulty: 'medium', category: 'actions' },
      { word: 'explore', hint: '🗺️ Say: eks-PLOR', emoji: '🗺️', storyId: 'grand-adventure', storyTitle: 'Grand Adventure', difficulty: 'medium', category: 'actions' },
      { word: 'victory', hint: '🏆 Say: VIK-tor-ee', emoji: '🏆', storyId: 'grand-adventure', storyTitle: 'Grand Adventure', difficulty: 'medium', category: 'concepts' },
      { word: 'celebration', hint: '🎉 Say: sel-eh-BRAY-shun', emoji: '🎉', storyId: 'grand-adventure', storyTitle: 'Grand Adventure', difficulty: 'medium', category: 'concepts' }
    ],
    // Teen stories vocabulary
    'mystery-detective': [
      { word: 'investigate', hint: '🔍 Say: in-VES-ti-gate', emoji: '🔍', storyId: 'mystery-detective', storyTitle: 'Mystery Detective', difficulty: 'hard', category: 'actions' },
      { word: 'evidence', hint: '📋 Say: EV-i-dens', emoji: '📋', storyId: 'mystery-detective', storyTitle: 'Mystery Detective', difficulty: 'hard', category: 'concepts' },
      { word: 'detective', hint: '🕵️ Say: de-TEK-tiv', emoji: '🕵️', storyId: 'mystery-detective', storyTitle: 'Mystery Detective', difficulty: 'medium', category: 'professions' },
      { word: 'mystery', hint: '❓ Say: MIS-ter-ee', emoji: '❓', storyId: 'mystery-detective', storyTitle: 'Mystery Detective', difficulty: 'medium', category: 'concepts' },
      { word: 'analyze', hint: '🧠 Say: AN-a-lyz', emoji: '🧠', storyId: 'mystery-detective', storyTitle: 'Mystery Detective', difficulty: 'hard', category: 'actions' },
      { word: 'clue', hint: '🔎 Say: KLOO', emoji: '🔎', storyId: 'mystery-detective', storyTitle: 'Mystery Detective', difficulty: 'easy', category: 'concepts' },
      { word: 'suspect', hint: '👤 Say: sus-PEKT', emoji: '👤', storyId: 'mystery-detective', storyTitle: 'Mystery Detective', difficulty: 'medium', category: 'concepts' },
      { word: 'deduction', hint: '💭 Say: de-DUK-shun', emoji: '💭', storyId: 'mystery-detective', storyTitle: 'Mystery Detective', difficulty: 'hard', category: 'concepts' }
    ],
    'space-explorer-teen': [
      { word: 'astronaut', hint: '👨‍🚀 Say: AS-tro-not', emoji: '👨‍🚀', storyId: 'space-explorer-teen', storyTitle: 'Space Explorer', difficulty: 'medium', category: 'professions' },
      { word: 'galaxy', hint: '🌌 Say: GAL-ax-ee', emoji: '🌌', storyId: 'space-explorer-teen', storyTitle: 'Space Explorer', difficulty: 'medium', category: 'space' },
      { word: 'mission', hint: '🎯 Say: MISH-un', emoji: '🎯', storyId: 'space-explorer-teen', storyTitle: 'Space Explorer', difficulty: 'medium', category: 'concepts' },
      { word: 'exploration', hint: '🔭 Say: eks-plor-AY-shun', emoji: '🔭', storyId: 'space-explorer-teen', storyTitle: 'Space Explorer', difficulty: 'hard', category: 'actions' },
      { word: 'scientific', hint: '🔬 Say: sy-en-TIF-ik', emoji: '🔬', storyId: 'space-explorer-teen', storyTitle: 'Space Explorer', difficulty: 'hard', category: 'descriptions' },
      { word: 'discovery', hint: '🌟 Say: dis-KUV-er-ee', emoji: '🌟', storyId: 'space-explorer-teen', storyTitle: 'Space Explorer', difficulty: 'medium', category: 'concepts' },
      { word: 'research', hint: '📊 Say: re-SURCH', emoji: '📊', storyId: 'space-explorer-teen', storyTitle: 'Space Explorer', difficulty: 'medium', category: 'actions' },
      { word: 'navigation', hint: '🧭 Say: nav-i-GAY-shun', emoji: '🧭', storyId: 'space-explorer-teen', storyTitle: 'Space Explorer', difficulty: 'hard', category: 'actions' }
    ],
    'environmental-hero': [
      { word: 'environment', hint: '🌍 Say: en-VY-ron-ment', emoji: '🌍', storyId: 'environmental-hero', storyTitle: 'Environmental Hero', difficulty: 'medium', category: 'concepts' },
      { word: 'sustainability', hint: '♻️ Say: sus-tain-a-BIL-i-ty', emoji: '♻️', storyId: 'environmental-hero', storyTitle: 'Environmental Hero', difficulty: 'hard', category: 'concepts' },
      { word: 'climate', hint: '🌡️ Say: KLY-mit', emoji: '🌡️', storyId: 'environmental-hero', storyTitle: 'Environmental Hero', difficulty: 'medium', category: 'nature' },
      { word: 'conservation', hint: '🌳 Say: kon-ser-VAY-shun', emoji: '🌳', storyId: 'environmental-hero', storyTitle: 'Environmental Hero', difficulty: 'hard', category: 'actions' },
      { word: 'renewable', hint: '⚡ Say: re-NYOO-a-bul', emoji: '⚡', storyId: 'environmental-hero', storyTitle: 'Environmental Hero', difficulty: 'hard', category: 'descriptions' },
      { word: 'ecosystem', hint: '🌿 Say: EE-ko-sis-tem', emoji: '🌿', storyId: 'environmental-hero', storyTitle: 'Environmental Hero', difficulty: 'hard', category: 'concepts' },
      { word: 'pollution', hint: '🏭 Say: pol-LOO-shun', emoji: '🏭', storyId: 'environmental-hero', storyTitle: 'Environmental Hero', difficulty: 'medium', category: 'concepts' },
      { word: 'recycling', hint: '♻️ Say: re-SY-kling', emoji: '♻️', storyId: 'environmental-hero', storyTitle: 'Environmental Hero', difficulty: 'medium', category: 'actions' }
    ],
    'tech-innovator': [
      { word: 'technology', hint: '💻 Say: tek-NOL-o-gy', emoji: '💻', storyId: 'tech-innovator', storyTitle: 'Tech Innovator', difficulty: 'medium', category: 'concepts' },
      { word: 'innovation', hint: '💡 Say: in-no-VAY-shun', emoji: '💡', storyId: 'tech-innovator', storyTitle: 'Tech Innovator', difficulty: 'hard', category: 'concepts' },
      { word: 'software', hint: '📱 Say: SOFT-wair', emoji: '📱', storyId: 'tech-innovator', storyTitle: 'Tech Innovator', difficulty: 'medium', category: 'objects' },
      { word: 'algorithm', hint: '⚙️ Say: AL-go-rith-um', emoji: '⚙️', storyId: 'tech-innovator', storyTitle: 'Tech Innovator', difficulty: 'hard', category: 'concepts' },
      { word: 'digital', hint: '💾 Say: DIJ-i-tal', emoji: '💾', storyId: 'tech-innovator', storyTitle: 'Tech Innovator', difficulty: 'medium', category: 'descriptions' },
      { word: 'programming', hint: '⌨️ Say: PRO-gram-ing', emoji: '⌨️', storyId: 'tech-innovator', storyTitle: 'Tech Innovator', difficulty: 'hard', category: 'actions' },
      { word: 'application', hint: '📲 Say: ap-li-KAY-shun', emoji: '📲', storyId: 'tech-innovator', storyTitle: 'Tech Innovator', difficulty: 'hard', category: 'objects' },
      { word: 'development', hint: '🚀 Say: de-VEL-op-ment', emoji: '🚀', storyId: 'tech-innovator', storyTitle: 'Tech Innovator', difficulty: 'hard', category: 'actions' }
    ],
    'global-citizen': [
      { word: 'culture', hint: '🌍 Say: KUL-chur', emoji: '🌍', storyId: 'global-citizen', storyTitle: 'Global Citizen', difficulty: 'medium', category: 'concepts' },
      { word: 'diversity', hint: '🌈 Say: di-VUR-si-ty', emoji: '🌈', storyId: 'global-citizen', storyTitle: 'Global Citizen', difficulty: 'hard', category: 'concepts' },
      { word: 'communication', hint: '💬 Say: com-mu-ni-KAY-shun', emoji: '💬', storyId: 'global-citizen', storyTitle: 'Global Citizen', difficulty: 'hard', category: 'actions' },
      { word: 'globalization', hint: '🌐 Say: glo-bal-i-ZAY-shun', emoji: '🌐', storyId: 'global-citizen', storyTitle: 'Global Citizen', difficulty: 'hard', category: 'concepts' },
      { word: 'tolerance', hint: '🤝 Say: TOL-er-ans', emoji: '🤝', storyId: 'global-citizen', storyTitle: 'Global Citizen', difficulty: 'medium', category: 'values' },
      { word: 'perspective', hint: '👁️ Say: per-SPEK-tiv', emoji: '👁️', storyId: 'global-citizen', storyTitle: 'Global Citizen', difficulty: 'hard', category: 'concepts' },
      { word: 'international', hint: '🌎 Say: in-ter-NASH-un-al', emoji: '🌎', storyId: 'global-citizen', storyTitle: 'Global Citizen', difficulty: 'hard', category: 'descriptions' },
      { word: 'cooperation', hint: '🤲 Say: co-op-er-AY-shun', emoji: '🤲', storyId: 'global-citizen', storyTitle: 'Global Citizen', difficulty: 'hard', category: 'actions' }
    ],
    'future-leader': [
      { word: 'leadership', hint: '👑 Say: LEE-der-ship', emoji: '👑', storyId: 'future-leader', storyTitle: 'Future Leader', difficulty: 'medium', category: 'concepts' },
      { word: 'responsibility', hint: '⚖️ Say: re-spon-si-BIL-i-ty', emoji: '⚖️', storyId: 'future-leader', storyTitle: 'Future Leader', difficulty: 'hard', category: 'values' },
      { word: 'decision', hint: '🎯 Say: de-SIZH-un', emoji: '🎯', storyId: 'future-leader', storyTitle: 'Future Leader', difficulty: 'medium', category: 'concepts' },
      { word: 'influence', hint: '💪 Say: IN-floo-ens', emoji: '💪', storyId: 'future-leader', storyTitle: 'Future Leader', difficulty: 'hard', category: 'actions' },
      { word: 'vision', hint: '👁️ Say: VIZH-un', emoji: '👁️', storyId: 'future-leader', storyTitle: 'Future Leader', difficulty: 'medium', category: 'concepts' },
      { word: 'strategy', hint: '📊 Say: STRAT-e-jee', emoji: '📊', storyId: 'future-leader', storyTitle: 'Future Leader', difficulty: 'hard', category: 'concepts' },
      { word: 'motivation', hint: '🔥 Say: mo-ti-VAY-shun', emoji: '🔥', storyId: 'future-leader', storyTitle: 'Future Leader', difficulty: 'hard', category: 'concepts' },
      { word: 'empowerment', hint: '⚡ Say: em-POW-er-ment', emoji: '⚡', storyId: 'future-leader', storyTitle: 'Future Leader', difficulty: 'hard', category: 'concepts' }
    ],
    'scientific-discovery': [
      { word: 'scientific', hint: '🔬 Say: sy-en-TIF-ik', emoji: '🔬', storyId: 'scientific-discovery', storyTitle: 'Scientific Discovery', difficulty: 'hard', category: 'descriptions' },
      { word: 'hypothesis', hint: '🧪 Say: hy-POTH-e-sis', emoji: '🧪', storyId: 'scientific-discovery', storyTitle: 'Scientific Discovery', difficulty: 'hard', category: 'concepts' },
      { word: 'experiment', hint: '⚗️ Say: eks-PER-i-ment', emoji: '⚗️', storyId: 'scientific-discovery', storyTitle: 'Scientific Discovery', difficulty: 'hard', category: 'concepts' },
      { word: 'analysis', hint: '📈 Say: a-NAL-i-sis', emoji: '📈', storyId: 'scientific-discovery', storyTitle: 'Scientific Discovery', difficulty: 'hard', category: 'actions' },
      { word: 'methodology', hint: '📚 Say: meth-o-DOL-o-gy', emoji: '📚', storyId: 'scientific-discovery', storyTitle: 'Scientific Discovery', difficulty: 'hard', category: 'concepts' },
      { word: 'observation', hint: '👀 Say: ob-ser-VAY-shun', emoji: '👀', storyId: 'scientific-discovery', storyTitle: 'Scientific Discovery', difficulty: 'hard', category: 'actions' },
      { word: 'research', hint: '📊 Say: re-SURCH', emoji: '📊', storyId: 'scientific-discovery', storyTitle: 'Scientific Discovery', difficulty: 'medium', category: 'actions' },
      { word: 'conclusion', hint: '✅ Say: kon-KLOO-zhun', emoji: '✅', storyId: 'scientific-discovery', storyTitle: 'Scientific Discovery', difficulty: 'hard', category: 'concepts' }
    ],
    'social-media-expert': [
      { word: 'digital', hint: '📱 Say: DIJ-i-tal', emoji: '📱', storyId: 'social-media-expert', storyTitle: 'Social Media Expert', difficulty: 'medium', category: 'descriptions' },
      { word: 'platform', hint: '💻 Say: PLAT-form', emoji: '💻', storyId: 'social-media-expert', storyTitle: 'Social Media Expert', difficulty: 'medium', category: 'concepts' },
      { word: 'network', hint: '🌐 Say: NET-work', emoji: '🌐', storyId: 'social-media-expert', storyTitle: 'Social Media Expert', difficulty: 'medium', category: 'concepts' },
      { word: 'privacy', hint: '🔒 Say: PRY-va-see', emoji: '🔒', storyId: 'social-media-expert', storyTitle: 'Social Media Expert', difficulty: 'medium', category: 'concepts' },
      { word: 'security', hint: '🛡️ Say: se-KYUR-i-ty', emoji: '🛡️', storyId: 'social-media-expert', storyTitle: 'Social Media Expert', difficulty: 'medium', category: 'concepts' },
      { word: 'content', hint: '📝 Say: KON-tent', emoji: '📝', storyId: 'social-media-expert', storyTitle: 'Social Media Expert', difficulty: 'medium', category: 'concepts' },
      { word: 'engagement', hint: '💬 Say: en-GAYJ-ment', emoji: '💬', storyId: 'social-media-expert', storyTitle: 'Social Media Expert', difficulty: 'hard', category: 'concepts' },
      { word: 'authentic', hint: '✨ Say: aw-THEN-tik', emoji: '✨', storyId: 'social-media-expert', storyTitle: 'Social Media Expert', difficulty: 'hard', category: 'descriptions' }
    ],
    'ai-ethics-explorer': [
      { word: 'artificial', hint: '🤖 Say: ar-ti-FISH-al', emoji: '🤖', storyId: 'ai-ethics-explorer', storyTitle: 'AI Ethics Explorer', difficulty: 'hard', category: 'descriptions' },
      { word: 'intelligence', hint: '🧠 Say: in-TEL-i-jens', emoji: '🧠', storyId: 'ai-ethics-explorer', storyTitle: 'AI Ethics Explorer', difficulty: 'hard', category: 'concepts' },
      { word: 'ethics', hint: '⚖️ Say: ETH-iks', emoji: '⚖️', storyId: 'ai-ethics-explorer', storyTitle: 'AI Ethics Explorer', difficulty: 'medium', category: 'concepts' },
      { word: 'algorithm', hint: '⚙️ Say: AL-go-rith-um', emoji: '⚙️', storyId: 'ai-ethics-explorer', storyTitle: 'AI Ethics Explorer', difficulty: 'hard', category: 'concepts' },
      { word: 'bias', hint: '⚡ Say: BY-us', emoji: '⚡', storyId: 'ai-ethics-explorer', storyTitle: 'AI Ethics Explorer', difficulty: 'medium', category: 'concepts' },
      { word: 'transparency', hint: '🔍 Say: trans-PAIR-en-see', emoji: '🔍', storyId: 'ai-ethics-explorer', storyTitle: 'AI Ethics Explorer', difficulty: 'hard', category: 'concepts' },
      { word: 'accountability', hint: '📋 Say: a-kown-ta-BIL-i-ty', emoji: '📋', storyId: 'ai-ethics-explorer', storyTitle: 'AI Ethics Explorer', difficulty: 'hard', category: 'concepts' },
      { word: 'machine', hint: '⚙️ Say: ma-SHEEN', emoji: '⚙️', storyId: 'ai-ethics-explorer', storyTitle: 'AI Ethics Explorer', difficulty: 'medium', category: 'concepts' }
    ],
    'digital-security-guardian': [
      { word: 'security', hint: '🔒 Say: se-KYUR-i-ty', emoji: '🔒', storyId: 'digital-security-guardian', storyTitle: 'Digital Security Guardian', difficulty: 'medium', category: 'concepts' },
      { word: 'encryption', hint: '🔐 Say: en-KRIP-shun', emoji: '🔐', storyId: 'digital-security-guardian', storyTitle: 'Digital Security Guardian', difficulty: 'hard', category: 'concepts' },
      { word: 'password', hint: '🔑 Say: PAS-wurd', emoji: '🔑', storyId: 'digital-security-guardian', storyTitle: 'Digital Security Guardian', difficulty: 'medium', category: 'objects' },
      { word: 'authentication', hint: '🛡️ Say: aw-then-ti-KAY-shun', emoji: '🛡️', storyId: 'digital-security-guardian', storyTitle: 'Digital Security Guardian', difficulty: 'hard', category: 'concepts' },
      { word: 'vulnerability', hint: '⚠️ Say: vul-ner-a-BIL-i-ty', emoji: '⚠️', storyId: 'digital-security-guardian', storyTitle: 'Digital Security Guardian', difficulty: 'hard', category: 'concepts' },
      { word: 'protection', hint: '🛡️ Say: pro-TEK-shun', emoji: '🛡️', storyId: 'digital-security-guardian', storyTitle: 'Digital Security Guardian', difficulty: 'medium', category: 'actions' },
      { word: 'cybersecurity', hint: '🔐 Say: sy-ber-se-KYUR-i-ty', emoji: '🔐', storyId: 'digital-security-guardian', storyTitle: 'Digital Security Guardian', difficulty: 'hard', category: 'concepts' },
      { word: 'firewall', hint: '🔥🧱 Say: FYR-wawl', emoji: '🔥🧱', storyId: 'digital-security-guardian', storyTitle: 'Digital Security Guardian', difficulty: 'hard', category: 'concepts' }
    ],
    // Template stories (11-20) vocabulary for teen kids
    'climate-action': [
      { word: 'climate', hint: '🌡️ Say: KLY-mit', emoji: '🌡️', storyId: 'climate-action', storyTitle: 'Climate Action', difficulty: 'medium', category: 'concepts' },
      { word: 'sustainability', hint: '♻️ Say: sus-tain-a-BIL-i-ty', emoji: '♻️', storyId: 'climate-action', storyTitle: 'Climate Action', difficulty: 'hard', category: 'concepts' },
      { word: 'environment', hint: '🌍 Say: en-VY-ron-ment', emoji: '🌍', storyId: 'climate-action', storyTitle: 'Climate Action', difficulty: 'medium', category: 'concepts' },
      { word: 'conservation', hint: '🌳 Say: kon-ser-VAY-shun', emoji: '🌳', storyId: 'climate-action', storyTitle: 'Climate Action', difficulty: 'hard', category: 'actions' },
      { word: 'renewable', hint: '⚡ Say: re-NYOO-a-bul', emoji: '⚡', storyId: 'climate-action', storyTitle: 'Climate Action', difficulty: 'hard', category: 'descriptions' },
      { word: 'impact', hint: '💥 Say: IM-pakt', emoji: '💥', storyId: 'climate-action', storyTitle: 'Climate Action', difficulty: 'medium', category: 'concepts' },
      { word: 'solution', hint: '💡 Say: so-LOO-shun', emoji: '💡', storyId: 'climate-action', storyTitle: 'Climate Action', difficulty: 'medium', category: 'concepts' },
      { word: 'advocacy', hint: '📢 Say: AD-vo-ka-see', emoji: '📢', storyId: 'climate-action', storyTitle: 'Climate Action', difficulty: 'hard', category: 'actions' }
    ],
    'startup': [
      { word: 'startup', hint: '🚀 Say: START-up', emoji: '🚀', storyId: 'startup', storyTitle: 'Startup', difficulty: 'medium', category: 'concepts' },
      { word: 'entrepreneur', hint: '💼 Say: on-tre-pre-NUR', emoji: '💼', storyId: 'startup', storyTitle: 'Startup', difficulty: 'hard', category: 'professions' },
      { word: 'innovation', hint: '💡 Say: in-no-VAY-shun', emoji: '💡', storyId: 'startup', storyTitle: 'Startup', difficulty: 'hard', category: 'concepts' },
      { word: 'business', hint: '🏢 Say: BIZ-ness', emoji: '🏢', storyId: 'startup', storyTitle: 'Startup', difficulty: 'medium', category: 'concepts' },
      { word: 'strategy', hint: '📊 Say: STRAT-e-jee', emoji: '📊', storyId: 'startup', storyTitle: 'Startup', difficulty: 'hard', category: 'concepts' },
      { word: 'pitch', hint: '🎯 Say: PICH', emoji: '🎯', storyId: 'startup', storyTitle: 'Startup', difficulty: 'medium', category: 'actions' },
      { word: 'investment', hint: '💰 Say: in-VEST-ment', emoji: '💰', storyId: 'startup', storyTitle: 'Startup', difficulty: 'hard', category: 'concepts' },
      { word: 'growth', hint: '📈 Say: GROTH', emoji: '📈', storyId: 'startup', storyTitle: 'Startup', difficulty: 'medium', category: 'concepts' }
    ],
    'diplomacy': [
      { word: 'diplomacy', hint: '🤝 Say: di-PLO-ma-see', emoji: '🤝', storyId: 'diplomacy', storyTitle: 'Diplomacy', difficulty: 'hard', category: 'concepts' },
      { word: 'negotiation', hint: '💬 Say: ne-go-shi-AY-shun', emoji: '💬', storyId: 'diplomacy', storyTitle: 'Diplomacy', difficulty: 'hard', category: 'actions' },
      { word: 'treaty', hint: '📜 Say: TREE-tee', emoji: '📜', storyId: 'diplomacy', storyTitle: 'Diplomacy', difficulty: 'medium', category: 'concepts' },
      { word: 'alliance', hint: '🤝 Say: a-LY-ans', emoji: '🤝', storyId: 'diplomacy', storyTitle: 'Diplomacy', difficulty: 'hard', category: 'concepts' },
      { word: 'mediation', hint: '⚖️ Say: mee-dee-AY-shun', emoji: '⚖️', storyId: 'diplomacy', storyTitle: 'Diplomacy', difficulty: 'hard', category: 'actions' },
      { word: 'consensus', hint: '✅ Say: kon-SEN-sus', emoji: '✅', storyId: 'diplomacy', storyTitle: 'Diplomacy', difficulty: 'hard', category: 'concepts' },
      { word: 'international', hint: '🌎 Say: in-ter-NASH-un-al', emoji: '🌎', storyId: 'diplomacy', storyTitle: 'Diplomacy', difficulty: 'hard', category: 'descriptions' },
      { word: 'cooperation', hint: '🤲 Say: co-op-er-AY-shun', emoji: '🤲', storyId: 'diplomacy', storyTitle: 'Diplomacy', difficulty: 'hard', category: 'actions' }
    ],
    'medical-research': [
      { word: 'medical', hint: '🏥 Say: MED-i-kal', emoji: '🏥', storyId: 'medical-research', storyTitle: 'Medical Research', difficulty: 'medium', category: 'descriptions' },
      { word: 'research', hint: '📊 Say: re-SURCH', emoji: '📊', storyId: 'medical-research', storyTitle: 'Medical Research', difficulty: 'medium', category: 'actions' },
      { word: 'treatment', hint: '💊 Say: TREET-ment', emoji: '💊', storyId: 'medical-research', storyTitle: 'Medical Research', difficulty: 'medium', category: 'concepts' },
      { word: 'clinical', hint: '🔬 Say: KLIN-i-kal', emoji: '🔬', storyId: 'medical-research', storyTitle: 'Medical Research', difficulty: 'hard', category: 'descriptions' },
      { word: 'diagnosis', hint: '🩺 Say: dy-ag-NO-sis', emoji: '🩺', storyId: 'medical-research', storyTitle: 'Medical Research', difficulty: 'hard', category: 'concepts' },
      { word: 'therapy', hint: '💉 Say: THER-a-pee', emoji: '💉', storyId: 'medical-research', storyTitle: 'Medical Research', difficulty: 'medium', category: 'concepts' },
      { word: 'patient', hint: '👤 Say: PAY-shunt', emoji: '👤', storyId: 'medical-research', storyTitle: 'Medical Research', difficulty: 'medium', category: 'concepts' },
      { word: 'discovery', hint: '🌟 Say: dis-KUV-er-ee', emoji: '🌟', storyId: 'medical-research', storyTitle: 'Medical Research', difficulty: 'medium', category: 'concepts' }
    ],
    'social-impact': [
      { word: 'social', hint: '👥 Say: SO-shul', emoji: '👥', storyId: 'social-impact', storyTitle: 'Social Impact', difficulty: 'medium', category: 'descriptions' },
      { word: 'impact', hint: '💥 Say: IM-pakt', emoji: '💥', storyId: 'social-impact', storyTitle: 'Social Impact', difficulty: 'medium', category: 'concepts' },
      { word: 'community', hint: '🏘️ Say: kom-YOO-ni-tee', emoji: '🏘️', storyId: 'social-impact', storyTitle: 'Social Impact', difficulty: 'medium', category: 'concepts' },
      { word: 'initiative', hint: '🚀 Say: in-ISH-ee-a-tiv', emoji: '🚀', storyId: 'social-impact', storyTitle: 'Social Impact', difficulty: 'hard', category: 'concepts' },
      { word: 'volunteer', hint: '🤝 Say: vol-un-TEER', emoji: '🤝', storyId: 'social-impact', storyTitle: 'Social Impact', difficulty: 'medium', category: 'actions' },
      { word: 'empowerment', hint: '⚡ Say: em-POW-er-ment', emoji: '⚡', storyId: 'social-impact', storyTitle: 'Social Impact', difficulty: 'hard', category: 'concepts' },
      { word: 'advocacy', hint: '📢 Say: AD-vo-ka-see', emoji: '📢', storyId: 'social-impact', storyTitle: 'Social Impact', difficulty: 'hard', category: 'actions' },
      { word: 'change', hint: '🔄 Say: CHAYNJ', emoji: '🔄', storyId: 'social-impact', storyTitle: 'Social Impact', difficulty: 'easy', category: 'concepts' }
    ],
    'data-science': [
      { word: 'data', hint: '📊 Say: DAY-ta', emoji: '📊', storyId: 'data-science', storyTitle: 'Data Science', difficulty: 'medium', category: 'concepts' },
      { word: 'science', hint: '🔬 Say: SY-ens', emoji: '🔬', storyId: 'data-science', storyTitle: 'Data Science', difficulty: 'medium', category: 'concepts' },
      { word: 'analysis', hint: '📈 Say: a-NAL-i-sis', emoji: '📈', storyId: 'data-science', storyTitle: 'Data Science', difficulty: 'hard', category: 'actions' },
      { word: 'algorithm', hint: '⚙️ Say: AL-go-rith-um', emoji: '⚙️', storyId: 'data-science', storyTitle: 'Data Science', difficulty: 'hard', category: 'concepts' },
      { word: 'statistics', hint: '📉 Say: sta-TIS-tiks', emoji: '📉', storyId: 'data-science', storyTitle: 'Data Science', difficulty: 'hard', category: 'concepts' },
      { word: 'insight', hint: '💡 Say: IN-syt', emoji: '💡', storyId: 'data-science', storyTitle: 'Data Science', difficulty: 'medium', category: 'concepts' },
      { word: 'pattern', hint: '🔍 Say: PAT-ern', emoji: '🔍', storyId: 'data-science', storyTitle: 'Data Science', difficulty: 'medium', category: 'concepts' },
      { word: 'prediction', hint: '🔮 Say: pre-DIK-shun', emoji: '🔮', storyId: 'data-science', storyTitle: 'Data Science', difficulty: 'hard', category: 'concepts' }
    ],
    'engineering': [
      { word: 'engineering', hint: '⚙️ Say: en-jin-EER-ing', emoji: '⚙️', storyId: 'engineering', storyTitle: 'Engineering', difficulty: 'hard', category: 'concepts' },
      { word: 'design', hint: '📐 Say: de-ZYN', emoji: '📐', storyId: 'engineering', storyTitle: 'Engineering', difficulty: 'medium', category: 'actions' },
      { word: 'construction', hint: '🏗️ Say: kon-STRUK-shun', emoji: '🏗️', storyId: 'engineering', storyTitle: 'Engineering', difficulty: 'hard', category: 'concepts' },
      { word: 'structure', hint: '🏛️ Say: STRUK-chur', emoji: '🏛️', storyId: 'engineering', storyTitle: 'Engineering', difficulty: 'medium', category: 'concepts' },
      { word: 'innovation', hint: '💡 Say: in-no-VAY-shun', emoji: '💡', storyId: 'engineering', storyTitle: 'Engineering', difficulty: 'hard', category: 'concepts' },
      { word: 'prototype', hint: '🔧 Say: PRO-to-typ', emoji: '🔧', storyId: 'engineering', storyTitle: 'Engineering', difficulty: 'hard', category: 'concepts' },
      { word: 'solution', hint: '💡 Say: so-LOO-shun', emoji: '💡', storyId: 'engineering', storyTitle: 'Engineering', difficulty: 'medium', category: 'concepts' },
      { word: 'technical', hint: '🔧 Say: TEK-ni-kal', emoji: '🔧', storyId: 'engineering', storyTitle: 'Engineering', difficulty: 'hard', category: 'descriptions' }
    ],
    'content-strategy': [
      { word: 'content', hint: '📝 Say: KON-tent', emoji: '📝', storyId: 'content-strategy', storyTitle: 'Content Strategy', difficulty: 'medium', category: 'concepts' },
      { word: 'strategy', hint: '📊 Say: STRAT-e-jee', emoji: '📊', storyId: 'content-strategy', storyTitle: 'Content Strategy', difficulty: 'hard', category: 'concepts' },
      { word: 'marketing', hint: '📢 Say: MAR-ket-ing', emoji: '📢', storyId: 'content-strategy', storyTitle: 'Content Strategy', difficulty: 'medium', category: 'concepts' },
      { word: 'audience', hint: '👥 Say: AW-dee-ens', emoji: '👥', storyId: 'content-strategy', storyTitle: 'Content Strategy', difficulty: 'medium', category: 'concepts' },
      { word: 'engagement', hint: '💬 Say: en-GAYJ-ment', emoji: '💬', storyId: 'content-strategy', storyTitle: 'Content Strategy', difficulty: 'hard', category: 'concepts' },
      { word: 'brand', hint: '🏷️ Say: BRAND', emoji: '🏷️', storyId: 'content-strategy', storyTitle: 'Content Strategy', difficulty: 'medium', category: 'concepts' },
      { word: 'campaign', hint: '📣 Say: kam-PAYN', emoji: '📣', storyId: 'content-strategy', storyTitle: 'Content Strategy', difficulty: 'medium', category: 'concepts' },
      { word: 'message', hint: '💬 Say: MES-ij', emoji: '💬', storyId: 'content-strategy', storyTitle: 'Content Strategy', difficulty: 'medium', category: 'concepts' }
    ],
    'ethical-ai': [
      { word: 'ethical', hint: '⚖️ Say: ETH-i-kal', emoji: '⚖️', storyId: 'ethical-ai', storyTitle: 'Ethical AI', difficulty: 'hard', category: 'descriptions' },
      { word: 'artificial', hint: '🤖 Say: ar-ti-FISH-al', emoji: '🤖', storyId: 'ethical-ai', storyTitle: 'Ethical AI', difficulty: 'hard', category: 'descriptions' },
      { word: 'intelligence', hint: '🧠 Say: in-TEL-i-jens', emoji: '🧠', storyId: 'ethical-ai', storyTitle: 'Ethical AI', difficulty: 'hard', category: 'concepts' },
      { word: 'responsibility', hint: '⚖️ Say: re-spon-si-BIL-i-ty', emoji: '⚖️', storyId: 'ethical-ai', storyTitle: 'Ethical AI', difficulty: 'hard', category: 'values' },
      { word: 'transparency', hint: '🔍 Say: trans-PAIR-en-see', emoji: '🔍', storyId: 'ethical-ai', storyTitle: 'Ethical AI', difficulty: 'hard', category: 'concepts' },
      { word: 'fairness', hint: '⚖️ Say: FAIR-ness', emoji: '⚖️', storyId: 'ethical-ai', storyTitle: 'Ethical AI', difficulty: 'medium', category: 'concepts' },
      { word: 'accountability', hint: '📋 Say: a-kown-ta-BIL-i-ty', emoji: '📋', storyId: 'ethical-ai', storyTitle: 'Ethical AI', difficulty: 'hard', category: 'concepts' },
      { word: 'governance', hint: '🏛️ Say: GUV-ern-ans', emoji: '🏛️', storyId: 'ethical-ai', storyTitle: 'Ethical AI', difficulty: 'hard', category: 'concepts' }
    ],
    'innovation-summit': [
      { word: 'innovation', hint: '💡 Say: in-no-VAY-shun', emoji: '💡', storyId: 'innovation-summit', storyTitle: 'Innovation Summit', difficulty: 'hard', category: 'concepts' },
      { word: 'summit', hint: '⛰️ Say: SUM-it', emoji: '⛰️', storyId: 'innovation-summit', storyTitle: 'Innovation Summit', difficulty: 'medium', category: 'concepts' },
      { word: 'collaboration', hint: '🤝 Say: kol-ab-or-AY-shun', emoji: '🤝', storyId: 'innovation-summit', storyTitle: 'Innovation Summit', difficulty: 'hard', category: 'actions' },
      { word: 'technology', hint: '💻 Say: tek-NOL-o-gy', emoji: '💻', storyId: 'innovation-summit', storyTitle: 'Innovation Summit', difficulty: 'medium', category: 'concepts' },
      { word: 'networking', hint: '🌐 Say: NET-work-ing', emoji: '🌐', storyId: 'innovation-summit', storyTitle: 'Innovation Summit', difficulty: 'hard', category: 'actions' },
      { word: 'partnership', hint: '🤝 Say: PART-ner-ship', emoji: '🤝', storyId: 'innovation-summit', storyTitle: 'Innovation Summit', difficulty: 'hard', category: 'concepts' },
      { word: 'breakthrough', hint: '💥 Say: BRAYK-throo', emoji: '💥', storyId: 'innovation-summit', storyTitle: 'Innovation Summit', difficulty: 'hard', category: 'concepts' },
      { word: 'future', hint: '⏩ Say: FYOO-chur', emoji: '⏩', storyId: 'innovation-summit', storyTitle: 'Innovation Summit', difficulty: 'medium', category: 'concepts' }
    ]
  };
  
  // Story phrases data - extracted from each story for pronunciation practice
  private static STORY_PHRASES: Record<string, StoryPhrase[]> = {
    'magic-forest': [
      { phrase: 'Hello Luna', phonemes: '👋 Say: heh-LOW LOO-nah', emoji: '👋🐰', storyId: 'magic-forest', storyTitle: 'Magic Forest Adventure', difficulty: 'easy' },
      { phrase: 'Magic forest', phonemes: '✨🌲 Say: MAJ-ik FOR-est', emoji: '✨🌲', storyId: 'magic-forest', storyTitle: 'Magic Forest Adventure', difficulty: 'easy' },
      { phrase: 'Happy rabbit', phonemes: '😊🐰 Say: HAP-ee RAB-it', emoji: '😊🐰', storyId: 'magic-forest', storyTitle: 'Magic Forest Adventure', difficulty: 'easy' },
      { phrase: 'Welcome to our forest', phonemes: '🌲 Say: WEL-kum TO OUR FOR-est', emoji: '🌲', storyId: 'magic-forest', storyTitle: 'Magic Forest Adventure', difficulty: 'medium' },
      { phrase: 'I love this sunny day', phonemes: '🦋☀️ Say: I LUV THIS SUN-ee DAY', emoji: '🦋☀️', storyId: 'magic-forest', storyTitle: 'Magic Forest Adventure', difficulty: 'medium' },
      { phrase: 'Flow so free', phonemes: '💧 Say: FLO SO FRE', emoji: '💧', storyId: 'magic-forest', storyTitle: 'Magic Forest Adventure', difficulty: 'easy' },
      { phrase: 'Being kind makes everyone smile', phonemes: '🌸😊 Say: BE-ing KIND MAKS EV-ree-wun SMILE', emoji: '🌸😊', storyId: 'magic-forest', storyTitle: 'Magic Forest Adventure', difficulty: 'hard' },
      { phrase: 'Stars shine brightly at night', phonemes: '⭐ Say: STARZ SHIYN BRYT-lee AT NIYT', emoji: '⭐', storyId: 'magic-forest', storyTitle: 'Magic Forest Adventure', difficulty: 'medium' },
      { phrase: 'Collecting makes me happy', phonemes: '🌰 Say: kol-EK-ting MAKS ME HAP-ee', emoji: '🌰', storyId: 'magic-forest', storyTitle: 'Magic Forest Adventure', difficulty: 'medium' },
      { phrase: 'The most important thing is kindness', phonemes: '💝 Say: THE MOST im-POR-tant THING IS KIND-ness', emoji: '💝', storyId: 'magic-forest', storyTitle: 'Magic Forest Adventure', difficulty: 'hard' }
    ],
    'space-adventure': [
      { phrase: 'We are flying to the stars', phonemes: '🚀✨ Say: WE ARE FLY-ing TO THE STARZ', emoji: '🚀✨', storyId: 'space-adventure', storyTitle: 'Space Adventure', difficulty: 'easy' },
      { phrase: 'Hello Cosmo', phonemes: '👋 Say: heh-LOW KOZ-mo', emoji: '👋👨‍🚀', storyId: 'space-adventure', storyTitle: 'Space Adventure', difficulty: 'easy' },
      { phrase: 'Blast off', phonemes: '🚀 Say: BLAST OFF', emoji: '🚀', storyId: 'space-adventure', storyTitle: 'Space Adventure', difficulty: 'easy' },
      { phrase: 'Hello new friend from Earth', phonemes: '👽👋 Say: heh-LOW NYOO FREND FRUM UHRS', emoji: '👽👋', storyId: 'space-adventure', storyTitle: 'Space Adventure', difficulty: 'medium' },
      { phrase: 'My rings make me special', phonemes: '🪐💍 Say: MY RINGZ MAK ME SPE-shul', emoji: '🪐💍', storyId: 'space-adventure', storyTitle: 'Space Adventure', difficulty: 'medium' },
      { phrase: 'Stars twinkle in the night sky', phonemes: '⭐ Say: STARZ TWIN-kul IN THE NIYT SKY', emoji: '⭐', storyId: 'space-adventure', storyTitle: 'Space Adventure', difficulty: 'medium' },
      { phrase: 'I can jump so high here', phonemes: '🌙 Say: I KAN JUMP SO HY HERE', emoji: '🌙', storyId: 'space-adventure', storyTitle: 'Space Adventure', difficulty: 'medium' },
      { phrase: 'Teamwork makes our mission succeed', phonemes: '🤝 Say: TEAM-work MAKS OUR MISH-un suk-SEED', emoji: '🤝', storyId: 'space-adventure', storyTitle: 'Space Adventure', difficulty: 'hard' }
    ],
    'underwater-world': [
      { phrase: 'Hello Finn', phonemes: '👋 Say: heh-LOW FIN', emoji: '👋🐠', storyId: 'underwater-world', storyTitle: 'Underwater World', difficulty: 'easy' },
      { phrase: 'Swimming is so much fun', phonemes: '🏊 Say: SWIM-ing IS SO MUCH FUN', emoji: '🏊🐠', storyId: 'underwater-world', storyTitle: 'Underwater World', difficulty: 'medium' },
      { phrase: 'Beautiful ocean', phonemes: '🌊 Say: BYOO-ti-ful O-shun', emoji: '🌊', storyId: 'underwater-world', storyTitle: 'Underwater World', difficulty: 'easy' },
      { phrase: 'Come see my beautiful colors', phonemes: '🪸🌈 Say: KUM SEE MY BYOO-ti-ful KUL-urz', emoji: '🪸🌈', storyId: 'underwater-world', storyTitle: 'Underwater World', difficulty: 'medium' },
      { phrase: 'Let us play and jump high', phonemes: '🐬 Say: LET US PLA AND JUMP HY', emoji: '🐬', storyId: 'underwater-world', storyTitle: 'Underwater World', difficulty: 'medium' },
      { phrase: 'Fish swim in the water', phonemes: '🐠 Say: FISH SWIM IN THE WAH-tur', emoji: '🐠', storyId: 'underwater-world', storyTitle: 'Underwater World', difficulty: 'easy' },
      { phrase: 'My song travels far and wide', phonemes: '🐋🎵 Say: MY SONG TRA-vulz FAR AND WYD', emoji: '🐋🎵', storyId: 'underwater-world', storyTitle: 'Underwater World', difficulty: 'medium' },
      { phrase: 'The ocean is happy when we keep it clean', phonemes: '🌊 Say: THE O-shun IS HAP-ee WEN WE KEEP IT KLEN', emoji: '🌊', storyId: 'underwater-world', storyTitle: 'Underwater World', difficulty: 'hard' }
    ],
    'dinosaur-discovery': [
      { phrase: 'Hello Dina', phonemes: '👋 Say: heh-LOW DEE-nah', emoji: '👋🦕', storyId: 'dinosaur-discovery', storyTitle: 'Dinosaur Discovery', difficulty: 'easy' },
      { phrase: 'Big dinosaur', phonemes: '🦖 Say: BIG DY-no-sawr', emoji: '🦖', storyId: 'dinosaur-discovery', storyTitle: 'Dinosaur Discovery', difficulty: 'easy' },
      { phrase: 'Ancient fossil', phonemes: '🦴 Say: AYN-shent FOS-il', emoji: '🦴', storyId: 'dinosaur-discovery', storyTitle: 'Dinosaur Discovery', difficulty: 'medium' },
      { phrase: 'Dig carefully to find bones', phonemes: '⛏️ Say: DIG KAYR-ful-ee TO FYND BONZ', emoji: '⛏️🦴', storyId: 'dinosaur-discovery', storyTitle: 'Dinosaur Discovery', difficulty: 'medium' },
      { phrase: 'Fossils show us ancient creatures', phonemes: '🦴 Say: FOS-ulz SHO US AYN-shent KREE-churz', emoji: '🦴', storyId: 'dinosaur-discovery', storyTitle: 'Dinosaur Discovery', difficulty: 'hard' },
      { phrase: 'I love discovering new things', phonemes: '🔍 Say: I LUV dis-KUV-er-ing NYOO THINGZ', emoji: '🔍', storyId: 'dinosaur-discovery', storyTitle: 'Dinosaur Discovery', difficulty: 'medium' }
    ],
    'unicorn-magic': [
      { phrase: 'Hello Stardust', phonemes: '👋 Say: heh-LOW STAR-dust', emoji: '👋🦄', storyId: 'unicorn-magic', storyTitle: 'Unicorn Magic Adventure', difficulty: 'easy' },
      { phrase: 'Rainbow unicorn', phonemes: '🌈🦄 Say: RAIN-bow YOU-ni-corn', emoji: '🌈🦄', storyId: 'unicorn-magic', storyTitle: 'Unicorn Magic Adventure', difficulty: 'easy' },
      { phrase: 'Magic sparkles', phonemes: '✨⭐ Say: MAJ-ik SPAR-kulz', emoji: '✨⭐', storyId: 'unicorn-magic', storyTitle: 'Unicorn Magic Adventure', difficulty: 'medium' },
      { phrase: 'My horn makes wishes come true', phonemes: '🦄 Say: MY HORN MAKS WISH-uz KUM TROO', emoji: '🦄✨', storyId: 'unicorn-magic', storyTitle: 'Unicorn Magic Adventure', difficulty: 'hard' },
      { phrase: 'Dreams can come true', phonemes: '💭 Say: DREEMZ KAN KUM TROO', emoji: '💭⭐', storyId: 'unicorn-magic', storyTitle: 'Unicorn Magic Adventure', difficulty: 'easy' }
    ],
    'pirate-treasure': [
      { phrase: 'Hello Captain Finn', phonemes: '👋⚓ Say: heh-LOW CAP-tin FIN', emoji: '👋⚓', storyId: 'pirate-treasure', storyTitle: 'Pirate Treasure Adventure', difficulty: 'easy' },
      { phrase: 'Pirate treasure', phonemes: '🏴‍☠️💎 Say: PY-rate TREZH-er', emoji: '🏴‍☠️💎', storyId: 'pirate-treasure', storyTitle: 'Pirate Treasure Adventure', difficulty: 'easy' },
      { phrase: 'Buried treasure', phonemes: '🏝️💰 Say: BER-eed TREZH-er', emoji: '🏝️💰', storyId: 'pirate-treasure', storyTitle: 'Pirate Treasure Adventure', difficulty: 'medium' },
      { phrase: 'Hoist the sails and catch the wind', phonemes: '⛵💨 Say: HOYST THE SAILZ AND KACH THE WIND', emoji: '⛵💨', storyId: 'pirate-treasure', storyTitle: 'Pirate Treasure Adventure', difficulty: 'medium' },
      { phrase: 'X marks the spot where treasure hides', phonemes: '🗺️💰 Say: EKS MARKS THE SPOT WHERE TREZH-er HYDS', emoji: '🗺️💰', storyId: 'pirate-treasure', storyTitle: 'Pirate Treasure Adventure', difficulty: 'hard' },
      { phrase: 'Follow me to the treasure', phonemes: '🦜💎 Say: FOL-ow ME TO THE TREZH-er', emoji: '🦜💎', storyId: 'pirate-treasure', storyTitle: 'Pirate Treasure Adventure', difficulty: 'medium' },
      { phrase: 'Stay brave through the storm', phonemes: '⛈️💪 Say: STA BRAV THROO THE STORM', emoji: '⛈️💪', storyId: 'pirate-treasure', storyTitle: 'Pirate Treasure Adventure', difficulty: 'medium' },
      { phrase: 'The best treasure is friendship', phonemes: '💝 Say: THE BEST TREZH-er IS FREND-ship', emoji: '💝', storyId: 'pirate-treasure', storyTitle: 'Pirate Treasure Adventure', difficulty: 'medium' }
    ],
    'superhero-school': [
      { phrase: 'Hello Captain Courage', phonemes: '👋🛡️ Say: heh-LOW CAP-tin KUR-ij', emoji: '👋🛡️', storyId: 'superhero-school', storyTitle: 'Superhero School Adventure', difficulty: 'easy' },
      { phrase: 'Superhero training', phonemes: '🦸‍♂️💪 Say: SOO-per-hero TRAIN-ing', emoji: '🦸‍♂️💪', storyId: 'superhero-school', storyTitle: 'Superhero School Adventure', difficulty: 'medium' },
      { phrase: 'Rescue mission', phonemes: '🚁🆘 Say: RES-kyoo MISH-un', emoji: '🚁🆘', storyId: 'superhero-school', storyTitle: 'Superhero School Adventure', difficulty: 'medium' },
      { phrase: 'With great power comes great responsibility', phonemes: '💪🛡️ Say: WITH GRAT POW-er KUMZ GRAT ri-spon-suh-BIL-i-tee', emoji: '💪🛡️', storyId: 'superhero-school', storyTitle: 'Superhero School Adventure', difficulty: 'hard' },
      { phrase: 'True heroes help people in need', phonemes: '❤️🤝 Say: TROO HE-roes HELP PEE-pul IN NEED', emoji: '❤️🤝', storyId: 'superhero-school', storyTitle: 'Superhero School Adventure', difficulty: 'hard' },
      { phrase: 'Bravery means facing your fears', phonemes: '🛡️💪 Say: BRAV-ree MEENZ FAS-ing YOR FEERZ', emoji: '🛡️💪', storyId: 'superhero-school', storyTitle: 'Superhero School Adventure', difficulty: 'hard' },
      { phrase: 'Together we are stronger', phonemes: '🤝💪 Say: tuh-GETH-er WE ARE STRONG-er', emoji: '🤝💪', storyId: 'superhero-school', storyTitle: 'Superhero School Adventure', difficulty: 'medium' },
      { phrase: 'Kindness is the greatest superpower', phonemes: '✨❤️ Say: KIND-ness IS THE GRAT-est SOO-per-pow-er', emoji: '✨❤️', storyId: 'superhero-school', storyTitle: 'Superhero School Adventure', difficulty: 'hard' }
    ],
    'fairy-garden': [
      { phrase: 'Hello Twinkle', phonemes: '👋 Say: heh-LOW TWIN-kul', emoji: '👋🧚', storyId: 'fairy-garden', storyTitle: 'Fairy Garden Adventure', difficulty: 'easy' },
      { phrase: 'Fairy dust', phonemes: '🧚✨ Say: FAIR-ee DUST', emoji: '🧚✨', storyId: 'fairy-garden', storyTitle: 'Fairy Garden Adventure', difficulty: 'easy' },
      { phrase: 'Magic sparkles', phonemes: '✨⭐ Say: MAJ-ik SPAR-kulz', emoji: '✨⭐', storyId: 'fairy-garden', storyTitle: 'Fairy Garden Adventure', difficulty: 'medium' },
      { phrase: 'Dewdrops shine like tiny diamonds', phonemes: '💧💎 Say: DYOO-drops SHIYN LYK TY-nee DY-mundz', emoji: '💧💎', storyId: 'fairy-garden', storyTitle: 'Fairy Garden Adventure', difficulty: 'hard' },
      { phrase: 'Hello little fairy friend', phonemes: '🐞👋 Say: heh-LOW LIT-ul FAIR-ee FREND', emoji: '🐞👋', storyId: 'fairy-garden', storyTitle: 'Fairy Garden Adventure', difficulty: 'medium' },
      { phrase: 'We grow with love and sunshine', phonemes: '🌸☀️ Say: WE GRO WITH LUV AND SUN-shiyn', emoji: '🌸☀️', storyId: 'fairy-garden', storyTitle: 'Fairy Garden Adventure', difficulty: 'medium' },
      { phrase: 'Dancing makes my heart happy', phonemes: '🦋💃 Say: DANS-ing MAKS MY HART HAP-ee', emoji: '🦋💃', storyId: 'fairy-garden', storyTitle: 'Fairy Garden Adventure', difficulty: 'medium' },
      { phrase: 'Small things can be very special', phonemes: '✨💝 Say: SMAL THINGZ KAN BE VER-ee SPE-shul', emoji: '✨💝', storyId: 'fairy-garden', storyTitle: 'Fairy Garden Adventure', difficulty: 'hard' }
    ],
    'rainbow-castle': [
      { phrase: 'Hello Princess Aurora', phonemes: '👋👸 Say: heh-LOW PRIN-sess aw-ROR-ah', emoji: '👋👸', storyId: 'rainbow-castle', storyTitle: 'Rainbow Castle Adventure', difficulty: 'easy' },
      { phrase: 'Rainbow castle', phonemes: '🌈🏰 Say: RAIN-bow KAS-ul', emoji: '🌈🏰', storyId: 'rainbow-castle', storyTitle: 'Rainbow Castle Adventure', difficulty: 'easy' },
      { phrase: 'Beautiful crown', phonemes: '👑 Say: BYOO-ti-ful KROWN', emoji: '👑', storyId: 'rainbow-castle', storyTitle: 'Rainbow Castle Adventure', difficulty: 'medium' },
      { phrase: 'Welcome to our royal castle', phonemes: '🚪👑 Say: WEL-kum TO OUR ROY-ul KAS-ul', emoji: '🚪👑', storyId: 'rainbow-castle', storyTitle: 'Rainbow Castle Adventure', difficulty: 'medium' },
      { phrase: 'I protect the castle with love', phonemes: '🐉💚 Say: I pro-TEKT THE KAS-ul WITH LUV', emoji: '🐉💚', storyId: 'rainbow-castle', storyTitle: 'Rainbow Castle Adventure', difficulty: 'medium' },
      { phrase: 'Wishes come true here', phonemes: '⛲✨ Say: WISH-uz KUM TROO HERE', emoji: '⛲✨', storyId: 'rainbow-castle', storyTitle: 'Rainbow Castle Adventure', difficulty: 'medium' },
      { phrase: 'Colors make everything beautiful', phonemes: '🌈🎨 Say: KUL-urz MAK EV-ree-thing BYOO-ti-ful', emoji: '🌈🎨', storyId: 'rainbow-castle', storyTitle: 'Rainbow Castle Adventure', difficulty: 'hard' },
      { phrase: 'Kindness is the greatest magic', phonemes: '✨💝 Say: KIND-ness IS THE GRAT-est MAJ-ik', emoji: '✨💝', storyId: 'rainbow-castle', storyTitle: 'Rainbow Castle Adventure', difficulty: 'hard' }
    ],
    'jungle-explorer': [
      { phrase: 'Hello Captain Leo', phonemes: '👋 Say: heh-LOW CAP-tin LEE-oh', emoji: '👋🦁', storyId: 'jungle-explorer', storyTitle: 'Jungle Explorer Adventure', difficulty: 'easy' },
      { phrase: 'Jungle adventure', phonemes: '🌴🗺️ Say: JUNG-ul ad-VEN-chur', emoji: '🌴🗺️', storyId: 'jungle-explorer', storyTitle: 'Jungle Explorer Adventure', difficulty: 'medium' },
      { phrase: 'Talking bunnies', phonemes: '🐰💬 Say: TAWK-ing BUN-eez', emoji: '🐰💬', storyId: 'jungle-explorer', storyTitle: 'Jungle Explorer Adventure', difficulty: 'easy' },
      { phrase: 'Follow the winding jungle path', phonemes: '🛤️🌿 Say: FOL-ow THE WYND-ing JUNG-ul PATH', emoji: '🛤️🌿', storyId: 'jungle-explorer', storyTitle: 'Jungle Explorer Adventure', difficulty: 'medium' },
      { phrase: 'I will help you explore safely', phonemes: '🐒🤝 Say: I WIL HELP YOO ex-PLOR SAF-lee', emoji: '🐒🤝', storyId: 'jungle-explorer', storyTitle: 'Jungle Explorer Adventure', difficulty: 'hard' },
      { phrase: 'Water flows from the mountain top', phonemes: '💧🏔️ Say: WAH-tur FLOZ FRUM THE MOWN-tun TOP', emoji: '💧🏔️', storyId: 'jungle-explorer', storyTitle: 'Jungle Explorer Adventure', difficulty: 'medium' },
      { phrase: 'I have lived here for many years', phonemes: '🌳⏰ Say: I HAV LIVD HERE FOR MEN-ee YEARZ', emoji: '🌳⏰', storyId: 'jungle-explorer', storyTitle: 'Jungle Explorer Adventure', difficulty: 'medium' },
      { phrase: 'Nature teaches us to be patient', phonemes: '🔍⏳ Say: NAY-chur TEE-chez US TO BE PA-shunt', emoji: '🔍⏳', storyId: 'jungle-explorer', storyTitle: 'Jungle Explorer Adventure', difficulty: 'hard' }
    ],
    // Template stories (11-20) phrases for young kids
    'enchanted-garden': [
      { phrase: 'Welcome to the enchanted garden', phonemes: '🌺 Say: WEL-kum TO THE en-CHANT-ed GAR-den', emoji: '🌺', storyId: 'enchanted-garden', storyTitle: 'The Enchanted Garden', difficulty: 'medium' },
      { phrase: 'Flowers bloom everywhere', phonemes: '🌸 Say: FLOW-urz BLOOM EV-ree-wair', emoji: '🌸', storyId: 'enchanted-garden', storyTitle: 'The Enchanted Garden', difficulty: 'medium' },
      { phrase: 'Butterflies dance in the air', phonemes: '🦋 Say: BUT-er-flyz DANS IN THE AIR', emoji: '🦋', storyId: 'enchanted-garden', storyTitle: 'The Enchanted Garden', difficulty: 'medium' },
      { phrase: 'Nature is peaceful and beautiful', phonemes: '🌿 Say: NAY-chur IS PEES-ful AND BYOO-ti-ful', emoji: '🌿', storyId: 'enchanted-garden', storyTitle: 'The Enchanted Garden', difficulty: 'hard' },
      { phrase: 'The garden is full of wonder', phonemes: '✨ Say: THE GAR-den IS FUL OF WUN-der', emoji: '✨', storyId: 'enchanted-garden', storyTitle: 'The Enchanted Garden', difficulty: 'medium' }
    ],
    'dragons-treasure': [
      { phrase: 'Dragon\'s treasure sparkles', phonemes: '🐉💎 Say: DRAG-unz TREZH-ur SPAR-kulz', emoji: '🐉💎', storyId: 'dragons-treasure', storyTitle: 'Dragon\'s Treasure', difficulty: 'medium' },
      { phrase: 'Friends share everything', phonemes: '🤝 Say: FRENDZ SHAIR EV-ree-thing', emoji: '🤝', storyId: 'dragons-treasure', storyTitle: 'Dragon\'s Treasure', difficulty: 'medium' },
      { phrase: 'Kindness is the greatest treasure', phonemes: '💖 Say: KIND-ness IS THE GRAT-est TREZH-ur', emoji: '💖', storyId: 'dragons-treasure', storyTitle: 'Dragon\'s Treasure', difficulty: 'hard' },
      { phrase: 'Gold and jewels shine bright', phonemes: '🪙 Say: GOLD AND JOO-ulz SHIYN BRYT', emoji: '🪙', storyId: 'dragons-treasure', storyTitle: 'Dragon\'s Treasure', difficulty: 'medium' },
      { phrase: 'Sharing makes us happy', phonemes: '💝 Say: SHAIR-ing MAKS US HAP-ee', emoji: '💝', storyId: 'dragons-treasure', storyTitle: 'Dragon\'s Treasure', difficulty: 'medium' }
    ],
    'magic-school': [
      { phrase: 'Welcome to magic school', phonemes: '🏫 Say: WEL-kum TO MAJ-ik SKOOL', emoji: '🏫', storyId: 'magic-school', storyTitle: 'Magic School', difficulty: 'easy' },
      { phrase: 'We learn new spells together', phonemes: '📚 Say: WE LURN NYOO SPELZ to-GETH-er', emoji: '📚', storyId: 'magic-school', storyTitle: 'Magic School', difficulty: 'medium' },
      { phrase: 'Books hold great wisdom', phonemes: '📖 Say: BOOKS HOLD GRAT WIZ-dum', emoji: '📖', storyId: 'magic-school', storyTitle: 'Magic School', difficulty: 'medium' },
      { phrase: 'Friends help each other learn', phonemes: '👫 Say: FRENDZ HELP EECH UTH-er LURN', emoji: '👫', storyId: 'magic-school', storyTitle: 'Magic School', difficulty: 'medium' },
      { phrase: 'Discover the magic of learning', phonemes: '🔍 Say: dis-KUV-er THE MAJ-ik OF LURN-ing', emoji: '🔍', storyId: 'magic-school', storyTitle: 'Magic School', difficulty: 'hard' }
    ],
    'ocean-explorer': [
      { phrase: 'Dive deep into the ocean', phonemes: '🤿 Say: DIV DEEP IN-to THE O-shun', emoji: '🤿', storyId: 'ocean-explorer', storyTitle: 'Ocean Explorer', difficulty: 'medium' },
      { phrase: 'Colorful coral reefs', phonemes: '🪸 Say: KUL-er-ful KOR-al REEFS', emoji: '🪸', storyId: 'ocean-explorer', storyTitle: 'Ocean Explorer', difficulty: 'medium' },
      { phrase: 'Fish swim all around', phonemes: '🐠 Say: FISH SWIM AL a-ROWND', emoji: '🐠', storyId: 'ocean-explorer', storyTitle: 'Ocean Explorer', difficulty: 'easy' },
      { phrase: 'Waves move gently', phonemes: '🌊 Say: WAYVZ MOOV JENT-lee', emoji: '🌊', storyId: 'ocean-explorer', storyTitle: 'Ocean Explorer', difficulty: 'easy' },
      { phrase: 'Explore the deep blue sea', phonemes: '🗺️ Say: eks-PLOR THE DEEP BLOO SEE', emoji: '🗺️', storyId: 'ocean-explorer', storyTitle: 'Ocean Explorer', difficulty: 'medium' }
    ],
    'time-machine': [
      { phrase: 'Travel through time', phonemes: '⏰ Say: TRAV-ul THROO TYM', emoji: '⏰', storyId: 'time-machine', storyTitle: 'Time Machine', difficulty: 'medium' },
      { phrase: 'Visit the past and future', phonemes: '⏪⏩ Say: VIZ-it THE PAST AND FYOO-chur', emoji: '⏪⏩', storyId: 'time-machine', storyTitle: 'Time Machine', difficulty: 'medium' },
      { phrase: 'History comes alive', phonemes: '📜 Say: HIS-tor-ee KUMZ a-LYV', emoji: '📜', storyId: 'time-machine', storyTitle: 'Time Machine', difficulty: 'medium' },
      { phrase: 'Journey through different times', phonemes: '🚀 Say: JUR-nee THROO DIF-er-ent TYMZ', emoji: '🚀', storyId: 'time-machine', storyTitle: 'Time Machine', difficulty: 'hard' },
      { phrase: 'Discover amazing adventures', phonemes: '🔍 Say: dis-KUV-er a-MAZ-ing ad-VEN-churz', emoji: '🔍', storyId: 'time-machine', storyTitle: 'Time Machine', difficulty: 'hard' }
    ],
    'friendly-robot': [
      { phrase: 'Hello friendly robot', phonemes: '🤖 Say: heh-LOW FREND-lee RO-bot', emoji: '🤖', storyId: 'friendly-robot', storyTitle: 'Friendly Robot', difficulty: 'easy' },
      { phrase: 'Robots help us learn', phonemes: '🧠 Say: RO-bots HELP US LURN', emoji: '🧠', storyId: 'friendly-robot', storyTitle: 'Friendly Robot', difficulty: 'easy' },
      { phrase: 'Kind and smart friend', phonemes: '💝 Say: KYND AND SMART FREND', emoji: '💝', storyId: 'friendly-robot', storyTitle: 'Friendly Robot', difficulty: 'easy' },
      { phrase: 'Play together every day', phonemes: '🎮 Say: PLAY to-GETH-er EV-ree DAY', emoji: '🎮', storyId: 'friendly-robot', storyTitle: 'Friendly Robot', difficulty: 'medium' },
      { phrase: 'Teamwork makes everything fun', phonemes: '🤝 Say: TEAM-work MAKS EV-ree-thing FUN', emoji: '🤝', storyId: 'friendly-robot', storyTitle: 'Friendly Robot', difficulty: 'hard' }
    ],
    'secret-cave': [
      { phrase: 'Enter the secret cave', phonemes: '🕳️ Say: EN-ter THE SEE-kret KAYV', emoji: '🕳️', storyId: 'secret-cave', storyTitle: 'Secret Cave', difficulty: 'medium' },
      { phrase: 'Treasure hidden inside', phonemes: '💎 Say: TREZH-ur HID-en IN-SYD', emoji: '💎', storyId: 'secret-cave', storyTitle: 'Secret Cave', difficulty: 'medium' },
      { phrase: 'Follow the map carefully', phonemes: '🗺️ Say: FOL-ow THE MAP KAYR-ful-lee', emoji: '🗺️', storyId: 'secret-cave', storyTitle: 'Secret Cave', difficulty: 'medium' },
      { phrase: 'Brave explorers discover secrets', phonemes: '🦅 Say: BRAVE eks-PLOR-urz dis-KUV-er SEE-kretz', emoji: '🦅', storyId: 'secret-cave', storyTitle: 'Secret Cave', difficulty: 'hard' },
      { phrase: 'Adventure awaits inside', phonemes: '🗺️ Say: ad-VEN-chur a-WAYTS IN-SYD', emoji: '🗺️', storyId: 'secret-cave', storyTitle: 'Secret Cave', difficulty: 'medium' }
    ],
    'flying-carpet': [
      { phrase: 'Ride the flying carpet', phonemes: '毯 Say: RYD THE FLY-ing KAR-pet', emoji: '毯', storyId: 'flying-carpet', storyTitle: 'Flying Carpet', difficulty: 'medium' },
      { phrase: 'Soar high in the sky', phonemes: '☁️ Say: SOR HY IN THE SKY', emoji: '☁️', storyId: 'flying-carpet', storyTitle: 'Flying Carpet', difficulty: 'easy' },
      { phrase: 'Clouds float by gently', phonemes: '☁️ Say: KLOWDZ FLOT BY JENT-lee', emoji: '☁️', storyId: 'flying-carpet', storyTitle: 'Flying Carpet', difficulty: 'medium' },
      { phrase: 'Wind carries us away', phonemes: '💨 Say: WIND KAYR-eez US a-WAY', emoji: '💨', storyId: 'flying-carpet', storyTitle: 'Flying Carpet', difficulty: 'medium' },
      { phrase: 'Magic journey through the clouds', phonemes: '✨ Say: MAJ-ik JUR-nee THROO THE KLOWDZ', emoji: '✨', storyId: 'flying-carpet', storyTitle: 'Flying Carpet', difficulty: 'hard' }
    ],
    'lost-kingdom': [
      { phrase: 'Find the lost kingdom', phonemes: '🏰 Say: FYND THE LOST KING-dum', emoji: '🏰', storyId: 'lost-kingdom', storyTitle: 'Lost Kingdom', difficulty: 'medium' },
      { phrase: 'King and queen need help', phonemes: '👑 Say: KING AND KWEEN NEED HELP', emoji: '👑', storyId: 'lost-kingdom', storyTitle: 'Lost Kingdom', difficulty: 'easy' },
      { phrase: 'Rescue the royal family', phonemes: '🚁 Say: RES-kyoo THE ROY-ul FAM-i-lee', emoji: '🚁', storyId: 'lost-kingdom', storyTitle: 'Lost Kingdom', difficulty: 'medium' },
      { phrase: 'Brave heroes save the day', phonemes: '🦸 Say: BRAVE HEER-ohz SAV THE DAY', emoji: '🦸', storyId: 'lost-kingdom', storyTitle: 'Lost Kingdom', difficulty: 'medium' },
      { phrase: 'Castle stands tall and proud', phonemes: '🏰 Say: KAS-ul STANDZ TAL AND PROWD', emoji: '🏰', storyId: 'lost-kingdom', storyTitle: 'Lost Kingdom', difficulty: 'hard' }
    ],
    'grand-adventure': [
      { phrase: 'The grand adventure begins', phonemes: '🗺️ Say: THE GRAND ad-VEN-chur be-GINZ', emoji: '🗺️', storyId: 'grand-adventure', storyTitle: 'Grand Adventure', difficulty: 'medium' },
      { phrase: 'Journey with brave friends', phonemes: '🚀 Say: JUR-nee WITH BRAVE FRENDZ', emoji: '🚀', storyId: 'grand-adventure', storyTitle: 'Grand Adventure', difficulty: 'medium' },
      { phrase: 'Discover amazing places', phonemes: '🔍 Say: dis-KUV-er a-MAZ-ing PLAYS-ez', emoji: '🔍', storyId: 'grand-adventure', storyTitle: 'Grand Adventure', difficulty: 'medium' },
      { phrase: 'Explore together as a team', phonemes: '🗺️ Say: eks-PLOR to-GETH-er AZ A TEAM', emoji: '🗺️', storyId: 'grand-adventure', storyTitle: 'Grand Adventure', difficulty: 'hard' },
      { phrase: 'Victory and celebration await', phonemes: '🏆 Say: VIK-tor-ee AND sel-eh-BRAY-shun a-WAYT', emoji: '🏆', storyId: 'grand-adventure', storyTitle: 'Grand Adventure', difficulty: 'hard' }
    ],
    // Teen stories phrases
    'mystery-detective': [
      { phrase: 'Critical thinking skills', phonemes: '🧠 Say: KRIT-i-kal THINK-ing skilz', emoji: '🧠', storyId: 'mystery-detective', storyTitle: 'Mystery Detective', difficulty: 'hard' },
      { phrase: 'Investigate the evidence', phonemes: '🔍 Say: in-VES-ti-gate THE EV-i-dens', emoji: '🔍', storyId: 'mystery-detective', storyTitle: 'Mystery Detective', difficulty: 'hard' },
      { phrase: 'Analyze the clues carefully', phonemes: '📋 Say: AN-a-lyz THE KLOOZ KAYR-ful-ee', emoji: '📋', storyId: 'mystery-detective', storyTitle: 'Mystery Detective', difficulty: 'hard' },
      { phrase: 'Logical deduction process', phonemes: '💭 Say: LOJ-i-kal de-DUK-shun PRO-ses', emoji: '💭', storyId: 'mystery-detective', storyTitle: 'Mystery Detective', difficulty: 'hard' }
    ],
    'space-explorer-teen': [
      { phrase: 'Scientific methodology', phonemes: '🔬 Say: sy-en-TIF-ik meth-o-DOL-o-gy', emoji: '🔬', storyId: 'space-explorer-teen', storyTitle: 'Space Explorer', difficulty: 'hard' },
      { phrase: 'Navigate through complex missions', phonemes: '🧭 Say: NAV-i-gate THROO KOM-pleks MISH-unz', emoji: '🧭', storyId: 'space-explorer-teen', storyTitle: 'Space Explorer', difficulty: 'hard' },
      { phrase: 'Research and discovery', phonemes: '📊 Say: re-SURCH AND dis-KUV-er-ee', emoji: '📊', storyId: 'space-explorer-teen', storyTitle: 'Space Explorer', difficulty: 'hard' },
      { phrase: 'Interstellar exploration', phonemes: '🌟 Say: in-ter-STEL-ar eks-plor-AY-shun', emoji: '🌟', storyId: 'space-explorer-teen', storyTitle: 'Space Explorer', difficulty: 'hard' }
    ],
    'environmental-hero': [
      { phrase: 'Environmental protection', phonemes: '🌍 Say: en-vy-ron-MEN-tal pro-TEK-shun', emoji: '🌍', storyId: 'environmental-hero', storyTitle: 'Environmental Hero', difficulty: 'hard' },
      { phrase: 'Sustainable development', phonemes: '♻️ Say: sus-TAIN-a-bul de-VEL-op-ment', emoji: '♻️', storyId: 'environmental-hero', storyTitle: 'Environmental Hero', difficulty: 'hard' },
      { phrase: 'Climate change solutions', phonemes: '🌡️ Say: KLY-mit CHAYNJ so-LOO-shunz', emoji: '🌡️', storyId: 'environmental-hero', storyTitle: 'Environmental Hero', difficulty: 'hard' },
      { phrase: 'Renewable energy sources', phonemes: '⚡ Say: re-NYOO-a-bul EN-er-jee SOR-sez', emoji: '⚡', storyId: 'environmental-hero', storyTitle: 'Environmental Hero', difficulty: 'hard' }
    ],
    'tech-innovator': [
      { phrase: 'Technological advancement', phonemes: '💻 Say: tek-no-LOJ-i-kal ad-VANS-ment', emoji: '💻', storyId: 'tech-innovator', storyTitle: 'Tech Innovator', difficulty: 'hard' },
      { phrase: 'Innovation and creativity', phonemes: '💡 Say: in-no-VAY-shun and cree-a-TIV-i-ty', emoji: '💡', storyId: 'tech-innovator', storyTitle: 'Tech Innovator', difficulty: 'hard' },
      { phrase: 'Digital transformation', phonemes: '📱 Say: DIJ-i-tal trans-for-MAY-shun', emoji: '📱', storyId: 'tech-innovator', storyTitle: 'Tech Innovator', difficulty: 'hard' },
      { phrase: 'Software development process', phonemes: '⌨️ Say: SOFT-wair de-VEL-op-ment PRO-ses', emoji: '⌨️', storyId: 'tech-innovator', storyTitle: 'Tech Innovator', difficulty: 'hard' }
    ],
    'global-citizen': [
      { phrase: 'Global communication', phonemes: '🌐 Say: GLO-bal com-mu-ni-KAY-shun', emoji: '🌐', storyId: 'global-citizen', storyTitle: 'Global Citizen', difficulty: 'hard' },
      { phrase: 'Cultural diversity', phonemes: '🌍 Say: KUL-chur-al di-VUR-si-ty', emoji: '🌍', storyId: 'global-citizen', storyTitle: 'Global Citizen', difficulty: 'hard' },
      { phrase: 'Economic globalization', phonemes: '💰 Say: ee-ko-NOM-ik glo-bal-i-ZAY-shun', emoji: '💰', storyId: 'global-citizen', storyTitle: 'Global Citizen', difficulty: 'hard' },
      { phrase: 'International cooperation', phonemes: '🤲 Say: in-ter-NASH-un-al co-op-er-AY-shun', emoji: '🤲', storyId: 'global-citizen', storyTitle: 'Global Citizen', difficulty: 'hard' }
    ],
    'future-leader': [
      { phrase: 'Professional development', phonemes: '💼 Say: pro-FESH-un-al de-VEL-op-ment', emoji: '💼', storyId: 'future-leader', storyTitle: 'Future Leader', difficulty: 'hard' },
      { phrase: 'Leadership and responsibility', phonemes: '👑 Say: LEE-der-ship AND re-spon-si-BIL-i-ty', emoji: '👑', storyId: 'future-leader', storyTitle: 'Future Leader', difficulty: 'hard' },
      { phrase: 'Strategic decision making', phonemes: '📊 Say: stra-TEJ-ik de-SIZH-un MAK-ing', emoji: '📊', storyId: 'future-leader', storyTitle: 'Future Leader', difficulty: 'hard' },
      { phrase: 'Empowerment and motivation', phonemes: '⚡ Say: em-POW-er-ment AND mo-ti-VAY-shun', emoji: '⚡', storyId: 'future-leader', storyTitle: 'Future Leader', difficulty: 'hard' }
    ],
    'scientific-discovery': [
      { phrase: 'Scientific methodology', phonemes: '🔬 Say: sy-en-TIF-ik meth-o-DOL-o-gy', emoji: '🔬', storyId: 'scientific-discovery', storyTitle: 'Scientific Discovery', difficulty: 'hard' },
      { phrase: 'Hypothesis and experiment', phonemes: '🧪 Say: hy-POTH-e-sis AND eks-PER-i-ment', emoji: '🧪', storyId: 'scientific-discovery', storyTitle: 'Scientific Discovery', difficulty: 'hard' },
      { phrase: 'Research and analysis', phonemes: '📈 Say: re-SURCH AND a-NAL-i-sis', emoji: '📈', storyId: 'scientific-discovery', storyTitle: 'Scientific Discovery', difficulty: 'hard' },
      { phrase: 'Observation and conclusion', phonemes: '👀 Say: ob-ser-VAY-shun AND kon-KLOO-zhun', emoji: '👀', storyId: 'scientific-discovery', storyTitle: 'Scientific Discovery', difficulty: 'hard' }
    ],
    'social-media-expert': [
      { phrase: 'Digital platform management', phonemes: '💻 Say: DIJ-i-tal PLAT-form MAN-ij-ment', emoji: '💻', storyId: 'social-media-expert', storyTitle: 'Social Media Expert', difficulty: 'hard' },
      { phrase: 'Privacy and security', phonemes: '🔒 Say: PRY-va-see AND se-KYUR-i-ty', emoji: '🔒', storyId: 'social-media-expert', storyTitle: 'Social Media Expert', difficulty: 'hard' },
      { phrase: 'Content engagement strategy', phonemes: '📝 Say: KON-tent en-GAYJ-ment STRAT-e-jee', emoji: '📝', storyId: 'social-media-expert', storyTitle: 'Social Media Expert', difficulty: 'hard' },
      { phrase: 'Authentic communication', phonemes: '✨ Say: aw-THEN-tik com-mu-ni-KAY-shun', emoji: '✨', storyId: 'social-media-expert', storyTitle: 'Social Media Expert', difficulty: 'hard' }
    ],
    'ai-ethics-explorer': [
      { phrase: 'Artificial intelligence ethics', phonemes: '🤖 Say: ar-ti-FISH-al in-TEL-i-jens ETH-iks', emoji: '🤖', storyId: 'ai-ethics-explorer', storyTitle: 'AI Ethics Explorer', difficulty: 'hard' },
      { phrase: 'Algorithm transparency', phonemes: '⚙️ Say: AL-go-rith-um trans-PAIR-en-see', emoji: '⚙️', storyId: 'ai-ethics-explorer', storyTitle: 'AI Ethics Explorer', difficulty: 'hard' },
      { phrase: 'Machine learning accountability', phonemes: '🧠 Say: ma-SHEEN LURN-ing a-kown-ta-BIL-i-ty', emoji: '🧠', storyId: 'ai-ethics-explorer', storyTitle: 'AI Ethics Explorer', difficulty: 'hard' },
      { phrase: 'Bias and fairness', phonemes: '⚡ Say: BY-us AND FAIR-ness', emoji: '⚡', storyId: 'ai-ethics-explorer', storyTitle: 'AI Ethics Explorer', difficulty: 'hard' }
    ],
    'digital-security-guardian': [
      { phrase: 'Cybersecurity fundamentals', phonemes: '🔐 Say: sy-ber-se-KYUR-i-ty fun-da-MEN-talz', emoji: '🔐', storyId: 'digital-security-guardian', storyTitle: 'Digital Security Guardian', difficulty: 'hard' },
      { phrase: 'Encryption and authentication', phonemes: '🔒 Say: en-KRIP-shun AND aw-then-ti-KAY-shun', emoji: '🔒', storyId: 'digital-security-guardian', storyTitle: 'Digital Security Guardian', difficulty: 'hard' },
      { phrase: 'Password protection strategy', phonemes: '🔑 Say: PAS-wurd pro-TEK-shun STRAT-e-jee', emoji: '🔑', storyId: 'digital-security-guardian', storyTitle: 'Digital Security Guardian', difficulty: 'hard' },
      { phrase: 'Firewall and vulnerability management', phonemes: '🔥🧱 Say: FYR-wawl AND vul-ner-a-BIL-i-ty MAN-ij-ment', emoji: '🔥🧱', storyId: 'digital-security-guardian', storyTitle: 'Digital Security Guardian', difficulty: 'hard' }
    ],
    // Template stories (11-20) phrases for teen kids
    'climate-action': [
      { phrase: 'Climate action and sustainability', phonemes: '🌡️ Say: KLY-mit AK-shun AND sus-tain-a-BIL-i-ty', emoji: '🌡️', storyId: 'climate-action', storyTitle: 'Climate Action', difficulty: 'hard' },
      { phrase: 'Environmental conservation efforts', phonemes: '🌍 Say: en-vy-ron-MEN-tal kon-ser-VAY-shun ef-FURTS', emoji: '🌍', storyId: 'climate-action', storyTitle: 'Climate Action', difficulty: 'hard' },
      { phrase: 'Renewable energy solutions', phonemes: '⚡ Say: re-NYOO-a-bul EN-er-jee so-LOO-shunz', emoji: '⚡', storyId: 'climate-action', storyTitle: 'Climate Action', difficulty: 'hard' },
      { phrase: 'Advocacy for positive impact', phonemes: '📢 Say: AD-vo-ka-see FOR POZ-i-tiv IM-pakt', emoji: '📢', storyId: 'climate-action', storyTitle: 'Climate Action', difficulty: 'hard' },
      { phrase: 'Sustainable future planning', phonemes: '♻️ Say: sus-TAIN-a-bul FYOO-chur PLAN-ing', emoji: '♻️', storyId: 'climate-action', storyTitle: 'Climate Action', difficulty: 'hard' }
    ],
    'startup': [
      { phrase: 'Startup innovation and growth', phonemes: '🚀 Say: START-up in-no-VAY-shun AND GROTH', emoji: '🚀', storyId: 'startup', storyTitle: 'Startup', difficulty: 'hard' },
      { phrase: 'Entrepreneurial business strategy', phonemes: '💼 Say: on-tre-pre-NUR-ee-al BIZ-ness STRAT-e-jee', emoji: '💼', storyId: 'startup', storyTitle: 'Startup', difficulty: 'hard' },
      { phrase: 'Pitch your innovative idea', phonemes: '🎯 Say: PICH YOR in-no-VAY-tiv eye-DEE-ah', emoji: '🎯', storyId: 'startup', storyTitle: 'Startup', difficulty: 'hard' },
      { phrase: 'Investment and business growth', phonemes: '💰 Say: in-VEST-ment AND BIZ-ness GROTH', emoji: '💰', storyId: 'startup', storyTitle: 'Startup', difficulty: 'hard' },
      { phrase: 'Strategic planning for success', phonemes: '📊 Say: stra-TEJ-ik PLAN-ing FOR suk-SES', emoji: '📊', storyId: 'startup', storyTitle: 'Startup', difficulty: 'hard' }
    ],
    'diplomacy': [
      { phrase: 'International diplomacy and negotiation', phonemes: '🤝 Say: in-ter-NASH-un-al di-PLO-ma-see AND ne-go-shi-AY-shun', emoji: '🤝', storyId: 'diplomacy', storyTitle: 'Diplomacy', difficulty: 'hard' },
      { phrase: 'Treaty and alliance building', phonemes: '📜 Say: TREE-tee AND a-LY-ans BIL-ding', emoji: '📜', storyId: 'diplomacy', storyTitle: 'Diplomacy', difficulty: 'hard' },
      { phrase: 'Mediation and conflict resolution', phonemes: '⚖️ Say: mee-dee-AY-shun AND KON-flict rez-o-LOO-shun', emoji: '⚖️', storyId: 'diplomacy', storyTitle: 'Diplomacy', difficulty: 'hard' },
      { phrase: 'Building consensus through cooperation', phonemes: '✅ Say: BIL-ding kon-SEN-sus THROO co-op-er-AY-shun', emoji: '✅', storyId: 'diplomacy', storyTitle: 'Diplomacy', difficulty: 'hard' },
      { phrase: 'International relations and peace', phonemes: '🌎 Say: in-ter-NASH-un-al re-LAY-shunz AND PEES', emoji: '🌎', storyId: 'diplomacy', storyTitle: 'Diplomacy', difficulty: 'hard' }
    ],
    'medical-research': [
      { phrase: 'Medical research and treatment', phonemes: '🏥 Say: MED-i-kal re-SURCH AND TREET-ment', emoji: '🏥', storyId: 'medical-research', storyTitle: 'Medical Research', difficulty: 'hard' },
      { phrase: 'Clinical trials and diagnosis', phonemes: '🔬 Say: KLIN-i-kal TRY-alz AND dy-ag-NO-sis', emoji: '🔬', storyId: 'medical-research', storyTitle: 'Medical Research', difficulty: 'hard' },
      { phrase: 'Patient care and therapy', phonemes: '💉 Say: PAY-shunt KAYR AND THER-a-pee', emoji: '💉', storyId: 'medical-research', storyTitle: 'Medical Research', difficulty: 'hard' },
      { phrase: 'Medical discovery and innovation', phonemes: '🌟 Say: MED-i-kal dis-KUV-er-ee AND in-no-VAY-shun', emoji: '🌟', storyId: 'medical-research', storyTitle: 'Medical Research', difficulty: 'hard' },
      { phrase: 'Advancing healthcare through research', phonemes: '📊 Say: ad-VANS-ing HELTH-kayr THROO re-SURCH', emoji: '📊', storyId: 'medical-research', storyTitle: 'Medical Research', difficulty: 'hard' }
    ],
    'social-impact': [
      { phrase: 'Social impact and community change', phonemes: '👥 Say: SO-shul IM-pakt AND kom-YOO-ni-tee CHAYNJ', emoji: '👥', storyId: 'social-impact', storyTitle: 'Social Impact', difficulty: 'hard' },
      { phrase: 'Community initiative and volunteer work', phonemes: '🏘️ Say: kom-YOO-ni-tee in-ISH-ee-a-tiv AND vol-un-TEER WURK', emoji: '🏘️', storyId: 'social-impact', storyTitle: 'Social Impact', difficulty: 'hard' },
      { phrase: 'Empowerment through advocacy', phonemes: '⚡ Say: em-POW-er-ment THROO AD-vo-ka-see', emoji: '⚡', storyId: 'social-impact', storyTitle: 'Social Impact', difficulty: 'hard' },
      { phrase: 'Creating positive social change', phonemes: '🔄 Say: cree-AT-ing POZ-i-tiv SO-shul CHAYNJ', emoji: '🔄', storyId: 'social-impact', storyTitle: 'Social Impact', difficulty: 'hard' },
      { phrase: 'Building stronger communities together', phonemes: '🤝 Say: BIL-ding STRONG-er kom-YOO-ni-teez to-GETH-er', emoji: '🤝', storyId: 'social-impact', storyTitle: 'Social Impact', difficulty: 'hard' }
    ],
    'data-science': [
      { phrase: 'Data science and analysis', phonemes: '📊 Say: DAY-ta SY-ens AND a-NAL-i-sis', emoji: '📊', storyId: 'data-science', storyTitle: 'Data Science', difficulty: 'hard' },
      { phrase: 'Algorithm and statistical analysis', phonemes: '⚙️ Say: AL-go-rith-um AND sta-TIS-ti-kal a-NAL-i-sis', emoji: '⚙️', storyId: 'data-science', storyTitle: 'Data Science', difficulty: 'hard' },
      { phrase: 'Pattern recognition and insights', phonemes: '🔍 Say: PAT-ern rek-og-NISH-un AND IN-syts', emoji: '🔍', storyId: 'data-science', storyTitle: 'Data Science', difficulty: 'hard' },
      { phrase: 'Data-driven prediction and forecasting', phonemes: '🔮 Say: DAY-ta-DRIV-en pre-DIK-shun AND FOR-kast-ing', emoji: '🔮', storyId: 'data-science', storyTitle: 'Data Science', difficulty: 'hard' },
      { phrase: 'Scientific analysis of complex data', phonemes: '📈 Say: sy-en-TIF-ik a-NAL-i-sis OF kom-PLEKS DAY-ta', emoji: '📈', storyId: 'data-science', storyTitle: 'Data Science', difficulty: 'hard' }
    ],
    'engineering': [
      { phrase: 'Engineering design and construction', phonemes: '⚙️ Say: en-jin-EER-ing de-ZYN AND kon-STRUK-shun', emoji: '⚙️', storyId: 'engineering', storyTitle: 'Engineering', difficulty: 'hard' },
      { phrase: 'Structural innovation and solutions', phonemes: '🏛️ Say: STRUK-chur-al in-no-VAY-shun AND so-LOO-shunz', emoji: '🏛️', storyId: 'engineering', storyTitle: 'Engineering', difficulty: 'hard' },
      { phrase: 'Prototype development and testing', phonemes: '🔧 Say: PRO-to-typ de-VEL-op-ment AND TEST-ing', emoji: '🔧', storyId: 'engineering', storyTitle: 'Engineering', difficulty: 'hard' },
      { phrase: 'Technical problem-solving approach', phonemes: '🔧 Say: TEK-ni-kal PROB-ulm-SOLV-ing a-PROCH', emoji: '🔧', storyId: 'engineering', storyTitle: 'Engineering', difficulty: 'hard' },
      { phrase: 'Innovative engineering solutions', phonemes: '💡 Say: in-no-VAY-tiv en-jin-EER-ing so-LOO-shunz', emoji: '💡', storyId: 'engineering', storyTitle: 'Engineering', difficulty: 'hard' }
    ],
    'content-strategy': [
      { phrase: 'Content strategy and marketing', phonemes: '📝 Say: KON-tent STRAT-e-jee AND MAR-ket-ing', emoji: '📝', storyId: 'content-strategy', storyTitle: 'Content Strategy', difficulty: 'hard' },
      { phrase: 'Audience engagement and brand messaging', phonemes: '👥 Say: AW-dee-ens en-GAYJ-ment AND BRAND MES-ij-ing', emoji: '👥', storyId: 'content-strategy', storyTitle: 'Content Strategy', difficulty: 'hard' },
      { phrase: 'Marketing campaign development', phonemes: '📣 Say: MAR-ket-ing kam-PAYN de-VEL-op-ment', emoji: '📣', storyId: 'content-strategy', storyTitle: 'Content Strategy', difficulty: 'hard' },
      { phrase: 'Strategic content planning', phonemes: '📊 Say: stra-TEJ-ik KON-tent PLAN-ing', emoji: '📊', storyId: 'content-strategy', storyTitle: 'Content Strategy', difficulty: 'hard' },
      { phrase: 'Effective brand communication', phonemes: '🏷️ Say: ef-EK-tiv BRAND kom-mu-ni-KAY-shun', emoji: '🏷️', storyId: 'content-strategy', storyTitle: 'Content Strategy', difficulty: 'hard' }
    ],
    'ethical-ai': [
      { phrase: 'Ethical artificial intelligence', phonemes: '⚖️ Say: ETH-i-kal ar-ti-FISH-al in-TEL-i-jens', emoji: '⚖️', storyId: 'ethical-ai', storyTitle: 'Ethical AI', difficulty: 'hard' },
      { phrase: 'Responsibility and transparency in AI', phonemes: '📋 Say: re-spon-si-BIL-i-ty AND trans-PAIR-en-see IN AI', emoji: '📋', storyId: 'ethical-ai', storyTitle: 'Ethical AI', difficulty: 'hard' },
      { phrase: 'Fairness and accountability standards', phonemes: '⚖️ Say: FAIR-ness AND a-kown-ta-BIL-i-ty STAN-derdz', emoji: '⚖️', storyId: 'ethical-ai', storyTitle: 'Ethical AI', difficulty: 'hard' },
      { phrase: 'AI governance and ethical frameworks', phonemes: '🏛️ Say: AI GUV-ern-ans AND ETH-i-kal FRAM-wurks', emoji: '🏛️', storyId: 'ethical-ai', storyTitle: 'Ethical AI', difficulty: 'hard' },
      { phrase: 'Responsible technology development', phonemes: '🤖 Say: re-SPON-si-bul tek-NOL-o-gy de-VEL-op-ment', emoji: '🤖', storyId: 'ethical-ai', storyTitle: 'Ethical AI', difficulty: 'hard' }
    ],
    'innovation-summit': [
      { phrase: 'Innovation summit and collaboration', phonemes: '💡 Say: in-no-VAY-shun SUM-it AND kol-ab-or-AY-shun', emoji: '💡', storyId: 'innovation-summit', storyTitle: 'Innovation Summit', difficulty: 'hard' },
      { phrase: 'Technology networking and partnerships', phonemes: '💻 Say: tek-NOL-o-gy NET-work-ing AND PART-ner-shipz', emoji: '💻', storyId: 'innovation-summit', storyTitle: 'Innovation Summit', difficulty: 'hard' },
      { phrase: 'Breakthrough innovation and future planning', phonemes: '💥 Say: BRAYK-throo in-no-VAY-shun AND FYOO-chur PLAN-ing', emoji: '💥', storyId: 'innovation-summit', storyTitle: 'Innovation Summit', difficulty: 'hard' },
      { phrase: 'Collaborative technology development', phonemes: '🤝 Say: kol-AB-or-a-tiv tek-NOL-o-gy de-VEL-op-ment', emoji: '🤝', storyId: 'innovation-summit', storyTitle: 'Innovation Summit', difficulty: 'hard' },
      { phrase: 'Building the future through innovation', phonemes: '⏩ Say: BIL-ding THE FYOO-chur THROO in-no-VAY-shun', emoji: '⏩', storyId: 'innovation-summit', storyTitle: 'Innovation Summit', difficulty: 'hard' }
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
   * Saves to both localStorage and MySQL database
   */
  static async enrollInStory(userId: string, storyId: string, storyTitle: string, storyType: string, score: number = 0): Promise<void> {
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

      // Save to localStorage
      localStorage.setItem(`${this.STORAGE_KEY}_${userId}`, JSON.stringify(enrollments));

      // Save to MySQL database via API
      try {
        const token = localStorage.getItem('speakbee_auth_token');
        if (token && token !== 'local-token') {
          const { API } = await import('./ApiService');
          await API.kids.enrollInStory({
            story_id: storyId,
            story_title: storyTitle,
            story_type: storyType,
            score: score
          }).catch(error => {
            console.warn('Failed to save story enrollment to server:', error);
          });
        }
      } catch (apiError) {
        console.warn('Error saving story enrollment to server (will retry later):', apiError);
      }
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
   * Get vocabulary words for provided story ids (without local storage dependency)
   */
  static getWordsForStoryIds(storyIds: string[]): StoryWord[] {
    const result: StoryWord[] = [];
    const seen = new Set<string>();

    storyIds.forEach((storyId) => {
      const words = this.STORY_VOCABULARY[storyId] || [];
      words.forEach((word) => {
        const key = `${storyId}-${word.word}`;
        if (!seen.has(key)) {
          seen.add(key);
          result.push(word);
        }
      });
    });

    return result;
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
   * Get phrases for provided story ids (without local storage dependency)
   */
  static getPhrasesForStoryIds(storyIds: string[]): StoryPhrase[] {
    const result: StoryPhrase[] = [];
    const seen = new Set<string>();

    storyIds.forEach((storyId) => {
      const phrases = this.STORY_PHRASES[storyId] || [];
      phrases.forEach((phrase) => {
        const key = `${storyId}-${phrase.phrase}`;
        if (!seen.has(key)) {
          seen.add(key);
          result.push(phrase);
        }
      });
    });

    return result;
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

  /**
   * Filter stories by age group (young or teen)
   */
  static filterStoriesByAgeGroup(storyIds: string[], ageGroup: 'young' | 'teen'): string[] {
    const allowedStories = ageGroup === 'young' ? this.YOUNG_KIDS_STORIES : this.TEEN_KIDS_STORIES;
    return storyIds.filter(id => allowedStories.has(id));
  }

  /**
   * Get words from enrolled stories filtered by age group
   * Includes both completed and enrolled (started) stories
   */
  static getWordsFromEnrolledStoriesByAge(userId: string, ageGroup: 'young' | 'teen'): StoryWord[] {
    const enrollments = this.getEnrolledStories(userId);
    const allowedStories = ageGroup === 'young' ? this.YOUNG_KIDS_STORIES : this.TEEN_KIDS_STORIES;
    
    // STRICT FILTERING: Only include stories that belong to the specified age group
    // For 'young': Only stories from YOUNG_KIDS_STORIES (the 20 Young Kids stories)
    // For 'teen': Only stories from TEEN_KIDS_STORIES (the 20 Teen Kids stories)
    const filteredEnrollments = enrollments.filter(
      e => allowedStories.has(e.storyId) // Only include stories from the correct age group set
    );

    const allWords: StoryWord[] = [];
    const seen = new Set<string>();
    
    filteredEnrollments.forEach(enrollment => {
      const storyWords = this.STORY_VOCABULARY[enrollment.storyId] || [];
      storyWords.forEach(word => {
        const key = `${enrollment.storyId}-${word.word}`;
        if (!seen.has(key)) {
          seen.add(key);
          allWords.push(word);
        }
      });
    });

    return allWords;
  }

  /**
   * Get phrases from enrolled stories filtered by age group
   * Includes both completed and enrolled (started) stories
   */
  static getPhrasesFromEnrolledStoriesByAge(userId: string, ageGroup: 'young' | 'teen'): StoryPhrase[] {
    const enrollments = this.getEnrolledStories(userId);
    const allowedStories = ageGroup === 'young' ? this.YOUNG_KIDS_STORIES : this.TEEN_KIDS_STORIES;
    
    // Include all enrolled stories (both completed and started) to show phrases immediately
    // STRICT FILTERING: Only include stories that belong to the specified age group
    const filteredEnrollments = enrollments.filter(
      e => allowedStories.has(e.storyId) // Only include stories from the correct age group
    );

    const allPhrases: StoryPhrase[] = [];
    const seen = new Set<string>();
    
    filteredEnrollments.forEach(enrollment => {
      const storyPhrases = this.STORY_PHRASES[enrollment.storyId] || [];
      storyPhrases.forEach(phrase => {
        const key = `${enrollment.storyId}-${phrase.phrase}`;
        if (!seen.has(key)) {
          seen.add(key);
          allPhrases.push(phrase);
        }
      });
    });

    return allPhrases;
  }

  /**
   * Get words for story IDs filtered by age group
   */
  static getWordsForStoryIdsByAge(storyIds: string[], ageGroup: 'young' | 'teen'): StoryWord[] {
    const allowedStories = ageGroup === 'young' ? this.YOUNG_KIDS_STORIES : this.TEEN_KIDS_STORIES;
    const filteredIds = storyIds.filter(id => allowedStories.has(id));
    
    const result: StoryWord[] = [];
    const seen = new Set<string>();

    filteredIds.forEach((storyId) => {
      const words = this.STORY_VOCABULARY[storyId] || [];
      words.forEach((word) => {
        const key = `${storyId}-${word.word}`;
        if (!seen.has(key)) {
          seen.add(key);
          result.push(word);
        }
      });
    });

    return result;
  }

  /**
   * Get phrases for story IDs filtered by age group
   */
  static getPhrasesForStoryIdsByAge(storyIds: string[], ageGroup: 'young' | 'teen'): StoryPhrase[] {
    const allowedStories = ageGroup === 'young' ? this.YOUNG_KIDS_STORIES : this.TEEN_KIDS_STORIES;
    const filteredIds = storyIds.filter(id => allowedStories.has(id));
    
    const result: StoryPhrase[] = [];
    const seen = new Set<string>();

    filteredIds.forEach((storyId) => {
      const phrases = this.STORY_PHRASES[storyId] || [];
      phrases.forEach((phrase) => {
        const key = `${storyId}-${phrase.phrase}`;
        if (!seen.has(key)) {
          seen.add(key);
          result.push(phrase);
        }
      });
    });

    return result;
  }
}

export default StoryWordsService;
