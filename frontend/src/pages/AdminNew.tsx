import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
} from '@mui/material';
import { ArrowBack, Save, PersonAdd, ExpandLess } from '@mui/icons-material';
import Fuse from 'fuse.js';
import { adminService } from '../services/admin.service';
import { userService, UserCreate } from '../services/user.service';
import { projectService } from '../services/project.service';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { AdminCreate } from '../types';
import { User, Project } from '../types';

export const AdminNew = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedProject } = useProject();
  const { hasRole, user } = useAuth();
  const [selectedProjectState, setSelectedProjectState] = useState<Project | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  
  // Campos para novo usuário
  const [newUserNome, setNewUserNome] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserCpf, setNewUserCpf] = useState('');
  const [newUserTelefone, setNewUserTelefone] = useState('');

  // Campos de Administrador
  const [observacao, setObservacao] = useState('');

  const isSuperAdmin = hasRole('SUPERADMIN');

  // Verificar se há projetoId na URL ou nos params
  useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/projects');
      return;
    }

    const loadData = async () => {
      await loadProjects();
      await loadUsers();
    };

    loadData();
  }, []);

  // Selecionar projeto quando a lista for carregada ou mudar a URL
  useEffect(() => {
    if (projects.length === 0) return;

    const searchParams = new URLSearchParams(location.search);
    const projetoIdFromQuery = searchParams.get('projetoId');
    const projetoIdFromParams = location.pathname.match(/\/projects\/([^/]+)\/admin\/new/)?.[1];
    const projetoId = projetoIdFromParams || projetoIdFromQuery;

    if (projetoId) {
      const projeto = projects.find(p => p.id === projetoId);
      if (projeto && projeto.id !== selectedProjectState?.id) {
        setSelectedProjectState(projeto);
      }
    } else if (selectedProject && selectedProject.id !== selectedProjectState?.id) {
      setSelectedProjectState(selectedProject);
    }
  }, [projects, location.search, location.pathname, selectedProject]);

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

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await projectService.getAll();
      setProjects(response.data || []);
    } catch (err: any) {
      console.error('Erro ao carregar projetos:', err);
      setError('Erro ao carregar projetos. Tente novamente.');
    } finally {
      setLoadingProjects(false);
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
    return results.map(result => result.item);
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
        telefone: newUserTelefone.trim().replace(/\D/g, '') || undefined,
        roles: [],
      };

      const response = await userService.create(userData);
      const newUser = response.data!;

      setUsers([...users, newUser]);
      setSelectedUser(newUser);
      setShowNewUserForm(false);
      
      // Limpar campos
      setNewUserNome('');
      setNewUserEmail('');
      setNewUserCpf('');
      setNewUserTelefone('');
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        'Erro ao criar usuário. Verifique os dados e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Se o formulário de novo usuário estiver aberto, não submeter ainda
    // (será tratado no onClick do botão)
    if (showNewUserForm) {
      return;
    }

    // Validação quando usar usuário existente
    if (!selectedUser) {
      setError('Selecione um usuário ou crie um novo');
      return;
    }

    if (!selectedProjectState) {
      setError('Selecione um projeto');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const adminData: AdminCreate = {
        id_usuario: selectedUser.id,
        id_projeto: selectedProjectState.id,
        observacao: observacao.trim() || undefined,
      };

      await adminService.create(adminData);
      navigate('/projects');
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        'Erro ao cadastrar administrador. Verifique os dados e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/projects')}
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
        <Typography variant="h4" component="h1">
          Cadastrar Administrador de Projeto
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={(e) => { e.preventDefault(); }} noValidate>
          <Grid container spacing={3}>
            {/* Seleção de Projeto */}
            <Grid item xs={12}>
              <Autocomplete
                options={projects}
                value={selectedProjectState}
                onChange={(_, newValue) => setSelectedProjectState(newValue)}
                getOptionLabel={(option) => option.nome || ''}
                loading={loadingProjects}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => {
                  const isDisabled = !!selectedProject ||
                    !!location.pathname.match(/\/projects\/([^/]+)\/admin\/new/) ||
                    !!new URLSearchParams(location.search).get('projetoId');
                  
                  return (
                    <TextField
                      {...params}
                      label="Projeto *"
                      required={false}
                      helperText="Selecione o projeto para o qual o administrador será atribuído"
                    />
                  );
                }}
                disabled={
                  !!selectedProject ||
                  !!location.pathname.match(/\/projects\/([^/]+)\/admin\/new/) ||
                  !!new URLSearchParams(location.search).get('projetoId')
                }
              />
            </Grid>

            {/* Seleção/Criação de Usuário */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={showNewUserForm ? <ExpandLess /> : <PersonAdd />}
                  onClick={() => {
                    setShowNewUserForm(!showNewUserForm);
                    if (showNewUserForm) {
                      // Limpar campos quando fechar o formulário
                      setNewUserNome('');
                      setNewUserEmail('');
                      setNewUserCpf('');
                      setNewUserTelefone('');
                    } else {
                      // Limpar usuário selecionado quando abrir o formulário
                      setSelectedUser(null);
                    }
                  }}
                  sx={{ mb: 2 }}
                >
                  {showNewUserForm
                    ? 'Usar usuário existente'
                    : 'Criar novo usuário'}
                </Button>
              </Box>

              {showNewUserForm ? (
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
                        helperText="11 dígitos (com DDD)"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ) : null}

              {!showNewUserForm ? (
                <Autocomplete
                  options={filteredUsers}
                  value={selectedUser}
                  onChange={(_, newValue) => setSelectedUser(newValue)}
                  getOptionLabel={(option) =>
                    option
                      ? `${option.nome}${option.email ? ` - ${option.email}` : ''}`
                      : ''
                  }
                  loading={loadingUsers}
                  filterOptions={(options, { inputValue }) => {
                    if (!inputValue) return options;
                    const results = fuse.search(inputValue);
                    return results.map((result) => result.item);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Usuário *"
                      required={false}
                      helperText="Busque por nome, email ou CPF"
                      placeholder="Digite para buscar..."
                    />
                  )}
                />
              ) : null}
            </Grid>

            {/* Observação */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observação"
                multiline
                rows={4}
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                helperText="Observações sobre o administrador deste projeto (opcional)"
              />
            </Grid>

            {/* Botões */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/projects')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                  disabled={loading}
                  onClick={async () => {
                    // Validação manual antes de submeter
                    if (showNewUserForm) {
                      // Validar campos do novo usuário
                      if (!newUserNome.trim()) {
                        setError('Nome é obrigatório');
                        return;
                      }
                      if (!newUserEmail.trim()) {
                        setError('Email é obrigatório');
                        return;
                      }
                      // Validar CPF apenas se fornecido
                      if (newUserCpf.trim() && newUserCpf.replace(/\D/g, '').length !== 11) {
                        setError('CPF deve ter 11 dígitos');
                        return;
                      }

                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      if (!emailRegex.test(newUserEmail.trim())) {
                        setError('Email inválido');
                        return;
                      }

                      if (newUserCpf.replace(/\D/g, '').length !== 11) {
                        setError('CPF deve ter 11 dígitos');
                        return;
                      }

                      // Criar usuário
                      await handleCreateUser();
                    } else {
                      // Validar campos do formulário principal
                      if (!selectedUser) {
                        setError('Selecione um usuário ou crie um novo');
                        return;
                      }
                      if (!selectedProjectState) {
                        setError('Selecione um projeto');
                        return;
                      }

                      // Submeter formulário
                      await handleSubmit();
                    }
                  }}
                >
                  {loading 
                    ? 'Salvando...' 
                    : showNewUserForm 
                    ? 'Criar Usuário e Continuar' 
                    : 'Salvar'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

