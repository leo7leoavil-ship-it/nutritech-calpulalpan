import { ClipboardList, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AlertDot } from './AlertDot';
import { Badge } from './Badge';
import {
  AntecedentesFamiliares,
  AntecedentesPatologicos,
  Consulta,
  Perfil,
} from '../types';
import { fmtFecha, yearsOld } from '../utils';

export function ConsultaModal({
  open,
  onClose,
  paciente,
  consulta,
  familiares,
  patologicos,
  historial,
  onFinalize,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  paciente: Perfil;
  consulta: Consulta;
  familiares: AntecedentesFamiliares | null;
  patologicos: AntecedentesPatologicos | null;
  historial: Consulta[];
  onFinalize: (payload: {
    diagnostico_especialista: string;
    plan_alimenticio_resumen: string;
  }) => void;
  saving: boolean;
}) {
  const [diagnostico, setDiagnostico] = useState(
    consulta.diagnostico_especialista ?? ''
  );
  const [plan, setPlan] = useState(consulta.plan_alimenticio_resumen ?? '');

  useEffect(() => {
    setDiagnostico(consulta.diagnostico_especialista ?? '');
    setPlan(consulta.plan_alimenticio_resumen ?? '');
  }, [
    consulta.id,
    consulta.diagnostico_especialista,
    consulta.plan_alimenticio_resumen,
  ]);

  if (!open) return null;

  const edad = yearsOld(paciente.fecha_nacimiento);
  const registroCompleto = !!paciente.registro_completo;

  const alertas: Array<{ color: 'red' | 'amber' | 'green'; text: string }> = [];
  if (familiares?.diabetes_padre)
    alertas.push({ color: 'red', text: 'Diabetes - Padre' });
  if (familiares?.diabetes_madre)
    alertas.push({ color: 'red', text: 'Diabetes - Madre' });
  if (familiares?.hipertension_padre)
    alertas.push({ color: 'amber', text: 'Hipertensión - Padre' });
  if (familiares?.hipertension_madre)
    alertas.push({ color: 'amber', text: 'Hipertensión - Madre' });
  if (familiares?.obesidad_padre)
    alertas.push({ color: 'amber', text: 'Obesidad - Padre' });
  if (familiares?.obesidad_madre)
    alertas.push({ color: 'amber', text: 'Obesidad - Madre' });
  if (familiares?.tiene_alergias)
    alertas.push({
      color: 'red',
      text: `Alergias - ${familiares.alergias_especificar || 'Especificar'}`,
    });

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="absolute inset-x-4 top-10 bottom-10 md:inset-x-10 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="flex items-start justify-between gap-4 p-6 border-b">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-900 truncate">
              {paciente.nombre_completo || 'Paciente'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {edad != null ? `${edad} años` : '—'} · {paciente.sexo || '—'} ·
              CURP: {paciente.curp}
            </p>
            <p className="text-xs mt-2">
              <span
                className={`inline-flex items-center gap-2 ${
                  registroCompleto ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    registroCompleto ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                {registroCompleto ? 'Registro Completo' : 'Registro incompleto'}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-600"
            aria-label="Cerrar"
          >
            <X />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(100%-148px)]">
          <div className="p-6 overflow-auto border-b lg:border-b-0 lg:border-r">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Expediente Histórico
            </h3>

            <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b bg-white">
                <p className="text-sm font-semibold text-gray-900">
                  Antecedentes Heredofamiliares
                </p>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {alertas.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Sin alertas heredofamiliares registradas.
                  </p>
                ) : (
                  alertas.map((a) => (
                    <AlertDot key={a.text} color={a.color} text={a.text} />
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b bg-white">
                <p className="text-sm font-semibold text-gray-900">
                  Antecedentes Patológicos
                </p>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500">
                    Enfermedades diagnosticadas
                  </p>
                  <p className="text-sm text-gray-900 mt-1">
                    {patologicos?.enfermedad_diagnosticada?.trim() ||
                      'Sin registro'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Medicamentos que toma</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {patologicos?.nombre_medicamento?.trim()
                      ? `${patologicos.nombre_medicamento}${
                          patologicos.dosis ? ` (${patologicos.dosis})` : ''
                        }`
                      : 'Sin registro'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <ClipboardList size={16} className="text-emerald-700" />
                Historial de Consultas
              </div>

              <div className="mt-3 space-y-3">
                {historial.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Aún no hay consultas en el historial.
                  </p>
                ) : (
                  historial.map((h) => (
                    <div
                      key={h.id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">
                            {fmtFecha(h.created_at)}
                          </p>
                          <p className="text-sm font-semibold text-gray-900 mt-1 truncate">
                            {h.motivo_consulta?.trim() || 'Consulta'}
                          </p>
                        </div>
                        <Badge
                          status={h.status}
                          registroCompleto={!!paciente.registro_completo}
                        />
                      </div>
                      {h.plan_alimenticio_resumen?.trim() ? (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {h.plan_alimenticio_resumen}
                        </p>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="p-6 overflow-auto">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Estación de Trabajo
            </h3>

            <div className="bg-emerald-50 rounded-2xl border border-emerald-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-emerald-200 bg-white/60 flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-700" />
                <p className="text-sm font-semibold text-emerald-900">
                  Asistencia por IA
                </p>
              </div>
              <div className="p-4 text-sm text-emerald-900 space-y-2">
                <p className="leading-relaxed">
                  - Revisa el motivo de consulta y valida datos antropométricos
                  antes de definir el plan.
                </p>
                <p className="leading-relaxed">
                  - Si hay antecedentes relevantes, sugiere ajustes graduales y
                  medibles.
                </p>
                <p className="text-xs text-emerald-700 pt-2">
                  Haz clic en una sugerencia para agregarla al plan
                  (próximamente).
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-900">
                Diagnóstico y Recomendaciones
              </p>
              <textarea
                value={diagnostico}
                onChange={(e) => setDiagnostico(e.target.value)}
                placeholder="Ingrese aquí el diagnóstico, recomendaciones, plan de seguimiento y observaciones relevantes..."
                className="mt-2 w-full min-h-[140px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-900">
                Plan alimenticio (resumen)
              </p>
              <textarea
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                placeholder="Resumen del plan alimenticio..."
                className="mt-2 w-full min-h-[120px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  onFinalize({
                    diagnostico_especialista: diagnostico,
                    plan_alimenticio_resumen: plan,
                  })
                }
                className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Finalizar Consulta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

