import { supabase } from '@/database/supabase';
import { Usuario, UsuarioCreate, UsuarioUpdate } from '@/types/index';

export class UsuarioRepository {
  async findAll(): Promise<Usuario[]> {
    try {
      console.log('Buscando usuários na tabela users...');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(1000); // Limitar para evitar problemas com muitos dados

      if (error) {
        console.error('Erro detalhado ao buscar usuários no Supabase:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          status: (error as any).status,
        });

        // Se for erro de permissão/RLS, sugerir usar SERVICE_ROLE_KEY
        if (
          error.message.includes('permission') ||
          error.message.includes('RLS') ||
          error.message.includes('policy') ||
          error.code === '42501' ||
          error.code === 'PGRST301'
        ) {
          throw new Error(
            `Erro de permissão ao acessar tabela users. Verifique se SUPABASE_SERVICE_ROLE_KEY está configurada no .env do backend. Erro: ${error.message}`
          );
        }

        throw new Error(
          `Erro ao buscar usuários: ${error.message}${error.code ? ` (código: ${error.code})` : ''}`
        );
      }

      console.log(`✓ ${data?.length || 0} usuários encontrados`);

      // Ordenar manualmente no código se necessário
      const usuarios = (data || []).sort((a, b) => {
        const nomeA = (a.nome || '').trim();
        const nomeB = (b.nome || '').trim();
        return nomeA.localeCompare(nomeB, 'pt-BR');
      });

      return usuarios;
    } catch (err) {
      console.error('Erro no findAll do UsuarioRepository:', err);
      throw err;
    }
  }

  async findById(id: string): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data || null;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data || null;
  }

  async findByCpf(cpf: string): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('cpf', cpf)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data || null;
  }

  async create(usuario: UsuarioCreate): Promise<Usuario> {
    const { data, error } = await supabase
      .from('users')
      .insert([usuario])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, usuario: UsuarioUpdate): Promise<Usuario> {
    const { data, error } = await supabase
      .from('users')
      .update(usuario)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('users').delete().eq('id', id);

    if (error) throw new Error(error.message);
  }

  async countSuperAdmins(): Promise<number> {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .contains('roles', '["SUPERADMIN"]');

    if (error) throw new Error(error.message);
    return count || 0;
  }
}
