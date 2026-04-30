/**
 * Utilidades del servidor para la consulta de Expedientes
 * 
 * Maneja la lógica de paginación, filtrado y seguridad del lado del servidor.
 */

import { createClient } from '@/lib/server';
import type { Consulta, Perfil } from '../types';
import type {
    ExpedienteDetalle,
    ExpedienteFilters,
    ExpedienteRow,
    ExpedientesResponse
} from './types';

/**
 * Constantes de configuración
 */
const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 10;

/**
 * Valida que el usuario tenga rol de especialista
 * @throws Error si el usuario no es especialista
 */
async function validateEspecialista(): Promise<Perfil> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('No autenticado');
  }

  const { data: perfil, error: perfilError } = await supabase
    .from('perfiles')
    .select('id, nombre_completo, curp, sexo, fecha_nacimiento, direccion, ocupacion, telefono, registro_completo, rol')
    .eq('id', user.id)
    .single();

  if (perfilError || !perfil) {
    throw new Error('Perfil no encontrado');
  }

  if (perfil.rol !== 'especialista') {
    throw new Error('Acceso denegado: se requiere rol de especialista');
  }

  return perfil as Perfil;
}

/**
 * Construye la consulta base con filtros de búsqueda
 */
function buildBaseQuery(
  supabase: ReturnType<typeof createClient>,
  filters: ExpedienteFilters
) {
  let query = supabase
    .from('consultas')
    .select(`
      id, created_at, paciente_id, especialista_id, motivo_consulta, 
      status, diagnostico_especialista, plan_alimenticio_resumen, 
      antropometria_id, evaluacion_dietetica_id, estilo_vida_id, recordatorio_24h_id
    `, { count: 'exact' });

  // Filtro por rango de fechas
  if (filters.fechaInicio) {
    query = query.gte('created_at', filters.fechaInicio);
  }
  if (filters.fechaFin) {
    // Agregar un día para incluir todo el día final
    const fechaFin = new Date(filters.fechaFin);
    fechaFin.setDate(fechaFin.getDate() + 1);
    query = query.lt('created_at', fechaFin.toISOString());
  }

  // Filtro por status (opcional - por defecto trae todos)
  // query = query.eq('status', 'atendida'); // Descomentar si se quiere filtrar por status

  return query;
}

/**
 * Obtiene los IDs de pacientes que coinciden con la búsqueda
 * CRÍTICO: Filtro estricto por rol 'paciente'
 */
async function searchPacienteIds(
  supabase: ReturnType<typeof createClient>,
  search: string
): Promise<string[]> {
  if (!search || search.length < 2) {
    return [];
  }

  const searchLower = search.toLowerCase();
  
  // Búsqueda por CURP o nombre, SOLO de pacientes
  const { data: pacientes, error } = await supabase
    .from('perfiles')
    .select('id')
    .eq('rol', 'paciente')  // RESTRICCIÓN CRÍTICA: Solo pacientes
    .or(`curp.ilike.%${searchLower}%,nombre_completo.ilike.%${searchLower}%`)
    .limit(100);

  if (error) {
    console.error('Error buscando pacientes:', error);
    return [];
  }

  return pacientes?.map(p => p.id) ?? [];
}

/**
 * Consulta paginada de expedientes
 * 
 * @param filters - Filtros de búsqueda y paginación
 * @returns ExpedientesResponse con los datos y metadatos de paginación
 */
