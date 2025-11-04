import { useEffect, useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  BarChart3,
  X,
  Download,
  ArrowUpDown,
  Trophy
} from 'lucide-react';
import AdminAPI from '@/services/AdminApiService';
import { useToast } from '@/hooks/use-toast';
import { LessonTypeDistributionChart, ContentTypeDistributionChart, DifficultyDistributionChart } from '@/components/admin/LessonStatsCharts';
import { Checkbox } from '@/components/ui/checkbox';

interface Lesson {
  id: number;
  slug: string;
  title: string;
  description: string;
  lesson_type: string;
  content_type: string;
  difficulty_level: number;
  duration_minutes: number;
  payload: any;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
  progress_count?: number;
  completed_count?: number;
  avg_score?: number;
}

const LESSON_TYPES = [
  { value: 'kids_4_10', label: 'Kids (4-10)', icon: '👶' },
  { value: 'kids_11_17', label: 'Kids (11-17)', icon: '🧒' },
  { value: 'beginner', label: 'Adults - Beginner', icon: '🌱' },
  { value: 'intermediate', label: 'Adults - Intermediate', icon: '📚' },
  { value: 'advanced', label: 'Adults - Advanced', icon: '🎓' },
  { value: 'ielts', label: 'IELTS', icon: '📝' },
  { value: 'pte', label: 'PTE', icon: '📋' },
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

export default function AdminLessons() {
  const { toast } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters
  const [lessonTypeFilter, setLessonTypeFilter] = useState<string>('all');
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, page_size: 50, total: 0, pages: 0 });
  
  // Dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  
  // Bulk operations
  const [selectedLessons, setSelectedLessons] = useState<Set<number>>(new Set());
  const [sortField, setSortField] = useState<string>('order');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load data when filters change
  useEffect(() => {
    loadLessons();
    loadStats();
  }, [lessonTypeFilter, contentTypeFilter, statusFilter, debouncedSearch, currentPage]);

  const loadLessons = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError('');

      const params: any = {
        page: currentPage,
        page_size: 50,
      };

      if (lessonTypeFilter !== 'all') {
        params.lesson_type = lessonTypeFilter;
      }
      if (contentTypeFilter !== 'all') {
        params.content_type = contentTypeFilter;
      }
      if (statusFilter !== 'all') {
        params.is_active = statusFilter === 'active';
      }
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      const response = await AdminAPI.getLessons(params);

      if (response.success && response.data) {
        setLessons(response.data.lessons || []);
        setPagination(response.data.pagination || { page: 1, page_size: 50, total: 0, pages: 0 });
      } else {
        setError(response.message || 'Failed to load lessons');
        setLessons([]);
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred while loading lessons');
      setLessons([]);
    } finally {
      if (!silent) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  const loadStats = async () => {
    try {
      const response = await AdminAPI.getLessonsStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleCreate = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      lesson_type: 'beginner',
      content_type: 'vocabulary',
      difficulty_level: 1,
      duration_minutes: 15,
      is_active: true,
      order: 0,
      payload: {},
    });
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setFormData({
      title: lesson.title,
      slug: lesson.slug,
      description: lesson.description || '',
      lesson_type: lesson.lesson_type,
      content_type: lesson.content_type,
      difficulty_level: lesson.difficulty_level,
      duration_minutes: lesson.duration_minutes,
      is_active: lesson.is_active,
      order: lesson.order,
      payload: lesson.payload || {},
    });
    setIsEditDialogOpen(true);
  };

  const handleView = async (lesson: Lesson) => {
    try {
      const response = await AdminAPI.getLesson(lesson.id);
      if (response.success) {
        setSelectedLesson(response.data);
        setIsViewDialogOpen(true);
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load lesson details',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (lesson: Lesson) => {
    if (!confirm(`Are you sure you want to ${lesson.is_active ? 'deactivate' : 'delete'} "${lesson.title}"?`)) {
      return;
    }

    try {
      const response = await AdminAPI.deleteLesson(lesson.id);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Lesson deactivated successfully',
        });
        loadLessons(true);
        loadStats();
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to delete lesson',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to delete lesson',
        variant: 'destructive',
      });
    }
  };

  const validateForm = (): string | null => {
    if (!formData.title || formData.title.trim().length === 0) {
      return 'Title is required';
    }
    if (!formData.lesson_type) {
      return 'Lesson type is required';
    }
    if (!formData.content_type) {
      return 'Content type is required';
    }
    if (formData.difficulty_level && (formData.difficulty_level < 1 || formData.difficulty_level > 10)) {
      return 'Difficulty level must be between 1 and 10';
    }
    if (formData.duration_minutes && formData.duration_minutes < 1) {
      return 'Duration must be at least 1 minute';
    }
    return null;
  };

  const handleSave = async () => {
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      toast({
        title: 'Validation Error',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      let response;
      if (selectedLesson) {
        // Update
        response = await AdminAPI.updateLesson(selectedLesson.id, formData);
      } else {
        // Create
        response = await AdminAPI.createLesson(formData);
      }

      if (response.success) {
        toast({
          title: 'Success',
          description: `Lesson ${selectedLesson ? 'updated' : 'created'} successfully`,
        });
        setIsEditDialogOpen(false);
        setIsCreateDialogOpen(false);
        setSelectedLesson(null);
        setFormData({});
        loadLessons(true);
        loadStats();
      } else {
        // Handle validation errors from server
        const errorMessage = response.error?.response?.data?.errors 
          ? Object.entries(response.error.response.data.errors)
              .map(([field, errors]: [string, any]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
              .join('\n')
          : response.message || `Failed to ${selectedLesson ? 'update' : 'create'} lesson`;
        
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.errors
        ? Object.entries(err.response.data.errors)
            .map(([field, errors]: [string, any]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('\n')
        : err?.response?.data?.message || err?.message || `Failed to ${selectedLesson ? 'update' : 'create'} lesson`;
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const clearFilters = () => {
    setLessonTypeFilter('all');
    setContentTypeFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleSelectAll = () => {
    if (selectedLessons.size === lessons.length) {
      setSelectedLessons(new Set());
    } else {
      setSelectedLessons(new Set(lessons.map(l => l.id)));
    }
  };

  const handleSelectLesson = (lessonId: number) => {
    const newSelected = new Set(selectedLessons);
    if (newSelected.has(lessonId)) {
      newSelected.delete(lessonId);
    } else {
      newSelected.add(lessonId);
    }
    setSelectedLessons(newSelected);
  };

  const handleBulkActivate = async () => {
    if (selectedLessons.size === 0) return;
    
    try {
      const promises = Array.from(selectedLessons).map(id => 
        AdminAPI.updateLesson(id, { is_active: true })
      );
      await Promise.all(promises);
      toast({
        title: 'Success',
        description: `${selectedLessons.size} lesson(s) activated`,
      });
      setSelectedLessons(new Set());
      loadLessons(true);
      loadStats();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to activate lessons',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedLessons.size === 0) return;
    
    if (!confirm(`Are you sure you want to deactivate ${selectedLessons.size} lesson(s)?`)) {
      return;
    }
    
    try {
      const promises = Array.from(selectedLessons).map(id => 
        AdminAPI.updateLesson(id, { is_active: false })
      );
      await Promise.all(promises);
      toast({
        title: 'Success',
        description: `${selectedLessons.size} lesson(s) deactivated`,
      });
      setSelectedLessons(new Set());
      loadLessons(true);
      loadStats();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to deactivate lessons',
        variant: 'destructive',
      });
    }
  };

  const handleExport = () => {
    const csvRows = [
      ['Title', 'Type', 'Content Type', 'Difficulty', 'Duration', 'Status', 'Progress Count', 'Completed', 'Avg Score'].join(',')
    ];
    
    lessons.forEach(lesson => {
      csvRows.push([
        `"${lesson.title}"`,
        lesson.lesson_type,
        lesson.content_type,
        lesson.difficulty_level.toString(),
        lesson.duration_minutes.toString(),
        lesson.is_active ? 'Active' : 'Inactive',
        (lesson.progress_count || 0).toString(),
        (lesson.completed_count || 0).toString(),
        (lesson.avg_score || 0).toString()
      ].join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lessons-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: 'Success',
      description: 'Lessons exported successfully',
    });
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedLessons = useMemo(() => {
    const sorted = [...lessons];
    sorted.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortField) {
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case 'difficulty':
          aVal = a.difficulty_level;
          bVal = b.difficulty_level;
          break;
        case 'duration':
          aVal = a.duration_minutes;
          bVal = b.duration_minutes;
          break;
        case 'progress':
          aVal = a.progress_count || 0;
          bVal = b.progress_count || 0;
          break;
        case 'order':
        default:
          aVal = a.order;
          bVal = b.order;
          break;
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [lessons, sortField, sortDirection]);

  const getLessonTypeLabel = (type: string) => {
    const found = LESSON_TYPES.find(t => t.value === type);
    return found ? `${found.icon} ${found.label}` : type;
  };

  const getLessonTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'kids_4_10': 'bg-blue-100 text-blue-800 border-blue-200',
      'kids_11_17': 'bg-green-100 text-green-800 border-green-200',
      'beginner': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'intermediate': 'bg-orange-100 text-orange-800 border-orange-200',
      'advanced': 'bg-red-100 text-red-800 border-red-200',
      'ielts': 'bg-purple-100 text-purple-800 border-purple-200',
      'pte': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getContentTypeLabel = (type: string) => {
    const found = CONTENT_TYPES.find(t => t.value === type);
    return found ? found.label : type;
  };


  if (loading && lessons.length === 0) {
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Lessons Management</h1>
            <p className="text-muted-foreground">Create, edit, and manage lessons for all learning paths</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                loadLessons();
                loadStats();
              }}
              disabled={refreshing || loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Lesson
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overall?.total || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.overall?.active || 0} active, {stats.overall?.inactive || 0} inactive
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Lessons</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overall?.active || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.overall?.recent || 0} created in last 30 days
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Progress</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.progress?.total || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.progress?.completion_rate || 0}% completion rate
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.progress?.avg_score || 0}%</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.progress?.completed || 0} completed
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Lessons by Type</CardTitle>
                  <CardDescription>Distribution of lessons across categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <LessonTypeDistributionChart stats={stats} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Content Type Distribution</CardTitle>
                  <CardDescription>Breakdown by content type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ContentTypeDistributionChart stats={stats} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Difficulty Distribution</CardTitle>
                  <CardDescription>Lessons by difficulty level</CardDescription>
                </CardHeader>
                <CardContent>
                  <DifficultyDistributionChart stats={stats} />
                </CardContent>
              </Card>
            </div>

            {/* Top Lessons */}
            {stats.top_lessons && stats.top_lessons.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <CardTitle>Top Performing Lessons</CardTitle>
                  </div>
                  <CardDescription>Most completed lessons by users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.top_lessons.map((lesson: any, index: number) => (
                      <div 
                        key={lesson.id} 
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => handleView({ id: lesson.id, title: lesson.title, lesson_type: lesson.lesson_type } as Lesson)}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-orange-500 text-white' :
                            'bg-primary/10 text-primary'
                          }`}>
                            #{index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{lesson.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getLessonTypeColor(lesson.lesson_type)} border`}
                              >
                                {getLessonTypeLabel(lesson.lesson_type)}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className="text-sm font-semibold">
                              {lesson.completions} {lesson.completions === 1 ? 'completion' : 'completions'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Filters</CardTitle>
                <CardDescription>Filter lessons by type, content, and status</CardDescription>
              </div>
              {(lessonTypeFilter !== 'all' || contentTypeFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
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
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search lessons..."
                  className="pl-9"
                />
              </div>

              {/* Lesson Type Filter */}
              <Select value={lessonTypeFilter} onValueChange={setLessonTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {LESSON_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Content Type Filter */}
              <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Content" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Content</SelectItem>
                  {CONTENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lessons Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lessons</CardTitle>
                <CardDescription>
                  Showing {sortedLessons.length} of {pagination.total} lessons
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {selectedLessons.size > 0 && (
                  <>
                    <Button variant="outline" size="sm" onClick={handleBulkActivate}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Activate ({selectedLessons.size})
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleBulkDeactivate}>
                      <X className="h-4 w-4 mr-2" />
                      Deactivate ({selectedLessons.size})
                    </Button>
                  </>
                )}
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {sortedLessons.length === 0 ? (
              <div className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">No lessons found matching your filters.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="text-left px-5 py-3 font-medium text-muted-foreground w-12">
                          <Checkbox
                            checked={selectedLessons.size === sortedLessons.length && sortedLessons.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </th>
                        <th className="text-left px-5 py-3 font-medium text-muted-foreground">
                          <button
                            onClick={() => handleSort('title')}
                            className="flex items-center gap-1 hover:text-foreground"
                          >
                            Title
                            <ArrowUpDown className="h-3 w-3" />
                          </button>
                        </th>
                        <th className="text-left px-5 py-3 font-medium text-muted-foreground">Type</th>
                        <th className="text-left px-5 py-3 font-medium text-muted-foreground">Content</th>
                        <th className="text-left px-5 py-3 font-medium text-muted-foreground">
                          <button
                            onClick={() => handleSort('difficulty')}
                            className="flex items-center gap-1 hover:text-foreground"
                          >
                            Difficulty
                            <ArrowUpDown className="h-3 w-3" />
                          </button>
                        </th>
                        <th className="text-left px-5 py-3 font-medium text-muted-foreground">
                          <button
                            onClick={() => handleSort('duration')}
                            className="flex items-center gap-1 hover:text-foreground"
                          >
                            Duration
                            <ArrowUpDown className="h-3 w-3" />
                          </button>
                        </th>
                        <th className="text-left px-5 py-3 font-medium text-muted-foreground">
                          <button
                            onClick={() => handleSort('progress')}
                            className="flex items-center gap-1 hover:text-foreground"
                          >
                            Progress
                            <ArrowUpDown className="h-3 w-3" />
                          </button>
                        </th>
                        <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                        <th className="text-left px-5 py-3 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedLessons.map((lesson, idx) => (
                        <tr
                          key={lesson.id}
                          className={`border-b hover:bg-muted/30 transition-colors ${
                            idx % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                          } ${selectedLessons.has(lesson.id) ? 'bg-primary/5' : ''}`}
                        >
                          <td className="px-5 py-3">
                            <Checkbox
                              checked={selectedLessons.has(lesson.id)}
                              onCheckedChange={() => handleSelectLesson(lesson.id)}
                            />
                          </td>
                          <td className="px-5 py-3">
                            <div>
                              <div className="font-medium">{lesson.title}</div>
                              {lesson.description && (
                                <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                                  {lesson.description}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <Badge 
                              variant="outline" 
                              className={`${getLessonTypeColor(lesson.lesson_type)} border`}
                            >
                              {getLessonTypeLabel(lesson.lesson_type)}
                            </Badge>
                          </td>
                          <td className="px-5 py-3">
                            <Badge variant="secondary">{getContentTypeLabel(lesson.content_type)}</Badge>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1">
                              <span>{lesson.difficulty_level}/10</span>
                              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary"
                                  style={{ width: `${(lesson.difficulty_level / 10) * 100}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{lesson.duration_minutes}m</span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <div className="text-xs">
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3 text-muted-foreground" />
                                <span>{lesson.progress_count || 0} attempts</span>
                              </div>
                              <div className="text-muted-foreground">
                                {lesson.completed_count || 0} completed
                                {lesson.avg_score !== undefined && (
                                  <span className="ml-1">({lesson.avg_score}% avg)</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <Badge variant={lesson.is_active ? 'default' : 'secondary'}>
                              {lesson.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(lesson)}
                                className="h-8"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(lesson)}
                                className="h-8"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(lesson)}
                                className="h-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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
                        disabled={currentPage === 1 || loading}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                        disabled={currentPage === pagination.pages || loading}
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

        {/* Create/Edit Dialog */}
        <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setSelectedLesson(null);
            setFormData({});
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedLesson ? 'Edit Lesson' : 'Create New Lesson'}</DialogTitle>
              <DialogDescription>
                {selectedLesson ? 'Update lesson details below.' : 'Fill in the details to create a new lesson.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => {
                    const title = e.target.value;
                    setFormData({ ...formData, title });
                    // Auto-generate slug if slug is empty or matches previous title
                    if (!formData.slug || formData.slug === formData.title?.toLowerCase().replace(/\s+/g, '-')) {
                      const autoSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                      setFormData({ ...formData, title, slug: autoSlug });
                    } else {
                      setFormData({ ...formData, title });
                    }
                  }}
                  placeholder="Lesson title"
                  required
                />
                <p className="text-xs text-muted-foreground">The title will be displayed to users</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug || ''}
                  onChange={(e) => {
                    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                    setFormData({ ...formData, slug });
                  }}
                  placeholder="lesson-slug"
                  required
                />
                <p className="text-xs text-muted-foreground">URL-friendly identifier (auto-generated from title)</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Lesson description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="lesson_type">Lesson Type *</Label>
                  <Select
                    value={formData.lesson_type || 'beginner'}
                    onValueChange={(value) => setFormData({ ...formData, lesson_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LESSON_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content_type">Content Type *</Label>
                  <Select
                    value={formData.content_type || 'vocabulary'}
                    onValueChange={(value) => setFormData({ ...formData, content_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="difficulty_level">Difficulty Level (1-10) *</Label>
                  <Input
                    id="difficulty_level"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.difficulty_level || 1}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      const clamped = Math.min(10, Math.max(1, val));
                      setFormData({ ...formData, difficulty_level: clamped });
                    }}
                    required
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${((formData.difficulty_level || 1) / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">
                      {formData.difficulty_level || 1}/10
                    </span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration_minutes">Duration (minutes) *</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    min="1"
                    value={formData.duration_minutes || 15}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setFormData({ ...formData, duration_minutes: Math.max(1, val) });
                    }}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Estimated time to complete</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    min="0"
                    value={formData.order || 0}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active !== false}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded cursor-pointer"
                  />
                  <Label htmlFor="is_active" className="cursor-pointer font-medium">
                    Active (visible to users)
                  </Label>
                </div>
                <Badge variant={formData.is_active !== false ? 'default' : 'secondary'}>
                  {formData.is_active !== false ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsCreateDialogOpen(false);
                setIsEditDialogOpen(false);
                setSelectedLesson(null);
                setFormData({});
              }}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {selectedLesson ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  selectedLesson ? 'Update' : 'Create'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedLesson?.title}</DialogTitle>
              <DialogDescription>Lesson details and statistics</DialogDescription>
            </DialogHeader>
            {selectedLesson && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Type</Label>
                    <p className="font-medium">{getLessonTypeLabel(selectedLesson.lesson_type)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Content Type</Label>
                    <p className="font-medium">{getContentTypeLabel(selectedLesson.content_type)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Difficulty</Label>
                    <p className="font-medium">{selectedLesson.difficulty_level}/10</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Duration</Label>
                    <p className="font-medium">{selectedLesson.duration_minutes} minutes</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <Badge variant={selectedLesson.is_active ? 'default' : 'secondary'}>
                      {selectedLesson.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Order</Label>
                    <p className="font-medium">{selectedLesson.order}</p>
                  </div>
                </div>
                {selectedLesson.description && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Description</Label>
                    <p className="mt-1">{selectedLesson.description}</p>
                  </div>
                )}
                {(selectedLesson.progress_count !== undefined || selectedLesson.completed_count !== undefined) && (
                  <div className="border-t pt-4">
                    <Label className="text-xs text-muted-foreground mb-2 block">Progress Statistics</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Attempts</p>
                        <p className="text-lg font-semibold">{selectedLesson.progress_count || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Completed</p>
                        <p className="text-lg font-semibold">{selectedLesson.completed_count || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Average Score</p>
                        <p className="text-lg font-semibold">{selectedLesson.avg_score || 0}%</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="border-t pt-4">
                  <Label className="text-xs text-muted-foreground mb-2 block">Metadata</Label>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Created:</span>{' '}
                      <span>{new Date(selectedLesson.created_at).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Updated:</span>{' '}
                      <span>{new Date(selectedLesson.updated_at).toLocaleString()}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Slug:</span>{' '}
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">{selectedLesson.slug}</code>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
              {selectedLesson && (
                <Button onClick={() => {
                  setIsViewDialogOpen(false);
                  handleEdit(selectedLesson);
                }}>
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
