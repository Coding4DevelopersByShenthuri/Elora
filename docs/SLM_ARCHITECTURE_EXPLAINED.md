# 🤖 SLM (Small Language Model) Architecture Explained

## 📚 **What is an SLM?**

**SLM = Small Language Model**

An SLM is a **lightweight AI language model** (typically <500M parameters) that can run **locally on your device** without needing cloud servers or internet connectivity.

### **In Your Speak Bee Project:**

Your SLM implementation uses **THREE layers** of intelligence:

#### **Layer 1: Rule-Based (Instant, 0 bytes)** ⚡⚡⚡
- **LocalLLM** - Heuristic-based feedback generator
- No model download required
- Instant responses
- Used as ultimate fallback

#### **Layer 2: Small Models (80-150MB, Fast)** ⚡⚡
- **DistilGPT-2** (82MB) - Small conversational AI
- **Whisper Tiny** (75MB) - Fast speech recognition
- Runs on CPU in browser
- Good quality, fast responses

#### **Layer 3: Better Models (120-150MB, Slower)** ⚡
- **GPT-2** (124MB) - Better conversational AI
- **Whisper Base** (142MB) - More accurate speech recognition
- Higher quality, slightly slower
- For advanced users

---

## 📂 **WHERE IS EVERYTHING?**

### **🎯 SLM Core Services (client/src/services/)**

```
client/src/services/
│
├── 🧠 LANGUAGE MODELS (SLM)
│   ├── LocalLLM.ts                      ⭐ SLM Layer 1: Rule-based (0 bytes)
│   ├── TransformersService.ts           ⭐ SLM Layer 2/3: DistilGPT-2/GPT-2
│   ├── SLMInference.ts                  ⭐ SLM Core: Inference engine
│   ├── SLMEvaluator.ts                  ⭐ SLM: Response evaluation
│   └── workers/
│       └── slm.worker.ts                ⭐ SLM: Background processing
│
├── 🎤 SPEECH-TO-TEXT (Offline STT)
│   ├── WhisperService.ts                ⭐ Whisper.cpp integration
│   ├── SpeechService.ts                 📱 Web Speech API fallback
│   └── workers/
│       └── whisper.worker.ts            🔧 Whisper background processing
│
├── 🔊 TEXT-TO-SPEECH (Offline TTS)
│   ├── EnhancedTTS.ts                   📱 Web Speech API (built-in)
│   ├── PiperTTS.ts                      🎙️ High-quality neural TTS
│   └── workers/
│       └── piper.worker.ts              🔧 Piper background processing
│
├── 📊 PRONUNCIATION SCORING
│   ├── PronunciationScorer.ts           ✅ Basic phoneme analysis
│   └── AdvancedPronunciationScorer.ts   ⭐ MFA-inspired detailed scoring
│
├── 📦 MODEL MANAGEMENT
│   ├── ModelManager.ts                  ⭐ Download, cache, version models
│   └── PerformanceBenchmark.ts          📈 Monitor performance
│
├── 🔄 HYBRID SERVICES (Offline + Online)
│   ├── HybridServiceManager.ts          ⭐ NEW: Coordinates offline/online
│   ├── ApiService.ts                    🌐 Django REST API integration
│   └── UserDataService.ts               💾 Local data persistence
│
└── index.ts                             📋 Central export point
```

---

## 🔍 **WHERE IS THE SLM? (Detailed)**

### **1. LocalLLM.ts** - The Simplest SLM ⚡⚡⚡

**Location:** `client/src/services/LocalLLM.ts`

**What it does:**
```typescript
// Uses pure JavaScript logic - NO MODEL REQUIRED!
LocalLLM.generateFeedback({
  userText: "I go to school yesterday",
  scores: { fluency: 70, grammar: 50, vocabulary: 80 }
});
// Returns: "Watch verb tense consistency. Speak in shorter phrases."
```

**How it works:**
- Rule-based heuristics
- Score analysis
- Pattern matching
- 100% deterministic
- Zero latency
- No download needed

**When to use:**
- Instant feedback needed
- No models downloaded yet
- Ultra-low-end devices
- Privacy-critical scenarios

---

### **2. TransformersService.ts** - The Real SLM ⭐⭐⭐

**Location:** `client/src/services/TransformersService.ts`

**What it does:**
```typescript
// Uses actual AI models (DistilGPT-2 or GPT-2)
await TransformersService.initialize('Xenova/distilgpt2');

const response = await TransformersService.generateConversationResponse(
  "I like play football",
  { userLevel: 'beginner', topic: 'hobbies' }
);
// Returns: "That's great! Football is fun. Do you play with friends?"
```

