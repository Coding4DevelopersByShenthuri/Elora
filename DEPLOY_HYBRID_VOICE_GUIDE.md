# Quick Deployment Guide: Hybrid Voice System

## 🎯 Goal
Deploy the hybrid online/offline voice system to the remaining 7 story components that currently only use Web Speech API.

---

## 📋 Stories Needing Update

- [ ] SpaceAdventure.tsx
- [ ] UnderwaterWorld.tsx
- [ ] DinosaurDiscoveryAdventure.tsx
- [ ] UnicornMagicAdventure.tsx
- [ ] PirateTreasureAdventure.tsx
- [ ] SuperheroSchoolAdventure.tsx
- [ ] FairyGardenAdventure.tsx

**Reference Implementation**: MagicForestAdventure.tsx ✅

---

## 🚀 Step-by-Step Migration

### Step 1: Update Imports

**BEFORE** (Old - Web Speech only):
```typescript
import SpeechService from '@/services/SpeechService';
```

**AFTER** (New - Hybrid system):
```typescript
import HybridVoiceService, { STORY_VOICES, type DownloadStatus } from '@/services/HybridVoiceService';
import { useAuth } from '@/contexts/AuthContext';
```

---

### Step 2: Add State Variables

Add these new state variables after existing state:

```typescript
// Add user ID for voice download tracking
const { user } = useAuth();
const userId = user?.id ? String(user.id) : 'local-user';

// Voice availability
const [ttsAvailable, setTtsAvailable] = useState(true);

// Download status for online users
const [downloadStatus, setDownloadStatus] = useState<DownloadStatus | null>(null);

// Accessibility features (optional but recommended)
const [showTranscript, setShowTranscript] = useState(false);
const [playbackSpeed, setPlaybackSpeed] = useState<'normal' | 'slow' | 'slower'>('normal');
const [captionsEnabled, setCaptionsEnabled] = useState(false);
const [currentCaption, setCurrentCaption] = useState('');
```

---

### Step 3: Add Voice Initialization

Replace the old TTS initialization with hybrid voice initialization:

**Add this useEffect** (after other useEffects):

```typescript
// Initialize hybrid voice system
useEffect(() => {
  const initializeVoice = async () => {
    // Initialize Piper TTS (offline) or Web Speech (online fallback)
    await HybridVoiceService.initialize();
    
    // Check if any voice system is available
    const available = HybridVoiceService.isAvailable();
    setTtsAvailable(available);
    
    if (!available) {
      console.warn('No voice synthesis available, falling back to text-only mode');
      setShowTranscript(true); // Auto-enable transcript if no voice
    } else {
      const mode = HybridVoiceService.getVoiceMode();
      console.log(`🎤 Voice mode: ${mode}`);
    }
  };
  initializeVoice();
  
  // Subscribe to download progress (for online users downloading Piper voices)
  const unsubscribe = HybridVoiceService.onDownloadProgress((status) => {
    setDownloadStatus(status);
    
    // Update TTS availability when download completes
    if (!status.downloading && status.progress === 100) {
      setTtsAvailable(true);
      console.log('🎉 High-quality kid voices now available!');
    }
  });
  
  // Cleanup subscription on unmount
  return () => unsubscribe();
}, [userId]);
```

---

### Step 4: Update Voice Playback Function

**BEFORE** (Old):
```typescript
// Auto-play story narration with character voice
useEffect(() => {
  if (current.text && SpeechService.isTTSSupported()) {
    const playNarration = async () => {
      try {
        await SpeechService.speakAsCharacter(current.text, current.character as any);
      } catch (error) {
        console.log('TTS not available');
      }
    };
    playNarration();
  }
}, [current.text, current.character]);
```

