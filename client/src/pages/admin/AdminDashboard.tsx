import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  UserPlus, 
  BookOpen, 
  Clock, 
  TrendingUp,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import AdminAPI from '@/services/AdminApiService';
import { RecentActivity } from '@/components/admin/RecentActivity';
import { UserGrowthChart } from '@/components/admin/UserGrowthChart';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getDashboardStats();
      
      if (response.success) {
        setStats(response.data);
      } else {
        // Check if it's an authentication error
        if (response.error?.response?.status === 401 || response.message?.includes('401')) {
          setError('Authentication failed. Please log out and log back in.');
          // Redirect to login after a delay
          setTimeout(() => {
            window.location.href = '/admin/login';
          }, 2000);
        } else {
          setError(response.message || 'Failed to load dashboard stats');
        }
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError('Authentication failed. Please log out and log back in.');
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 2000);
      } else {
        setError(err?.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your Elora learning platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                  {card.trend !== null && card.trendLabel && (
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-500">
                        {card.trend} {card.trendLabel}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
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
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest platform activities</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivity activities={stats?.recent_activities || []} />
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lessons Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="text-sm font-medium">
                    {stats?.lessons?.completed || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Progress</span>
                  <span className="text-sm font-medium">
                    {stats?.lessons?.total_progress || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Completion Rate</span>
                  <Badge variant="secondary">
                    {stats?.lessons?.completion_rate || 0}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">User Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats?.users?.level_distribution?.map((level: any) => (
                  <div key={level.level} className="flex justify-between">
                    <span className="text-sm text-muted-foreground capitalize">
                      {level.level}
                    </span>
                    <Badge variant="outline">{level.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Platform Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Operational</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Users</span>
                  <span className="text-sm font-medium">
                    {stats?.users?.active || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Lessons</span>
                  <span className="text-sm font-medium">
                    {stats?.lessons?.active || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

