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
  Divider,
  Card,
  CardContent,
  Chip,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Save,
  Cancel,
  Add,
  Delete,
} from '@mui/icons-material';
import { adoptionService, adoptionUpdateService } from '../services/adoption.service';
import { animalService } from '../services/animal.service';
import { userService } from '../services/user.service';
import { projectService } from '../services/project.service';
import { useAuth } from '../contexts/AuthContext';
import { Adoption, AdoptionUpdate, AdoptionUpdateRecord, AdoptionUpdateCreate, StatusAdocao } from '../types/Adoption';
import { Animal } from '../types/Animal';
import { User } from '../types/User';
import { Project } from '../types/Project';

export const AdoptionDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { hasRole, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Adoption data
  const [adoption, setAdoption] = useState<Adoption | null>(null);
  const [adopter, setAdopter] = useState<User | null>(null);
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [project, setProject] = useState<Project | null>(null);

  // Form fields
  const [dtAdocao, setDtAdocao] = useState('');

  // Adoption updates
  const [updates, setUpdates] = useState<AdoptionUpdateRecord[]>([]);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<StatusAdocao>('ok');
  const [updateObservacao, setUpdateObservacao] = useState('');
  const [updateProxDt, setUpdateProxDt] = useState('');
  const [loadingUpdates, setLoadingUpdates] = useState(false);

  const isAdmin = hasRole('ADMINISTRADOR') || hasRole('SUPERADMIN');
  const isEmployee = hasRole('FUNCIONARIO');

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const adoptionData = await adoptionService.getById(id);
      setAdoption(adoptionData);
      setDtAdocao(adoptionData.dt_adocao || '');

      // Load related data
      const [adopterData, animalData, projectData] = await Promise.all([
        userService.getById(adoptionData.id_adotante),
        animalService.getById(adoptionData.id_animal),
        projectService.getById(adoptionData.id_projeto),
      ]);

      setAdopter(adopterData.data);
      setAnimal(animalData);
      setProject(projectData);

      // Load updates
      await loadUpdates();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar adoção');
    } finally {
      setLoading(false);
    }
  };

  const loadUpdates = async () => {
    if (!id) return;

    try {
      setLoadingUpdates(true);
      const updatesData = await adoptionUpdateService.getByAdoption(id);
      setUpdates(updatesData);
    } catch (err: any) {
      console.error('Erro ao carregar atualizações:', err);
    } finally {
      setLoadingUpdates(false);
    }
  };

  const handleSave = async () => {
    if (!id || !adoption) return;

    try {
      setSaving(true);
      setError(null);

      const data: AdoptionUpdate = {
        dt_adocao: dtAdocao || undefined,
      };

      await adoptionService.update(id, data);
      await loadData();
      setIsEditing(false);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || 'Erro ao atualizar adoção';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (adoption) {
      setDtAdocao(adoption.dt_adocao || '');
    }
    setIsEditing(false);
    setError(null);
  };

  const handleAddUpdate = async () => {
    if (!id || !user) return;

    try {
      setSaving(true);
      setError(null);

      const data: AdoptionUpdateCreate = {
        id_adocao: id,
        id_responsavel: user.id,
        status: updateStatus,
        observacao: updateObservacao.trim() || undefined,
        prox_dt: updateProxDt || undefined,
      };

      await adoptionUpdateService.create(data);
      await loadUpdates();
      setShowUpdateForm(false);
      setUpdateStatus('ok');
      setUpdateObservacao('');
      setUpdateProxDt('');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || 'Erro ao criar atualização';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUpdate = async (updateId: string) => {
    if (!window.confirm('Tem certeza que deseja remover esta atualização?')) {
      return;
    }

    try {
      await adoptionUpdateService.delete(updateId);
      await loadUpdates();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao remover atualização');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getStatusLabel = (status?: StatusAdocao) => {
    const labels: Record<StatusAdocao, string> = {
      ok: 'OK',
      pendente: 'Pendente',
      visita_agendada: 'Visita Agendada',
      sem_resposta: 'Sem Resposta',
    };
    return status ? labels[status] : '-';
  };

  const getStatusColor = (status?: StatusAdocao): 'success' | 'warning' | 'error' | 'info' => {
    if (!status) return 'info';
    if (status === 'ok') return 'success';
    if (status === 'pendente' || status === 'visita_agendada') return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!adoption) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          Adoção não encontrada
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/adoptions')}>
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
        <Typography variant="h4">Detalhes da Adoção</Typography>
        {(isAdmin || isEmployee) && !isEditing && (
          <Button
            startIcon={<Edit />}
            onClick={() => setIsEditing(true)}
            variant="contained"
          >
            Editar
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informações da Adoção
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Data de Adoção"
                    type="date"
                    value={dtAdocao}
                    onChange={(e) => setDtAdocao(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    disabled={!isEditing}
                  />
                </Grid>
                {isEditing && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSave}
                        disabled={saving}
                      >
                        Salvar
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        Cancelar
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Adotante
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {adopter ? (
                <Box>
                  <Typography><strong>Nome:</strong> {adopter.nome}</Typography>
                  <Typography><strong>Email:</strong> {adopter.email}</Typography>
                  {adopter.telefone && (
                    <Typography><strong>Telefone:</strong> {adopter.telefone}</Typography>
                  )}
                  <Button
                    variant="text"
                    onClick={() => navigate(`/adopters/${adopter.id}`)}
                    sx={{ mt: 1 }}
                  >
                    Ver Detalhes do Adotante
                  </Button>
                </Box>
              ) : (
                <Typography color="text.secondary">Carregando...</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Animal
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {animal ? (
                <Box>
                  <Typography><strong>Nome:</strong> {animal.nome}</Typography>
                  {animal.origem && (
                    <Typography><strong>Origem:</strong> {animal.origem}</Typography>
                  )}
                  <Button
                    variant="text"
                    onClick={() => navigate(`/animals/${animal.id}`)}
                    sx={{ mt: 1 }}
                  >
                    Ver Detalhes do Animal
                  </Button>
                </Box>
              ) : (
                <Typography color="text.secondary">Carregando...</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Projeto
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {project ? (
                <Box>
                  <Typography><strong>Nome:</strong> {project.nome}</Typography>
                  {project.email && (
                    <Typography><strong>Email:</strong> {project.email}</Typography>
                  )}
                  <Button
                    variant="text"
                    onClick={() => navigate(`/projects/${project.id}`)}
                    sx={{ mt: 1 }}
                  >
                    Ver Detalhes do Projeto
                  </Button>
                </Box>
              ) : (
                <Typography color="text.secondary">Carregando...</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Atualizações</Typography>
                {(isAdmin || isEmployee) && (
                  <Button
                    startIcon={<Add />}
                    onClick={() => setShowUpdateForm(!showUpdateForm)}
                    variant="contained"
                    size="small"
                  >
                    Adicionar Atualização
                  </Button>
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Collapse in={showUpdateForm}>
                <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        select
                        label="Status"
                        value={updateStatus}
                        onChange={(e) => setUpdateStatus(e.target.value as StatusAdocao)}
                        SelectProps={{
                          native: true,
                        }}
                      >
                        <option value="ok">OK</option>
                        <option value="pendente">Pendente</option>
                        <option value="visita_agendada">Visita Agendada</option>
                        <option value="sem_resposta">Sem Resposta</option>
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
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="contained"
                          onClick={handleAddUpdate}
                          disabled={saving}
                        >
                          Salvar Atualização
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setShowUpdateForm(false);
                            setUpdateStatus('ok');
                            setUpdateObservacao('');
                            setUpdateProxDt('');
                          }}
                        >
                          Cancelar
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Collapse>

              {loadingUpdates ? (
                <CircularProgress />
              ) : updates.length === 0 ? (
                <Typography color="text.secondary">Nenhuma atualização registrada</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {updates.map((update) => (
                    <Paper key={update.id} sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Box>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                            <Chip
                              label={getStatusLabel(update.status)}
                              color={getStatusColor(update.status)}
                              size="small"
                            />
                            {update.prox_dt && (
                              <Typography variant="body2" color="text.secondary">
                                Próxima: {formatDate(update.prox_dt)}
                              </Typography>
                            )}
                          </Box>
                          {update.observacao && (
                            <Typography variant="body2">{update.observacao}</Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            ID: {update.id.substring(0, 8)}...
                          </Typography>
                        </Box>
                        {(isAdmin || isEmployee) && (
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteUpdate(update.id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        )}
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

