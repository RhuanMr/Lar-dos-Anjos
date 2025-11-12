import { supabase } from '@/database/supabase';
import { Vacina, VacinaCreate, VacinaUpdate } from '@/types/index';

export class VacinaRepository {
  async findAll(): Promise<Vacina[]> {
    const { data, error } = await supabase
      .from('vacinas')
      .select('*')
      .order('data_aplicacao', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findByAnimal(animalId: string): Promise<Vacina[]> {
    const { data, error } = await supabase
      .from('vacinas')
      .select('*')
      .eq('id_animal', animalId)
      .order('data_aplicacao', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findById(id: string): Promise<Vacina | null> {
    const { data, error } = await supabase
      .from('vacinas')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data || null;
  }

  async create(vacina: VacinaCreate): Promise<Vacina> {
    const { data, error } = await supabase
      .from('vacinas')
      .insert([vacina])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, vacina: VacinaUpdate): Promise<Vacina> {
    const { data, error } = await supabase
      .from('vacinas')
      .update(vacina)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('vacinas').delete().eq('id', id);

    if (error) throw new Error(error.message);
  }
}

