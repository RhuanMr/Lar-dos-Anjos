import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { Project, ProjectContextType } from '../types';
import { api } from '../api/api';

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchingProjects = useRef(false);

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

  const selectProject = useCallback((project: Project) => {
    setSelectedProject(project);
    localStorage.setItem('selectedProject', JSON.stringify(project));
  }, []);

  const clearProject = useCallback(() => {
    setSelectedProject(null);
    localStorage.removeItem('selectedProject');
  }, []);

  const getUserProjects = useCallback(async () => {
    // Evitar múltiplas chamadas simultâneas
    if (fetchingProjects.current) {
      return;
    }

    fetchingProjects.current = true;
    try {
      setLoading(true);
      const response = await api.get<{ success: boolean; data: Project[] }>(
        '/projetos'
      );
      if (response.data.success) {
        const loadedProjects = response.data.data;
        setProjects(loadedProjects);

        setSelectedProject((currentSelected) => {
          const selectedStillExists = loadedProjects.some(
            (project) => project.id === currentSelected?.id
          );

          if (!currentSelected && loadedProjects.length === 1) {
            const newProject = loadedProjects[0];
            localStorage.setItem('selectedProject', JSON.stringify(newProject));
            return newProject;
          } else if (currentSelected && !selectedStillExists) {
            if (loadedProjects.length > 0) {
              const newProject = loadedProjects[0];
              localStorage.setItem('selectedProject', JSON.stringify(newProject));
              return newProject;
            } else {
              localStorage.removeItem('selectedProject');
              return null;
            }
          }
          return currentSelected;
        });
      }
    } catch (error: any) {
      console.error('Erro ao buscar projetos:', error);
      // Tratar erro 429 - não limpar projetos, apenas marcar como não carregando
      if (error.response?.status === 429) {
        console.warn('Muitas requisições ao buscar projetos. Aguardando...');
        // Manter projetos existentes se houver
      } else {
        setProjects([]);
        clearProject();
      }
    } finally {
      setLoading(false);
      fetchingProjects.current = false;
    }
  }, [selectProject, clearProject]);


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

