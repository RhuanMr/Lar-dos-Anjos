import { Box, Container, Paper, Typography, Button } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const AdopterThankYou = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Obrigado pelo seu cadastro!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Seu cadastro como adotante foi realizado com sucesso. Nossa equipe entrará em contato em breve para dar continuidade ao processo de adoção.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
            size="large"
          >
            Ir para Login
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

