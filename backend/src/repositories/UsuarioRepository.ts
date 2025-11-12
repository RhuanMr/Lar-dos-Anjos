import { supabase } from '@/database/supabase';
import { Usuario, UsuarioCreate, UsuarioUpdate } from '@/types/index';

export class UsuarioRepository {
  async findAll(): Promise<Usuario[]> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findById(id: string): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data || null;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data || null;
  }

  async findByCpf(cpf: string): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('cpf', cpf)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data || null;
  }

  async create(usuario: UsuarioCreate): Promise<Usuario> {
    const { data, error } = await supabase
      .from('usuarios')
      .insert([usuario])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, usuario: UsuarioUpdate): Promise<Usuario> {
    const { data, error } = await supabase
      .from('usuarios')
      .update(usuario)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('usuarios').delete().eq('id', id);

    if (error) throw new Error(error.message);
  }

  async countSuperAdmins(): Promise<number> {
    const { count, error } = await supabase
      .from('usuarios')
      .select('*', { count: 'exact', head: true })
      .contains('roles', '["SuperAdmin"]');

    if (error) throw new Error(error.message);
    return count || 0;
  }
}
