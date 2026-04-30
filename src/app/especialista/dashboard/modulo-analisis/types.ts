/**
 * Tipos para el módulo de análisis de datos
 * 
 * Estos tipos definen la estructura de datos esperada para las gráficas
 * que se obtendrán del servicio de AWS Lambda
 */

// Tipos de gráfica disponibles
export type TipoGrafica = 
  | 'imc_por_edad'
  | 'peso_por_edad'
  | 'talla_por_edad'
  | 'circunferencia_cintura'
  | 'distribucion_genero'
  | 'consultas_mes'
  | 'enfermedades_frecuentes'
  | 'obesidad_prevalencia'
  | 'tendencia_peso'
  | 'actividad_fisica';

// Respuesta del Lambda para métricas generales
export interface MetricaGeneral {
  titulo: string;
  valor: number | string;
  cambio?: number; // Porcentaje de cambio vs mes anterior
  tendencia?: 'up' | 'down' | 'stable';
  unidad?: string;
}

// Datos para gráfica de barras
export interface GraficaBarras {
  tipo: 'bar';
  etiquetas: string[];
  datos: number[];
  titulo: string;
  subtitulo?: string;
  color?: string;
}

// Datos para gráfica de líneas
export interface GraficaLinea {
  tipo: 'line';
  etiquetas: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
  }[];
  titulo: string;
  subtitulo?: string;
}

// Datos para gráfica de pastel
export interface GraficaPastel {
  tipo: 'pie' | 'doughnut';
  etiquetas: string[];
  datos: number[];
  titulo: string;
  subtitulo?: string;
  colores?: string[];
}

// Datos para gráfica de área
export interface GraficaArea {
  tipo: 'area';
  etiquetas: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    fillColor?: string;
  }[];
  titulo: string;
  subtitulo?: string;
}

// Tipo union para cualquier gráfica
export type GraficaData = GraficaBarras | GraficaLinea | GraficaPastel | GraficaArea;

// Respuesta completa del análisis
export interface AnalisisData {
  metricas: MetricaGeneral[];
  graficas: GraficaData[];
  ultimoActualizado: string;
  periodo: {
    inicio: string;
    fin: string;
  };
}

// Parámetros para solicitar análisis
export interface AnalisisParams {
  tipoGrafica: TipoGrafica[];
  fechaInicio?: string;
  fechaFin?: string;
  especialistaId?: string;
  pacienteId?: string;
}

// Estado de carga del análisis
export type AnalisisStatus = 'idle' | 'loading' | 'success' | 'error';

// Configuración para el cliente Lambda
export interface LambdaConfig {
  endpoint: string;
  region: string;
  timeout: number;
}

// Opciones de fecha predefinidas
export type RangoFecha = 
  | 'semana'
  | 'mes'
  | 'trimestre'
  | 'semestre'
  | 'anio'
  | 'personalizado';

// Configuración de gráfica individual
export interface GraficaConfig {
  tipo: TipoGrafica;
  titulo: string;
  descripcion?: string;
  visible: boolean;
  orden: number;
}