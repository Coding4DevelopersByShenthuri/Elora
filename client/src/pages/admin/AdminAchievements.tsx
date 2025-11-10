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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Search, RefreshCw, AlertCircle, Eye, Trophy, TrendingUp, Users,
  Award, Plus, Edit, Trash2, CheckCircle2, Target, Medal, Star, Crown, Coins
} from 'lucide-react';
import AdminAPI from '@/services/AdminApiService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const CATEGORIES = [
  { value: 'practice', label: 'Practice' },
  { value: 'streak', label: 'Streak' },
  { value: 'mastery', label: 'Mastery' },
  { value: 'social', label: 'Social' },
  { value: 'special', label: 'Special' },
];

const TIERS = [
  { value: 'bronze', label: 'Bronze', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400', icon: Medal },
  { value: 'silver', label: 'Silver', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300', icon: Award },
  { value: 'gold', label: 'Gold', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400', icon: Star },
  { value: 'platinum', label: 'Platinum', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400', icon: Crown },
];

const REQUIREMENT_TYPES = [
  { value: 'count', label: 'Count' },
  { value: 'streak', label: 'Streak' },
  { value: 'score', label: 'Score' },
  { value: 'time', label: 'Time' },
  { value: 'custom', label: 'Custom' },
];

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getTierInfo = (tier: string) => TIERS.find(t => t.value === tier) || TIERS[0];

export default function AdminAchievements() {
  const [activeTab, setActiveTab] = useState('achievements');
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [page, setPage] = useState(1);
  const [userAchievementsPage, setUserAchievementsPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [userAchievementsPagination, setUserAchievementsPagination] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({
    achievement_id: '', title: '', description: '', icon: '🏆', category: 'practice',
    tier: 'bronze', points: 0, requirement_type: 'count', requirement_target: 1,
    requirement_metric: 'lessonsCompleted', is_active: true,
  });
  const { toast } = useToast();
  const debouncedSearch = useDebounce(search, 500);

  const loadAchievements = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);
      const response = await AdminAPI.getAchievements({
        search: debouncedSearch, page, page_size: 20,
        category: categoryFilter || undefined, tier: tierFilter || undefined, is_active: activeFilter || undefined,
      });
      if (response.success) {
        const data = response.data;
        setAchievements(data.achievements || []);
        setPagination(data.pagination || null);
      } else {
        if (!silent) {
          setError(response.message || 'Failed to load achievements');
          toast({ title: 'Error', description: response.message || 'Failed to load achievements', variant: 'destructive' });
        }
      }
    } catch (error: any) {
      if (!silent) {
        setError(error?.response?.data?.message || error?.message || 'An error occurred');
        toast({ title: 'Error', description: error?.message || 'An error occurred', variant: 'destructive' });
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [debouncedSearch, page, categoryFilter, tierFilter, activeFilter, toast]);

  const loadUserAchievements = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const response = await AdminAPI.getUserAchievements({ search: debouncedSearch, page: userAchievementsPage, page_size: 20 });
      if (response.success) {
        const data = response.data;
        setUserAchievements(data.user_achievements || []);
        setUserAchievementsPagination(data.pagination || null);
      }
    } catch (error: any) {
      if (!silent) {
        console.error('Error loading user achievements:', error);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [debouncedSearch, userAchievementsPage]);

  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const response = await AdminAPI.getAchievementsStats();
      if (response.success) setStats(response.data);
    } catch (error: any) {
      console.error('Error loading stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => {
    if (activeTab === 'achievements') loadAchievements();
    else if (activeTab === 'user-achievements') loadUserAchievements();
  }, [activeTab, loadAchievements, loadUserAchievements]);

  // Auto-refresh every 30 seconds for real-time data
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      loadStats();
      if (activeTab === 'achievements') loadAchievements(true);
      else if (activeTab === 'user-achievements') loadUserAchievements(true);
    }, 30000); // 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, [activeTab, search, categoryFilter, tierFilter, activeFilter, page, userAchievementsPage]);

  const handleCreate = async () => {
    try {
      setActionLoading(-1);
      const response = await AdminAPI.createAchievement(formData);
      if (response.success) {
        toast({ title: 'Success', description: 'Achievement created successfully' });
        setShowCreateDialog(false);
        resetForm();
        loadAchievements();
        loadStats();
      } else {
        toast({ title: 'Error', description: response.message || 'Failed to create achievement', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to create achievement', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = async () => {
    if (!selectedAchievement) return;
    try {
      setActionLoading(selectedAchievement.id);
      const response = await AdminAPI.updateAchievement(selectedAchievement.id, formData);
      if (response.success) {
        toast({ title: 'Success', description: 'Achievement updated successfully' });
        setShowEditDialog(false);
        setSelectedAchievement(null);
        resetForm();
        loadAchievements();
        loadStats();
      } else {
        toast({ title: 'Error', description: response.message || 'Failed to update achievement', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to update achievement', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedAchievement) return;
    try {
      setActionLoading(selectedAchievement.id);
      const response = await AdminAPI.deleteAchievement(selectedAchievement.id);
      if (response.success) {
        toast({ title: 'Success', description: 'Achievement deactivated successfully' });
        setShowDeleteDialog(false);
        setSelectedAchievement(null);
        loadAchievements();
        loadStats();
      } else {
        toast({ title: 'Error', description: response.message || 'Failed to delete achievement', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to delete achievement', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };
  const handleViewDetails = async (achievementId: number) => {
    try {
      setActionLoading(achievementId);
      const response = await AdminAPI.getAchievement(achievementId);
      if (response.success) {
        setSelectedAchievement(response.data);
        setShowDetailDialog(true);
      } else {
        toast({ title: 'Error', description: response.message || 'Failed to load achievement details', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to load achievement details', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditClick = (achievement: any) => {
    setSelectedAchievement(achievement);
    setFormData({
      achievement_id: achievement.achievement_id, title: achievement.title, description: achievement.description,
      icon: achievement.icon, category: achievement.category, tier: achievement.tier, points: achievement.points,
      requirement_type: achievement.requirement?.type || 'count', requirement_target: achievement.requirement?.target || 1,
      requirement_metric: achievement.requirement?.metric || 'lessonsCompleted', is_active: achievement.is_active,
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      achievement_id: '', title: '', description: '', icon: '🏆', category: 'practice',
      tier: 'bronze', points: 0, requirement_type: 'count', requirement_target: 1,
      requirement_metric: 'lessonsCompleted', is_active: true,
    });
  };
  const handleRefresh = () => {
    if (activeTab === 'achievements') { loadAchievements(); loadStats(); }
    else loadUserAchievements();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Achievements Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage achievement catalog and monitor user achievements
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                loadStats();
                if (activeTab === 'achievements') loadAchievements();
                else loadUserAchievements();
              }}
              disabled={statsLoading || loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${statsLoading || loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {activeTab === 'achievements' && (
              <Button onClick={() => { resetForm(); setShowCreateDialog(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Create Achievement
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Achievements</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : stats ? (
                <>
                  <div className="text-2xl font-bold">{stats.total_achievements || 0}</div>
                  <p className="text-xs text-muted-foreground">{stats.active_achievements || 0} active, {stats.inactive_achievements || 0} inactive</p>
                </>
              ) : (
                <div className="text-2xl font-bold">0</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Unlocks</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : stats ? (
                <>
                  <div className="text-2xl font-bold">{stats.total_unlocked || 0}</div>
                  <p className="text-xs text-muted-foreground">{stats.recent_unlocks_7 || 0} unlocked in last 7 days</p>
                </>
              ) : (
                <div className="text-2xl font-bold">0</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : stats ? (
                <>
                  <div className="text-2xl font-bold">{stats.engagement_rate || 0}%</div>
                  <p className="text-xs text-muted-foreground">{stats.users_with_achievements || 0} / {stats.total_users || 0} users</p>
                </>
              ) : (
                <div className="text-2xl font-bold">0%</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Award className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : stats ? (
                <>
                  <div className="text-2xl font-bold">{stats.recent_unlocks_30 || 0}</div>
                  <p className="text-xs text-muted-foreground">Unlocks in last 30 days</p>
                </>
              ) : (
                <div className="text-2xl font-bold">0</div>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="achievements">Achievements Catalog</TabsTrigger>
            <TabsTrigger value="user-achievements">User Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search achievements..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
                    </div>
                  </div>
                  <Select value={categoryFilter || "all"} onValueChange={(value) => { setCategoryFilter(value === "all" ? "" : value); setPage(1); }}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {CATEGORIES.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={tierFilter || "all"} onValueChange={(value) => { setTierFilter(value === "all" ? "" : value); setPage(1); }}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="All Tiers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tiers</SelectItem>
                      {TIERS.map(tier => <SelectItem key={tier.value} value={tier.value}>{tier.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={activeFilter || "all"} onValueChange={(value) => { setActiveFilter(value === "all" ? "" : value); setPage(1); }}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Achievements List</CardTitle>
                    <CardDescription>{loading ? 'Loading...' : `${pagination?.total || 0} total achievements`}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : achievements.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">No achievements found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {search || categoryFilter || tierFilter || activeFilter ? 'Try adjusting your filters' : 'Create your first achievement to get started'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Achievement</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Tier</TableHead>
                            <TableHead>Points</TableHead>
                            <TableHead>Requirement</TableHead>
                            <TableHead>Users</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {achievements.map((achievement) => {
                            const tierInfo = getTierInfo(achievement.tier);
                            const TierIcon = tierInfo.icon;
                            return (
                              <TableRow key={achievement.id}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl">{achievement.icon}</span>
                                    <div>
                                      <div>{achievement.title}</div>
                                      <div className="text-xs text-muted-foreground truncate max-w-xs">{achievement.description}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="capitalize">{achievement.category}</Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge className={cn(tierInfo.color, 'capitalize')}>
                                    <TierIcon className="h-3 w-3 mr-1" />
                                    {tierInfo.label}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Coins className="h-4 w-4 text-yellow-600" />
                                    {achievement.points}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <div className="font-medium">{achievement.requirement?.target || 0} {achievement.requirement?.metric || ''}</div>
                                    <div className="text-xs text-muted-foreground capitalize">{achievement.requirement?.type || 'count'}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <div className="font-medium">{achievement.unlocked_count || 0} unlocked</div>
                                    <div className="text-xs text-muted-foreground">{achievement.total_users || 0} total</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={achievement.is_active ? 'default' : 'secondary'} className={achievement.is_active ? 'bg-green-500 hover:bg-green-600' : ''}>
                                    {achievement.is_active ? 'Active' : 'Inactive'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => handleViewDetails(achievement.id)} disabled={actionLoading === achievement.id} title="View details" className="h-8 w-8">
                                      {actionLoading === achievement.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(achievement)} disabled={actionLoading === achievement.id} title="Edit achievement" className="h-8 w-8">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => { setSelectedAchievement(achievement); setShowDeleteDialog(true); }} disabled={actionLoading === achievement.id} title="Delete achievement" className="h-8 w-8 text-destructive hover:text-destructive">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {pagination && pagination.pages > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">Showing page {pagination.page} of {pagination.pages} ({pagination.total} total achievements)</p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>Previous</Button>
                          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages || loading}>Next</Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="user-achievements" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Achievements</CardTitle>
                    <CardDescription>View user progress and unlocked achievements</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by user or achievement..." value={search} onChange={(e) => { setSearch(e.target.value); setUserAchievementsPage(1); }} className="pl-9" />
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : userAchievements.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">No user achievements found</p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Achievement</TableHead>
                            <TableHead>Progress</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Unlocked At</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userAchievements.map((ua) => {
                            const achievement = ua.achievement_details;
                            const tierInfo = getTierInfo(achievement?.tier || 'bronze');
                            return (
                              <TableRow key={ua.id}>
                                <TableCell className="font-medium">
                                  <div>
                                    <div>{ua.user?.name || ua.user?.username}</div>
                                    <div className="text-xs text-muted-foreground">{ua.user?.email}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xl">{achievement?.icon || '🏆'}</span>
                                    <div>
                                      <div className="font-medium">{achievement?.title}</div>
                                      <Badge className={cn(tierInfo.color, 'text-xs')}>{tierInfo.label}</Badge>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="w-32">
                                    <Progress value={ua.progress || 0} className="h-2" />
                                    <div className="text-xs text-muted-foreground mt-1">{Math.round(ua.progress || 0)}%</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {ua.unlocked ? (
                                    <Badge className="bg-green-500 hover:bg-green-600">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Unlocked
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary">
                                      <Target className="h-3 w-3 mr-1" />
                                      In Progress
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>{ua.unlocked_at ? formatDate(ua.unlocked_at) : '-'}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {userAchievementsPagination && userAchievementsPagination.pages > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">Showing page {userAchievementsPagination.page} of {userAchievementsPagination.pages}</p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setUserAchievementsPage(p => Math.max(1, p - 1))} disabled={userAchievementsPage === 1 || loading}>Previous</Button>
                          <Button variant="outline" size="sm" onClick={() => setUserAchievementsPage(p => Math.min(userAchievementsPagination.pages, p + 1))} disabled={userAchievementsPage >= userAchievementsPagination.pages || loading}>Next</Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Achievement</DialogTitle>
              <DialogDescription>Add a new achievement to the system</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="achievement_id">Achievement ID *</Label>
                  <Input id="achievement_id" value={formData.achievement_id} onChange={(e) => setFormData({ ...formData, achievement_id: e.target.value })} placeholder="e.g., first_lesson_complete" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Input id="icon" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} placeholder="🏆" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="First Lesson Complete" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Complete your first lesson" rows={3} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger id="category"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tier">Tier *</Label>
                  <Select value={formData.tier} onValueChange={(value) => setFormData({ ...formData, tier: value })}>
                    <SelectTrigger id="tier"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TIERS.map(tier => <SelectItem key={tier.value} value={tier.value}>{tier.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="points">Points *</Label>
                  <Input id="points" type="number" value={formData.points} onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requirement_type">Requirement Type *</Label>
                  <Select value={formData.requirement_type} onValueChange={(value) => setFormData({ ...formData, requirement_type: value })}>
                    <SelectTrigger id="requirement_type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {REQUIREMENT_TYPES.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirement_target">Target *</Label>
                  <Input id="requirement_target" type="number" value={formData.requirement_target} onChange={(e) => setFormData({ ...formData, requirement_target: parseInt(e.target.value) || 1 })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirement_metric">Metric *</Label>
                  <Input id="requirement_metric" value={formData.requirement_metric} onChange={(e) => setFormData({ ...formData, requirement_metric: e.target.value })} placeholder="lessonsCompleted" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="rounded" />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={actionLoading === -1}>
                {actionLoading === -1 ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog - similar structure to create */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Achievement</DialogTitle>
              <DialogDescription>Update achievement details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_achievement_id">Achievement ID *</Label>
                  <Input id="edit_achievement_id" value={formData.achievement_id} onChange={(e) => setFormData({ ...formData, achievement_id: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_icon">Icon</Label>
                  <Input id="edit_icon" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_title">Title *</Label>
                <Input id="edit_title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_description">Description *</Label>
                <Textarea id="edit_description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger id="edit_category"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_tier">Tier *</Label>
                  <Select value={formData.tier} onValueChange={(value) => setFormData({ ...formData, tier: value })}>
                    <SelectTrigger id="edit_tier"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TIERS.map(tier => <SelectItem key={tier.value} value={tier.value}>{tier.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_points">Points *</Label>
                  <Input id="edit_points" type="number" value={formData.points} onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_requirement_type">Requirement Type *</Label>
                  <Select value={formData.requirement_type} onValueChange={(value) => setFormData({ ...formData, requirement_type: value })}>
                    <SelectTrigger id="edit_requirement_type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {REQUIREMENT_TYPES.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_requirement_target">Target *</Label>
                  <Input id="edit_requirement_target" type="number" value={formData.requirement_target} onChange={(e) => setFormData({ ...formData, requirement_target: parseInt(e.target.value) || 1 })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_requirement_metric">Metric *</Label>
                  <Input id="edit_requirement_metric" value={formData.requirement_metric} onChange={(e) => setFormData({ ...formData, requirement_metric: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="edit_is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="rounded" />
                <Label htmlFor="edit_is_active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
              <Button onClick={handleEdit} disabled={actionLoading === selectedAchievement?.id}>
                {actionLoading === selectedAchievement?.id ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Updating...</> : 'Update'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deactivate Achievement?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to deactivate <strong>{selectedAchievement?.title}</strong>?
                This will set it as inactive. Users who already unlocked it will keep it, but it won't be available for new users.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={actionLoading === selectedAchievement?.id}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={actionLoading === selectedAchievement?.id} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {actionLoading === selectedAchievement?.id ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Deactivating...</> : <><Trash2 className="h-4 w-4 mr-2" />Deactivate</>}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-3xl">{selectedAchievement?.icon}</span>
                {selectedAchievement?.title}
              </DialogTitle>
              <DialogDescription>{selectedAchievement?.description}</DialogDescription>
            </DialogHeader>
            {selectedAchievement && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Category</Label>
                    <div className="font-medium capitalize">{selectedAchievement.category}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Tier</Label>
                    <div>
                      <Badge className={cn(getTierInfo(selectedAchievement.tier).color, 'capitalize')}>
                        {getTierInfo(selectedAchievement.tier).label}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Points</Label>
                    <div className="font-medium">{selectedAchievement.points}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <div>
                      <Badge variant={selectedAchievement.is_active ? 'default' : 'secondary'}>
                        {selectedAchievement.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Requirement</Label>
                  <div className="font-medium">{selectedAchievement.requirement?.target || 0} {selectedAchievement.requirement?.metric || ''}</div>
                  <div className="text-sm text-muted-foreground capitalize">Type: {selectedAchievement.requirement?.type || 'count'}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Unlocked By</Label>
                    <div className="font-medium">{selectedAchievement.unlocked_count || 0} users</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Total Users</Label>
                    <div className="font-medium">{selectedAchievement.total_users || 0} users</div>
                  </div>
                </div>
                {selectedAchievement.created_at && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Created At</Label>
                    <div className="font-medium">{formatDate(selectedAchievement.created_at)}</div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailDialog(false)}>Close</Button>
              {selectedAchievement && (
                <Button onClick={() => { setShowDetailDialog(false); handleEditClick(selectedAchievement); }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}


