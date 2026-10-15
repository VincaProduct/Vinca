import { useSyncExternalStore } from 'react';

/**
 * One site-wide light/dark setting: the "dark" class on <html>, saved in
 * localStorage. index.html applies the saved choice before the page draws,
 * and every toggle reads/writes it here, so all toggles stay in sync.
 */
export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

export const getTheme = (): Theme =>
  typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light';

export const setTheme = (theme: Theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // storage blocked: the choice still applies to this page
  }
};

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
};

/** Current theme, updating whenever any toggle changes it */
export const useTheme = (): [Theme, (theme: Theme) => void] => [
  useSyncExternalStore(subscribe, getTheme, () => 'light'),
  setTheme,
];
