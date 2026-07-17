'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getYachtInvoiceDetail, YachtInvoiceRecord, deleteYachtInvoice, uploadYachtInvoiceImages, deleteYachtInvoiceImage } from '@/app/lib/api/yachtsAdmin';
import { generateYachtInvoicePDF } from '../../../components/YachtInvoicePDF';
import DeleteYachtInvoiceModal from '../../../components/DeleteYachtInvoiceModal';
import AddYachtInvoiceImagesModal from '../../../components/AddYachtInvoiceImagesModal';
import DeleteYachtImageConfirmModal from '../../../components/DeleteYachtImageConfirmModal';
import { FiEdit2, FiPaperclip, FiTrash2, FiFileText, FiArrowLeft, FiEye, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import './invoice-detail.css';

const LoadingSkeleton = () => (
  <div className="wander-invoice-detail-container">
    <div className="wander-invoice-detail-loading">
      <div className="wander-loading-spinner"></div>
      <p>Cargando detalles de la factura...</p>
    </div>
  </div>
);

export default function YachtInvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = parseInt(params.id as string);

  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();

  const [invoice, setInvoice] = useState<YachtInvoiceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddImagesModal, setShowAddImagesModal] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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
      const data = await getYachtInvoiceDetail(invoiceId);
      setInvoice(data);
    } catch (err) {
      console.error('Error cargando factura:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al cargar los detalles de la factura');
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId, token, isAuthenticated, router]);

  useEffect(() => {
    if (isChecking) return;

    const hasAuth = checkAuth();
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const handleDeleteInvoice = async (comment: string) => {
    setIsDeleting(true);
    try {
      await deleteYachtInvoice(invoiceId, comment);
      setShowDeleteModal(false);
      if (invoice) {
        router.push(`/admin/yachts/invoices/${invoice.yacht_id}`);
      } else {
        router.push('/admin/yachts/list');
      }
    } catch (err) {
      console.error('Error al eliminar factura:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al eliminar la factura');
      setIsDeleting(false);
    }
  };

  const handleUploadImages = async (id: number, files: File[]) => {
    try {
      await uploadYachtInvoiceImages(id, files);
      await loadInvoiceDetail();
      setShowAddImagesModal(false);
      setSuccessMessage('Imágenes subidas exitosamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error al subir imágenes:', err);
      throw err;
    }
  };

  const handleGeneratePDF = async () => {
    if (!invoice) return;

    setIsGeneratingPDF(true);
    try {
      await generateYachtInvoicePDF(invoice);
    } catch (err) {
      console.error('Error al generar PDF:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al generar el PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleViewImage = (imageUrl: string) => {
    window.open(imageUrl, '_blank');
  };

  const handleDeleteImageClick = (imageId: number) => {
    setSelectedImageId(imageId);
    setShowDeleteImageModal(true);
  };

  const handleDeleteImage = async (imageId: number) => {
    setIsDeletingImage(true);
    try {
      await deleteYachtInvoiceImage(imageId);
      setShowDeleteImageModal(false);
      await loadInvoiceDetail();
      setSuccessMessage('Imagen eliminada exitosamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error al eliminar imagen:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al eliminar la imagen');
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
            <span className="wander-breadcrumb">Listings / Yachts / Invoice Detail</span>
            <h2>Error</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <h3><FiAlertCircle size={18} /> Error al cargar la factura</h3>
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
            <span className="wander-breadcrumb">Listings / Yachts / Invoice Detail</span>
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
      <header className="wander-invoice-detail-header">
        <div>
          <span className="wander-breadcrumb">Listings / Yachts / Invoice Detail</span>
          <h2>Invoices details</h2>
          <p className="wander-invoice-detail-subtitle">
            Invoice #{invoice.id} - {invoice.title}
          </p>
        </div>
        <div className="wander-invoice-detail-actions">
          <button
            onClick={() => router.push(`/admin/yachts/invoices/edit/${invoice.id}`)}
            className="wander-btn-edit"
          >
            <FiEdit2 size={14} />
            Edit invoice
          </button>
          <button
            onClick={() => setShowAddImagesModal(true)}
            className="wander-btn-add-files"
          >
            <FiPaperclip size={14} />
            Add files
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="wander-btn-delete"
          >
            <FiTrash2 size={14} />
            Delete invoice
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
              <>
                <FiFileText size={14} />
                Open pdf
              </>
            )}
          </button>
          <button
            onClick={() => router.back()}
            className="wander-btn-secondary"
          >
            <FiArrowLeft size={14} />
            Volver
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
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <FiCheckCircle size={14} /> {successMessage}
        </div>
      )}

      <div className="wander-invoice-detail-content">
        <div className="wander-invoice-detail-card">
          <div className="wander-invoice-detail-card-header">
            <h3>
              Invoice #{invoice.id} - {invoice.title}
            </h3>
            <div className="wander-invoice-detail-car-info">
              <span className="wander-invoice-car-name">
                {invoice.yacht_name}
              </span>
              <span className="wander-invoice-car-plate">({invoice.lenght} ft)</span>
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
                      <button
                        onClick={() => handleViewImage(image.image)}
                        className="wander-file-action-btn wander-file-action-view"
                        title="Ver imagen"
                      >
                        <FiEye size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteImageClick(image.id)}
                        className="wander-file-action-btn wander-file-action-delete"
                        title="Eliminar imagen"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="wander-invoice-detail-files-empty">
              <FiPaperclip className="wander-empty-icon" />
              <p>No hay archivos adjuntos</p>
            </div>
          )}
        </div>
      </div>

      <DeleteYachtInvoiceModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteInvoice}
        isLoading={isDeleting}
        invoiceTitle={invoice.title}
        invoiceId={invoice.id}
      />

      <AddYachtInvoiceImagesModal
        isOpen={showAddImagesModal}
        invoiceId={invoiceId}
        onClose={() => setShowAddImagesModal(false)}
        onUpload={handleUploadImages}
      />

      <DeleteYachtImageConfirmModal
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
