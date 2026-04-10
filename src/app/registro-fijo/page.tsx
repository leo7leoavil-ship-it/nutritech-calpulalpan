'use client';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';

// --- 1. Definición de Tipos Estrictos (Cumplimiento de Integridad) ---
// Define la estructura de los antecedentes familiares para evitar el tipo 'any'
interface AntecedenteFamiliar {
  padre: boolean;
  madre: boolean;
}

// Define la estructura completa del estado del formulario
interface FormDataState {
  curp: string;
  nombre_completo: string;
  sexo: string;
  fecha_nacimiento: string;
  direccion: string;
  ocupacion: string;
  telefono: string;
  // Antecedentes estructurados
  diabetes: AntecedenteFamiliar;
  obesidad: AntecedenteFamiliar;
  alergias: string;
}

export default function RegistroFijo() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  // --- 2. Estado Inicial Tipado Correctamente ---
  const [formData, setFormData] = useState<FormDataState>({
    curp: '',
    nombre_completo: '',
    sexo: 'Masculino',
    fecha_nacimiento: '',
    direccion: '',
    ocupacion: '',
    telefono: '',
    // Inicialización explícita de sub-objetos
    diabetes: { padre: false, madre: false },
    obesidad: { padre: false, madre: false },
    alergias: '',
  });

  useEffect(() => {
    const getSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      else router.push('/login');
    };
    getSession();
  }, [router]);

  // --- 3. Manejadores de Eventos Tipados ---
  // Para inputs de texto/select normales
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Para checkboxes de antecedentes (la solución a tus errores)
  const handleCheckboxChange = (
    e: ChangeEvent<HTMLInputElement>,
    parentKey: 'diabetes' | 'obesidad', // Restringe a qué claves del estado aplicar
    childKey: 'padre' | 'madre'
  ) => {
    const { checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey], // Copia el estado previo del antecedente (ej. preserva 'madre' si cambias 'padre')
        [childKey]: checked
      }
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);

    try {
      // --- 4. Operación Upsert en Perfiles ---
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

      // --- 5. Mapeo Correcto a la Base de Datos ---
      // Aquí se traduce la estructura del frontend a las columnas de Supabase
      const { error: errorAnt } = await supabase.from('antecedentes_familiares').upsert({
        perfil_id: userId,
        // Traducimos: frontend 'formData.diabetes.padre' -> DB 'diabetes_padre'
        diabetes_padre: formData.diabetes.padre,
        diabetes_madre: formData.diabetes.madre,
        obesidad_padre: formData.obesidad.padre,
        obesidad_madre: formData.obesidad.madre,
        alergias_especificar: formData.alergias.trim()
      });

      if (errorAnt) throw errorAnt;

      // Redirección al Dashboard tras éxito (RNF-09: Usabilidad)
      router.push('/dashboard');
    } catch (error) {
      console.error('Error salvando datos:', error);
      alert('Ocurrió un error al guardar tu perfil. Por favor, revisa los datos e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // --- Renderizado (con corrección de 'name' attributes) ---
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        <header className="mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold text-blue-900">Expediente de Identificación Único</h1>
          <p className="text-gray-500 text-sm">Completa tus datos fijos para continuar.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECCIÓN: DATOS DE IDENTIFICACIÓN */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
              <input 
                required
                type="text"
                name="nombre_completo" // Crítico para handleInputChange
                value={formData.nombre_completo}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">CURP (18 caracteres)</label>
              <input 
                required
                maxLength={18}
                pattern="^[A-Z]{4}[0-9]{6}[H,M][A-Z]{5}[0-9]{2}$" // Validación básica de CURP
                type="text"
                name="curp"
                value={formData.curp}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border uppercase"
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Sexo</label>
              <select 
                name="sexo"
                value={formData.sexo}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                onChange={handleInputChange}
              >
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>
          </section>

          {/* SECCIÓN: ANTECEDENTES HEREDOFAMILIARES (Corregida) */}
          <section className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3 text-sm uppercase tracking-wider">Antecedentes Heredofamiliares</h3>
            <div className="space-y-4">
              {/* Diabetes */}
              <div className="flex items-center justify-between bg-white p-2 rounded border gap-4">
                <span className="text-sm font-medium text-gray-800">Diabetes</span>
                <div className="flex gap-4">
                  <label className="inline-flex items-center text-xs text-gray-600 gap-1">
                    <input 
                      type="checkbox" 
                      checked={formData.diabetes.padre}
                      className="rounded text-blue-600 focus:ring-blue-500" 
                      // Llamada corregida con tipos explícitos
                      onChange={(e) => handleCheckboxChange(e, 'diabetes', 'padre')} 
                    /> Padre
                  </label>
                  <label className="inline-flex items-center text-xs text-gray-600 gap-1">
                    <input 
                      type="checkbox" 
                      checked={formData.diabetes.madre}
                      className="rounded text-blue-600 focus:ring-blue-500" 
                      onChange={(e) => handleCheckboxChange(e, 'diabetes', 'madre')} 
                    /> Madre
                  </label>
                </div>
              </div>

              {/* Obesidad (Repetimos estructura corregida) */}
              <div className="flex items-center justify-between bg-white p-2 rounded border gap-4">
                <span className="text-sm font-medium text-gray-800">Obesidad</span>
                <div className="flex gap-4">
                  <label className="inline-flex items-center text-xs text-gray-600 gap-1">
                    <input 
                      type="checkbox" 
                      checked={formData.obesidad.padre}
                      className="rounded text-blue-600 focus:ring-blue-500" 
                      onChange={(e) => handleCheckboxChange(e, 'obesidad', 'padre')} 
                    /> Padre
                  </label>
                  <label className="inline-flex items-center text-xs text-gray-600 gap-1">
                    <input 
                      type="checkbox" 
                      checked={formData.obesidad.madre}
                      className="rounded text-blue-600 focus:ring-blue-500" 
                      onChange={(e) => handleCheckboxChange(e, 'obesidad', 'madre')} 
                    /> Madre
                  </label>
                </div>
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex justify-center items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando perfil clínico...
              </>
            ) : 'Finalizar Registro y Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}