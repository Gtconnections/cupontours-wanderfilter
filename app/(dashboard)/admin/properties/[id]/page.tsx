// app/admin/properties/[id]/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getPropertyDetail, PropertyDetailResponse, refreshPropertyDetail, deleteListingImage, deleteListing, updatePrincipalPhoto } from '@/app/lib/api/propertiesAdmin';
import {
  FiCamera,
  FiEdit2,
  FiTrash2,
  FiWifi,
  FiCalendar,
  FiFileText,
  FiSearch,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiAlertTriangle,
  FiEye,
  FiCopy,
} from 'react-icons/fi';
import ModalAddWiFi from '../../components/ModalAddWiFi';
import ModalAddImages from '../../components/ModalAddImages';
import ModalConfirmDelete from '../../components/ModalConfirmDelete';
import ModalChangePrincipalImage from '../../components/ModalChangePrincipalImage';
import ModalEditListing from '../../components/ModalEditListing';
import ModalDeleteProperty from '../../components/ModalDeleteProperty';
import './property-detail.css';

const LoadingSkeleton = () => (
  <div className="wander-property-detail-container">
    <div className="wander-property-detail-header">
      <div>
        <span className="wander-breadcrumb">Listings / Properties / Detail</span>
        <h2>Cargando propiedad...</h2>
      </div>
    </div>
    <div className="wander-property-detail-loading">
      <div className="wander-loading-spinner"></div>
      <p>Cargando detalles de la propiedad...</p>
    </div>
  </div>
);

