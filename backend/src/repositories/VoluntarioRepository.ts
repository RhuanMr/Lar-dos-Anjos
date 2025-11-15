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
    if ('servico' in data && data.servico !== undefined) mapped.servico = data.servico;
    if ('frequencia' in data && data.frequencia !== undefined) {
      mapped.frequencia = this.mapFrequenciaToDatabase(data.frequencia);
    }
    if ('lt_data' in data && data.lt_data !== undefined) mapped.lt_data = data.lt_data;
    if ('px_data' in data && data.px_data !== undefined) mapped.px_data = data.px_data;
    return mapped;
  }

  async findAll(): Promise<Voluntario[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .order('id_user', { ascending: true });

    if (error) throw new Error(error.message);
    return (data || []).map(this.mapFromDatabase);
  }

  async findByProjeto(projetoId: string): Promise<Voluntario[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('id_project', projetoId);

    if (error) throw new Error(error.message);
    return (data || []).map(this.mapFromDatabase);
  }

  async findByUsuario(usuarioId: string): Promise<Voluntario[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('id_user', usuarioId);

    if (error) throw new Error(error.message);
    return (data || []).map(this.mapFromDatabase);
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
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .insert([mappedData])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapFromDatabase(data);
  }

  async update(
    usuarioId: string,
    projetoId: string,
    voluntario: VoluntarioUpdate
  ): Promise<Voluntario> {
    const mappedData = this.mapToDatabase(voluntario);
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .update(mappedData)
      .eq('id_user', usuarioId)
      .eq('id_project', projetoId)
      .select()
      .single();

    if (error) throw new Error(error.message);
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

