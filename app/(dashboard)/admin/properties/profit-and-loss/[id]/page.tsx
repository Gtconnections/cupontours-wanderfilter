// app/admin/properties/profit-and-loss/[id]/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getProfitAndLossDetail, ProfitAndLossDetail, deleteProfitAndLoss } from '@/app/lib/api/propertiesAdmin';
import DeletePropertyModal from '../../../components/DeletePropertyModal';
import { generateProfitAndLossPDF } from './generatePDF';
import './detail.css';

const LoadingSkeleton = () => (
  <div className="wander-pl-detail-container">
    <div className="wander-pl-detail-loading">
      <div className="wander-loading-spinner"></div>
      <p>Cargando detalles...</p>
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Estado para el modal de eliminación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getProfitAndLossDetail(plId);
      console.log('📦 Detalle PL:', result);
      setData(result);
    } catch (err: any) {
      console.error('❌ Error cargando detalle:', err);
      setError(err.message || 'Error al cargar los detalles');
    } finally {
      setIsLoading(false);
    }
  }, [plId, token, isAuthenticated, router]);

  useEffect(() => {
    if (isChecking) return;
    
    const hasAuth = checkAuth();
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

  // Manejar eliminación
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProfitAndLoss(plId);
      
      setToastMessage('🗑️ P&L record deleted successfully!');
      
      setTimeout(() => {
        router.push('/admin/properties/profit-and-loss');
      }, 1500);
      
    } catch (err: any) {
      console.error('❌ Error al eliminar:', err);
      setError(err.message || 'Error al eliminar el registro');
      setIsDeleteModalOpen(false);
      setToastMessage(`❌ Error: ${err.message || 'Failed to delete'}`);
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  // 🔥 Generar PDF
  const handleGeneratePDF = () => {
    if (!data) {
      setToastMessage('❌ No data available to generate PDF');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    
    try {
      generateProfitAndLossPDF(data);
      setToastMessage('📄 PDF generated successfully!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      console.error('❌ Error al generar PDF:', err);
      setToastMessage(`❌ Error: ${err.message || 'Failed to generate PDF'}`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
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
      day: '2-digit',
      year: 'numeric',
    });
  };

  const formatShortDate = (dateStr: string) => {
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
      <div className="wander-pl-detail-container">
        <div className="wander-error-state">
          <h3>⚠️ Error al cargar los datos</h3>
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
        <div className="wander-error-state">
          <p>No se encontró el registro con ID {plId}</p>
          <button onClick={() => router.push('/admin/properties/profit-and-loss')} className="wander-btn-primary">
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  const isNegative = parseFloat(data.income_minus_expenses) < 0;

  return (
    <div className="wander-pl-detail-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="wander-toast">
          {toastMessage}
        </div>
      )}

      {/* Botones de navegación */}
      <div className="wander-pl-detail-actions">
        <div className="wander-pl-detail-actions-left">
          <Link href="/admin/properties/profit-and-loss" className="wander-pl-back-btn">
            ← Back to List
          </Link>
          <Link href={`/admin/properties/${data.listing.id}`} className="wander-pl-view-property-btn">
            View Property
          </Link>
        </div>
        <div className="wander-pl-detail-actions-right">
          <button 
            className="wander-pl-delete-btn"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            🗑️ Delete P&L
          </button>
          <button 
            className="wander-pl-pdf-btn"
            onClick={handleGeneratePDF}
          >
            📄 Generate PDF
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="wander-pl-detail-header">
        <h1>{data.listing.name}</h1>
        <p className="wander-pl-detail-subtitle">
          {formatDate(data.date)} • ID: #{data.id}
        </p>
      </div>

      {/* Resumen */}
      <div className="wander-pl-detail-summary">
        <div className="wander-pl-detail-summary-grid">
          {/* Incomes */}
          <div className="wander-pl-detail-summary-card">
            <h3>Incomes</h3>
            <div className="wander-pl-detail-summary-item">
              <span>Rent:</span>
              <span>{formatCurrency(data.rent)}</span>
            </div>
            <div className="wander-pl-detail-summary-item">
              <span>Additional Income:</span>
              <span>{formatCurrency(data.additional_income)}</span>
            </div>
            <div className="wander-pl-detail-summary-item total">
              <span>Total Incomes:</span>
              <span className="income">{formatCurrency(data.total_income)}</span>
            </div>
          </div>

          {/* Expenses */}
          <div className="wander-pl-detail-summary-card">
            <h3>Expenses</h3>
            <div className="wander-pl-detail-summary-item">
              <span>Rent:</span>
              <span>{formatCurrency(data.rent)}</span>
            </div>
            <div className="wander-pl-detail-summary-item">
              <span>Invoices:</span>
              <span>{formatCurrency(data.invoices)}</span>
            </div>
            <div className="wander-pl-detail-summary-item total">
              <span>Total Expenses:</span>
              <span className="expense">{formatCurrency(data.total_expenses)}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="wander-pl-detail-summary-card stats">
            <h3>Stats</h3>
            <div className="wander-pl-detail-summary-item">
              <span>Income - Expenses:</span>
              <span className={isNegative ? 'negative' : 'positive'}>
                {formatCurrency(data.income_minus_expenses)}
              </span>
            </div>
            <div className="wander-pl-detail-summary-item">
              <span>Partner Net:</span>
              <span className={parseFloat(data.partner_net) < 0 ? 'negative' : 'positive'}>
                {formatCurrency(data.partner_net)}
              </span>
            </div>
            <div className="wander-pl-detail-summary-item total">
              <span>Deposit:</span>
              <span className={parseFloat(data.deposit) < 0 ? 'negative' : 'positive'}>
                {formatCurrency(data.deposit)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reservations */}
      {data.list_reservations && data.list_reservations.length > 0 && (
        <div className="wander-pl-detail-section">
          <h2>Reservations</h2>
          <div className="wander-pl-detail-table-container">
            <table className="wander-pl-detail-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Guest</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Nights</th>
                  <th>Earnings</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.list_reservations.map((res) => (
                  <tr key={res.id}>
                    <td>{res.confirmation_code}</td>
                    <td>{res.guest_name}</td>
                    <td>{formatShortDate(res.start_date)}</td>
                    <td>{formatShortDate(res.end_date)}</td>
                    <td>{res.nights}</td>
                    <td className="income">{formatCurrency(res.earnings)}</td>
                    <td>
                      <span className="wander-pl-detail-status confirmed">
                        {res.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoices */}
      {data.list_invoices && data.list_invoices.length > 0 && (
        <div className="wander-pl-detail-section">
          <h2>Invoices</h2>
          <div className="wander-pl-detail-table-container">
            <table className="wander-pl-detail-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Partner Refund</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {data.list_invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>{invoice.id}</td>
                    <td>{formatShortDate(invoice.date)}</td>
                    <td className="wander-pl-detail-invoice-title">
                      {invoice.title}
                      {invoice.list_details && invoice.list_details.length > 0 && (
                        <div className="wander-pl-detail-invoice-items">
                          {invoice.list_details.map((detail, idx) => (
                            <span key={idx}>
                              {detail.item} (x{detail.quantity})
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`wander-pl-detail-type ${invoice.invoice_type}`}>
                        {invoice.invoice_type}
                      </span>
                    </td>
                    <td className={invoice.invoice_type === 'expenses' ? 'expense' : 'income'}>
                      {formatCurrency(invoice.price)}
                    </td>
                    <td>
                      <span className={invoice.partner_refund ? 'refund-yes' : 'refund-no'}>
                        {invoice.partner_refund ? 'Yes' : 'False'}
                      </span>
                    </td>
                    <td>
                      <Link 
                        href={`/admin/properties/invoice-detail/${invoice.id}`}
                        className="wander-pl-detail-show-details"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      <DeletePropertyModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        listingName={data.listing.name}
        isLoading={isDeleting}
      />
    </div>
  );
}