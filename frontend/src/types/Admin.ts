export interface Admin {
  id_usuario: string;
  id_projeto: string;
  observacao?: string;
}

export interface AdminCreate {
  id_usuario: string;
  id_projeto: string;
  observacao?: string;
}

export interface AdminUpdate {
  observacao?: string;
}

