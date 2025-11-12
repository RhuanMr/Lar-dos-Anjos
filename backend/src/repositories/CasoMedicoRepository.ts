import { supabase } from '@/database/supabase';
import {
  CasoMedico,
  CasoMedicoCreate,
  CasoMedicoUpdate,
} from '@/types/index';

export class CasoMedicoRepository {
  async findAll(): Promise<CasoMedico[]> {
    const { data, error } = await supabase
      .from('casos_medicos')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findByAnimal(animalId: string): Promise<CasoMedico[]> {
    const { data, error } = await supabase
      .from('casos_medicos')
      .select('*')
      .eq('id_animal', animalId)
      .order('id', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findById(id: string): Promise<CasoMedico | null> {
    const { data, error } = await supabase
      .from('casos_medicos')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data || null;
  }

  async create(casoMedico: CasoMedicoCreate): Promise<CasoMedico> {
    const dados: CasoMedicoCreate = {
      ...casoMedico,
      finalizado: casoMedico.finalizado ?? false,
    };

    const { data, error } = await supabase
      .from('casos_medicos')
      .insert([dados])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, casoMedico: CasoMedicoUpdate): Promise<CasoMedico> {
    const { data, error } = await supabase
      .from('casos_medicos')
      .update(casoMedico)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('casos_medicos')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
}

