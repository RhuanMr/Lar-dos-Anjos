import { supabase } from '@/database/supabase';
import { AnimalRepository } from '@/repositories/AnimalRepository';
import { UsuarioRepository } from '@/repositories/UsuarioRepository';
import { ProjetoRepository } from '@/repositories/ProjetoRepository';

export type BucketType = 'animais' | 'usuarios' | 'projetos';

export interface UploadResult {
  url: string;
  path: string;
}

export class UploadService {
  private animalRepository = new AnimalRepository();
  private usuarioRepository = new UsuarioRepository();
  private projetoRepository = new ProjetoRepository();

  /**
   * Faz upload de uma imagem para o Supabase Storage
   */
  async uploadImagem(
    bucket: BucketType,
    file: Express.Multer.File,
    entityId: string,
    fileName?: string
  ): Promise<UploadResult> {
    // Validar tipo de arquivo
    if (!this.isValidImageType(file.mimetype)) {
      throw new Error(
        'Tipo de arquivo não permitido. Apenas imagens (JPEG, PNG, GIF, WebP) são aceitas.'
      );
    }

    // Validar tamanho do arquivo (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('Arquivo muito grande. O tamanho máximo é 5MB.');
    }

    // Verificar se a entidade existe
    await this.verifyEntityExists(bucket, entityId);

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const sanitizedFileName = fileName || `${timestamp}-${this.sanitizeFileName(file.originalname)}`;
    const filePath = `${entityId}/${sanitizedFileName}`;

    // Fazer upload para o Supabase Storage
    // Usar upsert: true para sobrescrever arquivos existentes (mesmo nome)
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true, // Sobrescrever arquivos existentes
      });

    if (error) {
      throw new Error(`Erro ao fazer upload: ${error.message}`);
    }

    // Obter URL pública do arquivo
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: filePath,
    };
  }

  /**
   * Deleta uma imagem do Supabase Storage
   */
  async deletarImagem(bucket: BucketType, filePath: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      throw new Error(`Erro ao deletar arquivo: ${error.message}`);
    }
  }

  /**
   * Faz upload de múltiplas imagens para um animal
   */
  async uploadMultiplasImagens(
    bucket: BucketType,
    files: Express.Multer.File[],
    entityId: string
  ): Promise<UploadResult[]> {
    if (bucket !== 'animais') {
      throw new Error('Upload múltiplo é suportado apenas para animais');
    }

    // Verificar se a entidade existe
    await this.verifyEntityExists(bucket, entityId);

    const results: UploadResult[] = [];

    for (const file of files) {
      // Validar tipo de arquivo
      if (!this.isValidImageType(file.mimetype)) {
        throw new Error(
          'Tipo de arquivo não permitido. Apenas imagens (JPEG, PNG, GIF, WebP) são aceitas.'
        );
      }

      // Validar tamanho do arquivo (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('Arquivo muito grande. O tamanho máximo é 5MB.');
      }

      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 9);
      const sanitizedFileName = `${timestamp}-${randomSuffix}-${this.sanitizeFileName(file.originalname)}`;
      const filePath = `${entityId}/${sanitizedFileName}`;

      // Fazer upload para o Supabase Storage
      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false, // Não sobrescrever
        });

      if (error) {
        throw new Error(`Erro ao fazer upload: ${error.message}`);
      }

      // Obter URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      results.push({
        url: publicUrl,
        path: filePath,
      });
    }

    return results;
  }

  /**
   * Adiciona fotos ao array de fotos de um animal
   */
  async adicionarFotosAoAnimal(
    animalId: string,
    novasFotos: string[]
  ): Promise<void> {
    const animal = await this.animalRepository.findById(animalId);
    if (!animal) {
      throw new Error('Animal não encontrado');
    }

    const fotosExistentes = animal.fotos || [];
    const todasFotos = [...fotosExistentes, ...novasFotos];

    await this.animalRepository.update(animalId, { fotos: todasFotos });
  }

  /**
   * Remove uma foto do array de fotos de um animal
   */
  async removerFotoDoAnimal(
    animalId: string,
    fotoUrl: string
  ): Promise<void> {
    const animal = await this.animalRepository.findById(animalId);
    if (!animal) {
      throw new Error('Animal não encontrado');
    }

    const fotosExistentes = animal.fotos || [];
    const fotosAtualizadas = fotosExistentes.filter((foto) => foto !== fotoUrl);

    await this.animalRepository.update(animalId, { fotos: fotosAtualizadas });
  }

  /**
   * Atualiza a URL da foto na entidade (animal, usuário ou projeto)
   */
  async atualizarFotoNaEntidade(
    bucket: BucketType,
    entityId: string,
    fotoUrl: string
  ): Promise<void> {
    switch (bucket) {
      case 'animais':
        await this.animalRepository.update(entityId, { foto: fotoUrl });
        break;
      case 'usuarios':
        await this.usuarioRepository.update(entityId, { foto: fotoUrl });
        break;
      case 'projetos':
        await this.projetoRepository.update(entityId, { foto: fotoUrl });
        break;
      default:
        throw new Error(`Bucket inválido: ${bucket}`);
    }
  }

  /**
   * Verifica se a entidade existe antes de fazer upload
   */
  private async verifyEntityExists(
    bucket: BucketType,
    entityId: string
  ): Promise<void> {
    switch (bucket) {
      case 'animais':
        const animal = await this.animalRepository.findById(entityId);
        if (!animal) {
          throw new Error('Animal não encontrado');
        }
        break;
      case 'usuarios':
        const usuario = await this.usuarioRepository.findById(entityId);
        if (!usuario) {
          throw new Error('Usuário não encontrado');
        }
        break;
      case 'projetos':
        const projeto = await this.projetoRepository.findById(entityId);
        if (!projeto) {
          throw new Error('Projeto não encontrado');
        }
        break;
      default:
        throw new Error(`Bucket inválido: ${bucket}`);
    }
  }

  /**
   * Valida se o tipo de arquivo é uma imagem válida
   */
  private isValidImageType(mimetype: string): boolean {
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    return validTypes.includes(mimetype.toLowerCase());
  }

  /**
   * Sanitiza o nome do arquivo removendo caracteres especiais
   */
  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  }
}

