export interface NuevaConsultaFormData {
  // Tabla: consultas
  motivo_consulta: string;

  // Tabla: consulta_antropometria
  peso_kg: string;
  talla_cm: string;

  // Tabla: consulta_evaluacion_dietetica
  comidas_dia: string;
  agua_litros: string;
  nivel_apetito: string;
  hora_max_apetito: string;
  compania_comida_tipo: string;
  compania_comida_detalle: string;
  tiempo_comida_min: string;
  usa_dispositivos: boolean;
  dispositivos_detalle: string;
  sal_adicional: boolean;
  preferencias_positivas: string;
  preferencias_negativas: string;

  // Tabla: consulta_estilo_vida
  sueno_horas: string;
  sueno_problemas: string;
  actividad_fisica: string;
  ejercicio_frecuencia: string;
  ejercicio_tiempo: string;
  practica_deporte: string;
  tipo_deporte: string;
  frecuencia_deporte: string;
  tiempo_deporte: string;

  // Tabla: consulta_recordatorio_24h
  r24_desayuno: string;
  r24_colacion_manana: string;
  r24_comida: string;
  r24_colacion_tarde: string;
  r24_cena: string;
  r24_extras: string;
  es_dia_tipico: string;
  grasas_frecuentes: string;
  r24_agua_litros: string;
}

export {};
