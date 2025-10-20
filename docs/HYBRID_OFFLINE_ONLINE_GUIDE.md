# 🐝 Elora - Complete Hybrid Offline + Online Guide

## 🎯 **Project Overview**

Elora is a **hybrid offline-first spoken English training application** that works both **completely offline** and with **optional cloud features**.

### **Unique Architecture:**

```
┌─────────────────────────────────────────────────────────┐
│                    Elora                            │
│                                                         │
│  ┌──────────────────┐         ┌──────────────────┐   │
│  │   CLIENT (React)  │         │  SERVER (Django) │   │
│  │                   │         │                  │   │
│  │  🤖 Offline SLM   │◄───────►│  🌐 REST API     │   │
│  │  - Whisper STT    │  HTTP   │  - Auth          │   │
│  │  - DistilGPT-2    │  Sync   │  - Progress      │   │
│  │  - Pronunciation  │         │  - Analytics     │   │
│  │                   │         │                  │   │
│  │  💾 IndexedDB     │         │  💾 SQLite       │   │
│  │  - Models (200MB) │         │  - User Data     │   │
│  │  - Cache          │         │  - Cloud Sync    │   │
│  └──────────────────┘         └──────────────────┘   │
│                                                         │
│  🔄 HybridServiceManager coordinates both sides        │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 **What Works Offline vs Online**

### ✅ **100% Offline Features** (No Internet Required)

#### **AI/ML Services:**
- ✅ Speech Recognition (Whisper STT)
- ✅ Text-to-Speech (Web Speech + Piper)
- ✅ Conversation AI (DistilGPT-2/GPT-2)
- ✅ Pronunciation Scoring (MFA-inspired)
- ✅ Grammar Checking (Rule-based + AI)
- ✅ Vocabulary Building
- ✅ Feedback Generation (LocalLLM + SLM)

#### **Core Features:**
- ✅ All lessons and exercises
- ✅ Voice practice
- ✅ Pronunciation scoring
- ✅ Conversation practice
- ✅ Grammar evaluation
- ✅ Progress tracking (local)
- ✅ Achievements (local)

### 🌐 **Online-Only Features** (Requires Internet)

- 🌐 User authentication (login/register)
- 🌐 Cloud progress backup
- 🌐 Multi-device sync
- 🌐 Leaderboards (future)
- 🌐 Social features (future)
- 🌐 Analytics dashboard (future)

### 🔄 **Hybrid Features** (Work Offline, Sync When Online)

- 🔄 Progress tracking (local → cloud)
- 🔄 Achievements (unlock offline, sync online)
- 🔄 Vocabulary words (learn offline, sync online)
- 🔄 Session history (record offline, sync online)
- 🔄 Statistics (calculate offline, aggregate online)

---

## 🚀 **Quick Start Guide**

### **Option 1: Offline Only** (No Server Required)

```bash
# 1. Install client dependencies
cd client
npm install

# 2. Disable server integration (optional)
echo "VITE_ENABLE_SERVER_AUTH=false" > .env

# 3. Start client
npm run dev

# 4. Open http://localhost:5173
# 5. Download models when prompted
# 6. Start learning offline!
```

✅ **Works with:** Airplane mode, no internet, privacy-focused

---

### **Option 2: Online + Offline** (Full Features)

```bash
# TERMINAL 1: Start Django Server
cd server
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# TERMINAL 2: Start React Client
cd client
npm install
npm run dev

