/*
  PerformanceBenchmark: Monitor and benchmark offline AI performance
  Tracks STT, TTS, LLM inference times, memory usage, and accuracy metrics
  Helps optimize model selection and configuration
*/

export interface BenchmarkResult {
  service: 'stt' | 'tts' | 'llm' | 'pronunciation' | 'grammar';
  operation: string;
  latency: number; // milliseconds
  throughput?: number; // tokens/sec or words/sec
  memoryUsed?: number; // bytes
  cpuUsage?: number; // percentage
  accuracy?: number; // 0-100
  timestamp: Date;
  modelId?: string;
  metadata?: Record<string, any>;
}

export interface PerformanceReport {
  averageLatency: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
  totalOperations: number;
  failureRate: number;
  averageThroughput?: number;
  averageMemory?: number;
  recommendations: string[];
}

export interface SystemMetrics {
  totalMemory: number;
  usedMemory: number;
  availableMemory: number;
  cpuCores: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  connectionType: 'offline' | 'slow-2g' | '2g' | '3g' | '4g' | 'wifi';
}

class PerformanceBenchmarkClass {
  private results: BenchmarkResult[] = [];
  private maxResults = 1000; // Keep last 1000 results
  private performanceObserver: PerformanceObserver | null = null;

  constructor() {
    this.initializePerformanceMonitoring();
  }

  /**
   * Initialize browser performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    if (typeof window === 'undefined') return;

    try {
      // Monitor navigation and resource timing
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure') {
            // Custom performance marks we create
            console.log(`Performance: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
          }
        }
      });

      this.performanceObserver.observe({ 
        entryTypes: ['measure', 'navigation', 'resource'] 
      });
    } catch (error) {
      console.warn('Performance monitoring not supported:', error);
    }
  }

  /**
   * Start timing an operation
   */
  startTiming(operationName: string): void {
    if (typeof performance !== 'undefined') {
      performance.mark(`${operationName}-start`);
    }
  }

  /**
   * End timing and record result
   */
  endTiming(
    operationName: string,
    service: BenchmarkResult['service'],
    metadata?: Record<string, any>
  ): number {
    if (typeof performance === 'undefined') return 0;

    try {
      performance.mark(`${operationName}-end`);
      performance.measure(
        operationName,
        `${operationName}-start`,
        `${operationName}-end`
      );

      const measure = performance.getEntriesByName(operationName)[0] as PerformanceMeasure;
      const latency = measure?.duration || 0;

      // Record result
      this.recordResult({
        service,
        operation: operationName,
        latency,
        timestamp: new Date(),
        metadata
      });

      // Cleanup marks
      performance.clearMarks(`${operationName}-start`);
      performance.clearMarks(`${operationName}-end`);
      performance.clearMeasures(operationName);

      return latency;
    } catch (error) {
      console.error('Failed to measure performance:', error);
      return 0;
    }
  }

  /**
   * Record a benchmark result
   */
  recordResult(result: Omit<BenchmarkResult, 'timestamp'> & { timestamp?: Date }): void {
    const fullResult: BenchmarkResult = {
      ...result,
      timestamp: result.timestamp || new Date()
    };

    this.results.push(fullResult);

    // Keep only recent results
    if (this.results.length > this.maxResults) {
      this.results = this.results.slice(-this.maxResults);
    }
  }

  /**
   * Benchmark STT (Speech-to-Text) performance
   */
  async benchmarkSTT(
    audioBlob: Blob,
    expectedTranscript?: string
  ): Promise<BenchmarkResult> {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();

    try {
      // Import and use WhisperService
      const { WhisperService } = await import('./WhisperService');
      
      const result = await WhisperService.transcribe(audioBlob);
      const endTime = performance.now();
      const latency = endTime - startTime;

      // Calculate accuracy if expected transcript provided
      let accuracy: number | undefined;
      if (expectedTranscript) {
        accuracy = this.calculateTranscriptAccuracy(result.transcript, expectedTranscript);
      }

      const benchmarkResult: BenchmarkResult = {
        service: 'stt',
        operation: 'transcribe',
        latency,
        accuracy,
        memoryUsed: this.getMemoryUsage() - startMemory,
        timestamp: new Date(),
        metadata: {
          audioDuration: audioBlob.size / (16000 * 2), // Approximate duration
          confidence: result.confidence
        }
      };

      this.recordResult(benchmarkResult);
      return benchmarkResult;
    } catch (error) {
      console.error('STT benchmark failed:', error);
      throw error;
    }
  }

