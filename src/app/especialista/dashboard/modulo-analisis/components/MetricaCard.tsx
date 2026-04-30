'use client';

import { MetricaGeneral } from '../types';

interface MetricaCardProps {
  metrica: MetricaGeneral;
}

const ICONOS_TENDENCIA = {
  up: '↑',
  down: '↓',
  stable: '→',
};

const COLORES_TENDENCIA = {
  up: 'text-red-600',
  down: 'text-green-600',
  stable: 'text-gray-600',
};

export function MetricaCard({ metrica }: MetricaCardProps) {
  const esPositivo = metrica.tendencia === 'up' && metrica.cambio && metrica.cambio > 0;
  const esNegativo = metrica.tendencia === 'down' && metrica.cambio && metrica.cambio < 0;
  
  // Determinar color del cambio basado en el tipo de métrica
  let colorCambio = '';
  if (metrica.titulo.toLowerCase().includes('obesidad') || 
      metrica.titulo.toLowerCase().includes('imc')) {
    // Para métricas de salud, decrease es bueno
    colorCambio = metrica.cambio && metrica.cambio < 0 ? 'text-green-600' : 'text-red-600';
  } else {
    // Para otras métricas, increase es bueno
    colorCambio = metrica.cambio && metrica.cambio > 0 ? 'text-green-600' : 'text-red-600';
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <p className="text-sm text-gray-500 truncate">{metrica.titulo}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900">
          {metrica.valor}
        </span>
        {metrica.unidad && (
          <span className="text-sm text-gray-500">{metrica.unidad}</span>
        )}
      </div>
      {metrica.cambio !== undefined && metrica.cambio !== null && (
        <div className={`mt-2 text-sm ${colorCambio}`}>
          <span className="inline-flex items-center gap-1">
            <span>{ICONOS_TENDENCIA[metrica.tendencia || 'stable']}</span>
            <span>{Math.abs(metrica.cambio).toFixed(1)}%</span>
          </span>
          <span className="text-gray-400 ml-1">vs mes anterior</span>
        </div>
      )}
    </div>
  );
}

export default MetricaCard;