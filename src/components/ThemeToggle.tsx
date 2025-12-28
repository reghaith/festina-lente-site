"use client";

import { useDarkMode } from "@/lib/dark-mode";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800"
    >
      {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
