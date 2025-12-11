import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import { Grid } from '../components/Grid';
import { ArrowBack, Save } from '@mui/icons-material';
import { animalService } from '../services/animal.service';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { AnimalCreate, Identificacao, Vacinado } from '../types';

export const AnimalNew = () => {
  const navigate = useNavigate();
  const { selectedProject } = useProject();
  const { hasRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Campos do formulário
  const [nome, setNome] = useState('');
  const [entrada, setEntrada] = useState('');
  const [origem, setOrigem] = useState('');
  const [identificacao, setIdentificacao] = useState<Identificacao | ''>('');
  const [vacinado, setVacinado] = useState<Vacinado | ''>('');
  const [dtCastracao, setDtCastracao] = useState('');

  const isAdmin = hasRole('ADMINISTRADOR') || hasRole('SUPERADMIN');
  const isEmployee = hasRole('FUNCIONARIO');

  if (!isAdmin && !isEmployee) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          Você não tem permissão para acessar esta página.
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')}>
          Voltar ao Dashboard
        </Button>
      </Box>
    );
  }

  if (!selectedProject) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Nenhum projeto selecionado. Selecione um projeto primeiro.
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')}>
          Voltar ao Dashboard
        </Button>
      </Box>
    );
  }

  const validateForm = (): boolean => {
    if (!nome.trim()) {
      setError('Nome é obrigatório');
      return false;
    }

    if (!entrada) {
      setError('Data de entrada é obrigatória');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const data: AnimalCreate = {
        id_projeto: selectedProject.id,
        nome: nome.trim(),
        entrada: entrada,
        origem: origem.trim() || undefined,
        identificacao: identificacao || undefined,
        vacinado: vacinado || undefined,
        dt_castracao: dtCastracao || undefined,
      };

      const animal = await animalService.create(data);
      navigate(`/animals/${animal.id}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao cadastrar animal';
      setError(errorMessage);
      console.error('Erro ao cadastrar animal:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  // Obter data de hoje no formato YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/animals')}
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
        <Typography variant="h4" component="h1">
          Cadastro de Animal
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Informações Básicas */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Informações Básicas
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome do Animal"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data de Entrada"
                type="date"
                required
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                disabled={loading}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  max: today,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Origem"
                value={origem}
                onChange={(e) => setOrigem(e.target.value)}
                disabled={loading}
                helperText="Ex: Resgatado da rua, Doação, etc."
              />
            </Grid>

            {/* Informações Médicas */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Informações Médicas
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Vacinado"
                value={vacinado}
                onChange={(e) => setVacinado(e.target.value as Vacinado | '')}
                disabled={loading}
              >
                <MenuItem value="">Não informado</MenuItem>
                <MenuItem value="Sim">Sim</MenuItem>
                <MenuItem value="Nao">Não</MenuItem>
                <MenuItem value="Parcial">Parcial</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Identificação"
                value={identificacao}
                onChange={(e) => setIdentificacao(e.target.value as Identificacao | '')}
                disabled={loading}
              >
                <MenuItem value="">Nenhuma</MenuItem>
                <MenuItem value="microchip">Microchip</MenuItem>
                <MenuItem value="coleira">Coleira</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data de Castração"
                type="date"
                value={dtCastracao}
                onChange={(e) => setDtCastracao(e.target.value)}
                disabled={loading}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  max: today,
                }}
                helperText="Deixe em branco se não foi castrado"
              />
            </Grid>

            {/* Botões */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/animals')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                  disabled={loading}
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

