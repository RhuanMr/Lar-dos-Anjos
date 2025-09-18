import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
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
import { financialService, FinancialStats, Transaction } from '../services/financialService';
import toast from 'react-hot-toast';

const FinancialReports: React.FC = () => {
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [filters, setFilters] = useState({
    tipo: 'all',
    categoria: 'all',
    start_date: '',
    end_date: '',
  });
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);

  // TODO: Pegar project_id do contexto de autenticação ou organização selecionada
  const PROJECT_ID = 'temp-project-id';

  // Cores para gráficos
  const COLORS = ['#2E7D32', '#FF6F00', '#1976D2', '#7B1FA2', '#D32F2F', '#F57C00'];

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados em paralelo
      const [statsResponse, transactionsResponse] = await Promise.all([
        financialService.getStats(PROJECT_ID, Number(selectedYear)),
        financialService.list({
          project_id: PROJECT_ID,
          ...filters,
          limit: 50
        })
      ]);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      } else {
        // Dados mockados para desenvolvimento
        setStats({
          resumo_anual: {
            total_entradas: 45750.80,
            total_saidas: 28920.45,
            saldo: 16830.35,
            numero_transacoes: 87
          },
          por_categoria: {
            entradas: {
              doacao: { valor: 25000.00, count: 15, percentual: 55 },
              adocao: { valor: 12750.80, count: 25, percentual: 28 },
              outros: { valor: 8000.00, count: 8, percentual: 17 }
            },
            saidas: {
              veterinario: { valor: 12000.00, count: 18, percentual: 41 },
              alimentacao: { valor: 8500.45, count: 24, percentual: 29 },
              medicamentos: { valor: 5420.00, count: 12, percentual: 19 },
              infraestrutura: { valor: 3000.00, count: 3, percentual: 10 }
            }
          },
          por_mes: [
            { mes: '2024-01', nome_mes: 'Janeiro', entradas: 3500, saidas: 2800, saldo: 700, transacoes: 8 },
            { mes: '2024-02', nome_mes: 'Fevereiro', entradas: 4200, saidas: 2400, saldo: 1800, transacoes: 7 },
            { mes: '2024-03', nome_mes: 'Março', entradas: 3800, saidas: 3200, saldo: 600, transacoes: 9 },
            { mes: '2024-04', nome_mes: 'Abril', entradas: 4500, saidas: 2600, saldo: 1900, transacoes: 6 },
            { mes: '2024-05', nome_mes: 'Maio', entradas: 3900, saidas: 2800, saldo: 1100, transacoes: 8 },
            { mes: '2024-06', nome_mes: 'Junho', entradas: 4100, saidas: 3100, saldo: 1000, transacoes: 7 },
            { mes: '2024-07', nome_mes: 'Julho', entradas: 3700, saidas: 2900, saldo: 800, transacoes: 9 },
            { mes: '2024-08', nome_mes: 'Agosto', entradas: 4300, saidas: 2700, saldo: 1600, transacoes: 8 },
            { mes: '2024-09', nome_mes: 'Setembro', entradas: 3600, saidas: 3000, saldo: 600, transacoes: 6 },
            { mes: '2024-10', nome_mes: 'Outubro', entradas: 4000, saidas: 2500, saldo: 1500, transacoes: 7 },
            { mes: '2024-11', nome_mes: 'Novembro', entradas: 3800, saidas: 2800, saldo: 1000, transacoes: 8 },
            { mes: '2024-12', nome_mes: 'Dezembro', entradas: 4200, saidas: 3200, saldo: 1000, transacoes: 6 }
          ],
          maiores_entradas: [],
          maiores_saidas: []
        });
      }

      if (transactionsResponse.success && transactionsResponse.data) {
        setTransactions(transactionsResponse.data.transactions);
      } else {
        // Dados mockados para desenvolvimento
        setTransactions([
          {
            id: '1',
            project_id: PROJECT_ID,
            tipo: 'entrada',
            categoria: 'doacao',
            valor: 1500.00,
            descricao: 'Doação mensal - João Silva',
            data_transacao: '2024-01-15',
            created_at: '2024-01-15'
          },
          {
            id: '2',
            project_id: PROJECT_ID,
            tipo: 'saida',
            categoria: 'veterinario',
            valor: 850.00,
            descricao: 'Consulta e vacinas - Dr. Pedro',
            data_transacao: '2024-01-18',
            created_at: '2024-01-18'
          },
          {
            id: '3',
            project_id: PROJECT_ID,
            tipo: 'entrada',
            categoria: 'adocao',
            valor: 200.00,
            descricao: 'Taxa de adoção - Bella',
            data_transacao: '2024-01-20',
            created_at: '2024-01-20'
          }
        ]);
      }

    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinancialData();
  }, [selectedYear, filters]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const getCategoryColor = (tipo: string) => {
    return tipo === 'entrada' ? 'success' : 'error';
  };

  const getCategoryLabel = (categoria: string) => {
    const labels: Record<string, string> = {
      doacao: 'Doação',
      adocao: 'Adoção',
      veterinario: 'Veterinário',
      alimentacao: 'Alimentação',
      medicamentos: 'Medicamentos',
      infraestrutura: 'Infraestrutura',
      outros: 'Outros'
    };
    return labels[categoria] || categoria;
  };

  // Preparar dados para gráficos
  const expensesPieData = stats ? Object.entries(stats.por_categoria.saidas).map(([categoria, data]) => ({
    name: getCategoryLabel(categoria),
    value: data.valor,
    formatted: formatCurrency(data.valor),
    count: data.count
  })) : [];

  const incomePieData = stats ? Object.entries(stats.por_categoria.entradas).map(([categoria, data]) => ({
    name: getCategoryLabel(categoria),
    value: data.valor,
    formatted: formatCurrency(data.valor),
    count: data.count
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
              <AccountBalanceIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
              Relatórios Financeiros
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Análise completa da movimentação financeira - Ano {selectedYear}
            </Typography>
          </Box>
          <Box display="flex" gap={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Ano</InputLabel>
              <Select
                value={selectedYear}
                label="Ano"
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <MenuItem value="2024">2024</MenuItem>
                <MenuItem value="2023">2023</MenuItem>
                <MenuItem value="2022">2022</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => toast.info('Funcionalidade de exportação em desenvolvimento')}
            >
              Exportar
            </Button>
          </Box>
        </Box>

        {/* Cards de Resumo */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      Total de Entradas
                    </Typography>
                    <Typography variant="h4" component="div" color="success.main">
                      {formatCurrency(stats?.resumo_anual.total_entradas || 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {Object.values(stats?.por_categoria.entradas || {}).reduce((sum, cat) => sum + cat.count, 0)} transações
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />
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
                      Total de Saídas
                    </Typography>
                    <Typography variant="h4" component="div" color="error.main">
                      {formatCurrency(stats?.resumo_anual.total_saidas || 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {Object.values(stats?.por_categoria.saidas || {}).reduce((sum, cat) => sum + cat.count, 0)} transações
                    </Typography>
                  </Box>
                  <TrendingDownIcon sx={{ fontSize: 40, color: 'error.main' }} />
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
                      Saldo Final
                    </Typography>
                    <Typography 
                      variant="h4" 
                      component="div" 
                      color={stats?.resumo_anual.saldo && stats.resumo_anual.saldo >= 0 ? 'success.main' : 'error.main'}
                    >
                      {formatCurrency(stats?.resumo_anual.saldo || 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Receita - Despesa
                    </Typography>
                  </Box>
                  <AccountBalanceIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                      Total de Transações
                    </Typography>
                    <Typography variant="h4" component="div" color="primary.main">
                      {stats?.resumo_anual.numero_transacoes || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      No ano de {selectedYear}
                    </Typography>
                  </Box>
                  <DateRangeIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Gráfico de Linha - Movimentação Mensal */}
        <Card sx={{ mb: 4 }}>
          <CardHeader 
            title="Movimentação Financeira Mensal" 
            subheader={`Entradas vs Saídas - ${selectedYear}`}
          />
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={stats?.por_mes || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome_mes" />
                <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value, name) => [
                    formatCurrency(Number(value)), 
                    name === 'entradas' ? 'Entradas' : name === 'saidas' ? 'Saídas' : 'Saldo'
                  ]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="entradas" 
                  stroke="#2E7D32" 
                  strokeWidth={3}
                  name="Entradas"
                />
                <Line 
                  type="monotone" 
                  dataKey="saidas" 
                  stroke="#D32F2F" 
                  strokeWidth={3}
                  name="Saídas"
                />
                <Line 
                  type="monotone" 
                  dataKey="saldo" 
                  stroke="#1976D2" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Saldo"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráficos de Pizza */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Distribuição de Entradas" 
                subheader="Por categoria"
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

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Distribuição de Saídas" 
                subheader="Por categoria"
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

        {/* Tabela de Transações Recentes */}
        <Card>
          <CardHeader 
            title="Transações Recentes" 
            subheader="Últimas movimentações financeiras"
            action={
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => toast.info('Filtros avançados em desenvolvimento')}
              >
                Filtrar
              </Button>
            }
          />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Categoria</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell align="right">Valor</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.slice(0, 10).map((transaction) => (
                    <TableRow key={transaction.id} hover>
                      <TableCell>
                        {formatDate(transaction.data_transacao)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                          color={getCategoryColor(transaction.tipo)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {getCategoryLabel(transaction.categoria)}
                      </TableCell>
                      <TableCell>
                        {transaction.descricao || 'Sem descrição'}
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          color={transaction.tipo === 'entrada' ? 'success.main' : 'error.main'}
                          fontWeight="bold"
                        >
                          {transaction.tipo === 'entrada' ? '+' : '-'} {formatCurrency(transaction.valor)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          size="small"
                          onClick={() => toast.info('Edição em desenvolvimento')}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => toast.info('Exclusão em desenvolvimento')}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {transactions.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Nenhuma transação encontrada para o período selecionado.
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Botão Adicionar Transação */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setAddTransactionOpen(true)}
        >
          <AddIcon />
        </Fab>

        {/* Dialog Adicionar Transação (Placeholder) */}
        <Dialog 
          open={addTransactionOpen} 
          onClose={() => setAddTransactionOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Nova Transação</DialogTitle>
          <DialogContent>
            <Alert severity="info">
              Funcionalidade de adicionar transação será implementada em breve.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddTransactionOpen(false)}>
              Fechar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default FinancialReports;
