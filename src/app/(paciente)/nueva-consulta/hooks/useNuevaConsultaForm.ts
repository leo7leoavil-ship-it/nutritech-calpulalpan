import { useState } from 'react';
import { NuevaConsultaFormData } from '../types';

export const useNuevaConsultaForm = (initialData: NuevaConsultaFormData) => {
  const [formData, setFormData] = useState<NuevaConsultaFormData>(initialData);

  const updateFormData = (newData: Partial<NuevaConsultaFormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const resetForm = () => setFormData(initialData);

  return {
    formData,
    updateFormData,
    resetForm,
  };
};

