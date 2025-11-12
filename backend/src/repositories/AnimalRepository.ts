import { supabase } from '@/database/supabase';
import { Animal, AnimalCreate, AnimalUpdate } from '@/types/index';

export class AnimalRepository {
  async findAll(): Promise<Animal[]> {
    const { data, error } = await supabase
      .from('animais')
      .select('*')
      .order('entrada', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findByProjeto(projetoId: string): Promise<Animal[]> {
    const { data, error } = await supabase
      .from('animais')
      .select('*')
      .eq('id_projeto', projetoId)
      .order('entrada', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findById(id: string): Promise<Animal | null> {
    const { data, error } = await supabase
      .from('animais')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data || null;
  }

  async create(animal: AnimalCreate): Promise<Animal> {
    const { data, error } = await supabase
      .from('animais')
      .insert([animal])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, animal: AnimalUpdate): Promise<Animal> {
    const { data, error } = await supabase
      .from('animais')
      .update(animal)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('animais').delete().eq('id', id);

    if (error) throw new Error(error.message);
  }
}

