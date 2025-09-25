import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, LogIn, Search, Upload, User, Settings, LogOut, Moon, Sun, Table, Info, HelpCircle, Code, Menu, Users } from 'lucide-react';
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
              <div className="grid w-[200px] gap-1 p-2">{children}</div>
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

const SubMenuItem = ({ to, icon, label, active, onClick }: NavItemProps) => {
  return (
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
  );
};

export const Navbar = () => {
  const [active, setActive] = useState('what');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Mobile sheet open/close state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Scroll behavior for hiding menu icon
  const [showMenuIcon, setShowMenuIcon] = useState(true);
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setShowMenuIcon(false); // scrolling down → hide
      } else {
        setShowMenuIcon(true); // scrolling up → show
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
    setIsMobileMenuOpen(false); // close mobile menu after selecting
  };

  const cortexSubmenu = [
    { to: '/', icon: <Info size={18} />, label: 'What', id: 'what' },
    { to: '/why', icon: <HelpCircle size={18} />, label: 'Why', id: 'why' },
    { to: '/how', icon: <Code size={18} />, label: 'How', id: 'how' },
  ];

  const categoriesSubmenu = [
    { to: '/kids', icon: <Users size={18} />, label: 'Kids', id: 'kids' },
    { to: '/adults', icon: <Users size={18} />, label: 'Adults', id: 'adults' },
    { to: '/ielts-pte', icon: <Users size={18} />, label: 'IELTS/PTE', id: 'ielts-pte' },
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
        <header className="glass-panel fixed top-6 left-1/2 transform -translate-x-1/2 z-40 rounded-lg px-1 py-1">
          <nav className="flex items-center justify-between w-full">
            {/* Desktop nav - left side */}
            <div className="hidden sm:flex items-center">
              {/* Cortex with submenu */}
              <NavItem
                to="#"
                icon={<Brain size={20} />}
                label="Mind"
                active={['what', 'why', 'how'].includes(active)}
                onClick={() => {}}
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
                icon={<Users size={20} />}
                label="Categories"
                active={['kids', 'adults', 'ielts-pte'].includes(active)}
                onClick={() => {}}
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

            {/* Desktop nav - right side */}
            <div className="hidden sm:flex items-center">
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

            {/* Mobile: hamburger - moved to the right */}
            <div className="flex sm:hidden items-center ml-auto">
              {showMenuIcon && (
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-lg">
                      <Menu size={22} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0">
                    <div className="p-4 space-y-4">
                      <div>
                        <div className="px-1 text-xs font-semibold text-muted-foreground uppercase">Cortex</div>
                        <div className="mt-2 grid gap-1">
                          {cortexSubmenu.map((item) => (
                            <Link
                              key={item.id}
                              to={item.to}
                              className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2",
                                active === item.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                              )}
                              onClick={() => handleNavItemClick(item.id)}
                            >
                              {item.icon}
                              <span className="font-medium">{item.label}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <div className="px-1 text-xs font-semibold text-muted-foreground uppercase">Categories</div>
                        <div className="mt-2 grid gap-1">
                          {categoriesSubmenu.map((item) => (
                            <Link
                              key={item.id}
                              to={item.to}
                              className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2",
                                active === item.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                              )}
                              onClick={() => handleNavItemClick(item.id)}
                            >
                              {item.icon}
                              <span className="font-medium">{item.label}</span>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {isAuthenticated && (
                        <div>
                          <div className="px-1 text-xs font-semibold text-muted-foreground uppercase">Navigation</div>
                          <div className="mt-2 grid gap-1">
                            {navItems.map((item) => (
                              <Link
                                key={item.id}
                                to={item.to}
                                className={cn(
                                  "flex items-center gap-3 rounded-md px-3 py-2",
                                  active === item.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
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
                      <div className="flex items-center justify-between gap-2">
                        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-lg">
                          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </Button>
                        {isAuthenticated ? (
                          <Button variant="ghost" onClick={logout} className="rounded-lg">
                            <LogOut size={20} />
                            <span className="ml-2">Logout</span>
                          </Button>
                        ) : (
                          <Button variant="ghost" onClick={handleOpenAuthModal} className="rounded-lg">
                            <LogIn size={20} />
                            <span className="ml-2">Login</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </nav>
        </header>
      </TooltipProvider>

      <AuthModal isOpen={isAuthModalOpen} onClose={handleCloseAuthModal} />
    </>
  );
};

export default Navbar;