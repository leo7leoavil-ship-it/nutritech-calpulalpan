'use client';
import React from 'react';

interface Props {
  formData: any;
  updateFormData: (newData: any) => void;
  onPrev: () => void;
  onSubmit: () => void;
  loading?: boolean; // Para mostrar estado de carga en el botón final
}

export default function Step3Patologicos({ formData, updateFormData, onPrev, onSubmit, loading }: Props) {
  
  const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ [e.target.name]: e.target.checked });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="border-b pb-2">
        <h2 className="text-xl font-bold text-gray-800">3. Antecedentes Personales Patológicos</h2>
        <p className="text-sm text-gray-500">Información sobre su estado de salud actual y tratamientos médicos.</p>
      </div>

      <div className="space-y-6">
        {/* Sección: Enfermedades Diagnosticadas */}
        <div className={`p-4 rounded-xl border transition-all ${formData.padece_enfermedad ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center space-x-3 mb-4">
            <input
              type="checkbox"
              name="padece_enfermedad"
              checked={formData.padece_enfermedad || false}
              onChange={handleCheckChange}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <label className="font-bold text-gray-700">¿Padeces alguna enfermedad diagnosticada?</label>
          </div>

          {formData.padece_enfermedad && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-bold text-blue-700 uppercase">Especificar enfermedad(es)</label>
              <textarea
                name="enfermedad_diagnosticada"
                value={formData.enfermedad_diagnosticada || ''}
                onChange={handleTextChange}
                placeholder="Ej: Hipotiroidismo, Gastritis, Hipertensión, etc."
                className="w-full mt-1 p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Sección: Medicamentos */}
        <div className={`p-4 rounded-xl border transition-all ${formData.toma_medicamento ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center space-x-3 mb-4">
            <input
              type="checkbox"
              name="toma_medicamento"
              checked={formData.toma_medicamento || false}
              onChange={handleCheckChange}
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
            />
            <label className="font-bold text-gray-700">¿Tomas algún medicamento actualmente?</label>
          </div>

          {formData.toma_medicamento && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-purple-700 uppercase">Nombre del Medicamento</label>
                <input
                  type="text"
                  name="nombre_medicamento"
                  value={formData.nombre_medicamento || ''}
                  onChange={handleTextChange}
                  placeholder="Ej: Metformina"
                  className="mt-1 p-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none shadow-sm"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-purple-700 uppercase">Dosis y Frecuencia</label>
                <input
                  type="text"
                  name="dosis"
                  value={formData.dosis || ''}
                  onChange={handleTextChange}
                  placeholder="Ej: 500mg cada 12 horas"
                  className="mt-1 p-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none shadow-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navegación Final */}
      <div className="flex justify-between items-center pt-8 border-t">
        <button
          onClick={onPrev}
          disabled={loading}
          className="text-gray-500 font-semibold hover:text-gray-700 transition-colors disabled:opacity-50"
        >
          Anterior
        </button>
        
        <button
          onClick={onSubmit}
          disabled={loading}
          className={`
            relative overflow-hidden px-10 py-3 rounded-xl font-bold text-white shadow-lg transition-all transform
            ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:scale-105 active:scale-95'}
          `}
        >
          {loading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </div>
          ) : (
            "Finalizar y Guardar"
          )}
        </button>
      </div>
    </div>
  );
}