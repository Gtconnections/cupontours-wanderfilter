'use client';

import React, { useState, useEffect } from 'react';
import './dashboard.css';
// Importamos el servicio y el tipado desde nuestra capa de API
import { getDashboardData, DashboardData } from '@/app/lib/api/dashboard';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'checkin' | 'checkout'>('upcoming');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Llamada limpia a nuestra capa de API centralizada
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        setError('No se pudieron cargar las métricas. Intente de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  // Funciones de formateo premium
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // 1. Renderizado Estado de Carga
  if (isLoading) {
    return (
      <div className="wander-empty-state-viewport" style={{ border: 'none', height: '100%' }}>
        <span className="wander-empty-title">Loading Analytics...</span>
        <p className="wander-empty-desc">Fetching real-time data from the ecosystem.</p>
      </div>
    );
  }

  // 2. Renderizado Estado de Error
  if (error || !dashboardData) {
    return (
      <div className="wander-empty-state-viewport" style={{ border: 'none', height: '100%' }}>
        <span className="wander-empty-title" style={{ color: '#dc3545' }}>Data Sync Error</span>
        <p className="wander-empty-desc">{error}</p>
      </div>
    );
  }

  // 3. Mapeo de Métricas Principales (Data real de la DB)
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
      value: formatCurrency(dashboardData.all_incomes_this_year),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <line x1="12" y1="4" x2="12" y2="20"/>
        </svg>
      )
    },
    {
      label: "(Annual) Nights Rented",
      value: formatNumber(dashboardData.all_nights),
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

  // 4. Renderizado Final Exitoso
  return (
    <div className="wander-dashboard-view">
      <header className="wander-dashboard-header">
        <span className="wander-breadcrumb">Dashboard / Main / Welcome</span>
        <h2>System Overview</h2>
      </header>

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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>Upcoming Reservations</span>
          </button>
          <button 
            type="button" 
            className={`wander-filter-btn ${activeTab === 'checkin' ? 'active' : ''}`}
            onClick={() => setActiveTab('checkin')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            <span>Check In</span>
          </button>
          <button 
            type="button" 
            className={`wander-filter-btn ${activeTab === 'checkout' ? 'active' : ''}`}
            onClick={() => setActiveTab('checkout')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 10 18 6 14 10"/><line x1="22" y1="6" x2="14" y2="6"/><path d="M14 14v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7"/></svg>
            <span>Check Out</span>
          </button>
        </div>

        <div className="wander-empty-state-viewport">
          <span className="wander-empty-title">
            {activeTab === 'upcoming' && 'Upcoming Reservations'}
            {activeTab === 'checkin' && 'Check In Schedule'}
            {activeTab === 'checkout' && 'Check Out Schedule'}
          </span>
          <p className="wander-empty-desc">
            {(activeTab === 'upcoming' && dashboardData.upcoming_reservations.length === 0) && "You don't have upcoming reservations."}
            {(activeTab === 'checkin' && dashboardData.check_in.length === 0) && "You don't have check-ins scheduled."}
            {(activeTab === 'checkout' && dashboardData.check_out.length === 0) && "You don't have check-outs scheduled."}
          </p>
        </div>
      </section>
    </div>
  );
}