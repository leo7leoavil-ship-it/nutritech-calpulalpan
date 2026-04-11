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
    sexo: '', // El SQL espera: 'Masculino', 'Femenino' u 'Otro'
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

  // --- PASO 1: GUARDAR PERFIL (IDENTIFICACIÓN) ---
  const handleStep1Submit = async () => {
    setLoading(true);
    try {
      // Obtenemos sesión fresca para evitar "Sesión no válida"
      const { data: { session } } = await supabase.auth.getSession();
      let user: any = session?.user;

      if (!user) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        user = authUser;
      }

      if (!user) throw new Error("Sesión no encontrada. Por favor re-inicia sesión con Google.");

      // Sincronización exacta con tabla public.perfiles
      const { error } = await supabase
        .from('perfiles')
        .upsert({
          id: user.id, // Primary Key
          curp: formData.curp.toUpperCase().trim(),
          nombre_completo: formData.nombre_completo,
          sexo: formData.sexo, // Check constraint: Masculino/Femenino/Otro
          fecha_nacimiento: formData.fecha_nacimiento,
          direccion: formData.direccion,
          ocupacion: formData.ocupacion,
          telefono: formData.telefono,
          email: user.email,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'id' 
        });

      if (error) {
        if (error.message.includes('perfiles_curp_key')) {
          throw new Error("Esta CURP ya está registrada en otra cuenta.");
        }
        throw error;
      }

      setStep(2);
    } catch (error: any) {
      console.error("Error Paso 1:", error);
      alert(`Error en Identificación: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- PASO FINAL: GUARDAR ANTECEDENTES Y FINALIZAR ---
  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) throw new Error("No se detectó una sesión activa.");

      // 1. Guardar Antecedentes Familiares (Sincronización Total con SQL)
      const { error: errorFam } = await supabase
        .from('antecedentes_familiares')
        .upsert({
          perfil_id: user.id,
          // --- Booleanos (Diabetes) ---
          diabetes_padre: formData.diabetes_padre,
          diabetes_madre: formData.diabetes_madre,
          // --- Booleanos (Obesidad) ---
          obesidad_padre: formData.obesidad_padre,
          obesidad_madre: formData.obesidad_madre,
          // --- Booleanos (Hipertensión) - NUEVOS ---
          hipertension_padre: formData.hipertension_padre,
          hipertension_madre: formData.hipertension_madre,
          // --- Booleanos (Sobrepeso) - NUEVOS ---
          sobrepeso_padre: formData.sobrepeso_padre,
          sobrepeso_madre: formData.sobrepeso_madre,
          // --- Textos y Observaciones ---
          diabetes_observaciones: formData.diabetes_observaciones,
          sobrepeso_observaciones: formData.sobrepeso_observaciones,
          obesidad_observaciones: formData.obesidad_observaciones,
          hipertension_observaciones: formData.hipertension_observaciones,
          colesterol_trigliceridos: formData.colesterol_trigliceridos,
          otros_antecedentes: formData.otros_antecedentes,
          // --- Alergias ---
          tiene_alergias: formData.tiene_alergias,
          alergias_especificar: formData.alergias_especificar, // Mapeo directo al SQL
          especificar_alergias: formData.alergias_especificar, // Respaldo por nombre alterno en SQL
          // --- Auditoría ---
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'perfil_id' 
        });

      if (errorFam) throw new Error(`Error en familiares: ${errorFam.message}`);
      // 2. Guardar Antecedentes Patológicos
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
        }, { 
          onConflict: 'perfil_id' 
        });

      if (errorPat) throw new Error(`Error en patológicos: ${errorPat.message}`);

      // 3. Marcar registro completo en tabla perfiles
      await supabase
        .from('perfiles')
        .update({ registro_completo: true })
        .eq('id', user.id);

      alert("¡Expediente guardado con éxito!");
      window.location.href = '/dashboard';

    } catch (error: any) {
      console.error("Error final:", error);
      alert(`Error al guardar: ${error.message}`);
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
            onNext={handleStep1Submit} 
          />
        )}
        
        {step === 2 && (
          <Step2Familiares 
            formData={formData} 
            updateFormData={updateFormData} 
            onNext={() => setStep(3)} 
            onPrev={() => setStep(1)} 
          />
        )}

        {step === 3 && (
          <Step3Patologicos 
            formData={formData} 
            updateFormData={updateFormData} 
            onPrev={() => setStep(2)} 
            onSubmit={handleFinalSubmit} 
            loading={loading} 
          />
        )}
      </div>
    </div>
  );
}