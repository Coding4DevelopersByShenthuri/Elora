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
  const [statusFilter, setStatusFilter] = useState<'in_process' | 'completed' | 'unassigned' | 'need_info' | 'all'>('in_process');
  const [yearFilter, setYearFilter] = useState<number>(2025);
  const [monthFilter, setMonthFilter] = useState<string>('August');
  const [searchQuery, setSearchQuery] = useState('');

  const documents = [
    { id: 'fres2uf4sws', name: 'Albert Flores', dob: '8/15/17', mrn: '521', serviceDate: '7/18/2023', assignedDate: '12/4/2023', status: 'in_process' },
    { id: 'css32uf43E', name: 'Eleanor Pena', dob: '7/27/13', mrn: '521', serviceDate: '8/21/2023', assignedDate: '8/30/2023', status: 'in_process' },
    { id: 'asws4uf433', name: 'Floyd Miles', dob: '6/19/14', mrn: '521', serviceDate: '5/30/2023', assignedDate: '5/19/2023', status: 'in_process' },
    { id: 'saw32u4fsd', name: 'Cameron Williamson', dob: '9/18/16', mrn: '521', serviceDate: '4/21/2023', assignedDate: '1/15/2023', status: 'completed' },
    { id: 'swe2u4f33y', name: 'Courtney Henry', dob: '6/21/19', mrn: '521', serviceDate: '12/10/2023', assignedDate: '5/27/2024', status: 'need_info' },
  ];

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
        {/* Hero Header with stats */}
        <div className="admin-hero p-6 lg:p-8">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Overview</h1>
              <p className="text-white/80">Admin insights and document processing</p>
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

        {/* Filters like the reference design */}
        <div className="soft-card bg-card p-4 md:p-5">
          <div className="flex flex-wrap items-center gap-3">
            <button className={`chip ${statusFilter==='in_process'?'active':''}`} onClick={()=>setStatusFilter('in_process')}>In Process</button>
            <button className={`chip ${statusFilter==='completed'?'active':''}`} onClick={()=>setStatusFilter('completed')}>Completed</button>
            <button className={`chip ${statusFilter==='need_info'?'active':''}`} onClick={()=>setStatusFilter('need_info')}>Need More Info</button>
            <button className={`chip ${statusFilter==='unassigned'?'active':''}`} onClick={()=>setStatusFilter('unassigned')}>Unassigned</button>

            <div className="ml-auto flex items-center gap-2">
              <select value={yearFilter} onChange={(e)=>setYearFilter(Number(e.target.value))} className="chip bg-white">
                {[2025,2024,2023].map(y=> <option key={y} value={y}>{y}</option>)}
              </select>
              <select value={monthFilter} onChange={(e)=>setMonthFilter(e.target.value)} className="chip bg-white">
                {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m=> <option key={m} value={m}>{m}</option>)}
              </select>
              <input value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} placeholder="Search" className="chip bg-white" />
              <button className="chip" title="Download">⤓</button>
            </div>
          </div>
        </div>

        {/* Documents Table (mock) */}
        <div className="soft-card bg-card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h3 className="font-semibold">Documents</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Patient Name</th>
                  <th className="text-left px-5 py-3 font-medium">Date of Birth</th>
                  <th className="text-left px-5 py-3 font-medium">MRN</th>
                  <th className="text-left px-5 py-3 font-medium">Date of Service</th>
                  <th className="text-left px-5 py-3 font-medium">Assigned Date</th>
                  <th className="text-left px-5 py-3 font-medium">Document ID</th>
                  <th className="text-left px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents
                  .filter(d => statusFilter==='all' || d.status===statusFilter)
                  .filter(d => !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.id.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((d, idx) => (
                  <tr key={d.id} className={idx%2===2? 'bg-muted/30':''}>
                    <td className="px-5 py-3">{d.name}</td>
                    <td className="px-5 py-3">{d.dob}</td>
                    <td className="px-5 py-3">{d.mrn}</td>
                    <td className="px-5 py-3">{d.serviceDate}</td>
                    <td className="px-5 py-3">{d.assignedDate}</td>
                    <td className="px-5 py-3">{d.id}</td>
                    <td className="px-5 py-3">
                      <button className="chip">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

