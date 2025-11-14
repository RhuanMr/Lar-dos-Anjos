import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Chip,
  Avatar,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { userService } from '../services/user.service';
import { adoptionService } from '../services/adoption.service';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types/User';
import { Adoption } from '../types/Adoption';

export const AdopterDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { hasRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adopter, setAdopter] = useState<User | null>(null);
  const [adoptions, setAdoptions] = useState<Adoption[]>([]);

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

      const adopterResponse = await userService.getById(id);
      setAdopter(adopterResponse.data);

      // Verificar se é adotante
      if (!adopterResponse.data.roles.includes('ADOTANTE')) {
        setError('Este usuário não é um adotante');
        return;
      }

      // Carregar adoções do adotante
      const adoptionsData = await adoptionService.getByAdopter(id);
      setAdoptions(adoptionsData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar adotante');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!adopter) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          Adotante não encontrado
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/adopters')}>
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
          onClick={() => navigate('/adopters')}
          variant="outlined"
        >
          Voltar
        </Button>
        <Typography variant="h4">Detalhes do Adotante</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                src={adopter.foto}
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
              >
                {adopter.nome.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {adopter.nome}
              </Typography>
              <Chip
                label={adopter.ativo ? 'Ativo' : 'Inativo'}
                color={adopter.ativo ? 'success' : 'default'}
                sx={{ mb: 2 }}
              />
              <Divider sx={{ my: 2 }} />
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate(`/users/${adopter.id}`)}
              >
                Ver Perfil Completo
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informações Pessoais
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{adopter.email}</Typography>
                </Grid>
                {adopter.cpf && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      CPF
                    </Typography>
                    <Typography variant="body1">{adopter.cpf}</Typography>
                  </Grid>
                )}
                {adopter.telefone && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Telefone
                    </Typography>
                    <Typography variant="body1">{adopter.telefone}</Typography>
                  </Grid>
                )}
                {adopter.data_nascimento && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Data de Nascimento
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(adopter.data_nascimento)}
                    </Typography>
                  </Grid>
                )}
                {adopter.genero && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Gênero
                    </Typography>
                    <Typography variant="body1">
                      {adopter.genero === 'M'
                        ? 'Masculino'
                        : adopter.genero === 'F'
                        ? 'Feminino'
                        : 'Outro'}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {(adopter.endereco ||
            adopter.bairro ||
            adopter.cidade ||
            adopter.uf ||
            adopter.cep) && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Endereço
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {adopter.endereco && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Logradouro
                      </Typography>
                      <Typography variant="body1">
                        {adopter.endereco}
                        {adopter.numero && `, ${adopter.numero}`}
                        {adopter.complemento && ` - ${adopter.complemento}`}
                      </Typography>
                    </Grid>
                  )}
                  {adopter.bairro && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Bairro
                      </Typography>
                      <Typography variant="body1">{adopter.bairro}</Typography>
                    </Grid>
                  )}
                  {adopter.cidade && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Cidade
                      </Typography>
                      <Typography variant="body1">
                        {adopter.cidade}
                        {adopter.uf && ` - ${adopter.uf}`}
                      </Typography>
                    </Grid>
                  )}
                  {adopter.cep && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        CEP
                      </Typography>
                      <Typography variant="body1">{adopter.cep}</Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          )}

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Adoções ({adoptions.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {adoptions.length === 0 ? (
                <Typography color="text.secondary">
                  Nenhuma adoção registrada
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {adoptions.map((adoption) => (
                    <Paper key={adoption.id} sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Box>
                          <Typography variant="subtitle1">
                            Adoção #{adoption.id.substring(0, 8)}...
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Animal: {adoption.id_animal.substring(0, 8)}...
                          </Typography>
                          {adoption.dt_adocao && (
                            <Typography variant="body2" color="text.secondary">
                              Data: {formatDate(adoption.dt_adocao)}
                            </Typography>
                          )}
                        </Box>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => navigate(`/adoptions/${adoption.id}`)}
                        >
                          Ver Detalhes
                        </Button>
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

