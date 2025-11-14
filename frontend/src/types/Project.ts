export interface Project {
  id: string;
  nome: string;
  foto?: string;
  endereco_id: string;
  instagram?: string;
  telefone?: string;
  email?: string;
  ativo: boolean;
}

export interface ProjectAddress {
  id: string;
  cep: string;
  estado: string;
  cidade: string;
  bairro: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
}

export interface ProjectDetails extends Project {
  endereco?: ProjectAddress | null;
}

export interface ProjectContextType {
  selectedProject: Project | null;
  projects: Project[];
  loading: boolean;
  selectProject: (project: Project) => void;
  getUserProjects: () => Promise<void>;
  clearProject: () => void;
}

