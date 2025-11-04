import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import AdminAPI from '@/services/AdminApiService';
import { 
  RefreshCw, 
  Clock, 
  Users, 
  Award, 
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Color palette for charts
const COLORS = ['#0C756F', '#FDCF6F', '#000201', '#82ca9d', '#8884d8', '#ffc658', '#ff7c7c', '#8dd1e1'];
const PRACTICE_COLORS = {
  pronunciation: '#8b5cf6',
  conversation: '#3b82f6',
  vocabulary: '#10b981',
  grammar: '#f59e0b',
  listening: '#ec4899',
  reading: '#6366f1',
  exam_practice: '#ef4444'
};

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, [days]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getAnalytics(days);
      
      if (response.success) {
        console.log('[AdminAnalytics] Data received:', {
          hasData: !!response.data,
          timeSeriesLength: response.data?.time_series?.length,
          practiceTrendsLength: response.data?.practice?.trends?.length,
          practiceData: response.data?.practice,
        });
        
        // Validate and log practice trends data
        if (response.data?.practice?.trends) {
          const trends = response.data.practice.trends;
          console.log('[AdminAnalytics] Practice trends sample:', trends.slice(0, 3));
          console.log('[AdminAnalytics] Practice trends validation:', trends.map((item: any) => ({
            date: item.date,
            sessions: typeof item.sessions,
            avg_score: typeof item.avg_score,
            active_users: typeof item.active_users,
          })));
        }
        
        setAnalytics(response.data);
      } else {
        console.error('[AdminAnalytics] API error:', response);
        toast({
          title: 'Error',
          description: response.message || 'Failed to load analytics',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('[AdminAnalytics] Failed to load analytics:', error);
      toast({
        title: 'Error',
        description: error?.message || 'An error occurred while loading analytics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAnalytics();
  };

  if (loading && !analytics) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </AdminLayout>
    );
  }

  const practiceData = analytics?.practice || {};
  const practiceOverall = practiceData.overall || {};
  const practicePeriod = practiceData.period || {};
  const practiceTypeDist = practiceData.type_distribution || [];
  const practiceTrends = practiceData.trends || [];
  const qualityMetrics = practiceData.quality_metrics || {};

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive platform analytics and Practice insights
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={days.toString()} onValueChange={(value) => setDays(parseInt(value))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="180">Last 6 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Practice KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Practice Sessions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{practiceOverall.total_sessions?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {practicePeriod.total_sessions || 0} in selected period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Practice Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(practiceOverall.total_time_minutes || 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDuration(practicePeriod.total_time_minutes || 0)} in selected period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{practicePeriod.avg_score?.toFixed(1) || 0}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Overall: {practiceOverall.avg_score?.toFixed(1) || 0}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{practicePeriod.active_users || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {practiceOverall.total_users_practiced || 0} total users practiced
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Practice Quality Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">High Score Sessions</CardTitle>
              <CardDescription>Score ≥ 80%</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {qualityMetrics.high_score || 0}
              </div>
              {practicePeriod.total_sessions > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {((qualityMetrics.high_score || 0) / practicePeriod.total_sessions * 100).toFixed(1)}% of total
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Medium Score Sessions</CardTitle>
              <CardDescription>Score 60-79%</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {qualityMetrics.medium_score || 0}
              </div>
              {practicePeriod.total_sessions > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {((qualityMetrics.medium_score || 0) / practicePeriod.total_sessions * 100).toFixed(1)}% of total
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Low Score Sessions</CardTitle>
              <CardDescription>Score &lt; 60%</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {qualityMetrics.low_score || 0}
              </div>
              {practicePeriod.total_sessions > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {((qualityMetrics.low_score || 0) / practicePeriod.total_sessions * 100).toFixed(1)}% of total
                </p>
              )}
            </CardContent>
          </Card>

          {qualityMetrics.no_score > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">No Score Sessions</CardTitle>
                <CardDescription>Sessions without scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                  {qualityMetrics.no_score || 0}
                </div>
                {practicePeriod.total_sessions > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {((qualityMetrics.no_score || 0) / practicePeriod.total_sessions * 100).toFixed(1)}% of total
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Practice Trends Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Practice Trends Over Time</CardTitle>
            <CardDescription>
              Daily practice sessions, average scores, and active users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {practiceTrends && practiceTrends.length > 0 ? (
              <div style={{ width: '100%', height: '400px', minHeight: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={practiceTrends.map((item: any) => ({
                      ...item,
                      sessions: Number(item.sessions) || 0,
                      avg_score: Number(item.avg_score) || 0,
                      active_users: Number(item.active_users) || 0,
                    }))} 
                    margin={{ top: 10, right: 30, left: 0, bottom: 80 }}
                  >
                  <defs>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0C756F" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0C756F" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FDCF6F" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FDCF6F" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="date" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fill: 'currentColor' }}
                    tickFormatter={(value) => {
                      try {
                        return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      } catch {
                        return value;
                      }
                    }}
                  />
                  <YAxis 
                    yAxisId="left" 
                    tick={{ fill: 'currentColor' }}
                    label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    domain={[0, 100]} 
                    tick={{ fill: 'currentColor' }}
                    label={{ value: 'Score (%)', angle: 90, position: 'insideRight' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc' }}
                    labelFormatter={(value) => {
                      try {
                        return new Date(value).toLocaleDateString();
                      } catch {
                        return value;
                      }
                    }}
                  />
                  <Legend />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="sessions" 
                    stroke="#0C756F" 
                    strokeWidth={2}
                    fillOpacity={0.6}
                    fill="url(#colorSessions)"
                    name="Sessions"
                    dot={{ fill: '#0C756F', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Area 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="avg_score" 
                    stroke="#FDCF6F" 
                    strokeWidth={2}
                    fillOpacity={0.6}
                    fill="url(#colorScore)"
                    name="Avg Score (%)"
                    dot={{ fill: '#FDCF6F', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="active_users" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="Active Users"
                    dot={{ fill: '#82ca9d', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                No practice data available for the selected period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Practice Type Distribution */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Practice Session Types</CardTitle>
              <CardDescription>Distribution by session type</CardDescription>
            </CardHeader>
            <CardContent>
              {practiceTypeDist && practiceTypeDist.length > 0 ? (
                <div style={{ width: '100%', height: '300px', minHeight: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                      data={practiceTypeDist}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ session_type, percent }: any) =>
                        `${session_type.replace('_', ' ')}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {practiceTypeDist.map((entry: any, index: number) => {
                        const color = PRACTICE_COLORS[entry.session_type as keyof typeof PRACTICE_COLORS] || COLORS[index % COLORS.length];
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
              <CardTitle>Practice Type Performance</CardTitle>
              <CardDescription>Average scores by session type</CardDescription>
            </CardHeader>
            <CardContent>
              {practiceTypeDist && practiceTypeDist.length > 0 ? (
                <div style={{ width: '100%', height: '300px', minHeight: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={practiceTypeDist} margin={{ top: 10, right: 30, left: 0, bottom: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="session_type" 
                      angle={-45} 
                      textAnchor="end" 
                      height={100}
                      tickFormatter={(value) => value.replace('_', ' ')}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                      <Bar dataKey="avg_score" fill="#0C756F" name="Avg Score (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Practice Type Details Table */}
        {practiceTypeDist && practiceTypeDist.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Practice Type Statistics</CardTitle>
              <CardDescription>Detailed metrics by session type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium text-sm">Session Type</th>
                      <th className="text-right p-3 font-medium text-sm">Count</th>
                      <th className="text-right p-3 font-medium text-sm">% of Total</th>
                      <th className="text-right p-3 font-medium text-sm">Avg Score</th>
                      <th className="text-right p-3 font-medium text-sm">Avg Duration</th>
                      <th className="text-right p-3 font-medium text-sm">Total Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {practiceTypeDist.map((item: any, index: number) => {
                      const color = PRACTICE_COLORS[item.session_type as keyof typeof PRACTICE_COLORS] || COLORS[index % COLORS.length];
                      const totalCount = practicePeriod.total_sessions || 1;
                      const percentage = ((item.count || 0) / totalCount * 100).toFixed(1);
                      return (
                        <tr key={item.session_type} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full flex-shrink-0" 
                                style={{ backgroundColor: color }}
                              />
                              <span className="capitalize font-medium">
                                {item.session_type.replace('_', ' ')}
                              </span>
                            </div>
                          </td>
                          <td className="text-right p-3 font-medium">{item.count || 0}</td>
                          <td className="text-right p-3 text-muted-foreground">{percentage}%</td>
                          <td className="text-right p-3">
                            <span className={cn(
                              "font-semibold",
                              item.avg_score >= 80 ? "text-green-600 dark:text-green-400" :
                              item.avg_score >= 60 ? "text-yellow-600 dark:text-yellow-400" :
                              "text-red-600 dark:text-red-400"
                            )}>
                              {item.avg_score?.toFixed(1) || 0}%
                            </span>
                          </td>
                          <td className="text-right p-3">{Math.round(item.avg_duration || 0)}m</td>
                          <td className="text-right p-3 font-medium">{formatDuration(item.total_time || 0)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Over Time (Combined) */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Over Time</CardTitle>
            <CardDescription>
              User registrations, lesson completions, and practice sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.time_series && analytics.time_series.length > 0 ? (
              <div style={{ width: '100%', height: '400px', minHeight: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={analytics.time_series.map((item: any) => ({
                      ...item,
                      registrations: Number(item.registrations) || 0,
                      completions: Number(item.completions) || 0,
                      sessions: Number(item.sessions) || 0,
                    }))} 
                    margin={{ top: 10, right: 30, left: 0, bottom: 80 }}
                  >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="date" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fill: 'currentColor' }}
                    tickFormatter={(value) => {
                      try {
                        return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      } catch {
                        return value;
                      }
                    }}
                  />
                  <YAxis tick={{ fill: 'currentColor' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc' }}
                    labelFormatter={(value) => {
                      try {
                        return new Date(value).toLocaleDateString();
                      } catch {
                        return value;
                      }
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="registrations" 
                    stroke="#0C756F" 
                    name="Registrations"
                    strokeWidth={2}
                    dot={{ fill: '#0C756F', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completions" 
                    stroke="#FDCF6F" 
                    name="Completions"
                    strokeWidth={2}
                    dot={{ fill: '#FDCF6F', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sessions" 
                    stroke="#000201" 
                    name="Practice Sessions"
                    strokeWidth={2}
                    dot={{ fill: '#000201', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                No activity data available for the selected period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distribution Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Lesson Types</CardTitle>
              <CardDescription>Distribution by lesson type</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.lesson_type_distribution && analytics.lesson_type_distribution.length > 0 ? (
                <div style={{ width: '100%', height: '300px', minHeight: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                      data={analytics.lesson_type_distribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ lesson_type, percent }: any) =>
                        `${lesson_type}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analytics.lesson_type_distribution.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Types</CardTitle>
              <CardDescription>Distribution by content type</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.content_type_distribution && analytics.content_type_distribution.length > 0 ? (
                <div style={{ width: '100%', height: '300px', minHeight: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.content_type_distribution} margin={{ top: 10, right: 30, left: 0, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="content_type" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                      <Bar dataKey="count" fill="#0C756F" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Lessons */}
        {analytics?.top_lessons && analytics.top_lessons.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Lessons</CardTitle>
              <CardDescription>Most completed lessons</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: '300px', minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.top_lessons}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="title" type="category" width={150} />
                  <Tooltip />
                    <Bar dataKey="completions" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
