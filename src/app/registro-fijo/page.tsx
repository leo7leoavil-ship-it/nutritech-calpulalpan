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
    sobrepeso_padre: false, // Nota: Tu SQL no tiene sobrepeso_padre/madre, solo observaciones
    sobrepeso_madre: false,
    sobrepeso_observaciones: '',
    obesidad_padre: false,
    obesidad_madre: false,
    obesidad_observaciones: '',
    hipertension_padre: false, // Nota: Tu SQL no tiene hipertension_padre/madre, solo observaciones
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

  // --- PASO 1: CREAR PERFIL ---
  const handleStep1Submit = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Sesión no válida");

      const { error } = await supabase
        .from('perfiles')
        .upsert({
          id: session.user.id,
          curp: formData.curp.toUpperCase().trim(),
          nombre_completo: formData.nombre_completo,
          sexo: formData.sexo, // Debe ser 'Masculino', 'Femenino' u 'Otro'
          fecha_nacimiento: formData.fecha_nacimiento,
          direccion: formData.direccion,
          ocupacion: formData.ocupacion,
          telefono: formData.telefono,
          email: session.user.email,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) throw error;
      setStep(2);
    } catch (error: any) {
      alert(`Error en Identificación: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- PASO FINAL: ANTECEDENTES ---
  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Usuario no autenticado");

      // 1. Antecedentes Familiares (Alineado con tu SQL)
      const { error: errorFam } = await supabase
        .from('antecedentes_familiares')
        .upsert({
          perfil_id: session.user.id,
          diabetes_padre: formData.diabetes_padre,
          diabetes_madre: formData.diabetes_madre,
          obesidad_padre: formData.obesidad_padre,
          obesidad_madre: formData.obesidad_madre,
          diabetes_observaciones: formData.diabetes_observaciones,
          sobrepeso_observaciones: formData.sobrepeso_observaciones,
          obesidad_observaciones: formData.obesidad_observaciones,
          hipertension_observaciones: formData.hipertension_observaciones,
          colesterol_trigliceridos: formData.colesterol_trigliceridos,
          tiene_alergias: formData.tiene_alergias,
          alergias_especificar: formData.alergias_especificar,
          otros_antecedentes: formData.otros_antecedentes,
          updated_at: new Date().toISOString()
        }, { onConflict: 'perfil_id' });

      if (errorFam) throw errorFam;

      // 2. Antecedentes Patológicos (Alineado con tu SQL)
      const { error: errorPat } = await supabase
        .from('antecedentes_patologicos')
        .upsert({
          perfil_id: session.user.id,
          padece_enfermedad: formData.padece_enfermedad,
          enfermedad_diagnosticada: formData.enfermedad_diagnosticada,
          toma_medicamento: formData.toma_medicamento,
          nombre_medicamento: formData.nombre_medicamento,
          dosis: formData.dosis,
          updated_at: new Date().toISOString()
        }, { onConflict: 'perfil_id' });

      if (errorPat) throw errorPat;

      // 3. Marcar registro completo
      await supabase.from('perfiles').update({ registro_completo: true }).eq('id', session.user.id);

      alert("¡Expediente sincronizado con éxito!");
      window.location.href = '/dashboard';

    } catch (error: any) {
      alert(`Error al guardar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <FormStepper currentStep={step} />
        {step === 1 && <Step1Identificacion formData={formData} updateFormData={updateFormData} onNext={handleStep1Submit} />}
        {step === 2 && <Step2Familiares formData={formData} updateFormData={updateFormData} onNext={() => setStep(3)} onPrev={() => setStep(1)} />}
        {step === 3 && <Step3Patologicos formData={formData} updateFormData={updateFormData} onPrev={() => setStep(2)} onSubmit={handleFinalSubmit} loading={loading} />}
      </div>
    </div>
  );
}