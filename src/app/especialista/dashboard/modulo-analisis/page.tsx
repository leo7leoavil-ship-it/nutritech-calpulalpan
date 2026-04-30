'use client';

import { useCallback, useEffect, useState } from 'react';
import { checkLambdaHealth, fetchAnalisis } from './lambda-client';
import {
  AnalisisData,
  AnalisisParams,
  GraficaData,
  RangoFecha,
  TipoGrafica
} from './types';

// Componentes de gráfica
import { DateRangePicker } from './components/DateRangePicker';
import { GraficaArea } from './components/GraficaArea';
import { GraficaBarras } from './components/GraficaBarras';
import { GraficaLinea } from './components/GraficaLinea';
import { GraficaPastel } from './components/GraficaPastel';
import { GraficaSkeleton } from './components/GraficaSkeleton';
import { MetricaCard } from './components/MetricaCard';

// Tipos de gráfica disponibles para el especialista
const GRAFICAS_DISPONIBLES: { tipo: TipoGrafica; titulo: string; descripcion: string }[] = [
  { tipo: 'imc_por_edad', titulo: 'IMC por Edad', descripcion: 'Distribución del IMC por grupos de edad' },
  { tipo: 'peso_por_edad', titulo: 'Peso por Edad', descripcion: 'Tendencia del peso promedio en el tiempo' },
  { tipo: 'consultas_mes', titulo: 'Consultas Mensuales', descripcion: 'Número de consultas por mes' },
  { tipo: 'distribucion_genero', titulo: 'Distribución por Género', descripcion: 'Porcentaje de pacientes por género' },
  { tipo: 'obesidad_prevalencia', titulo: 'Estado Nutricional', descripcion: 'Prevalencia de estados nutricionales' },
  { tipo: 'enfermedades_frecuentes', titulo: 'Enfermedades Frecuentes', descripcion: 'Enfermedades más comunes en pacientes' },
  { tipo: 'tendencia_peso', titulo: 'Tendencia de Peso', descripcion: 'Evolución del peso de los pacientes' },
  { tipo: 'actividad_fisica', titulo: 'Actividad Física', descripcion: 'Niveles de actividad física de los pacientes' },
];

interface ModuloAnalisisProps {
  especialistaId?: string;
}

export function ModuloAnalisis({ especialistaId }: ModuloAnalisisProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalisisData | null>(null);
  const [dbDisponible, setDbDisponible] = useState(false);
  const [rangoFecha, setRangoFecha] = useState<RangoFecha>('mes');
  const [fechasPersonalizadas, setFechasPersonalizadas] = useState<{
    inicio: string;
    fin: string;
  } | null>(null);
  const [graficasVisibles, setGraficasVisibles] = useState<Set<TipoGrafica>>(
    new Set(GRAFICAS_DISPONIBLES.map(g => g.tipo))
  );

  // Verificar disponibilidad de la base de datos al montar
  useEffect(() => {
    checkLambdaHealth()
      .then(setDbDisponible)
      .catch(() => setDbDisponible(false));
  }, []);

  // Cargar datos cuando cambie el rango de fecha
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let fechaInicio: string | undefined;
      let fechaFin: string | undefined;

      // Calcular fechas según el rango seleccionado
      const now = new Date();
      fechaFin = now.toISOString();

      switch (rangoFecha) {
        case 'semana':
          fechaInicio = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'mes':
          fechaInicio = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'trimestre':
          fechaInicio = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'semestre':
          fechaInicio = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'anio':
          fechaInicio = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'personalizado':
          if (fechasPersonalizadas) {
            fechaInicio = fechasPersonalizadas.inicio;
            fechaFin = fechasPersonalizadas.fin;
          }
          break;
      }

      const params: AnalisisParams = {
        tipoGrafica: Array.from(graficasVisibles),
        fechaInicio,
        fechaFin,
        especialistaId,
      };

      const resultado = await fetchAnalisis(params);
      setData(resultado);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar análisis');
    } finally {
      setLoading(false);
    }
  }, [rangoFecha, fechasPersonalizadas, graficasVisibles, especialistaId]);

  // Cargar datos inicial y cuando cambie la configuración
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Toggle visibilidad de gráfica
  const toggleGrafica = (tipo: TipoGrafica) => {
    setGraficasVisibles(prev => {
      const next = new Set(prev);
      if (next.has(tipo)) {
        next.delete(tipo);
      } else {
        next.add(tipo);
      }
      return next;
    });
  };

  // Renderizar gráfica según su tipo
  const renderGrafica = (grafica: GraficaData) => {
    switch (grafica.tipo) {
      case 'bar':
        return <GraficaBarras key={grafica.titulo} data={grafica} />;
      case 'line':
        return <GraficaLinea key={grafica.titulo} data={grafica} />;
      case 'pie':
      case 'doughnut':
        return <GraficaPastel key={grafica.titulo} data={grafica} />;
      case 'area':
        return <GraficaArea key={grafica.titulo} data={grafica} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header del módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Análisis de Datos
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Visualiza estadísticas y tendencias de tus pacientes
          </p>
        </div>
        
        {/* Indicador de estado de la base de datos */}
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dbDisponible ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <span className="text-sm text-gray-600">
            {dbDisponible ? 'Base de datos conectada' : 'Modo desarrollo'}
          </span>
        </div>
      </div>

      {/* Selector de rango de fecha */}
      <DateRangePicker
        valor={rangoFecha}
        onChange={setRangoFecha}
        fechasPersonalizadas={fechasPersonalizadas}
        onFechasChange={setFechasPersonalizadas}
      />

      {/* Métricas generales */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : data?.metricas ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.metricas.map((metrica, idx) => (
            <MetricaCard key={idx} metrica={metrica} />
          ))}
        </div>
      ) : null}

      {/* Gráficas */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <GraficaSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={cargarDatos}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Reintentar
          </button>
        </div>
      ) : data?.graficas ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.graficas.map((grafica, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              {renderGrafica(grafica)}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No hay datos disponibles para el período seleccionado
        </div>
      )}

      {/* Footer con última actualización */}
      {data && (
        <div className="text-center text-sm text-gray-400">
          Última actualización: {new Date(data.ultimoActualizado).toLocaleString('es-MX')}
        </div>
      )}
    </div>
  );
}

export default ModuloAnalisis;