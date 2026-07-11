'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getCarById, CarDetail, refreshCarDetail } from '@/app/lib/api/carsAdmin';
import './car-detail.css';

const LoadingSkeleton = () => (
  <div className="wander-car-detail-container">
    <div className="wander-car-detail-loading">
      <div className="wander-loading-spinner"></div>
      <p>Cargando detalles del auto...</p>
    </div>
  </div>
);

export default function CarDetailPage() {
  const router = useRouter();
  const params = useParams();
  const carId = parseInt(params.id as string);
  
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [car, setCar] = useState<CarDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCarDetail = useCallback(async (forceRefresh = false) => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getCarById(carId, forceRefresh);
      setCar(data);
    } catch (err: any) {
      console.error('❌ Error cargando auto:', err);
      setError(err.message || 'Error al cargar los detalles del auto');
    } finally {
      setIsLoading(false);
    }
  }, [carId, token, isAuthenticated, router]);

  useEffect(() => {
    if (isChecking) return;
    
    const hasAuth = checkAuth();
    setIsAuthVerified(true);
    
    if (!hasAuth) {
      router.push('/login');
      return;
    }

    if (carId && !isNaN(carId)) {
      loadCarDetail();
    } else {
      setError('ID de auto inválido');
      setIsLoading(false);
    }
  }, [carId, isAuthenticated, isChecking, loadCarDetail, router, checkAuth]);

  const handleRefresh = async () => {
    await loadCarDetail(true);
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || amount === 0) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return '—';
    return new Intl.NumberFormat('en-US').format(num);
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
      <div className="wander-car-detail-container">
        <div className="wander-error-state">
          <h3>⚠️ Error al cargar el auto</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="wander-btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="wander-car-detail-container">
        <div className="wander-error-state">
          <h3>⚠️ Auto no encontrado</h3>
          <p>No se encontró el auto con ID {carId}</p>
          <button onClick={() => router.push('/admin/cars/list')} className="wander-btn-primary">
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wander-car-detail-container">
      {/* Cabecera */}
      <header className="wander-car-detail-header">
        <div>
          <span className="wander-breadcrumb">Listings / Cars / Detail</span>
          <h2>
            ID # {car.id} - {car.brand} {car.model} {car.year}
          </h2>
          <p className="wander-car-detail-subtitle">
            {car.owner}
          </p>
          <p className="wander-car-detail-email">{car.owner_email || '—'}</p>
        </div>
        <div className="wander-car-detail-actions">
          <button 
            onClick={handleRefresh}
            className="wander-btn-secondary"
          >
            🔄 Actualizar
          </button>
          <button 
            onClick={() => router.push('/admin/cars/list')}
            className="wander-btn-secondary"
          >
            ← Volver
          </button>
        </div>
      </header>

      <div className="wander-car-detail-content">
        {/* Imagen principal */}
        {car.principal_image && (
          <div className="wander-car-detail-image">
            <img src={car.principal_image} alt={`${car.brand} ${car.model}`} />
          </div>
        )}

        {/* Información del auto */}
        <section className="wander-car-detail-section">
          <h3>Car information</h3>
          <div className="wander-car-detail-grid">
            <div className="wander-detail-item">
              <span className="wander-detail-label">Id:</span>
              <span className="wander-detail-value">{car.id}</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">External id:</span>
              <span className="wander-detail-value">{car.external_id}</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Brand:</span>
              <span className="wander-detail-value">{car.brand}</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Model:</span>
              <span className="wander-detail-value">{car.model}</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Year:</span>
              <span className="wander-detail-value">{car.year}</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Plate:</span>
              <span className="wander-detail-value">{car.plate}</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Miles:</span>
              <span className="wander-detail-value">{formatNumber(parseFloat(car.miles))} mi</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Status:</span>
              <span className="wander-detail-value">
                <span className={`wander-status-badge ${car.status}`}>
                  {car.status.toUpperCase()}
                </span>
              </span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Rent price:</span>
              <span className="wander-detail-value">{formatCurrency(parseFloat(car.rent_price))}/day</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Booking price:</span>
              <span className="wander-detail-value">{formatCurrency(car.booking_price ? parseFloat(car.booking_price) : null)}</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Total deposits:</span>
              <span className="wander-detail-value">{formatNumber(car.total_deposits)}</span>
            </div>
          </div>
        </section>

        {/* Información del dueño */}
        <section className="wander-car-detail-section">
          <h3>Owner information</h3>
          <div className="wander-car-detail-grid">
            <div className="wander-detail-item">
              <span className="wander-detail-label">Owner id:</span>
              <span className="wander-detail-value">{car.owner_id || '—'}</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Full name:</span>
              <span className="wander-detail-value">{car.owner || '—'}</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Phone number:</span>
              <span className="wander-detail-value">{car.owner_phone || '—'}</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Email:</span>
              <span className="wander-detail-value">{car.owner_email || '—'}</span>
            </div>
          </div>
        </section>

        {/* Descripción */}
        {car.description && (
          <section className="wander-car-detail-section">
            <h3>Description</h3>
            <div className="wander-car-detail-description">
              <p>{car.description}</p>
            </div>
          </section>
        )}

        {/* Totales financieros */}
        <section className="wander-car-detail-section">
          <h3>TOTALLY INCOME</h3>
          <div className="wander-car-detail-metrics">
            {/* Annual */}
            <div className="wander-metric-group">
              <h4>Annual</h4>
              <div className="wander-metric-item">
                <span className="wander-metric-label">TOTAL INCOME</span>
                <span className="wander-metric-value">{formatCurrency(car.total_income)}</span>
                <span className="wander-metric-change">—% Annual</span>
              </div>
              <div className="wander-metric-item">
                <span className="wander-metric-label">TOTAL EXPENSES</span>
                <span className="wander-metric-value">{formatCurrency(car.total_expenses)}</span>
                <span className="wander-metric-change">—% Annual</span>
              </div>
              <div className="wander-metric-item">
                <span className="wander-metric-label">TOTAL PROFIT</span>
                <span className="wander-metric-value">{formatCurrency(car.total_profit)}</span>
                <span className="wander-metric-change">—% Annual</span>
              </div>
            </div>

            {/* Monthly */}
            <div className="wander-metric-group">
              <h4>Monthly</h4>
              <div className="wander-metric-item">
                <span className="wander-metric-label">TOTAL INCOME</span>
                <span className="wander-metric-value">{formatCurrency(car.total_income ? car.total_income / 12 : null)}</span>
                <span className="wander-metric-change">—% Monthly</span>
              </div>
              <div className="wander-metric-item">
                <span className="wander-metric-label">TOTAL EXPENSES</span>
                <span className="wander-metric-value">{formatCurrency(car.total_expenses ? car.total_expenses / 12 : null)}</span>
                <span className="wander-metric-change">—% Monthly</span>
              </div>
              <div className="wander-metric-item">
                <span className="wander-metric-label">TOTAL PROFIT</span>
                <span className="wander-metric-value">{formatCurrency(car.total_profit ? car.total_profit / 12 : null)}</span>
                <span className="wander-metric-change">—% Monthly</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}