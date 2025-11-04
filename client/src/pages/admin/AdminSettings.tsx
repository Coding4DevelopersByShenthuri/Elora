import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Info, ShieldCheck, CheckCircle2, XCircle, Moon, Sun, 
  User, Upload, Trash2, Palette, BarChart3, Globe
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { AdminAPI } from '@/services/AdminApiService';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function AdminSettings() {
  const { user: currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadingSettings, setLoadingSettings] = useState<boolean>(false);
  const [savingAnalytics, setSavingAnalytics] = useState<boolean>(false);
  const [savingSecurity, setSavingSecurity] = useState<boolean>(false);
  const [savingGeneral, setSavingGeneral] = useState<boolean>(false);
  const [savingAppearance, setSavingAppearance] = useState<boolean>(false);
  const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false);
  const [removingAvatar, setRemovingAvatar] = useState<boolean>(false);
  const [settingsError, setSettingsError] = useState<string>('');
  const [settingsMessage, setSettingsMessage] = useState<string>('');

  const [settings, setSettings] = useState<{ 
    platform_name: string;
    support_email: string;
    maintenance_mode: boolean;
    allow_registrations: boolean;
    ga_id: string;
    clarity_id: string;
    analytics_enabled: boolean;
    require_email_verification: boolean;
    two_factor_admin: boolean;
    session_timeout_minutes: number;
    default_theme: 'light' | 'dark' | 'auto';
  }>({
    platform_name: 'Elora',
    support_email: 'support@elora.com',
    maintenance_mode: false,
    allow_registrations: true,
    ga_id: '',
    clarity_id: '',
    analytics_enabled: true,
    require_email_verification: true,
    two_factor_admin: false,
    session_timeout_minutes: 60,
    default_theme: 'light',
  });

  const [adminAvatar, setAdminAvatar] = useState<string | null>(currentUser?.profile?.avatar || null);
  const [grantEmail, setGrantEmail] = useState('');
  const [grantLoading, setGrantLoading] = useState(false);
  const [grantMessage, setGrantMessage] = useState<string>('');
  const [grantError, setGrantError] = useState<string>('');

  // Load settings from server
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingSettings(true);
      setSettingsError('');
      try {
        const res = await AdminAPI.getSettings();
        if (res.success && 'data' in res) {
          const data = (res as any).data;
          if (mounted) {
            setSettings((prev) => ({ ...prev, ...data }));
            if (data.default_theme) {
              // Apply theme if it's different from current
              const currentTheme = localStorage.getItem('theme') || 'light';
              if (data.default_theme !== 'auto' && data.default_theme !== currentTheme && theme !== data.default_theme) {
                // Only toggle if needed
                if ((data.default_theme === 'dark' && theme === 'light') || (data.default_theme === 'light' && theme === 'dark')) {
                  toggleTheme();
                }
              }
            }
          }
        } else if (mounted) {
          setSettingsError((res as any).message || 'Failed to load settings');
        }
      } catch (e: any) {
        if (mounted) setSettingsError(e?.message || 'Failed to load settings');
      } finally {
        if (mounted) setLoadingSettings(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Load admin avatar
  useEffect(() => {
    if (currentUser?.profile?.avatar) {
      setAdminAvatar(currentUser.profile.avatar);
    }
  }, [currentUser]);

  const transientNotify = (msg: string) => {
    setSettingsMessage(msg);
    setTimeout(() => setSettingsMessage(''), 3000);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSettingsError('No file selected');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setSettingsError('Please select an image file (PNG, JPG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSettingsError('Image size must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    setSettingsError('');
    setSettingsMessage('');

    try {
      // Convert to base64
      const reader = new FileReader();
      
      reader.onerror = () => {
        setSettingsError('Failed to read the file. Please try again.');
        setUploadingAvatar(false);
      };

      reader.onloadend = async () => {
        try {
          const base64Data = reader.result as string;
          
          if (!base64Data) {
            setSettingsError('Failed to convert image to base64');
            setUploadingAvatar(false);
            return;
          }

          console.log('📤 Uploading avatar...', { fileSize: file.size, fileType: file.type });
          
          const res = await AdminAPI.uploadAvatar(base64Data);
          
          console.log('📥 Avatar upload response:', res);
          
          if (res.success) {
            // Check both possible response structures
            const avatarUrl = (res as any).data?.avatar || (res as any).avatar;
            
            if (avatarUrl) {
              setAdminAvatar(avatarUrl);
              transientNotify('Avatar updated successfully!');
              
              // Update current user context
              if (currentUser) {
                currentUser.profile.avatar = avatarUrl;
              }
              
              // Clear the file input
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            } else {
              setSettingsError('Avatar uploaded but no URL returned. Please refresh the page.');
            }
          } else {
            const errorMsg = (res as any).message || 'Failed to upload avatar';
            console.error('❌ Avatar upload failed:', errorMsg, res);
            setSettingsError(errorMsg);
          }
        } catch (e: any) {
          console.error('❌ Avatar upload error:', e);
          const errorMsg = e?.response?.data?.message || e?.message || 'Failed to upload avatar. Please check your connection.';
          setSettingsError(errorMsg);
        } finally {
          setUploadingAvatar(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (e: any) {
      console.error('❌ File read error:', e);
      setSettingsError(e?.message || 'Failed to process the image file');
      setUploadingAvatar(false);
    }
  };

  const handleAvatarRemove = async () => {
    if (!confirm('Are you sure you want to remove your profile picture?')) return;
    
    setRemovingAvatar(true);
    setSettingsError('');
    try {
      const res = await AdminAPI.removeAvatar();
      if (res.success) {
        setAdminAvatar(null);
        transientNotify('Avatar removed successfully');
        // Update current user context
        if (currentUser) {
          currentUser.profile.avatar = undefined;
        }
      } else {
        setSettingsError((res as any).message || 'Failed to remove avatar');
      }
    } catch (e: any) {
      setSettingsError(e?.message || 'Failed to remove avatar');
    } finally {
      setRemovingAvatar(false);
    }
  };

  const saveAnalytics = async () => {
    setSavingAnalytics(true);
    setSettingsError('');
    try {
      const res = await AdminAPI.updateSettings({
        ga_id: settings.ga_id,
        clarity_id: settings.clarity_id,
        analytics_enabled: settings.analytics_enabled,
      });
      if (res.success) transientNotify('Analytics settings saved');
      else setSettingsError((res as any).message || 'Failed to save analytics settings');
    } catch (e: any) {
      setSettingsError(e?.message || 'Failed to save analytics settings');
    } finally {
      setSavingAnalytics(false);
    }
  };

  const saveSecurity = async () => {
    setSavingSecurity(true);
    setSettingsError('');
    try {
      const res = await AdminAPI.updateSettings({
        require_email_verification: settings.require_email_verification,
        two_factor_admin: settings.two_factor_admin,
        session_timeout_minutes: settings.session_timeout_minutes,
      });
      if (res.success) transientNotify('Security settings saved');
      else setSettingsError((res as any).message || 'Failed to save security settings');
    } catch (e: any) {
      setSettingsError(e?.message || 'Failed to save security settings');
    } finally {
      setSavingSecurity(false);
    }
  };

  const saveGeneral = async () => {
    setSavingGeneral(true);
    setSettingsError('');
    try {
      const res = await AdminAPI.updateSettings({
        platform_name: settings.platform_name,
        support_email: settings.support_email,
        maintenance_mode: settings.maintenance_mode,
        allow_registrations: settings.allow_registrations,
      });
      if (res.success) transientNotify('General settings saved');
      else setSettingsError((res as any).message || 'Failed to save general settings');
    } catch (e: any) {
      setSettingsError(e?.message || 'Failed to save general settings');
    } finally {
      setSavingGeneral(false);
    }
  };

  const saveAppearance = async () => {
    setSavingAppearance(true);
    setSettingsError('');
    try {
      const res = await AdminAPI.updateSettings({
        default_theme: settings.default_theme,
      });
      if (res.success) {
        transientNotify('Appearance settings saved');
        // Apply theme immediately if not auto
        if (settings.default_theme !== 'auto') {
          const currentTheme = localStorage.getItem('theme') || 'light';
          if (settings.default_theme !== currentTheme) {
            toggleTheme();
          }
        }
      } else {
        setSettingsError((res as any).message || 'Failed to save appearance settings');
      }
    } catch (e: any) {
      setSettingsError(e?.message || 'Failed to save appearance settings');
    } finally {
      setSavingAppearance(false);
    }
  };

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
        setGrantMessage('This user already has admin access.');
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
        setGrantMessage(`Admin access granted successfully to ${user.email || grantEmail}`);
        setGrantEmail(''); // Clear field on success
        
        // Analytics event (GA4)
        try {
          // @ts-ignore
          if (window.gtag) {
            // @ts-ignore
            window.gtag('event', 'admin_grant_access', {
              event_category: 'admin_actions',
              event_label: user.email || grantEmail,
            });
          }
        } catch {}

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

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'AD';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure platform settings, appearance, and your admin profile
          </p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5 soft-card">
            <TabsTrigger value="general">
              <Globe className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="security">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          {(settingsError || settingsMessage) && (
            <div className="mt-4">
              {settingsError && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{settingsError}</AlertDescription>
                </Alert>
              )}
              {settingsMessage && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    {settingsMessage}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-4">
            <Card className="soft-card">
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
                      value={settings.platform_name}
                      onChange={(e) => setSettings({ ...settings, platform_name: e.target.value })}
                      disabled={loadingSettings}
                    />
                    <p className="text-sm text-muted-foreground">
                      The name of your platform as displayed to users
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="support-email">Support Email</Label>
                    <Input
                      id="support-email"
                      type="email"
                      value={settings.support_email}
                      onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                      disabled={loadingSettings}
                    />
                    <p className="text-sm text-muted-foreground">
                      Contact email address for user support inquiries
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable maintenance mode to restrict access to the platform
                      </p>
                    </div>
                    <Switch
                      checked={settings.maintenance_mode}
                      onCheckedChange={(v) => setSettings({ ...settings, maintenance_mode: v })}
                      disabled={loadingSettings}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Registrations</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow new users to create accounts and register
                      </p>
                    </div>
                    <Switch
                      checked={settings.allow_registrations}
                      onCheckedChange={(v) => setSettings({ ...settings, allow_registrations: v })}
                      disabled={loadingSettings}
                    />
                  </div>

                  <Button onClick={saveGeneral} disabled={savingGeneral || loadingSettings}>
                    {savingGeneral ? 'Saving...' : 'Save General Settings'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card className="soft-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Admin Profile
                </CardTitle>
                <CardDescription>
                  Manage your admin profile picture and account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24 border-2 border-primary">
                    <AvatarImage src={adminAvatar || undefined} alt={currentUser?.name || 'Admin'} />
                    <AvatarFallback className="text-xl font-semibold">
                      {getInitials(currentUser?.name, currentUser?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div>
                      <Label className="text-base font-semibold">Profile Picture</Label>
                      <p className="text-sm text-muted-foreground">
                        Upload a profile picture to personalize your admin account. Maximum file size: 5MB
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar || removingAvatar}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingAvatar ? 'Uploading...' : 'Upload Picture'}
                      </Button>
                      {adminAvatar && (
                        <Button
                          variant="outline"
                          onClick={handleAvatarRemove}
                          disabled={uploadingAvatar || removingAvatar}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {removingAvatar ? 'Removing...' : 'Remove'}
                        </Button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Admin Info */}
                <div className="grid gap-4 pt-4 border-t">
                  <div className="grid gap-2">
                    <Label>Name</Label>
                    <Input value={currentUser?.name || 'Admin User'} disabled />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input value={currentUser?.email || ''} disabled />
                  </div>
                  <div className="grid gap-2">
                    <Label>Role</Label>
                    <Input 
                      value={currentUser?.is_superuser ? 'Super Admin' : currentUser?.is_staff ? 'Admin' : 'User'} 
                      disabled 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4">
            <Card className="soft-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance Settings
                </CardTitle>
                <CardDescription>
                  Customize the platform's appearance and theme preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    These settings control the default theme for all users. Individual users can override this in their personal settings.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Label className="text-base font-semibold">Theme Mode</Label>
                        {theme === 'dark' ? (
                          <Moon className="h-4 w-4 text-primary" />
                        ) : (
                          <Sun className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Toggle between light and dark mode for the admin interface
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={toggleTheme}
                      className="gap-2"
                    >
                      {theme === 'dark' ? (
                        <>
                          <Sun className="h-5 w-5" />
                          Light Mode
                        </>
                      ) : (
                        <>
                          <Moon className="h-5 w-5" />
                          Dark Mode
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="default-theme">Default Theme for Platform</Label>
                    <select
                      id="default-theme"
                      value={settings.default_theme}
                      onChange={(e) => setSettings({ ...settings, default_theme: e.target.value as 'light' | 'dark' | 'auto' })}
                      disabled={loadingSettings}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto (System Preference)</option>
                    </select>
                    <p className="text-sm text-muted-foreground">
                      Set the default theme for new users. Auto will follow the user's system preference.
                    </p>
                  </div>

                  <Button onClick={saveAppearance} disabled={savingAppearance || loadingSettings}>
                    {savingAppearance ? 'Saving...' : 'Save Appearance Settings'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Settings */}
          <TabsContent value="analytics" className="space-y-4">
            <Card className="soft-card">
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
                      value={settings.ga_id}
                      onChange={(e) => setSettings({ ...settings, ga_id: e.target.value })}
                      disabled={loadingSettings}
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
                      value={settings.clarity_id}
                      onChange={(e) => setSettings({ ...settings, clarity_id: e.target.value })}
                      disabled={loadingSettings}
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
                    <Switch
                      checked={settings.analytics_enabled}
                      onCheckedChange={(v) => setSettings({ ...settings, analytics_enabled: v })}
                      disabled={loadingSettings}
                    />
                  </div>

                  <Button onClick={saveAnalytics} disabled={savingAnalytics || loadingSettings}>
                    {savingAnalytics ? 'Saving...' : 'Save Analytics Settings'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-4">
            <Card className="soft-card">
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
                    <Switch
                      checked={settings.require_email_verification}
                      onCheckedChange={(v) => setSettings({ ...settings, require_email_verification: v })}
                      disabled={loadingSettings}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Require 2FA for admin accounts
                      </p>
                    </div>
                    <Switch
                      checked={settings.two_factor_admin}
                      onCheckedChange={(v) => setSettings({ ...settings, two_factor_admin: v })}
                      disabled={loadingSettings}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Session Timeout</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically log out inactive users
                      </p>
                    </div>
                    <Switch disabled />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="session-duration">Session Duration (minutes)</Label>
                    <Input
                      id="session-duration"
                      type="number"
                      value={settings.session_timeout_minutes}
                      onChange={(e) => setSettings({ ...settings, session_timeout_minutes: Math.max(5, Math.min(1440, Number(e.target.value || 0))) })}
                      min="5"
                      max="1440"
                      disabled={loadingSettings}
                    />
                  </div>

                  <Button onClick={saveSecurity} disabled={savingSecurity || loadingSettings}>
                    {savingSecurity ? 'Saving...' : 'Save Security Settings'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
