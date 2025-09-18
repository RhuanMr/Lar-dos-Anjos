import { api } from './api';
import { Vaccine, VaccineForm, ApiResponse, PaginatedResponse } from '../types';

export interface VaccinationReport {
  total_vaccines: number;
  unique_animals_vaccinated: number;
  vaccines_by_type: Array<{
    name: string;
    count: number;
    animals: Array<{
      animal_id: string;
      animal_name: string;
      date: string;
      dose: number;
    }>;
  }>;
  period: {
    start_date: string | null;
    end_date: string | null;
  };
}

export interface UpcomingVaccines {
  upcoming_vaccines: Vaccine[];
  count: number;
  period_days: number;
}

export const vaccineService = {
  // Listar vacinas de um animal
  async listByAnimal(animal_id: string, page = 1, limit = 20): Promise<PaginatedResponse<Vaccine>> {
    const response = await api.get(`/vaccines/animal/${animal_id}`, {
      params: { page, limit }
    });
    return response.data;
  },

  // Buscar vacina por ID
  async getById(id: string): Promise<ApiResponse<Vaccine>> {
    const response = await api.get(`/vaccines/${id}`);
    return response.data;
  },

  // Adicionar nova vacina
  async create(data: VaccineForm): Promise<ApiResponse<Vaccine>> {
    const response = await api.post('/vaccines', data);
    return response.data;
  },

  // Atualizar vacina
  async update(id: string, data: Partial<VaccineForm>): Promise<ApiResponse<Vaccine>> {
    const response = await api.put(`/vaccines/${id}`, data);
    return response.data;
  },

  // Deletar vacina
  async delete(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete(`/vaccines/${id}`);
    return response.data;
  },

  // Obter relatório de vacinação de uma organização
  async getVaccinationReport(
    project_id: string, 
    start_date?: string, 
    end_date?: string
  ): Promise<ApiResponse<VaccinationReport>> {
    const response = await api.get(`/vaccines/organization/${project_id}/report`, {
      params: { start_date, end_date }
    });
    return response.data;
  },

  // Obter vacinas próximas do vencimento
  async getUpcomingVaccines(
    project_id: string, 
    days = 30
  ): Promise<ApiResponse<UpcomingVaccines>> {
    const response = await api.get(`/vaccines/organization/${project_id}/upcoming`, {
      params: { days }
    });
    return response.data;
  }
};
