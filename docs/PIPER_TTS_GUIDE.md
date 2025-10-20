# 🎙️ Piper TTS Integration Guide

Complete guide for integrating high-quality offline Text-to-Speech using Piper.

---

## 📋 What is Piper?

**Piper** is a fast, local neural text-to-speech system that:
- ✅ Runs entirely offline
- ✅ Uses ONNX models (50-150MB per voice)
- ✅ Produces natural-sounding speech
- ✅ Works on CPU (no GPU required)
- ✅ Faster than real-time on most devices

**Piper Website:** https://github.com/rhasspy/piper

---

## 🚀 Quick Start

### Option 1: Use Web Speech API (Default)

Already working! The app uses `EnhancedTTS` with Web Speech API:

```typescript
import { EnhancedTTS } from './services/EnhancedTTS';

await EnhancedTTS.speak('Hello, world!', {
  rate: 0.9,
  pitch: 1.0,
  emotion: 'happy'
});
```

**Pros:**
- Zero setup
- Works everywhere
- No downloads

**Cons:**
- Requires internet on some browsers
- Voice quality varies
- Limited control

### Option 2: Add Piper for Better Quality

Follow this guide to integrate Piper voices.

---

## 📦 Installation

### Step 1: Download Piper Voices

Visit: https://github.com/rhasspy/piper/releases/latest

Download ONNX voice files. Recommended voices:

**English (US):**
```bash
# High quality, female
en_US-amy-medium.onnx (82 MB)
en_US-amy-medium.onnx.json

# High quality, male
en_US-lessac-medium.onnx (81 MB)
en_US-lessac-medium.onnx.json

# Fast, lower quality (for low-end devices)
en_US-amy-low.onnx (35 MB)
en_US-amy-low.onnx.json
```

**English (UK):**
```bash
en_GB-alan-medium.onnx (83 MB)
en_GB-alan-medium.onnx.json
```

### Step 2: Host Voice Files

#### Option A: Local Development

Place downloaded files in `client/public/piper-voices/`:

```
client/
  public/
    piper-voices/
      en_US-amy-medium.onnx
      en_US-amy-medium.onnx.json
      en_US-lessac-medium.onnx
      en_US-lessac-medium.onnx.json
      en_GB-alan-medium.onnx
      en_GB-alan-medium.onnx.json
```

#### Option B: Production (CDN)

Upload to your CDN and update URLs in `PiperTTS.ts`:

```typescript
private availableVoices: PiperVoice[] = [
  {
    id: 'en-us-amy-medium',
    name: 'Amy (US English)',
    language: 'en-US',
    quality: 'medium',
    gender: 'female',
    sampleRate: 22050,
    modelUrl: 'https://your-cdn.com/piper-voices/en_US-amy-medium.onnx',
    configUrl: 'https://your-cdn.com/piper-voices/en_US-amy-medium.json'
  },
  // ... more voices
];
```

### Step 3: Update Model Manager

Register Piper voices in `ModelManager.ts`:

```typescript
private availableModels: ModelInfo[] = [
  // ... existing models
  
  // Piper voices
  {
    id: 'piper-en-us-amy-medium',
    name: 'Piper Voice: Amy (US)',
    type: 'tts',
    size: 82 * 1024 * 1024, // 82 MB
    url: '/piper-voices/en_US-amy-medium.onnx',
    version: '1.0.0',
    cached: false,
    description: 'High-quality female US English voice'
  },
  {
    id: 'piper-en-us-lessac-medium',
    name: 'Piper Voice: Lessac (US)',
    type: 'tts',
    size: 81 * 1024 * 1024,
    url: '/piper-voices/en_US-lessac-medium.onnx',
    version: '1.0.0',
    cached: false,
    description: 'High-quality male US English voice'
  }
];
```

---

## 💻 Usage

### Basic Usage

```typescript
import { PiperTTS } from './services/PiperTTS';

// Initialize with a voice
await PiperTTS.initialize('en-us-amy-medium');

// Speak text
await PiperTTS.speak('Hello! Welcome to Elora.', {
  speakingRate: 0.9,  // Slightly slower
  pitch: 0,           // Normal pitch
  volumeGainDb: 0     // Normal volume
});
```

### Advanced Usage

