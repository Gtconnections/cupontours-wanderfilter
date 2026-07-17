// app/(dashboard)/admin/membresias/[id]/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getMembresiaDetail, Membresia, deleteMembresia, uploadGallery, changePrincipalImage } from '@/app/lib/api/membresiaAdmin';
import {
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiDollarSign,
  FiImage,
  FiCamera,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiAward,
  FiClock,
  FiCheck
} from 'react-icons/fi';
import { ConfirmDialog } from '@/app/(dashboard)/admin/components/ConfirmDialog';
import Toast from '@/app/(dashboard)/admin/components/Toast';
import ModalAddGallery from '@/app/(dashboard)/admin/components/ModalAddGallery';
import ModalChangeImage from '@/app/(dashboard)/admin/components/ModalChangeImage';
import ModalEditMembresia from '@/app/(dashboard)/admin/components/ModalEditMembresia';
import './detail.css';

interface GalleryImage {
  id: number;
  url: string;
  orden: number;
}

interface MembresiaDetail extends Membresia {
  galeria?: GalleryImage[];
}

const LoadingSkeleton = () => (
  <div className="wander-detail-container">
    <div className="wander-detail-loading">
      <div className="wander-loading-spinner"></div>
      <p>Loading membership plan details...</p>
    </div>
  </div>
);

