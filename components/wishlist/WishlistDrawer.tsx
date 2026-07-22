'use client';

import React from 'react';
import Link from 'next/link';
import { useWishlist, WishlistType } from './WishlistProvider';
import './wishlist.css';

const TYPE_LABEL: Record<WishlistType, string> = {
  property: 'Property',
  car: 'Car',
  yacht: 'Yacht',
};

export default function WishlistDrawer() {
  const { items, count, isOpen, close, remove, clear } = useWishlist();

  return (
    <>
      <div
        className={`wishlist-overlay ${isOpen ? 'open' : ''}`}
        onClick={close}
        aria-hidden={!isOpen}
      />

      <aside
        className={`wishlist-drawer ${isOpen ? 'open' : ''}`}
        role="dialog"
        aria-label="Wishlist"
        aria-modal="true"
      >
        <div className="wishlist-drawer-head">
          <div className="wishlist-drawer-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>Your Wishlist</span>
            {count > 0 && <span className="wishlist-drawer-count">{count}</span>}
          </div>
          <button className="wishlist-drawer-close" onClick={close} aria-label="Close wishlist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="wishlist-drawer-body">
          {count === 0 ? (
            <div className="wishlist-empty">
              <div className="wishlist-empty-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <p className="wishlist-empty-title">Your wishlist is empty</p>
              <p className="wishlist-empty-sub">Tap the heart on any property, car or yacht to save it here.</p>
            </div>
          ) : (
            <ul className="wishlist-list">
              {items.map((it) => (
                <li key={`${it.type}:${it.id}`} className="wishlist-row">
                  <Link href={it.href} className="wishlist-row-media" onClick={close}>
                    <img
                      src={it.image}
                      alt={it.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=300&q=80';
                      }}
                    />
                  </Link>
                  <div className="wishlist-row-info">
                    <span className="wishlist-row-type">{TYPE_LABEL[it.type]}</span>
                    <Link href={it.href} className="wishlist-row-title" onClick={close}>
                      {it.title}
                    </Link>
                    {it.location && <span className="wishlist-row-loc">{it.location}</span>}
                    <span className="wishlist-row-price">{it.price}</span>
                  </div>
                  <button
                    className="wishlist-row-remove"
                    aria-label={`Remove ${it.title} from wishlist`}
                    onClick={() => remove(it.type, it.id)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {count > 0 && (
          <div className="wishlist-drawer-foot">
            <button className="wishlist-clear-btn" onClick={clear}>Clear all</button>
          </div>
        )}
      </aside>
    </>
  );
}
