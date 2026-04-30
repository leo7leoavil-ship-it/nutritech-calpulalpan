'use client';

import { createClient } from '@/lib/client';
import { useCallback, useEffect, useState } from 'react';
import {
    DEFAULT_FILTERS,
    ExpedienteDetalle,
    ExpedienteFilters,
    ExpedientesResponse
} from '../types';
import { generateCSV } from '../utils';

// Iconos SVG en línea
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

const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronUpIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

/**
 * Componente de Tarjeta de Métrica
 */
function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
      <p className="text-xs text-emerald-600 uppercase tracking-wide">{label}</p>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

/**
 * Componente de Sección de Detalle Expandible
 */
function DetalleSection({ 
  title, 
  children, 
  defaultOpen = false 
}: { 
  title: string; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-medium text-gray-700">{title}</span>
        {isOpen ? <ChevronUpIcon className="h-4 w-4 text-gray-500" /> : <ChevronDownIcon className="h-4 w-4 text-gray-500" />}
      </button>
      {isOpen && (
        <div className="p-4 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Componente de Fila de Detalle (Label-Value)
 */
function DetailRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value ?? '-'}</span>
    </div>
  );
}

/**
 * Componente de Detalle del Expediente (Modal)
 */
function ExpedienteDetalleModal({ 
  detalle, 
  onClose 
}: { 
  detalle: ExpedienteDetalle | null;
  onClose: () => void;
}) {
  if (!detalle) return null;

  const { paciente, consulta, antropometria, evaluacion, estilo, recordatorio } = detalle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-emerald-600">
          <div>
            <h2 className="text-xl font-bold text-white">Detalle del Expediente</h2>
            <p className="text-emerald-100 text-sm">Consulta del {new Date(consulta.created_at).toLocaleDateString('es-MX')}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-emerald-700 rounded-lg transition-colors"
          >
            <XIcon />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Información del Paciente */}
          <DetalleSection title="📋 Datos del Paciente" defaultOpen>
            <div className="grid grid-cols-2 gap-4">
              <DetailRow label="Nombre" value={paciente.nombre_completo} />
              <DetailRow label="CURP" value={paciente.curp} />
              <DetailRow label="Sexo" value={paciente.sexo} />
              <DetailRow label="Fecha de Nacimiento" value={paciente.fecha_nacimiento ? new Date(paciente.fecha_nacimiento).toLocaleDateString('es-MX') : '-'} />
              <DetailRow label="Dirección" value={paciente.direccion} />
              <DetailRow label="Teléfono" value={paciente.telefono} />
            </div>
          </DetalleSection>

          {/* Antropometría */}
          <DetalleSection title="⚖️ Antropometría">
            {antropometria ? (
              <div className="grid grid-cols-4 gap-4">
                <MetricCard label="Peso" value={`${antropometria.peso_kg} kg`} />
                <MetricCard label="Talla" value={`${antropometria.talla_cm} cm`} />
                <MetricCard label="IMC" value={antropometria.imc?.toFixed(1) ?? '-'} />
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                  <p className="text-xs text-emerald-600 uppercase tracking-wide">Estado</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {antropometria.imc ? (
                      antropometria.imc < 18.5 ? 'Bajo peso' :
                      antropometria.imc < 25 ? 'Normal' :
                      antropometria.imc < 30 ? 'Sobrepeso' : 'Obesidad'
                    ) : '-'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay datos de antropometría</p>
            )}
          </DetalleSection>

          {/* Evaluación Dietética */}
          <DetalleSection title="🥗 Evaluación Dietética">
            {evaluacion ? (
              <div className="space-y-2">
                <DetailRow label="Comidas por día" value={evaluacion.comidas_dia} />
                <DetailRow label="Agua (litros)" value={evaluacion.agua_litros} />
                <DetailRow label="Nivel de apetito" value={evaluacion.nivel_apetito} />
                <DetailRow label="Hora de mayor apetito" value={evaluacion.hora_max_apetito} />
                <DetailRow label="Compañía al comer" value={evaluacion.compania_comida_tipo} />
                <DetailRow label="Tiempo de comida (min)" value={evaluacion.tiempo_comida_min} />
                <DetailRow label="Usa dispositivos" value={evaluacion.usa_dispositivos ? 'Sí' : 'No'} />
                <DetailRow label="Sal adicional" value={evaluacion.sal_adicional ? 'Sí' : 'No'} />
                <DetailRow label="Preferencias positivas" value={evaluacion.preferencias_positivas} />
                <DetailRow label="Preferencias negativas" value={evaluacion.preferencias_negativas} />
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay datos de evaluación dietética</p>
            )}
          </DetalleSection>

          {/* Estilo de Vida */}
          <DetalleSection title="🏃 Estilo de Vida">
            {estilo ? (
              <div className="space-y-2">
                <DetailRow label="Horas de sueño" value={estilo.sueno_horas} />
                <DetailRow label="Problemas de sueño" value={estilo.sueno_problemas} />
                <DetailRow label="Actividad física" value={estilo.actividad_fisica} />
                <DetailRow label="Frecuencia de ejercicio" value={estilo.ejercicio_frecuencia} />
                <DetailRow label="Tiempo de ejercicio" value={estilo.ejercicio_tiempo} />
                <DetailRow label="Practica deporte" value={estilo.practica_deporte ? 'Sí' : 'No'} />
                <DetailRow label="Tipo de deporte" value={estilo.tipo_deporte} />
                <DetailRow label="Frecuencia deporte" value={estilo.frecuencia_deporte} />
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay datos de estilo de vida</p>
            )}
          </DetalleSection>

          {/* Recordatorio 24h */}
          <DetalleSection title="📝 Recordatorio de 24 horas">
            {recordatorio ? (
              <div className="space-y-3">
                <DetailRow label="¿Es día típico?" value={recordatorio.es_dia_tipico} />
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Alimentación:</p>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                    <p><span className="font-medium">Desayuno:</span> {recordatorio.r24_desayuno || '-'}</p>
                    <p><span className="font-medium">Colación mañana:</span> {recordatorio.r24_colacion_manana || '-'}</p>
                    <p><span className="font-medium">Comida:</span> {recordatorio.r24_comida || '-'}</p>
                    <p><span className="font-medium">Colación tarde:</span> {recordatorio.r24_colacion_tarde || '-'}</p>
                    <p><span className="font-medium">Cena:</span> {recordatorio.r24_cena || '-'}</p>
                    <p><span className="font-medium">Extras:</span> {recordatorio.r24_extras || '-'}</p>
                  </div>
                </div>
                <DetailRow label="Grasas frecuentes" value={recordatorio.grasas_frecuentes} />
                <DetailRow label="Agua (litros)" value={recordatorio.r24_agua_litros} />
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay datos del recordatorio</p>
            )}
          </DetalleSection>

          {/* Datos de la Consulta */}
          <DetalleSection title="🏥 Datos de la Consulta">
            <div className="space-y-2">
              <DetailRow label="Motivo de consulta" value={consulta.motivo_consulta} />
              <DetailRow label="Estado" value={consulta.status} />
              <DetailRow label="Diagnóstico" value={consulta.diagnostico_especialista} />
              <DetailRow label="Plan alimenticio" value={consulta.plan_alimenticio_resumen} />
            </div>
          </DetalleSection>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => {
              // Placeholder para generación de PDF via AWS Lambda
              alert('Funcionalidad de PDFcoming soon - Integración con AWS Lambda');
            }}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FileTextIcon />
            <span className="ml-2">Generar PDF</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente principal de la página de Expedientes
 */
export default function ExpedientesPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ExpedienteFilters>(DEFAULT_FILTERS);
  const [data, setData] = useState<ExpedientesResponse | null>(null);
  const [selectedDetalle, setSelectedDetalle] = useState<ExpedienteDetalle | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  // Cargar datos de expedientes
  const loadExpedientes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.fechaInicio) params.set('fechaInicio', filters.fechaInicio);
      if (filters.fechaFin) params.set('fechaFin', filters.fechaFin);
      params.set('page', filters.page.toString());
      params.set('pageSize', filters.pageSize.toString());

      const response = await fetch(`/api/especialista/expedientes?${params.toString()}`);
      if (!response.ok) throw new Error('Error cargando expedientes');
      
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Effect para cargar datos cuando cambian los filtros
  useEffect(() => {
    const debounce = setTimeout(() => {
      loadExpedientes();
    }, 300);
    return () => clearTimeout(debounce);
  }, [loadExpedientes]);

  // Cargar detalle de un expediente
  const loadDetalle = async (consultaId: string) => {
    setLoadingDetalle(true);
    setModalOpen(true);
    try {
      const response = await fetch('/api/especialista/expedientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultaId }),
      });
      
      if (!response.ok) throw new Error('Error cargando detalle');
      
      const result = await response.json();
      setSelectedDetalle(result);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar los detalles del expediente');
    } finally {
      setLoadingDetalle(false);
    }
  };

  // Exportar a CSV
  const handleExportCSV = () => {
    if (!data?.data || data.data.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const csv = generateCSV(data.data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expedientes_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Manejadores de filtros
  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 0 }));
  };

  const handleFechaInicioChange = (value: string) => {
    setFilters(prev => ({ ...prev, fechaInicio: value || null, page: 0 }));
  };

  const handleFechaFinChange = (value: string) => {
    setFilters(prev => ({ ...prev, fechaFin: value || null, page: 0 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (value: number) => {
    setFilters(prev => ({ ...prev, pageSize: value, page: 0 }));
  };

  // Renderizado condicional de estado de carga
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando expedientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Consulta de Expedientes</h1>
          <p className="text-gray-500 text-sm mt-1">Explora y gestiona los expedientes de tus pacientes</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar (CURP o Nombre)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Ingresa CURP o nombre..."
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Fecha Inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
              <input
                type="date"
                value={filters.fechaInicio || ''}
                onChange={(e) => handleFechaInicioChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Fecha Fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
              <input
                type="date"
                value={filters.fechaFin || ''}
                onChange={(e) => handleFechaFinChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Botón Exportar */}
            <div className="flex items-end">
              <button
                onClick={handleExportCSV}
                disabled={!data?.data?.length}
                className="w-full flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <DownloadIcon />
                <span className="ml-2">Exportar CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de Resultados */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3 w-full">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          ) : data?.data?.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No se encontraron expedientes con los filtros aplicados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre Completo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CURP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de Consulta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data?.data?.map((row) => (
                    <tr key={row.consulta.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {row.paciente.nombre_completo || 'Sin nombre'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 font-mono">
                          {row.paciente.curp}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(row.consulta.created_at).toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          row.consulta.status === 'atendida' 
                            ? 'bg-green-100 text-green-800'
                            : row.consulta.status === 'pendiente'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {row.consulta.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => loadDetalle(row.consulta.id)}
                          className="inline-flex items-center px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {data && data.totalPages > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-500">
                Mostrando {data.page * data.pageSize + 1} - {Math.min((data.page + 1) * data.pageSize, data.total)} de {data.total} resultados
              </div>
              <div className="flex items-center gap-2">
                {/* Selector de tamaño de página */}
                <select
                  value={filters.pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={10}>10 por página</option>
                  <option value={25}>25 por página</option>
                  <option value={50}>50 por página</option>
                </select>

                {/* Botones de paginación */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(0)}
                    disabled={data.page === 0}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ««
                  </button>
                  <button
                    onClick={() => handlePageChange(data.page - 1)}
                    disabled={data.page === 0}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    «
                  </button>
                  <span className="px-3 py-1.5 text-sm text-gray-600">
                    Página {data.page + 1} de {data.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(data.page + 1)}
                    disabled={data.page >= data.totalPages - 1}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    »
                  </button>
                  <button
                    onClick={() => handlePageChange(data.totalPages - 1)}
                    disabled={data.page >= data.totalPages - 1}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    »»
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalle */}
      {modalOpen && (
        <ExpedienteDetalleModal
          detalle={selectedDetalle}
          onClose={() => {
            setModalOpen(false);
            setSelectedDetalle(null);
          }}
        />
      )}

      {/* Loading overlay para detalle */}
      {loadingDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
              <span className="text-gray-700">Cargando detalles...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}