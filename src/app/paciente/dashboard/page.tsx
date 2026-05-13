'use client';

import { createClient } from '@/lib/client';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileDown, // Agregado para el botón
  Loader2,
  LogOut,
  User
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type ConsultaResumen = {
  id: string;
  created_at: string;
  motivo_consulta: string | null;
  status: string;
};

function labelConsultaStatus(status: string) {
  if (status === 'atendida') return 'Atendida';
  return 'Pendiente de atención';
}

export default function PatientDashboard() {
  const supabase = createClient();
  const router = useRouter();
  const [perfil, setPerfil] = useState<any>(null);
  const [consultas, setConsultas] = useState<ConsultaResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const AWS_LAMBDA_URL = 'https://5n9fv3460m.execute-api.us-east-2.amazonaws.com/default/generador-pdf-nutritech';

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profileData } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', user.id)
          .single();

        setPerfil(profileData);

        const { data: consultasData } = await supabase
          .from('consultas')
          .select('id, created_at, motivo_consulta, status')
          .eq('paciente_id', user.id)
          .order('created_at', { ascending: false });

        setConsultas(consultasData || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [supabase, router]);

  const handleDownloadPDF = async (consultaId: string) => {
    setDownloadingId(consultaId);
    try {
      const { data: cData, error } = await supabase
        .from('consultas')
        .select(`
          id, motivo_consulta, diagnostico, plan_sugerido, created_at,
          consulta_antropometria (peso, estatura, imc),
          especialistas (perfiles (nombre_completo, telefono))
        `)
        .eq('id', consultaId)
        .single();

      if (error || !cData) throw new Error("Error");

      const rawData = cData as any;
      const antro = Array.isArray(rawData.consulta_antropometria) ? rawData.consulta_antropometria[0] : rawData.consulta_antropometria;
      const esp = Array.isArray(rawData.especialistas) ? rawData.especialistas[0] : rawData.especialistas;

      const payload = {
        consulta_id: rawData.id,
        nombre_completo: perfil?.nombre_completo,
        curp: perfil?.curp,
        email: perfil?.email,
        sexo: perfil?.sexo,
        fecha_emision: new Date(rawData.created_at).toLocaleDateString('es-MX'),
        peso: antro?.peso || "N/A",
        estatura: antro?.estatura || "N/A",
        imc: antro?.imc || "N/A",
        especialista_nombre: esp?.perfiles?.nombre_completo || "Especialista",
        especialista_tel: esp?.perfiles?.telefono || "S/N",
        motivo_consulta: rawData.motivo_consulta,
        diagnostico: rawData.diagnostico,
        plan_sugerido: rawData.plan_sugerido
      };

      const response = await fetch(AWS_LAMBDA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      const linkSource = `data:application/pdf;base64,${result.body}`;
      const downloadLink = document.createElement("a");
      downloadLink.href = linkSource;
      downloadLink.download = `Ficha_${consultaId}.pdf`;
      downloadLink.click();
    } catch (err) {
      alert("Error al generar PDF");
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Activity className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
              Nutri-Tech
            </h1>
          </div>
          <button
            onClick={() =>
              supabase.auth.signOut().then(() => router.push('/login'))
            }
            className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full gap-8 grid grid-cols-1 lg:grid-cols-3">
        <section className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 h-24"></div>
            <div className="px-6 pb-6">
              <div className="relative -mt-12 mb-4">
                <div className="h-24 w-24 rounded-2xl bg-white p-1 shadow-md mx-auto">
                  <div className="h-full w-full rounded-xl bg-gray-100 flex items-center justify-center text-blue-600">
                    <User size={40} />
                  </div>
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {perfil?.nombre_completo}
                </h2>
                <p className="text-sm text-gray-500 mb-4">{perfil?.email}</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                  CURP: {perfil?.curp}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
            <AlertCircle className="text-amber-600 shrink-0" size={20} />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                Aviso importante
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Recuerda asistir puntualmente a tus citas para un mejor
                seguimiento.
              </p>
            </div>
          </div>
        </section>

        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Clock className="text-gray-400" size={20} /> Actividad Reciente
              </h3>
              <p className="text-gray-500 text-xs mt-1">
                Tus consultas enviadas y el estado de cada una.
              </p>
            </div>
            {consultas.length === 0 ? (
              <div className="p-12 text-center">
                <div className="flex justify-center mb-4">
                  <ClipboardList size={48} className="text-gray-200" />
                </div>
                <p className="text-gray-400 text-sm italic">
                  Aún no tienes consultas registradas.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {consultas.map((c) => {
                  const fecha = c.created_at
                    ? new Date(c.created_at).toLocaleString('es-MX', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                    : '';
                  const atendida = c.status === 'atendida';
                  return (
                    <li
                      key={c.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-gray-50/80 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                          {fecha}
                        </p>
                        <p className="text-sm font-medium text-gray-800 mt-1 line-clamp-2">
                          {c.motivo_consulta?.trim() ||
                            'Consulta sin motivo indicado'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span
                          className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            atendida
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {atendida ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <Clock size={14} />
                          )}
                          {labelConsultaStatus(c.status)}
                        </span>

                        {atendida && (
                          <button
                            onClick={() => handleDownloadPDF(c.id)}
                            disabled={downloadingId === c.id}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                          >
                            {downloadingId === c.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <FileDown size={14} />
                            )}
                            {downloadingId === c.id ? 'Cargando...' : 'PDF'}
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}