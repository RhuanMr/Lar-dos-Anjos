import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
} from '@mui/material';
import {
  Pets,
  People,
  Business,
  Favorite,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Gestão de Animais',
      description: 'Cadastre e gerencie informações dos animais sob cuidado da ONG.',
      icon: <Pets sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/animals',
    },
    {
      title: 'Gestão de Usuários',
      description: 'Administre voluntários, membros e parceiros da organização.',
      icon: <People sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/users',
    },
    {
      title: 'Organizações',
      description: 'Gerencie informações das organizações parceiras.',
      icon: <Business sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/organizations',
    },
    {
      title: 'Adoções',
      description: 'Facilite o processo de adoção de animais.',
      icon: <Favorite sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/adoptions',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Lar dos Anjos
          </Typography>
          <Typography variant="h5" component="p" sx={{ mb: 4, opacity: 0.9 }}>
            Plataforma de gerenciamento para ONG de proteção animal
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'grey.100',
              },
            }}
            onClick={() => navigate('/login')}
          >
            Acessar Plataforma
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Funcionalidades
        </Typography>
        <Typography
          variant="body1"
          textAlign="center"
          sx={{ mb: 6, color: 'text.secondary' }}
        >
          Uma plataforma completa para gerenciar todos os aspectos da sua ONG
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'center',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(feature.path)}
                  >
                    Saiba Mais
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: 'grey.100',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom>
            Pronto para começar?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
            Junte-se à nossa plataforma e faça a diferença na vida dos animais
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
          >
            Criar Conta
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
