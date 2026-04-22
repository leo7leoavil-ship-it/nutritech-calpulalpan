'use client';
import React from 'react';

interface Props {
  formData: any;
  updateFormData: (newData: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Step4EstiloVida({ formData, updateFormData, onNext, onPrev }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const haceActividad = formData.actividad_fisica || '';
  const practicaDeporte = formData.practica_deporte || '';

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="border-b pb-2">
        <h2 className="text-xl font-bold text-gray-800">4. Estilo de vida</h2>
        <p className="text-sm text-gray-500">Sueño, actividad física y deporte.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-600 uppercase">Horas de sueño nocturno (24 hrs)</label>
          <select
            name="sueno_horas"
            value={formData.sueno_horas || ''}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md bg-white focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
          >
            <option value="">Seleccionar...</option>
            <option value="Menos de 6 horas">Menos de 6 horas</option>
            <option value="6 a 7 horas">6 a 7 horas</option>
            <option value="7 a 9 horas">7 a 9 horas</option>
            <option value="Más de 9 horas">Más de 9 horas</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-600 uppercase">¿Tienes problemas para conciliar el sueño?</label>
          <div className="mt-2 flex flex-wrap gap-4">
            {['Sí', 'No', 'Rara vez'].map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="sueno_problemas"
                  value={opt}
                  checked={formData.sueno_problemas === opt}
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
          <label className="text-xs font-bold text-gray-600 uppercase">
            ¿Realizas actividad física? (caminar, andar en bici, trotar)
          </label>
          <div className="mt-2 flex flex-wrap gap-4">
            {['Sí', 'No', 'Rara vez'].map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="actividad_fisica"
                  value={opt}
                  checked={haceActividad === opt}
                  onChange={(e) => {
                    handleChange(e);
                    if (e.target.value !== 'Sí') {
                      updateFormData({ ejercicio_frecuencia: '', ejercicio_tiempo: '' });
                    }
                  }}
                  className="accent-green-600 w-4 h-4"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        {haceActividad === 'Sí' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-600 uppercase">¿Con qué frecuencia a la semana?</label>
              <select
                name="ejercicio_frecuencia"
                value={formData.ejercicio_frecuencia || ''}
                onChange={handleChange}
                className="mt-1 p-2 border rounded-md bg-white focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
              >
                <option value="">Seleccionar...</option>
                <option value="1 a 2 días">1 a 2 días</option>
                <option value="3 a 4 días">3 a 4 días</option>
                <option value="5 días o más">5 días o más</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-600 uppercase">Promedio de duración por sesión</label>
              <select
                name="ejercicio_tiempo"
                value={formData.ejercicio_tiempo || ''}
                onChange={handleChange}
                className="mt-1 p-2 border rounded-md bg-white focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
              >
                <option value="">Seleccionar...</option>
                <option value="Menos de 30 minutos">Menos de 30 minutos</option>
                <option value="De 30 a 60 minutos">De 30 a 60 minutos</option>
                <option value="Más de una hora">Más de una hora</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-50 border rounded-xl p-4 space-y-4">
        <div>
          <label className="text-xs font-bold text-gray-600 uppercase">
            ¿Practicas algún deporte? (futbol, basquetbol, natación, correr)
          </label>
          <div className="mt-2 flex flex-wrap gap-4">
            {['Sí', 'No', 'Rara vez'].map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="practica_deporte"
                  value={opt}
                  checked={practicaDeporte === opt}
                  onChange={(e) => {
                    handleChange(e);
                    if (e.target.value !== 'Sí') {
                      updateFormData({
                        tipo_deporte: '',
                        frecuencia_deporte: '',
                        tiempo_deporte: '',
                      });
                    }
                  }}
                  className="accent-green-600 w-4 h-4"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        {practicaDeporte === 'Sí' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-600 uppercase">¿Cuál?</label>
              <input
                type="text"
                name="tipo_deporte"
                value={formData.tipo_deporte || ''}
                onChange={handleChange}
                className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
                placeholder="Ej: Natación"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-600 uppercase">Frecuencia semanal</label>
              <select
                name="frecuencia_deporte"
                value={formData.frecuencia_deporte || ''}
                onChange={handleChange}
                className="mt-1 p-2 border rounded-md bg-white focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
              >
                <option value="">Seleccionar...</option>
                <option value="1 a 2 días">1 a 2 días</option>
                <option value="3 a 4 días">3 a 4 días</option>
                <option value="5 días o más">5 días o más</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-600 uppercase">Duración de sesión</label>
              <select
                name="tiempo_deporte"
                value={formData.tiempo_deporte || ''}
                onChange={handleChange}
                className="mt-1 p-2 border rounded-md bg-white focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
              >
                <option value="">Seleccionar...</option>
                <option value="Menos de 30 minutos">Menos de 30 minutos</option>
                <option value="De 30 a 60 minutos">De 30 a 60 minutos</option>
                <option value="Más de una hora">Más de una hora</option>
              </select>
            </div>
          </div>
        )}
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