export async function getExpedientes(filters: ExpedienteFilters): Promise<ExpedientesResponse> {
  // 1. Validar que el usuario es especialista
  await validateEspecialista();

  const supabase = await createClient();
  
  // 2. Normalizar parámetros de paginación
  const pageSize = Math.min(Math.max(1, filters.pageSize), MAX_PAGE_SIZE);
  const page = Math.max(0, filters.page);
  const offset = page * pageSize;

  // 3. Si hay búsqueda, obtener IDs de pacientes primero
  let pacienteIds: string[] | null = null;
  if (filters.search && filters.search.length >= 2) {
    pacienteIds = await searchPacienteIds(supabase, filters.search);
    // Si no hay resultados en la búsqueda, retornar vacío
    if (pacienteIds.length === 0) {
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      };
    }
  }

  // 4. Construir consulta base
  let query = supabase
    .from('consultas')
    .select(`
      id, created_at, paciente_id, especialista_id, motivo_consulta, 
      status, diagnostico_especialista, plan_alimenticio_resumen, 
      antropometria_id, evaluacion_dietetica_id, estilo_vida_id, recordatorio_24h_id
    `, { count: 'exact' });

  // 5. Aplicar filtros
  if (filters.fechaInicio) {
    query = query.gte('created_at', filters.fechaInicio);
  }
  if (filters.fechaFin) {
    const fechaFin = new Date(filters.fechaFin);
    fechaFin.setDate(fechaFin.getDate() + 1);
    query = query.lt('created_at', fechaFin.toISOString());
  }

  // Aplicar filtro de pacientes si existe búsqueda
  if (pacienteIds && pacienteIds.length > 0) {
    query = query.in('paciente_id', pacienteIds);
  }

  // 6. Obtener total antes de aplicar paginación
  const { count } = await query;
  const total = count ?? 0;

  // 7. Aplicar orden y paginación
  const { data: consultasData, error: consultasError } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (consultasError) {
    console.error('Error consultando expedientes:', consultasError);
    throw new Error('Error al consultar expedientes');
  }

  const consultas = (consultasData as Consulta[]) ?? [];

  // 8. Obtener datos de pacientes
  const uniquePacienteIds = [...new Set(consultas.map(c => c.paciente_id))];
  let pacientesMap: Record<string, Perfil> = {};

  if (uniquePacienteIds.length > 0) {
    // CRÍTICO: Filtrar solo perfiles de pacientes
    const { data: pacientesData, error: pacientesError } = await supabase
      .from('perfiles')
      .select('id, nombre_completo, curp, sexo, fecha_nacimiento, direccion, ocupacion, telefono, registro_completo')
      .in('id', uniquePacienteIds)
      .eq('rol', 'paciente');  // RESTRICCIÓN CRÍTICA: Solo pacientes

    if (pacientesError) {
      console.error('Error consultando pacientes:', pacientesError);
    } else {
      pacientesData?.forEach((p) => {
        pacientesMap[p.id] = p as Perfil;
      });
    }
  }

  // 9. Construir filas de resultados
  const data: ExpedienteRow[] = consultas
    .filter(c => pacientesMap[c.paciente_id]) // Filtrar solo consultas con paciente válido
    .map(consulta => ({
      consulta,
      paciente: pacientesMap[consulta.paciente_id],
    }));

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Obtiene el detalle completo de un expediente
 * 
 * @param consultaId - ID de la consulta
 * @returns ExpedienteDetalle con todos los datos relacionados
 */
export async function getExpedienteDetalle(consultaId: string): Promise<ExpedienteDetalle | null> {
  // 1. Validar que el usuario es especialista
  await validateEspecialista();

  const supabase = await createClient();

  // 2. Obtener la consulta
  const { data: consultaData, error: consultaError } = await supabase
    .from('consultas')
    .select(`
      id, created_at, paciente_id, especialista_id, motivo_consulta, 
      status, diagnostico_especialista, plan_alimenticio_resumen, 
      antropometria_id, evaluacion_dietetica_id, estilo_vida_id, recordatorio_24h_id
    `)
    .eq('id', consultaId)
    .maybeSingle();

  if (consultaError || !consultaData) {
    console.error('Error obteniendo consulta:', consultaError);
    return null;
  }

  const consulta = consultaData as Consulta;

  // 3. Obtener datos del paciente (solo si es paciente)
  const { data: pacienteData, error: pacienteError } = await supabase
    .from('perfiles')
    .select('id, nombre_completo, curp, sexo, fecha_nacimiento, direccion, ocupacion, telefono, registro_completo')
    .eq('id', consulta.paciente_id)
    .eq('rol', 'paciente')  // RESTRICCIÓN CRÍTICA
    .maybeSingle();

  if (pacienteError || !pacienteData) {
    console.error('Error obteniendo paciente:', pacienteError);
    return null;
  }

  const paciente = pacienteData as Perfil;

  // 4. Cargar datos relacionados en paralelo
  const [antropometria, evaluacion, estilo, recordatorio] = await Promise.all([
    consulta.antropometria_id
      ? supabase.from('consulta_antropometria').select('*').eq('id', consulta.antropometria_id).maybeSingle()
      : Promise.resolve({ data: null }),
    consulta.evaluacion_dietetica_id
      ? supabase.from('consulta_evaluacion_dietetica').select('*').eq('id', consulta.evaluacion_dietetica_id).maybeSingle()
      : Promise.resolve({ data: null }),
    consulta.estilo_vida_id
      ? supabase.from('consulta_estilo_vida').select('*').eq('id', consulta.estilo_vida_id).maybeSingle()
      : Promise.resolve({ data: null }),
    consulta.recordatorio_24h_id
      ? supabase.from('consulta_recordatorio_24h').select('*').eq('id', consulta.recordatorio_24h_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    consulta,
    paciente,
    antropometria: antropometria.data as any,
    evaluacion: evaluacion.data as any,
    estilo: estilo.data as any,
    recordatorio: recordatorio.data as any,
  };
}

/**
 * Genera datos CSV para exportación
 * 
 * @param data - Datos de expedientes a exportar
 * @returns string en formato CSV
 */
export function generateCSV(data: ExpedienteRow[]): string {
  const headers = ['Nombre Completo', 'CURP', 'Fecha de Consulta', 'Estado', 'Motivo de Consulta'];
  
  const rows = data.map(row => [
    row.paciente.nombre_completo || '',
    row.paciente.curp || '',
    new Date(row.consulta.created_at).toLocaleDateString('es-MX'),
    row.consulta.status || '',
    row.consulta.motivo_consulta || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return csvContent;
}