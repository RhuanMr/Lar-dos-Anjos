import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  IconButton,
  Box,
  Tooltip,
} from '@mui/material';
import { AccountCircle, Pets } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useProject } from '../../contexts/ProjectContext';

export const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { selectedProject, projects, getUserProjects } = useProject();

  useEffect(() => {
    if (isAuthenticated) {
      getUserProjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleProjectClick = () => {
    // Se usuário tem mais de 1 projeto, volta para seleção
    if (projects.length > 1) {
      navigate('/select-project');
    }
  };

  const handleUserClick = () => {
    navigate('/profile');
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        {/* Projeto */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: projects.length > 1 ? 'pointer' : 'default',
            mr: 3,
          }}
          onClick={handleProjectClick}
        >
          {selectedProject?.foto ? (
            <Avatar
              src={selectedProject.foto}
              alt={selectedProject.nome}
              sx={{ width: 40, height: 40, mr: 1 }}
            >
              <Pets />
            </Avatar>
          ) : (
            <Avatar sx={{ width: 40, height: 40, mr: 1, bgcolor: 'secondary.main' }}>
              <Pets />
            </Avatar>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 0 }}>
            {selectedProject?.nome || 'PawHub'}
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Usuário */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body1" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {user?.nome || 'Usuário'}
          </Typography>
          <Tooltip title="Meu perfil">
            <IconButton color="inherit" onClick={handleUserClick}>
              {user?.foto ? (
                <Avatar src={user.foto} alt={user.nome} sx={{ width: 32, height: 32 }}>
                  <AccountCircle />
                </Avatar>
              ) : (
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  <AccountCircle />
                </Avatar>
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

