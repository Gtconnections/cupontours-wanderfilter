// app/(dashboard)/admin/events/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getEvents, Event } from '@/app/lib/api/eventAdmin';
import { 
  FiPlus, 
  FiRefreshCw, 
  FiEye, 
  FiTrash2,
  FiDollarSign,
  FiMapPin,
  FiChevronLeft,
  FiChevronRight,
  FiTag,
  FiCalendar,
  FiUsers,
  FiMusic,
  FiCalendar as FiCalendarIcon
} from 'react-icons/fi';
import './events.css';

const LoadingSkeleton = () => (
  <div className="wander-event-container">
    <div className="wander-event-header">
      <div>
        <span className="wander-breadcrumb">Services / Events</span>
        <h2>Loading events...</h2>
      </div>
    </div>
    <div className="wander-event-loading">
      <div className="wander-loading-spinner"></div>
      <p>Loading events...</p>
    </div>
  </div>
);

export default function EventListPage() {
  const router = useRouter();
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Paginación frontend
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [totalPages, setTotalPages] = useState(0);

  const loadEvents = useCallback(async (forceRefresh = false) => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getEvents();
      console.log('📦 Datos de eventos:', data);
      
      setEvents(data.results || []);
      setTotalCount(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / itemsPerPage));
    } catch (err: any) {
      console.error('❌ Error cargando eventos:', err);
      setError(err.message || 'Error loading events');
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

    loadEvents();
  }, [isAuthenticated, isChecking, loadEvents, router, checkAuth]);

  const handleRefresh = async () => {
    await loadEvents(true);
  };

  // Paginación frontend
  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return events.slice(indexOfFirstItem, indexOfLastItem);
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

  const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return '—';
    try {
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) return '—';
      
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      return date.toLocaleDateString('en-US', options);
    } catch {
      return dateTimeStr;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      'activo': { label: 'Active', color: '#16a34a' },
      'inactivo': { label: 'Inactive', color: '#dc2626' },
      'finalizado': { label: 'Finished', color: '#6b7280' },
      'cancelado': { label: 'Cancelled', color: '#ef4444' },
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
      <div className="wander-event-container">
        <div className="wander-event-header">
          <div>
            <span className="wander-breadcrumb">Services / Events</span>
            <h2>Error</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <h3>⚠️ Error loading events</h3>
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
    <div className="wander-event-container">
      {/* Header */}
      <header className="wander-event-header">
        <div>
          <span className="wander-breadcrumb">SERVICES / EVENTS</span>
          <h2>Events</h2>
          <p className="wander-event-subtitle">
            {totalCount} {totalCount === 1 ? 'event' : 'events'} registered
          </p>
        </div>
        <div className="wander-event-actions">
          <button 
            onClick={handleRefresh}
            className="wander-btn-secondary"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
          <button 
            className="wander-btn-primary"
            onClick={() => router.push('/admin/events/create')}
          >
            <FiPlus size={16} />
            Create Event
          </button>
        </div>
      </header>

      {/* Grid */}
      <div className="wander-event-grid">
        {currentItems.length === 0 ? (
          <div className="wander-event-empty">
            <span className="wander-empty-icon">
              <FiMusic size={48} />
            </span>
            <p>No events found</p>
            <span className="wander-empty-desc">No events registered yet</span>
          </div>
        ) : (
          currentItems.map((event) => (
            <div key={event.id} className="wander-event-card">
              <div className="wander-event-image">
                {event.principal_image ? (
                  <img src={event.principal_image} alt={event.name} />
                ) : (
                  <div className="wander-event-image-placeholder">
                    <FiMusic size={48} />
                  </div>
                )}
                <div className="wander-event-status-badge">
                  {getStatusBadge(event.status)}
                </div>
              </div>
              
              <div className="wander-event-info">
                <h3 className="wander-event-title">{event.name}</h3>
                
                <div className="wander-event-datetime">
                  <FiCalendarIcon size={12} style={{ marginRight: '4px' }} />
                  {formatDateTime(event.fecha_hora)}
                </div>

                <p className="wander-event-meta">
                  <FiMapPin size={12} style={{ marginRight: '4px' }} />
                  {event.location}
                </p>
                
                <div className="wander-event-details">
                  <span>
                    <FiTag size={12} style={{ marginRight: '4px' }} />
                    {event.category}
                  </span>
                  <span>
                    <FiUsers size={12} style={{ marginRight: '4px' }} />
                    {event.capacity} {event.capacity === 1 ? 'person' : 'people'}
                  </span>
                </div>

                <div className="wander-event-price">
                  <FiDollarSign size={16} />
                  {formatCurrency(event.price)}
                  {event.price && ' / person'}
                </div>

                {event.descripcion && (
                  <p className="wander-event-description">
                    {event.descripcion.length > 80 
                      ? `${event.descripcion.substring(0, 80)}...` 
                      : event.descripcion}
                  </p>
                )}
              </div>
              
              <div className="wander-event-actions">
                <Link 
                  href={`/admin/events/${event.id}`}
                  className="wander-event-action-btn details"
                >
                  <FiEye size={14} />
                  Details
                </Link>
                <button 
                  onClick={() => alert(`Delete ${event.name} - Feature in development`)}
                  className="wander-event-action-btn delete"
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
        <div className="wander-event-pagination">
          <div className="wander-pagination-info">
            Showing {((currentPage || 1) - 1) * itemsPerPage + 1} - 
            {Math.min((currentPage || 1) * itemsPerPage, totalCount)} of {totalCount} events
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