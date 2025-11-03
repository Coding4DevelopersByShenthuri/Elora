import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { API } from '@/services/ApiService';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface AdminSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function AdminSidebar({ isCollapsed = false, onToggle }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
    },
    {
      title: 'Users',
      icon: Users,
      path: '/admin/users',
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      path: '/admin/analytics',
    },
    {
      title: 'Settings',
      icon: Settings,
      path: '/admin/settings',
    },
  ];

  const handleLogout = () => {
    API.auth.logout();
    localStorage.removeItem('speakbee_is_admin');
    navigate('/admin/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 border-r transition-all duration-300 lg:translate-x-0 admin-sidebar text-white',
          // Width behavior: mobile is full width 16rem, desktop depends on collapsed
          'w-64',
          isCollapsed ? 'lg:w-20' : 'lg:w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className={cn('flex items-center p-3 border-b border-white/10', isCollapsed ? 'justify-center' : 'justify-between')}> 
            <div className={cn('flex items-center gap-3', isCollapsed ? 'justify-center' : '')}>
              <img src="/logo01.png" alt="Elora" className={cn('rounded bg-white/10 p-1', isCollapsed ? 'h-14 w-14' : 'h-10 w-10')} />
              {!isCollapsed && (
                <div>
                  <h2 className="font-bold text-lg leading-none">Admin</h2>
                  <p className="text-xs text-white/70">Control Panel</p>
                </div>
              )}
            </div>
            {/* Desktop hamburger */}
            <div className={cn('hidden lg:block', isCollapsed ? 'absolute left-2' : '')}>
              <Button
                variant="ghost"
                size="icon"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                onClick={onToggle}
              >
                <Menu className="h-5 w-5 text-white" />
              </Button>
            </div>
          </div>

          {/* Upload action */}
          <div className={cn('p-4 border-b border-white/10', isCollapsed ? 'flex justify-center' : '')}>
            <label className={cn(
              'inline-flex items-center gap-2 rounded-lg cursor-pointer transition-colors',
              'bg-[var(--admin-yellow)] text-gray-800 hover:opacity-95',
              isCollapsed ? 'p-2' : 'px-4 py-2'
            )}>
              <Upload className={cn('h-4 w-4')} />
              {!isCollapsed && <span className="text-sm font-semibold">Upload Document</span>}
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    console.log('Selected file for upload:', file.name);
                    // TODO: hook to backend endpoint when available
                  }
                }}
              />
            </label>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center rounded-lg transition-colors admin-nav-link',
                    isCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3 justify-start',
                    active ? 'active' : 'text-white/80'
                  )}
                  title={item.title}
                >
                  <Icon className={cn('h-5 w-5', active ? 'text-gray-800' : 'text-white')} />
                  {!isCollapsed && <span className={cn('font-medium', active ? 'text-gray-800' : 'text-white')}>{item.title}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/10">
            <Button
              variant="ghost"
              className={cn('w-full', isCollapsed ? 'justify-center' : 'justify-start gap-3')}
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="h-5 w-5 text-white" />
              {!isCollapsed && <span className="text-white">Logout</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}

