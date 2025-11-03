import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminAPI from '@/services/AdminApiService';
import { useToast } from '@/hooks/use-toast';

interface UserDetailDialogProps {
  open: boolean;
  onClose: () => void;
  user: any;
  onUpdate: () => void;
}

export function UserDetailDialog({
  open,
  onClose,
  user,
  onUpdate,
}: UserDetailDialogProps) {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        is_active: user.is_active ?? true,
        is_staff: user.is_staff ?? false,
        is_superuser: user.is_superuser ?? false,
        profile: {
          level: user.profile?.level || 'beginner',
          points: user.profile?.points || 0,
        },
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const response = await AdminAPI.updateUser(user.id, formData);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'User updated successfully',
        });
        onUpdate();
        onClose();
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to update user',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            View and edit user information
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Information</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Username</Label>
                  <Input value={user.username} disabled />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Level</Label>
                  <Input
                    value={formData.profile?.level || 'beginner'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profile: {
                          ...formData.profile,
                          level: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Active</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable or disable user account
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Staff</Label>
                    <p className="text-sm text-muted-foreground">
                      Grant staff privileges
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_staff}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_staff: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Superuser</Label>
                    <p className="text-sm text-muted-foreground">
                      Grant superuser privileges
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_superuser}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_superuser: checked })
                    }
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="stats" className="space-y-4">
              {user.stats && (
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">
                        Lessons Completed
                      </Label>
                      <p className="text-2xl font-bold">
                        {user.stats.lessons_completed || 0}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Total Sessions
                      </Label>
                      <p className="text-2xl font-bold">
                        {user.stats.total_sessions || 0}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Practice Time
                      </Label>
                      <p className="text-2xl font-bold">
                        {Math.round((user.stats.total_practice_time || 0) / 60)}h
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Vocabulary
                      </Label>
                      <p className="text-2xl font-bold">
                        {user.stats.vocabulary_count || 0}
                      </p>
                    </div>
                  </div>
                  {user.date_joined && (
                    <div>
                      <Label className="text-muted-foreground">
                        Joined
                      </Label>
                      <p>{new Date(user.date_joined).toLocaleString()}</p>
                    </div>
                  )}
                  {user.last_login && (
                    <div>
                      <Label className="text-muted-foreground">
                        Last Login
                      </Label>
                      <p>{new Date(user.last_login).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

