import { useState, useEffect } from 'react';
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
  MenuItem,
  InputAdornment,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { projectService, ProjectCreate } from '../services/project.service';
import { cepService } from '../services/cep.service';
import { useAuth } from '../contexts/AuthContext';
import { UFS } from '../constants/ufs';

export const ProjectNew = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buscandoCep, setBuscandoCep] = useState(false);

  // Campos do formulário
  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [cep, setCep] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');

  // Verificar se é SUPERADMIN
  const isSuperAdmin = hasRole('SUPERADMIN');

  // Buscar endereço automaticamente quando CEP tiver 8 dígitos
  useEffect(() => {
    const buscarEnderecoPorCep = async () => {
      if (buscandoCep || loading) return;
      
      const cepLimpo = cep.replace(/\D/g, '');
      if (cepLimpo.length === 8 && cepService.validarCep(cepLimpo)) {
        setBuscandoCep(true);
        try {
          const enderecoEncontrado = await cepService.buscarCep(cepLimpo);
          if (enderecoEncontrado) {
            // Preencher campos automaticamente
            setEndereco(enderecoEncontrado.endereco);
            setBairro(enderecoEncontrado.bairro);
            setCidade(enderecoEncontrado.cidade);
            setUf(enderecoEncontrado.uf);
            // Manter complemento e numero se já estiverem preenchidos
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
  }, [cep]);

  if (!isSuperAdmin) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          Você não tem permissão para acessar esta página. Apenas SuperAdmins podem cadastrar projetos.
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

    if (!endereco.trim()) {
      setError('Endereço é obrigatório');
      return false;
    }

    if (!bairro.trim()) {
      setError('Bairro é obrigatório');
      return false;
    }

    if (!cidade.trim()) {
      setError('Cidade é obrigatória');
      return false;
    }

    if (!uf) {
      setError('UF é obrigatória');
      return false;
    }

    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
      setError('CEP deve ter 8 dígitos');
      return false;
    }

    if (!telefone.trim()) {
      setError('Telefone é obrigatório');
      return false;
    }

    if (!email.trim()) {
      setError('Email é obrigatório');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email inválido');
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

      const cepLimpo = cep.replace(/\D/g, '');
      const telefoneLimpo = telefone.replace(/\D/g, '');

      const data: ProjectCreate = {
        nome: nome.trim(),
        endereco: endereco.trim(),
        numero: numero.trim() || undefined,
        complemento: complemento.trim() || undefined,
        bairro: bairro.trim(),
        cidade: cidade.trim(),
        uf: uf,
        cep: cepLimpo,
        telefone: telefoneLimpo || undefined,
        email: email.trim().toLowerCase(),
      };

      await projectService.create(data);
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao cadastrar projeto';
      setError(errorMessage);
      console.error('Erro ao cadastrar projeto:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard')}
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
        <Typography variant="h4" component="h1">
          Cadastro de Projeto
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
                label="Nome do Projeto"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefone"
                required
                value={telefone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 11) {
                    setTelefone(value);
                  }
                }}
                helperText="Apenas números (DDD + número)"
                disabled={loading}
              />
            </Grid>

            {/* Endereço */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Endereço
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="CEP"
                required
                value={cep}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 8) {
                    setCep(value);
                  }
                }}
                helperText={buscandoCep ? 'Buscando endereço...' : 'Apenas números (busca automática)'}
                disabled={loading || buscandoCep}
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
                required
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Número"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Complemento"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Bairro"
                required
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cidade"
                required
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="UF"
                required
                value={uf}
                onChange={(e) => setUf(e.target.value)}
                disabled={loading}
              >
                {UFS.map((estado) => (
                  <MenuItem key={estado} value={estado}>
                    {estado}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Botões */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/dashboard')}
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

