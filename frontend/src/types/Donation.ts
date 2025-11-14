export type TipoAjuda = 'Financeira' | 'Itens' | 'Outro';
export type TipoPagamento = 'Pix' | 'Dinheiro' | 'Transferencia' | 'Outro';

export interface Donation {
  id: string;
  id_user: string;
  id_project: string;
  tp_ajuda?: TipoAjuda;
  tp_pagamento?: TipoPagamento;
  valor?: number;
  itens?: string;
  data?: string; // Data da doação (YYYY-MM-DD)
  observacao?: string;
}

export interface DonationCreate {
  id_user: string;
  id_project: string;
  tp_ajuda?: TipoAjuda;
  tp_pagamento?: TipoPagamento;
  valor?: number;
  itens?: string;
  data?: string;
  observacao?: string;
}

export interface DonationUpdate {
  tp_ajuda?: TipoAjuda;
  tp_pagamento?: TipoPagamento;
  valor?: number;
  itens?: string;
  data?: string;
  observacao?: string;
}

