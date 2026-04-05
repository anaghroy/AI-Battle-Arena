import { create } from 'zustand';

const useThemeStore = create((set) => {
  // Check local storage or system preference on load
  const storedTheme = localStorage.getItem('arena-theme');
  const initialTheme = storedTheme ? storedTheme : 'dark';

  return {
    theme: initialTheme,
    toggleTheme: () => set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('arena-theme', newTheme);
      return { theme: newTheme };
    }),
    setTheme: (theme) => set(() => {
      localStorage.setItem('arena-theme', theme);
      return { theme };
    }),
  };
});

export default useThemeStore;
