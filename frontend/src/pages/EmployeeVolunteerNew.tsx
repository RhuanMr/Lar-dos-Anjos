import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Autocomplete,
  FormControlLabel,
  Switch,
  Collapse,
} from '@mui/material';
import { ArrowBack, Save, PersonAdd, ExpandLess } from '@mui/icons-material';
import Fuse from 'fuse.js';
import { employeeService } from '../services/employee.service';
import { volunteerService } from '../services/volunteer.service';
import { userService, UserCreate } from '../services/user.service';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { EmployeeCreate, VolunteerCreate, Frequencia } from '../types';
import { User } from '../types';

export const EmployeeVolunteerNew = () => {
  const navigate = useNavigate();
  const { selectedProject } = useProject();
  const { hasRole } = useAuth();
  const [type, setType] = useState<'employee' | 'volunteer'>('employee');
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
  const [creatingUser, setCreatingUser] = useState(false);

  // Campos de Funcionário
  const [privilegios, setPrivilegios] = useState(false);
  const [funcao, setFuncao] = useState('');
  const [observacaoFunc, setObservacaoFunc] = useState('');

  // Campos de Voluntário
  const [servico, setServico] = useState('');
  const [frequencia, setFrequencia] = useState<Frequencia>('mensal');
  const [ltData, setLtData] = useState('');
  const [pxData, setPxData] = useState('');

  const isAdmin = hasRole('ADMINISTRADOR') || hasRole('SUPERADMIN');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/employees-volunteers');
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
      // Não mostrar erro aqui, apenas logar, pois pode ser problema temporário
      // O usuário ainda pode criar um novo usuário
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
      threshold: 0.3, // Limite de similaridade (0 = exato, 1 = qualquer coisa)
      includeScore: true,
      minMatchCharLength: 2,
    }),
    []
  );

  const fuse = useMemo(() => {
    if (users.length === 0) return null;
    return new Fuse(users, fuseOptions);
  }, [users, fuseOptions]);

  // Função de filtro para o Autocomplete usando Fuse.js
  const filterOptions = (options: User[], { inputValue }: { inputValue: string }) => {
    if (!inputValue || !fuse) {
      return options;
    }

    const results = fuse.search(inputValue);
    return results.map((result) => result.item);
  };

  const handleCreateUser = async () => {
    if (!newUserNome.trim() || !newUserEmail.trim() || !newUserCpf.trim()) {
      setError('Preencha nome, email e CPF');
      return;
    }

    const cpfLimpo = newUserCpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      setError('CPF deve ter exatamente 11 dígitos');
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserEmail)) {
      setError('Email inválido');
      return;
    }

    try {
      setCreatingUser(true);
      setError(null);

      const userData: UserCreate = {
        nome: newUserNome.trim(),
        email: newUserEmail.trim().toLowerCase(),
        cpf: cpfLimpo,
        telefone: newUserTelefone.replace(/\D/g, '') || undefined,
        roles: type === 'employee' ? ['FUNCIONARIO'] : ['VOLUNTARIO'],
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
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao criar usuário';
      setError(errorMessage);
      console.error('Erro ao criar usuário:', err.response?.data || err);
    } finally {
      setCreatingUser(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Se o formulário de novo usuário estiver aberto, não submeter
    if (showNewUserForm) {
      setError('Finalize a criação do usuário primeiro ou cancele');
      return;
    }
    
    if (!selectedProject || !selectedUser) {
      setError('Selecione um usuário');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (type === 'employee') {
        const data: EmployeeCreate = {
          id_usuario: selectedUser.id,
          id_projeto: selectedProject.id,
          privilegios,
          funcao: funcao || undefined,
          observacao: observacaoFunc || undefined,
        };
        await employeeService.create(data);
        
        // Se o funcionário tem privilégios, redirecionar para página de compartilhamento do link de senha
        if (privilegios) {
          navigate('/share-password-link', {
            state: {
              userId: selectedUser.id,
              userName: selectedUser.nome,
              userEmail: selectedUser.email,
            },
          });
          return;
        }
      } else {
        const data: VolunteerCreate = {
          id_usuario: selectedUser.id,
          id_projeto: selectedProject.id,
          servico: servico || undefined,
          frequencia,
          lt_data: ltData || undefined,
          // px_data é opcional - só incluir se tiver valor
          ...(pxData && pxData.trim() ? { px_data: pxData } : {}),
        };
        await volunteerService.create(data);
      }

      navigate('/employees-volunteers');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/employees-volunteers')}
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
        <Typography variant="h4" component="h1">
          Cadastro de Funcionário/Voluntário
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            {/* Tipo */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={type}
                  label="Tipo"
                  onChange={(e) => setType(e.target.value as 'employee' | 'volunteer')}
                >
                  <MenuItem value="employee">Funcionário</MenuItem>
                  <MenuItem value="volunteer">Voluntário</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Usuário */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Autocomplete
                  options={users}
                  filterOptions={filterOptions}
                  getOptionLabel={(option) => {
                    const cpfDisplay = option.cpf ? ` - CPF: ${option.cpf}` : '';
                    return `${option.nome} (${option.email})${cpfDisplay}`;
                  }}
                  value={selectedUser}
                  onChange={(_, newValue) => {
                    setSelectedUser(newValue);
                    setShowNewUserForm(false);
                  }}
                  loading={loadingUsers}
                  disabled={showNewUserForm}
                  noOptionsText="Nenhum usuário encontrado"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Usuário"
                      required={!showNewUserForm}
                      placeholder="Busque por nome, email ou CPF..."
                      helperText={
                        showNewUserForm
                          ? 'Preencha os dados abaixo para criar um novo usuário'
                          : users.length === 0
                          ? 'Nenhum usuário encontrado. Crie um novo usuário abaixo.'
                          : 'Digite para buscar por nome, email ou CPF'
                      }
                    />
                  )}
                />
              </Box>
              
              <Button
                variant="outlined"
                startIcon={showNewUserForm ? <ExpandLess /> : <PersonAdd />}
                onClick={() => {
                  setShowNewUserForm(!showNewUserForm);
                  if (!showNewUserForm) {
                    setSelectedUser(null);
                  }
                }}
                fullWidth
                sx={{ mb: 2 }}
              >
                {showNewUserForm ? 'Cancelar criação de usuário' : 'Criar novo usuário'}
              </Button>

              <Collapse in={showNewUserForm}>
                <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                  <Typography variant="h6" gutterBottom>
                    Dados do Novo Usuário
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Nome"
                        value={newUserNome}
                        onChange={(e) => setNewUserNome(e.target.value)}
                        required={showNewUserForm}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        required={showNewUserForm}
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
                        error={newUserCpf.length > 0 && newUserCpf.replace(/\D/g, '').length !== 11}
                        helperText={
                          newUserCpf.length > 0 && newUserCpf.replace(/\D/g, '').length !== 11
                            ? 'CPF deve ter exatamente 11 dígitos'
                            : 'Apenas números (11 dígitos)'
                        }
                        required={showNewUserForm}
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
                        helperText="Apenas números (DDD + número, máximo 11 dígitos)"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        onClick={(e) => {
                          e.preventDefault();
                          handleCreateUser();
                        }}
                        disabled={
                          creatingUser ||
                          !newUserNome.trim() ||
                          !newUserEmail.trim() ||
                          newUserCpf.replace(/\D/g, '').length !== 11
                        }
                        startIcon={creatingUser ? <CircularProgress size={20} /> : <PersonAdd />}
                      >
                        {creatingUser ? 'Criando...' : 'Criar Usuário'}
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Collapse>
            </Grid>

            {/* Campos específicos de Funcionário */}
            {type === 'employee' && (
              <>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={privilegios}
                        onChange={(e) => setPrivilegios(e.target.checked)}
                      />
                    }
                    label="Conceder Privilégios de Acesso"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Função"
                    value={funcao}
                    onChange={(e) => setFuncao(e.target.value)}
                    placeholder="Ex: Veterinário, Assistente, etc."
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observação"
                    value={observacaoFunc}
                    onChange={(e) => setObservacaoFunc(e.target.value)}
                    multiline
                    rows={3}
                  />
                </Grid>
              </>
            )}

            {/* Campos específicos de Voluntário */}
            {type === 'volunteer' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Serviço Realizado"
                    value={servico}
                    onChange={(e) => setServico(e.target.value)}
                    placeholder="Ex: Limpeza e cuidados, Passeios, etc."
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Frequência</InputLabel>
                    <Select
                      value={frequencia}
                      label="Frequência"
                      onChange={(e) => setFrequencia(e.target.value as Frequencia)}
                    >
                      <MenuItem value="mensal">Mensal</MenuItem>
                      <MenuItem value="pontual">Pontual</MenuItem>
                      <MenuItem value="eventual">Eventual</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Data do Último Serviço"
                    type="date"
                    value={ltData}
                    onChange={(e) => setLtData(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Data do Próximo Serviço"
                    type="date"
                    value={pxData}
                    onChange={(e) => setPxData(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}

            {/* Botões */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/employees-volunteers')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                  disabled={loading || !selectedUser}
                >
                  Salvar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

