import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Pets,
  Favorite,
  AttachMoney,
  People,
  TrendingUp,
  CalendarToday,
} from '@mui/icons-material';
import { animalService } from '../services/animal.service';
import { adoptionService } from '../services/adoption.service';
import { donationService } from '../services/donation.service';
import { employeeService } from '../services/employee.service';
import { volunteerService } from '../services/volunteer.service';
import { useProject } from '../contexts/ProjectContext';
import { Animal } from '../types/Animal';
import { Adoption } from '../types/Adoption';
import { Donation } from '../types/Donation';

interface DashboardStats {
  totalAnimais: number;
  animaisDisponiveis: number;
  totalAdocoes: number;
  totalDoacoes: number;
  totalFuncionariosVoluntarios: number;
  doacoesMes: number;
  adocoesMes: number;
  valorDoacoesMes: number;
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const { selectedProject } = useProject();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalAnimais: 0,
    animaisDisponiveis: 0,
    totalAdocoes: 0,
    totalDoacoes: 0,
    totalFuncionariosVoluntarios: 0,
    doacoesMes: 0,
    adocoesMes: 0,
    valorDoacoesMes: 0,
  });
  const [recentAnimals, setRecentAnimals] = useState<Animal[]>([]);
  const [recentAdoptions, setRecentAdoptions] = useState<Adoption[]>([]);

  useEffect(() => {
    if (selectedProject) {
      loadDashboardData();
    }
  }, [selectedProject]);

  const loadDashboardData = async () => {
    if (!selectedProject) return;

    try {
      setLoading(true);
      setError(null);

      // Carregar dados em paralelo
      const [animals, adoptions, donations, employees, volunteers] =
        await Promise.all([
          animalService.getByProject(selectedProject.id),
          adoptionService.getByProject(selectedProject.id),
          donationService.getByProject(selectedProject.id),
          employeeService.getByProject(selectedProject.id),
          volunteerService.getByProject(selectedProject.id),
        ]);

      // Calcular estatísticas
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Animais disponíveis (não adotados)
      const adoptedAnimalIds = new Set(adoptions.map((a) => a.id_animal));
      const availableAnimals = animals.filter(
        (a) => !adoptedAnimalIds.has(a.id)
      );

      // Doações do mês
      const donationsThisMonth = donations.filter((d) => {
        if (!d.data) return false;
        const donationDate = new Date(d.data);
        return (
          donationDate.getMonth() === currentMonth &&
          donationDate.getFullYear() === currentYear
        );
      });

      // Adoções do mês
      const adoptionsThisMonth = adoptions.filter((a) => {
        if (!a.dt_adocao) return false;
        const adoptionDate = new Date(a.dt_adocao);
        return (
          adoptionDate.getMonth() === currentMonth &&
          adoptionDate.getFullYear() === currentYear
        );
      });

      // Valor total das doações do mês
      const valorDoacoesMes = donationsThisMonth.reduce((sum, d) => {
        return sum + (d.valor || 0);
      }, 0);

      // Animais recentes (últimos 5)
      const recentAnimalsList = animals
        .sort((a, b) => {
          const dateA = a.entrada ? new Date(a.entrada).getTime() : 0;
          const dateB = b.entrada ? new Date(b.entrada).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 5);

      // Adoções recentes (últimas 5)
      const recentAdoptionsList = adoptions
        .sort((a, b) => {
          const dateA = a.dt_adocao ? new Date(a.dt_adocao).getTime() : 0;
          const dateB = b.dt_adocao ? new Date(b.dt_adocao).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 5);

      setStats({
        totalAnimais: animals.length,
        animaisDisponiveis: availableAnimals.length,
        totalAdocoes: adoptions.length,
        totalDoacoes: donations.length,
        totalFuncionariosVoluntarios:
          (employees.data?.length || 0) + (volunteers.data?.length || 0),
        doacoesMes: donationsThisMonth.length,
        adocoesMes: adoptionsThisMonth.length,
        valorDoacoesMes,
      });

      setRecentAnimals(recentAnimalsList);
      setRecentAdoptions(recentAdoptionsList);
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Erro ao carregar dados do dashboard'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (!selectedProject) {
    return (
      <Box>
        <Alert severity="warning">
          Nenhum projeto selecionado. Por favor, selecione um projeto.
        </Alert>
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

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={loadDashboardData}>
          Tentar Novamente
        </Button>
      </Box>
    );
  }

  const StatCard = ({
    title,
    value,
    icon,
    color,
    onClick,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    onClick?: () => void;
  }) => (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s',
        '&:hover': onClick
          ? {
              transform: 'translateY(-4px)',
              boxShadow: 4,
            }
          : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: color, mr: 2 }}>
            {icon}
          </Avatar>
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Visão geral do projeto {selectedProject.nome}
      </Typography>

      {/* Cards de Estatísticas Principais */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total de Animais"
            value={stats.totalAnimais}
            icon={<Pets />}
            color="#88E788"
            onClick={() => navigate('/animals')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Animais Disponíveis"
            value={stats.animaisDisponiveis}
            icon={<Favorite />}
            color="#B3EBF2"
            onClick={() => navigate('/animals')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total de Adoções"
            value={stats.totalAdocoes}
            icon={<TrendingUp />}
            color="#88E788"
            onClick={() => navigate('/adoptions')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total de Doações"
            value={stats.totalDoacoes}
            icon={<AttachMoney />}
            color="#B3EBF2"
            onClick={() => navigate('/donations')}
          />
        </Grid>
      </Grid>

      {/* Cards de Estatísticas do Mês */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Este Mês</Typography>
              </Box>
              <Typography variant="h5" gutterBottom>
                {stats.adocoesMes} Adoções
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.doacoesMes} Doações
              </Typography>
              {stats.valorDoacoesMes > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {formatCurrency(stats.valorDoacoesMes)} em doações financeiras
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <People sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Equipe</Typography>
              </Box>
              <Typography variant="h5">
                {stats.totalFuncionariosVoluntarios} Membros
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Funcionários e voluntários
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Taxa de Adoção</Typography>
              </Box>
              <Typography variant="h5">
                {stats.totalAnimais > 0
                  ? Math.round(
                      (stats.totalAdocoes / stats.totalAnimais) * 100
                    )
                  : 0}
                %
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.totalAdocoes} de {stats.totalAnimais} animais
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Listas Recentes */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Animais Recentes</Typography>
            </Box>
            {recentAnimals.length === 0 ? (
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhum animal cadastrado ainda.
                </Typography>
              </Box>
            ) : (
              <List>
                {recentAnimals.map((animal) => (
                  <ListItem
                    key={animal.id}
                    button
                    onClick={() => navigate(`/animals/${animal.id}`)}
                  >
                    <ListItemAvatar>
                      <Avatar src={animal.foto}>
                        <Pets />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={animal.nome || 'Sem nome'}
                      secondary={`Entrada: ${formatDate(animal.entrada)}`}
                    />
                    {animal.vacinado && (
                      <Chip
                        label={animal.vacinado}
                        size="small"
                        color={
                          animal.vacinado === 'Sim'
                            ? 'success'
                            : animal.vacinado === 'Parcial'
                            ? 'warning'
                            : 'default'
                        }
                      />
                    )}
                  </ListItem>
                ))}
              </List>
            )}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/animals')}
              >
                Ver Todos os Animais
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Adoções Recentes</Typography>
            </Box>
            {recentAdoptions.length === 0 ? (
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhuma adoção registrada ainda.
                </Typography>
              </Box>
            ) : (
              <List>
                {recentAdoptions.map((adoption) => (
                  <ListItem
                    key={adoption.id}
                    button
                    onClick={() => navigate(`/adoptions/${adoption.id}`)}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <Favorite />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`Adoção #${adoption.id.slice(0, 8)}`}
                      secondary={`Data: ${formatDate(adoption.dt_adocao)}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/adoptions')}
              >
                Ver Todas as Adoções
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
