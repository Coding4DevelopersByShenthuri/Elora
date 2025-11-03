import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { AdminAPI } from '@/services/ApiService';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminSettings() {
  const { user: currentUser } = useAuth();
  const [grantEmail, setGrantEmail] = useState('');
  const [grantLoading, setGrantLoading] = useState(false);
  const [grantMessage, setGrantMessage] = useState<string>('');
  const [grantError, setGrantError] = useState<string>('');

  const handleGrantAdmin = async () => {
    setGrantError('');
    setGrantMessage('');
    
    if (!grantEmail) {
      setGrantError('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(grantEmail)) {
      setGrantError('Please enter a valid email address');
      return;
    }

    setGrantLoading(true);
    try {
      // Find user by email (admin search supports partials; prefer exact match)
      const res = await AdminAPI.getUsers({ search: grantEmail });
      if (!res.success || !('data' in res)) {
        const msg = (res as any).message || 'Failed to search users';
        setGrantError(msg);
        return;
      }
      const users = ((res as any).data?.users || []) as Array<any>;
      const user = users.find((u) => (u.email || '').toLowerCase() === grantEmail.toLowerCase());
      
      if (!user) {
        setGrantError(`No user found with email: ${grantEmail}`);
        return;
      }

      // Check if user already has admin access
      if (user.is_staff || user.is_superuser) {
        setGrantMessage('✅ This user already has admin access.');
        setGrantEmail(''); // Clear field
        return;
      }

      // Prevent self-modification (extra safety check)
      const currentEmail = currentUser?.email?.toLowerCase();
      if (user.email?.toLowerCase() === currentEmail) {
        setGrantError('You cannot modify your own admin status. Ask another admin to do this.');
        return;
      }

      // Promote to admin (set is_staff = true)
      const update = await AdminAPI.updateUser(Number(user.id), { is_staff: true });
      if (update.success && 'data' in update) {
        setGrantMessage(`✅ Admin access granted successfully to ${user.email || grantEmail}`);
        setGrantEmail(''); // Clear field on success
        
        // Clear message after 5 seconds
        setTimeout(() => {
          setGrantMessage('');
        }, 5000);
      } else {
        const msg = (update as any).message || 'Failed to grant admin access';
        setGrantError(msg);
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'An error occurred';
      setGrantError(msg);
    } finally {
      setGrantLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure platform settings and integrations
          </p>
        </div>

        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
          </TabsList>

          {/* Analytics Settings */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Integration</CardTitle>
                <CardDescription>
                  Configure Google Analytics and Microsoft Clarity tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Analytics integration helps track user behavior and improve the platform.
                    Add your tracking IDs to enable analytics.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="ga-id">Google Analytics ID (G-XXXXXXXXXX)</Label>
                    <Input
                      id="ga-id"
                      placeholder="G-XXXXXXXXXX"
                      defaultValue={import.meta.env.VITE_GA_ID || ''}
                    />
                    <p className="text-sm text-muted-foreground">
                      Your Google Analytics 4 Measurement ID
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="clarity-id">Microsoft Clarity ID</Label>
                    <Input
                      id="clarity-id"
                      placeholder="Your Clarity Project ID"
                      defaultValue={import.meta.env.VITE_CLARITY_ID || ''}
                    />
                    <p className="text-sm text-muted-foreground">
                      Your Microsoft Clarity Project ID
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Track user behavior and page visits
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Button>Save Analytics Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure security and access control settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {/* Grant Admin Access */}
                  <div className="grid gap-3 p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      <Label className="text-base font-semibold">Grant Admin Access to Existing User</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enter the user's email address to grant admin portal access. The user will be able to login at{' '}
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">/admin/login</code> using their existing email and password.
                    </p>
                    <div className="flex gap-2 items-start">
                      <div className="flex-1">
                        <Input
                          placeholder="user@example.com"
                          value={grantEmail}
                          onChange={(e) => {
                            setGrantEmail(e.target.value);
                            // Clear messages when user types
                            setGrantMessage('');
                            setGrantError('');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !grantLoading) {
                              handleGrantAdmin();
                            }
                          }}
                          type="email"
                          disabled={grantLoading}
                          className="w-full"
                        />
                      </div>
                      <Button 
                        onClick={handleGrantAdmin} 
                        disabled={grantLoading || !grantEmail.trim()}
                        className="min-w-[120px]"
                      >
                        {grantLoading ? 'Granting...' : 'Grant Admin'}
                      </Button>
                    </div>
                    
                    {/* Success Message */}
                    {grantMessage && (
                      <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800 dark:text-green-200">
                          {grantMessage}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Error Message */}
                    {grantError && (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                          {grantError}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Email Verification</Label>
                      <p className="text-sm text-muted-foreground">
                        Users must verify their email before accessing the platform
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Require 2FA for admin accounts
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Session Timeout</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically log out inactive users
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="session-duration">Session Duration (minutes)</Label>
                    <Input
                      id="session-duration"
                      type="number"
                      defaultValue="60"
                      min="5"
                      max="1440"
                    />
                  </div>

                  <Button>Save Security Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Platform configuration and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="platform-name">Platform Name</Label>
                    <Input
                      id="platform-name"
                      defaultValue="Elora"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="support-email">Support Email</Label>
                    <Input
                      id="support-email"
                      type="email"
                      defaultValue="support@elora.com"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable maintenance mode to restrict access
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Registrations</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow new users to register
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Button>Save General Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

