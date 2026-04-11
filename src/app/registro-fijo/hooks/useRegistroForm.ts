import { useState } from 'react';
import { RegistroFormData } from '../types';

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