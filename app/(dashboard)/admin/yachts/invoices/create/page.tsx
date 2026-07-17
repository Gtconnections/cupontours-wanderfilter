'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getAllYachts, Yacht, createYachtInvoice } from '@/app/lib/api/yachtsAdmin';
import { FiArrowLeft, FiPlus, FiX, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import './create-invoice.css';

interface InvoiceItem {
  item: string;
  quantity: number;
  rate: number;
  amount: number;
}

const LoadingSkeleton = () => (
  <div className="wander-create-invoice-container">
    <div className="wander-create-invoice-loading">
      <div className="wander-loading-spinner"></div>
      <p>Cargando...</p>
    </div>
  </div>
);

function CreateYachtInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();

  const yachtIdFromUrl = searchParams?.get('yacht_id');

  const [yachts, setYachts] = useState<Yacht[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    invoice_type: 'expenses',
    yacht_id: yachtIdFromUrl || '',
    partner_refund: false,
    comment: '',
    price: '0.00',
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { item: '', quantity: 1, rate: 0, amount: 0 }
  ]);

  const loadYachts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getAllYachts();
      setYachts(data);

      if (yachtIdFromUrl) {
        const yachtExists = data.some(yacht => yacht.id === parseInt(yachtIdFromUrl));
        if (yachtExists) {
          setFormData(prev => ({ ...prev, yacht_id: yachtIdFromUrl }));
        } else {
          setError('El yate seleccionado no existe');
        }
      }
    } catch (err) {
      console.error('Error cargando yates:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al cargar los yates');
    } finally {
      setIsLoading(false);
    }
  }, [yachtIdFromUrl]);

  useEffect(() => {
    if (isChecking) return;

    const hasAuth = checkAuth();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAuthVerified(true);

    if (!hasAuth) {
      router.push('/login');
      return;
    }

    loadYachts();
  }, [isChecking, checkAuth, router, loadYachts]);

  const calculateTotal = (): number => {
    return items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  useEffect(() => {
    const total = calculateTotal();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData(prev => ({ ...prev, price: total.toFixed(2) }));
  }, [items]);

  const addItem = () => {
    setItems([...items, { item: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      setError('Debe haber al menos un item');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;

    if (field === 'item') {
      newItems[index].item = value as string;
    } else if (field === 'quantity') {
      newItems[index].quantity = numValue;
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    } else if (field === 'rate') {
      newItems[index].rate = numValue;
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    } else if (field === 'amount') {
      newItems[index].amount = numValue;
    }

    setItems(newItems);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('El título es requerido');
      return;
    }
    if (!formData.yacht_id) {
      setError('El yate es requerido');
      return;
    }
    if (!formData.date) {
      setError('La fecha es requerida');
      return;
    }

    const validItems = items.filter(item => item.item.trim() !== '' && item.quantity > 0 && item.rate > 0);
    if (validItems.length === 0) {
      setError('Agrega al menos un item válido (nombre, cantidad y precio)');
      return;
    }

    const hasEmptyItem = items.some(item => item.item.trim() === '');
    if (hasEmptyItem) {
      setError('Todos los items deben tener un nombre');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        title: formData.title,
        date: formData.date,
        invoice_type: formData.invoice_type as 'incomes' | 'expenses',
        yacht_id: parseInt(formData.yacht_id),
        list_details: items.map(item => ({
          item: item.item,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.quantity * item.rate
        })),
        partner_refund: formData.partner_refund,
        comment: formData.comment || '',
        price: formData.price,
      };

      const result = await createYachtInvoice(payload);

      setSuccess('Factura creada exitosamente');

      setTimeout(() => {
        router.push(`/admin/yachts/invoice-detail/${result.id}`);
      }, 1500);

    } catch (err) {
      console.error('Error al crear factura:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al crear la factura');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const isYachtDisabled = !!yachtIdFromUrl;

  if (isChecking || !isAuthVerified || isLoading) {
    return <LoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="wander-create-invoice-container">
      <header className="wander-create-invoice-header">
        <div>
          <span className="wander-breadcrumb">Listings / Yachts / Create Invoice</span>
          <h2>Create Invoice</h2>
        </div>
        <button
          onClick={() => router.back()}
          className="wander-btn-secondary"
        >
          <FiArrowLeft size={16} />
          Volver
        </button>
      </header>

      {error && (
        <div className="wander-error-state">
          <p><FiAlertCircle size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />{error}</p>
        </div>
      )}

      {success && (
        <div className="wander-success-state">
          <p><FiCheckCircle size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="wander-create-invoice-form">
        <div className="wander-form-grid">
          <div className="wander-form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Title"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="wander-form-group">
            <label htmlFor="price">Amount</label>
            <input
              type="text"
              id="price"
              name="price"
              value={formData.price}
              disabled={true}
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed', fontWeight: 600 }}
            />
          </div>

          <div className="wander-form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="wander-form-group">
            <label htmlFor="invoice_type">Invoice type</label>
            <select
              id="invoice_type"
              name="invoice_type"
              value={formData.invoice_type}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="expenses">EXPENSES</option>
              <option value="incomes">INCOMES</option>
            </select>
          </div>

          <div className="wander-form-group">
            <label htmlFor="yacht_id">Listing</label>
            <select
              id="yacht_id"
              name="yacht_id"
              value={formData.yacht_id}
              onChange={handleChange}
              required
              disabled={isYachtDisabled || isSubmitting}
              style={isYachtDisabled ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
            >
              <option value="">Select a value</option>
              {yachts.map((yacht) => (
                <option key={yacht.id} value={yacht.id}>
                  {yacht.name} (ID: {yacht.id})
                </option>
              ))}
            </select>
            {isYachtDisabled && (
              <span style={{ fontSize: '12px', color: '#717171', marginTop: '4px' }}>
                Yate preseleccionado desde el listado de facturas
              </span>
            )}
          </div>

          <div className="wander-form-group wander-checkbox-group">
            <label htmlFor="partner_refund">Is partner refund?</label>
            <div className="wander-checkbox-wrapper">
              <input
                type="checkbox"
                id="partner_refund"
                name="partner_refund"
                checked={formData.partner_refund}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <span>{formData.partner_refund ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        <div className="wander-form-section">
          <div className="wander-section-header">
            <h3>Items</h3>
            <button
              type="button"
              onClick={addItem}
              className="wander-btn-add-item"
              disabled={isSubmitting}
            >
              <FiPlus size={12} />
              Add Item
            </button>
          </div>

          <div className="wander-items-container">
            {items.map((item, index) => (
              <div key={index} className="wander-item-row">
                <div className="wander-item-fields">
                  <div className="wander-form-group wander-item-name">
                    <label>Item {index + 1}</label>
                    <input
                      type="text"
                      value={item.item}
                      onChange={(e) => updateItem(index, 'item', e.target.value)}
                      placeholder="Item name"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="wander-form-group wander-item-quantity">
                    <label>Quantity</label>
                    <input
                      type="number"
                      value={item.quantity || ''}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      placeholder="0"
                      min="0"
                      step="1"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="wander-form-group wander-item-rate">
                    <label>Rate</label>
                    <input
                      type="number"
                      value={item.rate || ''}
                      onChange={(e) => updateItem(index, 'rate', e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="wander-form-group wander-item-amount">
                    <label>Amount</label>
                    <input
                      type="text"
                      value={formatCurrency(item.amount)}
                      disabled={true}
                      style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed', fontWeight: 600 }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="wander-btn-remove-item"
                  disabled={isSubmitting || items.length === 1}
                >
                  <FiX size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="wander-items-total">
            <span className="wander-items-total-label">Total:</span>
            <span className="wander-items-total-amount">{formatCurrency(calculateTotal())}</span>
          </div>
        </div>

        <div className="wander-form-group wander-form-full">
          <label htmlFor="comment">Comment</label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            placeholder="Ningun Comentario"
            rows={3}
            disabled={isSubmitting}
          />
        </div>

        <div className="wander-form-actions">
          <button
            type="button"
            onClick={() => router.back()}
            className="wander-btn-secondary"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="wander-btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="wander-spinner"></span>
                Creando...
              </>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CreateYachtInvoicePage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CreateYachtInvoiceContent />
    </Suspense>
  );
}
