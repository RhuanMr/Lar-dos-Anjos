// Tipos base para o sistema
export interface User {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  role: 'admin' | 'user' | 'membro' | 'voluntario';
  cpf: string;
  endereco_id?: string;
  foto_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Endereco {
  id: string;
  cep: string;
  estado: string;
  cidade: string;
  bairro: string;
  numero: number;
  complemento?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  nome: string;
  descricao?: string;
  cpf_user: string;
  endereco_visivel: boolean;
  endereco_id?: string;
  fotos: string[];
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  user_id: string;
  project_id: string;
  role: 'admin' | 'membro' | 'voluntario';
  joined_at: string;
  status: 'ativo' | 'inativo' | 'suspenso';
  created_at: string;
  updated_at: string;
}

export interface OrganizationMemberWithUser extends OrganizationMember {
  user: {
    id: string;
    nome: string;
    email: string;
    telefone?: string;
    cpf: string;
    foto_url?: string;
  };
}

export interface OrganizationMemberWithProject extends OrganizationMember {
  project: {
    id: string;
    nome: string;
    descricao?: string;
  };
}

export interface Animal {
  id: string;
  nome: string;
  especie: string;
  raca?: string;
  idade?: number;
  condicao_saude?: string;
  cirurgia?: string;
  historico?: string;
  status: 'disponivel' | 'adotado' | 'falecido' | 'cuidados_especiais';
  tutor_id?: string;
  project_id: string;
  fotos: string[];
  created_at: string;
  updated_at: string;
}

export interface Vacine {
  id: string;
  nome: string;
  data: string;
  dose: number;
  animal_id: string;
  observacoes?: string;
  created_at: string;
}

export interface AnimalHistory {
  id: string;
  animal_id: string;
  action: 'created' | 'updated' | 'status_changed' | 'photos_uploaded' | 'deleted' | 'vaccine_added';
  description: string;
  user_id?: string;
  data?: any;
  created_at: string;
}

export interface TransacaoFinanceira {
  id: string;
  project_id: string;
  tipo: 'entrada' | 'saida';
  categoria: 'doacao' | 'adocao' | 'veterinario' | 'alimentacao' | 'medicamentos' | 'infraestrutura' | 'outros';
  valor: number;
  descricao?: string;
  data_transacao: string;
  created_at: string;
}

export interface Publicacao {
  id: string;
  project_id: string;
  titulo: string;
  conteudo: string;
  categoria?: string;
  fotos: string[];
  publicada: boolean;
  created_at: string;
  updated_at: string;
}

// Tipos para requisições
export interface CreateUserRequest {
  nome: string;
  email: string;
  telefone?: string;
  role: 'admin' | 'user' | 'membro' | 'voluntario';
  cpf: string;
  endereco_id?: string;
}

export interface CreateProjectRequest {
  nome: string;
  descricao?: string;
  cpf_user: string;
  endereco_visivel?: boolean;
  endereco_id?: string;
}

export interface CreateAnimalRequest {
  nome: string;
  especie: string;
  raca?: string;
  idade?: number;
  condicao_saude?: string;
  cirurgia?: string;
  historico?: string;
  project_id: string;
}

// Tipos para requisições de membros
export interface CreateMemberRequest {
  user_id: string;
  role: 'admin' | 'membro' | 'voluntario';
  status?: 'ativo' | 'inativo' | 'suspenso';
}

export interface UpdateMemberRequest {
  role?: 'admin' | 'membro' | 'voluntario';
  status?: 'ativo' | 'inativo' | 'suspenso';
}

export interface MemberStatsResponse {
  project_id: string;
  organizacao_nome: string;
  total_membros: number;
  total_admins: number;
  total_membros_regulares: number;
  total_voluntarios: number;
}

// Tipos para respostas da API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
