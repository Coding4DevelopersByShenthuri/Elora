# 🐝 Speak Bee - Offline SLM Setup Guide

Complete guide for setting up and running the Offline Spoken English Training App with Small Language Models.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [System Requirements](#system-requirements)
3. [Installation](#installation)
4. [Model Setup](#model-setup)
5. [Configuration](#configuration)
6. [Usage Guide](#usage-guide)
7. [Performance Optimization](#performance-optimization)
8. [Troubleshooting](#troubleshooting)
9. [API Reference](#api-reference)

---

## 🎯 Overview

Speak Bee uses **Small Language Models (SLMs)** that run entirely offline in your browser. The app includes:

- **Whisper.cpp** for offline speech-to-text (STT)
- **Transformers.js** with DistilGPT-2/GPT-2 for conversation and feedback
- **Web Speech API** for text-to-speech (TTS)
- **Custom pronunciation scoring** with phoneme analysis
- **IndexedDB** for model caching

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Speak Bee Frontend                   │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │   React UI  │  │  Service      │  │  Web Workers  │ │
│  │   Components│─▶│  Layer        │─▶│  (Inference)  │ │
│  └─────────────┘  └──────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   IndexedDB Cache                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Whisper      │  │ DistilGPT-2  │  │ Config &     │ │
│  │ Models       │  │ Models       │  │ User Data    │ │
│  │ (~75-150MB)  │  │ (~80-120MB)  │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 💻 System Requirements

### Minimum Requirements

- **Browser:** Chrome 90+, Firefox 90+, Safari 14+, Edge 90+
- **RAM:** 3 GB available
- **Storage:** 500 MB free space
- **CPU:** Dual-core processor (2 GHz+)
- **OS:** Windows 10+, macOS 10.14+, Linux (Ubuntu 20.04+), Android 10+

### Recommended Requirements

- **RAM:** 4 GB+ available
- **Storage:** 1 GB+ free space
- **CPU:** Quad-core processor (2.5 GHz+)
- **GPU:** Optional (for hardware acceleration)

### Browser Features Required

- WebAssembly (WASM) support
- IndexedDB support
- Web Workers support
- Web Audio API
- MediaRecorder API
- (Optional) Web Speech API

---

## 📦 Installation

### 1. Install Dependencies

```bash
cd client

# Install core dependencies
npm install

# Install AI/ML libraries
npm install @xenova/transformers

# Install development tools
npm install --save-dev @types/dom-speech-recognition
```

### 2. Verify Installation

```bash
npm run build
npm run dev
```

The app should start at `http://localhost:5173`

---

## 🤖 Model Setup

### Available Models

The app supports these pre-configured models:

| Model ID | Type | Size | Purpose | Speed |
|----------|------|------|---------|-------|
| `whisper-tiny-en` | STT | ~75 MB | Fast speech recognition | ⚡⚡⚡ |
| `whisper-base-en` | STT | ~142 MB | Better accuracy STT | ⚡⚡ |
| `distilgpt2` | LLM | ~82 MB | Conversation & feedback | ⚡⚡⚡ |
| `gpt2` | LLM | ~124 MB | Advanced conversation | ⚡⚡ |
| `tinybert-grammar` | LLM | ~28 MB | Grammar checking | ⚡⚡⚡ |

### Automatic Model Download

Models are downloaded automatically on first use:

```typescript
import { ModelManager } from './services/ModelManager';

// Download a specific model
await ModelManager.downloadModel('whisper-tiny-en', (progress) => {
  console.log(`Downloading: ${progress.percentage.toFixed(1)}%`);
});

// Check if model is available
const isAvailable = await ModelManager.isModelCached('distilgpt2');
```

### Manual Model Setup

#### Option 1: Download via UI

1. Navigate to **Settings** → **Models**
2. Click **Download** next to desired models
3. Wait for download to complete
4. Models are cached automatically

#### Option 2: Preload Models

```typescript
// Preload recommended models for user level
await ModelManager.preloadRecommendedModels('beginner', (progress) => {
  console.log(`${progress.modelId}: ${progress.percentage}%`);
});
```

### Model Storage

Models are stored in IndexedDB:

```typescript
// Check storage usage
const storage = await ModelManager.getStorageInfo();
console.log(`Used: ${(storage.usage / 1024 / 1024).toFixed(2)} MB`);
console.log(`Available: ${(storage.available / 1024 / 1024).toFixed(2)} MB`);

// Clear cache if needed
await ModelManager.clearCache();
```

---

## ⚙️ Configuration

### Initialize Services

```typescript
import { WhisperService } from './services/WhisperService';
import { TransformersService } from './services/TransformersService';
import { SLMInference } from './services/SLMInference';

// Initialize STT
await WhisperService.initialize({
  modelPath: 'whisper-tiny-en',
  language: 'en'
});

// Initialize LLM
await TransformersService.initialize('Xenova/distilgpt2');

// Initialize SLM Inference
await SLMInference.initialize({
  modelId: 'distilgpt2',
  contextSize: 2048,
  temperature: 0.7,
  threads: 4
});
```

### Performance Tuning

```typescript
// For low-end devices
const lowEndConfig = {
  modelId: 'whisper-tiny-en', // Smallest model
  contextSize: 1024, // Smaller context
  temperature: 0.8,
  threads: 2 // Fewer threads
};

// For high-end devices
const highEndConfig = {
  modelId: 'whisper-base-en',
  contextSize: 4096,
  temperature: 0.7,
  threads: navigator.hardwareConcurrency || 8
};

await SLMInference.initialize(highEndConfig);
```

---

## 📖 Usage Guide

### 1. Speech-to-Text (STT)

```typescript
import { WhisperService } from './services/WhisperService';

// Start recording
const mediaRecorder = /* your MediaRecorder instance */;
const audioBlob = /* captured audio blob */;

// Transcribe audio
const result = await WhisperService.transcribe(audioBlob, {
  language: 'en',
  prompt: 'Expected context...' // Optional
});

console.log('Transcript:', result.transcript);
console.log('Confidence:', result.confidence);
```

### 2. Text-to-Speech (TTS)

```typescript
import { EnhancedTTS } from './services/EnhancedTTS';

// Get available voices
const voices = EnhancedTTS.getVoices();
const femaleVoices = EnhancedTTS.getVoicesByFilter({ 
  lang: 'en',
  gender: 'female' 
});

// Speak text
await EnhancedTTS.speak('Hello, let\'s practice English!', {
  voice: femaleVoices[0]?.id,
  rate: 0.9, // Slower for beginners
  pitch: 1.0,
  emotion: 'happy'
});
```

### 3. Conversation Generation

```typescript
import { TransformersService } from './services/TransformersService';

// Generate conversation response
const response = await TransformersService.generateConversationResponse(
  'I like to play football',
  {
    userLevel: 'beginner',
    topic: 'hobbies',
    previousMessages: [
      { role: 'assistant', content: 'What do you like to do?' },
      { role: 'user', content: 'I like sports' }
    ]
  }
);

console.log('Teacher:', response);
```

### 4. Feedback Generation

```typescript
import { SLMInference } from './services/SLMInference';

// Generate pedagogical feedback
const feedback = await SLMInference.generateFeedback({
  userText: 'I go to school yesterday',
  expectedText: 'I went to school yesterday',
  exerciseType: 'grammar',
  userLevel: 'intermediate'
});

console.log('Feedback:', feedback.feedback);
console.log('Score:', feedback.score);
console.log('Suggestions:', feedback.suggestions);
```

### 5. Pronunciation Scoring

```typescript
import { PronunciationScorer } from './services/PronunciationScorer';

// Score pronunciation
const score = await PronunciationScorer.scorePronunciation(
  'Hello world',      // Expected text
  'Helo wurld',       // User's spoken text
  audioBlob           // Audio data
);

console.log('Overall Score:', score.overall);
console.log('Accuracy:', score.accuracy);
console.log('Mispronounced:', score.details.mispronounced);
console.log('Suggestions:', score.details.suggestions);
```

---

## ⚡ Performance Optimization

### Benchmark Performance

```typescript
import { PerformanceBenchmark } from './services/PerformanceBenchmark';

// Run comprehensive benchmark
const results = await PerformanceBenchmark.runFullBenchmark();

console.log('System:', results.system);
console.log('LLM Latency:', results.llm?.latency, 'ms');
console.log('TTS Latency:', results.tts?.latency, 'ms');

// Generate performance report
const report = PerformanceBenchmark.generateReport('llm');
console.log('Average Latency:', report.averageLatency);
console.log('P95 Latency:', report.p95Latency);
console.log('Recommendations:', report.recommendations);
```

### Optimization Tips

#### 1. **Choose Right Model for Device**

```typescript
const metrics = await PerformanceBenchmark.getSystemMetrics();

if (metrics.deviceType === 'mobile' || metrics.availableMemory < 2 * 1024 * 1024 * 1024) {
  // Use smallest models
  await ModelManager.downloadModel('whisper-tiny-en');
  await ModelManager.downloadModel('distilgpt2');
} else {
  // Use better models
  await ModelManager.downloadModel('whisper-base-en');
  await ModelManager.downloadModel('gpt2');
}
```

#### 2. **Preload Models During Onboarding**

```typescript
// During user onboarding flow
async function setupUserModels(userLevel: 'beginner' | 'intermediate' | 'advanced') {
  await ModelManager.preloadRecommendedModels(userLevel, (progress) => {
    updateProgressBar(progress.percentage);
  });
}
```

#### 3. **Use Web Workers**

All heavy inference is already running in Web Workers to keep UI responsive. No additional configuration needed.

#### 4. **Lazy Load Services**

```typescript
// Only initialize services when needed
const lazySTT = async () => {
  const { WhisperService } = await import('./services/WhisperService');
  await WhisperService.initialize();
  return WhisperService;
};
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **Models Not Downloading**

**Problem:** Download fails or stalls

**Solutions:**
```typescript
// Check storage quota
const storage = await ModelManager.getStorageInfo();
if (storage.available < 500 * 1024 * 1024) {
  console.error('Insufficient storage. Need at least 500MB');
  await ModelManager.clearCache(); // Clear old models
}

// Retry download
await ModelManager.downloadModel('whisper-tiny-en');
```

#### 2. **Slow Inference**

**Problem:** Model inference takes too long

**Solutions:**
```typescript
// Use smaller model
await SLMInference.initialize({
  modelId: 'distilgpt2', // Instead of gpt2
  threads: navigator.hardwareConcurrency, // Use all cores
  contextSize: 1024 // Reduce context size
});

// Reduce max tokens
const response = await TransformersService.generateText(prompt, {
  maxLength: 30 // Instead of 100
});
```

#### 3. **High Memory Usage**

**Problem:** Browser uses too much memory

**Solutions:**
```typescript
// Clear unused models
await ModelManager.deleteModel('gpt2'); // If not needed

// Destroy services when not in use
TransformersService.destroy();
SLMInference.destroy();
WhisperService.destroy();

// Reinitialize when needed
await TransformersService.initialize();
```

#### 4. **Speech Recognition Not Working**

**Problem:** Whisper fails, no fallback

**Solutions:**
```typescript
// Check if model is available
const isAvailable = await WhisperService.isModelAvailable();
if (!isAvailable) {
  await WhisperService.downloadModel();
}

// Use Web Speech API fallback
import { SpeechService } from './services/SpeechService';
if (SpeechService.isSTTSupported()) {
  const result = await SpeechService.startRecognition();
}
```

---

## 📚 API Reference

### ModelManager

```typescript
class ModelManager {
  // Get all available models
  getAvailableModels(type?: 'stt' | 'llm' | 'tts'): Promise<ModelInfo[]>
  
  // Download a model
  downloadModel(modelId: string, onProgress?: (progress: DownloadProgress) => void): Promise<void>
  
  // Check if model is cached
  isModelCached(modelId: string): Promise<boolean>
  
  // Get model data
  getModelData(modelId: string): Promise<Uint8Array | null>
  
  // Delete cached model
  deleteModel(modelId: string): Promise<void>
  
  // Get storage info
  getStorageInfo(): Promise<StorageInfo>
  
  // Clear all cached models
  clearCache(): Promise<void>
  
  // Preload recommended models
  preloadRecommendedModels(userLevel: string, onProgress?: (progress) => void): Promise<void>
}
```

### WhisperService

```typescript
class WhisperService {
  // Initialize Whisper
  initialize(config?: WhisperConfig): Promise<void>
  
  // Transcribe audio
  transcribe(audioBlob: Blob, options?: { language?: string; prompt?: string }): Promise<WhisperResult>
  
  // Download model
  downloadModel(modelUrl?: string, onProgress?: (progress: number) => void): Promise<void>
  
  // Check if model available
  isModelAvailable(): Promise<boolean>
  
  // Get model size
  getModelSize(): Promise<number>
  
  // Clear model
  clearModel(): Promise<void>
  
  // Cleanup
  destroy(): void
}
```

### TransformersService

```typescript
class TransformersService {
  // Initialize with model
  initialize(modelName?: string): Promise<void>
  
  // Correct grammar
  correctGrammar(text: string): Promise<GrammarCorrectionResult>
  
  // Generate text
  generateText(prompt: string, options?: TextGenerationOptions): Promise<string>
  
  // Generate conversation
  generateConversationResponse(userMessage: string, context: ConversationContext): Promise<string>
  
  // Analyze sentiment
  analyzeSentiment(text: string): Promise<SentimentResult>
  
  // Get vocabulary suggestions
  getVocabularySuggestions(word: string): Promise<string[]>
  
  // Check if ready
  isReady(): boolean
  
  // Cleanup
  destroy(): void
}
```

### SLMInference

```typescript
class SLMInference {
  // Initialize SLM
  initialize(config?: SLMConfig): Promise<void>
  
  // Generate completion
  complete(prompt: string, options?: InferenceOptions): Promise<string>
  
  // Chat conversation
  chat(messages: ConversationMessage[], options?: InferenceOptions): Promise<string>
  
  // Generate feedback
  generateFeedback(request: FeedbackRequest): Promise<FeedbackResponse>
  
  // Check if ready
  isReady(): boolean
  
  // Get current model
  getCurrentModel(): string | null
  
  // Cleanup
  destroy(): void
}
```

### PerformanceBenchmark

```typescript
class PerformanceBenchmark {
  // Run full benchmark suite
  runFullBenchmark(): Promise<BenchmarkResults>
  
  // Benchmark specific service
  benchmarkSTT(audioBlob: Blob, expectedTranscript?: string): Promise<BenchmarkResult>
  benchmarkTTS(text: string): Promise<BenchmarkResult>
  benchmarkLLM(prompt: string, expectedTokens?: number): Promise<BenchmarkResult>
  
  // Generate report
  generateReport(service: string, timeRange?: DateRange): PerformanceReport
  
  // Get system metrics
  getSystemMetrics(): Promise<SystemMetrics>
  
  // Export results
  exportResults(): string
  
  // Clear results
  clearResults(): void
}
```

---

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### PWA Configuration

The app is already configured as a Progressive Web App (PWA) with offline support:

- Service worker caches app shell
- IndexedDB stores models
- Offline fallback page available

### Model Hosting (Optional)

For faster initial downloads, host models on your CDN:

```typescript
const customModelUrls = {
  'whisper-tiny-en': 'https://your-cdn.com/models/whisper-tiny-en.bin',
  'distilgpt2': 'https://your-cdn.com/models/distilgpt2-quantized.onnx'
};

// Update ModelManager configuration
ModelManager.availableModels.find(m => m.id === 'whisper-tiny-en').url = customModelUrls['whisper-tiny-en'];
```

---

## 📝 Best Practices

1. **Always check model availability before use**
2. **Provide download progress feedback to users**
3. **Use smallest models that meet accuracy needs**
4. **Implement graceful fallbacks (e.g., Web Speech API)**
5. **Monitor performance and adjust model selection**
6. **Cache models during onboarding, not at runtime**
7. **Clear old models periodically**
8. **Test on target devices before deployment**

---

## 📞 Support

For issues or questions:
- GitHub Issues: [Your Repo]
- Documentation: [Your Docs]
- Email: [Your Email]

---

**Built with ❤️ for offline-first English learning**