**AFTER** (New):
```typescript
// Helper function to remove emojis from text before TTS
const stripEmojis = (text: string): string => {
  return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{FE00}-\u{FE0F}]|[\u{E0020}-\u{E007F}]/gu, '').trim();
};

// Enhanced audio playback with hybrid voice system
const playAudioWithCaptions = async (text: string, showCaptions: boolean = false) => {
  try {
    const cleanText = stripEmojis(text);
    
    // Get the character's voice profile
    const voiceProfile = STORY_VOICES[current.character as keyof typeof STORY_VOICES];
    
    await HybridVoiceService.speak(
      cleanText,
      voiceProfile,
      {
        speed: playbackSpeed,
        showCaptions: showCaptions && captionsEnabled,
        onCaptionUpdate: setCurrentCaption
      }
    );
  } catch (error) {
    console.log('Voice synthesis failed, showing text instead');
    setTtsAvailable(false);
    setShowTranscript(true);
    throw error;
  }
};

// Auto-play for non-interactive steps
useEffect(() => {
  if (!current.listeningFirst && current.text && ttsAvailable) {
    const playNarration = async () => {
      try {
        await playAudioWithCaptions(current.text, true);
      } catch (error) {
        console.log('TTS not available');
      }
    };
    playNarration();
  }
}, [stepIndex, playbackSpeed]);
```

---

### Step 5: Add Download Progress Banner (Optional but Recommended)

Add this in the JSX, right after the header section:

```tsx
{/* Download Progress Banner (Online Users) */}
{downloadStatus?.downloading && (
  <div className="mb-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2.5 rounded-lg shadow-lg animate-fade-in">
    <div className="flex items-center gap-3 mb-1.5">
      <Download className="w-4 h-4 animate-bounce" />
      <span className="text-xs sm:text-sm font-bold">
        Downloading High-Quality Kid Voices... {Math.round(downloadStatus.progress)}%
      </span>
    </div>
    <Progress 
      value={downloadStatus.progress} 
      className="h-1.5 bg-white/30"
    >
      <div className="h-full bg-white rounded-full transition-all duration-500" />
    </Progress>
    <p className="text-xs opacity-90 mt-1">
      ✨ Your app will work offline after this download!
    </p>
  </div>
)}

{/* Download Complete Notification */}
{downloadStatus && !downloadStatus.downloading && downloadStatus.progress === 100 && stepIndex < 2 && (
  <div className="mb-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">
    <div className="flex items-center gap-2 justify-center">
      <span className="text-xl">🎉</span>
      <span className="text-xs sm:text-sm font-bold">
        Kid voices ready! Now works offline too!
      </span>
      <span className="text-xl">✨</span>
    </div>
  </div>
)}

{/* Live Caption Display */}
{captionsEnabled && currentCaption && (
  <div className="mb-2 bg-black/80 text-white px-4 py-2 rounded-lg text-center text-sm sm:text-base font-semibold animate-fade-in">
    {currentCaption}
  </div>
)}
```

---

### Step 6: Add Accessibility Controls (Optional but Recommended)

Add these controls in the header section, near other buttons:

```tsx
{/* Accessibility Controls */}
<div className="flex gap-1">
  {/* Transcript Toggle */}
  <Button
    variant="ghost"
    size="sm"
    onClick={() => setShowTranscript(!showTranscript)}
    className={cn(
      "h-7 w-7 p-0 rounded-full",
      showTranscript && "bg-blue-100 dark:bg-blue-900"
    )}
    title="Toggle text transcript"
  >
    <FileText className="w-3.5 h-3.5" />
  </Button>
  
  {/* Captions Toggle */}
  <Button
    variant="ghost"
    size="sm"
    onClick={() => setCaptionsEnabled(!captionsEnabled)}
    className={cn(
      "h-7 w-7 p-0 rounded-full",
      captionsEnabled && "bg-purple-100 dark:bg-purple-900"
    )}
    title="Toggle captions"
  >
    <Eye className="w-3.5 h-3.5" />
  </Button>
  
  {/* Speed Control */}
  <Button
    variant="ghost"
    size="sm"
    onClick={() => {
      setPlaybackSpeed(prev => 
        prev === 'normal' ? 'slow' : prev === 'slow' ? 'slower' : 'normal'
      );
    }}
    className="h-7 px-2 rounded-full text-xs"
    title={`Speed: ${playbackSpeed}`}
  >
    <Gauge className="w-3.5 h-3.5 mr-1" />
    {playbackSpeed === 'normal' ? '1x' : playbackSpeed === 'slow' ? '0.8x' : '0.6x'}
  </Button>
</div>
```

---

### Step 7: Update Icon Imports

Make sure you have all necessary icons imported:

