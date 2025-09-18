import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Pagination,
  Avatar,
  Paper,
} from '@mui/material';
import {
  Pets as PetsIcon,
  CheckCircle as CheckCircleIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import { Layout } from '../components/layout/Layout';
import { animalService } from '../services/animalService';
import { Animal } from '../types';
import toast from 'react-hot-toast';

interface AdoptedAnimal extends Animal {
  adoption_date?: string;
  tutor?: {
    id: string;
    nome: string;
    email: string;
    telefone?: string;
  };
}

const AdoptedAnimals: React.FC = () => {
  const [animals, setAnimals] = useState<AdoptedAnimal[]>([]);
  const [filteredAnimals, setFilteredAnimals] = useState<AdoptedAnimal[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    especie: 'all',
    year: 'all',
    search: '',
  });

  // TODO: Pegar project_id do contexto de autenticação ou organização selecionada
  const PROJECT_ID = 'temp-project-id';

  const loadAdoptedAnimals = async () => {
    try {
      setLoading(true);
      const response = await animalService.getAdopted(PROJECT_ID, page);
      
      if (response.success && response.data) {
        setAnimals(response.data.animals);
        setFilteredAnimals(response.data.animals);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        // Dados mockados para desenvolvimento
        const mockAnimals: AdoptedAnimal[] = [
          {
            id: '1',
            nome: 'Max',
            especie: 'Cão',
            raca: 'Golden Retriever',
            idade: 4,
            status: 'adotado',
            project_id: PROJECT_ID,
            fotos: ['/placeholder-dog.jpg'],
            created_at: '2023-06-15',
            updated_at: '2023-12-10',
            adoption_date: '2023-12-10',
            historico: 'Max foi resgatado quando era filhote. Muito carinhoso e brincalhão.',
            tutor: {
              id: 'tutor1',
              nome: 'Ana Silva',
              email: 'ana.silva@email.com',
              telefone: '(11) 99999-1111'
            }
          },
          {
            id: '2',
            nome: 'Mingau',
            especie: 'Gato',
            raca: 'SRD',
            idade: 2,
            status: 'adotado',
            project_id: PROJECT_ID,
            fotos: ['/placeholder-cat.jpg'],
            created_at: '2023-08-20',
            updated_at: '2024-01-05',
            adoption_date: '2024-01-05',
            historico: 'Mingau foi encontrado na rua, muito tímido no início.',
            tutor: {
              id: 'tutor2',
              nome: 'Carlos Santos',
              email: 'carlos.santos@email.com',
              telefone: '(11) 99999-2222'
            }
          },
          {
            id: '3',
            nome: 'Pipoca',
            especie: 'Cão',
            raca: 'Poodle',
            idade: 1,
            status: 'adotado',
            project_id: PROJECT_ID,
            fotos: ['/placeholder-dog2.jpg'],
            created_at: '2023-09-10',
            updated_at: '2023-11-25',
            adoption_date: '2023-11-25',
            historico: 'Pipoca é uma cachorrinha muito alegre e sociável.',
            tutor: {
              id: 'tutor3',
              nome: 'Maria Oliveira',
              email: 'maria.oliveira@email.com',
              telefone: '(11) 99999-3333'
            }
          },
          {
            id: '4',
            nome: 'Simba',
            especie: 'Gato',
            raca: 'Persa',
            idade: 3,
            status: 'adotado',
            project_id: PROJECT_ID,
            fotos: ['/placeholder-cat2.jpg'],
            created_at: '2023-05-05',
            updated_at: '2023-10-15',
            adoption_date: '2023-10-15',
            historico: 'Simba é um gato muito tranquilo e carinhoso.',
            tutor: {
              id: 'tutor4',
              nome: 'João Costa',
              email: 'joao.costa@email.com',
              telefone: '(11) 99999-4444'
            }
          },
        ];
        
        setAnimals(mockAnimals);
        setFilteredAnimals(mockAnimals);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Erro ao carregar animais adotados:', error);
      toast.error('Erro ao carregar animais adotados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdoptedAnimals();
  }, [page]);

  useEffect(() => {
    applyFilters();
  }, [filters, animals]);

  const applyFilters = () => {
    let filtered = [...animals];

    // Filtro por espécie
    if (filters.especie !== 'all') {
      filtered = filtered.filter(animal => animal.especie === filters.especie);
    }

    // Filtro por ano de adoção
    if (filters.year !== 'all') {
      filtered = filtered.filter(animal => 
        animal.adoption_date && animal.adoption_date.startsWith(filters.year)
      );
    }

    // Filtro por busca
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(animal => 
        animal.nome.toLowerCase().includes(searchLower) ||
        animal.especie.toLowerCase().includes(searchLower) ||
        (animal.raca && animal.raca.toLowerCase().includes(searchLower)) ||
        (animal.tutor && animal.tutor.nome.toLowerCase().includes(searchLower))
      );
    }

    setFilteredAnimals(filtered);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const getAnimalImage = (animal: Animal) => {
    if (animal.fotos && animal.fotos.length > 0) {
      return animal.fotos[0];
    }
    return '/placeholder-animal.jpg';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Data não informada';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  // Calcular estatísticas rápidas
  const stats = {
    total: filteredAnimals.length,
    thisYear: filteredAnimals.filter(a => 
      a.adoption_date && a.adoption_date.startsWith(new Date().getFullYear().toString())
    ).length,
    dogs: filteredAnimals.filter(a => a.especie === 'Cão').length,
    cats: filteredAnimals.filter(a => a.especie === 'Gato').length,
  };

  if (loading) {
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
            <CheckCircleIcon sx={{ mr: 2, verticalAlign: 'middle', color: 'success.main' }} />
            Animais Adotados
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Histórias de sucesso! {stats.total} animais encontraram suas famílias.
          </Typography>
        </Box>

        {/* Estatísticas Rápidas */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Adotados
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {stats.thisYear}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Este Ano
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {stats.dogs}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cães
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {stats.cats}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gatos
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Filtros */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Filtros de Busca
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Espécie</InputLabel>
                  <Select
                    value={filters.especie}
                    label="Espécie"
                    onChange={(e) => handleFilterChange('especie', e.target.value)}
                  >
                    <MenuItem value="all">Todas</MenuItem>
                    <MenuItem value="Cão">Cães</MenuItem>
                    <MenuItem value="Gato">Gatos</MenuItem>
                    <MenuItem value="Outros">Outros</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Ano de Adoção</InputLabel>
                  <Select
                    value={filters.year}
                    label="Ano de Adoção"
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="2024">2024</MenuItem>
                    <MenuItem value="2023">2023</MenuItem>
                    <MenuItem value="2022">2022</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                <TextField
                  fullWidth
                  label="Buscar por nome do animal ou tutor"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Lista de Animais Adotados */}
        {filteredAnimals.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            Nenhum animal adotado encontrado com os filtros aplicados.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {filteredAnimals.map((animal) => (
              <Grid item xs={12} sm={6} md={4} key={animal.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative',
                    '&:hover': {
                      boxShadow: 3,
                    }
                  }}
                >
                  {/* Badge de Adotado */}
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="ADOTADO"
                    color="success"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 1,
                      fontWeight: 'bold'
                    }}
                  />

                  <CardMedia
                    component="img"
                    height="200"
                    image={getAnimalImage(animal)}
                    alt={animal.nome}
                    sx={{ objectFit: 'cover' }}
                  />
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Typography variant="h6" component="h2" fontWeight="bold">
                        {animal.nome}
                      </Typography>
                      <FavoriteIcon sx={{ color: 'error.main', fontSize: 20 }} />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {animal.especie} {animal.raca && `- ${animal.raca}`}
                    </Typography>
                    
                    <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                      {animal.idade && (
                        <Chip 
                          label={`${animal.idade} ${animal.idade === 1 ? 'ano' : 'anos'}`} 
                          size="small" 
                          color="primary"
                        />
                      )}
                      <Chip 
                        icon={<CalendarIcon />}
                        label={formatDate(animal.adoption_date)} 
                        size="small" 
                        variant="outlined"
                        color="success"
                      />
                    </Box>

                    {/* Informações do Tutor */}
                    {animal.tutor && (
                      <Box 
                        sx={{ 
                          bgcolor: 'grey.50', 
                          p: 2, 
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'grey.200'
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Avatar 
                            sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                          >
                            {getInitials(animal.tutor.nome)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              Nova Família
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {animal.tutor.nome}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Typography variant="caption" color="text.secondary" display="block">
                          📧 {animal.tutor.email}
                        </Typography>
                        {animal.tutor.telefone && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            📱 {animal.tutor.telefone}
                          </Typography>
                        )}
                      </Box>
                    )}

                    {animal.historico && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mt: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        <strong>História:</strong> {animal.historico}
                      </Typography>
                    )}
                  </CardContent>
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

        {/* Mensagem de Sucesso */}
        {filteredAnimals.length > 0 && (
          <Paper 
            sx={{ 
              p: 3, 
              mt: 4, 
              textAlign: 'center',
              bgcolor: 'success.50',
              border: '1px solid',
              borderColor: 'success.200'
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" color="success.dark" gutterBottom>
              Missão Cumprida! 🎉
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Cada adoção representa uma vida transformada e uma família mais feliz. 
              Obrigado por fazer parte desta história de amor e cuidado!
            </Typography>
          </Paper>
        )}
      </Container>
    </Layout>
  );
};

export default AdoptedAnimals;
