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
  Person,
} from '@mui/icons-material';
import { donorService } from '../services/donor.service';
import { userService } from '../services/user.service';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { Donor } from '../types/Donor';
import { User } from '../types/User';

interface DonorWithUser extends Donor {
  usuario?: User;
}

export const DonorsList = () => {
  const navigate = useNavigate();
  const { selectedProject } = useProject();
  const { hasRole } = useAuth();
  const [donors, setDonors] = useState<DonorWithUser[]>([]);
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

      let donorsData: Donor[];
      if (selectedProject) {
        donorsData = await donorService.getByProject(selectedProject.id);
      } else {
        donorsData = await donorService.getAll();
      }

      // Buscar dados dos usuários
      const usersResponse = await userService.getAll();
      const allUsers = usersResponse.data || [];

      const donorsWithUsers: DonorWithUser[] = donorsData.map((donor) => ({
        ...donor,
        usuario: allUsers.find((u) => u.id === donor.id_usuario),
      }));

      setDonors(donorsWithUsers);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar doadores');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (key: string, event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl({ ...anchorEl, [key]: event.currentTarget });
  };

  const handleMenuClose = (key: string) => {
    setAnchorEl({ ...anchorEl, [key]: null });
  };

  const handleView = (donor: DonorWithUser) => {
    navigate(`/donors/${donor.id_usuario}/${donor.id_projeto}`);
    handleMenuClose(`${donor.id_usuario}-${donor.id_projeto}`);
  };

  const handleEdit = (donor: DonorWithUser) => {
    navigate(`/donors/${donor.id_usuario}/${donor.id_projeto}/edit`);
    handleMenuClose(`${donor.id_usuario}-${donor.id_projeto}`);
  };

  const handleDelete = async (donor: DonorWithUser) => {
    if (!window.confirm('Tem certeza que deseja remover este doador?')) {
      handleMenuClose(`${donor.id_usuario}-${donor.id_projeto}`);
      return;
    }

    try {
      await donorService.delete(donor.id_usuario, donor.id_projeto);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao remover doador');
    }
    handleMenuClose(`${donor.id_usuario}-${donor.id_projeto}`);
  };

  const filteredDonors = donors.filter((donor) => {
    const searchLower = searchTerm.toLowerCase();
    const usuario = donor.usuario;
    return (
      (usuario?.nome && usuario.nome.toLowerCase().includes(searchLower)) ||
      (usuario?.email && usuario.email.toLowerCase().includes(searchLower)) ||
      (usuario?.cpf && usuario.cpf.includes(searchLower)) ||
      (donor.observacao && donor.observacao.toLowerCase().includes(searchLower))
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
          Doadores
        </Typography>
        {(isAdmin || isEmployee) && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/donors/new')}
          >
            Novo Doador
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
            placeholder="Buscar doadores..."
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
                <TableCell>Frequência</TableCell>
                <TableCell>Última Doação</TableCell>
                <TableCell>Próxima Doação</TableCell>
                <TableCell>Observação</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDonors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      Nenhum doador encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDonors.map((donor) => (
                  <TableRow key={`${donor.id_usuario}-${donor.id_projeto}`} hover>
                    <TableCell>
                      <Avatar src={donor.usuario?.foto} sx={{ width: 40, height: 40 }}>
                        {donor.usuario?.nome?.charAt(0).toUpperCase() || <Person />}
                      </Avatar>
                    </TableCell>
                    <TableCell>{donor.usuario?.nome || '-'}</TableCell>
                    <TableCell>{donor.usuario?.email || '-'}</TableCell>
                    <TableCell>
                      {donor.frequencia ? (
                        <Chip label={donor.frequencia} size="small" />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{formatDate(donor.lt_data)}</TableCell>
                    <TableCell>{formatDate(donor.px_data)}</TableCell>
                    <TableCell>{donor.observacao || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleMenuOpen(`${donor.id_usuario}-${donor.id_projeto}`, e)}
                        size="small"
                      >
                        <MoreVert />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl[`${donor.id_usuario}-${donor.id_projeto}`]}
                        open={Boolean(anchorEl[`${donor.id_usuario}-${donor.id_projeto}`])}
                        onClose={() => handleMenuClose(`${donor.id_usuario}-${donor.id_projeto}`)}
                      >
                        <MenuItem onClick={() => handleView(donor)}>
                          <Visibility sx={{ mr: 1 }} fontSize="small" />
                          Ver Detalhes
                        </MenuItem>
                        {(isAdmin || isEmployee) && (
                          <>
                            <MenuItem onClick={() => handleEdit(donor)}>
                              <Edit sx={{ mr: 1 }} fontSize="small" />
                              Editar
                            </MenuItem>
                            {isAdmin && (
                              <MenuItem onClick={() => handleDelete(donor)}>
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

