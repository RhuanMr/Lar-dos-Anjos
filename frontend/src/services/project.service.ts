import { api } from '../api/api';
import { Project, ProjectDetails } from '../types/Project';

export interface ProjectCreate {
  nome: string;
  endereco: string; // Campo temporário - será armazenado na tabela address
  numero?: string; // Campo temporário - será armazenado na tabela address
  complemento?: string; // Campo temporário - será armazenado na tabela address
  bairro: string; // Campo temporário - será armazenado na tabela address
  cidade: string; // Campo temporário - será armazenado na tabela address
  uf: string; // Campo temporário - será armazenado na tabela address
  cep: string; // Campo temporário - será armazenado na tabela address
  instagram?: string;
  telefone?: string;
  email?: string;
}

export const projectService = {
  getAll: async () => {
    const response = await api.get<{ success: boolean; data: Project[] }>('/projetos');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: ProjectDetails }>(
      `/projetos/${id}`
    );
    return response.data;
  },

  create: async (data: ProjectCreate) => {
    const response = await api.post<{ success: boolean; data: Project; message: string }>(
      '/projetos',
      data
    );
    return response.data;
  },

  update: async (id: string, data: Partial<ProjectCreate>) => {
    const response = await api.patch<{
      success: boolean;
      data: ProjectDetails;
      message: string;
    }>(`/projetos/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/projetos/${id}`);
    return response.data;
  },
};

