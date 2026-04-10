import React from 'react';

interface Props {
  data: any;
  update: (newData: any) => void;
  onNext: () => void;
}

export default function DatosIdentificacion({ data, update, onNext }: Props) {
  
  // Manejador local para cambios en inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    update({ [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl font-bold text-gray-800">Datos de Identificación</h2>
        <p className="text-gray-500 text-sm">Información oficial para tu expediente clínico en Calpulalpan.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre Completo */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Nombre Completo</label>
          <input
            type="text"
            name="nombre_completo"
            value={data.nombre_completo}
            onChange={handleChange}
            placeholder="Ej. Juan Pérez López"
            className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none"
            required
          />
        </div>

        {/* CURP */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">CURP</label>
          <input
            type="text"
            name="curp"
            value={data.curp}
            onChange={handleChange}
            maxLength={18}
            className="mt-1 p-2 border rounded-md uppercase focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="XXXX000000XXXXXX00"
          />
        </div>

        {/* Sexo */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Sexo</label>
          <select
            name="sexo"
            value={data.sexo}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md bg-white focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="">Selecciona una opción</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        {/* Fecha de Nacimiento */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={data.fecha_nacimiento}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {/* Teléfono */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Teléfono</label>
          <input
            type="tel"
            name="telefono"
            value={data.telefono}
            onChange={handleChange}
            placeholder="749 000 0000"
            className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {/* Ocupación */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Ocupación</label>
          <input
            type="text"
            name="ocupacion"
            value={data.ocupacion}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>
      </div>

      {/* Dirección (Full Width) */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700">Dirección Completa</label>
        <input
          type="text"
          name="direccion"
          value={data.direccion}
          onChange={handleChange}
          placeholder="Calle, Número, Colonia, Calpulalpan"
          className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none"
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm"
        >
          Siguiente: Antecedentes
        </button>
      </div>
    </div>
  );
}