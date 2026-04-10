'use client';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RegistroFijo() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Estado alineado al Diccionario de Datos
  const [formData, setFormData] = useState({
    curp: '',
    nombre_completo: '',
    sexo: 'Masculino',
    fecha_nacimiento: '',
    direccion: '',
    ocupacion: '',
    telefono: '',
    // Antecedentes (se guardarán en tabla relacionada)
    diabetes: { padre: false, madre: false, otros: false },
    obesidad: { padre: false, madre: false, otros: false },
    alergias: '',
    enfermedad_diagnosticada: '',
    medicamentos: ''
  });

  useEffect(() => {
    const getSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      else router.push('/login');
    };
    getSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Insertar/Actualizar Perfil (Tabla: perfiles)
      const { error: errorPerfil } = await supabase.from('perfiles').upsert({
        id: userId,
        curp: formData.curp.toUpperCase(),
        nombre_completo: formData.nombre_completo,
        sexo: formData.sexo,
        fecha_nacimiento: formData.fecha_nacimiento,
        direccion: formData.direccion,
        ocupacion: formData.ocupacion,
        telefono: formData.telefono,
        rol: 'paciente',
        registro_completo: true
      });

      if (errorPerfil) throw errorPerfil;

      // 2. Insertar Antecedentes (Tabla: antecedentes_familiares)
      // Mapeamos los booleanos segun tu diseño de base de datos
      const { error: errorAnt } = await supabase.from('antecedentes_familiares').upsert({
        perfil_id: userId,
        diabetes_padre: formData.diabetes.padre,
        diabetes_madre: formData.diabetes.madre,
        obesidad_padre: formData.obesidad.padre,
        obesidad_madre: formData.obesidad.madre,
        alergias_especificar: formData.alergias
      });

      if (errorAnt) throw errorAnt;

      router.push('/dashboard');
    } catch (error) {
      alert('Error al guardar los datos. Revisa la consola.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        <header className="mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold text-blue-900">Expediente de Identificación Único</h1>
          <p className="text-gray-500 text-sm">Por favor, completa tus datos fijos para continuar.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECCIÓN: DATOS DE IDENTIFICACIÓN */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
              <input 
                required
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                onChange={(e) => setFormData({...formData, nombre_completo: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">CURP (18 caracteres)</label>
              <input 
                required
                maxLength={18}
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border uppercase"
                onChange={(e) => setFormData({...formData, curp: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Sexo</label>
              <select 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                onChange={(e) => setFormData({...formData, sexo: e.target.value})}
              >
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>
          </section>

          {/* SECCIÓN: ANTECEDENTES HEREDOFAMILIARES */}
          <section className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3 text-sm uppercase tracking-wider">Antecedentes Heredofamiliares</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-2 rounded border">
                <span className="text-sm font-medium">Diabetes</span>
                <div className="space-x-4">
                  <label className="inline-flex items-center text-xs">
                    <input type="checkbox" className="rounded text-blue-600" onChange={(e) => setFormData({...formData, diabetes: {...formData.diabetes, padre: e.target.checked}})} /> Padre
                  </label>
                  <label className="inline-flex items-center text-xs">
                    <input type="checkbox" className="rounded text-blue-600" onChange={(e) => setFormData({...formData, diabetes: {...formData.diabetes, madre: e.target.checked}})} /> Madre
                  </label>
                </div>
              </div>
              {/* Repetir estructura para Obesidad según tu Word... */}
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Guardando...' : 'Finalizar Registro y Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}