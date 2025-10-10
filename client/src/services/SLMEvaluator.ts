/*
  SLMEvaluator: thin interface to a small local language model.
  For MVP, we implement heuristic scoring locally and expose interfaces that can later be backed by on-device WASM models (e.g., GGML quantized DistilGPT/GPT2-small).
*/

export type EvaluationScores = {
  fluency: number; // 0-100
  grammar: number; // 0-100
  vocabulary: number; // 0-100
  pronunciation?: number; // 0-100 (from phoneme alignment engine)
  feedback: string;
};

export interface EvaluateOptions {
  targetPrompt?: string;
  targetWords?: string[];
}

export class SLMEvaluator {
  static async evaluateResponse(userText: string, options?: EvaluateOptions): Promise<EvaluationScores> {
    // Simple, deterministic heuristics for MVP offline behavior
    const length = userText.trim().split(/\s+/).filter(Boolean).length;
    const containsTarget = (options?.targetWords ?? []).filter(w => new RegExp(`\\b${w}\\b`, 'i').test(userText)).length;

    const fluency = Math.min(100, Math.max(30, Math.round(50 + Math.min(40, length))));
    const vocabulary = Math.min(100, Math.round(50 + containsTarget * 10));

    // Naive grammar proxy: punctuation usage and sentence length
    const sentences = userText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLen = sentences.length ? length / sentences.length : length;
    const grammar = Math.min(100, Math.max(30, Math.round(60 + Math.min(30, avgSentenceLen - 8))));

    const feedbackParts: string[] = [];
    if ((options?.targetWords?.length ?? 0) > 0) {
      if (containsTarget > 0) feedbackParts.push('Great job using key words.');
      else feedbackParts.push('Try to include the target words.');
    }
    if (fluency > 70) feedbackParts.push('Fluency is improving. Keep a steady pace.');
    if (grammar > 70) feedbackParts.push('Grammar looks good. Watch subject-verb agreement.');
    if (vocabulary > 70) feedbackParts.push('Nice vocabulary usage. Add one more descriptive word.');

    return {
      fluency,
      grammar,
      vocabulary,
      feedback: feedbackParts.join(' ')
    };
  }
}

export default SLMEvaluator;


