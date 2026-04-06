import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart, 
  Package, 
  Utensils, 
  User, 
  Tag, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CalendarDays,
  Menu as MenuIcon,
  Zap,
  Terminal,
  ShieldCheck,
  ChevronDown,
  Activity,
  LayoutDashboard,
  Box,
  Fingerprint,
  Sun,
  Moon
} from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';

const Sidebar = ({ menuItems, onLogout, isCollapsed, setIsCollapsed }) => {
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();
  const sidebarRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(sidebarRef.current, 
      { x: -100, opacity: 0 }, 
      { x: 0, opacity: 1, duration: 1, ease: 'power4.out' }
    );
  }, []);

  return (
    <aside 
      ref={sidebarRef}
      className={`sticky top-0 h-screen bg-background border-r border-border/50 transition-all duration-500 z-50 flex flex-col ${
        isCollapsed ? 'w-24' : 'w-72 lg:w-80'
      }`}
    >
      {/* Branding Area */}
      <div className="h-32 flex items-center justify-center border-b border-primary/5 px-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Link to="/" className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20 rotate-12 transition-transform group-hover:rotate-0">
            <Fingerprint className="w-7 h-7 text-black" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-2xl font-black uppercase tracking-tighter italic text-foreground leading-none">
                Smart<span className="text-primary not-italic">Dine.</span>
              </span>
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-primary/40 mt-1">Gourmet Dining</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Matrix */}
      <nav className="flex-1 py-10 px-4 space-y-2 overflow-y-auto no-scrollbar">
          {!isCollapsed && (
            <div className="px-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-4 h-px bg-primary/20" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30">Navigation</span>
              </div>
            </div>
          )}
          
          <div className="space-y-1">
            {menuItems.map((item, index) => {
              const isActive = (item.path !== '#' && location.pathname === item.path) || (item.activeCheck && item.activeCheck());
              
              return (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={`w-full group relative flex items-center h-16 rounded-2xl transition-all duration-300 overflow-hidden ${
                    isActive 
                    ? 'bg-primary text-black shadow-2xl shadow-primary/10 scale-[1.02]' 
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/20" />
                  )}
                  
                  <div className={`flex items-center justify-center min-w-[72px] transition-transform duration-500 ${!isActive && 'group-hover:rotate-12'}`}>
                    {item.icon}
                  </div>

                  {!isCollapsed && (
                    <div className="flex items-center justify-between flex-1 pr-6 animate-in fade-in slide-in-from-left-4">
                        <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${isActive ? 'text-black' : 'text-inherit'}`}>
                            {item.label}
                        </span>
                        {isActive && <Activity className="w-3 h-3 opacity-40 animate-pulse" />}
                    </div>
                  )}

                  {/* Tooltip for Collapsed State */}
                  {isCollapsed && (
                    <div className="absolute left-20 bg-primary text-black text-[10px] font-black px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-2 group-hover:translate-x-0 whitespace-nowrap z-50">
                       {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
      </nav>

      {/* Footer Controls */}
      <div className="p-4 border-t border-primary/5 space-y-2">
        <button 
          onClick={toggleTheme}
          className="w-full h-16 rounded-2xl flex items-center text-muted-foreground hover:bg-secondary/50 hover:text-primary transition-all group overflow-hidden"
        >
          <div className="min-w-[72px] flex items-center justify-center group-hover:rotate-12 transition-transform">
             {theme === 'dark' ? <Sun size={22} className="text-primary" /> : <Moon size={22} />}
          </div>
          {!isCollapsed && <span className="text-[11px] font-black uppercase tracking-[0.2em] animate-in fade-in">Atmosphere</span>}
        </button>

        <button 
          onClick={onLogout}
          className="w-full h-16 rounded-2xl flex items-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all group overflow-hidden"
        >
          <div className="min-w-[72px] flex items-center justify-center group-hover:rotate-12 transition-transform">
             <LogOut size={22} />
          </div>
          {!isCollapsed && <span className="text-[11px] font-black uppercase tracking-[0.2em] animate-in fade-in">Logout</span>}
        </button>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full h-12 rounded-xl flex items-center justify-center bg-secondary/30 text-primary/40 hover:text-primary hover:bg-secondary transition-all"
        >
          {isCollapsed ? <ChevronRight size={18}/> : <ChevronLeft size={18}/>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
