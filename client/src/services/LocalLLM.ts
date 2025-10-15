/*
  LocalLLM: ultra-lightweight, deterministic feedback generator that runs fully offline.
  It crafts short pedagogical feedback using scores and simple heuristics.
*/

export type LocalLLMInput = {
  userText: string;
  scores: {
    fluency: number;
    grammar: number;
    vocabulary: number;
    pronunciation?: number;
  };
  targetWords?: string[];
};

export class LocalLLM {
  static generateFeedback(input: LocalLLMInput): string {
    const { userText, scores, targetWords } = input;
    const cleaned = userText.trim();
    const wordCount = cleaned ? cleaned.split(/\s+/).length : 0;

    const sections: string[] = [];

    // Opening
    if (wordCount < 5) {
      sections.push("Try expanding your answer with one or two more details.");
    } else if (wordCount < 15) {
      sections.push("Good start. Add one supporting example to strengthen your response.");
    } else {
      sections.push("Nice effort composing a complete response.");
    }

    // Scores-based guidance
    if (scores.fluency < 60) sections.push("Speak in shorter phrases and pause at punctuation.");
    if (scores.grammar < 60) sections.push("Watch verb tense consistency and subject–verb agreement.");
    if (scores.vocabulary < 60) sections.push("Introduce one descriptive adjective or precise verb.");
    if (scores.fluency >= 80) sections.push("Fluency is strong—maintain your natural pace.");
    if (scores.grammar >= 80) sections.push("Grammar is solid—keep it up.");
    if (scores.vocabulary >= 80) sections.push("Vocabulary is varied—great word choice.");

    // Target words coaching
    if ((targetWords?.length ?? 0) > 0) {
      const missing = (targetWords || []).filter(w => !new RegExp(`\\b${w}\\b`, 'i').test(cleaned));
      if (missing.length > 0) {
        sections.push(`Try to include: ${missing.slice(0, 3).join(", ")}.`);
      } else {
        sections.push("Great job including the key words.");
      }
    }

    // Closing nudge
    if (!/[.!?]$/.test(cleaned) && cleaned.length > 0) {
      sections.push("Finish your sentence with a clear ending.");
    }

    return sections.join(' ');
  }
}

export default LocalLLM;


