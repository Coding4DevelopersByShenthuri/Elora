import { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  RefreshCw,
  AlertCircle,
  Eye,
  Clock,
  TrendingUp,
  Users,
  Award,
  Activity,
  BarChart3,
  Calendar,
  Filter,
  CheckCircle2,
  XCircle,
  BookOpen,
  Target,
  TrendingDown,
  PieChart
} from 'lucide-react';
import AdminAPI from '@/services/AdminApiService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const LESSON_TYPES = [
  { value: 'kids_4_10', label: 'Kids (4-10)' },
  { value: 'kids_11_17', label: 'Kids (11-17)' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'ielts', label: 'IELTS' },
  { value: 'pte', label: 'PTE' },
];

const CONTENT_TYPES = [
  { value: 'vocabulary', label: 'Vocabulary' },
  { value: 'pronunciation', label: 'Pronunciation' },
  { value: 'grammar', label: 'Grammar' },
  { value: 'conversation', label: 'Conversation' },
  { value: 'listening', label: 'Listening' },
  { value: 'reading', label: 'Reading' },
  { value: 'writing', label: 'Writing' },
  { value: 'story', label: 'Story' },
];

const getLessonTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    kids_4_10: 'bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400',
    kids_11_17: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
    beginner: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    intermediate: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    advanced: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
    ielts: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    pte: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400',
  };
  return colors[type] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
};

const getContentTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    vocabulary: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
    pronunciation: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400',
    grammar: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    conversation: 'bg-violet-100 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400',
    listening: 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400',
    reading: 'bg-sky-100 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400',
    writing: 'bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400',
    story: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/20 dark:text-fuchsia-400',
  };
  return colors[type] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
};

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function AdminProgress() {
  const [progressRecords, setProgressRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [lessonTypeFilter, setLessonTypeFilter] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState('');
  const [completedFilter, setCompletedFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [selectedProgress, setSelectedProgress] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const { toast } = useToast();

  // Debounce search input
  const debouncedSearch = useDebounce(search, 500);

  const loadProgressRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await AdminAPI.getProgressRecords({
        search: debouncedSearch,
        page,
        page_size: 20,
        lesson_type: lessonTypeFilter || undefined,
        content_type: contentTypeFilter || undefined,
        completed: completedFilter || undefined,
      });

      if (response.success) {
        const data = response.data;
        setProgressRecords(data.progress || []);
        setPagination(data.pagination || null);
      } else {
        const errorMessage = response.message || 'Failed to load progress records';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred while loading progress records';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, lessonTypeFilter, contentTypeFilter, completedFilter, toast]);

  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const response = await AdminAPI.getProgressStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('Failed to load stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProgressRecords();
  }, [loadProgressRecords]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleViewProgress = async (progressId: number) => {
    setActionLoading(progressId);
    try {
      const response = await AdminAPI.getProgressRecord(progressId);
      if (response.success) {
        setSelectedProgress(response.data);
        setShowDetailDialog(true);
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to load progress details',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to load progress details',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefresh = () => {
    loadProgressRecords();
    loadStats();
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-blue-600 dark:text-blue-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 60) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lesson Progress</h1>
            <p className="text-muted-foreground mt-1">
              Monitor and analyze lesson progress across all users
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={loading || statsLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading || statsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {statsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Progress Records</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overall?.total_progress?.toLocaleString() || 0}</div>
                <div className="flex items-center gap-2 mt-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <p className="text-xs text-muted-foreground">
                    {stats.overall?.completed_progress || 0} completed
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overall?.completion_rate?.toFixed(1) || 0}%</div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.recent?.completed_last_30 || 0} completed in last 30 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overall?.avg_score?.toFixed(1) || 0}%</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Avg time: {stats.overall?.avg_time_minutes?.toFixed(1) || 0}m per lesson
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.recent?.active_users_30 || 0}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.recent?.active_users_7 || 0} in last 7 days
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Additional Stats */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Learning Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overall?.total_time_hours?.toFixed(1) || 0}h</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.recent?.time_last_30_hours?.toFixed(1) || 0}h in last 30 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overall?.total_attempts?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.overall?.in_progress || 0} lessons in progress
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.recent?.progress_last_30 || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.recent?.progress_last_7 || 0} in last 7 days
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Distribution Charts */}
        {stats && (stats.lesson_type_distribution?.length > 0 || stats.content_type_distribution?.length > 0) && (
          <div className="grid gap-4 md:grid-cols-2">
            {stats.lesson_type_distribution?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Progress by Lesson Type</CardTitle>
                  <CardDescription>Distribution across lesson categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.lesson_type_distribution.map((item: any) => (
                      <div key={item.lesson__lesson_type} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="capitalize">{item.lesson__lesson_type?.replace('_', ' ') || 'Unknown'}</span>
                          <span className="font-medium">{item.count}</span>
                        </div>
                        <Progress value={(item.count / stats.overall.total_progress) * 100} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Avg Score: {item.avg_score?.toFixed(1) || 0}%</span>
                          <span>{item.completed_count || 0} completed</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {stats.content_type_distribution?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Progress by Content Type</CardTitle>
                  <CardDescription>Distribution across content categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.content_type_distribution.map((item: any) => (
                      <div key={item.lesson__content_type} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="capitalize">{item.lesson__content_type || 'Unknown'}</span>
                          <span className="font-medium">{item.count}</span>
                        </div>
                        <Progress value={(item.count / stats.overall.total_progress) * 100} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Avg Score: {item.avg_score?.toFixed(1) || 0}%</span>
                          <span>{item.completed_count || 0} completed</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Score Distribution */}
        {stats && stats.score_distribution && (
          <Card>
            <CardHeader>
              <CardTitle>Score Distribution</CardTitle>
              <CardDescription>Distribution of scores across all progress records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {stats.score_distribution.map((item: any) => (
                  <div key={item.range} className="text-center p-3 rounded-lg bg-muted">
                    <div className="text-lg font-bold">{item.count}</div>
                    <div className="text-xs text-muted-foreground mt-1">{item.range}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by user, email, lesson title..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select 
                value={lessonTypeFilter || "all"} 
                onValueChange={(value) => {
                  setLessonTypeFilter(value === "all" ? "" : value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Lesson Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Lesson Types</SelectItem>
                  {LESSON_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select 
                value={contentTypeFilter || "all"} 
                onValueChange={(value) => {
                  setContentTypeFilter(value === "all" ? "" : value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Content Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Content Types</SelectItem>
                  {CONTENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select 
                value={completedFilter || "all"} 
                onValueChange={(value) => {
                  setCompletedFilter(value === "all" ? "" : value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Completed</SelectItem>
                  <SelectItem value="false">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadProgressRecords}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Progress Records</CardTitle>
                <CardDescription>
                  {loading ? 'Loading...' : `${pagination?.total || 0} total records`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : progressRecords.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No progress records found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {(search || lessonTypeFilter || contentTypeFilter || completedFilter)
                    ? 'Try adjusting your filters' 
                    : 'No progress records have been recorded yet'}
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Lesson</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Attempts</TableHead>
                        <TableHead>Time Spent</TableHead>
                        <TableHead>Last Attempt</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {progressRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{record.user?.name || record.user?.username || 'Unknown'}</span>
                              <span className="text-xs text-muted-foreground">
                                {record.user?.email || ''}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {record.lesson ? (
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{record.lesson_title || record.lesson.title}</span>
                                {record.lesson.difficulty_level && (
                                  <span className="text-xs text-muted-foreground">
                                    Level {record.lesson.difficulty_level}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {record.lesson?.lesson_type && (
                                <Badge className={cn('w-fit text-xs', getLessonTypeColor(record.lesson.lesson_type))}>
                                  {record.lesson.lesson_type.replace('_', ' ')}
                                </Badge>
                              )}
                              {record.lesson?.content_type && (
                                <Badge className={cn('w-fit text-xs', getContentTypeColor(record.lesson.content_type))}>
                                  {record.lesson.content_type}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-12 rounded-full flex items-center justify-center relative" style={{
                                background: `conic-gradient(${getScoreBgColor(record.score || 0)} ${(record.score || 0) * 3.6}deg, transparent 0deg)`
                              }}>
                                <div className="absolute inset-1 bg-background rounded-full flex items-center justify-center">
                                  <span className={cn('text-xs font-bold', getScoreColor(record.score || 0))}>
                                    {Math.round(record.score || 0)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {record.completed ? (
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <Clock className="h-3 w-3 mr-1" />
                                In Progress
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <span className="font-medium">{record.attempts || 0}</span>
                              <span className="text-muted-foreground">attempts</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {formatDuration(record.time_spent_minutes || 0)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {record.last_attempt ? formatDate(record.last_attempt) : '—'}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewProgress(record.id)}
                              disabled={actionLoading === record.id}
                              title="View progress details"
                              className="h-8 w-8"
                            >
                              {actionLoading === record.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Showing page {pagination.page} of {pagination.pages} 
                      ({pagination.total} total records)
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                        disabled={page >= pagination.pages || loading}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Progress Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Progress Record Details</DialogTitle>
              <DialogDescription>
                Detailed information about this lesson progress record
              </DialogDescription>
            </DialogHeader>
            {selectedProgress && (
              <div className="space-y-4">
                {/* User Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">User Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Name:</span> {selectedProgress.user?.name || selectedProgress.user?.username}</p>
                      <p><span className="text-muted-foreground">Email:</span> {selectedProgress.user?.email}</p>
                      <p><span className="text-muted-foreground">Username:</span> {selectedProgress.user?.username}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Progress Information</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">Status:</span>{' '}
                        {selectedProgress.completed ? (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 ml-2">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="ml-2">
                            <Clock className="h-3 w-3 mr-1" />
                            In Progress
                          </Badge>
                        )}
                      </p>
                      <p><span className="text-muted-foreground">Last Attempt:</span> {selectedProgress.last_attempt ? formatDate(selectedProgress.last_attempt) : '—'}</p>
                      <p><span className="text-muted-foreground">Time Spent:</span> {formatDuration(selectedProgress.time_spent_minutes || 0)}</p>
                    </div>
                  </div>
                </div>

                {/* Lesson Info */}
                {selectedProgress.lesson && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Lesson Information</h4>
                    <div className="space-y-1 text-sm p-3 bg-muted rounded-lg">
                      <p><span className="text-muted-foreground">Title:</span> {selectedProgress.lesson.title}</p>
                      <p><span className="text-muted-foreground">Type:</span> {selectedProgress.lesson.lesson_type}</p>
                      <p><span className="text-muted-foreground">Content:</span> {selectedProgress.lesson.content_type}</p>
                      <p><span className="text-muted-foreground">Difficulty:</span> Level {selectedProgress.lesson.difficulty_level}</p>
                      {selectedProgress.lesson.description && (
                        <p><span className="text-muted-foreground">Description:</span> {selectedProgress.lesson.description}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Performance Metrics */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Performance Metrics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground">Overall Score</div>
                      <div className={cn('text-2xl font-bold mt-1', getScoreColor(selectedProgress.score || 0))}>
                        {selectedProgress.score?.toFixed(1) || 0}%
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground">Attempts</div>
                      <div className="text-2xl font-bold mt-1">{selectedProgress.attempts || 0}</div>
                    </div>
                    {selectedProgress.pronunciation_score !== null && (
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-xs text-muted-foreground">Pronunciation</div>
                        <div className="text-2xl font-bold mt-1">{selectedProgress.pronunciation_score?.toFixed(1) || 0}%</div>
                      </div>
                    )}
                    {selectedProgress.fluency_score !== null && (
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-xs text-muted-foreground">Fluency</div>
                        <div className="text-2xl font-bold mt-1">{selectedProgress.fluency_score?.toFixed(1) || 0}%</div>
                      </div>
                    )}
                    {selectedProgress.accuracy_score !== null && (
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-xs text-muted-foreground">Accuracy</div>
                        <div className="text-2xl font-bold mt-1">{selectedProgress.accuracy_score?.toFixed(1) || 0}%</div>
                      </div>
                    )}
                    {selectedProgress.grammar_score !== null && (
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-xs text-muted-foreground">Grammar</div>
                        <div className="text-2xl font-bold mt-1">{selectedProgress.grammar_score?.toFixed(1) || 0}%</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Details */}
                {selectedProgress.details && Object.keys(selectedProgress.details).length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Additional Details</h4>
                    <div className="p-3 bg-muted rounded-lg">
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(selectedProgress.details, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedProgress.notes && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Notes</h4>
                    <div className="p-3 bg-muted rounded-lg text-sm">
                      {selectedProgress.notes}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