```typescript
import { 
  // ... existing imports
  Download,    // For download progress
  FileText,    // For transcript toggle
  Eye,         // For captions toggle
  Gauge,       // For speed control
  // ... other icons
} from 'lucide-react';
```

---

### Step 8: Character Voice Mapping

Verify your story character is mapped in `STORY_VOICES` (in HybridVoiceService.ts):

```typescript
// Check current.character value (e.g., "Cosmo", "Finn", etc.)
// Make sure it matches a key in STORY_VOICES object

// Example for Space Adventure:
const COSMO_VOICE = STORY_VOICES.Cosmo;

// Example for Underwater World:
const FINN_VOICE = STORY_VOICES.Finn;

// etc.
```

**Available Voice Profiles**:
- `Luna` - Magic Forest (cheerful 6yo girl)
- `Cosmo` - Space Adventure (excited 7yo boy)
- `Finn` - Underwater World (gentle 6yo boy)
- `Dina` - Dinosaur Discovery (bold 8yo girl)
- `Stardust` - Unicorn Magic (sweet 5yo girl)
- `CaptainFinn` - Pirate Treasure (brave 8yo boy)
- `CaptainCourage` - Superhero School (determined 7yo)
- `Twinkle` - Fairy Garden (whimsical 6yo girl)

---

## 🔍 Quick Checklist

For each story component, verify:

- [ ] ✅ Import HybridVoiceService instead of SpeechService
- [ ] ✅ Import STORY_VOICES and DownloadStatus type
- [ ] ✅ Import useAuth to get userId
- [ ] ✅ Add state: ttsAvailable, downloadStatus
- [ ] ✅ Add useEffect for HybridVoiceService.initialize()
- [ ] ✅ Subscribe to download progress updates
- [ ] ✅ Create stripEmojis() helper function
- [ ] ✅ Create playAudioWithCaptions() function
- [ ] ✅ Update auto-play useEffect to use hybrid system
- [ ] ✅ Add download progress banner (optional)
- [ ] ✅ Add accessibility controls (optional)
- [ ] ✅ Verify character voice mapping
- [ ] ✅ Test offline mode
- [ ] ✅ Test online mode with download
- [ ] ✅ Test fallback to Web Speech

---

## 🧪 Testing Procedure

After updating each story:

### 1. Test Online First-Time User
```
1. Clear IndexedDB: Application > Storage > IndexedDB > Delete "PiperModelsDB"
2. Refresh page
3. Open story
4. Expected: 
   - Web Speech API plays immediately (standard voice)
   - Download banner appears
   - Download progresses 0% → 100%
   - "Kid voices ready!" notification
5. Close and reopen story
6. Expected: High-quality Piper kid voice plays
```

### 2. Test Offline Mode
```
1. Make sure Piper model is downloaded (from test 1)
2. Open DevTools > Network tab > Toggle "Offline"
3. Refresh page
4. Open story
5. Expected: 
   - Piper TTS loads from cache
   - High-quality kid voice plays
   - No network requests for voice
```

### 3. Test Fallback Mode
```
1. Clear all storage (Application > Clear site data)
2. Go offline
3. Open story
4. Expected:
   - Falls back to Web Speech API (if available)
   - OR shows transcript mode (text only)
```

### 4. Test Accessibility Features
```
1. Click transcript button
2. Expected: Text appears alongside audio
3. Click captions button
4. Expected: Live captions during playback
5. Click speed button
6. Expected: Cycles through 1x → 0.8x → 0.6x
```

---

## 📊 Expected Outcomes

### Immediate Benefits
- ✅ High-quality kid voices in all stories
- ✅ Offline capability for all stories
- ✅ Consistent voice quality across browsers/devices
- ✅ Better accessibility (transcript, captions, speed)
- ✅ Auto-download for online users

### Performance
- ✅ No performance degradation
- ✅ ~28MB one-time download
- ✅ Faster initialization after first download
- ✅ Non-blocking background download

### User Experience
- ✅ Seamless transition from online to offline
- ✅ No interruption during story playback
- ✅ Progress visibility during download
- ✅ Graceful fallback if issues occur

---

## 🐛 Common Issues & Solutions

