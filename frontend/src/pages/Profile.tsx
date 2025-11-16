import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Avatar,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Edit, Save, ArrowBack, PhotoCamera } from '@mui/icons-material';
import { userService, UserUpdate } from '../services/user.service';
import { uploadService } from '../services/upload.service';
import { cepService } from '../services/cep.service';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';
import { UFS } from '../constants/ufs';

export const Profile = () => {
  const navigate = useNavigate();
  const { user: currentUser, setUser: setCurrentUser } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [buscandoCep, setBuscandoCep] = useState(false);

  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: '',
  });

  useEffect(() => {
    if (currentUser) {
      loadUser(currentUser.id);
    } else {
      setLoading(false);
      setError('Usuário não encontrado');
    }
  }, [currentUser]);

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
        endereco: data.endereco || '',
        numero: data.numero || '',
        complemento: data.complemento || '',
        bairro: data.bairro || '',
        cidade: data.cidade || '',
        uf: data.uf || '',
        cep: data.cep || '',
      });
    } catch (err: any) {
      const message =
        err.response?.data?.error || err.message || 'Erro ao carregar perfil';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof form, value: string) => {
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
    if (!user || !validateForm()) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const payload: UserUpdate = {
        nome: form.nome.trim(),
        email: form.email.trim().toLowerCase(),
        telefone: form.telefone ? form.telefone.replace(/\D/g, '') : undefined,
        endereco: form.endereco || undefined,
        numero: form.numero || undefined,
        complemento: form.complemento || undefined,
        bairro: form.bairro || undefined,
        cidade: form.cidade || undefined,
        uf: form.uf || undefined,
        cep: form.cep ? form.cep.replace(/\D/g, '') : undefined,
      };

      const response = await userService.update(user.id, payload);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Erro ao atualizar perfil');
      }
      const updatedUser = response.data;
      setUser(updatedUser);
      
      // Atualizar usuário no contexto de autenticação
      if (setCurrentUser) {
        setCurrentUser(updatedUser);
      }
      
      setSuccess('Perfil atualizado com sucesso');
      setEditing(false);
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.message ||
        'Erro ao atualizar perfil';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Tipo de arquivo não permitido. Apenas imagens (JPEG, PNG, GIF, WebP) são aceitas.');
      return;
    }

    // Validar tamanho (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Arquivo muito grande. O tamanho máximo é 5MB.');
      return;
    }

    try {
      setUploadingPhoto(true);
      setError(null);

      const result = await uploadService.uploadUserPhoto(user.id, file);

      // Atualizar usuário com nova foto
      const updatedUser = { ...user, foto: result.url };
      setUser(updatedUser);
      
      // Atualizar usuário no contexto de autenticação
      if (setCurrentUser) {
        setCurrentUser(updatedUser);
      }
      
      setSuccess('Foto atualizada com sucesso');
    } catch (err: any) {
      const message =
        err.message || 'Erro ao fazer upload da foto';
      setError(message);
    } finally {
      setUploadingPhoto(false);
      // Limpar input
      event.target.value = '';
    }
  };

  const handleCancel = () => {
    if (user) {
      setForm({
        nome: user.nome || '',
        email: user.email || '',
        telefone: user.telefone || '',
        endereco: user.endereco || '',
        numero: user.numero || '',
        complemento: user.complemento || '',
        bairro: user.bairro || '',
        cidade: user.cidade || '',
        uf: user.uf || '',
        cep: user.cep || '',
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

  if (!user) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          Erro ao carregar perfil.
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')}>
          Voltar ao Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')}>
          Voltar
        </Button>
        <Typography variant="h4" component="h1" sx={{ ml: 2 }}>
          Meu Perfil
        </Typography>
        {!editing && (
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

      <Grid container spacing={3}>
        {/* Foto de Perfil */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                src={user.foto}
                sx={{
                  width: 150,
                  height: 150,
                  mx: 'auto',
                  mb: 2,
                }}
              >
                {user.nome?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              {editing && (
                <IconButton
                  color="primary"
                  aria-label="upload foto"
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 10,
                    right: 'calc(50% - 75px + 10px)',
                    bgcolor: 'background.paper',
                    '&:hover': {
                      bgcolor: 'background.paper',
                    },
                  }}
                  disabled={uploadingPhoto}
                >
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={handlePhotoUpload}
                  />
                  {uploadingPhoto ? (
                    <CircularProgress size={24} />
                  ) : (
                    <PhotoCamera />
                  )}
                </IconButton>
              )}
            </Box>
            <Typography variant="h6" gutterBottom>
              {user.nome}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {user.email}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
              {user.roles.map((role) => (
                <Chip key={role} label={role} color="primary" size="small" />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Formulário */}
        <Grid item xs={12} md={8}>
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

                {editing && (
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
        </Grid>
      </Grid>
    </Box>
  );
};

