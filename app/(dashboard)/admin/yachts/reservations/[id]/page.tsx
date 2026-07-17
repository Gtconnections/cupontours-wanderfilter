'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getYachtReservations, YachtReservation } from '@/app/lib/api/yachtsAdmin';
import YachtReservationDetailModal from '../../../components/YachtReservationDetailModal';
import { FiPlus, FiRefreshCw, FiArrowLeft, FiEye, FiCalendar, FiAlertCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './reservations.css';

const OCCASION_LABELS: Record<string, string> = {
  birthday: 'Birthday',
  family_trip: 'Family Trip',
  fun_day_at_sea: 'Fun Day at Sea',
  bachelorette: 'Bachelorette',
  business_lunch: 'Business Lunch',
  other: 'Other',
};

const DURATION_LABELS: Record<string, string> = {
  full_day: 'Full Day',
  half_day_in_the_morning: 'Half Day (AM)',
  half_day_in_the_afternoon: 'Half Day (PM)',
};

const LoadingSkeleton = () => (
  <div className="wander-reservations-container">
    <div className="wander-reservations-header">
      <div>
        <span className="wander-breadcrumb">Listings / Yachts / Reservations</span>
        <h2>Cargando reservaciones...</h2>
      </div>
    </div>
    <div className="wander-reservations-loading">
      <div className="wander-loading-spinner"></div>
      <p>Cargando lista de reservaciones...</p>
    </div>
  </div>
);

export default function YachtReservationsPage() {
  const router = useRouter();
  const params = useParams();
  const yachtId = parseInt(params.id as string);

  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();

  const [allReservations, setAllReservations] = useState<YachtReservation[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);

  const getCurrentPageData = useCallback(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return allReservations.slice(startIndex, endIndex);
  }, [allReservations, currentPage, pageSize]);

  const currentReservations = getCurrentPageData();

  const loadReservations = useCallback(async () => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getYachtReservations(yachtId);

      const reservationsData = data.reservations || [];
      const totalEarningsData = data.total_earnings?.earnings__sum || 0;

      setAllReservations(reservationsData);
      setTotalEarnings(totalEarningsData);
      setTotalCount(reservationsData.length);
      setTotalPages(Math.ceil(reservationsData.length / pageSize));
    } catch (err) {
      console.error('Error cargando reservaciones:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al cargar las reservaciones');
    } finally {
      setIsLoading(false);
    }
  }, [yachtId, token, isAuthenticated, router, pageSize]);

  useEffect(() => {
    if (isChecking) return;

    const hasAuth = checkAuth();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAuthVerified(true);

    if (!hasAuth) {
      router.push('/login');
      return;
    }

    if (yachtId && !isNaN(yachtId)) {
      loadReservations();
    } else {
      setError('ID de yate inválido');
      setIsLoading(false);
    }
  }, [yachtId, isAuthenticated, isChecking, loadReservations, router, checkAuth]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    setTotalPages(Math.ceil(allReservations.length / size));
  };

  const handleRefresh = async () => {
    await loadReservations();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const handleViewDetails = (reservationId: number) => {
    setSelectedReservationId(reservationId);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedReservationId(null);
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
          <div>
            <span className="wander-breadcrumb">Listings / Yachts / Reservations</span>
            <h2>Error</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <h3><FiAlertCircle size={18} /> Error al cargar reservaciones</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="wander-btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wander-reservations-container">
      <header className="wander-reservations-header">
        <div>
          <span className="wander-breadcrumb">Listings / Yachts / Reservations</span>
          <h2>Yate #{yachtId}</h2>
          <p className="wander-reservations-subtitle">
            {totalCount} reservaciones • Total: {formatCurrency(totalEarnings)}
          </p>
        </div>

        <div className="wander-reservations-actions">
          <button
            onClick={() => router.push(`/admin/yachts/reservations/create?yacht_id=${yachtId}`)}
            className="wander-btn-primary"
          >
            <FiPlus size={14} />
            Create Reservation
          </button>
          <button
            onClick={handleRefresh}
            className="wander-btn-secondary"
          >
            <FiRefreshCw size={14} />
            Actualizar
          </button>
          <button
            onClick={() => router.push(`/admin/yachts/calendar/${yachtId}`)}
            className="wander-btn-secondary"
          >
            <FiCalendar size={14} />
            Ver calendario
          </button>
          <button
            onClick={() => router.push(`/admin/yachts/list`)}
            className="wander-btn-secondary"
          >
            <FiArrowLeft size={14} />
            Volver a yates
          </button>
        </div>
      </header>

      <div className="wander-reservations-controls">
        <div className="wander-page-size">
          <label>Mostrar:</label>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="wander-select"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="wander-reservations-table-container">
        <table className="wander-reservations-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Guest</th>
              <th>Phone</th>
              <th>Date</th>
              <th>Duration</th>
              <th>Occasion</th>
              <th>Earnings</th>
              <th style={{ width: '80px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentReservations.length === 0 ? (
              <tr>
                <td colSpan={8} className="wander-empty-cell">
                  <div className="wander-empty-state">
                    <FiCalendar className="wander-empty-icon" />
                    <p>No hay reservaciones para este yate</p>
                    <span className="wander-empty-desc">Este yate aún no tiene reservaciones registradas</span>
                  </div>
                </td>
              </tr>
            ) : (
              currentReservations.map((res) => (
                <tr key={res.id} className="wander-reservation-row">
                  <td>
                    <span className="wander-reservation-id">#{res.id}</span>
                  </td>
                  <td>
                    <span className="wander-reservation-driver">{res.first_name} {res.last_name}</span>
                  </td>
                  <td>
                    <span className="wander-reservation-phone">{res.phone}</span>
                  </td>
                  <td>
                    <span className="wander-reservation-date">{formatDate(res.date)}</span>
                  </td>
                  <td>
                    <span className="wander-reservation-badge">{DURATION_LABELS[res.duration] || res.duration}</span>
                  </td>
                  <td>
                    <span className="wander-reservation-badge">{OCCASION_LABELS[res.occasion] || res.occasion}</span>
                  </td>
                  <td>
                    <span className="wander-reservation-total">{formatCurrency(res.earnings)}</span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleViewDetails(res.id)}
                      className="wander-action-btn wander-action-view"
                      title="Ver detalles"
                    >
                      <FiEye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="wander-reservations-pagination">
          <div className="wander-pagination-info">
            Mostrando {((currentPage - 1) * pageSize) + 1} -
            {Math.min(currentPage * pageSize, totalCount)} de {totalCount} reservaciones
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
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="wander-pagination-btn"
            >
              <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      <YachtReservationDetailModal
        isOpen={isDetailModalOpen}
        reservationId={selectedReservationId || 0}
        onClose={closeDetailModal}
        onDelete={handleRefresh}
      />
    </div>
  );
}
