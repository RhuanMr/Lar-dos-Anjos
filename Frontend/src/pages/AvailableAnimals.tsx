import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Pets as PetsIcon,
  Favorite as FavoriteIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { Layout } from '../components/layout/Layout';
import { animalService } from '../services/animalService';
import { Animal } from '../types';
import toast from 'react-hot-toast';

const AvailableAnimals: React.FC = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [filteredAnimals, setFilteredAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [adoptionDialogOpen, setAdoptionDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    especie: 'all',
    idade: 'all',
    search: '',
  });

  // TODO: Pegar project_id do contexto de autenticação ou organização selecionada
  const PROJECT_ID = 'temp-project-id';

  const loadAvailableAnimals = async () => {
    try {
      setLoading(true);
      const response = await animalService.getAvailableForAdoption(PROJECT_ID);
      
      if (response.success && response.data) {
        setAnimals(response.data.animals);
        setFilteredAnimals(response.data.animals);
      } else {
        // Dados mockados para desenvolvimento
        const mockAnimals: Animal[] = [
          {
            id: '1',
            nome: 'Bella',
            especie: 'Cão',
            raca: 'Labrador',
            idade: 3,
            condicao_saude: 'Excelente, vacinada e castrada',
            status: 'disponivel',
            project_id: PROJECT_ID,
            fotos: ['/placeholder-dog.jpg'],
            created_at: '2024-01-10',
            updated_at: '2024-01-10',
            historico: 'Bella foi encontrada na rua quando era filhote. É muito carinhosa e adora brincar com crianças.',
          },
          {
            id: '2',
            nome: 'Mimi',
            especie: 'Gato',
            raca: 'SRD',
            idade: 2,
            condicao_saude: 'Saudável, vacinada e castrada',
            status: 'disponivel',
            project_id: PROJECT_ID,
            fotos: ['/placeholder-cat.jpg'],
            created_at: '2024-01-08',
            updated_at: '2024-01-08',
            historico: 'Mimi é uma gatinha muito independente, mas carinhosa. Ideal para apartamentos.',
          },
          {
            id: '3',
            nome: 'Rex',
            especie: 'Cão',
            raca: 'Pastor Alemão',
            idade: 5,
            condicao_saude: 'Saudável, vacinado e castrado',
            status: 'disponivel',
            project_id: PROJECT_ID,
            fotos: ['/placeholder-dog2.jpg'],
            created_at: '2024-01-05',
            updated_at: '2024-01-05',
            historico: 'Rex é um cão protetor e leal. Precisa de uma família experiente com cães grandes.',
          },
          {
            id: '4',
            nome: 'Luna',
            especie: 'Gato',
            raca: 'Siamês',
            idade: 1,
            condicao_saude: 'Excelente, vacinada e castrada',
            status: 'disponivel',
            project_id: PROJECT_ID,
            fotos: ['/placeholder-cat2.jpg'],
            created_at: '2024-01-12',
            updated_at: '2024-01-12',
            historico: 'Luna é uma gatinha jovem e brincalhona. Adora interagir com pessoas.',
          },
        ];
        
        setAnimals(mockAnimals);
        setFilteredAnimals(mockAnimals);
      }
    } catch (error) {
      console.error('Erro ao carregar animais disponíveis:', error);
      toast.error('Erro ao carregar animais disponíveis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailableAnimals();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, animals]);

  const applyFilters = () => {
    let filtered = [...animals];

    // Filtro por espécie
    if (filters.especie !== 'all') {
      filtered = filtered.filter(animal => animal.especie === filters.especie);
    }

    // Filtro por idade
    if (filters.idade !== 'all') {
      switch (filters.idade) {
        case 'filhote':
          filtered = filtered.filter(animal => (animal.idade || 0) < 1);
          break;
        case 'jovem':
          filtered = filtered.filter(animal => (animal.idade || 0) >= 1 && (animal.idade || 0) <= 3);
          break;
        case 'adulto':
          filtered = filtered.filter(animal => (animal.idade || 0) > 3 && (animal.idade || 0) <= 7);
          break;
        case 'senior':
          filtered = filtered.filter(animal => (animal.idade || 0) > 7);
          break;
      }
    }

    // Filtro por busca
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(animal => 
        animal.nome.toLowerCase().includes(searchLower) ||
        animal.especie.toLowerCase().includes(searchLower) ||
        (animal.raca && animal.raca.toLowerCase().includes(searchLower)) ||
        (animal.historico && animal.historico.toLowerCase().includes(searchLower))
      );
    }

    setFilteredAnimals(filtered);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleAdoptionInterest = (animal: Animal) => {
    setSelectedAnimal(animal);
    setAdoptionDialogOpen(true);
  };

  const handleAdoptionSubmit = () => {
    // TODO: Implementar envio de interesse em adoção
    toast.success(`Interesse em adoção registrado para ${selectedAnimal?.nome}!`);
    setAdoptionDialogOpen(false);
    setSelectedAnimal(null);
  };

  const getAnimalImage = (animal: Animal) => {
    if (animal.fotos && animal.fotos.length > 0) {
      return animal.fotos[0];
    }
    return '/placeholder-animal.jpg';
  };

  const getAgeGroup = (age?: number) => {
    if (!age) return 'Não informado';
    if (age < 1) return 'Filhote';
    if (age <= 3) return 'Jovem';
    if (age <= 7) return 'Adulto';
    return 'Senior';
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
            <FavoriteIcon sx={{ mr: 2, verticalAlign: 'middle', color: 'error.main' }} />
            Animais Disponíveis para Adoção
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Encontre seu novo melhor amigo! {filteredAnimals.length} animais esperando por uma família.
          </Typography>
        </Box>

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
                    <MenuItem value="Pássaro">Pássaros</MenuItem>
                    <MenuItem value="Coelho">Coelhos</MenuItem>
                    <MenuItem value="Outros">Outros</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Faixa Etária</InputLabel>
                  <Select
                    value={filters.idade}
                    label="Faixa Etária"
                    onChange={(e) => handleFilterChange('idade', e.target.value)}
                  >
                    <MenuItem value="all">Todas</MenuItem>
                    <MenuItem value="filhote">Filhote (&lt; 1 ano)</MenuItem>
                    <MenuItem value="jovem">Jovem (1-3 anos)</MenuItem>
                    <MenuItem value="adulto">Adulto (3-7 anos)</MenuItem>
                    <MenuItem value="senior">Senior (&gt; 7 anos)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                <TextField
                  fullWidth
                  label="Buscar por nome, espécie ou características"
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

        {/* Lista de Animais */}
        {filteredAnimals.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            Nenhum animal encontrado com os filtros aplicados. Tente ajustar os critérios de busca.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {filteredAnimals.map((animal) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={animal.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="250"
                    image={getAnimalImage(animal)}
                    alt={animal.nome}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="h6" component="h2" fontWeight="bold">
                        {animal.nome}
                      </Typography>
                      <FavoriteIcon sx={{ color: 'error.main' }} />
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
                        label={getAgeGroup(animal.idade)} 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>

                    {animal.condicao_saude && (
                      <Typography variant="body2" sx={{ mb: 1 }} noWrap>
                        <strong>Saúde:</strong> {animal.condicao_saude}
                      </Typography>
                    )}

                    {animal.historico && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {animal.historico}
                      </Typography>
                    )}
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      startIcon={<FavoriteIcon />}
                      onClick={() => handleAdoptionInterest(animal)}
                      sx={{
                        background: 'linear-gradient(45deg, #FF6F00 30%, #FF8F00 90%)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #E65100 30%, #FF6F00 90%)',
                        }
                      }}
                    >
                      Tenho Interesse
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Dialog de Interesse em Adoção */}
        <Dialog 
          open={adoptionDialogOpen} 
          onClose={() => setAdoptionDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <FavoriteIcon color="error" />
              Interesse em Adoção - {selectedAnimal?.nome}
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedAnimal && (
              <Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Para demonstrar interesse na adoção de {selectedAnimal.nome}, entre em contato conosco através dos canais abaixo.
                </Alert>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box mb={2}>
                      <img
                        src={getAnimalImage(selectedAnimal)}
                        alt={selectedAnimal.nome}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Informações de {selectedAnimal.nome}
                    </Typography>
                    <Typography><strong>Espécie:</strong> {selectedAnimal.especie}</Typography>
                    {selectedAnimal.raca && (
                      <Typography><strong>Raça:</strong> {selectedAnimal.raca}</Typography>
                    )}
                    {selectedAnimal.idade && (
                      <Typography><strong>Idade:</strong> {selectedAnimal.idade} {selectedAnimal.idade === 1 ? 'ano' : 'anos'}</Typography>
                    )}
                    {selectedAnimal.condicao_saude && (
                      <Typography><strong>Saúde:</strong> {selectedAnimal.condicao_saude}</Typography>
                    )}
                  </Grid>
                </Grid>

                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    Como Proceder com a Adoção
                  </Typography>
                  <Typography variant="body2" paragraph>
                    1. Entre em contato conosco pelos canais abaixo
                  </Typography>
                  <Typography variant="body2" paragraph>
                    2. Agende uma visita para conhecer {selectedAnimal.nome}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    3. Preencha o formulário de adoção
                  </Typography>
                  <Typography variant="body2" paragraph>
                    4. Aguarde a aprovação e finalize o processo
                  </Typography>
                </Box>

                <Box mt={3} p={2} bgcolor="grey.100" borderRadius={1}>
                  <Typography variant="h6" gutterBottom>
                    Contatos da ONG
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <PhoneIcon color="primary" />
                    <Typography>(11) 99999-9999</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <EmailIcon color="primary" />
                    <Typography>contato@lardosanjos.org</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocationIcon color="primary" />
                    <Typography>Rua das Flores, 123 - Centro</Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAdoptionDialogOpen(false)}>
              Fechar
            </Button>
            <Button 
              onClick={handleAdoptionSubmit}
              variant="contained"
              color="primary"
              startIcon={<FavoriteIcon />}
            >
              Confirmar Interesse
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default AvailableAnimals;
