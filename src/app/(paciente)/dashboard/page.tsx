'use client';
import { supabase } from '@/lib/supabase';
import { ArrowRight, Calendar, FileText, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PatientDashboard() {
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPerfil = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setPerfil(data);
      } else {
        router.push('/login');
      }
      setLoading(false);
    };
    fetchPerfil();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando portal...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-blue-900 tracking-tight">
          Nutri-Tech <span className="text-blue-500 font-medium">Calpulalpan</span>
        </h1>
        <div className="flex items-center gap-4">
          <button onClick={handleSignOut} className="text-gray-400 hover:text-red-500 transition-colors" title="Cerrar Sesión">
            <LogOut className="h-5 w-5" />
          </button>
          <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
            {perfil?.nombre_completo ? perfil.nombre_completo.substring(0, 1).toUpperCase() : 'U'}
          </div>
        </div>
      </nav>

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold">
              ¡Bienvenido, {perfil?.nombre_completo ? perfil.nombre_completo.split(' ')[0] : 'Usuario'}!
            </h2>
            <p className="mt-2 text-blue-100 max-w-md">Tu expediente clínico digital está actualizado y listo para tu próxima consulta.</p>
          </div>
          <div className="absolute right-[-20px] top-[-20px] opacity-10">
            <User size={200} />
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all">
            <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-800">Próxima Cita</h3>
            <p className="text-sm text-gray-500 mt-1">Sin citas pendientes esta semana.</p>
            <Link href="/nueva-consulta" className="mt-4 inline-flex items-center text-blue-600 font-semibold text-sm hover:translate-x-1 transition-transform">
              Agendar consulta <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="bg-green-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <User className="text-green-600" />
            </div>
            <h3 className="font-bold text-gray-800">Mis Datos</h3>
            <p className="text-xs text-blue-500 font-bold uppercase mt-1">CURP: {perfil?.curp || 'N/A'}</p>
            <p className="text-sm text-gray-600 mt-2">Sexo: {perfil?.sexo || 'No especificado'}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="bg-orange-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <FileText className="text-orange-600" />
            </div>
            <h3 className="font-bold text-gray-800">Recomendación</h3>
            <p className="text-sm text-gray-600 italic mt-2 leading-relaxed">
              "Recuerda que la hidratación es clave en el clima de Calpulalpan. ¡Bebe agua simple!"
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}