export default function MembresiaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();

  const [plan, setPlan] = useState<MembresiaDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isChangeImageModalOpen, setIsChangeImageModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    isDeleting: boolean;
  }>({
    isOpen: false,
    isDeleting: false
  });

  const loadPlan = useCallback(async () => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getMembresiaDetail(parseInt(id));
      setPlan(data);
    } catch (err) {
      console.error('❌ Error cargando detalle:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error loading membership plan details');
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

    loadPlan();
  }, [isAuthenticated, isChecking, loadPlan, router, checkAuth]);

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    if (isNaN(num) || num === 0) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      'activo': { label: 'Active', color: '#16a34a' },
      'inactivo': { label: 'Inactive', color: '#dc2626' },
    };
    const s = statusMap[status?.toLowerCase()] || { label: status || 'N/A', color: '#6b7280' };
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
    if (!plan) return;

    setConfirmDialog(prev => ({ ...prev, isDeleting: true }));

    try {
      await deleteMembresia(plan.id);
      setToast({ message: `Membership plan "${plan.name}" deleted successfully!`, type: 'success' });
      setConfirmDialog({ isOpen: false, isDeleting: false });
      router.push('/admin/membresias');
    } catch (err) {
      console.error('❌ Error eliminando membresía:', err);
      setToast({ message: (err instanceof Error ? err.message : undefined) || 'Error deleting membership plan', type: 'error' });
      setConfirmDialog(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleCloseConfirmDialog = () => {
    if (confirmDialog.isDeleting) return;
    setConfirmDialog({ isOpen: false, isDeleting: false });
  };

  const handleCloseToast = () => setToast(null);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = 'unset';
  };

  const goToPreviousImage = () => {
    if (!plan?.galeria) return;
    setCurrentImageIndex(prev => (prev === 0 ? plan.galeria!.length : prev - 1));
  };

  const goToNextImage = () => {
    if (!plan?.galeria) return;
    setCurrentImageIndex(prev => (prev === plan.galeria!.length ? 0 : prev + 1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPreviousImage();
      if (e.key === 'ArrowRight') goToNextImage();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

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
          <h3>⚠️ Error loading membership plan</h3>
          <p>{error}</p>
          <button onClick={() => router.back()} className="wander-btn-secondary">
            <FiArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !plan) {
    return <LoadingSkeleton />;
  }

  const allImages = plan.galeria
    ? [plan.principal_image, ...plan.galeria.map(g => g.url)].filter(Boolean) as string[]
    : [plan.principal_image].filter(Boolean) as string[];

  return (
    <div className="wander-detail-container">
      {toast && <Toast message={toast.message} type={toast.type} onClose={handleCloseToast} />}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Membership Plan"
        message={`Are you sure you want to delete "${plan.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isSubmitting={confirmDialog.isDeleting}
      />

      <ModalAddGallery
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        onSuccess={loadPlan}
        itemId={plan.id}
        itemName={plan.name}
        uploadFn={uploadGallery}
      />

      <ModalChangeImage
        isOpen={isChangeImageModalOpen}
        onClose={() => setIsChangeImageModalOpen(false)}
        onSuccess={loadPlan}
        itemId={plan.id}
        itemName={plan.name}
        currentImage={plan.principal_image || ''}
        uploadFn={changePrincipalImage}
      />

      <ModalEditMembresia
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={loadPlan}
        item={plan}
      />

      {isLightboxOpen && allImages.length > 0 && (
        <div className="wander-lightbox-overlay" onClick={closeLightbox}>
          <button className="wander-lightbox-close" onClick={closeLightbox}>
            <FiX size={28} />
          </button>
          <button className="wander-lightbox-prev" onClick={(e) => { e.stopPropagation(); goToPreviousImage(); }}>
            <FiChevronLeft size={32} />
          </button>
          <button className="wander-lightbox-next" onClick={(e) => { e.stopPropagation(); goToNextImage(); }}>
            <FiChevronRight size={32} />
          </button>
          <img
            src={allImages[currentImageIndex]}
            alt={`${plan.name} - ${currentImageIndex + 1}`}
            className="wander-lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="wander-lightbox-counter">
            {currentImageIndex + 1} / {allImages.length}
          </div>
        </div>
      )}

      <div className="wander-detail-header">
        <div className="wander-detail-header-left">
          <button onClick={() => router.back()} className="wander-detail-back">
            <FiArrowLeft size={20} />
            Back
          </button>
          <div>
            <span className="wander-breadcrumb">Services / Membership Plans</span>
            <h1 className="wander-detail-title">{plan.name}</h1>
          </div>
        </div>
        <div className="wander-detail-header-actions">
          <button onClick={() => setIsGalleryModalOpen(true)} className="wander-btn-secondary">
            <FiImage size={16} />
            Add Gallery
          </button>
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
          <div className="wander-detail-image-section">
            <div className="wander-detail-main-image">
              {plan.principal_image ? (
                <img src={plan.principal_image} alt={plan.name} onClick={() => openLightbox(0)} style={{ cursor: 'pointer' }} />
              ) : (
                <div className="wander-detail-image-placeholder wander-membresia-detail-icon">
                  {plan.icon || <FiAward size={64} />}
                </div>
              )}
              <button
                className="wander-change-image-trigger"
                onClick={(e) => { e.stopPropagation(); setIsChangeImageModalOpen(true); }}
                title="Change principal image"
              >
                <FiCamera size={18} />
              </button>
              <div className="wander-detail-status-badge-wrapper">
                {getStatusBadge(plan.status)}
              </div>
            </div>

            {allImages.length > 1 && (
              <div className="wander-detail-gallery">
                {allImages.map((img, index) => (
                  <div key={index} className={`wander-detail-gallery-item ${index === 0 ? 'active' : ''}`} onClick={() => openLightbox(index)}>
                    <img src={img} alt={`${plan.name} - ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="wander-detail-info-section">
            <div className="wander-detail-info-card">
              <h3 className="wander-detail-info-title">Plan Information</h3>

              <div className="wander-detail-info-grid">
                <div className="wander-detail-info-item full-width">
                  <label>Price</label>
                  <span className="wander-detail-price">
                    <FiDollarSign size={16} />
                    {formatCurrency(plan.price)} / {plan.period}
                  </span>
                </div>
                <div className="wander-detail-info-item">
                  <label>Featured</label>
                  <span>{Number(plan.featured) === 1 ? 'Yes' : 'No'}</span>
                </div>
                <div className="wander-detail-info-item">
                  <label>Sort Order</label>
                  <span>{plan.sort_order}</span>
                </div>
              </div>

              {plan.description && (
                <div className="wander-detail-description">
                  <h4>Description</h4>
                  <p>{plan.description}</p>
                </div>
              )}

              {(plan.benefits || []).length > 0 && (
                <div className="wander-detail-description">
                  <h4>Benefits</h4>
                  <ul className="wander-membresia-benefits-list">
                    {plan.benefits.map((benefit, idx) => (
                      <li key={idx}>
                        <FiCheck size={14} />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="wander-detail-meta-card">
              <div className="wander-detail-meta-item">
                <FiClock size={14} />
                <span>Created: {formatDate(plan.created_at)}</span>
              </div>
              <div className="wander-detail-meta-item">
                <FiClock size={14} />
                <span>Updated: {formatDate(plan.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
