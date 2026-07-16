'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { createCar, uploadPrincipalImage } from '@/app/lib/api/carsAdmin';
import './create-car.css';

// Componente de carga
const LoadingSkeleton = () => (
  <div className="wander-create-car-container">
    <div className="wander-create-car-loading">
      <div className="wander-loading-spinner"></div>
      <p>Cargando...</p>
    </div>
  </div>
);

// Modal de éxito
const SuccessModal = ({ 
  isOpen, 
  carId, 
  carName, 
  onClose, 
  onSaveWithoutImage, 
  onSaveWithImage,
  isUploading 
}: { 
  isOpen: boolean;
  carId: number;
  carName: string;
  onClose: () => void;
  onSaveWithoutImage: () => void;
  onSaveWithImage: (file: File) => Promise<void>;
  isUploading: boolean;
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (file: File) => {
    // Validar que sea PNG
    if (file.type !== 'image/png') {
      alert('Solo se permiten imágenes PNG');
      return;
    }
    
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleSaveWithImage = async () => {
    if (!selectedFile) {
      alert('Por favor, selecciona una imagen PNG');
      return;
    }
    await onSaveWithImage(selectedFile);
  };

  if (!isOpen) return null;

  return (
    <div className="wander-modal-overlay" onClick={onClose}>
      <div className="wander-modal wander-modal-success" onClick={(e) => e.stopPropagation()}>
        <div className="wander-modal-header">
          <h2>¡Auto creado exitosamente!</h2>
          <button className="wander-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="wander-modal-body">
          <p className="wander-success-message">
            The last listing uploaded was <strong>{carName}</strong> with id: {carId}.
          </p>

          <div 
            className={`wander-drop-zone ${dragOver ? 'drag-over' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {previewUrl ? (
              <div className="wander-drop-preview">
                <img src={previewUrl} alt="Preview" />
                <button 
                  className="wander-drop-remove"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <span className="wander-drop-icon">📷</span>
                <p>Select the photo:</p>
                <span className="wander-drop-hint">Drop it!</span>
                <input
                  type="file"
                  accept=".png,image/png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  className="wander-drop-input"
                />
              </>
            )}
          </div>

          <p className="wander-drop-note">
            If you don't want to upload photos press the <strong>CANCEL</strong> button below.
          </p>
        </div>

        <div className="wander-modal-actions">
          <button
            type="button"
            onClick={onSaveWithoutImage}
            className="wander-btn-secondary"
            disabled={isUploading}
          >
            Save Without Image
          </button>
          <button
            type="button"
            onClick={handleSaveWithImage}
            className="wander-btn-primary"
            disabled={isUploading || !selectedFile}
          >
            {isUploading ? (
              <>
                <span className="wander-spinner"></span>
                Subiendo...
              </>
            ) : (
              'Save With Image'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CreateCarPage() {
  const router = useRouter();
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    plate: '',
    rent_price: '',
    external_id: '',
    percentage: 0,
    expenses: 'after_expenses',
    miles: '',
    description: '',
    owner_id: '',
  });

  // Estado del modal
  const [modalOpen, setModalOpen] = useState(false);
  const [createdCarId, setCreatedCarId] = useState<number | null>(null);
  const [createdCarName, setCreatedCarName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Lista de owners (esto debería venir de la API)
  const [owners, setOwners] = useState<{ id: number; name: string }[]>([]);

  // Cargar owners (por ahora usamos datos estáticos, pero idealmente viene de la API)
  useEffect(() => {
    // TODO: Obtener owners de la API
    setOwners([
      { id: 2, name: 'Gerardo Cornejo' },
      { id: 3, name: 'Magnetic Investments' },
      { id: 4, name: 'Wilda Valdez' },
    ]);
  }, []);

  // Verificar autenticación
  useEffect(() => {
    if (isChecking) return;
    
    const hasAuth = checkAuth();
    setIsAuthVerified(true);
    
    if (!hasAuth) {
      router.push('/login');
      return;
    }
    
    setIsLoading(false);
  }, [isChecking, checkAuth, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'percentage' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.brand.trim()) {
      setError('La marca es requerida');
      return;
    }
    if (!formData.model.trim()) {
      setError('El modelo es requerido');
      return;
    }
    if (!formData.owner_id) {
      setError('El dueño es requerido');
      return;
    }
    if (!formData.rent_price || parseFloat(formData.rent_price) <= 0) {
      setError('El precio de renta es requerido y debe ser mayor a 0');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Crear FormData para enviar
      const formDataToSend = new FormData();
      formDataToSend.append('owner_id', formData.owner_id);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('model', formData.model);
      formDataToSend.append('year', formData.year.toString());
      formDataToSend.append('plate', formData.plate);
      formDataToSend.append('rent_price', formData.rent_price);
      formDataToSend.append('external_id', formData.external_id);
      formDataToSend.append('percentage', formData.percentage.toString());
      formDataToSend.append('expenses', formData.expenses);
      formDataToSend.append('miles', formData.miles || '0');
      if (formData.description) {
        formDataToSend.append('description', formData.description);
      }

      const result = await createCar(formDataToSend);
      
      setCreatedCarId(result.car_id);
      setCreatedCarName(`${result.brand} ${result.model} ${result.year}`);
      setModalOpen(true);
      
    } catch (err: any) {
      console.error('Error al crear auto:', err);
      setError(err.message || 'Error al crear el auto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveWithoutImage = () => {
    if (createdCarId) {
      router.push(`/admin/cars/${createdCarId}`);
    }
  };

  const handleSaveWithImage = async (file: File) => {
    if (!createdCarId) return;

    setIsUploading(true);
    try {
      await uploadPrincipalImage(createdCarId, file);
      router.push(`/admin/cars/${createdCarId}`);
    } catch (err: any) {
      console.error('Error al subir imagen:', err);
      alert(err.message || 'Error al subir la imagen');
      setIsUploading(false);
    }
  };

  if (isChecking || !isAuthVerified || isLoading) {
    return <LoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="wander-create-car-container">
      <header className="wander-create-car-header">
        <div>
          <span className="wander-breadcrumb">Listings / Cars / Create</span>
          <h2>Create car</h2>
        </div>
        <button 
          onClick={() => router.push('/admin/cars/list')}
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

      <form onSubmit={handleSubmit} className="wander-create-car-form">
        <div className="wander-form-grid">
          <div className="wander-form-group">
            <label htmlFor="brand">Brand</label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="Brand"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="wander-form-group">
            <label htmlFor="owner_id">Owner</label>
            <select
              id="owner_id"
              name="owner_id"
              value={formData.owner_id}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            >
              <option value="">Select a value</option>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name}
                </option>
              ))}
            </select>
          </div>

          <div className="wander-form-group">
            <label htmlFor="rent_price">Rent price</label>
            <input
              type="number"
              id="rent_price"
              name="rent_price"
              value={formData.rent_price}
              onChange={handleChange}
              placeholder="Rent price"
              step="0.01"
              min="0"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="wander-form-group">
            <label htmlFor="miles">Miles</label>
            <input
              type="number"
              id="miles"
              name="miles"
              value={formData.miles}
              onChange={handleChange}
              placeholder="Miles"
              step="0.01"
              min="0"
              disabled={isSubmitting}
            />
          </div>

          <div className="wander-form-group">
            <label htmlFor="model">Model</label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="Model"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="wander-form-group">
            <label htmlFor="plate">Plate</label>
            <input
              type="text"
              id="plate"
              name="plate"
              value={formData.plate}
              onChange={handleChange}
              placeholder="Plate"
              disabled={isSubmitting}
            />
          </div>

          <div className="wander-form-group">
            <label htmlFor="external_id">External id</label>
            <input
              type="text"
              id="external_id"
              name="external_id"
              value={formData.external_id}
              onChange={handleChange}
              placeholder="External id"
              disabled={isSubmitting}
            />
          </div>

          <div className="wander-form-group">
            <label htmlFor="year">Year</label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              placeholder="Year"
              min="1900"
              max={new Date().getFullYear() + 1}
              disabled={isSubmitting}
            />
          </div>

          <div className="wander-form-group">
            <label htmlFor="expenses">Expenses</label>
            <select
              id="expenses"
              name="expenses"
              value={formData.expenses}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="after_expenses">After Expenses</option>
              <option value="before_expenses">Before Expenses</option>
            </select>
          </div>

          <div className="wander-form-group">
            <label htmlFor="percentage">Percentage</label>
            <input
              type="number"
              id="percentage"
              name="percentage"
              value={formData.percentage}
              onChange={handleChange}
              placeholder="Percentage"
              min="0"
              max="100"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="wander-form-group wander-form-full">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            rows={6}
            disabled={isSubmitting}
          />
        </div>

        <div className="wander-form-actions">
          <button
            type="button"
            onClick={() => router.push('/admin/cars/list')}
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

      {/* Modal de éxito */}
      <SuccessModal
        isOpen={modalOpen}
        carId={createdCarId || 0}
        carName={createdCarName}
        onClose={() => setModalOpen(false)}
        onSaveWithoutImage={handleSaveWithoutImage}
        onSaveWithImage={handleSaveWithImage}
        isUploading={isUploading}
      />
    </div>
  );
}