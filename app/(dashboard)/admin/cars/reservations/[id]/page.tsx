'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getCarReservations, CarReservation } from '@/app/lib/api/carsAdmin';
import ReservationDetailModal from '../../../components/ReservationDetailModal';
import './reservations.css';

const LoadingSkeleton = () => (
  <div className="wander-reservations-container">
    <div className="wander-reservations-header">
      <div>
        <span className="wander-breadcrumb">Listings / Cars / Reservations</span>
        <h2>Cargando reservaciones...</h2>
      </div>
    </div>
    <div className="wander-reservations-loading">
      <div className="wander-loading-spinner"></div>
      <p>Cargando lista de reservaciones...</p>
    </div>
  </div>
);

export default function CarReservationsPage() {
  const router = useRouter();
  const params = useParams();
  const carId = parseInt(params.id as string);
  
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [allReservations, setAllReservations] = useState<CarReservation[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [carInfo, setCarInfo] = useState<{ brand: string; model: string } | null>(null);
  
  // 🔥 Paginación en frontend
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 🔥 Estado para el modal de detalle
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);

  // 🔥 Obtener los datos paginados para la tabla
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
      const data = await getCarReservations(carId);
      
      const reservationsData = data.results?.reservations || [];
      const totalEarningsData = data.results?.total_earnings || 0;
      
      setAllReservations(reservationsData);
      setTotalEarnings(totalEarningsData);
      setTotalCount(reservationsData.length);
      setTotalPages(Math.ceil(reservationsData.length / pageSize));
      
      // Guardar información del auto desde la primera reservación
      if (reservationsData.length > 0) {
        const first = reservationsData[0];
        setCarInfo({ brand: first.brand, model: first.model });
      }
      
    } catch (err) {
      console.error('❌ Error cargando reservaciones:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al cargar las reservaciones');
    } finally {
      setIsLoading(false);
    }
  }, [carId, token, isAuthenticated, router, pageSize]);

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

    if (carId && !isNaN(carId)) {
      loadReservations();
    } else {
      setError('ID de auto inválido');
      setIsLoading(false);
    }
  }, [carId, isAuthenticated, isChecking, loadReservations, router, checkAuth]);

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

  // 🔥 Abrir modal de detalles
  const handleViewDetails = (reservationId: number) => {
    setSelectedReservationId(reservationId);
    setIsDetailModalOpen(true);
  };

  // 🔥 Cerrar modal de detalles
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
            <span className="wander-breadcrumb">Listings / Cars / Reservations</span>
            <h2>Error</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <h3>⚠️ Error al cargar reservaciones</h3>
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
      {/* Cabecera */}
      <header className="wander-reservations-header">
        <div>
          <span className="wander-breadcrumb">Listings / Cars / Reservations</span>
          <h2>
            {carInfo ? `${carInfo.brand} ${carInfo.model}` : `Auto #${carId}`}
          </h2>
          <p className="wander-reservations-subtitle">
            {totalCount} reservaciones • Total: {formatCurrency(totalEarnings)}
          </p>
        </div>

        <div className="wander-reservations-actions">
            <button 
                onClick={() => router.push(`/admin/cars/reservations/create?car_id=${carId}`)}
                className="wander-btn-primary"
            >
                ➕ Create Reservation
            </button>
            <button 
                onClick={handleRefresh}
                className="wander-btn-secondary"
            >
                🔄 Actualizar
            </button>
            <button 
              onClick={() => router.push(`/admin/cars/list`)}
              className="wander-btn-secondary"
            >
              ← Volver a autos
            </button>
        </div>
      </header>

      {/* 🔥 Selector de items por página */}
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

      {/* Tabla de reservaciones */}
      <div className="wander-reservations-table-container">
        <table className="wander-reservations-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Driver</th>
              <th>Phone</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Earnings</th>
              <th>Extra Charges</th>
              <th>Total Earnings</th>
              <th style={{ width: '80px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentReservations.length === 0 ? (
              <tr>
                <td colSpan={9} className="wander-empty-cell">
                  <div className="wander-empty-state">
                    <span className="wander-empty-icon">📋</span>
                    <p>No hay reservaciones para este auto</p>
                    <span className="wander-empty-desc">Este auto aún no tiene reservaciones registradas</span>
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
                    <span className="wander-reservation-driver">{res.driver}</span>
                  </td>
                  <td>
                    <span className="wander-reservation-phone">{res.phone}</span>
                  </td>
                  <td>
                    <span className="wander-reservation-date">{formatDate(res.check_in)}</span>
                  </td>
                  <td>
                    <span className="wander-reservation-date">{formatDate(res.check_out)}</span>
                  </td>
                  <td>
                    <span className="wander-reservation-amount">{formatCurrency(res.earnings)}</span>
                  </td>
                  <td>
                    <span className="wander-reservation-amount">{formatCurrency(res.extra_charges)}</span>
                  </td>
                  <td>
                    <span className="wander-reservation-total">{formatCurrency(res.total_earnings)}</span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleViewDetails(res.id)}
                      className="wander-action-btn wander-action-view"
                      title="Ver detalles"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
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
              ◀
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
              ▶
            </button>
          </div>
        </div>
      )}

      {/* 🔥 Modal de detalle */}
      <ReservationDetailModal
        isOpen={isDetailModalOpen}
        reservationId={selectedReservationId || 0}
        carId={carId}
        onClose={closeDetailModal}
        onDelete={handleRefresh} // 🔥 Recargar la lista después de eliminar
        />
    </div>
  );
}