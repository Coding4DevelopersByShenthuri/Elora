# 🐝 Speak Bee - Installation & Setup Guide

## ✅ **All AI Features Implemented - Ready to Use!**

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **npm** v9 or higher (comes with Node.js)
- **Git** (optional, for cloning)
- **Modern Browser** (Chrome, Edge, Firefox, or Safari)

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Navigate to Client Directory
```bash
cd client
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all required packages including:
- React & React DOM
- TypeScript
- Vite (build tool)
- Tailwind CSS
- shadcn/ui components
- **NEW:** @xenova/transformers (AI models)
- **NEW:** onnxruntime-web (ML runtime)
- **NEW:** i18next (multi-language support)

**Installation time:** ~2-3 minutes

### Step 3: Start Development Server
```bash
npm run dev
```

The app will open at: **http://localhost:5173**

---

## 🎯 What's New - AI Features

### 1. **Offline Speech Recognition**
Location: `client/src/services/WhisperService.ts`

**How to use:**
```typescript
import WhisperService from '@/services/WhisperService';

// Check if model is available
const available = await WhisperService.isModelAvailable();

// Download model (one-time, ~75MB)
if (!available) {
  await WhisperService.downloadModel(
    'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin',
    (progress) => console.log(`Downloading: ${progress}%`)
  );
}

// Transcribe audio
const result = await WhisperService.transcribe(audioBlob);
console.log(result.transcript);
```

### 2. **Enhanced Text-to-Speech**
Location: `client/src/services/EnhancedTTS.ts`

**How to use:**
```typescript
import EnhancedTTS from '@/services/EnhancedTTS';

// Get available voices
const voices = EnhancedTTS.getVoices();
console.log(voices); // Array of voice objects

// Speak with emotion
await EnhancedTTS.speak('Hello, how are you?', {
  emotion: 'happy',
  rate: 1.0,
  pitch: 1.2,
  volume: 1.0
});
```

### 3. **Grammar Correction AI**
Location: `client/src/services/TransformersService.ts`

**How to use:**
```typescript
import TransformersService from '@/services/TransformersService';

// Initialize (first time only)
await TransformersService.initialize();

// Correct grammar
const result = await TransformersService.correctGrammar(
  'i dont know what to do'
);
console.log(result.correctedText); // "I don't know what to do"
console.log(result.corrections); // Array of corrections
```

### 4. **Pronunciation Scoring**
Location: `client/src/services/PronunciationScorer.ts`

**How to use:**
```typescript
import PronunciationScorer from '@/services/PronunciationScorer';

const score = await PronunciationScorer.scorePronunciation(
  'Hello world', // Expected text
  'Hello world', // Spoken text
  audioBlob      // Optional audio data
);

console.log(score.overall); // 0-100
console.log(score.accuracy); // Phoneme accuracy
console.log(score.details.mispronounced); // Array of mispronounced words
```

### 5. **Achievement System**
Location: `client/src/services/AchievementSystem.ts`

**How to use:**
```typescript
import AchievementSystem from '@/services/AchievementSystem';

// Get all achievements
const achievements = AchievementSystem.getAllAchievements();

// Check for new achievements
const newAchievements = AchievementSystem.checkAchievements(userProgress);

// Get user level
const level = AchievementSystem.calculateLevel(totalPoints);
```

### 6. **Progress Tracking**
Location: `client/src/services/ProgressTracker.ts`

**How to use:**
```typescript
import ProgressTracker from '@/services/ProgressTracker';

// Record lesson completion
await ProgressTracker.recordLessonCompletion(
  userId,
  lessonId,
  score,      // 0-100
  timeSpent   // minutes
);

// Get insights
const insights = await ProgressTracker.getLearningInsights(userId);

// Get weekly stats
const stats = await ProgressTracker.getWeeklyStats(userId);
```

### 7. **Vocabulary Builder (Spaced Repetition)**
Location: `client/src/services/VocabularyBuilder.ts`

**How to use:**
```typescript
import VocabularyBuilder from '@/services/VocabularyBuilder';

// Create a word
const word = VocabularyBuilder.createWord(
  'serendipity',
  'Finding something good without looking for it',
  'It was pure serendipity that we met.'
);

// Get words due for review
const dueWords = VocabularyBuilder.getDueWords(allWords);

// Record review
const updated = VocabularyBuilder.recordReview(word, {
  wordId: word.id,
  correct: true,
  responseTime: 3.5,
  quality: 5,
  date: new Date().toISOString()
});
```

### 8. **Conversation AI**
Location: `client/src/services/ConversationAI.ts`

**How to use:**
```typescript
import ConversationAI from '@/services/ConversationAI';

// Get available topics
const topics = ConversationAI.getTopics();

// Start conversation
const firstMessage = ConversationAI.startConversation('intro');

// Process user response
const { aiResponse, feedback } = await ConversationAI.processUserResponse(
  'My name is John and I work as a teacher.'
);

// End conversation
const summary = ConversationAI.endConversation();
```

### 9. **Multi-Language Support**
Location: `client/src/i18n/config.ts`

**How to use:**
```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <button onClick={() => i18n.changeLanguage('hi')}>
        Switch to Hindi
      </button>
    </div>
  );
}
```

**Supported languages:**
- English (en)
- Hindi (hi)
- Tamil (ta)
- Telugu (te)
- Bengali (bn)
- Marathi (mr)
- Gujarati (gu)

### 10. **Progress Dashboard**
Location: `client/src/components/ProgressDashboard.tsx`

**How to use:**
```typescript
import ProgressDashboard from '@/components/ProgressDashboard';