# Open http://localhost:5173
# Create account → Download models → Full experience!
```

✅ **Works with:** Cloud sync, multi-device, full features

---

## 📂 **Project Structure**

```
Elora/
│
├── client/                           🎨 REACT FRONTEND (Offline + Online)
│   ├── src/
│   │   ├── services/                 ⭐ ALL OFFLINE AI SERVICES
│   │   │   ├── LocalLLM.ts           🤖 Rule-based SLM
│   │   │   ├── TransformersService.ts🤖 DistilGPT-2/GPT-2 SLM
│   │   │   ├── SLMInference.ts       🤖 SLM Engine
│   │   │   ├── SLMEvaluator.ts       🤖 Response evaluation
│   │   │   ├── WhisperService.ts     🎤 Offline STT
│   │   │   ├── EnhancedTTS.ts        🔊 Text-to-Speech
│   │   │   ├── PiperTTS.ts           🔊 Neural TTS
│   │   │   ├── PronunciationScorer.ts📊 Pronunciation
│   │   │   ├── AdvancedPronunciationScorer.ts 📊 Advanced
│   │   │   ├── ModelManager.ts       📦 Model downloads
│   │   │   ├── PerformanceBenchmark.ts 📈 Monitoring
│   │   │   ├── HybridServiceManager.ts 🔄 Offline+Online
│   │   │   ├── ApiService.ts         🌐 Django API
│   │   │   └── workers/              🔧 Web Workers
│   │   │       ├── whisper.worker.ts
│   │   │       ├── slm.worker.ts
│   │   │       └── piper.worker.ts
│   │   ├── components/               🎨 React components
│   │   ├── pages/                    📄 App pages
│   │   └── contexts/                 🔄 React contexts
│   ├── public/                       📦 Static assets
│   ├── QUICK_START.md                📖 Quick start guide
│   ├── OFFLINE_SLM_SETUP.md          📖 Complete setup
│   ├── SLM_ARCHITECTURE_EXPLAINED.md ⭐ THIS EXPLAINS SLM!
│   └── package.json
│
├── server/                           🌐 DJANGO BACKEND (Online Only)
│   ├── api/
│   │   ├── models.py                 💾 Database models
│   │   ├── views.py                  🛣️ API endpoints
│   │   ├── serializers.py            📄 Data serialization
│   │   └── urls.py                   🗺️ API routes
│   ├── crud/
│   │   └── settings.py               ⚙️ Django config
│   ├── db.sqlite3                    💾 SQLite database
│   ├── manage.py                     🔧 Django management
│   └── requirements.txt              📦 Python dependencies
│
└── HYBRID_OFFLINE_ONLINE_GUIDE.md    📖 This file!
```

---

## 🔍 **WHERE IS THE SLM?**

### **The SLM (Small Language Model) is in the CLIENT!**

**Location:** `client/src/services/`

**Three Layers of SLM:**

1. **LocalLLM.ts** → Rule-based (0 bytes, instant)
2. **TransformersService.ts** → DistilGPT-2 (82MB, fast)
3. **SLMInference.ts** → Full engine with GPT-2 (124MB, best)

**Read the complete explanation:**
📖 **`client/SLM_ARCHITECTURE_EXPLAINED.md`** ⭐

---

## 💻 **How to Use**

### **1. Initialize the Hybrid System**

```typescript
import { HybridServiceManager, initializeOfflineServices } from './services';

// Initialize hybrid manager
await HybridServiceManager.initialize({
  mode: 'hybrid',        // 'offline' | 'online' | 'hybrid'
  preferOffline: false,  // Use online when available
  autoSync: true,        // Auto-sync to cloud
  syncInterval: 15       // Sync every 15 minutes
});

// Download offline models (one-time)
await initializeOfflineServices('beginner');
// Downloads: Whisper Tiny (75MB) + DistilGPT-2 (82MB) = ~157MB

// Ready to go!
```

---

### **2. Run a Complete Offline Lesson**

```typescript
import { 
  WhisperService,
  SLMInference,
  AdvancedPronunciationScorer,
  EnhancedTTS,
  HybridServiceManager 
} from './services';

async function practiceLesson() {
  // 1. Teacher speaks (OFFLINE)
  await EnhancedTTS.speak("Say: Hello, how are you?");
  
  // 2. Student records
  const audioBlob = await recordAudio();
  
  // 3. Transcribe speech (OFFLINE - Whisper)
  const { transcript } = await WhisperService.transcribe(audioBlob);
  
  // 4. Score pronunciation (OFFLINE)
  const score = await AdvancedPronunciationScorer.scoreDetailed(
    "Hello, how are you?",
    transcript,
    audioBlob
  );
  
  // 5. Generate AI feedback (OFFLINE - DistilGPT-2)
  const feedback = await SLMInference.generateFeedback({
    userText: transcript,
    expectedText: "Hello, how are you?",
    exerciseType: 'pronunciation',
    userLevel: 'beginner'
  });
  
  // 6. Speak feedback (OFFLINE)
  await EnhancedTTS.speak(feedback.feedback);
  
  // 7. Save progress (OFFLINE + auto-sync when online)
  await HybridServiceManager.recordSession({
    sessionType: 'pronunciation',
    score: score.overall,
    duration: 5,
    details: { transcript, score, feedback }
  });
  
  // ✅ Everything works offline!
  // 🔄 Data syncs to cloud automatically when online!
}
```

---

### **3. Check Status**

```typescript
// Check system health
const health = await HybridServiceManager.getSystemHealth();
console.log(health);
// {
//   offlineReady: true,    // Models downloaded
//   onlineReady: true,     // Internet available
//   modelsDownloaded: 2,
//   cacheSize: 157000000,  // 157 MB
//   pendingSync: 3         // Sessions waiting to sync
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

