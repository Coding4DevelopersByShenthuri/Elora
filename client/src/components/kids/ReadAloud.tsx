import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import SpeechService from '@/services/SpeechService';
import SLMEvaluator from '@/services/SLMEvaluator';

type ReadAloudLesson = {
  id: string;
  title: string;
  text: string;
  targetWords?: string[];
};

export default function ReadAloud({ lesson }: { lesson: ReadAloudLesson }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [result, setResult] = useState<{ transcript: string; scores?: any } | null>(null);

  const phonemeHints = useMemo(() => {
    // Very simple hinting: highlight some common challenging words
    const hints: Record<string, string> = {
      rabbit: '/ˈræb.ɪt/',
      forest: '/ˈfɒr.ɪst/',
      astronaut: '/ˈæs.trə.nɔːt/',
      planet: '/ˈplæn.ɪt/'
    };
    return hints;
  }, []);

  useEffect(() => () => SpeechService.cancelSpeak(), []);

  const speak = async () => {
    if (!SpeechService.isTTSSupported()) return;
    setIsSpeaking(true);
    try {
      await SpeechService.speak(lesson.text, { rate: 0.95, pitch: 1.0 });
    } finally {
      setIsSpeaking(false);
    }
  };

  const record = async () => {
    if (!SpeechService.isSTTSupported()) return;
    setRecording(true);
    try {
      const stt = await SpeechService.startRecognition({ lang: 'en-US', timeoutMs: 10000 });
      const scores = await SLMEvaluator.evaluateResponse(stt.transcript, {
        targetWords: lesson.targetWords
      });
      setResult({ transcript: stt.transcript, scores });
    } catch (e) {
      setResult({ transcript: 'No speech detected or STT unsupported.' });
    } finally {
      setRecording(false);
    }
  };

  const percent = useMemo(() => {
    if (!result?.scores) return 0;
    const { fluency, grammar, vocabulary } = result.scores;
    return Math.round((fluency + grammar + vocabulary) / 3);
  }, [result]);

  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">{lesson.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Read aloud with phoneme hints</p>
          </div>
          <div className="w-40">
            <Progress value={percent} />
            <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">Overall {percent}%</p>
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <p className="leading-relaxed text-gray-700 dark:text-gray-200">
            {lesson.text.split(/\s+/).map((w, i) => {
              const clean = w.replace(/[^a-zA-Z]/g, '').toLowerCase();
              const hint = phonemeHints[clean];
              return (
                <span key={i} className="mr-2 inline-block">
                  <span className="font-semibold">{w}</span>
                  {hint && <span className="ml-1 text-xs text-pink-500">{hint}</span>}
                </span>
              );
            })}
          </p>
        </div>

        <div className="flex gap-3">
          <Button onClick={speak} disabled={isSpeaking} className="rounded-2xl">
            {isSpeaking ? 'Speaking…' : 'Listen'}
          </Button>
          <Button onClick={record} variant="outline" disabled={recording} className="rounded-2xl">
            {recording ? 'Listening…' : 'Record'}
          </Button>
        </div>

        {result && (
          <div className="mt-2 text-sm">
            <p className="font-semibold">You said:</p>
            <p className="text-gray-700 dark:text-gray-200">{result.transcript}</p>
            {result.scores && (
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <div>Fluency: {result.scores.fluency}</div>
                <div>Grammar: {result.scores.grammar}</div>
                <div>Vocabulary: {result.scores.vocabulary}</div>
                <div className="col-span-3 text-gray-500 dark:text-gray-400">{result.scores.feedback}</div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


