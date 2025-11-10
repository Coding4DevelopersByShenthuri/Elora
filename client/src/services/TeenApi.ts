class TeenApi {
  private static baseUrl = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

  private static ensureOnline() {
    if (!navigator.onLine) {
      throw new Error('An active internet connection is required for teen missions.');
    }
  }

  private static ensureToken(token: string | null) {
    if (!token || token === 'local-token') {
      throw new Error('Missing online session. Please sign in again to sync teen progress.');
    }
  }

  private static createHeaders(token: string | null, extra?: Record<string, string>) {
    const headers: Record<string, string> = {
      ...(extra || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private static async handleResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
    if (!response.ok) {
      let detail = fallbackMessage;
      try {
        const errorBody = await response.json();
        detail = errorBody?.message || errorBody?.detail || fallbackMessage;
      } catch {
        // ignore parse errors
      }
      throw new Error(detail);
    }
    return response.json() as Promise<T>;
  }

  static async getDashboard(token: string | null) {
    this.ensureOnline();
    this.ensureToken(token);
    const response = await fetch(`${this.baseUrl}/api/teen/dashboard`, {
      method: 'GET',
      headers: this.createHeaders(token),
      signal: AbortSignal.timeout(8000),
    });
    return this.handleResponse(response, 'Unable to load teen dashboard.');
  }

  static async startStory(token: string | null, payload: { storyId: string; storyTitle: string; storyType: string }) {
    this.ensureOnline();
    this.ensureToken(token);
    const response = await fetch(`${this.baseUrl}/api/teen/story/start`, {
      method: 'POST',
      headers: this.createHeaders(token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        story_id: payload.storyId,
        story_title: payload.storyTitle,
        story_type: payload.storyType,
      }),
      signal: AbortSignal.timeout(8000),
    });
    return this.handleResponse(response, 'Unable to record story start.');
  }

  static async completeStory(
    token: string | null,
    payload: { storyId: string; storyTitle: string; storyType: string; score: number }
  ) {
    this.ensureOnline();
    this.ensureToken(token);
    const response = await fetch(`${this.baseUrl}/api/teen/story/complete`, {
      method: 'POST',
      headers: this.createHeaders(token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        story_id: payload.storyId,
        story_title: payload.storyTitle,
        story_type: payload.storyType,
        score: payload.score,
      }),
      signal: AbortSignal.timeout(8000),
    });
    return this.handleResponse(response, 'Unable to record story completion.');
  }

  static async recordVocabularyPractice(
    token: string | null,
    payload: { word: string; storyId?: string; storyTitle?: string; score?: number; pointsAwarded?: number }
  ) {
    this.ensureOnline();
    this.ensureToken(token);
    const response = await fetch(`${this.baseUrl}/api/teen/vocabulary/practice`, {
      method: 'POST',
      headers: this.createHeaders(token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        word: payload.word,
        story_id: payload.storyId,
        story_title: payload.storyTitle,
        score: payload.score,
        points_awarded: payload.pointsAwarded,
      }),
      signal: AbortSignal.timeout(8000),
    });
    return this.handleResponse(response, 'Unable to record vocabulary practice.');
  }

  static async recordPronunciationPractice(
    token: string | null,
    payload: { phrase: string; storyId?: string; storyTitle?: string; score?: number; pointsAwarded?: number }
  ) {
    this.ensureOnline();
    this.ensureToken(token);
    const response = await fetch(`${this.baseUrl}/api/teen/pronunciation/practice`, {
      method: 'POST',
      headers: this.createHeaders(token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        phrase: payload.phrase,
        story_id: payload.storyId,
        story_title: payload.storyTitle,
        score: payload.score,
        points_awarded: payload.pointsAwarded,
      }),
      signal: AbortSignal.timeout(8000),
    });
    return this.handleResponse(response, 'Unable to record pronunciation practice.');
  }

  static async toggleFavorite(token: string | null, payload: { storyId: string; add: boolean }) {
    this.ensureOnline();
    this.ensureToken(token);
    const response = await fetch(`${this.baseUrl}/api/teen/favorite/toggle`, {
      method: 'POST',
      headers: this.createHeaders(token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        story_id: payload.storyId,
        add: payload.add,
      }),
      signal: AbortSignal.timeout(8000),
    });
    return this.handleResponse(response, 'Unable to update teen favorites.');
  }

  static async recordQuickAction(
    token: string | null,
    payload: { action?: string; deltaPoints?: number; incrementGames?: boolean }
  ) {
    this.ensureOnline();
    this.ensureToken(token);
    const response = await fetch(`${this.baseUrl}/api/teen/quick-action`, {
      method: 'POST',
      headers: this.createHeaders(token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        action: payload.action,
        delta_points: payload.deltaPoints,
        increment_games: payload.incrementGames,
      }),
      signal: AbortSignal.timeout(8000),
    });
    return this.handleResponse(response, 'Unable to record quick engagement.');
  }
}

export default TeenApi;
