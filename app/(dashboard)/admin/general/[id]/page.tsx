// app/(dashboard)/admin/general/[id]/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getGeneralServiceDetail, GeneralService, deleteGeneralService, uploadGallery, changePrincipalImage } from '@/app/lib/api/generalAdmin';
import {
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiDollarSign,
  FiCalendar,
  FiClock,
  FiFileText,
  FiImage,
  FiCamera,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiTag,
  FiHelpCircle,
  FiGrid
} from 'react-icons/fi';
import { ConfirmDialog } from '@/app/(dashboard)/admin/components/ConfirmDialog';
import Toast from '@/app/(dashboard)/admin/components/Toast';
import ModalAddGallery from '@/app/(dashboard)/admin/components/ModalAddGallery';
import ModalChangeImage from '@/app/(dashboard)/admin/components/ModalChangeImage';
import ModalEditGeneralService from '@/app/(dashboard)/admin/components/ModalEditGeneralService';
import './detail.css';

interface GalleryImage {
  id: number;
  url: string;
  orden: number;
}

interface GeneralServiceDetail extends GeneralService {
  galeria?: GalleryImage[];
}

const LoadingSkeleton = () => (
  <div className="wander-detail-container">
    <div className="wander-detail-loading">
      <div className="wander-loading-spinner"></div>
      <p>Loading service details...</p>
    </div>
  </div>
);

