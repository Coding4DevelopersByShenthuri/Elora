# Speak Bee (Offline-First PWA)

Professional offline English learning platform built with React, TypeScript, and Vite.

Key features:
- Offline-first PWA with service worker and app-shell prefetch
- Local model feedback via `LocalLLM` (runs entirely on-device)
- IndexedDB persistence for user progress and audio
- Playwright E2E tests for offline behavior

Getting started:
1. Install deps: `npm install`
2. Dev: `npm run dev`
3. Build: `npm run build`
4. Preview (SW active): `npm run preview`
5. Tests: `npm run test`

Offline model settings:
- Go to `Settings` → enable “Use Local Model” to ensure all feedback is generated on-device.
- Click “Prefetch Offline Content” to cache core pages for offline usage.

Notes:
- The service worker is registered in `index.html` and supports `CACHE_URLS` messages for additional caching.
- Feedback scoring is computed in `SLMEvaluator`, with text guidance produced by `LocalLLM`.
