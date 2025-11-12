import { supabase } from '@/database/supabase';
import { Voluntario, VoluntarioCreate, VoluntarioUpdate } from '@/types/index';

export class VoluntarioRepository {
  async findAll(): Promise<Voluntario[]> {
    const { data, error } = await supabase
      .from('voluntarios')
      .select('*')
      .order('id_usuario', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findByProjeto(projetoId: string): Promise<Voluntario[]> {
    const { data, error } = await supabase
      .from('voluntarios')
      .select('*')
      .eq('id_projeto', projetoId);

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findByUsuario(usuarioId: string): Promise<Voluntario[]> {
    const { data, error } = await supabase
      .from('voluntarios')
      .select('*')
      .eq('id_usuario', usuarioId);

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findByUsuarioAndProjeto(
    usuarioId: string,
    projetoId: string
  ): Promise<Voluntario | null> {
    const { data, error } = await supabase
      .from('voluntarios')
      .select('*')
      .eq('id_usuario', usuarioId)
      .eq('id_projeto', projetoId)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data || null;
  }

  async create(voluntario: VoluntarioCreate): Promise<Voluntario> {
    // Verificar se já existe
    const existente = await this.findByUsuarioAndProjeto(
      voluntario.id_usuario,
      voluntario.id_projeto
    );
    if (existente) {
      throw new Error(
        'Usuário já está cadastrado como voluntário neste projeto'
      );
    }

    const { data, error } = await supabase
      .from('voluntarios')
      .insert([voluntario])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(
    usuarioId: string,
    projetoId: string,
    voluntario: VoluntarioUpdate
  ): Promise<Voluntario> {
    const { data, error } = await supabase
      .from('voluntarios')
      .update(voluntario)
      .eq('id_usuario', usuarioId)
      .eq('id_projeto', projetoId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(usuarioId: string, projetoId: string): Promise<void> {
    const { error } = await supabase
      .from('voluntarios')
      .delete()
      .eq('id_usuario', usuarioId)
      .eq('id_projeto', projetoId);

    if (error) throw new Error(error.message);
  }
}

