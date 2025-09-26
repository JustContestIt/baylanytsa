"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-md border px-3 py-1 text-sm transition hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      {isDark ? "Switch to Light" : "Switch to Dark"}
    </button>
  );
};

export default ThemeToggle;
