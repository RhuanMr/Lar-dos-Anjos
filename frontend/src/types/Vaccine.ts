export interface Vaccine {
  id: string;
  id_animal: string;
  nome: string;
  data_aplicacao: string;
}

export interface VaccineCreate {
  id_animal: string;
  nome: string;
  data_aplicacao: string;
}

export interface VaccineUpdate {
  nome?: string;
  data_aplicacao?: string;
}


