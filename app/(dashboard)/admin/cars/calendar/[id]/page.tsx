'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getCarReservations, CarReservation } from '@/app/lib/api/carsAdmin';
import ReservationDetailModal from '../../../components/ReservationDetailModal';
import './calendar.css';

const LoadingSkeleton = () => (
  <div className="wander-calendar-container">
    <div className="wander-calendar-header">
      <div>
        <span className="wander-breadcrumb">Listings / Cars / Calendar</span>
        <h2>Cargando calendario...</h2>
      </div>
    </div>
    <div className="wander-calendar-loading">
      <div className="wander-loading-spinner"></div>
      <p>Cargando calendario de reservaciones...</p>
    </div>
  </div>
);

export default function CarCalendarPage() {
  const router = useRouter();
  const params = useParams();
  const carId = parseInt(params.id as string);
  
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [reservations, setReservations] = useState<CarReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [carInfo, setCarInfo] = useState<{ brand: string; model: string; id: number } | null>(null);
  const [totalEarnings, setTotalEarnings] = useState(0);
  
  // Estado para el calendario
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Estado para el modal de detalle
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);
  const [selectedDateReservations, setSelectedDateReservations] = useState<CarReservation[]>([]);

  // Obtener el primer día del mes y el número de días
  const getMonthData = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const days = [];
    const totalSlots = Math.ceil((startDayOfWeek + daysInMonth) / 7) * 7;
    
    for (let i = 0; i < totalSlots; i++) {
      const dayNumber = i - startDayOfWeek + 1;
      if (dayNumber > 0 && dayNumber <= daysInMonth) {
        const date = new Date(year, month, dayNumber);
        days.push({
          day: dayNumber,
          date: date,
          isCurrentMonth: true,
          isToday: date.toDateString() === new Date().toDateString(),
        });
      } else {
        days.push({
          day: null,
          date: null,
          isCurrentMonth: false,
          isToday: false,
        });
      }
    }
    
    return { days };
  }, [currentDate]);

  // Obtener reservaciones para una fecha específica
  const getReservationsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return reservations.filter(res => {
      const checkIn = new Date(res.check_in).toISOString().split('T')[0];
      const checkOut = new Date(res.check_out).toISOString().split('T')[0];
      return dateStr >= checkIn && dateStr <= checkOut;
    });
  };

  // Verificar si una fecha tiene reservaciones
  const hasReservations = (date: Date) => {
    return getReservationsForDate(date).length > 0;
  };

  // 🔥 OBTENER COLOR SEGÚN FECHA DE CHECK OUT
  const getReservationColor = (reservation: CarReservation) => {
    const checkOut = new Date(reservation.check_out);
    const now = new Date();
    
    // Si el check out ya pasó, color gris/secundario
    if (checkOut < now) {
      return '#d1d5db'; // Gris claro
    }
    
    // Si el check out es hoy o en el futuro, color activo
    return '#2563eb'; // Azul activo
  };

  // 🔥 OBTENER COLOR DE TEXTO PARA EL BADGE
  const getBadgeColor = (reservation: CarReservation) => {
    const checkOut = new Date(reservation.check_out);
    const now = new Date();
    
    if (checkOut < now) {
      return {
        bg: '#f3f4f6',
        text: '#6b7280',
        label: 'Completada'
      };
    }
    
    return {
      bg: '#dbeafe',
      text: '#2563eb',
      label: 'Activa'
    };
  };

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const { days } = getMonthData();

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
      
      setReservations(reservationsData);
      setTotalEarnings(totalEarningsData);
      
      if (reservationsData.length > 0) {
        const first = reservationsData[0];
        setCarInfo({ brand: first.brand, model: first.model, id: first.car_id });
      } else {
        setCarInfo({ brand: 'Auto', model: `#${carId}`, id: carId });
      }
      
    } catch (err) {
      console.error('❌ Error cargando reservaciones:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al cargar las reservaciones');
    } finally {
      setIsLoading(false);
    }
  }, [carId, token, isAuthenticated, router]);

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

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const handleDayClick = (date: Date) => {
    if (!date) return;
    const dayReservations = getReservationsForDate(date);
    if (dayReservations.length > 0) {
      setSelectedDate(date);
      setSelectedDateReservations(dayReservations);
    }
  };

  const handleViewReservationDetail = (reservationId: number) => {
    setSelectedReservationId(reservationId);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedReservationId(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
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
      <div className="wander-calendar-container">
        <div className="wander-calendar-header">
          <div>
            <span className="wander-breadcrumb">Listings / Cars / Calendar</span>
            <h2>Error</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <h3>⚠️ Error al cargar el calendario</h3>
          <p>{error}</p>
          <button onClick={loadReservations} className="wander-btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wander-calendar-container">
      {/* Cabecera */}
      <header className="wander-calendar-header">
        <div>
          <span className="wander-breadcrumb">Listings / Cars / Calendar</span>
          <h2>
            {carInfo ? `${carInfo.brand} ${carInfo.model}` : `Auto #${carId}`}
          </h2>
          <p className="wander-calendar-subtitle">
            {reservations.length} reservaciones • Total: {formatCurrency(totalEarnings)}
          </p>
        </div>
        <div className="wander-calendar-actions">
          <button 
            onClick={() => router.push(`/admin/cars/reservations/${carId}`)}
            className="wander-btn-secondary"
          >
            📋 Ver lista
          </button>
          <button 
            onClick={() => router.push(`/admin/cars/list`)}
            className="wander-btn-secondary"
          >
            ← Volver a autos
          </button>
        </div>
      </header>

      {/* Calendario */}
      <div className="wander-calendar-wrapper">
        <div className="wander-calendar-controls">
          <button onClick={handlePrevMonth} className="wander-calendar-nav">◀</button>
          <span className="wander-calendar-month">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={handleNextMonth} className="wander-calendar-nav">▶</button>
          <button onClick={handleToday} className="wander-calendar-today">Hoy</button>
        </div>

        <div className="wander-calendar-grid">
          {/* Días de la semana */}
          {dayNames.map((day) => (
            <div key={day} className="wander-calendar-day-header">
              {day}
            </div>
          ))}

          {/* Días del mes */}
          {days.map((day, index) => {
            const hasRes = day.date ? hasReservations(day.date) : false;
            const dayReservations = day.date ? getReservationsForDate(day.date) : [];
            const isSelected = day.date && selectedDate && day.date.toDateString() === selectedDate.toDateString();
            
            return (
              <div
                key={index}
                className={`wander-calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''} ${hasRes ? 'has-reservations' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => day.date && hasRes && handleDayClick(day.date)}
                style={{ cursor: hasRes ? 'pointer' : 'default' }}
              >
                {day.day && (
                  <>
                    <span className="wander-calendar-day-number">{day.day}</span>
                    {hasRes && (
                      <div className="wander-calendar-day-dots">
                        {dayReservations.slice(0, 3).map((res, idx) => {
                          const color = getReservationColor(res);
                          return (
                            <span
                              key={idx}
                              className="wander-calendar-day-dot"
                              style={{ backgroundColor: color }}
                              title={`${res.driver} - ${formatCurrency(res.total_earnings)}`}
                            />
                          );
                        })}
                        {dayReservations.length > 3 && (
                          <span className="wander-calendar-day-more">
                            +{dayReservations.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Detalle del día seleccionado */}
        {selectedDate && selectedDateReservations.length > 0 && (
          <div className="wander-calendar-detail">
            <div className="wander-calendar-detail-header">
              <h3>
                {selectedDate.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </h3>
              <button 
                onClick={() => setSelectedDate(null)}
                className="wander-calendar-detail-close"
              >
                ✕
              </button>
            </div>
            <div className="wander-calendar-detail-list">
              {selectedDateReservations.map((res) => {
                const badge = getBadgeColor(res);
                return (
                  <div
                    key={res.id}
                    className="wander-calendar-detail-item"
                    onClick={() => handleViewReservationDetail(res.id)}
                  >
                    <div className="wander-calendar-detail-item-info">
                      <span className="wander-calendar-detail-item-driver">{res.driver}</span>
                      <span className="wander-calendar-detail-item-phone">{res.phone}</span>
                      <span className="wander-calendar-detail-item-amount">
                        {formatCurrency(res.total_earnings)}
                      </span>
                    </div>
                    <div className="wander-calendar-detail-item-status">
                      <span 
                        className="wander-calendar-detail-item-badge"
                        style={{ 
                          backgroundColor: badge.bg,
                          color: badge.text
                        }}
                      >
                        {badge.label}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewReservationDetail(res.id);
                        }}
                        className="wander-calendar-detail-item-view"
                      >
                        Ver
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      <ReservationDetailModal
        isOpen={isDetailModalOpen}
        reservationId={selectedReservationId || 0}
        carId={carId}
        onClose={closeDetailModal}
        onDelete={loadReservations}
      />
    </div>
  );
}