/**
 * Page Blocked Modal
 * 
 * Shows a modal when a user tries to enroll in a page they haven't unlocked yet.
 */

import { Lock, TrendingUp, BookOpen, Trophy, Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import InitialRouteService from '@/services/InitialRouteService';
import PageEligibilityService, { type PagePath } from '@/services/PageEligibilityService';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface PageBlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  pagePath: PagePath;
  fallbackPage?: PagePath;
}

const criterionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  stories_completed: BookOpen,
  points: Trophy,
  streak: Zap,
  vocabulary_words: BookOpen,
  pronunciation_practices: BookOpen,
  games_played: Trophy,
  achievements: Trophy,
};

const criterionLabels: Record<string, string> = {
  stories_completed: 'Stories Completed',
  points: 'Points Earned',
  streak: 'Daily Streak',
  vocabulary_words: 'Vocabulary Words',
  pronunciation_practices: 'Pronunciation Practices',
  games_played: 'Games Played',
  achievements: 'Achievements',
};

export const PageBlockedModal = ({
  isOpen,
  onClose,
  pagePath,
  fallbackPage,
}: PageBlockedModalProps) => {
  const navigate = useNavigate();
  const [eligibility, setEligibility] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const loadEligibility = async () => {
        setLoading(true);
        try {
          const result = await PageEligibilityService.getEligibility(pagePath, true);
          setEligibility(result);
        } catch (error) {
          console.error('Error loading eligibility:', error);
        } finally {
          setLoading(false);
        }
      };
      loadEligibility();
    }
  }, [isOpen, pagePath]);

  // Prevent modal from closing when clicking outside or pressing escape
  const handleOpenChange = (open: boolean) => {
    // Only allow closing if user explicitly clicks the close button or "Go to Your Level"
    if (!open && eligibility?.is_unlocked) {
      onClose();
    }
    // Otherwise, keep it open
  };

  const initialRoute = InitialRouteService.getInitialRoute();
  const pageName = pagePath === '/kids/teen' ? 'Teen Explorer Zone (Ages 11-17)' : pagePath;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange} modal={true}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Lock className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">Page Blocked</DialogTitle>
              <DialogDescription className="text-base mt-1">
                You need to complete more activities to unlock this page
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Main Message */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                The <strong>{pageName}</strong> page is locked. Complete the requirements below in your current level to unlock it.
              </p>
            </CardContent>
          </Card>

          {/* Initial Route Info */}
          {initialRoute && (
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  📍 Your Starting Level:
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  You started at <strong>
                    {initialRoute === '/kids/young' 
                      ? 'Little Learners (Ages 4-10)' 
                      : initialRoute === '/kids/teen' 
                      ? 'Teen Explorer Zone (Ages 11-17)' 
                      : initialRoute}
                  </strong>. Complete activities there to unlock this page!
                </p>
              </CardContent>
            </Card>
          )}

          {/* Requirements */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : eligibility && Object.keys(eligibility.current_progress || {}).length > 0 ? (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Requirements to Unlock:</h3>
              {Object.entries(eligibility.current_progress).map(([key, progress]: [string, any]) => {
                const Icon = criterionIcons[key] || BookOpen;
                const label = criterionLabels[key] || key.replace(/_/g, ' ');
                const isMet = progress.met;

                return (
                  <Card
                    key={key}
                    className={cn(
                      "transition-all",
                      isMet && "border-green-500 bg-green-50 dark:bg-green-950/20"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full shrink-0",
                            isMet
                              ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{label}</span>
                            <Badge variant={isMet ? "default" : "secondary"}>
                              {isMet ? "Complete" : "In Progress"}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {progress.current} / {progress.required}
                              </span>
                              <span className="text-muted-foreground">
                                {Math.round(progress.progress_percent)}%
                              </span>
                            </div>
                            <Progress
                              value={progress.progress_percent}
                              className={cn("h-2", isMet && "bg-green-200")}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  Loading requirements...
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {fallbackPage && (
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  navigate(fallbackPage);
                }}
                className="flex-1"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Go to Your Level
              </Button>
            )}
            <Button
              onClick={() => {
                PageEligibilityService.clearCache(pagePath);
                // Don't close if still locked - refresh eligibility instead
                if (eligibility?.is_unlocked) {
                  onClose();
                } else {
                  // Refresh eligibility check
                  PageEligibilityService.getEligibility(pagePath, true).then((result) => {
                    setEligibility(result);
                    if (result?.is_unlocked) {
                      onClose();
                    }
                  });
                }
              }}
              className="flex-1"
            >
              {eligibility?.is_unlocked ? 'Close' : 'Check Again'}
            </Button>
          </div>

          {/* Help Text */}
          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <p className="font-medium mb-1">💡 Tip:</p>
            <p>
              Complete stories, practice vocabulary, and maintain your daily streak in your current level. 
              Once you meet all the requirements above, this page will unlock automatically!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PageBlockedModal;

