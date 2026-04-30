'use client';

import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import { GraficaPastel as GraficaPastelType } from '../types';

interface GraficaPastelProps {
  data: GraficaPastelType;
}

const COLORES_DEFAULT = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', 
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
];

export function GraficaPastel({ data }: GraficaPastelProps) {
  const chartData = data.etiquetas.map((etiqueta, idx) => ({
    name: etiqueta,
    value: data.datos[idx],
  }));

  const colores = data.colores || COLORES_DEFAULT;

  return (
    <div className="h-80">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {data.titulo}
      </h3>
      {data.subtitulo && (
        <p className="text-sm text-gray-500 mb-4">{data.subtitulo}</p>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={data.tipo === 'doughnut' ? 60 : 0}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }: { name?: string; percent?: number }) => name ? `${name} ${((percent || 0) * 100).toFixed(0)}%` : ''}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colores[index % colores.length]} 
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value) => [`${value || 0}`, 'Valor']}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default GraficaPastel;