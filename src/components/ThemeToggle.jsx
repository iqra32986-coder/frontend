import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-10 h-10" />;

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-500 hover:bg-secondary active:scale-90 group overflow-hidden border border-border/50 shadow-sm"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-primary transition-all duration-500 rotate-0 scale-100" />
        ) : (
          <Moon className="w-5 h-5 text-foreground transition-all duration-500 rotate-0 scale-100" />
        )}
      </div>
      
      {/* Tactical hover effect */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};

export default ThemeToggle;
