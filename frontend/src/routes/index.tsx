import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { EmployeesVolunteersList } from '../pages/EmployeesVolunteersList';
import { EmployeeVolunteerNew } from '../pages/EmployeeVolunteerNew';
import { ProjectNew } from '../pages/ProjectNew';
import { ProjectsList } from '../pages/ProjectsList';
import { AdminNew } from '../pages/AdminNew';
import { useAuth } from '../contexts/AuthContext';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Componente para proteger rotas
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<Login />} />
        
        {/* Rotas protegidas */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        
        <Route
          path="/employees-volunteers"
          element={
            <RequireAuth>
              <EmployeesVolunteersList />
            </RequireAuth>
          }
        />
        
        <Route
          path="/employees-volunteers/new"
          element={
            <RequireAuth>
              <EmployeeVolunteerNew />
            </RequireAuth>
          }
        />

        <Route
          path="/projects/new"
          element={
            <RequireAuth>
              <ProjectNew />
            </RequireAuth>
          }
        />

        <Route
          path="/projects"
          element={
            <RequireAuth>
              <ProjectsList />
            </RequireAuth>
          }
        />

        <Route
          path="/projects/:projectId/admin/new"
          element={
            <RequireAuth>
              <AdminNew />
            </RequireAuth>
          }
        />

        <Route
          path="/projects/admin/new"
          element={
            <RequireAuth>
              <AdminNew />
            </RequireAuth>
          }
        />

        {/* Rota padrão - redireciona baseado na autenticação */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Rota catch-all - redireciona para login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

