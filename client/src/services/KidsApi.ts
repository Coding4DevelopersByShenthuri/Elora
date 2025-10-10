export class KidsApi {
  static baseUrl = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

  static async getLessons() {
    const res = await fetch(`${this.baseUrl}/api/kids/lessons`);
    if (!res.ok) throw new Error('Failed to load lessons');
    return res.json();
  }

  static async getProgress(token: string) {
    const res = await fetch(`${this.baseUrl}/api/kids/progress`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to load progress');
    return res.json();
  }

  static async updateProgress(token: string, payload: any) {
    const res = await fetch(`${this.baseUrl}/api/kids/progress/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update progress');
    return res.json();
  }
}

export default KidsApi;


