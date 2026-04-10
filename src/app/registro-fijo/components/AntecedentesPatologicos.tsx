import React from 'react';

interface Props {
  data: any;
  update: (newData: any) => void;
  onPrev: () => void;
  onSubmit: () => void;
}

export default function AntecedentesPatologicos({ data, update, onPrev, onSubmit }: Props) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    update({ [e.target.name]: value });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <header>
        <h2 className="text-2xl font-bold text-gray-800">Antecedentes Personales Patológicos</h2>
        <p className="text-gray-500 text-sm">Información sobre tu estado de salud actual y tratamientos.</p>
      </header>

      <div className="space-y-6">
        {/* Sección: Enfermedad Diagnosticada */}
        <div className="bg-blue-50 p-4 rounded-lg space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="padece_enfermedad"
              checked={data.padece_enfermedad}
              onChange={handleChange}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <label className="font-medium text-gray-800">¿Padeces alguna enfermedad diagnosticada?</label>
          </div>

          {data.padece_enfermedad && (
            <div className="animate-in fade-in duration-300">
              <label className="text-xs font-bold text-blue-700 uppercase">Especificar enfermedad(es):</label>
              <textarea
                name="enfermedad_diagnosticada"
                value={data.enfermedad_diagnosticada}
                onChange={handleChange}
                placeholder="Ej: Hipotiroidismo, Gastritis, etc."
                className="w-full mt-1 p-2 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                rows={2}
              />
            </div>
          )}
        </div>

        {/* Sección: Medicamentos */}
        <div className="bg-purple-50 p-4 rounded-lg space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="toma_medicamento"
              checked={data.toma_medicamento}
              onChange={handleChange}
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
            />
            <label className="font-medium text-gray-800">¿Tomas algún medicamento actualmente?</label>
          </div>

          {data.toma_medicamento && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-purple-700 uppercase">Nombre del medicamento:</label>
                <input
                  type="text"
                  name="nombre_medicamento"
                  value={data.nombre_medicamento}
                  onChange={handleChange}
                  placeholder="Ej: Metformina"
                  className="mt-1 p-2 border border-purple-200 rounded-md focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-purple-700 uppercase">Dosis y frecuencia:</label>
                <input
                  type="text"
                  name="dosis"
                  value={data.dosis}
                  onChange={handleChange}
                  placeholder="Ej: 500mg cada 12 horas"
                  className="mt-1 p-2 border border-purple-200 rounded-md focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onPrev}
          className="text-gray-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          Anterior
        </button>
        <button
          onClick={onSubmit}
          className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition-all shadow-lg transform hover:scale-105"
        >
          Finalizar Registro
        </button>
      </div>
    </div>
  );
}