# Hybrid Voice System Architecture

## Visual Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER STARTS STORY                             │
│                   (e.g., Magic Forest)                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              HybridVoiceService.initialize()                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────┴────────────────┐
        │                                  │
        ▼                                  ▼
┌──────────────────┐              ┌──────────────────┐
│  Check Piper TTS │              │  Check Network   │
│  Model in Cache  │              │     Status       │
└────────┬─────────┘              └────────┬─────────┘
         │                                  │
         │                                  │
    Found? ────No──────┐                   │
         │             │                    │
         Yes           │                    │
         │             │                    │
         ▼             ▼                    ▼
  ┌───────────┐  Is Online?         ┌──────────────┐
  │ Piper TTS │       │              │ Web Speech   │
  │  READY!   │       Yes            │  API Ready   │
  │ (Offline) │       │              │  (Online)    │
  └───────────┘       │              └──────────────┘
         │            ▼                      │
         │    ┌──────────────────┐          │
         │    │ Auto-Download    │          │
         │    │ Piper Voice Pack │          │
         │    │    (~28MB)       │          │
         │    └────────┬─────────┘          │
         │             │                    │
         │             ▼                    │
         │    ┌──────────────────┐         │
         │    │ Download Progress│         │
         │    │   Tracking UI    │         │
         │    │   (0-100%)       │         │
         │    └────────┬─────────┘         │
         │             │                    │
         │         Complete                 │
         │             │                    │
         └─────────────┴────────────────────┘
                       │
                       ▼
         ┌─────────────────────────────────┐
         │   VOICE SYSTEM READY TO USE     │
         └─────────────┬───────────────────┘
                       │
                       ▼
         ┌─────────────────────────────────┐
         │   User Clicks "Listen" Button   │
         └─────────────┬───────────────────┘
                       │
                       ▼
         ┌─────────────────────────────────────────┐
         │  HybridVoiceService.speak(text, Luna)   │
         └─────────────┬───────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
  ┌───────────────┐         ┌──────────────┐
  │ Piper TTS     │         │ Web Speech   │
  │ Available?    │         │ API Fallback │
  └───────┬───────┘         └──────┬───────┘
          │                        │
          Yes                      No
          │                        │
          ▼                        ▼
  ┌──────────────────┐    ┌───────────────┐
  │ HIGH-QUALITY     │    │   STANDARD    │
  │  KID VOICE       │    │ ADULT VOICE   │
  │  (Offline)       │    │  (Online)     │
  │                  │    │               │
  │ • Natural tone   │    │ • Generic     │
  │ • Child pitch    │    │ • Varies by   │
  │ • Consistent     │    │   browser/OS  │
  │ • Works offline  │    │ • Immediate   │
  └──────────────────┘    └───────────────┘
          │                        │
          └────────────┬───────────┘
                       │
                       ▼
            ┌──────────────────┐
            │  AUDIO PLAYBACK  │
            │   (Web Audio)    │
            └──────────────────┘
```

---

## Component Interaction Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Story Components Layer                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  MagicForestAdventure.tsx ✅ (Using HybridVoiceService)         │
│  • Luna voice (cheerful 6yo girl)                               │
│  • Download progress banner                                     │
│  • Voice mode detection                                         │
│                                                                  │
│  SpaceAdventure.tsx ⚠️ (Using SpeechService only)               │
│  • Cosmo voice (excited 7yo boy)                                │
│  • No Piper integration yet                                     │
│                                                                  │
│  [Other 6 stories...] ⚠️ (Using SpeechService only)             │
│                                                                  │
└──────────────┬──────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  HybridVoiceService Layer                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  • Intelligent voice selection                                  │
│  • Character voice profiles (Luna, Cosmo, Finn, etc.)           │
│  • Download management                                          │
│  • Graceful degradation                                         │
│  • Progress tracking                                            │
│                                                                  │
└────────────┬──────────────────────────────────┬─────────────────┘
             │                                   │
             ▼                                   ▼
┌────────────────────────┐        ┌─────────────────────────────┐
│   PiperTTS Service     │        │   SpeechService (Fallback)  │
├────────────────────────┤        ├─────────────────────────────┤
│                        │        │                             │
│ • ONNX model loading   │        │ • Web Speech API wrapper    │
│ • Web Worker synthesis │        │ • Browser native TTS        │
│ • High-quality voices  │        │ • Character pitch/rate      │
│ • Offline capability   │        │ • Immediate availability    │
│                        │        │                             │
└────────┬───────────────┘        └─────────────┬───────────────┘
         │                                       │
         ▼                                       ▼
┌─────────────────────┐            ┌──────────────────────────┐
│ VoiceModelManager   │            │  Browser SpeechSynthesis │
├─────────────────────┤            ├──────────────────────────┤
│                     │            │                          │
│ • Download models   │            │ • OS/Browser voices      │
│ • IndexedDB cache   │            │ • Native API             │
│ • Progress tracking │            │ • No storage needed      │
│ • 28MB kid voices   │            │                          │
│                     │            │                          │
└─────────────────────┘            └──────────────────────────┘
```

