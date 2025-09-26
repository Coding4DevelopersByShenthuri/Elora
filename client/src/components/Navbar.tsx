import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, LogIn, Search, Upload, User, Settings, LogOut, Moon, Sun, 
  Table, Info, HelpCircle, Code, Menu, Users, Baby, FolderTree, Lightbulb ,
  GraduationCap, Layers, Award
} from 'lucide-react';
import { useRippleEffect } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import AuthModal from '@/components/AuthModal';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  hasSubmenu?: boolean;
  children?: React.ReactNode;
}

const NavItem = ({ to, icon, label, active, onClick, hasSubmenu, children }: NavItemProps) => {
  const handleRipple = useRippleEffect();

  if (hasSubmenu) {
    return (
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger
              className={cn(
                "relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300",
                "hover:bg-primary/10 hover:text-primary",
                active ? "bg-primary/10 text-primary" : "text-foreground/80"
              )}
            >
              <span className={cn("transition-all duration-300", active ? "text-primary" : "text-foreground/60")}>
                {icon}
              </span>
              <span className="font-medium">{label}</span>
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-[220px] gap-1 p-2">{children}</div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to={to}
          className={cn(
            "relative flex items-center justify-center px-4 py-3 rounded-lg transition-all duration-300",
            "hover:bg-primary/10 hover:text-primary",
            "overflow-hidden",
            active ? "bg-primary/10 text-primary" : "text-foreground/80"
          )}
          onClick={(e) => {
            handleRipple(e);
            onClick();
          }}
        >
          <span className={cn("transition-all duration-300", active ? "text-primary" : "text-foreground/60")}>
            {icon}
          </span>
          {active && <span className="ml-2 font-medium">{label}</span>}
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
};

const SubMenuItem = ({ to, icon, label, active, onClick, children }: NavItemProps) => {
  return (
    <div>
      <Link
        to={to}
        className={cn(
          "flex items-center gap-2 p-2 rounded-md hover:bg-primary/10 hover:text-primary transition-all duration-300",
          active ? "bg-primary/10 text-primary" : ""
        )}
        onClick={onClick}
      >
        <span className={cn("transition-all duration-300", active ? "text-primary" : "text-foreground/60")}>{icon}</span>
        <span>{label}</span>
      </Link>
      {children && <div className="ml-6 mt-1 space-y-1">{children}</div>}
    </div>
  );
};

export const Navbar = () => {
  const [active, setActive] = useState('what');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMenuIcon, setShowMenuIcon] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setShowMenuIcon(false);
      } else {
        setShowMenuIcon(true);
      }
      lastScrollY = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleOpenAuthModal = () => setIsAuthModalOpen(true);
  const handleCloseAuthModal = () => setIsAuthModalOpen(false);

  const handleNavItemClick = (id: string) => {
    setActive(id);
    // Close mobile menu smoothly after a short delay
    setTimeout(() => {
      setIsMobileMenuOpen(false);
    }, 300);
  };

  const cortexSubmenu = [
    { to: '/', icon: <Info size={18} />, label: 'What', id: 'what' },
    { to: '/why', icon: <HelpCircle size={18} />, label: 'Why', id: 'why' },
    { to: '/how', icon: <Code size={18} />, label: 'How', id: 'how' },
  ];

  const categoriesSubmenu = [
    { to: '/kids', icon: <Baby size={18} />, label: 'Kids', id: 'kids' },
    { 
      to: '/adults',
      icon: <Users size={18} />, 
      label: 'Adults', 
      id: 'adults',
      children: [
        { to: '/adults/beginners', icon: <Lightbulb size={16} />, label: 'Beginners', id: 'adults-beginners' },
        { to: '/adults/intermediates', icon: <Layers size={16} />, label: 'Intermediates', id: 'adults-intermediates' },
        { to: '/adults/advanced', icon: <Award size={16} />, label: 'Advanced', id: 'adults-advanced' },
      ]
    },
    { to: '/ielts-pte', icon: <GraduationCap size={18} />, label: 'IELTS/PTE', id: 'ielts-pte' },
  ];

  const authNavItems = [
    { to: '/manage', icon: <Table size={20} />, label: 'Manage', id: 'manage' },
    { to: '/search', icon: <Search size={20} />, label: 'Search', id: 'search' },
    { to: '/import', icon: <Upload size={20} />, label: 'Import', id: 'import' },
    { to: '/profile', icon: <User size={20} />, label: 'Profile', id: 'profile' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings', id: 'settings' },
  ];

  const navItems = isAuthenticated ? authNavItems : [];

  return (
    <>
      <TooltipProvider>
        {/* Desktop Navigation - Only visible on desktop */}
        <header className="glass-panel fixed top-6 left-1/2 transform -translate-x-1/2 z-40 rounded-lg px-1 py-1 hidden sm:block">
          <nav className="flex items-center justify-between w-full">
            {/* Left side navigation items */}
            <div className="flex items-center">
              {/* Cortex with submenu */}
              <NavItem
                to="#"
                icon={<Brain size={20} />}
                label="Mind"
                active={['what', 'why', 'how'].includes(active)}
                onClick={() => { }}
                hasSubmenu={true}
              >
                {cortexSubmenu.map((item) => (
                  <SubMenuItem
                    key={item.id}
                    to={item.to}
                    icon={item.icon}
                    label={item.label}
                    active={active === item.id}
                    onClick={() => handleNavItemClick(item.id)}
                  />
                ))}
              </NavItem>

              {/* Categories with submenu */}
              <NavItem
                to="#"
                icon={<FolderTree size={20} />}
                label="Categories"
                active={[
                  'kids','adults','ielts-pte',
                  'adults-beginners','adults-intermediates','adults-advanced'
                ].includes(active)}
                onClick={() => { }}
                hasSubmenu={true}
              >
                {categoriesSubmenu.map((item) => (
                  <SubMenuItem
                    key={item.id}
                    to={item.to}
                    icon={item.icon}
                    label={item.label}
                    active={active === item.id}
                    onClick={() => handleNavItemClick(item.id)}
                    children={item.children?.map((sub) => (
                      <SubMenuItem
                        key={sub.id}
                        to={sub.to}
                        icon={sub.icon}
                        label={sub.label}
                        active={active === sub.id}
                        onClick={() => handleNavItemClick(sub.id)}
                      />
                    ))}
                  />
                ))}
              </NavItem>

              {/* Other nav items */}
              {navItems.map((item) => (
                <NavItem
                  key={item.id}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  active={active === item.id}
                  onClick={() => handleNavItemClick(item.id)}
                />
              ))}
            </div>

            {/* Right side navigation items */}
            <div className="flex items-center">
              {/* Help option */}
              <NavItem
                to="/help"
                icon={<HelpCircle size={20} />}
                label="Help"
                active={active === 'help'}
                onClick={() => handleNavItemClick('help')}
              />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-lg" onClick={toggleTheme}>
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle {theme === 'dark' ? 'light' : 'dark'} mode</p>
                </TooltipContent>
              </Tooltip>

              {isAuthenticated ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-primary hover:text-primary-foreground"
                      onClick={logout}
                    >
                      <LogOut size={20} />
                      {active === 'logout' && <span className="font-medium">Logout</span>}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Logout</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-primary hover:text-primary-foreground"
                      onClick={handleOpenAuthModal}
                    >
                      <LogIn size={20} />
                      {active === 'login' && <span className="font-medium">Login</span>}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Login</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </nav>
        </header>

        {/* Mobile Navigation - Only visible on mobile */}
        <header className="fixed top-6 right-6 z-40 sm:hidden">
          {showMenuIcon && (
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-lg glass-panel hover:bg-teal-500/20 hover:text-teal-400 transition-all duration-300"
                >
                  <Menu size={22} />
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="left" 
                className="p-0 w-full max-w-[320px] sm:max-w-[350px] h-full flex flex-col border-r-0"
                style={{
                  animation: isMobileMenuOpen 
                    ? 'slideInFromLeft 0.3s ease-out forwards' 
                    : 'slideOutToLeft 0.3s ease-in forwards'
                }}
              >
                {/* Header with close button */}
                <div className="flex items-center justify-end p-4 border-b">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-lg hover:bg-teal-500/20 hover:text-teal-400 transition-all duration-300"
                  >
                    <Menu size={22} />
                  </Button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 space-y-6">
                    {/* Cortex mobile */}
                    <div className="transition-all duration-300 ease-out">
                      <div className="px-1 text-xs font-semibold text-muted-foreground uppercase mb-2">Mind</div>
                      <div className="space-y-1">
                        {cortexSubmenu.map((item) => (
                          <Link
                            key={item.id}
                            to={item.to}
                            className={cn(
                              "flex items-center gap-3 rounded-md px-3 py-3 transition-all duration-300 hover:bg-teal-500/20 hover:text-teal-400",
                              active === item.id 
                                ? "bg-teal-500/20 text-teal-400" 
                                : "text-foreground"
                            )}
                            onClick={() => handleNavItemClick(item.id)}
                          >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Categories mobile */}
                    <div className="transition-all duration-300 ease-out delay-75">
                      <div className="px-1 text-xs font-semibold text-muted-foreground uppercase mb-2">Categories</div>
                      <div className="space-y-1">
                        {categoriesSubmenu.map((item) => (
                          <div key={item.id} className="space-y-1">
                            <Link
                              to={item.to}
                              className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-3 transition-all duration-300 hover:bg-teal-500/20 hover:text-teal-400",
                                active === item.id 
                                  ? "bg-teal-500/20 text-teal-400" 
                                  : "text-foreground"
                              )}
                              onClick={() => handleNavItemClick(item.id)}
                            >
                              {item.icon}
                              <span className="font-medium">{item.label}</span>
                            </Link>
                            {item.children && (
                              <div className="ml-4 space-y-1 border-l-2 border-muted/30 pl-2 transition-all duration-300">
                                {item.children.map((sub) => (
                                  <Link
                                    key={sub.id}
                                    to={sub.to}
                                    className={cn(
                                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all duration-300 hover:bg-teal-500/15 hover:text-teal-400",
                                      active === sub.id 
                                        ? "bg-teal-500/15 text-teal-400" 
                                        : "text-foreground"
                                    )}
                                    onClick={() => handleNavItemClick(sub.id)}
                                  >
                                    {sub.icon}
                                    <span>{sub.label}</span>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Authenticated nav mobile */}
                    {isAuthenticated && (
                      <div className="transition-all duration-300 ease-out delay-150">
                        <div className="px-1 text-xs font-semibold text-muted-foreground uppercase mb-2">Navigation</div>
                        <div className="space-y-1">
                          {navItems.map((item) => (
                            <Link
                              key={item.id}
                              to={item.to}
                              className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-3 transition-all duration-300 hover:bg-teal-500/20 hover:text-teal-400",
                                active === item.id 
                                  ? "bg-teal-500/20 text-teal-400" 
                                  : "text-foreground"
                              )}
                              onClick={() => handleNavItemClick(item.id)}
                            >
                              {item.icon}
                              <span className="font-medium">{item.label}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Help option for mobile */}
                    <div className="transition-all duration-300 ease-out delay-200">
                      <Link
                        to="/help"
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-3 transition-all duration-300 hover:bg-teal-500/20 hover:text-teal-400",
                          active === 'help' 
                            ? "bg-teal-500/20 text-teal-400" 
                            : "text-foreground"
                        )}
                        onClick={() => handleNavItemClick('help')}
                      >
                        <HelpCircle size={20} />
                        <span className="font-medium">Help</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Footer with theme and auth buttons */}
                <div className="p-4 border-t transition-all duration-300 ease-out delay-300">
                  <div className="flex items-center justify-between gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={toggleTheme} 
                      className="flex-1 justify-center gap-2 hover:bg-teal-500/20 hover:text-teal-400 hover:border-teal-400 transition-all duration-300"
                    >
                      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                      <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
                    </Button>
                    
                    {isAuthenticated ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                        }} 
                        className="flex-1 justify-center gap-2 hover:bg-teal-500/20 hover:text-teal-400 hover:border-teal-400 transition-all duration-300"
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          handleOpenAuthModal();
                          setIsMobileMenuOpen(false);
                        }} 
                        className="flex-1 justify-center gap-2 hover:bg-teal-500/20 hover:text-teal-400 hover:border-teal-400 transition-all duration-300"
                      >
                        <LogIn size={18} />
                        <span>Login</span>
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </header>
      </TooltipProvider>

      <AuthModal isOpen={isAuthModalOpen} onClose={handleCloseAuthModal} />

      <style>{`
        @keyframes slideInFromLeft {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOutToLeft {
          0% {
            transform: translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateX(-100%);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;