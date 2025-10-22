/*
  TransformersService: Offline AI using Transformers.js
  Provides grammar correction, text generation, and semantic analysis
  Models run entirely in the browser using ONNX Runtime
  Supports DistilGPT-2, GPT-2, and BERT models for various tasks
*/

export interface GrammarCorrectionResult {
  correctedText: string;
  corrections: Array<{
    original: string;
    corrected: string;
    type: 'grammar' | 'spelling' | 'style';
    position: number;
  }>;
  confidence: number;
}

export interface TextGenerationOptions {
  maxLength?: number;
  temperature?: number;
  topK?: number;
  topP?: number;
  repetitionPenalty?: number;
  prompt?: string;
}

export interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
}

export interface ConversationContext {
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  topic?: string;
  previousMessages?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

class TransformersServiceClass {
  private textGenPipeline: any = null;
  private grammarPipeline: any = null;
  private modelLoaded = false;
  private loadingPromise: Promise<void> | null = null;
  private currentModel: string = 'Xenova/distilgpt2';

  /**
   * Initialize Transformers.js with specified model
   */
  async initialize(modelName: string = 'Xenova/distilgpt2'): Promise<void> {
    if (this.modelLoaded && this.currentModel === modelName) return;
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = this._loadModel(modelName);
    return this.loadingPromise;
  }

  private async _loadModel(modelName: string): Promise<void> {
    try {
      console.log(`Loading Transformers model: ${modelName}...`);
      
      // Check if Transformers.js is available
      if (typeof window !== 'undefined') {
        try {
          // CRITICAL: Configure ONNX Runtime FIRST before importing transformers
          // This prevents the "Cannot read properties of undefined (reading 'registerBackend')" error
          try {
            const ort = await import('onnxruntime-web');
            
            // Wait for module to fully load
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Ensure ONNX Runtime environment is properly initialized
            if (!ort || !ort.env) {
              throw new Error('ONNX Runtime module not properly loaded');
            }
            
            // Configure ONNX Runtime to use WASM backend only (most compatible)
            // Only set numThreads if the WASM environment exists (wasm is readonly)
            if (ort.env.wasm) {
              ort.env.wasm.numThreads = 1;
            }
            ort.env.wasm.simd = true;
            ort.env.wasm.proxy = false;
            
            // Set WASM file paths - use relative paths for local files
            // The WASM files are bundled with the app in dist folder
            ort.env.wasm.wasmPaths = '/';
            
            console.log('✅ ONNX Runtime configured successfully');
          } catch (ortError) {
            console.warn('⚠️ ONNX Runtime configuration failed:', ortError);
            // Don't continue if ONNX Runtime fails - transformers needs it
            throw new Error('ONNX Runtime initialization failed');
          }
          
          // NOW import and configure Transformers.js
          const transformers = await import('@xenova/transformers');
          
          if (!transformers || !transformers.pipeline) {
            throw new Error('Transformers.js module loaded but pipeline not available');
          }
          
          // Configure to use local models when available
          transformers.env.allowLocalModels = true;
          transformers.env.allowRemoteModels = true;
          transformers.env.useBrowserCache = true;
          
          // Use WASM backend only - ensure backends object exists
          if (!transformers.env.backends) {
            transformers.env.backends = { onnx: { wasm: {} } } as any;
          }
          if (!transformers.env.backends.onnx) {
            transformers.env.backends.onnx = { wasm: {} } as any;
          }
          if (!transformers.env.backends.onnx.wasm) {
            transformers.env.backends.onnx.wasm = {} as any;
          }
          transformers.env.backends.onnx.wasm.numThreads = 1;
          
          // Load text generation pipeline
          console.log('Loading text generation pipeline...');
          this.textGenPipeline = await transformers.pipeline('text-generation', modelName, {
            quantized: true, // Use quantized models for better performance
          });
          
          // Load grammar checking pipeline (optional)
          try {
            console.log('Loading grammar pipeline...');
            this.grammarPipeline = await transformers.pipeline(
              'text2text-generation',
              'Xenova/flan-t5-small',
              { 
                quantized: true
              }
            );
          } catch (grammarError) {
            console.warn('Grammar pipeline not available, using rule-based fallback');
          }
          
          this.currentModel = modelName;
          this.modelLoaded = true;
          console.log('✅ Transformers model loaded successfully');
        } catch (importError) {
          console.warn('⚠️ Transformers.js not available, using fallback mode');
          console.warn('Error details:', importError);
          // Set flag to use fallback methods
          this.modelLoaded = false;
        }
      }
    } catch (error) {
      console.error('❌ Failed to load Transformers model:', error);
      this.modelLoaded = false;
      // Don't throw - fallback to rule-based methods
    } finally {
      this.loadingPromise = null;
    }
  }

