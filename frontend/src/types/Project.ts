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

export interface ProjectContextType {
  selectedProject: Project | null;
  projects: Project[];
  loading: boolean;
  selectProject: (project: Project) => void;
  getUserProjects: () => Promise<void>;
  clearProject: () => void;
}

