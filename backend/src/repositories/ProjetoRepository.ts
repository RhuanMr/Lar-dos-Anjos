import { supabase } from '@/database/supabase';
import { Projeto, ProjetoCreate } from '@/types/index';

export class ProjetoRepository {
  async findAll(): Promise<Projeto[]> {
    const { data, error } = await supabase
      .from('projetos')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findById(id: string): Promise<Projeto | null> {
    const { data, error } = await supabase
      .from('projetos')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data || null;
  }

  async create(projeto: ProjetoCreate): Promise<Projeto> {
    const { data, error } = await supabase
      .from('projetos')
      .insert([projeto])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, projeto: Partial<Projeto>): Promise<Projeto> {
    const updateData: any = { ...projeto };
    const { data, error } = await supabase
      .from('projetos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('projetos').delete().eq('id', id);

    if (error) throw new Error(error.message);
  }
}
