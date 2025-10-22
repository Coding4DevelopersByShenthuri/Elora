/*
  SLMInference: Small Language Model inference engine
  Supports GGUF/GGML quantized models via llama.cpp WASM
  Provides conversation, feedback generation, and grammar checking
  Optimized for <1GB models running on CPU
*/

import { ModelManager } from './ModelManager';

export interface SLMConfig {
  modelId?: string;
  contextSize?: number; // Max context window (tokens)
  temperature?: number;
  topK?: number;
  topP?: number;
  repeatPenalty?: number;
  threads?: number; // CPU threads to use
}

export interface InferenceOptions {
  maxTokens?: number;
  temperature?: number;
  stopSequences?: string[];
  stream?: boolean;
}

export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface FeedbackRequest {
  userText: string;
  expectedText?: string;
  exerciseType: 'conversation' | 'pronunciation' | 'grammar' | 'vocabulary';
  userLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface FeedbackResponse {
  feedback: string;
  score: number;
  suggestions: string[];
  corrections?: Array<{
    original: string;
    suggested: string;
    reason: string;
  }>;
}

class SLMInferenceClass {
  private worker: Worker | null = null;
  private isInitialized = false;
  private currentModelId: string | null = null;
  private config: SLMConfig = {
    contextSize: 2048,
    temperature: 0.7,
    topK: 40,
    topP: 0.9,
    repeatPenalty: 1.1,
    threads: navigator.hardwareConcurrency || 4
  };

  /**
   * Initialize SLM inference engine
   */
  async initialize(config: SLMConfig = {}): Promise<void> {
    if (this.isInitialized && this.currentModelId === config.modelId) {
      return;
    }

    this.config = { ...this.config, ...config };

    try {
      // Determine which model to use
      const modelId = config.modelId || 'distilgpt2';
      
      // Check if model is cached
      const isCached = await ModelManager.isModelCached(modelId);
      if (!isCached) {
        console.log(`Model ${modelId} not cached, downloading...`);
        await ModelManager.downloadModel(modelId, (progress) => {
          console.log(`Download progress: ${progress.percentage.toFixed(1)}%`);
        });
      }

      // Load model data
      const modelData = await ModelManager.getModelData(modelId);
      if (!modelData) {
        throw new Error(`Failed to load model ${modelId}`);
      }

      // Create worker for inference
      this.worker = new Worker(
        new URL('./workers/slm.worker.ts', import.meta.url),
        { type: 'module' }
      );

      // Initialize model in worker
      await this.sendWorkerMessage({
        type: 'init',
        modelData,
        config: this.config
      });

      this.currentModelId = modelId;
      this.isInitialized = true;
      console.log(`✅ SLM ${modelId} initialized successfully`);
    } catch (error) {
      console.error('Failed to initialize SLM:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  /**
   * Generate text completion
   */
  async complete(
    prompt: string,
    options: InferenceOptions = {}
  ): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const result = await this.sendWorkerMessage({
        type: 'complete',
        prompt,
        maxTokens: options.maxTokens || 100,
        temperature: options.temperature ?? this.config.temperature,
        topK: this.config.topK,
        topP: this.config.topP,
        repeatPenalty: this.config.repeatPenalty,
        stopSequences: options.stopSequences || []
      });

      return result.text || '';
    } catch (error) {
      console.error('Text completion failed:', error);
      throw error;
    }
  }

  /**
   * Generate conversational response
   */
  async chat(
    messages: ConversationMessage[],
    options: InferenceOptions = {}
  ): Promise<string> {
    // Format messages into a prompt
    const prompt = this.formatChatPrompt(messages);
    
    // Generate response
    const response = await this.complete(prompt, {
      ...options,
      stopSequences: ['User:', 'Student:', '\n\n', ...(options.stopSequences || [])]
    });

    // Clean up response
    return response.trim().split('\n')[0];
  }

  /**
   * Generate pedagogical feedback for English learning
   */
  async generateFeedback(request: FeedbackRequest): Promise<FeedbackResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const prompt = this.buildFeedbackPrompt(request);

    try {
      const feedbackText = await this.complete(prompt, {
        maxTokens: 150,
        temperature: 0.7,
        stopSequences: ['\n\n', 'User:', 'Student:']
      });

      return this.parseFeedback(feedbackText, request);
    } catch (error) {
      console.error('Feedback generation failed:', error);
      // Fallback to rule-based feedback
      return this.generateRuleBasedFeedback(request);
    }
  }

  /**
   * Format chat messages into a prompt
   */
  private formatChatPrompt(messages: ConversationMessage[]): string {
    let prompt = '';

    for (const msg of messages) {
      if (msg.role === 'system') {
        prompt += `System: ${msg.content}\n\n`;
      } else if (msg.role === 'user') {
        prompt += `Student: ${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        prompt += `Teacher: ${msg.content}\n`;
      }
    }

    prompt += 'Teacher:';
    return prompt;
  }

  /**
   * Build feedback prompt based on request
   */
  private buildFeedbackPrompt(request: FeedbackRequest): string {
    const { userText, expectedText, exerciseType, userLevel } = request;

    const levelDescriptions = {
      beginner: 'a beginner student',
      intermediate: 'an intermediate student',
      advanced: 'an advanced student'
    };

    let prompt = `You are an English teacher providing feedback to ${levelDescriptions[userLevel]}.\n\n`;

    switch (exerciseType) {
      case 'conversation':
        prompt += `The student said: "${userText}"\n\n`;
        prompt += 'Provide encouraging feedback on their conversation skills. Mention what they did well and give one simple suggestion for improvement.\n\nFeedback:';
        break;

      case 'pronunciation':
        prompt += `The student tried to say: "${expectedText}"\n`;
        prompt += `They said: "${userText}"\n\n`;
        prompt += 'Give feedback on their pronunciation accuracy and clarity.\n\nFeedback:';
        break;

      case 'grammar':
        prompt += `The student wrote: "${userText}"\n\n`;
        prompt += 'Check for grammar errors and provide corrections with explanations.\n\nFeedback:';
        break;

      case 'vocabulary':
        if (expectedText) {
          prompt += `Expected vocabulary: "${expectedText}"\n`;
        }
        prompt += `Student's response: "${userText}"\n\n`;
        prompt += 'Evaluate vocabulary usage and suggest improvements.\n\nFeedback:';
        break;
    }

    return prompt;
  }

  /**
   * Parse generated feedback into structured response
   */
  private parseFeedback(feedbackText: string, _request: FeedbackRequest): FeedbackResponse {
    const lines = feedbackText.trim().split('\n').filter(l => l.trim());
    
    // Extract score if present
    let score = 70; // Default
    const scoreMatch = feedbackText.match(/score[:\s]+(\d+)/i);
    if (scoreMatch) {
      score = parseInt(scoreMatch[1]);
    }

    // Extract suggestions
    const suggestions: string[] = [];
    lines.forEach(line => {
      if (line.match(/suggest|try|could|should|recommend/i)) {
        suggestions.push(line.trim());
      }
    });

    return {
      feedback: lines[0] || feedbackText,
      score: Math.min(100, Math.max(0, score)),
      suggestions: suggestions.slice(0, 3),
      corrections: []
    };
  }

  /**
   * Generate rule-based feedback as fallback
   */
  private generateRuleBasedFeedback(request: FeedbackRequest): FeedbackResponse {
    const { userText, expectedText, exerciseType } = request;
    const wordCount = userText.trim().split(/\s+/).length;

    let feedback = '';
    let score = 70;
    const suggestions: string[] = [];

    switch (exerciseType) {
      case 'conversation':
        if (wordCount < 5) {
          feedback = 'Good start! Try to use a few more words to express your idea.';
          score = 60;
          suggestions.push('Add more details to your response');
        } else if (wordCount < 15) {
          feedback = 'Nice effort! Your response is clear and well-structured.';
          score = 80;
          suggestions.push('Try including an example or reason');
        } else {
          feedback = 'Excellent! You expressed yourself with good detail.';
          score = 90;
          suggestions.push('Keep practicing to maintain fluency');
        }
        break;

      case 'pronunciation':
        if (expectedText) {
          const similarity = this.calculateSimilarity(userText, expectedText);
          score = Math.round(similarity * 100);
          
          if (score >= 80) {
            feedback = 'Great pronunciation! Very clear and accurate.';
          } else if (score >= 60) {
            feedback = 'Good effort. Some words need more practice.';
            suggestions.push('Focus on clear enunciation');
          } else {
            feedback = 'Keep practicing! Try speaking more slowly.';
            suggestions.push('Break words into syllables');
          }
        } else {
          feedback = 'Good effort on pronunciation!';
          score = 75;
        }
        break;

      case 'grammar':
        const hasCapital = /^[A-Z]/.test(userText);
        const hasPunctuation = /[.!?]$/.test(userText);
        
        score = 60;
        if (hasCapital) score += 10;
        if (hasPunctuation) score += 10;
        if (wordCount >= 5) score += 20;

        feedback = `Your grammar is ${score >= 80 ? 'good' : 'okay'}. `;
        if (!hasCapital) suggestions.push('Start sentences with a capital letter');
        if (!hasPunctuation) suggestions.push('End sentences with punctuation');
        break;

      case 'vocabulary':
        if (wordCount >= 10) {
          feedback = 'Good vocabulary range!';
          score = 85;
        } else {
          feedback = 'Try using more varied vocabulary.';
          score = 70;
          suggestions.push('Use descriptive words');
        }
        break;
    }

    return {
      feedback,
      score,
      suggestions,
      corrections: []
    };
  }

  /**
   * Calculate text similarity (simple Levenshtein-based)
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const s1 = text1.toLowerCase().trim();
    const s2 = text2.toLowerCase().trim();

    if (s1 === s2) return 1.0;

    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Levenshtein distance algorithm
   */
  private levenshteinDistance(s1: string, s2: string): number {
    const costs: number[] = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  /**
   * Send message to worker and wait for response
   */
  private sendWorkerMessage(message: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not initialized'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Worker timeout'));
      }, 60000); // 60 second timeout

      const messageHandler = (e: MessageEvent) => {
        clearTimeout(timeout);
        this.worker?.removeEventListener('message', messageHandler);
        
        if (e.data.error) {
          reject(new Error(e.data.error));
        } else {
          resolve(e.data);
        }
      };

      this.worker.addEventListener('message', messageHandler);
      this.worker.postMessage(message);
    });
  }

  /**
   * Check if initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get current model ID
   */
  getCurrentModel(): string | null {
    return this.currentModelId;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.isInitialized = false;
    this.currentModelId = null;
  }
}

// Singleton instance
export const SLMInference = new SLMInferenceClass();
export default SLMInference;

