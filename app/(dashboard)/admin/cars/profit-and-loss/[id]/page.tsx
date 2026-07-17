'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getProfitAndLossDetail, ProfitAndLossDetail, deleteProfitAndLoss } from '@/app/lib/api/carsAdmin';
import DeleteProfitAndLossModal from '../../../components/DeleteProfitAndLossModal';
import './pl-detail.css';

const LoadingSkeleton = () => (
  <div className="wander-pl-detail-container">
    <div className="wander-pl-detail-header">
      <div>
        <span className="wander-breadcrumb">Listings / Cars / Profit and Loss / Detail</span>
        <h2>Cargando detalle...</h2>
      </div>
    </div>
    <div className="wander-pl-detail-loading">
      <div className="wander-loading-spinner"></div>
      <p>Cargando datos...</p>
    </div>
  </div>
);

export default function ProfitAndLossDetailPage() {
  const router = useRouter();
  const params = useParams();
  const plId = parseInt(params.id as string);
  
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [data, setData] = useState<ProfitAndLossDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Estado para el modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await getProfitAndLossDetail(plId);
      setData(result);
    } catch (err) {
      console.error('❌ Error cargando detalle:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al cargar el detalle');
    } finally {
      setIsLoading(false);
    }
  }, [plId, token, isAuthenticated, router]);

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

    if (plId && !isNaN(plId)) {
      loadDetail();
    } else {
      setError('ID inválido');
      setIsLoading(false);
    }
  }, [plId, isAuthenticated, isChecking, loadDetail, router, checkAuth]);

  // 🔥 REDIRIGIR AL DETALLE DE LA FACTURA
  const handleViewInvoice = (invoiceId: number) => {
    router.push(`/admin/cars/invoice-detail/${invoiceId}`);
  };

  // 🔥 ELIMINAR PROFIT AND LOSS
  const handleDeletePL = async () => {
    setIsDeleting(true);
    try {
      await deleteProfitAndLoss(plId);
      setShowDeleteModal(false);
      setSuccessMessage('✅ Profit and Loss eliminado exitosamente');
      
      // Redirigir al listado después de 1.5 segundos
      setTimeout(() => {
        router.push('/admin/cars/profit-and-loss');
      }, 1500);
    } catch (err) {
      console.error('Error al eliminar PL:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al eliminar Profit and Loss');
      setIsDeleting(false);
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
      month: 'long',
      year: 'numeric',
    });
  };

  const getTypeBadge = (type: string) => {
    const isIncome = type === 'incomes';
    return (
      <span style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '12px',
        fontSize: '10px',
        fontWeight: 600,
        textTransform: 'uppercase',
        backgroundColor: isIncome ? '#dcfce7' : '#fee2e2',
        color: isIncome ? '#166534' : '#991b1b',
      }}>
        {isIncome ? 'Income' : 'Expense'}
      </span>
    );
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
      <div className="wander-pl-detail-container">
        <div className="wander-pl-detail-header">
          <div>
            <span className="wander-breadcrumb">Listings / Cars / Profit and Loss / Detail</span>
            <h2>Error</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <h3>⚠️ Error al cargar el detalle</h3>
          <p>{error}</p>
          <button onClick={loadDetail} className="wander-btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="wander-pl-detail-container">
        <div className="wander-pl-detail-header">
          <div>
            <span className="wander-breadcrumb">Listings / Cars / Profit and Loss / Detail</span>
            <h2>No encontrado</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <p>No se encontró el registro con ID {plId}</p>
          <button onClick={() => router.back()} className="wander-btn-primary">
            Volver
          </button>
        </div>
      </div>
    );
  }

  const net = parseFloat(data.income_minus_expenses);

  return (
    <div className="wander-pl-detail-container">
      {/* Cabecera */}
      <header className="wander-pl-detail-header">
        <div>
          <span className="wander-breadcrumb">Listings / Cars / Profit and Loss / Detail</span>
          <h2>Profit and Loss</h2>
          <p className="wander-pl-detail-subtitle">
            ID #{data.id} - {formatDate(data.date)} • {data.car.brand} {data.car.model} {data.car.year}
          </p>
        </div>
        <div className="wander-pl-detail-actions">
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="wander-btn-delete"
            style={{
              padding: '8px 16px',
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            🗑️ Delete PL
          </button>
          <button 
            onClick={() => router.back()}
            className="wander-btn-secondary"
          >
            ← Volver
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

      {/* Resumen del auto */}
      <div className="wander-pl-detail-car-card">
        <div className="wander-pl-detail-car-image">
          {data.car.principal_image ? (
            <img src={data.car.principal_image} alt={`${data.car.brand} ${data.car.model}`} />
          ) : (
            <div className="wander-pl-detail-car-placeholder">🚗</div>
          )}
        </div>
        <div className="wander-pl-detail-car-info">
          <h3 className="wander-pl-detail-car-name">
            {data.car.brand} {data.car.model}
          </h3>
          <div className="wander-pl-detail-car-details">
            <span>Year: {data.car.year}</span>
            <span>Plate: {data.car.plate}</span>
            <span>Owner: {data.car.owner}</span>
            <span>Status: <span className={`wander-status-badge ${data.car.status}`}>{data.car.status}</span></span>
          </div>
        </div>
      </div>

      {/* Grid de tarjetas de resumen */}
      <div className="wander-pl-detail-summary-grid">
        <div className="wander-pl-detail-summary-card income">
          <div className="wander-pl-detail-summary-label">Total Income</div>
          <div className="wander-pl-detail-summary-value">{formatCurrency(data.total_income)}</div>
          <div className="wander-pl-detail-summary-sub">
            Rent: {formatCurrency(data.reservation_income)} • Additional: {formatCurrency(data.additional_income)}
          </div>
        </div>
        <div className="wander-pl-detail-summary-card expense">
          <div className="wander-pl-detail-summary-label">Total Expenses</div>
          <div className="wander-pl-detail-summary-value">{formatCurrency(data.total_expenses)}</div>
          <div className="wander-pl-detail-summary-sub">
            Rent: {formatCurrency(data.rent)} • Invoices: {formatCurrency(data.invoices || '0')}
          </div>
        </div>
        <div className="wander-pl-detail-summary-card profit">
          <div className="wander-pl-detail-summary-label">Net Profit</div>
          <div className={`wander-pl-detail-summary-value ${net >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(data.income_minus_expenses)}
          </div>
          <div className="wander-pl-detail-summary-sub">
            Income - Expenses = {formatCurrency(data.income_minus_expenses)}
          </div>
        </div>
        <div className="wander-pl-detail-summary-card fee">
          <div className="wander-pl-detail-summary-label">Management Fee</div>
          <div className="wander-pl-detail-summary-value">{formatCurrency(data.fee_cupon_tours)}</div>
          <div className="wander-pl-detail-summary-sub">
            Partner Net: {formatCurrency(data.partner_net)}
          </div>
        </div>
      </div>

      {/* Detalle de Ingresos y Egresos */}
      <div className="wander-pl-detail-sections">
        <div className="wander-pl-detail-section">
          <h3 className="wander-pl-detail-section-title">📈 Incomes</h3>
          <div className="wander-pl-detail-section-grid">
            <div className="wander-pl-detail-section-item">
              <span className="wander-pl-detail-section-label">Rent</span>
              <span className="wander-pl-detail-section-value income">{formatCurrency(data.reservation_income)}</span>
            </div>
            <div className="wander-pl-detail-section-item">
              <span className="wander-pl-detail-section-label">Additional Income</span>
              <span className="wander-pl-detail-section-value income">{formatCurrency(data.additional_income)}</span>
            </div>
            <div className="wander-pl-detail-section-item">
              <span className="wander-pl-detail-section-label">Refunds</span>
              <span className="wander-pl-detail-section-value">{formatCurrency(data.refunds)}</span>
            </div>
            <div className="wander-pl-detail-section-item total">
              <span className="wander-pl-detail-section-label">TOTAL INCOMES</span>
              <span className="wander-pl-detail-section-value income">{formatCurrency(data.total_income)}</span>
            </div>
          </div>
        </div>

        <div className="wander-pl-detail-section">
          <h3 className="wander-pl-detail-section-title">📊 Expenses</h3>
          <div className="wander-pl-detail-section-grid">
            <div className="wander-pl-detail-section-item">
              <span className="wander-pl-detail-section-label">Rent</span>
              <span className="wander-pl-detail-section-value expense">{formatCurrency(data.rent)}</span>
            </div>
            <div className="wander-pl-detail-section-item">
              <span className="wander-pl-detail-section-label">GT Management</span>
              <span className="wander-pl-detail-section-value expense">{formatCurrency(data.fee_cupon_tours)}</span>
            </div>
            <div className="wander-pl-detail-section-item">
              <span className="wander-pl-detail-section-label">Invoices</span>
              <span className="wander-pl-detail-section-value expense">{formatCurrency(data.invoices || '0')}</span>
            </div>
            <div className="wander-pl-detail-section-item total">
              <span className="wander-pl-detail-section-label">TOTAL EXPENSES</span>
              <span className="wander-pl-detail-section-value expense">{formatCurrency(data.total_expenses)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Total Net */}
      <div className="wander-pl-detail-total-card">
        <div className="wander-pl-detail-total-row">
          <span className="wander-pl-detail-total-label">Net</span>
          <span className="wander-pl-detail-total-value">{formatCurrency(data.income_minus_expenses)}</span>
        </div>
        <div className="wander-pl-detail-total-row">
          <span className="wander-pl-detail-total-label">Management Fee</span>
          <span className="wander-pl-detail-total-value">{formatCurrency(data.fee_cupon_tours)}</span>
        </div>
        <div className="wander-pl-detail-total-row">
          <span className="wander-pl-detail-total-label">Refunds</span>
          <span className="wander-pl-detail-total-value">{formatCurrency(data.refunds)}</span>
        </div>
        <div className="wander-pl-detail-total-row highlight">
          <span className="wander-pl-detail-total-label">Partner Net</span>
          <span className="wander-pl-detail-total-value">{formatCurrency(data.partner_net)}</span>
        </div>
        <div className="wander-pl-detail-total-row highlight">
          <span className="wander-pl-detail-total-label">Partner Deposit</span>
          <span className="wander-pl-detail-total-value">{formatCurrency(data.deposit)}</span>
        </div>
      </div>

      {/* Tabla de facturas */}
      <div className="wander-pl-detail-invoices">
        <h3 className="wander-pl-detail-section-title">📄 Invoices</h3>
        {data.list_invoices && data.list_invoices.length > 0 ? (
          <div className="wander-pl-detail-invoices-table-container">
            <table className="wander-pl-detail-invoices-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>ID</th>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Partner Refund</th>
                  <th style={{ width: '80px' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {data.list_invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td><span className="wander-pl-detail-invoice-id">#{invoice.id}</span></td>
                    <td>{new Date(invoice.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</td>
                    <td>{invoice.title}</td>
                    <td>{getTypeBadge(invoice.invoice_type)}</td>
                    <td className={invoice.invoice_type === 'incomes' ? 'income' : 'expense'}>
                      {formatCurrency(invoice.price)}
                    </td>
                    <td>{invoice.partner_refund ? 'Yes' : 'No'}</td>
                    <td>
                      <button
                        onClick={() => handleViewInvoice(invoice.id)}
                        className="wander-action-btn wander-action-view"
                        title="Ver factura"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="wander-pl-detail-empty">
            <span className="wander-empty-icon">📄</span>
            <p>No hay facturas asociadas</p>
          </div>
        )}
      </div>

      {/* Modal de confirmación para eliminar */}
      <DeleteProfitAndLossModal
        isOpen={showDeleteModal}
        plId={data.id}
        plInfo={`${data.car.brand} ${data.car.model} - ${formatDate(data.date)}`}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeletePL}
        isLoading={isDeleting}
      />
    </div>
  );
}