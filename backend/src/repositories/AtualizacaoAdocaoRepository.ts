import { supabase } from '@/database/supabase';
import {
  AtualizacaoAdocao,
  AtualizacaoAdocaoCreate,
  AtualizacaoAdocaoUpdate,
} from '@/types/index';

export class AtualizacaoAdocaoRepository {
  async findAll(): Promise<AtualizacaoAdocao[]> {
    const { data, error } = await supabase
      .from('atualizacoes')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findByAdocao(adocaoId: string): Promise<AtualizacaoAdocao[]> {
    const { data, error } = await supabase
      .from('atualizacoes')
      .select('*')
      .eq('id_adocao', adocaoId)
      .order('id', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findById(id: string): Promise<AtualizacaoAdocao | null> {
    const { data, error } = await supabase
      .from('atualizacoes')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data || null;
  }

  async create(
    atualizacao: AtualizacaoAdocaoCreate
  ): Promise<AtualizacaoAdocao> {
    const { data, error } = await supabase
      .from('atualizacoes')
      .insert([atualizacao])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(
    id: string,
    atualizacao: AtualizacaoAdocaoUpdate
  ): Promise<AtualizacaoAdocao> {
    const { data, error } = await supabase
      .from('atualizacoes')
      .update(atualizacao)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('atualizacoes')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
}

