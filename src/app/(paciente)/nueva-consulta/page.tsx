'use client';

import { createClient } from '@/lib/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import FormStepper from './components/FormStepper';
import Step1Motivo from './components/Step1Motivo';
import Step2Antropometria from './components/Step2Antropometria';
import Step3EvaluacionDietetica from './components/Step3EvaluacionDietetica';
import Step4EstiloVida from './components/Step4EstiloVida';
import Step5Recordatorio24h from './components/Step5Recordatorio24h';
import { useNuevaConsultaForm } from './hooks/useNuevaConsultaForm';

export default function NuevaConsultaPage() {
  const supabase = createClient();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const { formData, updateFormData } = useNuevaConsultaForm({
    motivo_consulta: '',
    peso_kg: '',
    talla_cm: '',
    comidas_dia: '',
    agua_litros: '',
    nivel_apetito: '',
    hora_max_apetito: '',
    compania_comida_tipo: '',
    compania_comida_detalle: '',
    tiempo_comida_min: '',
    usa_dispositivos: false,
    dispositivos_detalle: '',
    sal_adicional: false,
    preferencias_positivas: '',
    preferencias_negativas: '',
    sueno_horas: '',
    sueno_problemas: '',
    actividad_fisica: '',
    ejercicio_frecuencia: '',
    ejercicio_tiempo: '',
    practica_deporte: '',
    tipo_deporte: '',
    frecuencia_deporte: '',
    tiempo_deporte: '',
    r24_desayuno: '',
    r24_colacion_manana: '',
    r24_comida: '',
    r24_colacion_tarde: '',
    r24_cena: '',
    r24_extras: '',
    es_dia_tipico: '',
    grasas_frecuentes: '',
    r24_agua_litros: '',
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('ESTADO INICIAL SESIÓN:', session ? `Conectado: ${session.user.email}` : 'Sin Sesión');
    };
    checkAuth();
  }, [supabase]);

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Sesión no detectada. Por favor, re-inicia sesión.');

      const pacienteId = user.id;

      const pesoKg = Number(formData.peso_kg);
      const tallaCm = Number(formData.talla_cm);
      if (!Number.isFinite(pesoKg) || !Number.isFinite(tallaCm) || pesoKg <= 0 || tallaCm <= 0) {
        throw new Error('Peso y talla deben ser números válidos mayores a 0.');
      }
      const tallaM = tallaCm / 100;
      const imc = pesoKg / (tallaM * tallaM);
      if (!Number.isFinite(imc)) {
        throw new Error('No se pudo calcular el IMC con los datos proporcionados.');
      }

      // Obtenemos especialista asignado (aprobado_por) del perfil del paciente
      const { data: perfil, error: perfilError } = await supabase
        .from('perfiles')
        .select('aprobado_por')
        .eq('id', pacienteId)
        .single();

      if (perfilError) throw new Error(`Error obteniendo perfil: ${perfilError.message}`);
      const especialistaId = perfil?.aprobado_por || null;
      //if (!especialistaId) throw new Error('Tu cuenta aún no tiene un especialista asignado (pendiente de aprobación).');

      // 1) Insert: antropometría
      const { data: antropometriaRow, error: antropometriaError } = await supabase
        .from('consulta_antropometria')
        .insert({
          perfil_id: pacienteId,
          peso_kg: pesoKg,
          talla_cm: tallaCm,
          imc: imc,
        })
        .select('id')
        .single();
      if (antropometriaError) throw new Error(`Error antropometría: ${antropometriaError.message}`);

      // 2) Insert: evaluación dietética (sin alergias/intolerancias)
      const { data: dieteticaRow, error: dieteticaError } = await supabase
        .from('consulta_evaluacion_dietetica')
        .insert({
          perfil_id: pacienteId,
          comidas_dia: formData.comidas_dia || null,
          agua_litros: formData.agua_litros || null,
          nivel_apetito: formData.nivel_apetito || null,
          hora_max_apetito: formData.hora_max_apetito || null,
          compania_comida_tipo: formData.compania_comida_tipo || null,
          compania_comida_detalle: formData.compania_comida_detalle || null,
          tiempo_comida_min: formData.tiempo_comida_min || null,
          usa_dispositivos: !!formData.usa_dispositivos,
          dispositivos_detalle: formData.dispositivos_detalle || null,
          sal_adicional: !!formData.sal_adicional,
          preferencias_positivas: formData.preferencias_positivas || null,
          preferencias_negativas: formData.preferencias_negativas || null,
        })
        .select('id')
        .single();
      if (dieteticaError) throw new Error(`Error evaluación dietética: ${dieteticaError.message}`);

      // 3) Insert: estilo de vida
      const { data: estiloVidaRow, error: estiloVidaError } = await supabase
        .from('consulta_estilo_vida')
        .insert({
          perfil_id: pacienteId,
          sueno_horas: formData.sueno_horas || null,
          sueno_problemas: formData.sueno_problemas || null,
          actividad_fisica: formData.actividad_fisica || null,
          ejercicio_frecuencia: formData.ejercicio_frecuencia || null,
          ejercicio_tiempo: formData.ejercicio_tiempo || null,
          practica_deporte: formData.practica_deporte || null,
          tipo_deporte: formData.tipo_deporte || null,
          frecuencia_deporte: formData.frecuencia_deporte || null,
          tiempo_deporte: formData.tiempo_deporte || null,
        })
        .select('id')
        .single();
      if (estiloVidaError) throw new Error(`Error estilo de vida: ${estiloVidaError.message}`);

      // 4) Insert: recordatorio 24h
      const { data: r24Row, error: r24Error } = await supabase
        .from('consulta_recordatorio_24h')
        .insert({
          perfil_id: pacienteId,
          r24_desayuno: formData.r24_desayuno || null,
          r24_colacion_manana: formData.r24_colacion_manana || null,
          r24_comida: formData.r24_comida || null,
          r24_colacion_tarde: formData.r24_colacion_tarde || null,
          r24_cena: formData.r24_cena || null,
          r24_extras: formData.r24_extras || null,
          es_dia_tipico: formData.es_dia_tipico || null,
          grasas_frecuentes: formData.grasas_frecuentes || null,
          r24_agua_litros: formData.r24_agua_litros || null,
        })
        .select('id')
        .single();
      if (r24Error) throw new Error(`Error recordatorio 24h: ${r24Error.message}`);

      // 5) Insert: consulta principal (relaciona IDs)
      const { error: consultaError } = await supabase
        .from('consultas')
        .insert({
          paciente_id: pacienteId,
          especialista_id: especialistaId,
          motivo_consulta: formData.motivo_consulta,
          status: 'pendiente',
          antropometria_id: antropometriaRow.id,
          evaluacion_dietetica_id: dieteticaRow.id,
          estilo_vida_id: estiloVidaRow.id,
          recordatorio_24h_id: r24Row.id,
        });
      if (consultaError) throw new Error(`Error guardando consulta: ${consultaError.message}`);

      alert('¡Consulta guardada con éxito!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error guardando consulta:', error);
      alert(error?.message || 'Ocurrió un error al guardar la consulta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <FormStepper currentStep={step} />

        {step === 1 && (
          <Step1Motivo
            formData={formData}
            updateFormData={updateFormData}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <Step2Antropometria
            formData={formData}
            updateFormData={updateFormData}
            onPrev={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <Step3EvaluacionDietetica
            formData={formData}
            updateFormData={updateFormData}
            onPrev={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        )}

        {step === 4 && (
          <Step4EstiloVida
            formData={formData}
            updateFormData={updateFormData}
            onPrev={() => setStep(3)}
            onNext={() => setStep(5)}
          />
        )}

        {step === 5 && (
          <Step5Recordatorio24h
            formData={formData}
            updateFormData={updateFormData}
            onPrev={() => setStep(4)}
            onSubmit={handleFinalSubmit}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}

