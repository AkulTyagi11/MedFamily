import { MoonStar, SunMedium } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      className="theme-chip flex h-11 w-11 items-center justify-center rounded-2xl text-text-secondary transition hover:text-primary-700 focus-visible:outline-none focus-visible:ring-soft"
      onClick={toggleTheme}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
      aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
      title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
    >
      {theme === 'light' ? <MoonStar className="h-5 w-5" /> : <SunMedium className="h-5 w-5" />}
    </motion.button>
  );
}
