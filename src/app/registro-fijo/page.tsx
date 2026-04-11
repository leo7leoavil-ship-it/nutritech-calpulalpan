'use client';

import { createClient } from '@supabase/supabase-js';
import { useState } from 'react';
import FormStepper from './components/FormStepper';
import Step1Identificacion from './components/Step1Identificacion';
import Step2Familiares from './components/Step2Familiares';
import Step3Patologicos from './components/Step3Patologicos';
import { useRegistroForm } from './hooks/useRegistroForm';
import { RegistroFormData } from './types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegistroFijoPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);  
  
  const initialData: RegistroFormData = {
    curp: '',
    nombre_completo: '',
    sexo: '',
    fecha_nacimiento: '',
    direccion: '',
    ocupacion: '',
    telefono: '',
    diabetes_padre: false,
    diabetes_madre: false,
    diabetes_observaciones: '',
    sobrepeso_padre: false,
    sobrepeso_madre: false,
    sobrepeso_observaciones: '',
    obesidad_padre: false,
    obesidad_madre: false,
    obesidad_observaciones: '',
    hipertension_padre: false,
    hipertension_madre: false,
    hipertension_observaciones: '',
    colesterol_trigliceridos: '',
    tiene_alergias: false,
    alergias_especificar: '',
    otros_antecedentes: '',
    padece_enfermedad: false,
    enfermedad_diagnosticada: '',
    toma_medicamento: false,
    nombre_medicamento: '',
    dosis: ''
  };

  const { formData, updateFormData } = useRegistroForm(initialData);

  // --- 1. GUARDADO DEL PERFIL (SE ACTIVA AL DAR NEXT EN PASO 1) ---
  const handleStep1Submit = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      let user: any = session?.user;

      if (!user) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        user = authUser;
      }

      if (!user) throw new Error("Sesión no encontrada. Por favor re-inicia sesión.");

      // CREAMOS O ACTUALIZAMOS EL PERFIL
      const { error } = await supabase
        .from('perfiles')
        .upsert({
          id: user.id,
          curp: formData.curp,
          nombre_completo: formData.nombre_completo,
          sexo: formData.sexo,
          fecha_nacimiento: formData.fecha_nacimiento,
          direccion: formData.direccion,
          ocupacion: formData.ocupacion,
          telefono: formData.telefono,
          email: user.email,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Si el perfil se guardó con éxito, avanzamos al siguiente paso
      setStep(2);
    } catch (error: any) {
      console.error("Error Paso 1:", error);
      alert(`Error al guardar identificación: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. GUARDADO FINAL (ANTECEDENTES) ---
  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) throw new Error("Usuario no autenticado");

      // Guardamos Antecedentes Familiares
      const { error: errorFam } = await supabase
        .from('antecedentes_familiares')
        .upsert({
          perfil_id: user.id,
          diabetes_padre: formData.diabetes_padre,
          diabetes_madre: formData.diabetes_madre,
          diabetes_observaciones: formData.diabetes_observaciones,
          sobrepeso_padre: formData.sobrepeso_padre,
          sobrepeso_madre: formData.sobrepeso_madre,
          sobrepeso_observaciones: formData.sobrepeso_observaciones,
          obesidad_padre: formData.obesidad_padre,
          obesidad_madre: formData.obesidad_madre,
          obesidad_observaciones: formData.obesidad_observaciones,
          hipertension_padre: formData.hipertension_padre,
          hipertension_madre: formData.hipertension_madre,
          hipertension_observaciones: formData.hipertension_observaciones,
          colesterol_trigliceridos: formData.colesterol_trigliceridos,
          tiene_alergias: formData.tiene_alergias,
          alergias_especificar: formData.alergias_especificar,
          otros_antecedentes: formData.otros_antecedentes,
          updated_at: new Date().toISOString()
        });

      if (errorFam) throw errorFam;

      // Guardamos Antecedentes Patológicos
      const { error: errorPat } = await supabase
        .from('antecedentes_patologicos')
        .upsert({
          perfil_id: user.id,
          padece_enfermedad: formData.padece_enfermedad,
          enfermedad_diagnosticada: formData.enfermedad_diagnosticada,
          toma_medicamento: formData.toma_medicamento,
          nombre_medicamento: formData.nombre_medicamento,
          dosis: formData.dosis,
          updated_at: new Date().toISOString()
        });

      if (errorPat) throw errorPat;

      // Marcamos el registro como completo
      await supabase
        .from('perfiles')
        .update({ registro_completo: true })
        .eq('id', user.id);

      alert("¡Registro guardado exitosamente!");
      window.location.href = '/dashboard';

    } catch (error: any) {
      alert(`Error final: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <FormStepper currentStep={step} />
        
        {step === 1 && (
          <Step1Identificacion 
            formData={formData} 
            updateFormData={updateFormData} 
            onNext={handleStep1Submit} // Llama a la función de guardado de perfil
          />
        )}
        
        {step === 2 && (
          <Step2Familiares 
            formData={formData} 
            updateFormData={updateFormData} 
            onNext={() => setStep(3)} // Solo navegación local
            onPrev={() => setStep(1)} 
          />
        )}

        {step === 3 && (
          <Step3Patologicos 
            formData={formData} 
            updateFormData={updateFormData} 
            onPrev={() => setStep(2)} 
            onSubmit={handleFinalSubmit} // Cierre del expediente
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}