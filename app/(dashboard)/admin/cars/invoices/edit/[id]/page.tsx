'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getAllCars, Car, getInvoiceDetail, updateInvoice, InvoiceDetailResponse } from '@/app/lib/api/carsAdmin';
import './edit-invoice.css';

interface InvoiceItem {
  item: string;
  quantity: number;
  rate: number;
  amount: number;
}

const LoadingSkeleton = () => (
  <div className="wander-edit-invoice-container">
    <div className="wander-edit-invoice-loading">
      <div className="wander-loading-spinner"></div>
      <p>Cargando...</p>
    </div>
  </div>
);

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = parseInt(params.id as string);
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [cars, setCars] = useState<Car[]>([]);
  const [originalInvoice, setOriginalInvoice] = useState<InvoiceDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    invoice_type: 'expenses',
    car_id: '',
    partner_refund: false,
    comment: '',
    price: '0.00',
  });

  // Items de la factura
  const [items, setItems] = useState<InvoiceItem[]>([
    { item: '', quantity: 1, rate: 0, amount: 0 }
  ]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Cargar autos y detalle de factura en paralelo
      const [carsData, invoiceData] = await Promise.all([
        getAllCars(),
        getInvoiceDetail(invoiceId)
      ]);
      
      setCars(carsData);
      setOriginalInvoice(invoiceData);
      
      // Cargar datos de la factura en el formulario
      setFormData({
        title: invoiceData.title || '',
        date: invoiceData.date || '',
        invoice_type: invoiceData.invoice_type || 'expenses',
        car_id: invoiceData.car_id?.toString() || '',
        partner_refund: invoiceData.partner_refund || false,
        comment: invoiceData.comment || '',
        price: invoiceData.price || '0.00',
      });

      // Cargar items
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
      console.error('❌ Error cargando datos:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId]);

  // Cargar datos
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

    loadData();
  }, [isChecking, checkAuth, router]);

  // Calcular total de la factura
  const calculateTotal = (): number => {
    const total = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    return total;
  };

  // Actualizar el precio total cuando cambian los items
  useEffect(() => {
    const total = calculateTotal();
    // Derived total kept in sync with its own inputs inside the same form state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData(prev => ({ ...prev, price: total.toFixed(2) }));
  }, [items]);

  // Agregar un nuevo item
  const addItem = () => {
    setItems([...items, { item: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  // Eliminar un item
  const removeItem = (index: number) => {
    if (items.length === 1) {
      setError('Debe haber al menos un item');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  // Actualizar un item - VERSIÓN CORREGIDA
const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
  const newItems = [...items];
  
  // Convertir a número si es necesario
  const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
  
  // Asignar el valor según el campo
  if (field === 'item') {
    newItems[index].item = value as string;
  } else if (field === 'quantity') {
    newItems[index].quantity = numValue;
    newItems[index].amount = newItems[index].quantity * newItems[index].rate;
  } else if (field === 'rate') {
    newItems[index].rate = numValue;
    newItems[index].amount = newItems[index].quantity * newItems[index].rate;
  } else if (field === 'amount') {
    // Amount es calculado, pero si se quiere setear manualmente
    newItems[index].amount = numValue;
  }
  
  setItems(newItems);
};

  // Manejar cambios en el formulario principal
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.title.trim()) {
      setError('El título es requerido');
      return;
    }
    if (!formData.car_id) {
      setError('El auto es requerido');
      return;
    }
    if (!formData.date) {
      setError('La fecha es requerida');
      return;
    }

    // Validar items
    const validItems = items.filter(item => item.item.trim() !== '' && item.quantity > 0 && item.rate > 0);
    if (validItems.length === 0) {
      setError('Agrega al menos un item válido (nombre, cantidad y precio)');
      return;
    }

    // Validar que no haya items vacíos
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
        invoice_type: formData.invoice_type,
        car_id: parseInt(formData.car_id),
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

      console.log('📤 Enviando payload PATCH:', payload);
      
      const result = await updateInvoice(invoiceId, payload);
      console.log('✅ Factura actualizada:', result);
      
      setSuccess('Factura actualizada exitosamente');
      
      // Redirigir al detalle de la factura
      setTimeout(() => {
        router.push(`/admin/cars/invoice-detail/${result.id}`);
      }, 1500);
      
    } catch (err) {
      console.error('Error al actualizar factura:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al actualizar la factura');
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

  if (isChecking || !isAuthVerified || isLoading) {
    return <LoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="wander-edit-invoice-container">
      <header className="wander-edit-invoice-header">
        <div>
          <span className="wander-breadcrumb">Listings / Cars / Edit Invoice</span>
          <h2>Edit Invoice #{invoiceId}</h2>
          {originalInvoice && (
            <p className="wander-edit-invoice-subtitle">
              {originalInvoice.brand} {originalInvoice.model} - {originalInvoice.plate}
            </p>
          )}
        </div>
        <button 
          onClick={() => router.back()}
          className="wander-btn-secondary"
        >
          ← Volver
        </button>
      </header>

      {error && (
        <div className="wander-error-state">
          <p>⚠️ {error}</p>
        </div>
      )}

      {success && (
        <div className="wander-success-state">
          <p>✅ {success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="wander-edit-invoice-form">
        <div className="wander-form-grid">
          {/* Título */}
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

          {/* Amount (solo lectura) */}
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

          {/* Fecha */}
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

          {/* Invoice Type */}
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

          {/* Listing - SIEMPRE DESHABILITADO */}
          <div className="wander-form-group">
            <label htmlFor="car_id">Listing</label>
            <select
              id="car_id"
              name="car_id"
              value={formData.car_id}
              onChange={handleChange}
              required
              disabled={true}
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            >
              <option value="">Select a value</option>
              {cars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.brand} {car.model} {car.year} (ID: {car.id})
                </option>
              ))}
            </select>
            <span style={{ fontSize: '12px', color: '#717171', marginTop: '4px' }}>
              El auto no se puede modificar en edición
            </span>
          </div>

          {/* Partner Refund */}
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

        {/* Items Section */}
        <div className="wander-form-section">
          <div className="wander-section-header">
            <h3>Items</h3>
            <button
              type="button"
              onClick={addItem}
              className="wander-btn-add-item"
              disabled={isSubmitting}
            >
              + Add Item
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
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="wander-items-total">
            <span className="wander-items-total-label">Total:</span>
            <span className="wander-items-total-amount">{formatCurrency(calculateTotal())}</span>
          </div>
        </div>

        {/* Comment */}
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
                Guardando...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}