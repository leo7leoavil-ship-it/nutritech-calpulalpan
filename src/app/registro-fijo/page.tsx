'use client';

import { createClient } from '@supabase/supabase-js';
import { useState } from 'react';
import FormStepper from './components/FormStepper';
import { useRegistroForm } from './hooks/useRegistroForm';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegistroFijoPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);  
  
  // 2. Usamos el Hook para manejar el estado inicial
  // Esto sustituye al anterior useState del formData
  const { formData, updateFormData } = useRegistroForm({
    curp: '',
    nombre_completo: '',
    sexo: '',
    fecha_nacimiento: '',
    direccion: '',
    ocupacion: '',
    telefono: '',
    diabetes: false,
    sobrepeso: false,
    obesidad: false,
    hipertension: false,
    alergias: false,
    padre: '',
    madre: '',
    otros: '',
    especificar_alergias: '',
    enfermedad_diagnosticada: '',
    toma_medicamento: false,
    nombre_medicamento: '',
    dosis: ''
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No se encontró sesión de usuario");

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
          email: user.email,
          registro_completo: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (errorPerfil) throw errorPerfil;

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
        
        {/* 3. Reemplazamos el indicador manual por el nuevo componente FormStepper */}
        <FormStepper currentStep={step} />

        {/* Renderizado de Pasos (se mantiene igual, usando el formData del Hook) */}
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