function App() {
  return <ProgressDashboard />;
}
```

---

## 📦 New Files Created

### Services (AI & Core Features)
- `client/src/services/WhisperService.ts` - Speech recognition
- `client/src/services/EnhancedTTS.ts` - Text-to-speech
- `client/src/services/TransformersService.ts` - AI grammar correction
- `client/src/services/PronunciationScorer.ts` - Pronunciation analysis
- `client/src/services/AchievementSystem.ts` - Gamification
- `client/src/services/ProgressTracker.ts` - Progress analytics
- `client/src/services/VocabularyBuilder.ts` - Spaced repetition
- `client/src/services/ConversationAI.ts` - AI conversations
- `client/src/services/workers/whisper.worker.ts` - Background processing

### Components
- `client/src/components/ProgressDashboard.tsx` - Progress UI
- `client/src/components/LanguageSwitcher.tsx` - Language selector

### Data & Config
- `client/src/data/lessonContent.ts` - Comprehensive lessons
- `client/src/i18n/config.ts` - Multi-language support

### Documentation
- `AI_FEATURES_SUMMARY.md` - Complete feature documentation
- `INSTALLATION_GUIDE.md` - This file

---

## 🧪 Testing

### Test Offline Functionality
1. Build the app:
   ```bash
   npm run build
   ```

2. Preview the build:
   ```bash
   npm run preview
   ```

3. Open DevTools (F12) → Network tab → Check "Offline"

4. Refresh the page - everything should still work!

### Test Speech Recognition
1. Navigate to any lesson page
2. Click the microphone button
3. Allow microphone access
4. Speak clearly
5. See your transcription and feedback

### Test Progress Tracking
1. Complete a lesson
2. Navigate to Progress Dashboard
3. See your stats, achievements, and insights

---

## 🎨 Customization

### Adding New Achievements
Edit `client/src/services/AchievementSystem.ts`:

```typescript
{
  id: 'my_achievement',
  title: 'My Achievement',
  description: 'Complete 5 lessons',
  icon: '🎯',
  category: 'practice',
  tier: 'bronze',
  points: 50,
  requirement: { type: 'count', target: 5, metric: 'lessonsCompleted' },
  unlocked: false,
  progress: 0
}
```

### Adding New Lessons
Edit `client/src/data/lessonContent.ts`:

```typescript
{
  id: 'my-lesson',
  title: 'My Lesson',
  description: 'Learn something new',
  level: 'beginner',
  audience: 'adults',
  duration: 20,
  category: 'vocabulary',
  content: {
    introduction: 'Introduction text',
    exercises: [...],
    vocabulary: [...],
    tips: [...]
  },
  points: 100
}
```

### Adding New Languages
Edit `client/src/i18n/config.ts`:

```typescript
const resources = {
  // ... existing languages
  fr: {
    translation: {
      welcome: 'Bienvenue à Speak Bee',
      // ... more translations
    }
  }
};
```

---

## 🚀 Deployment

### Option 1: Netlify (Recommended)
1. Push code to GitHub
2. Connect GitHub repo to Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy!

### Option 2: Vercel
1. Push code to GitHub
2. Import project in Vercel
3. Framework preset: Vite
4. Deploy!

### Option 3: Static Hosting
1. Build the app:
   ```bash
   npm run build
   ```

2. Upload the `dist` folder to any static host:
   - GitHub Pages
   - AWS S3
   - Firebase Hosting
   - Cloudflare Pages

---

## 🔧 Troubleshooting

### Issue: npm install fails
**Solution:** Delete `node_modules` and `package-lock.json`, then run `npm install` again.

### Issue: Build fails with TypeScript errors
**Solution:** Run `npm run build -- --mode development` to see detailed errors.

### Issue: Speech recognition not working
**Solution:** 
- Ensure you're using HTTPS (required for microphone access)
- Check browser permissions
- Try Chrome/Edge (best support)

### Issue: Offline mode not working
**Solution:**
- Clear browser cache
- Rebuild the app
- Check Service Worker in DevTools → Application → Service Workers

---

## 📊 Performance Optimization

### Lazy Loading
All AI models are lazy-loaded:
- Whisper model: Downloads on first use
- Transformers models: Loads on demand
- Reduces initial bundle size

### Code Splitting
Routes are code-split automatically by Vite:
- Each page loads only when visited
- Faster initial load time

### Caching Strategy
- Static assets: Cache-first
- API calls: Network-first with cache fallback
- Models: Persistent cache in IndexedDB

---

## 🎓 Learning Resources

### For Developers
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Transformers.js](https://huggingface.co/docs/transformers.js)

### For Users
- Complete lessons in order
- Practice daily for best results
- Use conversation mode for real practice
- Track progress in the dashboard

---

## 🤝 Support

### Getting Help
1. Check this guide first
2. Review `AI_FEATURES_SUMMARY.md`
3. Check code comments (all services are well-documented)
4. Search for similar issues in the codebase

### Common Questions

**Q: Do I need an internet connection?**
A: No! After initial setup, everything works offline.

**Q: How much storage does it use?**
A: ~100-150 MB (including models and cached data).

**Q: Can I use it on mobile?**
A: Yes! Install as PWA for native-like experience.

**Q: Is my data private?**
A: Yes! All processing happens on your device. No data is sent to servers.

---

## 🎉 You're Ready!

Your Speak Bee app now has:
- ✅ Offline AI speech recognition
- ✅ Enhanced text-to-speech
- ✅ Grammar correction
- ✅ Pronunciation scoring
- ✅ Achievement system
- ✅ Progress tracking
- ✅ Vocabulary builder
- ✅ AI conversations
- ✅ Multi-language support
- ✅ Beautiful dashboard

**Start the dev server and explore:**
```bash
npm run dev
```

**Happy coding! 🚀**

