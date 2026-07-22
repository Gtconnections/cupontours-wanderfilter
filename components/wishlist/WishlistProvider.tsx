'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type WishlistType = 'property' | 'car' | 'yacht';

export interface WishlistItem {
  id: string;
  type: WishlistType;
  title: string;
  image: string;
  price: string;
  href: string;
  location?: string;
}

interface WishlistContextValue {
  items: WishlistItem[];
  count: number;
  isOpen: boolean;
  isSaved: (type: WishlistType, id: string) => boolean;
  toggle: (item: WishlistItem) => void;
  remove: (type: WishlistType, id: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
}

const STORAGE_KEY = 'cupontours_wishlist';

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Cargar desde localStorage al montar (solo en cliente)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      /* localStorage no disponible o corrupto: ignorar */
    }
    setHydrated(true);
  }, []);

  // Persistir en localStorage cuando cambian los items (tras hidratar)
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* cuota llena o no disponible: ignorar */
    }
  }, [items, hydrated]);

  // Sincronizar entre pestañas
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        try {
          const parsed = e.newValue ? JSON.parse(e.newValue) : [];
          if (Array.isArray(parsed)) setItems(parsed);
        } catch {
          /* ignorar */
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Bloquear scroll del body mientras el drawer está abierto
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const isSaved = useCallback(
    (type: WishlistType, id: string) => items.some((it) => it.type === type && it.id === id),
    [items]
  );

  const toggle = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      const exists = prev.some((it) => it.type === item.type && it.id === item.id);
      if (exists) {
        return prev.filter((it) => !(it.type === item.type && it.id === item.id));
      }
      return [item, ...prev];
    });
  }, []);

  const remove = useCallback((type: WishlistType, id: string) => {
    setItems((prev) => prev.filter((it) => !(it.type === type && it.id === id)));
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value: WishlistContextValue = {
    items,
    count: items.length,
    isOpen,
    isSaved,
    toggle,
    remove,
    clear,
    open,
    close,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return ctx;
}
