import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain, LogIn, Search, Upload, User, Settings, LogOut, Moon, Sun,
  Table, Info, HelpCircle, Code, Menu, Users, Baby, FolderTree, Lightbulb,
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
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show/hide navbar based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past 100px - hide navbar
        setIsNavbarVisible(false);
        setShowMenuIcon(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show navbar
        setIsNavbarVisible(true);
        setShowMenuIcon(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

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
      {/* Fixed Logo in Top Left Corner - Moved up for desktop */}
        <Link
          to="/"
          className="fixed top-[-100px] left-[-60px] z-50 flex items-center gap-2 p-2 rounded-lg sm:top-[-135px] sm:left-[-80px]"
          onClick={() => handleNavItemClick('what')}
        >
        <img
          src="/Speak_Bee.png"
          alt="Logo"
          className="h-70 w-auto sm:h-56 md:h-56 lg:h-56 xl:h-90"
        />
      </Link>

      <TooltipProvider>
        {/* Desktop Navigation - Only visible on desktop */}
        <header
          className={cn(
            "glass-panel fixed top-6 left-1/2 transform -translate-x-1/2 z-40 rounded-lg px-1 py-1 hidden sm:block transition-transform duration-300 ease-in-out",
            isNavbarVisible ? "translate-y-0" : "-translate-y-32"
          )}
        >
          <nav className="flex items-center justify-between w-full">
            {/* Left side - Navigation items */}
            <div className="flex items-center">

              {/* Cortex with submenu */}
              <NavItem
                to="#"
                icon={<Brain size={20} color="black" />}
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
                  'kids', 'adults', 'ielts-pte',
                  'adults-beginners', 'adults-intermediates', 'adults-advanced'
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
        <header
          className={cn(
            "fixed top-6 left-6 right-6 z-40 sm:hidden transition-transform duration-300 ease-in-out",
            isNavbarVisible ? "translate-y-0" : "-translate-y-32"
          )}
        >
          <div className="flex items-center justify-end">
            {/* Mobile Menu Button */}
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
                  {/* Mobile Menu Header with Login and Theme Toggle */}
                  <div className="flex items-center justify-between p-4 border-b bg-background/50">
                    <div className="flex items-center gap-2">
                      {/* Theme Toggle */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className="rounded-lg hover:bg-teal-500/20 hover:text-teal-400 transition-all duration-300"
                      >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                      </Button>
                      
                      {/* Login/Logout Button */}
                      {isAuthenticated ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            logout();
                            setIsMobileMenuOpen(false);
                          }}
                          className="rounded-lg hover:bg-teal-500/20 hover:text-teal-400 transition-all duration-300"
                        >
                          <LogOut size={18} />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            handleOpenAuthModal();
                            setIsMobileMenuOpen(false);
                          }}
                          className="rounded-lg hover:bg-teal-500/20 hover:text-teal-400 transition-all duration-300"
                        >
                          <LogIn size={18} />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                    </div>
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

                  {/* Footer with additional info */}
                  <div className="p-4 border-t bg-muted/30 transition-all duration-300 ease-out delay-300">
                    <div className="text-center text-sm text-muted-foreground">
                      <p>© 2024 Vocario</p>
                      <p className="text-xs mt-1">Language Learning Platform</p>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
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