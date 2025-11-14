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
  Chip,
} from '@mui/material';
import {
  Add,
  Search,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  AttachMoney,
} from '@mui/icons-material';
import { donationService } from '../services/donation.service';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { Donation } from '../types/Donation';

export const DonationsList = () => {
  const navigate = useNavigate();
  const { selectedProject } = useProject();
  const { hasRole } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});

  const isAdmin = hasRole('ADMINISTRADOR') || hasRole('SUPERADMIN');
  const isEmployee = hasRole('FUNCIONARIO');
  const isDonor = hasRole('DOADOR');

  useEffect(() => {
    loadData();
  }, [selectedProject]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      let data: Donation[];
      if (selectedProject) {
        data = await donationService.getByProject(selectedProject.id);
      } else {
        data = await donationService.getAll();
      }
      setDonations(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar doações');
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
    navigate(`/donations/${id}`);
    handleMenuClose(id);
  };

  const handleEdit = (id: string) => {
    navigate(`/donations/${id}/edit`);
    handleMenuClose(id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover esta doação?')) {
      handleMenuClose(id);
      return;
    }

    try {
      await donationService.delete(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao remover doação');
    }
    handleMenuClose(id);
  };

  const filteredDonations = donations.filter((donation) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      donation.id.toLowerCase().includes(searchLower) ||
      (donation.itens && donation.itens.toLowerCase().includes(searchLower)) ||
      (donation.observacao && donation.observacao.toLowerCase().includes(searchLower))
    );
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
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
          Doações
        </Typography>
        {(isAdmin || isEmployee || isDonor) && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/donations/new')}
          >
            Nova Doação
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
            placeholder="Buscar doações..."
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
                <TableCell>Tipo de Ajuda</TableCell>
                <TableCell>Tipo de Pagamento</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Itens</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Observação</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDonations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      Nenhuma doação encontrada
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDonations.map((donation) => (
                  <TableRow key={donation.id} hover>
                    <TableCell>
                      {donation.tp_ajuda ? (
                        <Chip label={donation.tp_ajuda} size="small" />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{donation.tp_pagamento || '-'}</TableCell>
                    <TableCell>{formatCurrency(donation.valor)}</TableCell>
                    <TableCell>{donation.itens || '-'}</TableCell>
                    <TableCell>{formatDate(donation.data)}</TableCell>
                    <TableCell>{donation.observacao || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleMenuOpen(donation.id, e)}
                        size="small"
                      >
                        <MoreVert />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl[donation.id]}
                        open={Boolean(anchorEl[donation.id])}
                        onClose={() => handleMenuClose(donation.id)}
                      >
                        <MenuItem onClick={() => handleView(donation.id)}>
                          <Visibility sx={{ mr: 1 }} fontSize="small" />
                          Ver Detalhes
                        </MenuItem>
                        {(isAdmin || isEmployee) && (
                          <>
                            <MenuItem onClick={() => handleEdit(donation.id)}>
                              <Edit sx={{ mr: 1 }} fontSize="small" />
                              Editar
                            </MenuItem>
                            {isAdmin && (
                              <MenuItem onClick={() => handleDelete(donation.id)}>
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

