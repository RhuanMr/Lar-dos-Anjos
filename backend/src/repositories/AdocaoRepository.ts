import { supabase } from '@/database/supabase';
import { Adocao, AdocaoCreate, AdocaoUpdate } from '@/types/index';

export class AdocaoRepository {
  // ⚠️ IMPORTANTE: 
  // - O nome da tabela no banco de dados é 'adoptions' (inglês)
  // - Os nomes das colunas no banco são: id_project, id_user, animal_id (inglês)
  // - A aplicação usa: id_projeto, id_adotante, id_animal (português)
  private readonly TABLE_NAME = 'adoptions';

  // Mapear dados do banco para a aplicação
  private mapFromDatabase(data: any): Adocao {
    return {
      id: data.id,
      id_projeto: data.id_project,
      id_adotante: data.id_user,
      id_animal: data.animal_id,
      dt_adocao: data.dt_adocao,
      lt_atualizacao: data.lt_atualizacao,
    };
  }

  // Mapear dados da aplicação para o banco
  private mapToDatabase(data: AdocaoCreate | AdocaoUpdate): any {
    const mapped: any = {};
    if ('id_projeto' in data) mapped.id_project = data.id_projeto;
    if ('id_adotante' in data) mapped.id_user = data.id_adotante;
    if ('id_animal' in data) mapped.animal_id = data.id_animal;
    if ('dt_adocao' in data && data.dt_adocao !== undefined) mapped.dt_adocao = data.dt_adocao;
    // lt_atualizacao é obrigatório no banco, então sempre incluímos se fornecido
    if ('lt_atualizacao' in data && data.lt_atualizacao !== undefined && data.lt_atualizacao !== null) {
      mapped.lt_atualizacao = data.lt_atualizacao;
    }
    return mapped;
  }

  async findAll(): Promise<Adocao[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .order('dt_adocao', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(item => this.mapFromDatabase(item));
  }

  async findByProjeto(projetoId: string): Promise<Adocao[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('id_project', projetoId)
      .order('dt_adocao', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(item => this.mapFromDatabase(item));
  }

  async findByAdotante(adotanteId: string): Promise<Adocao[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('id_user', adotanteId)
      .order('dt_adocao', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(item => this.mapFromDatabase(item));
  }

  async findByAnimal(animalId: string): Promise<Adocao[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('animal_id', animalId)
      .order('dt_adocao', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(item => this.mapFromDatabase(item));
  }

  async findById(id: string): Promise<Adocao | null> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data ? this.mapFromDatabase(data) : null;
  }

  async create(adocao: AdocaoCreate): Promise<Adocao> {
    const mappedData = this.mapToDatabase(adocao);
    
    // Garantir que lt_atualizacao sempre tenha um valor (obrigatório no banco)
    if (!mappedData.lt_atualizacao) {
      mappedData.lt_atualizacao = mappedData.dt_adocao || new Date().toISOString().substring(0, 10);
    }
    
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .insert([mappedData])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapFromDatabase(data);
  }

  async update(id: string, adocao: AdocaoUpdate): Promise<Adocao> {
    const mappedData = this.mapToDatabase(adocao);
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .update(mappedData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapFromDatabase(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.TABLE_NAME).delete().eq('id', id);

    if (error) throw new Error(error.message);
  }
}

