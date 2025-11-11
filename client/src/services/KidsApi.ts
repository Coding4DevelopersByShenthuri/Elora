class KidsApi {
  static baseUrl = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

  private static ensureOnline() {
    if (!navigator.onLine) {
      throw new Error('An active internet connection is required for kids mode.');
    }
  }

  private static ensureToken(token: string) {
    if (!token) {
      throw new Error('Missing authentication token. Please sign in again.');
    }
  }

  private static createHeaders(token?: string, extra?: Record<string, string>) {
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
      const errorBody = await response.json().catch(() => ({}));
      const detail = (errorBody && (errorBody.message || errorBody.detail)) || fallbackMessage;
      throw new Error(detail);
    }
    return response.json() as Promise<T>;
  }

  static async getLessons() {
    this.ensureOnline();
    const response = await fetch(`${this.baseUrl}/api/kids/lessons`, {
      method: 'GET',
      signal: AbortSignal.timeout(8000),
    });
    return this.handleResponse(response, 'Unable to load kids lessons.');
  }

  static async getProgress(token: string) {
    this.ensureToken(token);
    this.ensureOnline();
    const response = await fetch(`${this.baseUrl}/api/kids/progress`, {
      method: 'GET',
      headers: this.createHeaders(token),
      signal: AbortSignal.timeout(8000),
    });
    return this.handleResponse(response, 'Unable to load progress.');
  }

  static async updateProgress(token: string, payload: Record<string, unknown>) {
    this.ensureToken(token);
    this.ensureOnline();
    const response = await fetch(`${this.baseUrl}/api/kids/progress/update`, {
      method: 'POST',
      headers: this.createHeaders(token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    return this.handleResponse(response, 'Unable to update progress.');
  }

  static async getAchievements(token: string) {
    this.ensureToken(token);
    this.ensureOnline();
    const response = await fetch(`${this.baseUrl}/api/kids/achievements`, {
      method: 'GET',
      headers: this.createHeaders(token),
      signal: AbortSignal.timeout(8000),
    });
    return this.handleResponse(response, 'Unable to load achievements.');
  }

  static async checkAchievements(token: string) {
    this.ensureToken(token);
    this.ensureOnline();
    const response = await fetch(`${this.baseUrl}/api/achievements/check`, {
      method: 'POST',
      headers: this.createHeaders(token, { 'Content-Type': 'application/json' }),
      signal: AbortSignal.timeout(8000),
    });
    return this.handleResponse(response, 'Unable to refresh achievements.');
  }

  static async issueCertificate(
    token: string,
    payload: { cert_id: string; title: string; audience?: 'young' | 'teen'; file_url?: string }
  ) {
    this.ensureToken(token);
    this.ensureOnline();
    const response = await fetch(`${this.baseUrl}/api/kids/certificates/issue`, {
      method: 'POST',
      headers: this.createHeaders(token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    return this.handleResponse(response, 'Unable to issue certificate.');
  }

  static async unlockTrophy(
    token: string,
    payload: { trophy_id: string; title: string; audience?: 'young' | 'teen' }
  ) {
    this.ensureToken(token);
    this.ensureOnline();
    const response = await fetch(`${this.baseUrl}/api/kids/trophies/unlock`, {
      method: 'POST',
      headers: this.createHeaders(token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    return this.handleResponse(response, 'Unable to unlock trophy.');
  }

  static async getIssuedCertificates(token: string) {
    this.ensureToken(token);
    this.ensureOnline();
    const response = await fetch(`${this.baseUrl}/api/kids/certificates/my`, {
      method: 'GET',
      headers: this.createHeaders(token),
      signal: AbortSignal.timeout(8000),
    });
    return this.handleResponse(response, 'Unable to load issued certificates.');
  }
}

export default KidsApi;
