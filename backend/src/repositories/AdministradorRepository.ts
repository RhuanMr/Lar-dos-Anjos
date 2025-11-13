import { supabase } from '@/database/supabase';
import { Administrador, AdministradorCreate, AdministradorUpdate } from '@/types/index';

export class AdministradorRepository {
  async findAll(): Promise<Administrador[]> {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .order('id_user', { ascending: true });

    if (error) throw new Error(error.message);
    
    // Mapear os dados do banco (id_user, id_project) para o formato esperado (id_usuario, id_projeto)
    // A tabela admins usa chave primária composta (id_user, id_project)
    return (data || []).map((item: any) => ({
      id_usuario: item.id_user,
      id_projeto: item.id_project,
      observacao: item.observacao,
    }));
  }

  async findByProjeto(projetoId: string): Promise<Administrador[]> {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('id_project', projetoId);

    if (error) throw new Error(error.message);
    
    return (data || []).map((item: any) => ({
      id_usuario: item.id_user,
      id_projeto: item.id_project,
      observacao: item.observacao,
    }));
  }

  async findByUsuario(usuarioId: string): Promise<Administrador[]> {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('id_user', usuarioId);

    if (error) throw new Error(error.message);
    
    return (data || []).map((item: any) => ({
      id_usuario: item.id_user,
      id_projeto: item.id_project,
      observacao: item.observacao,
    }));
  }

  async findByUsuarioAndProjeto(
    usuarioId: string,
    projetoId: string
  ): Promise<Administrador | null> {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('id_user', usuarioId)
      .eq('id_project', projetoId)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    if (!data) return null;
    
    return {
      id_usuario: data.id_user,
      id_projeto: data.id_project,
      observacao: data.observacao,
    };
  }

  async create(administrador: AdministradorCreate): Promise<Administrador> {
    // Verificar se já existe (a chave primária composta garante unicidade)
    const existente = await this.findByUsuarioAndProjeto(
      administrador.id_usuario,
      administrador.id_projeto
    );
    if (existente) {
      throw new Error(
        'Usuário já está cadastrado como administrador deste projeto'
      );
    }

    // Mapear os dados para o formato do banco (id_user, id_project)
    // A tabela usa chave primária composta (id_user, id_project)
    const dadosParaBanco: any = {
      id_user: administrador.id_usuario,
      id_project: administrador.id_projeto,
    };

    // Adicionar observacao apenas se existir
    if (administrador.observacao) {
      dadosParaBanco.observacao = administrador.observacao;
    }

    const { data, error } = await supabase
      .from('admins')
      .insert([dadosParaBanco])
      .select('id_user, id_project, observacao')
      .single();

    if (error) {
      console.error('Erro ao criar administrador no Supabase:', error);
      throw new Error(error.message);
    }
    
    return {
      id_usuario: data.id_user,
      id_projeto: data.id_project,
      observacao: data.observacao,
    };
  }

  async update(
    usuarioId: string,
    projetoId: string,
    administrador: AdministradorUpdate
  ): Promise<Administrador> {
    // A atualização usa a chave primária composta (id_user, id_project)
    // Mapear observacao para o formato do banco (se existir)
    const dadosParaBanco: any = {};
    if (administrador.observacao !== undefined) {
      dadosParaBanco.observacao = administrador.observacao;
    }

    const { data, error } = await supabase
      .from('admins')
      .update(dadosParaBanco)
      .eq('id_user', usuarioId)
      .eq('id_project', projetoId)
      .select('id_user, id_project, observacao')
      .single();

    if (error) throw new Error(error.message);
    
    return {
      id_usuario: data.id_user,
      id_projeto: data.id_project,
      observacao: data.observacao,
    };
  }

  async delete(usuarioId: string, projetoId: string): Promise<void> {
    // A deleção usa a chave primária composta (id_user, id_project)
    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('id_user', usuarioId)
      .eq('id_project', projetoId);

    if (error) throw new Error(error.message);
  }
}