  /**
   * Correct grammar and spelling in text
   */
  async correctGrammar(text: string): Promise<GrammarCorrectionResult> {
    try {
      if (this.grammarPipeline) {
        // Use AI model for grammar correction
        const prompt = `Correct the grammar and spelling in this sentence: ${text}`;
        const result = await this.grammarPipeline(prompt, {
          max_length: 256,
          temperature: 0.3, // Low temperature for more consistent corrections
        });

        const correctedText = result[0]?.generated_text || text;
        
        // Detect differences
        const corrections = this.detectDifferences(text, correctedText);

        return {
          correctedText,
          corrections,
          confidence: 0.90
        };
      } else {
        // Fallback to rule-based corrections
        const corrections = this.detectSimpleErrors(text);
        let correctedText = text;

        corrections.forEach(correction => {
          correctedText = correctedText.replace(
            correction.original,
            correction.corrected
          );
        });

        return {
          correctedText,
          corrections,
          confidence: 0.75
        };
      }
    } catch (error) {
      console.error('Grammar correction failed:', error);
      // Return original text with rule-based corrections as fallback
      const corrections = this.detectSimpleErrors(text);
      let correctedText = text;
      corrections.forEach(correction => {
        correctedText = correctedText.replace(correction.original, correction.corrected);
      });
      return { correctedText, corrections, confidence: 0.60 };
    }
  }

  /**
   * Generate text continuation with context awareness
   */
  async generateText(
    prompt: string,
    options: TextGenerationOptions = {}
  ): Promise<string> {
    try {
      if (this.textGenPipeline) {
        // Use actual Transformers.js pipeline
        const result = await this.textGenPipeline(prompt, {
          max_new_tokens: options.maxLength || 50,
          temperature: options.temperature || 0.7,
          top_k: options.topK || 50,
          top_p: options.topP || 0.95,
          repetition_penalty: options.repetitionPenalty || 1.2,
          do_sample: true,
        });

        return result[0]?.generated_text || prompt;
      } else {
        // Fallback to template-based generation
        return this.generateFallbackResponse(prompt);
      }
    } catch (error) {
      console.error('Text generation failed:', error);
      return this.generateFallbackResponse(prompt);
    }
  }

  /**
   * Generate conversational response for English learning
   */
  async generateConversationResponse(
    userMessage: string,
    context: ConversationContext
  ): Promise<string> {
    // Build context-aware prompt
    const systemPrompt = this.buildSystemPrompt(context);
    const fullPrompt = `${systemPrompt}\n\nStudent: ${userMessage}\nTeacher:`;

    try {
      const response = await this.generateText(fullPrompt, {
        maxLength: 80,
        temperature: 0.8,
        topK: 40,
        repetitionPenalty: 1.3
      });

      // Extract only the teacher's response
      const teacherResponse = response
        .split('Teacher:')[1]
        ?.split('\n')[0]
        ?.trim() || response;

      return teacherResponse;
    } catch (error) {
      console.error('Conversation generation failed:', error);
      return this.generateFallbackConversation(userMessage, context);
    }
  }

  /**
   * Build system prompt based on user level and context
   */
  private buildSystemPrompt(context: ConversationContext): string {
    const levelPrompts = {
      beginner: 'You are a patient English teacher helping a beginner student. Use simple words and short sentences.',
      intermediate: 'You are an encouraging English teacher helping an intermediate student. Use clear language with moderate complexity.',
      advanced: 'You are an experienced English teacher helping an advanced student. Use sophisticated vocabulary and varied sentence structures.'
    };

    let prompt = levelPrompts[context.userLevel];
    
    if (context.topic) {
      prompt += ` The topic is: ${context.topic}.`;
    }

    if (context.previousMessages && context.previousMessages.length > 0) {
      const history = context.previousMessages
        .slice(-3) // Last 3 messages for context
        .map(m => `${m.role === 'user' ? 'Student' : 'Teacher'}: ${m.content}`)
        .join('\n');
      prompt += `\n\nConversation history:\n${history}`;
    }

    return prompt;
  }

  /**
   * Analyze sentiment of text
   */
  async analyzeSentiment(text: string): Promise<SentimentResult> {
    // Simple rule-based sentiment for now
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'love', 'happy'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'sad', 'poor', 'wrong'];

