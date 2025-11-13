import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add,
  Search,
  MoreVert,
  Edit,
  Delete,
  Visibility,
} from '@mui/icons-material';
import { employeeService } from '../services/employee.service';
import { volunteerService } from '../services/volunteer.service';
import { userService } from '../services/user.service';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { Employee, Volunteer } from '../types';
import { User } from '../types';

interface EmployeeWithUser extends Employee {
  usuario?: User;
}

interface VolunteerWithUser extends Volunteer {
  usuario?: User;
}

export const EmployeesVolunteersList = () => {
  const navigate = useNavigate();
  const { selectedProject } = useProject();
  const { hasRole } = useAuth();
  const [employees, setEmployees] = useState<EmployeeWithUser[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'employee' | 'volunteer'>('all');
  const [anchorEl, setAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});

  const isAdmin = hasRole('ADMINISTRADOR') || hasRole('SUPERADMIN');

  useEffect(() => {
    if (selectedProject) {
      loadData();
    }
  }, [selectedProject]);

  const loadData = async () => {
    if (!selectedProject) return;

    try {
      setLoading(true);
      setError(null);

      const [employeesRes, volunteersRes] = await Promise.all([
        employeeService.getByProject(selectedProject.id),
        volunteerService.getByProject(selectedProject.id),
      ]);

      const employeesData = employeesRes.data || [];
      const volunteersData = volunteersRes.data || [];

      // Buscar dados dos usuários
      const userIds = [
        ...new Set([
          ...employeesData.map((e) => e.id_usuario),
          ...volunteersData.map((v) => v.id_usuario),
        ]),
      ];

      const usersMap = new Map<string, User>();
      for (const userId of userIds) {
        try {
          const userRes = await userService.getById(userId);
          if (userRes.data) {
            usersMap.set(userId, userRes.data);
          }
        } catch (err) {
          console.error(`Erro ao buscar usuário ${userId}:`, err);
        }
      }

      setEmployees(
        employeesData.map((emp) => ({
          ...emp,
          usuario: usersMap.get(emp.id_usuario),
        }))
      );

      setVolunteers(
        volunteersData.map((vol) => ({
          ...vol,
          usuario: usersMap.get(vol.id_usuario),
        }))
      );
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (key: string, event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl({ ...anchorEl, [key]: event.currentTarget });
  };

  const handleMenuClose = (key: string) => {
    setAnchorEl({ ...anchorEl, [key]: null });
  };

  const handleView = (id: string) => {
    navigate(`/users/${id}`);
    handleMenuClose(id);
  };

  const handleEdit = (id: string, type: 'employee' | 'volunteer') => {
    navigate(`/users/${id}`);
    handleMenuClose(id);
  };

  const handleDelete = async (id: string, type: 'employee' | 'volunteer') => {
    if (!selectedProject || !window.confirm('Tem certeza que deseja remover?')) {
      handleMenuClose(id);
      return;
    }

    try {
      if (type === 'employee') {
        await employeeService.delete(id, selectedProject.id);
      } else {
        await volunteerService.delete(id, selectedProject.id);
      }
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao remover');
    }
    handleMenuClose(id);
  };

  type CombinedItem = (EmployeeWithUser & { type: 'employee' }) | (VolunteerWithUser & { type: 'volunteer' });

  const filteredData = (): CombinedItem[] => {
    let data: CombinedItem[] = [];

    if (filterType === 'all') {
      data = [
        ...employees.map((e) => ({ ...e, type: 'employee' as const })),
        ...volunteers.map((v) => ({ ...v, type: 'volunteer' as const })),
      ];
    } else if (filterType === 'employee') {
      data = employees.map((e) => ({ ...e, type: 'employee' as const }));
    } else {
      data = volunteers.map((v) => ({ ...v, type: 'volunteer' as const }));
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter((item) => {
        const user = item.usuario;
        return (
          user?.nome?.toLowerCase().includes(term) ||
          user?.email?.toLowerCase().includes(term) ||
          (item.type === 'employee' && item.funcao?.toLowerCase().includes(term)) ||
          (item.type === 'volunteer' && item.servico?.toLowerCase().includes(term))
        );
      });
    }

    return data;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Funcionários e Voluntários
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/employees-volunteers/new')}
          >
            Novo Cadastro
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Buscar por nome, email, função ou serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant={filterType === 'all' ? 'contained' : 'outlined'}
            onClick={() => setFilterType('all')}
          >
            Todos
          </Button>
          <Button
            variant={filterType === 'employee' ? 'contained' : 'outlined'}
            onClick={() => setFilterType('employee')}
          >
            Funcionários
          </Button>
          <Button
            variant={filterType === 'volunteer' ? 'contained' : 'outlined'}
            onClick={() => setFilterType('volunteer')}
          >
            Voluntários
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Função/Serviço</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Nenhum registro encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData().map((item) => {
                  const user = item.usuario;
                  const key = `${item.type}-${item.id_usuario}-${item.id_projeto}`;
                  const menuOpen = Boolean(anchorEl[key]);

                  return (
                    <TableRow key={key} hover>
                      <TableCell>{user?.nome || 'N/A'}</TableCell>
                      <TableCell>{user?.email || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.type === 'employee' ? 'Funcionário' : 'Voluntário'}
                          color={item.type === 'employee' ? 'primary' : 'secondary'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {item.type === 'employee' ? item.funcao || '-' : item.servico || '-'}
                      </TableCell>
                      <TableCell>
                        {item.type === 'employee' && (
                          <Chip
                            label={item.privilegios ? 'Com Privilégios' : 'Sem Privilégios'}
                            color={item.privilegios ? 'success' : 'default'}
                            size="small"
                          />
                        )}
                        {item.type === 'volunteer' && item.frequencia && (
                          <Chip label={item.frequencia} size="small" />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(key, e)}
                        >
                          <MoreVert />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl[key]}
                          open={menuOpen}
                          onClose={() => handleMenuClose(key)}
                        >
                          <MenuItem onClick={() => handleView(item.id_usuario)}>
                            <Visibility sx={{ mr: 1 }} fontSize="small" />
                            Ver Detalhes
                          </MenuItem>
                          {isAdmin && (
                            <>
                              <MenuItem onClick={() => handleEdit(item.id_usuario, item.type)}>
                                <Edit sx={{ mr: 1 }} fontSize="small" />
                                Editar
                              </MenuItem>
                              <MenuItem
                                onClick={() => handleDelete(item.id_usuario, item.type)}
                                sx={{ color: 'error.main' }}
                              >
                                <Delete sx={{ mr: 1 }} fontSize="small" />
                                Remover
                              </MenuItem>
                            </>
                          )}
                        </Menu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

