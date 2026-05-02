'use client';

import { useCallback, useEffect, useState } from 'react';
import { generateCSV } from '../utils';
import {
  DEFAULT_FILTERS,
  ExpedienteDetalle,
  ExpedienteFilters,
  ExpedientesResponse
} from './types';

// ==========================================
// ICONOS SVG (Indispensables para la UI)
// ==========================================
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// ==========================================
// SUB-COMPONENTES DE APOYO (Clean Code)
// ==========================================
function DetailRow({ label, value }: { label: string; value: any }) {
    return (
        <div className="flex justify-between py-2 border-b border-gray-100 last:border-0 text-sm">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-gray-900 text-right">{value ?? '-'}</span>
        </div>
    );
}

// ==========================================
// PÁGINA PRINCIPAL: EXPEDIENTES
// ==========================================
export default function ExpedientesPage() {
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<ExpedienteFilters>({
        ...DEFAULT_FILTERS,
        fechaInicio: '2026-04-01', // Forzamos el mes de las pruebas
        fechaFin: '2026-05-31'
    });
    const [data, setData] = useState<ExpedientesResponse | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDetalle, setSelectedDetalle] = useState<ExpedienteDetalle | null>(null);

    const loadExpedientes = useCallback(async (currentFilters: ExpedienteFilters) => {
        setLoading(true);
        console.log("🔍 Iniciando fetch con filtros:", currentFilters);
        
        try {
            const params = new URLSearchParams();
            if (currentFilters.search) params.set('search', currentFilters.search);
            if (currentFilters.fechaInicio) params.set('fechaInicio', currentFilters.fechaInicio);
            if (currentFilters.fechaFin) params.set('fechaFin', currentFilters.fechaFin);
            params.set('page', currentFilters.page.toString());
            params.set('pageSize', currentFilters.pageSize.toString());

            const response = await fetch(`/api/especialista/expedientes?${params.toString()}`);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error("❌ Error de API:", errorData);
                throw new Error('Error en la carga de datos');
            }
            
            const result = await response.json();
            console.log("✅ Datos recibidos del servidor:", result);
            setData(result);
        } catch (error) {
            console.error('❌ Error crítico en loadExpedientes:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            loadExpedientes(filters);
        }, 400); 
        return () => clearTimeout(handler);
    }, [filters, loadExpedientes]);

    const handleFilterChange = (key: keyof ExpedienteFilters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 0 }));
    };

    const loadDetalle = async (consultaId: string) => {
        try {
            const response = await fetch('/api/especialista/expedientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ consultaId }),
            });
            const result = await response.json();
            setSelectedDetalle(result);
            setModalOpen(true);
        } catch (error) {
            alert('Error al abrir el expediente clínico');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header Profesional */}
            <header className="bg-white border-b border-gray-200 px-8 py-5">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-extrabold text-emerald-900 tracking-tight">Gestión de Expedientes</h1>
                        <p className="text-gray-500 text-sm font-medium">Calpulalpan, Tlaxcala | Panel de Especialista[cite: 4]</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => loadExpedientes(filters)}
                            className="p-2.5 bg-emerald-50 text-emerald-700 rounded-full hover:bg-emerald-100 transition-all shadow-sm"
                        >
                            <svg className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-8 py-8">
                {/* Controles de Filtrado */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8 grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
                    <div className="md:col-span-1">
                        <label className="block text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-1.5">Búsqueda</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><SearchIcon /></span>
                            <input 
                                type="text" 
                                placeholder="CURP o Nombre del paciente..." 
                                value={filters.search} 
                                onChange={(e) => handleFilterChange('search', e.target.value)} 
                                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm outline-none" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-1.5">Fecha Inicial</label>
                        <input type="date" value={filters.fechaInicio || ''} onChange={(e) => handleFilterChange('fechaInicio', e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-1.5">Fecha Final</label>
                        <input type="date" value={filters.fechaFin || ''} onChange={(e) => handleFilterChange('fechaFin', e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <button 
                        onClick={() => {
                            const csv = generateCSV(data?.data || []);
                            const blob = new Blob([csv], { type: 'text/csv' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'expedientes.csv';
                            a.click();
                        }}
                        disabled={!data?.data?.length} 
                        className="flex items-center justify-center px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all text-sm font-bold shadow-md shadow-emerald-100"
                    >
                        <DownloadIcon /> <span className="ml-2">Exportar Reporte</span>
                    </button>
                </section>

                {/* Visualización de Datos */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-32 text-center">
                            <div className="animate-spin h-12 w-12 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto"></div>
                            <p className="mt-5 text-gray-500 font-semibold text-lg">Consultando historial clínico...</p>
                        </div>
                    ) : !data?.data?.length ? (
                        <div className="p-32 text-center">
                            <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <SearchIcon />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">No se encontraron expedientes</h3>
                            <p className="text-gray-500 mt-2 max-w-xs mx-auto">Prueba limpiando los filtros o verifica que los pacientes tengan el registro completo en Supabase.</p>
                            <button 
                                onClick={() => setFilters(DEFAULT_FILTERS)} 
                                className="mt-8 px-6 py-2 border-2 border-emerald-600 text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition-all text-sm"
                            >
                                Reestablecer Filtros
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-emerald-900 uppercase tracking-widest">Paciente</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-emerald-900 uppercase tracking-widest">CURP</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-emerald-900 uppercase tracking-widest">Fecha Consulta</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-emerald-900 uppercase tracking-widest text-center">Estado</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-emerald-900 uppercase tracking-widest text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {data.data.map((row) => (
                                        <tr key={row.consulta.id} className="hover:bg-emerald-50/30 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{row.paciente.nombre_completo}</div>
                                                <div className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">{row.paciente.ocupacion || 'Paciente Externo'}</div>
                                            </td>
                                            <td className="px-8 py-5 text-xs font-mono text-gray-500">{row.paciente.curp}</td>
                                            <td className="px-8 py-5 text-sm text-gray-600 font-medium">{new Date(row.consulta.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                            <td className="px-8 py-5 text-center">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm ${row.consulta.status === 'atendida' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {row.consulta.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button onClick={() => loadDetalle(row.consulta.id)} className="px-5 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-emerald-900 shadow-sm transition-all tracking-widest">Ver Detalles</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal de Detalle */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-900/40 backdrop-blur-md p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-emerald-100">
                        <div className="flex items-center justify-between px-8 py-6 bg-emerald-600 text-white">
                            <div>
                                <h2 className="text-xl font-bold">Expediente Clínico Digital</h2>
                                <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest">Consulta del {new Date(selectedDetalle?.consulta.created_at || '').toLocaleDateString('es-MX')}</p>
                            </div>
                            <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-emerald-700 rounded-full transition-colors"><XIcon /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <section>
                                    <h3 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-4">Datos del Paciente</h3>
                                    <DetailRow label="Nombre Completo" value={selectedDetalle?.paciente.nombre_completo} />
                                    <DetailRow label="CURP" value={selectedDetalle?.paciente.curp} />
                                    <DetailRow label="Edad Sugerida" value={selectedDetalle?.paciente.fecha_nacimiento ? `${new Date().getFullYear() - new Date(selectedDetalle.paciente.fecha_nacimiento).getFullYear()} años` : '-'} />
                                </section>
                                <section>
                                    <h3 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-4">Motivo de Atención</h3>
                                    <p className="text-sm text-gray-600 bg-white p-4 rounded-2xl border border-gray-100 italic">"{selectedDetalle?.consulta.motivo_consulta}"</p>
                                </section>
                            </div>
                        </div>
                        <div className="px-8 py-5 border-t bg-white flex justify-end">
                            <button onClick={() => setModalOpen(false)} className="px-8 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all text-sm">Cerrar Expediente</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}