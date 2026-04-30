'use client';

import { createClient } from '@/lib/client';
import { useRouter } from 'next/navigation'; // IMPORTADO: Para la navegación
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

// Icono simple para el botón de análisis
const ChartBarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="Ref8 13v-1m4 1v-4m4 5V9m4 5V9m-4 5l4 2m-4-2l4-2M9 3h10a2 2 0 012 2v12a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

export default function EspecialistaDashboardPage() {
  const supabase = createClient();
  const router = useRouter(); // INICIALIZADO: Hook de navegación
  const [loading, setLoading] = useState(true);
  const [especialista, setEspecialista] = useState<Perfil | null>(null);
  const [cola, setCola] = useState<Consulta[]>([]);
  const [pacientes, setPacientes] = useState<Record<string, Perfil>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<'perfil' | 'fisica' | 'r24'>('perfil');
  const [familiares, setFamiliares] = useState<AntecedentesFamiliares | null>(null);
  const [patologicos, setPatologicos] = useState<AntecedentesPatologicos | null>(null);
  const [historial, setHistorial] = useState<Consulta[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [consultaVistaId, setConsultaVistaId] = useState<string | null>(null);
  const [detalleByConsulta, setDetalleByConsulta] = useState<Record<string, ConsultaFormularioDetalle>>({});
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  // FUNCIÓN DE REDIRECCIÓN: Al módulo de análisis
  const handleNavigateToAnalisis = () => {
    router.push('/especialista/dashboard/modulo-analisis');
  };

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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const { data: perfil } = await supabase
          .from('perfiles')
          .select('id, nombre_completo, curp, sexo, fecha_nacimiento, direccion, ocupacion, telefono, registro_completo, rol')
          .eq('id', user.id)
          .single();

        if (!perfil || perfil.rol !== 'especialista') {
          router.push('/dashboard');
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
          .select('id, created_at, paciente_id, especialista_id, motivo_consulta, status, diagnostico_especialista, plan_alimenticio_resumen, antropometria_id, evaluacion_dietetica_id, estilo_vida_id, recordatorio_24h_id')
          .eq('status', 'pendiente');

        const filtered = enLista
          ? base
          : base.or(`especialista_id.is.null,especialista_id.eq.${user.id}`);

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
            .select('id, nombre_completo, curp, sexo, fecha_nacimiento, direccion, ocupacion, telefono, registro_completo')
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
  }, [supabase, selectedId, router]);

  // ... (Efectos de carga de extras y detalles se mantienen igual)
  useEffect(() => {
    const loadPatientExtras = async () => {
      if (!selectedConsulta) return;
      try {
        const pacienteId = selectedConsulta.paciente_id;
        const [fam, pat, hist] = await Promise.all([
          supabase.from('antecedentes_familiares').select('*').eq('perfil_id', pacienteId).maybeSingle(),
          supabase.from('antecedentes_patologicos').select('*').eq('perfil_id', pacienteId).maybeSingle(),
          supabase.from('consultas').select('*').eq('paciente_id', pacienteId).order('created_at', { ascending: false }).limit(10),
        ]);
        setFamiliares((fam.data as any) ?? null);
        setPatologicos((pat.data as any) ?? null);
        setHistorial(((hist.data as any) as Consulta[]) ?? []);
      } catch (e) { console.error(e); }
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
    if (detalleByConsulta[vistaEfectivaId]) return;
    let cancelled = false;
    setCargandoDetalle(true);
    void loadConsultaDetalle(supabase, vistaEfectivaId).then((d) => {
      if (cancelled) return;
      if (d) setDetalleByConsulta((p) => ({ ...p, [vistaEfectivaId]: d }));
      if (!cancelled) setCargandoDetalle(false);
    });
    return () => { cancelled = true; };
  }, [modalOpen, vistaEfectivaId, supabase, selectedConsulta?.id, detalleByConsulta]);

  const handleFinalize = async (payload: { diagnostico_especialista: string; plan_alimenticio_resumen: string; }) => {
    if (!selectedConsulta) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sesión no válida');
      const patch: any = {
        diagnostico_especialista: payload.diagnostico_especialista || null,
        plan_alimenticio_resumen: payload.plan_alimenticio_resumen || null,
        status: 'atendida',
      };
      if (!selectedConsulta.especialista_id) patch.especialista_id = user.id;
      const { error } = await supabase.from('consultas').update(patch).eq('id', selectedConsulta.id);
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
    } finally { setSaving(false); }
  };

  const handleStartConsulta = async () => {
    if (!selectedConsulta) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      if (!selectedConsulta.especialista_id) {
        await supabase.from('consultas').update({ especialista_id: user.id }).eq('id', selectedConsulta.id).is('especialista_id', null);
      }
      setConsultaVistaId(null);
      setModalOpen(true);
    } catch (e) {
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
        {/* SECCIÓN MODIFICADA: Header con botón de Análisis */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <SpecialistHeader especialista={especialista} />
          <button
            onClick={handleNavigateToAnalisis}
            className="inline-flex items-center px-4 py-2 bg-white border border-emerald-600 text-emerald-700 font-semibold rounded-lg shadow-sm hover:bg-emerald-50 transition-colors duration-200"
          >
            <ChartBarIcon />
            Análisis de Datos Salud Pública
          </button>
        </div>

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
          detalleVista={vistaEfectivaId ? (detalleByConsulta[vistaEfectivaId] ?? null) : null}
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