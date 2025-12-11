import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Grid } from '../components/Grid';
import {
  ContentCopy,
  Share as ShareIcon,
  CheckCircle,
  Link as LinkIcon,
  Info,
  ArrowBack,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface LocationState {
  userId?: string;
  userName?: string;
  userEmail?: string;
}

export const SharePasswordLink = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasRole } = useAuth();
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');

  const isAdmin = hasRole('ADMINISTRADOR') || hasRole('SUPERADMIN');

  useEffect(() => {
    // Pegar dados do estado da navegação ou da URL
    const state = location.state as LocationState | null;
    const urlParams = new URLSearchParams(location.search);
    
    const id = state?.userId || urlParams.get('userId');
    const name = state?.userName || urlParams.get('userName') || '';
    const email = state?.userEmail || urlParams.get('userEmail') || '';

    if (id) {
      setUserId(id);
      setUserName(name);
      setUserEmail(email);
      
      // Gerar link único com ID do usuário
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/users/${id}/password`;
      setShareLink(link);
    }
  }, [location]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Erro ao copiar link:', err);
      // Fallback: selecionar texto manualmente
      const textField = document.createElement('textarea');
      textField.value = shareLink;
      document.body.appendChild(textField);
      textField.select();
      document.execCommand('copy');
      document.body.removeChild(textField);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Cadastro de Senha - ${userName}`,
          text: `${userName} precisa cadastrar uma senha para acessar o sistema. Use este link:`,
          url: shareLink,
        });
      } catch (err) {
        // Usuário cancelou ou erro
        console.log('Compartilhamento cancelado');
      }
    } else {
      // Fallback: copiar link
      handleCopyLink();
    }
  };

  if (!isAdmin) {
    return (
      <Box>
        <Alert severity="error">
          Você não tem permissão para acessar esta página.
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard')}
          sx={{ mt: 2 }}
        >
          Voltar ao Dashboard
        </Button>
      </Box>
    );
  }

  if (!userId) {
    return (
      <Box>
        <Alert severity="warning">
          ID do usuário não fornecido. Por favor, acesse esta página através do cadastro de funcionário.
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/employees-volunteers')}
          sx={{ mt: 2 }}
        >
          Voltar
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/employees-volunteers')}
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
        <Typography variant="h4" component="h1">
          Compartilhar Link de Cadastro de Senha
        </Typography>
      </Box>

      <Alert severity="success" sx={{ mb: 3 }}>
        Funcionário criado com sucesso! Compartilhe o link abaixo para que ele possa cadastrar sua senha e acessar o sistema.
      </Alert>

      {userName && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Usuário:</strong> {userName}
            {userEmail && (
              <>
                <br />
                <strong>Email:</strong> {userEmail}
              </>
            )}
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Card com Link */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LinkIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Link de Cadastro de Senha</Typography>
              </Box>
              <TextField
                fullWidth
                value={shareLink}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleCopyLink}
                        color={copied ? 'success' : 'default'}
                        edge="end"
                      >
                        {copied ? <CheckCircle /> : <ContentCopy />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<ShareIcon />}
                  onClick={handleShare}
                  disabled={!shareLink}
                >
                  Compartilhar
                </Button>
                <Button
                  variant="outlined"
                  startIcon={copied ? <CheckCircle /> : <ContentCopy />}
                  onClick={handleCopyLink}
                  disabled={!shareLink}
                >
                  {copied ? 'Copiado!' : 'Copiar Link'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Card com Instruções */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Info sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Instruções</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      1.
                    </Typography>
                  </ListItemIcon>
                  <ListItemText
                    primary="Copie o link acima"
                    secondary="Clique no botão copiar ou selecione e copie manualmente"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      2.
                    </Typography>
                  </ListItemIcon>
                  <ListItemText
                    primary="Compartilhe com o funcionário"
                    secondary="Envie por email, WhatsApp ou outra forma de comunicação"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      3.
                    </Typography>
                  </ListItemIcon>
                  <ListItemText
                    primary="Funcionário cadastra senha"
                    secondary="Ao acessar o link, ele poderá definir sua senha de acesso"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Informações Adicionais */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle2" gutterBottom>
              <strong>Importante:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • O link é único para este funcionário e permite que ele cadastre uma senha de acesso ao sistema.
              <br />
              • Após cadastrar a senha, o funcionário poderá fazer login usando seu email e a senha criada.
              <br />
              • Mantenha este link seguro e compartilhe apenas com o funcionário autorizado.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

