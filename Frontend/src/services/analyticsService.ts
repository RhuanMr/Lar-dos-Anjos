import { api } from './api';
import { ApiResponse } from '../types';

export interface VisitStats {
  total_visits: number;
  unique_visitors: number;
  visits_by_page: Record<string, number>;
  visits_by_period: Record<string, number>;
  recent_visits: Array<{
    id: string;
    page_type: string;
    visited_at: string;
    user_id?: string;
    is_authenticated: boolean;
  }>;
  top_user_agents: Record<string, number>;
}

export interface DashboardAnalytics {
  period_days: number;
  visits: {
    total: number;
    unique: number;
    daily_average: number;
  };
  animals: {
    total: number;
    available: number;
    adopted: number;
    special_care: number;
    new_this_period: number;
  };
  financial: {
    total_income: number;
    total_expenses: number;
    balance: number;
    transactions_count: number;
  };
  members: {
    total: number;
    active: number;
    new_this_period: number;
  };
  growth_metrics: {
    visits_trend: Array<{ date: string; count: number }>;
    adoptions_trend: Array<{ date: string; count: number }>;
    financial_trend: Array<{ date: string; income: number; expenses: number }>;
  };
}

export interface AdoptionMetrics {
  summary: {
    total_animals: number;
    available: number;
    adopted: number;
    special_care: number;
    adoption_rate: number;
  };
  by_species: Record<string, {
    total: number;
    available: number;
    adopted: number;
    adoption_rate: number;
  }>;
  by_month: Array<{
    month: string;
    month_name: string;
    available: number;
    adopted: number;
    new_arrivals: number;
  }>;
}

export const analyticsService = {
  // Registrar visita
  async registerVisit(
    project_id: string, 
    page_type = 'profile'
  ): Promise<ApiResponse<any>> {
    const response = await api.post(`/analytics/visits/${project_id}`, {
      page_type
    });
    return response.data;
  },

  // Obter estatísticas de visitas
  async getVisitStats(
    project_id: string,
    start_date?: string,
    end_date?: string,
    period = 'day'
  ): Promise<ApiResponse<VisitStats>> {
    const response = await api.get(`/analytics/visits/${project_id}/stats`, {
      params: { start_date, end_date, period }
    });
    return response.data;
  },

  // Obter analytics do dashboard
  async getDashboardAnalytics(
    project_id: string,
    period = '30'
  ): Promise<ApiResponse<DashboardAnalytics>> {
    const response = await api.get(`/analytics/dashboard/${project_id}`, {
      params: { period }
    });
    return response.data;
  },

  // Obter métricas de adoção
  async getAdoptionMetrics(
    project_id: string,
    year?: number
  ): Promise<ApiResponse<AdoptionMetrics>> {
    const response = await api.get(`/analytics/adoption/${project_id}`, {
      params: { year }
    });
    return response.data;
  }
};
