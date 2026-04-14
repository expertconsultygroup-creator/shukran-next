"use client";

import { useState, useEffect, createContext, useContext } from "react";

const ThemeContext = createContext({
  isLightMode: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
      document.documentElement.classList.add("light-mode");
      setIsLightMode(true);
    }
  }, []);

  const toggleTheme = () => {
    const isLight = document.documentElement.classList.toggle("light-mode");
    setIsLightMode(isLight);
    localStorage.setItem("theme", isLight ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ isLightMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
