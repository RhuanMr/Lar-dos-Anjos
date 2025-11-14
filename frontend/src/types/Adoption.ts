export type StatusAdocao = 'ok' | 'pendente' | 'visita_agendada' | 'sem_resposta';

export interface Adoption {
  id: string;
  id_projeto: string;
  id_adotante: string;
  id_animal: string;
  dt_adocao?: string; // Data de adoção (YYYY-MM-DD)
  lt_atualizacao?: string; // Data da última atualização (YYYY-MM-DD)
}

export interface AdoptionCreate {
  id_projeto: string;
  id_adotante: string;
  id_animal: string;
  dt_adocao?: string;
}

export interface AdoptionUpdate {
  dt_adocao?: string;
  lt_atualizacao?: string;
}

export interface AdoptionUpdateRecord {
  id: string;
  id_adocao: string;
  id_responsavel: string;
  prox_dt?: string; // Data da próxima atualização (YYYY-MM-DD)
  status?: StatusAdocao;
  observacao?: string;
}

export interface AdoptionUpdateCreate {
  id_adocao: string;
  id_responsavel: string;
  prox_dt?: string;
  status?: StatusAdocao;
  observacao?: string;
}

export interface AdoptionUpdateUpdate {
  prox_dt?: string;
  status?: StatusAdocao;
  observacao?: string;
}

