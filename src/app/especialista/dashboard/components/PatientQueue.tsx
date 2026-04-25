import { Badge } from './Badge';
import { Consulta, Perfil } from '../types';
import { yearsOld } from '../utils';

export function PatientQueue({
  cola,
  pacientes,
  selectedId,
  onSelect,
}: {
  cola: Consulta[];
  pacientes: Record<string, Perfil>;
  selectedId: string | null;
  onSelect: (consultaId: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b">
        <p className="text-lg font-bold text-gray-900">Cola de Pacientes</p>
        <p className="text-sm text-gray-500">
          {cola.length} paciente{cola.length === 1 ? '' : 's'} pendiente
          {cola.length === 1 ? '' : 's'}
        </p>
      </div>

      {cola.length === 0 ? (
        <div className="p-10 text-center text-gray-500">
          <p className="font-semibold">Sin pacientes en cola</p>
          <p className="text-sm mt-1">
            Cuando llegue una consulta pendiente aparecerá aquí.
          </p>
        </div>
      ) : (
        <ul className="divide-y">
          {cola.map((c) => {
            const p = pacientes[c.paciente_id];
            const isActive = c.id === selectedId;
            const motivo = c.motivo_consulta ?? '—';
            const edad = p ? yearsOld(p.fecha_nacimiento) : null;
            const sexo = p?.sexo || '—';
            const registro = !!p?.registro_completo;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onSelect(c.id)}
                  className={`w-full text-left p-5 transition-colors ${
                    isActive ? 'bg-emerald-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {p?.nombre_completo || 'Paciente'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {edad != null ? `${edad} años` : '—'} · {sexo}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1 truncate">
                        CURP: {p?.curp || '—'}
                      </p>
                    </div>
                    <Badge status={c.status} registroCompleto={registro} />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