  /**
   * Benchmark TTS (Text-to-Speech) performance
   */
  async benchmarkTTS(text: string): Promise<BenchmarkResult> {
    const startTime = performance.now();
    const wordCount = text.split(/\s+/).length;

    try {
      const { EnhancedTTS } = await import('./EnhancedTTS');
      
      await EnhancedTTS.speak(text);
      const endTime = performance.now();
      const latency = endTime - startTime;

      const benchmarkResult: BenchmarkResult = {
        service: 'tts',
        operation: 'speak',
        latency,
        throughput: (wordCount / latency) * 1000, // words per second
        timestamp: new Date(),
        metadata: {
          textLength: text.length,
          wordCount
        }
      };

      this.recordResult(benchmarkResult);
      return benchmarkResult;
    } catch (error) {
      console.error('TTS benchmark failed:', error);
      throw error;
    }
  }

  /**
   * Benchmark LLM inference performance
   */
  async benchmarkLLM(
    prompt: string,
    expectedTokens: number = 50
  ): Promise<BenchmarkResult> {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();

    try {
      const { TransformersService } = await import('./TransformersService');
      
      await TransformersService.initialize();
      const result = await TransformersService.generateText(prompt, {
        maxLength: expectedTokens
      });

      const endTime = performance.now();
      const latency = endTime - startTime;
      const generatedTokens = result.split(/\s+/).length;

      const benchmarkResult: BenchmarkResult = {
        service: 'llm',
        operation: 'generate',
        latency,
        throughput: (generatedTokens / latency) * 1000, // tokens per second
        memoryUsed: this.getMemoryUsage() - startMemory,
        timestamp: new Date(),
        metadata: {
          promptLength: prompt.length,
          generatedLength: result.length,
          tokensGenerated: generatedTokens
        }
      };

      this.recordResult(benchmarkResult);
      return benchmarkResult;
    } catch (error) {
      console.error('LLM benchmark failed:', error);
      throw error;
    }
  }

  /**
   * Run comprehensive benchmark suite
   */
  async runFullBenchmark(): Promise<{
    stt?: BenchmarkResult;
    tts?: BenchmarkResult;
    llm?: BenchmarkResult;
    system: SystemMetrics;
  }> {
    console.log('🔍 Running comprehensive performance benchmark...');

    const results: any = {
      system: await this.getSystemMetrics()
    };

    // Benchmark TTS (fastest)
    try {
      results.tts = await this.benchmarkTTS('Hello, this is a test of the text to speech system.');
    } catch (error) {
      console.warn('TTS benchmark skipped:', error);
    }

    // Benchmark LLM
    try {
      results.llm = await this.benchmarkLLM('What is English learning?', 30);
    } catch (error) {
      console.warn('LLM benchmark skipped:', error);
    }

    // Note: STT benchmark requires audio input, skip for now

    console.log('✅ Benchmark complete:', results);
    return results;
  }

