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
  BookOpen,
  TrendingUp,
  Users,
  Award,
  BarChart3,
  Filter,
  Star,
  Target
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

const DIFFICULTY_LEVELS = [
  { value: '1', label: 'Level 1' },
  { value: '2', label: 'Level 2' },
  { value: '3', label: 'Level 3' },
  { value: '4', label: 'Level 4' },
  { value: '5', label: 'Level 5' },
  { value: '6', label: 'Level 6' },
  { value: '7', label: 'Level 7' },
  { value: '8', label: 'Level 8' },
  { value: '9', label: 'Level 9' },
  { value: '10', label: 'Level 10' },
];

const getMasteryColor = (mastery: number) => {
  if (mastery >= 80) return 'text-green-600 dark:text-green-400';
  if (mastery >= 60) return 'text-yellow-600 dark:text-yellow-400';
  if (mastery >= 40) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
};

const getMasteryBadgeColor = (mastery: number) => {
  if (mastery >= 80) return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
  if (mastery >= 60) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
  if (mastery >= 40) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400';
  return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
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

export default function AdminVocabulary() {
  const [words, setWords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const { toast } = useToast();

  // Debounce search input
  const debouncedSearch = useDebounce(search, 500);

  const loadWords = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);
      
      const response = await AdminAPI.getVocabularyWords({
        search: debouncedSearch,
        page,
        page_size: 20,
        category: categoryFilter || undefined,
        difficulty: difficultyFilter || undefined,
      });

      if (response.success) {
        const data = response.data;
        setWords(data.vocabulary || []);
        setPagination(data.pagination || null);
      } else {
        const errorMessage = response.message || 'Failed to load vocabulary words';
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
      const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred while loading vocabulary words';
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
  }, [debouncedSearch, page, categoryFilter, difficultyFilter, toast]);

  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const response = await AdminAPI.getVocabularyStats();
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
    loadWords();
  }, [loadWords]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Auto-refresh every 30 seconds for real-time data
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      loadWords(true);
      loadStats();
    }, 30000); // 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, [search, categoryFilter, difficultyFilter, page]);

  const handleViewWord = async (wordId: number) => {
    setActionLoading(wordId);
    try {
      const response = await AdminAPI.getVocabularyWord(wordId);
      if (response.success) {
        setSelectedWord(response.data);
        setShowDetailDialog(true);
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to load word details',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to load word details',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefresh = () => {
    loadWords();
    loadStats();
  };

  // Get unique categories from stats
  const categories = stats?.category_distribution?.map((item: any) => item.category).filter(Boolean) || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vocabulary Management</h1>
            <p className="text-muted-foreground mt-1">
              Monitor and analyze all vocabulary words across the platform
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
                <CardTitle className="text-sm font-medium">Total Words</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overall?.total_words?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.recent?.new_words_30 || 0} new in last 30 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overall?.unique_users?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.recent?.active_users_30 || 0} active in last 30 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Mastery</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overall?.avg_mastery?.toFixed(1) || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  Accuracy: {stats.overall?.accuracy_rate?.toFixed(1) || 0}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Practiced</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overall?.total_practiced?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.recent?.words_practiced_30 || 0} in last 30 days
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Category Distribution */}
        {stats && stats.category_distribution && stats.category_distribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
              <CardDescription>Vocabulary words by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {stats.category_distribution.slice(0, 10).map((item: any) => (
                  <div key={item.category || 'uncategorized'} className="text-center">
                    <div className="text-2xl font-bold">{item.count}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {item.category || 'Uncategorized'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {item.avg_mastery?.toFixed(1) || 0}% avg mastery
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mastery Distribution */}
        {stats && stats.mastery_distribution && stats.mastery_distribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Mastery Level Distribution</CardTitle>
              <CardDescription>Words by mastery level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.mastery_distribution.map((item: any) => (
                  <div key={item.range} className="text-center">
                    <div className="text-2xl font-bold">{item.count}</div>
                    <div className="text-xs text-muted-foreground">{item.range}</div>
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
                    placeholder="Search by word, definition, user, or category..."
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
                value={categoryFilter || "all"} 
                onValueChange={(value) => {
                  setCategoryFilter(value === "all" ? "" : value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat: string) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select 
                value={difficultyFilter || "all"} 
                onValueChange={(value) => {
                  setDifficultyFilter(value === "all" ? "" : value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="All Difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  {DIFFICULTY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
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
                  onClick={loadWords}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Words Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Vocabulary Words</CardTitle>
                <CardDescription>
                  {loading ? 'Loading...' : `${pagination?.total || 0} total words`}
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
            ) : words.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No vocabulary words found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {(search || categoryFilter || difficultyFilter)
                    ? 'Try adjusting your filters' 
                    : 'No vocabulary words have been recorded yet'}
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Word</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Mastery Level</TableHead>
                        <TableHead>Practice Stats</TableHead>
                        <TableHead>Last Practiced</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {words.map((word) => (
                        <TableRow key={word.id}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span className="font-semibold">{word.word}</span>
                              {word.definition && (
                                <span className="text-xs text-muted-foreground line-clamp-1">
                                  {word.definition}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{word.user?.name || word.user?.username || 'Unknown'}</span>
                              <span className="text-xs text-muted-foreground">
                                {word.user?.email || ''}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {word.category ? (
                              <Badge variant="outline" className="capitalize">
                                {word.category}
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">Level {word.difficulty || 1}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge className={cn(getMasteryBadgeColor(word.mastery_level || 0))}>
                                {word.mastery_level?.toFixed(1) || 0}%
                              </Badge>
                              <Star className={cn("h-4 w-4", getMasteryColor(word.mastery_level || 0))} />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                              <span>Practiced: {word.times_practiced || 0}</span>
                              <span>Correct: {word.times_correct || 0}</span>
                              <span>Incorrect: {word.times_incorrect || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {word.last_practiced ? formatDate(word.last_practiced) : '—'}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewWord(word.id)}
                              disabled={actionLoading === word.id}
                              title="View word details"
                              className="h-8 w-8"
                            >
                              {actionLoading === word.id ? (
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
                      ({pagination.total} total words)
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

        {/* Word Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Vocabulary Word Details</DialogTitle>
              <DialogDescription>
                Detailed information about this vocabulary word
              </DialogDescription>
            </DialogHeader>
            {selectedWord && (
              <div className="space-y-4">
                {/* Word Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Word Information</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">Word:</span>{' '}
                        <span className="font-semibold text-lg">{selectedWord.word}</span>
                      </p>
                      {selectedWord.definition && (
                        <p>
                          <span className="text-muted-foreground">Definition:</span>{' '}
                          {selectedWord.definition}
                        </p>
                      )}
                      {selectedWord.example_sentence && (
                        <p>
                          <span className="text-muted-foreground">Example:</span>{' '}
                          <em className="text-xs">{selectedWord.example_sentence}</em>
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">User Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Name:</span> {selectedWord.user?.name || selectedWord.user?.username}</p>
                      <p><span className="text-muted-foreground">Email:</span> {selectedWord.user?.email}</p>
                      <p><span className="text-muted-foreground">Username:</span> {selectedWord.user?.username}</p>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Performance Metrics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground">Mastery Level</div>
                      <div className={cn('text-2xl font-bold', getMasteryColor(selectedWord.mastery_level || 0))}>
                        {selectedWord.mastery_level?.toFixed(1) || 0}%
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground">Times Practiced</div>
                      <div className="text-2xl font-bold">{selectedWord.times_practiced || 0}</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground">Times Correct</div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {selectedWord.times_correct || 0}
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground">Times Incorrect</div>
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {selectedWord.times_incorrect || 0}
                      </div>
                    </div>
                  </div>
                  {selectedWord.accuracy !== undefined && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                      <div className="text-sm">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          Accuracy Rate: {selectedWord.accuracy}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Additional Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm p-3 bg-muted rounded-lg">
                    <div>
                      <p><span className="text-muted-foreground">Category:</span> {selectedWord.category || '—'}</p>
                      <p><span className="text-muted-foreground">Difficulty:</span> Level {selectedWord.difficulty || 1}</p>
                    </div>
                    <div>
                      <p><span className="text-muted-foreground">First Learned:</span> {selectedWord.first_learned ? formatDate(selectedWord.first_learned) : '—'}</p>
                      <p><span className="text-muted-foreground">Last Practiced:</span> {selectedWord.last_practiced ? formatDate(selectedWord.last_practiced) : '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
