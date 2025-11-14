import { supabase } from '@/database/supabase';
import { Animal, AnimalCreate, AnimalUpdate } from '@/types/index';

export class AnimalRepository {
  async findAll(): Promise<Animal[]> {
    const { data, error } = await supabase
      .from('animals')
      .select(
        'id, id_project, nome, foto, entrada, origem, identificacao, vacinado, dt_castracao'
      )
      .order('entrada', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(this.mapFromDatabase);
  }

  async findByProjeto(projetoId: string): Promise<Animal[]> {
    const { data, error } = await supabase
      .from('animals')
      .select(
        'id, id_project, nome, foto, entrada, origem, identificacao, vacinado, dt_castracao'
      )
      .eq('id_project', projetoId)
      .order('entrada', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(this.mapFromDatabase);
  }

  async findById(id: string): Promise<Animal | null> {
    const { data, error } = await supabase
      .from('animals')
      .select(
        'id, id_project, nome, foto, entrada, origem, identificacao, vacinado, dt_castracao'
      )
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data ? this.mapFromDatabase(data) : null;
  }

  async create(animal: AnimalCreate): Promise<Animal> {
    const insertData = this.mapToDatabase(animal);
    const { data, error } = await supabase
      .from('animals')
      .insert([insertData])
      .select(
        'id, id_project, nome, foto, entrada, origem, identificacao, vacinado, dt_castracao'
      )
      .single();

    if (error) throw new Error(error.message);
    return this.mapFromDatabase(data);
  }

  async update(id: string, animal: AnimalUpdate): Promise<Animal> {
    const updateData = this.mapToDatabase(animal);
    const { data, error } = await supabase
      .from('animals')
      .update(updateData)
      .eq('id', id)
      .select(
        'id, id_project, nome, foto, entrada, origem, identificacao, vacinado, dt_castracao'
      )
      .single();

    if (error) throw new Error(error.message);
    return this.mapFromDatabase(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('animals').delete().eq('id', id);

    if (error) throw new Error(error.message);
  }

  private mapFromDatabase(dbAnimal: any): Animal {
    return {
      id: dbAnimal.id,
      id_projeto: dbAnimal.id_project,
      nome: dbAnimal.nome,
      foto: dbAnimal.foto,
      entrada: dbAnimal.entrada,
      origem: dbAnimal.origem,
      identificacao: dbAnimal.identificacao,
      vacinado: dbAnimal.vacinado,
      dt_castracao: dbAnimal.dt_castracao,
    };
  }

  private mapToDatabase(
    animal: AnimalCreate | AnimalUpdate
  ): Record<string, any> {
    const dbAnimal: Record<string, any> = { ...animal };

    if ('id_projeto' in animal && animal.id_projeto) {
      dbAnimal.id_project = animal.id_projeto;
      delete dbAnimal.id_projeto;
    }

    return dbAnimal;
  }
}