  /**
   * Generate performance report for a service
   */
  generateReport(
    service: BenchmarkResult['service'],
    timeRange?: { start: Date; end: Date }
  ): PerformanceReport {
    let filteredResults = this.results.filter(r => r.service === service);

    if (timeRange) {
      filteredResults = filteredResults.filter(
        r => r.timestamp >= timeRange.start && r.timestamp <= timeRange.end
      );
    }

    if (filteredResults.length === 0) {
      return {
        averageLatency: 0,
        p50Latency: 0,
        p95Latency: 0,
        p99Latency: 0,
        totalOperations: 0,
        failureRate: 0,
        recommendations: ['No data available for this service']
      };
    }

    const latencies = filteredResults.map(r => r.latency).sort((a, b) => a - b);
    const throughputs = filteredResults
      .map(r => r.throughput)
      .filter((t): t is number => t !== undefined);
    const memories = filteredResults
      .map(r => r.memoryUsed)
      .filter((m): m is number => m !== undefined);

    const report: PerformanceReport = {
      averageLatency: this.average(latencies),
      p50Latency: this.percentile(latencies, 50),
      p95Latency: this.percentile(latencies, 95),
      p99Latency: this.percentile(latencies, 99),
      totalOperations: filteredResults.length,
      failureRate: 0, // Would need error tracking
      averageThroughput: throughputs.length > 0 ? this.average(throughputs) : undefined,
      averageMemory: memories.length > 0 ? this.average(memories) : undefined,
      recommendations: this.generateRecommendations(service, filteredResults)
    };

    return report;
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(
    service: BenchmarkResult['service'],
    results: BenchmarkResult[]
  ): string[] {
    const recommendations: string[] = [];
    const avgLatency = this.average(results.map(r => r.latency));

    // Service-specific recommendations
    if (service === 'stt') {
      if (avgLatency > 5000) {
        recommendations.push('STT latency is high. Consider using whisper-tiny instead of whisper-base');
      }
      if (avgLatency < 1000) {
        recommendations.push('STT performance is excellent. Current model choice is optimal');
      }
    }

    if (service === 'llm') {
      if (avgLatency > 3000) {
        recommendations.push('LLM inference is slow. Consider using distilgpt2 instead of gpt2');
        recommendations.push('Reduce max_tokens to improve response time');
      }
      const avgThroughput = this.average(
        results.map(r => r.throughput).filter((t): t is number => t !== undefined)
      );
      if (avgThroughput < 5) {
        recommendations.push('Low token generation speed. Consider model quantization');
      }
    }

    if (service === 'tts') {
      if (avgLatency > 2000) {
        recommendations.push('TTS latency is high. Check voice selection and audio settings');
      }
    }

    // Memory recommendations
    const avgMemory = this.average(
      results.map(r => r.memoryUsed).filter((m): m is number => m !== undefined)
    );
    if (avgMemory > 100 * 1024 * 1024) { // 100MB
      recommendations.push('High memory usage detected. Consider clearing cache periodically');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance is within acceptable ranges');
    }

    return recommendations;
  }

  /**
   * Get current system metrics
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    const metrics: SystemMetrics = {
      totalMemory: 0,
      usedMemory: 0,
      availableMemory: 0,
      cpuCores: navigator.hardwareConcurrency || 4,
      deviceType: this.detectDeviceType(),
      connectionType: this.detectConnectionType()
    };

    // Get memory info if available
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      metrics.totalMemory = memory.jsHeapSizeLimit;
      metrics.usedMemory = memory.usedJSHeapSize;
      metrics.availableMemory = memory.jsHeapSizeLimit - memory.usedJSHeapSize;
    }

    return metrics;
  }

  /**
   * Get current memory usage
   */
  private getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Calculate transcript accuracy (Word Error Rate)
   */
  private calculateTranscriptAccuracy(hypothesis: string, reference: string): number {
    const hypWords = hypothesis.toLowerCase().split(/\s+/);
    const refWords = reference.toLowerCase().split(/\s+/);

    // Simple word-level accuracy
    const matches = hypWords.filter(w => refWords.includes(w)).length;
    const accuracy = (matches / Math.max(hypWords.length, refWords.length)) * 100;

    return Math.round(accuracy);
  }

  /**
   * Detect device type
   */
  private detectDeviceType(): SystemMetrics['deviceType'] {
    if (typeof window === 'undefined') return 'desktop';

    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  /**
   * Detect connection type
   */
  private detectConnectionType(): SystemMetrics['connectionType'] {
    if (typeof navigator === 'undefined' || !navigator.onLine) {
      return 'offline';
    }

    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      const effectiveType = conn?.effectiveType;
      
      if (effectiveType) {
        return effectiveType as SystemMetrics['connectionType'];
      }
    }

    return 'wifi'; // Default assumption
  }

  /**
   * Calculate average
   */
  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  /**
   * Calculate percentile
   */
  private percentile(sortedNumbers: number[], p: number): number {
    if (sortedNumbers.length === 0) return 0;
    const index = Math.ceil((p / 100) * sortedNumbers.length) - 1;
    return sortedNumbers[Math.max(0, index)];
  }

  /**
   * Export all results as JSON
   */
  exportResults(): string {
    return JSON.stringify(this.results, null, 2);
  }

  /**
   * Clear all results
   */
  clearResults(): void {
    this.results = [];
  }

  /**
   * Get all results
   */
  getAllResults(): BenchmarkResult[] {
    return [...this.results];
  }
}

// Singleton instance
export const PerformanceBenchmark = new PerformanceBenchmarkClass();
export default PerformanceBenchmark;

