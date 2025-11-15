import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { EmployeesVolunteersList } from '../pages/EmployeesVolunteersList';
import { EmployeeVolunteerNew } from '../pages/EmployeeVolunteerNew';
import { ProjectNew } from '../pages/ProjectNew';
import { ProjectsList } from '../pages/ProjectsList';
import { AdminNew } from '../pages/AdminNew';
import { AnimalsList } from '../pages/AnimalsList';
import { AnimalNew } from '../pages/AnimalNew';
import { AnimalDetails } from '../pages/AnimalDetails';
import { SetPassword } from '../pages/SetPassword';
import { ProjectDetails } from '../pages/ProjectDetails';
import { UserDetails } from '../pages/UserDetails';
import { AdopterAutoRegister } from '../pages/AdopterAutoRegister';
import { AdopterThankYou } from '../pages/AdopterThankYou';
import { AdopterNew } from '../pages/AdopterNew';
import { AdoptersList } from '../pages/AdoptersList';
import { AdopterDetails } from '../pages/AdopterDetails';
import { AdoptionNew } from '../pages/AdoptionNew';
import { AdoptionsList } from '../pages/AdoptionsList';
import { AdoptionDetails } from '../pages/AdoptionDetails';
import { DonationsList } from '../pages/DonationsList';
import { DonationNew } from '../pages/DonationNew';
import { DonationDetails } from '../pages/DonationDetails';
import { DonorsList } from '../pages/DonorsList';
import { DonorDetails } from '../pages/DonorDetails';
import { UsersList } from '../pages/UsersList';
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
        <Route path="/adopter/register" element={<AdopterAutoRegister />} />
        <Route path="/adopter/thank-you" element={<AdopterThankYou />} />
        
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

        <Route
          path="/projects/:id"
          element={
            <RequireAuth>
              <ProjectDetails />
            </RequireAuth>
          }
        />

        <Route
          path="/projects/:id/edit"
          element={
            <RequireAuth>
              <ProjectDetails />
            </RequireAuth>
          }
        />

        <Route
          path="/project/edit"
          element={
            <RequireAuth>
              <ProjectDetails />
            </RequireAuth>
          }
        />

        <Route
          path="/animals"
          element={
            <RequireAuth>
              <AnimalsList />
            </RequireAuth>
          }
        />

        <Route
          path="/animals/new"
          element={
            <RequireAuth>
              <AnimalNew />
            </RequireAuth>
          }
        />

        <Route
          path="/animals/:id"
          element={
            <RequireAuth>
              <AnimalDetails />
            </RequireAuth>
          }
        />

        <Route
          path="/users/:id/password"
          element={
            <RequireAuth>
              <SetPassword />
            </RequireAuth>
          }
        />

        <Route
          path="/users/:id"
          element={
            <RequireAuth>
              <UserDetails />
            </RequireAuth>
          }
        />

        <Route
          path="/adopters"
          element={
            <RequireAuth>
              <AdoptersList />
            </RequireAuth>
          }
        />

        <Route
          path="/adopters/new"
          element={
            <RequireAuth>
              <AdopterNew />
            </RequireAuth>
          }
        />

        <Route
          path="/adopters/:id"
          element={
            <RequireAuth>
              <AdopterDetails />
            </RequireAuth>
          }
        />

        <Route
          path="/adoptions"
          element={
            <RequireAuth>
              <AdoptionsList />
            </RequireAuth>
          }
        />

        <Route
          path="/adoptions/new"
          element={
            <RequireAuth>
              <AdoptionNew />
            </RequireAuth>
          }
        />

        <Route
          path="/adoptions/:id"
          element={
            <RequireAuth>
              <AdoptionDetails />
            </RequireAuth>
          }
        />

        <Route
          path="/adoptions/:id/edit"
          element={
            <RequireAuth>
              <AdoptionDetails />
            </RequireAuth>
          }
        />

        <Route
          path="/donations"
          element={
            <RequireAuth>
              <DonationsList />
            </RequireAuth>
          }
        />

        <Route
          path="/donations/new"
          element={
            <RequireAuth>
              <DonationNew />
            </RequireAuth>
          }
        />

        <Route
          path="/donations/:id"
          element={
            <RequireAuth>
              <DonationDetails />
            </RequireAuth>
          }
        />

        <Route
          path="/donations/:id/edit"
          element={
            <RequireAuth>
              <DonationDetails />
            </RequireAuth>
          }
        />

        <Route
          path="/donors"
          element={
            <RequireAuth>
              <DonorsList />
            </RequireAuth>
          }
        />

        <Route
          path="/donors/:usuarioId/:projetoId"
          element={
            <RequireAuth>
              <DonorDetails />
            </RequireAuth>
          }
        />

        <Route
          path="/donors/:usuarioId/:projetoId/edit"
          element={
            <RequireAuth>
              <DonorDetails />
            </RequireAuth>
          }
        />

        <Route
          path="/users"
          element={
            <RequireAuth>
              <UsersList />
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

