import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Autocomplete,
  MenuItem,
  Divider,
} from '@mui/material';
import { Grid } from '../components/Grid';
import { ArrowBack, Save } from '@mui/icons-material';
import Fuse from 'fuse.js';
import { adoptionService, adoptionUpdateService } from '../services/adoption.service';
import { animalService } from '../services/animal.service';
import { userService } from '../services/user.service';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { AdoptionCreate, StatusAdocao } from '../types/Adoption';
import { Animal } from '../types/Animal';
import { User } from '../types/User';

export const AdoptionNew = () => {
  const navigate = useNavigate();
  const { selectedProject } = useProject();
  const { hasRole, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [selectedAdopter, setSelectedAdopter] = useState<User | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [dtAdocao, setDtAdocao] = useState('');

  // Campos da primeira atualização
  const [updateStatus, setUpdateStatus] = useState<StatusAdocao>('ok');
  const [updateObservacao, setUpdateObservacao] = useState('');
  const [updateProxDt, setUpdateProxDt] = useState('');

  // Data
  const [adopters, setAdopters] = useState<User[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loadingAdopters, setLoadingAdopters] = useState(false);
  const [loadingAnimals, setLoadingAnimals] = useState(false);

  const isAdmin = hasRole('ADMINISTRADOR') || hasRole('SUPERADMIN');
  const isEmployee = hasRole('FUNCIONARIO');

  useEffect(() => {
    if (!isAdmin && !isEmployee) {
      navigate('/dashboard');
      return;
    }

    if (!selectedProject) {
      navigate('/projects');
      return;
    }

    loadData();
  }, [selectedProject]);

  const loadData = async () => {
    if (!selectedProject) return;

    try {
      setLoadingAdopters(true);
      const usersResponse = await userService.getAll();
      const allUsers = usersResponse.data || [];
      // Filtrar apenas adotantes
      const adoptersList = allUsers.filter((user) =>
        user.roles.includes('ADOTANTE')
      );
      setAdopters(adoptersList);
    } catch (err: any) {
      console.error('Erro ao carregar adotantes:', err);
      setError('Erro ao carregar adotantes');
    } finally {
      setLoadingAdopters(false);
    }

    try {
      setLoadingAnimals(true);
      const animalsData = await animalService.getByProject(selectedProject.id);
      setAnimals(animalsData);
    } catch (err: any) {
      console.error('Erro ao carregar animais:', err);
      setError('Erro ao carregar animais');
    } finally {
      setLoadingAnimals(false);
    }
  };

  // Configuração do Fuse.js para busca fuzzy
  const fuseAdoptersOptions = useMemo(
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

  const fuseAnimalsOptions = useMemo(
    () => ({
      keys: [{ name: 'nome', weight: 1 }],
      threshold: 0.3,
      includeScore: true,
      minMatchCharLength: 2,
    }),
    []
  );

  const fuseAdopters = useMemo(() => {
    return new Fuse(adopters, fuseAdoptersOptions);
  }, [adopters, fuseAdoptersOptions]);

  const fuseAnimals = useMemo(() => {
    return new Fuse(animals, fuseAnimalsOptions);
  }, [animals, fuseAnimalsOptions]);

  const filteredAdopters = useMemo(() => {
    if (!selectedAdopter || !selectedAdopter.nome) return adopters;
    const results = fuseAdopters.search(selectedAdopter.nome);
    return results.map((result) => result.item);
  }, [selectedAdopter, fuseAdopters, adopters]);

  const filteredAnimals = useMemo(() => {
    if (!selectedAnimal || !selectedAnimal.nome) return animals;
    const results = fuseAnimals.search(selectedAnimal.nome);
    return results.map((result) => result.item);
  }, [selectedAnimal, fuseAnimals, animals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedProject) {
      setError('Selecione um projeto primeiro');
      return;
    }

    if (!selectedAdopter) {
      setError('Selecione um adotante');
      return;
    }

    if (!selectedAnimal) {
      setError('Selecione um animal');
      return;
    }

    try {
      setLoading(true);

      const data: AdoptionCreate = {
        id_projeto: selectedProject.id,
        id_adotante: selectedAdopter.id,
        id_animal: selectedAnimal.id,
        dt_adocao: dtAdocao || undefined,
      };

      const adoption = await adoptionService.create(data);

      // Criar primeira atualização
      if (user) {
        try {
          await adoptionUpdateService.create({
            id_adocao: adoption.id,
            id_responsavel: user.id,
            status: updateStatus,
            observacao: updateObservacao.trim() || undefined,
            prox_dt: updateProxDt || undefined,
          });
        } catch (updateErr: any) {
          console.error('Erro ao criar atualização:', updateErr);
          // Não falhar o cadastro se a atualização falhar
        }
      }

      navigate(`/adoptions/${adoption.id}`);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || 'Erro ao cadastrar adoção';
      setError(errorMessage);
      console.error('Erro ao cadastrar adoção:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin && !isEmployee) {
    return null;
  }

  if (!selectedProject) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Nenhum projeto selecionado. Selecione um projeto primeiro.
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/projects')}>
          Voltar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/adoptions')}
          variant="outlined"
        >
          Voltar
        </Button>
        <Typography variant="h4">Cadastrar Adoção</Typography>
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
              <Autocomplete
                options={filteredAdopters}
                getOptionLabel={(option) =>
                  `${option.nome}${option.email ? ` - ${option.email}` : ''}`
                }
                value={selectedAdopter}
                onChange={(_, newValue) => setSelectedAdopter(newValue)}
                loading={loadingAdopters}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Adotante *"
                    required
                    helperText="Busque por nome, email ou CPF"
                  />
                )}
                filterOptions={(options) => options}
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                options={filteredAnimals}
                getOptionLabel={(option) => option.nome}
                value={selectedAnimal}
                onChange={(_, newValue) => setSelectedAnimal(newValue)}
                loading={loadingAnimals}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Animal *"
                    required
                    helperText="Busque por nome do animal"
                  />
                )}
                filterOptions={(options) => options}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data de Adoção"
                type="date"
                value={dtAdocao}
                onChange={(e) => setDtAdocao(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Primeira Atualização
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Status *"
                value={updateStatus}
                onChange={(e) => setUpdateStatus(e.target.value as StatusAdocao)}
                required
              >
                <MenuItem value="ok">OK</MenuItem>
                <MenuItem value="pendente">Pendente</MenuItem>
                <MenuItem value="visita_agendada">Visita Agendada</MenuItem>
                <MenuItem value="sem_resposta">Sem Resposta</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Próxima Data"
                type="date"
                value={updateProxDt}
                onChange={(e) => setUpdateProxDt(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Observação"
                multiline
                rows={3}
                value={updateObservacao}
                onChange={(e) => setUpdateObservacao(e.target.value)}
                placeholder="Observações sobre a primeira atualização..."
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => navigate('/adoptions')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !selectedAdopter || !selectedAnimal}
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                >
                  {loading ? 'Cadastrando...' : 'Cadastrar Adoção'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