**The Models:**
- **DistilGPT-2** (82MB) - Distilled version of GPT-2, 40% smaller
- **GPT-2** (124MB) - Full small GPT-2 model
- Both use **ONNX** format for browser compatibility
- Powered by **Transformers.js** library

**How it works:**
1. Downloads ONNX model from HuggingFace
2. Caches in IndexedDB
3. Loads into memory
4. Runs inference using ONNX Runtime (WASM)
5. Generates natural language responses

**When to use:**
- Natural conversation needed
- Grammar correction
- Context-aware responses
- Better than rules

---

### **3. SLMInference.ts** - The SLM Engine ⭐⭐⭐

**Location:** `client/src/services/SLMInference.ts`

**What it does:**
```typescript
// High-level interface for all SLM operations
await SLMInference.initialize({ modelId: 'distilgpt2' });

// Generate pedagogical feedback
const feedback = await SLMInference.generateFeedback({
  userText: "I go to school yesterday",
  expectedText: "I went to school yesterday",
  exerciseType: 'grammar',
  userLevel: 'intermediate'
});
// Returns detailed feedback with corrections
```

**Architecture:**
```
SLMInference.ts (Main Interface)
      ↓
slm.worker.ts (Web Worker - Background)
      ↓
Transformers.js Pipeline
      ↓
ONNX Runtime (WebAssembly)
      ↓
DistilGPT-2/GPT-2 Model
```

**Features:**
- Multi-turn chat conversations
- Pedagogical feedback generation
- Exercise-specific prompts
- Configurable temperature, top-k, top-p
- Fallback to LocalLLM

**When to use:**
- Complete lesson feedback
- Multi-turn conversations
- Exercise evaluation
- Best quality responses

---

### **4. SLMEvaluator.ts** - SLM-Powered Evaluation

**Location:** `client/src/services/SLMEvaluator.ts`

**What it does:**
```typescript
// Evaluates user responses using SLM
const evaluation = await SLMEvaluator.evaluateResponse(
  "I like play football with my friends",
  { targetWords: ['enjoy', 'sports', 'team'] }
);
// Returns: { fluency: 75, grammar: 65, vocabulary: 70, feedback: "..." }
```

**How it works:**
1. Analyzes user text (word count, structure, etc.)
2. Calculates heuristic scores
3. Uses LocalLLM to generate feedback
4. Returns comprehensive evaluation

---

## 🌐 **ONLINE vs OFFLINE: How They Work Together**

### **Django Backend (server/)** - ONLINE ONLY

```
server/
├── api/
│   ├── models.py           💾 Database models (User, Progress, Lessons)
│   ├── views.py            🌐 API endpoints (login, progress, stats)
│   ├── serializers.py      📄 Data serialization
│   └── urls.py             🛣️ API routes
├── crud/
│   └── settings.py         ⚙️ Django configuration
└── db.sqlite3              💾 SQLite database
```

**Purpose:**
- User authentication (JWT tokens)
- Cloud data persistence
- Multi-device sync
- Analytics & progress tracking
- Leaderboards (future)

---

### **React Frontend (client/)** - HYBRID (Offline + Online)

```
client/
├── src/
│   ├── services/           ⭐ ALL SLM & OFFLINE SERVICES
│   ├── components/         🎨 React UI components
│   ├── pages/              📄 App pages
│   └── contexts/           🔄 React contexts
├── public/                 📦 Static assets
└── dist/                   🏗️ Built app
```

**Purpose:**
- Complete offline AI functionality
- User interface
- Local data storage (IndexedDB)
- Optional cloud sync

---

## 🔄 **HybridServiceManager: The Bridge**

**Location:** `client/src/services/HybridServiceManager.ts` ⭐ **NEW!**

**What it does:**
Intelligently coordinates between offline SLM and online API:

```typescript
// Initialize hybrid system
await HybridServiceManager.initialize({
  mode: 'hybrid',          // offline | online | hybrid
  preferOffline: false,    // Prefer offline even when online
  autoSync: true,          // Auto-sync to cloud
  syncInterval: 15         // Sync every 15 minutes
});

// Record session - works offline, syncs when online
await HybridServiceManager.recordSession({
  sessionType: 'pronunciation',
  score: 85,
  duration: 10,
  details: { /* ... */ }
});

// Get status
const status = HybridServiceManager.getSyncStatus();
// { mode: 'hybrid', online: true, pendingSessions: 3 }
```

**How it works:**

