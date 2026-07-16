// app/admin/properties/invoices/create/page.tsx

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getListingsNamesAndIds, ListingSimple, createInvoice, CreateInvoiceData } from '@/app/lib/api/propertiesAdmin';
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
  FiFileText
} from 'react-icons/fi';
import './create.css';

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

function CreateInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingIdParam = searchParams.get('listing_id');
  
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [listings, setListings] = useState<ListingSimple[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [isListingLocked, setIsListingLocked] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [invoiceType, setInvoiceType] = useState('expenses');
  const [selectedListings, setSelectedListings] = useState<number[]>([]);
  const [items, setItems] = useState<InvoiceItem[]>([
    { item: '', quantity: 1, rate: 0, amount: 0 }
  ]);
  const [partnerRefund, setPartnerRefund] = useState(false);
  const [comment, setComment] = useState('');

  // Verificar autenticación
  useEffect(() => {
    if (isChecking) return;
    
    const hasAuth = checkAuth();
    setIsAuthVerified(true);
    
    if (!hasAuth) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, isChecking, checkAuth, router]);

  // Cargar listings
  useEffect(() => {
    if (isAuthVerified && isAuthenticated) {
      loadListings();
    }
  }, [isAuthVerified, isAuthenticated]);

  const loadListings = async () => {
    setIsLoadingListings(true);
    try {
      const data = await getListingsNamesAndIds();
      setListings(data);
      
      // Verificar si viene un listing_id en la URL
      if (listingIdParam) {
        const id = parseInt(listingIdParam);
        const listingExists = data.some(l => l.id === id);
        if (listingExists) {
          setSelectedListings([id]);
          setIsListingLocked(true);
        }
      }
    } catch (err: any) {
      console.error('❌ Error al cargar listings:', err);
      setError('Error loading listings');
    } finally {
      setIsLoadingListings(false);
    }
  };

  // Manejar selección de listings
  const toggleListing = (id: number) => {
    if (isListingLocked) return;
    setSelectedListings(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // Manejar items
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
        // Para el campo item, siempre es string
        newItems[index] = { ...newItems[index], item: value as string };
      } else {
        // Para quantity, rate, amount son números
        const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
        newItems[index] = { ...newItems[index], [field]: numValue };
        
        // Recalcular amount si cambia quantity o rate
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
    if (selectedListings.length === 0) {
      setError('Please select at least one listing');
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
      
      const payload: CreateInvoiceData = {
        title: title.trim(),
        date: date,
        invoice_type: invoiceType,
        list_listings: selectedListings,
        list_details: items.map(item => ({
          item: String(item.item).trim(),
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount
        })),
        partner_refund: partnerRefund,
        comment: comment.trim(),
        price: total.toFixed(2)
      };

      const result = await createInvoice(payload);
      console.log('✅ Factura creada:', result);
      
      setToastMessage('✅ Invoice created successfully!');
      setTimeout(() => setToastMessage(null), 3000);

      // Si es un solo listing, redirigir
      if (selectedListings.length === 1) {
        setTimeout(() => {
          router.push(`/admin/properties/invoices/${selectedListings[0]}`);
        }, 1500);
      } else {
        // Limpiar formulario para múltiples listings
        setTitle('');
        setDate('');
        setInvoiceType('expenses');
        setItems([{ item: '', quantity: 1, rate: 0, amount: 0 }]);
        setPartnerRefund(false);
        setComment('');
        if (!isListingLocked) {
          setSelectedListings([]);
        }
        // Recargar lista de listings
        await loadListings();
        if (listingIdParam) {
          const id = parseInt(listingIdParam);
          setSelectedListings([id]);
        }
      }
      
    } catch (err: any) {
      console.error('❌ Error al crear factura:', err);
      setError(err.message || 'Error creating invoice');
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking || !isAuthVerified) {
    return (
      <div className="wander-create-invoice-container">
        <div className="wander-create-invoice-loading">
          <div className="wander-loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="wander-create-invoice-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="wander-toast">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="wander-create-invoice-header">
        <div className="wander-create-invoice-header-content">
          <div>
            <div className="wander-create-invoice-breadcrumb">
              LISTINGS / PROPERTIES / INVOICES / CREATE
            </div>
            <h1>Create Invoice</h1>
          </div>
          <div className="wander-create-invoice-header-actions">
            <Link 
              href={selectedListings.length === 1 ? `/admin/properties/invoices/${selectedListings[0]}` : '/admin/properties/profit-and-loss'}
              className="wander-create-invoice-btn back"
            >
              <FiArrowLeft size={16} />
              Back
            </Link>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="wander-create-invoice-form">
        <div className="wander-create-invoice-grid">
          {/* Columna izquierda */}
          <div className="wander-create-invoice-section">
            <h2>Invoice Information</h2>
            
            <div className="wander-create-invoice-field">
              <label className="wander-create-invoice-label">
                <FiTag size={16} />
                Title
              </label>
              <input
                type="text"
                className="wander-create-invoice-input"
                placeholder="Enter invoice title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="wander-create-invoice-field">
              <label className="wander-create-invoice-label">
                <FiDollarSign size={16} />
                Amount
              </label>
              <input
                type="text"
                className="wander-create-invoice-input"
                value={calculateTotal().toFixed(2)}
                disabled
                style={{ fontWeight: 600, color: '#16a34a' }}
              />
            </div>

            <div className="wander-create-invoice-field">
              <label className="wander-create-invoice-label">
                <FiCalendar size={16} />
                Date
              </label>
              <input
                type="date"
                className="wander-create-invoice-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="wander-create-invoice-field">
              <label className="wander-create-invoice-label">
                <FiTag size={16} />
                Invoice Type
              </label>
              <select
                className="wander-create-invoice-select"
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

            <div className="wander-create-invoice-field">
              <label className="wander-create-invoice-label">
                <FiList size={16} />
                Listing{isListingLocked ? '' : 's'}
              </label>
              <div className="wander-create-invoice-listings">
                {isLoadingListings ? (
                  <div className="wander-create-invoice-loading-list">Loading listings...</div>
                ) : isListingLocked ? (
                  <div className="wander-create-invoice-listing-locked">
                    {listings.find(l => l.id === selectedListings[0])?.name} (ID: {selectedListings[0]})
                    <span className="wander-create-invoice-locked-badge">Locked</span>
                  </div>
                ) : (
                  <div className="wander-create-invoice-listings-grid">
                    {listings.map((listing) => (
                      <div key={listing.id} className="wander-create-invoice-listing-item">
                        <label className="wander-create-invoice-checkbox-label">
                          <input
                            type="checkbox"
                            checked={selectedListings.includes(listing.id)}
                            onChange={() => toggleListing(listing.id)}
                            disabled={isLoading || isListingLocked}
                          />
                          <span>{listing.name}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                {!isListingLocked && (
                  <div className="wander-create-invoice-selected-count">
                    {selectedListings.length} listing(s) selected
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="wander-create-invoice-section">
            <h2>Items</h2>
            
            <div className="wander-create-invoice-items">
              {items.map((item, index) => (
                <div key={index} className="wander-create-invoice-item">
                  <div className="wander-create-invoice-item-header">
                    <span className="wander-create-invoice-item-number">Item {index + 1}</span>
                    <button
                      type="button"
                      className="wander-create-invoice-item-remove"
                      onClick={() => removeItem(index)}
                      disabled={isLoading}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                  <div className="wander-create-invoice-item-grid">
                    <div className="wander-create-invoice-item-field">
                      <label className="wander-create-invoice-item-label">Item</label>
                      <input
                        type="text"
                        className="wander-create-invoice-input"
                        placeholder="Item name..."
                        value={item.item}
                        onChange={(e) => updateItem(index, 'item', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="wander-create-invoice-item-field">
                      <label className="wander-create-invoice-item-label">Quantity</label>
                      <input
                        type="number"
                        className="wander-create-invoice-input"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        disabled={isLoading}
                        min="1"
                      />
                    </div>
                    <div className="wander-create-invoice-item-field">
                      <label className="wander-create-invoice-item-label">Rate</label>
                      <input
                        type="number"
                        className="wander-create-invoice-input"
                        value={item.rate}
                        onChange={(e) => updateItem(index, 'rate', e.target.value)}
                        disabled={isLoading}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="wander-create-invoice-item-field">
                      <label className="wander-create-invoice-item-label">Amount</label>
                      <input
                        type="text"
                        className="wander-create-invoice-input"
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
                className="wander-create-invoice-add-item"
                onClick={addItem}
                disabled={isLoading}
              >
                <FiPlus size={16} />
                Add Item
              </button>
            </div>

            <div className="wander-create-invoice-field">
              <label className="wander-create-invoice-label">
                <FiFileText size={16} />
                Comments
              </label>
              <textarea
                className="wander-create-invoice-textarea"
                placeholder="Enter comments..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>

            <div className="wander-create-invoice-field">
              <label className="wander-create-invoice-label">Is partner refund?</label>
              <div className="wander-create-invoice-toggle">
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
          <div className="wander-create-invoice-error">
            <FiX size={16} />
            {error}
          </div>
        )}

        <div className="wander-create-invoice-footer">
          <button
            type="button"
            className="wander-create-invoice-btn cancel"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="wander-create-invoice-btn submit"
            disabled={isLoading || selectedListings.length === 0}
          >
            <FiSave size={16} />
            {isLoading ? 'Creating...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CreateInvoicePage() {
  return (
    <Suspense fallback={null}>
      <CreateInvoiceContent />
    </Suspense>
  );
}