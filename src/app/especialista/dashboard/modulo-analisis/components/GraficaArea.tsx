'use client';

import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { GraficaArea as GraficaAreaType } from '../types';

interface GraficaAreaProps {
  data: GraficaAreaType;
}

export function GraficaArea({ data }: GraficaAreaProps) {
  const chartData = data.etiquetas.map((etiqueta, idx) => {
    const entry: Record<string, string | number> = { name: etiqueta };
    data.datasets.forEach((dataset) => {
      entry[dataset.label] = dataset.data[idx];
    });
    return entry;
  });

  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  return (
    <div className="h-80">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {data.titulo}
      </h3>
      {data.subtitulo && (
        <p className="text-sm text-gray-500 mb-4">{data.subtitulo}</p>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
          {data.datasets.map((dataset, idx) => (
            <Area
              key={dataset.label}
              type="monotone"
              dataKey={dataset.label}
              stroke={dataset.borderColor || colors[idx % colors.length]}
              fill={dataset.fillColor || `${colors[idx % colors.length]}20`}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default GraficaArea;