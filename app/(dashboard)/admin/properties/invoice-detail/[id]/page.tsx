// app/admin/properties/invoice-detail/[id]/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getInvoiceDetail, InvoiceDetail, deleteInvoice, deleteInvoiceImage } from '@/app/lib/api/propertiesAdmin';
import ModalDeleteInvoice from '../../../components/ModalDeleteInvoice';
import ModalAddFiles from '../../../components/ModalAddFiles';
import ModalDeleteFile from '../../../components/ModalDeleteFile';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  FiArrowLeft, 
  FiDollarSign, 
  FiTag, 
  FiCalendar, 
  FiImage,
  FiEdit2,
  FiTrash2,
  FiDownload,
  FiPlus
} from 'react-icons/fi';
import './invoice-detail.css';

const LoadingSkeleton = () => (
  <div className="wander-invoice-detail-container">
    <div className="wander-invoice-detail-header">
      <div>
        <span className="wander-breadcrumb">LISTINGS / PROPERTIES / INVOICE DETAIL</span>
        <h2>Loading invoice...</h2>
      </div>
    </div>
    <div className="wander-invoice-detail-loading">
      <div className="wander-loading-spinner"></div>
      <p>Loading invoice details...</p>
    </div>
  </div>
);

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = parseInt(params.id as string);
  
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estado para el modal de eliminación de factura
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estado para el modal de Add Files
  const [isAddFilesModalOpen, setIsAddFilesModalOpen] = useState(false);

  // Estado para el modal de eliminación de archivo
  const [isDeleteFileModalOpen, setIsDeleteFileModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{ id: number; image: string } | null>(null);
  const [isDeletingFile, setIsDeletingFile] = useState(false);

  const loadInvoiceDetail = useCallback(async () => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getInvoiceDetail(invoiceId);
      console.log('📦 Detalle de factura:', data);
      setInvoice(data);
    } catch (err) {
      console.error('❌ Error cargando factura:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error loading invoice details');
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId, token, isAuthenticated, router]);

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

    if (invoiceId && !isNaN(invoiceId)) {
      loadInvoiceDetail();
    } else {
      setError('Invalid invoice ID');
      setIsLoading(false);
    }
  }, [isAuthenticated, isChecking, loadInvoiceDetail, router, checkAuth, invoiceId]);

  // Manejar eliminación de factura
  const handleDelete = (reason: string) => {
    setIsDeleting(true);
    deleteInvoice(invoiceId, reason)
      .then(() => {
        setToastMessage('🗑️ Invoice deleted successfully!');
        setTimeout(() => setToastMessage(null), 3000);
        
        setIsDeleteModalOpen(false);
        
        setTimeout(() => {
          if (invoice?.listing_id) {
            router.push(`/admin/properties/invoices/${invoice.listing_id}`);
          } else {
            router.push('/admin/properties/profit-and-loss');
          }
        }, 1500);
      })
      .catch((err) => {
        console.error('❌ Error al eliminar factura:', err);
        setToastMessage(`❌ Error: ${(err instanceof Error ? err.message : undefined) || 'Failed to delete invoice'}`);
        setTimeout(() => setToastMessage(null), 3000);
        setIsDeleteModalOpen(false);
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  // 🔥 Manejar eliminación de archivo
  const handleDeleteFile = () => {
    if (!fileToDelete) return;
    
    setIsDeletingFile(true);
    deleteInvoiceImage(fileToDelete.id)
      .then(() => {
        setToastMessage('🗑️ File deleted successfully!');
        setTimeout(() => setToastMessage(null), 3000);
        setIsDeleteFileModalOpen(false);
        setFileToDelete(null);
        loadInvoiceDetail();
      })
      .catch((err) => {
        console.error('❌ Error al eliminar archivo:', err);
        setToastMessage(`❌ Error: ${(err instanceof Error ? err.message : undefined) || 'Failed to delete file'}`);
        setTimeout(() => setToastMessage(null), 3000);
        setIsDeleteFileModalOpen(false);
      })
      .finally(() => {
        setIsDeletingFile(false);
      });
  };

  // 🔥 Éxito al subir archivos
  const handleFilesUploadSuccess = () => {
    setToastMessage('✅ Files uploaded successfully!');
    setTimeout(() => setToastMessage(null), 3000);
    loadInvoiceDetail();
  };

  const generatePDF = () => {
    if (!invoice) return;

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    
    const colors = {
      primary: '#000000',
      secondary: '#717171',
      border: '#ebebeb',
    };

    doc.setFillColor(colors.primary);
    doc.rect(0, 0, pageWidth, 30, 'F');
    
    doc.setTextColor('#ffffff');
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth / 2, 18, { align: 'center' });

    doc.setTextColor(colors.primary);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Invoice #${invoice.id}`, pageWidth / 2, 45, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.secondary);
    doc.text(invoice.title, pageWidth / 2, 53, { align: 'center' });

    doc.setDrawColor(colors.border);
    doc.line(20, 58, pageWidth - 20, 58);

    let yPos = 68;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#444444');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.secondary);
    doc.text('Date:', 30, yPos);
    doc.text('Type:', 110, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#000000');
    doc.text(new Date(invoice.date).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }), 60, yPos);
    
    const typeLabel = invoice.invoice_type === 'expenses' ? 'Expense' : 'Income';
    const typeColor = invoice.invoice_type === 'expenses' ? '#dc2626' : '#16a34a';
    doc.setTextColor(typeColor);
    doc.setFont('helvetica', 'bold');
    doc.text(typeLabel, 140, yPos);
    
    yPos += 10;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.secondary);
    doc.text('Listing:', 30, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#000000');
    doc.text(invoice.listing_name || `Listing #${invoice.listing_id}`, 65, yPos);
    yPos += 10;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.secondary);
    doc.text('Total:', 30, yPos);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#16a34a');
    doc.text(`$${parseFloat(invoice.price).toFixed(2)}`, 65, yPos);
    yPos += 12;

    doc.setDrawColor(colors.border);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 8;

    if (invoice.list_details && invoice.list_details.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(colors.primary);
      doc.text('Items', 20, yPos);
      yPos += 6;

      const itemRows = invoice.list_details.map((detail) => [
        detail.item,
        detail.quantity.toString(),
        `$${parseFloat(detail.rate).toFixed(2)}`,
        `$${parseFloat(detail.amount).toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Item', 'Quantity', 'Rate', 'Amount']],
        body: itemRows,
        theme: 'striped',
        headStyles: {
          fillColor: '#000000',
          textColor: '#ffffff',
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'left',
        },
        bodyStyles: {
          fontSize: 8,
          textColor: '#333333',
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 30 },
          2: { cellWidth: 40 },
          3: { cellWidth: 40 },
        },
        styles: {
          overflow: 'linebreak',
          cellPadding: 3,
        },
      });

      const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || yPos + 20;
      yPos = finalY + 6;

      doc.setDrawColor(colors.border);
      doc.line(20, yPos - 4, pageWidth - 20, yPos - 4);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor('#000000');
      doc.text('Total', 140, yPos + 2);
      doc.setTextColor('#16a34a');
      doc.text(`$${parseFloat(invoice.price).toFixed(2)}`, 185, yPos + 2, { align: 'right' });
      yPos += 10;
    }

    if (invoice.comment) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(colors.secondary);
      doc.text('Observations:', 20, yPos + 4);
      yPos += 6;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor('#444444');
      
      const splitText = doc.splitTextToSize(invoice.comment, 160);
      doc.text(splitText, 20, yPos + 4);
      yPos += splitText.length * 5 + 6;
    }

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor('#999999');
      doc.text(
        `Generated on ${new Date().toLocaleString()} • Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    const fileName = `Invoice_${invoice.id}_${invoice.title.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
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
    if (type === 'expenses') {
      return <span className="wander-invoice-detail-type expense">Expense</span>;
    }
    return <span className="wander-invoice-detail-type income">Income</span>;
  };

  const handleEdit = () => {
    if (invoice) {
      router.push(`/admin/properties/invoices/edit?id=${invoice.id}&listing_id=${invoice.listing_id}`);
    }
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
            <span className="wander-breadcrumb">LISTINGS / PROPERTIES / INVOICE DETAIL</span>
            <h2>Error</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <h3>⚠️ Error loading invoice</h3>
          <p>{error}</p>
          <button onClick={loadInvoiceDetail} className="wander-btn-primary">
            Retry
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
            <span className="wander-breadcrumb">LISTINGS / PROPERTIES / INVOICE DETAIL</span>
            <h2>Invoice not found</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <p>Invoice #{invoiceId} not found</p>
          <button 
            onClick={() => router.push('/admin/properties/profit-and-loss')} 
            className="wander-btn-primary"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wander-invoice-detail-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="wander-toast">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className="wander-invoice-detail-header">
        <div>
          <span className="wander-breadcrumb">LISTINGS / PROPERTIES / INVOICE DETAIL</span>
          <div className="wander-invoice-detail-title-row">
            <h2>Invoice #{invoice.id}</h2>
            <span className="wander-invoice-detail-subtitle">{invoice.title}</span>
          </div>
        </div>
        <div className="wander-invoice-detail-actions">
          <Link 
            href={`/admin/properties/invoices/${invoice.listing_id}`}
            className="wander-btn-secondary"
          >
            <FiArrowLeft size={16} />
            Back to Invoices
          </Link>
          <button 
            onClick={() => setIsAddFilesModalOpen(true)}
            className="wander-btn-add-files"
          >
            <FiPlus size={16} />
            Add Files
          </button>
        </div>
      </header>

      {/* Summary */}
      <div className="wander-invoice-detail-summary">
        <div className="wander-invoice-detail-summary-grid">
          <div className="wander-invoice-detail-summary-card">
            <span className="wander-invoice-detail-summary-label">
              <FiCalendar size={14} />
              Date
            </span>
            <span className="wander-invoice-detail-summary-value">
              {formatDate(invoice.date)}
            </span>
          </div>
          <div className="wander-invoice-detail-summary-card">
            <span className="wander-invoice-detail-summary-label">
              <FiTag size={14} />
              Invoice Type
            </span>
            <span className="wander-invoice-detail-summary-value">
              {getTypeBadge(invoice.invoice_type)}
            </span>
          </div>
          <div className="wander-invoice-detail-summary-card">
            <span className="wander-invoice-detail-summary-label">
              <FiDollarSign size={14} />
              Total
            </span>
            <span className="wander-invoice-detail-summary-value total">
              {formatCurrency(invoice.price)}
            </span>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="wander-invoice-detail-section">
        <h3>Items</h3>
        <div className="wander-invoice-detail-table-container">
          <table className="wander-invoice-detail-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Item</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.list_details && invoice.list_details.length > 0 ? (
                invoice.list_details.map((detail, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td className="wander-invoice-detail-item-name">{detail.item}</td>
                    <td>{detail.quantity}</td>
                    <td>{formatCurrency(detail.rate)}</td>
                    <td className="wander-invoice-detail-amount">
                      {formatCurrency(detail.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="wander-invoice-detail-empty">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
            {invoice.list_details && invoice.list_details.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={4} className="wander-invoice-detail-total-label">
                    Total
                  </td>
                  <td className="wander-invoice-detail-total-amount">
                    {formatCurrency(invoice.price)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Comment */}
      {invoice.comment && (
        <div className="wander-invoice-detail-section">
          <h3>Observations</h3>
          <div className="wander-invoice-detail-comment">
            {invoice.comment}
          </div>
        </div>
      )}

      {/* Files */}
      <div className="wander-invoice-detail-section">
        <div className="wander-invoice-detail-files-header">
          <h3>Files</h3>
          <span className="wander-invoice-detail-files-count">
            {invoice.list_images?.length || 0} file(s)
          </span>
        </div>
        <div className="wander-invoice-detail-files">
          {invoice.list_images && invoice.list_images.length > 0 ? (
            invoice.list_images.map((file) => (
              <div key={file.id} className="wander-invoice-detail-file-item">
                <FiImage size={18} />
                <span>File #{file.id}</span>
                <div className="wander-invoice-detail-file-actions">
                  <a 
                    href={file.image} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="wander-invoice-detail-file-link"
                  >
                    View
                  </a>
                  <button
                    onClick={() => {
                      setFileToDelete(file);
                      setIsDeleteFileModalOpen(true);
                    }}
                    className="wander-invoice-detail-file-delete"
                    title="Delete file"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="wander-invoice-detail-files-empty">
              No files attached
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="wander-invoice-detail-actions-bar">
        <button 
          onClick={handleEdit}
          className="wander-invoice-detail-action-btn"
        >
          <FiEdit2 size={16} />
          Edit
        </button>
        <button 
          onClick={() => setIsDeleteModalOpen(true)}
          className="wander-invoice-detail-action-btn"
        >
          <FiTrash2 size={16} />
          Delete
        </button>
        <button 
          onClick={generatePDF}
          className="wander-invoice-detail-action-btn"
        >
          <FiDownload size={16} />
          Download PDF
        </button>
      </div>

      {/* Modal Delete Invoice */}
      <ModalDeleteInvoice
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
        }}
        onConfirm={handleDelete}
        invoiceId={invoice.id}
        invoiceTitle={invoice.title}
        isLoading={isDeleting}
      />

      {/* Modal Add Files */}
      <ModalAddFiles
        isOpen={isAddFilesModalOpen}
        onClose={() => setIsAddFilesModalOpen(false)}
        onSuccess={handleFilesUploadSuccess}
        invoiceId={invoice.id}
      />

      {/* Modal Delete File */}
      <ModalDeleteFile
        isOpen={isDeleteFileModalOpen}
        onClose={() => {
          setIsDeleteFileModalOpen(false);
          setFileToDelete(null);
        }}
        onConfirm={handleDeleteFile}
        fileId={fileToDelete?.id || 0}
        isLoading={isDeletingFile}
      />
    </div>
  );
}