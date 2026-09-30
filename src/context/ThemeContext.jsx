import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // Theme mode: 'light' | 'dark' | 'system'
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('cubegears-theme') || 'system';
  });

  const [effectiveTheme, setEffectiveTheme] = useState('dark');

  useEffect(() => {
    const updateTheme = () => {
      let active = themeMode;
      if (themeMode === 'system') {
        const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        active = isSystemDark ? 'dark' : 'light';
      }

      setEffectiveTheme(active);

      // Apply theme directly to HTML Root element
      document.documentElement.setAttribute('data-theme', active);
      document.documentElement.dataset.theme = active;
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(active);

      localStorage.setItem('cubegears-theme', themeMode);
    };

    updateTheme();

    // Listen for live system theme preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (themeMode === 'system') {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [themeMode]);

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
