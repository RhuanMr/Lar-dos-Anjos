import { api } from '../api/api';
import {
  MedicalCase,
  MedicalCaseCreate,
  MedicalCaseUpdate,
} from '../types';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const medicalCaseService = {
  getByAnimal: async (animalId: string): Promise<MedicalCase[]> => {
    const response = await api.get<ApiResponse<MedicalCase[]>>(
      `/casos-medicos/animal/${animalId}`
    );
    return response.data.data || [];
  },

  create: async (data: MedicalCaseCreate): Promise<MedicalCase> => {
    const response = await api.post<ApiResponse<MedicalCase>>(
      '/casos-medicos',
      data
    );
    if (!response.data.data) {
      throw new Error(response.data.error || 'Erro ao criar caso médico');
    }
    return response.data.data;
  },

  update: async (
    id: string,
    data: MedicalCaseUpdate
  ): Promise<MedicalCase> => {
    const response = await api.patch<ApiResponse<MedicalCase>>(
      `/casos-medicos/${id}`,
      data
    );
    if (!response.data.data) {
      throw new Error(response.data.error || 'Erro ao atualizar caso médico');
    }
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete<ApiResponse>(`/casos-medicos/${id}`);
  },
};