export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = parseInt(params.id as string);
  
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [data, setData] = useState<PropertyDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllPL, setShowAllPL] = useState(false);
  
  // Estados para Lightbox
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<{ id: number; url: string }[]>([]);
  
  // Estados para los modales
  const [isWiFiModalOpen, setIsWiFiModalOpen] = useState(false);
  const [isImagesModalOpen, setIsImagesModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Estado para modal de confirmación de eliminación de imagen
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<{ id: number; url: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estado para modal de cambio de imagen principal
  const [isPrincipalModalOpen, setIsPrincipalModalOpen] = useState(false);

  // Estado para modal de edición de propiedad
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Estado para modal de eliminación de propiedad
  const [isDeletePropertyModalOpen, setIsDeletePropertyModalOpen] = useState(false);
  const [isDeletingProperty, setIsDeletingProperty] = useState(false);

  const loadPropertyDetail = useCallback(async (forceRefresh = false) => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getPropertyDetail(propertyId, forceRefresh);
      console.log('Datos de la propiedad:', result);
      setData(result);
      
      // Actualizar lista de imágenes para el lightbox
      const imageList = result.listing.listing_images?.map(img => ({
        id: img.id,
        url: img.image_url
      })) || [];
      
      // Si hay una foto principal, agregarla al inicio
      if (result.listing.photo) {
        setImages([
          { id: -1, url: result.listing.photo },
          ...imageList
        ]);
      } else {
        setImages(imageList);
      }
      
    } catch (err) {
      console.error('Error cargando propiedad:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al cargar los detalles de la propiedad');
    } finally {
      setIsLoading(false);
    }
  }, [propertyId, token, isAuthenticated, router]);

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

    if (propertyId && !isNaN(propertyId)) {
      loadPropertyDetail();
    } else {
      setError('ID de propiedad inválido');
      setIsLoading(false);
    }
  }, [propertyId, isAuthenticated, isChecking, loadPropertyDetail, router, checkAuth]);

  const handleRefresh = async () => {
    await loadPropertyDetail(true);
  };

  // Manejador de éxito al crear WiFi
  const handleWiFiSuccess = (networkData: { network: string; password: string }) => {
    setData((prevData) => {
      if (!prevData) return prevData;
      return {
        ...prevData,
        network: {
          network: networkData.network,
          password: networkData.password
        }
      };
    });

    showToast('WiFi added successfully!');
  };

  // Manejador de éxito al subir imágenes
  const handleImagesSuccess = async () => {
    await loadPropertyDetail(true);
    showToast('Images uploaded successfully!');
  };

  // Manejador de éxito al cambiar imagen principal
  const handlePrincipalImageSuccess = async () => {
    await loadPropertyDetail(true);
    showToast('Principal image updated successfully!');
  };

  // Manejador de éxito al editar propiedad
  const handleEditSuccess = async () => {
    await loadPropertyDetail(true);
    showToast('Property updated successfully!');
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

  // Abrir modal de confirmación para eliminar imagen
  const confirmDeleteImage = (imageId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const image = images.find(img => img.id === imageId);
    if (!image) return;
    
    setImageToDelete(image);
    setIsDeleteModalOpen(true);
  };

  // Ejecutar eliminación de imagen
  const handleDeleteImage = async () => {
    if (!imageToDelete) return;
    
    setIsDeleting(true);
    
    try {
      await deleteListingImage(imageToDelete.id);
      
      // Eliminar la imagen de la lista local
      setImages(prev => prev.filter(img => img.id !== imageToDelete.id));
      
      // Si la imagen eliminada era la que se estaba mostrando, ajustar índice
      if (currentImageIndex >= images.length - 1) {
        setCurrentImageIndex(Math.max(0, images.length - 2));
      }
      
      // Si no quedan imágenes, cerrar lightbox
      if (images.length <= 1) {
        closeLightbox();
      }
      
      showToast('Image deleted successfully!');

      setIsDeleteModalOpen(false);
      setImageToDelete(null);

      await loadPropertyDetail(true);

    } catch (err) {
      console.error('Error al eliminar imagen:', err);
      showToast((err instanceof Error ? err.message : undefined) || 'Failed to delete image', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Manejar eliminación de propiedad
  const handleDeleteProperty = async () => {
    setIsDeletingProperty(true);
    try {
      await deleteListing(propertyId);

      showToast('Property deleted successfully!');

      setIsDeletePropertyModalOpen(false);

      // Redirigir a la lista de propiedades después de un breve delay
      setTimeout(() => {
        router.push('/admin/properties/list');
      }, 1500);

    } catch (err) {
      console.error('Error al eliminar propiedad:', err);
      showToast((err instanceof Error ? err.message : undefined) || 'Failed to delete property', 'error');
      setIsDeletePropertyModalOpen(false);
    } finally {
      setIsDeletingProperty(false);
    }
  };

  // Función para obtener la información de red correctamente
  const getNetworkInfo = () => {
    if (!data?.network) return { name: 'Not configured', password: '' };
    if (typeof data.network === 'string') return { name: data.network, password: '' };
    if (typeof data.network === 'object' && data.network !== null) {
      return {
        name: data.network.network || 'Not configured',
        password: data.network.password || ''
      };
    }
    return { name: 'Not configured', password: '' };
  };

  const networkInfo = getNetworkInfo();

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
      <div className="wander-property-detail-container">
        <div className="wander-property-detail-header">
          <div>
            <span className="wander-breadcrumb">Listings / Properties / Detail</span>
            <h2>Error</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <h3><FiAlertTriangle size={18} /> Error al cargar la propiedad</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="wander-btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="wander-property-detail-container">
        <div className="wander-property-detail-header">
          <div>
            <span className="wander-breadcrumb">Listings / Properties / Detail</span>
            <h2>Propiedad no encontrada</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <p>No se encontró la propiedad con ID {propertyId}</p>
          <button onClick={() => router.push('/admin/properties/list')} className="wander-btn-primary">
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  const { listing } = data;

  // Manejar "Show More" de PL History
  const plHistory = listing.profit_and_loss_history || [];
  const displayPL = showAllPL ? plHistory : plHistory.slice(0, 12);
  const hasMorePL = plHistory.length > 12;

  return (
    <div className="wander-property-detail-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`wander-toast ${toastType === 'error' ? 'error' : ''}`}>
          {toastMessage}
        </div>
      )}

      {/* Cabecera con acciones principales */}
      <header className="wander-property-detail-header">
        <div>
          <span className="wander-breadcrumb">Listings / Properties / Detail</span>
          <h2>{listing.public_name || listing.name}</h2>
          <p className="wander-property-detail-subtitle">
            ID #{listing.listing_id} • {listing.listing_type} • {listing.address}
          </p>
        </div>
        <div className="wander-property-detail-actions-top">
          <button
            onClick={() => setIsImagesModalOpen(true)}
            className="wander-btn-add-images"
          >
            <FiCamera size={16} /> Add Images
          </button>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="wander-btn-edit"
          >
            <FiEdit2 size={16} /> Edit Property
          </button>
          <button
            onClick={() => setIsDeletePropertyModalOpen(true)}
            className="wander-btn-delete"
          >
            <FiTrash2 size={16} /> Delete
          </button>
        </div>
      </header>

      {/* Acciones secundarias */}
      <div className="wander-property-detail-actions-bottom">
        <button
          onClick={() => setIsWiFiModalOpen(true)}
          className="wander-action-link"
        >
          <FiWifi size={15} /> Add WiFi
        </button>
        <button onClick={() => router.push(`/admin/properties/reservations/${listing.listing_id}`)} className="wander-action-link"><FiCalendar size={15} /> Reservations</button>
        <button onClick={() => router.push(`/admin/properties/invoices/${listing.listing_id}`)} className="wander-action-link"><FiFileText size={15} /> Invoices</button>
      </div>

      {/* Contenido principal */}
      <div className="wander-property-detail-content">
        {/* Galería en Lightbox */}
        {images.length > 0 && (
          <div className="wander-gallery-grid">
            {/* Primera imagen (más grande) - CON BOTÓN PARA CAMBIAR */}
            <div 
              className="wander-gallery-main"
              onClick={() => openLightbox(0)}
            >
              <img src={images[0].url} alt={listing.public_name || listing.name} />
              
              {/* Botón para cambiar imagen principal */}
              <button
                className="wander-gallery-upload-principal"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPrincipalModalOpen(true);
                }}
                title="Change principal image"
              >
                <FiCamera size={16} />
              </button>

              <div className="wander-gallery-overlay">
                <span>Click to view gallery, camera icon to change principal</span>
              </div>
            </div>

            {/* Grid de imágenes pequeñas */}
            <div className="wander-gallery-thumbnails">
              {images.slice(1, 5).map((img, index) => (
                <div
                  key={img.id}
                  className="wander-gallery-thumb"
                  onClick={() => openLightbox(index + 1)}
                >
                  <img src={img.url} alt={`Thumbnail ${index + 1}`} />
                  <div className="wander-gallery-thumb-overlay">
                    <FiSearch size={18} />
                  </div>
                </div>
              ))}
              
              {/* Si hay más de 5 imágenes, mostrar contador */}
              {images.length > 5 && (
                <div 
                  className="wander-gallery-thumb wander-gallery-more"
                  onClick={() => openLightbox(5)}
                >
                  <img src={images[5].url} alt="More images" />
                  <div className="wander-gallery-thumb-overlay">
                    <span>+{images.length - 5}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lightbox Modal */}
        {isLightboxOpen && images.length > 0 && (
          <div className="wander-lightbox-overlay" onClick={closeLightbox}>
            <div className="wander-lightbox-container" onClick={(e) => e.stopPropagation()}>
              {/* Botón cerrar */}
              <button className="wander-lightbox-close" onClick={closeLightbox}>
                <FiX size={22} />
              </button>

              {/* Navegación */}
              {images.length > 1 && (
                <>
                  <button className="wander-lightbox-prev" onClick={goToPrevious}>
                    <FiChevronLeft size={26} />
                  </button>
                  <button className="wander-lightbox-next" onClick={goToNext}>
                    <FiChevronRight size={26} />
                  </button>
                </>
              )}

              {/* Contador */}
              <div className="wander-lightbox-counter">
                {currentImageIndex + 1} / {images.length}
              </div>

              {/* Imagen */}
              <div className="wander-lightbox-image-wrapper">
                <img 
                  src={images[currentImageIndex].url} 
                  alt={`Imagen ${currentImageIndex + 1}`}
                  className="wander-lightbox-image"
                />
                
                {/* Botón eliminar en la imagen - solo para imágenes que no son la principal */}
                {images[currentImageIndex].id !== -1 ? (
                  <button
                    className="wander-lightbox-delete"
                    onClick={(e) => confirmDeleteImage(images[currentImageIndex].id, e)}
                    title="Delete this image"
                  >
                    <FiTrash2 size={18} />
                  </button>
                ) : (
                  <button
                    className="wander-lightbox-upload"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPrincipalModalOpen(true);
                    }}
                    title="Change principal image"
                  >
                    <FiCamera size={20} />
                  </button>
                )}
              </div>

              {/* Miniaturas en la parte inferior */}
              {images.length > 1 && (
                <div className="wander-lightbox-thumbnails">
                  {images.map((img, index) => (
                    <div
                      key={img.id}
                      className={`wander-lightbox-thumb ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img src={img.url} alt={`Thumb ${index + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Información de la propiedad - AHORA EN 2 COLUMNAS */}
        <div className="wander-property-detail-info-grid">
          <div className="wander-property-detail-info-card">
            <h3>Property Information</h3>
            <div className="wander-detail-item">
              <span className="wander-detail-label">ID</span>
              <span className="wander-detail-value">#{listing.listing_id}</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Property ID</span>
              <span className="wander-detail-value">{listing.property_id || '—'}</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Type</span>
              <span className="wander-detail-value">{listing.listing_type}</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Status</span>
              <span className="wander-detail-value">
                <span style={{
                  display: 'inline-block',
                  padding: '4px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: listing.listing_status ? '#dcfce7' : '#fee2e2',
                  color: listing.listing_status ? '#166534' : '#991b1b',
                }}>
                  {listing.listing_status ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Address</span>
              <span className="wander-detail-value">{listing.address}</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Expenses Type</span>
              <span className="wander-detail-value">{listing.expenses_type || '—'}</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Percentage</span>
              <span className="wander-detail-value">{listing.percentage || '0'}%</span>
            </div>
          </div>

          <div className="wander-property-detail-info-card">
            <h3>Owner Information</h3>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Name</span>
              <span className="wander-detail-value">{listing.owner_info.full_name}</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Email</span>
              <span className="wander-detail-value">{listing.owner_info.email || '—'}</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Phone</span>
              <span className="wander-detail-value">{listing.owner_info.phone_number || '—'}</span>
            </div>
          </div>

          <div className="wander-property-detail-info-card">
            <h3>Property Details</h3>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Beds</span>
              <span className="wander-detail-value">{listing.beds}</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Bathrooms</span>
              <span className="wander-detail-value">{listing.bathrooms}</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Max Guests</span>
              <span className="wander-detail-value">{listing.max_of_guest}</span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Cleaning Fee</span>
              <span className="wander-detail-value">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(listing.cleaning_fee)}
              </span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Rent Price</span>
              <span className="wander-detail-value">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(listing.rent)}
              </span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Booking Price</span>
              <span className="wander-detail-value">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(listing.booking_price)}
              </span>
            </div>
          </div>

          <div className="wander-property-detail-info-card">
            <h3>Financial Summary</h3>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Total Earnings</span>
              <span className="wander-detail-value" style={{ color: '#16a34a' }}>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(listing.earnings_data.total_earnings)}
              </span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Monthly Earnings</span>
              <span className="wander-detail-value" style={{ color: '#16a34a' }}>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(listing.earnings_data.total_month_earnings)}
              </span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Last Year Earnings</span>
              <span className="wander-detail-value" style={{ color: '#16a34a' }}>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(listing.earnings_data.last_year_total_earnings)}
              </span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Total Expenses</span>
              <span className="wander-detail-value" style={{ color: '#dc2626' }}>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(listing.expenses_data.total_expenses)}
              </span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Monthly Expenses</span>
              <span className="wander-detail-value" style={{ color: '#dc2626' }}>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(listing.expenses_data.total_month_expenses)}
              </span>
            </div>
            <div className="wander-detail-item">
              <span className="wander-detail-label">Last Year Expenses</span>
              <span className="wander-detail-value" style={{ color: '#dc2626' }}>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(listing.expenses_data.last_year_total_expenses)}
              </span>
            </div>
          </div>
        </div>

        {/* Descripción */}
        {listing.description && (
          <div className="wander-property-detail-description">
            <h3>Description</h3>
            <p>{listing.description}</p>
          </div>
        )}

        {/* Agreements */}
        {listing.agreements && listing.agreements.length > 0 && (
          <div className="wander-property-detail-agreements">
            <h3>Agreements</h3>
            <div className="wander-agreements-list">
              {listing.agreements.map((agreement, index: number) => (
                <div key={index} className="wander-agreement-item">
                  <span className="wander-agreement-title">{agreement.agreements_title}</span>
                  <span className="wander-agreement-date">Expires: {new Date(agreement.expiration_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                  })}</span>
                  {agreement.agreement && (
                    <a href={agreement.agreement} target="_blank" rel="noopener noreferrer" className="wander-agreement-link">
                      <FiFileText size={14} /> View Document
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profit and Loss History */}
        {plHistory.length > 0 && (
          <div className="wander-property-detail-pl">
            <div className="wander-pl-header">
              <h3>Profit and Loss History</h3>
              <span className="wander-pl-count">{plHistory.length} records</span>
            </div>
            <div className="wander-pl-history-table-container">
              <table className="wander-pl-history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Total Income</th>
                    <th>Net Income</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayPL.map((item) => (
                    <tr key={item.id}>
                      <td>{new Date(item.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: '2-digit',
                        year: 'numeric',
                      })}</td>
                      <td style={{ color: '#16a34a' }}>
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(item.total_income)}
                      </td>
                      <td style={{ color: item.net_income >= 0 ? '#16a34a' : '#dc2626' }}>
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(item.net_income)}
                      </td>
                      <td>
                        <Link
                          href={`/admin/properties/profit-and-loss/${item.id}`}
                          className="wander-pl-view-link"
                        >
                          <FiEye size={14} /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {hasMorePL && (
                <div className="wander-pl-show-more">
                  <button 
                    className="wander-btn-secondary"
                    onClick={() => setShowAllPL(!showAllPL)}
                  >
                    {showAllPL ? 'Show Less' : `Show More (${plHistory.length - 12})`}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Network */}
        <div className="wander-property-detail-network">
          <h3>Network Configuration</h3>
          <div className="wander-detail-item">
            <span className="wander-detail-label">Network Name</span>
            <span className="wander-detail-value">{networkInfo.name}</span>
          </div>
          {networkInfo.password && (
            <div className="wander-detail-item">
              <span className="wander-detail-label">Password</span>
              <span className="wander-detail-value" style={{ fontFamily: 'monospace' }}>
                {networkInfo.password}
              </span>
            </div>
          )}
          {networkInfo.name !== 'Not configured' && (
            <div className="wander-detail-item">
              <span className="wander-detail-label"></span>
              <span className="wander-detail-value">
                <button
                  className="wander-share-wifi-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(`Network: ${networkInfo.name} | Password: ${networkInfo.password}`);
                    showToast('WiFi info copied to clipboard!');
                  }}
                >
                  <FiCopy size={14} /> SHARE WIFI LINK
                </button>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Modal Add WiFi */}
      <ModalAddWiFi
        isOpen={isWiFiModalOpen}
        onClose={() => setIsWiFiModalOpen(false)}
        listingId={listing.listing_id}
        listingName={listing.public_name || listing.name}
        onSuccess={handleWiFiSuccess}
      />

      {/* Modal Add Images */}
      <ModalAddImages
        isOpen={isImagesModalOpen}
        onClose={() => setIsImagesModalOpen(false)}
        listingId={listing.listing_id}
        listingName={listing.public_name || listing.name}
        listingIdDisplay={listing.listing_id}
        onSuccess={handleImagesSuccess}
      />

      {/* Modal Confirm Delete Image */}
      <ModalConfirmDelete
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setImageToDelete(null);
        }}
        onConfirm={handleDeleteImage}
        title="Eliminar Imagen"
        message={`¿Estás seguro que deseas eliminar esta imagen?`}
        confirmText="Eliminar Imagen"
        cancelText="Cancelar"
        isLoading={isDeleting}
      />

      {/* Modal Change Principal Image */}
      <ModalChangePrincipalImage
        isOpen={isPrincipalModalOpen}
        onClose={() => setIsPrincipalModalOpen(false)}
        itemId={listing.listing_id}
        itemName={listing.public_name || listing.name}
        currentImage={images.length > 0 ? images[0].url : ''}
        uploadFn={updatePrincipalPhoto}
        onSuccess={handlePrincipalImageSuccess}
      />

      {/* Modal Edit Listing */}
      <ModalEditListing
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        listingId={listing.listing_id}
        data={data}
        onSuccess={handleEditSuccess}
      />

      {/* Modal Delete Property */}
      <ModalDeleteProperty
        isOpen={isDeletePropertyModalOpen}
        onClose={() => {
          setIsDeletePropertyModalOpen(false);
        }}
        onConfirm={handleDeleteProperty}
        propertyName={listing.public_name || listing.name}
        isLoading={isDeletingProperty}
      />
    </div>
  );
}