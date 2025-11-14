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
  FormControl,
  InputLabel,
  Select,
  Avatar,
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
import { Animal, Identificacao, Vacinado } from '../types';

export const AnimalsList = () => {
  const navigate = useNavigate();
  const { selectedProject } = useProject();
  const { hasRole } = useAuth();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVacinado, setFilterVacinado] = useState<Vacinado | 'all'>('all');
  const [filterIdentificacao, setFilterIdentificacao] = useState<Identificacao | 'all'>('all');
  const [anchorEl, setAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});

  const isAdmin = hasRole('ADMINISTRADOR') || hasRole('SUPERADMIN');
  const isEmployee = hasRole('FUNCIONARIO');

  useEffect(() => {
    if (selectedProject) {
      loadData();
    }
  }, [selectedProject]);

  const loadData = async () => {
    if (!selectedProject) return;

    try {
      setLoading(true);
      setError(null);

      const data = await animalService.getByProject(selectedProject.id);
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
    const matchesSearch = searchTerm
      ? animal.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.origem?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesVacinado =
      filterVacinado === 'all' ? true : animal.vacinado === filterVacinado;

    const matchesIdentificacao =
      filterIdentificacao === 'all'
        ? true
        : animal.identificacao === filterIdentificacao;

    return matchesSearch && matchesVacinado && matchesIdentificacao;
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
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            fullWidth
            sx={{ flex: 1, minWidth: 200 }}
            placeholder="Buscar por nome ou origem..."
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
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Vacinado</InputLabel>
            <Select
              value={filterVacinado}
              label="Vacinado"
              onChange={(e) => setFilterVacinado(e.target.value as Vacinado | 'all')}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="Sim">Sim</MenuItem>
              <MenuItem value="Nao">Não</MenuItem>
              <MenuItem value="Parcial">Parcial</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Identificação</InputLabel>
            <Select
              value={filterIdentificacao}
              label="Identificação"
              onChange={(e) => setFilterIdentificacao(e.target.value as Identificacao | 'all')}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="microchip">Microchip</MenuItem>
              <MenuItem value="coleira">Coleira</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Foto</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Entrada</TableCell>
                <TableCell>Origem</TableCell>
                <TableCell>Vacinado</TableCell>
                <TableCell>Identificação</TableCell>
                <TableCell>Castrado</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAnimals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Nenhum animal encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAnimals.map((animal) => {
                  const menuOpen = Boolean(anchorEl[animal.id]);

                  return (
                    <TableRow key={animal.id} hover>
                      <TableCell>
                        <Avatar
                          src={animal.foto}
                          alt={animal.nome}
                          sx={{ width: 40, height: 40 }}
                        >
                          <Pets />
                        </Avatar>
                      </TableCell>
                      <TableCell>{animal.nome}</TableCell>
                      <TableCell>{formatDate(animal.entrada)}</TableCell>
                      <TableCell>{animal.origem || '-'}</TableCell>
                      <TableCell>
                        {animal.vacinado ? (
                          <Chip
                            label={animal.vacinado}
                            color={animal.vacinado === 'Sim' ? 'success' : animal.vacinado === 'Nao' ? 'error' : 'warning'}
                            size="small"
                          />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {animal.identificacao ? (
                          <Chip
                            label={animal.identificacao === 'microchip' ? 'Microchip' : 'Coleira'}
                            size="small"
                            variant="outlined"
                          />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {animal.dt_castracao ? (
                          <Chip
                            label={formatDate(animal.dt_castracao)}
                            color="success"
                            size="small"
                          />
                        ) : (
                          <Chip label="Não" color="default" size="small" />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(animal.id, e)}
                        >
                          <MoreVert />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl[animal.id]}
                          open={menuOpen}
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
                            <MenuItem
                              onClick={() => handleDelete(animal.id)}
                              sx={{ color: 'error.main' }}
                            >
                              <Delete sx={{ mr: 1 }} fontSize="small" />
                              Remover
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

