import { supabase } from '@/database/supabase';
import { Doador, DoadorCreate, DoadorUpdate } from '@/types/index';

export class DoadorRepository {
  async findAll(): Promise<Doador[]> {
    const { data, error } = await supabase
      .from('donors')
      .select('*')
      .order('id_user', { ascending: true });

    if (error) throw new Error(error.message);
    return this.mapFromDatabase(data || []);
  }

  async findByProjeto(projetoId: string): Promise<Doador[]> {
    const { data, error } = await supabase
      .from('donors')
      .select('*')
      .eq('id_project', projetoId);

    if (error) throw new Error(error.message);
    return this.mapFromDatabase(data || []);
  }

  async findByUsuario(usuarioId: string): Promise<Doador[]> {
    const { data, error } = await supabase
      .from('donors')
      .select('*')
      .eq('id_user', usuarioId);

    if (error) throw new Error(error.message);
    return this.mapFromDatabase(data || []);
  }

  async findByUsuarioAndProjeto(
    usuarioId: string,
    projetoId: string
  ): Promise<Doador | null> {
    const { data, error } = await supabase
      .from('donors')
      .select('*')
      .eq('id_user', usuarioId)
      .eq('id_project', projetoId)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    if (!data) return null;
    const mapped = this.mapFromDatabase([data]);
    return mapped[0] || null;
  }

  async create(doador: DoadorCreate): Promise<Doador> {
    // Verificar se já existe
    const existente = await this.findByUsuarioAndProjeto(
      doador.id_usuario,
      doador.id_projeto
    );
    if (existente) {
      throw new Error('Usuário já está cadastrado como doador neste projeto');
    }

    const mappedData = this.mapToDatabase(doador);
    const { data, error } = await supabase
      .from('donors')
      .insert([mappedData])
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Erro ao criar doador: dados não retornados');
    const mapped = this.mapFromDatabase([data]);
    if (!mapped[0]) throw new Error('Erro ao mapear dados do doador');
    return mapped[0];
  }

  async update(
    usuarioId: string,
    projetoId: string,
    doador: DoadorUpdate
  ): Promise<Doador> {
    const mappedData = this.mapToDatabase(doador as any);
    const { data, error } = await supabase
      .from('donors')
      .update(mappedData)
      .eq('id_user', usuarioId)
      .eq('id_project', projetoId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Erro ao atualizar doador: dados não retornados');
    const mapped = this.mapFromDatabase([data]);
    if (!mapped[0]) throw new Error('Erro ao mapear dados do doador');
    return mapped[0];
  }

  async delete(usuarioId: string, projetoId: string): Promise<void> {
    const { error } = await supabase
      .from('donors')
      .delete()
      .eq('id_user', usuarioId)
      .eq('id_project', projetoId);

    if (error) throw new Error(error.message);
  }

  // Mapear frequencia do banco de dados para aplicação
  private mapFrequenciaFromDatabase(value: string | null | undefined): string | undefined {
    if (!value) return undefined;
    // O banco pode usar valores diferentes, então mapeamos
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
    
    // Mapeamento de valores da aplicação para valores do banco (maiúsculas)
    const mapping: Record<string, string> = {
      'mensal': 'MENSAL',
      'pontual': 'PONTUAL',
      'eventual': 'EVENTUAL',
      'MENSAL': 'MENSAL',
      'PONTUAL': 'PONTUAL',
      'EVENTUAL': 'EVENTUAL',
    };
    
    // Tentar encontrar no mapeamento, senão converter para maiúsculas
    return mapping[value] || value.toUpperCase();
  }

  // Mapear do banco de dados (inglês) para aplicação (português)
  private mapFromDatabase(data: any[]): Doador[] {
    return data.map((item) => ({
      id_usuario: item.id_user,
      id_projeto: item.id_project,
      observacao: item.observacao,
      frequencia: this.mapFrequenciaFromDatabase(item.frequencia) as any,
      dt_lembrete: item.dt_lembrete,
      lt_data: item.lt_data,
      px_data: item.px_data,
    }));
  }

  // Mapear da aplicação (português) para banco de dados (inglês)
  private mapToDatabase(doador: any): any {
    const mapped: any = {
      id_user: doador.id_usuario,
      id_project: doador.id_projeto,
    };
    
    // Adicionar campos opcionais apenas se existirem
    if (doador.observacao !== undefined && doador.observacao !== null) mapped.observacao = doador.observacao;
    if (doador.frequencia !== undefined && doador.frequencia !== null) {
      mapped.frequencia = this.mapFrequenciaToDatabase(doador.frequencia);
    }
    if (doador.dt_lembrete !== undefined && doador.dt_lembrete !== null) mapped.dt_lembrete = doador.dt_lembrete;
    if (doador.lt_data !== undefined && doador.lt_data !== null) mapped.lt_data = doador.lt_data;
    if (doador.px_data !== undefined && doador.px_data !== null) mapped.px_data = doador.px_data;
    
    return mapped;
  }
}

