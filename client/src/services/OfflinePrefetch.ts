const DEFAULT_HEALTH_ENDPOINT = `${import.meta.env.VITE_API_HEALTH_URL || ''}`.trim();
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const resolveHealthUrl = () => {
  if (DEFAULT_HEALTH_ENDPOINT) {
    return DEFAULT_HEALTH_ENDPOINT;
  }
  // Fall back to a conventional Django health endpoint (no trailing slash)
  return `${API_BASE_URL.replace(/\/$/, '')}/health`;
};

/**
 * Verify the application is online by checking navigator status and pinging the server.
 */
export async function verifyOnlineOnlyMode(): Promise<void> {
  if (!navigator.onLine) {
    throw new Error('No internet connection detected. Please connect to the internet to continue.');
  }

  const healthUrl = resolveHealthUrl();

  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 7000);
    const response = await fetch(healthUrl, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      signal: controller.signal,
    });
    window.clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}. Online mode requires a healthy backend.`);
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Connection check timed out. Please ensure the backend is reachable.');
    }
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Unable to reach the server. Please verify your internet connection.'
    );
  }
}