```typescript
// Get available voices
const voices = PiperTTS.getVoices();
console.log('Available voices:', voices);

// Filter by language
const usVoices = PiperTTS.getVoicesByLanguage('en-US');

// Get recommended voice for user level
const beginnerVoice = PiperTTS.getRecommendedVoice('beginner');
await PiperTTS.initialize(beginnerVoice?.id);

// Speak with custom options
await PiperTTS.speak('The quick brown fox jumps over the lazy dog.', {
  speakingRate: 1.2,      // 20% faster
  pitch: 2,               // Higher pitch (+2 semitones)
  volumeGainDb: 3,        // Louder (+3 dB)
  sentenceSilence: 0.3,   // 300ms pause between sentences
  lengthScale: 1.1,       // Slightly longer phonemes
  noiseScale: 0.5,        // Less variation
  noiseW: 0.7             // Less duration variation
});
```

### Export Audio

```typescript
// Synthesize and get audio blob (for download/playback)
const audioBlob = await PiperTTS.synthesizeToBlob(
  'This is a test sentence.',
  { speakingRate: 1.0 }
);

// Download
const url = URL.createObjectURL(audioBlob);
const a = document.createElement('a');
a.href = url;
a.download = 'speech.wav';
a.click();
```

---

## 🎯 Use Cases

### 1. Kids Learning Mode

```typescript
// Slower, clearer speech for kids
await PiperTTS.initialize('en-us-amy-medium');

await PiperTTS.speak('The cat says meow!', {
  speakingRate: 0.8,  // 20% slower
  pitch: 3,           // Higher pitch (kid-friendly)
  sentenceSilence: 0.5 // Longer pauses
});
```

### 2. IELTS/PTE Practice

```typescript
// Natural speed, native-like pronunciation
await PiperTTS.initialize('en-gb-alan-medium');

await PiperTTS.speak(
  'Describe a place you have visited recently and explain why it was memorable.',
  {
    speakingRate: 1.0,  // Natural speed
    pitch: 0,           // Natural pitch
    sentenceSilence: 0.2
  }
);
```

### 3. Pronunciation Practice

```typescript
// Word-by-word practice
const words = ['beautiful', 'difficult', 'pronunciation'];

for (const word of words) {
  await PiperTTS.speak(word, {
    speakingRate: 0.7,  // Slow for clarity
    sentenceSilence: 1.0 // Long pause after each word
  });
  
  // Wait for user to repeat
  await waitForUserRecording();
}
```

---

## ⚙️ Configuration

### Voice Selection Strategy

```typescript
async function selectOptimalVoice(
  userLevel: string,
  deviceType: string,
  availableMemory: number
): Promise<string> {
  // Low-end devices: use lightweight voices
  if (deviceType === 'mobile' && availableMemory < 2 * 1024 * 1024 * 1024) {
    return 'en-us-amy-low'; // 35 MB
  }
  
  // Beginners: clear, female voice
  if (userLevel === 'beginner') {
    return 'en-us-amy-medium'; // 82 MB
  }
  
  // Advanced: natural, male voice
  return 'en-us-lessac-medium'; // 81 MB
}
```

### Fallback Strategy

The service automatically falls back to Web Speech API if Piper fails:

```typescript
try {
  await PiperTTS.speak('Hello');
} catch (error) {
  // Automatically uses EnhancedTTS (Web Speech API)
  console.log('Piper unavailable, using Web Speech API');
}
```

---

## 🔧 Optimization

### Preload Voices

```typescript
// Download voice during onboarding
async function setupUserVoice(userLevel: string) {
  const voice = PiperTTS.getRecommendedVoice(userLevel);
  
  if (voice && !await PiperTTS.isVoiceAvailable(voice.id)) {
    console.log('Downloading voice...');
    await PiperTTS.downloadVoice(voice.id, (progress) => {
      console.log(`Progress: ${progress}%`);
      updateProgressBar(progress);
    });
  }
  
  await PiperTTS.initialize(voice?.id);
}
```

### Memory Management

```typescript
// Unload voice when switching modes
function switchMode(newMode: string) {
  PiperTTS.destroy(); // Free memory
  
  // Load new voice if needed
  if (newMode === 'speaking-practice') {
    PiperTTS.initialize('en-us-amy-medium');
  }
}
```

---

## 🧪 Testing

### Test Voice Quality

```typescript
// Test all voices
for (const voice of PiperTTS.getVoices()) {
  console.log(`Testing: ${voice.name}`);
  await PiperTTS.initialize(voice.id);
  await PiperTTS.speak(`This is ${voice.name}, a ${voice.quality} quality voice.`);
  await new Promise(resolve => setTimeout(resolve, 2000));
}
```

