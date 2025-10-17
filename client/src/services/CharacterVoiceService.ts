/**
 * CharacterVoiceService - Provides expressive character voices for storytelling
 * Each character has unique voice parameters (pitch, rate, volume) to make stories engaging
 */

export interface CharacterVoiceSettings {
  pitch: number;      // 0-2 (default 1)
  rate: number;       // 0.1-10 (default 1)
  volume: number;     // 0-1 (default 1)
  description: string;
}

export type CharacterType = 
  | 'Luna'                  // Magic Forest - Friendly rabbit
  | 'Captain Finn'          // Pirate - Bold captain
  | 'Polly'                 // Pirate - Excited parrot
  | 'Captain Finn & Polly'  // Pirate - Both characters
  | 'Narrator'              // Default narrator
  | 'Owl'                   // Wise old owl
  | 'Butterfly'             // Cheerful butterfly
  | 'River'                 // Gentle river
  | 'Flowers'               // Kind flowers
  | 'Squirrel'              // Playful squirrel
  | 'Cosmo'                 // Space Adventure - Astronaut
  | 'Alien Friend'          // Space Adventure - Friendly alien
  | 'Robot'                 // Space Adventure - Robot
  | 'Finn'                  // Underwater - Fish character
  | 'Dolphin'               // Underwater - Playful dolphin
  | 'Whale'                 // Underwater - Wise whale
  | 'Dina'                  // Dinosaur - Adventurer
  | 'T-Rex'                 // Dinosaur - Big dinosaur
  | 'Triceratops'           // Dinosaur - Friendly dinosaur
  | 'Stardust'              // Unicorn - Magical unicorn
  | 'Twinkle the Fairy'     // Fairy - Tiny magical fairy
  | 'Captain Courage'       // Superhero - Brave superhero
  | 'Citizen'               // Superhero - People to rescue
  | 'Villain'               // Superhero - Silly villain

/**
 * Character voice presets - each character has a unique voice personality
 */
export const CharacterVoices: Record<CharacterType, CharacterVoiceSettings> = {
  // 🐰 Luna - Friendly, excited young rabbit - Magic Forest (sweet, gentle, soft)
  'Luna': {
    pitch: 1.5,
    rate: 0.92,
    volume: 0.9,
    description: 'Sweet, gentle rabbit voice with soft magical tone'
  },
  
  // 🏴‍☠️ Captain Finn - Bold, brave pirate captain - Pirate Adventure (deep, gruff, adventurous)
  'Captain Finn': {
    pitch: 0.65,
    rate: 0.8,
    volume: 1.0,
    description: 'Bold, gruff pirate captain voice with adventurous spirit'
  },
  
  // 🦜 Polly - Excited, high-pitched parrot (very high pitch, faster)
  'Polly': {
    pitch: 2.0,
    rate: 1.2,
    volume: 0.95,
    description: 'Excited, squawky parrot voice'
  },
  
  // 🦉 Owl - Wise, slow, deep voice (lower pitch, very slow)
  'Owl': {
    pitch: 0.5,
    rate: 0.65,
    volume: 0.95,
    description: 'Wise, slow, deep owl voice'
  },
  
  // 🦋 Butterfly - Light, cheerful, sing-song voice (high pitch, moderate)
  'Butterfly': {
    pitch: 1.7,
    rate: 0.95,
    volume: 0.9,
    description: 'Light, cheerful butterfly voice'
  },
  
  // 💧 River - Gentle, flowing, calm voice (moderate pitch, smooth)
  'River': {
    pitch: 1.1,
    rate: 0.75,
    volume: 0.85,
    description: 'Gentle, flowing river voice'
  },
  
  // 🌸 Flowers - Kind, warm, sweet voice (slightly high pitch, gentle)
  'Flowers': {
    pitch: 1.3,
    rate: 0.8,
    volume: 0.9,
    description: 'Kind, warm flower voice'
  },
  
  // 🐿️ Squirrel - Playful, energetic, quick voice (high pitch, fast)
  'Squirrel': {
    pitch: 1.6,
    rate: 1.05,
    volume: 0.95,
    description: 'Playful, energetic squirrel voice'
  },
  
  // 🚀 Cosmo - Adventurous astronaut - Space Adventure (confident, clear, inspiring)
  'Cosmo': {
    pitch: 1.05,
    rate: 0.9,
    volume: 0.95,
    description: 'Confident, clear astronaut voice with inspiring tone'
  },
  
  // 👽 Alien Friend - Friendly alien (slightly high pitch, interesting)
  'Alien Friend': {
    pitch: 1.35,
    rate: 0.9,
    volume: 0.9,
    description: 'Friendly alien voice'
  },
  
  // 🤖 Robot - Mechanical robot (moderate-low pitch, steady)
  'Robot': {
    pitch: 0.85,
    rate: 0.9,
    volume: 0.95,
    description: 'Mechanical robot voice'
  },
  
  // 🐠 Finn - Friendly underwater fish - Underwater World (bubbly, cheerful, flowing)
  'Finn': {
    pitch: 1.35,
    rate: 0.95,
    volume: 0.88,
    description: 'Bubbly, cheerful fish voice with underwater flow'
  },
  
  // 🐬 Dolphin - Playful, happy dolphin (high pitch, energetic)
  'Dolphin': {
    pitch: 1.7,
    rate: 1.0,
    volume: 0.95,
    description: 'Playful, happy dolphin voice'
  },
  
  // 🐋 Whale - Wise, deep whale (very low pitch, slow)
  'Whale': {
    pitch: 0.4,
    rate: 0.65,
    volume: 1.0,
    description: 'Wise, deep whale voice'
  },
  
  // 🦖 Dina - Adventurous dinosaur explorer - Dinosaur Discovery (curious, enthusiastic, scientific)
  'Dina': {
    pitch: 1.15,
    rate: 0.88,
    volume: 0.93,
    description: 'Curious, enthusiastic explorer voice with scientific wonder'
  },
  
  // 🦖 T-Rex - Big, powerful dinosaur (very low pitch, powerful)
  'T-Rex': {
    pitch: 0.3,
    rate: 0.7,
    volume: 1.0,
    description: 'Big, powerful T-Rex voice'
  },
  
  // 🦕 Triceratops - Friendly, gentle dinosaur (low-moderate pitch, calm)
  'Triceratops': {
    pitch: 0.8,
    rate: 0.8,
    volume: 0.9,
    description: 'Friendly, gentle Triceratops voice'
  },
  
  // 🦄 Stardust - Magical, sparkly unicorn - Unicorn Magic (enchanting, graceful, dreamy)
  'Stardust': {
    pitch: 1.45,
    rate: 0.87,
    volume: 0.92,
    description: 'Enchanting, graceful unicorn voice with dreamy magical quality'
  },
  
  // 🧚 Twinkle the Fairy - Tiny, magical fairy - Fairy Garden (delicate, twinkling, sweet)
  'Twinkle the Fairy': {
    pitch: 1.85,
    rate: 0.93,
    volume: 0.82,
    description: 'Delicate, twinkling fairy voice with sweet tinkling tone'
  },
  
  // 🦸 Captain Courage - Strong, confident hero - Superhero School (heroic, bold, powerful)
  'Captain Courage': {
    pitch: 0.88,
    rate: 0.92,
    volume: 0.98,
    description: 'Heroic, bold superhero voice with powerful confidence'
  },
  
  // 🏴‍☠️ Captain Finn & Polly - Combined pirate voices (medium pitch, balanced)
  'Captain Finn & Polly': {
    pitch: 1.0,
    rate: 0.85,
    volume: 1.0,
    description: 'Combined pirate crew voice'
  },
  
  // 👥 Citizen - Regular people (moderate pitch, varied)
  'Citizen': {
    pitch: 1.1,
    rate: 0.9,
    volume: 0.9,
    description: 'Regular citizen voice'
  },
  
  // 🦹 Villain - Silly, dramatic villain (low pitch, dramatic)
  'Villain': {
    pitch: 0.7,
    rate: 0.85,
    volume: 0.95,
    description: 'Silly, dramatic villain voice'
  },
  
  // 📖 Narrator - Default storytelling voice (balanced)
  'Narrator': {
    pitch: 1.0,
    rate: 0.85,
    volume: 1.0,
    description: 'Default narrator voice'
  }
};

