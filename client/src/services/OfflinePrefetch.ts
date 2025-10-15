/*
  OfflinePrefetch: helpers to ask the service worker to cache important URLs.
*/

export function cacheUrls(urls: string[]): void {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'CACHE_URLS', urls });
  }
}

export async function prefetchAppShell(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.ready;
    const shellRoutes = [
      '/',
      '/index.html',
      '/offline.html',
      '/manifest.json',
      '/kids',
      '/adults',
      '/pricing',
      '/search',
      '/settings',
      '/help',
      '/contact'
    ];
    cacheUrls(shellRoutes);
  } catch {}
}


