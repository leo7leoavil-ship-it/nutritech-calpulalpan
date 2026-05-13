'use client'; // Indica que este componente se ejecuta en el cliente (navegador)

import { createClient } from '@/lib/client'; // Importación del cliente de Supabase
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Clock,
  LogOut,
  User
} from 'lucide-react'; // Iconos de la librería Lucide para la interfaz
import { useRouter } from 'next/navigation'; // Hook para redireccionamiento de rutas
import { useEffect, useState } from 'react'; // Hooks de React para ciclo de vida y estado

// Definición de la estructura de datos para una consulta resumida
type ConsultaResumen = {
  id: string;
  created_at: string;
  motivo_consulta: string | null;
  status: string;
};

/**
 * Función auxiliar para transformar el estatus técnico 
 * en un texto amigable para el usuario.
 */
function labelConsultaStatus(status: string) {
  if (status === 'atendida') return 'Atendida';
  return 'Pendiente de atención';
}

export default function PatientDashboard() {
  // Inicialización de hooks
  const supabase = createClient();
  const router = useRouter();

  // Estados del componente
  const [perfil, setPerfil] = useState<any>(null); // Datos del perfil del usuario
  const [consultas, setConsultas] = useState<ConsultaResumen[]>([]); // Lista de consultas
  const [loading, setLoading] = useState(true); // Estado de carga inicial

  useEffect(() => {
    /**
     * Función asíncrona para obtener los datos necesarios de Supabase
     */
    const fetchUserData = async () => {
      try {
        // 1. Obtener el usuario autenticado
        const {
          data: { user },
        } = await supabase.auth.getUser();
        
        // Si no hay sesión, redirigir al login
        if (!user) {
          router.push('/login');
          return;
        };

        // 2. Obtener datos detallados del perfil (CURP, Nombre, etc.)
        const { data: profileData } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', user.id)
          .single();

        setPerfil(profileData);

        // 3. Obtener el historial de consultas filtrado por el ID del paciente
        const { data: consultasData, error: consultasError } = await supabase
          .from('consultas')
          .select('id, created_at, motivo_consulta, status')
          .eq('paciente_id', user.id)
          .order('created_at', { ascending: false }); // Ordenar por fecha (más reciente primero)

        if (consultasError) throw consultasError;
        setConsultas(consultasData || []);

      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      } finally {
        setLoading(false); // Finalizar estado de carga sin importar el resultado
      }
    };

    fetchUserData();
  }, [supabase, router]);

  // Pantalla de carga (Splash Screen) mientras se obtienen los datos
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Activity className="animate-spin text-blue-600" size={40} />
          <p className="text-gray-500 font-medium">Cargando tu panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* BARRA DE NAVEGACIÓN (HEADER) */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo y Nombre del Sistema */}
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Activity className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
              Nutri-Tech
            </h1>
          </div>
          {/* Botón de Cerrar Sesión */}
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

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full gap-8 grid grid-cols-1 lg:grid-cols-3">
        
        {/* SECCIÓN IZQUIERDA: Perfil y Avisos */}
        <section className="lg:col-span-1 space-y-6">
          {/* Tarjeta de Usuario */}
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

          {/* Banner de Aviso Legal/Informativo */}
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

        {/* SECCIÓN DERECHA: Historial de Actividad */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Encabezado de la lista */}
            <div className="p-6 border-b">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Clock className="text-gray-400" size={20} /> Actividad Reciente
              </h3>
              <p className="text-gray-500 text-xs mt-1">
                Tus consultas enviadas y el estado de cada una.
              </p>
            </div>

            {/* Lista de Consultas */}
            {consultas.length === 0 ? (
              // Estado vacío (Empty State)
              <div className="p-12 text-center">
                <div className="flex justify-center mb-4">
                  <ClipboardList size={48} className="text-gray-200" />
                </div>
                <p className="text-gray-400 text-sm italic">
                  Aún no tienes consultas registradas.
                </p>
              </div>
            ) : (
              // Mapeo del historial
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
                      {/* Información de la consulta */}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                          {fecha}
                        </p>
                        <p className="text-sm font-medium text-gray-800 mt-1 line-clamp-2">
                          {c.motivo_consulta?.trim() ||
                            'Consulta sin motivo indicado'}
                        </p>
                      </div>

                      {/* Etiqueta de Estatus */}
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