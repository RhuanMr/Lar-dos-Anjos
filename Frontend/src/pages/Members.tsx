import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  CircularProgress,
  Alert,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  FilterList as FilterIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { User } from '../types';
import toast from 'react-hot-toast';

// Interface temporária para membros (baseada no backend)
interface OrganizationMember {
  id: string;
  user_id: string;
  project_id: string;
  role: 'admin' | 'membro' | 'voluntario';
  status: 'active' | 'inactive' | 'pending';
  joined_at: string;
  user: {
    id: string;
    nome: string;
    email: string;
    telefone?: string;
    cpf: string;
    foto_url?: string;
  };
}

const Members: React.FC = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    search: '',
  });
  const [selectedMember, setSelectedMember] = useState<OrganizationMember | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // TODO: Pegar project_id do contexto de autenticação ou organização selecionada
  const PROJECT_ID = 'temp-project-id'; // Temporário para desenvolvimento

  const roleColors = {
    admin: 'error',
    membro: 'primary',
    voluntario: 'success',
  } as const;

  const roleLabels = {
    admin: 'Administrador',
    membro: 'Membro',
    voluntario: 'Voluntário',
  };

  const statusColors = {
    active: 'success',
    inactive: 'default',
    pending: 'warning',
  } as const;

  const statusLabels = {
    active: 'Ativo',
    inactive: 'Inativo',
    pending: 'Pendente',
  };

  // Dados mockados para desenvolvimento (remover quando integrar com API)
  const mockMembers: OrganizationMember[] = [
    {
      id: '1',
      user_id: 'user1',
      project_id: PROJECT_ID,
      role: 'admin',
      status: 'active',
      joined_at: '2024-01-15',
      user: {
        id: 'user1',
        nome: 'Maria Silva',
        email: 'maria@example.com',
        telefone: '(11) 99999-9999',
        cpf: '123.456.789-00',
        foto_url: undefined,
      },
    },
    {
      id: '2',
      user_id: 'user2',
      project_id: PROJECT_ID,
      role: 'membro',
      status: 'active',
      joined_at: '2024-02-10',
      user: {
        id: 'user2',
        nome: 'João Santos',
        email: 'joao@example.com',
        telefone: '(11) 88888-8888',
        cpf: '987.654.321-00',
        foto_url: undefined,
      },
    },
    {
      id: '3',
      user_id: 'user3',
      project_id: PROJECT_ID,
      role: 'voluntario',
      status: 'active',
      joined_at: '2024-03-05',
      user: {
        id: 'user3',
        nome: 'Ana Costa',
        email: 'ana@example.com',
        telefone: '(11) 77777-7777',
        cpf: '456.789.123-00',
        foto_url: undefined,
      },
    },
  ];

  const loadMembers = async () => {
    try {
      setLoading(true);
      // TODO: Implementar chamada para API real
      // const response = await membersService.list({...});
      
      // Simulação de carregamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filtrar dados mockados
      let filteredMembers = mockMembers;
      
      if (filters.role !== 'all') {
        filteredMembers = filteredMembers.filter(member => member.role === filters.role);
      }
      
      if (filters.status !== 'all') {
        filteredMembers = filteredMembers.filter(member => member.status === filters.status);
      }
      
      if (filters.search) {
        filteredMembers = filteredMembers.filter(member => 
          member.user.nome.toLowerCase().includes(filters.search.toLowerCase()) ||
          member.user.email.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      setMembers(filteredMembers);
      setTotalPages(1); // Mock: apenas 1 página
      
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
      toast.error('Erro ao carregar membros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [page, filters]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const handleViewMember = (member: OrganizationMember) => {
    setSelectedMember(member);
    setViewDialogOpen(true);
  };

  const handleEditMember = (member: OrganizationMember) => {
    // TODO: Implementar edição de membro
    toast.info('Funcionalidade de edição em desenvolvimento');
  };

  const handleDeleteMember = (member: OrganizationMember) => {
    setSelectedMember(member);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedMember) return;
    
    try {
      // TODO: Implementar remoção via API
      toast.success('Membro removido com sucesso!');
      setDeleteDialogOpen(false);
      setSelectedMember(null);
      loadMembers();
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      toast.error('Erro ao remover membro');
    }
  };

  const handleAddMember = () => {
    // TODO: Implementar adição de membro
    toast.info('Funcionalidade de adicionar membro em desenvolvimento');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading && members.length === 0) {
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
        <Box mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            <PeopleIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
            Gestão de Membros e Voluntários
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie os membros e voluntários da organização
          </Typography>
        </Box>

        {/* Filtros */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Filtros
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Função</InputLabel>
                  <Select
                    value={filters.role}
                    label="Função"
                    onChange={(e) => handleFilterChange('role', e.target.value)}
                  >
                    <MenuItem value="all">Todas</MenuItem>
                    <MenuItem value="admin">Administrador</MenuItem>
                    <MenuItem value="membro">Membro</MenuItem>
                    <MenuItem value="voluntario">Voluntário</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    label="Status"
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="active">Ativo</MenuItem>
                    <MenuItem value="inactive">Inativo</MenuItem>
                    <MenuItem value="pending">Pendente</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Buscar por nome ou email"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Lista de Membros */}
        {members.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            Nenhum membro encontrado com os filtros aplicados.
          </Alert>
        ) : (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Membros ({members.length})
              </Typography>
              <List>
                {members.map((member, index) => (
                  <React.Fragment key={member.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar src={member.user.foto_url}>
                          {getInitials(member.user.nome)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1">
                              {member.user.nome}
                            </Typography>
                            <Chip
                              label={roleLabels[member.role]}
                              color={roleColors[member.role]}
                              size="small"
                            />
                            <Chip
                              label={statusLabels[member.status]}
                              color={statusColors[member.status]}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              <EmailIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                              {member.user.email}
                            </Typography>
                            {member.user.telefone && (
                              <Typography variant="body2" color="text.secondary">
                                <PhoneIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                                {member.user.telefone}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary">
                              Membro desde: {new Date(member.joined_at).toLocaleDateString('pt-BR')}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="view"
                          onClick={() => handleViewMember(member)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteMember(member)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < members.length - 1 && <Box sx={{ borderBottom: 1, borderColor: 'divider', mx: 2 }} />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
            />
          </Box>
        )}

        {/* Botão Adicionar */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleAddMember}
        >
          <AddIcon />
        </Fab>

        {/* Dialog de Confirmação de Exclusão */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Remover Membro</DialogTitle>
          <DialogContent>
            <Typography>
              Tem certeza de que deseja remover {selectedMember?.user.nome} da organização?
              Esta ação não pode ser desfeita.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmDelete} color="error" variant="contained">
              Remover
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default Members;
