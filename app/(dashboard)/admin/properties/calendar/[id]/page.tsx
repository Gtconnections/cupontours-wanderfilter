// app/admin/properties/calendar/[id]/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getPropertyCalendar, CalendarReservation, getReservationDetail, ReservationDetail } from '@/app/lib/api/propertiesAdmin';
import ModalReservationDetail from '../../../components/ModalReservationDetail';
import { FiArrowLeft, FiList, FiCalendar as FiCalendarIcon, FiEye } from 'react-icons/fi';
import './calendar.css';

const LoadingSkeleton = () => (
  <div className="wander-calendar-container">
    <div className="wander-calendar-header">
      <div>
        <span className="wander-breadcrumb">Listings / Properties / Calendar</span>
        <h2>Cargando calendario...</h2>
      </div>
    </div>
    <div className="wander-calendar-loading">
      <div className="wander-loading-spinner"></div>
      <p>Cargando calendario de reservaciones...</p>
    </div>
  </div>
);

export default function PropertyCalendarPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = parseInt(params.id as string);
  
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [reservations, setReservations] = useState<CalendarReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [propertyName, setPropertyName] = useState<string>(`Propiedad #${propertyId}`);
  const [totalEarnings, setTotalEarnings] = useState(0);
  
  // Estado para el calendario
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Estado para el detalle del día
  const [selectedDateReservations, setSelectedDateReservations] = useState<CalendarReservation[]>([]);

  // 🔥 Estado para el modal de detalle de reserva
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<ReservationDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

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
      const startDate = new Date(res.start_date).toISOString().split('T')[0];
      const endDate = new Date(res.end_date).toISOString().split('T')[0];
      return dateStr >= startDate && dateStr <= endDate;
    });
  };

  // Verificar si una fecha tiene reservaciones
  const hasReservations = (date: Date) => {
    return getReservationsForDate(date).length > 0;
  };

  // 🔥 Cargar detalle de reservación
  const handleViewReservationDetail = async (reservation: CalendarReservation) => {
    setIsDetailModalOpen(true);
    setIsLoadingDetail(true);
    setSelectedReservation(null);

    try {
      // Necesitamos obtener el ID de la reservación, pero la API de calendario no lo devuelve
      // Usamos la función que ya existe para obtener el detalle por ID
      // Pero como no tenemos el ID, vamos a buscar la reservación por guest_name y fechas
      // O podemos pasar la reservación completa y mostrar los datos directamente
      // Por ahora, vamos a mostrar los datos que tenemos en un modal simple
      
      // Como no tenemos el ID, vamos a construir un objeto con los datos que tenemos
      const detailData: ReservationDetail = {
        id: 0, // No tenemos ID
        listing_id: propertyId,
        listing_name: propertyName,
        booked: reservation.booked,
        start_date: reservation.start_date,
        end_date: reservation.end_date,
        status: reservation.status,
        confirmation_code: reservation.confirmation_code,
        reservation_type: reservation.reservation_type,
        platform_reservation: reservation.platform_reservation,
        nights: reservation.nights,
        guest_id: 0,
        guest_name: reservation.guest_name,
        guest_phone: '',
        number_of_guest: reservation.number_of_guest,
        earnings: parseFloat(reservation.earnings || '0'),
        observations: reservation.observations || '',
        image: '',
      };
      
      setSelectedReservation(detailData);
      
    } catch (err: any) {
      console.error('❌ Error cargando detalle:', err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Obtener color según estado de la reservación
  const getReservationColor = (reservation: CalendarReservation) => {
    const endDate = new Date(reservation.end_date);
    const now = new Date();
    
    if (endDate < now) {
      return '#d1d5db'; // Gris - Completada
    }
    
    if (reservation.status === 'confirmed') {
      return '#2563eb'; // Azul - Confirmada
    }
    
    if (reservation.status === 'pending') {
      return '#f59e0b'; // Amarillo - Pendiente
    }
    
    if (reservation.status === 'cancelled') {
      return '#dc2626'; // Rojo - Cancelada
    }
    
    return '#2563eb'; // Azul por defecto
  };

  // Obtener color de badge
  const getBadgeColor = (reservation: CalendarReservation) => {
    const endDate = new Date(reservation.end_date);
    const now = new Date();
    
    if (endDate < now) {
      return {
        bg: '#f3f4f6',
        text: '#6b7280',
        label: 'Completada'
      };
    }
    
    if (reservation.status === 'confirmed') {
      return {
        bg: '#dbeafe',
        text: '#2563eb',
        label: 'Confirmada'
      };
    }
    
    if (reservation.status === 'pending') {
      return {
        bg: '#fef3c7',
        text: '#f59e0b',
        label: 'Pendiente'
      };
    }
    
    if (reservation.status === 'cancelled') {
      return {
        bg: '#fee2e2',
        text: '#dc2626',
        label: 'Cancelada'
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
      const data = await getPropertyCalendar(propertyId);
      console.log('📦 Datos del calendario:', data);
      
      setReservations(data || []);
      
      // Calcular total de earnings
      const total = data.reduce((sum, res) => sum + parseFloat(res.earnings || '0'), 0);
      setTotalEarnings(total);
      
      // Si hay datos, obtener el nombre de la propiedad desde la primera reservación
      if (data.length > 0) {
        setPropertyName(`Propiedad #${propertyId}`);
      }
      
    } catch (err: any) {
      console.error('❌ Error cargando calendario:', err);
      setError(err.message || 'Error al cargar el calendario');
    } finally {
      setIsLoading(false);
    }
  }, [propertyId, token, isAuthenticated, router]);

  useEffect(() => {
    if (isChecking) return;
    
    const hasAuth = checkAuth();
    setIsAuthVerified(true);
    
    if (!hasAuth) {
      router.push('/login');
      return;
    }

    if (propertyId && !isNaN(propertyId)) {
      loadReservations();
    } else {
      setError('ID de propiedad inválido');
      setIsLoading(false);
    }
  }, [propertyId, isAuthenticated, isChecking, loadReservations, router, checkAuth]);

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
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
            <span className="wander-breadcrumb">Listings / Properties / Calendar</span>
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
          <span className="wander-breadcrumb">Listings / Properties / Calendar</span>
          <h2>{propertyName}</h2>
          <p className="wander-calendar-subtitle">
            {reservations.length} reservaciones • Total: {formatCurrency(totalEarnings)}
          </p>
        </div>
        <div className="wander-calendar-actions">
          <Link 
            href={`/admin/properties/reservations/${propertyId}`}
            className="wander-btn-secondary"
          >
            <FiList size={16} />
            Ver lista
          </Link>
          <Link 
            href={`/admin/properties/${propertyId}`}
            className="wander-btn-secondary"
          >
            <FiArrowLeft size={16} />
            Volver a propiedad
          </Link>
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
                              title={`${res.guest_name} - ${formatCurrency(parseFloat(res.earnings || '0'))}`}
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
              {selectedDateReservations.map((res, index) => {
                const badge = getBadgeColor(res);
                return (
                  <div
                    key={index}
                    className="wander-calendar-detail-item"
                  >
                    <div className="wander-calendar-detail-item-info">
                      <span className="wander-calendar-detail-item-driver">{res.guest_name}</span>
                      <span className="wander-calendar-detail-item-phone">
                        {res.confirmation_code}
                      </span>
                      <span className="wander-calendar-detail-item-dates">
                        {formatDate(res.start_date)} - {formatDate(res.end_date)}
                      </span>
                      <span className="wander-calendar-detail-item-amount">
                        {formatCurrency(parseFloat(res.earnings || '0'))}
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
                      <span className="wander-calendar-detail-item-platform">
                        {res.platform_reservation || '—'}
                      </span>
                      <span className="wander-calendar-detail-item-nights">
                        {res.nights} noche{res.nights > 1 ? 's' : ''}
                      </span>
                      {/* 🔥 Botón Ver Detalle */}
                      <button
                        onClick={() => handleViewReservationDetail(res)}
                        className="wander-calendar-detail-item-view"
                      >
                        <FiEye size={14} />
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

      {/* 🔥 Modal Detalle de Reservación */}
      <ModalReservationDetail
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedReservation(null);
        }}
        reservation={selectedReservation}
        isLoading={isLoadingDetail}
      />
    </div>
  );
}