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
  Avatar,
  Chip,
} from '@mui/material';
import {
  Add,
  Search,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Pets,
} from '@mui/icons-material';
import { animalService } from '../services/animal.service';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { Animal } from '../types/Animal';

export const AnimalsList = () => {
  const navigate = useNavigate();
  const { selectedProject } = useProject();
  const { hasRole } = useAuth();
  const [animals, setAnimals] = useState<Animal[]>([]);
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

      let data: Animal[];
      if (selectedProject) {
        data = await animalService.getByProject(selectedProject.id);
      } else {
        data = await animalService.getAll();
      }
      setAnimals(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar animais');
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
    navigate(`/animals/${id}`);
    handleMenuClose(id);
  };

  const handleEdit = (id: string) => {
    navigate(`/animals/${id}`);
    handleMenuClose(id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover este animal?')) {
      handleMenuClose(id);
      return;
    }

    try {
      await animalService.delete(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao remover animal');
    }
    handleMenuClose(id);
  };

  const filteredAnimals = animals.filter((animal) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      animal.nome.toLowerCase().includes(searchLower) ||
      (animal.origem && animal.origem.toLowerCase().includes(searchLower)) ||
      animal.id.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

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
          Animais
        </Typography>
        {(isAdmin || isEmployee) && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/animals/new')}
          >
            Novo Animal
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
            placeholder="Buscar animais..."
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
                <TableCell>Foto</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Origem</TableCell>
                <TableCell>Entrada</TableCell>
                <TableCell>Vacinado</TableCell>
                <TableCell>Castrado</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAnimals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      Nenhum animal encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAnimals.map((animal) => (
                  <TableRow key={animal.id} hover>
                    <TableCell>
                      <Avatar src={animal.foto} sx={{ width: 40, height: 40 }}>
                        <Pets />
                      </Avatar>
                    </TableCell>
                    <TableCell>{animal.nome}</TableCell>
                    <TableCell>{animal.origem || '-'}</TableCell>
                    <TableCell>{formatDate(animal.entrada)}</TableCell>
                    <TableCell>
                      {animal.vacinado ? (
                        <Chip
                          label={animal.vacinado}
                          color={animal.vacinado === 'Sim' ? 'success' : animal.vacinado === 'Parcial' ? 'warning' : 'default'}
                          size="small"
                        />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{animal.dt_castracao ? formatDate(animal.dt_castracao) : '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleMenuOpen(animal.id, e)}
                        size="small"
                      >
                        <MoreVert />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl[animal.id]}
                        open={Boolean(anchorEl[animal.id])}
                        onClose={() => handleMenuClose(animal.id)}
                      >
                        <MenuItem onClick={() => handleView(animal.id)}>
                          <Visibility sx={{ mr: 1 }} fontSize="small" />
                          Ver Detalhes
                        </MenuItem>
                        {(isAdmin || isEmployee) && (
                          <MenuItem onClick={() => handleEdit(animal.id)}>
                            <Edit sx={{ mr: 1 }} fontSize="small" />
                            Editar
                          </MenuItem>
                        )}
                        {isAdmin && (
                          <MenuItem onClick={() => handleDelete(animal.id)}>
                            <Delete sx={{ mr: 1 }} fontSize="small" />
                            Excluir
                          </MenuItem>
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
