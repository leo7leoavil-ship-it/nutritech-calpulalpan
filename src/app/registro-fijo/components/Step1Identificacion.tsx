'use client';
import React from 'react';

interface Props {
  formData: any;
  updateFormData: (newData: any) => void;
  onNext: () => void;
}

export default function Step1Identificacion({ formData, updateFormData, onNext }: Props) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="border-b pb-2">
        <h2 className="text-xl font-bold text-gray-800">1. Datos de Identificación</h2>
        <p className="text-sm text-gray-500">Información básica del expediente.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CURP - Primary Key en tu DB */}
        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-600 uppercase">CURP</label>
          <input
            type="text"
            name="curp"
            value={formData.curp}
            onChange={handleChange}
            maxLength={18}
            className="mt-1 p-2 border rounded-md uppercase focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
            placeholder="Introduce tu CURP"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-600 uppercase">Nombre Completo</label>
          <input
            type="text"
            name="nombre_completo"
            value={formData.nombre_completo}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
            placeholder="Nombre y Apellidos"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-600 uppercase">Sexo</label>
          <select
            name="sexo"
            value={formData.sexo}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md bg-white focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
          >
            <option value="">Seleccionar...</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        {/* Cambiado a Año/Fecha de nacimiento según tu diccionario */}
        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-600 uppercase">Fecha de Nacimiento</label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-600 uppercase">Ocupación</label>
          <input
            type="text"
            name="ocupacion"
            value={formData.ocupacion}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-600 uppercase">Teléfono</label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
            placeholder="10 dígitos"
          />
        </div>
      </div>

      <div className="flex flex-col">
        <label className="text-xs font-bold text-gray-600 uppercase">Dirección</label>
        <input
          type="text"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
          placeholder="Calle, número, colonia"
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