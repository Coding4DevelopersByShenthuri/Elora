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
  Users,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Globe,
  ClipboardList,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  XCircle as XCircleIcon,
  List,
  Save
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminAPI from '@/services/AdminApiService';
import { useToast } from '@/hooks/use-toast';

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

const formatDate = (dateString: string | null) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDateShort = (dateString: string | null) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function AdminSurveys() {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [completedFilter, setCompletedFilter] = useState('');
  const [ageRangeFilter, setAgeRangeFilter] = useState('');
  const [englishLevelFilter, setEnglishLevelFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [selectedSurvey, setSelectedSurvey] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showStepsDialog, setShowStepsDialog] = useState(false);
  const [surveySteps, setSurveySteps] = useState<any[]>([]);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const { toast } = useToast();

  // Debounce search input
  const debouncedSearch = useDebounce(search, 500);

  const loadSurveys = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await AdminAPI.getSurveys({
        search: debouncedSearch,
        page,
        page_size: 20,
        completed: completedFilter || undefined,
        age_range: ageRangeFilter || undefined,
        english_level: englishLevelFilter || undefined,
      });

      if (response.success) {
        const data = response.data;
        const surveysData = data.surveys || [];
        console.log('✅ Loaded surveys from MySQL:', surveysData.length, 'total surveys');
        console.log('📊 Survey data from database:', surveysData);
        console.log('📄 Pagination info:', data.pagination);
        setSurveys(surveysData);
        setPagination(data.pagination || null);
      } else {
        const errorMessage = response.message || 'Failed to load surveys';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred while loading surveys';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, completedFilter, ageRangeFilter, englishLevelFilter, toast]);

  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const response = await AdminAPI.getSurveysStats();
      if (response.success) {
        console.log('📈 Survey stats from MySQL:', response.data);
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('Failed to load stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSurveys();
  }, [loadSurveys]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleViewSurvey = async (userId: number) => {
    setActionLoading(userId);
    try {
      const response = await AdminAPI.getSurveyDetail(userId);
      if (response.success) {
        setSelectedSurvey(response.data);
        setShowDetailDialog(true);
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to load survey details',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to load survey details',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditSurvey = async (userId: number) => {
    setActionLoading(userId);
    try {
      const response = await AdminAPI.getSurveyDetail(userId);
      if (response.success) {
        setSelectedSurvey(response.data);
        setEditFormData({
          age_range: response.data.survey?.age_range || '',
          native_language: response.data.survey?.native_language || '',
          english_level: response.data.survey?.english_level || '',
          learning_purpose: response.data.survey?.learning_purpose || [],
          interests: response.data.survey?.interests || [],
        });
        setShowEditDialog(true);
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to load survey details',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to load survey details',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveEdit = async (userId: number) => {
    setActionLoading(userId);
    try {
      const response = await AdminAPI.updateSurvey(userId, {
        age_range: editFormData.age_range || null,
        native_language: editFormData.native_language || null,
        english_level: editFormData.english_level || null,
        learning_purpose: editFormData.learning_purpose || [],
        interests: editFormData.interests || [],
      });
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Survey updated successfully',
        });
        setShowEditDialog(false);
        loadSurveys();
        loadStats();
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to update survey',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update survey',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkComplete = async (userId: number, completed: boolean) => {
    setActionLoading(userId);
    try {
      const response = await AdminAPI.updateSurvey(userId, {
        mark_complete: completed,
      });
      
      if (response.success) {
        toast({
          title: 'Success',
          description: completed ? 'Survey marked as complete' : 'Survey marked as incomplete',
        });
        loadSurveys();
        loadStats();
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to update survey status',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update survey status',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteSurvey = async (userId: number) => {
    setActionLoading(userId);
    try {
      const response = await AdminAPI.deleteSurvey(userId);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Survey data deleted successfully',
        });
        setDeleteConfirm(null);
        loadSurveys();
        loadStats();
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to delete survey',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete survey',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewSteps = async (userId: number) => {
    setActionLoading(userId);
    try {
      const response = await AdminAPI.getSurveySteps(userId);
      if (response.success) {
        setSurveySteps(response.data.steps || []);
        setShowStepsDialog(true);
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to load survey steps',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to load survey steps',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefresh = () => {
    loadSurveys();
    loadStats();
  };

  const getCompletionBadge = (completed: boolean) => {
    return completed ? (
      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Completed
      </Badge>
    ) : (
      <Badge variant="outline" className="text-muted-foreground">
        <XCircle className="h-3 w-3 mr-1" />
        Incomplete
      </Badge>
    );
  };

  // Extract unique values for filters from all surveys (including current page)
  const uniqueAgeRanges = Array.from(new Set(surveys.map(s => s.age_range).filter(Boolean))).sort();
  const uniqueEnglishLevels = Array.from(new Set(surveys.map(s => s.english_level).filter(Boolean))).sort();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Surveys</h1>
            <p className="text-muted-foreground mt-1">
              View and analyze user survey responses and insights
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
                <CardTitle className="text-sm font-medium">Total Profiles</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overall?.total_profiles?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.overall?.completed_surveys || 0} completed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overall?.completion_rate?.toFixed(1) || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  {stats.recent?.completed_last_30 || 0} in last 30 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Surveys</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overall?.completed_surveys?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.recent?.completed_last_7 || 0} in last 7 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Incomplete Surveys</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overall?.incomplete_surveys?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Need to complete
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Distribution Charts */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Age Range Distribution */}
            {stats.age_distribution && Object.keys(stats.age_distribution).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Age Range Distribution</CardTitle>
                  <CardDescription>User age ranges</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(stats.age_distribution)
                      .sort(([, a]: any, [, b]: any) => b - a)
                      .map(([age, count]: [string, any]) => (
                        <div key={age} className="flex items-center justify-between">
                          <span className="text-sm">{age}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${(count / Math.max(...Object.values(stats.age_distribution) as number[])) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* English Level Distribution */}
            {stats.level_distribution && Object.keys(stats.level_distribution).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">English Level Distribution</CardTitle>
                  <CardDescription>User proficiency levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(stats.level_distribution)
                      .sort(([, a]: any, [, b]: any) => b - a)
                      .map(([level, count]: [string, any]) => (
                        <div key={level} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{level}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${(count / Math.max(...Object.values(stats.level_distribution) as number[])) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Languages */}
            {stats.language_distribution && Object.keys(stats.language_distribution).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Top Native Languages</CardTitle>
                  <CardDescription>Most common languages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(stats.language_distribution)
                      .sort(([, a]: any, [, b]: any) => b - a)
                      .slice(0, 5)
                      .map(([lang, count]: [string, any]) => (
                        <div key={lang} className="flex items-center justify-between">
                          <span className="text-sm">{lang}</span>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Learning Purpose Distribution */}
        {stats && stats.purpose_distribution && Object.keys(stats.purpose_distribution).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Learning Purpose Distribution</CardTitle>
              <CardDescription>What users are learning for</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Object.entries(stats.purpose_distribution)
                  .sort(([, a]: any, [, b]: any) => b - a)
                  .map(([purpose, count]: [string, any]) => (
                    <div key={purpose} className="text-center">
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-xs text-muted-foreground mt-1 capitalize">
                        {purpose.replace(/_/g, ' ')}
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
                    placeholder="Search by user, email, or language..."
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
                value={completedFilter || "all"} 
                onValueChange={(value) => {
                  setCompletedFilter(value === "all" ? "" : value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Completed</SelectItem>
                  <SelectItem value="false">Incomplete</SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={ageRangeFilter || "all"} 
                onValueChange={(value) => {
                  setAgeRangeFilter(value === "all" ? "" : value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Ages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  {uniqueAgeRanges.map((age) => (
                    <SelectItem key={age} value={age}>
                      {age}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select 
                value={englishLevelFilter || "all"} 
                onValueChange={(value) => {
                  setEnglishLevelFilter(value === "all" ? "" : value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {uniqueEnglishLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
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
                  onClick={loadSurveys}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Surveys Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Survey Responses</CardTitle>
                <CardDescription>
                  {loading ? 'Loading...' : `${pagination?.total || 0} total users with profiles`}
                  {pagination && (
                    <span className="ml-2 text-xs">
                      ({stats?.overall?.completed_surveys || 0} completed, {stats?.overall?.incomplete_surveys || 0} incomplete)
                    </span>
                  )}
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
            ) : surveys.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No surveys found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {(search || completedFilter || ageRangeFilter || englishLevelFilter)
                    ? 'Try adjusting your filters' 
                    : 'No survey responses have been recorded yet'}
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Age Range</TableHead>
                        <TableHead>English Level</TableHead>
                        <TableHead>Native Language</TableHead>
                        <TableHead>Learning Purpose</TableHead>
                        <TableHead>Completed At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {surveys.map((survey) => (
                        <TableRow key={survey.id}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{survey.user?.name || survey.user?.username || 'Unknown'}</span>
                              <span className="text-xs text-muted-foreground">
                                {survey.user?.email || ''}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getCompletionBadge(survey.completed)}
                          </TableCell>
                          <TableCell>
                            {survey.age_range ? (
                              <span className="text-sm">{survey.age_range}</span>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {survey.english_level ? (
                              <Badge variant="outline" className="capitalize">
                                {survey.english_level}
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {survey.native_language ? (
                              <div className="flex items-center gap-1">
                                <Globe className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">{survey.native_language}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {survey.learning_purpose && survey.learning_purpose.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {survey.learning_purpose.slice(0, 2).map((purpose: string, idx: number) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {purpose.replace(/_/g, ' ')}
                                  </Badge>
                                ))}
                                {survey.learning_purpose.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{survey.learning_purpose.length - 2}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {survey.completed_at ? formatDateShort(survey.completed_at) : '—'}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={actionLoading === (survey.user?.id || survey.id)}
                                  className="h-8 w-8"
                                >
                                  {actionLoading === (survey.user?.id || survey.id) ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <MoreVertical className="h-4 w-4" />
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => handleViewSurvey(survey.user?.id || survey.id)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditSurvey(survey.user?.id || survey.id)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Survey
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewSteps(survey.user?.id || survey.id)}>
                                  <List className="h-4 w-4 mr-2" />
                                  View Steps
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {survey.completed ? (
                                  <DropdownMenuItem 
                                    onClick={() => handleMarkComplete(survey.user?.id || survey.id, false)}
                                    disabled={actionLoading === (survey.user?.id || survey.id)}
                                  >
                                    <XCircleIcon className="h-4 w-4 mr-2" />
                                    Mark Incomplete
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem 
                                    onClick={() => handleMarkComplete(survey.user?.id || survey.id, true)}
                                    disabled={actionLoading === (survey.user?.id || survey.id)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark Complete
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => setDeleteConfirm(survey.user?.id || survey.id)}
                                  className="text-red-600 focus:text-red-600"
                                  disabled={actionLoading === (survey.user?.id || survey.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Survey
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
                      ({pagination.total} total surveys)
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

        {/* Survey Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Survey Details</DialogTitle>
              <DialogDescription>
                Detailed survey information for {selectedSurvey?.user?.name || 'this user'}
              </DialogDescription>
            </DialogHeader>
            {selectedSurvey && (
              <div className="space-y-4">
                {/* User Info */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">User Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p className="font-medium">{selectedSurvey.user?.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedSurvey.user?.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Username</p>
                      <p className="font-medium">{selectedSurvey.user?.username}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Joined</p>
                      <p className="font-medium">{formatDate(selectedSurvey.user?.date_joined)}</p>
                    </div>
                  </div>
                </div>

                {/* Survey Responses */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Survey Responses</h4>
                  <div className="space-y-3 p-3 bg-muted rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Status</p>
                      {getCompletionBadge(selectedSurvey.survey?.completed)}
                    </div>
                    {selectedSurvey.survey?.age_range && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Age Range</p>
                        <p className="font-medium">{selectedSurvey.survey.age_range}</p>
                      </div>
                    )}
                    {selectedSurvey.survey?.native_language && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Native Language</p>
                        <p className="font-medium">{selectedSurvey.survey.native_language}</p>
                      </div>
                    )}
                    {selectedSurvey.survey?.english_level && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">English Level</p>
                        <Badge variant="outline" className="capitalize">
                          {selectedSurvey.survey.english_level}
                        </Badge>
                      </div>
                    )}
                    {selectedSurvey.survey?.learning_purpose && selectedSurvey.survey.learning_purpose.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Learning Purpose</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedSurvey.survey.learning_purpose.map((purpose: string, idx: number) => (
                            <Badge key={idx} variant="secondary">
                              {purpose.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedSurvey.survey?.interests && Array.isArray(selectedSurvey.survey.interests) && selectedSurvey.survey.interests.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Interests</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedSurvey.survey.interests.map((interest: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedSurvey.survey?.completed_at && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Completed At</p>
                        <p className="font-medium">{formatDate(selectedSurvey.survey.completed_at)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Info */}
                {selectedSurvey.profile && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Profile Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-muted-foreground">Level</p>
                        <p className="font-medium capitalize">{selectedSurvey.profile.level}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Points</p>
                        <p className="font-medium">{selectedSurvey.profile.points}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Current Streak</p>
                        <p className="font-medium">{selectedSurvey.profile.current_streak} days</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Longest Streak</p>
                        <p className="font-medium">{selectedSurvey.profile.longest_streak} days</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Survey Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Survey</DialogTitle>
              <DialogDescription>
                Edit survey data for {selectedSurvey?.user?.name || 'this user'}
              </DialogDescription>
            </DialogHeader>
            {editFormData && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age_range">Age Range</Label>
                    <Input
                      id="age_range"
                      value={editFormData.age_range}
                      onChange={(e) => setEditFormData({ ...editFormData, age_range: e.target.value })}
                      placeholder="e.g., 18-25"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="native_language">Native Language</Label>
                    <Input
                      id="native_language"
                      value={editFormData.native_language}
                      onChange={(e) => setEditFormData({ ...editFormData, native_language: e.target.value })}
                      placeholder="e.g., Spanish"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="english_level">English Level</Label>
                    <Select
                      value={editFormData.english_level || ''}
                      onValueChange={(value) => setEditFormData({ ...editFormData, english_level: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="native">Native</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="learning_purpose">Learning Purpose (comma-separated)</Label>
                  <Textarea
                    id="learning_purpose"
                    value={Array.isArray(editFormData.learning_purpose) ? editFormData.learning_purpose.join(', ') : editFormData.learning_purpose}
                    onChange={(e) => {
                      const purposes = e.target.value.split(',').map(p => p.trim()).filter(Boolean);
                      setEditFormData({ ...editFormData, learning_purpose: purposes });
                    }}
                    placeholder="e.g., work, travel, education"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interests">Interests (comma-separated)</Label>
                  <Textarea
                    id="interests"
                    value={Array.isArray(editFormData.interests) ? editFormData.interests.join(', ') : editFormData.interests}
                    onChange={(e) => {
                      const interests = e.target.value.split(',').map(i => i.trim()).filter(Boolean);
                      setEditFormData({ ...editFormData, interests: interests });
                    }}
                    placeholder="e.g., technology, music, sports"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleSaveEdit(selectedSurvey?.user?.id || selectedSurvey?.id)}
                    disabled={actionLoading === (selectedSurvey?.user?.id || selectedSurvey?.id)}
                  >
                    {actionLoading === (selectedSurvey?.user?.id || selectedSurvey?.id) ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Survey Steps Dialog */}
        <Dialog open={showStepsDialog} onOpenChange={setShowStepsDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Survey Steps</DialogTitle>
              <DialogDescription>
                Individual survey step responses for {selectedSurvey?.user?.name || 'this user'}
              </DialogDescription>
            </DialogHeader>
            {surveySteps.length > 0 ? (
              <div className="space-y-4">
                {surveySteps.map((step: any, idx: number) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Step {step.step_number}</Badge>
                        <span className="font-medium capitalize">{step.step_name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(step.completed_at)}
                      </span>
                    </div>
                    <div className="mt-2 p-2 bg-muted rounded text-sm">
                      <pre className="whitespace-pre-wrap text-xs">
                        {JSON.stringify(step.response_data, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <List className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No survey steps found for this user.</p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirm !== null} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Survey?</DialogTitle>
              <DialogDescription>
                This will permanently delete all survey data for this user. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDeleteSurvey(deleteConfirm)}
                disabled={actionLoading === deleteConfirm}
              >
                {actionLoading === deleteConfirm ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
