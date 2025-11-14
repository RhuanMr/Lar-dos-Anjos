import {
  Role,
  Frequencia,
  UF,
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
  foto?: string;
  instagram?: string;
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
  foto?: string;
  instagram?: string;
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
  foto?: string;
  endereco_id: string;
  instagram?: string;
  telefone?: string;
  email?: string;
  ativo: boolean;
}

export interface ProjetoDetalhado extends Projeto {
  endereco?: Endereco | null;
}

// Interface para receber dados do frontend (inclui campos de endereço temporários)
export interface ProjetoCreate {
  nome: string;
  descricao?: string; // Campo recebido do frontend mas não armazenado no banco
  endereco: string; // Campo temporário para receber do frontend
  numero?: string; // Campo temporário para receber do frontend
  complemento?: string; // Campo temporário para receber do frontend
  bairro: string; // Campo temporário para receber do frontend
  cidade: string; // Campo temporário para receber do frontend
  uf: UF; // Campo temporário para receber do frontend
  cep: string; // Campo temporário para receber do frontend
  instagram?: string;
  telefone?: string;
  email?: string;
}

// Interface para inserir no banco (apenas campos que existem na tabela projects)
export interface ProjetoInsert {
  nome: string;
  endereco_id: string;
  instagram?: string | null;
  telefone?: string | null;
  email?: string | null;
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
  id_projeto: string;
  id_adotante: string;
  id_animal: string;
  dt_adocao?: string;
  lt_atualizacao?: string;
}

export interface AdocaoCreate {
  id_projeto: string;
  id_adotante: string;
  id_animal: string;
  dt_adocao?: string;
  lt_atualizacao?: string;
}

export interface AdocaoUpdate {
  dt_adocao?: string;
  lt_atualizacao?: string;
}

/* ========== ATUALIZACOES DE ADOCAO ========== */
export interface AtualizacaoAdocao {
  id: string;
  id_adocao: string;
  id_responsavel: string;
  prox_dt?: string;
  status?: StatusAdocaoEnum;
  observacao?: string;
}

export interface AtualizacaoAdocaoCreate {
  id_adocao: string;
  id_responsavel: string;
  prox_dt?: string;
  status?: StatusAdocaoEnum;
  observacao?: string;
}

export interface AtualizacaoAdocaoUpdate {
  prox_dt?: string;
  status?: StatusAdocaoEnum;
  observacao?: string;
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

/* ========== ADMINISTRADORES ========== */
export interface Administrador {
  id_usuario: string;
  id_projeto: string;
  observacao?: string;
}

export interface AdministradorCreate {
  id_usuario: string;
  id_projeto: string;
  observacao?: string;
}

export interface AdministradorUpdate {
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

/* ========== ENDERECOS ========== */
export interface Endereco {
  id: string;
  cep: string;
  estado: UF;
  cidade: string;
  bairro: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
}

export interface EnderecoCreate {
  cep: string;
  estado: UF;
  cidade: string;
  bairro: string;
  endereco?: string | null;
  numero?: string | null;
  complemento?: string | null;
}

export interface EnderecoUpdate {
  cep?: string | null;
  estado?: UF;
  cidade?: string | null;
  bairro?: string | null;
  endereco?: string | null;
  numero?: string | null;
  complemento?: string | null;
}

/* ========== DOACOES ========== */
export interface Doacao {
  id: string;
  id_user: string;
  id_project: string;
  tp_ajuda?: TipoAjuda;
  tp_pagamento?: TipoPagamento;
  valor?: number;
  itens?: string;
  data?: string;
  observacao?: string;
}

export interface DoacaoCreate {
  id_user: string;
  id_project: string;
  tp_ajuda?: TipoAjuda;
  tp_pagamento?: TipoPagamento;
  valor?: number;
  itens?: string;
  data?: string;
  observacao?: string;
}

export interface DoacaoUpdate {
  tp_ajuda?: TipoAjuda;
  tp_pagamento?: TipoPagamento;
  valor?: number;
  itens?: string;
  data?: string;
  observacao?: string;
}

/* ========== CASOS MEDICOS ========== */
export interface CasoMedico {
  id: string;
  id_animal: string;
  finalizado: boolean;
  descricao?: string;
  observacao?: string;
}

export interface CasoMedicoCreate {
  id_animal: string;
  finalizado?: boolean;
  descricao?: string;
  observacao?: string;
}

export interface CasoMedicoUpdate {
  finalizado?: boolean;
  descricao?: string;
  observacao?: string;
}

/* ========== VACINAS ========== */
export interface Vacina {
  id: string;
  id_animal: string;
  nome: string;
  data_aplicacao: string;
}

export interface VacinaCreate {
  id_animal: string;
  nome: string;
  data_aplicacao: string;
}

export interface VacinaUpdate {
  nome?: string;
  data_aplicacao?: string;
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
