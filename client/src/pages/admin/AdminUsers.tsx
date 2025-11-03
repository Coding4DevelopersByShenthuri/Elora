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
import { 
  Search, 
  UserPlus, 
  Eye, 
  Users, 
  UserCheck, 
  UserX, 
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Ban,
  CheckCircle2
} from 'lucide-react';
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
import AdminAPI from '@/services/AdminApiService';
import { CreateSuperuserDialog } from '../../components/admin/CreateSuperuserDialog';
import { UserDetailDialog } from '../../components/admin/UserDetailDialog';
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

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    newThisMonth: 0,
  });
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const { toast } = useToast();

  // Debounce search input
  const debouncedSearch = useDebounce(search, 500);

  // Debug logging
  useEffect(() => {
    console.log('[AdminUsers] Component mounted');
    const token = localStorage.getItem('speakbee_auth_token');
    const isAdmin = localStorage.getItem('speakbee_is_admin');
    console.log('[AdminUsers] Auth check:', { 
      hasToken: !!token, 
      tokenType: token === 'local-token' ? 'local' : 'server',
      isAdmin 
    });
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[AdminUsers] Loading users with params:', {
        search: debouncedSearch,
        page,
        levelFilter,
        activeFilter
      });
      
      const response = await AdminAPI.getUsers({
        search: debouncedSearch,
        page,
        page_size: 20,
        level: levelFilter || undefined,
        active: activeFilter || undefined,
      });

      console.log('[AdminUsers] API Response:', response);

      // Handle different response structures
      if (response.success) {
        const data = response.data || response;
        
        // Check if response has users array directly or nested in data
        const usersList = data.users || data.user_list || (Array.isArray(data) ? data : []);
        const paginationData = data.pagination || data.paginator || null;
        
        setUsers(usersList);
        setPagination(paginationData);
        
        console.log('[AdminUsers] Processed data:', {
          usersCount: usersList.length,
          pagination: paginationData
        });
        
        // Calculate stats from current page users (for quick overview)
        // Note: For accurate stats, we'd need a separate stats endpoint
        if (usersList.length > 0) {
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          
          const activeCount = usersList.filter((u: any) => u.is_active !== false).length;
          const inactiveCount = usersList.filter((u: any) => u.is_active === false).length;
          const newThisMonth = usersList.filter((u: any) => {
            if (!u.date_joined) return false;
            try {
              const joinedDate = new Date(u.date_joined);
              return joinedDate >= startOfMonth;
            } catch {
              return false;
            }
          }).length;

          setStats({
            total: paginationData?.total || usersList.length,
            active: activeCount,
            inactive: inactiveCount,
            newThisMonth,
          });
        } else if (paginationData) {
          // If we have pagination but no users yet, at least set the total
          setStats(prev => ({
            ...prev,
            total: paginationData.total || 0,
          }));
        }
      } else {
        const errorMessage = response.message || response.error || 'Failed to load users';
        setError(errorMessage);
        console.error('[AdminUsers] API returned error:', errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred while loading users';
      setError(errorMessage);
      console.error('[AdminUsers] Error loading users:', {
        error,
        message: errorMessage,
        response: error?.response,
        status: error?.response?.status
      });
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      console.log('[AdminUsers] Loading complete');
    }
  }, [debouncedSearch, page, levelFilter, activeFilter, toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleDeleteClick = (user: any) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setActionLoading(userToDelete.id);
    try {
      const response = await AdminAPI.deactivateUser(userToDelete.id);
      if (response.success) {
        toast({
          title: 'Success',
          description: `User ${userToDelete.name || userToDelete.email} has been deactivated successfully`,
        });
        setShowDeleteDialog(false);
        setUserToDelete(null);
        loadUsers(); // Refresh the list
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to deactivate user',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'An error occurred while deactivating user',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivateUser = async (userId: number, userName: string) => {
    setActionLoading(userId);
    try {
      const response = await AdminAPI.updateUser(userId, { is_active: true });
      if (response.success) {
        toast({
          title: 'Success',
          description: `User ${userName} has been activated successfully`,
        });
        loadUsers(); // Refresh the list
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to activate user',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'An error occurred while activating user',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewUser = async (userId: number) => {
    setActionLoading(userId);
    try {
      const response = await AdminAPI.getUser(userId);
      if (response.success) {
        setSelectedUser(response.data);
        setShowDetailDialog(true);
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to load user details',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to load user details',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefresh = () => {
    loadUsers();
  };

  // Always render the layout even if there's an error
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Debug info in development */}
        {import.meta.env.DEV && (
          <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
            Debug: loading={String(loading)}, users={users.length}, error={error || 'none'}
          </div>
        )}
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor all platform users
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Superuser
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">All registered users</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inactive}</div>
              <p className="text-xs text-muted-foreground">Deactivated accounts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newThisMonth}</div>
              <p className="text-xs text-muted-foreground">Recent registrations</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or username..."
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
                value={levelFilter || "all"} 
                onValueChange={(value) => {
                  setLevelFilter(value === "all" ? "" : value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="kids-4-10">Kids (4-10)</SelectItem>
                  <SelectItem value="kids-10-17">Kids (10-17)</SelectItem>
                  <SelectItem value="adults-beginner">Adults - Beginner</SelectItem>
                  <SelectItem value="adults-intermediate">Adults - Intermediate</SelectItem>
                  <SelectItem value="adults-advanced">Adults - Advanced</SelectItem>
                  <SelectItem value="ielts-pte">IELTS/PTE</SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={activeFilter || "all"} 
                onValueChange={(value) => {
                  setActiveFilter(value === "all" ? "" : value);
                  setPage(1);
                }}
              >
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
                  onClick={loadUsers}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Connection Check Alert */}
        {!loading && users.length === 0 && !error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No users found. Make sure the backend server is running at{' '}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                {import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}
              </code>
            </AlertDescription>
          </Alert>
        )}

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Users List</CardTitle>
                <CardDescription>
                  {loading ? 'Loading...' : `${pagination?.total || 0} total users`}
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
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No users found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {(search || (levelFilter && levelFilter !== 'all') || (activeFilter && activeFilter !== 'all'))
                    ? 'Try adjusting your filters' 
                    : 'No users have been registered yet'}
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{user.name || user.username}</span>
                              {user.profile?.points !== undefined && (
                                <span className="text-xs text-muted-foreground">
                                  {user.profile.points} points
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{user.email || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {(() => {
                                const ageRange = user.profile?.age_range;
                                const level = user.profile?.level;
                                const learningPurpose = user.profile?.learning_purpose || [];
                                
                                // Determine category based on age_range, level, and learning_purpose
                                if (ageRange && (ageRange.includes('4-10') || ageRange.includes('young'))) {
                                  return 'Kids (4-10)';
                                } else if (ageRange && (ageRange.includes('10-17') || ageRange.includes('teen'))) {
                                  return 'Kids (10-17)';
                                } else if (Array.isArray(learningPurpose) && (
                                  learningPurpose.some((p: string) => 
                                    typeof p === 'string' && (p.toLowerCase().includes('ielts') || 
                                    p.toLowerCase().includes('pte') || 
                                    p.toLowerCase().includes('exam'))
                                  )
                                )) {
                                  return 'IELTS/PTE';
                                } else if (level) {
                                  return `Adults - ${level.charAt(0).toUpperCase() + level.slice(1)}`;
                                }
                                return 'Unknown';
                              })()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.is_active ? 'default' : 'secondary'}
                              className={user.is_active ? 'bg-green-500 hover:bg-green-600' : ''}
                            >
                              {user.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.is_superuser ? (
                              <Badge variant="destructive">Superuser</Badge>
                            ) : user.is_staff ? (
                              <Badge variant="secondary">Staff</Badge>
                            ) : (
                              <Badge variant="outline">User</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.date_joined
                              ? new Date(user.date_joined).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewUser(user.id)}
                                disabled={actionLoading === user.id}
                                title="View and edit details"
                                className="h-8 w-8"
                              >
                                {actionLoading === user.id ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                              {user.is_active ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteClick(user)}
                                  disabled={user.is_superuser || actionLoading === user.id}
                                  title={user.is_superuser ? 'Cannot deactivate superuser' : 'Deactivate user'}
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                >
                                  <Ban className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleActivateUser(user.id, user.name || user.email)}
                                  disabled={actionLoading === user.id}
                                  title="Activate user"
                                  className="h-8 w-8 text-green-600 hover:text-green-700"
                                >
                                  {actionLoading === user.id ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </div>
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
                      ({pagination.total} total users)
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

        {/* Dialogs */}
        <CreateSuperuserDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSuccess={() => {
            setShowCreateDialog(false);
            loadUsers();
          }}
        />

        <UserDetailDialog
          open={showDetailDialog}
          onClose={() => {
            setShowDetailDialog(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onUpdate={loadUsers}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deactivate User?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to deactivate{' '}
                <strong>{userToDelete?.name || userToDelete?.email || 'this user'}</strong>?
                This will prevent them from accessing their account. You can reactivate them later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={actionLoading !== null}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                disabled={actionLoading !== null}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {actionLoading === userToDelete?.id ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Deactivating...
                  </>
                ) : (
                  <>
                    <Ban className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}

