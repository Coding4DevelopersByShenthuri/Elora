interface GeminiGameRequest {
  gameType: 'tongue-twister' | 'word-chain' | 'story-telling' | 'pronunciation-challenge' | 'conversation-practice';
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  userInput?: string;
  context?: {
    age?: number;
    level?: 'beginner' | 'intermediate' | 'advanced';
    interests?: string[];
    completedStories?: string[];
  };
}

interface GeminiResponse {
  content: string;
  gameInstruction?: string;
  questions?: Array<{ question: string; correctAnswer: string; options?: string[] }>;
  feedback?: string;
  points?: number;
  nextStep?: string;
}

class GeminiServiceClass {
  private apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  private initialized = false;

  /**
   * Initialize Gemini service
   * API key is managed server-side, no client-side configuration needed
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.initialized = true;
    console.log('✅ Gemini Service initialized (server-side API key)');
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.initialized && navigator.onLine;
  }

  /**
   * Generate interactive game content
   * Calls server endpoint which handles Gemini API with server-side API key
   */
  async generateGame(request: GeminiGameRequest): Promise<GeminiResponse> {
    if (!this.isReady()) {
      throw new Error('Gemini service not initialized or offline. Please ensure internet connection.');
    }

    try {
      const token = localStorage.getItem('speakbee_auth_token');
      
      // Build headers - include auth token if available, but allow local users too
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Only add Authorization header if we have a real JWT token (not local-token)
      if (token && token !== 'local-token') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.apiUrl}/kids/gemini/game`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          gameType: request.gameType,
          userInput: request.userInput,
          conversationHistory: request.conversationHistory?.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          context: request.context
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Server error: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Server already parses the response, return it directly
      return {
        content: data.content || '',
        gameInstruction: data.gameInstruction,
        questions: data.questions,
        feedback: data.feedback,
        nextStep: data.nextStep,
        points: data.points || 0
      };
    } catch (error: any) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }


  /**
   * Continue conversation/game
   */
  async continueGame(
    gameType: GeminiGameRequest['gameType'],
    userInput: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<GeminiResponse> {
    return this.generateGame({
      gameType,
      userInput,
      conversationHistory
    });
  }

  /**
   * Check if API key is configured (server-side, always available if server is up)
   */
  hasApiKey(): boolean {
    // API key is server-side, so if service is ready, it's available
    return this.isReady();
  }
}

export const GeminiService = new GeminiServiceClass();
export default GeminiService;

