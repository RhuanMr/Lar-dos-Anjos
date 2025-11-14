export type UserGender = 'M' | 'F' | 'Outro';

export interface User {
  id: string;
  nome: string;
  email: string;
  cpf?: string;
  telefone?: string;
  data_nascimento?: string;
  genero?: UserGender;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  roles: string[];
  ativo: boolean;
  foto?: string;
}

export type UserUpdate = Partial<
  Pick<
    User,
    | 'nome'
    | 'email'
    | 'telefone'
    | 'data_nascimento'
    | 'genero'
    | 'endereco'
    | 'numero'
    | 'complemento'
    | 'bairro'
    | 'cidade'
    | 'uf'
    | 'cep'
    | 'ativo'
  >
>;
