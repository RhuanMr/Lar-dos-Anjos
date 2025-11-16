import { supabase } from '@/database/supabase';
import { Voluntario, VoluntarioCreate, VoluntarioUpdate } from '@/types/index';

export class VoluntarioRepository {
  // ⚠️ IMPORTANTE: 
  // - O nome da tabela no banco de dados é 'volunteers' (inglês), não 'voluntarios' (português)
  // - Os nomes das colunas no banco são: id_user, id_project (inglês)
  // - A aplicação usa: id_usuario, id_projeto (português)
  private readonly TABLE_NAME = 'volunteers';

  // Mapear frequencia do banco de dados para aplicação
  private mapFrequenciaFromDatabase(value: string | null | undefined): string | undefined {
    if (!value) return undefined;
    const mapping: { [key: string]: string } = {
      'MENSAL': 'mensal',
      'PONTUAL': 'pontual',
      'EVENTUAL': 'eventual',
      'mensal': 'mensal',
      'pontual': 'pontual',
      'eventual': 'eventual',
    };
    return mapping[value] || value.toLowerCase();
  }

  // Mapear frequencia da aplicação para banco de dados
  // ⚠️ IMPORTANTE: O enum frequencia_enum no banco pode usar valores em MAIÚSCULAS
  private mapFrequenciaToDatabase(value: string | null | undefined): string | undefined {
    if (!value) return undefined;
    
    const mapping: Record<string, string> = {
      'mensal': 'MENSAL',
      'pontual': 'PONTUAL',
      'eventual': 'EVENTUAL',
      'MENSAL': 'MENSAL',
      'PONTUAL': 'PONTUAL',
      'EVENTUAL': 'EVENTUAL',
    };
    
    return mapping[value] || value.toUpperCase();
  }

  // Mapear dados do banco para a aplicação
  private mapFromDatabase(data: any): Voluntario {
    return {
      id_usuario: data.id_user,
      id_projeto: data.id_project,
      servico: data.servico,
      frequencia: this.mapFrequenciaFromDatabase(data.frequencia) as any,
      lt_data: data.lt_data,
      px_data: data.px_data,
    };
  }

  // Mapear dados da aplicação para o banco
  private mapToDatabase(data: VoluntarioCreate | VoluntarioUpdate): any {
    const mapped: any = {};
    if ('id_usuario' in data) mapped.id_user = data.id_usuario;
    if ('id_projeto' in data) mapped.id_project = data.id_projeto;
    if ('servico' in data && data.servico !== undefined && data.servico !== null && data.servico !== '') {
      mapped.servico = data.servico;
    }
    if ('frequencia' in data && data.frequencia !== undefined && data.frequencia !== null) {
      mapped.frequencia = this.mapFrequenciaToDatabase(data.frequencia);
    }
    if ('lt_data' in data && data.lt_data !== undefined && data.lt_data !== null && data.lt_data !== '') {
      mapped.lt_data = data.lt_data;
    }
    // px_data pode não existir na tabela, então só incluímos se tiver valor válido
    // Se a coluna não existir no banco, não será incluída no insert
    if ('px_data' in data && data.px_data !== undefined && data.px_data !== null && data.px_data !== '') {
      mapped.px_data = data.px_data;
    }
    return mapped;
  }

  async findAll(): Promise<Voluntario[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .order('id_user', { ascending: true });

    if (error) throw new Error(error.message);
    return (data || []).map((item) => this.mapFromDatabase(item));
  }

  async findByProjeto(projetoId: string): Promise<Voluntario[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('id_project', projetoId);

    if (error) throw new Error(error.message);
    return (data || []).map((item) => this.mapFromDatabase(item));
  }

  async findByUsuario(usuarioId: string): Promise<Voluntario[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('id_user', usuarioId);

    if (error) throw new Error(error.message);
    return (data || []).map((item) => this.mapFromDatabase(item));
  }

