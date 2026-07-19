/**
 * ThemeContext — PlantBase
 * Manages 3 themes: 'light', 'dark', 'nature'
 * Persists choice to localStorage and applies CSS class to <html>.
 */
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

const STORAGE_KEY = 'plantbase-theme';
const VALID_THEMES = ['light', 'dark', 'nature'];

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return VALID_THEMES.includes(saved) ? saved : 'light';
  });

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    // Remove all theme classes first
    root.classList.remove('dark', 'nature');
    // Add current theme class (light is the default — no class needed)
    if (theme === 'dark') root.classList.add('dark');
    if (theme === 'nature') root.classList.add('nature');
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // Cycle through themes: light → dark → nature → light
  const cycleTheme = () => {
    setThemeState(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'nature';
      return 'light';
    });
  };

  const setTheme = (t) => {
    if (VALID_THEMES.includes(t)) setThemeState(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
