'use client';

import { RangoFecha } from '../types';

interface DateRangePickerProps {
  valor: RangoFecha;
  onChange: (valor: RangoFecha) => void;
  fechasPersonalizadas: {
    inicio: string;
    fin: string;
  } | null;
  onFechasChange: (fechas: { inicio: string; fin: string } | null) => void;
}

const OPCIONES: { valor: RangoFecha; label: string }[] = [
  { valor: 'semana', label: 'Última semana' },
  { valor: 'mes', label: 'Último mes' },
  { valor: 'trimestre', label: 'Último trimestre' },
  { valor: 'semestre', label: 'Último semestre' },
  { valor: 'anio', label: 'Último año' },
  { valor: 'personalizado', label: 'Personalizado' },
];

export function DateRangePicker({
  valor,
  onChange,
  fechasPersonalizadas,
  onFechasChange,
}: DateRangePickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex gap-2">
        {OPCIONES.map((opcion) => (
          <button
            key={opcion.valor}
            onClick={() => onChange(opcion.valor)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              valor === opcion.valor
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {opcion.label}
          </button>
        ))}
      </div>

      {valor === 'personalizado' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={fechasPersonalizadas?.inicio || ''}
            onChange={(e) =>
              onFechasChange(
                fechasPersonalizadas
                  ? { ...fechasPersonalizadas, inicio: e.target.value }
                  : { inicio: e.target.value, fin: '' }
              )
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <span className="text-gray-500">-</span>
          <input
            type="date"
            value={fechasPersonalizadas?.fin || ''}
            onChange={(e) =>
              onFechasChange(
                fechasPersonalizadas
                  ? { ...fechasPersonalizadas, fin: e.target.value }
                  : { inicio: '', fin: e.target.value }
              )
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      )}
    </div>
  );
}

export default DateRangePicker;