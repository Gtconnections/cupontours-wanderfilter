'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getCars, Car, CarsResponse, refreshCars } from '@/app/lib/api/carsAdmin';
import './cars-list.css';

const LoadingSkeleton = () => (
  <div className="wander-cars-container">
    <div className="wander-cars-header">
      <div>
        <span className="wander-breadcrumb">Listings / Cars</span>
        <h2>Cargando autos...</h2>
      </div>
    </div>
    <div className="wander-cars-loading">
      <div className="wander-loading-spinner"></div>
      <p>Cargando lista de autos...</p>
    </div>
  </div>
);

export default function CarsListPage() {
  const router = useRouter();
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [cars, setCars] = useState<Car[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de paginación y filtros
  const [filters, setFilters] = useState({
    page: 1,
    page_size: 10,
    search: '',
    status: '',
  });
  
  const [totalPages, setTotalPages] = useState(0);

  // Cargar datos
  const loadCars = useCallback(async (forceRefresh = false) => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getCars(filters, forceRefresh);
      setCars(data.results || []);
      setTotalCount(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / (filters.page_size || 10)));
    } catch (err) {
      console.error('❌ Error cargando autos:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al cargar los autos');
    } finally {
      setIsLoading(false);
    }
  }, [filters, token, isAuthenticated, router]);

  useEffect(() => {
    if (isChecking) return;
    
    const hasAuth = checkAuth();
    // Auth check reads cookies/localStorage, only available after mount; deferring
    // to an effect (rather than a lazy initializer) avoids an SSR hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAuthVerified(true);
    
    if (!hasAuth) {
      router.push('/login');
      return;
    }

    loadCars();
  }, [filters, isAuthenticated, isChecking, loadCars, router, checkAuth]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status: status === prev.status ? '' : status, page: 1 }));
  };

  const handlePageSizeChange = (size: number) => {
    setFilters(prev => ({ ...prev, page_size: size, page: 1 }));
  };

  const handleRefresh = async () => {
    await loadCars(true);
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
      'business': { label: 'BUSINESS', color: '#2563eb' },
      'rented': { label: 'RENTED', color: '#f59e0b' },
      'maintenance': { label: 'MAINTENANCE', color: '#ef4444' },
    };
    const s = statusMap[status] || { label: status.toUpperCase(), color: '#6b7280' };
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
      <div className="wander-cars-container">
        <div className="wander-cars-header">
          <div>
            <span className="wander-breadcrumb">Listings / Cars</span>
            <h2>Error</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <h3>⚠️ Error al cargar autos</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="wander-btn-primary">
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
    <div className="wander-cars-container">
      {/* Cabecera */}
      <header className="wander-cars-header">
        <div>
          <span className="wander-breadcrumb">Listings / Cars</span>
          <h2>Listings cars</h2>
          <p className="wander-cars-subtitle">
            {totalCount} {totalCount === 1 ? 'auto' : 'autos'} registrados
          </p>
        </div>
        <div className="wander-cars-actions">
          <button 
            onClick={handleRefresh}
            className="wander-btn-secondary"
          >
            🔄 Actualizar
          </button>
          <button 
            className="wander-btn-primary"
            onClick={() => router.push('/admin/cars/create')}
          >
            ➕ Create car
          </button>
        </div>
      </header>

      {/* Filtros y búsqueda */}
      <div className="wander-cars-filters">
        <div className="wander-search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por marca..."
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="wander-search-input"
          />
          {filters.search && (
            <button
              onClick={() => handleSearch('')}
              className="wander-clear-search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="wander-status-filters">
          <button
            className={`wander-filter-pill ${!filters.status ? 'active' : ''}`}
            onClick={() => handleStatusFilter('')}
          >
            Todos
          </button>
          <button
            className={`wander-filter-pill ${filters.status === 'available' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('available')}
          >
            Available
          </button>
          <button
            className={`wander-filter-pill ${filters.status === 'business' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('business')}
          >
            Business
          </button>
          <button
            className={`wander-filter-pill ${filters.status === 'rented' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('rented')}
          >
            Rented
          </button>
          <button
            className={`wander-filter-pill ${filters.status === 'maintenance' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('maintenance')}
          >
            Maintenance
          </button>
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

      {/* Grid de autos */}
      <div className="wander-cars-grid">
        {cars.length === 0 ? (
          <div className="wander-cars-empty">
            <span className="wander-empty-icon">🚗</span>
            <p>No se encontraron autos</p>
            <span className="wander-empty-desc">
              {filters.search ? 'No hay autos con esa marca' : 'No hay autos registrados aún'}
            </span>
          </div>
        ) : (
          cars.map((car) => (
            <div key={car.id} className="wander-car-card">
              <div className="wander-car-image">
                {car.principal_image ? (
                  <img src={car.principal_image} alt={`${car.brand} ${car.model}`} />
                ) : (
                  <div className="wander-car-image-placeholder">
                    <span>🚗</span>
                  </div>
                )}
                <div className="wander-car-status">
                  {getStatusBadge(car.status)}
                </div>
              </div>
              
              <div className="wander-car-info">
                <h3 className="wander-car-title">
                  {car.brand} {car.model} {car.year}
                </h3>
                <p className="wander-car-owner">Owner: {car.owner}</p>
                <div className="wander-car-details">
                  <span>Plate: {car.plate}</span>
                  <span>External id: {car.external_id}</span>
                </div>
                <div className="wander-car-price">
                  {formatCurrency(car.rent_price)}/Rent
                </div>
              </div>
              
              <div className="wander-car-actions">
                <button className="wander-car-btn wander-car-btn-details"  onClick={() => router.push(`/admin/cars/${car.id}`)}>
                  Details
                </button>
                <button className="wander-car-btn wander-car-btn-reservations" onClick={() => router.push(`/admin/cars/reservations/${car.id}`)}>
                  Reservations
                </button>
                <button className="wander-car-btn wander-car-btn-calendar" onClick={() => router.push(`/admin/cars/calendar/${car.id}`)}>
                  Calendar
                </button>
                <button className="wander-car-btn wander-car-btn-invoices" onClick={() => router.push(`/admin/cars/invoices/${car.id}`)}>
                  Invoices
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paginación */}
      {totalPages > 0 && (
        <div className="wander-cars-pagination">
          <div className="wander-pagination-info">
            Mostrando {((filters.page || 1) - 1) * (filters.page_size || 10) + 1} - 
            {Math.min((filters.page || 1) * (filters.page_size || 10), totalCount)} de {totalCount} autos
          </div>
          
          <div className="wander-pagination-controls">
            <button
              onClick={() => handlePageChange((filters.page || 1) - 1)}
              disabled={filters.page === 1}
              className="wander-pagination-btn"
            >
              ◀
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
              ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}