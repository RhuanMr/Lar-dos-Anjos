export type Frequencia = 'mensal' | 'pontual' | 'eventual';

export interface Volunteer {
  id_usuario: string;
  id_projeto: string;
  servico?: string;
  frequencia?: Frequencia;
  lt_data?: string; // Data do último serviço
  px_data?: string; // Data do próximo serviço
}

export interface VolunteerCreate {
  id_usuario: string;
  id_projeto: string;
  servico?: string;
  frequencia?: Frequencia;
  lt_data?: string;
  px_data?: string;
}

export interface VolunteerUpdate {
  servico?: string;
  frequencia?: Frequencia;
  lt_data?: string;
  px_data?: string;
}