### Issue: "Voice sounds adult/robotic"
**Cause**: Using Web Speech API fallback (Piper not downloaded)  
**Solution**: Wait for download to complete, or manually trigger download

### Issue: "Download progress stuck at 0%"
**Cause**: Network issues or CORS  
**Solution**: Check console for errors, verify Hugging Face is accessible

### Issue: "Cannot read property 'pitch' of undefined"
**Cause**: Character name doesn't match STORY_VOICES key  
**Solution**: Check `current.character` value and STORY_VOICES mapping

### Issue: "No audio plays at all"
**Cause**: Both Piper and Web Speech failed  
**Solution**: Check browser permissions, enable transcript mode

---

## 📝 Example: Full Migration (SpaceAdventure.tsx)

Here's a complete before/after example:

### BEFORE:
```typescript
import SpeechService from '@/services/SpeechService';

const SpaceAdventure = ({ onClose, onComplete }: Props) => {
  const [stepIndex, setStepIndex] = useState(0);
  // ... other state
  
  useEffect(() => {
    if (current.text && SpeechService.isTTSSupported()) {
      SpeechService.speakAsCharacter(current.text, current.character);
    }
  }, [current.text]);
  
  return (/* JSX */);
};
```

### AFTER:
```typescript
import HybridVoiceService, { STORY_VOICES, type DownloadStatus } from '@/services/HybridVoiceService';
import { useAuth } from '@/contexts/AuthContext';

const SpaceAdventure = ({ onClose, onComplete }: Props) => {
  const { user } = useAuth();
  const userId = user?.id ? String(user.id) : 'local-user';
  
  const [stepIndex, setStepIndex] = useState(0);
  const [ttsAvailable, setTtsAvailable] = useState(true);
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<'normal' | 'slow' | 'slower'>('normal');
  // ... other state
  
  // Initialize hybrid voice
  useEffect(() => {
    const initializeVoice = async () => {
      await HybridVoiceService.initialize();
      const available = HybridVoiceService.isAvailable();
      setTtsAvailable(available);
    };
    initializeVoice();
    
    const unsubscribe = HybridVoiceService.onDownloadProgress((status) => {
      setDownloadStatus(status);
      if (!status.downloading && status.progress === 100) {
        setTtsAvailable(true);
      }
    });
    
    return () => unsubscribe();
  }, [userId]);
  
  const stripEmojis = (text: string) => {
    return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]/gu, '').trim();
  };
  
  const playAudioWithCaptions = async (text: string) => {
    try {
      const cleanText = stripEmojis(text);
      const voiceProfile = STORY_VOICES.Cosmo; // Space character
      await HybridVoiceService.speak(cleanText, voiceProfile, { speed: playbackSpeed });
    } catch (error) {
      console.log('Voice failed, using fallback');
    }
  };
  
  useEffect(() => {
    if (current.text && ttsAvailable) {
      playAudioWithCaptions(current.text);
    }
  }, [stepIndex, playbackSpeed]);
  
  return (/* JSX with download banner */);
};
```

---

## ✅ Deployment Progress Tracker

| Story | Status | Tested | Notes |
|-------|--------|--------|-------|
| Magic Forest ✅ | Done | ✅ | Reference implementation |
| Space Adventure | 🔄 | ⬜ | In progress |
| Underwater World | ⬜ | ⬜ | Pending |
| Dinosaur Discovery | ⬜ | ⬜ | Pending |
| Unicorn Magic | ⬜ | ⬜ | Pending |
| Pirate Treasure | ⬜ | ⬜ | Pending |
| Superhero School | ⬜ | ⬜ | Pending |
| Fairy Garden | ⬜ | ⬜ | Pending |

**Goal**: 8/8 stories with hybrid voice system ✅

---

## 📞 Need Help?

If you encounter issues:
1. Check the reference implementation: `MagicForestAdventure.tsx`
2. Review console logs for voice mode detection
3. Verify character mapping in `STORY_VOICES`
4. Test in incognito mode (fresh storage)
5. Check browser DevTools > Application > IndexedDB

---

**Last Updated**: 2025-01-XX  
**Estimated Time**: 2-3 hours for all 7 stories  
**Difficulty**: Easy (mostly copy-paste)  
**Impact**: High (better voice quality + offline support)

