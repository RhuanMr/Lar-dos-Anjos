import { supabase } from '@/database/supabase';
import { Doador, DoadorCreate, DoadorUpdate } from '@/types/index';

export class DoadorRepository {
  async findAll(): Promise<Doador[]> {
    const { data, error } = await supabase
      .from('doadores')
      .select('*')
      .order('id_usuario', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findByProjeto(projetoId: string): Promise<Doador[]> {
    const { data, error } = await supabase
      .from('doadores')
      .select('*')
      .eq('id_projeto', projetoId);

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findByUsuario(usuarioId: string): Promise<Doador[]> {
    const { data, error } = await supabase
      .from('doadores')
      .select('*')
      .eq('id_usuario', usuarioId);

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findByUsuarioAndProjeto(
    usuarioId: string,
    projetoId: string
  ): Promise<Doador | null> {
    const { data, error } = await supabase
      .from('doadores')
      .select('*')
      .eq('id_usuario', usuarioId)
      .eq('id_projeto', projetoId)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data || null;
  }

  async create(doador: DoadorCreate): Promise<Doador> {
    // Verificar se já existe
    const existente = await this.findByUsuarioAndProjeto(
      doador.id_usuario,
      doador.id_projeto
    );
    if (existente) {
      throw new Error('Usuário já está cadastrado como doador neste projeto');
    }

    const { data, error } = await supabase
      .from('doadores')
      .insert([doador])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(
    usuarioId: string,
    projetoId: string,
    doador: DoadorUpdate
  ): Promise<Doador> {
    const { data, error } = await supabase
      .from('doadores')
      .update(doador)
      .eq('id_usuario', usuarioId)
      .eq('id_projeto', projetoId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(usuarioId: string, projetoId: string): Promise<void> {
    const { error } = await supabase
      .from('doadores')
      .delete()
      .eq('id_usuario', usuarioId)
      .eq('id_projeto', projetoId);

    if (error) throw new Error(error.message);
  }
}

