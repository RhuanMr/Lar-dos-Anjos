import { supabase } from '@/database/supabase';
import { Vacina, VacinaCreate, VacinaUpdate } from '@/types/index';

export class VacinaRepository {
  private readonly selectFields =
    'id, animal_id, nome, data_aplicacao';

  async findAll(): Promise<Vacina[]> {
    const { data, error } = await supabase
      .from('vaccines')
      .select(this.selectFields)
      .order('data_aplicacao', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map((item) => this.mapFromDatabase(item));
  }

  async findByAnimal(animalId: string): Promise<Vacina[]> {
    const { data, error } = await supabase
      .from('vaccines')
      .select(this.selectFields)
      .eq('animal_id', animalId)
      .order('data_aplicacao', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map((item) => this.mapFromDatabase(item));
  }

  async findById(id: string): Promise<Vacina | null> {
    const { data, error } = await supabase
      .from('vaccines')
      .select(this.selectFields)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data ? this.mapFromDatabase(data) : null;
  }

  async create(vacina: VacinaCreate): Promise<Vacina> {
    const payload = this.mapToDatabase(vacina);
    const { data, error } = await supabase
      .from('vaccines')
      .insert([payload])
      .select(this.selectFields)
      .single();

    if (error) throw new Error(error.message);
    return this.mapFromDatabase(data);
  }

  async update(id: string, vacina: VacinaUpdate): Promise<Vacina> {
    const payload = this.mapToDatabase(vacina);
    const { data, error } = await supabase
      .from('vaccines')
      .update(payload)
      .eq('id', id)
      .select(this.selectFields)
      .single();

    if (error) throw new Error(error.message);
    return this.mapFromDatabase(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('vaccines').delete().eq('id', id);

    if (error) throw new Error(error.message);
  }

  private mapFromDatabase(record: any): Vacina {
    return {
      id: record.id,
      id_animal: record.animal_id,
      nome: record.nome,
      data_aplicacao: record.data_aplicacao,
    };
  }

  private mapToDatabase(
    vacina: VacinaCreate | VacinaUpdate
  ): Record<string, any> {
    const payload: Record<string, any> = { ...vacina };
    if ('id_animal' in vacina && vacina.id_animal) {
      payload.animal_id = vacina.id_animal;
      delete payload.id_animal;
    }
    return payload;
  }
}

