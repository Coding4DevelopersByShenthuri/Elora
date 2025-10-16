# 🚀 Speak Bee - Quick Start Guide

Get your offline English learning app running in 5 minutes!

---

## ⚡ 1-Minute Setup

```bash
# Clone and install
cd client
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser. Done! 🎉

---

## 📱 First Time User Flow

### Step 1: Choose User Type

When you first open the app, select your learning profile:
- **Kids** (Ages 5-12)
- **Adults - Beginner** (A1-A2)
- **Adults - Intermediate** (B1-B2)
- **Adults - Advanced** (C1-C2)
- **IELTS/PTE Preparation**

### Step 2: Download Models

The app will automatically prompt you to download offline models:

```typescript
// This happens automatically on first launch
await ModelManager.preloadRecommendedModels('beginner', (progress) => {
  console.log(`Downloading: ${progress.percentage}%`);
});
```

**Download Sizes:**
- **Kids/Beginner:** ~150 MB (whisper-tiny + distilgpt2)
- **Intermediate/Advanced:** ~260 MB (whisper-base + gpt2)
- **IELTS/PTE:** ~280 MB (whisper-base + gpt2 + grammar models)

**Time:** 2-5 minutes depending on your connection

### Step 3: Start Learning!

Once models are downloaded, everything works **100% offline**.

---

## 🎯 Key Features Quick Access

### 1. Voice Practice

```typescript
import { WhisperService, EnhancedTTS } from './services';

// Listen to a sentence
await EnhancedTTS.speak('Hello, how are you today?');

// Record your voice
const audioBlob = /* your recording */;

// Get transcription
const result = await WhisperService.transcribe(audioBlob);
console.log('You said:', result.transcript);
```

### 2. Pronunciation Scoring

```typescript
import { AdvancedPronunciationScorer } from './services';

const score = await AdvancedPronunciationScorer.scoreDetailed(
  'Hello world',           // Expected
  'Helo wurld',           // What you said
  audioBlob               // Your recording
);

console.log('Score:', score.overall);
console.log('Recommendations:', score.recommendations);
```

### 3. AI Conversation

```typescript
import { SLMInference } from './services';

await SLMInference.initialize();

const response = await SLMInference.chat([
  { role: 'system', content: 'You are an English teacher' },
  { role: 'user', content: 'How can I improve my English?' }
]);

console.log('AI:', response);
```

### 4. Grammar Check

```typescript
import { TransformersService } from './services';

const result = await TransformersService.correctGrammar(
  'I go to school yesterday'
);

console.log('Corrected:', result.correctedText);
// Output: "I went to school yesterday"
```

---

## 🔧 Configuration for Your Device

### Low-End Device (< 4GB RAM)

```typescript
// Use smallest, fastest models
await ModelManager.downloadModel('whisper-tiny-en');
await ModelManager.downloadModel('distilgpt2');

await SLMInference.initialize({
  modelId: 'distilgpt2',
  contextSize: 1024,  // Smaller context
  threads: 2          // Fewer threads
});
```

### High-End Device (8GB+ RAM)

```typescript
// Use best quality models
await ModelManager.downloadModel('whisper-base-en');
await ModelManager.downloadModel('gpt2');

await SLMInference.initialize({
  modelId: 'gpt2',
  contextSize: 4096,  // Larger context
  threads: navigator.hardwareConcurrency  // Use all cores
});
```

### Mobile Device

```typescript
// Optimize for battery and memory
await SLMInference.initialize({
  modelId: 'distilgpt2',
  contextSize: 2048,
  temperature: 0.8,
  threads: 4  // Balance performance and battery
});
```

---

## 📊 Performance Monitoring

Check if your device can handle the models:

```typescript
import { PerformanceBenchmark } from './services';

// Run quick benchmark
const results = await PerformanceBenchmark.runFullBenchmark();

console.log('Your device:');
console.log('- Type:', results.system.deviceType);
console.log('- CPU Cores:', results.system.cpuCores);
console.log('- Available Memory:', results.system.availableMemory);

if (results.llm) {
  console.log('LLM Speed:', results.llm.latency, 'ms');
  if (results.llm.latency > 3000) {
    console.warn('⚠️ Consider using a smaller model');
  } else {
    console.log('✅ Performance is good!');
  }
}
```

---

## 🎨 Example: Complete Voice Lesson

```typescript
import { 
  EnhancedTTS, 
  WhisperService, 
  AdvancedPronunciationScorer,
  SLMInference 
} from './services';

