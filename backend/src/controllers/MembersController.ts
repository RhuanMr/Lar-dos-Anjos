import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { 
  ApiResponse, 
  PaginatedResponse, 
  OrganizationMember, 
  OrganizationMemberWithUser,
  OrganizationMemberWithProject,
  CreateMemberRequest,
  UpdateMemberRequest,
  MemberStatsResponse
} from '../types';

export class MembersController {
  // Listar membros de uma organização
  static async getOrganizationMembers(req: Request, res: Response<PaginatedResponse<OrganizationMemberWithUser>>): Promise<Response> {
    try {
      const { projectId } = req.params;
      const { page = 1, limit = 10, role, status, search } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      // Verificar se o usuário tem permissão para ver os membros
      const { data: userMembership, error: membershipError } = await supabaseAdmin
        .from('organization_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', req.user?.id)
        .single();

      if (membershipError || !userMembership) {
        return res.status(403).json({
          success: false,
          error: 'Você não tem permissão para ver os membros desta organização',
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: 0,
            totalPages: 0
          }
        });
      }

      let query = supabaseAdmin
        .from('organization_members')
        .select(`
          *,
          user:users(id, nome, email, telefone, cpf, foto_url)
        `, { count: 'exact' })
        .eq('project_id', projectId)
        .range(offset, offset + Number(limit) - 1)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (role) {
        query = query.eq('role', role);
      }
      if (status) {
        query = query.eq('status', status);
      }
      if (search) {
        // Buscar por nome ou email do usuário
        query = query.or(`user.nome.ilike.%${search}%,user.email.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        return res.status(400).json({
          success: false,
          error: error.message,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: 0,
            totalPages: 0
          }
        });
      }

      const totalPages = Math.ceil((count || 0) / Number(limit));

      return res.json({
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
      console.error('Erro ao buscar membros:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      });
    }
  }

  // Adicionar membro à organização
  static async addMember(req: Request, res: Response<ApiResponse<OrganizationMember>>): Promise<Response> {
    try {
      const { projectId } = req.params;
      const { user_id, role = 'membro', status = 'ativo' }: CreateMemberRequest = req.body;

      if (!user_id) {
        return res.status(400).json({
          success: false,
          error: 'ID do usuário é obrigatório'
        });
      }

      // Verificar se o usuário atual é admin da organização
      const { data: userMembership, error: membershipError } = await supabaseAdmin
        .from('organization_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', req.user?.id)
        .single();

      if (membershipError || !userMembership || userMembership.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Apenas administradores podem adicionar membros'
        });
      }

      // Verificar se o usuário existe
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', user_id)
        .single();

      if (userError || !user) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      // Verificar se já é membro
      const { data: existingMember } = await supabaseAdmin
        .from('organization_members')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', user_id)
        .single();

      if (existingMember) {
        return res.status(409).json({
          success: false,
          error: 'Usuário já é membro desta organização'
        });
      }

      // Adicionar membro
      const { data: memberData, error: memberError } = await supabaseAdmin
        .from('organization_members')
        .insert({
          user_id,
          project_id: projectId,
          role,
          status
        })
        .select()
        .single();

      if (memberError) {
        return res.status(400).json({
          success: false,
          error: 'Erro ao adicionar membro: ' + memberError.message
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Membro adicionado com sucesso',
        data: memberData
      });
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Buscar membro específico
  static async getMember(req: Request, res: Response<ApiResponse<OrganizationMemberWithUser>>): Promise<Response> {
    try {
      const { projectId, userId } = req.params;

      // Verificar se o usuário tem permissão
      const { data: userMembership, error: membershipError } = await supabaseAdmin
        .from('organization_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', req.user?.id)
        .single();

      if (membershipError || !userMembership) {
        return res.status(403).json({
          success: false,
          error: 'Você não tem permissão para ver este membro'
        });
      }

      const { data: member, error } = await supabaseAdmin
        .from('organization_members')
        .select(`
          *,
          user:users(id, nome, email, telefone, cpf, foto_url)
        `)
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .single();

      if (error || !member) {
        return res.status(404).json({
          success: false,
          error: 'Membro não encontrado'
        });
      }

      return res.json({
        success: true,
        data: member
      });
    } catch (error) {
      console.error('Erro ao buscar membro:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar membro
  static async updateMember(req: Request, res: Response<ApiResponse<OrganizationMember>>): Promise<Response> {
    try {
      const { projectId, userId } = req.params;
      const { role, status }: UpdateMemberRequest = req.body;

      // Verificar se o usuário atual é admin
      const { data: userMembership, error: membershipError } = await supabaseAdmin
        .from('organization_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', req.user?.id)
        .single();

      if (membershipError || !userMembership || userMembership.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Apenas administradores podem atualizar membros'
        });
      }

      // Verificar se o membro existe
      const { data: existingMember, error: existingError } = await supabaseAdmin
        .from('organization_members')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .single();

      if (existingError || !existingMember) {
        return res.status(404).json({
          success: false,
          error: 'Membro não encontrado'
        });
      }

      // Atualizar dados
      const updateData: any = {};
      if (role !== undefined) updateData.role = role;
      if (status !== undefined) updateData.status = status;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Nenhum campo para atualizar foi fornecido'
        });
      }

      const { data: updatedMember, error: updateError } = await supabaseAdmin
        .from('organization_members')
        .update(updateData)
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        return res.status(400).json({
          success: false,
          error: 'Erro ao atualizar membro: ' + updateError.message
        });
      }

      return res.json({
        success: true,
        message: 'Membro atualizado com sucesso',
        data: updatedMember
      });
    } catch (error) {
      console.error('Erro ao atualizar membro:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Remover membro
  static async removeMember(req: Request, res: Response<ApiResponse>): Promise<Response> {
    try {
      const { projectId, userId } = req.params;

      // Verificar se o usuário atual é admin
      const { data: userMembership, error: membershipError } = await supabaseAdmin
        .from('organization_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', req.user?.id)
        .single();

      if (membershipError || !userMembership || userMembership.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Apenas administradores podem remover membros'
        });
      }

      // Verificar se não está tentando remover a si mesmo
      if (userId === req.user?.id) {
        return res.status(400).json({
          success: false,
          error: 'Você não pode remover a si mesmo da organização'
        });
      }

      // Verificar se o membro existe
      const { data: existingMember, error: existingError } = await supabaseAdmin
        .from('organization_members')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .single();

      if (existingError || !existingMember) {
        return res.status(404).json({
          success: false,
          error: 'Membro não encontrado'
        });
      }

      // Remover membro
      const { error: deleteError } = await supabaseAdmin
        .from('organization_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (deleteError) {
        return res.status(400).json({
          success: false,
          error: 'Erro ao remover membro: ' + deleteError.message
        });
      }

      return res.json({
        success: true,
        message: 'Membro removido com sucesso'
      });
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Listar organizações de um usuário
  static async getUserOrganizations(req: Request, res: Response<ApiResponse<OrganizationMemberWithProject[]>>): Promise<Response> {
    try {
      const { userId } = req.params;

      // Verificar se é o próprio usuário ou admin
      if (userId !== req.user?.id) {
        return res.status(403).json({
          success: false,
          error: 'Você só pode ver suas próprias organizações'
        });
      }

      const { data: organizations, error } = await supabaseAdmin
        .from('organization_members')
        .select(`
          *,
          project:project(id, nome, descricao)
        `)
        .eq('user_id', userId)
        .eq('status', 'ativo')
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      return res.json({
        success: true,
        data: organizations || []
      });
    } catch (error) {
      console.error('Erro ao buscar organizações do usuário:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Estatísticas de membros
  static async getMemberStats(req: Request, res: Response<ApiResponse<MemberStatsResponse>>): Promise<Response> {
    try {
      const { projectId } = req.params;

      // Verificar se o usuário tem permissão
      const { data: userMembership, error: membershipError } = await supabaseAdmin
        .from('organization_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', req.user?.id)
        .single();

      if (membershipError || !userMembership) {
        return res.status(403).json({
          success: false,
          error: 'Você não tem permissão para ver as estatísticas'
        });
      }

      const { data: stats, error } = await supabaseAdmin
        .from('stats_membros_organizacao')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (error) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      return res.json({
        success: true,
        data: stats
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
