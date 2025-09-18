import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { TransacaoFinanceira } from '../types';

export class FinancialController {
  // Listar transações financeiras de uma organização
  static async list(req: Request, res: Response): Promise<Response> {
    try {
      const { project_id } = req.params;
      const { 
        tipo, 
        categoria, 
        start_date, 
        end_date, 
        page = 1, 
        limit = 20 
      } = req.query;

      let query = supabaseAdmin
        .from('transacao_financeira')
        .select('*')
        .eq('project_id', project_id)
        .order('data_transacao', { ascending: false });

      // Aplicar filtros
      if (tipo && tipo !== 'all') {
        query = query.eq('tipo', tipo);
      }

      if (categoria && categoria !== 'all') {
        query = query.eq('categoria', categoria);
      }

      if (start_date) {
        query = query.gte('data_transacao', start_date);
      }

      if (end_date) {
        query = query.lte('data_transacao', end_date);
      }

      // Paginação
      const offset = (Number(page) - 1) * Number(limit);
      query = query.range(offset, offset + Number(limit) - 1);

      const { data: transactions, error, count } = await query;

      if (error) {
        console.error('Erro ao listar transações:', error);
        return res.status(500).json({
          success: false,
          error: 'Erro interno do servidor'
        });
      }

      return res.json({
        success: true,
        data: {
          transactions: transactions || [],
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: count || 0,
            totalPages: Math.ceil((count || 0) / Number(limit))
          }
        }
      });

    } catch (error) {
      console.error('Erro ao listar transações:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Buscar transação por ID
  static async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const { data: transaction, error } = await supabaseAdmin
        .from('transacao_financeira')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            success: false,
            error: 'Transação não encontrada'
          });
        }
        console.error('Erro ao buscar transação:', error);
        return res.status(500).json({
          success: false,
          error: 'Erro interno do servidor'
        });
      }

      return res.json({
        success: true,
        data: transaction
      });

    } catch (error) {
      console.error('Erro ao buscar transação:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Criar nova transação
  static async create(req: Request, res: Response): Promise<Response> {
    try {
      const { project_id, tipo, categoria, valor, descricao, data_transacao } = req.body;

      // Validações básicas
      if (!project_id || !tipo || !categoria || !valor || !data_transacao) {
        return res.status(400).json({
          success: false,
          error: 'Projeto, tipo, categoria, valor e data são obrigatórios'
        });
      }

      if (valor <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Valor deve ser maior que zero'
        });
      }

      // Verificar se a organização existe
      const { data: project, error: projectError } = await supabaseAdmin
        .from('project')
        .select('id')
        .eq('id', project_id)
        .single();

      if (projectError || !project) {
        return res.status(404).json({
          success: false,
          error: 'Organização não encontrada'
        });
      }

      // Criar transação
      const { data: transaction, error } = await supabaseAdmin
        .from('transacao_financeira')
        .insert({
          project_id,
          tipo,
          categoria,
          valor: Number(valor),
          descricao,
          data_transacao
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar transação:', error);
        return res.status(400).json({
          success: false,
          error: 'Erro ao criar transação: ' + error.message
        });
      }

      return res.status(201).json({
        success: true,
        data: transaction,
        message: 'Transação criada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao criar transação:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar transação
  static async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Validar valor se fornecido
      if (updateData.valor && updateData.valor <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Valor deve ser maior que zero'
        });
      }

      // Converter valor para número se fornecido
      if (updateData.valor) {
        updateData.valor = Number(updateData.valor);
      }

      const { data: transaction, error } = await supabaseAdmin
        .from('transacao_financeira')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            success: false,
            error: 'Transação não encontrada'
          });
        }
        console.error('Erro ao atualizar transação:', error);
        return res.status(400).json({
          success: false,
          error: 'Erro ao atualizar transação: ' + error.message
        });
      }

      return res.json({
        success: true,
        data: transaction,
        message: 'Transação atualizada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Deletar transação
  static async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const { error } = await supabaseAdmin
        .from('transacao_financeira')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar transação:', error);
        return res.status(400).json({
          success: false,
          error: 'Erro ao deletar transação: ' + error.message
        });
      }

      return res.json({
        success: true,
        message: 'Transação deletada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Obter resumo financeiro de uma organização
  static async getSummary(req: Request, res: Response): Promise<Response> {
    try {
      const { project_id } = req.params;
      const { start_date, end_date, period = 'month' } = req.query;

      let query = supabaseAdmin
        .from('transacao_financeira')
        .select('tipo, categoria, valor, data_transacao')
        .eq('project_id', project_id);

      // Aplicar filtros de data
      if (start_date) {
        query = query.gte('data_transacao', start_date);
      }
      if (end_date) {
        query = query.lte('data_transacao', end_date);
      }

      const { data: transactions, error } = await query;

      if (error) {
        console.error('Erro ao buscar resumo financeiro:', error);
        return res.status(500).json({
          success: false,
          error: 'Erro interno do servidor'
        });
      }

      // Processar dados para resumo
      const summary = {
        total_entradas: 0,
        total_saidas: 0,
        saldo: 0,
        entradas_por_categoria: {} as Record<string, number>,
        saidas_por_categoria: {} as Record<string, number>,
        transacoes_por_mes: {} as Record<string, { entradas: number; saidas: number; saldo: number }>,
        total_transacoes: transactions?.length || 0
      };

      transactions?.forEach(transaction => {
        const valor = Number(transaction.valor);
        const categoria = transaction.categoria;
        const mes = transaction.data_transacao.substring(0, 7); // YYYY-MM

        if (transaction.tipo === 'entrada') {
          summary.total_entradas += valor;
          summary.entradas_por_categoria[categoria] = (summary.entradas_por_categoria[categoria] || 0) + valor;
        } else {
          summary.total_saidas += valor;
          summary.saidas_por_categoria[categoria] = (summary.saidas_por_categoria[categoria] || 0) + valor;
        }

        // Agrupar por mês
        if (!summary.transacoes_por_mes[mes]) {
          summary.transacoes_por_mes[mes] = { entradas: 0, saidas: 0, saldo: 0 };
        }

        if (transaction.tipo === 'entrada') {
          summary.transacoes_por_mes[mes].entradas += valor;
        } else {
          summary.transacoes_por_mes[mes].saidas += valor;
        }

        summary.transacoes_por_mes[mes].saldo = 
          summary.transacoes_por_mes[mes].entradas - summary.transacoes_por_mes[mes].saidas;
      });

      summary.saldo = summary.total_entradas - summary.total_saidas;

      return res.json({
        success: true,
        data: summary
      });

    } catch (error) {
      console.error('Erro ao gerar resumo financeiro:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Obter estatísticas financeiras detalhadas
  static async getStats(req: Request, res: Response): Promise<Response> {
    try {
      const { project_id } = req.params;
      const { year = new Date().getFullYear() } = req.query;

      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const { data: transactions, error } = await supabaseAdmin
        .from('transacao_financeira')
        .select('*')
        .eq('project_id', project_id)
        .gte('data_transacao', startDate)
        .lte('data_transacao', endDate);

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return res.status(500).json({
          success: false,
          error: 'Erro interno do servidor'
        });
      }

      // Processar dados para estatísticas detalhadas
      const stats = {
        resumo_anual: {
          total_entradas: 0,
          total_saidas: 0,
          saldo: 0,
          numero_transacoes: transactions?.length || 0
        },
        por_categoria: {
          entradas: {} as Record<string, { valor: number; count: number; percentual: number }>,
          saidas: {} as Record<string, { valor: number; count: number; percentual: number }>
        },
        por_mes: [] as Array<{
          mes: string;
          nome_mes: string;
          entradas: number;
          saidas: number;
          saldo: number;
          transacoes: number;
        }>,
        maiores_entradas: [] as TransacaoFinanceira[],
        maiores_saidas: [] as TransacaoFinanceira[]
      };

      const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];

      // Inicializar dados por mês
      for (let i = 1; i <= 12; i++) {
        const mes = i.toString().padStart(2, '0');
        stats.por_mes.push({
          mes: `${year}-${mes}`,
          nome_mes: meses[i - 1],
          entradas: 0,
          saidas: 0,
          saldo: 0,
          transacoes: 0
        });
      }

      transactions?.forEach(transaction => {
        const valor = Number(transaction.valor);
        const categoria = transaction.categoria;
        const tipo = transaction.tipo;
        const mes = transaction.data_transacao.substring(0, 7); // YYYY-MM
        const mesIndex = parseInt(transaction.data_transacao.substring(5, 7)) - 1;

        // Resumo anual
        if (tipo === 'entrada') {
          stats.resumo_anual.total_entradas += valor;
        } else {
          stats.resumo_anual.total_saidas += valor;
        }

        // Por categoria
        if (!stats.por_categoria[tipo][categoria]) {
          stats.por_categoria[tipo][categoria] = { valor: 0, count: 0, percentual: 0 };
        }
        stats.por_categoria[tipo][categoria].valor += valor;
        stats.por_categoria[tipo][categoria].count += 1;

        // Por mês
        if (mesIndex >= 0 && mesIndex < 12) {
          stats.por_mes[mesIndex].transacoes += 1;
          if (tipo === 'entrada') {
            stats.por_mes[mesIndex].entradas += valor;
          } else {
            stats.por_mes[mesIndex].saidas += valor;
          }
          stats.por_mes[mesIndex].saldo = stats.por_mes[mesIndex].entradas - stats.por_mes[mesIndex].saidas;
        }
      });

      // Calcular saldo total
      stats.resumo_anual.saldo = stats.resumo_anual.total_entradas - stats.resumo_anual.total_saidas;

      // Calcular percentuais por categoria
      Object.keys(stats.por_categoria.entradas).forEach(categoria => {
        const valor = stats.por_categoria.entradas[categoria].valor;
        stats.por_categoria.entradas[categoria].percentual = 
          stats.resumo_anual.total_entradas > 0 
            ? Math.round((valor / stats.resumo_anual.total_entradas) * 100) 
            : 0;
      });

      Object.keys(stats.por_categoria.saidas).forEach(categoria => {
        const valor = stats.por_categoria.saidas[categoria].valor;
        stats.por_categoria.saidas[categoria].percentual = 
          stats.resumo_anual.total_saidas > 0 
            ? Math.round((valor / stats.resumo_anual.total_saidas) * 100) 
            : 0;
      });

      // Maiores transações (top 5)
      const sortedTransactions = transactions?.sort((a, b) => Number(b.valor) - Number(a.valor)) || [];
      stats.maiores_entradas = sortedTransactions
        .filter(t => t.tipo === 'entrada')
        .slice(0, 5);
      stats.maiores_saidas = sortedTransactions
        .filter(t => t.tipo === 'saida')
        .slice(0, 5);

      return res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Erro ao gerar estatísticas:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
}
