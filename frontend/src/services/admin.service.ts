import { api } from '../api/api';
import { Admin, AdminCreate, AdminUpdate } from '../types/Admin';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const adminService = {
  // Listar todos os administradores
  getAll: async (): Promise<Admin[]> => {
    const response = await api.get<ApiResponse<Admin[]>>('/administradores');
    return response.data.data || [];
  },

  // Listar administradores por projeto
  getByProject: async (projectId: string): Promise<Admin[]> => {
    const response = await api.get<ApiResponse<Admin[]>>(
      `/administradores/projeto/${projectId}`
    );
    return response.data.data || [];
  },

  // Listar administradores por usuário
  getByUser: async (userId: string): Promise<Admin[]> => {
    const response = await api.get<ApiResponse<Admin[]>>(
      `/administradores/usuario/${userId}`
    );
    return response.data.data || [];
  },

  // Buscar administrador específico
  getById: async (
    userId: string,
    projectId: string
  ): Promise<Admin | null> => {
    try {
      const response = await api.get<ApiResponse<Admin>>(
        `/administradores/${userId}/${projectId}`
      );
      return response.data.data || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Criar administrador
  create: async (data: AdminCreate): Promise<Admin> => {
    const response = await api.post<ApiResponse<Admin>>(
      '/administradores',
      data
    );
    return response.data.data!;
  },

  // Atualizar administrador
  update: async (
    userId: string,
    projectId: string,
    data: AdminUpdate
  ): Promise<Admin> => {
    const response = await api.patch<ApiResponse<Admin>>(
      `/administradores/${userId}/${projectId}`,
      data
    );
    return response.data.data!;
  },

  // Deletar administrador
  delete: async (userId: string, projectId: string): Promise<void> => {
    await api.delete<ApiResponse>(`/administradores/${userId}/${projectId}`);
  },
};

