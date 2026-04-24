import { Perfil } from '../types';

export function SpecialistHeader({ especialista }: { especialista: Perfil | null }) {
  const nombre = especialista?.nombre_completo || 'Especialista';

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
      <p className="text-sm text-gray-400 hidden md:block">
        Universidad Autónoma de Tlaxcala
      </p>
    </div>
  );
}

