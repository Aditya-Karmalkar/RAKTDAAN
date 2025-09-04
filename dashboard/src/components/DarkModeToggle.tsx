import { useState, useEffect } from 'react';

export default function DarkModeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  
  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 dark:text-white transition"
    >
      {theme === 'light' ? 'Enable Dark Mode' : 'Enable Light Mode'}
    </button>
  );
}
