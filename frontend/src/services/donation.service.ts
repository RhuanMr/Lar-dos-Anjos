import { api } from '../api/api';
import { Donation, DonationCreate, DonationUpdate } from '../types/Donation';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const donationService = {
  // Listar todas as doações
  getAll: async (): Promise<Donation[]> => {
    const response = await api.get<ApiResponse<Donation[]>>('/doacoes');
    return response.data.data || [];
  },

  // Listar doações por projeto
  getByProject: async (projectId: string): Promise<Donation[]> => {
    const response = await api.get<ApiResponse<Donation[]>>(
      `/doacoes/projeto/${projectId}`
    );
    return response.data.data || [];
  },

  // Listar doações por usuário
  getByUser: async (userId: string): Promise<Donation[]> => {
    const response = await api.get<ApiResponse<Donation[]>>(
      `/doacoes/usuario/${userId}`
    );
    return response.data.data || [];
  },

  // Buscar doação por ID
  getById: async (id: string): Promise<Donation> => {
    const response = await api.get<ApiResponse<Donation>>(`/doacoes/${id}`);
    if (!response.data.data) {
      throw new Error('Doação não encontrada');
    }
    return response.data.data;
  },

  // Criar doação
  create: async (data: DonationCreate): Promise<Donation> => {
    const response = await api.post<ApiResponse<Donation>>('/doacoes', data);
    if (!response.data.data) {
      throw new Error(response.data.error || 'Erro ao criar doação');
    }
    return response.data.data;
  },

  // Atualizar doação
  update: async (id: string, data: DonationUpdate): Promise<Donation> => {
    const response = await api.patch<ApiResponse<Donation>>(
      `/doacoes/${id}`,
      data
    );
    if (!response.data.data) {
      throw new Error(response.data.error || 'Erro ao atualizar doação');
    }
    return response.data.data;
  },

  // Deletar doação
  delete: async (id: string): Promise<void> => {
    await api.delete<ApiResponse>(`/doacoes/${id}`);
  },
};

