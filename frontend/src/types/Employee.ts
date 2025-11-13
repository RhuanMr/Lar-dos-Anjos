export interface Employee {
  id_usuario: string;
  id_projeto: string;
  privilegios: boolean;
  funcao?: string;
  observacao?: string;
}

export interface EmployeeCreate {
  id_usuario: string;
  id_projeto: string;
  privilegios?: boolean;
  funcao?: string;
  observacao?: string;
}

export interface EmployeeUpdate {
  privilegios?: boolean;
  funcao?: string;
  observacao?: string;
}

