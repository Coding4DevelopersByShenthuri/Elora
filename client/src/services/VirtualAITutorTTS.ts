import EnhancedTTS, { type Voice, type TTSOptions } from './EnhancedTTS';

// Re‑declare the tutor IDs used in `VirtualAI.tsx` so we can map voices per tutor
export type VirtualTutorId =
  | 'elora'
  | 'elora-x'
  | 'mateo'
  | 'hazel'
  | 'skye'
  | 'jasmine'
  | 'darius'
  | 'aiko'
  | 'anisha'
  | 'reina'
  | 'layla'
  | 'santa-claus'
  | 'mrs-claus';

type Emotion = NonNullable<TTSOptions['emotion']>;

interface TutorVoiceProfile {
  id: VirtualTutorId;
  /** Base speaking rate (1 = normal) */
  rate: number;
  /** Base pitch (1 = neutral) */
  pitch: number;
  /** High‑level emotion to shape prosody */
  emotion: Emotion;
  /** Preferred age group for the OS voice (best-effort only) */
  preferredAge?: Voice['age'];
  /** Preferred language region for the OS voice (best-effort only) */
  preferredLang?: string;
  /** Preferred gender for the OS voice (best-effort only) */
  preferredGender?: Voice['gender'];
  /** Optional ordered list of substrings to match against the underlying OS voice name for this tutor */
  voicePreferenceKeywords?: string[];
}

