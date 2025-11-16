export type Identificacao = 'microchip' | 'coleira';
export type Vacinado = 'Sim' | 'Nao' | 'Parcial';

export interface Animal {
  id: string;
  id_projeto: string;
  nome: string;
  foto?: string; // Foto principal (mantida para compatibilidade)
  fotos?: string[]; // Array de URLs de fotos adicionais
  entrada: string; // Data de entrada (YYYY-MM-DD)
  origem?: string;
  identificacao?: Identificacao;
  vacinado?: Vacinado;
  dt_castracao?: string; // Data de castração (YYYY-MM-DD)
}

export interface AnimalCreate {
  id_projeto: string;
  nome: string;
  foto?: string;
  entrada: string; // Data de entrada (YYYY-MM-DD)
  origem?: string;
  identificacao?: Identificacao;
  vacinado?: Vacinado;
  dt_castracao?: string; // Data de castração (YYYY-MM-DD)
}

export interface AnimalUpdate {
  nome?: string;
  foto?: string;
  fotos?: string[];
  entrada?: string;
  origem?: string;
  identificacao?: Identificacao;
  vacinado?: Vacinado;
  dt_castracao?: string;
}

