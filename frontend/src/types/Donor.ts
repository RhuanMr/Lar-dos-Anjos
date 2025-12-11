import { Frequencia } from './common';

export interface Donor {
  id_usuario: string;
  id_projeto: string;
  observacao?: string;
  frequencia?: Frequencia;
  dt_lembrete?: string; // Data de lembrete (YYYY-MM-DD)
  lt_data?: string; // Data da última ajuda (YYYY-MM-DD)
  px_data?: string; // Próxima data de ajuda (YYYY-MM-DD)
}

export interface DonorCreate {
  id_usuario: string;
  id_projeto: string;
  observacao?: string;
  frequencia?: Frequencia;
  dt_lembrete?: string;
  lt_data?: string;
  px_data?: string;
}

export interface DonorUpdate {
  observacao?: string;
  frequencia?: Frequencia;
  dt_lembrete?: string;
  lt_data?: string;
  px_data?: string;
}

