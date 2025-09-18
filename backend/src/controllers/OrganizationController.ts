import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

export class OrganizationController {
  // Criar nova organização
  static async create(req: Request, res: Response): Promise<Response> {
    try {
      const { 
        nome, 
        descricao, 
        cpf_user, 
        endereco_visivel = false,
        endereco,
        fotos = []
      } = req.body;

      if (!nome || !cpf_user) {
        return res.status(400).json({
          success: false,
          error: 'Nome e CPF do responsável são obrigatórios'
        });
      }

      // Verificar se o usuário existe
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('cpf', cpf_user)
        .single();

      if (userError || !user) {
        return res.status(404).json({
          success: false,
          error: 'Usuário responsável não encontrado'
        });
      }

      let endereco_id = null;

      // Criar endereço se fornecido
      if (endereco) {
        const { data: enderecoData, error: enderecoError } = await supabaseAdmin
          .from('endereco')
          .insert(endereco)
          .select()
          .single();

        if (enderecoError) {
          return res.status(400).json({
            success: false,
            error: 'Erro ao criar endereço: ' + enderecoError.message
          });
        }

        endereco_id = enderecoData.id;
      }

      // Criar organização
      const { data: organizationData, error: orgError } = await supabaseAdmin
        .from('project')
        .insert({
          nome,
          descricao,
          cpf_user,
          endereco_visivel,
          endereco_id,
          fotos
        })
        .select()
        .single();

      if (orgError) {
        return res.status(500).json({
          success: false,
          error: 'Erro ao criar organização: ' + orgError.message
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Organização criada com sucesso',
        data: organizationData
      });
    } catch (error) {
      console.error('Erro ao criar organização:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Listar organizações
  static async list(req: Request, res: Response): Promise<Response> {
    try {
      const { page = 1, limit = 10, search } = req.query;

      let query = supabaseAdmin
        .from('project')
        .select(`
          *,
          endereco:endereco_id(*)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Aplicar filtro de busca se fornecido
      if (search) {
        query = query.or(`nome.ilike.%${search}%,descricao.ilike.%${search}%`);
      }

      // Aplicar paginação
      const from = (Number(page) - 1) * Number(limit);
      const to = from + Number(limit) - 1;

      const { data, error, count } = await query.range(from, to);

      if (error) {
        return res.status(500).json({
          success: false,
          error: 'Erro ao buscar organizações: ' + error.message
        });
      }

      return res.json({
        success: true,
        data: {
          organizations: data,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: count || 0,
            pages: Math.ceil((count || 0) / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Erro ao listar organizações:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Buscar organização por ID
  static async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const { data, error } = await supabaseAdmin
        .from('project')
        .select(`
          *,
          endereco:endereco_id(*)
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        return res.status(404).json({
          success: false,
          error: 'Organização não encontrada'
        });
      }

      return res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Erro ao buscar organização:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar organização
  static async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { 
        nome, 
        descricao, 
        endereco_visivel,
        endereco,
        fotos
      } = req.body;

      // Verificar se a organização existe
      const { data: existingOrg, error: orgError } = await supabaseAdmin
        .from('project')
        .select('id, endereco_id')
        .eq('id', id)
        .single();

      if (orgError || !existingOrg) {
        return res.status(404).json({
          success: false,
          error: 'Organização não encontrada'
        });
      }

      let endereco_id = existingOrg.endereco_id;

      // Atualizar endereço se fornecido
      if (endereco) {
        if (endereco_id) {
          // Atualizar endereço existente
          const { error: enderecoError } = await supabaseAdmin
            .from('endereco')
            .update(endereco)
            .eq('id', endereco_id);

          if (enderecoError) {
            return res.status(400).json({
              success: false,
              error: 'Erro ao atualizar endereço: ' + enderecoError.message
            });
          }
        } else {
          // Criar novo endereço
          const { data: enderecoData, error: enderecoError } = await supabaseAdmin
            .from('endereco')
            .insert(endereco)
            .select()
            .single();

          if (enderecoError) {
            return res.status(400).json({
              success: false,
              error: 'Erro ao criar endereço: ' + enderecoError.message
            });
          }

          endereco_id = enderecoData.id;
        }
      }

      // Atualizar organização
      const updateData: any = {};
      if (nome !== undefined) updateData.nome = nome;
      if (descricao !== undefined) updateData.descricao = descricao;
      if (endereco_visivel !== undefined) updateData.endereco_visivel = endereco_visivel;
      if (fotos !== undefined) updateData.fotos = fotos;
      if (endereco_id !== undefined) updateData.endereco_id = endereco_id;

      const { data, error } = await supabaseAdmin
        .from('project')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          endereco:endereco_id(*)
        `)
        .single();

      if (error) {
        return res.status(500).json({
          success: false,
          error: 'Erro ao atualizar organização: ' + error.message
        });
      }

      return res.json({
        success: true,
        message: 'Organização atualizada com sucesso',
        data
      });
    } catch (error) {
      console.error('Erro ao atualizar organização:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Deletar organização
  static async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      // Verificar se a organização existe
      const { data: existingOrg, error: orgError } = await supabaseAdmin
        .from('project')
        .select('id, endereco_id')
        .eq('id', id)
        .single();

      if (orgError || !existingOrg) {
        return res.status(404).json({
          success: false,
          error: 'Organização não encontrada'
        });
      }

      // Deletar organização (endereço será deletado em cascata se configurado)
      const { error } = await supabaseAdmin
        .from('project')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(500).json({
          success: false,
          error: 'Erro ao deletar organização: ' + error.message
        });
      }

      return res.json({
        success: true,
        message: 'Organização deletada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar organização:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
}