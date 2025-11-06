# Pronunciation Detection System - How It Works & Debugging

## How Detection Works

The system uses **TWO methods in parallel** to detect what kids are saying:

### 1. **Whisper (Offline AI Model)**
- Transcribes audio blobs after recording
- More accurate but slower
- Falls back to Web Speech API if not loaded or fails

### 2. **Web Speech API (Browser Native)**
- Runs **DURING recording** in real-time
- Shows detected text immediately as the kid speaks
- Faster detection, works in all modern browsers
- Used as primary method when Whisper is unavailable

## Detection Flow

1. **User clicks "Say it!" button**
   - Web Speech API starts listening immediately
   - MediaRecorder starts capturing audio

2. **While Recording:**
   - Web Speech API shows real-time transcript: "📝 I heard: [text]"
   - Audio chunks collected every 1 second
   - Analysis runs every 500-800ms

3. **When Speech Detected:**
   - Web Speech API: Immediate detection (if final result matches)
   - Whisper: Analyzes audio blob (if available)
   - Both transcripts are compared and used

4. **Matching Logic:**
   - Exact match: "cat" = "cat" ✅
   - Contains match: "I said cat" contains "cat" ✅
   - Similarity match: 50%+ similarity (very lenient for kids) ✅
   - Prefix match: First 2-3 characters match ✅
   - Substring match: Any part of word matches ✅

## Debugging - Check Browser Console

Open browser console (F12) to see detailed logs:

### What to Look For:

1. **🎤 Starting Web Speech API recognition** - Web Speech API started
2. **📝 Web Speech API interim: [text]** - Real-time detection
3. **🎤 Child said: [text]** - Whisper transcription result
4. **🔍 Matching: expected="[word]" vs spoken="[text]"** - Matching attempt
5. **✅ Correct pronunciation detected!** - Success!
6. **❌ Pronunciation check failed** - Didn't match

### Common Issues:

#### Issue: "I didn't hear anything"
- **Cause**: No transcript from either method
- **Check**: 
  - Microphone permissions allowed?
  - Audio blob size in console (should be > 2000 bytes)
  - Web Speech API supported? (Chrome/Edge required)

#### Issue: "I heard: [wrong word]"
- **Cause**: Detection working but matching failed
- **Check**:
  - What transcript was detected vs target word
  - Similarity percentage in console
  - Try speaking more clearly

#### Issue: No detection at all
- **Cause**: Web Speech API not starting or Whisper not loaded
- **Check**:
  - Browser console for errors
  - Microphone access granted
  - Try Chrome/Edge (best Web Speech API support)

## Current Settings (Optimized for Kids)

- **Similarity Threshold**: 50% (very lenient)
- **Analysis Frequency**: Every 500ms (very fast)
- **Transcription Timeout**: 8 seconds (faster response)
- **Auto-stop**: When correct pronunciation detected
- **Real-time Display**: Shows detected text as kid speaks

## Testing Detection

1. Open browser console (F12)
2. Click "Say it!" button
3. Speak the word/phrase
4. Watch console logs:
   - Should see "📝 Web Speech API interim: [your word]"
   - Should see "🎤 Child said: [your word]"
   - Should see "🔍 Matching: expected='[target]' vs spoken='[detected]'"
   - Should see similarity percentage

## What Gets Saved to MySQL

When pronunciation is detected correctly:
- **KidsVocabularyPractice** table: word, story_id, best_score, attempts
- **KidsPronunciationPractice** table: phrase, story_id, best_score, attempts
- **KidsProgress** table: points, streak, details (vocabulary/pronunciation data)

