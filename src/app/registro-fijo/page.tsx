'use client';

import { createClient } from '@supabase/supabase-js'; // <--- Cambiamos esto
import { useState } from 'react';
import Step1Identificacion from './components/Step1Identificacion';
import Step2Familiares from './components/Step2Familiares';
import Step3Patologicos from './components/Step3Patologicos';

// Inicializamos el cliente de Supabase fuera del componente
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegistroFijoPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);  
  
  // Estado inicial alineado con tu Diccionario de Datos y Esquema SQL
  const [formData, setFormData] = useState({
    // Tabla: perfiles (El id y email se obtienen de la sesión)
    curp: '',
    nombre_completo: '',
    sexo: '',
    fecha_nacimiento: '',
    direccion: '',
    ocupacion: '',
    telefono: '',

    // Tabla: antecedentes_familiares
    diabetes: false,
    sobrepeso: false,
    obesidad: false,
    hipertension: false,
    alergias: false,
    padre: '',
    madre: '',
    otros: '',
    especificar_alergias: '',

    // Tabla: antecedentes_patologicos
    enfermedad_diagnosticada: '',
    toma_medicamento: false,
    nombre_medicamento: '',
    dosis: ''
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const updateFormData = (newData: any) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      // 1. Obtener sesión de Google/Supabase Auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No se encontró sesión de usuario");

      // 2. Operación Atómica en tablas (Sincronización de Email automática)
      const { error: errorPerfil } = await supabase
        .from('perfiles')
        .update({
          curp: formData.curp,
          nombre_completo: formData.nombre_completo,
          sexo: formData.sexo,
          fecha_nacimiento: formData.fecha_nacimiento,
          direccion: formData.direccion,
          ocupacion: formData.ocupacion,
          telefono: formData.telefono,
          email: user.email, // Tomado automáticamente de Google
          registro_completo: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (errorPerfil) throw errorPerfil;

      // 3. Guardar Antecedentes (Upsert para evitar duplicados)
      const { error: errorFam } = await supabase
        .from('antecedentes_familiares')
        .upsert({
          perfil_id: user.id,
          diabetes: formData.diabetes,
          sobrepeso: formData.sobrepeso,
          obesidad: formData.obesidad,
          hipertension: formData.hipertension,
          alergias: formData.alergias,
          padre: formData.padre,
          madre: formData.madre,
          otros: formData.otros,
          especificar_alergias: formData.especificar_alergias
        });

      if (errorFam) throw errorFam;

      alert("¡Registro completado con éxito!");
      window.location.href = '/dashboard';

    } catch (error: any) {
      console.error("Error al guardar:", error.message);
      alert("Error al guardar datos. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        
        {/* Indicador de Progreso */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-green-700 uppercase tracking-wider">
              Paso {step} de 3
            </span>
            <div className="flex space-x-2">
              {[1, 2, 3].map((s) => (
                <div 
                  key={s} 
                  className={`h-2 w-12 rounded-full transition-all duration-300 ${step >= s ? 'bg-green-500' : 'bg-gray-200'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Renderizado de Pasos */}
        {step === 1 && (
          <Step1Identificacion 
            formData={formData} 
            updateFormData={updateFormData} 
            onNext={nextStep} 
          />
        )}
        
        {step === 2 && (
          <Step2Familiares 
            formData={formData} 
            updateFormData={updateFormData} 
            onNext={nextStep} 
            onPrev={prevStep} 
          />
        )}

        {step === 3 && (
          <Step3Patologicos 
            formData={formData} 
            updateFormData={updateFormData} 
            onPrev={prevStep} 
            onSubmit={handleFinalSubmit}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}