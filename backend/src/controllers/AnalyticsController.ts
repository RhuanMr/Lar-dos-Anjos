import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

export class AnalyticsController {
  // Registrar visita à página de uma organização
  static async registerVisit(req: Request, res: Response): Promise<Response> {
    try {
      const { project_id } = req.params;
      const { page_type = 'profile', user_agent, ip_address } = req.body;

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

      // Registrar visita
      const { data: visit, error } = await supabaseAdmin
        .from('page_visits')
        .insert({
          project_id,
          page_type,
          user_agent: user_agent || req.headers['user-agent'],
          ip_address: ip_address || req.ip || req.connection.remoteAddress,
          user_id: req.user?.id || null,
          visited_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao registrar visita:', error);
        return res.status(400).json({
          success: false,
          error: 'Erro ao registrar visita: ' + error.message
        });
      }

      return res.status(201).json({
        success: true,
        data: visit,
        message: 'Visita registrada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao registrar visita:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Obter estatísticas de visitas de uma organização
  static async getVisitStats(req: Request, res: Response): Promise<Response> {
    try {
      const { project_id } = req.params;
      const { start_date, end_date, period = 'day' } = req.query;

      let query = supabaseAdmin
        .from('page_visits')
        .select('*')
        .eq('project_id', project_id);

      // Aplicar filtros de data
      if (start_date) {
        query = query.gte('visited_at', start_date);
      }
      if (end_date) {
        query = query.lte('visited_at', end_date);
      }

      const { data: visits, error } = await query.order('visited_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar estatísticas de visitas:', error);
        return res.status(500).json({
          success: false,
          error: 'Erro interno do servidor'
        });
      }

      // Processar dados para estatísticas
      const stats = {
        total_visits: visits?.length || 0,
        unique_visitors: 0,
        visits_by_page: {} as Record<string, number>,
        visits_by_period: {} as Record<string, number>,
        recent_visits: [] as any[],
        top_user_agents: {} as Record<string, number>
      };

      const uniqueIPs = new Set<string>();
      const userAgents: Record<string, number> = {};

      visits?.forEach(visit => {
        const pageType = visit.page_type || 'profile';
        const visitDate = visit.visited_at;
        let periodKey = '';

        // Agrupar por período
        switch (period) {
          case 'hour':
            periodKey = visitDate.substring(0, 13); // YYYY-MM-DD HH
            break;
          case 'day':
            periodKey = visitDate.substring(0, 10); // YYYY-MM-DD
            break;
          case 'month':
            periodKey = visitDate.substring(0, 7); // YYYY-MM
            break;
          default:
            periodKey = visitDate.substring(0, 10);
        }

        // Contar visitas por página
        stats.visits_by_page[pageType] = (stats.visits_by_page[pageType] || 0) + 1;

        // Contar visitas por período
        stats.visits_by_period[periodKey] = (stats.visits_by_period[periodKey] || 0) + 1;

        // Contar visitantes únicos (por IP)
        if (visit.ip_address) {
          uniqueIPs.add(visit.ip_address);
        }

        // Contar user agents
        if (visit.user_agent) {
          const ua = visit.user_agent.substring(0, 50); // Truncar para evitar user agents muito longos
          userAgents[ua] = (userAgents[ua] || 0) + 1;
        }
      });

      stats.unique_visitors = uniqueIPs.size;

      // Top 5 user agents
      stats.top_user_agents = Object.fromEntries(
        Object.entries(userAgents)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
      );

      // Últimas 10 visitas
      stats.recent_visits = visits?.slice(0, 10).map(visit => ({
        id: visit.id,
        page_type: visit.page_type,
        visited_at: visit.visited_at,
        user_id: visit.user_id,
        is_authenticated: !!visit.user_id
      })) || [];

      return res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Erro ao gerar estatísticas de visitas:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Obter dashboard analytics completo
  static async getDashboardAnalytics(req: Request, res: Response): Promise<Response> {
    try {
      const { project_id } = req.params;
      const { period = '30' } = req.query; // Últimos N dias

      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - Number(period));
      const startDate = daysAgo.toISOString().split('T')[0];

      // Buscar dados em paralelo
      const [
        visitsResult,
        animalsResult,
        transactionsResult,
        membersResult
      ] = await Promise.all([
        // Visitas
        supabaseAdmin
          .from('page_visits')
          .select('*')
          .eq('project_id', project_id)
          .gte('visited_at', startDate),

        // Animais
        supabaseAdmin
          .from('animal')
          .select('status, created_at')
          .eq('project_id', project_id),

        // Transações financeiras
        supabaseAdmin
          .from('transacao_financeira')
          .select('tipo, valor, data_transacao')
          .eq('project_id', project_id)
          .gte('data_transacao', startDate),

        // Membros
        supabaseAdmin
          .from('organization_members')
          .select('status, joined_at')
          .eq('project_id', project_id)
      ]);

      const analytics = {
        period_days: Number(period),
        visits: {
          total: visitsResult.data?.length || 0,
          unique: new Set(visitsResult.data?.map(v => v.ip_address).filter(Boolean)).size,
          daily_average: 0
        },
        animals: {
          total: animalsResult.data?.length || 0,
          available: animalsResult.data?.filter(a => a.status === 'disponivel').length || 0,
          adopted: animalsResult.data?.filter(a => a.status === 'adotado').length || 0,
          special_care: animalsResult.data?.filter(a => a.status === 'cuidados_especiais').length || 0,
          new_this_period: animalsResult.data?.filter(a => 
            new Date(a.created_at) >= daysAgo
          ).length || 0
        },
        financial: {
          total_income: 0,
          total_expenses: 0,
          balance: 0,
          transactions_count: transactionsResult.data?.length || 0
        },
        members: {
          total: membersResult.data?.length || 0,
          active: membersResult.data?.filter(m => m.status === 'active').length || 0,
          new_this_period: membersResult.data?.filter(m => 
            new Date(m.joined_at) >= daysAgo
          ).length || 0
        },
        growth_metrics: {
          visits_trend: [] as Array<{ date: string; count: number }>,
          adoptions_trend: [] as Array<{ date: string; count: number }>,
          financial_trend: [] as Array<{ date: string; income: number; expenses: number }>
        }
      };

      // Calcular média diária de visitas
      analytics.visits.daily_average = Math.round(analytics.visits.total / Number(period));

      // Calcular totais financeiros
      transactionsResult.data?.forEach(transaction => {
        const valor = Number(transaction.valor);
        if (transaction.tipo === 'entrada') {
          analytics.financial.total_income += valor;
        } else {
          analytics.financial.total_expenses += valor;
        }
      });
      analytics.financial.balance = analytics.financial.total_income - analytics.financial.total_expenses;

      // Gerar tendências diárias (últimos 7 dias para simplificar)
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        // Visitas por dia
        const dailyVisits = visitsResult.data?.filter(v => 
          v.visited_at.startsWith(dateStr)
        ).length || 0;
        analytics.growth_metrics.visits_trend.push({ date: dateStr, count: dailyVisits });

        // Adoções por dia
        const dailyAdoptions = animalsResult.data?.filter(a => 
          a.status === 'adotado' && a.created_at.startsWith(dateStr)
        ).length || 0;
        analytics.growth_metrics.adoptions_trend.push({ date: dateStr, count: dailyAdoptions });

        // Financeiro por dia
        const dailyTransactions = transactionsResult.data?.filter(t => 
          t.data_transacao.startsWith(dateStr)
        ) || [];
        const dailyIncome = dailyTransactions
          .filter(t => t.tipo === 'entrada')
          .reduce((sum, t) => sum + Number(t.valor), 0);
        const dailyExpenses = dailyTransactions
          .filter(t => t.tipo === 'saida')
          .reduce((sum, t) => sum + Number(t.valor), 0);
        analytics.growth_metrics.financial_trend.push({ 
          date: dateStr, 
          income: dailyIncome, 
          expenses: dailyExpenses 
        });
      }

      return res.json({
        success: true,
        data: analytics
      });

    } catch (error) {
      console.error('Erro ao gerar analytics do dashboard:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Obter métricas de adoção
  static async getAdoptionMetrics(req: Request, res: Response): Promise<Response> {
    try {
      const { project_id } = req.params;
      const { year = new Date().getFullYear() } = req.query;

      const { data: animals, error } = await supabaseAdmin
        .from('animal')
        .select('status, especie, created_at, updated_at')
        .eq('project_id', project_id);

      if (error) {
        console.error('Erro ao buscar métricas de adoção:', error);
        return res.status(500).json({
          success: false,
          error: 'Erro interno do servidor'
        });
      }

      const metrics = {
        summary: {
          total_animals: animals?.length || 0,
          available: animals?.filter(a => a.status === 'disponivel').length || 0,
          adopted: animals?.filter(a => a.status === 'adotado').length || 0,
          special_care: animals?.filter(a => a.status === 'cuidados_especiais').length || 0,
          adoption_rate: 0
        },
        by_species: {} as Record<string, {
          total: number;
          available: number;
          adopted: number;
          adoption_rate: number;
        }>,
        by_month: [] as Array<{
          month: string;
          month_name: string;
          available: number;
          adopted: number;
          new_arrivals: number;
        }>
      };

      // Calcular taxa de adoção geral
      if (metrics.summary.total_animals > 0) {
        metrics.summary.adoption_rate = Math.round(
          (metrics.summary.adopted / metrics.summary.total_animals) * 100
        );
      }

      // Processar dados por espécie
      animals?.forEach(animal => {
        const especie = animal.especie;
        if (!metrics.by_species[especie]) {
          metrics.by_species[especie] = {
            total: 0,
            available: 0,
            adopted: 0,
            adoption_rate: 0
          };
        }

        metrics.by_species[especie].total++;
        if (animal.status === 'disponivel') {
          metrics.by_species[especie].available++;
        } else if (animal.status === 'adotado') {
          metrics.by_species[especie].adopted++;
        }
      });

      // Calcular taxa de adoção por espécie
      Object.keys(metrics.by_species).forEach(especie => {
        const data = metrics.by_species[especie];
        if (data.total > 0) {
          data.adoption_rate = Math.round((data.adopted / data.total) * 100);
        }
      });

      // Dados por mês
      const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];

      for (let i = 1; i <= 12; i++) {
        const mes = i.toString().padStart(2, '0');
        const monthKey = `${year}-${mes}`;
        
        const monthAnimals = animals?.filter(a => 
          a.created_at.startsWith(monthKey)
        ) || [];

        metrics.by_month.push({
          month: monthKey,
          month_name: meses[i - 1],
          available: monthAnimals.filter(a => a.status === 'disponivel').length,
          adopted: monthAnimals.filter(a => a.status === 'adotado').length,
          new_arrivals: monthAnimals.length
        });
      }

      return res.json({
        success: true,
        data: metrics
      });

    } catch (error) {
      console.error('Erro ao gerar métricas de adoção:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
}
