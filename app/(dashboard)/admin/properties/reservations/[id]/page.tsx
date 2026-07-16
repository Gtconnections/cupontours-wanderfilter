// app/admin/properties/reservations/[id]/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getReservations, Reservation, getReservationDetail, ReservationDetail, deleteReservation } from '@/app/lib/api/propertiesAdmin';
import ModalReservationDetail from '../../../components/ModalReservationDetail';
import ModalDeleteReservation from '../../../components/ModalDeleteReservation';
import { FiSearch, FiX, FiPlus, FiArrowLeft, FiDollarSign, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import './reservations.css';

const LoadingSkeleton = () => (
  <div className="wander-reservations-container">
    <div className="wander-reservations-header">
      <div className="wander-reservations-header-content">
        <div className="wander-reservations-breadcrumb">
          LISTINGS / PROPERTIES / RESERVATIONS
        </div>
        <h1>Cargando...</h1>
      </div>
    </div>
    <div className="wander-reservations-loading">
      <div className="wander-loading-spinner"></div>
      <p>Cargando reservaciones...</p>
    </div>
  </div>
);

export default function ReservationsPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = parseInt(params.id as string);
  
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [listingName, setListingName] = useState('');
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Filtros
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Estado para el modal de detalle
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<ReservationDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Estado para el modal de eliminación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 🔥 Verificar si la reservación ya pasó (fecha final < hoy)
  const isReservationPast = (endDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    return end < today;
  };

  const loadReservations = useCallback(async (page = 1, start = '', end = '') => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const filters: any = {
        page: page,
        listing_id: listingId,
      };
      
      if (start) {
        filters.start_date = start;
      }
      if (end) {
        filters.end_date = end;
      }

      const result = await getReservations(filters);
      console.log('📦 Datos de Reservations:', result);
      
      const reservationData = result.results.reservations;
      setListingName(reservationData.listing_name || `Listing #${listingId}`);
      setReservations(reservationData.reservations || []);
      setTotalEarnings(reservationData.total_earnings || 0);
      
      const total = result.count || 0;
      setTotalCount(total);
      setTotalPages(Math.ceil(total / 20));
      
    } catch (err: any) {
      console.error('❌ Error cargando reservaciones:', err);
      setError(err.message || 'Error al cargar las reservaciones');
    } finally {
      setIsLoading(false);
    }
  }, [listingId, token, isAuthenticated, router]);

  // Cargar detalle de reservación
  const handleViewDetails = async (reservationId: number) => {
    setIsDetailModalOpen(true);
    setIsLoadingDetail(true);
    setSelectedReservation(null);

    try {
      const detail = await getReservationDetail(reservationId);
      console.log('📦 Detalle de reservación:', detail);
      setSelectedReservation(detail);
    } catch (err: any) {
      console.error('❌ Error cargando detalle:', err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Abrir modal de eliminación
  const handleDeleteClick = (reservation: Reservation) => {
    setReservationToDelete(reservation);
    setIsDeleteModalOpen(true);
  };

  // Ejecutar eliminación
  const handleConfirmDelete = async () => {
    if (!reservationToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteReservation(reservationToDelete.id);
      
      setToastMessage('🗑️ Reservation deleted successfully!');
      setTimeout(() => setToastMessage(null), 3000);
      
      setIsDeleteModalOpen(false);
      setReservationToDelete(null);
      // Recargar la lista
      loadReservations(currentPage, startDate, endDate);
      
    } catch (err: any) {
      console.error('❌ Error al eliminar:', err);
      setToastMessage(`❌ Error: ${err.message || 'Failed to delete'}`);
      setTimeout(() => setToastMessage(null), 3000);
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Verificar autenticación
  useEffect(() => {
    if (isChecking) return;
    
    const hasAuth = checkAuth();
    setIsAuthVerified(true);
    
    if (!hasAuth) {
      router.push('/login');
      return;
    }

    if (listingId && !isNaN(listingId)) {
      loadReservations(1, '', '');
    } else {
      setError('ID de propiedad inválido');
      setIsLoading(false);
    }
  }, [isAuthenticated, isChecking, loadReservations, router, checkAuth, listingId]);

  // Manejar búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadReservations(1, startDate, endDate);
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    loadReservations(1, '', '');
  };

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    loadReservations(page, startDate, endDate);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Formatear fecha
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Obtener badge de estado
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { class: string; label: string }> = {
      confirmed: { class: 'confirmed', label: 'Confirmed' },
      pending: { class: 'pending', label: 'Pending' },
      cancelled: { class: 'cancelled', label: 'Cancelled' },
      completed: { class: 'completed', label: 'Completed' },
    };
    const statusInfo = statusMap[status.toLowerCase()] || { class: 'default', label: status };
    return <span className={`wander-reservations-status ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  if (isChecking || !isAuthVerified) {
    return <LoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="wander-reservations-container">
        <div className="wander-reservations-header">
          <div className="wander-reservations-header-content">
            <div className="wander-reservations-breadcrumb">
              LISTINGS / PROPERTIES / RESERVATIONS
            </div>
            <h1>Error</h1>
          </div>
        </div>
        <div className="wander-error-state">
          <h3>⚠️ Error al cargar los datos</h3>
          <p>{error}</p>
          <button onClick={() => loadReservations(currentPage, startDate, endDate)} className="wander-btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wander-reservations-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="wander-toast">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="wander-reservations-header">
        <div className="wander-reservations-header-content">
          <div>
            <div className="wander-reservations-breadcrumb">
              LISTINGS / PROPERTIES / RESERVATIONS
            </div>
            <h1>{listingName}</h1>
            <div className="wander-reservations-meta">
              <span>{totalCount} reservations</span>
              <span className="wander-reservations-meta-separator">•</span>
              <span>Total: {formatCurrency(totalEarnings)}</span>
            </div>
          </div>
          <div className="wander-reservations-header-actions">
            <a 
                href={`/admin/properties/reservations/create?listing_id=${listingId}`}
                className="wander-reservations-action-btn create"
                >
                <FiPlus size={16} />
                Create Reservation
                </a>
            <Link 
              href={`/admin/properties/${listingId}`}
              className="wander-reservations-action-btn back"
            >
              <FiArrowLeft size={16} />
              Back
            </Link>
          </div>
        </div>
      </div>

      {/* Filtros + Total Earnings en 2 columnas */}
      <div className="wander-reservations-filter-row">
        {/* Filtros - 70% */}
        <div className="wander-reservations-filters">
          <form onSubmit={handleSearch} className="wander-reservations-search-form">
            <div className="wander-reservations-filter-group">
              <label className="wander-reservations-filter-label">Filter by date</label>
              <div className="wander-reservations-date-range">
                <input
                  type="date"
                  className="wander-reservations-filter-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Start date"
                />
                <span className="wander-reservations-date-separator">-</span>
                <input
                  type="date"
                  className="wander-reservations-filter-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="End date"
                />
              </div>
            </div>
            <div className="wander-reservations-filter-actions">
              <button type="submit" className="wander-reservations-search-btn">
                <FiSearch size={16} />
                Search
              </button>
              {(startDate || endDate) && (
                <button 
                  type="button" 
                  className="wander-reservations-clear-btn"
                  onClick={handleClearFilters}
                >
                  <FiX size={16} />
                  Clear filters
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Total Earnings - 30% */}
        <div className="wander-reservations-total-earnings">
          <div className="wander-reservations-total-earnings-icon">
            <FiDollarSign size={24} />
          </div>
          <div className="wander-reservations-total-earnings-content">
            <span className="wander-reservations-total-earnings-label">Total Earnings</span>
            <span className="wander-reservations-total-earnings-value">
              {formatCurrency(totalEarnings)}
            </span>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="wander-reservations-table-container">
        <table className="wander-reservations-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Confirmation Code</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Nights</th>
              <th>Platform</th>
              <th>Guest</th>
              <th>Earnings</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length === 0 ? (
              <tr>
                <td colSpan={11} className="wander-reservations-empty">
                  No reservations found
                </td>
              </tr>
            ) : (
              reservations.map((res) => {
                const isPast = isReservationPast(res.end_date);
                return (
                  <tr key={res.id}>
                    <td className="wander-reservations-id">{res.id}</td>
                    <td className="wander-reservations-code">{res.confirmation_code}</td>
                    <td>{formatDate(res.start_date)}</td>
                    <td>{formatDate(res.end_date)}</td>
                    <td>{getStatusBadge(res.status)}</td>
                    <td>{res.nights}</td>
                    <td>
                      <span className="wander-reservations-platform">
                        {res.platform_reservation || '—'}
                      </span>
                    </td>
                    <td className="wander-reservations-guest">{res.guest_name}</td>
                    <td className="wander-reservations-earnings">
                      {formatCurrency(res.earnings)}
                    </td>
                    <td>
                      <div className="wander-reservations-actions">
                        {/* Ver Detalles - Siempre visible */}
                        <button
                          className="wander-reservations-action-btn-icon view"
                          onClick={() => handleViewDetails(res.id)}
                          title="View details"
                        >
                          <FiEye size={15} />
                        </button>
                        {/* 🔥 Editar - Solo visible si NO ha pasado */}
                        {!isPast && (
                          <button
                            className="wander-reservations-action-btn-icon edit"
                            onClick={() => router.push(`/admin/properties/reservations/edit?id=${res.id}`)}
                            title="Edit"
                          >
                            <FiEdit2 size={15} />
                          </button>
                        )}
                        {/* 🔥 Eliminar - Solo visible si NO ha pasado */}
                        {!isPast && (
                          <button
                            className="wander-reservations-action-btn-icon delete"
                            onClick={() => handleDeleteClick(res)}
                            title="Delete"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="wander-reservations-pagination">
          <button
            className="wander-reservations-page-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ❮ Previous
          </button>
          <span className="wander-reservations-page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="wander-reservations-page-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next ❯
          </button>
        </div>
      )}

      {/* Modal Detalle de Reservación */}
      <ModalReservationDetail
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedReservation(null);
        }}
        reservation={selectedReservation}
        isLoading={isLoadingDetail}
      />

      {/* Modal Delete Reservation */}
      <ModalDeleteReservation
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setReservationToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        reservationId={reservationToDelete?.id || 0}
        guestName={reservationToDelete?.guest_name || ''}
        isLoading={isDeleting}
      />
    </div>
  );
}