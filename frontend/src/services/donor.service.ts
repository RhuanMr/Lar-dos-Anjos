import { api } from '../api/api';
import { Donor, DonorCreate, DonorUpdate } from '../types/Donor';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const donorService = {
  // Listar todos os doadores
  getAll: async (): Promise<Donor[]> => {
    const response = await api.get<ApiResponse<Donor[]>>('/doadores');
    return response.data.data || [];
  },

  // Listar doadores por projeto
  getByProject: async (projectId: string): Promise<Donor[]> => {
    const response = await api.get<ApiResponse<Donor[]>>(
      `/doadores/projeto/${projectId}`
    );
    return response.data.data || [];
  },

  // Listar doadores por usuário
  getByUser: async (userId: string): Promise<Donor[]> => {
    const response = await api.get<ApiResponse<Donor[]>>(
      `/doadores/usuario/${userId}`
    );
    return response.data.data || [];
  },

  // Buscar doador específico
  getById: async (usuarioId: string, projetoId: string): Promise<Donor> => {
    const response = await api.get<ApiResponse<Donor>>(
      `/doadores/${usuarioId}/${projetoId}`
    );
    if (!response.data.data) {
      throw new Error('Doador não encontrado');
    }
    return response.data.data;
  },

  // Criar doador
  create: async (data: DonorCreate): Promise<Donor> => {
    const response = await api.post<ApiResponse<Donor>>('/doadores', data);
    if (!response.data.data) {
      throw new Error(response.data.error || 'Erro ao criar doador');
    }
    return response.data.data;
  },

  // Atualizar doador
  update: async (
    usuarioId: string,
    projetoId: string,
    data: DonorUpdate
  ): Promise<Donor> => {
    const response = await api.patch<ApiResponse<Donor>>(
      `/doadores/${usuarioId}/${projetoId}`,
      data
    );
    if (!response.data.data) {
      throw new Error(response.data.error || 'Erro ao atualizar doador');
    }
    return response.data.data;
  },

  // Deletar doador
  delete: async (usuarioId: string, projetoId: string): Promise<void> => {
    await api.delete<ApiResponse>(`/doadores/${usuarioId}/${projetoId}`);
  },
};