const TUTOR_VOICE_PROFILES: Record<VirtualTutorId, TutorVoiceProfile> = {
  'elora': {
    id: 'elora',
    // Calm, clear adult female
    rate: 0.95,
    pitch: 1.02,
    emotion: 'calm',
    preferredAge: 'adult',
    preferredLang: 'en-US',
    preferredGender: 'female',
    // Prefer very natural US female voices when available
    voicePreferenceKeywords: [
      // Microsoft / Windows
      'aria',
      'zira',
      // macOS
      'samantha',
      // Chrome Google voices
      'google us english female',
    ],
  },
  'elora-x': {
    id: 'elora-x',
    // Robotic female voice: a bit faster and slightly higher, but emotionally flat
    rate: 1.12,
    pitch: 1.08,
    emotion: 'neutral',
    preferredAge: 'adult',
    preferredLang: 'en-US',
    // Force female so it sounds like a “lady robot” where possible
    preferredGender: 'female',
    // Prefer synthetic / assistant-like female voices if exposed by the platform
    voicePreferenceKeywords: [
      'robot',
      'electronic',
      'assistant',
      // Online / neural assistant-style voices often sound a bit more synthetic
      'online (natural)',
      'neural',
      // Fallbacks
      'google us english female',
      'aria',
      'zira',
    ],
  },
  'mateo': {
    id: 'mateo',
    // Friendly young male – a bit faster and slightly higher than an adult male
    rate: 1.12,
    pitch: 1.08,
    emotion: 'happy',
    preferredAge: 'adult',
    preferredLang: 'en',
    preferredGender: 'male',
    // Prefer clearer, lighter male voices so he sounds younger than Darius
    voicePreferenceKeywords: [
      // Chrome Google
      'google uk english male',
      'google us english',
      // macOS / Windows youthful-sounding males
      'daniel',
      'mark',
      'david',
      'guy',
    ],
  },
  'hazel': {
    id: 'hazel',
    // Warm British storyteller
    rate: 0.96,
    pitch: 1.03,
    emotion: 'happy',
    preferredAge: 'adult',
    preferredLang: 'en-GB',
    preferredGender: 'female',
    voicePreferenceKeywords: [
      // macOS / UK-style females
      'serena',
      'kate',
      'victoria',
      // Chrome Google
      'google uk english female',
    ],
  },
  'skye': {
    id: 'skye',
    // Energetic speaking coach
    rate: 1.1,
    pitch: 1.0,
    emotion: 'excited',
    preferredAge: 'adult',
    preferredLang: 'en',
    preferredGender: 'female',
    voicePreferenceKeywords: [
      // Energetic, bright-sounding US / generic English voices
      'google us english',
      'aria',
      'samantha',
      'victoria',
    ],
  },
  'jasmine': {
    id: 'jasmine',
    // Relaxed, friendly
    rate: 1.0,
    pitch: 1.02,
    emotion: 'happy',
    preferredAge: 'adult',
    preferredLang: 'en-US',
    preferredGender: 'female',
    voicePreferenceKeywords: [
      // Neutral US English female
      'zira',
      'samantha',
      'aria',
      'google us english female',
    ],
  },
  'darius': {
    id: 'darius',
    // Confident young gent – slightly faster with a clear tone
    rate: 1.05,
    pitch: 1.02,
    emotion: 'calm',
    preferredAge: 'adult',
    preferredLang: 'en-US',
    preferredGender: 'male',
    voicePreferenceKeywords: [
      // Microsoft / Windows
      'david',
      'mark',
      // macOS
      'daniel',
      // Chrome Google
      'google us english male',
      'google uk english male',
    ],
  },
  'aiko': {
    id: 'aiko',
    // Precise, slightly slower female voice
    rate: 0.9,
    pitch: 1.08,
    emotion: 'calm',
    preferredAge: 'adult',
    preferredLang: 'en',
    preferredGender: 'female',
    voicePreferenceKeywords: [
      // Neutral / slightly technical-sounding English females
      'google us english',
      'victoria',
      'zira',
      'female',
    ],
  },
  'anisha': {
    id: 'anisha',
    // Dynamic, faster female voice
    rate: 1.08,
    pitch: 1.06,
    emotion: 'excited',
    preferredAge: 'adult',
    preferredLang: 'en',
    preferredGender: 'female',
    voicePreferenceKeywords: [
      // Bright, dynamic English female voices
      'google uk english female',
      'google us english',
      'samantha',
      'zira',
    ],
  },
  'reina': {
    id: 'reina',
    // Cheerful, chatty female
    rate: 1.02,
    pitch: 1.05,
    emotion: 'happy',
    preferredAge: 'adult',
    preferredLang: 'en',
    preferredGender: 'female',
    voicePreferenceKeywords: [
      // Friendly Latin-American-style or neutral English voices
      'google us english',
      'google uk english female',
      'aria',
      'victoria',
    ],
  },
  'layla': {
    id: 'layla',
    // Professional, slightly slower
    rate: 0.96,
    pitch: 1.0,
    emotion: 'calm',
    preferredAge: 'adult',
    preferredLang: 'en',
    preferredGender: 'female',
    voicePreferenceKeywords: [
      // Professional, slightly more formal English females
      'google uk english female',
      'victoria',
      'serena',
      'samantha',
    ],
  },
  'santa-claus': {
    id: 'santa-claus',
    // Older, warm male voice – slower and a bit lower
    rate: 0.9,
    pitch: 0.85,
    emotion: 'happy',
    preferredAge: 'senior',
    preferredLang: 'en',
    preferredGender: 'male',
    voicePreferenceKeywords: [
      // Try to find explicitly old / grandpa / Santa-style voices first
      'santa',
      'claus',
      'grandpa',
      'old man',
      // Fallback older-sounding male TTS voices
      'david',
      'mark',
      'daniel',
      'google us english male',
    ],
  },
  'mrs-claus': {
    id: 'mrs-claus',
    // Older, gentle female – slower and slightly lower
    rate: 0.92,
    pitch: 0.98,
    emotion: 'happy',
    preferredAge: 'senior',
    preferredLang: 'en',
    preferredGender: 'female',
    voicePreferenceKeywords: [
      // Explicitly old / grandma style voices when available
      'mrs claus',
      'grandma',
      'old woman',
      // Fallback older / storyteller female voices
      'victoria',
      'serena',
      'samantha',
      'google uk english female',
    ],
  },
};

// Cache assignments so each tutor keeps a consistent voice within a session
const assignedTutorVoices = new Map<VirtualTutorId, string>();

