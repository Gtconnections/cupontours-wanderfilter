// app/(dashboard)/admin/membresias/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getMembresiasAdmin, Membresia, createMembresia, deleteMembresia } from '@/app/lib/api/membresiaAdmin';
import {
  FiPlus,
  FiRefreshCw,
  FiEye,
  FiTrash2,
  FiDollarSign,
  FiChevronLeft,
  FiChevronRight,
  FiStar,
  FiAward
} from 'react-icons/fi';
import { Modal } from '@/app/(dashboard)/admin/components/Modal';
import { CreateMembresiaForm } from '@/app/(dashboard)/admin/components/CreateMembresiaForm';
import { ConfirmDialog } from '@/app/(dashboard)/admin/components/ConfirmDialog';
import Toast from '@/app/(dashboard)/admin/components/Toast';
import './membresias.css';

const LoadingSkeleton = () => (
  <div className="wander-wellness-container">
    <div className="wander-wellness-header">
      <div>
        <span className="wander-breadcrumb">Services / Membership Plans</span>
        <h2>Loading membership plans...</h2>
      </div>
    </div>
    <div className="wander-wellness-loading">
      <div className="wander-loading-spinner"></div>
      <p>Loading membership plans...</p>
    </div>
  </div>
);

export default function MembresiasListPage() {
  const router = useRouter();
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();

  const [plans, setPlans] = useState<Membresia[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getMembresiasAdmin();
      const sorted = [...(data.results || [])].sort((a, b) => a.sort_order - b.sort_order);
      setPlans(sorted);
      setTotalCount(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / itemsPerPage));
    } catch (err) {
      console.error('❌ Error cargando membresías:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error loading membership plans');
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated, router, itemsPerPage]);

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
  }, [isAuthenticated, isChecking, loadPlans, router, checkAuth]);

  const handleRefresh = async () => {
    await loadPlans();
  };

  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return plans.slice(indexOfFirstItem, indexOfLastItem);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    if (isNaN(num) || num === 0) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      'activo': { label: 'Active', color: '#16a34a' },
      'inactivo': { label: 'Inactive', color: '#dc2626' },
    };
    const s = statusMap[status?.toLowerCase()] || { label: status || 'N/A', color: '#6b7280' };
    return (
      <span style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '12px',
        fontSize: '10px',
        fontWeight: 600,
        letterSpacing: '0.5px',
        backgroundColor: `${s.color}15`,
        color: s.color,
      }}>
        {s.label}
      </span>
    );
  };

  const handleCreatePlan = async (data: {
    name: string; price: number; period: string; benefits: string[];
    featured: boolean; icon: string; sort_order: number; description: string; status: string;
  }) => {
    setIsSubmitting(true);
    try {
      await createMembresia(data);
      setToast({ message: `Membership plan "${data.name}" created successfully!`, type: 'success' });
      setIsModalOpen(false);
      await loadPlans();
    } catch (err) {
      console.error('❌ Error creando membresía:', err);
      setToast({ message: (err instanceof Error ? err.message : undefined) || 'Error creating membership plan', type: 'error' });
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
      await deleteMembresia(confirmDialog.id);
      setToast({ message: `Membership plan "${confirmDialog.name}" deleted successfully!`, type: 'success' });
      setConfirmDialog({ isOpen: false, id: null, name: '', isDeleting: false });
      await loadPlans();
    } catch (err) {
      console.error('❌ Error eliminando membresía:', err);
      setToast({ message: (err instanceof Error ? err.message : undefined) || 'Error deleting membership plan', type: 'error' });
      setConfirmDialog(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleCloseConfirmDialog = () => {
    if (confirmDialog.isDeleting) return;
    setConfirmDialog({ isOpen: false, id: null, name: '', isDeleting: false });
  };

  const handleCloseToast = () => setToast(null);

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
            <span className="wander-breadcrumb">Services / Membership Plans</span>
            <h2>Error</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <h3>⚠️ Error loading membership plans</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="wander-btn-primary">
            <FiRefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const currentItems = getCurrentItems();

  return (
    <div className="wander-wellness-container">
      {toast && <Toast message={toast.message} type={toast.type} onClose={handleCloseToast} />}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Membership Plan"
        message={`Are you sure you want to delete "${confirmDialog.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isSubmitting={confirmDialog.isDeleting}
      />

      <header className="wander-wellness-header">
        <div>
          <span className="wander-breadcrumb">SERVICES / MEMBERSHIP PLANS</span>
          <h2>Membership Plans</h2>
          <p className="wander-wellness-subtitle">
            {totalCount} {totalCount === 1 ? 'plan' : 'plans'} registered
          </p>
        </div>
        <div className="wander-wellness-actions">
          <button onClick={handleRefresh} className="wander-btn-secondary">
            <FiRefreshCw size={16} />
            Refresh
          </button>
          <Link href="/admin/suscripciones" className="wander-btn-secondary">
            <FiAward size={16} />
            Subscriptions
          </Link>
          <button className="wander-btn-primary" onClick={() => setIsModalOpen(true)}>
            <FiPlus size={16} />
            Create Plan
          </button>
        </div>
      </header>

      <div className="wander-wellness-grid">
        {currentItems.length === 0 ? (
          <div className="wander-wellness-empty">
            <span className="wander-empty-icon">
              <FiAward size={48} />
            </span>
            <p>No membership plans found</p>
            <span className="wander-empty-desc">No membership plans registered yet</span>
          </div>
        ) : (
          currentItems.map((plan) => (
            <div key={plan.id} className="wander-wellness-card">
              <div className="wander-wellness-image wander-membresia-icon-area">
                <span className="wander-membresia-icon">{plan.icon || <FiStar size={40} />}</span>
                {Number(plan.featured) === 1 && (
                  <span className="wander-membresia-featured-badge">Featured</span>
                )}
                <div className="wander-wellness-status-badge">
                  {getStatusBadge(plan.status)}
                </div>
              </div>

              <div className="wander-wellness-info">
                <h3 className="wander-wellness-title">{plan.name}</h3>

                <div className="wander-wellness-price">
                  <FiDollarSign size={16} />
                  {formatCurrency(plan.price)}
                  <span className="wander-membresia-period">/ {plan.period}</span>
                </div>

                <p className="wander-wellness-description">
                  {(plan.benefits || []).length} benefits included
                </p>
              </div>

              <div className="wander-wellness-actions">
                <Link href={`/admin/membresias/${plan.id}`} className="wander-wellness-action-btn details">
                  <FiEye size={14} />
                  Details
                </Link>
                <button onClick={() => handleDeleteClick(plan.id, plan.name)} className="wander-wellness-action-btn delete">
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
            {Math.min((currentPage || 1) * itemsPerPage, totalCount)} of {totalCount} plans
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Membership Plan"
        maxWidth="640px"
      >
        <CreateMembresiaForm
          onSubmit={handleCreatePlan}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
}
