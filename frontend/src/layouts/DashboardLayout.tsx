import { Box } from '@mui/material';
import { Header } from '../components/Header/Header';
import { Sidebar } from '../components/Sidebar/Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Header />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: '64px', // Altura do AppBar
          width: { sm: `calc(100% - 280px)` },
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: '#f5f5f5',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

