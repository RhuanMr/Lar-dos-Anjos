export interface Project {
  id: string;
  nome: string;
  descricao?: string;
  foto?: string;
  endereco: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  telefone?: string;
  email?: string;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface ProjectContextType {
  selectedProject: Project | null;
  projects: Project[];
  loading: boolean;
  selectProject: (project: Project) => void;
  getUserProjects: () => Promise<void>;
  clearProject: () => void;
}

