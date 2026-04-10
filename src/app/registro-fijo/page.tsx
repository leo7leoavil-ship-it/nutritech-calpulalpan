'use client';
import { createClient } from '@/lib/client';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';

interface AntecedenteFamiliar {
  padre: boolean;
  madre: boolean;
}

interface FormDataState {
  curp: string;
  nombre_completo: string;
  sexo: string;
  fecha_nacimiento: string;
  direccion: string;
  ocupacion: string;
  telefono: string;
  diabetes: AntecedenteFamiliar;
  obesidad: AntecedenteFamiliar;
  alergias: string;
}

export default function RegistroFijo() {
  const router = useRouter();
  // INICIALIZACIÓN CRÍTICA
  const supabase = createClient();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormDataState>({
    curp: '',
    nombre_completo: '',
    sexo: 'Masculino',
    fecha_nacimiento: '',
    direccion: '',
    ocupacion: '',
    telefono: '',
    diabetes: { padre: false, madre: false },
    obesidad: { padre: false, madre: false },
    alergias: '',
  });

  useEffect(() => {
    const getSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        router.push('/login');
      }
    };
    getSession();
  }, [router, supabase]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (
    e: ChangeEvent<HTMLInputElement>,
    parentKey: 'diabetes' | 'obesidad',
    childKey: 'padre' | 'madre'
  ) => {
    const { checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [childKey]: checked
      }
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);

    try {
      // 1. Guardar Perfil Básico
      const { error: errorPerfil } = await supabase.from('perfiles').upsert({
        id: userId,
        curp: formData.curp.toUpperCase().trim(),
        nombre_completo: formData.nombre_completo.trim(),
        sexo: formData.sexo,
        fecha_nacimiento: formData.fecha_nacimiento,
        direccion: formData.direccion.trim(),
        ocupacion: formData.ocupacion.trim(),
        telefono: formData.telefono.trim(),
        rol: 'paciente',
        registro_completo: true
      });

      if (errorPerfil) throw errorPerfil;

      // 2. Guardar Antecedentes Heredofamiliares
      const { error: errorAnt } = await supabase.from('antecedentes_familiares').upsert({
        perfil_id: userId,
        diabetes_padre: formData.diabetes.padre,
        diabetes_madre: formData.diabetes.madre,
        obesidad_padre: formData.obesidad.padre,
        obesidad_madre: formData.obesidad.madre,
        alergias_especificar: formData.alergias.trim()
      });

      if (errorAnt) throw errorAnt;

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error salvando datos:', error);
      alert(`Error: ${error.message || 'No se pudo guardar el perfil'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-3xl p-8 border border-gray-100">
        <header className="mb-8 border-b border-gray-100 pb-6 text-center">
          <h1 className="text-3xl font-bold text-blue-900">Expediente de Identificación</h1>
          <p className="text-gray-500 mt-2">Bienvenido a Nutri-Tech Calpulalpan. Por favor, completa tu información básica.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECCIÓN: IDENTIFICACIÓN */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">1</span>
              Datos Personales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                <input required type="text" name="nombre_completo" value={formData.nombre_completo} onChange={handleInputChange}
                  className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CURP</label>
                <input required maxLength={18} type="text" name="curp" value={formData.curp} onChange={handleInputChange}
                  className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border uppercase" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                <input required type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleInputChange}
                  className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border" />
              </div>
            </div>
          </div>

          {/* SECCIÓN: CONTACTO Y OCUPACIÓN */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm">2</span>
              Contacto y Localización
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Dirección Completa</label>
                <input required type="text" name="direccion" value={formData.direccion} onChange={handleInputChange}
                  className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input required type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange}
                  className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ocupación</label>
                <input required type="text" name="ocupacion" value={formData.ocupacion} onChange={handleInputChange}
                  className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border" />
              </div>
            </div>
          </div>

          {/* SECCIÓN: ANTECEDENTES */}
          <div className="space-y-4 bg-orange-50/50 p-6 rounded-2xl border border-orange-100">
            <h3 className="text-lg font-semibold text-orange-800 flex items-center gap-2">
              <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm">3</span>
              Antecedentes Heredofamiliares
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
                <span className="text-sm font-bold text-gray-700">Diabetes</span>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={formData.diabetes.padre} onChange={(e) => handleCheckboxChange(e, 'diabetes', 'padre')} className="w-5 h-5 rounded border-gray-300 text-blue-600" /> Padre</label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={formData.diabetes.madre} onChange={(e) => handleCheckboxChange(e, 'diabetes', 'madre')} className="w-5 h-5 rounded border-gray-300 text-blue-600" /> Madre</label>
                </div>
              </div>
              <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
                <span className="text-sm font-bold text-gray-700">Obesidad</span>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={formData.obesidad.padre} onChange={(e) => handleCheckboxChange(e, 'obesidad', 'padre')} className="w-5 h-5 rounded border-gray-300 text-blue-600" /> Padre</label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={formData.obesidad.madre} onChange={(e) => handleCheckboxChange(e, 'obesidad', 'madre')} className="w-5 h-5 rounded border-gray-300 text-blue-600" /> Madre</label>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 disabled:bg-gray-300 flex justify-center items-center">
            {loading ? 'Sincronizando expediente...' : 'Guardar y Continuar'}
          </button>
        </form>
      </div>
    </div>
  );
}