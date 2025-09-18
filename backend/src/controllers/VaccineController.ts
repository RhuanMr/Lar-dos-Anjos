import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { Vacine } from '../types';

export class VaccineController {
  // Listar vacinas de um animal
  static async listByAnimal(req: Request, res: Response): Promise<Response> {
    try {
      const { animal_id } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      const { data: vaccines, error, count } = await supabaseAdmin
        .from('vacine')
        .select(`
          *,
          animal:animal_id (
            id,
            nome
          )
        `)
        .eq('animal_id', animal_id)
        .order('data', { ascending: false })
        .range(offset, offset + Number(limit) - 1);

      if (error) {
        console.error('Erro ao listar vacinas:', error);
        return res.status(500).json({
          success: false,
          error: 'Erro interno do servidor'
        });
      }

      return res.json({
        success: true,
        data: {
          vaccines: vaccines || [],
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: count || 0,
            totalPages: Math.ceil((count || 0) / Number(limit))
          }
        }
      });

    } catch (error) {
      console.error('Erro ao listar vacinas:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Buscar vacina por ID
  static async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const { data: vaccine, error } = await supabaseAdmin
        .from('vacine')
        .select(`
          *,
          animal:animal_id (
            id,
            nome,
            especie
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            success: false,
            error: 'Vacina não encontrada'
          });
        }
        console.error('Erro ao buscar vacina:', error);
        return res.status(500).json({
          success: false,
          error: 'Erro interno do servidor'
        });
      }

      return res.json({
        success: true,
        data: vaccine
      });

    } catch (error) {
      console.error('Erro ao buscar vacina:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Adicionar nova vacina
  static async create(req: Request, res: Response): Promise<Response> {
    try {
      const { animal_id, nome, data, dose, observacoes } = req.body;

      // Verificar se o animal existe
      const { data: animal, error: animalError } = await supabaseAdmin
        .from('animal')
        .select('id, nome')
        .eq('id', animal_id)
        .single();

      if (animalError || !animal) {
        return res.status(404).json({
          success: false,
          error: 'Animal não encontrado'
        });
      }

      // Criar vacina
      const { data: vaccine, error } = await supabaseAdmin
        .from('vacine')
        .insert({
          animal_id,
          nome,
          data,
          dose: dose || 1,
          observacoes
        })
        .select(`
          *,
          animal:animal_id (
            id,
            nome
          )
        `)
        .single();

      if (error) {
        console.error('Erro ao criar vacina:', error);
        return res.status(400).json({
          success: false,
          error: 'Erro ao registrar vacina: ' + error.message
        });
      }

      // Registrar no histórico do animal
      await supabaseAdmin
        .from('animal_history')
        .insert({
          animal_id: animal_id,
          action: 'vaccine_added',
          description: `Vacina ${nome} (dose ${dose || 1}) aplicada em ${animal.nome}`,
          user_id: req.user?.id,
          data: {
            vaccine_name: nome,
            dose: dose || 1,
            date: data,
            observacoes
          }
        });

      return res.status(201).json({
        success: true,
        data: vaccine,
        message: 'Vacina registrada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao criar vacina:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar vacina
  static async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Buscar vacina atual para comparação
      const { data: currentVaccine, error: currentError } = await supabaseAdmin
        .from('vacine')
        .select('*')
        .eq('id', id)
        .single();

      if (currentError) {
        return res.status(404).json({
          success: false,
          error: 'Vacina não encontrada'
        });
      }

      // Atualizar vacina
      const { data: vaccine, error } = await supabaseAdmin
        .from('vacine')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          animal:animal_id (
            id,
            nome
          )
        `)
        .single();

      if (error) {
        console.error('Erro ao atualizar vacina:', error);
        return res.status(400).json({
          success: false,
          error: 'Erro ao atualizar vacina: ' + error.message
        });
      }

      // Registrar alterações no histórico
      const changes: string[] = [];
      Object.keys(updateData).forEach(key => {
        if (currentVaccine[key] !== updateData[key]) {
          changes.push(`${key}: ${currentVaccine[key]} → ${updateData[key]}`);
        }
      });

      if (changes.length > 0) {
        await supabaseAdmin
          .from('animal_history')
          .insert({
            animal_id: vaccine.animal_id,
            action: 'vaccine_updated',
            description: `Informações da vacina ${vaccine.nome} foram atualizadas`,
            user_id: req.user?.id,
            data: {
              vaccine_id: vaccine.id,
              changes,
              previous: currentVaccine,
              updated: updateData
            }
          });
      }

      return res.json({
        success: true,
        data: vaccine,
        message: 'Vacina atualizada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao atualizar vacina:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Deletar vacina
  static async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      // Buscar vacina para registrar no histórico
      const { data: vaccine, error: vaccineError } = await supabaseAdmin
        .from('vacine')
        .select(`
          *,
          animal:animal_id (
            nome
          )
        `)
        .eq('id', id)
        .single();

      if (vaccineError) {
        return res.status(404).json({
          success: false,
          error: 'Vacina não encontrada'
        });
      }

      // Deletar vacina
      const { error } = await supabaseAdmin
        .from('vacine')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar vacina:', error);
        return res.status(400).json({
          success: false,
          error: 'Erro ao deletar vacina: ' + error.message
        });
      }

      // Registrar no histórico
      await supabaseAdmin
        .from('animal_history')
        .insert({
          animal_id: vaccine.animal_id,
          action: 'vaccine_deleted',
          description: `Vacina ${vaccine.nome} foi removida do histórico`,
          user_id: req.user?.id,
          data: {
            vaccine_name: vaccine.nome,
            dose: vaccine.dose,
            date: vaccine.data,
            deleted_at: new Date().toISOString()
          }
        });

      return res.json({
        success: true,
        message: 'Vacina removida com sucesso'
      });

    } catch (error) {
      console.error('Erro ao deletar vacina:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Obter relatório de vacinação de uma organização
  static async getVaccinationReport(req: Request, res: Response): Promise<Response> {
    try {
      const { project_id } = req.params;
      const { start_date, end_date } = req.query;

      let query = supabaseAdmin
        .from('vacine')
        .select(`
          *,
          animal:animal_id (
            id,
            nome,
            especie,
            project_id
          )
        `)
        .eq('animal.project_id', project_id)
        .order('data', { ascending: false });

      // Aplicar filtros de data se fornecidos
      if (start_date) {
        query = query.gte('data', start_date);
      }
      if (end_date) {
        query = query.lte('data', end_date);
      }

      const { data: vaccines, error } = await query;

      if (error) {
        console.error('Erro ao buscar relatório de vacinação:', error);
        return res.status(500).json({
          success: false,
          error: 'Erro interno do servidor'
        });
      }

      // Processar dados para relatório
      const vaccinesByType = vaccines?.reduce((acc, vaccine) => {
        if (!acc[vaccine.nome]) {
          acc[vaccine.nome] = {
            name: vaccine.nome,
            count: 0,
            animals: []
          };
        }
        acc[vaccine.nome].count++;
        acc[vaccine.nome].animals.push({
          animal_id: vaccine.animal.id,
          animal_name: vaccine.animal.nome,
          date: vaccine.data,
          dose: vaccine.dose
        });
        return acc;
      }, {} as Record<string, any>) || {};

      const totalVaccines = vaccines?.length || 0;
      const uniqueAnimals = new Set(vaccines?.map(v => v.animal_id)).size;

      return res.json({
        success: true,
        data: {
          total_vaccines: totalVaccines,
          unique_animals_vaccinated: uniqueAnimals,
          vaccines_by_type: Object.values(vaccinesByType),
          period: {
            start_date: start_date || null,
            end_date: end_date || null
          }
        }
      });

    } catch (error) {
      console.error('Erro ao gerar relatório de vacinação:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Obter vacinas próximas do vencimento (para doses de reforço)
  static async getUpcomingVaccines(req: Request, res: Response): Promise<Response> {
    try {
      const { project_id } = req.params;
      const { days = 30 } = req.query; // Próximas vacinas nos próximos N dias

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + Number(days));

      // Buscar animais da organização que precisam de vacinas de reforço
      const { data: vaccines, error } = await supabaseAdmin
        .from('vacine')
        .select(`
          *,
          animal:animal_id (
            id,
            nome,
            especie,
            project_id
          )
        `)
        .eq('animal.project_id', project_id)
        .lte('data', futureDate.toISOString().split('T')[0])
        .order('data', { ascending: true });

      if (error) {
        console.error('Erro ao buscar vacinas próximas:', error);
        return res.status(500).json({
          success: false,
          error: 'Erro interno do servidor'
        });
      }

      // Agrupar por tipo de vacina e animal para identificar reforços necessários
      const upcomingVaccines = vaccines?.filter(vaccine => {
        const vaccineDate = new Date(vaccine.data);
        const now = new Date();
        const monthsAgo = (now.getTime() - vaccineDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        
        // Considerar vacinas que precisam de reforço (exemplo: a cada 12 meses)
        return monthsAgo >= 11 && monthsAgo <= 13;
      }) || [];

      return res.json({
        success: true,
        data: {
          upcoming_vaccines: upcomingVaccines,
          count: upcomingVaccines.length,
          period_days: Number(days)
        }
      });

    } catch (error) {
      console.error('Erro ao buscar vacinas próximas:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
}
