import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { Animal, CreateAnimalRequest } from '../types';

export class AnimalController {
  // Listar todos os animais de uma organização
  static async list(req: Request, res: Response): Promise<Response> {
    try {
      const { project_id } = req.params;
      const { status, especie, page = 1, limit = 10 } = req.query;

      let query = supabaseAdmin
        .from('animal')
        .select(`
          *,
          project:project_id (
            id,
            nome
          ),
          tutor:tutor_id (
            id,
            nome,
            email
          )
        `)
        .eq('project_id', project_id)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      if (especie && especie !== 'all') {
        query = query.eq('especie', especie);
      }

      // Paginação
      const offset = (Number(page) - 1) * Number(limit);
      query = query.range(offset, offset + Number(limit) - 1);

      const { data: animals, error, count } = await query;

      if (error) {
        console.error('Erro ao listar animais:', error);
        return res.status(500).json({
          success: false,
          error: 'Erro interno do servidor'
        });
      }

      return res.json({
        success: true,
        data: {
          animals: animals || [],
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: count || 0,
            totalPages: Math.ceil((count || 0) / Number(limit))
          }
        }
      });

    } catch (error) {
      console.error('Erro ao listar animais:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Buscar animal por ID
  static async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const { data: animal, error } = await supabaseAdmin
        .from('animal')
        .select(`
          *,
          project:project_id (
            id,
            nome
          ),
          tutor:tutor_id (
            id,
            nome,
            email,
            telefone
          ),
          vacinas:vacine (
            id,
            nome,
            data,
            observacoes
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            success: false,
            error: 'Animal não encontrado'
          });
        }
        console.error('Erro ao buscar animal:', error);
        return res.status(500).json({
          success: false,
          error: 'Erro interno do servidor'
        });
      }

      return res.json({
        success: true,
        data: animal
      });

    } catch (error) {
      console.error('Erro ao buscar animal:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Criar novo animal
  static async create(req: Request, res: Response): Promise<Response> {
    try {
      const animalData: CreateAnimalRequest = req.body;

      // Verificar se a organização existe
      const { data: project, error: projectError } = await supabaseAdmin
        .from('project')
        .select('id')
        .eq('id', animalData.project_id)
        .single();

      if (projectError || !project) {
        return res.status(404).json({
          success: false,
          error: 'Organização não encontrada'
        });
      }

      // Criar animal
      const { data: animal, error } = await supabaseAdmin
        .from('animal')
        .insert({
          ...animalData,
          status: 'disponivel',
          fotos: []
        })
        .select(`
          *,
          project:project_id (
            id,
            nome
          )
        `)
        .single();

      if (error) {
        console.error('Erro ao criar animal:', error);
        return res.status(400).json({
          success: false,
          error: 'Erro ao criar animal: ' + error.message
        });
      }

      // Criar entrada no histórico
      await supabaseAdmin
        .from('animal_history')
        .insert({
          animal_id: animal.id,
          action: 'created',
          description: `Animal ${animal.nome} foi cadastrado no sistema`,
          user_id: req.user?.id,
          data: {
            nome: animal.nome,
            especie: animal.especie,
            raca: animal.raca
          }
        });

      return res.status(201).json({
        success: true,
        data: animal,
        message: 'Animal cadastrado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao criar animal:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar animal
  static async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Buscar dados atuais do animal para comparação
      const { data: currentAnimal, error: currentError } = await supabaseAdmin
        .from('animal')
        .select('*')
        .eq('id', id)
        .single();

      if (currentError) {
        return res.status(404).json({
          success: false,
          error: 'Animal não encontrado'
        });
      }

      // Atualizar animal
      const { data: animal, error } = await supabaseAdmin
        .from('animal')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          project:project_id (
            id,
            nome
          ),
          tutor:tutor_id (
            id,
            nome,
            email
          )
        `)
        .single();

      if (error) {
        console.error('Erro ao atualizar animal:', error);
        return res.status(400).json({
          success: false,
          error: 'Erro ao atualizar animal: ' + error.message
        });
      }

      // Registrar alterações no histórico
      const changes: string[] = [];
      Object.keys(updateData).forEach(key => {
        if (currentAnimal[key] !== updateData[key]) {
          changes.push(`${key}: ${currentAnimal[key]} → ${updateData[key]}`);
        }
      });

      if (changes.length > 0) {
        await supabaseAdmin
          .from('animal_history')
          .insert({
            animal_id: animal.id,
            action: 'updated',
            description: `Dados do animal ${animal.nome} foram atualizados`,
            user_id: req.user?.id,
            data: {
              changes,
              previous: currentAnimal,
              updated: updateData
            }
          });
      }

      return res.json({
        success: true,
        data: animal,
        message: 'Animal atualizado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao atualizar animal:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar status do animal
  static async updateStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { status, tutor_id, observacoes } = req.body;

      const validStatuses = ['disponivel', 'adotado', 'falecido', 'cuidados_especiais'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Status inválido'
        });
      }

      // Se status é adotado, tutor_id é obrigatório
      if (status === 'adotado' && !tutor_id) {
        return res.status(400).json({
          success: false,
          error: 'Tutor é obrigatório para animais adotados'
        });
      }

      const updateData: any = { status };
      if (tutor_id) {
        updateData.tutor_id = tutor_id;
      }

      const { data: animal, error } = await supabaseAdmin
        .from('animal')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          project:project_id (
            id,
            nome
          ),
          tutor:tutor_id (
            id,
            nome,
            email
          )
        `)
        .single();

      if (error) {
        console.error('Erro ao atualizar status:', error);
        return res.status(400).json({
          success: false,
          error: 'Erro ao atualizar status: ' + error.message
        });
      }

      // Registrar no histórico
      await supabaseAdmin
        .from('animal_history')
        .insert({
          animal_id: animal.id,
          action: 'status_changed',
          description: `Status do animal ${animal.nome} alterado para: ${status}`,
          user_id: req.user?.id,
          data: {
            previous_status: animal.status,
            new_status: status,
            tutor_id,
            observacoes
          }
        });

      return res.json({
        success: true,
        data: animal,
        message: 'Status atualizado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Upload de fotos
  static async uploadPhotos(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Nenhuma foto foi enviada'
        });
      }

      // Buscar animal atual
      const { data: animal, error: animalError } = await supabaseAdmin
        .from('animal')
        .select('fotos')
        .eq('id', id)
        .single();

      if (animalError) {
        return res.status(404).json({
          success: false,
          error: 'Animal não encontrado'
        });
      }

      const uploadPromises = files.map(async (file) => {
        const fileName = `animals/${id}/${Date.now()}-${file.originalname}`;
        
        const { data, error } = await supabaseAdmin.storage
          .from('photos')
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false
          });

        if (error) {
          console.error('Erro no upload:', error);
          throw error;
        }

        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('photos')
          .getPublicUrl(fileName);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const updatedPhotos = [...(animal.fotos || []), ...uploadedUrls];

      // Atualizar animal com novas fotos
      const { data: updatedAnimal, error: updateError } = await supabaseAdmin
        .from('animal')
        .update({ fotos: updatedPhotos })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('Erro ao atualizar fotos:', updateError);
        return res.status(400).json({
          success: false,
          error: 'Erro ao salvar fotos no banco de dados'
        });
      }

      // Registrar no histórico
      await supabaseAdmin
        .from('animal_history')
        .insert({
          animal_id: id,
          action: 'photos_uploaded',
          description: `${uploadedUrls.length} foto(s) adicionada(s) ao animal`,
          user_id: req.user?.id,
          data: {
            uploaded_photos: uploadedUrls
          }
        });

      return res.json({
        success: true,
        data: {
          animal: updatedAnimal,
          uploaded_photos: uploadedUrls
        },
        message: 'Fotos enviadas com sucesso'
      });

    } catch (error) {
      console.error('Erro no upload de fotos:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Buscar histórico do animal
  static async getHistory(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      const { data: history, error, count } = await supabaseAdmin
        .from('animal_history')
        .select(`
          *,
          user:user_id (
            id,
            nome
          )
        `)
        .eq('animal_id', id)
        .order('created_at', { ascending: false })
        .range(offset, offset + Number(limit) - 1);

      if (error) {
        console.error('Erro ao buscar histórico:', error);
        return res.status(500).json({
          success: false,
          error: 'Erro interno do servidor'
        });
      }

      return res.json({
        success: true,
        data: {
          history: history || [],
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: count || 0,
            totalPages: Math.ceil((count || 0) / Number(limit))
          }
        }
      });

    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Deletar animal (soft delete)
  static async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      // Buscar animal para registrar no histórico
      const { data: animal, error: animalError } = await supabaseAdmin
        .from('animal')
        .select('nome, status')
        .eq('id', id)
        .single();

      if (animalError) {
        return res.status(404).json({
          success: false,
          error: 'Animal não encontrado'
        });
      }

      // Atualizar status para indicar exclusão
      const { error } = await supabaseAdmin
        .from('animal')
        .update({ 
          status: 'removido',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar animal:', error);
        return res.status(400).json({
          success: false,
          error: 'Erro ao deletar animal: ' + error.message
        });
      }

      // Registrar no histórico
      await supabaseAdmin
        .from('animal_history')
        .insert({
          animal_id: id,
          action: 'deleted',
          description: `Animal ${animal.nome} foi removido do sistema`,
          user_id: req.user?.id,
          data: {
            previous_status: animal.status,
            deleted_at: new Date().toISOString()
          }
        });

      return res.json({
        success: true,
        message: 'Animal removido com sucesso'
      });

    } catch (error) {
      console.error('Erro ao deletar animal:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Estatísticas de animais
  static async getStats(req: Request, res: Response): Promise<Response> {
    try {
      const { project_id } = req.params;

      // Contar animais por status
      const { data: statusStats, error: statusError } = await supabaseAdmin
        .from('animal')
        .select('status')
        .eq('project_id', project_id)
        .neq('status', 'removido');

      if (statusError) {
        console.error('Erro ao buscar estatísticas:', statusError);
        return res.status(500).json({
          success: false,
          error: 'Erro interno do servidor'
        });
      }

      // Contar por espécie
      const { data: especieStats, error: especieError } = await supabaseAdmin
        .from('animal')
        .select('especie')
        .eq('project_id', project_id)
        .neq('status', 'removido');

      if (especieError) {
        console.error('Erro ao buscar estatísticas por espécie:', especieError);
        return res.status(500).json({
          success: false,
          error: 'Erro interno do servidor'
        });
      }

      // Processar estatísticas
      const statusCounts = statusStats?.reduce((acc, animal) => {
        acc[animal.status] = (acc[animal.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const especieCounts = especieStats?.reduce((acc, animal) => {
        acc[animal.especie] = (acc[animal.especie] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const total = statusStats?.length || 0;

      return res.json({
        success: true,
        data: {
          total,
          by_status: statusCounts,
          by_species: especieCounts,
          percentages: {
            disponivel: total > 0 ? Math.round((statusCounts.disponivel || 0) / total * 100) : 0,
            adotado: total > 0 ? Math.round((statusCounts.adotado || 0) / total * 100) : 0,
            cuidados_especiais: total > 0 ? Math.round((statusCounts.cuidados_especiais || 0) / total * 100) : 0,
            falecido: total > 0 ? Math.round((statusCounts.falecido || 0) / total * 100) : 0
          }
        }
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
}
