import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      id="theme-toggle-btn"
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 border border-border bg-card/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 shadow-2xs ${className}`}
      aria-label={theme === 'dark' ? 'Light rejimga o\'tish' : 'Dark rejimga o\'tish'}
      title={theme === 'dark' ? 'Light rejimga o\'tish' : 'Dark rejimga o\'tish'}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-5 h-5 text-zinc-700 dark:text-zinc-300 transition-transform duration-300 rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
};

