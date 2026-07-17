// components/ProcessModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Process, ProcessType, ProcessFormData, REPETITION_OPTIONS } from '@/app/lib/api/processes';

interface ProcessModalProps {
  isOpen: boolean;
  mode: 'edit' | 'create';
  process: Process | null;
  processTypes: ProcessType[];
  onClose: () => void;
  onSave: (data: ProcessFormData) => Promise<void>;
}

export default function ProcessModal({ 
  isOpen, 
  mode, 
  process, 
  processTypes, 
  onClose, 
  onSave 
}: ProcessModalProps) {
  const [formData, setFormData] = useState<ProcessFormData>({
    name: '',
    repetition: '',
    description: '',
    process_type: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del proceso cuando se abre el modal en modo edición
  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && process) {
      // Modo edición: cargar datos del proceso
      let defaultTypeId = 0;
      
      if (processTypes.length > 0) {
        const matchedType = processTypes.find(type => 
          process.name.toLowerCase().includes(type.process_name.toLowerCase()) ||
          type.process_name.toLowerCase().includes(process.name.toLowerCase())
        );
        defaultTypeId = matchedType ? matchedType.id : processTypes[0].id;
      }

      // Pre-fills the form from the record being edited when the modal opens.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: process.name || '',
        repetition: process.repetition || '',
        description: process.description || '',
        process_type: defaultTypeId,
      });
    } else if (mode === 'create') {
      // Modo creación: campos vacíos
      setFormData({
        name: '',
        repetition: '',
        description: '',
        process_type: processTypes.length > 0 ? processTypes[0].id : 0,
      });
    }
    
    setError(null);
  }, [process, isOpen, mode, processTypes]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'process_type' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('El nombre del proceso es requerido');
      return;
    }

    if (!formData.description.trim()) {
      setError('La descripción del proceso es requerida');
      return;
    }

    if (!formData.process_type || formData.process_type === 0) {
      setError('Debes seleccionar un tipo de proceso');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error('Error al guardar:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al guardar el proceso');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalTitle = mode === 'edit' ? 'Edit Process' : 'Create Process';
  const buttonText = mode === 'edit' ? 'Actualizar Proceso' : 'Crear Proceso';
  const loadingText = mode === 'edit' ? 'Guardando...' : 'Creando...';

  return (
    <div className="wander-modal-overlay" onClick={onClose}>
      <div className="wander-modal wander-modal-process" onClick={(e) => e.stopPropagation()}>
        <div className="wander-modal-header">
          <h2>{modalTitle}</h2>
          <button className="wander-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="wander-modal-form">
          {error && (
            <div className="wander-modal-error">
              ⚠️ {error}
            </div>
          )}

          <div className="wander-form-group">
            <label htmlFor="name">Nombre del Proceso</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nombre del proceso"
              required
              disabled={isLoading}
            />
          </div>

          <div className="wander-form-group">
            <label htmlFor="repetition">Repetición</label>
            <select
              id="repetition"
              name="repetition"
              value={formData.repetition}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="">Select a value</option>
              {REPETITION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="wander-form-group">
            <label htmlFor="process_type">Process Type</label>
            <select
              id="process_type"
              name="process_type"
              value={formData.process_type}
              onChange={handleChange}
              required
              disabled={isLoading}
            >
              <option value={0}>Select a value</option>
              {processTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.process_name}
                </option>
              ))}
            </select>
          </div>

          <div className="wander-form-group">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descripción del proceso..."
              rows={6}
              required
              disabled={isLoading}
            />
          </div>

          <div className="wander-modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="wander-btn-cancel"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="wander-btn-save"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="wander-spinner"></span>
                  {loadingText}
                </>
              ) : (
                buttonText
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}