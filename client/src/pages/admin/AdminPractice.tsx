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
  Users,
  Award,
  Activity
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
  const [stats, setStats] = useState<any>({
    overall: {
      total_sessions: 0,
      total_time_minutes: 0,
      total_time_hours: 0,
      avg_score: 0,
      avg_duration_minutes: 0,
    },
    recent: {
      sessions_last_7: 0,
      sessions_last_30: 0,
      time_last_7_minutes: 0,
      time_last_7_hours: 0,
      time_last_30_minutes: 0,
      time_last_30_hours: 0,
      active_users_7: 0,
      active_users_30: 0,
    },
    type_distribution: [],
    daily_stats: [],
    active_users: [],
  });
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
      
      console.log('[AdminPractice] Loading sessions with params:', {
        search: debouncedSearch,
        page,
        page_size: 20,
        session_type: sessionTypeFilter || undefined,
      });
      
      console.log('[AdminPractice] Calling AdminAPI.getPracticeSessions...');
      const response = await AdminAPI.getPracticeSessions({
        search: debouncedSearch,
        page,
        page_size: 20,
        session_type: sessionTypeFilter || undefined,
      });

      console.log('[AdminPractice] Full Response:', JSON.stringify(response, null, 2));

      if (response.success) {
        const data = response.data;
        console.log('[AdminPractice] Data received:', {
          sessionsCount: data.sessions?.length || 0,
          pagination: data.pagination,
          sessions: data.sessions,
          fullData: data,
        });
        
        // Handle both direct response and nested data structure
        const sessions = data.sessions || data?.data?.sessions || [];
        const pagination = data.pagination || data?.data?.pagination || null;
        
        setSessions(sessions);
        setPagination(pagination);
        
        if (sessions.length === 0) {
          console.log('[AdminPractice] No sessions found. This could mean:');
          console.log('1. No practice sessions exist in the database');
          console.log('2. User is not authenticated as admin');
          console.log('3. API returned empty result');
        }
      } else {
        const errorMessage = response.message || 'Failed to load practice sessions';
        console.error('[AdminPractice] Error response:', response);
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
      console.error('[AdminPractice] Exception:', error);
      console.error('[AdminPractice] Error details:', {
        message: errorMessage,
        status: error?.response?.status,
        data: error?.response?.data,
      });
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
      console.log('[AdminPractice] Loading stats...');
      console.log('[AdminPractice] Calling AdminAPI.getPracticeStats...');
      const response = await AdminAPI.getPracticeStats();
      console.log('[AdminPractice] Stats response:', JSON.stringify(response, null, 2));
      if (response.success && response.data) {
        console.log('[AdminPractice] Stats data:', response.data);
        // Ensure we have the proper structure even if some fields are missing
        const statsData = {
          overall: {
            total_sessions: response.data.overall?.total_sessions || 0,
            total_time_minutes: response.data.overall?.total_time_minutes || 0,
            total_time_hours: response.data.overall?.total_time_hours || 0,
            avg_score: response.data.overall?.avg_score || 0,
            avg_duration_minutes: response.data.overall?.avg_duration_minutes || 0,
          },
          recent: {
            sessions_last_7: response.data.recent?.sessions_last_7 || 0,
            sessions_last_30: response.data.recent?.sessions_last_30 || 0,
            time_last_7_minutes: response.data.recent?.time_last_7_minutes || 0,
            time_last_7_hours: response.data.recent?.time_last_7_hours || 0,
            time_last_30_minutes: response.data.recent?.time_last_30_minutes || 0,
            time_last_30_hours: response.data.recent?.time_last_30_hours || 0,
            active_users_7: response.data.recent?.active_users_7 || 0,
            active_users_30: response.data.recent?.active_users_30 || 0,
          },
          type_distribution: response.data.type_distribution || [],
          daily_stats: response.data.daily_stats || [],
          active_users: response.data.active_users || [],
        };
        setStats(statsData);
      } else {
        console.error('[AdminPractice] Stats error:', response.message);
        // Set default empty stats structure
        setStats({
          overall: {
            total_sessions: 0,
            total_time_minutes: 0,
            total_time_hours: 0,
            avg_score: 0,
            avg_duration_minutes: 0,
          },
          recent: {
            sessions_last_7: 0,
            sessions_last_30: 0,
            time_last_7_minutes: 0,
            time_last_7_hours: 0,
            time_last_30_minutes: 0,
            time_last_30_hours: 0,
            active_users_7: 0,
            active_users_30: 0,
          },
          type_distribution: [],
          daily_stats: [],
          active_users: [],
        });
      }
    } catch (error: any) {
      console.error('[AdminPractice] Stats exception:', error);
      console.error('[AdminPractice] Stats error details:', {
        message: error?.response?.data?.message || error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      // Set default empty stats structure on error
      setStats({
        overall: {
          total_sessions: 0,
          total_time_minutes: 0,
          total_time_hours: 0,
          avg_score: 0,
          avg_duration_minutes: 0,
        },
        recent: {
          sessions_last_7: 0,
          sessions_last_30: 0,
          time_last_7_minutes: 0,
          time_last_7_hours: 0,
          time_last_30_minutes: 0,
          time_last_30_hours: 0,
          active_users_7: 0,
          active_users_30: 0,
        },
        type_distribution: [],
        daily_stats: [],
      });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('[AdminPractice] Component mounted, loading data...');
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    console.log('[AdminPractice] Loading stats...');
    loadStats();
  }, [loadStats]);

  // Auto-refresh every 30 seconds for real-time data
  useEffect(() => {
    console.log('[AdminPractice] Setting up auto-refresh interval (30s)');
    const refreshInterval = setInterval(() => {
      console.log('[AdminPractice] Auto-refreshing data...');
      loadSessions(true);
      loadStats();
    }, 30000); // 30 seconds
    
    return () => {
      console.log('[AdminPractice] Cleaning up auto-refresh interval');
      clearInterval(refreshInterval);
    };
  }, [loadSessions, loadStats]); // Use the callback functions directly

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
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(stats?.overall?.total_sessions ?? 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.recent?.sessions_last_30 ?? 0} in last 30 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Practice Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{((stats?.overall?.total_time_hours ?? 0) as number).toFixed(1)}h</div>
                <p className="text-xs text-muted-foreground">
                  {((stats?.recent?.time_last_30_hours ?? 0) as number).toFixed(1)}h in last 30 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{((stats?.overall?.avg_score ?? 0) as number).toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Avg duration: {((stats?.overall?.avg_duration_minutes ?? 0) as number).toFixed(1)}m
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.recent?.active_users_30 ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.recent?.active_users_7 ?? 0} in last 7 days
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

        {/* Active Users Section */}
        {stats && stats.active_users && stats.active_users.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Users</CardTitle>
                  <CardDescription>
                    All users with practice sessions ({stats.active_users.length} total)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Profile</TableHead>
                      <TableHead>Total Sessions</TableHead>
                      <TableHead>Practice Time</TableHead>
                      <TableHead>Average Score</TableHead>
                      <TableHead>Last 30 Days</TableHead>
                      <TableHead>Last Session</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.active_users.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{user.name || user.username}</span>
                            <span className="text-xs text-muted-foreground">
                              {user.email}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              @{user.username}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-xs">
                            {user.profile?.level && (
                              <Badge variant="outline" className="w-fit capitalize">
                                {user.profile.level}
                              </Badge>
                            )}
                            {user.profile?.age_range && (
                              <span className="text-muted-foreground">
                                Age: {user.profile.age_range}
                              </span>
                            )}
                            {user.profile?.points !== undefined && (
                              <span className="text-muted-foreground">
                                {user.profile.points} pts
                              </span>
                            )}
                            {user.profile?.current_streak > 0 && (
                              <span className="text-orange-600 dark:text-orange-400">
                                🔥 {user.profile.current_streak} day streak
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold">
                            {user.practice_stats?.total_sessions || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {((user.practice_stats?.total_time_hours ?? 0) as number).toFixed(1)}h
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ({user.practice_stats?.total_time_minutes || 0} min)
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={cn('font-semibold', getScoreColor(user.practice_stats?.avg_score || 0))}>
                            {((user.practice_stats?.avg_score ?? 0) as number).toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <span>{user.practice_stats?.sessions_last_30 || 0} sessions</span>
                            <span className="text-xs text-muted-foreground">
                              {((user.practice_stats?.time_last_30_hours ?? 0) as number).toFixed(1)}h
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {user.last_session_date ? formatDate(user.last_session_date) : 'Never'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.is_active ? "default" : "secondary"}
                            className={cn(
                              user.is_active 
                                ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400"
                            )}
                          >
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
            <AlertDescription className="flex flex-col gap-2">
              <span className="font-semibold">Error loading practice sessions:</span>
              <span>{error}</span>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSessions()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('=== DEBUG INFO ===');
                    console.log('Current user token:', localStorage.getItem('speakbee_auth_token')?.substring(0, 20) + '...');
                    console.log('Is admin:', localStorage.getItem('speakbee_is_admin'));
                    console.log('API Base URL:', import.meta.env.VITE_API_URL || 'http://localhost:8000/api');
                  }}
                >
                  Debug Info
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Debug Info - Show in development */}
        {import.meta.env.DEV && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="text-xs space-y-1">
                <div><strong>API URL:</strong> {import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}</div>
                <div><strong>Has Token:</strong> {localStorage.getItem('speakbee_auth_token') ? 'Yes' : 'No'}</div>
                <div><strong>Is Admin:</strong> {localStorage.getItem('speakbee_is_admin') || 'Unknown'}</div>
                <div><strong>Total Sessions:</strong> {pagination?.total ?? 'Loading...'}</div>
                <div><strong>Stats Loaded:</strong> {stats ? 'Yes' : 'No'}</div>
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
