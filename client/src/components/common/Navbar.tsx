import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain, Search, Upload, User, Settings, LogOut, Moon, Sun,
  Table, Info, HelpCircle, Code, Menu, Users, Baby, FolderTree, Lightbulb,
  GraduationCap, Layers, Award, BookOpen, Notebook
} from 'lucide-react';
import { useRippleEffect } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import AuthModal from '@/components/auth/AuthModal';
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
                "relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 text-sm",
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
            "relative flex items-center justify-center px-3 py-2 rounded-lg transition-all duration-300 text-sm",
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
          "flex items-center gap-2 p-2 rounded-md hover:bg-primary/10 hover:text-primary transition-all duration-300 text-sm",
          active ? "bg-primary/10 text-primary" : ""
        )}
        onClick={onClick}
      >
        <span className={cn("transition-all duration-300", active ? "text-primary" : "text-foreground/60")}>{icon}</span>
        <span>{label}</span>
      </Link>
      {children && <div className="ml-4 mt-1 space-y-1">{children}</div>}
    </div>
  );
};

export const Navbar = () => {
  const [active, setActive] = useState('what');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleOpenAuthModal = () => setIsAuthModalOpen(true);
  const handleCloseAuthModal = () => setIsAuthModalOpen(false);

  const handleNavItemClick = (id: string) => {
    setActive(id);
    setTimeout(() => {
      setIsMobileMenuOpen(false);
    }, 300);
  };

  const handleFreeTrialClick = () => {
    // Redirect to pricing page for free trial
    window.location.href = '/pricing';
    // Alternatively, you can use:
    // - Navigate programmatically: navigate('/pricing');
    // - Open a specific trial modal
    // - Redirect to signup with trial parameter
  };

  const cortexSubmenu = [
    { to: '/', icon: <Info size={16} />, label: 'What', id: 'what' },
    { to: '/why', icon: <HelpCircle size={16} />, label: 'Why', id: 'why' },
    { to: '/how', icon: <Code size={16} />, label: 'How', id: 'how' },
    { to: '/about', icon: <Users size={16} />, label: 'About', id: 'about' },
  ];

  const categoriesSubmenu = [
    {
      to: '/kids',
      icon: <Baby size={16} />,
      label: 'Kids',
      id: 'kids',
      children: [
        { to: '/kids/young', icon: <BookOpen size={14} />, label: 'Ages 4-10', id: 'kids-young' },
        { to: '/kids/teen', icon: <Notebook size={14} />, label: 'Ages 11-17', id: 'kids-teen' },
      ]
    },
    {
      to: '/adults',
      icon: <Users size={16} />,
      label: 'Adults',
      id: 'adults',
      children: [
        { to: '/adults/beginners', icon: <Lightbulb size={14} />, label: 'Beginners', id: 'adults-beginners' },
        { to: '/adults/intermediates', icon: <Layers size={14} />, label: 'Intermediates', id: 'adults-intermediates' },
        { to: '/adults/advanced', icon: <Award size={14} />, label: 'Advanced', id: 'adults-advanced' },
      ]
    },
    { to: '/ielts-pte', icon: <GraduationCap size={16} />, label: 'IELTS/PTE', id: 'ielts-pte' },
  ];

  const authNavItems = [
    { to: '/manage', icon: <Table size={18} />, label: 'Manage', id: 'manage' },
    { to: '/search', icon: <Search size={18} />, label: 'Search', id: 'search' },
    { to: '/import', icon: <Upload size={18} />, label: 'Import', id: 'import' },
    { to: '/profile', icon: <User size={18} />, label: 'Profile', id: 'profile' },
    { to: '/settings', icon: <Settings size={18} />, label: 'Settings', id: 'settings' },
  ];

  const navItems = isAuthenticated ? authNavItems : [];

  return (
    <>
      <TooltipProvider>
        <header
          className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
            "backdrop-blur-md border-b border-border/40"
          )}
        >
          <div className="container mx-auto px-3 py-2">
            <div className="flex items-center justify-between">
              {/* Logo Container with Larger Size */}
              <div className="relative">
                <Link
                  to="/"
                  className="absolute -top-8 -left-2 lg:-top-6 lg:left-2 z-50 flex items-center transition-all duration-300 hover:scale-105"
                  onClick={() => handleNavItemClick('what')}
                >
                  <img
                    src="/logo01.png"
                    alt="Logo"
                    className="h-28 w-auto sm:h-32 md:h-32 lg:h-32"
                  />
                </Link>
                
                <div className="w-24 h-12 sm:w-28 sm:h-14 md:w-32 md:h-16 lg:w-36 lg:h-20 opacity-0 pointer-events-none" />
              </div>

              {/* Buttons - Top Right Corner */}
              <div className="absolute right-4 top-7 hidden sm:flex items-center gap-2">
                {/* Start Free Trial Button */}
                <Button
                  variant="outline"
                  className="border-primary text-foreground hover:bg-primary/10 px-4 py-2 rounded-lg font-medium transition-all duration-300"
                  onClick={handleFreeTrialClick}
                >
                  Start Free Trial
                </Button>
                
                {/* Get Started Button */}
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg"
                  onClick={handleOpenAuthModal}
                >
                  Get Started
                </Button>
              </div>

              {/* Desktop Navigation - Clean */}
              <nav className="hidden sm:flex items-center justify-center flex-1">
                <div className="glass-panel rounded-lg px-1 py-1 shadow-sm">
                  <div className="flex items-center gap-1">
                    {/* Left side - Navigation items */}
                    <div className="flex items-center">
                      {/* Cortex with submenu */}
                      <NavItem
                        to="#"
                        icon={<Brain size={18} />}
                        label="Mind"
                        active={['what', 'why', 'how', 'about'].includes(active)}
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
                        icon={<FolderTree size={18} />}
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
                    <div className="flex items-center gap-1">
                      {/* Help option */}
                      <NavItem
                        to="/help"
                        icon={<HelpCircle size={18} />}
                        label="Help"
                        active={active === 'help'}
                        onClick={() => handleNavItemClick('help')}
                      />

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-lg h-9 w-9"
                            onClick={toggleTheme}
                          >
                            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Toggle {theme === 'dark' ? 'light' : 'dark'} mode</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Only show Logout button when authenticated */}
                      {isAuthenticated && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className="flex items-center gap-2 px-3 py-2 rounded-lg h-9 hover:bg-primary hover:text-primary-foreground text-sm"
                              onClick={logout}
                            >
                              <LogOut size={16} />
                              {active === 'logout' && <span className="font-medium">Logout</span>}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Logout</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </div>
              </nav>

              {/* Mobile Navigation - Clean */}
              <div className="flex items-center gap-1 sm:hidden">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-lg h-9 w-9 glass-panel hover:bg-teal-500/20 hover:text-teal-400 transition-all duration-300"
                    >
                      <Menu size={18} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="p-0 w-full max-w-[280px] sm:max-w-[300px] h-full flex flex-col border-r-0"
                    style={{
                      animation: isMobileMenuOpen
                        ? 'slideInFromLeft 0.3s ease-out forwards'
                        : 'slideOutToLeft 0.3s ease-in forwards'
                    }}
                  >
                    {/* Clean Mobile Menu Header */}
                    <div className="flex items-center justify-between p-3 border-b bg-background/50">
                      {/* Left side - Theme Toggle and Login/Logout */}
                      <div className="flex items-center gap-1">
                        {/* Theme Toggle */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={toggleTheme}
                          className="rounded-lg h-8 w-8 hover:bg-teal-500/20 hover:text-teal-400 transition-all duration-300"
                        >
                          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                        </Button>

                        {/* Only show Logout Button when authenticated */}
                        {isAuthenticated && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              logout();
                              setIsMobileMenuOpen(false);
                            }}
                            className="rounded-lg h-8 w-8 hover:bg-teal-500/20 hover:text-teal-400 transition-all duration-300"
                          >
                            <LogOut size={16} />
                          </Button>
                        )}
                      </div>

                      {/* Center - Larger Logo for Mobile */}
                      <div className="relative">
                        <Link
                          to="/"
                          className="absolute -top-6 -left-2 z-50 flex items-center transition-all duration-300 hover:scale-105"
                          onClick={() => {
                            handleNavItemClick('what');
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          
                        </Link>
                        <div className="w-16 h-10 opacity-0 pointer-events-none" />
                      </div>
                      
                      {/* Right side - Empty space for balance */}
                      <div className="w-16 h-8" />
                    </div>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto">
                      <div className="p-3 space-y-4">
                        {/* Buttons for Mobile */}
                        <div className="space-y-2 mb-2">
                          {/* Start Free Trial Button for Mobile */}
                          <Button
                            variant="outline"
                            className="w-full border-primary text-foreground hover:bg-primary/10 py-2 rounded-lg font-medium transition-all duration-300"
                            onClick={() => {
                              handleFreeTrialClick();
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            Start Free Trial
                          </Button>
                          
                          {/* Get Started Button for Mobile */}
                          <Button
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-lg font-medium transition-all duration-300"
                            onClick={() => {
                              handleOpenAuthModal();
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            Get Started
                          </Button>
                        </div>

                        {/* Cortex mobile */}
                        <div className="transition-all duration-300 ease-out">
                          <div className="px-1 text-xs font-semibold text-muted-foreground uppercase mb-2">Mind</div>
                          <div className="space-y-1">
                            {cortexSubmenu.map((item) => (
                              <Link
                                key={item.id}
                                to={item.to}
                                className={cn(
                                  "flex items-center gap-2 rounded-md px-2 py-2 transition-all duration-300 hover:bg-teal-500/20 hover:text-teal-400 text-sm",
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
                                    "flex items-center gap-2 rounded-md px-2 py-2 transition-all duration-300 hover:bg-teal-500/20 hover:text-teal-400 text-sm",
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
                                  <div className="ml-3 space-y-1 border-l-2 border-muted/30 pl-2 transition-all duration-300">
                                    {item.children.map((sub) => (
                                      <Link
                                        key={sub.id}
                                        to={sub.to}
                                        className={cn(
                                          "flex items-center gap-2 rounded-md px-2 py-1 text-xs transition-all duration-300 hover:bg-teal-500/15 hover:text-teal-400",
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
                                    "flex items-center gap-2 rounded-md px-2 py-2 transition-all duration-300 hover:bg-teal-500/20 hover:text-teal-400 text-sm",
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
                              "flex items-center gap-2 rounded-md px-2 py-2 transition-all duration-300 hover:bg-teal-500/20 hover:text-teal-400 text-sm",
                              active === 'help'
                                ? "bg-teal-500/20 text-teal-400"
                                : "text-foreground"
                            )}
                            onClick={() => handleNavItemClick('help')}
                          >
                            <HelpCircle size={16} />
                            <span className="font-medium">Help</span>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Clean Footer */}
                    <div className="p-3 border-t bg-muted/30 transition-all duration-300 ease-out delay-300">
                      <div className="text-center text-xs text-muted-foreground">
                        <p>© 2025 Elora</p>
                        <p className="text-[10px] mt-1">Spoken English Learning Platform</p>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
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