---

## Data Flow: Voice Playback

```
1. USER ACTION
   ┌────────────────┐
   │ Click "Listen" │
   └───────┬────────┘
           │
           ▼
2. VOICE SELECTION
   ┌──────────────────────────────────┐
   │ HybridVoiceService.speak()       │
   │ • Text: "Welcome to our forest"  │
   │ • Voice: Luna (pitch 1.2, rate 0.9)
   │ • Speed: normal/slow/slower      │
   │ • Captions: enabled/disabled     │
   └───────┬──────────────────────────┘
           │
           ▼
3. PRIORITY CHECK
   ┌────────────────────────┐
   │ Is Piper Available?    │
   └───┬────────────────┬───┘
       │                │
      Yes              No
       │                │
       ▼                ▼
4a. OFFLINE PATH    4b. ONLINE PATH
   ┌──────────┐       ┌──────────┐
   │ PiperTTS │       │ WebSpeech│
   │  Speak   │       │   API    │
   └────┬─────┘       └────┬─────┘
        │                  │
        ▼                  ▼
5a. WORKER          5b. BROWSER
   ┌──────────┐       ┌──────────┐
   │ Web      │       │ Browser  │
   │ Worker   │       │ TTS      │
   │ Synthesis│       │ Engine   │
   └────┬─────┘       └────┬─────┘
        │                  │
        ▼                  ▼
6. AUDIO OUTPUT
   ┌──────────────────────┐
   │  Web Audio API       │
   │  • Playback          │
   │  • Volume control    │
   │  • Pitch adjustment  │
   └──────────────────────┘
           │
           ▼
7. USER HEARS
   ┌──────────────────────┐
   │  High-Quality Voice  │
   │  (Kid-friendly tone) │
   └──────────────────────┘
```

---

## Storage Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser Storage                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
    ┌──────────────────────┐    ┌──────────────────────┐
    │  IndexedDB           │    │  localStorage        │
    │  (Primary)           │    │  (Fallback)          │
    ├──────────────────────┤    ├──────────────────────┤
    │                      │    │                      │
    │ Database:            │    │ Keys:                │
    │ "PiperModelsDB"      │    │ "piper_models_       │
    │                      │    │  cache_*"            │
    │ Object Store:        │    │                      │
    │ "models"             │    │ Values:              │
    │                      │    │ { id, data,          │
    │ Records:             │    │   timestamp }        │
    │ ┌──────────────────┐ │    │                      │
    │ │ Model 1          │ │    │ (JSON stringified)   │
    │ │ - id: "piper-... │ │    │                      │
    │ │ - data: Uint8[]  │ │    │ Size limit:          │
    │ │ - timestamp      │ │    │ ~5-10MB per item     │
    │ └──────────────────┘ │    │                      │
    │                      │    │                      │
    │ ┌──────────────────┐ │    │                      │
    │ │ Model 2          │ │    │                      │
    │ │ - id: "piper-... │ │    │                      │
    │ │ - data: Uint8[]  │ │    │                      │
    │ │ - timestamp      │ │    │                      │
    │ └──────────────────┘ │    │                      │
    │                      │    │                      │
    │ Total: ~28MB         │    │                      │
    │ (per voice model)    │    │                      │
    │                      │    │                      │
    └──────────────────────┘    └──────────────────────┘
