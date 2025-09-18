import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Layout } from '../components/layout/Layout';
import { animalService } from '../services/animalService';
import { Animal, AnimalForm as AnimalFormType } from '../types';
import toast from 'react-hot-toast';

const schema = yup.object({
  nome: yup.string().required('Nome é obrigatório').min(2, 'Nome deve ter pelo menos 2 caracteres'),
  especie: yup.string().required('Espécie é obrigatória'),
  raca: yup.string().optional(),
  idade: yup.number().optional().min(0, 'Idade deve ser positiva').max(30, 'Idade máxima é 30 anos'),
  condicao_saude: yup.string().optional(),
  cirurgia: yup.string().optional(),
  historico: yup.string().optional(),
});

const AnimalForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileList | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  // TODO: Pegar project_id do contexto de autenticação ou organização selecionada
  const PROJECT_ID = 'temp-project-id'; // Temporário para desenvolvimento

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<AnimalFormType>({
    resolver: yupResolver(schema),
    defaultValues: {
      nome: '',
      especie: '',
      raca: '',
      idade: undefined,
      condicao_saude: '',
      cirurgia: '',
      historico: '',
      project_id: PROJECT_ID,
    },
  });

  // Carregar dados do animal se estiver editando
  useEffect(() => {
    if (isEditing && id) {
      loadAnimal(id);
    }
  }, [isEditing, id]);

  const loadAnimal = async (animalId: string) => {
    try {
      setLoading(true);
      const response = await animalService.getById(animalId);
      
      if (response.success && response.data) {
        const animalData = response.data;
        setAnimal(animalData);
        
        // Preencher formulário
        reset({
          nome: animalData.nome,
          especie: animalData.especie,
          raca: animalData.raca || '',
          idade: animalData.idade,
          condicao_saude: animalData.condicao_saude || '',
          cirurgia: animalData.cirurgia || '',
          historico: animalData.historico || '',
          project_id: animalData.project_id,
        });
      } else {
        toast.error('Animal não encontrado');
        navigate('/animals');
      }
    } catch (error) {
      console.error('Erro ao carregar animal:', error);
      toast.error('Erro ao carregar dados do animal');
      navigate('/animals');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: AnimalFormType) => {
    try {
      setSubmitting(true);
      
      let response;
      if (isEditing && id) {
        response = await animalService.update(id, data);
      } else {
        response = await animalService.create(data);
      }

      if (response.success) {
        toast.success(isEditing ? 'Animal atualizado com sucesso!' : 'Animal cadastrado com sucesso!');
        
        // Se há fotos para upload e temos o ID do animal
        const animalId = isEditing ? id : response.data?.id;
        if (uploadedFiles && uploadedFiles.length > 0 && animalId) {
          try {
            await animalService.uploadPhotos(animalId, uploadedFiles);
            toast.success('Fotos enviadas com sucesso!');
          } catch (uploadError) {
            console.error('Erro no upload:', uploadError);
            toast.error('Animal salvo, mas houve erro no upload das fotos');
          }
        }
        
        navigate('/animals');
      } else {
        toast.error(response.error || 'Erro ao salvar animal');
      }
    } catch (error) {
      console.error('Erro ao salvar animal:', error);
      toast.error('Erro ao salvar animal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setUploadedFiles(files);
      
      // Criar previews das imagens
      const previews: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            previews.push(e.target.result as string);
            if (previews.length === files.length) {
              setPreviewImages(previews);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleCancel = () => {
    navigate('/animals');
  };

  if (loading) {
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
      <Container maxWidth="md">
        {/* Header */}
        <Box mb={3}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/animals')}
            sx={{ mb: 2 }}
          >
            Voltar para Animais
          </Button>
          <Typography variant="h4" component="h1" gutterBottom>
            {isEditing ? 'Editar Animal' : 'Cadastrar Animal'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isEditing 
              ? `Editando dados de ${animal?.nome}` 
              : 'Preencha os dados do animal para cadastrá-lo no sistema'
            }
          </Typography>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Informações Básicas */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Informações Básicas
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="nome"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Nome *"
                            fullWidth
                            error={!!errors.nome}
                            helperText={errors.nome?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="especie"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth error={!!errors.especie}>
                            <InputLabel>Espécie *</InputLabel>
                            <Select {...field} label="Espécie *">
                              <MenuItem value="Cão">Cão</MenuItem>
                              <MenuItem value="Gato">Gato</MenuItem>
                              <MenuItem value="Pássaro">Pássaro</MenuItem>
                              <MenuItem value="Coelho">Coelho</MenuItem>
                              <MenuItem value="Hamster">Hamster</MenuItem>
                              <MenuItem value="Outros">Outros</MenuItem>
                            </Select>
                            {errors.especie && (
                              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                {errors.especie.message}
                              </Typography>
                            )}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="raca"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Raça"
                            fullWidth
                            error={!!errors.raca}
                            helperText={errors.raca?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="idade"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Idade (anos)"
                            type="number"
                            fullWidth
                            error={!!errors.idade}
                            helperText={errors.idade?.message}
                            inputProps={{ min: 0, max: 30 }}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Informações de Saúde */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Informações de Saúde
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Controller
                        name="condicao_saude"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Condição de Saúde"
                            fullWidth
                            multiline
                            rows={3}
                            error={!!errors.condicao_saude}
                            helperText={errors.condicao_saude?.message}
                            placeholder="Descreva o estado geral de saúde do animal..."
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Controller
                        name="cirurgia"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Histórico de Cirurgias"
                            fullWidth
                            multiline
                            rows={3}
                            error={!!errors.cirurgia}
                            helperText={errors.cirurgia?.message}
                            placeholder="Descreva cirurgias realizadas, se houver..."
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Histórico */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Histórico
                  </Typography>
                  <Controller
                    name="historico"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Histórico do Animal"
                        fullWidth
                        multiline
                        rows={4}
                        error={!!errors.historico}
                        helperText={errors.historico?.message}
                        placeholder="Conte a história do animal: como chegou à ONG, comportamento, etc..."
                      />
                    )}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Upload de Fotos */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Fotos do Animal
                  </Typography>
                  
                  {/* Fotos Existentes (se editando) */}
                  {isEditing && animal?.fotos && animal.fotos.length > 0 && (
                    <Box mb={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        Fotos Atuais:
                      </Typography>
                      <ImageList cols={3} rowHeight={164}>
                        {animal.fotos.map((foto, index) => (
                          <ImageListItem key={index}>
                            <img
                              src={foto}
                              alt={`${animal.nome} - foto ${index + 1}`}
                              loading="lazy"
                              style={{ height: '164px', objectFit: 'cover' }}
                            />
                          </ImageListItem>
                        ))}
                      </ImageList>
                    </Box>
                  )}

                  {/* Upload de Novas Fotos */}
                  <Box>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="photo-upload"
                      multiple
                      type="file"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="photo-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<UploadIcon />}
                      >
                        {isEditing ? 'Adicionar Novas Fotos' : 'Selecionar Fotos'}
                      </Button>
                    </label>
                  </Box>

                  {/* Preview das Novas Fotos */}
                  {previewImages.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        Novas fotos a serem enviadas:
                      </Typography>
                      <ImageList cols={3} rowHeight={164}>
                        {previewImages.map((preview, index) => (
                          <ImageListItem key={index}>
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              loading="lazy"
                              style={{ height: '164px', objectFit: 'cover' }}
                            />
                          </ImageListItem>
                        ))}
                      </ImageList>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Botões */}
            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={submitting}
                >
                  {submitting ? (
                    <CircularProgress size={20} />
                  ) : (
                    isEditing ? 'Atualizar' : 'Cadastrar'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Container>
    </Layout>
  );
};

export default AnimalForm;
