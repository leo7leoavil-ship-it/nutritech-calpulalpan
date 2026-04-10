import React from 'react';

interface Props {
  data: any;
  update: (newData: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function AntecedentesFamiliares({ data, update, onNext, onPrev }: Props) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    update({ [e.target.name]: value });
  };

  // Helper para renderizar las filas de la matriz de salud
  const HealthRow = ({ label, name, value }: { label: string, name: string, value: string }) => (
    <div className="flex flex-col space-y-2 border-b border-gray-100 pb-4">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={handleChange}
        placeholder="Ej: Padre y abuelo materno"
        className="p-2 text-sm border rounded-md focus:ring-2 focus:ring-green-500 outline-none resize-none"
        rows={2}
      />
    </div>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <header>
        <h2 className="text-2xl font-bold text-gray-800">Antecedentes Heredofamiliares</h2>
        <p className="text-gray-500 text-sm">Indique qué familiares padecen o padecieron las siguientes condiciones.</p>
      </header>

      <div className="space-y-4">
        <HealthRow 
          label="Diabetes" 
          name="diabetes_observaciones" 
          value={data.diabetes_observaciones} 
        />
        <HealthRow 
          label="Sobrepeso / Obesidad" 
          name="sobrepeso_observaciones" 
          value={data.sobrepeso_observaciones} 
        />
        <HealthRow 
          label="Hipertensión Arterial" 
          name="hipertension_observaciones" 
          value={data.hipertension_observaciones} 
        />
        <HealthRow 
          label="Altos niveles de colesterol o triglicéridos" 
          name="colesterol_trigliceridos" 
          value={data.colesterol_trigliceridos} 
        />

        {/* Sección de Alergias con lógica condicional */}
        <div className="bg-green-50 p-4 rounded-lg space-y-3">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="tiene_alergias"
              checked={data.tiene_alergias}
              onChange={handleChange}
              className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
            />
            <label className="font-medium text-gray-800">¿Tiene alergias alimentarias o medicamentosas?</label>
          </div>
          
          {data.tiene_alergias && (
            <div className="animate-in zoom-in duration-300">
              <label className="text-xs font-bold text-green-700 uppercase">Especificar alergias:</label>
              <textarea
                name="alergias_especificar"
                value={data.alergias_especificar}
                onChange={handleChange}
                placeholder="Describa a qué es alérgico..."
                className="w-full mt-1 p-2 border border-green-200 rounded-md focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
          )}
        </div>

        <HealthRow 
          label="Otros antecedentes (Cáncer, enfermedades renales, etc.)" 
          name="otros_antecedentes" 
          value={data.otros_antecedentes} 
        />
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onPrev}
          className="text-gray-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          Anterior
        </button>
        <button
          onClick={onNext}
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm"
        >
          Siguiente: Salud Personal
        </button>
      </div>
    </div>
  );
}