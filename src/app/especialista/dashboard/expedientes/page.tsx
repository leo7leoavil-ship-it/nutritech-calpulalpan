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
// ICONOS Y SUB-COMPONENTES VISUALES
// ==========================================

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

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

function MetricCard({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
            <p className="text-xs text-emerald-600 uppercase tracking-wide font-bold">{label}</p>
            <p className="text-lg font-semibold text-gray-900">{value}</p>
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: any }) {
    return (
        <div className="flex justify-between py-2 border-b border-gray-100 last:border-0 text-sm">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-gray-900 text-right">{value ?? '-'}</span>
        </div>
    );
}

function DetalleSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                <span className="font-bold text-gray-700">{title}</span>
                <ChevronDownIcon className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="p-4 bg-white">{children}</div>}
        </div>
    );
}

// ==========================================
// COMPONENTE MODAL DE DETALLE
// ==========================================

function ExpedienteDetalleModal({ detalle, onClose }: { detalle: ExpedienteDetalle | null; onClose: () => void }) {
    if (!detalle) return null;
    const { paciente, consulta, antropometria, evaluacion, estilo, recordatorio } = detalle;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 bg-emerald-600 text-white">
                    <div>
                        <h2 className="text-xl font-bold">Expediente Clínico Digital</h2>
                        <p className="text-emerald-100 text-xs uppercase tracking-widest">Calpulalpan, Tlaxcala</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-emerald-700 rounded-full transition-colors"><XIcon /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                    <DetalleSection title="📋 Identificación del Paciente" defaultOpen>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                            <DetailRow label="Nombre" value={paciente.nombre_completo} />
                            <DetailRow label="CURP" value={paciente.curp} />
                            <DetailRow label="Sexo" value={paciente.sexo} />
                            <DetailRow label="Ocupación" value={paciente.ocupacion} />
                        </div>
                    </DetalleSection>

                    <DetalleSection title="⚖️ Antropometría Actual">
                        {antropometria ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <MetricCard label="Peso" value={`${antropometria.peso_kg} kg`} />
                                <MetricCard label="Talla" value={`${antropometria.talla_cm} cm`} />
                                <MetricCard label="IMC" value={antropometria.imc?.toFixed(2) ?? '-'} />
                                <MetricCard label="Estado" value={antropometria.imc && antropometria.imc >= 30 ? 'Obesidad' : 'Normal'} />
                            </div>
                        ) : <p className="text-center text-gray-400 text-sm">Sin datos registrados[cite: 2]</p>}
                    </DetalleSection>

                    <DetalleSection title="📝 Motivo y Diagnóstico">
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs font-bold text-emerald-600 uppercase">Motivo de consulta</p>
                                <p className="text-sm text-gray-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100 mt-1">{consulta.motivo_consulta}</p>
                            </div>
                            <DetailRow label="Estado de atención" value={consulta.status.toUpperCase()} />
                        </div>
                    </DetalleSection>
                </div>

                <div className="px-6 py-4 border-t bg-white flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-all">Cerrar</button>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// PÁGINA PRINCIPAL (LÓGICA CORREGIDA)
// ==========================================

export default function ExpedientesPage() {
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<ExpedienteFilters>(DEFAULT_FILTERS);
    const [data, setData] = useState<ExpedientesResponse | null>(null);
    const [selectedDetalle, setSelectedDetalle] = useState<ExpedienteDetalle | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [loadingDetalle, setLoadingDetalle] = useState(false);

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
            if (!response.ok) throw new Error('Error en API');
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => loadExpedientes(filters), 400);
        return () => clearTimeout(handler);
    }, [filters, loadExpedientes]);

    const handleFilterChange = (key: keyof ExpedienteFilters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value, page: key === 'page' ? value : 0 }));
    };

    const loadDetalle = async (consultaId: string) => {
        setLoadingDetalle(true);
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
            alert('Error al recuperar datos clínicos[cite: 4]');
        } finally {
            setLoadingDetalle(false);
        }
    };

    const handleExportCSV = () => {
        if (!data?.data?.length) return;
        const csv = generateCSV(data.data as any);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte_nutricion_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-emerald-900">Módulo de Expedientes</h1>
                        <p className="text-gray-500 text-sm">Nutri-Tech: Gestión Calpulalpan[cite: 4]</p>
                    </div>
                    <button onClick={() => loadExpedientes(filters)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-all">
                        <svg className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Búsqueda (CURP/Nombre)</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><SearchIcon /></span>
                            <input type="text" value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} className="w-full pl-10 pr-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Desde</label>
                        <input type="date" value={filters.fechaInicio || ''} onChange={(e) => handleFilterChange('fechaInicio', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hasta</label>
                        <input type="date" value={filters.fechaFin || ''} onChange={(e) => handleFilterChange('fechaFin', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm" />
                    </div>
                    <button onClick={handleExportCSV} disabled={!data?.data?.length} className="flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 transition-all text-sm font-bold">
                        <DownloadIcon /> <span className="ml-2">Descargar Reporte</span>
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center"><div className="animate-spin h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div></div>
                    ) : !data?.data?.length ? (
                        <div className="p-12 text-center text-gray-500">No hay registros con estos filtros.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-emerald-50 border-b">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-emerald-800">PACIENTE</th>
                                        <th className="px-6 py-4 text-xs font-bold text-emerald-800">CURP</th>
                                        <th className="px-6 py-4 text-xs font-bold text-emerald-800">FECHA</th>
                                        <th className="px-6 py-4 text-xs font-bold text-emerald-800">ACCIÓN</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {data.data.map((row) => (
                                        <tr key={row.consulta.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-bold">{row.paciente.nombre_completo}</td>
                                            <td className="px-6 py-4 text-xs font-mono">{row.paciente.curp}</td>
                                            <td className="px-6 py-4 text-sm">{new Date(row.consulta.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4"><button onClick={() => loadDetalle(row.consulta.id)} className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg">VER EXPEDIENTE</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {modalOpen && <ExpedienteDetalleModal detalle={selectedDetalle} onClose={() => { setModalOpen(false); setSelectedDetalle(null); }} />}
            {loadingDetalle && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"><div className="bg-white p-4 rounded-lg shadow-lg">Cargando...</div></div>}
        </div>
    );
}