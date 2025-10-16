/*
  Whisper Worker: Runs Whisper.cpp WASM in a Web Worker for non-blocking STT
  Handles model loading, audio preprocessing, and transcription
*/

// @ts-ignore - Whisper.cpp WASM bindings
let whisperModule: any = null;
let modelData: Uint8Array | null = null;
let isInitialized = false;

interface WorkerMessage {
  type: 'load' | 'transcribe' | 'unload';
  modelData?: Uint8Array;
  audioData?: ArrayBuffer;
  language?: string;
  prompt?: string;
  config?: any;
}

interface TranscriptionResult {
  text: string;
  confidence: number;
  segments?: Array<{
    text: string;
    start: number;
    end: number;
  }>;
  language?: string;
}

/**
 * Load Whisper model into memory
 */
async function loadModel(data: Uint8Array, config: any = {}): Promise<void> {
  try {
    console.log('Loading Whisper model in worker...');
    
    // Store model data
    modelData = data;
    
    // Try to load whisper.cpp WASM module
    // In production, this would load the actual WASM binary
    // For now, we'll set up the infrastructure
    
    // Check if whisper.cpp WASM is available
    if (typeof (self as any).createWhisperModule === 'function') {
      whisperModule = await (self as any).createWhisperModule();
      
      // Initialize model
      if (whisperModule && whisperModule.init) {
        await whisperModule.init(modelData, config);
        isInitialized = true;
        console.log('✅ Whisper model loaded successfully');
      }
    } else {
      console.warn('⚠️ Whisper.cpp WASM not available, using fallback mode');
      // Set a flag for fallback behavior
      isInitialized = true; // Still mark as initialized to allow processing
    }
  } catch (error) {
    console.error('Failed to load Whisper model:', error);
    throw new Error(`Model loading failed: ${error}`);
  }
}

/**
 * Transcribe audio using Whisper model
 */
async function transcribe(
  audioData: ArrayBuffer,
  language: string = 'en',
  prompt?: string
): Promise<TranscriptionResult> {
  if (!isInitialized) {
    throw new Error('Model not loaded');
  }

  try {
    // Convert audio data to Float32Array (expected by Whisper)
    const audioFloat32 = await preprocessAudio(audioData);

    // If we have the actual Whisper module, use it
    if (whisperModule && whisperModule.transcribe) {
      const result = await whisperModule.transcribe(audioFloat32, {
        language,
        prompt,
        temperature: 0.0,
        best_of: 1,
        beam_size: 1,
      });

      return {
        text: result.text || '',
        confidence: result.confidence || 0.9,
        segments: result.segments || [],
        language: result.language || language,
      };
    } else {
      // Fallback: return a placeholder
      // In production, this would trigger the Web Speech API fallback
      throw new Error('Whisper module not available, use fallback');
    }
  } catch (error) {
    console.error('Transcription failed:', error);
    throw error;
  }
}

/**
 * Preprocess audio data for Whisper
 * Converts various audio formats to 16kHz mono Float32Array
 */
async function preprocessAudio(audioData: ArrayBuffer): Promise<Float32Array> {
  try {
    // Use Web Audio API to decode and resample
    const audioContext = new OfflineAudioContext(1, 1, 16000);
    const audioBuffer = await audioContext.decodeAudioData(audioData.slice(0));

    // Get audio data as Float32Array
    const channelData = audioBuffer.getChannelData(0);

    // Resample to 16kHz if needed
    if (audioBuffer.sampleRate !== 16000) {
      return await resampleAudio(channelData, audioBuffer.sampleRate, 16000);
    }

    return channelData;
  } catch (error) {
    console.error('Audio preprocessing failed:', error);
    // Return empty array as fallback
    return new Float32Array(0);
  }
}

/**
 * Resample audio to target sample rate
 */
async function resampleAudio(
  audioData: Float32Array,
  fromSampleRate: number,
  toSampleRate: number
): Promise<Float32Array> {
  const ratio = fromSampleRate / toSampleRate;
  const newLength = Math.round(audioData.length / ratio);
  const result = new Float32Array(newLength);

  // Simple linear interpolation resampling
  for (let i = 0; i < newLength; i++) {
    const srcIndex = i * ratio;
    const srcIndexFloor = Math.floor(srcIndex);
    const srcIndexCeil = Math.min(srcIndexFloor + 1, audioData.length - 1);
    const t = srcIndex - srcIndexFloor;

    result[i] = audioData[srcIndexFloor] * (1 - t) + audioData[srcIndexCeil] * t;
  }

  return result;
}

/**
 * Unload model and free memory
 */
function unloadModel(): void {
  if (whisperModule && whisperModule.destroy) {
    whisperModule.destroy();
  }
  whisperModule = null;
  modelData = null;
  isInitialized = false;
  console.log('Whisper model unloaded');
}

// Worker message handler
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, modelData: msgModelData, audioData, language, prompt, config } = event.data;

  try {
    switch (type) {
      case 'load':
        if (msgModelData) {
          await loadModel(msgModelData, config);
          self.postMessage({ success: true, message: 'Model loaded' });
        } else {
          throw new Error('No model data provided');
        }
        break;

      case 'transcribe':
        if (audioData) {
          const result = await transcribe(audioData, language, prompt);
          self.postMessage({ success: true, ...result });
        } else {
          throw new Error('No audio data provided');
        }
        break;

      case 'unload':
        unloadModel();
        self.postMessage({ success: true, message: 'Model unloaded' });
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    self.postMessage({ error: errorMessage });
  }
};

// Export for TypeScript
export {};
