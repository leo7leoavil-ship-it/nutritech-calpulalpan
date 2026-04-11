export interface RegistroFormData {
  // Tabla: perfiles
  curp: string;
  nombre_completo: string;
  sexo: string;
  fecha_nacimiento: string; 
  direccion: string;
  ocupacion: string;
  telefono: string;

  // Tabla: antecedentes_familiares (Matriz y observaciones)
  diabetes_padre: boolean;
  diabetes_madre: boolean;
  diabetes_observaciones: string;
  sobrepeso_padre: boolean;
  sobrepeso_madre: boolean;
  sobrepeso_observaciones: string;
  obesidad_padre: boolean;
  obesidad_madre: boolean;
  obesidad_observaciones: string;
  hipertension_padre: boolean;
  hipertension_madre: boolean;
  hipertension_observaciones: string;
  colesterol_trigliceridos: string;
  tiene_alergias: boolean;
  alergias_especificar: string;
  otros_antecedentes: string;

  // Tabla: antecedentes_patologicos
  padece_enfermedad: boolean;
  enfermedad_diagnosticada: string;
  toma_medicamento: boolean;
  nombre_medicamento: string;
  dosis: string;
}

export { };
