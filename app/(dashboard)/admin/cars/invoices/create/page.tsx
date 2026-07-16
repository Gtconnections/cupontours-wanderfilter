'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getAllCars, Car, createInvoice } from '@/app/lib/api/carsAdmin';
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

export default function CreateInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  // 🔥 Obtener car_id de los parámetros de URL (si viene desde el listado de facturas)
  const carIdFromUrl = searchParams?.get('car_id');
  
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    invoice_type: 'expenses',
    car_id: carIdFromUrl || '', // 🔥 Si viene de la URL, preseleccionar
    partner_refund: false,
    comment: '',
    price: '0.00',
  });

  // Items de la factura
  const [items, setItems] = useState<InvoiceItem[]>([
    { item: '', quantity: 1, rate: 0, amount: 0 }
  ]);

  // Cargar autos
  useEffect(() => {
    if (isChecking) return;
    
    const hasAuth = checkAuth();
    setIsAuthVerified(true);
    
    if (!hasAuth) {
      router.push('/login');
      return;
    }

    loadCars();
  }, [isChecking, checkAuth, router]);

  const loadCars = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getAllCars();
      setCars(data);
      
      // 🔥 Si no hay car_id en la URL y hay autos disponibles, NO seleccionar automáticamente
      // Solo se selecciona si viene desde el botón del listado
      if (carIdFromUrl) {
        // Verificar que el auto existe
        const carExists = data.some(car => car.id === parseInt(carIdFromUrl));
        if (carExists) {
          setFormData(prev => ({ ...prev, car_id: carIdFromUrl }));
        } else {
          setError('El auto seleccionado no existe');
        }
      }
    } catch (err: any) {
      console.error('❌ Error cargando autos:', err);
      setError(err.message || 'Error al cargar los autos');
    } finally {
      setIsLoading(false);
    }
  }, [carIdFromUrl]);

  // Calcular monto de un item
  const calculateItemAmount = (quantity: number, rate: number): number => {
    return quantity * rate;
  };

  // Calcular total de la factura
  const calculateTotal = (): number => {
    const total = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    return total;
  };

  // Actualizar el precio total cuando cambian los items
  useEffect(() => {
    const total = calculateTotal();
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

      console.log('📤 Enviando payload:', payload);
      
      const result = await createInvoice(payload);
      console.log('✅ Factura creada:', result);
      
      setSuccess('Factura creada exitosamente');
      
      // Redirigir al detalle de la factura
      setTimeout(() => {
        router.push(`/admin/cars/invoice-detail/${result.id}`);
      }, 1500);
      
    } catch (err: any) {
      console.error('Error al crear factura:', err);
      setError(err.message || 'Error al crear la factura');
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

  // 🔥 Verificar si el campo car_id debe estar deshabilitado (si viene de la URL)
  const isCarDisabled = !!carIdFromUrl;

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
          <span className="wander-breadcrumb">Listings / Cars / Create Invoice</span>
          <h2>Create Invoice</h2>
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

      <form onSubmit={handleSubmit} className="wander-create-invoice-form">
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

          {/* Listing - con deshabilitado condicional */}
          <div className="wander-form-group">
            <label htmlFor="car_id">Listing</label>
            <select
              id="car_id"
              name="car_id"
              value={formData.car_id}
              onChange={handleChange}
              required
              disabled={isCarDisabled || isSubmitting}
              style={isCarDisabled ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
            >
              <option value="">Select a value</option>
              {cars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.brand} {car.model} {car.year} (ID: {car.id})
                </option>
              ))}
            </select>
            {isCarDisabled && (
              <span style={{ fontSize: '12px', color: '#717171', marginTop: '4px' }}>
                Auto preseleccionado desde el listado de facturas
              </span>
            )}
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