### Benchmark Performance

```typescript
import { PerformanceBenchmark } from './services/PerformanceBenchmark';

// Benchmark Piper TTS
const result = await PerformanceBenchmark.benchmarkTTS('Hello, this is a test.');

console.log('Latency:', result.latency, 'ms');
console.log('Throughput:', result.throughput, 'words/sec');

if (result.latency > 2000) {
  console.warn('Consider using a lighter voice or fallback');
}
```

---

## 🐛 Troubleshooting

### Issue 1: Voice Not Loading

**Problem:** `Voice not found` or download fails

**Solution:**
```typescript
// Check if voice file exists
const voices = PiperTTS.getVoices();
console.log('Available:', voices);

// Try downloading again
await PiperTTS.downloadVoice('en-us-amy-medium', (progress) => {
  console.log(progress);
});

// Fallback to Web Speech API
import { EnhancedTTS } from './services/EnhancedTTS';
await EnhancedTTS.speak('Fallback text');
```

### Issue 2: Slow Synthesis

**Problem:** Taking too long to generate audio

**Solution:**
```typescript
// Use low-quality voice for faster synthesis
await PiperTTS.initialize('en-us-amy-low');

// Or reduce speaking rate (less processing)
await PiperTTS.speak(text, { 
  speakingRate: 1.5,  // Faster = less audio to generate
  lengthScale: 0.9    // Shorter phonemes
});
```

### Issue 3: Out of Memory

**Problem:** Browser crashes or freezes

**Solution:**
```typescript
// Clear previous voice before loading new one
PiperTTS.destroy();

// Use smaller voice
await PiperTTS.initialize('en-us-amy-low'); // 35 MB instead of 82 MB

// Or stick with Web Speech API (no memory overhead)
import { EnhancedTTS } from './services/EnhancedTTS';
```

---

## 📊 Comparison: Piper vs Web Speech API

| Feature | Piper TTS | Web Speech API |
|---------|-----------|----------------|
| **Offline** | ✅ 100% | ⚠️ Browser-dependent |
| **Quality** | ✅ High | ⚠️ Varies |
| **Speed** | ✅ Fast | ✅ Very fast |
| **Size** | ⚠️ 35-150 MB | ✅ 0 MB |
| **Setup** | ⚠️ Requires download | ✅ Built-in |
| **Voices** | ✅ Many options | ⚠️ Limited |
| **Control** | ✅ Full control | ⚠️ Basic |
| **Cross-platform** | ✅ Yes | ⚠️ Browser-dependent |

### Recommendation

- **Kids/Beginners:** Start with Web Speech API, upgrade to Piper for better quality
- **Intermediate/Advanced:** Use Piper for consistent, natural voices
- **IELTS/PTE:** Use Piper for native-like pronunciation
- **Low-end devices:** Use Web Speech API or Piper low-quality voices
- **High-end devices:** Use Piper high-quality voices

---

## 🔗 Additional Resources

### Official Piper Resources
- GitHub: https://github.com/rhasspy/piper
- Voice Downloads: https://github.com/rhasspy/piper/releases
- Documentation: https://github.com/rhasspy/piper/blob/master/README.md

### Voice Samples
- Listen to samples: https://rhasspy.github.io/piper-samples/

### ONNX Runtime
- Documentation: https://onnxruntime.ai/docs/get-started/with-javascript.html
- NPM Package: `onnxruntime-web` (already installed)

---

## 🎓 Best Practices

1. **Preload voices during onboarding** - Don't make users wait during lessons
2. **Provide voice selection** - Let users choose their preferred voice
3. **Cache aggressively** - Store generated audio for repeated phrases
4. **Fallback gracefully** - Always have Web Speech API as backup
5. **Monitor performance** - Benchmark on target devices
6. **Test voice quality** - Listen to all voices before deployment
7. **Optimize for mobile** - Use low-quality voices on mobile devices
8. **Clear memory** - Destroy services when switching modes

---

## ✨ Future Enhancements

- [ ] Add more languages (Spanish, French, etc.)
- [ ] Implement voice cloning for personalization
- [ ] Add emotion/style control
- [ ] Support SSML for advanced control
- [ ] Offline voice training
- [ ] Custom pronunciation dictionary
- [ ] Multi-speaker conversations

---

**Built with 🎙️ for high-quality offline speech**

