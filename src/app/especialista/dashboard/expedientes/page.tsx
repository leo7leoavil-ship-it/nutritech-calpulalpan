'use client';

import { useCallback, useEffect, useState } from 'react';
import { generateCSV } from '../utils';
import {
  DEFAULT_FILTERS,
  ExpedienteDetalle,
  ExpedienteFilters,
  ExpedientesResponse
} from './types';

// Iconos SVG necesarios para la interfaz (Asegúrate de incluirlos)
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

// ... (Mantenemos tus iconos SVG intactos)

/**
 * Componente principal de la página de Expedientes
 * Optimizada para el Sprint 2: Filtros Estables y UX Fluida
 */
export default function ExpedientesPage() {
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ExpedienteFilters>(DEFAULT_FILTERS);
  const [data, setData] = useState<ExpedientesResponse | null>(null);
  const [selectedDetalle, setSelectedDetalle] = useState<ExpedienteDetalle | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  // 1. Memorizamos la función de carga para evitar que el useEffect se dispare infinitamente
  const loadExpedientes = useCallback(async (currentFilters: ExpedienteFilters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFilters.search) params.set('search', currentFilters.search);
      if (currentFilters.fechaInicio) params.set('fechaInicio', currentFilters.fechaInicio);
      if (currentFilters.fechaFin) params.set('fechaFin', currentFilters.fechaFin);
      params.set('page', currentFilters.page.toString());
      params.set('pageSize', currentFilters.pageSize.toString());

      const response = await fetch(`/api/especialista/expedientes?${params.toString()}`);
      if (!response.ok) throw new Error('Error cargando expedientes');
      
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Efecto de carga con Debounce para la búsqueda (RNF-11: Optimización)
  useEffect(() => {
    const handler = setTimeout(() => {
      loadExpedientes(filters);
    }, 400); // 400ms es el dulce punto entre respuesta rápida y ahorro de recursos

    return () => clearTimeout(handler);
  }, [filters, loadExpedientes]);

  // 3. Manejadores de eventos (Sin prevenir Default porque no son Forms)
  const handleFilterChange = (key: keyof ExpedienteFilters, value: any) => {
    setFilters(prev => ({ 
      ...prev, 
      [key]: value,
      page: key === 'page' ? value : 0 // Reset de página si cambia otro filtro
    }));
  };

  const handleExportCSV = () => {
    if (!data?.data?.length) return;
    const csv = generateCSV(data.data as any);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expedientes_calpulalpan_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const loadDetalle = async (consultaId: string) => {
    setLoadingDetalle(true);
    try {
      const response = await fetch('/api/especialista/expedientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultaId }),
      });
      if (!response.ok) throw new Error('Error al cargar detalle');
      const result = await response.json();
      setSelectedDetalle(result);
      setModalOpen(true);
    } catch (error) {
      alert('Error técnico al recuperar el expediente clínico');
    } finally {
      setLoadingDetalle(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simplificado para Dashboard */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-emerald-900">Módulo de Expedientes</h1>
            <p className="text-gray-500 text-sm">Nutri-Tech: Gestión de Consultas Calpulalpan</p>
          </div>
          <button 
            onClick={() => loadExpedientes(filters)}
            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-all"
            title="Sincronizar datos"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Barra de Herramientas de Filtrado */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Búsqueda Inteligente</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><SearchIcon /></span>
              <input
                type="text"
                placeholder="CURP o Nombre..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Desde</label>
            <input
              type="date"
              value={filters.fechaInicio || ''}
              onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hasta</label>
            <input
              type="date"
              value={filters.fechaFin || ''}
              onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <button
            onClick={handleExportCSV}
            disabled={!data?.data?.length}
            className="flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 transition-all font-medium text-sm"
          >
            <DownloadIcon /> <span className="ml-2">Descargar Reporte</span>
          </button>
        </div>

        {/* ... (Resto de la tabla y Modal) */}
      </div>
      {/* ... (Modal logic) */}
    </div>
  );
}