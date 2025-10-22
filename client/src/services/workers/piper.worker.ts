/*
  Piper Worker: Handles Piper TTS inference in a Web Worker
  Uses ONNX Runtime Web for neural TTS inference
  Processes text and generates high-quality speech offline
*/

// @ts-ignore - ONNX Runtime imports
let piperSession: any = null;
let voiceConfig: any = null;

interface WorkerMessage {
  type: 'load' | 'synthesize' | 'unload';
  voiceData?: Uint8Array;
  voiceConfig?: any;
  text?: string;
  options?: {
    speakingRate?: number;
    lengthScale?: number;
    noiseScale?: number;
    noiseW?: number;
    sentenceSilence?: number;
  };
}

/**
 * Load Piper voice model
 */
async function loadVoice(modelData: Uint8Array, config: any): Promise<void> {
  try {
    console.log('Loading Piper voice in worker...');

    // Check if ONNX Runtime is available
    try {
      const ort = await import('onnxruntime-web');
      
      // Create inference session from model data
      piperSession = await ort.InferenceSession.create(modelData, {
        executionProviders: ['wasm'], // Use WebAssembly backend
        graphOptimizationLevel: 'all',
      });

      voiceConfig = config;
      console.log('✅ Piper voice loaded successfully');
    } catch (ortError) {
      console.error('ONNX Runtime not available:', ortError);
      throw new Error('ONNX Runtime required for Piper TTS');
    }
  } catch (error) {
    console.error('Failed to load voice:', error);
    throw error;
  }
}

/**
 * Synthesize speech from text
 */
async function synthesize(
  text: string,
  options: {
    speakingRate?: number;
    lengthScale?: number;
    noiseScale?: number;
    noiseW?: number;
    sentenceSilence?: number;
  }
): Promise<Float32Array> {
  if (!piperSession || !voiceConfig) {
    throw new Error('Voice not loaded');
  }

  try {
    // Preprocess text
    const processedText = preprocessText(text);

    // Convert text to phonemes (simplified - in production use phonemizer)
    const phonemes = textToPhonemes(processedText);

    // Convert phonemes to input IDs
    const inputIds = phonemesToIds(phonemes, voiceConfig);

    // Prepare input tensors
    const ort = await import('onnxruntime-web');
    
    const inputTensor = new ort.Tensor('int64', BigInt64Array.from(inputIds.map(BigInt)), [1, inputIds.length]);
    
    const inputLengths = new ort.Tensor('int64', BigInt64Array.from([BigInt(inputIds.length)]), [1]);
    
    const scales = new ort.Tensor('float32', new Float32Array([
      options.noiseScale || 0.667,
      options.lengthScale || 1.0,
      options.noiseW || 0.8
    ]), [3]);

    // Run inference
    const feeds: Record<string, any> = {
      'input': inputTensor,
      'input_lengths': inputLengths,
      'scales': scales
    };

    const results = await piperSession.run(feeds);

    // Extract audio from output
    const audioTensor = results.output || results.audio;
    const audioData = audioTensor.data as Float32Array;

    // Apply speaking rate adjustment
    if (options.speakingRate && options.speakingRate !== 1.0) {
      return adjustSpeakingRate(audioData, options.speakingRate);
    }

    return audioData;
  } catch (error) {
    console.error('Synthesis failed:', error);
    throw error;
  }
}

/**
 * Preprocess text for TTS
 */
function preprocessText(text: string): string {
  // Normalize whitespace
  let processed = text.trim().replace(/\s+/g, ' ');

  // Expand common abbreviations
  processed = processed
    .replace(/\bMr\./gi, 'Mister')
    .replace(/\bMrs\./gi, 'Missus')
    .replace(/\bDr\./gi, 'Doctor')
    .replace(/\bSt\./gi, 'Saint')
    .replace(/\bAve\./gi, 'Avenue')
    .replace(/\betc\./gi, 'etcetera');

  // Add punctuation if missing
  if (!/[.!?]$/.test(processed)) {
    processed += '.';
  }

  return processed;
}

/**
 * Convert text to phonemes (simplified)
 * In production, use a proper phonemizer library
 */
function textToPhonemes(text: string): string[] {
  // This is a placeholder - real implementation would use:
  // - espeak-ng phonemizer
  // - Or a trained G2P (grapheme-to-phoneme) model
  
  const words = text.toLowerCase().split(/\s+/);
  const phonemes: string[] = [];

  // Simple letter-to-phoneme mapping (very basic)
  for (const word of words) {
    for (const char of word) {
      if (/[a-z]/.test(char)) {
        phonemes.push(char);
      }
    }
    phonemes.push('_'); // Word boundary
  }

  return phonemes;
}

/**
 * Convert phonemes to input IDs
 */
function phonemesToIds(phonemes: string[], config: any): number[] {
  // Map phonemes to model vocabulary IDs
  // This would use the voice config's phoneme-to-ID mapping
  
  const phonemeMap: Record<string, number> = config.phonemeMap || {
    '_': 0,  // Pad/silence
    'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5,
    'f': 6, 'g': 7, 'h': 8, 'i': 9, 'j': 10,
    'k': 11, 'l': 12, 'm': 13, 'n': 14, 'o': 15,
    'p': 16, 'q': 17, 'r': 18, 's': 19, 't': 20,
    'u': 21, 'v': 22, 'w': 23, 'x': 24, 'y': 25, 'z': 26
  };

  return phonemes.map(p => phonemeMap[p] || 0);
}

/**
 * Adjust speaking rate using simple resampling
 */
function adjustSpeakingRate(audioData: Float32Array, rate: number): Float32Array {
  if (rate === 1.0) return audioData;

  const targetLength = Math.floor(audioData.length / rate);
  const result = new Float32Array(targetLength);

  for (let i = 0; i < targetLength; i++) {
    const srcIndex = i * rate;
    const srcIndexFloor = Math.floor(srcIndex);
    const srcIndexCeil = Math.min(srcIndexFloor + 1, audioData.length - 1);
    const t = srcIndex - srcIndexFloor;

    result[i] = audioData[srcIndexFloor] * (1 - t) + audioData[srcIndexCeil] * t;
  }

  return result;
}

/**
 * Unload voice model
 */
function unloadVoice(): void {
  if (piperSession) {
    // ONNX session cleanup (if available)
    piperSession = null;
  }
  voiceConfig = null;
  console.log('Voice unloaded from worker');
}

// Worker message handler
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, voiceData, voiceConfig: config, text, options } = event.data;

  try {
    switch (type) {
      case 'load':
        if (voiceData && config) {
          await loadVoice(voiceData, config);
          self.postMessage({ success: true, message: 'Voice loaded' });
        } else {
          throw new Error('No voice data provided');
        }
        break;

      case 'synthesize':
        if (text) {
          const audioData = await synthesize(text, options || {});
          self.postMessage({ 
            success: true, 
            audioData: audioData,
            sampleRate: voiceConfig?.sampleRate || 22050
          });
        } else {
          throw new Error('No text provided');
        }
        break;

      case 'unload':
        unloadVoice();
        self.postMessage({ success: true, message: 'Voice unloaded' });
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    self.postMessage({ error: errorMessage });
  }
};

// Handle worker errors
self.onerror = (error) => {
  console.error('Piper worker error:', error);
  const errorMessage = typeof error === 'string' ? error : error instanceof ErrorEvent ? error.message : 'Unknown error';
  self.postMessage({ error: errorMessage });
};

// Export for TypeScript
export {};

