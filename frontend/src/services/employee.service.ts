import { api } from '../api/api';
import { Employee, EmployeeCreate, EmployeeUpdate } from '../types';

export const employeeService = {
  getAll: async () => {
    const response = await api.get<{ success: boolean; data: Employee[] }>('/api/funcionarios');
    return response.data;
  },

  getByProject: async (projetoId: string) => {
    const response = await api.get<{ success: boolean; data: Employee[] }>(
      `/api/funcionarios/projeto/${projetoId}`
    );
    return response.data;
  },

  getByUser: async (usuarioId: string) => {
    const response = await api.get<{ success: boolean; data: Employee[] }>(
      `/api/funcionarios/usuario/${usuarioId}`
    );
    return response.data;
  },

  getById: async (usuarioId: string, projetoId: string) => {
    const response = await api.get<{ success: boolean; data: Employee }>(
      `/api/funcionarios/${usuarioId}/${projetoId}`
    );
    return response.data;
  },

  create: async (data: EmployeeCreate) => {
    const response = await api.post<{ success: boolean; data: Employee; message: string }>(
      '/api/funcionarios',
      data
    );
    return response.data;
  },

  update: async (usuarioId: string, projetoId: string, data: EmployeeUpdate) => {
    const response = await api.patch<{ success: boolean; data: Employee; message: string }>(
      `/api/funcionarios/${usuarioId}/${projetoId}`,
      data
    );
    return response.data;
  },

  delete: async (usuarioId: string, projetoId: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/api/funcionarios/${usuarioId}/${projetoId}`
    );
    return response.data;
  },

  grantPrivileges: async (usuarioId: string, projetoId: string, performadoPor?: string) => {
    const response = await api.patch<{ success: boolean; data: Employee; message: string }>(
      `/api/funcionarios/${usuarioId}/${projetoId}/conceder-privilegios`,
      { performadoPor }
    );
    return response.data;
  },

  removePrivileges: async (usuarioId: string, projetoId: string, performadoPor?: string) => {
    const response = await api.patch<{ success: boolean; data: Employee; message: string }>(
      `/api/funcionarios/${usuarioId}/${projetoId}/remover-privilegios`,
      { performadoPor }
    );
    return response.data;
  },
};

