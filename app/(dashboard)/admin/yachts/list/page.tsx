// app/admin/yachts/list/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getYachts, Yacht, YachtsResponse } from '@/app/lib/api/yachtsAdmin';
import { 
  FiPlus, 
  FiRefreshCw, 
  FiAnchor, 
  FiUsers, 
  FiDollarSign,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiCalendar,
  FiFileText,
  FiGrid,
  FiUser,
  FiMaximize ,
  FiHome,
  FiDroplet
} from 'react-icons/fi';
import './yachts-list.css';

const LoadingSkeleton = () => (
  <div className="wander-yachts-container">
    <div className="wander-yachts-header">
      <div>
        <span className="wander-breadcrumb">Listings / Yachts</span>
        <h2>Loading yachts...</h2>
      </div>
    </div>
    <div className="wander-yachts-loading">
      <div className="wander-loading-spinner"></div>
      <p>Loading yachts...</p>
    </div>
  </div>
);

export default function YachtsListPage() {
  const router = useRouter();
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [yachts, setYachts] = useState<Yacht[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const loadYachts = useCallback(async (page = 1, forceRefresh = false) => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const filters = {
        page: page,
        page_size: pageSize,
      };
      
      const data = await getYachts(filters, forceRefresh);
      setYachts(data.results || []);
      setTotalCount(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / pageSize));
    } catch (err: any) {
      console.error('❌ Error cargando yates:', err);
      setError(err.message || 'Error loading yachts');
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated, router, pageSize]);

  useEffect(() => {
    if (isChecking) return;
    
    const hasAuth = checkAuth();
    setIsAuthVerified(true);
    
    if (!hasAuth) {
      router.push('/login');
      return;
    }

    loadYachts(1);
  }, [isAuthenticated, isChecking, loadYachts, router, checkAuth]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    loadYachts(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = async () => {
    await loadYachts(currentPage, true);
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    if (isNaN(num) || num === 0) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  if (isChecking || !isAuthVerified) {
    return <LoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="wander-yachts-container">
        <div className="wander-yachts-header">
          <div>
            <span className="wander-breadcrumb">Listings / Yachts</span>
            <h2>Error</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <h3>⚠️ Error loading yachts</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="wander-btn-primary">
            <FiRefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="wander-yachts-container">
      {/* Header */}
      <header className="wander-yachts-header">
        <div>
          <span className="wander-breadcrumb">LISTINGS / YACHTS</span>
          <h2>Yachts</h2>
          <p className="wander-yachts-subtitle">
            {totalCount} {totalCount === 1 ? 'yacht' : 'yachts'} registered
          </p>
        </div>
        <div className="wander-yachts-actions">
          <button 
            onClick={handleRefresh}
            className="wander-btn-secondary"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
          <button 
            className="wander-btn-primary"
            onClick={() => router.push('/admin/yachts/create')}
          >
            <FiPlus size={16} />
            Create Yacht
          </button>
        </div>
      </header>

      {/* Grid de yates - 3 columnas */}
      <div className="wander-yachts-grid">
        {yachts.length === 0 ? (
          <div className="wander-yachts-empty">
            <span className="wander-empty-icon">⛵</span>
            <p>No yachts found</p>
          </div>
        ) : (
          yachts.map((yacht) => (
            <div key={yacht.id} className="wander-yacht-card">
              <div className="wander-yacht-image">
                {yacht.principal_image ? (
                  <img src={yacht.principal_image} alt={yacht.name} />
                ) : (
                  <div className="wander-yacht-image-placeholder">
                    <FiAnchor size={48} />
                  </div>
                )}
              </div>
              
              <div className="wander-yacht-info">
                <h3 className="wander-yacht-title">{yacht.name}</h3>
                <p className="wander-yacht-owner">
                  <FiUser size={12} style={{ marginRight: '4px' }} />
                  {yacht.owner}
                </p>
                
                <div className="wander-yacht-details">
                  <span>
                    <FiMaximize size={12} style={{ marginRight: '4px' }} />
                    {yacht.length} ft
                  </span>
                  <span>
                    <FiUsers size={12} style={{ marginRight: '4px' }} />
                    {yacht.capacity} guests
                  </span>
                  <span>
                    <FiHome size={12} style={{ marginRight: '4px' }} />
                    {yacht.staterooms} cabins
                  </span>
                  <span>
                    <FiDroplet size={12} style={{ marginRight: '4px' }} />
                    {yacht.bathrooms} baths
                  </span>
                </div>

                <div className="wander-yacht-amenities">
                  {yacht.certified_captain && (
                    <span className="wander-yacht-amenity-badge">Captain</span>
                  )}
                  {yacht.fuel && (
                    <span className="wander-yacht-amenity-badge">Fuel</span>
                  )}
                  {yacht.jet_sky && (
                    <span className="wander-yacht-amenity-badge">Jetski</span>
                  )}
                  {yacht.jacuzzi && (
                    <span className="wander-yacht-amenity-badge">Jacuzzi</span>
                  )}
                  {yacht.slide && (
                    <span className="wander-yacht-amenity-badge">Slide</span>
                  )}
                  {yacht.seabob && (
                    <span className="wander-yacht-amenity-badge">Seabob</span>
                  )}
                  {yacht.crew && (
                    <span className="wander-yacht-amenity-badge">Crew</span>
                  )}
                </div>

                <div className="wander-yacht-prices">
                  <div className="wander-yacht-price">
                    <span className="wander-yacht-price-label">Full Day</span>
                    <span className="wander-yacht-price-value">{formatCurrency(yacht.price_full_day)}</span>
                  </div>
                  {parseFloat(yacht.price_half_day) > 0 && (
                    <div className="wander-yacht-price">
                      <span className="wander-yacht-price-label">Half Day</span>
                      <span className="wander-yacht-price-value">{formatCurrency(yacht.price_half_day)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 🔥 4 Links de acción */}
              <div className="wander-yacht-actions">
                <Link 
                  href={`/admin/yachts/${yacht.id}`}
                  className="wander-yacht-action-link details"
                >
                  <FiEye size={14} />
                  Details
                </Link>
                <Link 
                  href={`/admin/yachts/reservations/${yacht.id}`}
                  className="wander-yacht-action-link reservations"
                >
                  <FiCalendar size={14} />
                  Reservations
                </Link>
                <Link 
                  href={`/admin/yachts/calendar/${yacht.id}`}
                  className="wander-yacht-action-link calendar"
                >
                  <FiGrid size={14} />
                  Calendar
                </Link>
                <Link 
                  href={`/admin/yachts/invoices/${yacht.id}`}
                  className="wander-yacht-action-link invoices"
                >
                  <FiFileText size={14} />
                  Invoices
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paginación */}
      {totalPages > 0 && (
        <div className="wander-yachts-pagination">
          <div className="wander-pagination-info">
            Showing {((currentPage || 1) - 1) * pageSize + 1} - 
            {Math.min((currentPage || 1) * pageSize, totalCount)} of {totalCount} yachts
          </div>
          
          <div className="wander-pagination-controls">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="wander-pagination-btn"
            >
              <FiChevronLeft size={14} />
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const current = currentPage || 1;
              let pageNum;
              
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (current <= 3) {
                pageNum = i + 1;
              } else if (current >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = current - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`wander-pagination-btn ${pageNum === current ? 'active' : ''}`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="wander-pagination-btn"
            >
              <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}