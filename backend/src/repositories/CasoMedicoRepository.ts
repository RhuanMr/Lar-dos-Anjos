import { supabase } from '@/database/supabase';
import {
  CasoMedico,
  CasoMedicoCreate,
  CasoMedicoUpdate,
} from '@/types/index';

export class CasoMedicoRepository {
  private readonly selectFields =
    'id, animal_id, finalizado, descricao, observacao';

  async findAll(): Promise<CasoMedico[]> {
    const { data, error } = await supabase
      .from('medical_cases')
      .select(this.selectFields)
      .order('id', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map((item) => this.mapFromDatabase(item));
  }

  async findByAnimal(animalId: string): Promise<CasoMedico[]> {
    const { data, error } = await supabase
      .from('medical_cases')
      .select(this.selectFields)
      .eq('animal_id', animalId)
      .order('id', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map((item) => this.mapFromDatabase(item));
  }

  async findById(id: string): Promise<CasoMedico | null> {
    const { data, error } = await supabase
      .from('medical_cases')
      .select(this.selectFields)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data ? this.mapFromDatabase(data) : null;
  }

  async create(casoMedico: CasoMedicoCreate): Promise<CasoMedico> {
    const dados = this.mapToDatabase({
      ...casoMedico,
      finalizado: casoMedico.finalizado ?? false,
    });

    const { data, error } = await supabase
      .from('medical_cases')
      .insert([dados])
      .select(this.selectFields)
      .single();

    if (error) throw new Error(error.message);
    return this.mapFromDatabase(data);
  }

  async update(id: string, casoMedico: CasoMedicoUpdate): Promise<CasoMedico> {
    const payload = this.mapToDatabase(casoMedico);
    const { data, error } = await supabase
      .from('medical_cases')
      .update(payload)
      .eq('id', id)
      .select(this.selectFields)
      .single();

    if (error) throw new Error(error.message);
    return this.mapFromDatabase(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('medical_cases')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  private mapFromDatabase(record: any): CasoMedico {
    return {
      id: record.id,
      id_animal: record.animal_id,
      finalizado: record.finalizado,
      descricao: record.descricao,
      observacao: record.observacao,
    };
  }

  private mapToDatabase(
    casoMedico: CasoMedicoCreate | CasoMedicoUpdate
  ): Record<string, any> {
    const payload: Record<string, any> = { ...casoMedico };

    if ('id_animal' in casoMedico && casoMedico.id_animal) {
      payload.animal_id = casoMedico.id_animal;
      delete payload.id_animal;
    }

    return payload;
  }
}

