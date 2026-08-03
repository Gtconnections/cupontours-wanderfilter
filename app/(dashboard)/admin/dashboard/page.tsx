'use client';

import React, { useState, useEffect } from 'react';
import './dashboard.css';
import Link from 'next/link';
import { getDashboardData, DashboardData, Reservation, ReservationData, MonthlyReservation } from '@/app/lib/api/dashboard';
import { getAttention, AttentionData } from '@/app/lib/api/operations';
import { useAuth } from '@/app/lib/utils/useAuth';

export default function AdminDashboardPage() {
  const { token, isChecking, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'upcoming' | 'checkin' | 'checkout'>('upcoming');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attention, setAttention] = useState<AttentionData | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      if (isChecking || !token) return;

      try {
        setIsLoading(true);
        setError(null);
        
        const data = await getDashboardData();
        setDashboardData(data);
        try { setAttention(await getAttention()); } catch { /* attention es best-effort */ }
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        setError(`Error al cargar datos: ${(err instanceof Error ? err.message : undefined)}`);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [token, isChecking]);

  const shortDate = (sv: string) => new Date(`${sv}T00:00:00`).toLocaleDateString('en', { month: 'short', day: '2-digit' });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // 🔥 FUNCIÓN PARA CONVERTIR LOS OBJETOS DE LA API EN ARRAY PARA EL GRÁFICO
  const buildMonthlyData = (): MonthlyReservation[] => {
    const countData = dashboardData?.monthly_reservations_count || {};
    const salesData = dashboardData?.monthly_sales || {};
    
    // Mapeo de nombres de meses en inglés a español
    const monthNames: { [key: string]: string } = {
      'January': 'Ene',
      'February': 'Feb',
      'March': 'Mar',
      'April': 'Abr',
      'May': 'May',
      'June': 'Jun',
      'July': 'Jul',
      'August': 'Ago',
      'September': 'Sep',
      'October': 'Oct',
      'November': 'Nov',
      'December': 'Dic'
    };

    // Obtener todas las keys de meses de ambos objetos
    const allKeys = new Set([...Object.keys(countData), ...Object.keys(salesData)]);
    
    // Ordenar los meses cronológicamente
    const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    const sortedKeys = Array.from(allKeys).sort((a, b) => {
      return monthOrder.indexOf(a) - monthOrder.indexOf(b);
    });

    return sortedKeys.map((key) => ({
      month: monthNames[key] || key.substring(0, 3),
      monthKey: key,
      year: 2026, // o extraer del año actual
      count: countData[key] || 0,
      revenue: salesData[key] || 0,
      nights: 0 // Tu API no envía este dato, lo dejamos en 0
    }));
  };

  // 🔥 CALCULAR ALTURA MÁXIMA PARA EL GRÁFICO
  const getMaxRevenue = (data: MonthlyReservation[]) => {
    if (!data || data.length === 0) return 1;
    const max = Math.max(...data.map(item => item.revenue));
    return max * 1.2; // 20% más para dar espacio
  };

  // 🔥 GENERAR DÍAS DEL MES PARA EL CALENDARIO
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const days = [];
    const totalSlots = Math.ceil((startDayOfWeek + daysInMonth) / 7) * 7;
    
    for (let i = 0; i < totalSlots; i++) {
      const dayNumber = i - startDayOfWeek + 1;
      if (dayNumber > 0 && dayNumber <= daysInMonth) {
        days.push({
          day: dayNumber,
          date: new Date(year, month, dayNumber),
          isCurrentMonth: true
        });
      } else {
        days.push({
          day: null,
          date: null,
          isCurrentMonth: false
        });
      }
    }
    
    return days;
  };

  // Convierte un valor de fecha a 'YYYY-MM-DD' de forma segura; null si es inválido
  const toDateKey = (value: string | Date | null | undefined): string | null => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
  };

  // VERIFICAR SI UN DÍA TIENE RESERVACIÓN
  const hasReservationOnDate = (date: Date, reservations: ReservationData[] | undefined) => {
    if (!reservations) return false;
    const dateStr = toDateKey(date);
    if (!dateStr) return false;
    return reservations.some(res => {
      const checkIn = toDateKey(res.start);
      const checkOut = toDateKey(res.end);
      if (!checkIn || !checkOut) return false;
      return dateStr >= checkIn && dateStr <= checkOut;
    });
  };

  // OBTENER RESERVACIONES PARA UN DÍA ESPECÍFICO
  const getReservationsOnDate = (date: Date, reservations: ReservationData[] | undefined) => {
    if (!reservations) return [];
    const dateStr = toDateKey(date);
    if (!dateStr) return [];
    return reservations.filter(res => {
      const checkIn = toDateKey(res.start);
      const checkOut = toDateKey(res.end);
      if (!checkIn || !checkOut) return false;
      return dateStr >= checkIn && dateStr <= checkOut;
    });
  };

  if (isChecking) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="wander-dashboard-view">
        <div className="wander-empty-state-viewport">
          <span className="wander-empty-title">Loading Analytics...</span>
          <p className="wander-empty-desc">Fetching real-time data from the ecosystem.</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="wander-dashboard-view">
        <div className="wander-empty-state-viewport">
          <span className="wander-empty-title">Data Sync Error</span>
          <p className="wander-empty-desc">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '16px',
              padding: '8px 20px',
              backgroundColor: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: "Active Listings",
      value: formatNumber(dashboardData.listing_count),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 21h18M3 7v14M21 7v14M16 3H8v4h8V3zM8 11h3v3H8v-3zM8 16h3v3H8v-3zM13 11h3v3h-3v-3zM13 16h3v3h-3v-3z"/>
        </svg>
      )
    },
    {
      label: "(Annual) Total Profit",
      value: formatCurrency(dashboardData.total_profit),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      )
    },
    {
      label: "(Annual) Total Revenue",
      value: formatCurrency(dashboardData.all_incomes_this_year || 0),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <line x1="12" y1="4" x2="12" y2="20"/>
        </svg>
      )
    },
    {
      label: "(Annual) Nights Rented",
      value: formatNumber(dashboardData.all_nights || 0),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      )
    }
  ];

  // 🔥 CONSTRUIR DATOS PARA EL GRÁFICO USANDO LOS DATOS REALES DE LA API
  const monthlyData = buildMonthlyData();
  const maxRevenue = getMaxRevenue(monthlyData);

  // 🔥 DATOS DEL CALENDARIO
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const calendarDays = getDaysInMonth(selectedDate);

  const allReservations = dashboardData.reservations_data || [];

  return (
    <div className="wander-dashboard-view">
      <header className="wander-dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span className="wander-breadcrumb">Dashboard / Main / Welcome</span>
            <h2>System Overview</h2>
          </div>
          <button 
            onClick={logout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {attention && (
        <section className="att-section">
          <div className="att-head">
            <span className="att-eyebrow">Action center</span>
            <h3>Requires your attention</h3>
          </div>
          <div className="att-grid">
            <div className="att-panel att-panel--turn">
              <div className="att-panel-head">
                <span className="att-panel-title">Turnovers</span>
                <span className="att-badge att-badge--turn">{attention.counts.turnovers_today + attention.counts.same_day}</span>
              </div>
              {attention.turnovers.length === 0 ? (
                <div className="att-empty">All clear</div>
              ) : (
                <ul className="att-list">
                  {attention.turnovers.slice(0, 5).map((t, i) => (
                    <li key={i} className="att-item">
                      <span className="att-item-main">{t.listing_name}</span>
                      <span className="att-item-sub">
                        {t.same_day ? <b className="att-tag att-tag--red">Same-day</b> : <b className="att-tag">Checkout today</b>}
                        {t.cleaner_name ? ` · ${t.cleaner_name}` : ' · Unassigned'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/admin/operations/turnovers" className="att-link">View turnovers →</Link>
            </div>

            <div className="att-panel att-panel--ticket">
              <div className="att-panel-head">
                <span className="att-panel-title">Urgent tickets</span>
                <span className="att-badge att-badge--ticket">{attention.counts.urgent_tickets}</span>
              </div>
              {attention.tickets.length === 0 ? (
                <div className="att-empty">All clear</div>
              ) : (
                <ul className="att-list">
                  {attention.tickets.slice(0, 5).map((t) => (
                    <li key={t.id} className="att-item">
                      <span className="att-item-main">{t.title}</span>
                      <span className="att-item-sub">{t.listing_name}{t.vendor_name ? ` · ${t.vendor_name}` : ''}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/admin/operations" className="att-link">View maintenance →</Link>
            </div>

            <div className="att-panel att-panel--stock">
              <div className="att-panel-head">
                <span className="att-panel-title">Low stock</span>
                <span className="att-badge att-badge--stock">{attention.counts.low_stock}</span>
              </div>
              {attention.low_stock.length === 0 ? (
                <div className="att-empty">All clear</div>
              ) : (
                <ul className="att-list">
                  {attention.low_stock.slice(0, 5).map((it) => (
                    <li key={it.id} className="att-item">
                      <span className="att-item-main">{it.name}</span>
                      <span className="att-item-sub">{it.listing_name} · {Number(it.current_qty)}/{Number(it.min_qty)} {it.unit}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/admin/operations?tab=inventory" className="att-link">View inventory →</Link>
            </div>

            <div className="att-panel att-panel--checkin">
              <div className="att-panel-head">
                <span className="att-panel-title">Check-ins soon</span>
                <span className="att-badge att-badge--checkin">{attention.counts.checkins_soon}</span>
              </div>
              {attention.checkins.length === 0 ? (
                <div className="att-empty">Nothing in 3 days</div>
              ) : (
                <ul className="att-list">
                  {attention.checkins.slice(0, 5).map((c, i) => (
                    <li key={i} className="att-item">
                      <span className="att-item-main">{c.listing_name}</span>
                      <span className="att-item-sub">{shortDate(c.start_date)} · {c.guests} guests · {c.confirmation_code}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/admin/properties/list" className="att-link">View properties →</Link>
            </div>
          </div>
        </section>
      )}

      <section className="wander-metrics-grid">
        {metrics.map((metric, i) => (
          <div key={i} className="wander-metric-card">
            <div className="wander-metric-info">
              <span className="wander-metric-label">{metric.label}</span>
              <span className="wander-metric-value">{metric.value}</span>
            </div>
            <div className="wander-metric-icon-box">
              {metric.icon}
            </div>
          </div>
        ))}
      </section>

      {/* 🔥 SECCIÓN 1: GRÁFICO DE RESERVACIONES POR MES CON DATOS REALES */}
      <section className="wander-section-card" style={{ marginBottom: '32px' }}>
        <div className="wander-section-title-box">
          <h3>Reservaciones por Mes</h3>
          <p style={{ fontSize: '13px', color: '#717171', marginTop: '4px' }}>
            Ingresos mensuales y cantidad de reservaciones
          </p>
        </div>

        {monthlyData.length === 0 ? (
          <div className="wander-empty-state-viewport">
            <span className="wander-empty-title">Sin datos mensuales</span>
            <p className="wander-empty-desc">No hay datos de reservaciones por mes disponibles.</p>
          </div>
        ) : (
          <div className="wander-chart-container" style={{ 
            display: 'flex', 
            alignItems: 'flex-end', 
            gap: '8px', 
            height: '240px',
            paddingTop: '30px',
            paddingBottom: '10px',
            borderBottom: '1px solid #ebebeb'
          }}>
            {monthlyData.map((item, index) => {
              const heightPercent = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
              // Color más oscuro para meses con más ingresos
              const revenueRatio = maxRevenue > 0 ? item.revenue / maxRevenue : 0;
              const intensity = Math.min(100, Math.max(30, revenueRatio * 100));
              const barColor = `rgb(${Math.round(20 + (1 - revenueRatio) * 60)}, ${Math.round(20 + (1 - revenueRatio) * 60)}, ${Math.round(20 + (1 - revenueRatio) * 60)})`;
              
              return (
                <div key={index} style={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end',
                  minWidth: '24px'
                }}>
                  <div 
                    className="wander-chart-bar"
                    style={{ 
                      width: '100%',
                      maxWidth: '40px',
                      height: `${Math.max(heightPercent, 4)}%`,
                      backgroundColor: barColor,
                      borderRadius: '4px 4px 0 0',
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      minHeight: '4px',
                      cursor: 'pointer'
                    }}
                    title={`${item.month}: ${formatCurrency(item.revenue)} - ${item.count} reservaciones`}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '-22px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '9px',
                      fontWeight: 600,
                      color: '#1a1a1a',
                      opacity: 0.8,
                      whiteSpace: 'nowrap'
                    }}>
                      {item.revenue >= 1000 ? `${(item.revenue / 1000).toFixed(1)}k` : formatCurrency(item.revenue)}
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '10px', 
                    color: '#717171', 
                    marginTop: '8px',
                    fontWeight: 500,
                    textAlign: 'center'
                  }}>
                    {item.month}
                  </div>
                  <div style={{ 
                    fontSize: '8px', 
                    color: '#999', 
                    marginTop: '2px',
                    textAlign: 'center'
                  }}>
                    {item.count} res
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Resumen de totales */}
        {monthlyData.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid #f0f0f0',
            fontSize: '12px',
            color: '#717171',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <span>Total reservaciones: <strong>{monthlyData.reduce((sum, item) => sum + item.count, 0)}</strong></span>
            <span>Ingreso total: <strong>{formatCurrency(monthlyData.reduce((sum, item) => sum + item.revenue, 0))}</strong></span>
            <span>Promedio mensual: <strong>{formatCurrency(monthlyData.reduce((sum, item) => sum + item.revenue, 0) / monthlyData.length)}</strong></span>
          </div>
        )}
      </section>

      {/* 🔥 SECCIÓN 2: CALENDARIO DE RESERVACIONES */}
      <section className="wander-section-card" style={{ marginBottom: '32px' }}>
        <div className="wander-section-title-box">
          <h3>Calendario de Reservaciones</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
              style={{
                padding: '6px 12px',
                border: '1px solid #ebebeb',
                borderRadius: '6px',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ◀
            </button>
            <span style={{ fontWeight: 600, fontSize: '16px' }}>
              {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </span>
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
              style={{
                padding: '6px 12px',
                border: '1px solid #ebebeb',
                borderRadius: '6px',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ▶
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              style={{
                padding: '4px 12px',
                border: '1px solid #ebebeb',
                borderRadius: '6px',
                background: '#f5f5f5',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 500
              }}
            >
              Hoy
            </button>
          </div>
        </div>

        <div className="wander-calendar-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '4px',
          marginTop: '16px'
        }}>
          {dayNames.map((day, i) => (
            <div key={i} style={{
              padding: '8px 4px',
              textAlign: 'center',
              fontSize: '11px',
              fontWeight: 600,
              color: '#717171',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {day}
            </div>
          ))}

          {calendarDays.map((day, index) => {
            const hasReservation = day.date ? hasReservationOnDate(day.date, allReservations) : false;
            const dayReservations = day.date ? getReservationsOnDate(day.date, allReservations) : [];
            const isToday = day.date ? day.date.toDateString() === new Date().toDateString() : false;

            return (
              <div
                key={index}
                className={`wander-calendar-day${hasReservation ? ' has-reservation' : ''}`}
                style={{
                  padding: '8px 4px',
                  textAlign: 'center',
                  borderRadius: '8px',
                  backgroundColor: hasReservation ? '#f0f0f0' : 'transparent',
                  border: isToday ? '2px solid #1a1a1a' : hasReservation ? '1px solid #d0d0d0' : '1px solid transparent',
                  cursor: hasReservation ? 'pointer' : 'default',
                  position: 'relative',
                  minHeight: '50px',
                  transition: 'all 0.2s ease'
                }}
                title={hasReservation ? `${dayReservations.length} reservación(es)` : ''}
              >
                {day.day && (
                  <>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: isToday ? 700 : 400,
                      color: day.isCurrentMonth ? '#1a1a1a' : '#cccccc'
                    }}>
                      {day.day}
                    </div>
                    {hasReservation && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '3px',
                        marginTop: '4px',
                        flexWrap: 'wrap'
                      }}>
                        {dayReservations.slice(0, 2).map((res, idx) => (
                          <div
                            key={idx}
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: res.status === 'confirmed' ? '#22c55e' :
                                             res.status === 'pending' ? '#eab308' :
                                             res.status === 'cancelled' ? '#ef4444' : '#6b7280'
                            }}
                          />
                        ))}
                        {dayReservations.length > 2 && (
                          <span style={{ fontSize: '8px', color: '#717171' }}>
                            +{dayReservations.length - 2}
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

        <div style={{
          display: 'flex',
          gap: '16px',
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #ebebeb',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }}></span>
            Confirmada
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#eab308', display: 'inline-block' }}></span>
            Pendiente
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }}></span>
            Cancelada
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#6b7280', display: 'inline-block' }}></span>
            Completada
          </div>
        </div>
      </section>

      {/* 🔥 SECCIÓN 3: LISTA DE RESERVACIONES */}
      <section className="wander-section-card">
        <div className="wander-section-title-box">
          <h3>Reservations Information</h3>
        </div>

        <div className="wander-reservation-filters">
          <button 
            type="button" 
            className={`wander-filter-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>Upcoming Reservations</span>
          </button>
          <button 
            type="button" 
            className={`wander-filter-btn ${activeTab === 'checkin' ? 'active' : ''}`}
            onClick={() => setActiveTab('checkin')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 11 12 14 22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            <span>Check In</span>
          </button>
          <button 
            type="button" 
            className={`wander-filter-btn ${activeTab === 'checkout' ? 'active' : ''}`}
            onClick={() => setActiveTab('checkout')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 10 18 6 14 10"/>
              <line x1="22" y1="6" x2="14" y2="6"/>
              <path d="M14 14v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7"/>
            </svg>
            <span>Check Out</span>
          </button>
        </div>

        {(activeTab === 'upcoming' && dashboardData.upcoming_reservations?.length === 0) ||
         (activeTab === 'checkin' && dashboardData.check_in?.length === 0) ||
         (activeTab === 'checkout' && dashboardData.check_out?.length === 0) ? (
          <div className="wander-empty-state-viewport">
            <span className="wander-empty-title">
              {activeTab === 'upcoming' && 'Upcoming Reservations'}
              {activeTab === 'checkin' && 'Check In Schedule'}
              {activeTab === 'checkout' && 'Check Out Schedule'}
            </span>
            <p className="wander-empty-desc">
              {(activeTab === 'upcoming' && "You don't have upcoming reservations.")}
              {(activeTab === 'checkin' && "You don't have check-ins scheduled.")}
              {(activeTab === 'checkout' && "You don't have check-outs scheduled.")}
            </p>
          </div>
        ) : (
          <div className="wander-reservations-list">
            {(activeTab === 'upcoming' ? dashboardData.upcoming_reservations :
              activeTab === 'checkin' ? dashboardData.check_in :
              dashboardData.check_out)?.map((reservation: Reservation) => (
                <div key={reservation.id} className="wander-reservation-item" style={{
                  padding: '16px',
                  borderBottom: '1px solid #ebebeb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>
                      {reservation.listing_name}
                    </div>
                    <div style={{ fontSize: '13px', color: '#717171' }}>
                      {reservation.guest_name} • {reservation.nights || 0} noches • {reservation.number_of_guest || 0} huéspedes
                    </div>
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                      {formatDate(reservation.start_date)} → {formatDate(reservation.end_date)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 600, fontSize: '15px' }}>
                      {formatCurrency(Number(reservation.earnings) || 0)}
                    </span>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      backgroundColor: reservation.status === 'confirmed' ? '#dcfce7' :
                                     reservation.status === 'pending' ? '#fef3c7' :
                                     reservation.status === 'cancelled' ? '#fee2e2' : '#e5e7eb',
                      color: reservation.status === 'confirmed' ? '#166534' :
                             reservation.status === 'pending' ? '#92400e' :
                             reservation.status === 'cancelled' ? '#991b1b' : '#374151'
                    }}>
                      {reservation.status}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}