function pickBestVoice(profile: TutorVoiceProfile): Voice | null {
  const voices = EnhancedTTS.getVoices();
  if (!voices.length) return null;

  const { id: tutorId, preferredLang, preferredGender, preferredAge, voicePreferenceKeywords } =
    profile;

  // If we've already assigned a voice to this tutor in this session, reuse it
  const existingVoiceId = assignedTutorVoices.get(tutorId);
  if (existingVoiceId) {
    const existing = voices.find((v) => v.id === existingVoiceId);
    if (existing) return existing;
  }

  const usedVoiceIds = new Set(assignedTutorVoices.values());

  const pickFromCandidates = (candidates: Voice[]): Voice | null => {
    if (!candidates.length) return null;
    // Prefer voices not yet used by other tutors, to maximise variety
    const unused = candidates.filter((v) => !usedVoiceIds.has(v.id));
    return (unused[0] ?? candidates[0]) ?? null;
  };

  const matchesProfile = (voice: Voice): boolean => {
    const langOk = preferredLang
      ? voice.lang.toLowerCase().startsWith(preferredLang.toLowerCase())
      : true;
    const genderOk = preferredGender ? voice.gender === preferredGender : true;
    const ageOk = preferredAge ? voice.age === preferredAge : true;
    return langOk && genderOk && ageOk;
  };

  // 1) Try tutor‑specific name hints so different characters get different ladies / gents voices
  if (voicePreferenceKeywords && voicePreferenceKeywords.length > 0) {
    const loweredPrefs = voicePreferenceKeywords.map((k) => k.toLowerCase());

    const nameMatches = voices.filter((voice) =>
      loweredPrefs.some((pref) => voice.name.toLowerCase().includes(pref)),
    );

    const nameMatch = pickFromCandidates(nameMatches);
    if (nameMatch) {
      assignedTutorVoices.set(tutorId, nameMatch.id);
      return nameMatch;
    }
  }

  // 2) Try to match language, gender and age
  const fullMatches = voices.filter((voice) => matchesProfile(voice));
  const fullMatch = pickFromCandidates(fullMatches);
  if (fullMatch) {
    assignedTutorVoices.set(tutorId, fullMatch.id);
    return fullMatch;
  }

  // 3) Relax age: match by language and gender only
  const langGenderMatches = voices.filter((voice) => {
    const langOk = preferredLang
      ? voice.lang.toLowerCase().startsWith(preferredLang.toLowerCase())
      : true;
    const genderOk = preferredGender ? voice.gender === preferredGender : true;
    return langOk && genderOk;
  });
  const langGenderMatch = pickFromCandidates(langGenderMatches);
  if (langGenderMatch) {
    assignedTutorVoices.set(tutorId, langGenderMatch.id);
    return langGenderMatch;
  }

  // 4) Then match by language only
  if (preferredLang) {
    const langMatches = voices.filter((voice) =>
      voice.lang.toLowerCase().startsWith(preferredLang.toLowerCase()),
    );
    const langMatch = pickFromCandidates(langMatches);
    if (langMatch) {
      assignedTutorVoices.set(tutorId, langMatch.id);
      return langMatch;
    }
  }

  // 5) Fallback: let EnhancedTTS choose a reasonable English voice
  const recommended = EnhancedTTS.getRecommendedVoice('beginner');
  if (recommended) {
    const chosen = pickFromCandidates([recommended]);
    if (chosen) {
      assignedTutorVoices.set(tutorId, chosen.id);
      return chosen;
    }
  }

  // 6) Last resort: first voice in list
  const fallback = pickFromCandidates(voices);
  if (fallback) {
    assignedTutorVoices.set(tutorId, fallback.id);
    return fallback;
  }

  return null;
}

/**
 * Speak a short line using the given tutor's voice profile.
 * Throws if TTS is not supported in the current browser.
 */
export async function speakTutorLine(tutorId: VirtualTutorId, text: string): Promise<void> {
  if (!EnhancedTTS.isSupported()) {
    throw new Error('Text‑to‑speech is not supported in this browser or device.');
  }

  const profile = TUTOR_VOICE_PROFILES[tutorId] ?? TUTOR_VOICE_PROFILES['elora'];
  const voice = pickBestVoice(profile);

  const options: TTSOptions = {
    voice: voice?.id,
    rate: profile.rate,
    pitch: profile.pitch,
    emotion: profile.emotion,
  };

  await EnhancedTTS.speak(text, options);
}

export function isVirtualAITtsSupported(): boolean {
  return EnhancedTTS.isSupported();
}


