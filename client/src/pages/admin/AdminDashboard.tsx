import { useEffect, useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Users, 
  UserPlus, 
  BookOpen, 
  Clock, 
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Activity,
  RefreshCw,
  Download,
  Search,
  X
} from 'lucide-react';
import AdminAPI from '@/services/AdminApiService';
import { RecentActivity } from '@/components/admin/RecentActivity';
import { UserGrowthChart } from '@/components/admin/UserGrowthChart';
import { LevelsBarChart } from '@/components/admin/LevelsBarChart';
import { LessonsCompletionMini } from '@/components/admin/LessonsCompletionMini';
import { ActivityDetailDialog } from '@/components/admin/ActivityDetailDialog';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [healthStatus, setHealthStatus] = useState<{ status: string; healthy: boolean; timestamp: Date | null }>({ status: 'checking', healthy: false, timestamp: null });
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'in_process' | 'completed' | 'unassigned' | 'need_info' | 'all'>('all');
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());
  const [monthFilter, setMonthFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [monthsRange, setMonthsRange] = useState<number>(12);
  const [activityType, setActivityType] = useState<string>('all');
  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitiesError, setActivitiesError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, page_size: 50, total: 0, pages: 0 });
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Generate year options (current year and 5 years back)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => currentYear - i);
  }, []);

  const monthOptions = ['January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'];

  useEffect(() => {
    // Wait a moment to ensure token is stored after login redirect
    const token = localStorage.getItem('speakbee_auth_token');
    if (!token || token === 'local-token') {
      console.warn('⚠️ No valid token found, redirecting to login');
      window.location.href = '/admin/login';
      return;
    }
    
    // Small delay to ensure token is ready
    const timer = setTimeout(() => {
      loadStats();
      checkHealth();
      loadActivities();
    }, 100);
    
    // Auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      loadStats(true);
      checkHealth();
      loadActivities(true);
    }, 30000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(refreshInterval);
    };
  }, [monthsRange]);

  // Load activities when filters change
  useEffect(() => {
    loadActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, yearFilter, monthFilter, debouncedSearch, currentPage]);

  const loadStats = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      const response = await AdminAPI.getDashboardStats({ months: monthsRange });
      
      if (response.success) {
        setStats(response.data);
        setError('');
      } else {
        // Check if it's an authentication error
        if (response.error?.response?.status === 401 || response.message?.includes('401')) {
          setError('Authentication failed. Please log out and log back in.');
          // Redirect to login after a delay
          setTimeout(() => {
            window.location.href = '/admin/login';
          }, 2000);
        } else if (!silent) {
          setError(response.message || 'Failed to load dashboard stats');
        }
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError('Authentication failed. Please log out and log back in.');
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 2000);
      } else if (!silent) {
        setError(err?.message || 'An error occurred');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  const checkHealth = async () => {
    try {
      const response = await AdminAPI.getHealth();
      if (response.success && response.data) {
        setHealthStatus({
          status: response.data.status || 'healthy',
          healthy: response.data.status === 'healthy',
          timestamp: new Date()
        });
      } else {
        setHealthStatus({ status: 'unhealthy', healthy: false, timestamp: new Date() });
      }
    } catch (err) {
      setHealthStatus({ status: 'unreachable', healthy: false, timestamp: new Date() });
    }
  };

  const loadActivities = async (silent = false) => {
    try {
      if (!silent) {
        setActivitiesLoading(true);
      }
      setActivitiesError('');
      
      const response = await AdminAPI.getActivities({
        status: statusFilter,
        year: yearFilter,
        month: monthFilter || undefined,
        search: debouncedSearch || undefined,
        page: currentPage,
        page_size: 50
      });

      if (response.success && response.data) {
        setActivities(response.data.activities || []);
        setPagination(response.data.pagination || { page: 1, page_size: 50, total: 0, pages: 0 });
      } else {
        setActivitiesError(response.message || 'Failed to load activities');
        setActivities([]);
      }
    } catch (err: any) {
      setActivitiesError(err?.message || 'An error occurred while loading activities');
      setActivities([]);
    } finally {
      if (!silent) {
        setActivitiesLoading(false);
      }
    }
  };

  const handleExport = async () => {
    try {
      const response = await AdminAPI.exportActivities({
        status: statusFilter,
        year: yearFilter,
        month: monthFilter || undefined,
        search: debouncedSearch || undefined
      });
      
      if (!response.success) {
        alert(response.message || 'Export failed');
      }
    } catch (err: any) {
      alert(err?.message || 'Export failed');
    }
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setYearFilter(new Date().getFullYear());
    setMonthFilter('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users?.total || 0,
      description: `${stats?.users?.active || 0} active users`,
      icon: Users,
      trend: stats?.users?.new_today || 0,
      trendLabel: 'new today'
    },
    {
      title: 'New This Month',
      value: stats?.users?.new_this_month || 0,
      description: 'Users registered this month',
      icon: UserPlus,
      trend: stats?.users?.new_today || 0,
      trendLabel: 'new today'
    },
    {
      title: 'Total Lessons',
      value: stats?.lessons?.total || 0,
      description: `${stats?.lessons?.active || 0} active lessons`,
      icon: BookOpen,
      trend: stats?.lessons?.completion_rate || 0,
      trendLabel: '% completion rate'
    },
    {
      title: 'Practice Time',
      value: `${Math.round(stats?.practice?.total_time_hours || 0)}h`,
      description: `${stats?.practice?.total_sessions || 0} total sessions`,
      icon: Clock,
      trend: null,
      trendLabel: null
    },
  ];


  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Hero Header with stats */}
        <div className="admin-hero p-6 lg:p-8">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Overview</h1>
              <p className="text-white/80">Admin insights and document processing</p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => {
                  loadStats();
                  checkHealth();
                }}
                disabled={refreshing || loading}
                className="chip bg-white/90 text-black hover:bg-white disabled:opacity-50 flex items-center gap-1"
                title="Refresh data"
              >
                <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <label className="text-white/80 text-sm">Range</label>
              <select value={monthsRange} onChange={(e)=>setMonthsRange(Number(e.target.value))} className="chip bg-white text-black">
                {[6,12,18,24].map(m=> <option key={m} value={m}>Last {m} months</option>)}
              </select>
            </div>
          </div>
          {/* Place the card-style stats inside the hero */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card key={index} className="bg-white text-gray-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    <Icon className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                    <p className="text-xs text-gray-500">{card.description}</p>
                    {card.trend !== null && card.trendLabel && (
                      <div className="flex items-center gap-1 mt-2">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-600">
                          {card.trend} {card.trendLabel}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>


        {/* Charts and Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* User Growth Chart */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>User registrations by month</CardDescription>
            </CardHeader>
            <CardContent>
              <UserGrowthChart data={stats?.users?.growth_by_month || []} />
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="md:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest platform activities</CardDescription>
                </div>
                <select value={activityType} onChange={(e)=>setActivityType(e.target.value)} className="chip bg-white text-black">
                  <option value="all">All</option>
                  <option value="user_registered">Registrations</option>
                  <option value="lesson_completed">Completions</option>
                  <option value="practice_session">Practice</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <RecentActivity activities={(stats?.recent_activities || []).filter((a:any)=> activityType==='all' ? true : a.type===activityType)} />
            </CardContent>
          </Card>
        </div>

        {/* Lessons Progress, User Levels, Platform Health - Enhanced */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Lessons Progress Card */}
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-lg font-semibold">Lessons Progress</CardTitle>
                <CardDescription>Completion metrics and trends</CardDescription>
              </div>
              <BookOpen className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <LessonsCompletionMini
                completionRate={stats?.lessons?.completion_rate || 0}
                completedLast7={stats?.lessons?.completed_last_7 || 0}
                completedLast30={stats?.lessons?.completed_last_30 || 0}
              />
              <div className="mt-4 space-y-3 border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Completed</span>
                  <span className="text-sm font-semibold">
                    {stats?.lessons?.completed || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Progress</span>
                  <span className="text-sm font-semibold">
                    {stats?.lessons?.total_progress || 0}
                  </span>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="font-medium">{stats?.lessons?.completion_rate || 0}%</span>
                  </div>
                  <Progress value={stats?.lessons?.completion_rate || 0} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Levels Card */}
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-lg font-semibold">User Levels</CardTitle>
                <CardDescription>Distribution across all levels</CardDescription>
              </div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {stats?.levels ? (
                <LevelsBarChart data={stats.levels} />
              ) : stats?.users?.level_distribution ? (
                <LevelsBarChart data={stats.users.level_distribution} />
              ) : (
                <div className="h-[260px] flex items-center justify-center text-muted-foreground">
                  No level data available
                </div>
              )}
              <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-4">
                {stats?.levels && (
                  <>
                    <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                      <span className="text-xs text-muted-foreground">Kids 4–10</span>
                      <Badge variant="secondary" className="text-xs">{stats.levels.kids_4_10 || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                      <span className="text-xs text-muted-foreground">Kids 11–17</span>
                      <Badge variant="secondary" className="text-xs">{stats.levels.kids_11_17 || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                      <span className="text-xs text-muted-foreground">Beginner</span>
                      <Badge variant="secondary" className="text-xs">{stats.levels.adults_beginner || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                      <span className="text-xs text-muted-foreground">Intermediate</span>
                      <Badge variant="secondary" className="text-xs">{stats.levels.adults_intermediate || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                      <span className="text-xs text-muted-foreground">Advanced</span>
                      <Badge variant="secondary" className="text-xs">{stats.levels.adults_advanced || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                      <span className="text-xs text-muted-foreground">IELTS</span>
                      <Badge variant="secondary" className="text-xs">{stats.levels.ielts || 0}</Badge>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Platform Health Card */}
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-lg font-semibold">Platform Health</CardTitle>
                <CardDescription>System status and metrics</CardDescription>
              </div>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Health Status */}
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    {healthStatus.healthy ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <div className="font-medium text-sm">API Status</div>
                      <div className="text-xs text-muted-foreground capitalize">{healthStatus.status}</div>
                    </div>
                  </div>
                  <Badge variant={healthStatus.healthy ? "default" : "destructive"}>
                    {healthStatus.healthy ? "Operational" : "Issues"}
                  </Badge>
                </div>

                {/* Key Metrics */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 rounded-md bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Active Users</span>
                    </div>
                    <span className="text-sm font-semibold">{stats?.users?.active || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-md bg-muted/50">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Active Lessons</span>
                    </div>
                    <span className="text-sm font-semibold">{stats?.lessons?.active || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-md bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">DAU (7d)</span>
                    </div>
                    <span className="text-sm font-semibold">{stats?.engagement?.dau_7 || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-md bg-muted/50">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Avg Session</span>
                    </div>
                    <span className="text-sm font-semibold">{Math.round(stats?.engagement?.avg_session_minutes || 0)}m</span>
                  </div>
                </div>

                {/* Refresh Indicator */}
                {refreshing && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>Refreshing data...</span>
                  </div>
                )}
                {healthStatus.timestamp && !refreshing && (
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Last updated: {healthStatus.timestamp.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Professional Filters Section */}
        <Card className="bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Activities & Documents</CardTitle>
                <CardDescription>Filter and manage user activities and registrations</CardDescription>
              </div>
              {(statusFilter !== 'all' || monthFilter || searchQuery || yearFilter !== new Date().getFullYear()) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground mr-2">Status:</span>
                {[
                  { value: 'all', label: 'All' },
                  { value: 'in_process', label: 'In Process' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'need_info', label: 'Need Info' },
                  { value: 'unassigned', label: 'Unassigned' }
                ].map(({ value, label }) => (
                  <Button
                    key={value}
                    variant={statusFilter === value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setStatusFilter(value as any);
                      setCurrentPage(1);
                    }}
                    className={`${
                      statusFilter === value
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'hover:bg-accent'
                    }`}
                  >
                    {label}
                  </Button>
                ))}
              </div>

              {/* Search and Date Filters */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, or ID..."
                    className="pl-9"
                  />
                </div>

                {/* Year Select */}
                <Select
                  value={yearFilter.toString()}
                  onValueChange={(value) => {
                    setYearFilter(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Month Select */}
                <Select
                  value={monthFilter || 'all'}
                  onValueChange={(value) => {
                    setMonthFilter(value === 'all' ? '' : value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {monthOptions.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Export Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="ml-auto"
                  disabled={activitiesLoading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              {/* Results Count */}
              {!activitiesLoading && (
                <div className="text-sm text-muted-foreground">
                  Showing {activities.length} of {pagination.total} results
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activities Table */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Activities & Registrations</CardTitle>
            <CardDescription>View and manage user activities and lesson progress</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {activitiesLoading ? (
              <div className="p-8 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : activitiesError ? (
              <div className="p-8 text-center">
                <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{activitiesError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadActivities()}
                  className="mt-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            ) : activities.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">No activities found matching your filters.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="text-left px-5 py-3 font-medium text-muted-foreground">Name</th>
                        <th className="text-left px-5 py-3 font-medium text-muted-foreground">Email</th>
                        <th className="text-left px-5 py-3 font-medium text-muted-foreground">Reference ID</th>
                        <th className="text-left px-5 py-3 font-medium text-muted-foreground">Type</th>
                        <th className="text-left px-5 py-3 font-medium text-muted-foreground">Service Date</th>
                        <th className="text-left px-5 py-3 font-medium text-muted-foreground">Assigned Date</th>
                        <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                        <th className="text-left px-5 py-3 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activities.map((activity, idx) => (
                        <tr
                          key={activity.id}
                          className={`border-b hover:bg-muted/30 transition-colors ${
                            idx % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                          }`}
                        >
                          <td className="px-5 py-3 font-medium">{activity.name || 'N/A'}</td>
                          <td className="px-5 py-3 text-muted-foreground">{activity.email || 'N/A'}</td>
                          <td className="px-5 py-3">
                            <code className="text-xs bg-muted px-2 py-1 rounded">{activity.mrn || activity.document_id}</code>
                          </td>
                          <td className="px-5 py-3">
                            <Badge variant="outline" className="text-xs">
                              {activity.type === 'user_registration' ? 'Registration' : 'Lesson Progress'}
                            </Badge>
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">{activity.service_date || 'N/A'}</td>
                          <td className="px-5 py-3 text-muted-foreground">{activity.assigned_date || 'N/A'}</td>
                          <td className="px-5 py-3">
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
                              {activity.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-5 py-3">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8"
                              onClick={() => {
                                setSelectedActivityId(activity.id);
                                setIsDetailDialogOpen(true);
                              }}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-between px-5 py-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.pages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1 || activitiesLoading}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                        disabled={currentPage === pagination.pages || activitiesLoading}
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

        {/* Activity Detail Dialog */}
        <ActivityDetailDialog
          activityId={selectedActivityId}
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
        />
      </div>
    </AdminLayout>
  );
}

