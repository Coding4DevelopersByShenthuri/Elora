import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SpeechService from '@/services/SpeechService';
import SLMEvaluator from '@/services/SLMEvaluator';

type WordCard = { word: string; hint?: string };

export default function Vocabulary({ words }: { words: WordCard[] }) {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');

  const card = words[current];

  const next = () => setCurrent((c) => (c + 1) % words.length);

  const speak = async () => {
    if (!SpeechService.isTTSSupported()) return;
    await SpeechService.speak(card.word, { rate: 0.95 });
  };

  const sayIt = async () => {
    if (!SpeechService.isSTTSupported()) return;
    try {
      const stt = await SpeechService.startRecognition({ timeoutMs: 6000 });
      const res = await SLMEvaluator.evaluateResponse(stt.transcript, { targetWords: [card.word] });
      setScore((prev) => Math.min(100, Math.round((prev + res.vocabulary) / 2)));
      setFeedback(res.feedback);
    } catch (e) {
      setFeedback('Try again! Say the word clearly.');
    }
  };

  const progress = useMemo(() => score, [score]);

  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2">
      <CardContent className="p-6 space-y-4 text-center">
        <h3 className="text-xl font-bold">Word Game</h3>
        <div className="text-4xl font-extrabold">{card.word}</div>
        {card.hint && <div className="text-sm text-pink-500">{card.hint}</div>}
        <div className="flex justify-center gap-3">
          <Button onClick={speak} className="rounded-2xl">Listen</Button>
          <Button onClick={sayIt} variant="outline" className="rounded-2xl">Speak</Button>
          <Button onClick={next} variant="secondary" className="rounded-2xl">Next</Button>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{feedback}</div>
        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4]" style={{ width: `${progress}%` }} />
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Progress: {progress}%</div>
      </CardContent>
    </Card>
  );
}


