import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { effectiveTheme, toggleTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border border-border bg-surface text-foreground-secondary hover:text-foreground hover:bg-surface-elevated focus:outline-none focus:ring-1 focus:ring-accent shadow-sm ${className}`}
    >
      {isDark ? (
        <Sun className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
      ) : (
        <Moon className="w-3.5 h-3.5 text-cyan-600" aria-hidden="true" />
      )}
      {showLabel && <span>{isDark ? 'Light' : 'Dark'}</span>}
    </button>
  );
}
