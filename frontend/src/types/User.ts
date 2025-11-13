export interface User {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  roles: string[];
  ativo: boolean;
  foto?: string;
}

