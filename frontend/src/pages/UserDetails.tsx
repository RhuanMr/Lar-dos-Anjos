import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Grid,
  Button,
  Alert,
  Divider,
  Chip,
  CircularProgress,
  MenuItem,
  Switch,
  FormControlLabel,
  InputAdornment,
} from '@mui/material';
import { ArrowBack, Edit, Save } from '@mui/icons-material';
import { userService } from '../services/user.service';
import { cepService } from '../services/cep.service';
import { useAuth } from '../contexts/AuthContext';
import { User, UserUpdate } from '../types';
import { UFS } from '../constants/ufs';

export const UserDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser, hasRole } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [buscandoCep, setBuscandoCep] = useState(false);

  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    data_nascimento: '',
    genero: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: '',
    ativo: true,
  });

  const canEdit = useMemo(() => {
    if (!currentUser || !id) return false;
    if (currentUser.id === id) return true;
    return hasRole('SUPERADMIN') || hasRole('ADMINISTRADOR');
  }, [currentUser, id, hasRole]);

  useEffect(() => {
    if (id) {
      loadUser(id);
    } else {
      setLoading(false);
      setError('ID do usuário não fornecido');
    }
  }, [id]);

  // Buscar endereço automaticamente quando CEP tiver 8 dígitos
  useEffect(() => {
    const buscarEnderecoPorCep = async () => {
      // Só buscar se estiver editando e o CEP tiver 8 dígitos
      if (!editing || buscandoCep) return;
      
      const cepLimpo = form.cep.replace(/\D/g, '');
      if (cepLimpo.length === 8 && cepService.validarCep(cepLimpo)) {
        setBuscandoCep(true);
        try {
          const endereco = await cepService.buscarCep(cepLimpo);
          if (endereco) {
            // Preencher campos automaticamente
            setForm((prev) => ({
              ...prev,
              endereco: endereco.endereco,
              bairro: endereco.bairro,
              cidade: endereco.cidade,
              uf: endereco.uf,
              // Manter complemento e numero se já estiverem preenchidos
            }));
          } else {
            setError('CEP não encontrado');
          }
        } catch (err: any) {
          console.error('Erro ao buscar CEP:', err);
          // Não mostrar erro para o usuário, apenas logar
        } finally {
          setBuscandoCep(false);
        }
      }
    };

    // Debounce: aguardar 500ms após o usuário parar de digitar
    const timeoutId = setTimeout(buscarEnderecoPorCep, 500);
    return () => clearTimeout(timeoutId);
  }, [form.cep, editing]);

  const loadUser = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await userService.getById(userId);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Usuário não encontrado');
      }
      const data = response.data;
      setUser(data);
      setForm({
        nome: data.nome || '',
        email: data.email || '',
        telefone: data.telefone || '',
        data_nascimento: data.data_nascimento || '',
        genero: data.genero || '',
        endereco: data.endereco || '',
        numero: data.numero || '',
        complemento: data.complemento || '',
        bairro: data.bairro || '',
        cidade: data.cidade || '',
        uf: data.uf || '',
        cep: data.cep || '',
        ativo: data.ativo,
      });
    } catch (err: any) {
      const message =
        err.response?.data?.error || err.message || 'Erro ao carregar usuário';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof typeof form,
    value: string | boolean
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!form.nome.trim()) {
      setError('Nome é obrigatório');
      return false;
    }
    if (!form.email.trim()) {
      setError('Email é obrigatório');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Email inválido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id || !validateForm()) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const payload: UserUpdate = {
        nome: form.nome.trim(),
        email: form.email.trim().toLowerCase(),
        telefone: form.telefone ? form.telefone.replace(/\D/g, '') : undefined,
        data_nascimento: form.data_nascimento || undefined,
        genero: form.genero || undefined,
        endereco: form.endereco || undefined,
        numero: form.numero || undefined,
        complemento: form.complemento || undefined,
        bairro: form.bairro || undefined,
        cidade: form.cidade || undefined,
        uf: form.uf || undefined,
        cep: form.cep ? form.cep.replace(/\D/g, '') : undefined,
        ativo: form.ativo,
      };

      const response = await userService.update(id, payload);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Erro ao atualizar usuário');
      }
      setUser(response.data);
      setSuccess('Usuário atualizado com sucesso');
      setEditing(false);
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.message ||
        'Erro ao atualizar usuário';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setForm({
        nome: user.nome || '',
        email: user.email || '',
        telefone: user.telefone || '',
        data_nascimento: user.data_nascimento || '',
        genero: user.genero || '',
        endereco: user.endereco || '',
        numero: user.numero || '',
        complemento: user.complemento || '',
        bairro: user.bairro || '',
        cidade: user.cidade || '',
        uf: user.uf || '',
        cep: user.cep || '',
        ativo: user.ativo,
      });
    }
    setEditing(false);
    setError(null);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !id) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          Usuário não encontrado.
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/users')}>
          Voltar para Lista
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/users')}>
          Voltar
        </Button>
        <Typography variant="h4" component="h1" sx={{ ml: 2 }}>
          {user.nome}
        </Typography>
        {canEdit && !editing && (
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => setEditing(true)}
            sx={{ ml: 'auto' }}
          >
            Editar
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      {!canEdit && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Você não tem permissão para editar os dados deste usuário, apenas
          visualizar.
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6">Informações Pessoais</Typography>
              <Divider sx={{ mt: 1, mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome Completo"
                value={form.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                disabled={!editing || saving}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={!editing || saving}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefone"
                value={form.telefone}
                onChange={(e) => {
                  if (!editing || saving) return;
                  const digits = e.target.value.replace(/\D/g, '');
                  if (digits.length <= 11) {
                    handleChange('telefone', digits);
                  }
                }}
                disabled={!editing || saving}
                helperText="Apenas números"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Data de Nascimento"
                type="date"
                value={form.data_nascimento}
                onChange={(e) => handleChange('data_nascimento', e.target.value)}
                disabled={!editing || saving}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Gênero"
                value={form.genero}
                onChange={(e) => handleChange('genero', e.target.value)}
                disabled={!editing || saving}
              >
                <MenuItem value="">Não informado</MenuItem>
                <MenuItem value="M">Masculino</MenuItem>
                <MenuItem value="F">Feminino</MenuItem>
                <MenuItem value="Outro">Outro</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2 }}>
                Endereço
              </Typography>
              <Divider sx={{ mt: 1, mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="CEP"
                value={form.cep}
                onChange={(e) => {
                  if (!editing || saving) return;
                  const digits = e.target.value.replace(/\D/g, '');
                  if (digits.length <= 8) {
                    handleChange('cep', digits);
                  }
                }}
                disabled={!editing || saving || buscandoCep}
                helperText={buscandoCep ? 'Buscando endereço...' : 'Apenas números (busca automática)'}
                InputProps={{
                  endAdornment: buscandoCep ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : null,
                }}
              />
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Endereço"
                value={form.endereco}
                onChange={(e) => handleChange('endereco', e.target.value)}
                disabled={!editing || saving}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Número"
                value={form.numero}
                onChange={(e) => handleChange('numero', e.target.value)}
                disabled={!editing || saving}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Complemento"
                value={form.complemento}
                onChange={(e) => handleChange('complemento', e.target.value)}
                disabled={!editing || saving}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Bairro"
                value={form.bairro}
                onChange={(e) => handleChange('bairro', e.target.value)}
                disabled={!editing || saving}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cidade"
                value={form.cidade}
                onChange={(e) => handleChange('cidade', e.target.value)}
                disabled={!editing || saving}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="UF"
                value={form.uf}
                onChange={(e) => handleChange('uf', e.target.value)}
                disabled={!editing || saving}
              >
                <MenuItem value="">Selecionar</MenuItem>
                {UFS.map((estado) => (
                  <MenuItem key={estado} value={estado}>
                    {estado}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mt: 2 }}>
                Status
              </Typography>
              <Divider sx={{ mt: 1, mb: 2 }} />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.ativo}
                    onChange={(e) => handleChange('ativo', e.target.checked)}
                    disabled={!editing || saving}
                  />
                }
                label={form.ativo ? 'Usuário Ativo' : 'Usuário Inativo'}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mt: 2 }}>
                Funções
              </Typography>
              <Divider sx={{ mt: 1, mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {user.roles.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Nenhuma role atribuída
                  </Typography>
                ) : (
                  user.roles.map((role) => (
                    <Chip key={role} label={role} color="primary" size="small" />
                  ))
                )}
              </Box>
            </Grid>

            {editing && canEdit && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                    disabled={saving}
                  >
                    Salvar
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};


