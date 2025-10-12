# Speak Bee - Offline Usage Guide

## Overview

Speak Bee has been optimized to work **completely offline**. This guide explains how the offline functionality works and how to use the app without an internet connection.

## Offline Features

### ✅ What Works Offline

1. **Complete UI/UX** - All pages and components are available
2. **User Authentication** - Login/signup works with localStorage
3. **Learning Content** - All lessons and exercises are cached
4. **Speech Recognition** - Uses browser's native Web Speech API
5. **Text-to-Speech** - Uses browser's native speechSynthesis
6. **Progress Tracking** - All progress saved locally in IndexedDB
7. **Data Persistence** - User data, practice sessions, and audio recordings stored locally

### 🔄 Automatic Sync

When you go back online:
- Pending progress updates are automatically synced to the server
- Cached content is refreshed in the background
- No data loss - everything saved offline is preserved

## Technical Architecture

### Client-Side Storage

1. **localStorage** - User authentication and simple settings
2. **IndexedDB** - Learning data, progress, and audio recordings
3. **Service Worker** - Caches all static assets for instant loading

### Offline-First APIs

#### KidsApi
- Automatically falls back to IndexedDB when offline
- Queues updates for sync when connection is restored
- 5-second timeout for server requests

#### UserDataService
- Manages all user learning data locally
- Exports/imports data for backup
- Stores practice sessions and recordings

#### SpeechService
- Uses browser's native Web Speech API
- No external API calls required
- Works on most modern browsers

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.9 or higher)
- Modern web browser (Chrome, Edge, Firefox, Safari)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Speak Bee"
   ```

2. **Install Client Dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Install Server Dependencies**
   ```bash
   cd ../server
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On Unix/MacOS
   source venv/bin/activate
   
   pip install -r requirements.txt
   ```

4. **Initialize Database**
   ```bash
   python manage.py migrate
   ```

### Running the App

#### Development Mode

**Terminal 1 - Server:**
```bash
cd server
python manage.py runserver
```

**Terminal 2 - Client:**
```bash
cd client
npm run dev
```

Visit: `http://localhost:5173`

#### Production Build (Offline Optimized)

```bash
cd client
npm run build
npm run preview
```

The production build is fully optimized for offline usage with:
- Service Worker for asset caching
- Code splitting for faster loading
- Compressed assets
- PWA manifest

## Offline Testing

### Simulate Offline Mode

1. **Chrome DevTools:**
   - Open DevTools (F12)
   - Go to "Network" tab
   - Select "Offline" from the throttling dropdown

2. **Firefox DevTools:**
   - Open DevTools (F12)
   - Go to "Network" tab
   - Check "Offline" in the throttling options

3. **System-Wide:**
   - Disable Wi-Fi/Ethernet
   - Enable airplane mode

### Verify Offline Functionality

1. Load the app while online
2. Navigate through a few pages
3. Go offline
4. Refresh the page - it should load instantly
5. Try logging in, taking lessons, etc.
6. Go back online - changes should sync automatically

## Browser Support

### Fully Supported

- ✅ Chrome/Edge (v90+)
- ✅ Firefox (v88+)
- ✅ Safari (v14+)

### Features by Browser

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| IndexedDB | ✅ | ✅ | ✅ | ✅ |
| Web Speech API | ✅ | ❌ | ✅ | ✅ |
| PWA Install | ✅ | ⚠️ | ✅ | ✅ |

⚠️ = Limited support

## PWA Installation

### Desktop

1. **Chrome/Edge:**
   - Click the install icon in the address bar
   - Or: Menu → "Install Speak Bee"

2. **Firefox:**
   - Add to home screen from menu (limited)

### Mobile

1. **Android (Chrome):**
   - Tap menu → "Add to Home screen"
   - App will work fully offline

2. **iOS (Safari):**
   - Tap Share → "Add to Home Screen"
   - App will work fully offline

## Data Management

### Export User Data

```javascript
// In browser console
const userId = 'your-user-id';
const data = await userDataService.exportUserData(userId);
console.log(JSON.stringify(data, null, 2));
// Copy and save the output
```

### Import User Data

```javascript
// In browser console
const userId = 'your-user-id';
const data = { /* paste exported data */ };
await userDataService.importUserData(userId, data);
```

### Clear User Data

```javascript
// In browser console
const userId = 'your-user-id';
await userDataService.clearUserData(userId);
```

## Troubleshooting

### Service Worker Issues

**Problem:** Changes not appearing after update

**Solution:**
1. Open DevTools → Application → Service Workers
2. Click "Unregister"
3. Refresh the page (Ctrl+Shift+R / Cmd+Shift+R)

### Storage Issues

**Problem:** "QuotaExceededError"

**Solution:**
1. Clear old cached data
2. Or increase browser storage quota (browser settings)

### Speech Recognition Not Working

**Problem:** STT not available

**Solution:**
- Use Chrome/Edge (best support)
- Ensure microphone permissions granted
- Check browser console for errors

## File Structure

```
Speak Bee/
├── client/
│   ├── public/
│   │   ├── sw.js              # Service Worker
│   │   ├── manifest.json      # PWA Manifest
│   │   └── ...                # Static assets
│   ├── src/
│   │   ├── services/
│   │   │   ├── KidsApi.ts         # Offline-first API
│   │   │   ├── UserDataService.ts # Local data storage
│   │   │   ├── SpeechService.ts   # Web Speech API
│   │   │   └── SLMEvaluator.ts    # Local evaluation
│   │   ├── components/
│   │   │   └── OfflineIndicator.tsx # Online/offline status
│   │   └── ...
│   └── vite.config.ts         # Build optimization
└── server/
    └── ...                    # Django backend (optional for offline)
```

## Performance

### Metrics (Offline Mode)

- **First Load:** < 1 second (cached)
- **Page Navigation:** Instant
- **Data Retrieval:** < 50ms (IndexedDB)
- **Speech Recognition:** Native speed
- **TTS:** Native speed

### Storage Usage

- **Service Worker Cache:** ~10-20 MB
- **IndexedDB:** ~5-10 MB per user
- **localStorage:** ~5 MB

## Security

### Offline Data

- All data stored locally is browser-sandboxed
- No data leaves the device unless online sync occurs
- User authentication tokens stored securely in localStorage
- Audio recordings encrypted by browser's IndexedDB

### Best Practices

1. Don't share devices with sensitive user data
2. Clear browser data when using shared computers
3. Use strong passwords even for offline-only usage
4. Regularly backup important learning data

## Updates

### Checking for Updates

The service worker automatically checks for updates every minute. When an update is available:

1. New version downloads in background
2. Old version continues working
3. Refresh to get new version

### Manual Update

```javascript
// In browser console
navigator.serviceWorker.getRegistration().then(reg => {
  reg.update();
});
```

## Contributing

When developing offline features:

1. Test thoroughly in offline mode
2. Ensure graceful fallbacks
3. Add appropriate error handling
4. Document storage requirements
5. Update this guide

## Support

For issues or questions:
- Check browser console for errors
- Verify IndexedDB storage in DevTools
- Check Service Worker status
- Review network requests in DevTools

## Changelog

### v1.0.0 - Offline Support

- ✅ Service Worker implementation
- ✅ PWA manifest
- ✅ Offline-first KidsApi
- ✅ IndexedDB storage for all user data
- ✅ Automatic sync on reconnection
- ✅ Offline indicator component
- ✅ Optimized Vite build configuration
- ✅ Removed external dependencies (Google Fonts, Unsplash)
- ✅ Local SVG placeholders for images

---

**Speak Bee** - Learn languages anywhere, anytime - even offline! 🐝

