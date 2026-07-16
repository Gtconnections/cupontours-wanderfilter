// app/(dashboard)/admin/real-estate/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getRealEstates, RealEstate } from '@/app/lib/api/realAdmin';
import { 
  FiPlus, 
  FiRefreshCw, 
  FiEye, 
  FiTrash2,
  FiDollarSign,
  FiHome,
  FiMapPin,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiMaximize
} from 'react-icons/fi';
import { FaBed, FaBath } from 'react-icons/fa';
import './real-estate.css';

const LoadingSkeleton = () => (
  <div className="wander-realestate-container">
    <div className="wander-realestate-header">
      <div>
        <span className="wander-breadcrumb">Services / Real Estate</span>
        <h2>Loading properties...</h2>
      </div>
    </div>
    <div className="wander-realestate-loading">
      <div className="wander-loading-spinner"></div>
      <p>Loading properties...</p>
    </div>
  </div>
);

export default function RealEstateListPage() {
  const router = useRouter();
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [properties, setProperties] = useState<RealEstate[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Paginación frontend
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [totalPages, setTotalPages] = useState(0);

  const loadProperties = useCallback(async (forceRefresh = false) => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getRealEstates();
      console.log('📦 Datos de inmuebles:', data);
      
      setProperties(data.results || []);
      setTotalCount(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / itemsPerPage));
    } catch (err: any) {
      console.error('❌ Error cargando inmuebles:', err);
      setError(err.message || 'Error loading properties');
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

    loadProperties();
  }, [isAuthenticated, isChecking, loadProperties, router, checkAuth]);

  const handleRefresh = async () => {
    await loadProperties(true);
  };

  // Paginación frontend
  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return properties.slice(indexOfFirstItem, indexOfLastItem);
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
      'vendido': { label: 'Sold', color: '#6b7280' },
      'alquilado': { label: 'Rented', color: '#f59e0b' },
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

  const getOperationTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; color: string }> = {
      'venta': { label: 'For Sale', color: '#2563eb' },
      'alquiler': { label: 'For Rent', color: '#7c3aed' },
      'renta': { label: 'For Rent', color: '#7c3aed' },
    };
    const t = typeMap[type?.toLowerCase()] || { label: type || 'N/A', color: '#6b7280' };
    return (
      <span style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '12px',
        fontSize: '10px',
        fontWeight: 600,
        letterSpacing: '0.5px',
        backgroundColor: `${t.color}15`,
        color: t.color,
      }}>
        {t.label}
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
      <div className="wander-realestate-container">
        <div className="wander-realestate-header">
          <div>
            <span className="wander-breadcrumb">Services / Real Estate</span>
            <h2>Error</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <h3>⚠️ Error loading properties</h3>
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
    <div className="wander-realestate-container">
      {/* Header */}
      <header className="wander-realestate-header">
        <div>
          <span className="wander-breadcrumb">SERVICES / REAL ESTATE</span>
          <h2>Real Estate</h2>
          <p className="wander-realestate-subtitle">
            {totalCount} {totalCount === 1 ? 'property' : 'properties'} registered
          </p>
        </div>
        <div className="wander-realestate-actions">
          <button 
            onClick={handleRefresh}
            className="wander-btn-secondary"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
          <button 
            className="wander-btn-primary"
            onClick={() => router.push('/admin/real-estate/create')}
          >
            <FiPlus size={16} />
            Create Property
          </button>
        </div>
      </header>

      {/* Grid */}
      <div className="wander-realestate-grid">
        {currentItems.length === 0 ? (
          <div className="wander-realestate-empty">
            <span className="wander-empty-icon">
              <FiHome size={48} />
            </span>
            <p>No properties found</p>
            <span className="wander-empty-desc">No properties registered yet</span>
          </div>
        ) : (
          currentItems.map((property) => (
            <div key={property.id} className="wander-realestate-card">
              <div className="wander-realestate-image">
                {property.principal_image ? (
                  <img src={property.principal_image} alt={property.name} />
                ) : (
                  <div className="wander-realestate-image-placeholder">
                    <FiHome size={48} />
                  </div>
                )}
                <div className="wander-realestate-badges">
                  <div className="wander-realestate-status-badge">
                    {getStatusBadge(property.status)}
                  </div>
                  <div className="wander-realestate-operation-badge">
                    {getOperationTypeBadge(property.operation_type)}
                  </div>
                </div>
              </div>
              
              <div className="wander-realestate-info">
                <h3 className="wander-realestate-title">{property.name}</h3>
                <p className="wander-realestate-meta">
                  <FiMapPin size={12} style={{ marginRight: '4px' }} />
                  {property.location}
                </p>
                
                <div className="wander-realestate-details">
                  <span>
                    <FiGrid size={12} style={{ marginRight: '4px' }} />
                    {property.property_type}
                  </span>
                  <span>
                    <FaBed size={12} style={{ marginRight: '4px' }} />
                    {property.bedrooms} beds
                  </span>
                  <span>
                    <FaBath size={12} style={{ marginRight: '4px' }} />
                    {property.bathrooms} baths
                  </span>
                  <span>
                    <FiMaximize size={12} style={{ marginRight: '4px' }} />
                    {parseFloat(property.sqft)?.toLocaleString() || '—'} sqft
                  </span>
                  {property.parking_spaces > 0 && (
                    <span>
                      <FiGrid size={12} style={{ marginRight: '4px' }} />
                      {property.parking_spaces} parking
                    </span>
                  )}
                </div>

                <div className="wander-realestate-price">
                  <FiDollarSign size={16} />
                  {formatCurrency(property.price)}
                  {property.operation_type?.toLowerCase() === 'alquiler' && ' / month'}
                </div>
              </div>
              
              {/* ✅ ACCIONES: SOLO 2 BOTONES (Details y Delete) */}
              <div className="wander-realestate-actions">
                <Link 
                  href={`/admin/real-estate/${property.id}`}
                  className="wander-realestate-action-btn details"
                >
                  <FiEye size={14} />
                  Details
                </Link>
                <button 
                  onClick={() => alert(`Delete ${property.name} - Feature in development`)}
                  className="wander-realestate-action-btn delete"
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
        <div className="wander-realestate-pagination">
          <div className="wander-pagination-info">
            Showing {((currentPage || 1) - 1) * itemsPerPage + 1} - 
            {Math.min((currentPage || 1) * itemsPerPage, totalCount)} of {totalCount} properties
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