export interface MedicalCase {
  id: string;
  id_animal: string;
  finalizado: boolean;
  descricao?: string;
  observacao?: string;
}

export interface MedicalCaseCreate {
  id_animal: string;
  finalizado?: boolean;
  descricao?: string;
  observacao?: string;
}

export interface MedicalCaseUpdate {
  finalizado?: boolean;
  descricao?: string;
  observacao?: string;
}


