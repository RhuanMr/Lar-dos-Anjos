import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Button,
  Typography,
} from '@mui/material';
import {
  ExpandMore,
  Pets,
  AttachMoney,
  PersonAdd,
  Work,
  VolunteerActivism,
  Settings,
  List as ListIcon,
  People,
  Favorite,
  Home,
  Share,
  Logout,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 280;

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, hasRole } = useAuth();
  const isAdmin = hasRole('ADMINISTRADOR') || hasRole('SUPERADMIN');
  const isSuperAdmin = hasRole('SUPERADMIN');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          mt: '64px', // Altura do AppBar
        },
      }}
    >
      <Box sx={{ overflow: 'auto', height: 'calc(100vh - 64px)' }}>
        {/* Cadastros */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Cadastros
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <List>
              <ListItem disablePadding>
                <ListItemButton
                  selected={isActive('/animals/new')}
                  onClick={() => navigate('/animals/new')}
                >
                  <ListItemIcon>
                    <Pets />
                  </ListItemIcon>
                  <ListItemText primary="Cadastro de Animais" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  selected={isActive('/donations/new')}
                  onClick={() => navigate('/donations/new')}
                >
                  <ListItemIcon>
                    <AttachMoney />
                  </ListItemIcon>
                  <ListItemText primary="Cadastro de Doações" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  selected={isActive('/adopters/new')}
                  onClick={() => navigate('/adopters/new')}
                >
                  <ListItemIcon>
                    <PersonAdd />
                  </ListItemIcon>
                  <ListItemText primary="Cadastro de Adotantes" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  selected={isActive('/adoptions/new')}
                  onClick={() => navigate('/adoptions/new')}
                >
                  <ListItemIcon>
                    <Favorite />
                  </ListItemIcon>
                  <ListItemText primary="Cadastro de Adoções" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  selected={isActive('/employees-volunteers/new')}
                  onClick={() => navigate('/employees-volunteers/new')}
                >
                  <ListItemIcon>
                    <Work />
                  </ListItemIcon>
                  <ListItemText primary="Cadastro de Funcionários" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  selected={isActive('/employees-volunteers/new')}
                  onClick={() => navigate('/employees-volunteers/new')}
                >
                  <ListItemIcon>
                    <VolunteerActivism />
                  </ListItemIcon>
                  <ListItemText primary="Cadastro de Voluntários" />
                </ListItemButton>
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Listas */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Listas
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <List>
              <ListItem disablePadding>
                <ListItemButton
                  selected={isActive('/animals')}
                  onClick={() => navigate('/animals')}
                >
                  <ListItemIcon>
                    <ListIcon />
                  </ListItemIcon>
                  <ListItemText primary="Lista de Animais" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  selected={isActive('/employees-volunteers')}
                  onClick={() => navigate('/employees-volunteers')}
                >
                  <ListItemIcon>
                    <People />
                  </ListItemIcon>
                  <ListItemText primary="Lista de Funcionários e Voluntários" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  selected={isActive('/donors')}
                  onClick={() => navigate('/donors')}
                >
                  <ListItemIcon>
                    <AttachMoney />
                  </ListItemIcon>
                  <ListItemText primary="Lista de Doadores" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  selected={isActive('/adopters')}
                  onClick={() => navigate('/adopters')}
                >
                  <ListItemIcon>
                    <PersonAdd />
                  </ListItemIcon>
                  <ListItemText primary="Lista de Adotantes" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  selected={isActive('/adoptions')}
                  onClick={() => navigate('/adoptions')}
                >
                  <ListItemIcon>
                    <Favorite />
                  </ListItemIcon>
                  <ListItemText primary="Lista de Adoções" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  selected={isActive('/donations')}
                  onClick={() => navigate('/donations')}
                >
                  <ListItemIcon>
                    <AttachMoney />
                  </ListItemIcon>
                  <ListItemText primary="Lista de Doações" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  selected={isActive('/users')}
                  onClick={() => navigate('/users')}
                >
                  <ListItemIcon>
                    <People />
                  </ListItemIcon>
                  <ListItemText primary="Lista de Usuários" />
                </ListItemButton>
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Configurações */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Configurações
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <List>
              {isSuperAdmin && (
                <>
                  <ListItem disablePadding>
                    <ListItemButton
                      selected={isActive('/projects')}
                      onClick={() => navigate('/projects')}
                    >
                      <ListItemIcon>
                        <ListIcon />
                      </ListItemIcon>
                      <ListItemText primary="Lista de Projetos" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      selected={isActive('/projects/new')}
                      onClick={() => navigate('/projects/new')}
                    >
                      <ListItemIcon>
                        <Home />
                      </ListItemIcon>
                      <ListItemText primary="Cadastro de Projeto" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      selected={isActive('/projects/admin/new')}
                      onClick={() => navigate('/projects/admin/new')}
                    >
                      <ListItemIcon>
                        <PersonAdd />
                      </ListItemIcon>
                      <ListItemText primary="Cadastrar Administrador" />
                    </ListItemButton>
                  </ListItem>
                </>
              )}
              {isAdmin && (
                <ListItem disablePadding>
                  <ListItemButton
                    selected={isActive('/project/edit')}
                    onClick={() => navigate('/project/edit')}
                  >
                    <ListItemIcon>
                      <Settings />
                    </ListItemIcon>
                    <ListItemText primary="Projeto" />
                  </ListItemButton>
                </ListItem>
              )}
              <ListItem disablePadding>
                <ListItemButton
                  selected={isActive('/share-autocadastro')}
                  onClick={() => navigate('/share-autocadastro')}
                >
                  <ListItemIcon>
                    <Share />
                  </ListItemIcon>
                  <ListItemText primary="Compartilhar AutoCadastro" />
                </ListItemButton>
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Divider />

        {/* Botão de Sair */}
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<Logout />}
            onClick={handleLogout}
          >
            Sair
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

