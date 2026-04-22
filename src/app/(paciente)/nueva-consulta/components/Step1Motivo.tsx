'use client';
import React from 'react';

interface Props {
  formData: any;
  updateFormData: (newData: any) => void;
  onNext: () => void;
}

export default function Step1Motivo({ formData, updateFormData, onNext }: Props) {
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="border-b pb-2">
        <h2 className="text-xl font-bold text-gray-800">1. Motivo de la consulta</h2>
        <p className="text-sm text-gray-500">Describe brevemente por qué solicitas tu consulta.</p>
      </div>

      <div className="flex flex-col">
        <label className="text-xs font-bold text-gray-600 uppercase">Motivo</label>
        <textarea
          name="motivo_consulta"
          value={formData.motivo_consulta || ''}
          onChange={handleTextChange}
          className="mt-1 p-3 border rounded-md focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
          rows={4}
          placeholder="Ej: Quiero bajar de peso, mejorar mi alimentación, controlar glucosa, etc."
          required
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition-all shadow-md"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

