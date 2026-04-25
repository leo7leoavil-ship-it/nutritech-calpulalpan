import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Consulta,
  ConsultaAntropometria,
  ConsultaEstiloVida,
  ConsultaEvaluacionDietetica,
  ConsultaFormularioDetalle,
  ConsultaRecordatorio24h,
} from './types';

const CONSULTA_SELECT =
  'id, created_at, paciente_id, especialista_id, motivo_consulta, status, diagnostico_especialista, plan_alimenticio_resumen, antropometria_id, evaluacion_dietetica_id, estilo_vida_id, recordatorio_24h_id';

export async function loadConsultaDetalle(
  supabase: SupabaseClient,
  consultaId: string
): Promise<ConsultaFormularioDetalle | null> {
  const { data: row, error } = await supabase
    .from('consultas')
    .select(CONSULTA_SELECT)
    .eq('id', consultaId)
    .maybeSingle();

  if (error || !row) {
    if (error) console.error('loadConsultaDetalle consulta:', error);
    return null;
  }

  const c = row as Consulta;

  const [ant, ev, est, r24] = await Promise.all([
    c.antropometria_id
      ? supabase
          .from('consulta_antropometria')
          .select(
            'id, perfil_id, created_at, peso_kg, talla_cm, imc'
          )
          .eq('id', c.antropometria_id)
          .maybeSingle()
      : Promise.resolve({ data: null } as const),
    c.evaluacion_dietetica_id
      ? supabase
          .from('consulta_evaluacion_dietetica')
          .select(
            'id, perfil_id, created_at, comidas_dia, agua_litros, nivel_apetito, hora_max_apetito, compania_comida_tipo, compania_comida_detalle, tiempo_comida_min, usa_dispositivos, dispositivos_detalle, sal_adicional, preferencias_positivas, preferencias_negativas'
          )
          .eq('id', c.evaluacion_dietetica_id)
          .maybeSingle()
      : Promise.resolve({ data: null } as const),
    c.estilo_vida_id
      ? supabase
          .from('consulta_estilo_vida')
          .select(
            'id, perfil_id, created_at, sueno_horas, sueno_problemas, actividad_fisica, ejercicio_frecuencia, ejercicio_tiempo, practica_deporte, tipo_deporte, frecuencia_deporte, tiempo_deporte'
          )
          .eq('id', c.estilo_vida_id)
          .maybeSingle()
      : Promise.resolve({ data: null } as const),
    c.recordatorio_24h_id
      ? supabase
          .from('consulta_recordatorio_24h')
          .select(
            'id, perfil_id, created_at, r24_desayuno, r24_colacion_manana, r24_comida, r24_colacion_tarde, r24_cena, r24_extras, es_dia_tipico, grasas_frecuentes, r24_agua_litros'
          )
          .eq('id', c.recordatorio_24h_id)
          .maybeSingle()
      : Promise.resolve({ data: null } as const),
  ]);

  return {
    consulta: c,
    antropometria: (ant.data as ConsultaAntropometria | null) ?? null,
    evaluacion: (ev.data as ConsultaEvaluacionDietetica | null) ?? null,
    estilo: (est.data as ConsultaEstiloVida | null) ?? null,
    recordatorio: (r24.data as ConsultaRecordatorio24h | null) ?? null,
  };
}
