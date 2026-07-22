'use client';

import React, { createContext, useContext, useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';

// useLayoutEffect en cliente, useEffect en SSR (evita el warning de React).
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'cupontours_theme';

function applyTheme(theme: Theme) {
  const el = document.documentElement;
  if (theme === 'dark') {
    el.setAttribute('data-theme', 'dark');
  } else {
    el.removeAttribute('data-theme');
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Server render arranca en 'light'; el script anti-flash del layout ya
  // pintó el tema correcto en <html> antes de hidratar. Aquí sincronizamos.
  const [theme, setThemeState] = useState<Theme>('light');
  const [hydrated, setHydrated] = useState(false);
  const pathname = usePathname();

  // Tema deseado en un ref, siempre actualizado de forma SÍNCRONA en los
  // setters, para que el MutationObserver lea el valor correcto sin carreras.
  const themeRef = useRef<Theme>(theme);

  useEffect(() => {
    let initial: Theme = 'light';
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') {
        initial = stored;
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        initial = 'dark';
      }
    } catch {
      /* ignorar */
    }
    themeRef.current = initial;
    setThemeState(initial);
    applyTheme(initial);
    setHydrated(true);
  }, []);

  // Re-afirmar el atributo data-theme en CADA navegación cliente, antes del
  // paint. En el App Router, al cambiar de ruta (cada segmento con su propia
  // metadata) el atributo puesto a mano sobre <html> se puede perder; esto lo
  // restaura al navegar (p.ej. volviendo de un servicio a /services). Gateado
  // tras hidratar para no pisar el script anti-flash con el 'light' por defecto.
  useIsomorphicLayoutEffect(() => {
    if (!hydrated) return;
    applyTheme(theme);
  }, [pathname, theme, hydrated]);

  // Red de seguridad: si algo (el router de Next al reconciliar <html> con la
  // nueva metadata) elimina el atributo DESPUÉS de nuestro effect, lo volvemos
  // a poner de inmediato. El observer lee themeRef (no un closure obsoleto),
  // así que un cambio manual a claro no se revierte.
  useEffect(() => {
    if (!hydrated) return;
    const el = document.documentElement;
    const enforce = () => {
      const desired = themeRef.current;
      if (desired === 'dark') {
        if (el.getAttribute('data-theme') !== 'dark') el.setAttribute('data-theme', 'dark');
      } else if (el.getAttribute('data-theme') === 'dark') {
        el.removeAttribute('data-theme');
      }
    };
    enforce();
    const observer = new MutationObserver(enforce);
    observer.observe(el, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [hydrated]);

  const setTheme = useCallback((t: Theme) => {
    themeRef.current = t;
    setThemeState(t);
    applyTheme(t);
    try {
      window.localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignorar */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      themeRef.current = next;
      applyTheme(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignorar */
      }
      return next;
    });
  }, []);

  // Seguir la preferencia del sistema solo si el usuario no ha elegido manualmente
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      try {
        if (window.localStorage.getItem(STORAGE_KEY)) return;
      } catch {
        /* ignorar */
      }
      const t: Theme = e.matches ? 'dark' : 'light';
      themeRef.current = t;
      setThemeState(t);
      applyTheme(t);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
