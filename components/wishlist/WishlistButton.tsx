'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useWishlist } from './WishlistProvider';
import { localeFromPath } from '@/app/i18n/locale';
import { getWishlist } from '@/app/i18n/dictionaries';
import './wishlist.css';

export default function WishlistButton({ className = '' }: { className?: string }) {
  const { count, open } = useWishlist();
  const t = getWishlist(localeFromPath(usePathname() || '/'));

  return (
    <button
      type="button"
      className={`wishlist-btn ${className}`}
      aria-label={`${t.openWishlist}${count > 0 ? ` (${count})` : ''}`}
      onClick={open}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {count > 0 && <span className="wishlist-btn-badge">{count}</span>}
    </button>
  );
}
