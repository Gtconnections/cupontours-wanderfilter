"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    router.push('/login');
  };

  // Obtener iniciales del usuario
  const getInitials = () => {
    if (user?.fullName) {
      const names = user.fullName.split(' ');
      return names.map(n => n[0]).join('').toUpperCase();
    }
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Obtener nombre para mostrar
  const getDisplayName = () => {
    if (user?.fullName) return user.fullName;
    if (user?.username) return user.username;
    return 'Usuario';
  };

  return (
    <nav className="wander-navbar">
      <div className="wander-nav-left">
        <h1>Dashboard</h1>
      </div>
      
      <div className="wander-nav-right">
        <div className="wander-user-profile" ref={dropdownRef}>
          <div 
            className="wander-user-info"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{ cursor: 'pointer' }}
          >
            <span className="wander-user-name">{getDisplayName()}</span>
          </div>
          
          <div 
            className="wander-avatar"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{ cursor: 'pointer' }}
          >
            <span className="wander-avatar-initials">{getInitials()}</span>
          </div>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="wander-dropdown">
              <div className="wander-dropdown-header">
                <div className="wander-dropdown-avatar">
                  <span>{getInitials()}</span>
                </div>
                <div className="wander-dropdown-user">
                  <span className="wander-dropdown-name">{getDisplayName()}</span>
                  <span className="wander-dropdown-email">{user?.email || ''}</span>
                </div>
              </div>
              <div className="wander-dropdown-divider"></div>
              <Link 
                href="/admin/profile" 
                className="wander-dropdown-item"
                onClick={() => setIsDropdownOpen(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                My profile
              </Link>
              <Link 
                href="/admin/support" 
                className="wander-dropdown-item"
                onClick={() => setIsDropdownOpen(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                Support
              </Link>
              <div className="wander-dropdown-divider"></div>
              <button 
                onClick={handleLogout}
                className="wander-dropdown-item wander-dropdown-logout"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}