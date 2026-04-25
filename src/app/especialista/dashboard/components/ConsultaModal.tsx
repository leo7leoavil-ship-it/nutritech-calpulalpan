import { ClipboardList, FileText, Sparkles, Stethoscope, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AlertDot } from './AlertDot';
import { Badge } from './Badge';
import {
  AntecedentesFamiliares,
  AntecedentesPatologicos,
  Consulta,
  ConsultaFormularioDetalle,
  Perfil,
} from '../types';
import { fmtFecha, yearsOld } from '../utils';

function DataRow({ label, value }: { label: string; value: string }) {
  const t = (value || '').trim();
  return (
    <div className="min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm text-gray-900 mt-0.5 whitespace-pre-wrap break-words">
        {t || '—'}
      </p>
    </div>
  );
}

function SectionCard({
  title,
  children,
  icon: Icon = FileText,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string; size?: number }>;
}) {
  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b bg-white flex items-center gap-2">
        <Icon className="text-emerald-700 shrink-0" size={16} />
        <p className="text-sm font-semibold text-gray-900">{title}</p>
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

function siNo(
  v: boolean | null | undefined,
  si = 'Sí',
  no = 'No'
): string {
  if (v === true) return si;
  if (v === false) return no;
  return '—';
}

function fmtImc(n: number | null | undefined): string {
  if (n == null || Number.isNaN(Number(n))) return '—';
  return Number(n).toFixed(2);
}

export function ConsultaModal({
  open,
  onClose,
  paciente,
  consultaActual,
  consultaVistaId,
  vistaEfectivaId,
  onConsultaVistaIdChange,
  detalleVista,
  cargandoDetalle,
  familiares,
  patologicos,
  historial,
  onFinalize,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  paciente: Perfil;
  consultaActual: Consulta;
  /** `null` = mostrar la consulta en curso (pendiente) */
  consultaVistaId: string | null;
  vistaEfectivaId: string;
  onConsultaVistaIdChange: (id: string | null) => void;
  detalleVista: ConsultaFormularioDetalle | null;
  cargandoDetalle: boolean;
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
    consultaActual.diagnostico_especialista ?? ''
  );
  const [plan, setPlan] = useState(consultaActual.plan_alimenticio_resumen ?? '');

  useEffect(() => {
    setDiagnostico(consultaActual.diagnostico_especialista ?? '');
    setPlan(consultaActual.plan_alimenticio_resumen ?? '');
  }, [
    consultaActual.id,
    consultaActual.diagnostico_especialista,
    consultaActual.plan_alimenticio_resumen,
  ]);

  if (!open) return null;

  const edad = yearsOld(paciente.fecha_nacimiento);
  const registroCompleto = !!paciente.registro_completo;
  const mostrandoVistaDelHistorial = vistaEfectivaId !== consultaActual.id;

  const c = detalleVista?.consulta;
  const a = detalleVista?.antropometria;
  const e = detalleVista?.evaluacion;
  const ev = detalleVista?.estilo;
  const r = detalleVista?.recordatorio;

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
  if (familiares?.sobrepeso_padre)
    alertas.push({ color: 'amber', text: 'Sobrepeso - Padre' });
  if (familiares?.sobrepeso_madre)
    alertas.push({ color: 'amber', text: 'Sobrepeso - Madre' });
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

      <div className="absolute inset-x-2 top-6 bottom-6 md:inset-x-6 md:top-8 md:bottom-8 max-h-[95vh] mx-auto max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
        <div className="flex items-start justify-between gap-4 p-5 md:p-6 border-b shrink-0">
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
                {registroCompleto ? 'Registro completo' : 'Registro incompleto'}
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

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2">
          <div className="p-5 md:p-6 overflow-y-auto border-b lg:border-b-0 lg:border-r max-h-[70vh] lg:max-h-none">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Stethoscope size={16} className="text-emerald-700" />
              Registro fijo y expediente
            </h3>

            <SectionCard title="Identificación (registro)">
              <DataRow
                label="Dirección"
                value={paciente.direccion ?? ''}
              />
              <DataRow
                label="Ocupación"
                value={paciente.ocupacion ?? ''}
              />
              <DataRow
                label="Teléfono"
                value={paciente.telefono ?? ''}
              />
              <DataRow
                label="Fecha de nacimiento"
                value={
                  paciente.fecha_nacimiento
                    ? new Date(paciente.fecha_nacimiento).toLocaleDateString('es-MX')
                    : ''
                }
              />
            </SectionCard>

            <div className="mt-4">
              <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b bg-white">
                  <p className="text-sm font-semibold text-gray-900">
                    Antecedentes heredofamiliares
                  </p>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {alertas.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        Sin factores de riesgo marcados en el cuestionario.
                      </p>
                    ) : (
                      alertas.map((x) => (
                        <AlertDot key={x.text} color={x.color} text={x.text} />
                      ))
                    )}
                  </div>
                  <DataRow
                    label="Observaciones — diabetes"
                    value={familiares?.diabetes_observaciones ?? ''}
                  />
                  <DataRow
                    label="Observaciones — sobrepeso"
                    value={familiares?.sobrepeso_observaciones ?? ''}
                  />
                  <DataRow
                    label="Observaciones — obesidad"
                    value={familiares?.obesidad_observaciones ?? ''}
                  />
                  <DataRow
                    label="Observaciones — hipertensión"
                    value={familiares?.hipertension_observaciones ?? ''}
                  />
                  <DataRow
                    label="Colesterol / triglicéridos en familia"
                    value={familiares?.colesterol_trigliceridos ?? ''}
                  />
                  <DataRow
                    label="Otros antecedentes (cáncer, renales, etc.)"
                    value={familiares?.otros_antecedentes ?? ''}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b bg-white">
                  <p className="text-sm font-semibold text-gray-900">
                    Antecedentes patológicos
                  </p>
                </div>
                <div className="p-4 space-y-3">
                  <DataRow
                    label="¿Padece alguna enfermedad o padecimiento? (Sí / No)"
                    value={siNo(patologicos?.padece_enfermedad ?? null)}
                  />
                  <DataRow
                    label="Enfermedad(es) diagnosticada(s)"
                    value={patologicos?.enfermedad_diagnosticada ?? ''}
                  />
                  <DataRow
                    label="¿Toma medicamento(s)? (Sí / No)"
                    value={siNo(patologicos?.toma_medicamento ?? null)}
                  />
                  <DataRow
                    label="Medicamento"
                    value={patologicos?.nombre_medicamento ?? ''}
                  />
                  <DataRow label="Dosis" value={patologicos?.dosis ?? ''} />
                </div>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <ClipboardList size={16} className="text-emerald-700" />
                Historial de consultas
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Toca &quot;Consulta en curso&quot; para lo pendiente, o un ítem
                del historial para ver esa visita.
              </p>

              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => onConsultaVistaIdChange(null)}
                  className={`w-full text-left rounded-2xl border p-4 shadow-sm transition-colors ${
                    consultaVistaId == null
                      ? 'border-emerald-400 bg-emerald-50/50 ring-1 ring-emerald-200'
                      : 'border-gray-100 bg-white hover:bg-gray-50'
                  }`}
                >
                  <p className="text-xs text-gray-500">
                    {fmtFecha(consultaActual.created_at)}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    Consulta en curso (pendiente)
                  </p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {consultaActual.motivo_consulta?.trim() || '—'}
                  </p>
                </button>
              </div>

              <div className="mt-3 space-y-3">
                {historial.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No hay consultas previas en el historial.
                  </p>
                ) : (
                  historial.map((h) => (
                    <button
                      type="button"
                      key={h.id}
                      onClick={() => onConsultaVistaIdChange(h.id)}
                      className={`w-full text-left rounded-2xl border p-4 shadow-sm transition-colors ${
                        consultaVistaId === h.id
                          ? 'border-emerald-400 bg-emerald-50/50 ring-1 ring-emerald-200'
                          : 'border-gray-100 bg-white hover:bg-gray-50'
                      }`}
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
                    </button>
                  ))
                )}
              </div>
            </div>

            <h3 className="text-sm font-semibold text-gray-900 mt-6 mb-3">
              Formulario de la consulta seleccionada
            </h3>
            {cargandoDetalle ? (
              <p className="text-sm text-gray-500">Cargando detalle…</p>
            ) : !detalleVista || !c ? (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                No se pudo cargar el detalle. Verifica la red o vuelve a
                abrir.
              </p>
            ) : (
              <div className="space-y-4">
                {mostrandoVistaDelHistorial ? (
                  <p className="text-xs text-gray-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    Mostrando una consulta <strong>atendida</strong> (solo
                    lectura). El panel derecho sigue refiriéndose a la
                    <strong> consulta en curso</strong>.
                  </p>
                ) : null}

                <SectionCard title="1. Motivo de la consulta">
                  <DataRow
                    label="Motivo"
                    value={c.motivo_consulta ?? ''}
                  />
                </SectionCard>

                <SectionCard title="2. Antropometría" icon={Stethoscope}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <DataRow
                      label="Peso (kg)"
                      value={a != null ? String(a.peso_kg) : ''}
                    />
                    <DataRow
                      label="Talla (cm)"
                      value={a != null ? String(a.talla_cm) : ''}
                    />
                    <DataRow
                      label="IMC"
                      value={a != null ? fmtImc(a.imc) : ''}
                    />
                  </div>
                </SectionCard>

                <SectionCard title="3. Evaluación dietética">
                  <DataRow
                    label="¿Cuántas comidas realizas al día?"
                    value={e?.comidas_dia ?? ''}
                  />
                  <DataRow
                    label="¿Cuántos litros de agua tomas al día?"
                    value={e?.agua_litros ?? ''}
                  />
                  <DataRow
                    label="¿Cómo consideras tu apetito?"
                    value={e?.nivel_apetito ?? ''}
                  />
                  <DataRow
                    label="¿A qué hora sientes mayor apetito?"
                    value={e?.hora_max_apetito ?? ''}
                  />
                  <DataRow
                    label="¿Comes acompañado o solo? / detalle"
                    value={
                      [e?.compania_comida_tipo, e?.compania_comida_detalle]
                        .filter(Boolean)
                        .join(' — ') || ''
                    }
                  />
                  <DataRow
                    label="Tiempo en consumo de alimentos"
                    value={e?.tiempo_comida_min ?? ''}
                  />
                  <DataRow
                    label="¿Ocupas dispositivos mientras comes?"
                    value={siNo(
                      e?.usa_dispositivos === true
                        ? true
                        : e?.usa_dispositivos === false
                          ? false
                          : null
                    )}
                  />
                  <DataRow
                    label="Detalle dispositivos"
                    value={e?.dispositivos_detalle ?? ''}
                  />
                  <DataRow
                    label="¿Agregas sal a la comida preparada? (Sí / No)"
                    value={siNo(
                      e?.sal_adicional === true
                        ? true
                        : e?.sal_adicional === false
                          ? false
                          : null
                    )}
                  />
                  <DataRow
                    label="Alimentos preferidos"
                    value={e?.preferencias_positivas ?? ''}
                  />
                  <DataRow
                    label="Alimentos que no te agradan"
                    value={e?.preferencias_negativas ?? ''}
                  />
                </SectionCard>

                <SectionCard title="4. Estilo de vida">
                  <DataRow
                    label="Horas de sueño nocturno"
                    value={ev?.sueno_horas ?? ''}
                  />
                  <DataRow
                    label="Problemas para conciliar el sueño"
                    value={ev?.sueno_problemas ?? ''}
                  />
                  <DataRow
                    label="Actividad física (caminar, bici, trotar…)"
                    value={ev?.actividad_fisica ?? ''}
                  />
                  <DataRow
                    label="Frecuencia de ejercicio a la semana"
                    value={ev?.ejercicio_frecuencia ?? ''}
                  />
                  <DataRow
                    label="Tiempo de ejercicio"
                    value={ev?.ejercicio_tiempo ?? ''}
                  />
                  <DataRow
                    label="¿Practica deporte?"
                    value={ev?.practica_deporte ?? ''}
                  />
                  <DataRow
                    label="Tipo de deporte"
                    value={ev?.tipo_deporte ?? ''}
                  />
                  <DataRow
                    label="Frecuencia de deporte"
                    value={ev?.frecuencia_deporte ?? ''}
                  />
                  <DataRow
                    label="Tiempo de deporte"
                    value={ev?.tiempo_deporte ?? ''}
                  />
                </SectionCard>

                <SectionCard title="5. Recordatorio 24 h">
                  <DataRow
                    label="Desayuno"
                    value={r?.r24_desayuno ?? ''}
                  />
                  <DataRow
                    label="Colación de la mañana"
                    value={r?.r24_colacion_manana ?? ''}
                  />
                  <DataRow
                    label="Comida / almuerzo"
                    value={r?.r24_comida ?? ''}
                  />
                  <DataRow
                    label="Colación de la tarde"
                    value={r?.r24_colacion_tarde ?? ''}
                  />
                  <DataRow label="Cena" value={r?.r24_cena ?? ''} />
                  <DataRow
                    label="Extras / picoteo"
                    value={r?.r24_extras ?? ''}
                  />
                  <DataRow
                    label="¿El día de ayer fue un día típico?"
                    value={r?.es_dia_tipico ?? ''}
                  />
                  <DataRow
                    label="Grasa frecuente en preparación"
                    value={r?.grasas_frecuentes ?? ''}
                  />
                  <DataRow
                    label="Agua simple (ayer)"
                    value={r?.r24_agua_litros ?? ''}
                  />
                </SectionCard>

                {mostrandoVistaDelHistorial ? (
                  <SectionCard title="Cierre (especialista) — registro de esta visita">
                    <DataRow
                      label="Diagnóstico / notas clínicas"
                      value={c.diagnostico_especialista ?? ''}
                    />
                    <DataRow
                      label="Plan alimentario (resumen)"
                      value={c.plan_alimenticio_resumen ?? ''}
                    />
                  </SectionCard>
                ) : null}
              </div>
            )}
          </div>

          <div className="p-5 md:p-6 overflow-y-auto max-h-[70vh] lg:max-h-none">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Estación de trabajo — consulta en curso
            </h3>
            {mostrandoVistaDelHistorial ? (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                Edita y finaliza <strong>esta visita</strong> (pendiente), aunque
                a la izquierda estés revisando otra del historial.
              </p>
            ) : null}

            <div className="bg-emerald-50 rounded-2xl border border-emerald-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-emerald-200 bg-white/60 flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-700" />
                <p className="text-sm font-semibold text-emerald-900">
                  Asistencia por IA
                </p>
              </div>
              <div className="p-4 text-sm text-emerald-900 space-y-2">
                <p className="leading-relaxed">
                  - Revisa el motivo, antecedentes y el formulario (columna
                  izquierda) para validar criterios clínicos.
                </p>
                <p className="leading-relaxed">
                  - Ajusta el plan a preferencias, estilo de vida y recordatorio
                  24 h del paciente.
                </p>
                <p className="text-xs text-emerald-700 pt-2">
                  Haz clic en una sugerencia para agregarla al plan
                  (próximamente).
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-900">
                Diagnóstico y recomendaciones
                <span className="ml-1 text-xs font-normal text-gray-500">
                  (visita en curso)
                </span>
              </p>
              <textarea
                value={diagnostico}
                onChange={(e) => setDiagnostico(e.target.value)}
                placeholder="Ingrese aquí el diagnóstico, recomendaciones, plan de seguimiento y observaciones relevantes…"
                className="mt-2 w-full min-h-[140px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-900">
                Plan alimenticio (resumen)
                <span className="ml-1 text-xs font-normal text-gray-500">
                  (visita en curso)
                </span>
              </p>
              <textarea
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                placeholder="Resumen del plan alimenticio…"
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
                Finalizar consulta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
