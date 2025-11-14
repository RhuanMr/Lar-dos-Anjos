import { supabase } from '@/database/supabase';
import {
  Funcionario,
  FuncionarioCreate,
  FuncionarioUpdate,
} from '@/types/index';

export class FuncionarioRepository {
  // ⚠️ IMPORTANTE: 
  // - O nome da tabela no banco de dados é 'employees' (inglês), não 'funcionarios' (português)
  // - Os nomes das colunas no banco são: id_user, id_project (inglês)
  // - A aplicação usa: id_usuario, id_projeto (português)
  private readonly TABLE_NAME = 'employees';

  // Mapear dados do banco para a aplicação
  private mapFromDatabase(data: any): Funcionario {
    return {
      id_usuario: data.id_user,
      id_projeto: data.id_project,
      privilegios: data.privilegios,
      funcao: data.funcao,
      observacao: data.observacao,
    };
  }

  // Mapear dados da aplicação para o banco
  private mapToDatabase(data: FuncionarioCreate | FuncionarioUpdate): any {
    const mapped: any = {};
    if ('id_usuario' in data) mapped.id_user = data.id_usuario;
    if ('id_projeto' in data) mapped.id_project = data.id_projeto;
    if ('privilegios' in data && data.privilegios !== undefined) mapped.privilegios = data.privilegios;
    if ('funcao' in data && data.funcao !== undefined) mapped.funcao = data.funcao;
    if ('observacao' in data && data.observacao !== undefined) mapped.observacao = data.observacao;
    return mapped;
  }

  async findAll(): Promise<Funcionario[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .order('id_user', { ascending: true });

    if (error) throw new Error(error.message);
    return (data || []).map(this.mapFromDatabase);
  }

  async findByProjeto(projetoId: string): Promise<Funcionario[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('id_project', projetoId);

    if (error) throw new Error(error.message);
    return (data || []).map(this.mapFromDatabase);
  }

  async findByUsuario(usuarioId: string): Promise<Funcionario[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('id_user', usuarioId);

    if (error) throw new Error(error.message);
    return (data || []).map(this.mapFromDatabase);
  }

  async findByUsuarioAndProjeto(
    usuarioId: string,
    projetoId: string
  ): Promise<Funcionario | null> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('id_user', usuarioId)
      .eq('id_project', projetoId)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data ? this.mapFromDatabase(data) : null;
  }

  async create(funcionario: FuncionarioCreate): Promise<Funcionario> {
    // Verificar se já existe
    const existente = await this.findByUsuarioAndProjeto(
      funcionario.id_usuario,
      funcionario.id_projeto
    );
    if (existente) {
      throw new Error(
        'Usuário já está cadastrado como funcionário neste projeto'
      );
    }

    const dados: FuncionarioCreate = {
      ...funcionario,
      privilegios: funcionario.privilegios ?? false,
    };

    const mappedData = this.mapToDatabase(dados);
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .insert([mappedData])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapFromDatabase(data);
  }

  async update(
    usuarioId: string,
    projetoId: string,
    funcionario: FuncionarioUpdate
  ): Promise<Funcionario> {
    const mappedData = this.mapToDatabase(funcionario);
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .update(mappedData)
      .eq('id_user', usuarioId)
      .eq('id_project', projetoId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapFromDatabase(data);
  }

  async delete(usuarioId: string, projetoId: string): Promise<void> {
    const { error } = await supabase
      .from(this.TABLE_NAME)
      .delete()
      .eq('id_user', usuarioId)
      .eq('id_project', projetoId);

    if (error) throw new Error(error.message);
  }
}