export default function GeneralServiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [service, setService] = useState<GeneralServiceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isChangeImageModalOpen, setIsChangeImageModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Confirm Dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    isDeleting: boolean;
  }>({
    isOpen: false,
    isDeleting: false
  });

  const loadService = useCallback(async () => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getGeneralServiceDetail(parseInt(id));
      setService(data);
    } catch (err) {
      console.error('❌ Error cargando detalle:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error loading service details');
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated, router, id]);

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

    loadService();
  }, [isAuthenticated, isChecking, loadService, router, checkAuth]);

  const formatCurrency = (amount: string | null) => {
    if (!amount) return null;
    const num = parseFloat(amount);
    if (isNaN(num) || num === 0) return null;
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
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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
      <span className="wander-detail-status-badge" style={{
        backgroundColor: `${s.color}15`,
        color: s.color,
      }}>
        {s.label}
      </span>
    );
  };

  const getPriceTypeInfo = (type: string, price: string | null) => {
    if (type?.toLowerCase() === 'fijo' && price) {
      return {
        label: 'Fixed Price',
        value: formatCurrency(price),
        icon: <FiDollarSign size={16} />,
        color: '#2563eb'
      };
    } else if (type?.toLowerCase() === 'cotizacion') {
      return {
        label: 'Quote',
        value: 'Request quote',
        icon: <FiHelpCircle size={16} />,
        color: '#f59e0b'
      };
    }
    return {
      label: 'Price',
      value: 'Not set',
      icon: <FiDollarSign size={16} />,
      color: '#717171'
    };
  };

  // Delete handler
  const handleDeleteClick = () => {
    setConfirmDialog({
      isOpen: true,
      isDeleting: false
    });
  };

  const handleConfirmDelete = async () => {
    if (!service) return;

    setConfirmDialog(prev => ({ ...prev, isDeleting: true }));

    try {
      await deleteGeneralService(service.id);
      
      setToast({
        message: `Service "${service.name}" deleted successfully!`,
        type: 'success'
      });
      
      setConfirmDialog({ isOpen: false, isDeleting: false });
      router.push('/admin/general');
    } catch (err) {
      console.error('❌ Error eliminando servicio general:', err);
      setToast({
        message: (err instanceof Error ? err.message : undefined) || 'Error deleting service',
        type: 'error'
      });
      setConfirmDialog(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleCloseConfirmDialog = () => {
    if (confirmDialog.isDeleting) return;
    setConfirmDialog({ isOpen: false, isDeleting: false });
  };

  const handleCloseToast = () => {
    setToast(null);
  };

  // Lightbox handlers
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
    if (!service?.galeria) return;
    setCurrentImageIndex(prev => 
      prev === 0 ? service.galeria!.length : prev - 1
    );
  };

  const goToNextImage = () => {
    if (!service?.galeria) return;
    setCurrentImageIndex(prev => 
      prev === service.galeria!.length ? 0 : prev + 1
    );
  };

  // Keyboard navigation for lightbox
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
          <h3>⚠️ Error loading service</h3>
          <p>{error}</p>
          <button onClick={() => router.back()} className="wander-btn-secondary">
            <FiArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !service) {
    return <LoadingSkeleton />;
  }

  // ✅ CORRECCIÓN: Filtrar correctamente los valores null/undefined
  const allImages = service.galeria 
    ? [service.principal_image, ...service.galeria.map(g => g.url)].filter((img): img is string => img !== null && img !== undefined && img !== '')
    : [service.principal_image].filter((img): img is string => img !== null && img !== undefined && img !== '');

  const priceInfo = getPriceTypeInfo(service.price_type, service.price);

  return (
    <div className="wander-detail-container">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={handleCloseToast}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Service"
        message={`Are you sure you want to delete "${service.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isSubmitting={confirmDialog.isDeleting}
      />

      {/* Add Gallery Modal */}
      <ModalAddGallery
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        onSuccess={loadService}
        itemId={service.id}
        itemName={service.name}
        uploadFn={uploadGallery}
      />

      {/* Change Principal Image Modal */}
      <ModalChangeImage
        isOpen={isChangeImageModalOpen}
        onClose={() => setIsChangeImageModalOpen(false)}
        onSuccess={loadService}
        itemId={service.id}
        itemName={service.name}
        currentImage={service.principal_image || ''}
        uploadFn={changePrincipalImage}
      />

      {/* Edit Modal */}
      <ModalEditGeneralService
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={loadService}
        item={service}
      />

      {/* Lightbox */}
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
            alt={`${service.name} - ${currentImageIndex + 1}`}
            className="wander-lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="wander-lightbox-counter">
            {currentImageIndex + 1} / {allImages.length}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="wander-detail-header">
        <div className="wander-detail-header-left">
          <button onClick={() => router.back()} className="wander-detail-back">
            <FiArrowLeft size={20} />
            Back
          </button>
          <div>
            <span className="wander-breadcrumb">Services / General</span>
            <h1 className="wander-detail-title">{service.name}</h1>
          </div>
        </div>
        <div className="wander-detail-header-actions">
          <button
            onClick={() => setIsGalleryModalOpen(true)}
            className="wander-btn-secondary"
          >
            <FiImage size={16} />
            Add Gallery
          </button>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="wander-btn-secondary"
          >
            <FiEdit2 size={16} />
            Edit
          </button>
          <button 
            onClick={handleDeleteClick}
            className="wander-btn-danger"
          >
            <FiTrash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="wander-detail-content">
        <div className="wander-detail-grid">
          {/* Imagen Principal y Galería */}
          <div className="wander-detail-image-section">
            <div className="wander-detail-main-image">
              {service.principal_image ? (
                <img 
                  src={service.principal_image} 
                  alt={service.name}
                  onClick={() => openLightbox(0)}
                  style={{ cursor: 'pointer' }}
                />
              ) : (
                <div className="wander-detail-image-placeholder">
                  <FiFileText size={64} />
                </div>
              )}
              <button
                className="wander-change-image-trigger"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsChangeImageModalOpen(true);
                }}
                title="Change principal image"
              >
                <FiCamera size={18} />
              </button>
              <div className="wander-detail-status-badge-wrapper">
                {getStatusBadge(service.status)}
              </div>
            </div>
            
            {allImages.length > 1 && (
              <div className="wander-detail-gallery">
                {allImages.map((img, index) => (
                  <div 
                    key={index} 
                    className={`wander-detail-gallery-item ${index === 0 ? 'active' : ''}`}
                    onClick={() => openLightbox(index)}
                  >
                    <img src={img} alt={`${service.name} - ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Información */}
          <div className="wander-detail-info-section">
            <div className="wander-detail-info-card">
              <h3 className="wander-detail-info-title">Service Information</h3>
              
              <div className="wander-detail-info-grid">
                <div className="wander-detail-info-item full-width">
                  <label>Category</label>
                  <span>
                    <FiTag size={14} style={{ marginRight: '4px' }} />
                    {service.category || '—'}
                  </span>
                </div>
                <div className="wander-detail-info-item full-width">
                  <label>Price Type</label>
                  <span>
                    <FiGrid size={14} style={{ marginRight: '4px' }} />
                    {service.price_type === 'fijo' ? 'Fixed Price' : 'Quote'}
                  </span>
                </div>
                <div className="wander-detail-info-item full-width">
                  <label>{priceInfo.label}</label>
                  <span className="wander-detail-price" style={{ color: priceInfo.color }}>
                    {priceInfo.icon}
                    {priceInfo.value}
                  </span>
                </div>
              </div>

              {service.descripcion && (
                <div className="wander-detail-description">
                  <h4>Description</h4>
                  <p>{service.descripcion}</p>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="wander-detail-meta-card">
              <div className="wander-detail-meta-item">
                <FiClock size={14} />
                <span>Created: {formatDate(service.created_at)}</span>
              </div>
              <div className="wander-detail-meta-item">
                <FiClock size={14} />
                <span>Updated: {formatDate(service.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}