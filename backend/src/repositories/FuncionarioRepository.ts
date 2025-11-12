import { supabase } from '@/database/supabase';
import {
  Funcionario,
  FuncionarioCreate,
  FuncionarioUpdate,
} from '@/types/index';

export class FuncionarioRepository {
  async findAll(): Promise<Funcionario[]> {
    const { data, error } = await supabase
      .from('funcionarios')
      .select('*')
      .order('id_usuario', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findByProjeto(projetoId: string): Promise<Funcionario[]> {
    const { data, error } = await supabase
      .from('funcionarios')
      .select('*')
      .eq('id_projeto', projetoId);

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findByUsuario(usuarioId: string): Promise<Funcionario[]> {
    const { data, error } = await supabase
      .from('funcionarios')
      .select('*')
      .eq('id_usuario', usuarioId);

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findByUsuarioAndProjeto(
    usuarioId: string,
    projetoId: string
  ): Promise<Funcionario | null> {
    const { data, error } = await supabase
      .from('funcionarios')
      .select('*')
      .eq('id_usuario', usuarioId)
      .eq('id_projeto', projetoId)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data || null;
  }

  async create(funcionario: FuncionarioCreate): Promise<Funcionario> {
    // Verificar se já existe
    const existente = await this.findByUsuarioAndProjeto(
      funcionario.id_usuario,
      funcionario.id_projeto
    );
    if (existente) {
      throw new Error(
        'Usuário já está cadastrado como funcionário neste projeto'
      );
    }

    const dados: FuncionarioCreate = {
      ...funcionario,
      privilegios: funcionario.privilegios ?? false,
    };

    const { data, error } = await supabase
      .from('funcionarios')
      .insert([dados])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(
    usuarioId: string,
    projetoId: string,
    funcionario: FuncionarioUpdate
  ): Promise<Funcionario> {
    const { data, error } = await supabase
      .from('funcionarios')
      .update(funcionario)
      .eq('id_usuario', usuarioId)
      .eq('id_projeto', projetoId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(usuarioId: string, projetoId: string): Promise<void> {
    const { error } = await supabase
      .from('funcionarios')
      .delete()
      .eq('id_usuario', usuarioId)
      .eq('id_projeto', projetoId);

    if (error) throw new Error(error.message);
  }
}

