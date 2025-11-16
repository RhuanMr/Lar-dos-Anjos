import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material';
import { CloudUpload, Delete } from '@mui/icons-material';
import { uploadService } from '../../services/upload.service';

interface PhotoUploadProps {
  entityId: string;
  entityType: 'animal' | 'usuario' | 'projeto';
  existingPhotos?: string[];
  onPhotosChange?: (photos: string[]) => void;
  maxPhotos?: number;
  disabled?: boolean;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  entityId,
  entityType,
  existingPhotos = [],
  onPhotosChange,
  maxPhotos = 10,
  disabled = false,
}) => {
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevExistingPhotosRef = useRef<string[]>(existingPhotos);
  const isProcessingRef = useRef(false);

  // Sincronizar fotos quando existingPhotos mudar (apenas se realmente mudou)
  useEffect(() => {
    // Comparar arrays para evitar atualizações desnecessárias
    const existingChanged = 
      existingPhotos.length !== prevExistingPhotosRef.current.length ||
      existingPhotos.some((photo, index) => photo !== prevExistingPhotosRef.current[index]);
    
    if (existingChanged && !isProcessingRef.current) {
      setPhotos(existingPhotos);
      prevExistingPhotosRef.current = existingPhotos;
    }
  }, [existingPhotos]);

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Prevenir múltiplas chamadas simultâneas
    if (isProcessingRef.current || uploading) {
      return;
    }

    const remainingSlots = maxPhotos - photos.length;
    if (files.length > remainingSlots) {
      setError(`Você pode adicionar no máximo ${remainingSlots} foto(s)`);
      return;
    }

    setError(null);
    setUploading(true);
    isProcessingRef.current = true;

    try {
      const fileArray = Array.from(files);
      
      if (entityType === 'animal') {
        // Upload múltiplo para animais
        const results = await uploadService.uploadAnimalPhotos(entityId, fileArray);
        const newPhotoUrls = results.map((r) => r.url);
        const updatedPhotos = [...photos, ...newPhotoUrls];
        setPhotos(updatedPhotos);
        // Chamar onPhotosChange apenas após sucesso
        if (onPhotosChange) {
          await onPhotosChange(updatedPhotos);
        }
      } else {
        // Upload único para usuário ou projeto (apenas primeira foto)
        const file = fileArray[0];
        let result;
        if (entityType === 'usuario') {
          result = await uploadService.uploadUserPhoto(entityId, file);
        } else {
          result = await uploadService.uploadProjectPhoto(entityId, file);
        }
        const updatedPhotos = result.url ? [result.url] : photos;
        setPhotos(updatedPhotos);
        // Chamar onPhotosChange apenas após sucesso
        if (onPhotosChange) {
          await onPhotosChange(updatedPhotos);
        }
      }
    } catch (err: any) {
      // Tratar erro 429 especificamente
      if (err.response?.status === 429) {
        setError('Muitas requisições. Aguarde alguns segundos e tente novamente.');
      } else {
        setError(err.message || 'Erro ao fazer upload das fotos');
      }
    } finally {
      setUploading(false);
      isProcessingRef.current = false;
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async (photoUrl: string) => {
    if (disabled) return;

    try {
      if (entityType === 'animal') {
        await uploadService.removeAnimalPhoto(entityId, photoUrl);
      }
      // Para usuário e projeto, a remoção pode ser feita atualizando a entidade
      const updatedPhotos = photos.filter((p) => p !== photoUrl);
      setPhotos(updatedPhotos);
      onPhotosChange?.(updatedPhotos);
    } catch (err: any) {
      setError(err.message || 'Erro ao remover foto');
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const canAddMore = photos.length < maxPhotos;

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {photos.length > 0 && (
        <ImageList 
          cols={3} 
          rowHeight={200} 
          gap={8}
          sx={{ mb: 2, overflow: 'hidden' }}
        >
          {photos.map((photo, index) => (
            <ImageListItem key={`photo-${index}-${photo}`}>
              <img
                src={photo}
                alt={`Foto ${index + 1}`}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '4px',
                }}
              />
              {!disabled && (
                <ImageListItemBar
                  title={`Foto ${index + 1}`}
                  actionIcon={
                    <IconButton
                      sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                      onClick={() => handleRemovePhoto(photo)}
                      aria-label={`Remover foto ${index + 1}`}
                    >
                      <Delete />
                    </IconButton>
                  }
                />
              )}
            </ImageListItem>
          ))}
        </ImageList>
      )}

      {canAddMore && !disabled && (
        <Box>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={entityType === 'animal'}
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <Button
            variant="outlined"
            startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
            onClick={handleButtonClick}
            disabled={uploading || disabled}
            fullWidth
          >
            {uploading
              ? 'Enviando...'
              : entityType === 'animal'
              ? `Adicionar Fotos (${photos.length}/${maxPhotos})`
              : 'Adicionar Foto'}
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Formatos aceitos: JPEG, PNG, GIF, WebP. Tamanho máximo: 5MB por foto.
          </Typography>
        </Box>
      )}

      {!canAddMore && (
        <Alert severity="info">
          Limite de {maxPhotos} foto(s) atingido. Remova uma foto para adicionar outra.
        </Alert>
      )}
    </Box>
  );
};
