import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  MenuItem,
  Divider,
  IconButton,
  Menu,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { Grid } from '../components/Grid';
import {
  ArrowBack,
  Save,
  Edit,
  Delete,
  MoreVert,
} from '@mui/icons-material';
import { donorService } from '../services/donor.service';
import { donationService } from '../services/donation.service';
import { userService } from '../services/user.service';
import { useAuth } from '../contexts/AuthContext';
import { Donor, DonorUpdate } from '../types/Donor';
import { Frequencia } from '../types';
import { Donation } from '../types/Donation';
import { User } from '../types/User';

export const DonorDetails = () => {
  const navigate = useNavigate();
  const { usuarioId, projetoId } = useParams<{ usuarioId: string; projetoId: string }>();
  const { hasRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [donor, setDonor] = useState<Donor | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // Form fields
  const [frequencia, setFrequencia] = useState<Frequencia>('pontual');
  const [dtLembrete, setDtLembrete] = useState('');
  const [ltData, setLtData] = useState('');
  const [pxData, setPxData] = useState('');
  const [observacao, setObservacao] = useState('');

  const isAdmin = hasRole('ADMINISTRADOR') || hasRole('SUPERADMIN');
  const isEmployee = hasRole('FUNCIONARIO');

  useEffect(() => {
    if (usuarioId && projetoId) {
      loadDonor();
      loadDonations();
    }
  }, [usuarioId, projetoId]);

  const loadDonor = async () => {
    if (!usuarioId || !projetoId) return;

    try {
      setLoading(true);
      setError(null);

      const donorData = await donorService.getById(usuarioId, projetoId);
      setDonor(donorData);

      // Carregar dados do usuário
      try {
        const userResponse = await userService.getById(usuarioId);
        setUser(userResponse.data);
      } catch (err) {
        console.error('Erro ao carregar usuário:', err);
      }

      // Preencher campos do formulário
      setFrequencia(donorData.frequencia || 'pontual');
      setDtLembrete(donorData.dt_lembrete || '');
      setLtData(donorData.lt_data || '');
      setPxData(donorData.px_data || '');
      setObservacao(donorData.observacao || '');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar doador');
    } finally {
      setLoading(false);
    }
  };

  const loadDonations = async () => {
    if (!usuarioId) return;

    try {
      const donationsData = await donationService.getByUser(usuarioId);
      setDonations(donationsData);
    } catch (err) {
      console.error('Erro ao carregar doações:', err);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setEditing(true);
    handleMenuClose();
  };

  const handleCancel = () => {
    setEditing(false);
    // Restaurar valores originais
    if (donor) {
      setFrequencia(donor.frequencia || 'pontual');
      setDtLembrete(donor.dt_lembrete || '');
      setLtData(donor.lt_data || '');
      setPxData(donor.px_data || '');
      setObservacao(donor.observacao || '');
    }
  };

  const handleSave = async () => {
    if (!usuarioId || !projetoId || !donor) return;

    try {
      setSaving(true);
      setError(null);

      const updateData: DonorUpdate = {
        frequencia,
        dt_lembrete: dtLembrete || undefined,
        lt_data: ltData || undefined,
        px_data: pxData || undefined,
        observacao: observacao.trim() || undefined,
      };

      await donorService.update(usuarioId, projetoId, updateData);
      setEditing(false);
      await loadDonor();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao atualizar doador');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!usuarioId || !projetoId) return;

    if (!window.confirm('Tem certeza que deseja remover este doador?')) {
      handleMenuClose();
      return;
    }

    try {
      await donorService.delete(usuarioId, projetoId);
      navigate('/donors');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao remover doador');
    }
    handleMenuClose();
  };

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

  if (!donor || !user) {
    return (
      <Box>
        <Alert severity="error">Doador não encontrado</Alert>
        <Button onClick={() => navigate('/donors')} sx={{ mt: 2 }}>
          Voltar para Lista
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/donors')}
            sx={{ mr: 2 }}
          >
            Voltar
          </Button>
          <Typography variant="h4" component="h1">
            Detalhes do Doador
          </Typography>
        </Box>

        {!editing && (isAdmin || isEmployee) && (
          <>
            <IconButton onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={handleEdit}>
                <Edit sx={{ mr: 1 }} fontSize="small" />
                Editar
              </MenuItem>
              {isAdmin && (
                <MenuItem onClick={handleDelete}>
                  <Delete sx={{ mr: 1 }} fontSize="small" />
                  Excluir
                </MenuItem>
              )}
            </Menu>
          </>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Informações do Usuário */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Dados do Usuário
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box>
              <Typography><strong>Nome:</strong> {user.nome}</Typography>
              <Typography><strong>Email:</strong> {user.email}</Typography>
              {user.cpf && (
                <Typography><strong>CPF:</strong> {user.cpf}</Typography>
              )}
              {user.telefone && (
                <Typography><strong>Telefone:</strong> {user.telefone}</Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Dados do Doador */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Dados do Doador
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Frequência"
                  value={frequencia}
                  onChange={(e) => setFrequencia(e.target.value as Frequencia)}
                  disabled={!editing}
                >
                  <MenuItem value="mensal">Mensal</MenuItem>
                  <MenuItem value="pontual">Pontual</MenuItem>
                  <MenuItem value="eventual">Eventual</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Data de Lembrete"
                  type="date"
                  value={dtLembrete}
                  onChange={(e) => setDtLembrete(e.target.value)}
                  disabled={!editing}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Última Doação"
                  type="date"
                  value={ltData}
                  onChange={(e) => setLtData(e.target.value)}
                  disabled={!editing}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Próxima Doação"
                  type="date"
                  value={pxData}
                  onChange={(e) => setPxData(e.target.value)}
                  disabled={!editing}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                {editing ? (
                  <TextField
                    fullWidth
                    label="Observação"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    multiline
                    rows={3}
                    placeholder="Adicione observações sobre o doador..."
                  />
                ) : (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Observação
                    </Typography>
                    <Typography variant="body1">
                      {observacao || <em style={{ color: '#999' }}>Nenhuma observação</em>}
                    </Typography>
                  </Box>
                )}
              </Grid>

              {editing && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button variant="outlined" onClick={handleCancel} disabled={saving}>
                      Cancelar
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? <CircularProgress size={24} /> : 'Salvar'}
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Histórico de Doações */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Histórico de Doações
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {donations.length === 0 ? (
              <Typography color="text.secondary">
                Nenhuma doação registrada
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                      <TableRow>
                        <TableCell>Tipo de Ajuda</TableCell>
                        <TableCell>Valor</TableCell>
                        <TableCell>Data</TableCell>
                        <TableCell>Observação</TableCell>
                        <TableCell align="right">Ações</TableCell>
                      </TableRow>
                  </TableHead>
                  <TableBody>
                    {donations.map((donation) => (
                      <TableRow key={donation.id} hover>
                        <TableCell>
                          {donation.tp_ajuda ? (
                            <Chip label={donation.tp_ajuda} size="small" />
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {donation.tp_ajuda === 'Financeira' ? formatCurrency(donation.valor) : '-'}
                        </TableCell>
                        <TableCell>{formatDate(donation.data)}</TableCell>
                        <TableCell>{donation.observacao || '-'}</TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            onClick={() => navigate(`/donations/${donation.id}`)}
                          >
                            Ver Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

