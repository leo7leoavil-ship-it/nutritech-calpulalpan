import { AlertDot } from './AlertDot';
import { Card } from './Card';
import { TabButton } from './TabButton';
import { AntecedentesFamiliares, Consulta, Perfil } from '../types';
import { yearsOld } from '../utils';

export function PatientDetailPanel({
  selectedConsulta,
  selectedPaciente,
  familiares,
  tab,
  onTabChange,
  onStartConsulta,
}: {
  selectedConsulta: Consulta | null;
  selectedPaciente: Perfil | null;
  familiares: AntecedentesFamiliares | null;
  tab: 'perfil' | 'fisica' | 'r24';
  onTabChange: (tab: 'perfil' | 'fisica' | 'r24') => void;
  onStartConsulta: () => void;
}) {
  const edad = selectedPaciente ? yearsOld(selectedPaciente.fecha_nacimiento) : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="p-6 flex items-start justify-between gap-6 border-b">
        <div className="min-w-0">
          <p className="text-xl font-bold text-gray-900 truncate">
            {selectedPaciente?.nombre_completo || 'Selecciona un paciente'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            CURP: {selectedPaciente?.curp || '—'}
          </p>
          <p className="text-xs mt-2">
            <span className="inline-flex items-center gap-2 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {selectedPaciente?.registro_completo
                ? 'Registro Completo'
                : 'Registro incompleto'}
            </span>
          </p>
        </div>

        <button
          type="button"
          disabled={!selectedConsulta || !selectedPaciente}
          onClick={onStartConsulta}
          className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Iniciar Consulta
        </button>
      </div>

      <div className="p-6">
        <div className="flex flex-wrap gap-2">
          <TabButton active={tab === 'perfil'} onClick={() => onTabChange('perfil')}>
            Perfil Clínico
          </TabButton>
          <TabButton active={tab === 'fisica'} onClick={() => onTabChange('fisica')}>
            Evaluación Física
          </TabButton>
          <TabButton active={tab === 'r24'} onClick={() => onTabChange('r24')}>
            Recordatorio 24h
          </TabButton>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card label="Edad" value={edad != null ? `${edad} años` : '—'} />
          <Card label="Sexo" value={selectedPaciente?.sexo || '—'} />
          <Card label="Ocupación" value={selectedPaciente?.ocupacion || '—'} />
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card label="Teléfono" value={selectedPaciente?.telefono || '—'} />
          <Card
            label="Fecha Nacimiento"
            value={
              selectedPaciente?.fecha_nacimiento
                ? new Date(selectedPaciente.fecha_nacimiento).toLocaleDateString('es-MX')
                : '—'
            }
          />
        </div>

        <div className="mt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="font-semibold text-amber-900">Alertas Heredofamiliares</p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {familiares ? (
                <>
                  {familiares.diabetes_padre ? (
                    <AlertDot color="red" text="Diabetes - Padre" />
                  ) : null}
                  {familiares.diabetes_madre ? (
                    <AlertDot color="red" text="Diabetes - Madre" />
                  ) : null}
                  {familiares.hipertension_padre ? (
                    <AlertDot color="amber" text="Hipertensión - Padre" />
                  ) : null}
                  {familiares.hipertension_madre ? (
                    <AlertDot color="amber" text="Hipertensión - Madre" />
                  ) : null}
                  {familiares.obesidad_padre ? (
                    <AlertDot color="amber" text="Obesidad - Padre" />
                  ) : null}
                  {familiares.obesidad_madre ? (
                    <AlertDot color="amber" text="Obesidad - Madre" />
                  ) : null}
                  {familiares.tiene_alergias ? (
                    <AlertDot
                      color="red"
                      text={`Alergias - ${familiares.alergias_especificar || 'Especificar'}`}
                    />
                  ) : null}
                  {!familiares.diabetes_padre &&
                  !familiares.diabetes_madre &&
                  !familiares.hipertension_padre &&
                  !familiares.hipertension_madre &&
                  !familiares.obesidad_padre &&
                  !familiares.obesidad_madre &&
                  !familiares.tiene_alergias ? (
                    <p className="text-sm text-amber-900/70">Sin alertas registradas.</p>
                  ) : null}
                </>
              ) : (
                <p className="text-sm text-amber-900/70">Sin información registrada.</p>
              )}
            </div>
          </div>
        </div>

        {tab !== 'perfil' ? (
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-2xl p-5 text-sm text-gray-600">
            Esta pestaña se conectará a las tablas de consulta (antropometría,
            estilo de vida y recordatorio 24h) en la siguiente iteración.
          </div>
        ) : null}
      </div>
    </div>
  );
}

