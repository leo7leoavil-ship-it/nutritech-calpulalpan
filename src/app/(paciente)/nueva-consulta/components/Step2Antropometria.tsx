'use client';
import React, { useMemo } from 'react';

interface Props {
  formData: any;
  updateFormData: (newData: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

function computeImc(pesoKg: string, tallaCm: string) {
  const peso = Number(pesoKg);
  const talla = Number(tallaCm);
  if (!Number.isFinite(peso) || !Number.isFinite(talla) || peso <= 0 || talla <= 0) return '';
  const tallaM = talla / 100;
  const imc = peso / (tallaM * tallaM);
  return Number.isFinite(imc) ? imc.toFixed(2) : '';
}

export default function Step2Antropometria({ formData, updateFormData, onNext, onPrev }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

  const imc = useMemo(() => computeImc(formData.peso_kg, formData.talla_cm), [formData.peso_kg, formData.talla_cm]);

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="border-b pb-2">
        <h2 className="text-xl font-bold text-gray-800">2. Antropometría</h2>
        <p className="text-sm text-gray-500">Mediciones básicas para el cálculo de IMC.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-600 uppercase">Peso (kg)</label>
          <input
            type="number"
            step="0.01"
            name="peso_kg"
            value={formData.peso_kg || ''}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
            placeholder="Ej: 70.5"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-600 uppercase">Talla (cm)</label>
          <input
            type="number"
            step="0.1"
            name="talla_cm"
            value={formData.talla_cm || ''}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
            placeholder="Ej: 175"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-600 uppercase">IMC (calculado)</label>
          <input
            type="text"
            value={imc}
            readOnly
            className="mt-1 p-2 border rounded-md bg-gray-50 text-gray-600 outline-none shadow-sm cursor-not-allowed"
            placeholder="Automático"
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

