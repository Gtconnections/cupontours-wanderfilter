// app/(dashboard)/admin/suscripciones/page.tsx

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getSuscripciones, Suscripcion, createSuscripcion, deleteSuscripcion } from '@/app/lib/api/suscripcionAdmin';
import { getMembresiasAdmin, Membresia } from '@/app/lib/api/membresiaAdmin';
import {
  FiPlus,
  FiRefreshCw,
  FiEye,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiAward,
  FiX,
  FiDollarSign,
  FiCheckCircle
} from 'react-icons/fi';
import { Modal } from '@/app/(dashboard)/admin/components/Modal';
import { CreateSuscripcionForm } from '@/app/(dashboard)/admin/components/CreateSuscripcionForm';
import { ConfirmDialog } from '@/app/(dashboard)/admin/components/ConfirmDialog';
import Toast from '@/app/(dashboard)/admin/components/Toast';
import './suscripciones.css';

const LoadingSkeleton = () => (
  <div className="wander-wellness-container">
    <div className="wander-wellness-header">
      <div>
        <span className="wander-breadcrumb">Services / Subscriptions</span>
        <h2>Loading subscriptions...</h2>
      </div>
    </div>
    <div className="wander-wellness-loading">
      <div className="wander-loading-spinner"></div>
      <p>Loading subscriptions...</p>
    </div>
  </div>
);

