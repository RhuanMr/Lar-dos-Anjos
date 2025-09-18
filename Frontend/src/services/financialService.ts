import { api } from './api';
import { ApiResponse, PaginatedResponse } from '../types';

export interface Transaction {
  id: string;
  project_id: string;
  tipo: 'entrada' | 'saida';
  categoria: 'doacao' | 'adocao' | 'veterinario' | 'alimentacao' | 'medicamentos' | 'infraestrutura' | 'outros';
  valor: number;
  descricao?: string;
  data_transacao: string;
  created_at: string;
}

export interface TransactionForm {
  project_id: string;
  tipo: 'entrada' | 'saida';
  categoria: 'doacao' | 'adocao' | 'veterinario' | 'alimentacao' | 'medicamentos' | 'infraestrutura' | 'outros';
  valor: number;
  descricao?: string;
  data_transacao: string;
}

export interface FinancialSummary {
  total_entradas: number;
  total_saidas: number;
  saldo: number;
  entradas_por_categoria: Record<string, number>;
  saidas_por_categoria: Record<string, number>;
  transacoes_por_mes: Record<string, {
    entradas: number;
    saidas: number;
    saldo: number;
  }>;
  total_transacoes: number;
}

export interface FinancialStats {
  resumo_anual: {
    total_entradas: number;
    total_saidas: number;
    saldo: number;
    numero_transacoes: number;
  };
  por_categoria: {
    entradas: Record<string, { valor: number; count: number; percentual: number }>;
    saidas: Record<string, { valor: number; count: number; percentual: number }>;
  };
  por_mes: Array<{
    mes: string;
    nome_mes: string;
    entradas: number;
    saidas: number;
    saldo: number;
    transacoes: number;
  }>;
  maiores_entradas: Transaction[];
  maiores_saidas: Transaction[];
}

export interface TransactionListParams {
  project_id: string;
  tipo?: string;
  categoria?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export const financialService = {
  // Listar transações
  async list(params: TransactionListParams): Promise<PaginatedResponse<Transaction>> {
    const { project_id, ...queryParams } = params;
    const response = await api.get(`/financial/organization/${project_id}`, {
      params: queryParams
    });
    return response.data;
  },

  // Buscar transação por ID
  async getById(id: string): Promise<ApiResponse<Transaction>> {
    const response = await api.get(`/financial/${id}`);
    return response.data;
  },

  // Criar transação
  async create(data: TransactionForm): Promise<ApiResponse<Transaction>> {
    const response = await api.post('/financial', data);
    return response.data;
  },

  // Atualizar transação
  async update(id: string, data: Partial<TransactionForm>): Promise<ApiResponse<Transaction>> {
    const response = await api.put(`/financial/${id}`, data);
    return response.data;
  },

  // Deletar transação
  async delete(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete(`/financial/${id}`);
    return response.data;
  },

  // Obter resumo financeiro
  async getSummary(
    project_id: string, 
    start_date?: string, 
    end_date?: string
  ): Promise<ApiResponse<FinancialSummary>> {
    const response = await api.get(`/financial/organization/${project_id}/summary`, {
      params: { start_date, end_date }
    });
    return response.data;
  },

  // Obter estatísticas detalhadas
  async getStats(project_id: string, year?: number): Promise<ApiResponse<FinancialStats>> {
    const response = await api.get(`/financial/organization/${project_id}/stats`, {
      params: { year }
    });
    return response.data;
  }
};
