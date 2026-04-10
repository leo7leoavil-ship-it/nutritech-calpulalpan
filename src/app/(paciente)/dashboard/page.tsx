'use client';
import { createClient } from '@/lib/client'; // Importación correcta
import { ArrowRight, Calendar, FileText, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PatientDashboard() {
  // Inicializamos el cliente dentro del componente
  const supabase = createClient();
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        // Obtenemos el usuario de la sesión actual
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          router.push('/login');
          return;
        }

        // Consultamos los datos clínicos del perfil en Supabase
        const { data, error } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error al obtener perfil:', error.message);
        } else {
          setPerfil(data);
        }
      } catch (err) {
        console.error('Error inesperado:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Estado de carga profesional alineado al diseño
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-500 font-medium">Cargando tu portal de salud...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Navegación Superior */}
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-blue-900 tracking-tight">
          Nutri-Tech <span className="text-blue-500 font-medium">Calpulalpan</span>
        </h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSignOut} 
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all" 
            title="Cerrar Sesión"
          >
            <LogOut className="h-5 w-5" />
          </button>
          <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-white">
            {perfil?.nombre_completo ? perfil.nombre_completo.substring(0, 1).toUpperCase() : 'U'}
          </div>
        </div>
      </nav>

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Banner de Bienvenida */}
        <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold">
              ¡Bienvenido, {perfil?.nombre_completo ? perfil.nombre_completo.split(' ')[0] : 'Paciente'}!
            </h2>
            <p className="mt-2 text-blue-100 max-w-md opacity-90">
              Tu expediente clínico digital está actualizado y listo para tu próxima consulta en Calpulalpan.
            </p>
          </div>
          <div className="absolute right-[-20px] top-[-20px] opacity-10">
            <User size={200} />
          </div>
        </section>

        {/* Rejilla de Acciones Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Citas */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all group">
            <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
              <Calendar className="text-blue-600 group-hover:text-white" />
            </div>
            <h3 className="font-bold text-gray-800">Próxima Cita</h3>
            <p className="text-sm text-gray-500 mt-1">Sin citas pendientes esta semana.</p>
            <Link 
              href="/nueva-consulta" 
              className="mt-4 inline-flex items-center text-blue-600 font-semibold text-sm hover:gap-2 transition-all"
            >
              Agendar consulta <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {/* Datos Personales */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="bg-green-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <User className="text-green-600" />
            </div>
            <h3 className="font-bold text-gray-800">Mis Datos</h3>
            <p className="text-xs text-blue-500 font-bold uppercase mt-1 tracking-wider">
              CURP: {perfil?.curp || 'N/A'}
            </p>
            <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              Sexo: {perfil?.sexo || 'No especificado'}
            </p>
          </div>

          {/* Recomendación Saludable */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-orange-400">
            <div className="bg-orange-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <FileText className="text-orange-600" />
            </div>
            <h3 className="font-bold text-gray-800">Recomendación</h3>
            <p className="text-sm text-gray-600 italic mt-2 leading-relaxed">
              "Recuerda que la hidratación es clave. ¡Bebe al menos 2 litros de agua simple al día!"
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}