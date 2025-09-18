import { api } from './api';
import { Animal, AnimalForm, AnimalHistory, ApiResponse, PaginatedResponse } from '../types';

export interface AnimalListParams {
  project_id: string;
  status?: string;
  especie?: string;
  page?: number;
  limit?: number;
}

export interface AnimalStats {
  total: number;
  by_status: Record<string, number>;
  by_species: Record<string, number>;
  percentages: {
    disponivel: number;
    adotado: number;
    cuidados_especiais: number;
    falecido: number;
  };
}

export const animalService = {
  // Listar animais de uma organização
  async list(params: AnimalListParams): Promise<PaginatedResponse<Animal>> {
    const { project_id, ...queryParams } = params;
    const response = await api.get(`/animals/organization/${project_id}`, {
      params: queryParams
    });
    return response.data;
  },

  // Buscar animal por ID
  async getById(id: string): Promise<ApiResponse<Animal>> {
    const response = await api.get(`/animals/${id}`);
    return response.data;
  },

  // Criar novo animal
  async create(data: AnimalForm): Promise<ApiResponse<Animal>> {
    const response = await api.post('/animals', data);
    return response.data;
  },

  // Atualizar animal
  async update(id: string, data: Partial<AnimalForm>): Promise<ApiResponse<Animal>> {
    const response = await api.put(`/animals/${id}`, data);
    return response.data;
  },

  // Atualizar status do animal
  async updateStatus(id: string, status: string, tutor_id?: string, observacoes?: string): Promise<ApiResponse<Animal>> {
    const response = await api.put(`/animals/${id}/status`, {
      status,
      tutor_id,
      observacoes
    });
    return response.data;
  },

  // Upload de fotos
  async uploadPhotos(id: string, files: FileList): Promise<ApiResponse<{ animal: Animal; uploaded_photos: string[] }>> {
    const formData = new FormData();
    
    Array.from(files).forEach((file) => {
      formData.append('photos', file);
    });

    const response = await api.post(`/animals/${id}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Buscar histórico do animal
  async getHistory(id: string, page = 1, limit = 20): Promise<PaginatedResponse<AnimalHistory>> {
    const response = await api.get(`/animals/${id}/history`, {
      params: { page, limit }
    });
    return response.data;
  },

  // Deletar animal (soft delete)
  async delete(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete(`/animals/${id}`);
    return response.data;
  },

  // Obter estatísticas de animais
  async getStats(project_id: string): Promise<ApiResponse<AnimalStats>> {
    const response = await api.get(`/animals/organization/${project_id}/stats`);
    return response.data;
  },

  // Buscar animais disponíveis para adoção
  async getAvailableForAdoption(project_id: string, especie?: string): Promise<PaginatedResponse<Animal>> {
    return this.list({
      project_id,
      status: 'disponivel',
      especie,
      limit: 50
    });
  },

  // Buscar animais adotados
  async getAdopted(project_id: string, page = 1, limit = 10): Promise<PaginatedResponse<Animal>> {
    return this.list({
      project_id,
      status: 'adotado',
      page,
      limit
    });
  }
};
