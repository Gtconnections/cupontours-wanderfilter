'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getCarInvoices, Invoice } from '@/app/lib/api/carsAdmin';
import './invoices.css';

const LoadingSkeleton = () => (
  <div className="wander-invoices-container">
    <div className="wander-invoices-header">
      <div>
        <span className="wander-breadcrumb">Listings / Cars / Invoices</span>
        <h2>Cargando facturas...</h2>
      </div>
    </div>
    <div className="wander-invoices-loading">
      <div className="wander-loading-spinner"></div>
      <p>Cargando lista de facturas...</p>
    </div>
  </div>
);

export default function CarInvoicesPage() {
  const router = useRouter();
  const params = useParams();
  const carId = parseInt(params.id as string);
  
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [carInfo, setCarInfo] = useState<{ brand: string; model: string; plate: string } | null>(null);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  // Filtros de fecha
  const [initialDate, setInitialDate] = useState('');
  const [finalDate, setFinalDate] = useState('');

  const loadInvoices = useCallback(async (page: number = 1) => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getCarInvoices(
        carId,
        page,
        initialDate || undefined,
        finalDate || undefined
      );
      
      setInvoices(data.results || []);
      setTotalCount(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / pageSize));
      
      if (data.results && data.results.length > 0) {
        const first = data.results[0];
        setCarInfo({ 
          brand: first.brand, 
          model: first.model,
          plate: first.plate
        });
      }
      
      console.log('📊 Total de facturas:', data.count);
    } catch (err) {
      console.error('❌ Error cargando facturas:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al cargar las facturas');
    } finally {
      setIsLoading(false);
    }
  }, [carId, token, isAuthenticated, router, initialDate, finalDate, pageSize]);

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
      loadInvoices(currentPage);
    } else {
      setError('ID de auto inválido');
      setIsLoading(false);
    }
  }, [carId, isAuthenticated, isChecking, loadInvoices, router, checkAuth, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    loadInvoices(1);
  };

  const handleClearFilters = () => {
    setInitialDate('');
    setFinalDate('');
    setCurrentPage(1);
    setTimeout(() => loadInvoices(1), 100);
  };

  const handleRefresh = async () => {
    await loadInvoices(currentPage);
  };

  // 🔥 REDIRIGIR AL DETALLE DE LA FACTURA
  const handleViewInvoiceDetail = (invoiceId: number) => {
    router.push(`/admin/cars/invoice-detail/${invoiceId}`);
  };

  // 🔥 REDIRIGIR A CREAR FACTURA CON EL CAR ID
  const handleCreateInvoice = () => {
    router.push(`/admin/cars/invoices/create?car_id=${carId}`);
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

  const getTypeBadge = (type: string) => {
    const isIncome = type === 'incomes';
    return (
      <span style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'capitalize',
        backgroundColor: isIncome ? '#dcfce7' : '#fee2e2',
        color: isIncome ? '#166534' : '#991b1b',
      }}>
        {isIncome ? 'Income' : 'Expense'}
      </span>
    );
  };

  const getPartnerRefundBadge = (refund: boolean) => {
    return (
      <span style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: 600,
        backgroundColor: refund ? '#dbeafe' : '#f3f4f6',
        color: refund ? '#1e40af' : '#6b7280',
      }}>
        {refund ? 'Yes' : 'No'}
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
      <div className="wander-invoices-container">
        <div className="wander-invoices-header">
          <div>
            <span className="wander-breadcrumb">Listings / Cars / Invoices</span>
            <h2>Error</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <h3>⚠️ Error al cargar facturas</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="wander-btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wander-invoices-container">
      {/* Cabecera */}
      <header className="wander-invoices-header">
        <div>
          <span className="wander-breadcrumb">Listings / Cars / Invoices</span>
          <h2>
            {carInfo ? `${carInfo.brand} ${carInfo.model}` : `Auto #${carId}`}
          </h2>
          <p className="wander-invoices-subtitle">
            {totalCount} {totalCount === 1 ? 'factura' : 'facturas'} registradas
            {carInfo?.plate && ` • Placa: ${carInfo.plate}`}
          </p>
        </div>
        <div className="wander-invoices-actions">
          <button 
            onClick={handleCreateInvoice}
            className="wander-btn-primary"
          >
            ➕ Create Invoice
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

      {/* Filtros */}
      <div className="wander-invoices-filters">
        <div className="wander-filters-group">
          <div className="wander-filter-item">
            <label>Filter by date</label>
            <input
              type="date"
              value={initialDate}
              onChange={(e) => setInitialDate(e.target.value)}
              className="wander-filter-input"
            />
          </div>
          <div className="wander-filter-item">
            <label>Filter by date</label>
            <input
              type="date"
              value={finalDate}
              onChange={(e) => setFinalDate(e.target.value)}
              className="wander-filter-input"
            />
          </div>
          <div className="wander-filter-actions">
            <button
              onClick={handleApplyFilters}
              className="wander-btn-primary"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClearFilters}
              className="wander-btn-secondary"
            >
              Clear filters
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de facturas */}
      <div className="wander-invoices-table-container">
        <table className="wander-invoices-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>ID</th>
              <th>Title</th>
              <th>Date</th>
              <th>Type</th>
              <th>Price</th>
              <th>Listing</th>
              <th>Partner Refund</th>
              <th style={{ width: '100px' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="wander-empty-cell">
                  <div className="wander-empty-state">
                    <span className="wander-empty-icon">📄</span>
                    <p>No hay facturas para este auto</p>
                    <span className="wander-empty-desc">
                      {initialDate || finalDate ? 'Prueba ajustando los filtros de fecha' : 'Este auto aún no tiene facturas registradas'}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="wander-invoice-row">
                  <td>
                    <span className="wander-invoice-id">#{invoice.id}</span>
                  </td>
                  <td>
                    <span className="wander-invoice-title">{invoice.title}</span>
                    {invoice.comment && (
                      <span className="wander-invoice-comment"> - {invoice.comment}</span>
                    )}
                  </td>
                  <td>
                    <span className="wander-invoice-date">{formatDate(invoice.date)}</span>
                  </td>
                  <td>
                    {getTypeBadge(invoice.invoice_type)}
                  </td>
                  <td>
                    <span className={`wander-invoice-price ${invoice.invoice_type === 'incomes' ? 'income' : 'expense'}`}>
                      {formatCurrency(invoice.price)}
                    </span>
                  </td>
                  <td>
                    <span className="wander-invoice-listing">
                      {invoice.brand} {invoice.model}
                      <span className="wander-invoice-plate">({invoice.plate})</span>
                    </span>
                  </td>
                  <td>
                    {getPartnerRefundBadge(invoice.partner_refund)}
                  </td>
                  <td>
                    <button
                      onClick={() => handleViewInvoiceDetail(invoice.id)}
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
        <div className="wander-invoices-pagination">
          <div className="wander-pagination-info">
            Mostrando {((currentPage - 1) * pageSize) + 1} - 
            {Math.min(currentPage * pageSize, totalCount)} de {totalCount} facturas
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
    </div>
  );
}