  async findByUsuarioAndProjeto(
    usuarioId: string,
    projetoId: string
  ): Promise<Voluntario | null> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('id_user', usuarioId)
      .eq('id_project', projetoId)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data ? this.mapFromDatabase(data) : null;
  }

  async create(voluntario: VoluntarioCreate): Promise<Voluntario> {
    // Verificar se já existe
    const existente = await this.findByUsuarioAndProjeto(
      voluntario.id_usuario,
      voluntario.id_projeto
    );
    if (existente) {
      throw new Error(
        'Usuário já está cadastrado como voluntário neste projeto'
      );
    }

    const mappedData = this.mapToDatabase(voluntario);
    
    // Remover campos undefined/null/vazios para evitar problemas com colunas que podem não existir
    // Especialmente px_data que pode não existir na tabela
    const cleanData: any = {};
    Object.keys(mappedData).forEach(key => {
      const value = mappedData[key];
      // Não incluir campos vazios, undefined ou null
      // Especialmente importante para px_data que é opcional e pode não existir na tabela
      if (value !== undefined && value !== null && value !== '') {
        cleanData[key] = value;
      }
    });

    // Se px_data estiver presente mas vazio, remover explicitamente
    if ('px_data' in cleanData && (!cleanData.px_data || cleanData.px_data === '')) {
      delete cleanData.px_data;
    }

    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .insert([cleanData])
      .select()
      .single();

    if (error) {
      // Se o erro for sobre coluna px_data não encontrada, tentar novamente sem ela
      if (error.message.includes('px_data') || 
          (error.message.includes('column') && error.message.includes('px_data'))) {
        const dataWithoutPxData = { ...cleanData };
        delete dataWithoutPxData.px_data;
        
        const { data: retryData, error: retryError } = await supabase
          .from(this.TABLE_NAME)
          .insert([dataWithoutPxData])
          .select()
          .single();
        
        if (retryError) throw new Error(retryError.message);
        return this.mapFromDatabase(retryData);
      }
      throw new Error(error.message);
    }
    return this.mapFromDatabase(data);
  }

  async update(
    usuarioId: string,
    projetoId: string,
    voluntario: VoluntarioUpdate
  ): Promise<Voluntario> {
    const mappedData = this.mapToDatabase(voluntario);
    
    // Remover campos undefined/null/vazios para evitar problemas com colunas que podem não existir
    // Especialmente px_data que é opcional e pode não existir na tabela
    const cleanData: any = {};
    Object.keys(mappedData).forEach(key => {
      const value = mappedData[key];
      // Não incluir campos vazios, undefined ou null
      if (value !== undefined && value !== null && value !== '') {
        cleanData[key] = value;
      }
    });

    // Se px_data estiver presente mas vazio, remover explicitamente
    if ('px_data' in cleanData && (!cleanData.px_data || cleanData.px_data === '')) {
      delete cleanData.px_data;
    }

    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .update(cleanData)
      .eq('id_user', usuarioId)
      .eq('id_project', projetoId)
      .select()
      .single();

    if (error) {
      // Se o erro for sobre coluna px_data não encontrada, tentar novamente sem ela
      if (error.message.includes('px_data') || 
          (error.message.includes('column') && error.message.includes('px_data'))) {
        const dataWithoutPxData = { ...cleanData };
        delete dataWithoutPxData.px_data;
        
        const { data: retryData, error: retryError } = await supabase
          .from(this.TABLE_NAME)
          .update(dataWithoutPxData)
          .eq('id_user', usuarioId)
          .eq('id_project', projetoId)
          .select()
          .single();
        
        if (retryError) throw new Error(retryError.message);
        return this.mapFromDatabase(retryData);
      }
      throw new Error(error.message);
    }
    return this.mapFromDatabase(data);
  }

  async delete(usuarioId: string, projetoId: string): Promise<void> {
    const { error } = await supabase
      .from(this.TABLE_NAME)
      .delete()
      .eq('id_user', usuarioId)
      .eq('id_project', projetoId);

    if (error) throw new Error(error.message);
  }
}