```
User Action
    ↓
HybridServiceManager
    ↓
├── OFFLINE PATH (Always happens first)
│   ├── Store locally (IndexedDB/localStorage)
│   ├── Use SLM for AI features
│   └── Queue for sync
│
└── ONLINE PATH (When available)
    ├── Try to sync immediately
    ├── Fetch cloud data
    └── Update local cache
```

---

## 📊 **Complete Data Flow**

### **Example: User Practices Pronunciation**

```
1. USER SPEAKS
   ↓
2. WhisperService.transcribe() [OFFLINE]
   - Uses Whisper Tiny/Base model
   - Transcribes audio to text
   - Returns transcript with confidence
   ↓
3. AdvancedPronunciationScorer.scoreDetailed() [OFFLINE]
   - Compares expected vs actual text
   - Analyzes phonemes, timing, prosody
   - Returns detailed score
   ↓
4. SLMInference.generateFeedback() [OFFLINE]
   - Uses DistilGPT-2 for natural feedback
   - Generates personalized tips
   - Returns human-like feedback
   ↓
5. EnhancedTTS.speak() [OFFLINE]
   - Speaks feedback using Web Speech API
   - Or uses Piper TTS for better quality
   ↓
6. HybridServiceManager.recordSession() [HYBRID]
   - Stores locally (OFFLINE)
   - Syncs to Django API (ONLINE - when available)
   ↓
7. User sees results immediately [OFFLINE]
   Data syncs in background [ONLINE]
```

---

## 🎯 **WHERE MODELS ARE STORED**

### **Browser Storage:**

```
IndexedDB: 'SpeakBeeModels'
├── Store: 'models'
│   ├── whisper-tiny-en       (75 MB)
│   ├── whisper-base-en       (142 MB)
│   ├── distilgpt2            (82 MB)
│   └── gpt2                  (124 MB)
│
├── Store: 'responses'
│   └── Cached API responses
│
└── Store: 'syncQueue'
    └── Pending sync operations

localStorage:
├── speakbee_auth_token       JWT token
├── cached_progress           Progress data
├── vocabulary                Vocabulary words
├── pending_sessions          Unsynced sessions
└── models_downloaded         Flag for model availability
```

### **Server Storage:**

```
server/db.sqlite3 (SQLite Database)
├── auth_user                 User accounts
├── api_userprofile           User profiles & preferences
├── api_lessonprogress        Lesson completion data
├── api_practicesession       Practice session records
├── api_vocabularyword        Learned vocabulary
├── api_achievement           Available achievements
└── api_userachievement       Unlocked achievements
```

---

## 🚀 **HOW TO USE THE HYBRID SYSTEM**

### **Quick Start:**

```typescript
import { 
  HybridServiceManager,
  initializeOfflineServices 
} from './services';

// 1. Initialize everything (offline + online)
await HybridServiceManager.initialize({
  mode: 'hybrid',
  autoSync: true
});

// 2. Download offline models (one-time)
await initializeOfflineServices('beginner');

// 3. Use normally - it handles offline/online automatically!
```

### **Check What's Available:**

```typescript
// Check system health
const health = await HybridServiceManager.getSystemHealth();
console.log(health);
// {
//   offlineReady: true,      // Models downloaded
//   onlineReady: true,       // Internet available
//   modelsDownloaded: 2,     // Number of models
//   cacheSize: 157000000,    // 157 MB
//   pendingSync: 3           // Unsynced sessions
// }

// Check sync status
const status = HybridServiceManager.getSyncStatus();
console.log(status);
// {
//   mode: 'hybrid',
//   online: true,
//   pendingSessions: 3,
//   autoSyncEnabled: true
// }
```

### **Force Sync:**

```typescript
// Manually trigger sync (e.g., user clicks "Sync Now")
await HybridServiceManager.forceSyncNow();
```

---

## 🎨 **USAGE EXAMPLES**

### **Example 1: Complete Offline Lesson**

```typescript
import { 
  WhisperService, 
  SLMInference, 
  AdvancedPronunciationScorer,
  EnhancedTTS,
  HybridServiceManager 
} from './services';

async function offlineLesson() {
  // 1. Teacher speaks (OFFLINE)
  await EnhancedTTS.speak("Say: Hello, how are you?");
  
  // 2. Student records audio
  const audioBlob = await recordAudio();
  
  // 3. Transcribe (OFFLINE - Whisper)
  const { transcript } = await WhisperService.transcribe(audioBlob);
  
  // 4. Score pronunciation (OFFLINE)
  const score = await AdvancedPronunciationScorer.scoreDetailed(
    "Hello, how are you?",
    transcript,
    audioBlob
  );
  
  // 5. Generate feedback (OFFLINE - DistilGPT-2)
  const feedback = await SLMInference.generateFeedback({
    userText: transcript,
    expectedText: "Hello, how are you?",
    exerciseType: 'pronunciation',
    userLevel: 'beginner'
  });
  
  // 6. Speak feedback (OFFLINE)
  await EnhancedTTS.speak(feedback.feedback);
  
  // 7. Save session (OFFLINE + auto-sync when online)
  await HybridServiceManager.recordSession({
    sessionType: 'pronunciation',
    score: score.overall,
    duration: 5,
    details: { transcript, score, feedback }
  });
  
  // Everything works offline!
  // Data syncs automatically when online!
}
```

