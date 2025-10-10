import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SpeechService from '@/services/SpeechService';

type PronounceItem = { phrase: string; phonemes?: string };

export default function Pronunciation({ items }: { items: PronounceItem[] }) {
  const [idx, setIdx] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [message, setMessage] = useState('');

  const current = items[idx];

  const listen = async () => {
    if (!SpeechService.isTTSSupported()) return;
    await SpeechService.speak(current.phrase, { rate: 0.9 });
  };

  const record = async () => {
    if (!SpeechService.isSTTSupported()) return;
    try {
      const stt = await SpeechService.startRecognition({ timeoutMs: 8000 });
      setTranscript(stt.transcript);
      const ok = new RegExp(`^${current.phrase.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i').test(stt.transcript.trim());
      setMessage(ok ? 'Great! Sounds correct.' : 'Close! Try again, focus on sounds.');
    } catch (e) {
      setMessage('No speech detected, try again.');
    }
  };

  const next = () => setIdx((i) => (i + 1) % items.length);

  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2">
      <CardContent className="p-6 space-y-4">
        <h3 className="text-xl font-bold">Speak & Repeat</h3>
        <div className="text-2xl font-extrabold">{current.phrase}</div>
        {current.phonemes && <div className="text-sm text-pink-500">{current.phonemes}</div>}
        <div className="flex gap-3">
          <Button onClick={listen} className="rounded-2xl">Listen</Button>
          <Button onClick={record} variant="outline" className="rounded-2xl">Record</Button>
          <Button onClick={next} variant="secondary" className="rounded-2xl">Next</Button>
        </div>
        {transcript && (
          <div className="text-sm">
            <div className="text-gray-500 dark:text-gray-400">You said:</div>
            <div>{transcript}</div>
          </div>
        )}
        {message && <div className="text-sm text-gray-600 dark:text-gray-300">{message}</div>}
      </CardContent>
    </Card>
  );
}


