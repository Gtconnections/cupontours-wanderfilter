'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getYachtReservations, YachtReservation } from '@/app/lib/api/yachtsAdmin';
import { FiChevronLeft, FiChevronRight, FiArrowLeft, FiAlertCircle, FiX } from 'react-icons/fi';
import './calendar.css';

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
  half_day_in_the_morning: 'Half Day (Morning)',
  half_day_in_the_afternoon: 'Half Day (Afternoon)',
};

const LoadingSkeleton = () => (
  <div className="wander-calendar-container">
    <div className="wander-calendar-header">
      <div>
        <span className="wander-breadcrumb">Listings / Yachts / Calendar</span>
        <h2>Cargando calendario...</h2>
      </div>
    </div>
    <div className="wander-calendar-loading">
      <div className="wander-loading-spinner"></div>
      <p>Cargando calendario de reservaciones...</p>
    </div>
  </div>
);

export default function YachtCalendarPage() {
  const router = useRouter();
  const params = useParams();
  const yachtId = parseInt(params.id as string);

  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();

  const [reservations, setReservations] = useState<YachtReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [yachtInfo, setYachtInfo] = useState<{ name: string } | null>(null);
  const [totalEarnings, setTotalEarnings] = useState(0);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateReservations, setSelectedDateReservations] = useState<YachtReservation[]>([]);

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

  // Reservaciones de yates usan una fecha puntual (no un rango), por lo que
  // el match es por igualdad exacta de fecha, no por rango check_in/check_out.
  const getReservationsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return reservations.filter(res => res.date === dateStr);
  };

  const hasReservations = (date: Date) => {
    return getReservationsForDate(date).length > 0;
  };

  const getReservationColor = (reservation: YachtReservation) => {
    const resDate = new Date(reservation.date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (resDate < now) {
      return '#d1d5db';
    }

    return '#2563eb';
  };

  const getBadgeColor = (reservation: YachtReservation) => {
    const resDate = new Date(reservation.date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (resDate < now) {
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
      const data = await getYachtReservations(yachtId);

      const reservationsData = data.reservations || [];
      const totalEarningsData = data.total_earnings?.earnings__sum || 0;

      setReservations(reservationsData);
      setTotalEarnings(totalEarningsData);

      if (reservationsData.length > 0) {
        setYachtInfo({ name: `Yate #${reservationsData[0].yacht_id}` });
      } else {
        setYachtInfo({ name: `Yate #${yachtId}` });
      }
    } catch (err) {
      console.error('Error cargando reservaciones:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al cargar las reservaciones');
    } finally {
      setIsLoading(false);
    }
  }, [yachtId, token, isAuthenticated, router]);

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
            <span className="wander-breadcrumb">Listings / Yachts / Calendar</span>
            <h2>Error</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <h3><FiAlertCircle size={18} /> Error al cargar el calendario</h3>
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
      <header className="wander-calendar-header">
        <div>
          <span className="wander-breadcrumb">Listings / Yachts / Calendar</span>
          <h2>
            {yachtInfo ? yachtInfo.name : `Yate #${yachtId}`}
          </h2>
          <p className="wander-calendar-subtitle">
            {reservations.length} reservaciones • Total: {formatCurrency(totalEarnings)}
          </p>
        </div>
        <div className="wander-calendar-actions">
          <button
            onClick={() => router.push(`/admin/yachts/reservations/${yachtId}`)}
            className="wander-btn-secondary"
          >
            Ver lista
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

      <div className="wander-calendar-wrapper">
        <div className="wander-calendar-controls">
          <button onClick={handlePrevMonth} className="wander-calendar-nav">
            <FiChevronLeft size={16} />
          </button>
          <span className="wander-calendar-month">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={handleNextMonth} className="wander-calendar-nav">
            <FiChevronRight size={16} />
          </button>
          <button onClick={handleToday} className="wander-calendar-today">Hoy</button>
        </div>

        <div className="wander-calendar-grid">
          {dayNames.map((day) => (
            <div key={day} className="wander-calendar-day-header">
              {day}
            </div>
          ))}

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
                              title={`${res.first_name} ${res.last_name} - ${formatCurrency(res.earnings)}`}
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
                <FiX size={18} />
              </button>
            </div>
            <div className="wander-calendar-detail-list">
              {selectedDateReservations.map((res) => {
                const badge = getBadgeColor(res);
                return (
                  <div
                    key={res.id}
                    className="wander-calendar-detail-item"
                  >
                    <div className="wander-calendar-detail-item-info">
                      <span className="wander-calendar-detail-item-driver">
                        {res.first_name} {res.last_name}
                      </span>
                      <span className="wander-calendar-detail-item-phone">{res.phone}</span>
                      <span className="wander-calendar-detail-item-amount">
                        {formatCurrency(res.earnings)}
                      </span>
                    </div>
                    <div className="wander-calendar-detail-item-status">
                      <span className="wander-calendar-detail-item-occasion">
                        {OCCASION_LABELS[res.occasion] || res.occasion}
                      </span>
                      <span className="wander-calendar-detail-item-occasion">
                        {DURATION_LABELS[res.duration] || res.duration}
                      </span>
                      <span
                        className="wander-calendar-detail-item-badge"
                        style={{
                          backgroundColor: badge.bg,
                          color: badge.text
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
