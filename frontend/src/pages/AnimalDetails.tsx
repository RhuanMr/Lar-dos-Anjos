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
  FormControlLabel,
  Switch,
  IconButton,
  Tooltip,
} from '@mui/material';
import { ArrowBack, Save, Edit, Pets, Delete, Done } from '@mui/icons-material';
import { animalService } from '../services/animal.service';
import { vaccineService } from '../services/vaccine.service';
import { medicalCaseService } from '../services/medicalCase.service';
import { useAuth } from '../contexts/AuthContext';
import { PhotoUpload } from '../components/PhotoUpload';
import {
  Animal,
  AnimalUpdate,
  Identificacao,
  Vacinado,
  Vaccine,
  MedicalCase,
} from '../types';

const getToday = () => new Date().toISOString().split('T')[0];

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
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [medicalCases, setMedicalCases] = useState<MedicalCase[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [vaccineForm, setVaccineForm] = useState({
    nome: '',
    data_aplicacao: getToday(),
  });
  const [medicalCaseForm, setMedicalCaseForm] = useState({
    descricao: '',
    observacao: '',
    finalizado: false,
  });
  const [addingVaccine, setAddingVaccine] = useState(false);
  const [addingMedicalCase, setAddingMedicalCase] = useState(false);

  const isAdmin = hasRole('ADMINISTRADOR') || hasRole('SUPERADMIN');
  const isEmployee = hasRole('FUNCIONARIO');
  const canEdit = isAdmin || isEmployee;

  useEffect(() => {
    if (id) {
      loadAnimal();
    }
  }, [id]);

  const loadHistory = async (animalId: string) => {
    try {
      setHistoryLoading(true);
      const [vaccinesData, casesData] = await Promise.all([
        vaccineService.getByAnimal(animalId),
        medicalCaseService.getByAnimal(animalId),
      ]);
      setVaccines(vaccinesData);
      setMedicalCases(casesData);
    } catch (err) {
      console.error('Erro ao carregar histórico do animal:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

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
      await loadHistory(id);
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

  const today = getToday();

  const handleAddVaccine = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id) return;

    if (!vaccineForm.nome.trim()) {
      setError('Nome da vacina é obrigatório');
      return;
    }

    if (!vaccineForm.data_aplicacao) {
      setError('Data de aplicação é obrigatória');
      return;
    }

    try {
      setAddingVaccine(true);
      await vaccineService.create({
        id_animal: id,
        nome: vaccineForm.nome.trim(),
        data_aplicacao: vaccineForm.data_aplicacao,
      });
      setVaccineForm({ nome: '', data_aplicacao: today });
      await loadHistory(id);
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.message ||
        'Erro ao cadastrar vacina';
      setError(message);
    } finally {
      setAddingVaccine(false);
    }
  };

  const handleDeleteVaccine = async (vaccineId: string) => {
    if (!id) return;
    const confirmed = window.confirm(
      'Tem certeza que deseja excluir esta vacina?'
    );
    if (!confirmed) return;
    try {
      await vaccineService.delete(vaccineId);
      await loadHistory(id);
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.message ||
        'Erro ao excluir vacina';
      setError(message);
    }
  };

  const handleAddMedicalCase = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id) return;

    if (!medicalCaseForm.descricao.trim()) {
      setError('Descrição do caso é obrigatória');
      return;
    }

    try {
      setAddingMedicalCase(true);
      await medicalCaseService.create({
        id_animal: id,
        descricao: medicalCaseForm.descricao.trim(),
        observacao: medicalCaseForm.observacao.trim()
          ? medicalCaseForm.observacao.trim()
          : undefined,
        finalizado: medicalCaseForm.finalizado,
      });
      setMedicalCaseForm({
        descricao: '',
        observacao: '',
        finalizado: false,
      });
      await loadHistory(id);
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.message ||
        'Erro ao cadastrar caso médico';
      setError(message);
    } finally {
      setAddingMedicalCase(false);
    }
  };

  const handleToggleMedicalCase = async (medicalCase: MedicalCase) => {
    if (!id) return;
    try {
      await medicalCaseService.update(medicalCase.id, {
        finalizado: !medicalCase.finalizado,
      });
      await loadHistory(id);
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.message ||
        'Erro ao atualizar caso médico';
      setError(message);
    }
  };

  const handleDeleteMedicalCase = async (medicalCaseId: string) => {
    if (!id) return;
    const confirmed = window.confirm(
      'Tem certeza que deseja excluir este caso médico?'
    );
    if (!confirmed) return;
    try {
      await medicalCaseService.delete(medicalCaseId);
      await loadHistory(id);
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.message ||
        'Erro ao excluir caso médico';
      setError(message);
    }
  };

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
              {/* Foto principal (se existir) */}
              {animal.foto && (
                <Avatar
                  src={animal.foto}
                  alt={animal.nome}
                  sx={{ width: 200, height: 200, mx: 'auto', mb: 2 }}
                >
                  <Pets sx={{ fontSize: 80 }} />
                </Avatar>
              )}
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
          
          {/* Componente de Upload de Fotos */}
          {canEdit && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Fotos do Animal
                </Typography>
                <PhotoUpload
                  entityId={animal.id}
                  entityType="animal"
                  existingPhotos={animal.fotos || (animal.foto ? [animal.foto] : [])}
                  onPhotosChange={async (photos) => {
                    // O backend já atualiza o animal durante o upload (via adicionarFotosAoAnimal)
                    // Então apenas recarregamos o animal para sincronizar o estado
                    try {
                      const updated = await animalService.getById(animal.id);
                      setAnimal(updated);
                    } catch (err: any) {
                      console.error('Erro ao recarregar animal após upload:', err);
                      // Não mostrar erro ao usuário, apenas logar
                    }
                  }}
                  maxPhotos={10}
                  disabled={false}
                />
              </CardContent>
            </Card>
          )}
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

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <Typography variant="h6">Vacinas</Typography>
              {historyLoading && <CircularProgress size={20} />}
            </Box>

            {canEdit && (
              <Box
                component="form"
                onSubmit={handleAddVaccine}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}
              >
                <TextField
                  label="Nome da vacina"
                  value={vaccineForm.nome}
                  onChange={(e) =>
                    setVaccineForm((prev) => ({ ...prev, nome: e.target.value }))
                  }
                  disabled={addingVaccine}
                  required
                />
                <TextField
                  label="Data de aplicação"
                  type="date"
                  value={vaccineForm.data_aplicacao}
                  onChange={(e) =>
                    setVaccineForm((prev) => ({
                      ...prev,
                      data_aplicacao: e.target.value,
                    }))
                  }
                  disabled={addingVaccine}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: today }}
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={addingVaccine}
                >
                  {addingVaccine ? 'Registrando...' : 'Registrar Vacina'}
                </Button>
              </Box>
            )}

            <Divider sx={{ mb: 2 }} />

            {vaccines.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nenhuma vacina registrada para este animal.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {vaccines.map((vacina) => (
                  <Box
                    key={vacina.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1">{vacina.nome}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Aplicada em {formatDate(vacina.data_aplicacao)}
                      </Typography>
                    </Box>
                    {canEdit && (
                      <Tooltip title="Excluir vacina">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteVaccine(vacina.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <Typography variant="h6">Casos Médicos</Typography>
              {historyLoading && <CircularProgress size={20} />}
            </Box>

            {canEdit && (
              <Box
                component="form"
                onSubmit={handleAddMedicalCase}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}
              >
                <TextField
                  label="Descrição do caso"
                  value={medicalCaseForm.descricao}
                  onChange={(e) =>
                    setMedicalCaseForm((prev) => ({
                      ...prev,
                      descricao: e.target.value,
                    }))
                  }
                  required
                  multiline
                  minRows={2}
                  disabled={addingMedicalCase}
                />
                <TextField
                  label="Observações"
                  value={medicalCaseForm.observacao}
                  onChange={(e) =>
                    setMedicalCaseForm((prev) => ({
                      ...prev,
                      observacao: e.target.value,
                    }))
                  }
                  multiline
                  minRows={2}
                  disabled={addingMedicalCase}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={medicalCaseForm.finalizado}
                      onChange={(e) =>
                        setMedicalCaseForm((prev) => ({
                          ...prev,
                          finalizado: e.target.checked,
                        }))
                      }
                      disabled={addingMedicalCase}
                    />
                  }
                  label="Caso finalizado"
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={addingMedicalCase}
                >
                  {addingMedicalCase
                    ? 'Registrando...'
                    : 'Registrar Caso Médico'}
                </Button>
              </Box>
            )}

            <Divider sx={{ mb: 2 }} />

            {medicalCases.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nenhum caso médico registrado para este animal.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {medicalCases.map((caso) => (
                  <Box
                    key={caso.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="subtitle1">
                        {caso.descricao || 'Sem descrição'}
                      </Typography>
                      <Chip
                        label={caso.finalizado ? 'Finalizado' : 'Em andamento'}
                        color={caso.finalizado ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                    {caso.observacao && (
                      <Typography variant="body2">
                        {caso.observacao}
                      </Typography>
                    )}

                    {canEdit && (
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: 1,
                          mt: 1,
                        }}
                      >
                        <Tooltip
                          title={
                            caso.finalizado
                              ? 'Marcar como em andamento'
                              : 'Marcar como finalizado'
                          }
                        >
                          <IconButton
                            color={caso.finalizado ? 'warning' : 'success'}
                            onClick={() => handleToggleMedicalCase(caso)}
                          >
                            <Done />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir caso">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteMedicalCase(caso.id)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

