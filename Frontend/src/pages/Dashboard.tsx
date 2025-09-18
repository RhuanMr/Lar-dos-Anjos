import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Button,
  Divider,
} from '@mui/material';
import {
  Pets,
  People,
  AttachMoney,
  TrendingUp,
  Visibility,
  Refresh as RefreshIcon,
  TrendingDown,
  Home as HomeIcon,
  AccountBalance,
  PieChart as PieChartIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { Layout } from '../components/layout/Layout';
import { analyticsService, DashboardAnalytics } from '../services/analyticsService';
import { financialService, FinancialSummary } from '../services/financialService';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  // TODO: Pegar project_id do contexto de autenticação ou organização selecionada
  const PROJECT_ID = 'temp-project-id';

  // Cores para gráficos
  const COLORS = ['#2E7D32', '#FF6F00', '#1976D2', '#7B1FA2', '#D32F2F', '#F57C00'];

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados em paralelo
      const [analyticsResponse, financialResponse] = await Promise.all([
        analyticsService.getDashboardAnalytics(PROJECT_ID, period),
        financialService.getSummary(PROJECT_ID)
      ]);

      if (analyticsResponse.success && analyticsResponse.data) {
        setAnalytics(analyticsResponse.data);
      } else {
        // Dados mockados para desenvolvimento
        setAnalytics({
          period_days: Number(period),
          visits: { total: 1250, unique: 890, daily_average: 42 },
          animals: { total: 45, available: 28, adopted: 15, special_care: 2, new_this_period: 8 },
          financial: { total_income: 15750.50, total_expenses: 8920.30, balance: 6830.20, transactions_count: 24 },
          members: { total: 12, active: 10, new_this_period: 2 },
          growth_metrics: {
            visits_trend: [
              { date: '2024-01-15', count: 45 },
              { date: '2024-01-16', count: 52 },
              { date: '2024-01-17', count: 38 },
              { date: '2024-01-18', count: 61 },
              { date: '2024-01-19', count: 49 },
              { date: '2024-01-20', count: 55 },
              { date: '2024-01-21', count: 42 },
            ],
            adoptions_trend: [
              { date: '2024-01-15', count: 2 },
              { date: '2024-01-16', count: 1 },
              { date: '2024-01-17', count: 0 },
              { date: '2024-01-18', count: 3 },
              { date: '2024-01-19', count: 1 },
              { date: '2024-01-20', count: 2 },
              { date: '2024-01-21', count: 1 },
            ],
            financial_trend: [
              { date: '2024-01-15', income: 850, expenses: 420 },
              { date: '2024-01-16', income: 1200, expenses: 380 },
              { date: '2024-01-17', income: 650, expenses: 520 },
              { date: '2024-01-18', income: 950, expenses: 290 },
              { date: '2024-01-19', income: 1100, expenses: 450 },
              { date: '2024-01-20', income: 800, expenses: 380 },
              { date: '2024-01-21', income: 920, expenses: 310 },
            ]
          }
        });
      }

      if (financialResponse.success && financialResponse.data) {
        setFinancialSummary(financialResponse.data);
      } else {
        // Dados mockados para desenvolvimento
        setFinancialSummary({
          total_entradas: 15750.50,
          total_saidas: 8920.30,
          saldo: 6830.20,
          entradas_por_categoria: {
            doacao: 8500.00,
            adocao: 4250.50,
            outros: 3000.00
          },
          saidas_por_categoria: {
            veterinario: 3500.00,
            alimentacao: 2800.30,
            medicamentos: 1620.00,
            infraestrutura: 1000.00
          },
          transacoes_por_mes: {},
          total_transacoes: 24
        });
      }

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [period]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  // Dados para gráfico de pizza das categorias financeiras
  const expensesPieData = financialSummary ? Object.entries(financialSummary.saidas_por_categoria).map(([categoria, valor]) => ({
    name: categoria.charAt(0).toUpperCase() + categoria.slice(1),
    value: valor,
    formatted: formatCurrency(valor)
  })) : [];

  const incomePieData = financialSummary ? Object.entries(financialSummary.entradas_por_categoria).map(([categoria, valor]) => ({
    name: categoria.charAt(0).toUpperCase() + categoria.slice(1),
    value: valor,
    formatted: formatCurrency(valor)
  })) : [];

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
        <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
              <HomeIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Dashboard
        </Typography>
            <Typography variant="body1" color="text.secondary">
              Visão geral da plataforma - Últimos {period} dias
        </Typography>
          </Box>
          <Box display="flex" gap={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Período</InputLabel>
              <Select
                value={period}
                label="Período"
                onChange={(e) => setPeriod(e.target.value)}
              >
                <MenuItem value="7">7 dias</MenuItem>
                <MenuItem value="30">30 dias</MenuItem>
                <MenuItem value="90">90 dias</MenuItem>
              </Select>
            </FormControl>
            <IconButton onClick={loadDashboardData}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Cards de Métricas Principais */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      Animais Cadastrados
                    </Typography>
                    <Typography variant="h4" component="div">
                      {analytics?.animals.total || 0}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <Chip 
                        label={`${analytics?.animals.available || 0} disponíveis`} 
                        color="success" 
                        size="small" 
                      />
                      <Chip 
                        label={`${analytics?.animals.adopted || 0} adotados`} 
                        color="primary" 
                        size="small" 
                      />
                    </Box>
                  </Box>
                  <Pets sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      Visitas Totais
                    </Typography>
                    <Typography variant="h4" component="div">
                      {analytics?.visits.total || 0}
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      {analytics?.visits.unique || 0} visitantes únicos
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Média: {analytics?.visits.daily_average || 0}/dia
                    </Typography>
                  </Box>
                  <Visibility sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="h6">
                      Saldo Financeiro
                      </Typography>
                      <Typography variant="h4" component="div">
                      {formatCurrency(analytics?.financial.balance || 0)}
                      </Typography>
                      <Typography
                        variant="body2"
                      color={analytics?.financial.balance && analytics.financial.balance >= 0 ? 'success.main' : 'error.main'}
                    >
                      {analytics?.financial.balance && analytics.financial.balance >= 0 ? <TrendingUp /> : <TrendingDown />}
                      {analytics?.financial.transactions_count || 0} transações
                      </Typography>
                    </Box>
                  <AttachMoney sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      Membros Ativos
                    </Typography>
                    <Typography variant="h4" component="div">
                      {analytics?.members.active || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {analytics?.members.total || 0} membros totais
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      +{analytics?.members.new_this_period || 0} novos
                    </Typography>
                  </Box>
                  <People sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Gráficos */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Gráfico de Visitas */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader 
                title="Tendência de Visitas" 
                subheader="Visitas diárias nos últimos 7 dias"
              />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics?.growth_metrics.visits_trend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(label) => `Data: ${formatDate(label)}`}
                      formatter={(value) => [value, 'Visitas']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#2E7D32" 
                      fill="#2E7D32" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Gráfico de Adoções */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader 
                title="Adoções Recentes" 
                subheader="Últimos 7 dias"
              />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics?.growth_metrics.adoptions_trend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(label) => `Data: ${formatDate(label)}`}
                      formatter={(value) => [value, 'Adoções']}
                    />
                    <Bar dataKey="count" fill="#FF6F00" />
                  </BarChart>
                </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
        </Grid>

        {/* Gráficos Financeiros */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Tendência Financeira */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader 
                title="Movimentação Financeira" 
                subheader="Entradas vs Saídas - Últimos 7 dias"
              />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics?.growth_metrics.financial_trend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                    />
                    <YAxis tickFormatter={(value) => `R$ ${value}`} />
                    <Tooltip 
                      labelFormatter={(label) => `Data: ${formatDate(label)}`}
                      formatter={(value, name) => [
                        formatCurrency(Number(value)), 
                        name === 'income' ? 'Entradas' : 'Saídas'
                      ]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#2E7D32" 
                      strokeWidth={2}
                      name="Entradas"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#D32F2F" 
                      strokeWidth={2}
                      name="Saídas"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Resumo Financeiro */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader 
                title="Resumo Financeiro" 
                subheader="Últimos 30 dias"
              />
              <CardContent>
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Total de Entradas
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(analytics?.financial.total_income || 0)}
                  </Typography>
                </Box>
                
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Total de Saídas
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    {formatCurrency(analytics?.financial.total_expenses || 0)}
              </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box>
              <Typography variant="body2" color="text.secondary">
                    Saldo Final
                  </Typography>
                  <Typography 
                    variant="h5" 
                    color={analytics?.financial.balance && analytics.financial.balance >= 0 ? 'success.main' : 'error.main'}
                    fontWeight="bold"
                  >
                    {formatCurrency(analytics?.financial.balance || 0)}
              </Typography>
                </Box>

                <Box mt={2}>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    startIcon={<AccountBalance />}
                    onClick={() => window.location.href = '/financial'}
                  >
                    Ver Relatório Completo
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Gráficos de Pizza - Categorias Financeiras */}
        <Grid container spacing={3}>
          {/* Distribuição de Entradas */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Entradas por Categoria" 
                subheader="Distribuição das receitas"
                action={
                  <PieChartIcon color="primary" />
                }
              />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={incomePieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {incomePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Distribuição de Saídas */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Saídas por Categoria" 
                subheader="Distribuição das despesas"
                action={
                  <PieChartIcon color="primary" />
                }
              />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expensesPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expensesPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default Dashboard;