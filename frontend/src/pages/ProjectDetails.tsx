import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  Divider,
  Chip,
  CircularProgress,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import { ArrowBack, Edit, Save } from '@mui/icons-material';
import { projectService, ProjectCreate } from '../services/project.service';
import { cepService } from '../services/cep.service';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import { ProjectDetails as ProjectDetailsType } from '../types/Project';
import { UFS } from '../constants/ufs';
import { PhotoUpload } from '../components/PhotoUpload';

const formatPhone = (value?: string) => {
  if (!value) return 'N/A';
  const digits = value.replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return digits;
};

const formatCep = (value?: string) => {
  if (!value) return 'N/A';
  const digits = value.replace(/\D/g, '');
  if (digits.length === 8) {
    return digits.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
  return digits;
};

export const ProjectDetails = () => {
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const { selectedProject, selectProject, getUserProjects } = useProject();

  const routeProjectId = id || selectedProject?.id || null;
  const isSuperAdmin = hasRole('SUPERADMIN');
  const isAdmin = hasRole('ADMINISTRADOR');
  const canEdit = isSuperAdmin || isAdmin;

  const [project, setProject] = useState<ProjectDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editing, setEditing] = useState(
    location.pathname.endsWith('/edit') && canEdit
  );
  const [buscandoCep, setBuscandoCep] = useState(false);

  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    instagram: '',
    cep: '',
    endereco: '',
    bairro: '',
    cidade: '',
    uf: '',
    numero: '',
    complemento: '',
  });

  useEffect(() => {
    setEditing(location.pathname.endsWith('/edit') && canEdit);
  }, [location.pathname, canEdit]);

  useEffect(() => {
    if (!routeProjectId) {
      setLoading(false);
      return;
    }
    loadProject(routeProjectId);
  }, [routeProjectId]);

  // Buscar endereço automaticamente quando CEP tiver 8 dígitos
  useEffect(() => {
    const buscarEnderecoPorCep = async () => {
      // Só buscar se estiver editando e o CEP tiver 8 dígitos
      if (!editing || buscandoCep || saving) return;
      
      const cepLimpo = form.cep.replace(/\D/g, '');
      if (cepLimpo.length === 8 && cepService.validarCep(cepLimpo)) {
        setBuscandoCep(true);
        try {
          const endereco = await cepService.buscarCep(cepLimpo);
          if (endereco) {
            // Preencher campos automaticamente
            setForm((prev) => ({
              ...prev,
              endereco: endereco.endereco,
              bairro: endereco.bairro,
              cidade: endereco.cidade,
              uf: endereco.uf,
              // Manter complemento e numero se já estiverem preenchidos
            }));
          } else {
            setError('CEP não encontrado');
          }
        } catch (err: any) {
          console.error('Erro ao buscar CEP:', err);
          // Não mostrar erro para o usuário, apenas logar
        } finally {
          setBuscandoCep(false);
        }
      }
    };

    // Debounce: aguardar 500ms após o usuário parar de digitar
    const timeoutId = setTimeout(buscarEnderecoPorCep, 500);
    return () => clearTimeout(timeoutId);
  }, [form.cep, editing]);

  const loadProject = async (projectId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectService.getById(projectId);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Projeto não encontrado');
      }
      const data = response.data;
      setProject(data);
      setForm({
        nome: data.nome || '',
        email: data.email || '',
        telefone: data.telefone || '',
        instagram: data.instagram || '',
        cep: data.endereco?.cep || '',
        endereco: data.endereco?.endereco || '',
        bairro: data.endereco?.bairro || '',
        cidade: data.endereco?.cidade || '',
        uf: data.endereco?.estado || '',
        numero: data.endereco?.numero || '',
        complemento: data.endereco?.complemento || '',
      });
    } catch (err: any) {
      const message =
        err.response?.data?.error || err.message || 'Erro ao carregar projeto';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!form.nome.trim()) {
      setError('Nome é obrigatório');
      return false;
    }
    if (!form.email.trim()) {
      setError('Email é obrigatório');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Email inválido');
      return false;
    }
    if (!form.telefone.trim()) {
      setError('Telefone é obrigatório');
      return false;
    }
    const telefoneLimpo = form.telefone.replace(/\D/g, '');
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
      setError('Telefone deve ter 10 ou 11 dígitos');
      return false;
    }
    if (form.cep) {
      const cepLimpo = form.cep.replace(/\D/g, '');
      if (cepLimpo && cepLimpo.length !== 8) {
        setError('CEP deve ter 8 dígitos');
        return false;
      }
    }
    if (form.uf && !UFS.includes(form.uf as (typeof UFS)[number])) {
      setError('UF inválida');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !routeProjectId) return;

    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const cepLimpo = form.cep ? form.cep.replace(/\D/g, '') : undefined;
      const telefoneLimpo = form.telefone.replace(/\D/g, '');
      const payload: Partial<ProjectCreate> = {
        nome: form.nome.trim(),
        email: form.email.trim().toLowerCase(),
        telefone: telefoneLimpo,
        instagram: form.instagram.trim() || undefined,
        cep: cepLimpo,
        endereco: form.endereco.trim() || undefined,
        bairro: form.bairro.trim() || undefined,
        cidade: form.cidade.trim() || undefined,
        uf: form.uf || undefined,
        numero: form.numero.trim() || undefined,
        complemento: form.complemento.trim() || undefined,
      };

      const response = await projectService.update(routeProjectId, payload);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Erro ao atualizar projeto');
      }
      const updated = response.data;
      setProject(updated);
      setSuccess('Projeto atualizado com sucesso');
      setEditing(false);

      if (!id && selectedProject && updated.id === selectedProject.id) {
        const { endereco, ...rest } = updated;
        selectProject(rest);
        await getUserProjects();
      }
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.message ||
        'Erro ao atualizar projeto';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (project) {
      setForm({
        nome: project.nome || '',
        email: project.email || '',
        telefone: project.telefone || '',
        instagram: project.instagram || '',
        cep: project.endereco?.cep || '',
        endereco: project.endereco?.endereco || '',
        bairro: project.endereco?.bairro || '',
        cidade: project.endereco?.cidade || '',
        uf: project.endereco?.estado || '',
        numero: project.endereco?.numero || '',
        complemento: project.endereco?.complemento || '',
      });
    }
    setEditing(false);
    setError(null);
  };

  const backDestination = useMemo(() => {
    if (id) return '/projects';
    return '/dashboard';
  }, [id]);

  if (!routeProjectId) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Nenhum projeto selecionado. Selecione um projeto primeiro.
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/projects')}>
          Voltar para Lista de Projetos
        </Button>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!project) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          Projeto não encontrado.
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/projects')}>
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
          onClick={() => navigate(backDestination)}
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
        <Typography variant="h4" component="h1">
          {project.nome}
        </Typography>
        {canEdit && !editing && (
          <Button
            startIcon={<Edit />}
            variant="outlined"
            sx={{ ml: 'auto' }}
            onClick={() => setEditing(true)}
          >
            Editar
          </Button>
        )}
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      {!canEdit && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Você não tem permissão para editar este projeto, mas pode visualizar as
          informações.
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Foto do Projeto */}
            {canEdit && (
              <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Foto do Projeto
                  </Typography>
                  <PhotoUpload
                    entityId={routeProjectId}
                    entityType="projeto"
                    existingPhotos={project.foto ? [project.foto] : []}
                    onPhotosChange={async (photos) => {
                      // Atualizar projeto com nova foto
                      try {
                        const updated = await projectService.update(routeProjectId, { foto: photos[0] || undefined });
                        setProject(updated);
                        if (!id && selectedProject && updated.id === selectedProject.id) {
                          const { endereco, ...rest } = updated;
                          selectProject(rest);
                          await getUserProjects();
                        }
                      } catch (err: any) {
                        setError(err.response?.data?.error || err.message || 'Erro ao atualizar foto');
                      }
                    }}
                    maxPhotos={1}
                    disabled={false}
                  />
                </Box>
                <Divider sx={{ mb: 3 }} />
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6">Informações Gerais</Typography>
                <Chip
                  label={project.ativo ? 'Ativo' : 'Inativo'}
                  color={project.ativo ? 'success' : 'default'}
                  size="small"
                />
              </Box>
              <Divider sx={{ mt: 1, mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome do Projeto"
                value={form.nome}
                onChange={(e) => handleFieldChange('nome', e.target.value)}
                disabled={!editing || saving}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                disabled={!editing || saving}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefone"
                value={formatPhone(form.telefone)}
                onChange={(e) => {
                  if (!editing || saving) return;
                  const digits = e.target.value.replace(/\D/g, '');
                  if (digits.length <= 11) {
                    handleFieldChange('telefone', digits);
                  }
                }}
                disabled={!editing || saving}
                helperText="DDD + número (somente números)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Instagram"
                value={form.instagram}
                onChange={(e) => handleFieldChange('instagram', e.target.value)}
                disabled={!editing || saving}
                placeholder="@ongexemplo"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2 }}>
                Endereço
              </Typography>
              <Divider sx={{ mt: 1, mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="CEP"
                value={formatCep(form.cep)}
                onChange={(e) => {
                  if (!editing || saving) return;
                  const digits = e.target.value.replace(/\D/g, '');
                  if (digits.length <= 8) {
                    handleFieldChange('cep', digits);
                  }
                }}
                disabled={!editing || saving || buscandoCep}
                helperText={buscandoCep ? 'Buscando endereço...' : 'Apenas números (busca automática)'}
                InputProps={{
                  endAdornment: buscandoCep ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : null,
                }}
              />
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Endereço"
                value={form.endereco}
                onChange={(e) => handleFieldChange('endereco', e.target.value)}
                disabled={!editing || saving}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Bairro"
                value={form.bairro}
                onChange={(e) => handleFieldChange('bairro', e.target.value)}
                disabled={!editing || saving}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Cidade"
                value={form.cidade}
                onChange={(e) => handleFieldChange('cidade', e.target.value)}
                disabled={!editing || saving}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="UF"
                value={form.uf}
                onChange={(e) => handleFieldChange('uf', e.target.value)}
                disabled={!editing || saving}
              >
                <MenuItem value="">Selecione</MenuItem>
                {UFS.map((estado) => (
                  <MenuItem key={estado} value={estado}>
                    {estado}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Número"
                value={form.numero}
                onChange={(e) => handleFieldChange('numero', e.target.value)}
                disabled={!editing || saving}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Complemento"
                value={form.complemento}
                onChange={(e) =>
                  handleFieldChange('complemento', e.target.value)
                }
                disabled={!editing || saving}
              />
            </Grid>

            {editing && canEdit && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 2,
                  }}
                >
                  <Button variant="outlined" onClick={handleCancel} disabled={saving}>
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
    </Box>
  );
};


