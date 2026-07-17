// app/admin/properties/invoices/edit/page.tsx

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/utils/useAuth';
import {
  getListingsNamesAndIds,
  ListingSimple,
  getInvoiceDetail,
  InvoiceDetail,
  updateInvoice
} from '@/app/lib/api/propertiesAdmin';
import { 
  FiArrowLeft, 
  FiSave, 
  FiX, 
  FiPlus, 
  FiTrash2,
  FiTag,
  FiCalendar,
  FiDollarSign,
  FiList,
  FiFileText,
  FiLoader
} from 'react-icons/fi';
import './edit.css';

const INVOICE_TYPES = [
  { value: 'expenses', label: 'Expenses' },
  { value: 'incomes', label: 'Incomes' },
];

interface InvoiceItem {
  item: string;
  quantity: number;
  rate: number;
  amount: number;
}

function EditInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get('id');
  const listingIdParam = searchParams.get('listing_id');
  
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [listings, setListings] = useState<ListingSimple[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [isListingLocked, setIsListingLocked] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [invoiceType, setInvoiceType] = useState('expenses');
  const [selectedListing, setSelectedListing] = useState<number>(0);
  const [items, setItems] = useState<InvoiceItem[]>([
    { item: '', quantity: 1, rate: 0, amount: 0 }
  ]);
  const [partnerRefund, setPartnerRefund] = useState(false);
  const [comment, setComment] = useState('');
  const [listingName, setListingName] = useState('');

  // Verificar autenticación
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
  }, [isAuthenticated, isChecking, checkAuth, router]);

  // Cargar datos
  const loadData = async () => {
    setIsLoadingListings(true);
    setIsLoadingInvoice(true);

    try {
      // Cargar listings y detalle en paralelo
      const [listingsData, invoiceData] = await Promise.all([
        getListingsNamesAndIds(),
        getInvoiceDetail(parseInt(invoiceId!))
      ]);

      setListings(listingsData);
      
      // Verificar si viene un listing_id en la URL o usar el de la factura
      let listingId = 0;
      if (listingIdParam) {
        listingId = parseInt(listingIdParam);
        const listingExists = listingsData.some(l => l.id === listingId);
        if (listingExists) {
          setSelectedListing(listingId);
          setIsListingLocked(true);
        }
      } else if (invoiceData.listing_id) {
        listingId = invoiceData.listing_id;
        setSelectedListing(listingId);
        setIsListingLocked(true);
      }

      // Encontrar el nombre del listing
      const foundListing = listingsData.find(l => l.id === listingId);
      setListingName(foundListing?.name || `Listing #${listingId}`);

      // Setear datos de la factura
      setTitle(invoiceData.title || '');
      setDate(invoiceData.date || '');
      setInvoiceType(invoiceData.invoice_type || 'expenses');
      setPartnerRefund(invoiceData.partner_refund || false);
      setComment(invoiceData.comment || '');
      
      // Setear items
      if (invoiceData.list_details && invoiceData.list_details.length > 0) {
        setItems(invoiceData.list_details.map(detail => ({
          item: detail.item || '',
          quantity: detail.quantity || 1,
          rate: parseFloat(detail.rate) || 0,
          amount: parseFloat(detail.amount) || 0
        })));
      } else {
        setItems([{ item: '', quantity: 1, rate: 0, amount: 0 }]);
      }

    } catch (err) {
      console.error('❌ Error al cargar datos:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error loading data');
    } finally {
      setIsLoadingListings(false);
      setIsLoadingInvoice(false);
    }
  };

  // Validar que hay un ID
  useEffect(() => {
    if (isAuthVerified && isAuthenticated) {
      if (!invoiceId) {
        // Validates the route param once auth is confirmed.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setError('No invoice ID provided');
        return;
      }
      loadData();
    }
  }, [isAuthVerified, isAuthenticated, invoiceId]);

  // Manejar cambios en items
  const addItem = () => {
    setItems(prev => [...prev, { item: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      setError('At least one item is required');
      return;
    }
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setItems(prev => {
      const newItems = [...prev];
      
      if (field === 'item') {
        newItems[index] = { ...newItems[index], item: value as string };
      } else {
        const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
        newItems[index] = { ...newItems[index], [field]: numValue };
        
        if (field === 'quantity' || field === 'rate') {
          newItems[index].amount = newItems[index].quantity * newItems[index].rate;
        }
      }
      
      return newItems;
    });
  };

  // Calcular precio total
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!selectedListing) {
      setError('Please select a listing');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    if (!date) {
      setError('Please select a date');
      return;
    }
    
    // Validar items
    for (let i = 0; i < items.length; i++) {
      const itemStr = String(items[i].item || '').trim();
      if (!itemStr) {
        setError(`Please enter an item name for item ${i + 1}`);
        return;
      }
      if (items[i].quantity <= 0) {
        setError(`Quantity must be greater than 0 for item ${i + 1}`);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const total = calculateTotal();
      
      const payload = {
        title: title.trim(),
        date: date,
        invoice_type: invoiceType,
        listing_id: selectedListing,
        list_details: items.map(item => ({
          item: String(item.item).trim(),
          quantity: item.quantity,
          rate: item.rate.toFixed(2),
          amount: item.amount
        })),
        partner_refund: partnerRefund,
        comment: comment.trim(),
        price: total.toFixed(2)
      };

      const result = await updateInvoice(parseInt(invoiceId!), payload);
      console.log('✅ Factura actualizada:', result);
      
      setToastMessage('✅ Invoice updated successfully!');
      setTimeout(() => setToastMessage(null), 3000);

      // Redirigir al detalle de la factura
      setTimeout(() => {
        router.push(`/admin/properties/invoice-detail/${invoiceId}`);
      }, 1500);
      
    } catch (err) {
      console.error('❌ Error al actualizar factura:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error updating invoice');
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking || !isAuthVerified) {
    return (
      <div className="wander-edit-invoice-container">
        <div className="wander-edit-invoice-loading">
          <div className="wander-loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isLoadingListings || isLoadingInvoice) {
    return (
      <div className="wander-edit-invoice-container">
        <div className="wander-edit-invoice-loading">
          <div className="wander-loading-spinner"></div>
          <p>Loading invoice data...</p>
        </div>
      </div>
    );
  }

  if (error && !invoiceId) {
    return (
      <div className="wander-edit-invoice-container">
        <div className="wander-edit-invoice-header">
          <div className="wander-edit-invoice-header-content">
            <div>
              <div className="wander-edit-invoice-breadcrumb">
                LISTINGS / PROPERTIES / INVOICES / EDIT
              </div>
              <h1>Edit Invoice</h1>
            </div>
          </div>
        </div>
        <div className="wander-edit-invoice-error-state">
          <h3>⚠️ Error</h3>
          <p>{error}</p>
          <button onClick={() => router.back()} className="wander-btn-secondary">
            <FiArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wander-edit-invoice-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="wander-toast">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="wander-edit-invoice-header">
        <div className="wander-edit-invoice-header-content">
          <div>
            <div className="wander-edit-invoice-breadcrumb">
              LISTINGS / PROPERTIES / INVOICES / EDIT
            </div>
            <h1>Edit Invoice</h1>
            {invoiceId && (
              <div className="wander-edit-invoice-subtitle">
                Editing invoice #{invoiceId}
              </div>
            )}
          </div>
          <div className="wander-edit-invoice-header-actions">
            <Link 
              href={selectedListing ? `/admin/properties/invoices/${selectedListing}` : '/admin/properties/profit-and-loss'}
              className="wander-edit-invoice-btn back"
            >
              <FiArrowLeft size={16} />
              Back
            </Link>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="wander-edit-invoice-form">
        <div className="wander-edit-invoice-grid">
          {/* Columna izquierda */}
          <div className="wander-edit-invoice-section">
            <h2>Invoice Information</h2>
            
            <div className="wander-edit-invoice-field">
              <label className="wander-edit-invoice-label">
                <FiTag size={16} />
                Title
              </label>
              <input
                type="text"
                className="wander-edit-invoice-input"
                placeholder="Enter invoice title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="wander-edit-invoice-field">
              <label className="wander-edit-invoice-label">
                <FiDollarSign size={16} />
                Amount
              </label>
              <input
                type="text"
                className="wander-edit-invoice-input"
                value={calculateTotal().toFixed(2)}
                disabled
                style={{ fontWeight: 600, color: '#16a34a' }}
              />
            </div>

            <div className="wander-edit-invoice-field">
              <label className="wander-edit-invoice-label">
                <FiCalendar size={16} />
                Date
              </label>
              <input
                type="date"
                className="wander-edit-invoice-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="wander-edit-invoice-field">
              <label className="wander-edit-invoice-label">
                <FiTag size={16} />
                Invoice Type
              </label>
              <select
                className="wander-edit-invoice-select"
                value={invoiceType}
                onChange={(e) => setInvoiceType(e.target.value)}
                disabled={isLoading}
              >
                {INVOICE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="wander-edit-invoice-field">
              <label className="wander-edit-invoice-label">
                <FiList size={16} />
                Listing
              </label>
              <div className="wander-edit-invoice-listing-locked">
                {listingName}
                <span className="wander-edit-invoice-locked-badge">Locked</span>
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="wander-edit-invoice-section">
            <h2>Items</h2>
            
            <div className="wander-edit-invoice-items">
              {items.map((item, index) => (
                <div key={index} className="wander-edit-invoice-item">
                  <div className="wander-edit-invoice-item-header">
                    <span className="wander-edit-invoice-item-number">Item {index + 1}</span>
                    <button
                      type="button"
                      className="wander-edit-invoice-item-remove"
                      onClick={() => removeItem(index)}
                      disabled={isLoading}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                  <div className="wander-edit-invoice-item-grid">
                    <div className="wander-edit-invoice-item-field">
                      <label className="wander-edit-invoice-item-label">Item</label>
                      <input
                        type="text"
                        className="wander-edit-invoice-input"
                        placeholder="Item name..."
                        value={item.item}
                        onChange={(e) => updateItem(index, 'item', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="wander-edit-invoice-item-field">
                      <label className="wander-edit-invoice-item-label">Quantity</label>
                      <input
                        type="number"
                        className="wander-edit-invoice-input"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        disabled={isLoading}
                        min="1"
                      />
                    </div>
                    <div className="wander-edit-invoice-item-field">
                      <label className="wander-edit-invoice-item-label">Rate</label>
                      <input
                        type="number"
                        className="wander-edit-invoice-input"
                        value={item.rate}
                        onChange={(e) => updateItem(index, 'rate', e.target.value)}
                        disabled={isLoading}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="wander-edit-invoice-item-field">
                      <label className="wander-edit-invoice-item-label">Amount</label>
                      <input
                        type="text"
                        className="wander-edit-invoice-input"
                        value={item.amount.toFixed(2)}
                        disabled
                        style={{ fontWeight: 600, color: '#16a34a' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                className="wander-edit-invoice-add-item"
                onClick={addItem}
                disabled={isLoading}
              >
                <FiPlus size={16} />
                Add Item
              </button>
            </div>

            <div className="wander-edit-invoice-field">
              <label className="wander-edit-invoice-label">
                <FiFileText size={16} />
                Comments
              </label>
              <textarea
                className="wander-edit-invoice-textarea"
                placeholder="Enter comments..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>

            <div className="wander-edit-invoice-field">
              <label className="wander-edit-invoice-label">Is partner refund?</label>
              <div className="wander-edit-invoice-toggle">
                <button
                  type="button"
                  className={`wander-toggle-btn ${!partnerRefund ? 'active' : ''}`}
                  onClick={() => setPartnerRefund(false)}
                  disabled={isLoading}
                >
                  No
                </button>
                <button
                  type="button"
                  className={`wander-toggle-btn ${partnerRefund ? 'active' : ''}`}
                  onClick={() => setPartnerRefund(true)}
                  disabled={isLoading}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="wander-edit-invoice-error">
            <FiX size={16} />
            {error}
          </div>
        )}

        <div className="wander-edit-invoice-footer">
          <button
            type="button"
            className="wander-edit-invoice-btn cancel"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="wander-edit-invoice-btn submit"
            disabled={isLoading || !selectedListing}
          >
            <FiSave size={16} />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EditInvoicePage() {
  return (
    <Suspense fallback={null}>
      <EditInvoiceContent />
    </Suspense>
  );
}