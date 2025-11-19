/*
  Elora - Offline SLM Services Index
  Central export point for all offline AI services
*/

// Import services for internal use
import WhisperService from './WhisperService';
import EnhancedTTS from './EnhancedTTS';
import OnlineTTS from './OnlineTTS';
import LocalLLM from './LocalLLM';
import TransformersService from './TransformersService';
import SLMInference from './SLMInference';
import SLMEvaluator from './SLMEvaluator';
import PronunciationScorer from './PronunciationScorer';
import AdvancedPronunciationScorer from './AdvancedPronunciationScorer';
import ModelManager from './ModelManager';
import PerformanceBenchmark from './PerformanceBenchmark';

// Speech Services
export { WhisperService, type WhisperConfig, type WhisperResult } from './WhisperService';
export { EnhancedTTS, type Voice, type TTSOptions } from './EnhancedTTS';
export { OnlineTTS, type VoiceProfile, type PlaybackOptions } from './OnlineTTS';
export { SpeechService } from './SpeechService';

// Language Model Services
export { LocalLLM, type LocalLLMInput } from './LocalLLM';
export { 
  TransformersService, 
  type GrammarCorrectionResult, 
  type TextGenerationOptions,
  type SentimentResult,
  type ConversationContext
} from './TransformersService';
export { 
  SLMInference,
  type SLMConfig,
  type InferenceOptions,
  type ConversationMessage,
  type FeedbackRequest,
  type FeedbackResponse
} from './SLMInference';
export { 
  SLMEvaluator,
  type EvaluationScores,
  type EvaluateOptions
} from './SLMEvaluator';

// Pronunciation Services
export { 
  PronunciationScorer,
  type PronunciationScore,
  type PhonemeMap
} from './PronunciationScorer';
export { 
  AdvancedPronunciationScorer,
  type DetailedPronunciationScore,
  type PhonemeAlignment,
  type WordAlignment,
  type AcousticFeatures
} from './AdvancedPronunciationScorer';

// Model Management
export { 
  ModelManager,
  type ModelInfo,
  type DownloadProgress
} from './ModelManager';

// Performance Monitoring
export { 
  PerformanceBenchmark,
  type BenchmarkResult,
  type PerformanceReport,
  type SystemMetrics
} from './PerformanceBenchmark';

// Hybrid Services (Offline + Online)
export { 
  HybridServiceManager,
  type HybridConfig,
  type OperationMode
} from './HybridServiceManager';

// API Service (Online)
export { default as API } from './ApiService';

// Other Services
export { ConversationAI } from './ConversationAI';
export { VocabularyBuilder } from './VocabularyBuilder';
export { ProgressTracker } from './ProgressTracker';
export { AchievementSystem } from './AchievementSystem';

// Import types
import type { DownloadProgress } from './ModelManager';
import HybridServiceManager from './HybridServiceManager';

// Utility function for quick setup
export async function initializeOfflineServices(
  userLevel: 'kids' | 'beginner' | 'intermediate' | 'advanced' = 'beginner'
): Promise<void> {
  try {
    console.log('🐝 Initializing Elora offline services...');

    // Download recommended models
    console.log('📦 Downloading models...');
    await ModelManager.preloadRecommendedModels(userLevel, (progress: DownloadProgress) => {
      if (progress.percentage % 10 === 0) { // Log every 10%
        console.log(`  ${progress.modelId}: ${progress.percentage.toFixed(0)}%`);
      }
    });

    // Initialize STT
    console.log('🎤 Initializing speech recognition...');
    await WhisperService.initialize();

    // Initialize LLM
    console.log('🤖 Initializing language model...');
    const modelId = userLevel === 'kids' || userLevel === 'beginner' 
      ? 'distilgpt2' 
      : 'gpt2';
    await TransformersService.initialize(`Xenova/${modelId}`);

    // Initialize SLM Inference
    await SLMInference.initialize({ modelId });

    console.log('✅ All services initialized successfully!');
    console.log('🎉 Ready for offline learning!');
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    console.log('⚠️ Falling back to basic services (Web Speech API)');
  }
}

// Import ModelInfo type
import type { ModelInfo } from './ModelManager';

// Quick check if offline services are ready
export async function checkOfflineStatus(): Promise<{
  stt: boolean;
  tts: boolean;
  llm: boolean;
  pronunciation: boolean;
  modelsDownloaded: number;
  totalModels: number;
}> {
  const models = await ModelManager.getAvailableModels();
  const cachedModels = models.filter((m: ModelInfo) => m.cached);

  return {
    stt: await WhisperService.isModelAvailable(),
    tts: EnhancedTTS.isSupported(),
    llm: TransformersService.isReady(),
    pronunciation: true, // Always available (heuristic-based)
    modelsDownloaded: cachedModels.length,
    totalModels: models.length
  };
}

// Get recommended configuration for device
export async function getRecommendedConfig(): Promise<{
  sttModel: string;
  llmModel: string;
  ttsSystem: 'web-speech';
  threads: number;
  contextSize: number;
}> {
  const metrics = await PerformanceBenchmark.getSystemMetrics();

  // Low-end device
  if (
    metrics.deviceType === 'mobile' || 
    metrics.availableMemory < 2 * 1024 * 1024 * 1024
  ) {
    return {
      sttModel: 'whisper-tiny-en',
      llmModel: 'distilgpt2',
      ttsSystem: 'web-speech',
      threads: 2,
      contextSize: 1024
    };
  }

  // High-end device
  if (
    metrics.deviceType === 'desktop' &&
    metrics.availableMemory > 6 * 1024 * 1024 * 1024
  ) {
    return {
      sttModel: 'whisper-base-en',
      llmModel: 'gpt2',
      ttsSystem: 'web-speech',
      threads: metrics.cpuCores || 4,
      contextSize: 4096
    };
  }

  // Mid-range device (default)
  return {
    sttModel: 'whisper-tiny-en',
    llmModel: 'distilgpt2',
    ttsSystem: 'web-speech',
    threads: 4,
    contextSize: 2048
  };
}

// Export default for convenience
export default {
  // Services
  WhisperService,
  EnhancedTTS,
  OnlineTTS,
  LocalLLM,
  TransformersService,
  SLMInference,
  SLMEvaluator,
  PronunciationScorer,
  AdvancedPronunciationScorer,
  ModelManager,
  PerformanceBenchmark,
  HybridServiceManager,
  
  // Utilities
  initializeOfflineServices,
  checkOfflineStatus,
  getRecommendedConfig
};

