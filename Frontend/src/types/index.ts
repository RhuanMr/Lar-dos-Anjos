// Tipos base para o frontend
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
  cpf_user: number;
  endereco_visivel: boolean;
  endereco_id?: string;
  fotos: string[];
  created_at: string;
  updated_at: string;
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
  // Campos relacionais
  project?: {
    id: string;
    nome: string;
  };
  tutor?: {
    id: string;
    nome: string;
    email: string;
  };
  vacinas?: Vaccine[];
}

export interface Vaccine {
  id: string;
  nome: string;
  data: string;
  dose: number;
  animal_id: string;
  observacoes?: string;
  created_at: string;
  // Campos relacionais
  animal?: {
    id: string;
    nome: string;
    especie: string;
  };
}

export interface AnimalHistory {
  id: string;
  animal_id: string;
  action: 'created' | 'updated' | 'status_changed' | 'photos_uploaded' | 'deleted' | 'vaccine_added';
  description: string;
  user_id?: string;
  data?: any;
  created_at: string;
  // Campos relacionais
  user?: {
    id: string;
    nome: string;
  };
}

// Tipos para formulários
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  nome: string;
  email: string;
  password: string;
  confirmPassword: string;
  telefone?: string;
  cpf: string;
}

export interface CreateUserForm {
  nome: string;
  email: string;
  telefone?: string;
  role: 'admin' | 'user' | 'membro' | 'voluntario';
  cpf: string;
  endereco_id?: string;
}

export interface AnimalForm {
  nome: string;
  especie: string;
  raca?: string;
  idade?: number;
  condicao_saude?: string;
  cirurgia?: string;
  historico?: string;
  project_id: string;
}

export interface VaccineForm {
  nome: string;
  data: string;
  dose: number;
  animal_id: string;
  observacoes?: string;
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

// Tipos para contexto de autenticação
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterForm) => Promise<void>;
}

// Tipos para navegação
export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  protected?: boolean;
  roles?: string[];
}
