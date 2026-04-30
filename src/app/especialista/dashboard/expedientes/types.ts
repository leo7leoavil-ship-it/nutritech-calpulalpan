/**
 * Tipos para la página de Expedientes del Especialista
 * 
 * Define las estructuras de datos para la consulta de expedientes
 * con filtros avanzados y paginación del lado del servidor.
 */

import type {
    Consulta,
    ConsultaAntropometria,
    ConsultaEstiloVida,
    ConsultaEvaluacionDietetica,
    ConsultaRecordatorio24h,
    Perfil
} from '../types';

/**
 * Parámetros de paginación y filtrado para la consulta de expedientes
 */
export interface ExpedienteFilters {
  search: string;           // Búsqueda por CURP o nombre
  fechaInicio: string | null;  // Fecha de inicio del rango
  fechaFin: string | null;      // Fecha de fin del rango
  page: number;             // Página actual (0-indexed)
  pageSize: number;         // Tamaño de página
}

/**
 * Respuesta paginada de expedientes
 */
export interface ExpedientesResponse {
  data: ExpedienteRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Fila de expediente para mostrar en la tabla
 */
export interface ExpedienteRow {
  consulta: Consulta;
  paciente: Perfil;
}

/**
 * Detalle completo de un expediente para el panel expandible
 */
export interface ExpedienteDetalle {
  consulta: Consulta;
  paciente: Perfil;
  antropometria: ConsultaAntropometria | null;
  evaluacion: ConsultaEvaluacionDietetica | null;
  estilo: ConsultaEstiloVida | null;
  recordatorio: ConsultaRecordatorio24h | null;
}

/**
 * Valores por defecto para los filtros
 */
export const DEFAULT_FILTERS: ExpedienteFilters = {
  search: '',
  fechaInicio: null,
  fechaFin: null,
  page: 0,
  pageSize: 10,
};

/**
 * Columnas visibles en la tabla de expedientes
 */
export const EXPEDIENTE_COLUMNS = [
  { key: 'nombre_completo', label: 'Nombre Completo', sortable: true },
  { key: 'curp', label: 'CURP', sortable: true },
  { key: 'fecha_consulta', label: 'Fecha de Consulta', sortable: true },
  { key: 'status', label: 'Estado', sortable: true },
  { key: 'acciones', label: 'Acciones', sortable: false },
] as const;