import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Global error handlers to prevent blank pages
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Don't prevent default - let ErrorBoundary handle it
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Check if it's an auth error (401)
  if (event.reason?.response?.status === 401 || event.reason?.status === 401) {
    // Clear auth data and reload
    localStorage.removeItem('speakbee_auth_token');
    localStorage.removeItem('speakbee_current_user');
    sessionStorage.clear();
    // Only reload if we're not already on home page
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
  }
  // Don't prevent default - let components handle it
});

// Prevent blank pages from hanging - ensure app always renders
let renderTimeout: ReturnType<typeof setTimeout> | null = null;
const MAX_RENDER_WAIT = 10000; // 10 seconds

// Monitor if root element is empty after a delay
setTimeout(() => {
  const rootElement = document.getElementById("root");
  if (rootElement && rootElement.children.length === 0) {
    console.warn('Root element is empty after timeout - forcing reload');
    // Clear potentially corrupted state
    localStorage.removeItem('speakbee_auth_token');
    localStorage.removeItem('speakbee_current_user');
    sessionStorage.clear();
    window.location.reload();
  }
}, MAX_RENDER_WAIT);

const rootElement = document.getElementById("root")!;
createRoot(rootElement).render(<App />);

// Ensure initial fade-in happens after mount/paint
window.requestAnimationFrame(() => {
  rootElement.classList.add('loaded');
});