// Force sync now
await HybridServiceManager.forceSyncNow();
```

---

## 🔄 **Sync Behavior**

### **How Data Syncs:**

```
USER ACTION
    ↓
1. Store Locally (ALWAYS)
   - IndexedDB / localStorage
   - Instant, works offline
    ↓
2. Queue for Sync
   - Add to sync queue
   - Persisted across sessions
    ↓
3. Sync When Online (AUTOMATIC)
   - Try immediately if online
   - Retry every 15 minutes
   - Background sync
    ↓
4. Update Cloud (SUCCESS)
   - Django API receives data
   - Stored in SQLite
   - Available on all devices
```

### **Sync Examples:**

```typescript
// Scenario 1: Online → Immediate sync
await HybridServiceManager.recordSession({ /* ... */ });
// → Saved locally ✅
// → Synced to cloud ✅ (immediate)

// Scenario 2: Offline → Queued for sync
// (Airplane mode activated)
await HybridServiceManager.recordSession({ /* ... */ });
// → Saved locally ✅
// → Queued for sync ⏳ (pending)

// (WiFi restored)
// → Auto-sync triggered 🔄
// → Synced to cloud ✅ (automatic)

// Scenario 3: Manual sync
await HybridServiceManager.forceSyncNow();
// → Syncs all pending sessions
// → Returns: { synced: 5, failed: 0 }
```

---

## 🎮 **Usage Modes**

### **Mode 1: Offline Only** (Privacy Mode)

```typescript
await HybridServiceManager.initialize({
  mode: 'offline',
  autoSync: false
});

// ✅ Complete AI features work
// ✅ No data sent to server
// ✅ 100% private
// ❌ No multi-device sync
// ❌ No cloud backup
```

**Use when:**
- Privacy is critical
- No internet available
- Airplane mode
- Limited data plan

---

### **Mode 2: Online + Offline** (Recommended)

```typescript
await HybridServiceManager.initialize({
  mode: 'hybrid',
  autoSync: true
});

// ✅ Complete AI features work offline
// ✅ Data syncs to cloud when online
// ✅ Multi-device sync
// ✅ Cloud backup
// ✅ Best of both worlds
```

**Use when:**
- Want cloud features
- Multiple devices
- Internet usually available
- Don't mind cloud storage

---

### **Mode 3: Online Only** (Traditional App)

```typescript
await HybridServiceManager.initialize({
  mode: 'online',
  autoSync: true
});

// ⚠️ Requires internet for all features
// ✅ Instant cloud sync
// ✅ No model downloads needed
// ❌ Won't work offline
```

**Use when:**
- Always online
- Don't want to download models
- Prefer server-side processing

---

## 📊 **Storage Breakdown**

### **Client Storage (IndexedDB):**

```
IndexedDB: 'SpeakBeeModels'
├── models (150-300 MB total)
│   ├── whisper-tiny-en      75 MB
│   ├── whisper-base-en      142 MB
│   ├── distilgpt2           82 MB
│   └── gpt2                 124 MB
│
├── responses cache (~10 MB)
│   └── Cached API responses
│
└── syncQueue (~1 MB)
    └── Pending sync operations

localStorage: (~1 MB)
├── speakbee_auth_token
├── cached_progress
├── vocabulary
└── pending_sessions
```

### **Server Storage (SQLite):**

```
db.sqlite3 (Grows with users)
├── auth_user
├── api_userprofile
├── api_lessonprogress
├── api_practicesession
├── api_vocabularyword
└── api_achievement
```

---

## 🛠️ **Environment Configuration**

### **Client (.env):**

```bash
# Server URL (optional)
VITE_API_URL=http://localhost:8000/api

# Enable/disable server features
VITE_ENABLE_SERVER_AUTH=true  # Set to false for offline-only

# Default models
VITE_DEFAULT_STT_MODEL=whisper-tiny-en
VITE_DEFAULT_LLM_MODEL=distilgpt2

# Hybrid settings
VITE_AUTO_SYNC=true
VITE_SYNC_INTERVAL=15
VITE_PREFER_OFFLINE=false

# Model CDN (optional)
VITE_MODEL_CDN_URL=https://your-cdn.com/models
```

### **Server (.env):**

```bash
# Django settings
SECRET_KEY=your-secret-key-here
DEBUG=True

# Database
DATABASE_URL=sqlite:///db.sqlite3

