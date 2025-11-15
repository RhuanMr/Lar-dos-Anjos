import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  MenuItem,
  Divider,
  IconButton,
  Menu,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Edit,
  Delete,
  MoreVert,
} from '@mui/icons-material';
import { donationService } from '../services/donation.service';
import { userService } from '../services/user.service';
import { useAuth } from '../contexts/AuthContext';
import { Donation, DonationUpdate, TipoAjuda, TipoPagamento } from '../types/Donation';
import { User } from '../types/User';

export const DonationDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { hasRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [donation, setDonation] = useState<Donation | null>(null);
  const [donor, setDonor] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // Form fields
  const [tpAjuda, setTpAjuda] = useState<TipoAjuda>('Financeira');
  const [tpPagamento, setTpPagamento] = useState<TipoPagamento>('Pix');
  const [valor, setValor] = useState('');
  const [itens, setItens] = useState('');
  const [data, setData] = useState('');
  const [observacao, setObservacao] = useState('');

  const isAdmin = hasRole('ADMINISTRADOR') || hasRole('SUPERADMIN');
  const isEmployee = hasRole('FUNCIONARIO');

  useEffect(() => {
    if (id) {
      loadDonation();
    }
  }, [id]);

  const loadDonation = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const donationData = await donationService.getById(id);
      setDonation(donationData);

      // Carregar dados do doador
      if (donationData.id_user) {
        try {
          const userResponse = await userService.getById(donationData.id_user);
          setDonor(userResponse.data);
        } catch (err) {
          console.error('Erro ao carregar doador:', err);
        }
      }

      // Preencher campos do formulário
      setTpAjuda(donationData.tp_ajuda || 'Financeira');
      setTpPagamento(donationData.tp_pagamento || 'Pix');
      setValor(donationData.valor?.toString() || '');
      setItens(donationData.itens || '');
      setData(donationData.data || '');
      setObservacao(donationData.observacao || '');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar doação');
    } finally {
      setLoading(false);
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
    if (donation) {
      setTpAjuda(donation.tp_ajuda || 'Financeira');
      setTpPagamento(donation.tp_pagamento || 'Pix');
      setValor(donation.valor?.toString() || '');
      setItens(donation.itens || '');
      setData(donation.data || '');
      setObservacao(donation.observacao || '');
    }
  };

  const handleSave = async () => {
    if (!id || !donation) return;

    try {
      setSaving(true);
      setError(null);

      const updateData: DonationUpdate = {
        tp_ajuda: tpAjuda,
        tp_pagamento: tpAjuda === 'Financeira' ? tpPagamento : undefined,
        valor: tpAjuda === 'Financeira' && valor ? parseFloat(valor.replace(',', '.')) : undefined,
        itens: tpAjuda === 'Itens' ? itens.trim() : undefined,
        data: data || undefined,
        observacao: observacao.trim() || undefined,
      };

      await donationService.update(id, updateData);
      setEditing(false);
      await loadDonation();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao atualizar doação');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    if (!window.confirm('Tem certeza que deseja excluir esta doação?')) {
      handleMenuClose();
      return;
    }

    try {
      await donationService.delete(id);
      navigate('/donations');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao excluir doação');
    }
    handleMenuClose();
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

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

  if (!donation) {
    return (
      <Box>
        <Alert severity="error">Doação não encontrada</Alert>
        <Button onClick={() => navigate('/donations')} sx={{ mt: 2 }}>
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
            onClick={() => navigate('/donations')}
            sx={{ mr: 2 }}
          >
            Voltar
          </Button>
          <Typography variant="h4" component="h1">
            Detalhes da Doação
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

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Informações do Doador */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Doador
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {donor ? (
              <Box>
                <Typography><strong>Nome:</strong> {donor.nome}</Typography>
                <Typography><strong>Email:</strong> {donor.email}</Typography>
                {donor.telefone && (
                  <Typography><strong>Telefone:</strong> {donor.telefone}</Typography>
                )}
              </Box>
            ) : (
              <Typography color="text.secondary">Doação Anônima</Typography>
            )}
          </Grid>

          {/* Dados da Doação */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Dados da Doação
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Tipo de Ajuda"
              value={tpAjuda}
              onChange={(e) => {
                const newTpAjuda = e.target.value as TipoAjuda;
                setTpAjuda(newTpAjuda);
                // Limpar campos específicos quando mudar o tipo
                if (newTpAjuda !== 'Financeira') {
                  setValor('');
                  setTpPagamento('Pix');
                }
                if (newTpAjuda !== 'Itens') {
                  setItens('');
                }
              }}
              disabled={!editing}
            >
              <MenuItem value="Financeira">Financeira</MenuItem>
              <MenuItem value="Itens">Itens</MenuItem>
              <MenuItem value="Outro">Outro</MenuItem>
            </TextField>
          </Grid>

          {tpAjuda === 'Financeira' && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Tipo de Pagamento"
                  value={tpPagamento}
                  onChange={(e) => setTpPagamento(e.target.value as TipoPagamento)}
                  disabled={!editing}
                >
                  <MenuItem value="Pix">Pix</MenuItem>
                  <MenuItem value="Dinheiro">Dinheiro</MenuItem>
                  <MenuItem value="Transferencia">Transferência</MenuItem>
                  <MenuItem value="Outro">Outro</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Valor"
                  value={editing ? valor : (donation.valor?.toString() || '')}
                  onChange={(e) => setValor(e.target.value)}
                  disabled={!editing}
                  placeholder="0.00"
                  helperText={!editing && donation.valor ? formatCurrency(donation.valor) : undefined}
                />
              </Grid>
            </>
          )}

          {tpAjuda === 'Itens' && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Itens Doados"
                value={editing ? itens : (donation.itens || '')}
                onChange={(e) => setItens(e.target.value)}
                disabled={!editing}
                multiline
                rows={3}
                placeholder="Liste os itens doados..."
              />
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              disabled={!editing}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Observação"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              disabled={!editing}
              multiline
              rows={3}
            />
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
    </Box>
  );
};

