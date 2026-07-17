// app/(dashboard)/admin/services-reservations/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getReservations, getReservationDetail, Reservation, ReservationDetail, deleteReservation } from '@/app/lib/api/reservationAdmin';
import { 
  FiPlus, 
  FiRefreshCw, 
  FiEye, 
  FiEdit2, 
  FiTrash2,
  FiCalendar,
  FiList,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiMail,
  FiPhone,
  FiClock,
  FiUsers,
  FiFilter,
  FiX,
  FiTruck,
  FiCompass,
  FiFileText,
  FiHeart,
  FiHome,
  FiMusic,
  FiCalendar as FiCalendarIcon,
  FiInfo,
  FiType
} from 'react-icons/fi';
import { Modal } from '@/app/(dashboard)/admin/components/Modal';
import { ConfirmDialog } from '@/app/(dashboard)/admin/components/ConfirmDialog';
import Toast from '@/app/(dashboard)/admin/components/Toast';
import './services-reservations.css';

// Mapeo de tipos de servicio a iconos y etiquetas
const SERVICE_TYPE_MAP: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  'transporte_privado': { label: 'Transport', icon: <FiTruck size={14} />, color: '#2563eb' },
  'experiences': { label: 'Experience', icon: <FiCompass size={14} />, color: '#7c3aed' },
  'servicios_generales': { label: 'General', icon: <FiFileText size={14} />, color: '#f59e0b' },
  'wellness': { label: 'Wellness', icon: <FiHeart size={14} />, color: '#ec4899' },
  'health': { label: 'Health', icon: <FiHeart size={14} />, color: '#ef4444' },
  'real-estate': { label: 'Real Estate', icon: <FiHome size={14} />, color: '#0891b2' },
  'events': { label: 'Event', icon: <FiMusic size={14} />, color: '#8b5cf6' },
};

const SERVICE_TYPES = [
  { value: '', label: 'All Services' },
  { value: 'transporte_privado', label: 'Transport' },
  { value: 'experiences', label: 'Experiences' },
  { value: 'servicios_generales', label: 'General Services' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'health', label: 'Health' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'events', label: 'Events' },
];

const LoadingSkeleton = () => (
  <div className="wander-reservation-container">
    <div className="wander-reservation-header">
      <div>
        <span className="wander-breadcrumb">Services / Reservations</span>
        <h2>Loading reservations...</h2>
      </div>
    </div>
    <div className="wander-reservation-loading">
      <div className="wander-loading-spinner"></div>
      <p>Loading reservations...</p>
    </div>
  </div>
);

