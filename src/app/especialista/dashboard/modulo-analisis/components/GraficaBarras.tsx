'use client';

import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { GraficaBarras as GraficaBarrasType } from '../types';

interface GraficaBarrasProps {
  data: GraficaBarrasType;
}

export function GraficaBarras({ data }: GraficaBarrasProps) {
  const chartData = data.etiquetas.map((etiqueta, idx) => ({
    name: etiqueta,
    value: data.datos[idx],
  }));

  return (
    <div className="h-80">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {data.titulo}
      </h3>
      {data.subtitulo && (
        <p className="text-sm text-gray-500 mb-4">{data.subtitulo}</p>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend />
          <Bar 
            dataKey="value" 
            fill={data.color || '#10b981'} 
            radius={[4, 4, 0, 0]}
            name={data.titulo}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default GraficaBarras;