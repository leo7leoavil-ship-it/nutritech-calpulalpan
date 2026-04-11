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

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No se encontró sesión de usuario");

      // 1. Tabla: perfiles
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

      // 2. Tabla: antecedentes_familiares
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
          otros_antecedentes: formData.otros_antecedentes
        });

      if (errorFam) throw errorFam;

      // 3. Tabla: antecedentes_patologicos
      const { error: errorPat } = await supabase
        .from('antecedentes_patologicos')
        .upsert({
          perfil_id: user.id,
          padece_enfermedad: formData.padece_enfermedad,
          enfermedad_diagnosticada: formData.enfermedad_diagnosticada,
          toma_medicamento: formData.toma_medicamento,
          nombre_medicamento: formData.nombre_medicamento,
          dosis: formData.dosis
        });

      if (errorPat) throw errorPat;

      alert("¡Registro completado con éxito!");
      window.location.href = '/dashboard';

    } catch (error: any) {
      console.error("Error al guardar:", error.message);
      alert("Error al guardar datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <FormStepper currentStep={step} />
        {step === 1 && <Step1Identificacion formData={formData} updateFormData={updateFormData} onNext={nextStep} />}
        {step === 2 && <Step2Familiares formData={formData} updateFormData={updateFormData} onNext={nextStep} onPrev={prevStep} />}
        {step === 3 && <Step3Patologicos formData={formData} updateFormData={updateFormData} onPrev={prevStep} onSubmit={handleFinalSubmit} loading={loading} />}
      </div>
    </div>
  );
}