export default function ReservationListPage() {
  const router = useRouter();
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');

  // Paginación frontend
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);

  // 📅 Estado del calendario
  const [calendarDate, setCalendarDate] = useState(new Date());

  // 📋 Estado del modal
  const [selectedReservation, setSelectedReservation] = useState<ReservationDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Confirm Dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    id: number | null;
    name: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    id: null,
    name: '',
    isDeleting: false
  });

  const loadReservations = useCallback(async (forceRefresh = false) => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const filters = selectedFilter ? { servicio_tipo: selectedFilter } : undefined;
      const data = await getReservations(filters);
      console.log('📦 Datos de reservas:', data);
      
      setReservations(data.results || []);
      setTotalCount(data.count || 0);
    } catch (err) {
      console.error('❌ Error cargando reservas:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error loading reservations');
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated, router, selectedFilter]);

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

    loadReservations();
  }, [isAuthenticated, isChecking, loadReservations, router, checkAuth]);

  // Recargar cuando cambia el filtro
  useEffect(() => {
    if (isAuthVerified && isAuthenticated) {
      // Reloads the list when the active filter changes.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadReservations();
    }
  }, [selectedFilter, loadReservations, isAuthVerified, isAuthenticated]);

  const handleRefresh = async () => {
    await loadReservations(true);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFilter(e.target.value);
    setCurrentPage(1);
  };

  const clearFilter = () => {
    setSelectedFilter('');
    setCurrentPage(1);
  };

  const handleFechaDesdeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFechaDesde(e.target.value);
    setCurrentPage(1);
  };

  const handleFechaHastaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFechaHasta(e.target.value);
    setCurrentPage(1);
  };

  const clearFechaDesde = () => {
    setFechaDesde('');
    setCurrentPage(1);
  };

  const clearFechaHasta = () => {
    setFechaHasta('');
    setCurrentPage(1);
  };

  // 📅 Navegación del calendario
  const goToPreviousMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCalendarDate(new Date());
  };

  // 📋 Modal handlers
  const openReservationDetail = async (id: number) => {
    setIsLoadingDetail(true);
    setIsModalOpen(true);
    try {
      const detail = await getReservationDetail(id);
      setSelectedReservation(detail);
    } catch (err) {
      console.error('❌ Error cargando detalle:', err);
      setSelectedReservation(null);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReservation(null);
  };

  // 🗑️ Delete reservation handler
  const handleDeleteClick = (id: number, name: string) => {
    setConfirmDialog({
      isOpen: true,
      id,
      name,
      isDeleting: false
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDialog.id) return;

    setConfirmDialog(prev => ({ ...prev, isDeleting: true }));

    try {
      await deleteReservation(confirmDialog.id);
      console.log('✅ Reserva eliminada:', confirmDialog.id);
      
      setToast({
        message: `Reservation for "${confirmDialog.name}" deleted successfully!`,
        type: 'success'
      });
      
      setConfirmDialog({ isOpen: false, id: null, name: '', isDeleting: false });
      await loadReservations(true);
    } catch (err) {
      console.error('❌ Error eliminando reserva:', err);
      setToast({
        message: (err instanceof Error ? err.message : undefined) || 'Error deleting reservation',
        type: 'error'
      });
      setConfirmDialog(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleCloseConfirmDialog = () => {
    if (confirmDialog.isDeleting) return;
    setConfirmDialog({ isOpen: false, id: null, name: '', isDeleting: false });
  };

  const handleCloseToast = () => {
    setToast(null);
  };

  // Filtro por rango de fechas (fecha_inicio), aplicado en el cliente sobre lo ya cargado
  const filteredReservations = reservations.filter((res) => {
    if (!fechaDesde && !fechaHasta) return true;

    const start = res.fecha_inicio ? new Date(res.fecha_inicio) : null;
    if (!start || isNaN(start.getTime())) return false;
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());

    if (fechaDesde) {
      const desde = new Date(`${fechaDesde}T00:00:00`);
      if (startDay < desde) return false;
    }

    if (fechaHasta) {
      const hasta = new Date(`${fechaHasta}T00:00:00`);
      if (startDay > hasta) return false;
    }

    return true;
  });

  // Paginación frontend
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);

  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredReservations.slice(indexOfFirstItem, indexOfLastItem);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const formatDateShort = (dateTimeStr: string) => {
    if (!dateTimeStr) return '—';
    try {
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) return '—';
      
      const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
      };
      return date.toLocaleDateString('en-US', options);
    } catch {
      return dateTimeStr;
    }
  };

  const formatTimeShort = (dateTimeStr: string) => {
    if (!dateTimeStr) return '—';
    try {
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) return '—';
      
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      return date.toLocaleTimeString('en-US', options);
    } catch {
      return dateTimeStr;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      'pendiente': { label: 'Pending', color: '#f59e0b' },
      'confirmada': { label: 'Confirmed', color: '#16a34a' },
      'cancelada': { label: 'Cancelled', color: '#dc2626' },
      'completada': { label: 'Completed', color: '#6b7280' },
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

  const getServiceTypeInfo = (type: string) => {
    return SERVICE_TYPE_MAP[type] || { label: type, icon: null, color: '#6b7280' };
  };

  // 📅 Renderizar calendario
  const renderCalendarView = () => {
    const reservationsByDate: Record<string, Reservation[]> = {};
    
    filteredReservations.forEach(res => {
      const dateKey = new Date(res.fecha_inicio).toDateString();
      if (!reservationsByDate[dateKey]) {
        reservationsByDate[dateKey] = [];
      }
      reservationsByDate[dateKey].push(res);
    });

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay();

    const calendarDays: (number | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push(i);
    }

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const today = new Date();
    const isToday = today.getFullYear() === year && today.getMonth() === month;

    return (
      <div className="wander-calendar-wrapper">
        <div className="wander-calendar-header">
          <div className="wander-calendar-nav">
            <button onClick={goToPreviousMonth} className="wander-calendar-nav-btn" title="Previous month">
              <FiChevronLeft size={20} />
            </button>
            
            <div className="wander-calendar-title">
              <h3>{monthNames[month]} {year}</h3>
              {!isToday && (
                <button onClick={goToToday} className="wander-calendar-today-btn">
                  Today
                </button>
              )}
            </div>
            
            <button onClick={goToNextMonth} className="wander-calendar-nav-btn" title="Next month">
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div className="wander-calendar-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="wander-calendar-day-header">
              {day}
            </div>
          ))}
          {calendarDays.map((day, index) => {
            const dateObj = day ? new Date(year, month, day) : null;
            const dateKey = dateObj ? dateObj.toDateString() : '';
            const dayReservations = dateKey ? reservationsByDate[dateKey] || [] : [];
            const isTodayDate = dateObj && dateObj.toDateString() === new Date().toDateString();
            
            return (
              <div 
                key={index} 
                className={`wander-calendar-day ${!day ? 'empty' : ''} ${dayReservations.length > 0 ? 'has-events' : ''} ${isTodayDate ? 'today' : ''}`}
              >
                {day && (
                  <>
                    <div className={`wander-calendar-day-number ${isTodayDate ? 'today-number' : ''}`}>
                      {day}
                    </div>
                    {dayReservations.length > 0 && (
                      <div className="wander-calendar-day-events">
                        {dayReservations.slice(0, 3).map(res => {
                          const typeInfo = getServiceTypeInfo(res.servicio_tipo);
                          return (
                            <div 
                              key={res.id} 
                              className="wander-calendar-event"
                              style={{ borderLeftColor: typeInfo.color }}
                              onClick={() => openReservationDetail(res.id)}
                            >
                              <span className="wander-calendar-event-time">
                                {formatTimeShort(res.fecha_inicio)}
                              </span>
                              <span className="wander-calendar-event-title">{res.cliente_nombre}</span>
                            </div>
                          );
                        })}
                        {dayReservations.length > 3 && (
                          <div className="wander-calendar-event-more">
                            +{dayReservations.length - 3} more
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 🖼️ Renderizar Modal de Detalle
  const renderReservationModal = () => {
    if (!isModalOpen) return null;

    const typeInfo = selectedReservation 
      ? getServiceTypeInfo(selectedReservation.servicio_tipo) 
      : null;

    return (
      <div className="wander-modal-overlay" onClick={closeModal}>
        <div className="wander-modal" onClick={(e) => e.stopPropagation()}>
          <div className="wander-modal-header">
            <div className="wander-modal-title">
              <h3>Reservation Details</h3>
              {selectedReservation && (
                <span className="wander-modal-id">#{selectedReservation.id}</span>
              )}
            </div>
            <button onClick={closeModal} className="wander-modal-close">
              <FiX size={20} />
            </button>
          </div>

          {isLoadingDetail ? (
            <div className="wander-modal-loading">
              <div className="wander-loading-spinner"></div>
              <p>Loading reservation details...</p>
            </div>
          ) : selectedReservation ? (
            <div className="wander-modal-body">
              {/* Cliente */}
              <div className="wander-modal-section">
                <div className="wander-modal-section-header">
                  <FiUser size={16} />
                  <h4>Client Information</h4>
                </div>
                <div className="wander-modal-info-grid">
                  <div className="wander-modal-info-item">
                    <label>Name</label>
                    <span className="wander-modal-info-value">{selectedReservation.cliente_nombre}</span>
                  </div>
                  <div className="wander-modal-info-item">
                    <label>Email</label>
                    <span className="wander-modal-info-value">
                      <FiMail size={12} style={{ marginRight: '4px' }} />
                      {selectedReservation.cliente_email}
                    </span>
                  </div>
                  <div className="wander-modal-info-item">
                    <label>Phone</label>
                    <span className="wander-modal-info-value">
                      <FiPhone size={12} style={{ marginRight: '4px' }} />
                      {selectedReservation.cliente_telefono}
                    </span>
                  </div>
                </div>
              </div>

              {/* Servicio */}
              <div className="wander-modal-section">
                <div className="wander-modal-section-header">
                  <FiInfo size={16} />
                  <h4>Service Information</h4>
                </div>
                <div className="wander-modal-info-grid">
                  <div className="wander-modal-info-item">
                    <label>Service Type</label>
                    <span className="wander-modal-info-value" style={{ color: typeInfo?.color }}>
                      {typeInfo?.icon} {typeInfo?.label}
                    </span>
                  </div>
                  <div className="wander-modal-info-item">
                    <label>Service ID</label>
                    <span className="wander-modal-info-value">#{selectedReservation.servicio_id}</span>
                  </div>
                  <div className="wander-modal-info-item">
                    <label>Status</label>
                    <span className="wander-modal-info-value">
                      {getStatusBadge(selectedReservation.estado)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fecha y Personas */}
              <div className="wander-modal-section">
                <div className="wander-modal-section-header">
                  <FiClock size={16} />
                  <h4>Schedule & Capacity</h4>
                </div>
                <div className="wander-modal-info-grid">
                  <div className="wander-modal-info-item">
                    <label>Start Date & Time</label>
                    <span className="wander-modal-info-value">
                      <FiClock size={12} style={{ marginRight: '4px' }} />
                      {formatDateTime(selectedReservation.fecha_inicio)}
                    </span>
                  </div>
                  {selectedReservation.fecha_fin && (
                    <div className="wander-modal-info-item">
                      <label>End Date & Time</label>
                      <span className="wander-modal-info-value">
                        <FiClock size={12} style={{ marginRight: '4px' }} />
                        {formatDateTime(selectedReservation.fecha_fin)}
                      </span>
                    </div>
                  )}
                  <div className="wander-modal-info-item">
                    <label>People</label>
                    <span className="wander-modal-info-value">
                      <FiUsers size={12} style={{ marginRight: '4px' }} />
                      {selectedReservation.personas} {selectedReservation.personas === 1 ? 'person' : 'people'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notas */}
              {selectedReservation.notas && (
                <div className="wander-modal-section">
                  <div className="wander-modal-section-header">
                    <FiType size={16} />
                    <h4>Notes</h4>
                  </div>
                  <div className="wander-modal-notes">
                    {selectedReservation.notas}
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="wander-modal-actions">
                <Link 
                  href={`/admin/services-reservations/${selectedReservation.id}/edit`}
                  className="wander-modal-btn edit"
                  onClick={closeModal}
                >
                  <FiEdit2 size={14} />
                  Edit Reservation
                </Link>
                <button 
                  onClick={() => {
                    handleDeleteClick(selectedReservation.id, selectedReservation.cliente_nombre);
                    closeModal();
                  }}
                  className="wander-modal-btn delete"
                >
                  <FiTrash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="wander-modal-error">
              <p>Error loading reservation details</p>
            </div>
          )}
        </div>
      </div>
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
      <div className="wander-reservation-container">
        <div className="wander-reservation-header">
          <div>
            <span className="wander-breadcrumb">Services / Reservations</span>
            <h2>Error</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <h3>⚠️ Error loading reservations</h3>
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
    <div className="wander-reservation-container">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={handleCloseToast}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Reservation"
        message={`Are you sure you want to delete the reservation for "${confirmDialog.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isSubmitting={confirmDialog.isDeleting}
      />

      {/* Header */}
      <header className="wander-reservation-header">
        <div>
          <span className="wander-breadcrumb">SERVICES / RESERVATIONS</span>
          <h2>Reservations</h2>
          <p className="wander-reservation-subtitle">
            {(fechaDesde || fechaHasta)
              ? `${filteredReservations.length} of ${totalCount} ${totalCount === 1 ? 'reservation' : 'reservations'} matching filters`
              : `${totalCount} ${totalCount === 1 ? 'reservation' : 'reservations'} registered`}
          </p>
        </div>
        <div className="wander-reservation-actions">
          <div className="wander-filter-wrapper">
            <FiFilter size={14} className="wander-filter-icon" />
            <select
              value={selectedFilter}
              onChange={handleFilterChange}
              className="wander-filter-select"
            >
              {SERVICE_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {selectedFilter && (
              <button onClick={clearFilter} className="wander-filter-clear">
                <FiX size={14} />
              </button>
            )}
          </div>

          <div className="wander-date-filter-wrapper">
            <span className="wander-date-filter-label">From</span>
            <input
              type="date"
              value={fechaDesde}
              onChange={handleFechaDesdeChange}
              max={fechaHasta || undefined}
              className="wander-filter-date"
            />
            {fechaDesde && (
              <button onClick={clearFechaDesde} className="wander-filter-clear" aria-label="Clear from date">
                <FiX size={14} />
              </button>
            )}
          </div>

          <div className="wander-date-filter-wrapper">
            <span className="wander-date-filter-label">To</span>
            <input
              type="date"
              value={fechaHasta}
              onChange={handleFechaHastaChange}
              min={fechaDesde || undefined}
              className="wander-filter-date"
            />
            {fechaHasta && (
              <button onClick={clearFechaHasta} className="wander-filter-clear" aria-label="Clear to date">
                <FiX size={14} />
              </button>
            )}
          </div>

          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
            className="wander-btn-secondary"
          >
            {viewMode === 'list' ? (
              <>
                <FiCalendar size={16} />
                View Calendar
              </>
            ) : (
              <>
                <FiList size={16} />
                View List
              </>
            )}
          </button>

          <button 
            onClick={handleRefresh}
            className="wander-btn-secondary"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
        </div>
      </header>

      {/* Vista de Calendario o Lista */}
      {viewMode === 'calendar' ? (
        <div className="wander-calendar-view">
          {renderCalendarView()}
        </div>
      ) : (
        <>
          <div className="wander-reservation-grid">
            {currentItems.length === 0 ? (
              <div className="wander-reservation-empty">
                <span className="wander-empty-icon">
                  <FiCalendarIcon size={48} />
                </span>
                <p>No reservations found</p>
                <span className="wander-empty-desc">
                  {selectedFilter && (fechaDesde || fechaHasta)
                    ? `No reservations for "${SERVICE_TYPES.find(t => t.value === selectedFilter)?.label}" in the selected date range`
                    : selectedFilter
                    ? `No reservations for "${SERVICE_TYPES.find(t => t.value === selectedFilter)?.label}"`
                    : (fechaDesde || fechaHasta)
                    ? 'No reservations in the selected date range'
                    : 'No reservations registered yet'}
                </span>
              </div>
            ) : (
              currentItems.map((reservation) => {
                const typeInfo = getServiceTypeInfo(reservation.servicio_tipo);
                return (
                  <div key={reservation.id} className="wander-reservation-card">
                    <div className="wander-reservation-header-info">
                      <div className="wander-reservation-type-badge" style={{ backgroundColor: `${typeInfo.color}15`, color: typeInfo.color }}>
                        {typeInfo.icon}
                        {typeInfo.label}
                      </div>
                      <div className="wander-reservation-status">
                        {getStatusBadge(reservation.estado)}
                      </div>
                    </div>
                    
                    <div className="wander-reservation-info">
                      <h3 className="wander-reservation-title">{reservation.cliente_nombre}</h3>
                      
                      <div className="wander-reservation-details">
                        <span>
                          <FiClock size={12} style={{ marginRight: '4px' }} />
                          {formatDateShort(reservation.fecha_inicio)} • {formatTimeShort(reservation.fecha_inicio)}
                        </span>
                        <span>
                          <FiUsers size={12} style={{ marginRight: '4px' }} />
                          {reservation.personas}
                        </span>
                      </div>

                      <div className="wander-reservation-details">
                        <span className="wander-reservation-email">
                          <FiMail size={12} style={{ marginRight: '4px' }} />
                          {reservation.cliente_email}
                        </span>
                      </div>
                    </div>
                    
                    <div className="wander-reservation-actions">
                      <button 
                        onClick={() => openReservationDetail(reservation.id)}
                        className="wander-reservation-action-btn details"
                      >
                        <FiEye size={14} />
                        Details
                      </button>
                      <Link 
                        href={`/admin/services-reservations/${reservation.id}/edit`}
                        className="wander-reservation-action-btn edit"
                      >
                        <FiEdit2 size={14} />
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDeleteClick(reservation.id, reservation.cliente_nombre)}
                        className="wander-reservation-action-btn delete"
                      >
                        <FiTrash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {totalPages > 1 && (
            <div className="wander-reservation-pagination">
              <div className="wander-pagination-info">
                Showing {((currentPage || 1) - 1) * itemsPerPage + 1} -
                {Math.min((currentPage || 1) * itemsPerPage, filteredReservations.length)} of {filteredReservations.length} reservations
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
        </>
      )}

      {/* Modal de Detalle */}
      {renderReservationModal()}
    </div>
  );
}