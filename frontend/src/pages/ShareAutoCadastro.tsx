import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
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
import {
  ContentCopy,
  Share as ShareIcon,
  CheckCircle,
  Link as LinkIcon,
  Info,
} from '@mui/icons-material';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';

export const ShareAutoCadastro = () => {
  const { selectedProject } = useProject();
  const { hasRole } = useAuth();
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState('');

  const isAdmin = hasRole('ADMINISTRADOR') || hasRole('SUPERADMIN');
  const isEmployee = hasRole('FUNCIONARIO');

  useEffect(() => {
    if (selectedProject) {
      // Gerar link único com ID do projeto
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/adopter/register?project=${selectedProject.id}`;
      setShareLink(link);
    }
  }, [selectedProject]);

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
          title: `Cadastro de Adotante - ${selectedProject?.nome}`,
          text: 'Cadastre-se como adotante através deste link:',
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

  if (!selectedProject) {
    return (
      <Box>
        <Alert severity="warning">
          Nenhum projeto selecionado. Por favor, selecione um projeto primeiro.
        </Alert>
      </Box>
    );
  }

  if (!isAdmin && !isEmployee) {
    return (
      <Box>
        <Alert severity="error">
          Você não tem permissão para acessar esta página.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Compartilhar AutoCadastro de Adotantes
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Gere um link único para compartilhar a página de autocadastro de
        adotantes do projeto {selectedProject.nome}
      </Typography>

      <Grid container spacing={3}>
        {/* Card com Link */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LinkIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Link de Cadastro</Typography>
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
                  startIcon={copied ? <CheckCircle /> : <ContentCopy />}
                  onClick={handleCopyLink}
                  color={copied ? 'success' : 'primary'}
                >
                  {copied ? 'Copiado!' : 'Copiar Link'}
                </Button>
                {navigator.share && (
                  <Button
                    variant="outlined"
                    startIcon={<ShareIcon />}
                    onClick={handleShare}
                  >
                    Compartilhar
                  </Button>
                )}
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
                <Typography variant="h6">Como Usar</Typography>
              </Box>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      1.
                    </Typography>
                  </ListItemIcon>
                  <ListItemText
                    primary="Copie o link acima"
                    secondary="Clique no botão 'Copiar Link' ou no ícone de copiar"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      2.
                    </Typography>
                  </ListItemIcon>
                  <ListItemText
                    primary="Compartilhe o link"
                    secondary="Envie por WhatsApp, email, redes sociais, etc."
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      3.
                    </Typography>
                  </ListItemIcon>
                  <ListItemText
                    primary="Cadastro automático"
                    secondary="Quem acessar o link poderá se cadastrar como adotante"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Informações Adicionais */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
            <Typography variant="h6" gutterBottom>
              Informações Importantes
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              <ListItem>
                <ListItemText
                  primary="Link Público"
                  secondary="Este link pode ser compartilhado publicamente. Não requer autenticação para acessar."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Cadastro Automático"
                  secondary="Ao preencher o formulário através deste link, o usuário será automaticamente cadastrado como adotante no projeto."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Validade"
                  secondary="O link é permanente e não expira. Você pode compartilhar quantas vezes quiser."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Dados Coletados"
                  secondary="O formulário coleta apenas dados básicos do usuário (nome, email, CPF, telefone e endereço)."
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Preview do Link */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Preview do Link
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Quando alguém acessar este link, verá a página de cadastro:
              </Typography>
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {shareLink}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

