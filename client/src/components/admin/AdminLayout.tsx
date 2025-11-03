import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { NotificationDropdown } from './NotificationDropdown';
import { useAuth } from '@/contexts/AuthContext';
import { API } from '@/services/ApiService';
import '@/styles/admin.css';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, updateUserProfile } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('admin_sidebar_collapsed');
      return stored === 'true';
    } catch {
      return false;
    }
  });
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.profile?.avatar);

  useEffect(() => {
    try {
      localStorage.setItem('admin_sidebar_collapsed', String(isCollapsed));
    } catch {
      // ignore
    }
  }, [isCollapsed]);

  // Fetch admin user's profile photo when component mounts
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const token = localStorage.getItem('speakbee_auth_token');
        // Only fetch if we have a real token (not local-token)
        if (token && token !== 'local-token') {
          const response = await API.auth.getUserInfo();
          if (response.success && 'data' in response && response.data) {
            const userData = response.data;
            const fetchedAvatar = userData.profile?.avatar;
            
            if (fetchedAvatar) {
              setAvatarUrl(fetchedAvatar);
              // Update the user profile in context as well
              updateUserProfile({ avatar: fetchedAvatar });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching admin profile:', error);
        // If fetch fails, use the avatar from context if available
        if (user?.profile?.avatar) {
          setAvatarUrl(user.profile.avatar);
        }
      }
    };

    fetchAdminProfile();
  }, [user?.id, updateUserProfile]);

  // Update avatar when user changes
  useEffect(() => {
    if (user?.profile?.avatar) {
      setAvatarUrl(user.profile.avatar);
    }
  }, [user?.profile?.avatar]);

  const avatarFallback = (user?.name || user?.username || user?.email || 'A')
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background admin-theme">
      <AdminSidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed((v) => !v)} />
      <main className={isCollapsed ? 'lg:pl-20 min-h-screen' : 'lg:pl-64 min-h-screen'}>
        {/* Top-right header */}
        <div className="sticky top-0 z-30 flex items-center justify-end gap-3 border-b bg-background/80 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <NotificationDropdown />
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={user?.name || user?.email || 'Admin'} />
              ) : null}
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
            <div className="hidden sm:block leading-tight">
              <p className="text-sm font-medium">{user?.name || user?.username || 'Admin'}</p>
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{user?.email || ''}</p>
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

