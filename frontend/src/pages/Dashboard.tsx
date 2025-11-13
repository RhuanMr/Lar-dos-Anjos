import { Box, Typography, Paper } from '@mui/material';

export const Dashboard = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1">
          Bem-vindo ao Dashboard do PawHub!
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Esta é uma página temporária. O dashboard completo será implementado em breve.
        </Typography>
      </Paper>
    </Box>
  );
};

