'use client';

import { createClient } from '@/lib/client';
import { useEffect, useMemo, useState } from 'react';
import { ConsultaModal } from './components/ConsultaModal';
import { PatientDetailPanel } from './components/PatientDetailPanel';
import { PatientQueue } from './components/PatientQueue';
import { SpecialistHeader } from './components/SpecialistHeader';
import { loadConsultaDetalle } from './loadConsultaDetalle';
import {
  AntecedentesFamiliares,
  AntecedentesPatologicos,
  Consulta,
  ConsultaFormularioDetalle,
  Perfil,
} from './types';

export default function EspecialistaDashboardPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [especialista, setEspecialista] = useState<Perfil | null>(null);
  const [cola, setCola] = useState<Consulta[]>([]);
  const [pacientes, setPacientes] = useState<Record<string, Perfil>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<'perfil' | 'fisica' | 'r24'>('perfil');
  const [familiares, setFamiliares] = useState<AntecedentesFamiliares | null>(
    null
  );
  const [patologicos, setPatologicos] = useState<AntecedentesPatologicos | null>(
    null
  );
  const [historial, setHistorial] = useState<Consulta[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [consultaVistaId, setConsultaVistaId] = useState<string | null>(null);
  const [detalleByConsulta, setDetalleByConsulta] = useState<
    Record<string, ConsultaFormularioDetalle>
  >({});
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const selectedConsulta = useMemo(
    () => cola.find((c) => c.id === selectedId) ?? null,
    [cola, selectedId]
  );
  const selectedPaciente = useMemo(() => {
    if (!selectedConsulta) return null;
    return pacientes[selectedConsulta.paciente_id] ?? null;
  }, [pacientes, selectedConsulta]);

  useEffect(() => {
    const load = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = '/login';
          return;
        }

        const { data: perfil } = await supabase
          .from('perfiles')
          .select(
            'id, nombre_completo, curp, sexo, fecha_nacimiento, direccion, ocupacion, telefono, registro_completo, rol'
          )
          .eq('id', user.id)
          .single();

        if (!perfil || perfil.rol !== 'especialista') {
          window.location.href = '/dashboard';
          return;
        }

        setEspecialista(perfil as any);

        const { data: rowLista } = await supabase
          .from('especialistas')
          .select('perfil_id')
          .eq('perfil_id', user.id)
          .maybeSingle();

        const enLista = !!rowLista;

        const base = supabase
          .from('consultas')
          .select(
            'id, created_at, paciente_id, especialista_id, motivo_consulta, status, diagnostico_especialista, plan_alimenticio_resumen, antropometria_id, evaluacion_dietetica_id, estilo_vida_id, recordatorio_24h_id'
          )
          .eq('status', 'pendiente');

        const filtered = enLista
          ? base
          : base.or(
              `especialista_id.is.null,especialista_id.eq.${user.id}`
            );

        const { data: consultasData, error: consultasError } =
          await filtered.order('created_at', { ascending: true });

        if (consultasError) throw consultasError;

        const colaList = (consultasData as Consulta[]) ?? [];
        setCola(colaList);
        if (!selectedId && colaList[0]?.id) setSelectedId(colaList[0].id);

        const ids = Array.from(new Set(colaList.map((c) => c.paciente_id)));
        if (ids.length) {
          const { data: perfilesData, error: perfilesError } = await supabase
            .from('perfiles')
            .select(
              'id, nombre_completo, curp, sexo, fecha_nacimiento, direccion, ocupacion, telefono, registro_completo'
            )
            .in('id', ids);
          if (perfilesError) throw perfilesError;
          const map: Record<string, Perfil> = {};
          (perfilesData as Perfil[]).forEach((p) => {
            map[p.id] = p;
          });
          setPacientes(map);
        } else {
          setPacientes({});
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadPatientExtras = async () => {
      if (!selectedConsulta) return;
      try {
        const pacienteId = selectedConsulta.paciente_id;

        const [fam, pat, hist] = await Promise.all([
          supabase
            .from('antecedentes_familiares')
            .select(
              'diabetes_padre, diabetes_madre, obesidad_padre, obesidad_madre, hipertension_padre, hipertension_madre, sobrepeso_padre, sobrepeso_madre, tiene_alergias, alergias_especificar, otros_antecedentes, diabetes_observaciones, sobrepeso_observaciones, obesidad_observaciones, hipertension_observaciones, colesterol_trigliceridos'
            )
            .eq('perfil_id', pacienteId)
            .maybeSingle(),
          supabase
            .from('antecedentes_patologicos')
            .select(
              'padece_enfermedad, enfermedad_diagnosticada, toma_medicamento, nombre_medicamento, dosis'
            )
            .eq('perfil_id', pacienteId)
            .maybeSingle(),
          supabase
            .from('consultas')
            .select(
              'id, created_at, paciente_id, especialista_id, motivo_consulta, status, diagnostico_especialista, plan_alimenticio_resumen, antropometria_id, evaluacion_dietetica_id, estilo_vida_id, recordatorio_24h_id'
            )
            .eq('paciente_id', pacienteId)
            .order('created_at', { ascending: false })
            .limit(10),
        ]);

        setFamiliares((fam.data as any) ?? null);
        setPatologicos((pat.data as any) ?? null);
        setHistorial(((hist.data as any) as Consulta[]) ?? []);
      } catch (e) {
        console.error(e);
      }
    };
    loadPatientExtras();
  }, [selectedConsulta?.id, selectedConsulta?.paciente_id, supabase]);

  const vistaEfectivaId = useMemo(() => {
    if (!selectedConsulta) return null;
    return consultaVistaId ?? selectedConsulta.id;
  }, [selectedConsulta, consultaVistaId]);

  useEffect(() => {
    setConsultaVistaId(null);
    setDetalleByConsulta({});
  }, [selectedConsulta?.id]);

  useEffect(() => {
    if (!modalOpen || !vistaEfectivaId) return;
    if (detalleByConsulta[vistaEfectivaId]) {
      return;
    }

    let cancelled = false;
    setCargandoDetalle(true);
    void loadConsultaDetalle(supabase, vistaEfectivaId).then((d) => {
      if (cancelled) return;
      if (d) {
        setDetalleByConsulta((p) => ({ ...p, [vistaEfectivaId]: d }));
      }
      if (!cancelled) setCargandoDetalle(false);
    });
    return () => {
      cancelled = true;
    };
    // Cargar solo cuando el modal, la consulta visible o el paciente cambia
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen, vistaEfectivaId, supabase, selectedConsulta?.id]);

  const handleFinalize = async (payload: {
    diagnostico_especialista: string;
    plan_alimenticio_resumen: string;
  }) => {
    if (!selectedConsulta) return;
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Sesión no válida');

      const patch: Record<string, unknown> = {
        diagnostico_especialista: payload.diagnostico_especialista || null,
        plan_alimenticio_resumen: payload.plan_alimenticio_resumen || null,
        status: 'atendida',
      };
      if (!selectedConsulta.especialista_id) {
        patch.especialista_id = user.id;
      }

      const { error } = await supabase
        .from('consultas')
        .update(patch)
        .eq('id', selectedConsulta.id);

      if (error) throw error;

      setModalOpen(false);
      setCola((prev) => {
        const rest = prev.filter((c) => c.id !== selectedConsulta.id);
        setSelectedId(rest[0]?.id ?? null);
        return rest;
      });
    } catch (e) {
      console.error(e);
      alert('No se pudo finalizar la consulta.');
    } finally {
      setSaving(false);
    }
  };

  const handleStartConsulta = async () => {
    if (!selectedConsulta) return;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      if (!selectedConsulta.especialista_id) {
        const { error } = await supabase
          .from('consultas')
          .update({ especialista_id: user.id })
          .eq('id', selectedConsulta.id)
          .is('especialista_id', null);

        if (!error) {
          setCola((prev) =>
            prev.map((c) =>
              c.id === selectedConsulta.id
                ? { ...c, especialista_id: user.id }
                : c
            )
          );
        }
      }
      setConsultaVistaId(null);
      setModalOpen(true);
    } catch (e) {
      console.error(e);
      setConsultaVistaId(null);
      setModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <SpecialistHeader especialista={especialista} />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-4">
            <PatientQueue
              cola={cola}
              pacientes={pacientes}
              selectedId={selectedId}
              onSelect={(id) => setSelectedId(id)}
            />
          </aside>

          <section className="lg:col-span-8">
            <PatientDetailPanel
              selectedConsulta={selectedConsulta}
              selectedPaciente={selectedPaciente}
              familiares={familiares}
              tab={tab}
              onTabChange={setTab}
              onStartConsulta={handleStartConsulta}
            />
          </section>
        </div>
      </div>

      {selectedConsulta && selectedPaciente ? (
        <ConsultaModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          paciente={selectedPaciente}
          consultaActual={selectedConsulta}
          consultaVistaId={consultaVistaId}
          vistaEfectivaId={vistaEfectivaId ?? selectedConsulta.id}
          onConsultaVistaIdChange={setConsultaVistaId}
          detalleVista={
            vistaEfectivaId
              ? (detalleByConsulta[vistaEfectivaId] ?? null)
              : null
          }
          cargandoDetalle={cargandoDetalle}
          familiares={familiares}
          patologicos={patologicos}
          historial={historial.filter((h) => h.id !== selectedConsulta.id)}
          onFinalize={handleFinalize}
          saving={saving}
        />
      ) : null}
    </div>
  );
}

