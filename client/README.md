# Elora (Offline-First PWA)

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

## Cloud storage (optional)

To enable shareable URLs for generated certificates, configure Supabase Storage:

Env vars in `.env` (or `.env.local`):

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
# Optional overrides
VITE_SUPABASE_BUCKET=public
VITE_SUPABASE_CERT_BUCKET=certificates
```

Usage example:

```ts
import CertificatesService from './src/services/CertificatesService';
import StorageService from './src/services/StorageService';

// Generate a PNG Blob, then upload and get a public URL
const pngBlob = await CertificatesService.generatePNG(layout, childName, new Date());
const publicUrl = await StorageService.uploadCertificateBlob(pngBlob, `${childName}-certificate.png`);

// Pass the URL to issueCertificate
// KidsApi.issueCertificate(token, { cert_id: 'cert-123', title: 'Completion', file_url: publicUrl })
```
