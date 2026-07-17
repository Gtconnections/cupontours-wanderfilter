'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/lib/utils/useAuth';
import './furnish.css';

interface FurnishItem {
  section: string;
  name: string;
  quantity: string;
}

interface FurnishData {
  list: FurnishItem[];
}

const PROPERTY_TYPES = [
  { id: 0, label: 'STUDIO' },
  { id: 1, label: '1 BEDROOM' },
  { id: 2, label: '2 BEDROOM' },
  { id: 3, label: '3 BEDROOM' },
  { id: 4, label: '4 BEDROOM' },
  { id: 5, label: '5 BEDROOM' },
];

const LoadingSkeleton = () => (
  <div className="wander-furnish-container">
    <div className="wander-furnish-header">
      <div>
        <span className="wander-breadcrumb">Students / Furnish</span>
        <h2>Cargando...</h2>
      </div>
    </div>
    <div className="wander-furnish-loading">
      <div className="wander-loading-spinner"></div>
      <p>Cargando datos de amueblamiento...</p>
    </div>
  </div>
);

export default function FurnishPage() {
  const { isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [selectedType, setSelectedType] = useState<number>(0);
  const [data, setData] = useState<FurnishData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos según el tipo seleccionado
  const loadData = useCallback(async (typeId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/i18n/option_${typeId}.json`);
      if (!response.ok) {
        throw new Error(`Error al cargar option_${typeId}.json`);
      }
      const jsonData: FurnishData = await response.json();
      setData(jsonData);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verificar autenticación
  useEffect(() => {
    if (isChecking) return;
    
    const hasAuth = checkAuth();
    // Auth check reads cookies/localStorage, only available after mount; deferring
    // to an effect (rather than a lazy initializer) avoids an SSR hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAuthVerified(true);
    
    if (!hasAuth) {
      // router.push('/login');
      return;
    }

    loadData(selectedType);
  }, [isChecking, checkAuth, selectedType, loadData]);

  const handleTypeChange = (typeId: number) => {
    setSelectedType(typeId);
  };

  // Agrupar items por sección
  const groupBySection = (items: FurnishItem[]) => {
    const groups: { [key: string]: FurnishItem[] } = {};
    items.forEach(item => {
      if (!groups[item.section]) {
        groups[item.section] = [];
      }
      groups[item.section].push(item);
    });
    return groups;
  };

  const getSectionIcon = (section: string) => {
    const iconMap: Record<string, string> = {
      'Entrance': '🚪',
      'Living Room': '🛋️',
      'Dinning Room': '🍽️',
      'Dining Room': '🍽️',
      'Master Bedroom': '🛏️',
      'Guest Bedroom': '🛏️',
      'Den': '📚',
      'Balcony': '🌅',
      'Appliances': '🔌',
      'plates and bowls': '🍽️',
      'cutlery/silverware': '🍴',
      'Glassware': '🥂',
      'Utensils': '🔪',
      'Cookware': '🍳',
      'linen': '🧵',
      'Miscellaneous': '📦',
    };
    return iconMap[section] || '📌';
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
      <div className="wander-furnish-container">
        <div className="wander-furnish-header">
          <div>
            <span className="wander-breadcrumb">Students / Furnish</span>
            <h2>Error</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <h3>⚠️ Error al cargar los datos</h3>
          <p>{error}</p>
          <button onClick={() => loadData(selectedType)} className="wander-btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="wander-furnish-container">
        <div className="wander-furnish-header">
          <div>
            <span className="wander-breadcrumb">Students / Furnish</span>
            <h2>No hay datos</h2>
          </div>
        </div>
        <div className="wander-empty-state">
          <p>No se encontraron datos para este tipo de propiedad.</p>
        </div>
      </div>
    );
  }

  const groupedData = groupBySection(data.list);
  const sections = Object.keys(groupedData);

  return (
    <div className="wander-furnish-container">
      {/* Cabecera */}
      <header className="wander-furnish-header">
        <div>
          <span className="wander-breadcrumb">Students / Furnish</span>
          <h2>Furniture Standard</h2>
          <p className="wander-furnish-subtitle">
            {data.list.length} items de amueblamiento
          </p>
        </div>
      </header>

      {/* Selector de tipo de propiedad */}
      <div className="wander-furnish-type-selector">
        <div className="wander-type-grid">
          {PROPERTY_TYPES.map((type) => (
            <button
              key={type.id}
              className={`wander-type-btn ${selectedType === type.id ? 'active' : ''}`}
              onClick={() => handleTypeChange(type.id)}
            >
              {type.label}
            </button>
          ))}
        </div>
        <p className="wander-furnish-description">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus, beatae molestiae! 
          Harum cupiditate debitis animi, minima maxime aperiam, tempore possimus blanditiis cum 
          fuga excepturi vel ex, accusantium. Voluptatum, ea, earum.
        </p>
      </div>

      {/* Contenido agrupado por sección */}
      <div className="wander-furnish-content">
        {sections.map((section) => {
          const items = groupedData[section];
          const icon = getSectionIcon(section);
          
          return (
            <div key={section} className="wander-furnish-section">
              <div className="wander-furnish-section-header">
                <span className="wander-furnish-section-icon">{icon}</span>
                <h3 className="wander-furnish-section-title">{section}</h3>
              </div>
              <div className="wander-furnish-table-container">
                <table className="wander-furnish-table">
                  <thead>
                    <tr>
                      <th className="wander-furnish-col-product">PRODUCT NAME</th>
                      <th className="wander-furnish-col-quantity">QUANTITY</th>
                      <th className="wander-furnish-col-link">LINK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="wander-furnish-product-name">{item.name}</td>
                        <td className="wander-furnish-quantity">{item.quantity || '—'}</td>
                        <td className="wander-furnish-link">
                          <button className="wander-furnish-link-btn" title="Agregar enlace">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}