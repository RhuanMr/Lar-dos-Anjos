import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add,
  Search,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  PersonAdd,
} from '@mui/icons-material';
import { projectService } from '../services/project.service';
import { useAuth } from '../contexts/AuthContext';
import { Project } from '../types/Project';

export const ProjectsList = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});

  const isSuperAdmin = hasRole('SUPERADMIN');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await projectService.getAll();
      setProjects(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar projetos');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (id: string, event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl({ ...anchorEl, [id]: event.currentTarget });
  };

  const handleMenuClose = (id: string) => {
    setAnchorEl({ ...anchorEl, [id]: null });
  };

  const handleView = (id: string) => {
    navigate(`/projects/${id}`);
    handleMenuClose(id);
  };

  const handleEdit = (id: string) => {
    navigate(`/projects/${id}/edit`);
    handleMenuClose(id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este projeto?')) {
      handleMenuClose(id);
      return;
    }

    try {
      await projectService.delete(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao excluir projeto');
    }
    handleMenuClose(id);
  };

  const filteredProjects = projects.filter((project) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      project.nome?.toLowerCase().includes(term) ||
      project.email?.toLowerCase().includes(term) ||
      project.telefone?.includes(term) ||
      project.instagram?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Projetos
        </Typography>
        {isSuperAdmin && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/projects/new')}
          >
            Novo Projeto
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Buscar por nome, email, telefone ou Instagram..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Instagram</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm ? 'Nenhum projeto encontrado' : 'Nenhum projeto cadastrado'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project) => {
                  const menuOpen = Boolean(anchorEl[project.id]);

                  return (
                    <TableRow key={project.id} hover>
                      <TableCell>{project.nome || 'N/A'}</TableCell>
                      <TableCell>{project.email || 'N/A'}</TableCell>
                      <TableCell>
                        {project.telefone
                          ? project.telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {project.instagram ? (
                          <a
                            href={`https://instagram.com/${project.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'none', color: 'inherit' }}
                          >
                            {project.instagram}
                          </a>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={project.ativo ? 'Ativo' : 'Inativo'}
                          color={project.ativo ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(project.id, e)}
                        >
                          <MoreVert />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl[project.id]}
                          open={menuOpen}
                          onClose={() => handleMenuClose(project.id)}
                        >
                          <MenuItem onClick={() => handleView(project.id)}>
                            <Visibility sx={{ mr: 1 }} fontSize="small" />
                            Ver Detalhes
                          </MenuItem>
                          {isSuperAdmin && (
                            <MenuItem onClick={() => handleEdit(project.id)}>
                              <Edit sx={{ mr: 1 }} fontSize="small" />
                              Editar
                            </MenuItem>
                          )}
                          {isSuperAdmin && (
                            <MenuItem
                              onClick={() => navigate(`/projects/${project.id}/admin/new`)}
                            >
                              <PersonAdd sx={{ mr: 1 }} fontSize="small" />
                              Adicionar Administrador
                            </MenuItem>
                          )}
                          {isSuperAdmin && (
                            <MenuItem
                              onClick={() => handleDelete(project.id)}
                              sx={{ color: 'error.main' }}
                            >
                              <Delete sx={{ mr: 1 }} fontSize="small" />
                              Excluir
                            </MenuItem>
                          )}
                        </Menu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

