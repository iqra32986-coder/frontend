import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Modern Theme Store using Zustand.
 * Controls the Global Light/Dark mode state and persists to LocalStorage.
 */
export const useThemeStore = create()(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
      },
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },
    }),
    {
      name: 'smartdine-theme',
    }
  )
);

// Initialize theme on window load or first render
export const initTheme = () => {
  const stored = localStorage.getItem('smartdine-theme');
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      document.documentElement.classList.toggle('dark', state.theme === 'dark');
    } catch (e) {
      console.error('Failed to parse theme', e);
    }
  } else {
    // Detect system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
  }
};