    const lowerText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;

    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveCount++;
    });

    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeCount++;
    });

    if (positiveCount > negativeCount) {
      return { sentiment: 'positive', score: 0.7 };
    } else if (negativeCount > positiveCount) {
      return { sentiment: 'negative', score: 0.7 };
    } else {
      return { sentiment: 'neutral', score: 0.5 };
    }
  }

  /**
   * Get vocabulary suggestions for simpler words
   */
  async getVocabularySuggestions(word: string): Promise<string[]> {
    // Simple synonym dictionary
    const synonyms: Record<string, string[]> = {
      'good': ['excellent', 'great', 'wonderful', 'fine', 'nice'],
      'bad': ['poor', 'terrible', 'awful', 'unpleasant'],
      'big': ['large', 'huge', 'enormous', 'gigantic'],
      'small': ['tiny', 'little', 'miniature', 'petite'],
      'happy': ['joyful', 'cheerful', 'delighted', 'pleased'],
      'sad': ['unhappy', 'sorrowful', 'melancholy', 'gloomy']
    };

    return synonyms[word.toLowerCase()] || [];
  }

  /**
   * Detect differences between original and corrected text
   */
  private detectDifferences(original: string, corrected: string): Array<{
    original: string;
    corrected: string;
    type: 'grammar' | 'spelling' | 'style';
    position: number;
  }> {
    const corrections: any[] = [];
    const originalWords = original.split(/\s+/);
    const correctedWords = corrected.split(/\s+/);

    let position = 0;
    for (let i = 0; i < Math.max(originalWords.length, correctedWords.length); i++) {
      const origWord = originalWords[i] || '';
      const corrWord = correctedWords[i] || '';

      if (origWord !== corrWord && origWord && corrWord) {
        corrections.push({
          original: origWord,
          corrected: corrWord,
          type: 'grammar',
          position
        });
      }

      position += origWord.length + 1;
    }

    return corrections;
  }

  /**
   * Detect simple grammar errors (rule-based)
   */
  private detectSimpleErrors(text: string): Array<{
    original: string;
    corrected: string;
    type: 'grammar' | 'spelling' | 'style';
    position: number;
  }> {
    const corrections: any[] = [];

    // Common errors
    const rules = [
      { pattern: /\bi\b/g, replacement: 'I', type: 'grammar' as const },
      { pattern: /\bdont\b/gi, replacement: "don't", type: 'spelling' as const },
      { pattern: /\bcant\b/gi, replacement: "can't", type: 'spelling' as const },
      { pattern: /\bwont\b/gi, replacement: "won't", type: 'spelling' as const },
      { pattern: /\bim\b/gi, replacement: "I'm", type: 'spelling' as const },
      { pattern: /\bdidnt\b/gi, replacement: "didn't", type: 'spelling' as const },
      { pattern: /\bwouldnt\b/gi, replacement: "wouldn't", type: 'spelling' as const },
      { pattern: /\bcouldnt\b/gi, replacement: "couldn't", type: 'spelling' as const },
      { pattern: /\bshouldnt\b/gi, replacement: "shouldn't", type: 'spelling' as const },
      { pattern: /\s{2,}/g, replacement: ' ', type: 'style' as const }
    ];

    rules.forEach(rule => {
      let match;
      const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
      while ((match = regex.exec(text)) !== null) {
        corrections.push({
          original: match[0],
          corrected: rule.replacement,
          type: rule.type,
          position: match.index
        });
      }
    });

    return corrections;
  }

  /**
   * Generate fallback response when AI model unavailable
   */
  private generateFallbackResponse(_prompt: string): string {
    const templates = [
      "That's interesting. Can you tell me more about that?",
      "I see. What else would you like to discuss?",
      "Great point! Can you expand on that idea?",
      "That makes sense. How do you feel about it?",
      "Interesting perspective. What led you to think that way?"
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Generate fallback conversation response
   */
  private generateFallbackConversation(
    _userMessage: string,
    context: ConversationContext
  ): string {
    const { userLevel } = context;

    const responses: Record<typeof userLevel, string[]> = {
      beginner: [
        "Good job! Can you say more?",
        "That's nice. What else?",
        "I see. Tell me more.",
        "Very good. Keep going!"
      ],
      intermediate: [
        "That's a good point. Can you elaborate?",
        "Interesting. What do you think about it?",
        "I understand. Could you give an example?",
        "Great! How would you explain that to someone else?"
      ],
      advanced: [
        "Excellent observation. What implications does that have?",
        "Fascinating perspective. How would you defend that position?",
        "Thought-provoking. What alternative viewpoints exist?",
        "Compelling argument. Could you explore the counterpoint?"
      ]
    };

    const options = responses[userLevel];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Check if model is loaded
   */
  isReady(): boolean {
    return this.modelLoaded;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.textGenPipeline = null;
    this.grammarPipeline = null;
    this.modelLoaded = false;
    this.loadingPromise = null;
  }
}

// Singleton instance
export const TransformersService = new TransformersServiceClass();
export default TransformersService;

