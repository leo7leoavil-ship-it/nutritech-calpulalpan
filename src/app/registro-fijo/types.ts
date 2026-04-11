export interface RegistroFormData {
  curp: string;
  nombre_completo: string;
  sexo: string;
  fecha_nacimiento: string; 
  direccion: string;
  ocupacion: string;
  telefono: string;
  diabetes: boolean;
  sobrepeso: boolean;
  obesidad: boolean;
  hipertension: boolean;
  alergias: boolean;
  padre: string;
  madre: string;
  otros: string;
  especificar_alergias: string;
  enfermedad_diagnosticada: string;
  toma_medicamento: boolean;
  nombre_medicamento: string;
  dosis: string;
}

// Esto fuerza a TS a tratar el archivo como un módulo
export { };
