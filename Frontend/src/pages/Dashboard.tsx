import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
} from '@mui/material';
import {
  Pets,
  People,
  Business,
  TrendingUp,
} from '@mui/icons-material';
import Layout from '../components/layout/Layout';

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Total de Animais',
      value: '24',
      icon: <Pets sx={{ fontSize: 40, color: 'primary.main' }} />,
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      title: 'Usuários Ativos',
      value: '156',
      icon: <People sx={{ fontSize: 40, color: 'primary.main' }} />,
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      title: 'Organizações',
      value: '8',
      icon: <Business sx={{ fontSize: 40, color: 'primary.main' }} />,
      change: '+2',
      changeType: 'positive' as const,
    },
    {
      title: 'Adoções Este Mês',
      value: '12',
      icon: <TrendingUp sx={{ fontSize: 40, color: 'primary.main' }} />,
      change: '+25%',
      changeType: 'positive' as const,
    },
  ];

  return (
    <Layout>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Visão geral da plataforma Lar dos Anjos
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="h6">
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" component="div">
                        {stat.value}
                      </Typography>
                      <Typography
                        variant="body2"
                        color={
                          stat.changeType === 'positive'
                            ? 'success.main'
                            : 'error.main'
                        }
                      >
                        {stat.change} vs mês anterior
                      </Typography>
                    </Box>
                    <Box>{stat.icon}</Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent Activity */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Atividade Recente
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nenhuma atividade recente para exibir.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Ações Rápidas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Funcionalidades em desenvolvimento...
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default Dashboard;
