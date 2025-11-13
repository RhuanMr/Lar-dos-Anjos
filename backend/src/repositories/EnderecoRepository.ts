import { supabase } from '@/database/supabase';
import { Endereco, EnderecoCreate, EnderecoUpdate } from '@/types/index';

export class EnderecoRepository {
  async findAll(): Promise<Endereco[]> {
    const { data, error } = await supabase
      .from('address')
      .select('*')
      .order('cidade', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findById(id: string): Promise<Endereco | null> {
    const { data, error } = await supabase
      .from('address')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data || null;
  }

  async create(endereco: EnderecoCreate): Promise<Endereco> {
    const { data, error } = await supabase
      .from('address')
      .insert([endereco])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, endereco: EnderecoUpdate): Promise<Endereco> {
    const { data, error } = await supabase
      .from('address')
      .update(endereco)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('address').delete().eq('id', id);

    if (error) throw new Error(error.message);
  }
}

