export type Perfil = {
  id: string;
  nombre_completo: string | null;
  curp: string;
  sexo: string | null;
  fecha_nacimiento: string | null;
  direccion: string | null;
  ocupacion: string | null;
  telefono: string | null;
  registro_completo: boolean | null;
};

export type Consulta = {
  id: string;
  created_at: string;
  paciente_id: string;
  especialista_id: string | null;
  motivo_consulta: string | null;
  status: string;
  diagnostico_especialista: string | null;
  plan_alimenticio_resumen: string | null;
  antropometria_id: string | null;
  evaluacion_dietetica_id: string | null;
  estilo_vida_id: string | null;
  recordatorio_24h_id: string | null;
};

export type AntecedentesFamiliares = {
  diabetes_padre: boolean | null;
  diabetes_madre: boolean | null;
  obesidad_padre: boolean | null;
  obesidad_madre: boolean | null;
  hipertension_padre: boolean | null;
  hipertension_madre: boolean | null;
  sobrepeso_padre: boolean | null;
  sobrepeso_madre: boolean | null;
  tiene_alergias: boolean | null;
  alergias_especificar: string | null;
  otros_antecedentes: string | null;
  diabetes_observaciones: string | null;
  sobrepeso_observaciones: string | null;
  obesidad_observaciones: string | null;
  hipertension_observaciones: string | null;
  colesterol_trigliceridos: string | null;
};

export type AntecedentesPatologicos = {
  padece_enfermedad: boolean | null;
  enfermedad_diagnosticada: string | null;
  toma_medicamento: boolean | null;
  nombre_medicamento: string | null;
  dosis: string | null;
};

export type ConsultaAntropometria = {
  id: string;
  perfil_id: string;
  created_at: string;
  peso_kg: number;
  talla_cm: number;
  imc: number | null;
};

export type ConsultaEvaluacionDietetica = {
  id: string;
  perfil_id: string;
  created_at: string;
  comidas_dia: string | null;
  agua_litros: string | null;
  nivel_apetito: string | null;
  hora_max_apetito: string | null;
  compania_comida_tipo: string | null;
  compania_comida_detalle: string | null;
  tiempo_comida_min: string | null;
  usa_dispositivos: boolean | null;
  dispositivos_detalle: string | null;
  sal_adicional: boolean | null;
  preferencias_positivas: string | null;
  preferencias_negativas: string | null;
};

export type ConsultaEstiloVida = {
  id: string;
  perfil_id: string;
  created_at: string;
  sueno_horas: string | null;
  sueno_problemas: string | null;
  actividad_fisica: string | null;
  ejercicio_frecuencia: string | null;
  ejercicio_tiempo: string | null;
  practica_deporte: string | null;
  tipo_deporte: string | null;
  frecuencia_deporte: string | null;
  tiempo_deporte: string | null;
};

export type ConsultaRecordatorio24h = {
  id: string;
  perfil_id: string;
  created_at: string;
  r24_desayuno: string | null;
  r24_colacion_manana: string | null;
  r24_comida: string | null;
  r24_colacion_tarde: string | null;
  r24_cena: string | null;
  r24_extras: string | null;
  es_dia_tipico: string | null;
  grasas_frecuentes: string | null;
  r24_agua_litros: string | null;
};

export type ConsultaFormularioDetalle = {
  consulta: Consulta;
  antropometria: ConsultaAntropometria | null;
  evaluacion: ConsultaEvaluacionDietetica | null;
  estilo: ConsultaEstiloVida | null;
  recordatorio: ConsultaRecordatorio24h | null;
};

