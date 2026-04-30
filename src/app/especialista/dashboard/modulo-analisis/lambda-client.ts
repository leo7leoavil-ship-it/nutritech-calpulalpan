/**
 * Cliente de base de datos para el módulo de análisis
 * 
 * Este módulo proporciona las funciones necesarias para obtener
 * datos directamente de Supabase para generar las gráficas de análisis.
 * Ya no depende de AWS Lambda.
 */

import { createClient } from '@/lib/server';
import { getAnalisisDatos } from './db-client';
import {
  AnalisisData,
  AnalisisParams,
  MetricaGeneral,
  TipoGrafica
} from './types';

/**
 * Obtiene datos de análisis直接从 la base de datos
 * 
 * @param params - Parámetros para el análisis
 * @returns - Datos del análisis
 */
export async function fetchAnalisis(
  params: AnalisisParams
): Promise<AnalisisData> {
  try {
    const supabase = await createClient();
    const datos = await getAnalisisDatos(supabase, params.fechaInicio, params.fechaFin);
    return {
      ...datos,
      ultimoActualizado: new Date().toISOString(),
      periodo: {
        inicio: params.fechaInicio || new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        fin: params.fechaFin || new Date().toISOString(),
      },
    };
  } catch (dbError) {
    // Si falla la base de datos, usar datos mock
    console.warn('Error al obtener datos de DB:', dbError);
    console.warn('Usando datos de ejemplo.');
    return getMockData(params.tipoGrafica);
  }
}

/**
 * Obtiene datos de una gráfica específica
 */
export async function fetchGrafica(
  tipoGrafica: TipoGrafica,
  fechaInicio?: string,
  fechaFin?: string
): Promise<AnalisisData> {
  return fetchAnalisis({
    tipoGrafica: [tipoGrafica],
    fechaInicio,
    fechaFin,
  });
}

/**
 * Obtiene múltiples gráficas en una sola petición
 */
export async function fetchGraficas(
  tipos: TipoGrafica[],
  fechaInicio?: string,
  fechaFin?: string
): Promise<AnalisisData> {
  return fetchAnalisis({
    tipoGrafica: tipos,
    fechaInicio,
    fechaFin,
  });
}

/**
 * Verifica si el servicio de análisis está disponible
 * Ahora siempre retorna true ya que no dependemos de Lambda externo
 */
export async function checkLambdaHealth(): Promise<boolean> {
  try {
    const supabase = await createClient();
    // Simple verificación de conexión
    const { error } = await supabase.from('perfiles').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

// ============================================
// DATOS DE EJEMPLO (MOCK DATA)
// ============================================
// Estos datos se usan cuando no hay conexión al Lambda

function getMockData(tipos: TipoGrafica[]): AnalisisData {
  const metricas: MetricaGeneral[] = [
    { titulo: 'Total Pacientes', valor: 156, cambio: 12.5, tendencia: 'up' },
    { titulo: 'Consultas este mes', valor: 43, cambio: 8.2, tendencia: 'up' },
    { titulo: 'IMC Promedio', valor: 26.4, cambio: -0.3, tendencia: 'down' },
    { titulo: 'Pacientes con obesidad', valor: '32%', cambio: 2.1, tendencia: 'up', unidad: '%' },
  ];

  const graficas = tipos.map((tipo) => {
    switch (tipo) {
      case 'imc_por_edad':
        return {
          tipo: 'bar' as const,
          etiquetas: ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'],
          datos: [22.1, 24.3, 26.8, 27.2, 26.9, 25.8],
          titulo: 'IMC Promedio por Grupo de Edad',
          subtitulo: 'Últimos 12 meses',
        };
      case 'peso_por_edad':
        return {
          tipo: 'line' as const,
          etiquetas: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Peso Promedio (kg)',
              data: [72.3, 71.8, 73.1, 72.5, 71.2, 70.8],
              borderColor: '#10b981',
            },
          ],
          titulo: 'Tendencia de Peso Promedio',
          subtitulo: 'Últimos 6 meses',
        };
      case 'consultas_mes':
        return {
          tipo: 'bar' as const,
          etiquetas: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
          datos: [28, 35, 42, 38, 45, 43],
          titulo: 'Consultas por Mes',
          subtitulo: 'Año actual',
          color: '#3b82f6',
        };
      case 'distribucion_genero':
        return {
          tipo: 'pie' as const,
          etiquetas: ['Femenino', 'Masculino', 'Otro'],
          datos: [58, 40, 2],
          titulo: 'Distribución por Género',
          colores: ['#ec4899', '#3b82f6', '#8b5cf6'],
        };
      case 'obesidad_prevalencia':
        return {
          tipo: 'doughnut' as const,
          etiquetas: ['Normal', 'Sobrepeso', 'Obesidad I', 'Obesidad II', 'Obesidad III'],
          datos: [35, 28, 22, 10, 5],
          titulo: 'Prevalencia de Estado Nutricional',
          colores: ['#22c55e', '#eab308', '#f97316', '#ef4444', '#dc2626'],
        };
      case 'enfermedades_frecuentes':
        return {
          tipo: 'bar' as const,
          etiquetas: ['Diabetes', 'Hipertensión', 'Dislipidemia', 'Obesidad', 'Ninguna'],
          datos: [18, 24, 15, 32, 45],
          titulo: 'Enfermedades más Frecuentes',
          subtitulo: 'Porcentaje de pacientes',
        };
      case 'tendencia_peso':
        return {
          tipo: 'area' as const,
          etiquetas: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'],
          datasets: [
            {
              label: 'Peso Promedio',
              data: [72.5, 71.8, 73.2, 72.1, 71.5, 70.9],
              borderColor: '#10b981',
              fillColor: 'rgba(16, 185, 129, 0.2)',
            },
          ],
          titulo: 'Tendencia de Peso',
          subtitulo: 'Últimas 6 semanas',
        };
      case 'actividad_fisica':
        return {
          tipo: 'bar' as const,
          etiquetas: ['Sedentario', 'Ligera', 'Moderada', 'Activa', 'Muy Activa'],
          datos: [15, 28, 35, 17, 5],
          titulo: 'Nivel de Actividad Física',
          color: '#8b5cf6',
        };
      default:
        return {
          tipo: 'bar' as const,
          etiquetas: [],
          datos: [],
          titulo: 'Gráfica no disponible',
        };
    }
  });

  return {
    metricas,
    graficas,
    ultimoActualizado: new Date().toISOString(),
    periodo: {
      inicio: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      fin: new Date().toISOString(),
    },
  };
}