'use client';

import { createClient } from '@/lib/client';
import { useEffect, useState } from 'react';
import FormStepper from './components/FormStepper';
import Step1Identificacion from './components/Step1Identificacion';
import Step2Familiares from './components/Step2Familiares';
import Step3Patologicos from './components/Step3Patologicos';
import { useRegistroForm } from './hooks/useRegistroForm';

export default function RegistroFijoPage() {
  // Inicializamos el cliente unificado que ya maneja las cookies
  const supabase = createClient();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);  
  
  const { formData, updateFormData } = useRegistroForm({
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
  });

  // CORRECCIÓN: El useEffect DEBE ir dentro del componente
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("ESTADO INICIAL SESIÓN:", session ? "Conectado: " + session.user.email : "Sin Sesión");
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("EVENTO SUPABASE AUTH:", event, session?.user?.email);
    });

    checkAuth();
    return () => subscription.unsubscribe();
  }, []);

  // --- PASO 1: GUARDAR PERFIL (IDENTIFICACIÓN) ---
  const handleStep1Submit = async () => {
    setLoading(true);
    try {
      // Intentamos obtener al usuario de la sesión o del servidor
      const { data: { session } } = await supabase.auth.getSession();
      let user: any = session?.user;

      if (!user) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        user = authUser;
      }

      if (!user) throw new Error("Sesión no detectada. Por favor, re-inicia sesión con Google.");

      // Upsert a la tabla perfiles
      const { error } = await supabase
        .from('perfiles')
        .upsert({
          id: user.id, 
          curp: formData.curp.toUpperCase().trim(),
          nombre_completo: formData.nombre_completo,
          sexo: formData.sexo, 
          fecha_nacimiento: formData.fecha_nacimiento,
          direccion: formData.direccion,
          ocupacion: formData.ocupacion,
          telefono: formData.telefono,
          email: user.email,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) {
        if (error.message.includes('perfiles_curp_key')) throw new Error("Esta CURP ya está registrada.");
        throw error;
      }

      setStep(2);
    } catch (error: any) {
      console.error("DEBUG ERROR:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- PASO FINAL: GUARDAR ANTECEDENTES Y FINALIZAR ---
  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("No se detectó una sesión activa.");

      const userId = session.user.id;

      // 1. Guardar Antecedentes Familiares
      const { error: errorFam } = await supabase
        .from('antecedentes_familiares')
        .upsert({
          perfil_id: userId,
          diabetes_padre: formData.diabetes_padre,
          diabetes_madre: formData.diabetes_madre,
          obesidad_padre: formData.obesidad_padre,
          obesidad_madre: formData.obesidad_madre,
          hipertension_padre: formData.hipertension_padre,
          hipertension_madre: formData.hipertension_madre,
          sobrepeso_padre: formData.sobrepeso_padre,
          sobrepeso_madre: formData.sobrepeso_madre,
          diabetes_observaciones: formData.diabetes_observaciones,
          sobrepeso_observaciones: formData.sobrepeso_observaciones,
          obesidad_observaciones: formData.obesidad_observaciones,
          hipertension_observaciones: formData.hipertension_observaciones,
          colesterol_trigliceridos: formData.colesterol_trigliceridos,
          otros_antecedentes: formData.otros_antecedentes,
          tiene_alergias: formData.tiene_alergias,
          alergias_especificar: formData.alergias_especificar,
          especificar_alergias: formData.alergias_especificar,
          updated_at: new Date().toISOString()
        }, { onConflict: 'perfil_id' });

      if (errorFam) throw new Error(`Error en familiares: ${errorFam.message}`);

      // 2. Guardar Antecedentes Patológicos
      const { error: errorPat } = await supabase
        .from('antecedentes_patologicos')
        .upsert({
          perfil_id: userId,
          padece_enfermedad: formData.padece_enfermedad,
          enfermedad_diagnosticada: formData.enfermedad_diagnosticada,
          toma_medicamento: formData.toma_medicamento,
          nombre_medicamento: formData.nombre_medicamento,
          dosis: formData.dosis,
          updated_at: new Date().toISOString()
        }, { onConflict: 'perfil_id' });

      if (errorPat) throw new Error(`Error en patológicos: ${errorPat.message}`);

      // 3. Marcar registro completo
      await supabase.from('perfiles').update({ registro_completo: true }).eq('id', userId);

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
        {step === 1 && <Step1Identificacion formData={formData} updateFormData={updateFormData} onNext={handleStep1Submit} />}
        {step === 2 && <Step2Familiares formData={formData} updateFormData={updateFormData} onNext={() => setStep(3)} onPrev={() => setStep(1)} />}
        {step === 3 && <Step3Patologicos formData={formData} updateFormData={updateFormData} onPrev={() => setStep(2)} onSubmit={handleFinalSubmit} loading={loading} />}
      </div>
    </div>
  );
}