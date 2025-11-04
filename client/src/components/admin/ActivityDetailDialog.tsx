import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, User, BookOpen, Clock, Target, Award, TrendingUp, Calendar, Mail, Hash } from 'lucide-react';
import AdminAPI from '@/services/AdminApiService';

interface ActivityDetailDialogProps {
  activityId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActivityDetailDialog({ activityId, open, onOpenChange }: ActivityDetailDialogProps) {
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && activityId) {
      loadActivityDetail();
    } else {
      setActivity(null);
      setError('');
    }
  }, [open, activityId]);

  const loadActivityDetail = async () => {
    if (!activityId) return;
    
    try {
      setLoading(true);
      setError('');
      const response = await AdminAPI.getActivityDetail(activityId);
      
      if (response.success) {
        setActivity(response.data);
      } else {
        setError(response.message || 'Failed to load activity details');
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Activity Details</DialogTitle>
          <DialogDescription>
            View comprehensive information about this activity
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
          </div>
        ) : activity ? (
          <div className="space-y-6">
            {/* Activity Type Badge */}
            <div className="flex items-center justify-between">
              <Badge
                variant={activity.type === 'user_registration' ? 'default' : 'secondary'}
                className="text-sm"
              >
                {activity.type === 'user_registration' ? 'User Registration' : 'Lesson Progress'}
              </Badge>
              <Badge
                variant={
                  activity.status === 'completed'
                    ? 'default'
                    : activity.status === 'in_process'
                    ? 'secondary'
                    : 'outline'
                }
                className="capitalize"
              >
                {formatStatus(activity.status)}
              </Badge>
            </div>

            {activity.type === 'user_registration' ? (
              /* User Registration Details */
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Name</span>
                    </div>
                    <p className="font-medium">{activity.name || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </div>
                    <p className="font-medium">{activity.email || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Hash className="h-4 w-4" />
                      <span>Username</span>
                    </div>
                    <p className="font-medium">{activity.username || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Hash className="h-4 w-4" />
                      <span>Reference ID</span>
                    </div>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{activity.mrn}</code>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Date Joined</span>
                    </div>
                    <p className="font-medium">{formatDate(activity.date_joined)}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Last Login</span>
                    </div>
                    <p className="font-medium">{formatDate(activity.last_login) || 'Never'}</p>
                  </div>
                </div>

                {/* Account Status */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Account Status
                  </h3>
                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                      <span className="text-sm text-muted-foreground">Active</span>
                      <Badge variant={activity.is_active ? 'default' : 'outline'}>
                        {activity.is_active ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                      <span className="text-sm text-muted-foreground">Staff</span>
                      <Badge variant={activity.is_staff ? 'default' : 'outline'}>
                        {activity.is_staff ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                      <span className="text-sm text-muted-foreground">Superuser</span>
                      <Badge variant={activity.is_superuser ? 'default' : 'outline'}>
                        {activity.is_superuser ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Profile Information */}
                {activity.profile && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Learning Profile
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Level</span>
                        </div>
                        <Badge variant="secondary" className="capitalize">
                          {activity.profile.level || 'N/A'}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Award className="h-4 w-4" />
                          <span>Points</span>
                        </div>
                        <p className="font-medium">{activity.profile.points || 0}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Current Streak</span>
                        </div>
                        <p className="font-medium">{activity.profile.current_streak || 0} days</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Longest Streak</span>
                        </div>
                        <p className="font-medium">{activity.profile.longest_streak || 0} days</p>
                      </div>
                      {activity.profile.age_range && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Age Range</span>
                          </div>
                          <p className="font-medium">{activity.profile.age_range}</p>
                        </div>
                      )}
                      {activity.profile.native_language && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Native Language</span>
                          </div>
                          <p className="font-medium">{activity.profile.native_language}</p>
                        </div>
                      )}
                      {activity.profile.english_level && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>English Level</span>
                          </div>
                          <p className="font-medium">{activity.profile.english_level}</p>
                        </div>
                      )}
                      {activity.profile.learning_purpose && activity.profile.learning_purpose.length > 0 && (
                        <div className="space-y-2 md:col-span-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Learning Purpose</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {activity.profile.learning_purpose.map((purpose: string, idx: number) => (
                              <Badge key={idx} variant="outline">{purpose}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {activity.profile.interests && activity.profile.interests.length > 0 && (
                        <div className="space-y-2 md:col-span-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Interests</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {activity.profile.interests.map((interest: string, idx: number) => (
                              <Badge key={idx} variant="outline">{interest}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {activity.profile.survey_completed_at && (
                        <div className="space-y-2 md:col-span-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Survey Completed</span>
                          </div>
                          <p className="font-medium">{formatDate(activity.profile.survey_completed_at)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Lesson Progress Summary */}
                {activity.lesson_progress && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Lesson Progress Summary
                    </h3>
                    <div className="grid gap-2 md:grid-cols-3">
                      <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                        <span className="text-sm text-muted-foreground">Total Lessons</span>
                        <span className="font-semibold">{activity.lesson_progress.total_lessons || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                        <span className="text-sm text-muted-foreground">Completed</span>
                        <span className="font-semibold">{activity.lesson_progress.completed_lessons || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                        <span className="text-sm text-muted-foreground">Average Score</span>
                        <span className="font-semibold">{activity.lesson_progress.average_score || 0}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Practice Summary */}
                {activity.practice_summary && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Practice Summary
                    </h3>
                    <div className="grid gap-2 md:grid-cols-3">
                      <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                        <span className="text-sm text-muted-foreground">Total Sessions</span>
                        <span className="font-semibold">{activity.practice_summary.total_sessions || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                        <span className="text-sm text-muted-foreground">Total Time</span>
                        <span className="font-semibold">{activity.practice_summary.total_time_hours || 0}h</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                        <span className="text-sm text-muted-foreground">Time (Minutes)</span>
                        <span className="font-semibold">{activity.practice_summary.total_time_minutes || 0}m</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Lesson Progress Details */
              <div className="space-y-6">
                {/* User Information */}
                {activity.user && (
                  <div className="border-b pb-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      User Information
                    </h3>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Name</div>
                        <p className="font-medium">{activity.user.name || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Email</div>
                        <p className="font-medium">{activity.user.email || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Username</div>
                        <p className="font-medium">{activity.user.username || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lesson Information */}
                {activity.lesson && (
                  <div className="border-b pb-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Lesson Information
                    </h3>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Title</div>
                        <p className="font-medium">{activity.lesson.title || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Type</div>
                        <Badge variant="outline" className="capitalize">
                          {activity.lesson.lesson_type || 'N/A'}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Content Type</div>
                        <Badge variant="outline" className="capitalize">
                          {activity.lesson.content_type || 'N/A'}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Difficulty</div>
                        <p className="font-medium">Level {activity.lesson.difficulty_level || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Duration</div>
                        <p className="font-medium">{activity.lesson.duration_minutes || 0} minutes</p>
                      </div>
                      {activity.lesson.description && (
                        <div className="space-y-1 md:col-span-2">
                          <div className="text-sm text-muted-foreground">Description</div>
                          <p className="text-sm">{activity.lesson.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Progress Details */}
                {activity.progress && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Progress Details
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <Badge variant={activity.progress.completed ? 'default' : 'secondary'}>
                            {activity.progress.completed ? 'Completed' : 'In Progress'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                          <span className="text-sm text-muted-foreground">Score</span>
                          <span className="font-semibold">{activity.progress.score || 0}%</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                          <span className="text-sm text-muted-foreground">Time Spent</span>
                          <span className="font-semibold">{activity.progress.time_spent_minutes || 0} min</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                          <span className="text-sm text-muted-foreground">Attempts</span>
                          <span className="font-semibold">{activity.progress.attempts || 0}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {activity.progress.pronunciation_score !== null && (
                          <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                            <span className="text-sm text-muted-foreground">Pronunciation</span>
                            <span className="font-semibold">{activity.progress.pronunciation_score}%</span>
                          </div>
                        )}
                        {activity.progress.fluency_score !== null && (
                          <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                            <span className="text-sm text-muted-foreground">Fluency</span>
                            <span className="font-semibold">{activity.progress.fluency_score}%</span>
                          </div>
                        )}
                        {activity.progress.accuracy_score !== null && (
                          <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                            <span className="text-sm text-muted-foreground">Accuracy</span>
                            <span className="font-semibold">{activity.progress.accuracy_score}%</span>
                          </div>
                        )}
                        {activity.progress.grammar_score !== null && (
                          <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                            <span className="text-sm text-muted-foreground">Grammar</span>
                            <span className="font-semibold">{activity.progress.grammar_score}%</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Last Attempt</span>
                        </div>
                        <p className="font-medium">{formatDate(activity.progress.last_attempt)}</p>
                        {activity.progress.notes && (
                          <>
                            <div className="text-sm text-muted-foreground mt-2">Notes</div>
                            <p className="text-sm bg-muted/50 p-2 rounded">{activity.progress.notes}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

