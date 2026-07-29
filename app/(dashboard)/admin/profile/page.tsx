// app/admin/profile/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { 
  getProfile, 
  updateProfile, 
  changePassword,
  UserProfile,
  UpdateProfileData,
  ChangePasswordData
} from '@/app/lib/api/profile';
import ChangePasswordModal from '../components/ChangePasswordModal';
import './profile.css';

const LoadingSkeleton = () => (
  <div className="wander-profile-container">
    <div className="wander-profile-loading">
      <div className="wander-loading-spinner"></div>
      <p>Cargando perfil...</p>
    </div>
  </div>
);

export default function ProfilePage() {
  const router = useRouter();
  const { token, isChecking, isAuthenticated, checkAuth, getProfileId } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipcode: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const loadProfile = useCallback(async (forceRefresh = false) => {
    if (!checkAuth()) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const profileId = getProfileId();
      
      if (!profileId) {
        throw new Error('No se pudo obtener el ID del perfil. Por favor, inicia sesión nuevamente.');
      }

      const data = await getProfile(Number(profileId), forceRefresh);
      
      if (!data || !data.user) {
        throw new Error('Los datos del perfil no tienen la estructura esperada');
      }
      
      setProfile(data);
      
      setFormData({
        first_name: data.user.first_name || '',
        last_name: data.user.last_name || '',
        email: data.user.email || '',
        username: data.user.username || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || '',
        zipcode: data.zipcode?.toString() || '',
      });
    } catch (err) {
      console.error('Error cargando perfil:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al cargar el perfil');
      
      if ((err instanceof Error ? err.message : undefined)?.includes('sesión') || (err instanceof Error ? err.message : undefined)?.includes('autenticación')) {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [checkAuth, router, getProfileId]);

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

    loadProfile();
  }, [isChecking, checkAuth, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData: UpdateProfileData = {
        user: {
          email: formData.email,
          username: formData.username,
          first_name: formData.first_name,
          last_name: formData.last_name,
        },
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zipcode: formData.zipcode,
      };

      await updateProfile(profile.id, updateData);
      setSuccess('Perfil actualizado exitosamente');
      setIsEditing(false);
      await loadProfile(true);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (data: ChangePasswordData) => {
    try {
      await changePassword(data);
    } catch (err) {
      throw err;
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
      <div className="wander-profile-container">
        <div className="wander-error-state">
          <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Error al cargar el perfil
          </h3>
          <p>{error}</p>
          <button onClick={() => loadProfile(true)} className="wander-btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="wander-profile-container">
        <div className="wander-error-state">
          <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Perfil no encontrado
          </h3>
          <p>No se pudo encontrar el perfil del usuario.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wander-profile-container">
      <div className="wander-profile-header">
        <div>
          <span className="wander-breadcrumb">Dashboard / Profile</span>
          <h2>Hello {profile.user?.first_name || 'User'}</h2>
          <p className="wander-profile-subtitle">
            This is your profile page. You can see and manage your personal data
          </p>
        </div>
        <div className="wander-profile-actions">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="wander-btn-primary"
          >
            {isEditing ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Cancelar
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit Profile
              </>
            )}
          </button>
          <button 
            onClick={() => setIsPasswordModalOpen(true)}
            className="wander-btn-secondary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Change Password
          </button>
        </div>
      </div>

      {success && (
        <div className="wander-profile-success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          {success}
        </div>
      )}

      {error && (
        <div className="wander-profile-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          {error}
        </div>
      )}

      <div className="wander-profile-content">
        <form onSubmit={handleSubmit}>
          <div className="wander-profile-section">
            <h3>USER INFORMATION</h3>
            <div className="wander-profile-grid">
              <div className="wander-form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Username"
                />
              </div>
              <div className="wander-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Email"
                />
              </div>
              <div className="wander-form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="First Name"
                />
              </div>
              <div className="wander-form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Last Name"
                />
              </div>
            </div>
          </div>

          <div className="wander-profile-section">
            <h3>PROFILE INFORMATION</h3>
            <div className="wander-profile-grid">
              <div className="wander-form-group">
                <label>Home Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Home Address"
                />
              </div>
              <div className="wander-form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Phone Number"
                />
              </div>
              <div className="wander-form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="City"
                />
              </div>
              <div className="wander-form-group">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="State"
                />
              </div>
              <div className="wander-form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Country"
                />
              </div>
              <div className="wander-form-group">
                <label>Postal Code</label>
                <input
                  type="text"
                  name="zipcode"
                  value={formData.zipcode}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Postal Code"
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="wander-profile-actions-bottom">
              <button
                type="submit"
                className="wander-btn-save"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="wander-spinner"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onChangePassword={handleChangePassword}
      />
    </div>
  );
}