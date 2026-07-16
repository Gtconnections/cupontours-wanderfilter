'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getInvoiceDetail, InvoiceDetailResponse, deleteInvoice, uploadInvoiceImages, deleteInvoiceImage } from '@/app/lib/api/carsAdmin';
import { generateInvoicePDF } from '../../../components/InvoicePDF';
import DeleteInvoiceModal from '../../../components/DeleteInvoiceModal';
import AddInvoiceImagesModal from '../../../components/AddInvoiceImagesModal';
import DeleteImageConfirmModal from '../../../components/DeleteImageConfirmModal';
import './invoice-detail.css';

const LoadingSkeleton = () => (
  <div className="wander-invoice-detail-container">
    <div className="wander-invoice-detail-loading">
      <div className="wander-loading-spinner"></div>
      <p>Cargando detalles de la factura...</p>
    </div>
  </div>
);

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = parseInt(params.id as string);
  
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [invoice, setInvoice] = useState<InvoiceDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para los modales
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddImagesModal, setShowAddImagesModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // 🔥 Estado para el modal de eliminar imagen
  const [showDeleteImageModal, setShowDeleteImageModal] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadInvoiceDetail = useCallback(async () => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const data = await getInvoiceDetail(invoiceId);
      setInvoice(data);
    } catch (err: any) {
      console.error('❌ Error cargando factura:', err);
      setError(err.message || 'Error al cargar los detalles de la factura');
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId, token, isAuthenticated, router]);

  useEffect(() => {
    if (isChecking) return;
    
    const hasAuth = checkAuth();
    setIsAuthVerified(true);
    
    if (!hasAuth) {
      router.push('/login');
      return;
    }

    if (invoiceId && !isNaN(invoiceId)) {
      loadInvoiceDetail();
    } else {
      setError('ID de factura inválido');
      setIsLoading(false);
    }
  }, [invoiceId, isAuthenticated, isChecking, loadInvoiceDetail, router, checkAuth]);

  // 🔥 Función para eliminar la factura
  const handleDeleteInvoice = async (comment: string) => {
    setIsDeleting(true);
    try {
      await deleteInvoice(invoiceId, comment);
      setShowDeleteModal(false);
      if (invoice) {
        router.push(`/admin/cars/invoices/${invoice.car_id}`);
      } else {
        router.push('/admin/cars/list');
      }
    } catch (err: any) {
      console.error('Error al eliminar factura:', err);
      setError(err.message || 'Error al eliminar la factura');
      setIsDeleting(false);
    }
  };

  // 🔥 Función para subir imágenes
  const handleUploadImages = async (id: number, files: File[]) => {
    setIsUploading(true);
    try {
      await uploadInvoiceImages(id, files);
      await loadInvoiceDetail();
      setShowAddImagesModal(false);
      setSuccessMessage('✅ Imágenes subidas exitosamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error al subir imágenes:', err);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  // 🔥 Función para generar PDF
  const handleGeneratePDF = async () => {
    if (!invoice) return;
    
    setIsGeneratingPDF(true);
    try {
      await generateInvoicePDF(invoice);
    } catch (err: any) {
      console.error('Error al generar PDF:', err);
      setError(err.message || 'Error al generar el PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // 🔥 FUNCIÓN PARA VER IMAGEN
  const handleViewImage = (imageUrl: string) => {
    window.open(imageUrl, '_blank');
  };

  // 🔥 FUNCIÓN PARA ABRIR MODAL DE ELIMINAR IMAGEN
  const handleDeleteImageClick = (imageId: number) => {
    setSelectedImageId(imageId);
    setShowDeleteImageModal(true);
  };

  // 🔥 FUNCIÓN PARA ELIMINAR IMAGEN
  const handleDeleteImage = async (imageId: number) => {
    setIsDeletingImage(true);
    try {
      await deleteInvoiceImage(imageId);
      setShowDeleteImageModal(false);
      await loadInvoiceDetail();
      setSuccessMessage('✅ Imagen eliminada exitosamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error al eliminar imagen:', err);
      setError(err.message || 'Error al eliminar la imagen');
    } finally {
      setIsDeletingImage(false);
      setSelectedImageId(null);
    }
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
      month: 'long',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const getTypeBadge = (type: string) => {
    const isIncome = type === 'incomes';
    return (
      <span className={`wander-invoice-type-badge ${isIncome ? 'income' : 'expense'}`}>
        {isIncome ? 'Income' : 'Expense'}
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
      <div className="wander-invoice-detail-container">
        <div className="wander-invoice-detail-header">
          <div>
            <span className="wander-breadcrumb">Listings / Cars / Invoice Detail</span>
            <h2>Error</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <h3>⚠️ Error al cargar la factura</h3>
          <p>{error}</p>
          <button onClick={loadInvoiceDetail} className="wander-btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="wander-invoice-detail-container">
        <div className="wander-invoice-detail-header">
          <div>
            <span className="wander-breadcrumb">Listings / Cars / Invoice Detail</span>
            <h2>Factura no encontrada</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <p>No se encontró la factura con ID {invoiceId}</p>
          <button onClick={() => router.back()} className="wander-btn-primary">
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wander-invoice-detail-container">
      {/* Cabecera */}
      <header className="wander-invoice-detail-header">
        <div>
          <span className="wander-breadcrumb">Listings / Cars / Invoice Detail</span>
          <h2>Invoices details</h2>
          <p className="wander-invoice-detail-subtitle">
            Invoice #{invoice.id} - {invoice.title}
          </p>
        </div>
        <div className="wander-invoice-detail-actions">
          <button 
            onClick={() => router.push(`/admin/cars/invoices/edit/${invoice.id}`)}
            className="wander-btn-edit"
          >
            ✏️ Edit invoice
          </button>
          <button 
            onClick={() => setShowAddImagesModal(true)}
            className="wander-btn-add-files"
          >
            📎 Add files
          </button>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="wander-btn-delete"
          >
            🗑️ Delete invoice
          </button>
          <button 
            onClick={handleGeneratePDF}
            className="wander-btn-pdf"
            disabled={isGeneratingPDF}
            style={{
              opacity: isGeneratingPDF ? 0.6 : 1,
              cursor: isGeneratingPDF ? 'not-allowed' : 'pointer',
            }}
          >
            {isGeneratingPDF ? (
              <>
                <span className="wander-spinner" style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid #ffffff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}></span>
                Generando...
              </>
            ) : (
              '📄 Open pdf'
            )}
          </button>
          <button 
            onClick={() => router.back()}
            className="wander-btn-secondary"
          >
            ← Volver
          </button>
        </div>
      </header>

      {successMessage && (
        <div className="wander-success-message" style={{
          padding: '12px 16px',
          backgroundColor: '#dcfce7',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          color: '#166534',
          fontSize: '14px',
          marginBottom: '20px',
        }}>
          {successMessage}
        </div>
      )}

      {/* Contenido principal */}
      <div className="wander-invoice-detail-content">
        {/* Información de la factura */}
        <div className="wander-invoice-detail-card">
          <div className="wander-invoice-detail-card-header">
            <h3>
              Invoice #{invoice.id} - {invoice.title}
            </h3>
            <div className="wander-invoice-detail-car-info">
              <span className="wander-invoice-car-name">
                {invoice.brand} {invoice.model} {invoice.year}
              </span>
              <span className="wander-invoice-car-plate">({invoice.plate})</span>
            </div>
          </div>

          <div className="wander-invoice-detail-info-grid">
            <div className="wander-invoice-detail-info-item">
              <span className="wander-invoice-detail-label">Date</span>
              <span className="wander-invoice-detail-value">{formatDate(invoice.date)}</span>
            </div>
            <div className="wander-invoice-detail-info-item">
              <span className="wander-invoice-detail-label">Invoice type</span>
              <span className="wander-invoice-detail-value">{getTypeBadge(invoice.invoice_type)}</span>
            </div>
            <div className="wander-invoice-detail-info-item">
              <span className="wander-invoice-detail-label">Total</span>
              <span className={`wander-invoice-detail-value wander-invoice-total ${invoice.invoice_type === 'incomes' ? 'income' : 'expense'}`}>
                {formatCurrency(invoice.price)}
              </span>
            </div>
            {invoice.comment && (
              <div className="wander-invoice-detail-info-item wander-invoice-detail-comment">
                <span className="wander-invoice-detail-label">Comments</span>
                <span className="wander-invoice-detail-value">{invoice.comment}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabla de items */}
        <div className="wander-invoice-detail-card">
          <h3 className="wander-invoice-detail-section-title">Items</h3>
          <div className="wander-invoice-detail-table-container">
            <table className="wander-invoice-detail-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th>ITEM</th>
                  <th>QUANTITY</th>
                  <th>RATE</th>
                  <th>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {invoice.list_details && invoice.list_details.length > 0 ? (
                  invoice.list_details.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.item}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.rate)}</td>
                      <td>{formatCurrency(item.amount)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="wander-empty-cell">
                      <span className="wander-empty-text">No hay items en esta factura</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 🔥 ARCHIVOS ADJUNTOS CON ACCIONES */}
        <div className="wander-invoice-detail-card">
          <h3 className="wander-invoice-detail-section-title">Files</h3>
          {invoice.list_images && invoice.list_images.length > 0 ? (
            <div className="wander-invoice-detail-files">
              {invoice.list_images.map((image) => (
                <div key={image.id} className="wander-invoice-detail-file-item">
                  <div className="wander-invoice-detail-file-preview">
                    <img src={image.image} alt={`File ${image.id}`} />
                  </div>
                  <div className="wander-invoice-detail-file-info">
                    <span className="wander-invoice-detail-file-id">ID: {image.id}</span>
                    <div className="wander-invoice-detail-file-actions">
                      {/* 🔥 BOTÓN VER */}
                      <button 
                        onClick={() => handleViewImage(image.image)}
                        className="wander-file-action-btn wander-file-action-view"
                        title="Ver imagen"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                      {/* 🔥 BOTÓN ELIMINAR */}
                      <button 
                        onClick={() => handleDeleteImageClick(image.id)}
                        className="wander-file-action-btn wander-file-action-delete"
                        title="Eliminar imagen"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="wander-invoice-detail-files-empty">
              <span className="wander-empty-icon">📎</span>
              <p>No hay archivos adjuntos</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación para eliminar factura */}
      <DeleteInvoiceModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteInvoice}
        isLoading={isDeleting}
        invoiceTitle={invoice.title}
        invoiceId={invoice.id}
      />

      {/* Modal para agregar imágenes */}
      <AddInvoiceImagesModal
        isOpen={showAddImagesModal}
        invoiceId={invoiceId}
        onClose={() => setShowAddImagesModal(false)}
        onUpload={handleUploadImages}
      />

      {/* 🔥 Modal de confirmación para eliminar imagen */}
      <DeleteImageConfirmModal
        isOpen={showDeleteImageModal}
        imageId={selectedImageId || 0}
        onClose={() => {
          setShowDeleteImageModal(false);
          setSelectedImageId(null);
        }}
        onConfirm={handleDeleteImage}
        isLoading={isDeletingImage}
      />
    </div>
  );
}