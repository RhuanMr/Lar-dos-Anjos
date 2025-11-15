import { supabase } from '@/database/supabase';
import { Doacao, DoacaoCreate, DoacaoUpdate } from '@/types/index';

export class DoacaoRepository {
  async findAll(): Promise<Doacao[]> {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .order('data', { ascending: false });

    if (error) throw new Error(error.message);
    return this.mapFromDatabase(data || []);
  }

  async findByProjeto(projetoId: string): Promise<Doacao[]> {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('id_project', projetoId)
      .order('data', { ascending: false });

    if (error) throw new Error(error.message);
    return this.mapFromDatabase(data || []);
  }

  async findByUsuario(usuarioId: string): Promise<Doacao[]> {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('id_user', usuarioId)
      .order('data', { ascending: false });

    if (error) throw new Error(error.message);
    return this.mapFromDatabase(data || []);
  }

  async findById(id: string): Promise<Doacao | null> {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    if (!data) return null;
    const mapped = this.mapFromDatabase([data]);
    return mapped[0] || null;
  }

  async create(doacao: DoacaoCreate): Promise<Doacao> {
    const mappedData = this.mapToDatabase(doacao);
    const { data, error } = await supabase
      .from('donations')
      .insert([mappedData])
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Erro ao criar doação: dados não retornados');
    const mapped = this.mapFromDatabase([data]);
    if (!mapped[0]) throw new Error('Erro ao mapear dados da doação');
    return mapped[0];
  }

  async update(id: string, doacao: DoacaoUpdate): Promise<Doacao> {
    const mappedData = this.mapToDatabase(doacao as any);
    const { data, error } = await supabase
      .from('donations')
      .update(mappedData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Erro ao atualizar doação: dados não retornados');
    const mapped = this.mapFromDatabase([data]);
    if (!mapped[0]) throw new Error('Erro ao mapear dados da doação');
    return mapped[0];
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('donations').delete().eq('id', id);

    if (error) throw new Error(error.message);
  }

  // Mapear tp_ajuda do banco de dados para aplicação
  private mapTpAjudaFromDatabase(value: string | null | undefined): string | undefined {
    if (!value) return undefined;
    // O banco pode usar valores diferentes, então mapeamos
    const mapping: { [key: string]: string } = {
      'FINANCEIRA': 'Financeira',
      'ITENS': 'Itens',
      'OUTRO': 'Outro',
      'Financeira': 'Financeira',
      'Itens': 'Itens',
      'Outro': 'Outro',
      'financeira': 'Financeira',
      'itens': 'Itens',
      'outro': 'Outro',
    };
    return mapping[value] || value;
  }

  // Mapear tp_ajuda da aplicação para banco de dados
  // ⚠️ IMPORTANTE: O enum ajuda_enum no banco provavelmente usa valores em MAIÚSCULAS
  private mapTpAjudaToDatabase(value: string | null | undefined): string | undefined {
    if (!value) return undefined;
    
    // Mapeamento de valores da aplicação para valores do banco (maiúsculas)
    const mapping: Record<string, string> = {
      'Financeira': 'FINANCEIRA',
      'Itens': 'ITENS',
      'Outro': 'OUTRO',
      'FINANCEIRA': 'FINANCEIRA',
      'ITENS': 'ITENS',
      'OUTRO': 'OUTRO',
      'financeira': 'FINANCEIRA',
      'itens': 'ITENS',
      'outro': 'OUTRO',
    };
    
    // Tentar encontrar no mapeamento, senão converter para maiúsculas
    return mapping[value] || value.toUpperCase();
  }

  // Mapear tp_pagamento do banco de dados para aplicação
  private mapTpPagamentoFromDatabase(value: string | null | undefined): string | undefined {
    if (!value) return undefined;
    const mapping: { [key: string]: string } = {
      'PIX': 'Pix',
      'DINHEIRO': 'Dinheiro',
      'TRANSFERENCIA': 'Transferencia',
      'OUTRO': 'Outro',
      'Pix': 'Pix',
      'Dinheiro': 'Dinheiro',
      'Transferencia': 'Transferencia',
      'Outro': 'Outro',
      'pix': 'Pix',
      'dinheiro': 'Dinheiro',
      'transferencia': 'Transferencia',
      'outro': 'Outro',
    };
    return mapping[value] || value;
  }

  // Mapear tp_pagamento da aplicação para banco de dados
  private mapTpPagamentoToDatabase(value: string | null | undefined): string | undefined {
    if (!value) return undefined;
    const mapping: Record<string, string> = {
      'Pix': 'PIX',
      'Dinheiro': 'DINHEIRO',
      'Transferencia': 'TRANSFERENCIA',
      'Outro': 'OUTRO',
      'PIX': 'PIX',
      'DINHEIRO': 'DINHEIRO',
      'TRANSFERENCIA': 'TRANSFERENCIA',
      'OUTRO': 'OUTRO',
      'pix': 'PIX',
      'dinheiro': 'DINHEIRO',
      'transferencia': 'TRANSFERENCIA',
      'outro': 'OUTRO',
    };
    return mapping[value] || value.toUpperCase();
  }

  // Mapear do banco de dados (inglês) para aplicação (português)
  private mapFromDatabase(data: any[]): Doacao[] {
    return data.map((item) => ({
      id: item.id,
      id_user: item.id_user,
      id_project: item.id_project,
      tp_ajuda: this.mapTpAjudaFromDatabase(item.tp_ajuda) as any,
      tp_pagamento: this.mapTpPagamentoFromDatabase(item.tp_pagamento) as any,
      valor: item.valor,
      itens: item.itens,
      data: item.data,
      observacao: item.observacao,
    }));
  }

  // Mapear da aplicação (português) para banco de dados (inglês)
  private mapToDatabase(doacao: any): any {
    const mapped: any = {
      id_user: doacao.id_user,
      id_project: doacao.id_project,
    };
    
    // Adicionar campos opcionais apenas se existirem
    if (doacao.id !== undefined) mapped.id = doacao.id;
    if (doacao.tp_ajuda !== undefined && doacao.tp_ajuda !== null) {
      mapped.tp_ajuda = this.mapTpAjudaToDatabase(doacao.tp_ajuda);
    }
    if (doacao.tp_pagamento !== undefined && doacao.tp_pagamento !== null) {
      mapped.tp_pagamento = this.mapTpPagamentoToDatabase(doacao.tp_pagamento);
    }
    if (doacao.valor !== undefined && doacao.valor !== null) mapped.valor = doacao.valor;
    if (doacao.itens !== undefined && doacao.itens !== null) mapped.itens = doacao.itens;
    if (doacao.data !== undefined && doacao.data !== null) mapped.data = doacao.data;
    if (doacao.observacao !== undefined && doacao.observacao !== null) mapped.observacao = doacao.observacao;
    
    return mapped;
  }
}

