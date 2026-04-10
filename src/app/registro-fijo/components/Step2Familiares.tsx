'use client';
import React from 'react';

interface Props {
  formData: any;
  updateFormData: (newData: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Step2Familiares({ formData, updateFormData, onNext, onPrev }: Props) {
  
  const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ [e.target.name]: e.target.checked });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

  // Fila de la matriz que maneja los booleanos por familiar
  const MatrixRow = ({ label, disease }: { label: string, disease: string }) => (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="py-3 px-2 font-medium text-gray-700 text-sm">{label}</td>
      <td className="py-3 px-2 text-center">
        <input 
          type="checkbox" 
          name={`${disease}_padre`} 
          checked={formData[`${disease}_padre`] || false} 
          onChange={handleCheckChange}
          className="w-4 h-4 text-green-600 rounded"
        />
      </td>
      <td className="py-3 px-2 text-center">
        <input 
          type="checkbox" 
          name={`${disease}_madre`} 
          checked={formData[`${disease}_madre`] || false} 
          onChange={handleCheckChange}
          className="w-4 h-4 text-green-600 rounded"
        />
      </td>
      <td className="py-3 px-2">
        <input 
          type="text" 
          name={`${disease}_observaciones`} 
          value={formData[`${disease}_observaciones`] || ''} 
          onChange={handleTextChange}
          placeholder="Ej: Abuelos"
          className="w-full p-1 text-xs border rounded outline-none focus:ring-1 focus:ring-green-500"
        />
      </td>
    </tr>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="border-b pb-2">
        <h2 className="text-xl font-bold text-gray-800">2. Antecedentes Heredofamiliares</h2>
        <p className="text-sm text-gray-500">Marque las condiciones presentes en sus familiares directos.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-xs uppercase">
              <th className="py-2 px-2">Enfermedad</th>
              <th className="py-2 px-2 text-center">Padre</th>
              <th className="py-2 px-2 text-center">Madre</th>
              <th className="py-2 px-2">Otros / Observaciones</th>
            </tr>
          </thead>
          <tbody>
            <MatrixRow label="Diabetes" disease="diabetes" />
            <MatrixRow label="Sobrepeso" disease="sobrepeso" />
            <MatrixRow label="Obesidad" disease="obesidad" />
            <MatrixRow label="Hipertensión" disease="hipertension" />
          </tbody>
        </table>
      </div>

      <div className="space-y-4 pt-4">
        {/* Colesterol y Triglicéridos */}
        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-600 uppercase">Colesterol o Triglicéridos (Padre, Madre, Otros)</label>
          <input 
            type="text" 
            name="colesterol_trigliceridos" 
            value={formData.colesterol_trigliceridos || ''} 
            onChange={handleTextChange}
            className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Especifique quién y qué padece"
          />
        </div>

        {/* Sección Alergias */}
        <div className="bg-green-50 p-4 rounded-lg space-y-3 border border-green-100">
          <div className="flex items-center space-x-3">
            <input 
              type="checkbox" 
              name="tiene_alergias" 
              checked={formData.tiene_alergias || false} 
              onChange={handleCheckChange}
              className="w-5 h-5 text-green-600 rounded"
            />
            <label className="font-semibold text-gray-800">¿Existen alergias en la familia?</label>
          </div>
          {formData.tiene_alergias && (
            <textarea 
              name="alergias_especificar" 
              value={formData.alergias_especificar || ''} 
              onChange={handleTextChange}
              placeholder="Describa quién y a qué..."
              className="w-full p-2 text-sm border border-green-200 rounded-md focus:ring-2 focus:ring-green-500 outline-none"
              rows={2}
            />
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-600 uppercase">Otros Antecedentes (Cáncer, renales, etc.)</label>
          <textarea 
            name="otros_antecedentes" 
            value={formData.otros_antecedentes || ''} 
            onChange={handleTextChange}
            className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none"
            rows={2}
          />
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button onClick={onPrev} className="text-gray-500 font-semibold hover:text-gray-700 transition-colors">
          Anterior
        </button>
        <button onClick={onNext} className="bg-green-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-green-700 shadow-md">
          Siguiente
        </button>
      </div>
    </div>
  );
}