import { supabase } from '@/database/supabase';
import {
  AtualizacaoAdocao,
  AtualizacaoAdocaoCreate,
  AtualizacaoAdocaoUpdate,
} from '@/types/index';
import { StatusAdocaoEnum } from '@/types/enums';

export class AtualizacaoAdocaoRepository {
  // ⚠️ IMPORTANTE: 
  // - O nome da tabela no banco de dados é 'updates' (inglês)
  // - Os nomes das colunas no banco são: adoption_id, responsavel (inglês)
  // - A aplicação usa: id_adocao, id_responsavel (português)
  private readonly TABLE_NAME = 'updates';

  // Mapear valores de status do banco para a aplicação
  // ⚠️ IMPORTANTE: O enum status_enum no banco usa valores em MAIÚSCULAS
  private mapStatusFromDatabase(status?: string): StatusAdocaoEnum | undefined {
    if (!status) return undefined;
    
    // Mapeamento de valores do banco (maiúsculas) para valores da aplicação (minúsculas)
    const statusMap: Record<string, StatusAdocaoEnum> = {
      'OK': StatusAdocaoEnum.OK,
      'PENDENTE': StatusAdocaoEnum.PENDENTE,
      'VISITA_AGENDADA': StatusAdocaoEnum.VISITA_AGENDADA,
      'SEM_RESPOSTA': StatusAdocaoEnum.SEM_RESPOSTA,
    };
    
    return statusMap[status] || undefined;
  }

  // Mapear dados do banco para a aplicação
  private mapFromDatabase(data: any): AtualizacaoAdocao {
    const mappedStatus = this.mapStatusFromDatabase(data.status);
    const result: AtualizacaoAdocao = {
      id: data.id,
      id_adocao: data.adoption_id,
      id_responsavel: data.responsavel, // Se responsavel for UUID, manter como string
      prox_dt: data.prox_dt,
      observacao: data.observacao,
    };
    
    // Adicionar status apenas se não for undefined (para compatibilidade com exactOptionalPropertyTypes)
    if (mappedStatus !== undefined) {
      result.status = mappedStatus;
    }
    
    return result;
  }

  // Mapear valores de status da aplicação para o banco
  // ⚠️ IMPORTANTE: O enum status_enum no banco usa valores em MAIÚSCULAS
  private mapStatusToDatabase(status?: string): string | undefined {
    if (!status) return undefined;
    
    // Mapeamento de valores da aplicação (minúsculas) para valores do banco (maiúsculas)
    const statusMap: Record<string, string> = {
      'ok': 'OK',
      'pendente': 'PENDENTE',
      'visita_agendada': 'VISITA_AGENDADA',
      'sem_resposta': 'SEM_RESPOSTA',
    };
    
    return statusMap[status] || status.toUpperCase();
  }

  // Mapear dados da aplicação para o banco
  private mapToDatabase(data: AtualizacaoAdocaoCreate | AtualizacaoAdocaoUpdate): any {
    const mapped: any = {};
    if ('id_adocao' in data) mapped.adoption_id = data.id_adocao;
    if ('id_responsavel' in data) mapped.responsavel = data.id_responsavel;
    if ('prox_dt' in data && data.prox_dt !== undefined) mapped.prox_dt = data.prox_dt;
    if ('status' in data && data.status !== undefined) {
      mapped.status = this.mapStatusToDatabase(data.status);
    }
    if ('observacao' in data && data.observacao !== undefined) mapped.observacao = data.observacao;
    return mapped;
  }

  async findAll(): Promise<AtualizacaoAdocao[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .order('id', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(item => this.mapFromDatabase(item));
  }

  async findByAdocao(adocaoId: string): Promise<AtualizacaoAdocao[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('adoption_id', adocaoId)
      .order('id', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(item => this.mapFromDatabase(item));
  }

  async findById(id: string): Promise<AtualizacaoAdocao | null> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data ? this.mapFromDatabase(data) : null;
  }

  async create(
    atualizacao: AtualizacaoAdocaoCreate
  ): Promise<AtualizacaoAdocao> {
    const mappedData = this.mapToDatabase(atualizacao);
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .insert([mappedData])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapFromDatabase(data);
  }

  async update(
    id: string,
    atualizacao: AtualizacaoAdocaoUpdate
  ): Promise<AtualizacaoAdocao> {
    const mappedData = this.mapToDatabase(atualizacao);
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
    const { error } = await supabase
      .from(this.TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
}

