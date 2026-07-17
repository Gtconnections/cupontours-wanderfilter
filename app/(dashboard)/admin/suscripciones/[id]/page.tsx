// app/(dashboard)/admin/suscripciones/[id]/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getSuscripcionDetail, Suscripcion, deleteSuscripcion } from '@/app/lib/api/suscripcionAdmin';
import { getMembresiaDetail, Membresia } from '@/app/lib/api/membresiaAdmin';
import {
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiClock,
  FiMail,
  FiPhone,
  FiUser,
  FiLink,
  FiCheck,
  FiDollarSign
} from 'react-icons/fi';
import { ConfirmDialog } from '@/app/(dashboard)/admin/components/ConfirmDialog';
import Toast from '@/app/(dashboard)/admin/components/Toast';
import ModalEditSuscripcion from '@/app/(dashboard)/admin/components/ModalEditSuscripcion';
import './detail.css';

const FRONTEND_BASE_URL = 'https://cupontours-wanderfilter.vercel.app';

const LoadingSkeleton = () => (
  <div className="wander-detail-container">
    <div className="wander-detail-loading">
      <div className="wander-loading-spinner"></div>
      <p>Loading subscription details...</p>
    </div>
  </div>
);

export default function SuscripcionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();

  const [subscription, setSubscription] = useState<Suscripcion | null>(null);
  const [plan, setPlan] = useState<Membresia | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    isDeleting: boolean;
  }>({
    isOpen: false,
    isDeleting: false
  });

  const loadSubscription = useCallback(async () => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getSuscripcionDetail(parseInt(id));
      setSubscription(data);

      try {
        const planData = await getMembresiaDetail(data.membresia_id);
        setPlan(planData);
      } catch (planErr) {
        console.error('❌ Error cargando el plan de la suscripción:', planErr);
      }
    } catch (err) {
      console.error('❌ Error cargando detalle:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error loading subscription details');
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated, router, id]);

  useEffect(() => {
    if (isChecking) return;

    const hasAuth = checkAuth();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAuthVerified(true);

    if (!hasAuth) {
      router.push('/login');
      return;
    }

    loadSubscription();
  }, [isAuthenticated, isChecking, loadSubscription, router, checkAuth]);

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    if (isNaN(num) || num === 0) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(num);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '—';
      return date.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (estado: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      'activa': { label: 'Active', color: '#16a34a' },
      'vencida': { label: 'Expired', color: '#f59e0b' },
      'cancelada': { label: 'Cancelled', color: '#dc2626' },
    };
    const s = statusMap[estado?.toLowerCase()] || { label: estado || 'N/A', color: '#6b7280' };
    return (
      <span className="wander-detail-status-badge" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
        {s.label}
      </span>
    );
  };

  const handleDeleteClick = () => {
    setConfirmDialog({ isOpen: true, isDeleting: false });
  };

  const handleConfirmDelete = async () => {
    if (!subscription) return;

    setConfirmDialog(prev => ({ ...prev, isDeleting: true }));

    try {
      await deleteSuscripcion(subscription.id);
      setToast({ message: `Subscription for "${subscription.cliente_nombre}" deleted successfully!`, type: 'success' });
      setConfirmDialog({ isOpen: false, isDeleting: false });
      router.push('/admin/suscripciones');
    } catch (err) {
      console.error('❌ Error eliminando suscripción:', err);
      setToast({ message: (err instanceof Error ? err.message : undefined) || 'Error deleting subscription', type: 'error' });
      setConfirmDialog(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleCloseConfirmDialog = () => {
    if (confirmDialog.isDeleting) return;
    setConfirmDialog({ isOpen: false, isDeleting: false });
  };

  const handleCloseToast = () => setToast(null);

  const verifyUrl = subscription?.verify_hash
    ? `${FRONTEND_BASE_URL}/verify-member/${subscription.verify_hash}`
    : null;

  const handleCopyLink = async () => {
    if (!verifyUrl) return;
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('❌ Error al copiar el enlace:', err);
    }
  };

  if (isChecking || !isAuthVerified) {
    return <LoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="wander-detail-container">
        <div className="wander-detail-error">
          <h3>⚠️ Error loading subscription</h3>
          <p>{error}</p>
          <button onClick={() => router.back()} className="wander-btn-secondary">
            <FiArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !subscription) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="wander-detail-container">
      {toast && <Toast message={toast.message} type={toast.type} onClose={handleCloseToast} />}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Subscription"
        message={`Are you sure you want to delete the subscription for "${subscription.cliente_nombre}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isSubmitting={confirmDialog.isDeleting}
      />

      <ModalEditSuscripcion
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={loadSubscription}
        item={subscription}
      />

      <div className="wander-detail-header">
        <div className="wander-detail-header-left">
          <button onClick={() => router.back()} className="wander-detail-back">
            <FiArrowLeft size={20} />
            Back
          </button>
          <div>
            <span className="wander-breadcrumb">Services / Subscriptions</span>
            <h1 className="wander-detail-title">{subscription.cliente_nombre}</h1>
          </div>
        </div>
        <div className="wander-detail-header-actions">
          <button onClick={() => setIsEditModalOpen(true)} className="wander-btn-secondary">
            <FiEdit2 size={16} />
            Edit
          </button>
          <button onClick={handleDeleteClick} className="wander-btn-danger">
            <FiTrash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      <div className="wander-detail-content">
        <div className="wander-detail-grid">
          {/* QR Section */}
          <div className="wander-detail-image-section">
            <div className="wander-subs-qr-card">
              {subscription.qr_url ? (
                <img src={subscription.qr_url} alt="Membership QR" className="wander-subs-qr-image" />
              ) : (
                <div className="wander-subs-qr-placeholder">QR not available</div>
              )}
              <div className="wander-detail-status-badge-wrapper">
                {getStatusBadge(subscription.estado)}
              </div>
            </div>

            {verifyUrl && (
              <button className="wander-btn-secondary wander-subs-copy-btn" onClick={handleCopyLink}>
                {linkCopied ? <FiCheck size={16} /> : <FiLink size={16} />}
                {linkCopied ? 'Copied!' : 'Copy verification link'}
              </button>
            )}
          </div>

          {/* Información */}
          <div className="wander-detail-info-section">
            <div className="wander-detail-info-card">
              <h3 className="wander-detail-info-title">Client Information</h3>

              <div className="wander-detail-info-grid">
                <div className="wander-detail-info-item full-width">
                  <label>Name</label>
                  <span><FiUser size={14} style={{ marginRight: '4px' }} />{subscription.cliente_nombre}</span>
                </div>
                <div className="wander-detail-info-item">
                  <label>Email</label>
                  <span><FiMail size={14} style={{ marginRight: '4px' }} />{subscription.cliente_email}</span>
                </div>
                <div className="wander-detail-info-item">
                  <label>Phone</label>
                  <span><FiPhone size={14} style={{ marginRight: '4px' }} />{subscription.cliente_telefono}</span>
                </div>
              </div>
            </div>

            <div className="wander-detail-info-card">
              <h3 className="wander-detail-info-title">Membership Details</h3>

              <div className="wander-detail-info-grid">
                <div className="wander-detail-info-item full-width">
                  <label>Plan</label>
                  <span>{plan?.name || `Plan #${subscription.membresia_id}`}</span>
                </div>
                <div className="wander-detail-info-item full-width">
                  <label>Agreed Amount</label>
                  <span className="wander-detail-price">
                    <FiDollarSign size={16} />
                    {formatCurrency(subscription.monto_acordado)}
                  </span>
                </div>
                <div className="wander-detail-info-item">
                  <label>Start Date</label>
                  <span>{subscription.fecha_inicio}</span>
                </div>
                <div className="wander-detail-info-item">
                  <label>Valid Until</label>
                  <span>{subscription.fecha_fin || 'No expiration'}</span>
                </div>
              </div>

              {subscription.notas && (
                <div className="wander-detail-description">
                  <h4>Notes</h4>
                  <p>{subscription.notas}</p>
                </div>
              )}
            </div>

            <div className="wander-detail-meta-card">
              <div className="wander-detail-meta-item">
                <FiClock size={14} />
                <span>Created: {formatDate(subscription.created_at)}</span>
              </div>
              <div className="wander-detail-meta-item">
                <FiClock size={14} />
                <span>Updated: {formatDate(subscription.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
