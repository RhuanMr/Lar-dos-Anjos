import {
  Role,
  Frequencia,
  StatusAdocao,
  UF,
  TipoAnimal,
  StatusAnimal,
  StatusAtualizacaoAdocao,
} from './enums';

/* ========== RESPONSE PATTERNS ========== */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/* ========== USUARIOS ========== */
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  data_nascimento?: string;
  genero?: 'M' | 'F' | 'Outro';
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: UF;
  cep?: string;
  roles: Role[];
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface UsuarioCreate {
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  data_nascimento?: string;
  genero?: 'M' | 'F' | 'Outro';
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: UF;
  cep?: string;
  roles: Role[];
}

export interface UsuarioUpdate {
  nome?: string;
  telefone?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: UF;
  cep?: string;
  ativo?: boolean;
}

/* ========== PROJETOS ========== */
export interface Projeto {
  id: string;
  nome: string;
  descricao?: string;
  endereco: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: UF;
  cep: string;
  telefone?: string;
  email?: string;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface ProjetoCreate {
  nome: string;
  descricao?: string;
  endereco: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: UF;
  cep: string;
  telefone?: string;
  email?: string;
}

/* ========== ANIMAIS ========== */
export interface Animal {
  id: string;
  projeto_id: string;
  nome: string;
  tipo: TipoAnimal;
  raca?: string;
  idade_estimada?: number;
  peso?: number;
  descricao?: string;
  status: StatusAnimal;
  data_resgate?: string;
  foto_url?: string;
  criado_em: string;
  atualizado_em: string;
}

export interface AnimalCreate {
  projeto_id: string;
  nome: string;
  tipo: TipoAnimal;
  raca?: string;
  idade_estimada?: number;
  peso?: number;
  descricao?: string;
  data_resgate?: string;
}

/* ========== ADOCOES ========== */
export interface Adocao {
  id: string;
  animal_id: string;
  adotante_id: string;
  funcionario_id?: string;
  status: StatusAdocao;
  data_candidatura: string;
  data_aprovacao?: string;
  data_adocao_efetiva?: string;
  observacoes?: string;
  criado_em: string;
  atualizado_em: string;
}

export interface AdocaoCreate {
  animal_id: string;
  adotante_id: string;
  funcionario_id?: string;
  observacoes?: string;
}

/* ========== ATUALIZACOES DE ADOCAO ========== */
export interface AtualizacaoAdocao {
  id: string;
  adocao_id: string;
  status: StatusAtualizacaoAdocao;
  descricao: string;
  data_atualizacao: string;
  criado_em: string;
}

export interface AtualizacaoAdocaoCreate {
  adocao_id: string;
  status: StatusAtualizacaoAdocao;
  descricao: string;
}

/* ========== DOADORES ========== */
export interface Doador {
  id: string;
  usuario_id: string;
  descricao_interesse?: string;
  frequencia: Frequencia;
  criado_em: string;
  atualizado_em: string;
}

/* ========== VOLUNTARIOS ========== */
export interface Voluntario {
  id: string;
  usuario_id: string;
  projeto_id: string;
  descricao_interesse?: string;
  habilidades?: string;
  disponibilidade?: string;
  criado_em: string;
  atualizado_em: string;
}

/* ========== FUNCIONARIOS ========== */
export interface Funcionario {
  id: string;
  usuario_id: string;
  projeto_id: string;
  cargo?: string;
  data_contratacao?: string;
  possui_privilegios: boolean;
  criado_em: string;
  atualizado_em: string;
}

/* ========== PROJETO USUARIO ========== */
export interface ProjetoUsuario {
  id: string;
  projeto_id: string;
  usuario_id: string;
  criado_em: string;
}

/* ========== LOGS DE AUDITORIA ========== */
export interface LogAuditoria {
  id: string;
  usuario_id: string;
  acao: string;
  tabela: string;
  registro_id: string;
  valor_anterior?: any;
  valor_novo?: any;
  criado_em: string;
}