/**
 * Get voice settings for a specific character
 */
export function getCharacterVoice(character: CharacterType): CharacterVoiceSettings {
  return CharacterVoices[character] || CharacterVoices['Narrator'];
}

/**
 * Parse character from text hints like "(Luna says)" or dialogue context
 * This helps auto-detect character voices from story text
 */
export function detectCharacterFromText(text: string): CharacterType | null {
  const lowerText = text.toLowerCase();
  
  // Check for explicit character mentions
  if (lowerText.includes('luna') || lowerText.includes('rabbit')) return 'Luna';
  if (lowerText.includes('captain finn') || lowerText.includes('pirate captain')) return 'Captain Finn';
  if (lowerText.includes('polly') || lowerText.includes('parrot')) return 'Polly';
  if (lowerText.includes('owl') || lowerText.includes('wise')) return 'Owl';
  if (lowerText.includes('butterfly')) return 'Butterfly';
  if (lowerText.includes('river') || lowerText.includes('water flowing')) return 'River';
  if (lowerText.includes('flower')) return 'Flowers';
  if (lowerText.includes('squirrel')) return 'Squirrel';
  if (lowerText.includes('cosmo') || lowerText.includes('astronaut')) return 'Cosmo';
  if (lowerText.includes('alien')) return 'Alien Friend';
  if (lowerText.includes('robot')) return 'Robot';
  if (lowerText.includes('finn') && !lowerText.includes('captain')) return 'Finn';
  if (lowerText.includes('dolphin')) return 'Dolphin';
  if (lowerText.includes('whale')) return 'Whale';
  if (lowerText.includes('dina') || lowerText.includes('dinosaur explorer')) return 'Dina';
  if (lowerText.includes('t-rex') || lowerText.includes('tyrannosaurus')) return 'T-Rex';
  if (lowerText.includes('triceratops')) return 'Triceratops';
  if (lowerText.includes('stardust') || lowerText.includes('unicorn')) return 'Stardust';
  if (lowerText.includes('twinkle') || lowerText.includes('fairy')) return 'Twinkle the Fairy';
  if (lowerText.includes('captain courage') || lowerText.includes('superhero')) return 'Captain Courage';
  if (lowerText.includes('villain')) return 'Villain';
  
  return null;
}

/**
 * Get all available character types
 */
export function getAllCharacterTypes(): CharacterType[] {
  return Object.keys(CharacterVoices) as CharacterType[];
}

/**
 * Get voice description for UI display
 */
export function getCharacterVoiceDescription(character: CharacterType): string {
  return CharacterVoices[character]?.description || 'Default voice';
}

export default {
  CharacterVoices,
  getCharacterVoice,
  detectCharacterFromText,
  getAllCharacterTypes,
  getCharacterVoiceDescription
};