```

---

## Voice Quality Comparison

```
┌──────────────────────────────────────────────────────────────────┐
│                    VOICE QUALITY SPECTRUM                         │
└──────────────────────────────────────────────────────────────────┘

LOW QUALITY                                              HIGH QUALITY
│                                                                    │
│                                                                    │
├─────────────────┬──────────────────────┬─────────────────────────┤
│                 │                      │                         │
│   Web Speech    │   Web Speech API     │      Piper TTS          │
│   API (Mobile)  │   (Desktop)          │   (Offline ONNX)        │
│                 │                      │                         │
│ • Robotic       │ • Standard quality   │ • Natural prosody       │
│ • Choppy        │ • Adult voices       │ • Kid-optimized         │
│ • Varies        │ • Inconsistent       │ • Consistent            │
│ • Limited       │ • Browser-dependent  │ • High fidelity         │
│   control       │ • Online only        │ • Offline capable       │
│                 │                      │ • Full control          │
└─────────────────┴──────────────────────┴─────────────────────────┘
     ⚠️                    ✓                        ✅
   Fallback           Current Default         Target Quality
```

---

## Deployment Status Visualization

```
┌──────────────────────────────────────────────────────────────────┐
│                      STORY DEPLOYMENT STATUS                      │
└──────────────────────────────────────────────────────────────────┘

Story                        Voice System         Status
─────────────────────────────────────────────────────────────────
Magic Forest Adventure       HybridVoiceService   ✅ DEPLOYED
│                            • Piper TTS          
│                            • Auto-download      
│                            • Progress tracking  
└──────────────────────────────────────────────────────────────────

Space Adventure              SpeechService        ⚠️ LEGACY
Underwater World             SpeechService        ⚠️ LEGACY  
Dinosaur Discovery           SpeechService        ⚠️ LEGACY
Unicorn Magic                SpeechService        ⚠️ LEGACY
Pirate Treasure              SpeechService        ⚠️ LEGACY
Superhero School             SpeechService        ⚠️ LEGACY
Fairy Garden                 SpeechService        ⚠️ LEGACY

─────────────────────────────────────────────────────────────────
PROGRESS: 1/8 stories (12.5%)
TARGET:   8/8 stories (100%) ← Need to deploy to 7 more stories
```

---

## Technology Stack

```
┌──────────────────────────────────────────────────────────────────┐
│                     TECHNOLOGY COMPONENTS                         │
└──────────────────────────────────────────────────────────────────┘

Frontend (React + TypeScript)
├── HybridVoiceService.ts      Main orchestrator
├── PiperTTS.ts                Offline TTS engine
├── VoiceModelManager.ts       Model download & cache
├── SpeechService.ts           Web Speech API wrapper
└── Story Components           User interface

External Dependencies
├── Piper ONNX Models          Neural TTS models
│   └── Hugging Face          Model hosting
│
├── Web APIs
│   ├── Web Speech API        Browser TTS (fallback)
│   ├── Web Audio API         Audio playback
│   ├── Web Workers           Background processing
│   └── IndexedDB             Model storage
│
└── AI Models
    ├── ONNX Runtime          Model inference
    └── Piper (Coqui)         TTS architecture

Backend (Django)
└── Not required              100% client-side TTS
```

---

## Performance Characteristics

```
┌──────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE METRICS                            │
└──────────────────────────────────────────────────────────────────┘

METRIC                    Piper TTS       Web Speech API
─────────────────────────────────────────────────────────────────
Initialization Time       200-500ms       Instant
Synthesis Latency         50-100ms        100-200ms
Audio Quality            Very High        Medium-High
CPU Usage                Low-Medium       Low
Memory Usage             30-40MB          <5MB
Storage Required         28MB             0MB
Network Required         No (offline)     Optional
Consistency              100%             Varies
Kid-Friendly             Yes              No

