import { supabase } from '@/database/supabase';
import { Usuario, UsuarioUpdate } from '@/types/index';
import { EnderecoRepository } from './EnderecoRepository';

export class UsuarioRepository {
  private enderecoRepository = new EnderecoRepository();

  /**
   * Verifica se um usuário é um doador anônimo
   * Doadores anônimos são identificados por:
   * - nome = 'Doação Anônima'
   * - email que começa com 'anonimo_' e termina com '@temp.com'
   * - cpf = '00000000000'
   */
  private isDoadorAnonimo(usuario: any): boolean {
    const nomeAnonimo = usuario.nome === 'Doação Anônima';
    const emailAnonimo = usuario.email?.startsWith('anonimo_') && usuario.email?.endsWith('@temp.com');
    const cpfAnonimo = usuario.cpf === '00000000000';
    
    return nomeAnonimo || emailAnonimo || cpfAnonimo;
  }

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

      // Buscar endereços para todos os usuários que têm endereco_id
      const usuariosComEndereco = await Promise.all(
        (data || []).map(async (usuario: any) => {
          if (usuario.endereco_id) {
            try {
              const endereco = await this.enderecoRepository.findById(usuario.endereco_id);
              if (endereco) {
                usuario.endereco = endereco.endereco || undefined;
                usuario.numero = endereco.numero || undefined;
                usuario.complemento = endereco.complemento || undefined;
                usuario.bairro = endereco.bairro || undefined;
                usuario.cidade = endereco.cidade || undefined;
                usuario.uf = endereco.estado || undefined;
                usuario.cep = endereco.cep || undefined;
              }
            } catch (err) {
              console.warn(`Erro ao buscar endereço ${usuario.endereco_id} para usuário ${usuario.id}:`, err);
            }
          }
          return usuario;
        })
      );

      // Filtrar doadores anônimos da lista
      const usuariosFiltrados = usuariosComEndereco.filter(
        (usuario) => !this.isDoadorAnonimo(usuario)
      );

      // Ordenar manualmente no código se necessário
      usuariosFiltrados.sort((a, b) => {
        const nomeA = (a.nome || '').trim();
        const nomeB = (b.nome || '').trim();
        return nomeA.localeCompare(nomeB, 'pt-BR');
      });

      console.log(`✓ ${usuariosFiltrados.length} usuários retornados (${usuariosComEndereco.length - usuariosFiltrados.length} doadores anônimos filtrados)`);

      return usuariosFiltrados as Usuario[];
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
    if (!data) return null;

    // Buscar endereço se houver endereco_id
    const usuario = { ...data };
    if (data.endereco_id) {
      try {
        const endereco = await this.enderecoRepository.findById(data.endereco_id);
        if (endereco) {
          usuario.endereco = endereco.endereco || undefined;
          usuario.numero = endereco.numero || undefined;
          usuario.complemento = endereco.complemento || undefined;
          usuario.bairro = endereco.bairro || undefined;
          usuario.cidade = endereco.cidade || undefined;
          usuario.uf = endereco.estado || undefined;
          usuario.cep = endereco.cep || undefined;
        }
      } catch (err) {
        console.warn(`Erro ao buscar endereço ${data.endereco_id} para usuário ${id}:`, err);
      }
    }

    return usuario as Usuario;
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

  async create(usuario: any): Promise<Usuario> {
    // Filtrar campos de endereço que não existem na tabela users
    // mas manter endereco_id se existir
    const camposValidos: any = {};
    
    // Campos permitidos na tabela users
    const camposPermitidos = [
      'id', 'nome', 'email', 'cpf', 'telefone', 
      'foto', 'instagram', 'endereco_id', 'roles', 'ativo',
      'senha_hash', 'criado_em', 'atualizado_em'
    ];
    
    // Copiar apenas campos permitidos
    for (const campo of camposPermitidos) {
      if (campo in usuario && usuario[campo] !== undefined) {
        // Para CPF, permitir string vazia ou null também
        if (campo === 'cpf' && (usuario[campo] === '' || usuario[campo] === null)) {
          camposValidos[campo] = null;
        } else {
          camposValidos[campo] = usuario[campo];
        }
      }
    }
    
    // Se CPF não foi fornecido, não incluir no insert (será NULL no banco após alterar constraint)
    // Não precisamos definir explicitamente como null aqui, pois o banco permitirá NULL após a migração
    
    const { data, error } = await supabase
      .from('users')
      .insert([camposValidos])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, usuario: UsuarioUpdate | any): Promise<Usuario> {
    // Filtrar campos de endereço que não existem na tabela users
    // mas manter endereco_id se existir
    const camposValidos: any = {};
    
    // Campos permitidos na tabela users para atualização
    const camposPermitidos = [
      'nome', 'email', 'cpf', 'telefone', 
      'foto', 'instagram', 'endereco_id', 'roles', 'ativo',
      'senha_hash', 'atualizado_em'
    ];
    
    // Copiar apenas campos permitidos
    for (const campo of camposPermitidos) {
      if (campo in usuario && usuario[campo] !== undefined) {
        camposValidos[campo] = usuario[campo];
      }
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(camposValidos)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Usuário não encontrado após atualização');

    // Buscar endereço se houver endereco_id
    const usuarioAtualizado = { ...data };
    if (data.endereco_id) {
      try {
        const endereco = await this.enderecoRepository.findById(data.endereco_id);
        if (endereco) {
          usuarioAtualizado.endereco = endereco.endereco || undefined;
          usuarioAtualizado.numero = endereco.numero || undefined;
          usuarioAtualizado.complemento = endereco.complemento || undefined;
          usuarioAtualizado.bairro = endereco.bairro || undefined;
          usuarioAtualizado.cidade = endereco.cidade || undefined;
          usuarioAtualizado.uf = endereco.estado || undefined;
          usuarioAtualizado.cep = endereco.cep || undefined;
        }
      } catch (err) {
        console.warn(`Erro ao buscar endereço ${data.endereco_id} para usuário ${id}:`, err);
      }
    }

    return usuarioAtualizado as Usuario;
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
