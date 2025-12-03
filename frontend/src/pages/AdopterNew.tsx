import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Autocomplete,
  Collapse,
} from '@mui/material';
import { ArrowBack, Save, PersonAdd, ExpandLess, ExpandMore } from '@mui/icons-material';
import Fuse from 'fuse.js';
import { userService, UserCreate } from '../services/user.service';
import { adopterService } from '../services/adopter.service';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';

export const AdopterNew = () => {
  const navigate = useNavigate();
  const { hasRole, user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewUserForm, setShowNewUserForm] = useState(false);

  // Campos para novo usuário
  const [newUserNome, setNewUserNome] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserCpf, setNewUserCpf] = useState('');
  const [newUserTelefone, setNewUserTelefone] = useState('');

  const isAdmin = hasRole('ADMINISTRADOR') || hasRole('SUPERADMIN');
  const isEmployee = hasRole('FUNCIONARIO');

  useEffect(() => {
    if (!isAdmin && !isEmployee) {
      navigate('/dashboard');
      return;
    }

    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await userService.getAll();
      setUsers(response.data || []);
    } catch (err: any) {
      console.error('Erro ao carregar usuários:', err);
      setError('Erro ao carregar usuários. Tente novamente.');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Configuração do Fuse.js para busca fuzzy
  const fuseOptions = useMemo(
    () => ({
      keys: [
        { name: 'nome', weight: 0.4 },
        { name: 'email', weight: 0.3 },
        { name: 'cpf', weight: 0.3 },
      ],
      threshold: 0.3,
      includeScore: true,
      minMatchCharLength: 2,
    }),
    []
  );

  const fuse = useMemo(() => {
    return new Fuse(users, fuseOptions);
  }, [users, fuseOptions]);

  const filteredUsers = useMemo(() => {
    if (!selectedUser || !selectedUser.nome) return users;
    const results = fuse.search(selectedUser.nome);
    return results.map((result) => result.item);
  }, [selectedUser, fuse, users]);

  const handleCreateUser = async () => {
    if (!newUserNome.trim() || !newUserEmail.trim()) {
      setError('Nome e email são obrigatórios');
      return;
    }

    // Validar CPF apenas se fornecido
    let cpfLimpo: string | undefined = undefined;
    if (newUserCpf.trim()) {
      cpfLimpo = newUserCpf.replace(/\D/g, '');
      if (cpfLimpo.length !== 11) {
        setError('CPF deve ter 11 dígitos');
        return;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserEmail.trim())) {
      setError('Email inválido');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userData: UserCreate = {
        nome: newUserNome.trim(),
        email: newUserEmail.trim().toLowerCase(),
        cpf: cpfLimpo || undefined,
        telefone: newUserTelefone.replace(/\D/g, '') || undefined,
        roles: ['ADOTANTE'],
      };

      const response = await userService.create(userData);
      setSelectedUser(response.data);
      setShowNewUserForm(false);

      // Limpar campos
      setNewUserNome('');
      setNewUserEmail('');
      setNewUserCpf('');
      setNewUserTelefone('');

      // Recarregar lista de usuários
      await loadUsers();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || 'Erro ao criar usuário';
      setError(errorMessage);
      console.error('Erro ao criar usuário:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedUser) {
      setError('Selecione um usuário ou crie um novo');
      return;
    }

    // Verificar se o usuário já é adotante
    if (selectedUser.roles.includes('ADOTANTE')) {
      setError('Este usuário já é um adotante');
      return;
    }

    try {
      setLoading(true);

      await adopterService.registerAsAdopter({ id_usuario: selectedUser.id });

      navigate('/adopters');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || 'Erro ao cadastrar adotante';
      setError(errorMessage);
      console.error('Erro ao cadastrar adotante:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin && !isEmployee) {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/adopters')}
          variant="outlined"
        >
          Voltar
        </Button>
        <Typography variant="h4">Cadastrar Adotante</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Button
                  startIcon={showNewUserForm ? <ExpandLess /> : <ExpandMore />}
                  onClick={() => setShowNewUserForm(!showNewUserForm)}
                  variant="outlined"
                >
                  {showNewUserForm ? 'Ocultar' : 'Criar Novo Usuário'}
                </Button>
              </Box>

              <Collapse in={showNewUserForm}>
                <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                  <Typography variant="h6" gutterBottom>
                    Novo Usuário
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Nome *"
                        value={newUserNome}
                        onChange={(e) => setNewUserNome(e.target.value)}
                        required={false}
                        inputProps={{ 'aria-required': 'true' }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email *"
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        required={false}
                        inputProps={{ 'aria-required': 'true' }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="CPF"
                        value={newUserCpf}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 11) {
                            setNewUserCpf(value);
                          }
                        }}
                        inputProps={{ maxLength: 11, 'aria-required': 'true' }}
                        helperText="11 dígitos"
                        required={false}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Telefone"
                        value={newUserTelefone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 11) {
                            setNewUserTelefone(value);
                          }
                        }}
                        inputProps={{ maxLength: 11 }}
                        helperText="11 dígitos"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="button"
                        variant="contained"
                        onClick={handleCreateUser}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                      >
                        {loading ? 'Criando...' : 'Criar Usuário'}
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Collapse>
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                options={filteredUsers}
                getOptionLabel={(option) =>
                  `${option.nome}${option.email ? ` - ${option.email}` : ''}`
                }
                value={selectedUser}
                onChange={(_, newValue) => setSelectedUser(newValue)}
                loading={loadingUsers}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Selecionar Usuário *"
                    required
                    helperText="Busque por nome, email ou CPF"
                  />
                )}
                filterOptions={(options) => options}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => navigate('/adopters')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !selectedUser}
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                >
                  {loading ? 'Cadastrando...' : 'Cadastrar Adotante'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

