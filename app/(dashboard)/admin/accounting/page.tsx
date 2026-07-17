// app/(dashboard)/admin/accounting/page.tsx

'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import {
  getTransacciones,
  getResumen,
  deleteTransaccion,
  Transaccion,
  ResumenData,
  TransaccionesFilters,
} from '@/app/lib/api/transaccionAdmin';
import {
  FiPlus,
  FiRefreshCw,
  FiEdit2,
  FiTrash2,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiFilter,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiInbox,
} from 'react-icons/fi';
import { ConfirmDialog } from '@/app/(dashboard)/admin/components/ConfirmDialog';
import Toast from '@/app/(dashboard)/admin/components/Toast';
import ModalSaveTransaction from '@/app/(dashboard)/admin/components/ModalSaveTransaction';
import './accounting.css';

const SERVICE_LABELS: Record<string, string> = {
  transporte_privado: 'Transport',
  real_estate: 'Real Estate',
  experiences: 'Experiences',
  servicios_generales: 'General',
  wellness: 'Wellness',
  health: 'Health',
  events: 'Events',
};

const SERVICE_FILTER_OPTIONS = [
  { value: '', label: 'All Services' },
  ...Object.entries(SERVICE_LABELS).map(([value, label]) => ({ value, label })),
];

const LoadingSkeleton = () => (
  <div className="wander-accounting-container">
    <div className="wander-accounting-loading">
      <div className="wander-loading-spinner"></div>
      <p>Loading accounting data...</p>
    </div>
  </div>
);

function AccountingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isChecking, isAuthenticated, checkAuth } = useAuth();

  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [resumen, setResumen] = useState<ResumenData>({ ingresos: 0, gastos: 0, balance: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters — servicioFilter defaults to whatever ?servicio_tipo= was passed in
  // (e.g. arriving from a service's "View Transactions" link).
  const [tipoFilter, setTipoFilter] = useState('');
  const [servicioFilter, setServicioFilter] = useState(() => searchParams.get('servicio_tipo') || '');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // Pagination (frontend, same as the rest of the admin — the backend returns the full filtered set)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Save modal (create/edit)
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaccion | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    id: number | null;
    isDeleting: boolean;
  }>({ isOpen: false, id: null, isDeleting: false });

  const buildFilters = useCallback((): TransaccionesFilters => {
    const filters: TransaccionesFilters = {};
    if (tipoFilter) filters.tipo = tipoFilter as 'ingreso' | 'gasto';
    if (servicioFilter) filters.servicio_tipo = servicioFilter;
    if (categoriaFilter.trim()) filters.categoria = categoriaFilter.trim();
    if (fechaDesde) filters.fecha_desde = fechaDesde;
    if (fechaHasta) filters.fecha_hasta = fechaHasta;
    return filters;
  }, [tipoFilter, servicioFilter, categoriaFilter, fechaDesde, fechaHasta]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const filters = buildFilters();
      const [items, summary] = await Promise.all([
        getTransacciones(filters),
        getResumen(filters),
      ]);
      setTransacciones(items);
      setResumen(summary);
    } catch (err) {
      console.error('❌ Error cargando contabilidad:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error loading accounting data');
    } finally {
      setIsLoading(false);
    }
  }, [buildFilters]);

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
  }, [isChecking, checkAuth, router]);

  // Recargar cuando cambian los filtros (server-side)
  useEffect(() => {
    if (isAuthVerified && isAuthenticated) {
      // Reloads the list and summary when the active filters change.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentPage(1);
      loadData();
    }
  }, [isAuthVerified, isAuthenticated, loadData]);

  const handleRefresh = () => {
    loadData();
  };

  const clearFilters = () => {
    setTipoFilter('');
    setServicioFilter('');
    setCategoriaFilter('');
    setFechaDesde('');
    setFechaHasta('');
  };

  const hasActiveFilters = !!(tipoFilter || servicioFilter || categoriaFilter || fechaDesde || fechaHasta);

  const openCreateModal = () => {
    setEditingTransaction(null);
    setIsSaveModalOpen(true);
  };

  const openEditModal = (transaction: Transaccion) => {
    setEditingTransaction(transaction);
    setIsSaveModalOpen(true);
  };

  const closeSaveModal = () => {
    setIsSaveModalOpen(false);
    setEditingTransaction(null);
  };

  const handleSaveSuccess = () => {
    setToast({
      message: editingTransaction ? 'Transaction updated successfully!' : 'Transaction created successfully!',
      type: 'success',
    });
    loadData();
  };

  const handleDeleteClick = (id: number) => {
    setConfirmDialog({ isOpen: true, id, isDeleting: false });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDialog.id) return;

    setConfirmDialog(prev => ({ ...prev, isDeleting: true }));

    try {
      await deleteTransaccion(confirmDialog.id);
      setToast({ message: 'Transaction deleted successfully!', type: 'success' });
      setConfirmDialog({ isOpen: false, id: null, isDeleting: false });
      loadData();
    } catch (err) {
      console.error('❌ Error eliminando transacción:', err);
      setToast({
        message: (err instanceof Error ? err.message : undefined) || 'Error deleting transaction',
        type: 'error',
      });
      setConfirmDialog(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleCloseConfirmDialog = () => {
    if (confirmDialog.isDeleting) return;
    setConfirmDialog({ isOpen: false, id: null, isDeleting: false });
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
    if (!dateStr) return '—';
    try {
      const date = new Date(`${dateStr.slice(0, 10)}T00:00:00`);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getServiceLabel = (tipo: string | null) => {
    if (!tipo) return null;
    return SERVICE_LABELS[tipo] || tipo;
  };

  // Pagination
  const totalPages = Math.ceil(transacciones.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const currentItems = transacciones.slice(indexOfLastItem - itemsPerPage, indexOfLastItem);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isChecking || !isAuthVerified) {
    return <LoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="wander-accounting-container">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isSubmitting={confirmDialog.isDeleting}
      />

      <ModalSaveTransaction
        isOpen={isSaveModalOpen}
        onClose={closeSaveModal}
        onSuccess={handleSaveSuccess}
        item={editingTransaction}
      />

      {/* Header */}
      <header className="wander-accounting-header">
        <div>
          <span className="wander-breadcrumb">ACCOUNTING</span>
          <h2>Income &amp; Expenses</h2>
          <p className="wander-accounting-subtitle">
            {transacciones.length} {transacciones.length === 1 ? 'transaction' : 'transactions'}{hasActiveFilters ? ' matching filters' : ' registered'}
          </p>
        </div>
        <div className="wander-accounting-actions">
          <button onClick={openCreateModal} className="wander-btn-primary">
            <FiPlus size={16} />
            New Transaction
          </button>
          <button onClick={handleRefresh} className="wander-btn-secondary">
            <FiRefreshCw size={16} />
            Refresh
          </button>
        </div>
      </header>

      {/* Summary cards */}
      <div className="wander-accounting-summary">
        <div className="wander-summary-card income">
          <div className="wander-summary-icon">
            <FiTrendingUp size={22} />
          </div>
          <div className="wander-summary-info">
            <span className="wander-summary-label">Income</span>
            <span className="wander-summary-value">{formatCurrency(resumen.ingresos)}</span>
          </div>
        </div>

        <div className="wander-summary-card expense">
          <div className="wander-summary-icon">
            <FiTrendingDown size={22} />
          </div>
          <div className="wander-summary-info">
            <span className="wander-summary-label">Expenses</span>
            <span className="wander-summary-value">{formatCurrency(resumen.gastos)}</span>
          </div>
        </div>

        <div className={`wander-summary-card balance ${resumen.balance < 0 ? 'negative' : ''}`}>
          <div className="wander-summary-icon">
            <FiDollarSign size={22} />
          </div>
          <div className="wander-summary-info">
            <span className="wander-summary-label">Balance</span>
            <span className="wander-summary-value">{formatCurrency(resumen.balance)}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="wander-accounting-filters">
        <div className="wander-filter-wrapper">
          <FiFilter size={14} className="wander-filter-icon" />
          <select value={tipoFilter} onChange={(e) => setTipoFilter(e.target.value)} className="wander-filter-select">
            <option value="">All Types</option>
            <option value="ingreso">Income</option>
            <option value="gasto">Expense</option>
          </select>
        </div>

        <div className="wander-filter-wrapper">
          <select value={servicioFilter} onChange={(e) => setServicioFilter(e.target.value)} className="wander-filter-select">
            {SERVICE_FILTER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="wander-filter-wrapper">
          <input
            type="text"
            value={categoriaFilter}
            onChange={(e) => setCategoriaFilter(e.target.value)}
            placeholder="Category..."
            className="wander-filter-select"
            style={{ minWidth: '140px' }}
          />
        </div>

        <div className="wander-date-filter-wrapper">
          <span className="wander-date-filter-label">From</span>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            max={fechaHasta || undefined}
            className="wander-filter-date"
          />
        </div>

        <div className="wander-date-filter-wrapper">
          <span className="wander-date-filter-label">To</span>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            min={fechaDesde || undefined}
            className="wander-filter-date"
          />
        </div>

        {hasActiveFilters && (
          <button onClick={clearFilters} className="wander-filter-clear-all">
            <FiX size={14} />
            Clear Filters
          </button>
        )}
      </div>

      {/* Content */}
      {error ? (
        <div className="wander-accounting-error">
          <h3>⚠️ Error loading accounting data</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="wander-btn-primary">
            <FiRefreshCw size={16} />
            Retry
          </button>
        </div>
      ) : isLoading ? (
        <div className="wander-accounting-loading">
          <div className="wander-loading-spinner"></div>
          <p>Loading transactions...</p>
        </div>
      ) : currentItems.length === 0 ? (
        <div className="wander-accounting-empty">
          <span className="wander-empty-icon">
            <FiInbox size={48} />
          </span>
          <p>No transactions found</p>
          <span className="wander-empty-desc">
            {hasActiveFilters ? 'Try adjusting your filters' : 'Create your first transaction to get started'}
          </span>
        </div>
      ) : (
        <>
          <div className="wander-accounting-table-wrapper">
            <table className="wander-accounting-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Service</th>
                  <th>Description</th>
                  <th className="align-right">Amount</th>
                  <th className="align-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((transaction) => {
                  const serviceLabel = getServiceLabel(transaction.servicio_tipo);
                  return (
                    <tr key={transaction.id}>
                      <td>{formatDate(transaction.fecha)}</td>
                      <td>
                        <span className={`wander-tipo-badge ${transaction.tipo}`}>
                          {transaction.tipo === 'ingreso' ? 'Income' : 'Expense'}
                        </span>
                      </td>
                      <td>{transaction.categoria || '—'}</td>
                      <td>
                        {serviceLabel ? (
                          <span className="wander-service-badge">
                            {serviceLabel}{transaction.servicio_id ? ` #${transaction.servicio_id}` : ''}
                          </span>
                        ) : '—'}
                        {transaction.reserva_id && (
                          <span className="wander-service-badge reserva">Res. #{transaction.reserva_id}</span>
                        )}
                      </td>
                      <td className="wander-accounting-description">{transaction.descripcion || '—'}</td>
                      <td className={`align-right wander-monto ${transaction.tipo}`}>
                        {transaction.tipo === 'gasto' ? '-' : '+'}{formatCurrency(parseFloat(transaction.monto) || 0)}
                      </td>
                      <td className="align-right">
                        <div className="wander-accounting-row-actions">
                          <button onClick={() => openEditModal(transaction)} className="wander-row-action-btn edit" title="Edit">
                            <FiEdit2 size={14} />
                          </button>
                          <button onClick={() => handleDeleteClick(transaction.id)} className="wander-row-action-btn delete" title="Delete">
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="wander-accounting-pagination">
              <div className="wander-pagination-info">
                Showing {indexOfLastItem - itemsPerPage + 1} - {Math.min(indexOfLastItem, transacciones.length)} of {transacciones.length} transactions
              </div>
              <div className="wander-pagination-controls">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="wander-pagination-btn"
                >
                  <FiChevronLeft size={14} />
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
                  <FiChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AccountingPage() {
  return (
    <Suspense fallback={null}>
      <AccountingContent />
    </Suspense>
  );
}
