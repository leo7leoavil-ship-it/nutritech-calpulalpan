'use client';
import React from 'react';

interface Props {
  formData: any;
  updateFormData: (newData: any) => void;
  onPrev: () => void;
  onSubmit: () => void;
  loading?: boolean;
}

export default function Step5Recordatorio24h({ formData, updateFormData, onPrev, onSubmit, loading }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="border-b pb-2">
        <h2 className="text-xl font-bold text-gray-800">5. Recordatorio de 24 horas</h2>
        <p className="text-sm text-gray-500">
          Detalla todo lo que consumiste ayer (desde que despertaste hasta que te dormiste).
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-600 uppercase">Desayuno (qué comiste y a qué hora)</label>
          <textarea
            name="r24_desayuno"
            value={formData.r24_desayuno || ''}
            onChange={handleChange}
            className="mt-1 p-3 border rounded-md focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
            rows={2}
            placeholder="Ej: 8:00 AM - 2 huevos con espinacas, 2 tortillas, café..."
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-600 uppercase">Colación de la mañana (si aplica)</label>
          <textarea
            name="r24_colacion_manana"
            value={formData.r24_colacion_manana || ''}
            onChange={handleChange}
            className="mt-1 p-3 border rounded-md focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
            rows={2}
            placeholder="¿Comiste algo entre el desayuno y la comida?"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-600 uppercase">Comida / Almuerzo</label>
          <textarea
            name="r24_comida"
            value={formData.r24_comida || ''}
            onChange={handleChange}
            className="mt-1 p-3 border rounded-md focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
            rows={2}
            placeholder="Plato fuerte, guarniciones y bebida..."
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-600 uppercase">Colación de la tarde (si aplica)</label>
          <textarea
            name="r24_colacion_tarde"
            value={formData.r24_colacion_tarde || ''}
            onChange={handleChange}
            className="mt-1 p-3 border rounded-md focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
            rows={2}
            placeholder="¿Algún snack o bebida por la tarde?"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-600 uppercase">Cena</label>
          <textarea
            name="r24_cena"
            value={formData.r24_cena || ''}
            onChange={handleChange}
            className="mt-1 p-3 border rounded-md focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
            rows={2}
            placeholder="Qué consumiste antes de dormir y a qué hora..."
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-600 uppercase">Extras / “Picoteo”</label>
          <textarea
            name="r24_extras"
            value={formData.r24_extras || ''}
            onChange={handleChange}
            className="mt-1 p-3 border rounded-md focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
            rows={2}
            placeholder="¿Consumiste algo fuera de estos horarios?"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-600 uppercase">¿El día de ayer fue típico o habitual?</label>
          <div className="mt-2 flex flex-col gap-3 text-sm text-gray-700">
            {[
              'Sí, fue un día normal',
              'No, hubo evento/fiesta/viaje',
              'No, estuve enfermo o sin apetito',
            ].map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="es_dia_tipico"
                  value={opt}
                  checked={formData.es_dia_tipico === opt}
                  onChange={handleChange}
                  className="accent-green-600 w-4 h-4"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-600 uppercase">¿Qué tipo de grasa se usó para preparar tus alimentos?</label>
          <div className="mt-2 flex flex-col gap-3 text-sm text-gray-700">
            {[
              'Aceite vegetal / Oliva',
              'Mantequilla / Manteca',
              'Sin grasa (vapor/air fryer)',
              'No lo sé',
            ].map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="grasas_frecuentes"
                  value={opt}
                  checked={formData.grasas_frecuentes === opt}
                  onChange={handleChange}
                  className="accent-green-600 w-4 h-4"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col">
          <label className="text-xs font-bold text-gray-600 uppercase">Cantidad de agua simple que tomaste ayer</label>
          <select
            name="r24_agua_litros"
            value={formData.r24_agua_litros || ''}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md bg-white focus:ring-2 focus:ring-green-500 outline-none shadow-sm w-full md:w-1/2"
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
      </div>

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
          {loading ? 'Guardando...' : 'Finalizar y Guardar'}
        </button>
      </div>
    </div>
  );
}

