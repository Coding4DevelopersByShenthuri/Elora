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
  Download
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

const SESSION_TYPES = [
  { value: 'pronunciation', label: 'Pronunciation' },
  { value: 'conversation', label: 'Conversation' },
  { value: 'vocabulary', label: 'Vocabulary' },
  { value: 'grammar', label: 'Grammar' },
  { value: 'listening', label: 'Listening' },
  { value: 'reading', label: 'Reading' },
  { value: 'exam_practice', label: 'Exam Practice' },
];

const getSessionTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    pronunciation: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
    conversation: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    vocabulary: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    grammar: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
    listening: 'bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400',
    reading: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400',
    exam_practice: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  };
  return colors[type] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
};

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
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

export default function AdminPractice() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sessionTypeFilter, setSessionTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const { toast } = useToast();

  // Debounce search input
  const debouncedSearch = useDebounce(search, 500);

  const loadSessions = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);
      
      const response = await AdminAPI.getPracticeSessions({
        search: debouncedSearch,
        page,
        page_size: 20,
        session_type: sessionTypeFilter || undefined,
      });

      if (response.success) {
        const data = response.data;
        setSessions(data.sessions || []);
        setPagination(data.pagination || null);
      } else {
        const errorMessage = response.message || 'Failed to load practice sessions';
        if (!silent) {
          setError(errorMessage);
          toast({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive',
          });
        }
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred while loading practice sessions';
      if (!silent) {
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [debouncedSearch, page, sessionTypeFilter, toast]);

  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const response = await AdminAPI.getPracticeStats();
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
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Auto-refresh every 30 seconds for real-time data
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      loadSessions(true);
      loadStats();
    }, 30000); // 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, [search, sessionTypeFilter, page]);

  const handleViewSession = async (sessionId: number) => {
    setActionLoading(sessionId);
    try {
      const response = await AdminAPI.getPracticeSession(sessionId);
      if (response.success) {
        setSelectedSession(response.data);
        setShowDetailDialog(true);
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to load session details',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to load session details',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefresh = () => {
    loadSessions();
    loadStats();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Practice Sessions</h1>
            <p className="text-muted-foreground mt-1">
              Monitor and analyze all practice sessions across the platform
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
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overall?.total_sessions?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.recent?.sessions_last_30 || 0} in last 30 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Practice Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overall?.total_time_hours?.toFixed(1) || 0}h</div>
                <p className="text-xs text-muted-foreground">
                  {stats.recent?.time_last_30_hours?.toFixed(1) || 0}h in last 30 days
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
                <p className="text-xs text-muted-foreground">
                  Avg duration: {stats.overall?.avg_duration_minutes?.toFixed(1) || 0}m
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
                <p className="text-xs text-muted-foreground">
                  {stats.recent?.active_users_7 || 0} in last 7 days
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Session Type Distribution */}
        {stats && stats.type_distribution && stats.type_distribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Session Type Distribution</CardTitle>
              <CardDescription>Practice sessions by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {stats.type_distribution.map((item: any) => (
                  <div key={item.session_type} className="text-center">
                    <div className="text-2xl font-bold">{item.count}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {item.session_type.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {item.avg_score?.toFixed(1) || 0}% avg
                    </div>
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
                    placeholder="Search by user, email, lesson, or session type..."
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
                value={sessionTypeFilter || "all"} 
                onValueChange={(value) => {
                  setSessionTypeFilter(value === "all" ? "" : value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="All Session Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Session Types</SelectItem>
                  {SESSION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
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
                  onClick={loadSessions}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Sessions Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Practice Sessions</CardTitle>
                <CardDescription>
                  {loading ? 'Loading...' : `${pagination?.total || 0} total sessions`}
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
            ) : sessions.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No practice sessions found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {(search || sessionTypeFilter)
                    ? 'Try adjusting your filters' 
                    : 'No practice sessions have been recorded yet'}
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Session Type</TableHead>
                        <TableHead>Lesson</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Metrics</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{session.user?.name || session.user?.username || 'Unknown'}</span>
                              <span className="text-xs text-muted-foreground">
                                {session.user?.email || ''}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn('capitalize', getSessionTypeColor(session.session_type))}>
                              {session.session_type?.replace('_', ' ') || 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {session.lesson_title ? (
                              <span className="text-sm">{session.lesson_title}</span>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className={cn('font-semibold', getScoreColor(session.score || 0))}>
                              {session.score?.toFixed(1) || 0}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {formatDuration(session.duration_minutes || 0)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                              {session.words_practiced > 0 && (
                                <span>Words: {session.words_practiced}</span>
                              )}
                              {session.sentences_practiced > 0 && (
                                <span>Sentences: {session.sentences_practiced}</span>
                              )}
                              {session.mistakes_count > 0 && (
                                <span className="text-red-600 dark:text-red-400">
                                  Mistakes: {session.mistakes_count}
                                </span>
                              )}
                              {session.points_earned > 0 && (
                                <span className="text-green-600 dark:text-green-400">
                                  +{session.points_earned} pts
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {session.session_date ? formatDate(session.session_date) : '—'}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewSession(session.id)}
                              disabled={actionLoading === session.id}
                              title="View session details"
                              className="h-8 w-8"
                            >
                              {actionLoading === session.id ? (
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
                      ({pagination.total} total sessions)
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

        {/* Session Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Practice Session Details</DialogTitle>
              <DialogDescription>
                Detailed information about this practice session
              </DialogDescription>
            </DialogHeader>
            {selectedSession && (
              <div className="space-y-4">
                {/* User Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">User Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Name:</span> {selectedSession.user?.name || selectedSession.user?.username}</p>
                      <p><span className="text-muted-foreground">Email:</span> {selectedSession.user?.email}</p>
                      <p><span className="text-muted-foreground">Username:</span> {selectedSession.user?.username}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Session Information</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">Type:</span>{' '}
                        <Badge className={cn('capitalize ml-2', getSessionTypeColor(selectedSession.session_type))}>
                          {selectedSession.session_type?.replace('_', ' ')}
                        </Badge>
                      </p>
                      <p><span className="text-muted-foreground">Date:</span> {selectedSession.session_date ? formatDate(selectedSession.session_date) : '—'}</p>
                      <p><span className="text-muted-foreground">Duration:</span> {formatDuration(selectedSession.duration_minutes || 0)}</p>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Performance Metrics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground">Score</div>
                      <div className={cn('text-2xl font-bold', getScoreColor(selectedSession.score || 0))}>
                        {selectedSession.score?.toFixed(1) || 0}%
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground">Points Earned</div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        +{selectedSession.points_earned || 0}
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground">Words Practiced</div>
                      <div className="text-2xl font-bold">{selectedSession.words_practiced || 0}</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground">Sentences</div>
                      <div className="text-2xl font-bold">{selectedSession.sentences_practiced || 0}</div>
                    </div>
                  </div>
                  {selectedSession.mistakes_count > 0 && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                      <div className="text-sm">
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          Mistakes: {selectedSession.mistakes_count}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Lesson Info */}
                {selectedSession.lesson && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Lesson Information</h4>
                    <div className="space-y-1 text-sm p-3 bg-muted rounded-lg">
                      <p><span className="text-muted-foreground">Title:</span> {selectedSession.lesson.title}</p>
                      <p><span className="text-muted-foreground">Type:</span> {selectedSession.lesson.lesson_type}</p>
                      <p><span className="text-muted-foreground">Content:</span> {selectedSession.lesson.content_type}</p>
                    </div>
                  </div>
                )}

                {/* Additional Details */}
                {selectedSession.details && Object.keys(selectedSession.details).length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Additional Details</h4>
                    <div className="p-3 bg-muted rounded-lg">
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(selectedSession.details, null, 2)}
                      </pre>
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
