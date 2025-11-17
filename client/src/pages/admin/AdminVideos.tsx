import { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Video,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Upload,
  Eye,
  Edit,
  Trash2,
  Clock,
  Star,
  Play,
  Tag,
} from 'lucide-react';
import AdminAPI from '@/services/AdminApiService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface VideoLesson {
  id: number;
  slug: string;
  title: string;
  description?: string;
  thumbnail?: string;
  thumbnail_url?: string;
  video_file?: string;
  video_file_url?: string;
  video_url?: string;
  duration: number;
  difficulty: string;
  category: string;
  rating: number;
  views: number;
  speaking_exercises: number;
  tags: string[];
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const CATEGORY_OPTIONS = [
  { value: 'pronunciation', label: 'Pronunciation' },
  { value: 'conversation', label: 'Conversation' },
  { value: 'grammar', label: 'Grammar' },
  { value: 'business', label: 'Business' },
  { value: 'daily', label: 'Daily Life' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

const initialFormState = {
  title: '',
  slug: '',
  description: '',
  video_url: '',
  duration: 300,
  difficulty: 'beginner',
  category: 'conversation',
  rating: 0,
  views: 0,
  speaking_exercises: 0,
  tags: [] as string[],
  is_active: true,
  order: 0,
};

export default function AdminVideos() {
  const { toast } = useToast();
  const [videos, setVideos] = useState<VideoLesson[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [pagination, setPagination] = useState({ page: 1, page_size: 20, total: 0, pages: 0 });
  const [currentPage, setCurrentPage] = useState(1);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoLesson | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [tagsInput, setTagsInput] = useState('');
  const [files, setFiles] = useState<{ thumbnail?: File; video_file?: File }>({});
  const [saving, setSaving] = useState(false);
  const [viewingVideo, setViewingVideo] = useState<VideoLesson | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadVideos();
    loadStats();
  }, [debouncedSearch, difficultyFilter, categoryFilter, statusFilter, currentPage]);

  const loadVideos = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError('');

      const params: Record<string, string | number> = {
        page: currentPage,
        page_size: pagination.page_size,
      };

      if (debouncedSearch) params.search = debouncedSearch;
      if (difficultyFilter !== 'all') params.difficulty = difficultyFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (statusFilter !== 'all') params.is_active = statusFilter;

      const response = await AdminAPI.getVideos(params);
      if (response.success && response.data) {
        setVideos(response.data.videos || []);
        setPagination(response.data.pagination || pagination);
      } else {
        setError(response.message || 'Failed to load videos');
        setVideos([]);
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred while loading videos');
      setVideos([]);
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
      const response = await AdminAPI.getVideosStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.warn('Failed to fetch video stats', err);
    }
  };

  const handleCreate = () => {
    setSelectedVideo(null);
    setFormData(initialFormState);
    setTagsInput('');
    setFiles({});
    setIsDialogOpen(true);
  };

  const handleEdit = (video: VideoLesson) => {
    setSelectedVideo(video);
    setFormData({
      title: video.title,
      slug: video.slug,
      description: video.description || '',
      video_url: video.video_url || '',
      duration: video.duration,
      difficulty: video.difficulty,
      category: video.category,
      rating: video.rating,
      views: video.views,
      speaking_exercises: video.speaking_exercises,
      tags: video.tags || [],
      is_active: video.is_active,
      order: video.order,
    });
    setTagsInput(video.tags?.join(', ') || '');
    setFiles({});
    setIsDialogOpen(true);
  };

  const handleView = (video: VideoLesson) => {
    setViewingVideo(video);
    setIsViewDialogOpen(true);
  };

  const resetDialogState = () => {
    setIsDialogOpen(false);
    setSelectedVideo(null);
    setFormData(initialFormState);
    setTagsInput('');
    setFiles({});
    setSaving(false);
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileChange = (key: 'thumbnail' | 'video_file', file?: File) => {
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.duration || Number(formData.duration) <= 0) return 'Duration must be greater than 0';
    if (formData.rating < 0 || formData.rating > 5) return 'Rating must be between 0 and 5';
    if (formData.views < 0) return 'Views cannot be negative';
    if (formData.speaking_exercises < 0) return 'Speaking exercises cannot be negative';
    return null;
  };

  const handleSave = async () => {
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
    const payload = {
      ...formData,
      tags: tagsInput
        ? tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean)
        : [],
    };

    try {
      const response = selectedVideo
        ? await AdminAPI.updateVideo(selectedVideo.id, payload, files)
        : await AdminAPI.createVideo(payload, files);

      if (response.success) {
        toast({
          title: 'Success',
          description: `Video ${selectedVideo ? 'updated' : 'created'} successfully`,
        });
        resetDialogState();
        loadVideos(true);
        loadStats();
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to save video',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.response?.data?.message || err?.message || 'Failed to save video',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (video: VideoLesson) => {
    if (!confirm(`Are you sure you want to delete "${video.title}"?`)) return;

    try {
      const response = await AdminAPI.deleteVideo(video.id);
      if (response.success) {
        toast({
          title: 'Deleted',
          description: `${video.title} removed successfully`,
        });
        loadVideos(true);
        loadStats();
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to delete video',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to delete video',
        variant: 'destructive',
      });
    }
  };

  const filteredVideos = useMemo(() => videos, [videos]);

  const loadingState = (
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

  if (loading && videos.length === 0) {
    return loadingState;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Video Lessons</h1>
            <p className="text-muted-foreground">
              Manage interactive adult video lessons, upload new content, and control availability.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                loadVideos();
                loadStats();
              }}
              disabled={refreshing}
            >
              <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
              Refresh
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Video
            </Button>
          </div>
        </div>

        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overall?.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.overall?.active || 0} active · {stats.overall?.inactive || 0} inactive
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overall?.recent || 0}</div>
                <p className="text-xs text-muted-foreground">Past 30 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.engagement?.total_views || 0}</div>
                <p className="text-xs text-muted-foreground">All-time views</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.engagement?.avg_rating || 0}/5</div>
                <p className="text-xs text-muted-foreground">Based on admin-set ratings</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Filters</CardTitle>
                <CardDescription>Filter videos by difficulty, category, and status</CardDescription>
              </div>
              {(searchQuery || difficultyFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setDifficultyFilter('all');
                    setCategoryFilter('all');
                    setStatusFilter('all');
                  }}
                >
                  Reset
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search title, slug, description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulty</SelectItem>
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-destructive">
            <CardContent className="py-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Video Library</CardTitle>
                <CardDescription>
                  Showing {filteredVideos.length} of {pagination.total} videos
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Filter className="h-4 w-4" />
                Advanced controls coming soon
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredVideos.length === 0 ? (
              <div className="p-8 text-center">
                <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No videos match your filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-5 py-3 text-left font-medium text-muted-foreground w-20">Preview</th>
                      <th className="px-5 py-3 text-left font-medium text-muted-foreground">Title</th>
                      <th className="px-5 py-3 text-left font-medium text-muted-foreground">Difficulty</th>
                      <th className="px-5 py-3 text-left font-medium text-muted-foreground">Category</th>
                      <th className="px-5 py-3 text-left font-medium text-muted-foreground">Duration</th>
                      <th className="px-5 py-3 text-left font-medium text-muted-foreground">Views</th>
                      <th className="px-5 py-3 text-left font-medium text-muted-foreground">Rating</th>
                      <th className="px-5 py-3 text-left font-medium text-muted-foreground">Status</th>
                      <th className="px-5 py-3 text-left font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVideos.map((video) => (
                      <tr key={video.id} className="border-b last:border-b-0 hover:bg-muted/30">
                        <td className="px-5 py-3">
                          <div className="relative h-14 w-24 rounded overflow-hidden bg-muted">
                            {video.thumbnail_url ? (
                              <img
                                src={video.thumbnail_url}
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-muted-foreground">
                                <Play className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-medium">{video.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{video.description}</p>
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant="secondary">{video.difficulty}</Badge>
                        </td>
                        <td className="px-5 py-3">
                          <Badge>{video.category}</Badge>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatDuration(video.duration)}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">{video.views.toLocaleString()}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            <span>{video.rating.toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant={video.is_active ? 'default' : 'secondary'}>
                            {video.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleView(video)} className="h-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(video)} className="h-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(video)}
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
            )}
          </CardContent>
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.pages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={pagination.page === 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(pagination.pages, prev + 1))}
                  disabled={pagination.page === pagination.pages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={(open) => (open ? setIsDialogOpen(true) : resetDialogState())}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedVideo ? 'Edit Video Lesson' : 'Upload Video Lesson'}</DialogTitle>
              <DialogDescription>
                Provide full details for the adult video lesson, including media and metadata.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Interactive pronunciation practice"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="interactive-pronunciation"
                />
                <p className="text-xs text-muted-foreground">Leave empty to auto-generate from title.</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Write a short summary of the lesson content..."
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Thumbnail</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('thumbnail', e.target.files?.[0])}
                  />
                  <p className="text-xs text-muted-foreground">Recommended 16:9 image.</p>
                </div>
                <div className="grid gap-2">
                  <Label>Video File</Label>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange('video_file', e.target.files?.[0])}
                  />
                  <p className="text-xs text-muted-foreground">Optional when using external video URL.</p>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="video_url">External Video URL</Label>
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duration (seconds) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={30}
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="speaking_exercises">Speaking Exercises</Label>
                  <Input
                    id="speaking_exercises"
                    type="number"
                    min={0}
                    value={formData.speaking_exercises}
                    onChange={(e) => setFormData({ ...formData, speaking_exercises: Number(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    min={0}
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rating">Rating (0-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min={0}
                    max={5}
                    step={0.1}
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="views">Views</Label>
                  <Input
                    id="views"
                    type="number"
                    min={0}
                    value={formData.views}
                    onChange={(e) => setFormData({ ...formData, views: Number(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="conversation, business, fluency"
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated keywords.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-muted-foreground"
                />
                <Label htmlFor="is_active">Active (visible to users)</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetDialogState}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : selectedVideo ? (
                  'Update Video'
                ) : (
                  'Create Video'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewingVideo?.title}</DialogTitle>
              <DialogDescription>Video lesson metadata and analytics</DialogDescription>
            </DialogHeader>
            {viewingVideo && (
              <div className="space-y-4">
                <div className="rounded-lg overflow-hidden bg-muted">
                  {viewingVideo.thumbnail_url ? (
                    <img
                      src={viewingVideo.thumbnail_url}
                      alt={viewingVideo.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="h-48 flex items-center justify-center text-muted-foreground">
                      <Play className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Difficulty</p>
                    <p className="font-medium">{viewingVideo.difficulty}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-medium">{viewingVideo.category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium">{formatDuration(viewingVideo.duration)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Speaking Exercises</p>
                    <p className="font-medium">{viewingVideo.speaking_exercises}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Views</p>
                    <p className="font-medium">{viewingVideo.views.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rating</p>
                    <p className="font-medium">{viewingVideo.rating.toFixed(1)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {viewingVideo.tags?.length ? (
                      viewingVideo.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">No tags</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Description</p>
                  <p className="text-sm">{viewingVideo.description || 'No description provided.'}</p>
                </div>
                {viewingVideo.video_url && (
                  <div className="text-sm">
                    <p className="text-muted-foreground mb-1">External Video URL</p>
                    <a
                      href={viewingVideo.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline"
                    >
                      {viewingVideo.video_url}
                    </a>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
              {viewingVideo && (
                <Button
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleEdit(viewingVideo);
                  }}
                >
                  Edit Video
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

