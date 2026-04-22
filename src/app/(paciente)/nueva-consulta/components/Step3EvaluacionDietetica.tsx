'use client';
import React from 'react';

interface Props {
  formData: any;
  updateFormData: (newData: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Step3EvaluacionDietetica({ formData, updateFormData, onNext, onPrev }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const compania = formData.compania_comida_tipo || '';
  const usaDispositivos = formData.usa_dispositivos === true;

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="border-b pb-2">
        <h2 className="text-xl font-bold text-gray-800">3. Evaluación dietética</h2>
        <p className="text-sm text-gray-500">Hábitos relacionados con alimentación e hidratación.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-600 uppercase">¿Cuántas comidas realizas al día?</label>
          <select
            name="comidas_dia"
            value={formData.comidas_dia || ''}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md bg-white focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
          >
            <option value="">Seleccionar...</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4 o más">4 o más</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-600 uppercase">¿Cuántos litros de agua tomas al día?</label>
          <select
            name="agua_litros"
            value={formData.agua_litros || ''}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md bg-white focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
          >
            <option value="">Seleccionar...</option>
            <option value="Nada">Nada</option>
            <option value="Menos de ½ Litro">Menos de ½ Litro</option>
            <option value="Entre ½ y 1 Litro">Entre ½ y 1 Litro</option>
            <option value="Entre 1 y 1 ½ Litros">Entre 1 y 1 ½ Litros</option>
            <option value="Entre 1 ½ y 2 Litros">Entre 1 ½ y 2 Litros</option>
            <option value="Entre 2 y 3 Litros">Entre 2 y 3 Litros</option>
            <option value="3 Litros o más">3 Litros o más</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-600 uppercase">¿Cómo consideras tu apetito?</label>
          <div className="mt-2 flex gap-4">
            {['Bueno', 'Malo', 'Regular'].map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="nivel_apetito"
                  value={opt}
                  checked={formData.nivel_apetito === opt}
                  onChange={handleChange}
                  className="accent-green-600 w-4 h-4"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-600 uppercase">¿A qué hora del día sientes mayor apetito?</label>
          <div className="mt-2 flex flex-wrap gap-4">
            {['Mañana', 'Medio día', 'Tarde', 'Noche'].map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="hora_max_apetito"
                  value={opt}
                  checked={formData.hora_max_apetito === opt}
                  onChange={handleChange}
                  className="accent-green-600 w-4 h-4"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border rounded-xl p-4 space-y-4">
        <div>
          <label className="text-xs font-bold text-gray-600 uppercase">¿Comes acompañado o solo?</label>
          <div className="mt-2 flex gap-6">
            {['Solo', 'Acompañado'].map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="compania_comida_tipo"
                  value={opt}
                  checked={compania === opt}
                  onChange={handleChange}
                  className="accent-green-600 w-4 h-4"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        {(compania === 'Solo' || compania === 'Acompañado') && (
          <div className="animate-in fade-in slide-in-from-top-2">
            <label className="text-xs font-bold text-gray-600 uppercase">
              {compania === 'Solo' ? '¿Por qué?' : '¿Con quién?'}
            </label>
            <input
              type="text"
              name="compania_comida_detalle"
              value={formData.compania_comida_detalle || ''}
              onChange={handleChange}
              className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none shadow-sm w-full"
              placeholder={compania === 'Solo' ? 'Cuéntanos el motivo...' : 'Ej: Familia, Pareja, Amigos...'}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-600 uppercase">¿Cuánto tiempo dedicas al consumo de alimentos?</label>
          <select
            name="tiempo_comida_min"
            value={formData.tiempo_comida_min || ''}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md bg-white focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
          >
            <option value="">Seleccionar...</option>
            <option value="15 min">15 min</option>
            <option value="20 min">20 min</option>
            <option value="30 min">30 min</option>
            <option value="45 min">45 min</option>
            <option value="1 hora o más">1 hora o más</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-600 uppercase">¿Ocupas algún dispositivo de entretenimiento?</label>
          <div className="mt-2 flex gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="usa_dispositivos"
                value="true"
                checked={usaDispositivos}
                onChange={() => updateFormData({ usa_dispositivos: true })}
                className="accent-green-600 w-4 h-4"
              />
              Sí
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="usa_dispositivos"
                value="false"
                checked={!usaDispositivos}
                onChange={() => updateFormData({ usa_dispositivos: false, dispositivos_detalle: '' })}
                className="accent-green-600 w-4 h-4"
              />
              No
            </label>
          </div>
          {usaDispositivos && (
            <input
              type="text"
              name="dispositivos_detalle"
              value={formData.dispositivos_detalle || ''}
              onChange={handleChange}
              className="mt-3 p-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
              placeholder="¿Cuáles? (Celular, TV, etc.)"
            />
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-600 uppercase">¿Agregas sal a la comida ya preparada?</label>
          <div className="mt-2 flex gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="sal_adicional"
                value="true"
                checked={formData.sal_adicional === true}
                onChange={() => updateFormData({ sal_adicional: true })}
                className="accent-green-600 w-4 h-4"
              />
              Sí
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="sal_adicional"
                value="false"
                checked={formData.sal_adicional === false}
                onChange={() => updateFormData({ sal_adicional: false })}
                className="accent-green-600 w-4 h-4"
              />
              No
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-600 uppercase">Alimentos preferidos (separar por comas)</label>
          <textarea
            name="preferencias_positivas"
            value={formData.preferencias_positivas || ''}
            onChange={handleChange}
            className="mt-1 p-3 border rounded-md focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
            rows={2}
            placeholder="Ej: pollo, tacos, chilaquiles, jamón"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-600 uppercase">Alimentos que no te agradan (separar por comas)</label>
          <textarea
            name="preferencias_negativas"
            value={formData.preferencias_negativas || ''}
            onChange={handleChange}
            className="mt-1 p-3 border rounded-md focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
            rows={2}
            placeholder="Ej: pescado, lentejas, papaya"
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

