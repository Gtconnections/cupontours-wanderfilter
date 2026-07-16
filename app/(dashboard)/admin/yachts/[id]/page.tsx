// app/admin/yachts/[id]/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getFullYacht, getYachtImages, getOwners, YachtFullDetail, YachtGalleryImage, deleteYacht } from '@/app/lib/api/yachtsAdmin';
import ModalEditYacht from '../../components/ModalEditYacht';
import ModalAddYachtImages from '../../components/ModalAddYachtImages';
import ModalDeleteYacht from '../../components/ModalDeleteYacht';
import { 
  FiArrowLeft, 
  FiImage, 
  FiEdit2, 
  FiTrash2, 
  FiAnchor, 
  FiUsers, 
  FiMaximize,
  FiHome,
  FiDroplet,
  FiDollarSign,
  FiCheck,
  FiX,
  FiEye,
  FiTag,
  FiFileText,
  FiUser,
  FiMail,
  FiPhone
} from 'react-icons/fi';
import './yacht-detail.css';

const LoadingSkeleton = () => (
  <div className="wander-yacht-detail-container">
    <div className="wander-yacht-detail-header">
      <div>
        <span className="wander-breadcrumb">Listings / Yachts / Detail</span>
        <h2>Loading yacht...</h2>
      </div>
    </div>
    <div className="wander-yacht-detail-loading">
      <div className="wander-loading-spinner"></div>
      <p>Loading yacht details...</p>
    </div>
  </div>
);

