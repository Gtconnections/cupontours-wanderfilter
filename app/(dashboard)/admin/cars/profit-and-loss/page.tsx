'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getProfitAndLoss, ProfitAndLossItem, createProfitAndLoss } from '@/app/lib/api/carsAdmin';
import CreateProfitAndLossModal from '../../components/CreateProfitAndLossModal';
import './profit-and-loss.css';

const LoadingSkeleton = () => (
  <div className="wander-pl-container">
    <div className="wander-pl-header">
      <div>
        <span className="wander-breadcrumb">Listings / Cars / Profit and Loss</span>
        <h2>Cargando Profit and Loss...</h2>
      </div>
    </div>
    <div className="wander-pl-loading">
      <div className="wander-loading-spinner"></div>
      <p>Cargando datos...</p>
    </div>
  </div>
);

export default function ProfitAndLossPage() {
  const router = useRouter();
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [data, setData] = useState<ProfitAndLossItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  // Estado para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async (page: number = 1) => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getProfitAndLoss(page);
      
      setData(response.results || []);
      setTotalCount(response.count || 0);
      setTotalPages(Math.ceil((response.count || 0) / pageSize));
      
    } catch (err) {
      console.error('❌ Error cargando datos:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated, router, pageSize]);

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

    loadData(currentPage);
  }, [isAuthenticated, isChecking, loadData, router, checkAuth, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  const handleRefresh = async () => {
    await loadData(currentPage);
  };

  // 🔥 REDIRIGIR AL DETALLE
  const handleViewDetails = (itemId: number) => {
    router.push(`/admin/cars/profit-and-loss/${itemId}`);
  };

  // 🔥 CREAR PROFIT AND LOSS
  const handleCreatePL = async (data: { type: string; start_date: string; list_car_id: number[] }) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await createProfitAndLoss(data);
      
      // Verificar si hubo errores
      if (result.list_errors && result.list_errors.length > 0) {
        setError(`Errores: ${result.list_errors.map((e) => e.detail).join(', ')}`);
      } else {
        setSuccessMessage(`✅ Profit and Loss creado exitosamente para ${result.list_success.length} auto(s)`);
        setIsModalOpen(false);
        // Recargar la lista
        await loadData(currentPage);
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (err) {
      console.error('Error al crear PL:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al crear Profit and Loss');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
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
      <div className="wander-pl-container">
        <div className="wander-pl-header">
          <div>
            <span className="wander-breadcrumb">Listings / Cars / Profit and Loss</span>
            <h2>Error</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <h3>⚠️ Error al cargar datos</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="wander-btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wander-pl-container">
      {/* Cabecera */}
      <header className="wander-pl-header">
        <div>
          <span className="wander-breadcrumb">Listings / Cars / Profit and Loss</span>
          <h2>Profit and Loss</h2>
          <p className="wander-pl-subtitle">
            {totalCount} {totalCount === 1 ? 'registro' : 'registros'} encontrados
          </p>
        </div>
        <div className="wander-pl-actions">
          {/* 🔥 BOTÓN CREAR PL */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="wander-btn-primary"
          >
            ➕ Create PL
          </button>
          <button 
            onClick={handleRefresh}
            className="wander-btn-secondary"
          >
            🔄 Actualizar
          </button>
        </div>
      </header>

      {successMessage && (
        <div className="wander-success-message" style={{
          padding: '12px 16px',
          backgroundColor: '#dcfce7',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          color: '#166534',
          fontSize: '14px',
          marginBottom: '20px',
        }}>
          {successMessage}
        </div>
      )}

      {error && (
        <div className="wander-error-message" style={{
          padding: '12px 16px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fee2e2',
          borderRadius: '8px',
          color: '#991b1b',
          fontSize: '14px',
          marginBottom: '20px',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Tabla */}
      <div className="wander-pl-table-container">
        <table className="wander-pl-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>ID</th>
              <th>Car</th>
              <th>Date</th>
              <th>Income</th>
              <th>Expenses</th>
              <th>Profit</th>
              <th>Fee</th>
              <th style={{ width: '80px' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={8} className="wander-empty-cell">
                  <div className="wander-empty-state">
                    <span className="wander-empty-icon">📊</span>
                    <p>No hay registros</p>
                    <span className="wander-empty-desc">No hay datos de Profit and Loss disponibles</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="wander-pl-row">
                  <td>
                    <span className="wander-pl-id">#{item.id}</span>
                  </td>
                  <td>
                    <div className="wander-pl-car">
                      <span className="wander-pl-car-name">
                        {item.car.brand} {item.car.model}
                      </span>
                      <span className="wander-pl-car-year">{item.car.year}</span>
                      <span className="wander-pl-car-plate">({item.car.plate})</span>
                    </div>
                  </td>
                  <td>
                    <span className="wander-pl-date">{formatDate(item.date)}</span>
                  </td>
                  <td>
                    <span className="wander-pl-income">{formatCurrency(item.total_income)}</span>
                  </td>
                  <td>
                    <span className="wander-pl-expenses">{formatCurrency(item.total_expenses)}</span>
                  </td>
                  <td>
                    <span className={`wander-pl-profit ${parseFloat(item.income_minus_expenses) >= 0 ? 'positive' : 'negative'}`}>
                      {formatCurrency(item.income_minus_expenses)}
                    </span>
                  </td>
                  <td>
                    <span className="wander-pl-fee">{formatCurrency(item.fee_cupon_tours)}</span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleViewDetails(item.id)}
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
        <div className="wander-pl-pagination">
          <div className="wander-pagination-info">
            Mostrando {((currentPage - 1) * pageSize) + 1} - 
            {Math.min(currentPage * pageSize, totalCount)} de {totalCount} registros
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

      {/* Modal de creación */}
      <CreateProfitAndLossModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreatePL}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}