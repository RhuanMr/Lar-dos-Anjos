import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const schema = yup.object({
  nome: yup
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .required('Nome é obrigatório'),
  descricao: yup
    .string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .required('Descrição é obrigatória'),
  cpf_user: yup
    .string()
    .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF deve estar no formato 000.000.000-00')
    .required('CPF do responsável é obrigatório'),
  endereco_visivel: yup.boolean(),
  endereco: yup.object({
    cep: yup
      .string()
      .matches(/^\d{5}-?\d{3}$/, 'CEP deve estar no formato 00000-000')
      .required('CEP é obrigatório'),
    estado: yup
      .string()
      .length(2, 'Estado deve ter 2 caracteres')
      .required('Estado é obrigatório'),
    cidade: yup
      .string()
      .min(2, 'Cidade deve ter pelo menos 2 caracteres')
      .required('Cidade é obrigatória'),
    bairro: yup
      .string()
      .min(2, 'Bairro deve ter pelo menos 2 caracteres')
      .required('Bairro é obrigatório'),
    numero: yup
      .number()
      .positive('Número deve ser positivo')
      .required('Número é obrigatório'),
    complemento: yup.string(),
  }),
});

type RegisterOrganizationForm = yup.InferType<typeof schema>;

const RegisterOrganization: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterOrganizationForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      cpf_user: user?.cpf || '',
      endereco_visivel: false,
    },
  });

  const enderecoVisivel = watch('endereco_visivel');

  const onSubmit = async (data: RegisterOrganizationForm) => {
    try {
      setIsLoading(true);
      setError('');

      const response = await api.post('/organizations', data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        navigate('/dashboard');
      } else {
        throw new Error(response.data.message || 'Erro ao criar organização');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erro ao criar organização');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="lg">
      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            Cadastrar Organização
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Cadastre sua ONG ou organização na plataforma Lar dos Anjos
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ width: '100%' }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Informações da Organização
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('nome')}
                  required
                  fullWidth
                  id="nome"
                  label="Nome da Organização"
                  name="nome"
                  error={!!errors.nome}
                  helperText={errors.nome?.message}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('cpf_user')}
                  required
                  fullWidth
                  id="cpf_user"
                  label="CPF do Responsável"
                  name="cpf_user"
                  placeholder="000.000.000-00"
                  error={!!errors.cpf_user}
                  helperText={errors.cpf_user?.message}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  {...register('descricao')}
                  required
                  fullWidth
                  multiline
                  rows={4}
                  id="descricao"
                  label="Descrição da Organização"
                  name="descricao"
                  error={!!errors.descricao}
                  helperText={errors.descricao?.message}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Endereço
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <TextField
                  {...register('endereco.cep')}
                  required
                  fullWidth
                  id="cep"
                  label="CEP"
                  name="endereco.cep"
                  placeholder="00000-000"
                  error={!!errors.endereco?.cep}
                  helperText={errors.endereco?.cep?.message}
                />
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <TextField
                  {...register('endereco.estado')}
                  required
                  fullWidth
                  id="estado"
                  label="Estado"
                  name="endereco.estado"
                  placeholder="SP"
                  error={!!errors.endereco?.estado}
                  helperText={errors.endereco?.estado?.message}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('endereco.cidade')}
                  required
                  fullWidth
                  id="cidade"
                  label="Cidade"
                  name="endereco.cidade"
                  error={!!errors.endereco?.cidade}
                  helperText={errors.endereco?.cidade?.message}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('endereco.bairro')}
                  required
                  fullWidth
                  id="bairro"
                  label="Bairro"
                  name="endereco.bairro"
                  error={!!errors.endereco?.bairro}
                  helperText={errors.endereco?.bairro?.message}
                />
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <TextField
                  {...register('endereco.numero')}
                  required
                  fullWidth
                  type="number"
                  id="numero"
                  label="Número"
                  name="endereco.numero"
                  error={!!errors.endereco?.numero}
                  helperText={errors.endereco?.numero?.message}
                />
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <TextField
                  {...register('endereco.complemento')}
                  fullWidth
                  id="complemento"
                  label="Complemento"
                  name="endereco.complemento"
                  error={!!errors.endereco?.complemento}
                  helperText={errors.endereco?.complemento?.message}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      {...register('endereco_visivel')}
                      checked={enderecoVisivel}
                    />
                  }
                  label="Tornar endereço visível publicamente"
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Cadastrar Organização'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterOrganization;
