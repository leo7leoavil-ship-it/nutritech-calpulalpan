/**
 * Utilidades del servidor para la consulta de Expedientes - Nutri-Tech Calpulalpan
 * 
 * ESTATUS: Corregido para Build de Vercel.
 * Lógica: Server-Side Rendering (SSR) con Supabase.
 */

import { createClient } from '@/lib/server';
import type { Consulta, Perfil } from '../types';
import type {
  ExpedienteDetalle,
  ExpedienteFilters,
  ExpedienteRow,
  ExpedientesResponse
} from './types';

const MAX_PAGE_SIZE = 100;

/**
 * Valida que el usuario tenga rol de especialista (RNF-04: Seguridad RLS)
 */
async function validateEspecialista(): Promise<Perfil> {
  const supabase = await createClient(); // CORRECCIÓN: await requerido
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data: perfil, error: perfilError } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (perfilError || !perfil) throw new Error('Perfil no encontrado');
  if (perfil.rol !== 'especialista') {
    throw new Error('Acceso denegado: se requiere rol de especialista');
  }

  return perfil as Perfil;
}

/**
 * Obtiene IDs de pacientes (Búsqueda optimizada por CURP/Nombre)
 */
async function searchPacienteIds(
  supabase: any, // Cliente ya resuelto
  search: string
): Promise<string[]> {
  if (!search || search.length < 2) return [];

  const { data: pacientes, error } = await supabase
    .from('perfiles')
    .select('id')
    .eq('rol', 'paciente')
    .or(`curp.ilike.%${search}%,nombre_completo.ilike.%${search}%`)
    .limit(100);

  if (error) return [];
  return pacientes?.map((p: any) => p.id) ?? [];
}

/**
 * Consulta paginada de expedientes (Sprint 2: Gestión de Consultas)
 */
export async function getExpedientes(filters: ExpedienteFilters): Promise<ExpedientesResponse> {
  await validateEspecialista();
  const supabase = await createClient(); // CORRECCIÓN: await requerido
  
  const pageSize = Math.min(Math.max(1, filters.pageSize || 10), MAX_PAGE_SIZE);
  const page = Math.max(0, filters.page || 0);
  const offset = page * pageSize;

  let pacienteIds: string[] | null = null;
  if (filters.search && filters.search.length >= 2) {
    pacienteIds = await searchPacienteIds(supabase, filters.search);
    if (pacienteIds.length === 0) {
      return { data: [], total: 0, page, pageSize, totalPages: 0 };
    }
  }

  // Construcción de Query Base
  let query = supabase
    .from('consultas')
    .select(`
      id, created_at, paciente_id, especialista_id, motivo_consulta, 
      status, diagnostico_especialista, plan_alimenticio_resumen, 
      antropometria_id, evaluacion_dietetica_id, estilo_vida_id, recordatorio_24h_id
    `, { count: 'exact' });

  if (filters.fechaInicio) query = query.gte('created_at', filters.fechaInicio);
  if (filters.fechaFin) {
    const fechaFin = new Date(filters.fechaFin);
    fechaFin.setDate(fechaFin.getDate() + 1);
    query = query.lt('created_at', fechaFin.toISOString());
  }

  if (pacienteIds && pacienteIds.length > 0) {
    query = query.in('paciente_id', pacienteIds);
  }

  const { data: consultasData, count, error: consultasError } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (consultasError) throw new Error('Error al consultar expedientes');

  const consultas = (consultasData as Consulta[]) ?? [];
  const total = count ?? 0;

  // Hidratación de datos de pacientes (Evitar N+1 queries)
  const uniqueIds = [...new Set(consultas.map(c => c.paciente_id))];
  let pacientesMap: Record<string, Perfil> = {};

  if (uniqueIds.length > 0) {
    const { data: pData } = await supabase
      .from('perfiles')
      .select('id, nombre_completo, curp, sexo, fecha_nacimiento, direccion, ocupacion, telefono, registro_completo')
      .in('id', uniqueIds)
      .eq('rol', 'paciente');

    pData?.forEach((p: any) => { pacientesMap[p.id] = p as Perfil; });
  }

  const data: ExpedienteRow[] = consultas
    .filter(c => pacientesMap[c.paciente_id])
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
 * Detalle completo del expediente (Alineado a Esquema_DB.txt)
 */
export async function getExpedienteDetalle(consultaId: string): Promise<ExpedienteDetalle | null> {
  await validateEspecialista();
  const supabase = await createClient(); // CORRECCIÓN: await requerido

  const { data: consulta, error: cErr } = await supabase
    .from('consultas')
    .select('*')
    .eq('id', consultaId)
    .maybeSingle();

  if (cErr || !consulta) return null;

  const { data: paciente } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', consulta.paciente_id)
    .eq('rol', 'paciente')
    .maybeSingle();

  if (!paciente) return null;

  // Carga paralela para optimizar RNF-02 (Latencia < 300ms)
  const [antro, diet, style, rec24] = await Promise.all([
    consulta.antropometria_id ? supabase.from('consulta_antropometria').select('*').eq('id', consulta.antropometria_id).maybeSingle() : { data: null },
    consulta.evaluacion_dietetica_id ? supabase.from('consulta_evaluacion_dietetica').select('*').eq('id', consulta.evaluacion_dietetica_id).maybeSingle() : { data: null },
    consulta.estilo_vida_id ? supabase.from('consulta_estilo_vida').select('*').eq('id', consulta.estilo_vida_id).maybeSingle() : { data: null },
    consulta.recordatorio_24h_id ? supabase.from('consulta_recordatorio_24h').select('*').eq('id', consulta.recordatorio_24h_id).maybeSingle() : { data: null },
  ]);

  return {
    consulta: consulta as Consulta,
    paciente: paciente as Perfil,
    antropometria: antro.data,
    evaluacion: diet.data,
    estilo: style.data,
    recordatorio: rec24.data,
  };
}

export function generateCSV(data: ExpedienteRow[]): string {
  const headers = ['Nombre', 'CURP', 'Fecha', 'Estado', 'Motivo'];
  const rows = data.map(row => [
    row.paciente.nombre_completo || '',
    row.paciente.curp || '',
    new Date(row.consulta.created_at).toLocaleDateString('es-MX'),
    row.consulta.status || '',
    row.consulta.motivo_consulta || '',
  ]);

  return [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
}