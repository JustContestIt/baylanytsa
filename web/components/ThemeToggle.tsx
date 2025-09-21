'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme');
    const prefersDark =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = saved ? saved === 'dark' : prefersDark;
    apply(initialDark);
  }, []);

  function apply(d: boolean) {
    setDark(d);
    if (d) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', d ? 'dark' : 'light');
  }

  if (!mounted) return null;

  return (
    <button
      onClick={() => apply(!dark)}
      className="rounded-xl px-3 py-2 text-sm border border-gray-300 dark:border-gray-700"
      title="Переключить тему"
    >
      {dark ? '🌙' : '☀️'}
    </button>
  );
}
