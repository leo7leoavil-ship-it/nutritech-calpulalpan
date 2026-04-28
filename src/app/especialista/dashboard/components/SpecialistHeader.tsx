import { createClient } from '@/lib/client';
import { LogOut } from 'lucide-react';
import { Perfil } from '../types';

export function SpecialistHeader({ especialista }: { especialista: Perfil | null }) {
  const nombre = especialista?.nombre_completo || 'Especialista';

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between gap-6">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
          DR
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold text-gray-900 truncate">{nombre}</p>
          <p className="text-sm text-gray-500">Lic. en Nutrición</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-400 hidden md:block">
          Universidad Autónoma de Tlaxcala
        </p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

