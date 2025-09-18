import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';
import { ApiResponse, User } from '../types';

export class AuthController {
  // Login do usuário
  static async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email e senha são obrigatórios'
        });
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return res.status(401).json({
          success: false,
          error: 'Credenciais inválidas'
        });
      }

      // Buscar dados do usuário no banco
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      return res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user: userData,
          session: data.session
        }
      });
    } catch (error) {
      console.error('Erro no login:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Registro de usuário
  static async register(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password, nome, telefone, cpf, role = 'user' } = req.body;

      if (!email || !password || !nome || !cpf) {
        return res.status(400).json({
          success: false,
          error: 'Email, senha, nome e CPF são obrigatórios'
        });
      }

      // Validar CPF
      if (!AuthController.validarCPF(cpf)) {
        return res.status(400).json({
          success: false,
          error: 'CPF inválido'
        });
      }

      // Verificar se usuário já existe
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .or(`email.eq.${email},cpf.eq.${cpf}`)
        .single();

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Usuário já existe com este email ou CPF'
        });
      }

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });

      if (authError) {
        return res.status(400).json({
          success: false,
          error: authError.message
        });
      }

      if (!authData.user) {
        return res.status(400).json({
          success: false,
          error: 'Erro ao criar usuário'
        });
      }

      // Criar usuário no banco de dados
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authData.user.id,
          nome,
          email,
          telefone,
          cpf,
          role
        })
        .select()
        .single();

      if (userError) {
        // Se falhar ao criar no banco, remover do auth
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        return res.status(500).json({
          success: false,
          error: 'Erro ao criar perfil do usuário'
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: {
          user: userData,
          session: authData.session
        }
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Logout do usuário
  static async logout(req: Request, res: Response): Promise<Response> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Erro ao fazer logout'
        });
      }

      return res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      console.error('Erro no logout:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Verificar sessão atual
  static async getCurrentUser(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Token não fornecido'
        });
      }

      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({
          success: false,
          error: 'Token inválido'
        });
      }

      // Buscar dados completos do usuário
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      return res.json({
        success: true,
        data: userData
      });
    } catch (error) {
      console.error('Erro ao verificar usuário atual:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Validar CPF
  private static validarCPF(cpf: string): boolean {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');

    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    // Validação do primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    // Validação do segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;

    return true;
  }
}