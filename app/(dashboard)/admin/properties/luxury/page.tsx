// app/admin/properties/luxury/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getLuxuryProperties, Property } from '@/app/lib/api/propertiesAdmin';
import type { IconType } from 'react-icons';
import {
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiX,
  FiHome,
  FiUser,
  FiDroplet,
  FiUsers,
  FiDollarSign,
  FiEye,
  FiCalendar,
  FiFileText,
  FiLink,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import '../list/properties-list.css';

const LoadingSkeleton = () => (
  <div className="wander-properties-container">
    <div className="wander-properties-header">
      <div>
        <span className="wander-breadcrumb">Listings / Luxury</span>
        <h2>Cargando propiedades luxury...</h2>
      </div>
    </div>
    <div className="wander-properties-loading">
      <div className="wander-loading-spinner"></div>
      <p>Cargando lista de propiedades luxury...</p>
    </div>
  </div>
);

export default function LuxuryPropertiesPage() {
  const router = useRouter();
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();

  const [properties, setProperties] = useState<Property[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    page: 1,
    page_size: 10,
    search: '',
  });

  const [totalPages, setTotalPages] = useState(0);

  const loadProperties = useCallback(async () => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getLuxuryProperties(filters);
      setProperties(data.results || []);
      setTotalCount(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / (filters.page_size || 10)));
    } catch (err) {
      console.error('❌ Error cargando propiedades luxury:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al cargar las propiedades luxury');
    } finally {
      setIsLoading(false);
    }
  }, [filters, token, isAuthenticated, router]);

  useEffect(() => {
    if (isChecking) return;

    const hasAuth = checkAuth();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAuthVerified(true);

    if (!hasAuth) {
      router.push('/login');
      return;
    }

    loadProperties();
  }, [filters, isAuthenticated, isChecking, loadProperties, router, checkAuth]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handlePageSizeChange = (size: number) => {
    setFilters(prev => ({ ...prev, page_size: size, page: 1 }));
  };

  const handleRefresh = async () => {
    await loadProperties();
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

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      'available': { label: 'AVAILABLE', color: '#16a34a' },
      'reserved': { label: 'RESERVED', color: '#f59e0b' },
      'cleaning': { label: 'CLEANING', color: '#2563eb' },
      'business': { label: 'BUSINESS', color: '#8b5cf6' },
    };
    const s = statusMap[status] || { label: (status || '').toUpperCase(), color: '#6b7280' };
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

  const getTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; color: string; icon: IconType }> = {
      'house': { label: 'House', color: '#2563eb', icon: FiHome },
      'apartment': { label: 'Apartment', color: '#8b5cf6', icon: FiHome },
      'luxury': { label: 'Luxury', color: '#f59e0b', icon: FiHome },
      'business': { label: 'Business', color: '#6b7280', icon: FiHome },
    };
    const t = typeMap[type] || { label: type, color: '#6b7280', icon: FiHome };
    const Icon = t.icon;
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 10px',
        borderRadius: '12px',
        fontSize: '10px',
        fontWeight: 500,
        backgroundColor: `${t.color}15`,
        color: t.color,
      }}>
        <Icon size={12} />
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
      <div className="wander-properties-container">
        <div className="wander-properties-header">
          <div>
            <span className="wander-breadcrumb">Listings / Luxury</span>
            <h2>Error</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <h3>⚠️ Error al cargar propiedades luxury</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="wander-btn-primary">
            <FiRefreshCw size={16} />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="wander-properties-container">
      <header className="wander-properties-header">
        <div>
          <span className="wander-breadcrumb">Listings / Luxury</span>
          <h2>Luxury Properties</h2>
          <p className="wander-properties-subtitle">
            {totalCount} {totalCount === 1 ? 'propiedad luxury' : 'propiedades luxury'}
          </p>
        </div>
        <div className="wander-properties-actions">
          <button
            onClick={handleRefresh}
            className="wander-btn-secondary"
          >
            <FiRefreshCw size={16} />
            Actualizar
          </button>
          <button
            className="wander-btn-primary"
            onClick={() => router.push('/admin/properties/create')}
          >
            <FiPlus size={16} />
            Create Property
          </button>
        </div>
      </header>

      <div className="wander-properties-filters">
        <div className="wander-search-box">
          <FiSearch size={16} />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="wander-search-input"
          />
          {filters.search && (
            <button
              onClick={() => handleSearch('')}
              className="wander-clear-search"
            >
              <FiX size={14} />
            </button>
          )}
        </div>

        <div className="wander-page-size">
          <label>Mostrar:</label>
          <select
            value={filters.page_size || 10}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="wander-select"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div className="wander-properties-grid">
        {properties.length === 0 ? (
          <div className="wander-properties-empty">
            <span className="wander-empty-icon">🏠</span>
            <p>No se encontraron propiedades luxury</p>
            <span className="wander-empty-desc">
              {filters.search ? 'Prueba con otro término de búsqueda' : 'No hay propiedades luxury registradas aún'}
            </span>
          </div>
        ) : (
          properties.map((property) => (
            <div key={property.id} className="wander-property-card">
              <div className="wander-property-image">
                {property.photo ? (
                  <img src={property.photo} alt={property.public_name || property.name} />
                ) : (
                  <div className="wander-property-image-placeholder">
                    <FiHome size={48} />
                  </div>
                )}
                <div className="wander-property-status">
                  {getStatusBadge(property.status)}
                </div>
                <div className="wander-property-type">
                  {getTypeBadge(property.listing_type)}
                </div>
              </div>

              <div className="wander-property-info">
                <h3 className="wander-property-title">
                  {property.public_name || property.name}
                </h3>
                <p className="wander-property-owner">
                  <FiUser size={12} style={{ marginRight: '4px' }} />
                  Owner: {property.owner}
                </p>
                <div className="wander-property-details">
                  <span>
                    <FiHome size={12} style={{ marginRight: '4px' }} />
                    {property.beds_number} beds
                  </span>
                  <span>
                    <FiDroplet size={12} style={{ marginRight: '4px' }} />
                    {property.baths_number} baths
                  </span>
                  <span>
                    <FiUsers size={12} style={{ marginRight: '4px' }} />
                    {property.max_of_guest} guests
                  </span>
                  <span>ID: {property.property_id || property.id}</span>
                </div>
                <div className="wander-property-price">
                  <FiDollarSign size={16} />
                  {formatCurrency(property.rent_price)}/night
                  {parseFloat(property.booking_price) > 0 && (
                    <span className="wander-property-booking">
                      • Booking: {formatCurrency(property.booking_price)}
                    </span>
                  )}
                </div>
              </div>

              <div className="wander-property-actions">
                <button
                  onClick={() => router.push(`/admin/properties/${property.id}`)}
                  className="wander-prop-btn wander-prop-btn-details"
                >
                  <FiEye size={14} />
                  Details
                </button>
                <button
                  onClick={() => router.push(`/admin/properties/reservations/${property.id}`)}
                  className="wander-prop-btn wander-prop-btn-reservations"
                >
                  <FiCalendar size={14} />
                  Reservations
                </button>
                <button
                  onClick={() => router.push(`/admin/properties/calendar/${property.id}`)}
                  className="wander-prop-btn wander-prop-btn-calendar"
                >
                  <FiCalendar size={14} />
                  Calendar
                </button>
                <button
                  onClick={() => router.push(`/admin/properties/invoices/${property.id}`)}
                  className="wander-prop-btn wander-prop-btn-invoices"
                >
                  <FiFileText size={14} />
                  Invoices
                </button>
                <button
                  onClick={() => router.push(`/admin/properties/access-links/${property.id}`)}
                  className="wander-prop-btn wander-prop-btn-access"
                >
                  <FiLink size={14} />
                  Access Links
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 0 && (
        <div className="wander-properties-pagination">
          <div className="wander-pagination-info">
            Mostrando {((filters.page || 1) - 1) * (filters.page_size || 10) + 1} -
            {Math.min((filters.page || 1) * (filters.page_size || 10), totalCount)} de {totalCount} propiedades
          </div>

          <div className="wander-pagination-controls">
            <button
              onClick={() => handlePageChange((filters.page || 1) - 1)}
              disabled={filters.page === 1}
              className="wander-pagination-btn"
            >
              <FiChevronLeft size={14} />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const currentPage = filters.page || 1;
              let pageNum;

              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`wander-pagination-btn ${pageNum === currentPage ? 'active' : ''}`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange((filters.page || 1) + 1)}
              disabled={filters.page === totalPages}
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