### **Example 2: Online + Offline User**

```typescript
// User A: Online with server
await HybridServiceManager.initialize({ mode: 'hybrid' });
// ✅ Uses SLM offline
// ✅ Syncs progress to cloud
// ✅ Multi-device sync available

// User B: Completely offline
await HybridServiceManager.initialize({ mode: 'offline' });
// ✅ Uses SLM offline
// ✅ Stores progress locally
// ✅ No internet needed

// Both users get identical AI experience!
```

---

## 📈 **PERFORMANCE COMPARISON**

| Feature | Offline (SLM) | Online (API) | Hybrid |
|---------|--------------|--------------|--------|
| **Speech Recognition** | ✅ Whisper (1-3s) | ❌ N/A | ✅ Whisper |
| **Conversation AI** | ✅ DistilGPT-2 (0.5-2s) | ❌ N/A | ✅ DistilGPT-2 |
| **Pronunciation Scoring** | ✅ MFA-inspired (0.1s) | ❌ N/A | ✅ MFA-inspired |
| **User Authentication** | ⚠️ Local only | ✅ JWT tokens | ✅ JWT + local |
| **Progress Tracking** | ⚠️ Local only | ✅ Cloud stored | ✅ Both |
| **Multi-device Sync** | ❌ No | ✅ Yes | ✅ Yes |
| **Privacy** | ✅✅✅ 100% local | ⚠️ Cloud stored | ✅✅ Configurable |
| **Internet Required** | ❌ No | ✅ Yes | ⚠️ Optional |
| **Initial Setup** | 📦 200MB models | 🚀 Instant | 📦 200MB + account |

---

## 🎓 **KEY TAKEAWAYS**

### **✅ What's Offline (SLM):**
1. **LocalLLM** - Rule-based feedback (0 bytes)
2. **TransformersService** - DistilGPT-2/GPT-2 (82-124MB)
3. **SLMInference** - Conversation engine
4. **WhisperService** - Speech recognition (75-142MB)
5. **AdvancedPronunciationScorer** - Phoneme analysis
6. **EnhancedTTS / PiperTTS** - Text-to-speech

### **✅ What's Online (Django API):**
1. User authentication & management
2. Cloud progress storage
3. Multi-device sync
4. Analytics & statistics
5. Achievements tracking
6. Leaderboards (future)

### **✅ What's Hybrid (HybridServiceManager):**
1. Coordinates offline + online
2. Auto-sync when connected
3. Queue pending operations
4. Cache online responses
5. Seamless fallback
6. Best of both worlds

---

## 🔧 **CONFIGURATION**

### **Environment Variables (.env):**

```bash
# Server (optional - for cloud features)
VITE_API_URL=http://localhost:8000/api
VITE_ENABLE_SERVER_AUTH=true  # false to disable cloud sync

# Offline Models
VITE_DEFAULT_STT_MODEL=whisper-tiny-en
VITE_DEFAULT_LLM_MODEL=distilgpt2
VITE_MODEL_CDN_URL=https://your-cdn.com/models

# Hybrid Settings
VITE_AUTO_SYNC=true
VITE_SYNC_INTERVAL=15  # minutes
VITE_PREFER_OFFLINE=false
```

---

## 🎉 **SUMMARY**

Your **Speak Bee** project has a **sophisticated hybrid architecture**:

1. **🤖 SLM (Offline AI)** - Located in `client/src/services/`
   - Runs 100% in browser
   - Uses DistilGPT-2, Whisper, and rule-based systems
   - Provides complete learning experience offline

2. **🌐 API (Online Backend)** - Located in `server/`
   - Django REST API
   - Stores user data in cloud
   - Enables multi-device sync

3. **🔄 Hybrid Manager** - Bridges both worlds
   - Intelligent offline/online coordination
   - Auto-sync when possible
   - Works perfectly in either mode

**The SLM makes your app work completely offline, while the API adds cloud features when available!**

---

**Built with ❤️ for the best of both worlds: offline privacy + online convenience**

