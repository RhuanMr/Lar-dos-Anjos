import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, ProjectContextType } from '../types';
import { api } from '../api/api';

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carregar projeto selecionado do localStorage
    const storedProject = localStorage.getItem('selectedProject');
    if (storedProject) {
      try {
        setSelectedProject(JSON.parse(storedProject));
      } catch (error) {
        console.error('Erro ao carregar projeto do localStorage:', error);
      }
    }
    setLoading(false);
  }, []);

  const getUserProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ success: boolean; data: Project[] }>('/api/projetos');
      if (response.data.success) {
        setProjects(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const selectProject = (project: Project) => {
    setSelectedProject(project);
    localStorage.setItem('selectedProject', JSON.stringify(project));
  };

  const clearProject = () => {
    setSelectedProject(null);
    localStorage.removeItem('selectedProject');
  };

  return (
    <ProjectContext.Provider
      value={{
        selectedProject,
        projects,
        loading,
        selectProject,
        getUserProjects,
        clearProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject deve ser usado dentro de ProjectProvider');
  }
  return context;
};