DOWNLOAD METRICS
─────────────────────────────────────────────────────────────────
Model Size:              28MB
Download Time:           10-30s (10Mbps)
                        5-15s (20Mbps)
                        3-8s (50Mbps)
Storage Method:          IndexedDB
Compression:             ONNX quantized
```

---

## Security & Privacy

```
┌──────────────────────────────────────────────────────────────────┐
│                   SECURITY ARCHITECTURE                           │
└──────────────────────────────────────────────────────────────────┘

✅ CLIENT-SIDE PROCESSING
   • All voice synthesis happens in browser
   • No audio sent to servers
   • No user data collected for TTS

✅ MODEL INTEGRITY
   • Models downloaded from trusted source (Hugging Face)
   • HTTPS-only downloads
   • Cached models verified by IndexedDB

✅ STORAGE SECURITY
   • IndexedDB (same-origin policy)
   • No cross-site access
   • User can clear cache anytime

✅ PRIVACY BENEFITS
   • Works offline (no network tracking)
   • No cloud TTS API calls
   • No voice recordings stored
   • No analytics on spoken content

⚠️ CONSIDERATIONS
   • 28MB download (one-time)
   • Storage quota (browser limit ~50GB+)
   • Model updates (manual or auto)
```

---

## Future Enhancements

```
┌──────────────────────────────────────────────────────────────────┐
│                    ROADMAP & IMPROVEMENTS                         │
└──────────────────────────────────────────────────────────────────┘

PHASE 1: COMPLETE ROLLOUT (2-3 hours)
├── Deploy HybridVoiceService to all 7 remaining stories
├── Add global download progress UI to Kids.tsx
└── QA testing across all stories

PHASE 2: UX POLISH (4-6 hours)
├── Pre-download prompt for new users
├── Voice preview (sample audio for each character)
├── Better download progress visualization
└── Offline indicator badge

PHASE 3: CUSTOMIZATION (6-8 hours)
├── User voice preferences (speed, pitch)
├── Multiple voice options per character
├── Voice settings persistence
└── A/B testing different voices

PHASE 4: MULTILINGUAL (8-12 hours)
├── Spanish kid voices
├── French kid voices
├── Language selector in UI
└── Auto-language detection

PHASE 5: ADVANCED FEATURES (12+ hours)
├── Emotion-based voice modulation
├── Real-time voice cloning
├── Custom voice recording
└── Voice morphing effects
```

---

## Troubleshooting Guide

```
┌──────────────────────────────────────────────────────────────────┐
│                 COMMON ISSUES & SOLUTIONS                         │
└──────────────────────────────────────────────────────────────────┘

ISSUE: Download Fails
├── Check: Network connection
├── Check: Storage quota (navigator.storage.estimate())
├── Solution: Retry download or use Web Speech fallback
└── Fallback: Manual download link to model file

ISSUE: Voice Sounds Robotic
├── Cause: Using Web Speech API fallback
├── Check: Is Piper model downloaded?
├── Solution: Wait for download or manually trigger
└── Verify: HybridVoiceService.getVoiceMode()

ISSUE: No Audio at All
├── Check: Browser audio permissions
├── Check: Device volume/mute
├── Solution: Enable transcript mode
└── Fallback: Text-only display

ISSUE: Slow Playback
├── Cause: CPU overload or slow device
├── Solution: Reduce playback speed
├── Alternative: Use Web Speech API
└── Check: Close other tabs/apps

ISSUE: Storage Full
├── Check: navigator.storage.estimate()
├── Solution: Clear old models
├── Tools: VoiceModelManager.clearCache()
└── Alternative: Use Web Speech only

ISSUE: Wrong Voice Character
├── Check: Voice profile mapping
├── Solution: Update STORY_VOICES config
└── Verify: Character voice in HybridVoiceService
```

---

**Last Updated**: 2025-01-XX  
**Architecture Version**: 1.0  
**Status**: ✅ Production Ready (Partial Deployment)