# CORS (for local development)
CORS_ALLOWED_ORIGINS=http://localhost:5173

# JWT
JWT_ACCESS_TOKEN_LIFETIME=1440  # minutes
JWT_REFRESH_TOKEN_LIFETIME=10080  # minutes
```

---

## 🧪 **Testing Both Modes**

### **Test Offline Mode:**

```bash
# 1. Start app normally
npm run dev

# 2. Download models
# (Follow on-screen instructions)

# 3. Enable airplane mode / disconnect WiFi

# 4. Verify all features work:
   ✅ Speech recognition
   ✅ AI conversation
   ✅ Pronunciation scoring
   ✅ Text-to-speech
   ✅ Progress tracking (local)

# 5. Reconnect
# → Watch auto-sync happen!
```

### **Test Online Mode:**

```bash
# 1. Start both server and client
cd server && python manage.py runserver  # Terminal 1
cd client && npm run dev                  # Terminal 2

# 2. Create account / Login

# 3. Practice lessons

# 4. Check Django admin:
http://localhost:8000/admin
# → Verify progress synced to database

# 5. Login on different browser
# → Verify progress synced across devices
```

---

## 🎯 **Best Practices**

### **For Users:**

1. ✅ Download models during WiFi (not cellular)
2. ✅ Enable auto-sync for cloud backup
3. ✅ Use offline mode when privacy-critical
4. ✅ Manually sync before switching devices
5. ✅ Clear old models to free space

### **For Developers:**

1. ✅ Always test offline mode
2. ✅ Handle sync failures gracefully
3. ✅ Show pending sync count in UI
4. ✅ Provide manual sync button
5. ✅ Log all sync operations
6. ✅ Test with slow/unstable connections

---

## 📈 **Performance**

### **Offline Performance:**
- **STT:** 1-3 seconds (Whisper)
- **LLM:** 0.5-2 seconds (DistilGPT-2)
- **TTS:** 0.5-1 second (Web Speech)
- **Scoring:** 0.1-0.5 seconds (MFA)

### **Online Performance:**
- **API Call:** 50-200ms (local server)
- **Sync:** 100-500ms per session
- **Auth:** 100-300ms (JWT)

### **Storage:**
- **Models:** 157MB-300MB (one-time)
- **Cache:** ~10MB (grows slowly)
- **User Data:** ~1-5MB per user

---

## 🚨 **Troubleshooting**

### **Models Not Downloading:**

```typescript
// Check storage
const storage = await ModelManager.getStorageInfo();
console.log(`Available: ${storage.available / 1024 / 1024}MB`);

// Clear cache if needed
await ModelManager.clearCache();

// Retry download
await ModelManager.downloadModel('whisper-tiny-en');
```

### **Sync Not Working:**

```typescript
// Check status
const status = HybridServiceManager.getSyncStatus();
console.log(status);

// Force sync
await HybridServiceManager.forceSyncNow();

// Check pending sessions
console.log(`Pending: ${status.pendingSessions}`);
```

### **Server Connection Failed:**

```bash
# Check if server is running
curl http://localhost:8000/api/health

# Check CORS settings in server/crud/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]

# Restart server
python manage.py runserver
```

---

## 🎉 **Summary**

Your **Elora** application is a **sophisticated hybrid system**:

### **✅ What You Have:**

1. **🤖 Complete Offline AI** (client/src/services/)
   - Whisper STT, DistilGPT-2 LLM, Pronunciation Scoring
   - Works 100% offline after model download
   - 157-300MB models, cached locally

2. **🌐 Django REST API** (server/)
   - User authentication, progress tracking
   - Cloud storage, multi-device sync
   - Optional, enhances experience

3. **🔄 Hybrid Manager** (HybridServiceManager.ts)
   - Intelligent offline/online coordination
   - Auto-sync, queue management
   - Best of both worlds

### **✅ How It Works:**

- **Offline:** Complete AI experience, local storage
- **Online:** Cloud sync, multi-device, analytics
- **Hybrid:** Use offline, sync when possible

### **✅ What Makes It Special:**

- Privacy: Can work 100% offline
- Performance: Fast local AI inference
- Convenience: Cloud sync when available
- Reliability: Works in any network condition

---

**🐝 Built with ❤️ for the perfect balance of privacy, performance, and convenience!**

**Need more details? Read:**
- `client/QUICK_START.md` - Quick start guide
- `client/SLM_ARCHITECTURE_EXPLAINED.md` - ⭐ Complete SLM explanation
- `client/OFFLINE_SLM_SETUP.md` - Technical setup guide

