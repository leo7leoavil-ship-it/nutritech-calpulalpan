export type Perfil = {
  id: string;
  nombre_completo: string | null;
  curp: string;
  sexo: string | null;
  fecha_nacimiento: string | null;
  direccion: string | null;
  ocupacion: string | null;
  telefono: string | null;
  registro_completo: boolean | null;
};

export type Consulta = {
  id: string;
  created_at: string;
  paciente_id: string;
  especialista_id: string | null;
  motivo_consulta: string | null;
  status: string;
  diagnostico_especialista: string | null;
  plan_alimenticio_resumen: string | null;
  antropometria_id: string | null;
};

export type AntecedentesFamiliares = {
  diabetes_padre: boolean | null;
  diabetes_madre: boolean | null;
  obesidad_padre: boolean | null;
  obesidad_madre: boolean | null;
  hipertension_padre: boolean | null;
  hipertension_madre: boolean | null;
  sobrepeso_padre: boolean | null;
  sobrepeso_madre: boolean | null;
  tiene_alergias: boolean | null;
  alergias_especificar: string | null;
  otros_antecedentes: string | null;
};

export type AntecedentesPatologicos = {
  padece_enfermedad: boolean | null;
  enfermedad_diagnosticada: string | null;
  toma_medicamento: boolean | null;
  nombre_medicamento: string | null;
  dosis: string | null;
};

