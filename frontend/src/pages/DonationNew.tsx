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
  MenuItem,
  Divider,
  FormControlLabel,
  Checkbox,
  Collapse,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  PersonAdd,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import Fuse from 'fuse.js';
import { donationService } from '../services/donation.service';
import { donorService } from '../services/donor.service';
import { userService, UserCreate } from '../services/user.service';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { DonationCreate, TipoAjuda, TipoPagamento } from '../types/Donation';
import { User } from '../types/User';

export const DonationNew = () => {
  const navigate = useNavigate();
  const { selectedProject } = useProject();
  const { hasRole, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [selectedDonor, setSelectedDonor] = useState<User | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showNewDonorForm, setShowNewDonorForm] = useState(false);
  const [tpAjuda, setTpAjuda] = useState<TipoAjuda>('Financeira');
  const [tpPagamento, setTpPagamento] = useState<TipoPagamento>('Pix');
  const [valor, setValor] = useState('');
  const [itens, setItens] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [observacao, setObservacao] = useState('');

  // Campos para novo doador
  const [newDonorNome, setNewDonorNome] = useState('');
  const [newDonorEmail, setNewDonorEmail] = useState('');
  const [newDonorCpf, setNewDonorCpf] = useState('');
  const [newDonorTelefone, setNewDonorTelefone] = useState('');
  const [newDonorObservacao, setNewDonorObservacao] = useState('');

  // Data
  const [donors, setDonors] = useState<User[]>([]);
  const [loadingDonors, setLoadingDonors] = useState(false);

  const isAdmin = hasRole('ADMINISTRADOR') || hasRole('SUPERADMIN');
  const isEmployee = hasRole('FUNCIONARIO');
  const isDonor = hasRole('DOADOR');

  useEffect(() => {
    if (!isAdmin && !isEmployee && !isDonor) {
      navigate('/dashboard');
      return;
    }

    if (!selectedProject) {
      navigate('/projects');
      return;
    }

    loadDonors();
  }, [selectedProject]);

  const loadDonors = async () => {
    if (!selectedProject) return;

    try {
      setLoadingDonors(true);
      const usersResponse = await userService.getAll();
      const allUsers = usersResponse.data || [];
      // Filtrar apenas doadores
      const donorsList = allUsers.filter((user) =>
        user.roles.includes('DOADOR')
      );
      setDonors(donorsList);
    } catch (err: any) {
      console.error('Erro ao carregar doadores:', err);
      setError('Erro ao carregar doadores');
    } finally {
      setLoadingDonors(false);
    }
  };

  // Configuração do Fuse.js para busca fuzzy
  const fuseDonorsOptions = useMemo(
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

  const fuseDonors = useMemo(() => {
    return new Fuse(donors, fuseDonorsOptions);
  }, [donors, fuseDonorsOptions]);

  const filteredDonors = useMemo(() => {
    if (!selectedDonor || !selectedDonor.nome) return donors;
    const results = fuseDonors.search(selectedDonor.nome);
    return results.map((result) => result.item);
  }, [selectedDonor, fuseDonors, donors]);

  const handleCreateDonor = async () => {
    if (!newDonorNome.trim() || !newDonorEmail.trim()) {
      setError('Nome e email são obrigatórios');
      return;
    }

    // Validar CPF apenas se fornecido
    let cpfLimpo: string | undefined = undefined;
    if (newDonorCpf.trim()) {
      cpfLimpo = newDonorCpf.replace(/\D/g, '');
      if (cpfLimpo.length !== 11) {
        setError('CPF deve ter 11 dígitos');
        return;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newDonorEmail)) {
      setError('Email inválido');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Criar usuário
      const userData: UserCreate = {
        nome: newDonorNome.trim(),
        email: newDonorEmail.trim(),
        cpf: cpfLimpo || undefined,
        telefone: newDonorTelefone.replace(/\D/g, '') || undefined,
        roles: ['DOADOR'],
      };

      const userResponse = await userService.create(userData);
      const newUser = userResponse.data;

      // Criar doador
      if (selectedProject) {
        await donorService.create({
          id_usuario: newUser.id,
          id_projeto: selectedProject.id,
          observacao: newDonorObservacao.trim() || undefined,
        });
      }

      // Atualizar lista e selecionar novo doador
      await loadDonors();
      setSelectedDonor(newUser);
      setShowNewDonorForm(false);
      setNewDonorNome('');
      setNewDonorEmail('');
      setNewDonorCpf('');
      setNewDonorTelefone('');
      setNewDonorObservacao('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar doador');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedProject) {
      setError('Selecione um projeto primeiro');
      return;
    }

    if (!isAnonymous && !selectedDonor) {
      setError('Selecione um doador ou marque como anônima');
      return;
    }

    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    // Se for anônima, criar usuário anônimo temporário
    let donorUserId = selectedDonor?.id;
    if (isAnonymous) {
      try {
        setLoading(true);
        // Criar usuário anônimo
        const anonymousUserData: UserCreate = {
          nome: 'Doação Anônima',
          email: `anonimo_${Date.now()}@temp.com`,
          cpf: '00000000000', // CPF temporário
          roles: ['DOADOR'],
        };

        const userResponse = await userService.create(anonymousUserData);
        donorUserId = userResponse.data.id;

        // Criar registro de doador para o usuário anônimo
        // O backend também faz isso automaticamente, mas fazemos aqui para garantir
        if (selectedProject && donorUserId) {
          try {
            await donorService.create({
              id_usuario: donorUserId,
              id_projeto: selectedProject.id,
            });
          } catch (err: any) {
            // Se já existir, ignorar (o backend também cria automaticamente)
            if (!err.response?.data?.error?.includes('já está cadastrado')) {
              console.warn('Aviso ao criar doador anônimo:', err);
            }
          }
        }
      } catch (err: any) {
        setError('Erro ao criar registro de doação anônima');
        setLoading(false);
        return;
      }
    }

    if (!donorUserId) {
      setError('Erro ao identificar doador');
      setLoading(false);
      return;
    }

    try {
      const donationData: DonationCreate = {
        id_user: donorUserId,
        id_project: selectedProject.id,
        tp_ajuda: tpAjuda,
        tp_pagamento: tpAjuda === 'Financeira' ? tpPagamento : undefined,
        valor:
          tpAjuda === 'Financeira' && valor
            ? parseFloat(valor.replace(',', '.'))
            : undefined,
        itens: tpAjuda === 'Itens' ? itens.trim() : undefined,
        data: data || undefined,
        observacao: observacao.trim() || undefined,
      };

      await donationService.create(donationData);
      navigate('/donations');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao cadastrar doação');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    // Converte para número e divide por 100 para ter centavos
    const number = parseFloat(numbers) / 100;
    // Formata como moeda brasileira
    return number.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setValor(formatted);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/donations')}
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
        <Typography variant="h4" component="h1">
          Nova Doação
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Seção do Doador */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Doador
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isAnonymous}
                    onChange={(e) => {
                      setIsAnonymous(e.target.checked);
                      if (e.target.checked) {
                        setSelectedDonor(null);
                        setShowNewDonorForm(false);
                      }
                    }}
                  />
                }
                label="Doação Anônima"
              />
            </Grid>

            {!isAnonymous && (
              <>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={filteredDonors}
                    getOptionLabel={(option) =>
                      option.nome || option.email || 'Sem nome'
                    }
                    value={selectedDonor}
                    onChange={(_, newValue) => {
                      setSelectedDonor(newValue);
                      setShowNewDonorForm(false);
                    }}
                    loading={loadingDonors}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Selecionar Doador"
                        placeholder="Buscar doador..."
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingDonors ? (
                                <CircularProgress color="inherit" size={20} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PersonAdd />}
                    onClick={() => {
                      setShowNewDonorForm(!showNewDonorForm);
                      setSelectedDonor(null);
                    }}
                  >
                    {showNewDonorForm ? 'Cancelar' : 'Criar Novo Doador'}
                  </Button>
                </Grid>

                {/* Formulário de novo doador */}
                <Collapse in={showNewDonorForm} timeout="auto" unmountOnExit>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Dados do Novo Doador
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Nome"
                            value={newDonorNome}
                            onChange={(e) => setNewDonorNome(e.target.value)}
                            required
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={newDonorEmail}
                            onChange={(e) => setNewDonorEmail(e.target.value)}
                            required
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="CPF"
                            value={newDonorCpf}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 11) {
                                setNewDonorCpf(value);
                              }
                            }}
                            inputProps={{ maxLength: 11 }}
                            required
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Telefone"
                            value={newDonorTelefone}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 11) {
                                setNewDonorTelefone(value);
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Observação"
                            value={newDonorObservacao}
                            onChange={(e) =>
                              setNewDonorObservacao(e.target.value)
                            }
                            multiline
                            rows={3}
                            placeholder="Adicione observações sobre o doador..."
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            variant="contained"
                            onClick={handleCreateDonor}
                            disabled={loading}
                          >
                            Criar Doador
                          </Button>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Collapse>
              </>
            )}

            {/* Seção da Doação */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
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
                    onChange={(e) =>
                      setTpPagamento(e.target.value as TipoPagamento)
                    }
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
                    label="Valor (R$)"
                    value={valor}
                    onChange={handleValorChange}
                    placeholder="0,00"
                    helperText="Digite apenas números"
                  />
                </Grid>
              </>
            )}

            {tpAjuda === 'Itens' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Itens Doados"
                  value={itens}
                  onChange={(e) => setItens(e.target.value)}
                  multiline
                  rows={3}
                  placeholder="Liste os itens doados..."
                  helperText="Descreva os itens que foram doados"
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
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/donations')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Salvar'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};
