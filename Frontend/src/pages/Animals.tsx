import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  CircularProgress,
  Alert,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Pets as PetsIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { animalService } from '../services/animalService';
import { Animal } from '../types';
import toast from 'react-hot-toast';

const Animals: React.FC = () => {
  const navigate = useNavigate();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: 'all',
    especie: 'all',
  });
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // TODO: Pegar project_id do contexto de autenticação ou organização selecionada
  const PROJECT_ID = 'temp-project-id'; // Temporário para desenvolvimento

  const statusColors = {
    disponivel: 'success',
    adotado: 'primary',
    falecido: 'error',
    cuidados_especiais: 'warning',
  } as const;

  const statusLabels = {
    disponivel: 'Disponível',
    adotado: 'Adotado',
    falecido: 'Falecido',
    cuidados_especiais: 'Cuidados Especiais',
  };

  const loadAnimals = async () => {
    try {
      setLoading(true);
      const response = await animalService.list({
        project_id: PROJECT_ID,
        status: filters.status !== 'all' ? filters.status : undefined,
        especie: filters.especie !== 'all' ? filters.especie : undefined,
        page,
        limit: 12,
      });

      if (response.success && response.data) {
        setAnimals(response.data.animals);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        toast.error('Erro ao carregar animais');
      }
    } catch (error) {
      console.error('Erro ao carregar animais:', error);
      toast.error('Erro ao carregar animais');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnimals();
  }, [page, filters]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1); // Reset para primeira página ao filtrar
  };

  const handleViewAnimal = (animal: Animal) => {
    setSelectedAnimal(animal);
    setViewDialogOpen(true);
  };

  const handleEditAnimal = (animal: Animal) => {
    navigate(`/animals/edit/${animal.id}`);
  };

  const handleAddAnimal = () => {
    navigate('/animals/new');
  };

  const getAnimalImage = (animal: Animal) => {
    if (animal.fotos && animal.fotos.length > 0) {
      return animal.fotos[0];
    }
    return '/placeholder-animal.jpg'; // Imagem placeholder
  };

  if (loading && animals.length === 0) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="xl">
        {/* Header */}
        <Box mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            <PetsIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
            Gestão de Animais
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie os animais sob cuidado da organização
          </Typography>
        </Box>

        {/* Filtros */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Filtros
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    label="Status"
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="disponivel">Disponível</MenuItem>
                    <MenuItem value="adotado">Adotado</MenuItem>
                    <MenuItem value="cuidados_especiais">Cuidados Especiais</MenuItem>
                    <MenuItem value="falecido">Falecido</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Espécie</InputLabel>
                  <Select
                    value={filters.especie}
                    label="Espécie"
                    onChange={(e) => handleFilterChange('especie', e.target.value)}
                  >
                    <MenuItem value="all">Todas</MenuItem>
                    <MenuItem value="Cão">Cão</MenuItem>
                    <MenuItem value="Gato">Gato</MenuItem>
                    <MenuItem value="Pássaro">Pássaro</MenuItem>
                    <MenuItem value="Coelho">Coelho</MenuItem>
                    <MenuItem value="Outros">Outros</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Lista de Animais */}
        {animals.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            Nenhum animal encontrado com os filtros aplicados.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {animals.map((animal) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={animal.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={getAnimalImage(animal)}
                    alt={animal.nome}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom noWrap>
                      {animal.nome}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {animal.especie} {animal.raca && `- ${animal.raca}`}
                    </Typography>
                    {animal.idade && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {animal.idade} {animal.idade === 1 ? 'ano' : 'anos'}
                      </Typography>
                    )}
                    <Box mt={1}>
                      <Chip
                        label={statusLabels[animal.status]}
                        color={statusColors[animal.status]}
                        size="small"
                      />
                    </Box>
                    {animal.condicao_saude && (
                      <Typography variant="body2" sx={{ mt: 1 }} noWrap>
                        <strong>Saúde:</strong> {animal.condicao_saude}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => handleViewAnimal(animal)}
                    >
                      Ver
                    </Button>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEditAnimal(animal)}
                    >
                      Editar
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
            />
          </Box>
        )}

        {/* Botão Adicionar */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleAddAnimal}
        >
          <AddIcon />
        </Fab>

        {/* Dialog de Visualização */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedAnimal?.nome}
          </DialogTitle>
          <DialogContent>
            {selectedAnimal && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  {selectedAnimal.fotos && selectedAnimal.fotos.length > 0 && (
                    <Box mb={2}>
                      <img
                        src={selectedAnimal.fotos[0]}
                        alt={selectedAnimal.nome}
                        style={{
                          width: '100%',
                          height: '300px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                        }}
                      />
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Informações Básicas
                  </Typography>
                  <Typography><strong>Espécie:</strong> {selectedAnimal.especie}</Typography>
                  {selectedAnimal.raca && (
                    <Typography><strong>Raça:</strong> {selectedAnimal.raca}</Typography>
                  )}
                  {selectedAnimal.idade && (
                    <Typography><strong>Idade:</strong> {selectedAnimal.idade} {selectedAnimal.idade === 1 ? 'ano' : 'anos'}</Typography>
                  )}
                  <Typography>
                    <strong>Status:</strong>{' '}
                    <Chip
                      label={statusLabels[selectedAnimal.status]}
                      color={statusColors[selectedAnimal.status]}
                      size="small"
                    />
                  </Typography>
                  
                  {selectedAnimal.condicao_saude && (
                    <>
                      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                        Condição de Saúde
                      </Typography>
                      <Typography>{selectedAnimal.condicao_saude}</Typography>
                    </>
                  )}
                  
                  {selectedAnimal.cirurgia && (
                    <>
                      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                        Histórico de Cirurgias
                      </Typography>
                      <Typography>{selectedAnimal.cirurgia}</Typography>
                    </>
                  )}
                  
                  {selectedAnimal.historico && (
                    <>
                      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                        Histórico
                      </Typography>
                      <Typography>{selectedAnimal.historico}</Typography>
                    </>
                  )}
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>
              Fechar
            </Button>
            {selectedAnimal && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => {
                  setViewDialogOpen(false);
                  handleEditAnimal(selectedAnimal);
                }}
              >
                Editar
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default Animals;
