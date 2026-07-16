// app/admin/transport/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getTransports, Transport } from '@/app/lib/api/transportAdmin';
import { 
  FiPlus, 
  FiRefreshCw, 
  FiEye, 
  FiEdit2, 
  FiTrash2,
  FiDollarSign,
  FiUsers,
  FiTag,
  FiTruck,
  FiMapPin,
  FiChevronLeft,
  FiChevronRight,
  FiGift
} from 'react-icons/fi';
import './transport.css';

const LoadingSkeleton = () => (
  <div className="wander-transport-container">
    <div className="wander-transport-header">
      <div>
        <span className="wander-breadcrumb">Services / Transport</span>
        <h2>Loading transports...</h2>
      </div>
    </div>
    <div className="wander-transport-loading">
      <div className="wander-loading-spinner"></div>
      <p>Loading transports...</p>
    </div>
  </div>
);

export default function TransportListPage() {
  const router = useRouter();
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [transports, setTransports] = useState<Transport[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Paginación frontend
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [totalPages, setTotalPages] = useState(0);

  const loadTransports = useCallback(async (forceRefresh = false) => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getTransports();
      console.log('📦 Datos de transportes:', data);
      
      setTransports(data.results || []);
      setTotalCount(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / itemsPerPage));
    } catch (err: any) {
      console.error('❌ Error cargando transportes:', err);
      setError(err.message || 'Error loading transports');
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated, router, itemsPerPage]);

  useEffect(() => {
    if (isChecking) return;
    
    const hasAuth = checkAuth();
    setIsAuthVerified(true);
    
    if (!hasAuth) {
      router.push('/login');
      return;
    }

    loadTransports();
  }, [isAuthenticated, isChecking, loadTransports, router, checkAuth]);

  const handleRefresh = async () => {
    await loadTransports(true);
  };

  // Paginación frontend
  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return transports.slice(indexOfFirstItem, indexOfLastItem);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    if (isNaN(num) || num === 0) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      'activo': { label: 'Active', color: '#16a34a' },
      'inactivo': { label: 'Inactive', color: '#dc2626' },
      'mantenimiento': { label: 'Maintenance', color: '#f59e0b' },
    };
    const s = statusMap[status?.toLowerCase()] || { label: status || 'N/A', color: '#6b7280' };
    return (
      <span style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '12px',
        fontSize: '10px',
        fontWeight: 600,
        letterSpacing: '0.5px',
        backgroundColor: `${s.color}15`,
        color: s.color,
      }}>
        {s.label}
      </span>
    );
  };

  if (isChecking || !isAuthVerified) {
    return <LoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="wander-transport-container">
        <div className="wander-transport-header">
          <div>
            <span className="wander-breadcrumb">Services / Transport</span>
            <h2>Error</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <h3>⚠️ Error loading transports</h3>
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

  const currentItems = getCurrentItems();

  return (
    <div className="wander-transport-container">
      {/* Header */}
      <header className="wander-transport-header">
        <div>
          <span className="wander-breadcrumb">SERVICES / TRANSPORT</span>
          <h2>Private Transport</h2>
          <p className="wander-transport-subtitle">
            {totalCount} {totalCount === 1 ? 'vehicle' : 'vehicles'} registered
          </p>
        </div>
        <div className="wander-transport-actions">
          <button 
            onClick={handleRefresh}
            className="wander-btn-secondary"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
          <button 
            className="wander-btn-primary"
            onClick={() => router.push('/admin/transport/create')}
          >
            <FiPlus size={16} />
            Create Transport
          </button>
        </div>
      </header>

      {/* Grid */}
      <div className="wander-transport-grid">
        {currentItems.length === 0 ? (
          <div className="wander-transport-empty">
            <span className="wander-empty-icon">
              <FiTruck size={48} />
            </span>
            <p>No transports found</p>
            <span className="wander-empty-desc">No vehicles registered yet</span>
          </div>
        ) : (
          currentItems.map((vehicle) => (
            <div key={vehicle.id} className="wander-transport-card">
              <div className="wander-transport-image">
                {vehicle.principal_image ? (
                  <img src={vehicle.principal_image} alt={vehicle.name} />
                ) : (
                  <div className="wander-transport-image-placeholder">
                    <FiTruck size={48} />
                  </div>
                )}
                <div className="wander-transport-status-badge">
                  {getStatusBadge(vehicle.status)}
                </div>
              </div>
              
              <div className="wander-transport-info">
                <h3 className="wander-transport-title">{vehicle.name}</h3>
                <p className="wander-transport-meta">
                  <FiTag size={12} style={{ marginRight: '4px' }} />
                  {vehicle.brand} {vehicle.model}
                </p>
                
                <div className="wander-transport-details">
                  <span>
                    <FiUsers size={12} style={{ marginRight: '4px' }} />
                    {vehicle.capacity} passengers
                  </span>
                  <span>
                    <FiTag size={12} style={{ marginRight: '4px' }} />
                    {vehicle.category}
                  </span>
                  <span>
                    <FiMapPin size={12} style={{ marginRight: '4px' }} />
                    {vehicle.color}
                  </span>
                </div>

                <div className="wander-transport-price">
                  <FiDollarSign size={16} />
                  {formatCurrency(vehicle.price_hour)} / hour
                </div>

                {vehicle.kit && (
                  <div className="wander-transport-kit">
                    <FiGift size={12} />
                    {vehicle.kit}
                  </div>
                )}
              </div>
              
              <div className="wander-transport-actions">
                <Link 
                  href={`/admin/transport/${vehicle.id}`}
                  className="wander-transport-action-btn details"
                >
                  <FiEye size={14} />
                  Details
                </Link>
                <button 
                  onClick={() => alert(`Delete ${vehicle.name} - Feature in development`)}
                  className="wander-transport-action-btn delete"
                >
                  <FiTrash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="wander-transport-pagination">
          <div className="wander-pagination-info">
            Showing {((currentPage || 1) - 1) * itemsPerPage + 1} - 
            {Math.min((currentPage || 1) * itemsPerPage, totalCount)} of {totalCount} vehicles
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