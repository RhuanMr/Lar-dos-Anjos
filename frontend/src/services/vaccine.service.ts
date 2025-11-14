import { api } from '../api/api';
import { Vaccine, VaccineCreate, VaccineUpdate } from '../types';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const vaccineService = {
  getByAnimal: async (animalId: string): Promise<Vaccine[]> => {
    const response = await api.get<ApiResponse<Vaccine[]>>(
      `/vacinas/animal/${animalId}`
    );
    return response.data.data || [];
  },

  create: async (data: VaccineCreate): Promise<Vaccine> => {
    const response = await api.post<ApiResponse<Vaccine>>('/vacinas', data);
    if (!response.data.data) {
      throw new Error(response.data.error || 'Erro ao cadastrar vacina');
    }
    return response.data.data;
  },

  update: async (id: string, data: VaccineUpdate): Promise<Vaccine> => {
    const response = await api.patch<ApiResponse<Vaccine>>(
      `/vacinas/${id}`,
      data
    );
    if (!response.data.data) {
      throw new Error(response.data.error || 'Erro ao atualizar vacina');
    }
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete<ApiResponse>(`/vacinas/${id}`);
  },
};