export default function SuscripcionesListPage() {
  const router = useRouter();
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();

  const [subscriptions, setSubscriptions] = useState<Suscripcion[]>([]);
  const [plans, setPlans] = useState<Membresia[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtros (servidor)
  const [filterMembresia, setFilterMembresia] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterFechaDesde, setFilterFechaDesde] = useState('');
  const [filterFechaHasta, setFilterFechaHasta] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [totalPages, setTotalPages] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    id: number | null;
    name: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    id: null,
    name: '',
    isDeleting: false
  });

  const loadPlans = useCallback(async () => {
    try {
      const data = await getMembresiasAdmin();
      setPlans(data.results || []);
    } catch (err) {
      console.error('❌ Error cargando membresías:', err);
    }
  }, []);

  const loadSubscriptions = useCallback(async () => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getSuscripciones({
        membresia_id: filterMembresia ? parseInt(filterMembresia) : undefined,
        estado: filterEstado || undefined,
        fecha_desde: filterFechaDesde || undefined,
        fecha_hasta: filterFechaHasta || undefined,
      });
      setSubscriptions(data.results || []);
      setTotalCount(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / itemsPerPage));
      setCurrentPage(1);
    } catch (err) {
      console.error('❌ Error cargando suscripciones:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error loading subscriptions');
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated, router, itemsPerPage, filterMembresia, filterEstado, filterFechaDesde, filterFechaHasta]);

  useEffect(() => {
    if (isChecking) return;

    const hasAuth = checkAuth();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAuthVerified(true);

    if (!hasAuth) {
      router.push('/login');
      return;
    }

    loadPlans();
    loadSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isChecking, router, checkAuth]);

  useEffect(() => {
    if (!isAuthVerified || isChecking) return;
    loadSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMembresia, filterEstado, filterFechaDesde, filterFechaHasta]);

  const handleRefresh = async () => {
    await loadSubscriptions();
  };

  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return subscriptions.slice(indexOfFirstItem, indexOfLastItem);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const planName = (membresiaId: number) => plans.find(p => p.id === membresiaId)?.name || `Plan #${membresiaId}`;

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    if (isNaN(num) || num === 0) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(num);
  };

  const formatCurrencyNumber = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(amount);
  };

  // Suma los montos acordados de las suscripciones que ya pasaron los filtros
  // activos (no solo la página visible), para reflejar lo que el admin está viendo.
  const summary = useMemo(() => {
    const totalAmount = subscriptions.reduce((sum, s) => sum + (parseFloat(s.monto_acordado) || 0), 0);
    const activeSubs = subscriptions.filter(s => s.estado === 'activa');
    const activeAmount = activeSubs.reduce((sum, s) => sum + (parseFloat(s.monto_acordado) || 0), 0);
    return {
      count: subscriptions.length,
      totalAmount,
      activeCount: activeSubs.length,
      activeAmount,
    };
  }, [subscriptions]);

  const getStatusBadge = (estado: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      'activa': { label: 'Active', color: '#16a34a' },
      'vencida': { label: 'Expired', color: '#f59e0b' },
      'cancelada': { label: 'Cancelled', color: '#dc2626' },
    };
    const s = statusMap[estado?.toLowerCase()] || { label: estado || 'N/A', color: '#6b7280' };
    return (
      <span style={{
        display: 'inline-block', padding: '2px 10px', borderRadius: '12px', fontSize: '10px',
        fontWeight: 600, letterSpacing: '0.5px', backgroundColor: `${s.color}15`, color: s.color,
      }}>
        {s.label}
      </span>
    );
  };

  const handleCreateSubscription = async (data: {
    membresia_id: number; cliente_nombre: string; cliente_email: string; cliente_telefono: string;
    monto_acordado: number; fecha_inicio: string; fecha_fin?: string; notas?: string;
  }) => {
    setIsSubmitting(true);
    try {
      await createSuscripcion(data);
      setToast({ message: `Subscription for "${data.cliente_nombre}" created — credential emailed!`, type: 'success' });
      setIsModalOpen(false);
      await loadSubscriptions();
    } catch (err) {
      console.error('❌ Error creando suscripción:', err);
      setToast({ message: (err instanceof Error ? err.message : undefined) || 'Error creating subscription', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id: number, name: string) => {
    setConfirmDialog({ isOpen: true, id, name, isDeleting: false });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDialog.id) return;

    setConfirmDialog(prev => ({ ...prev, isDeleting: true }));

    try {
      await deleteSuscripcion(confirmDialog.id);
      setToast({ message: `Subscription for "${confirmDialog.name}" deleted successfully!`, type: 'success' });
      setConfirmDialog({ isOpen: false, id: null, name: '', isDeleting: false });
      await loadSubscriptions();
    } catch (err) {
      console.error('❌ Error eliminando suscripción:', err);
      setToast({ message: (err instanceof Error ? err.message : undefined) || 'Error deleting subscription', type: 'error' });
      setConfirmDialog(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleCloseConfirmDialog = () => {
    if (confirmDialog.isDeleting) return;
    setConfirmDialog({ isOpen: false, id: null, name: '', isDeleting: false });
  };

  const handleCloseToast = () => setToast(null);

  const clearFilters = () => {
    setFilterMembresia('');
    setFilterEstado('');
    setFilterFechaDesde('');
    setFilterFechaHasta('');
  };

  if (isChecking || !isAuthVerified) {
    return <LoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="wander-wellness-container">
        <div className="wander-wellness-header">
          <div>
            <span className="wander-breadcrumb">Services / Subscriptions</span>
            <h2>Error</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <h3>⚠️ Error loading subscriptions</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="wander-btn-primary">
            <FiRefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentItems = getCurrentItems();

  return (
    <div className="wander-wellness-container">
      {toast && <Toast message={toast.message} type={toast.type} onClose={handleCloseToast} />}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Subscription"
        message={`Are you sure you want to delete the subscription for "${confirmDialog.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isSubmitting={confirmDialog.isDeleting}
      />

      <header className="wander-wellness-header">
        <div>
          <span className="wander-breadcrumb">SERVICES / SUBSCRIPTIONS</span>
          <h2>Subscriptions</h2>
          <p className="wander-wellness-subtitle">
            {totalCount} {totalCount === 1 ? 'subscription' : 'subscriptions'} found
          </p>
        </div>
        <div className="wander-wellness-actions">
          <button onClick={handleRefresh} className="wander-btn-secondary">
            <FiRefreshCw size={16} />
            Refresh
          </button>
          <Link href="/admin/membresias" className="wander-btn-secondary">
            <FiAward size={16} />
            Plans
          </Link>
          <button className="wander-btn-primary" onClick={() => setIsModalOpen(true)}>
            <FiPlus size={16} />
            Create Subscription
          </button>
        </div>
      </header>

      {/* Accounting summary — sums the currently filtered subscriptions */}
      <section className="wander-metrics-grid">
        <div className="wander-metric-card">
          <div className="wander-metric-info">
            <span className="wander-metric-label">Subscriptions</span>
            <span className="wander-metric-value">{summary.count}</span>
          </div>
          <div className="wander-metric-icon-box">
            <FiUsers size={18} />
          </div>
        </div>
        <div className="wander-metric-card">
          <div className="wander-metric-info">
            <span className="wander-metric-label">Total Agreed Amount</span>
            <span className="wander-metric-value">{formatCurrencyNumber(summary.totalAmount)}</span>
          </div>
          <div className="wander-metric-icon-box">
            <FiDollarSign size={18} />
          </div>
        </div>
        <div className="wander-metric-card">
          <div className="wander-metric-info">
            <span className="wander-metric-label">Active ({summary.activeCount})</span>
            <span className="wander-metric-value">{formatCurrencyNumber(summary.activeAmount)}</span>
          </div>
          <div className="wander-metric-icon-box">
            <FiCheckCircle size={18} />
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="wander-subs-filters">
        <div className="wander-filter-wrapper">
          <select value={filterMembresia} onChange={(e) => setFilterMembresia(e.target.value)} className="wander-form-select">
            <option value="">All plans</option>
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.name}</option>
            ))}
          </select>
          {filterMembresia && (
            <button className="wander-filter-clear" onClick={() => setFilterMembresia('')}><FiX size={14} /></button>
          )}
        </div>

        <div className="wander-filter-wrapper">
          <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} className="wander-form-select">
            <option value="">All statuses</option>
            <option value="activa">Active</option>
            <option value="vencida">Expired</option>
            <option value="cancelada">Cancelled</option>
          </select>
          {filterEstado && (
            <button className="wander-filter-clear" onClick={() => setFilterEstado('')}><FiX size={14} /></button>
          )}
        </div>

        <div className="wander-date-filter-wrapper">
          <label>From</label>
          <input type="date" value={filterFechaDesde} onChange={(e) => setFilterFechaDesde(e.target.value)} className="wander-form-input" />
          {filterFechaDesde && (
            <button className="wander-filter-clear" onClick={() => setFilterFechaDesde('')}><FiX size={14} /></button>
          )}
        </div>

        <div className="wander-date-filter-wrapper">
          <label>To</label>
          <input type="date" value={filterFechaHasta} onChange={(e) => setFilterFechaHasta(e.target.value)} className="wander-form-input" />
          {filterFechaHasta && (
            <button className="wander-filter-clear" onClick={() => setFilterFechaHasta('')}><FiX size={14} /></button>
          )}
        </div>

        {(filterMembresia || filterEstado || filterFechaDesde || filterFechaHasta) && (
          <button className="wander-btn-secondary" onClick={clearFilters}>Clear all</button>
        )}
      </div>

      {isLoading ? (
        <div className="wander-wellness-loading">
          <div className="wander-loading-spinner"></div>
          <p>Loading subscriptions...</p>
        </div>
      ) : (
        <>
          <div className="wander-wellness-grid">
            {currentItems.length === 0 ? (
              <div className="wander-wellness-empty">
                <span className="wander-empty-icon">
                  <FiUsers size={48} />
                </span>
                <p>No subscriptions found</p>
                <span className="wander-empty-desc">No subscriptions match the current filters</span>
              </div>
            ) : (
              currentItems.map((sub) => (
                <div key={sub.id} className="wander-wellness-card wander-subs-card">
                  <div className="wander-wellness-info">
                    <div className="wander-subs-card-top">
                      <h3 className="wander-wellness-title">{sub.cliente_nombre}</h3>
                      {getStatusBadge(sub.estado)}
                    </div>
                    <p className="wander-wellness-meta">{planName(sub.membresia_id)}</p>
                    <p className="wander-wellness-meta">{sub.cliente_email}</p>

                    <div className="wander-wellness-details">
                      <span>{sub.fecha_inicio} → {sub.fecha_fin || 'No expiration'}</span>
                    </div>

                    <div className="wander-wellness-price">
                      {formatCurrency(sub.monto_acordado)}
                    </div>
                  </div>

                  <div className="wander-wellness-actions">
                    <Link href={`/admin/suscripciones/${sub.id}`} className="wander-wellness-action-btn details">
                      <FiEye size={14} />
                      Details
                    </Link>
                    <button onClick={() => handleDeleteClick(sub.id, sub.cliente_nombre)} className="wander-wellness-action-btn delete">
                      <FiTrash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="wander-wellness-pagination">
              <div className="wander-pagination-info">
                Showing {((currentPage || 1) - 1) * itemsPerPage + 1} -
                {Math.min((currentPage || 1) * itemsPerPage, totalCount)} of {totalCount} subscriptions
              </div>

              <div className="wander-pagination-controls">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="wander-pagination-btn">
                  <FiChevronLeft size={14} />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const current = currentPage || 1;
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (current <= 3) pageNum = i + 1;
                  else if (current >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = current - 2 + i;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`wander-pagination-btn ${pageNum === current ? 'active' : ''}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="wander-pagination-btn">
                  <FiChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Subscription"
        maxWidth="640px"
      >
        <CreateSuscripcionForm
          onSubmit={handleCreateSubscription}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
}
