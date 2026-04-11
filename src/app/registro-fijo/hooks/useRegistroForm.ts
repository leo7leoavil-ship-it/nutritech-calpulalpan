import { useState } from 'react';
import { RegistroFormData } from '../page'; // Importamos la interfaz que ya definiste

export const useRegistroForm = (initialData: RegistroFormData) => {
  const [formData, setFormData] = useState<RegistroFormData>(initialData);

  const updateFormData = (newData: Partial<RegistroFormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const resetForm = () => setFormData(initialData);

  return {
    formData,
    updateFormData,
    resetForm,
  };
};