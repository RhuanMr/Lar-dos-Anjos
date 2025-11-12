import { supabase } from '@/database/supabase';
import { Doacao, DoacaoCreate, DoacaoUpdate } from '@/types/index';

export class DoacaoRepository {
  async findAll(): Promise<Doacao[]> {
    const { data, error } = await supabase
      .from('doacoes')
      .select('*')
      .order('data', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findByProjeto(projetoId: string): Promise<Doacao[]> {
    const { data, error } = await supabase
      .from('doacoes')
      .select('*')
      .eq('id_project', projetoId)
      .order('data', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findByUsuario(usuarioId: string): Promise<Doacao[]> {
    const { data, error } = await supabase
      .from('doacoes')
      .select('*')
      .eq('id_user', usuarioId)
      .order('data', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findById(id: string): Promise<Doacao | null> {
    const { data, error } = await supabase
      .from('doacoes')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data || null;
  }

  async create(doacao: DoacaoCreate): Promise<Doacao> {
    const { data, error } = await supabase
      .from('doacoes')
      .insert([doacao])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, doacao: DoacaoUpdate): Promise<Doacao> {
    const { data, error } = await supabase
      .from('doacoes')
      .update(doacao)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('doacoes').delete().eq('id', id);

    if (error) throw new Error(error.message);
  }
}

