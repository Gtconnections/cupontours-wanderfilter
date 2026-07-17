// app/admin/properties/create/page.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/utils/useAuth';
import { 
  getOwners, 
  Owner, 
  createListing, 
  uploadListingImages, 
  updatePrincipalPhoto,
  CreateListingData
} from '@/app/lib/api/propertiesAdmin';
import { 
  FiArrowLeft, 
  FiSave, 
  FiUser, 
  FiHome, 
  FiMapPin, 
  FiDollarSign, 
  FiUsers, 
  FiFileText, 
  FiCheck, 
  FiChevronRight, 
  FiChevronLeft,
  FiUpload,
  FiX,
  FiImage,
  FiTag,
  FiPercent,
  FiDroplet,
  FiStar
} from 'react-icons/fi';
import './create.css';

const LISTING_TYPES = [
  { value: 'house', label: 'House', icon: FiHome },
  { value: 'apartment', label: 'Apartment', icon: FiHome },
  { value: 'mansion', label: 'Mansion', icon: FiStar },
];

const STEPS = [
  { id: 1, label: 'Basic Info', icon: FiHome },
  { id: 2, label: 'Details', icon: FiFileText },
  { id: 3, label: 'Photos', icon: FiImage },
];

export default function CreatePropertyPage() {
  const router = useRouter();
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<CreateListingData>({
    owner_id: 0,
    listing_public_name: '',
    listing_name: '',
    property_id: '',
    listing_type: 'apartment',
    address: '',
    rent_price: 0,
    beds_number: 1,
    baths_number: 1,
    cleaning_fee: 0,
    percentage: 10,
    expenses: '',
    max_of_guest: 2,
    booking_price: 0,
    description: '',
    amenities: [],
  });

  // File states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [principalImageIndex, setPrincipalImageIndex] = useState<number>(-1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔥 Función para obtener el nombre completo del owner
  const getOwnerFullName = (owner: Owner): string => {
    if (owner.user?.first_name && owner.user?.last_name) {
      return `${owner.user.first_name} ${owner.user.last_name}`.trim();
    }
    if (owner.user?.first_name) {
      return owner.user.first_name;
    }
    if (owner.user?.last_name) {
      return owner.user.last_name;
    }
    return owner.user?.username || `Owner #${owner.id}`;
  };

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

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      const ownersData = await getOwners();
      setOwners(ownersData);
    } catch (err) {
      console.error('❌ Error al cargar datos:', err);
      setError('Error al cargar los datos necesarios');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Cargar datos
  useEffect(() => {
    if (isAuthVerified && isAuthenticated) {
      // Fetches data once auth is confirmed.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadData();
    }
  }, [isAuthVerified, isAuthenticated]);

  // Manejar cambios en inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? 0 : Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Manejar selección de archivos
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        setError(`"${file.name}" no es una imagen válida`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(`"${file.name}" excede el tamaño máximo de 10MB`);
        return;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    });

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      setPreviews(prev => [...prev, ...validPreviews]);
      if (principalImageIndex === -1) {
        setPrincipalImageIndex(0);
      }
      setError(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previews[index]);
    setPreviews(prev => prev.filter((_, i) => i !== index));
    if (principalImageIndex === index) {
      setPrincipalImageIndex(-1);
    } else if (principalImageIndex > index) {
      setPrincipalImageIndex(prev => prev - 1);
    }
  };

  const setAsPrincipal = (index: number) => {
    setPrincipalImageIndex(index);
  };

  // Navegación entre pasos
  const goToStep = (step: number) => {
    if (step < 1 || step > STEPS.length) return;
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      // Validaciones por paso
      if (currentStep === 1) {
        if (!formData.owner_id) {
          setError('Please select an owner');
          return;
        }
        if (!formData.listing_public_name.trim()) {
          setError('Please enter a public name');
          return;
        }
        if (!formData.listing_name.trim()) {
          setError('Please enter a listing name');
          return;
        }
        if (!formData.address.trim()) {
          setError('Please enter an address');
          return;
        }
      }
      if (currentStep === 2) {
        if (!formData.description.trim()) {
          setError('Please enter a description');
          return;
        }
      }
      setError(null);
      goToStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setError(null);
      goToStep(currentStep - 1);
    }
  };

  // Enviar formulario
  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validar que haya al menos una imagen
      if (selectedFiles.length === 0) {
        setError('Please upload at least one image');
        setIsLoading(false);
        return;
      }

      // 1. Crear la propiedad
      const listingResult = await createListing(formData);
      console.log('✅ Propiedad creada:', listingResult);
      
      const listingId = listingResult.listing_id;

      // 2. Subir todas las imágenes
      if (selectedFiles.length > 0) {
        await uploadListingImages(listingId, selectedFiles);
        console.log('✅ Imágenes subidas');
      }

      // 3. Establecer la imagen principal
      if (principalImageIndex !== -1 && principalImageIndex < selectedFiles.length) {
        await updatePrincipalPhoto(listingId, selectedFiles[principalImageIndex]);
        console.log('✅ Imagen principal establecida');
      }

      setToastMessage('✅ Property created successfully!');
      setTimeout(() => setToastMessage(null), 3000);

      // Redirigir al detalle de la propiedad
      setTimeout(() => {
        router.push(`/admin/properties/${listingId}`);
      }, 1500);

    } catch (err) {
      console.error('❌ Error al crear propiedad:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al crear la propiedad');
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking || !isAuthVerified) {
    return (
      <div className="wander-create-property-container">
        <div className="wander-create-property-loading">
          <div className="wander-loading-spinner"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="wander-create-property-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="wander-toast">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="wander-create-property-header">
        <div className="wander-create-property-header-content">
          <div>
            <div className="wander-create-property-breadcrumb">
              LISTINGS / PROPERTIES / CREATE
            </div>
            <h1>Create Property</h1>
            <p className="wander-create-property-subtitle">
              Fill in the details to create a new property listing
            </p>
          </div>
          <Link 
            href="/admin/properties/list"
            className="wander-create-property-btn back"
          >
            <FiArrowLeft size={16} />
            Back
          </Link>
        </div>
      </div>

      {/* Wizard Steps */}
      <div className="wander-create-property-wizard">
        <div className="wander-create-property-steps">
          {STEPS.map((step) => (
            <div 
              key={step.id}
              className={`wander-create-property-step ${currentStep >= step.id ? 'active' : ''} ${currentStep === step.id ? 'current' : ''}`}
              onClick={() => goToStep(step.id)}
            >
              <div className="wander-create-property-step-number">
                {currentStep > step.id ? <FiCheck /> : step.id}
              </div>
              <div className="wander-create-property-step-label">
                <step.icon size={16} />
                <span>{step.label}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="wander-create-property-progress">
          <div 
            className="wander-create-property-progress-bar"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Form */}
      <form className="wander-create-property-form">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="wander-create-property-step-content">
            <h2>Basic Information</h2>
            
            <div className="wander-create-property-grid">
              <div className="wander-create-property-field">
                <label className="wander-create-property-label">
                  <FiUser size={16} />
                  Owner
                </label>
                <select
                  name="owner_id"
                  className="wander-create-property-select"
                  value={formData.owner_id}
                  onChange={handleChange}
                  disabled={isLoading || isLoadingData}
                  required
                >
                  <option value={0}>Select an owner</option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {getOwnerFullName(owner)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="wander-create-property-field">
                <label className="wander-create-property-label">
                  <FiTag size={16} />
                  Listing Type
                </label>
                <select
                  name="listing_type"
                  className="wander-create-property-select"
                  value={formData.listing_type}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                >
                  {LISTING_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="wander-create-property-field">
                <label className="wander-create-property-label">
                  <FiHome size={16} />
                  Public Name
                </label>
                <input
                  type="text"
                  name="listing_public_name"
                  className="wander-create-property-input"
                  placeholder="Cozy Downtown Apartment with Skyline View"
                  value={formData.listing_public_name}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="wander-create-property-field">
                <label className="wander-create-property-label">
                  <FiHome size={16} />
                  Listing Name
                </label>
                <input
                  type="text"
                  name="listing_name"
                  className="wander-create-property-input"
                  placeholder="Apartamento Calle 8"
                  value={formData.listing_name}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="wander-create-property-field">
                <label className="wander-create-property-label">
                  <FiTag size={16} />
                  Property ID
                </label>
                <input
                  type="text"
                  name="property_id"
                  className="wander-create-property-input"
                  placeholder="25544MIA"
                  value={formData.property_id}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="wander-create-property-field full-width">
                <label className="wander-create-property-label">
                  <FiMapPin size={16} />
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  className="wander-create-property-input"
                  placeholder="Miami FL, Calle 8"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {currentStep === 2 && (
          <div className="wander-create-property-step-content">
            <h2>Property Details</h2>
            
            <div className="wander-create-property-grid">
              <div className="wander-create-property-field">
                <label className="wander-create-property-label">
                  <FiDroplet size={16} />
                  Beds
                </label>
                <input
                  type="number"
                  name="beds_number"
                  className="wander-create-property-input"
                  value={formData.beds_number}
                  onChange={handleChange}
                  disabled={isLoading}
                  min="0"
                />
              </div>

              <div className="wander-create-property-field">
                <label className="wander-create-property-label">
                  <FiDroplet size={16} />
                  Bathrooms
                </label>
                <input
                  type="number"
                  name="baths_number"
                  className="wander-create-property-input"
                  value={formData.baths_number}
                  onChange={handleChange}
                  disabled={isLoading}
                  min="0"
                  step="0.5"
                />
              </div>

              <div className="wander-create-property-field">
                <label className="wander-create-property-label">
                  <FiUsers size={16} />
                  Max Guests
                </label>
                <input
                  type="number"
                  name="max_of_guest"
                  className="wander-create-property-input"
                  value={formData.max_of_guest}
                  onChange={handleChange}
                  disabled={isLoading}
                  min="1"
                />
              </div>

              <div className="wander-create-property-field">
                <label className="wander-create-property-label">
                  <FiDollarSign size={16} />
                  Rent Price
                </label>
                <input
                  type="number"
                  name="rent_price"
                  className="wander-create-property-input"
                  value={formData.rent_price}
                  onChange={handleChange}
                  disabled={isLoading}
                  min="0"
                />
              </div>

              <div className="wander-create-property-field">
                <label className="wander-create-property-label">
                  <FiDollarSign size={16} />
                  Booking Price
                </label>
                <input
                  type="number"
                  name="booking_price"
                  className="wander-create-property-input"
                  value={formData.booking_price}
                  onChange={handleChange}
                  disabled={isLoading}
                  min="0"
                />
              </div>

              <div className="wander-create-property-field">
                <label className="wander-create-property-label">
                  <FiDollarSign size={16} />
                  Cleaning Fee
                </label>
                <input
                  type="number"
                  name="cleaning_fee"
                  className="wander-create-property-input"
                  value={formData.cleaning_fee}
                  onChange={handleChange}
                  disabled={isLoading}
                  min="0"
                />
              </div>

              <div className="wander-create-property-field">
                <label className="wander-create-property-label">
                  <FiPercent size={16} />
                  Percentage
                </label>
                <input
                  type="number"
                  name="percentage"
                  className="wander-create-property-input"
                  value={formData.percentage}
                  onChange={handleChange}
                  disabled={isLoading}
                  min="0"
                  max="100"
                />
              </div>

              <div className="wander-create-property-field">
                <label className="wander-create-property-label">
                  <FiTag size={16} />
                  Expenses Type
                </label>
                <input
                  type="text"
                  name="expenses"
                  className="wander-create-property-input"
                  placeholder="e.g., Utilities, Maintenance"
                  value={formData.expenses}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="wander-create-property-field full-width">
                <label className="wander-create-property-label">
                  <FiFileText size={16} />
                  Description
                </label>
                <textarea
                  name="description"
                  className="wander-create-property-textarea"
                  placeholder="Write a compelling description of your property..."
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isLoading}
                  rows={6}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Photos */}
        {currentStep === 3 && (
          <div className="wander-create-property-step-content">
            <h2>Upload Photos</h2>
            <p className="wander-create-property-step-description">
              Upload photos of your property. Select one as the main image.
            </p>

            {/* Drop Zone */}
            <div 
              className={`wander-create-property-dropzone ${isDragging ? 'dragging' : ''} ${previews.length > 0 ? 'has-images' : ''}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleDropZoneClick}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInputChange}
                className="wander-create-property-file-input"
                disabled={isLoading}
              />
              
              {previews.length === 0 ? (
                <div className="wander-create-property-drop-content">
                  <FiUpload size={48} />
                  <p>Drop your images here</p>
                  <span>or click to browse</span>
                  <small>PNG, JPG, WEBP (Max 10MB each)</small>
                </div>
              ) : (
                <div className="wander-create-property-image-grid">
                  {previews.map((preview, index) => (
                    <div 
                      key={index} 
                      className={`wander-create-property-image-preview ${principalImageIndex === index ? 'principal' : ''}`}
                    >
                      <img src={preview} alt={`Preview ${index + 1}`} />
                      {principalImageIndex === index && (
                        <div className="wander-create-property-image-principal-badge">Main</div>
                      )}
                      <button
                        className="wander-create-property-image-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        disabled={isLoading}
                      >
                        <FiX size={16} />
                      </button>
                      <button
                        className="wander-create-property-image-principal-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAsPrincipal(index);
                        }}
                        disabled={isLoading || principalImageIndex === index}
                      >
                        <FiStar size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="wander-create-property-image-info">
              <span>{selectedFiles.length} image(s) uploaded</span>
              {principalImageIndex !== -1 && principalImageIndex < selectedFiles.length && (
                <span className="wander-create-property-image-info-principal">
                  <FiStar size={14} />
                  Main image selected
                </span>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="wander-create-property-navigation">
          <div className="wander-create-property-navigation-left">
            {currentStep > 1 && (
              <button
                type="button"
                className="wander-create-property-btn-nav prev"
                onClick={prevStep}
                disabled={isLoading}
              >
                <FiChevronLeft size={18} />
                Previous
              </button>
            )}
          </div>
          <div className="wander-create-property-navigation-right">
            <button
              type="button"
              className="wander-create-property-btn-nav cancel"
              onClick={() => router.push('/admin/properties/list')}
              disabled={isLoading}
            >
              Cancel
            </button>
            {currentStep < STEPS.length ? (
              <button
                type="button"
                className="wander-create-property-btn-nav next"
                onClick={nextStep}
                disabled={isLoading || isLoadingData}
              >
                Next
                <FiChevronRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                className="wander-create-property-btn-nav submit"
                onClick={handleSubmit}
                disabled={isLoading || selectedFiles.length === 0}
              >
                <FiSave size={18} />
                {isLoading ? 'Creating...' : 'Create Property'}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="wander-create-property-error">
            <FiX size={16} />
            {error}
          </div>
        )}
      </form>
    </div>
  );
}