async function voiceLesson() {
  // 1. Teacher introduces lesson
  await EnhancedTTS.speak(
    'Today we will practice greetings. Listen carefully.',
    { rate: 0.9, emotion: 'happy' }
  );

  // 2. Teacher says target sentence
  const targetSentence = 'Hello, nice to meet you!';
  await EnhancedTTS.speak(targetSentence);

  // 3. Student records their attempt
  const audioBlob = await recordAudio(); // Your recording function

  // 4. Transcribe what student said
  const transcription = await WhisperService.transcribe(audioBlob);

  // 5. Score pronunciation
  const pronScore = await AdvancedPronunciationScorer.scoreDetailed(
    targetSentence,
    transcription.transcript,
    audioBlob
  );

  // 6. Generate personalized feedback
  const feedback = await SLMInference.generateFeedback({
    userText: transcription.transcript,
    expectedText: targetSentence,
    exerciseType: 'pronunciation',
    userLevel: 'beginner'
  });

  // 7. Teacher gives feedback
  await EnhancedTTS.speak(feedback.feedback);

  // 8. Show detailed results
  return {
    score: pronScore.overall,
    accuracy: pronScore.accuracy,
    recommendations: pronScore.recommendations,
    feedback: feedback.feedback
  };
}
```

---

## 🛠️ Troubleshooting

### Models Not Downloading?

```typescript
// Check storage space
const storage = await ModelManager.getStorageInfo();
console.log('Available:', storage.available / 1024 / 1024, 'MB');

// If low, clear old models
await ModelManager.clearCache();

// Retry download
await ModelManager.downloadModel('whisper-tiny-en');
```

### Slow Performance?

```typescript
// Switch to faster model
await SLMInference.initialize({
  modelId: 'distilgpt2',  // Faster than gpt2
  threads: 2              // Reduce if still slow
});
```

### Out of Memory?

```typescript
// Clear services after use
TransformersService.destroy();
SLMInference.destroy();

// Reinitialize when needed
await TransformersService.initialize();
```

---

## 🎓 Learning Paths

### Kids Learning Path

```typescript
// Simple, fun interactions with animals and colors
const kidsConfig = {
  ttsVoice: 'child-friendly',
  ttsRate: 0.8,  // Slower speech
  difficultyLevel: 'basic',
  modelId: 'distilgpt2'
};
```

### Adult Beginner Path

```typescript
// Basic conversations and grammar
const beginnerConfig = {
  ttsRate: 0.9,
  contextSize: 2048,
  exerciseTypes: ['conversation', 'vocabulary', 'pronunciation']
};
```

### IELTS/PTE Path

```typescript
// Advanced speaking tasks and scoring
const ieltsConfig = {
  ttsRate: 1.0,  // Natural speed
  modelId: 'gpt2',  // Better for complex tasks
  contextSize: 4096,
  exerciseTypes: ['speaking-part1', 'speaking-part2', 'speaking-part3']
};
```

---

## 📱 Mobile App Setup

For React Native (Android/iOS):

```bash
# Install React Native dependencies
npm install react-native-fs
npm install @react-native-community/async-storage

# Link native modules
npx react-native link
```

Then use the same services - they work cross-platform!

---

## 🌐 Progressive Web App (PWA)

The app automatically works offline as a PWA:

1. **Desktop:** Click "Install" in browser address bar
2. **Mobile:** Tap "Add to Home Screen"

Models persist across sessions in IndexedDB.

---

## 📈 Monitoring Usage

Track user progress:

```typescript
import { PerformanceBenchmark } from './services';

// After each lesson
const metrics = {
  duration: lessonDuration,
  score: finalScore,
  wordsSpoken: wordCount
};

// Log for analytics (stays local)
localStorage.setItem('lesson-progress', JSON.stringify(metrics));
```

---

## 🆘 Need Help?

1. **Check documentation:** `OFFLINE_SLM_SETUP.md`
2. **Run benchmark:** `PerformanceBenchmark.runFullBenchmark()`
3. **Check browser console:** Look for errors
4. **Clear cache and retry:** `ModelManager.clearCache()`

---

## 🎉 You're Ready!

Start building amazing offline English learning experiences!

```typescript
// Initialize everything
await ModelManager.preloadRecommendedModels('beginner');
await WhisperService.initialize();
await TransformersService.initialize();
await SLMInference.initialize();

console.log('🐝 Speak Bee is ready for offline learning!');
```

---

**Happy Learning! 🚀📚🎯**

