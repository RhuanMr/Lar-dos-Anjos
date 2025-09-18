import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';
import { ApiResponse, User, CreateUserRequest, PaginatedResponse } from '../types';

export class UserController {
  // Listar usuários
  static async getUsers(req: Request, res: Response<PaginatedResponse<User>>) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      let query = supabaseAdmin
        .from('users')
        .select('*', { count: 'exact' })
        .range(offset, offset + Number(limit) - 1);

      if (search) {
        query = query.or(`nome.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        res.status(400).json({
          success: false,
          error: error.message,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: 0,
            totalPages: 0
          }
        });
        return;
      }

      const totalPages = Math.ceil((count || 0) / Number(limit));

      res.json({
        success: true,
        data: data || [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count || 0,
          totalPages
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar usuários',
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      });
    }
  }

  // Buscar usuário por ID
  static async getUserById(req: Request, res: Response<ApiResponse<User>>) {
    try {
      const { id } = req.params;

      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar usuário'
      });
    }
  }

  // Criar usuário
  static async createUser(req: Request, res: Response<ApiResponse<User>>) {
    try {
      const userData: CreateUserRequest = req.body;

      const { data, error } = await supabaseAdmin
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) {
        res.status(400).json({
          success: false,
          error: error.message
        });
        return;
      }

      res.status(201).json({
        success: true,
        data,
        message: 'Usuário criado com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Erro ao criar usuário'
      });
    }
  }

  // Atualizar usuário
  static async updateUser(req: Request, res: Response<ApiResponse<User>>) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const { data, error } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        res.status(400).json({
          success: false,
          error: error.message
        });
        return;
      }

      res.json({
        success: true,
        data,
        message: 'Usuário atualizado com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Erro ao atualizar usuário'
      });
    }
  }

  // Deletar usuário
  static async deleteUser(req: Request, res: Response<ApiResponse>) {
    try {
      const { id } = req.params;

      const { error } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        res.status(400).json({
          success: false,
          error: error.message
        });
        return;
      }

      res.json({
        success: true,
        message: 'Usuário deletado com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Erro ao deletar usuário'
      });
    }
  }

  // Upload de foto de perfil
  static async uploadProfilePhoto(req: Request, res: Response<ApiResponse<{ foto_url: string }>>) {
    try {
      const { id } = req.params;
      const file = req.file;

      if (!file) {
        res.status(400).json({
          success: false,
          error: 'Nenhum arquivo enviado'
        });
        return;
      }

      // Verificar se o usuário existe
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', id)
        .single();

      if (userError || !user) {
        res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
        return;
      }

      // Upload para Supabase Storage
      const fileName = `${id}-${Date.now()}.${file.originalname.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('fotos-perfil')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600'
        });

      if (uploadError) {
        res.status(500).json({
          success: false,
          error: 'Erro ao fazer upload da foto: ' + uploadError.message
        });
        return;
      }

      // Obter URL pública da foto
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('fotos-perfil')
        .getPublicUrl(fileName);

      // Atualizar URL da foto no banco
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ foto_url: publicUrl })
        .eq('id', id);

      if (updateError) {
        res.status(500).json({
          success: false,
          error: 'Erro ao atualizar foto do usuário: ' + updateError.message
        });
        return;
      }

      res.json({
        success: true,
        data: { foto_url: publicUrl },
        message: 'Foto de perfil atualizada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar perfil do usuário
  static async updateProfile(req: Request, res: Response<ApiResponse<User>>) {
    try {
      const { id } = req.params;
      const { nome, telefone, endereco } = req.body;

      // Verificar se o usuário existe
      const { data: existingUser, error: userError } = await supabaseAdmin
        .from('users')
        .select('id, endereco_id')
        .eq('id', id)
        .single();

      if (userError || !existingUser) {
        res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
        return;
      }

      let endereco_id = existingUser.endereco_id;

      // Atualizar endereço se fornecido
      if (endereco) {
        if (endereco_id) {
          // Atualizar endereço existente
          const { error: enderecoError } = await supabaseAdmin
            .from('endereco')
            .update(endereco)
            .eq('id', endereco_id);

          if (enderecoError) {
            res.status(400).json({
              success: false,
              error: 'Erro ao atualizar endereço: ' + enderecoError.message
            });
            return;
          }
        } else {
          // Criar novo endereço
          const { data: enderecoData, error: enderecoError } = await supabaseAdmin
            .from('endereco')
            .insert(endereco)
            .select()
            .single();

          if (enderecoError) {
            res.status(400).json({
              success: false,
              error: 'Erro ao criar endereço: ' + enderecoError.message
            });
            return;
          }

          endereco_id = enderecoData.id;
        }
      }

      // Atualizar dados do usuário
      const updateData: any = {};
      if (nome !== undefined) updateData.nome = nome;
      if (telefone !== undefined) updateData.telefone = telefone;
      if (endereco_id !== undefined) updateData.endereco_id = endereco_id;

      const { data, error } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          endereco:endereco_id(*)
        `)
        .single();

      if (error) {
        res.status(500).json({
          success: false,
          error: 'Erro ao atualizar perfil: ' + error.message
        });
        return;
      }

      res.json({
        success: true,
        data,
        message: 'Perfil atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
}
