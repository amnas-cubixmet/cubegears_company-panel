import { createContext, useLayoutEffect, useState } from "react";

export const ThemeContext = createContext(null);

const STORAGE_KEY = "cubegears-theme";
const VALID_MODES = new Set(["light", "dark", "system"]);

const readThemeMode = () => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return VALID_MODES.has(stored) ? stored : "system";
  } catch {
    return "system";
  }
};

const resolveTheme = (mode) => {
  if (mode === "light" || mode === "dark") return mode;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const applyTheme = (mode) => {
  const active = resolveTheme(mode);
  const root = document.documentElement;

  root.dataset.theme = active;
  root.classList.remove("light", "dark");
  root.classList.add(active);
  root.style.colorScheme = active;

  return active;
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(readThemeMode);
  const [effectiveTheme, setEffectiveTheme] = useState(() => resolveTheme(themeMode));

  useLayoutEffect(() => {
    const updateTheme = () => setEffectiveTheme(applyTheme(themeMode));
    updateTheme();

    try {
      window.localStorage.setItem(STORAGE_KEY, themeMode);
    } catch {
      // The current selection still applies when browser storage is unavailable.
    }

    const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
    const handleSystemChange = () => {
      if (themeMode === "system") updateTheme();
    };

    if (themeMode === "system") {
      if (mediaQuery?.addEventListener) {
        mediaQuery.addEventListener("change", handleSystemChange);
      } else {
        mediaQuery?.addListener?.(handleSystemChange);
      }
    }

    return () => {
      if (mediaQuery?.removeEventListener) {
        mediaQuery.removeEventListener("change", handleSystemChange);
      } else {
        mediaQuery?.removeListener?.(handleSystemChange);
      }
    };
  }, [themeMode]);

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
