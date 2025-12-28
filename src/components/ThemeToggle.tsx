"use client";

import { useDarkMode } from "@/lib/dark-mode";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 group"
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5 text-yellow-500 group-hover:text-yellow-400 transition-colors duration-200" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600 group-hover:text-gray-700 transition-colors duration-200" />
      )}
    </button>
  );
}
