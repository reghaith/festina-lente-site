"use client";

import { useDarkMode } from "@/lib/dark-mode";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg bg-surface-primary hover:bg-surface-secondary border border-divider transition-all duration-200 group"
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5 text-warning group-hover:text-warning transition-colors duration-200" />
      ) : (
        <Moon className="w-5 h-5 text-secondary group-hover:text-primary transition-colors duration-200" />
      )}
    </button>
  );
}
