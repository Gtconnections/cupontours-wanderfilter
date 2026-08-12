'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useWishlist, WishlistItem } from './WishlistProvider';
import { localeFromPath } from '@/app/i18n/locale';
import { getWishlist } from '@/app/i18n/dictionaries';
import './wishlist.css';

interface HeartButtonProps {
  item: WishlistItem;
  className?: string;
}

export default function HeartButton({ item, className = '' }: HeartButtonProps) {
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(item.type, item.id);
  const t = getWishlist(localeFromPath(usePathname() || '/'));

  return (
    <button
      type="button"
      className={`wishlist-heart ${className} ${saved ? 'is-saved' : ''}`}
      aria-label={saved ? t.removeFrom : t.saveTo}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(item);
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
