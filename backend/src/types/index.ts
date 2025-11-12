import {
  Role,
  Frequencia,
  StatusAdocao,
  UF,
  TipoAnimal,
  StatusAnimal,
  StatusAtualizacaoAdocao,
  TipoAjuda,
  TipoPagamento,
  Identificacao,
  Vacinado,
  StatusAdocaoEnum,
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
  id_projeto: string;
  nome: string;
  foto?: string;
  entrada: string; // Data de entrada
  origem?: string;
  identificacao?: Identificacao;
  vacinado?: Vacinado;
  dt_castracao?: string;
}

export interface AnimalCreate {
  id_projeto: string;
  nome: string;
  foto?: string;
  entrada: string;
  origem?: string;
  identificacao?: Identificacao;
  vacinado?: Vacinado;
  dt_castracao?: string;
}

export interface AnimalUpdate {
  nome?: string;
  foto?: string;
  entrada?: string;
  origem?: string;
  identificacao?: Identificacao;
  vacinado?: Vacinado;
  dt_castracao?: string;
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

/* ========== VOLUNTARIOS ========== */
export interface Voluntario {
  id_usuario: string;
  id_projeto: string;
  servico?: string;
  frequencia?: Frequencia;
  lt_data?: string; // Data do último serviço
  px_data?: string; // Data do próximo serviço
}

export interface VoluntarioCreate {
  id_usuario: string;
  id_projeto: string;
  servico?: string;
  frequencia?: Frequencia;
  lt_data?: string;
  px_data?: string;
}

export interface VoluntarioUpdate {
  servico?: string;
  frequencia?: Frequencia;
  lt_data?: string;
  px_data?: string;
}

/* ========== FUNCIONARIOS ========== */
export interface Funcionario {
  id_usuario: string;
  id_projeto: string;
  privilegios: boolean;
  funcao?: string;
  observacao?: string;
}

export interface FuncionarioCreate {
  id_usuario: string;
  id_projeto: string;
  privilegios?: boolean;
  funcao?: string;
  observacao?: string;
}

export interface FuncionarioUpdate {
  privilegios?: boolean;
  funcao?: string;
  observacao?: string;
}

/* ========== DOADORES ========== */
export interface Doador {
  id_usuario: string;
  id_projeto: string;
  observacao?: string;
  frequencia?: Frequencia;
  dt_lembrete?: string; // Data de lembrete
  lt_data?: string; // Data da última ajuda
  px_data?: string; // Próxima data de ajuda
}

export interface DoadorCreate {
  id_usuario: string;
  id_projeto: string;
  observacao?: string;
  frequencia?: Frequencia;
  dt_lembrete?: string;
  lt_data?: string;
  px_data?: string;
}

export interface DoadorUpdate {
  observacao?: string;
  frequencia?: Frequencia;
  dt_lembrete?: string;
  lt_data?: string;
  px_data?: string;
}

/* ========== ADOTANTES ========== */
export interface AdotanteCreate {
  id_usuario: string;
  // Adotante é apenas uma role no usuário, mas podemos ter campos adicionais se necessário
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
