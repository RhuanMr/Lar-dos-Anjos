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
} from '@mui/icons-material';
import { adoptionService } from '../services/adoption.service';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { Adoption } from '../types/Adoption';
import { formatDate } from '../utils/dateUtils';

export const AdoptionsList = () => {
  const navigate = useNavigate();
  const { selectedProject } = useProject();
  const { hasRole } = useAuth();
  const [adoptions, setAdoptions] = useState<Adoption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});

  const isAdmin = hasRole('ADMINISTRADOR') || hasRole('SUPERADMIN');
  const isEmployee = hasRole('FUNCIONARIO');

  useEffect(() => {
    loadData();
  }, [selectedProject]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      let data: Adoption[];
      if (selectedProject) {
        data = await adoptionService.getByProject(selectedProject.id);
      } else {
        data = await adoptionService.getAll();
      }
      setAdoptions(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar adoções');
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
    navigate(`/adoptions/${id}`);
    handleMenuClose(id);
  };

  const handleEdit = (id: string) => {
    navigate(`/adoptions/${id}/edit`);
    handleMenuClose(id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover esta adoção?')) {
      handleMenuClose(id);
      return;
    }

    try {
      await adoptionService.delete(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao remover adoção');
    }
    handleMenuClose(id);
  };

  const filteredAdoptions = adoptions.filter((adoption) => {
    return searchTerm
      ? adoption.id.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
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
          Adoções
        </Typography>
        {(isAdmin || isEmployee) && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/adoptions/new')}
          >
            Nova Adoção
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Buscar adoções..."
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
                <TableCell>ID</TableCell>
                <TableCell>Projeto</TableCell>
                <TableCell>Adotante</TableCell>
                <TableCell>Animal</TableCell>
                <TableCell>Data de Adoção</TableCell>
                <TableCell>Última Atualização</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAdoptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      Nenhuma adoção encontrada
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAdoptions.map((adoption) => (
                  <TableRow key={adoption.id} hover>
                    <TableCell>{adoption.id.substring(0, 8)}...</TableCell>
                    <TableCell>{adoption.id_projeto.substring(0, 8)}...</TableCell>
                    <TableCell>{adoption.id_adotante.substring(0, 8)}...</TableCell>
                    <TableCell>{adoption.id_animal.substring(0, 8)}...</TableCell>
                    <TableCell>{formatDate(adoption.dt_adocao)}</TableCell>
                    <TableCell>{formatDate(adoption.lt_atualizacao)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleMenuOpen(adoption.id, e)}
                        size="small"
                      >
                        <MoreVert />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl[adoption.id]}
                        open={Boolean(anchorEl[adoption.id])}
                        onClose={() => handleMenuClose(adoption.id)}
                      >
                        <MenuItem onClick={() => handleView(adoption.id)}>
                          <Visibility sx={{ mr: 1 }} fontSize="small" />
                          Ver Detalhes
                        </MenuItem>
                        {(isAdmin || isEmployee) && (
                          <>
                            <MenuItem onClick={() => handleEdit(adoption.id)}>
                              <Edit sx={{ mr: 1 }} fontSize="small" />
                              Editar
                            </MenuItem>
                            {isAdmin && (
                              <MenuItem onClick={() => handleDelete(adoption.id)}>
                                <Delete sx={{ mr: 1 }} fontSize="small" />
                                Excluir
                              </MenuItem>
                            )}
                          </>
                        )}
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

