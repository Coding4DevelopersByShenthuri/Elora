# 🎤 Voice System Quick Reference Card

## One-Page Overview

---

## 🎯 What Voice Does Each User Get?

| User Type | First Visit | After Download | Offline |
|-----------|-------------|----------------|---------|
| **Online (First Time)** | Web Speech → Piper | Piper TTS | Piper TTS |
| **Online (Returning)** | Piper TTS | Piper TTS | Piper TTS |
| **Always Offline** | Web Speech | Web Speech | Web Speech |
| **No TTS Support** | Text Only | Text Only | Text Only |

---

## ⏱️ Timeline for Online Users

```
0:00 sec  → Opens story
0:01 sec  → 🔊 Web Speech starts (adult voice pitched up)
0:01 sec  → 📥 Background download begins
0:45 sec  → 📊 Download at 75%
1:00 min  → ✅ Download complete
1:01 min  → 🎉 Switch to Piper TTS (kid voices!)
Forever   → 🚀 Uses Piper (works offline now)
```

---

## 🎨 Voice Quality

| System | Quality | Sounds Like | Offline? |
|--------|---------|-------------|----------|
| **Piper TTS** | ⭐⭐⭐⭐⭐ | Real 8-year-old kid | ✅ Yes |
| **Web Speech** | ⭐⭐⭐ | Adult voice (pitched up) | ❌ No |
| **Text Only** | ⭐⭐ | No audio | ✅ Yes |

---

## 💾 Storage

- **Download Size**: ~8-15 MB (one-time)
- **Cache Location**: IndexedDB (browser)
- **Expires**: Never (until user clears)
- **Offline Ready**: Yes, after first download

---

## 🔧 Code Examples

### **Check Voice Status**

```typescript
// What voice is being used?
HybridVoiceService.getVoiceMode();
// Returns: 'piper' | 'webspeech' | 'unavailable'

// Is any TTS available?
HybridVoiceService.isAvailable();
// Returns: true | false
```

### **Subscribe to Download Progress**

```typescript
useEffect(() => {
  const unsubscribe = HybridVoiceService.onDownloadProgress((status) => {
    console.log(`Download: ${status.progress}%`);
  });
  
  return () => unsubscribe();
}, []);
```

### **Speak with Auto Voice Selection**

```typescript
import HybridVoiceService, { STORY_VOICES } from '@/services/HybridVoiceService';

// Automatically uses best available voice
await HybridVoiceService.speak(
  "Welcome to our forest",
  STORY_VOICES.Luna,
  { speed: 'normal' }
);
```

---

## 🎭 Character Voices

| Character | Piper Model | Pitch | Rate | Age/Sound |
|-----------|-------------|-------|------|-----------|
| **Luna** | amy-medium | 1.2 | 0.9 | Girl, 8 years |
| **Cosmo** | amy-medium | 1.1 | 1.0 | Boy, 10 years |
| **Finn** | amy-medium | 1.0 | 0.85 | Boy, 7 years |
| **Bella** | amy-medium | 1.3 | 0.95 | Girl, 6 years |
| **Max** | amy-medium | 1.15 | 1.05 | Boy, 9 years |
| **Zara** | amy-medium | 1.25 | 0.92 | Girl, 8 years |
| **Oliver** | amy-medium | 1.05 | 0.88 | Boy, 7 years |
| **Mia** | amy-medium | 1.28 | 0.93 | Girl, 6 years |

*All use same base model but differentiated by pitch/rate adjustments*

---

## 🚦 Voice Priority Logic

```
1. Try Piper TTS (offline, high-quality)
   └─ If available → Use Piper ✅
   
2. Fallback to Web Speech API (online, decent)
   └─ If available → Use Web Speech ⚠️
   
3. Fallback to Text Only (always works)
   └─ No audio → Show text 📝
```

---

## 📊 Download Process

### **Automatic Download**

```typescript
// Triggered automatically on first visit
if (online && !piperAvailable) {
  startBackgroundDownload();
}
```

### **Manual Download**

```typescript
// Force download/retry
await HybridVoiceService.initialize();
```

### **Clear Cache**

```typescript
import { VoiceModelManager } from '@/services/VoiceModelManager';

// Delete all downloaded voice models
await VoiceModelManager.clearCache();
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| **No audio** | Check: `HybridVoiceService.isAvailable()` |
| **Still using Web Speech after download** | Check console for Piper errors |
| **Download stuck** | Clear cache, reload, retry |
| **Works online but not offline** | Download may have failed, check cache |

---

## 🎮 Testing Commands

### **Test First-Time User**

```javascript
// Clear everything
indexedDB.deleteDatabase('PiperModelsDB');
localStorage.clear();
location.reload();
```

### **Test Offline Mode**

```javascript
// In DevTools → Network tab → Throttling → "Offline"
// OR Application tab → Service Workers → "Offline"
```

### **Check Cache Size**

```javascript
import { VoiceModelManager } from '@/services/VoiceModelManager';
const size = await VoiceModelManager.getCacheSize();
console.log(`Cache: ${(size / 1024 / 1024).toFixed(2)} MB`);
```

---

## 📱 Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| **Web Speech API** | ✅ | ✅ | ✅ | ✅ |
| **Piper TTS (WASM)** | ✅ | ✅ | ✅ | ✅ |
| **IndexedDB** | ✅ | ✅ | ✅ | ✅ |
| **Auto-Download** | ✅ | ✅ | ✅ | ✅ |

---

## 📂 Key Files

1. `client/src/services/HybridVoiceService.ts` - Voice orchestrator
2. `client/src/services/VoiceModelManager.ts` - Download manager (voice models)
3. `client/src/services/PiperTTS.ts` - Offline TTS engine
4. `client/src/services/SpeechService.ts` - Web Speech wrapper
5. `client/src/components/kids/stories/MagicForestAdventure.tsx` - Example usage

---

## 🎯 Key Benefits

✅ **Instant Start** - No waiting for downloads
✅ **Progressive** - Good → Better → Best
✅ **Transparent** - User sees progress
✅ **Offline-Ready** - One download = forever offline
✅ **Adaptive** - Works at all quality levels
✅ **Accessible** - Text fallback always available

---

## 💡 Remember

- **First time online users**: Get Web Speech initially, then upgrade to Piper
- **Returning users**: Always get Piper (best quality)
- **Offline users**: Get Web Speech (if supported) or text
- **Download is automatic**: No user action required
- **Works everywhere**: Progressive enhancement ensures compatibility

---

## 🎉 Result

**Every user gets the best possible experience for their situation!**

No one is blocked, everyone can use the app, and quality improves automatically. 🚀

