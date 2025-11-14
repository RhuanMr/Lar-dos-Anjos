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
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import { ArrowBack, Save, Visibility, VisibilityOff } from '@mui/icons-material';
import { userService } from '../services/user.service';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';

export const SetPassword = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, hasRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isSuperAdmin = hasRole('SUPERADMIN');
  const isAdmin = hasRole('ADMINISTRADOR');
  const isOwnAccount = user?.id === id;

  // Verificar permissões
  const hasPermission = isSuperAdmin || isAdmin || isOwnAccount;

  useEffect(() => {
    if (id) {
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await userService.getById(id);
      if (response.data) {
        setTargetUser(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar dados do usuário');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!senha.trim()) {
      setError('Senha é obrigatória');
      return false;
    }

    if (senha.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    if (!id) {
      setError('ID do usuário não encontrado');
      return;
    }

    try {
      setSaving(true);

      await userService.setPassword(id, senha);
      setSuccess(true);
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        if (isOwnAccount) {
          navigate('/profile');
        } else {
          navigate(`/users/${id}`);
        }
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao definir senha';
      setError(errorMessage);
      console.error('Erro ao definir senha:', err.response?.data || err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!hasPermission) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          Você não tem permissão para definir senha para este usuário.
          Apenas SuperAdmin, Administrador ou o próprio usuário podem definir senha.
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
        <Button
          startIcon={<ArrowBack />}
          onClick={() => {
            if (isOwnAccount) {
              navigate('/profile');
            } else if (id) {
              navigate(`/users/${id}`);
            } else {
              navigate('/dashboard');
            }
          }}
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
        <Typography variant="h4" component="h1">
          {isOwnAccount ? 'Alterar Minha Senha' : `Definir Senha - ${targetUser?.nome || 'Usuário'}`}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Senha definida com sucesso! Redirecionando...
        </Alert>
      )}

      <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {isOwnAccount
                  ? 'Digite sua nova senha abaixo:'
                  : `Defina uma nova senha para ${targetUser?.nome || 'este usuário'}:`}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nova Senha"
                type={showPassword ? 'text' : 'password'}
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                disabled={saving || success}
                helperText="A senha deve ter pelo menos 6 caracteres"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirmar Senha"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                disabled={saving || success}
                helperText="Digite a senha novamente para confirmar"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    if (isOwnAccount) {
                      navigate('/profile');
                    } else if (id) {
                      navigate(`/users/${id}`);
                    } else {
                      navigate('/dashboard');
                    }
                  }}
                  disabled={saving || success}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                  disabled={saving || success}
                >
                  {saving ? 'Salvando...' : 'Salvar Senha'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

