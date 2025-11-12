import { supabase } from '@/database/supabase';
import { Adocao, AdocaoCreate, AdocaoUpdate } from '@/types/index';

export class AdocaoRepository {
  async findAll(): Promise<Adocao[]> {
    const { data, error } = await supabase
      .from('adocoes')
      .select('*')
      .order('dt_adocao', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findByProjeto(projetoId: string): Promise<Adocao[]> {
    const { data, error } = await supabase
      .from('adocoes')
      .select('*')
      .eq('id_projeto', projetoId)
      .order('dt_adocao', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findByAdotante(adotanteId: string): Promise<Adocao[]> {
    const { data, error } = await supabase
      .from('adocoes')
      .select('*')
      .eq('id_adotante', adotanteId)
      .order('dt_adocao', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findByAnimal(animalId: string): Promise<Adocao[]> {
    const { data, error } = await supabase
      .from('adocoes')
      .select('*')
      .eq('id_animal', animalId)
      .order('dt_adocao', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findById(id: string): Promise<Adocao | null> {
    const { data, error } = await supabase
      .from('adocoes')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data || null;
  }

  async create(adocao: AdocaoCreate): Promise<Adocao> {
    const { data, error } = await supabase
      .from('adocoes')
      .insert([adocao])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, adocao: AdocaoUpdate): Promise<Adocao> {
    const { data, error } = await supabase
      .from('adocoes')
      .update(adocao)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('adocoes').delete().eq('id', id);

    if (error) throw new Error(error.message);
  }
}

