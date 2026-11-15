import { create } from 'zustand';
import { readPreference, writePreference } from '@/core/preferences/storage';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode, origin?: { x: number; y: number }) => void;
}

function initialMode(): ThemeMode {
  const stored = readPreference('theme');
  // Sem preferência salva, a interface abre no modo claro (e não segue o tema do sistema).
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'light';
}

function apply(mode: ThemeMode): void {
  const root = document.documentElement;
  if (mode === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', mode);
}

export function resolvedTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode !== 'system') return mode;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const useTheme = create<ThemeState>((set) => ({
  mode: initialMode(),
  setMode: (mode, origin) => {
    const commit = () => {
      apply(mode);
      set({ mode });
      writePreference('theme', mode);
    };
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof document.startViewTransition !== 'function') {
      commit();
      return;
    }
    const root = document.documentElement;
    root.style.setProperty('--reveal-x', `${origin?.x ?? window.innerWidth / 2}px`);
    root.style.setProperty('--reveal-y', `${origin?.y ?? 0}px`);
    document.startViewTransition(commit);
  },
}));

apply(useTheme.getState().mode);
