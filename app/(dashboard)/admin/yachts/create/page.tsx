// app/admin/yachts/create/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/utils/useAuth';
import { getOwners, createYacht, UpdateYachtData } from '@/app/lib/api/yachtsAdmin';
import { 
  FiArrowLeft, 
  FiSave, 
  FiUser, 
  FiAnchor, 
  FiMaximize, 
  FiUsers, 
  FiHome, 
  FiDroplet, 
  FiDollarSign, 
  FiTag, 
  FiFileText,
  FiX
} from 'react-icons/fi';
import './create.css';

const LoadingSkeleton = () => (
  <div className="wander-create-yacht-container">
    <div className="wander-create-yacht-header">
      <div>
        <span className="wander-breadcrumb">Listings / Yachts / Create</span>
        <h2>Loading...</h2>
      </div>
    </div>
    <div className="wander-create-yacht-loading">
      <div className="wander-loading-spinner"></div>
      <p>Loading owners...</p>
    </div>
  </div>
);

export default function CreateYachtPage() {
  const router = useRouter();
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [owners, setOwners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOwners, setIsLoadingOwners] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAuthVerified, setIsAuthVerified] = useState(false);

  // Form state
  const [formData, setFormData] = useState<UpdateYachtData>({
    owner_id: 0,
    name: '',
    external_id: '',
    description: '',
    length: 0,
    capacity: 0,
    staterooms: 0,
    bathrooms: 0,
    price_full_day: 0,
    price_half_day: 0,
    certified_captain: false,
    fuel: false,
    water_toys: false,
    vip_host: false,
    crew: false,
    jet_sky: false,
    jacuzzi: false,
    slide: false,
    seabob: false,
  });

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

  // Cargar owners
  useEffect(() => {
    if (isAuthVerified && isAuthenticated) {
      loadOwners();
    }
  }, [isAuthVerified, isAuthenticated]);

  const loadOwners = async () => {
    setIsLoadingOwners(true);
    try {
      const data = await getOwners();
      setOwners(data);
      console.log('👥 Owners cargados:', data.length);
    } catch (err: any) {
      console.error('❌ Error al cargar owners:', err);
      setError('Error loading owners');
    } finally {
      setIsLoadingOwners(false);
    }
  };

  // Manejar cambios en inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? 0 : Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Crear yate
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.owner_id) {
      setError('Please select an owner');
      return;
    }
    if (!formData.name.trim()) {
      setError('Please enter a name');
      return;
    }
    if (!formData.external_id.trim()) {
      setError('Please enter an external ID');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('📤 Creando yate:', formData);
      const result = await createYacht(formData);
      console.log('✅ Yate creado:', result);
      
      setToastMessage('✅ Yacht created successfully!');
      setTimeout(() => setToastMessage(null), 3000);
      
      // Redirigir al detalle del yate
      setTimeout(() => {
        router.push(`/admin/yachts/${result.id}`);
      }, 1500);
      
    } catch (err: any) {
      console.error('❌ Error al crear yate:', err);
      setError(err.message || 'Error creating yacht');
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking || !isAuthVerified) {
    return <LoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isLoadingOwners) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="wander-create-yacht-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="wander-toast">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className="wander-create-yacht-header">
        <div>
          <span className="wander-breadcrumb">LISTINGS / YACHTS / CREATE</span>
          <h2>Create Yacht</h2>
        </div>
        <div className="wander-create-yacht-actions">
          <Link 
            href="/admin/yachts/list"
            className="wander-btn-secondary"
          >
            <FiArrowLeft size={16} />
            Back to List
          </Link>
        </div>
      </header>

      {/* Form */}
      <div className="wander-create-yacht-form-container">
        <form onSubmit={handleSubmit} className="wander-create-yacht-form">
          {/* Owner */}
          <div className="wander-create-yacht-field">
            <label className="wander-create-yacht-label">
              <FiUser size={16} />
              Owner
            </label>
            <select
              name="owner_id"
              className="wander-create-yacht-select"
              value={formData.owner_id}
              onChange={handleChange}
              disabled={isLoading}
              required
            >
              <option value={0}>Select an owner</option>
              {owners.map((owner) => {
                const fullName = `${owner.user?.first_name || ''} ${owner.user?.last_name || ''}`.trim();
                return (
                  <option key={owner.id} value={owner.id}>
                    {fullName || owner.user?.username || `Owner #${owner.id}`}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Name y External ID */}
          <div className="wander-create-yacht-row">
            <div className="wander-create-yacht-field">
              <label className="wander-create-yacht-label">
                <FiAnchor size={16} />
                Name
              </label>
              <input
                type="text"
                name="name"
                className="wander-create-yacht-input"
                placeholder="Yacht name..."
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
            <div className="wander-create-yacht-field">
              <label className="wander-create-yacht-label">
                <FiTag size={16} />
                External ID
              </label>
              <input
                type="text"
                name="external_id"
                className="wander-create-yacht-input"
                placeholder="External ID..."
                value={formData.external_id}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="wander-create-yacht-field">
            <label className="wander-create-yacht-label">
              <FiFileText size={16} />
              Description
            </label>
            <textarea
              name="description"
              className="wander-create-yacht-textarea"
              placeholder="Enter description..."
              value={formData.description}
              onChange={handleChange}
              disabled={isLoading}
              rows={3}
            />
          </div>

          {/* Especificaciones */}
          <div className="wander-create-yacht-row">
            <div className="wander-create-yacht-field">
              <label className="wander-create-yacht-label">
                <FiMaximize size={16} />
                Length (ft)
              </label>
              <input
                type="number"
                name="length"
                className="wander-create-yacht-input"
                value={formData.length}
                onChange={handleChange}
                disabled={isLoading}
                min="0"
              />
            </div>
            <div className="wander-create-yacht-field">
              <label className="wander-create-yacht-label">
                <FiUsers size={16} />
                Capacity
              </label>
              <input
                type="number"
                name="capacity"
                className="wander-create-yacht-input"
                value={formData.capacity}
                onChange={handleChange}
                disabled={isLoading}
                min="0"
              />
            </div>
          </div>

          <div className="wander-create-yacht-row">
            <div className="wander-create-yacht-field">
              <label className="wander-create-yacht-label">
                <FiHome size={16} />
                Staterooms
              </label>
              <input
                type="number"
                name="staterooms"
                className="wander-create-yacht-input"
                value={formData.staterooms}
                onChange={handleChange}
                disabled={isLoading}
                min="0"
              />
            </div>
            <div className="wander-create-yacht-field">
              <label className="wander-create-yacht-label">
                <FiDroplet size={16} />
                Bathrooms
              </label>
              <input
                type="number"
                name="bathrooms"
                className="wander-create-yacht-input"
                value={formData.bathrooms}
                onChange={handleChange}
                disabled={isLoading}
                min="0"
              />
            </div>
          </div>

          {/* Precios */}
          <div className="wander-create-yacht-row">
            <div className="wander-create-yacht-field">
              <label className="wander-create-yacht-label">
                <FiDollarSign size={16} />
                Full Day Price
              </label>
              <input
                type="number"
                name="price_full_day"
                className="wander-create-yacht-input"
                value={formData.price_full_day}
                onChange={handleChange}
                disabled={isLoading}
                min="0"
                step="0.01"
              />
            </div>
            <div className="wander-create-yacht-field">
              <label className="wander-create-yacht-label">
                <FiDollarSign size={16} />
                Half Day Price
              </label>
              <input
                type="number"
                name="price_half_day"
                className="wander-create-yacht-input"
                value={formData.price_half_day}
                onChange={handleChange}
                disabled={isLoading}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Amenities - Grid de checkboxes */}
          <div className="wander-create-yacht-section">
            <h3>Amenities</h3>
            <div className="wander-create-yacht-amenities-grid">
              <label className="wander-create-yacht-checkbox">
                <input
                  type="checkbox"
                  name="certified_captain"
                  checked={formData.certified_captain}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                Certified Captain
              </label>
              <label className="wander-create-yacht-checkbox">
                <input
                  type="checkbox"
                  name="fuel"
                  checked={formData.fuel}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                Fuel Included
              </label>
              <label className="wander-create-yacht-checkbox">
                <input
                  type="checkbox"
                  name="water_toys"
                  checked={formData.water_toys}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                Water Toys
              </label>
              <label className="wander-create-yacht-checkbox">
                <input
                  type="checkbox"
                  name="vip_host"
                  checked={formData.vip_host}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                VIP Host
              </label>
              <label className="wander-create-yacht-checkbox">
                <input
                  type="checkbox"
                  name="crew"
                  checked={formData.crew}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                Crew
              </label>
              <label className="wander-create-yacht-checkbox">
                <input
                  type="checkbox"
                  name="jet_sky"
                  checked={formData.jet_sky}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                Jet Ski
              </label>
              <label className="wander-create-yacht-checkbox">
                <input
                  type="checkbox"
                  name="jacuzzi"
                  checked={formData.jacuzzi}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                Jacuzzi
              </label>
              <label className="wander-create-yacht-checkbox">
                <input
                  type="checkbox"
                  name="slide"
                  checked={formData.slide}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                Slide
              </label>
              <label className="wander-create-yacht-checkbox">
                <input
                  type="checkbox"
                  name="seabob"
                  checked={formData.seabob}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                Seabob
              </label>
            </div>
          </div>

          {error && (
            <div className="wander-create-yacht-error">
              <FiX size={16} />
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="wander-create-yacht-footer">
            <button 
              type="button"
              className="wander-create-yacht-btn-cancel" 
              onClick={() => router.push('/admin/yachts/list')}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="wander-create-yacht-btn-submit" 
              disabled={isLoading}
            >
              <FiSave size={16} />
              {isLoading ? 'Creating...' : 'Create Yacht'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}