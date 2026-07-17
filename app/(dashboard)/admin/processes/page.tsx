'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/utils/useAuth';
import { 
  getProcesses, 
  getProcessTypes, 
  deleteProcess,
  updateProcess,
  createProcess,
  createProcessType,
  ProcessCategory, 
  Process,
  ProcessType,
  ProcessFormData
} from '@/app/lib/api/processes';
import ProcessModal from '../components/ProcessModal';
import DeleteProcessModal from '../components/DeleteProcessModal';
import CreateProcessTypeModal from '../components/CreateProcessTypeModal';
import './processes.css';

const LoadingSkeleton = () => (
  <div className="wander-processes-container">
    <div className="wander-processes-header">
      <div>
        <span className="wander-breadcrumb">Dashboard / Processes</span>
        <h2>Cargando procesos...</h2>
      </div>
    </div>
    <div className="wander-processes-loading">
      <div className="wander-loading-spinner"></div>
      <p>Cargando lista de procesos...</p>
    </div>
  </div>
);

// Componente de proceso individual
const ProcessItem = ({ 
  process, 
  onCopy, 
  onEdit, 
  onDelete 
}: { 
  process: Process; 
  onCopy: (process: Process) => void; 
  onEdit: (process: Process) => void; 
  onDelete: (process: Process) => void; 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // 🔥 FUNCIÓN PARA COPIAR DESCRIPCIÓN AL PORTAPAPELES
  const handleCopyDescription = async () => {
    try {
      await navigator.clipboard.writeText(process.description);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      console.log('📋 Descripción copiada al portapapeles');
    } catch (err) {
      console.error('❌ Error al copiar:', err);
      const textarea = document.createElement('textarea');
      textarea.value = process.description;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const getRepetitionLabel = (value: string | null) => {
    if (!value) return null;
    const labels: Record<string, string> = {
      'one_time': 'ONE TIME',
      'daily': 'DAILY',
      'weekly': 'WEEKLY',
      'monthly': 'MONTHLY'
    };
    return labels[value.toLowerCase()] || value.toUpperCase();
  };

  const repetitionLabel = getRepetitionLabel(process.repetition);

  return (
    <div className="wander-process-item">
      <div className="wander-process-item-header">
        <div className="wander-process-item-info">
          <span className="wander-process-item-id">#{process.id}</span>
          <h4 className="wander-process-item-name">{process.name}</h4>
          {repetitionLabel && (
            <span className="wander-process-badge">{repetitionLabel}</span>
          )}
          {copySuccess && (
            <span className="wander-process-badge" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
              ✅ Copiado
            </span>
          )}
        </div>
        <div className="wander-process-item-actions">
          <button
            onClick={handleCopyDescription}
            className="wander-action-btn wander-action-copy"
            title="Copiar descripción"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
          <button
            onClick={() => onEdit(process)}
            className="wander-action-btn wander-action-edit"
            title="Editar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button
            onClick={() => onDelete(process)}
            className="wander-action-btn wander-action-delete"
            title="Eliminar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="wander-action-btn wander-action-expand"
            title={isExpanded ? 'Contraer' : 'Expandir'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points={isExpanded ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}/>
            </svg>
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="wander-process-item-description">
          <p>{process.description}</p>
        </div>
      )}
    </div>
  );
};

// Componente de categoría
const ProcessCategoryGroup = ({ 
  category, 
  onCopy, 
  onEdit, 
  onDelete 
}: { 
  category: ProcessCategory; 
  onCopy: (process: Process) => void; 
  onEdit: (process: Process) => void; 
  onDelete: (process: Process) => void; 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="wander-process-category">
      <div 
        className="wander-process-category-header"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="wander-process-category-info">
          <h3>{category.process_name}</h3>
          <span className="wander-process-count">{category.processes.length} procesos</span>
        </div>
        <button className="wander-process-category-toggle">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points={isCollapsed ? "6 9 12 15 18 9" : "18 15 12 9 6 15"}/>
          </svg>
        </button>
      </div>
      
      {!isCollapsed && (
        <div className="wander-process-category-content">
          {category.processes.length === 0 ? (
            <div className="wander-process-empty">
              <p>No hay procesos en esta categoría</p>
            </div>
          ) : (
            category.processes.map((process) => (
              <ProcessItem
                key={process.id}
                process={process}
                onCopy={onCopy}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default function ProcessesPage() {
  const router = useRouter();
  const { token, isChecking, isAuthenticated, checkAuth } = useAuth();
  
  const [processes, setProcesses] = useState<ProcessCategory[]>([]);
  const [processTypes, setProcessTypes] = useState<ProcessType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para modales
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'edit' | 'create';
    process: Process | null;
  }>({
    isOpen: false,
    mode: 'create',
    process: null,
  });

  // 🔥 Estados para modales de eliminación y crear tipo
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    process: Process | null;
  }>({
    isOpen: false,
    process: null,
  });

  const [isCreateTypeModalOpen, setIsCreateTypeModalOpen] = useState(false);

  // Cargar datos
  const loadData = useCallback(async (forceRefresh = false) => {
    if (!checkAuth()) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [processesData, typesData] = await Promise.all([
        getProcesses(forceRefresh),
        getProcessTypes(forceRefresh)
      ]);
      setProcesses(processesData);
      setProcessTypes(typesData);
    } catch (err) {
      console.error('❌ Error cargando datos:', err);
      setError((err instanceof Error ? err.message : undefined) || 'Error al cargar los procesos');
      
      if ((err instanceof Error ? err.message : undefined)?.includes('sesión') || (err instanceof Error ? err.message : undefined)?.includes('autenticación')) {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [checkAuth, router]);

  // Verificar autenticación
  useEffect(() => {
    if (isChecking) return;

    const hasAuth = checkAuth();
    // Auth check reads cookies/localStorage, only available after mount; deferring
    // to an effect (rather than a lazy initializer) avoids an SSR hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAuthVerified(true);

    if (!hasAuth) {
      console.log('🔒 No autenticado, redirigiendo a login');
      router.push('/login');
      return;
    }

    loadData();
  }, [isChecking, checkAuth, router]);

  // 🔥 MANEJAR ACTUALIZACIÓN DE PROCESO
  const handleUpdateProcess = async (data: ProcessFormData) => {
    if (!modalState.process) return;
    try {
      await updateProcess(modalState.process.id, data);
      await loadData(true);
    } catch (err) {
      throw err;
    }
  };

  // 🔥 MANEJAR CREACIÓN DE PROCESO
  const handleCreateProcess = async (data: ProcessFormData) => {
    try {
      await createProcess(data);
      await loadData(true);
    } catch (err) {
      throw err;
    }
  };

  // 🔥 MANEJAR CREACIÓN DE TIPO DE PROCESO
  const handleCreateProcessType = async (data: { process_name: string; user_position: string }) => {
    try {
      await createProcessType(data);
      await loadData(true);
      setIsCreateTypeModalOpen(false);
    } catch (err) {
      throw err;
    }
  };

  // 🔥 ABRIR MODAL DE CREACIÓN
  const openCreateModal = () => {
    setModalState({
      isOpen: true,
      mode: 'create',
      process: null,
    });
  };

  // 🔥 ABRIR MODAL DE EDICIÓN
  const openEditModal = (process: Process) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      process: process,
    });
  };

  // 🔥 CERRAR MODAL DE PROCESO
  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: 'create',
      process: null,
    });
  };

  // 🔥 ABRIR MODAL DE ELIMINACIÓN
  const openDeleteModal = (process: Process) => {
    setDeleteModalState({
      isOpen: true,
      process: process,
    });
  };

  // 🔥 CERRAR MODAL DE ELIMINACIÓN
  const closeDeleteModal = () => {
    setDeleteModalState({
      isOpen: false,
      process: null,
    });
  };

  // 🔥 MANEJAR ELIMINACIÓN DE PROCESO
  const handleDeleteProcess = async (processId: number) => {
    try {
      await deleteProcess(processId);
      await loadData(true);
      closeDeleteModal();
    } catch (err) {
      console.error('Error al eliminar proceso:', err);
      throw err;
    }
  };

  // 🔥 ABRIR MODAL DE CREAR TIPO
  const openCreateTypeModal = () => {
    setIsCreateTypeModalOpen(true);
  };

  const handleRefresh = async () => {
    await loadData(true);
  };

  const filteredProcesses = searchTerm.trim()
    ? processes.map(category => ({
        ...category,
        processes: category.processes.filter(process =>
          process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          process.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.processes.length > 0)
    : processes;

  if (isChecking || !isAuthVerified) {
    return <LoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="wander-processes-container">
        <div className="wander-processes-header">
          <div>
            <span className="wander-breadcrumb">Dashboard / Processes</span>
            <h2>Error</h2>
          </div>
        </div>
        <div className="wander-error-state">
          <h3>⚠️ Error al cargar procesos</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="wander-btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="wander-processes-container">
      <header className="wander-processes-header">
        <div>
          <span className="wander-breadcrumb">Dashboard / Processes</span>
          <h2>Procesos</h2>
          <p className="wander-processes-subtitle">
            {processes.reduce((acc, cat) => acc + cat.processes.length, 0)} procesos en {processes.length} categorías
          </p>
        </div>
        <div className="wander-processes-actions">
          <button 
            onClick={openCreateTypeModal}
            className="wander-btn-primary"
            style={{ backgroundColor: '#2563eb' }}
          >
            ➕ Add Type
          </button>
          <button 
            onClick={openCreateModal}
            className="wander-btn-primary"
          >
            ➕ Add Process
          </button>
          <button 
            onClick={handleRefresh}
            className="wander-btn-secondary"
          >
            🔄 Actualizar
          </button>
        </div>
      </header>

      <div className="wander-processes-search">
        <div className="wander-search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar procesos por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="wander-search-input"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="wander-clear-search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="wander-processes-list">
        {filteredProcesses.length === 0 ? (
          <div className="wander-processes-empty">
            <span className="wander-empty-icon">📋</span>
            <p>No se encontraron procesos</p>
            <span className="wander-empty-desc">
              {searchTerm ? 'Prueba con otro término de búsqueda' : 'No hay procesos disponibles'}
            </span>
          </div>
        ) : (
          filteredProcesses.map((category) => (
            <ProcessCategoryGroup
              key={category.process_name}
              category={category}
              onCopy={() => {}}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />
          ))
        )}
      </div>

      {/* 🔥 MODAL DE PROCESO (Crear/Editar) */}
      <ProcessModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        process={modalState.process}
        processTypes={processTypes}
        onClose={closeModal}
        onSave={modalState.mode === 'edit' ? handleUpdateProcess : handleCreateProcess}
      />

      {/* 🔥 MODAL DE ELIMINACIÓN */}
      <DeleteProcessModal
        isOpen={deleteModalState.isOpen}
        process={deleteModalState.process}
        onClose={closeDeleteModal}
        onDelete={handleDeleteProcess}
      />

      {/* 🔥 MODAL DE CREAR TIPO DE PROCESO */}
      <CreateProcessTypeModal
        isOpen={isCreateTypeModalOpen}
        onClose={() => setIsCreateTypeModalOpen(false)}
        onCreate={handleCreateProcessType}
      />
    </div>
  );
}