export default function YachtDetailPage() {
  const router = useRouter();
  const params = useParams();
  const yachtId = parseInt(params.id as string);
  
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [yacht, setYacht] = useState<YachtFullDetail | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Estados para Lightbox
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Estado para modal de edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Estado para modal de imágenes
  const [isAddImagesModalOpen, setIsAddImagesModalOpen] = useState(false);

  // Estado para modal de eliminación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadYachtDetail = useCallback(async () => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 🔥 Cargar owners y yate (obligatorios)
      const [ownersData, yachtData] = await Promise.all([
        getOwners(),
        getFullYacht(yachtId)
      ]);
      
      console.log('👥 Owners cargados:', ownersData.length);
      console.log('📦 Datos del yate:', yachtData);
      
      setOwners(ownersData);
      setYacht(yachtData);
      
      // 🔥 Intentar cargar imágenes, pero si falla, usar array vacío
      let imageUrls: string[] = [];
      try {
        const imagesData = await getYachtImages(yachtId);
        console.log('📸 Imágenes del yate:', imagesData);
        imageUrls = imagesData?.map((img: YachtGalleryImage) => img.image) || [];
      } catch (imgErr: any) {
        // Si no hay imágenes (404) o cualquier otro error, solo continuamos con array vacío
        console.log('ℹ️ No hay imágenes disponibles o error al cargarlas:', imgErr.message);
        imageUrls = [];
      }
      
      // Combinar imagen principal con las de la galería
      const allImages = yachtData.principal_image ? [yachtData.principal_image, ...imageUrls] : imageUrls;
      setImages(allImages);
      
    } catch (err: any) {
      console.error('❌ Error cargando yate:', err);
      setError(err.message || 'Error loading yacht details');
    } finally {
      setIsLoading(false);
    }
  }, [yachtId, token, isAuthenticated, router]);

  useEffect(() => {
    if (isChecking) return;
    
    const hasAuth = checkAuth();
    setIsAuthVerified(true);
    
    if (!hasAuth) {
      router.push('/login');
      return;
    }

    if (yachtId && !isNaN(yachtId)) {
      loadYachtDetail();
    } else {
      setError('Invalid yacht ID');
      setIsLoading(false);
    }
  }, [yachtId, isAuthenticated, isChecking, loadYachtDetail, router, checkAuth]);

  // Manejador de éxito al editar
  const handleEditSuccess = () => {
    setToastMessage('✅ Yacht updated successfully!');
    setTimeout(() => setToastMessage(null), 3000);
    loadYachtDetail();
  };

  // Manejador de éxito al subir imágenes
  const handleAddImagesSuccess = () => {
    setToastMessage('✅ Images uploaded successfully!');
    setTimeout(() => setToastMessage(null), 3000);
    loadYachtDetail();
  };

  // Manejador de eliminación
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteYacht(yachtId);
      
      setToastMessage('🗑️ Yacht deleted successfully!');
      setTimeout(() => setToastMessage(null), 3000);
      
      setIsDeleteModalOpen(false);
      
      setTimeout(() => {
        router.push('/admin/yachts/list');
      }, 1500);
      
    } catch (err: any) {
      console.error('❌ Error al eliminar yate:', err);
      setToastMessage(`❌ Error: ${err.message || 'Failed to delete yacht'}`);
      setTimeout(() => setToastMessage(null), 3000);
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount === null || amount === undefined || amount === 0) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getAmenityBadge = (label: string, value: boolean) => {
    if (!value) return null;
    return (
      <span className="wander-yacht-detail-amenity-badge">
        <FiCheck size={12} />
        {label}
      </span>
    );
  };

  // Funciones del Lightbox
  const openLightbox = (index: number) => {
    if (images.length === 0) return;
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
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
      <div className="wander-yacht-detail-container">
        <div className="wander-yacht-detail-header">
          <div>
            <span className="wander-breadcrumb">Listings / Yachts / Detail</span>
            <h2>Error</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <h3>⚠️ Error loading yacht</h3>
          <p>{error}</p>
          <button onClick={loadYachtDetail} className="wander-btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!yacht) {
    return (
      <div className="wander-yacht-detail-container">
        <div className="wander-yacht-detail-header">
          <div>
            <span className="wander-breadcrumb">Listings / Yachts / Detail</span>
            <h2>Yacht not found</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <p>Yacht with ID {yachtId} not found</p>
          <button onClick={() => router.push('/admin/yachts/list')} className="wander-btn-primary">
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wander-yacht-detail-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="wander-toast">
          {toastMessage}
        </div>
      )}

      {/* Cabecera */}
      <header className="wander-yacht-detail-header">
        <div>
          <span className="wander-breadcrumb">LISTINGS / YACHTS / DETAIL</span>
          <h2>{yacht.name}</h2>
          <p className="wander-yacht-detail-subtitle">
            ID: #{yacht.yacht_id} • {yacht.length} ft • Capacity: {yacht.capacity} guests
          </p>
        </div>
        <div className="wander-yacht-detail-actions">
          <button 
            onClick={() => setIsAddImagesModalOpen(true)}
            className="wander-yacht-action-btn add-images"
          >
            <FiImage size={16} />
            Add Images
          </button>
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="wander-yacht-action-btn edit"
          >
            <FiEdit2 size={16} />
            Edit
          </button>
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="wander-yacht-action-btn delete"
          >
            <FiTrash2 size={16} />
            Delete
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="wander-yacht-detail-content">
        {/* Galería - CORREGIDO: muestra placeholder si no hay imágenes */}
        {images.length > 0 ? (
          <div className="wander-yacht-gallery-grid">
            <div 
              className="wander-yacht-gallery-main"
              onClick={() => openLightbox(0)}
            >
              <img src={images[0]} alt={yacht.name} />
              <div className="wander-yacht-gallery-overlay">
                <span>Click to view gallery</span>
              </div>
            </div>

            <div className="wander-yacht-gallery-thumbnails">
              {images.slice(1, 5).map((img, index) => (
                <div 
                  key={index}
                  className="wander-yacht-gallery-thumb"
                  onClick={() => openLightbox(index + 1)}
                >
                  <img src={img} alt={`Thumbnail ${index + 1}`} />
                  <div className="wander-yacht-gallery-thumb-overlay">
                    <span>🔍</span>
                  </div>
                </div>
              ))}
              
              {images.length > 5 && (
                <div 
                  className="wander-yacht-gallery-thumb wander-yacht-gallery-more"
                  onClick={() => openLightbox(5)}
                >
                  <img src={images[5]} alt="More images" />
                  <div className="wander-yacht-gallery-thumb-overlay">
                    <span>+{images.length - 5}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="wander-yacht-gallery-placeholder">
            <FiAnchor size={48} />
            <p>No images available</p>
            <span>Click "Add Images" to upload photos</span>
          </div>
        )}

        {/* Lightbox */}
        {isLightboxOpen && images.length > 0 && (
          <div className="wander-yacht-lightbox-overlay" onClick={closeLightbox}>
            <div className="wander-yacht-lightbox-container" onClick={(e) => e.stopPropagation()}>
              <button className="wander-yacht-lightbox-close" onClick={closeLightbox}>
                ✕
              </button>

              {images.length > 1 && (
                <>
                  <button className="wander-yacht-lightbox-prev" onClick={goToPrevious}>
                    ❮
                  </button>
                  <button className="wander-yacht-lightbox-next" onClick={goToNext}>
                    ❯
                  </button>
                </>
              )}

              <div className="wander-yacht-lightbox-counter">
                {currentImageIndex + 1} / {images.length}
              </div>

              <div className="wander-yacht-lightbox-image-wrapper">
                <img 
                  src={images[currentImageIndex]} 
                  alt={`Imagen ${currentImageIndex + 1}`}
                  className="wander-yacht-lightbox-image"
                />
              </div>

              {images.length > 1 && (
                <div className="wander-yacht-lightbox-thumbnails">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className={`wander-yacht-lightbox-thumb ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img src={img} alt={`Thumb ${index + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Grid */}
        <div className="wander-yacht-detail-info-grid">
          <div className="wander-yacht-detail-info-card">
            <h3>Yacht Information</h3>
            <div className="wander-yacht-detail-item">
              <span className="wander-yacht-detail-label">ID</span>
              <span className="wander-yacht-detail-value">#{yacht.yacht_id}</span>
            </div>
            <div className="wander-yacht-detail-item">
              <span className="wander-yacht-detail-label">Name</span>
              <span className="wander-yacht-detail-value">{yacht.name}</span>
            </div>
            <div className="wander-yacht-detail-item">
              <span className="wander-yacht-detail-label">External ID</span>
              <span className="wander-yacht-detail-value">{yacht.external_id || '—'}</span>
            </div>
            <div className="wander-yacht-detail-item">
              <span className="wander-yacht-detail-label">Length</span>
              <span className="wander-yacht-detail-value">{yacht.length} ft</span>
            </div>
            <div className="wander-yacht-detail-item">
              <span className="wander-yacht-detail-label">Capacity</span>
              <span className="wander-yacht-detail-value">{yacht.capacity} guests</span>
            </div>
            <div className="wander-yacht-detail-item">
              <span className="wander-yacht-detail-label">Staterooms</span>
              <span className="wander-yacht-detail-value">{yacht.staterooms}</span>
            </div>
            <div className="wander-yacht-detail-item">
              <span className="wander-yacht-detail-label">Bathrooms</span>
              <span className="wander-yacht-detail-value">{yacht.bathrooms}</span>
            </div>
          </div>

          <div className="wander-yacht-detail-info-card">
            <h3>Pricing</h3>
            <div className="wander-yacht-detail-item">
              <span className="wander-yacht-detail-label">Full Day</span>
              <span className="wander-yacht-detail-value price-full">
                {formatCurrency(yacht.price_full_day)}
              </span>
            </div>
            <div className="wander-yacht-detail-item">
              <span className="wander-yacht-detail-label">Half Day</span>
              <span className="wander-yacht-detail-value price-half">
                {formatCurrency(yacht.price_half_day)}
              </span>
            </div>
          </div>

          <div className="wander-yacht-detail-info-card">
            <h3>Owner Information</h3>
            <div className="wander-yacht-detail-item">
              <span className="wander-yacht-detail-label">
                <FiUser size={14} />
                Name
              </span>
              <span className="wander-yacht-detail-value">{yacht.full_name}</span>
            </div>
            <div className="wander-yacht-detail-item">
              <span className="wander-yacht-detail-label">
                <FiMail size={14} />
                Email
              </span>
              <span className="wander-yacht-detail-value">{yacht.email || '—'}</span>
            </div>
            <div className="wander-yacht-detail-item">
              <span className="wander-yacht-detail-label">
                <FiPhone size={14} />
                Phone
              </span>
              <span className="wander-yacht-detail-value">{yacht.phone_number || '—'}</span>
            </div>
          </div>

          <div className="wander-yacht-detail-info-card amenities">
            <h3>Amenities</h3>
            <div className="wander-yacht-detail-amenities">
              {getAmenityBadge('Certified Captain', yacht.certified_captain)}
              {getAmenityBadge('Fuel Included', yacht.fuel)}
              {getAmenityBadge('Water Toys', yacht.water_toys)}
              {getAmenityBadge('VIP Host', yacht.vip_host)}
              {getAmenityBadge('Crew', yacht.crew)}
              {getAmenityBadge('Jet Ski', yacht.jet_sky)}
              {getAmenityBadge('Jacuzzi', yacht.jacuzzi)}
              {getAmenityBadge('Slide', yacht.slide)}
              {getAmenityBadge('Seabob', yacht.seabob)}
              {!yacht.certified_captain && !yacht.fuel && !yacht.water_toys && !yacht.vip_host && !yacht.crew && !yacht.jet_sky && !yacht.jacuzzi && !yacht.slide && !yacht.seabob && (
                <span className="wander-yacht-detail-no-amenities">No amenities available</span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {yacht.description && (
          <div className="wander-yacht-detail-description">
            <h3>Description</h3>
            <p>{yacht.description}</p>
          </div>
        )}
      </div>

      {/* Modal Edit Yacht */}
      <ModalEditYacht
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        yachtId={yacht.yacht_id}
        owners={owners}
      />

      {/* Modal Add Yacht Images */}
      <ModalAddYachtImages
        isOpen={isAddImagesModalOpen}
        onClose={() => setIsAddImagesModalOpen(false)}
        onSuccess={handleAddImagesSuccess}
        yachtId={yacht.yacht_id}
        yachtName={yacht.name}
      />

      {/* Modal Delete Yacht */}
      <ModalDeleteYacht
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        yachtName={yacht.name}
        yachtId={yacht.yacht_id}
        isLoading={isDeleting}
      />
    </div>
  );
}