import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import '@/styles/admin.css';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('admin_sidebar_collapsed');
      return stored === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('admin_sidebar_collapsed', String(isCollapsed));
    } catch {
      // ignore
    }
  }, [isCollapsed]);

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
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              {user?.profile?.avatar ? (
                <AvatarImage src={user.profile.avatar} alt={user?.name || user?.email || 'Admin'} />
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

