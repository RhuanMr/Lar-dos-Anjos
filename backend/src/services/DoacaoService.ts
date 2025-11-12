import { DoacaoRepository } from '@/repositories/DoacaoRepository';
import { UsuarioRepository } from '@/repositories/UsuarioRepository';
import { ProjetoRepository } from '@/repositories/ProjetoRepository';
import { Doacao, DoacaoCreate, DoacaoUpdate } from '@/types/index';
import { Role } from '@/types/enums';

export class DoacaoService {
  private repository = new DoacaoRepository();
  private usuarioRepository = new UsuarioRepository();
  private projetoRepository = new ProjetoRepository();

  async listar(): Promise<Doacao[]> {
    return this.repository.findAll();
  }

  async listarPorProjeto(projetoId: string): Promise<Doacao[]> {
    return this.repository.findByProjeto(projetoId);
  }

  async listarPorUsuario(usuarioId: string): Promise<Doacao[]> {
    return this.repository.findByUsuario(usuarioId);
  }

  async buscarPorId(id: string): Promise<Doacao> {
    const doacao = await this.repository.findById(id);
    if (!doacao) {
      throw new Error('Doação não encontrada');
    }
    return doacao;
  }

  async criar(dados: DoacaoCreate, performadoPor: string): Promise<Doacao> {
    // Validar permissão
    const performador = await this.usuarioRepository.findById(performadoPor);
    if (!performador) {
      throw new Error('Usuário que está realizando a ação não encontrado');
    }

    const temPermissao =
      performador.roles.includes(Role.SUPER_ADMIN) ||
      performador.roles.includes(Role.ADMINISTRADOR) ||
      performador.roles.includes(Role.DOADOR);

    if (!temPermissao) {
      throw new Error(
        'Apenas SuperAdmin, Administrador ou Doador podem cadastrar doações'
      );
    }

    // Validar se usuário existe
    const usuario = await this.usuarioRepository.findById(dados.id_user);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    // Validar se projeto existe
    const projeto = await this.projetoRepository.findById(dados.id_project);
    if (!projeto) {
      throw new Error('Projeto não encontrado');
    }

    return this.repository.create(dados);
  }

  async atualizar(
    id: string,
    dados: DoacaoUpdate,
    performadoPor: string
  ): Promise<Doacao> {
    // Validar permissão
    const performador = await this.usuarioRepository.findById(performadoPor);
    if (!performador) {
      throw new Error('Usuário que está realizando a ação não encontrado');
    }

    const temPermissao =
      performador.roles.includes(Role.SUPER_ADMIN) ||
      performador.roles.includes(Role.ADMINISTRADOR);

    if (!temPermissao) {
      throw new Error(
        'Apenas SuperAdmin ou Administrador podem atualizar doações'
      );
    }

    await this.buscarPorId(id);
    return this.repository.update(id, dados);
  }

  async deletar(id: string, performadoPor: string): Promise<void> {
    // Validar permissão
    const performador = await this.usuarioRepository.findById(performadoPor);
    if (!performador) {
      throw new Error('Usuário que está realizando a ação não encontrado');
    }

    const temPermissao =
      performador.roles.includes(Role.SUPER_ADMIN) ||
      performador.roles.includes(Role.ADMINISTRADOR);

    if (!temPermissao) {
      throw new Error(
        'Apenas SuperAdmin ou Administrador podem deletar doações'
      );
    }

    await this.buscarPorId(id);
    await this.repository.delete(id);
  }
}

