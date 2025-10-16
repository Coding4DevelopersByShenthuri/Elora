import { useState, useEffect } from 'react';
import { Volume2, TrendingUp, TrendingDown, Minus, CheckCircle, AlertCircle, Lightbulb, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import EnhancedTTS from '@/services/EnhancedTTS';

interface PronunciationFeedback {
  overall: number;
  accuracy: number;
  fluency: number;
  completeness: number;
  wordScores?: Array<{
    word: string;
    score: number;
    phonemes?: string;
  }>;
  recommendations?: string[];
  transcript?: string;
  expectedText?: string;
}

interface PronunciationFeedbackDisplayProps {
  feedback: PronunciationFeedback;
  onTryAgain?: () => void;
  onNext?: () => void;
  showDetailed?: boolean;
  className?: string;
}

const PronunciationFeedbackDisplay = ({
  feedback,
  onTryAgain,
  onNext,
  showDetailed = true,
  className
}: PronunciationFeedbackDisplayProps) => {
  const [speakingFeedback, setSpeakingFeedback] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20 border-green-200';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200';
    return 'bg-red-100 dark:bg-red-900/20 border-red-200';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return '🌟';
    if (score >= 80) return '😊';
    if (score >= 70) return '🙂';
    if (score >= 60) return '😐';
    return '🤔';
  };

  const getEncouragementMessage = (score: number) => {
    if (score >= 90) return "Amazing! You're a pronunciation superstar!";
    if (score >= 80) return "Great job! You're doing really well!";
    if (score >= 70) return "Good effort! Keep practicing!";
    if (score >= 60) return "Nice try! Let's practice a bit more!";
    return "Don't give up! Practice makes perfect!";
  };

  const getTrendIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (score >= 60) return <Minus className="w-5 h-5 text-yellow-500" />;
    return <TrendingDown className="w-5 h-5 text-red-500" />;
  };

  const speakFeedback = async () => {
    if (speakingFeedback) return;
    
    setSpeakingFeedback(true);
    try {
      const message = getEncouragementMessage(feedback.overall);
      await EnhancedTTS.speak(message, { rate: 0.9, emotion: 'happy' });
      
      if (feedback.recommendations && feedback.recommendations.length > 0) {
        await EnhancedTTS.speak(feedback.recommendations[0], { rate: 0.85 });
      }
    } catch (error) {
      console.error('Error speaking feedback:', error);
    } finally {
      setSpeakingFeedback(false);
    }
  };

  const getStarRating = (score: number) => {
    const stars = Math.round(score / 20); // 0-100 to 0-5 stars
    return Array.from({ length: 5 }, (_, i) => i < stars);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Overall Score Card */}
      <Card className={cn("border-2", getScoreBgColor(feedback.overall))}>
        <CardContent className="py-6">
          <div className="text-center mb-4">
            <div className="text-6xl mb-2">{getScoreEmoji(feedback.overall)}</div>
            <div className="flex items-center justify-center gap-1 mb-3">
              {getStarRating(feedback.overall).map((filled, idx) => (
                <Star
                  key={idx}
                  className={cn(
                    "w-8 h-8",
                    filled ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className={cn("text-5xl font-bold", getScoreColor(feedback.overall))}>
                {Math.round(feedback.overall)}
              </span>
              <span className="text-2xl text-gray-500">/100</span>
            </div>
            <p className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              {getEncouragementMessage(feedback.overall)}
            </p>
            
            {/* Speak Feedback Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={speakFeedback}
              disabled={speakingFeedback}
              className="rounded-xl"
            >
              <Volume2 className="w-4 h-4 mr-2" />
              {speakingFeedback ? 'Speaking...' : 'Hear Feedback'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Scores */}
      {showDetailed && (
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-500" />
              Detailed Scores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Accuracy */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  🎯 Accuracy
                </span>
                <span className={cn("font-bold", getScoreColor(feedback.accuracy))}>
                  {Math.round(feedback.accuracy)}%
                </span>
              </div>
              <Progress value={feedback.accuracy} className="h-3" />
            </div>

            {/* Fluency */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  💬 Fluency
                </span>
                <span className={cn("font-bold", getScoreColor(feedback.fluency))}>
                  {Math.round(feedback.fluency)}%
                </span>
              </div>
              <Progress value={feedback.fluency} className="h-3" />
            </div>

            {/* Completeness */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  ✅ Completeness
                </span>
                <span className={cn("font-bold", getScoreColor(feedback.completeness))}>
                  {Math.round(feedback.completeness)}%
                </span>
              </div>
              <Progress value={feedback.completeness} className="h-3" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transcription Comparison */}
      {feedback.expectedText && feedback.transcript && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              What You Said
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Expected:</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                "{feedback.expectedText}"
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">You said:</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                "{feedback.transcript}"
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Word-Level Scores */}
      {showDetailed && feedback.wordScores && feedback.wordScores.length > 0 && (
        <Card className="border-2 border-orange-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Word-by-Word Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {feedback.wordScores.map((wordScore, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "px-4 py-2 rounded-lg border-2 transition-all duration-300",
                    wordScore.score >= 80 && "bg-green-100 border-green-300 dark:bg-green-900/20",
                    wordScore.score >= 60 && wordScore.score < 80 && "bg-yellow-100 border-yellow-300 dark:bg-yellow-900/20",
                    wordScore.score < 60 && "bg-red-100 border-red-300 dark:bg-red-900/20"
                  )}
                >
                  <div className="text-center">
                    <p className="font-bold text-gray-800 dark:text-white mb-1">
                      {wordScore.word}
                    </p>
                    <p className={cn("text-sm font-semibold", getScoreColor(wordScore.score))}>
                      {Math.round(wordScore.score)}%
                    </p>
                    {wordScore.phonemes && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {wordScore.phonemes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {feedback.recommendations && feedback.recommendations.length > 0 && (
        <Card className="border-2 border-pink-200 bg-pink-50 dark:bg-pink-900/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-pink-500" />
              Tips to Improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {feedback.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <p className="text-gray-700 dark:text-gray-300 flex-1">{rec}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        {onTryAgain && (
          <Button
            variant="outline"
            size="lg"
            onClick={onTryAgain}
            className="rounded-2xl px-8"
          >
            🔄 Try Again
          </Button>
        )}
        {onNext && (
          <Button
            size="lg"
            onClick={onNext}
            className="rounded-2xl px-8 bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] hover:from-[#4ECDC4] hover:to-[#FF6B6B]"
          >
            ➡️ Next Challenge
          </Button>
        )}
      </div>
    </div>
  );
};

export default PronunciationFeedbackDisplay;

