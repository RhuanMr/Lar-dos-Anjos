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
  Avatar,
  Divider,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import { ArrowBack, Save, Edit, Pets } from '@mui/icons-material';
import { animalService } from '../services/animal.service';
import { useAuth } from '../contexts/AuthContext';
import { Animal, AnimalUpdate, Identificacao, Vacinado } from '../types';

export const AnimalDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { hasRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [animal, setAnimal] = useState<Animal | null>(null);

  // Campos do formulário
  const [nome, setNome] = useState('');
  const [entrada, setEntrada] = useState('');
  const [origem, setOrigem] = useState('');
  const [identificacao, setIdentificacao] = useState<Identificacao | ''>('');
  const [vacinado, setVacinado] = useState<Vacinado | ''>('');
  const [dtCastracao, setDtCastracao] = useState('');

  const isAdmin = hasRole('ADMINISTRADOR') || hasRole('SUPERADMIN');
  const isEmployee = hasRole('FUNCIONARIO');
  const canEdit = isAdmin || isEmployee;

  useEffect(() => {
    if (id) {
      loadAnimal();
    }
  }, [id]);

  const loadAnimal = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const data = await animalService.getById(id);
      setAnimal(data);
      setNome(data.nome);
      setEntrada(data.entrada);
      setOrigem(data.origem || '');
      setIdentificacao(data.identificacao || '');
      setVacinado(data.vacinado || '');
      setDtCastracao(data.dt_castracao || '');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar animal');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    if (animal) {
      setNome(animal.nome);
      setEntrada(animal.entrada);
      setOrigem(animal.origem || '');
      setIdentificacao(animal.identificacao || '');
      setVacinado(animal.vacinado || '');
      setDtCastracao(animal.dt_castracao || '');
    }
    setEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setError(null);

    if (!nome.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    try {
      setSaving(true);

      const data: AnimalUpdate = {
        nome: nome.trim(),
        entrada: entrada,
        origem: origem.trim() || undefined,
        identificacao: identificacao || undefined,
        vacinado: vacinado || undefined,
        dt_castracao: dtCastracao || undefined,
      };

      const updated = await animalService.update(id, data);
      setAnimal(updated);
      setEditing(false);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao atualizar animal';
      setError(errorMessage);
      console.error('Erro ao atualizar animal:', err.response?.data || err);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Obter data de hoje no formato YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!animal) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          Animal não encontrado
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/animals')}>
          Voltar para Lista
        </Button>
      </Box>
    );
  }

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
          {animal.nome}
        </Typography>
        {canEdit && !editing && (
          <Button
            startIcon={<Edit />}
            onClick={handleEdit}
            sx={{ ml: 'auto' }}
            variant="outlined"
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

      <Grid container spacing={3}>
        {/* Foto e Informações Básicas */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                src={animal.foto}
                alt={animal.nome}
                sx={{ width: 200, height: 200, mx: 'auto', mb: 2 }}
              >
                <Pets sx={{ fontSize: 80 }} />
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {animal.nome}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {animal.vacinado && (
                  <Chip
                    label={`Vacinado: ${animal.vacinado}`}
                    color={animal.vacinado === 'Sim' ? 'success' : animal.vacinado === 'Nao' ? 'error' : 'warning'}
                    size="small"
                  />
                )}
                {animal.identificacao && (
                  <Chip
                    label={animal.identificacao === 'microchip' ? 'Microchip' : 'Coleira'}
                    variant="outlined"
                    size="small"
                  />
                )}
                {animal.dt_castracao && (
                  <Chip
                    label={`Castrado em ${formatDate(animal.dt_castracao)}`}
                    color="success"
                    size="small"
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Formulário de Edição/Visualização */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Informações Básicas
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nome do Animal"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    disabled={!editing || saving}
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
                    disabled={!editing || saving}
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
                    disabled={!editing || saving}
                    helperText="Ex: Resgatado da rua, Doação, etc."
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Informações Médicas
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Vacinado"
                    value={vacinado}
                    onChange={(e) => setVacinado(e.target.value as Vacinado | '')}
                    disabled={!editing || saving}
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
                    disabled={!editing || saving}
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
                    disabled={!editing || saving}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      max: today,
                    }}
                    helperText="Deixe em branco se não foi castrado"
                  />
                </Grid>

                {editing && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
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

        {/* Seções futuras para Vacinas e Casos Médicos */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Histórico
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Funcionalidades de vacinas e casos médicos serão implementadas em breve.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

