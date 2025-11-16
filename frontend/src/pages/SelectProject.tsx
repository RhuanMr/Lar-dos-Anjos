import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress,
  Alert,
  Avatar,
} from '@mui/material';
import { Pets, CheckCircle } from '@mui/icons-material';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { Project } from '../types';

export const SelectProject = () => {
  const navigate = useNavigate();
  const { projects, loading, selectProject, getUserProjects } = useProject();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [selecting, setSelecting] = useState(false);

  const hasLoadedProjects = useRef(false);

  useEffect(() => {
    // Se não estiver autenticado, redirecionar para login
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    // Se estiver autenticado e ainda não carregou projetos, carregar uma vez
    if (isAuthenticated && !authLoading) {
      // Se já tem projetos carregados, marcar como carregado
      if (projects.length > 0) {
        hasLoadedProjects.current = true;
      }
      // Se não tem projetos e ainda não tentou carregar, carregar
      else if (!hasLoadedProjects.current && !loading) {
        hasLoadedProjects.current = true;
        getUserProjects();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    // Se tiver apenas 1 projeto, selecionar automaticamente
    if (!loading && projects.length === 1 && !selecting) {
      handleSelectProject(projects[0]);
    }
    // Se não tiver projetos, redirecionar para dashboard (pode criar projeto se for SUPERADMIN)
    else if (!loading && projects.length === 0 && !selecting) {
      navigate('/dashboard');
    }
  }, [projects, loading, navigate, selecting]);

  const handleSelectProject = async (project: Project) => {
    setSelecting(true);
    try {
      selectProject(project);
      // Pequeno delay para garantir que o projeto foi selecionado
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
    } catch (error) {
      console.error('Erro ao selecionar projeto:', error);
      setSelecting(false);
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Se não estiver autenticado, não renderizar (será redirecionado)
  if (!isAuthenticated) {
    return null;
  }

  // Se tiver apenas 1 projeto ou nenhum, não renderizar (será redirecionado)
  if (projects.length <= 1) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Paper
        sx={{
          maxWidth: 900,
          width: '100%',
          p: 4,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: 'primary.main',
              mx: 'auto',
              mb: 2,
            }}
          >
            <Pets sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h4" component="h1" gutterBottom>
            Selecione um Projeto
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Você está cadastrado em múltiplos projetos. Selecione qual projeto deseja acessar.
          </Typography>
        </Box>

        {selecting && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Selecionando projeto...
          </Alert>
        )}

        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card
                component="div"
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                {project.foto ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={project.foto}
                    alt={project.nome}
                    sx={{ objectFit: 'cover' }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'primary.light',
                    }}
                  >
                    <Pets sx={{ fontSize: 80, color: 'primary.main' }} />
                  </Box>
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {project.nome}
                  </Typography>
                  {project.email && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {project.email}
                    </Typography>
                  )}
                  {project.telefone && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {project.telefone}
                    </Typography>
                  )}
                  {project.instagram && (
                    <Typography variant="body2" color="text.secondary">
                      @{project.instagram}
                    </Typography>
                  )}
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<CheckCircle />}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!selecting) {
                        handleSelectProject(project);
                      }
                    }}
                    disabled={selecting}
                  >
                    Selecionar
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {projects.length === 0 && (
          <Alert severity="warning" sx={{ mt: 3 }}>
            Você não está cadastrado em nenhum projeto. Entre em contato com um administrador.
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

