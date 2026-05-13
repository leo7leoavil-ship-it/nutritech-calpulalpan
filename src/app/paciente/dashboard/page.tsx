'use client';

/**
 * PatientDashboard Component
 * * Este componente representa el panel principal para el paciente.
 * Maneja la visualización del perfil del usuario, el estado de aprobación
 * y el historial de consultas médicas/nutricionales.
 */

import { createClient } from '@/lib/client';
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  LogOut,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Definición de tipos para las consultas
type ConsultaResumen = {
  id: string;
  created_at: string;
  motivo_consulta: string | null;
  status: string;
};

/**
 * Función auxiliar para formatear el estado de la consulta
 * @param status - El string de estado proveniente de la base de datos
 */
function labelConsultaStatus(status: string) {
  if (status === 'atendida') return 'Atendida';
  return 'Pendiente de atención';
}

export default function PatientDashboard() {
  const supabase = createClient();
  const router = useRouter();

  // --- Estados del Componente ---
  const [perfil, setPerfil] = useState<any>(null); // Datos del perfil del usuario
  const [consultas, setConsultas] = useState<ConsultaResumen[]>([]); // Lista de consultas del paciente
  const [loading, setLoading] = useState(true); // Estado de carga inicial

  /**
   * Efecto para cargar los datos iniciales del usuario y sus consultas
   */
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 1. Obtener la sesión del usuario actual
        const {
          data: { user },
        } = await supabase.auth.getUser();
        
        if (!user) {
          // Si no hay usuario, se podría redirigir a login aquí
          return;
        }

        // 2. Consultar información del perfil en la tabla 'perfiles'
        const { data: profileData } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', user.id)
          .single();

        setPerfil(profileData);

        // 3. Consultar historial de consultas ordenadas por fecha (más reciente primero)
        const { data: consultasData, error: consultasError } = await supabase
          .from('consultas')
          .select('id, created_at, motivo_consulta, status')
          .eq('paciente_id', user.id)
          .order('created_at', { ascending: false });

        if (consultasError) {
          console.error('Error cargando consultas:', consultasError);
          setConsultas([]);
        } else {
          setConsultas((consultasData as ConsultaResumen[]) ?? []);
        }
      } catch (error) {
        console.error('Error cargando dashboard:', error);
      } finally {
        setLoading(false); // Finalizar estado de carga
      }
    };

    fetchUserData();
  }, [supabase]);

  // Pantalla de carga (Skeleton o Spinner)
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* --- Header del Dashboard --- */}
      <header className="bg-white border-b shadow-sm p-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Bienvenido, {perfil?.nombre_completo?.split(' ')[0] || 'Paciente'}
            </h1>
            <p className="text-gray-500 text-sm">
              Panel de control de salud nutricional
            </p>
          </div>

          {/* Badge de estado de aprobación del perfil */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              perfil?.estado_aprobacion === 'aprobado'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {perfil?.estado_aprobacion === 'aprobado' ? (
              <CheckCircle2 size={18} />
            ) : (
              <Clock size={18} />
            )}
            {perfil?.estado_aprobacion === 'aprobado'
              ? 'Perfil Verificado'
              : 'Aprobación Pendiente'}
          </div>

          {/* Botón de Logout */}
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/login');
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- Columna Lateral: Información Personal --- */}
        <section className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <User className="text-blue-600" size={20} /> Datos Personales
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 text-sm">CURP</span>
                <span className="font-medium text-sm">{perfil?.curp}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 text-sm">Sexo</span>
                <span className="font-medium text-sm">{perfil?.sexo}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 text-sm">Teléfono</span>
                <span className="font-medium text-sm">{perfil?.telefono}</span>
              </div>
            </div>
          </div>

          {/* Placeholder para futuras métricas de salud */}
          <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-md">
            <h3 className="font-bold flex items-center gap-2">
              <Activity size={20} /> Resumen de Salud
            </h3>
            <p className="text-blue-100 text-sm mt-2">
              Próximamente verás aquí tus gráficas de IMC y peso.
            </p>
            <button className="mt-4 w-full bg-white text-blue-600 py-2 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors">
              Ver Historial Completo
            </button>
          </div>
        </section>

        {/* --- Columna Principal: Acciones y Actividad --- */}
        <section className="lg:col-span-2 space-y-6">
          
          {/* Alerta de cuenta pendiente de revisión */}
          {perfil?.estado_aprobacion === 'pendiente' && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 items-start">
              <AlertCircle className="text-amber-600 shrink-0" size={20} />
              <div>
                <h4 className="font-bold text-amber-800 text-sm">Cuenta en revisión</h4>
                <p className="text-amber-700 text-xs mt-1">
                  Tu expediente está siendo revisado por un especialista. Podrás
                  agendar citas una vez que seas aprobado.
                </p>
              </div>
            </div>
          )}

          {/* Tarjetas de Acciones Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => router.push('/nueva-consulta')}
              className="text-left bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all cursor-pointer group"
            >
              <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Calendar size={24} />
              </div>
              <h4 className="font-bold text-gray-800">Nueva consulta</h4>
              <p className="text-gray-500 text-xs mt-1">Responde al formulario de consulta</p>
            </button>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-green-200 transition-all cursor-pointer group">
              <div className="bg-green-50 w-12 h-12 rounded-xl flex items-center justify-center text-green-600 mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <ClipboardList size={24} />
              </div>
              <h4 className="font-bold text-gray-800">Mi Plan</h4>
              <p className="text-gray-500 text-xs mt-1">Revisa tu dieta personalizada y recomendaciones.</p>
            </div>
          </div>

          {/* --- Lista de Actividad Reciente (Consultas) --- */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Clock className="text-gray-400" size={20} /> Actividad Reciente
              </h3>
              <p className="text-gray-500 text-xs mt-1">
                Tus consultas enviadas y el estado de cada una.
              </p>
            </div>

            {/* Renderizado condicional si no hay consultas */}
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
                  // Formateo de fecha para México
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
                        <p className="text-xs text-gray-400 uppercase tracking-wide">{fecha}</p>
                        <p className="text-sm font-medium text-gray-800 mt-1 line-clamp-2">
                          {c.motivo_consulta?.trim() || 'Consulta sin motivo indicado'}
                        </p>
                      </div>
                      
                      {/* Badge de estado de la consulta */}
                      <span
                        className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          atendida
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {atendida ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                        {labelConsultaStatus(c.status)}
                      </span>
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