import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);
const THEME_STORAGE_KEY = "oficina-theme";

function systemIsDark() {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark" || stored === "system") return stored;
      return "light";
    } catch {
      return "light";
    }
  });
  const [resolvedTheme, setResolvedTheme] = useState(() =>
    theme === "system" ? (systemIsDark() ? "dark" : "light") : theme,
  );

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const root = document.documentElement;
    const apply = () => {
      const next = theme === "system" ? (systemIsDark() ? "dark" : "light") : theme;
      setResolvedTheme(next);
      root.classList.toggle("dark", next === "dark");
    };
    apply();
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
    if (theme !== "system") return undefined;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
