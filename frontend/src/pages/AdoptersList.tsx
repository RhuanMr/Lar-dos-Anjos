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
  Delete,
  Visibility,
  Person,
} from '@mui/icons-material';
import { userService } from '../services/user.service';
import { adopterService } from '../services/adopter.service';
import { adoptionService } from '../services/adoption.service';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import { User } from '../types/User';

export const AdoptersList = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const { selectedProject } = useProject();
  const [adopters, setAdopters] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});

  const isAdmin = hasRole('ADMINISTRADOR') || hasRole('SUPERADMIN');
  const isEmployee = hasRole('FUNCIONARIO');

  useEffect(() => {
    if (selectedProject) {
      loadData();
    } else {
      setAdopters([]);
      setLoading(false);
    }
  }, [selectedProject]);

  const loadData = async () => {
    if (!selectedProject) return;

    try {
      setLoading(true);
      setError(null);

      // Buscar adoções do projeto para identificar os adotantes
      const adoptions = await adoptionService.getByProject(selectedProject.id);
      
      // Extrair IDs únicos dos adotantes
      const adopterIds = [...new Set(adoptions.map(adoption => adoption.id_adotante))];
      
      if (adopterIds.length === 0) {
        // Se não há adoções, não há adotantes ligados ao projeto
        setAdopters([]);
        setLoading(false);
        return;
      }

      // Buscar os usuários correspondentes aos IDs dos adotantes
      const adoptersList: User[] = [];
      for (const adopterId of adopterIds) {
        try {
          const userResponse = await userService.getById(adopterId);
          if (userResponse.data && userResponse.data.roles.includes('ADOTANTE')) {
            adoptersList.push(userResponse.data);
          }
        } catch (err) {
          console.error(`Erro ao buscar adotante ${adopterId}:`, err);
        }
      }

      setAdopters(adoptersList);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar adotantes');
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
    navigate(`/adopters/${id}`);
    handleMenuClose(id);
  };

  const handleRemoveRole = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover a role de adotante deste usuário?')) {
      handleMenuClose(id);
      return;
    }

    try {
      await adopterService.removeAdopterRole(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao remover role de adotante');
    }
    handleMenuClose(id);
  };

  const filteredAdopters = adopters.filter((adopter) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      adopter.nome.toLowerCase().includes(searchLower) ||
      adopter.email.toLowerCase().includes(searchLower) ||
      (adopter.cpf && adopter.cpf.includes(searchLower)) ||
      (adopter.telefone && adopter.telefone.includes(searchLower))
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
          Adotantes
        </Typography>
        {(isAdmin || isEmployee) && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/adopters/new')}
          >
            Novo Adotante
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
            placeholder="Buscar adotantes..."
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
                <TableCell>Email</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>CPF</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAdopters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      Nenhum adotante encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAdopters.map((adopter) => (
                  <TableRow key={adopter.id} hover>
                    <TableCell>
                      <Avatar src={adopter.foto} sx={{ width: 40, height: 40 }}>
                        {adopter.nome.charAt(0).toUpperCase()}
                      </Avatar>
                    </TableCell>
                    <TableCell>{adopter.nome}</TableCell>
                    <TableCell>{adopter.email}</TableCell>
                    <TableCell>{adopter.telefone || '-'}</TableCell>
                    <TableCell>{adopter.cpf || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={adopter.ativo ? 'Ativo' : 'Inativo'}
                        color={adopter.ativo ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleMenuOpen(adopter.id, e)}
                        size="small"
                      >
                        <MoreVert />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl[adopter.id]}
                        open={Boolean(anchorEl[adopter.id])}
                        onClose={() => handleMenuClose(adopter.id)}
                      >
                        <MenuItem onClick={() => handleView(adopter.id)}>
                          <Visibility sx={{ mr: 1 }} fontSize="small" />
                          Ver Detalhes
                        </MenuItem>
                        {isAdmin && (
                          <MenuItem onClick={() => handleRemoveRole(adopter.id)}>
                            <Delete sx={{ mr: 1 }} fontSize="small" />
                            Remover Role de Adotante
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

