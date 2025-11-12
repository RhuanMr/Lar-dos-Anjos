import { DoadorRepository } from '@/repositories/DoadorRepository';
import { UsuarioRepository } from '@/repositories/UsuarioRepository';
import { ProjetoRepository } from '@/repositories/ProjetoRepository';
import { Doador, DoadorCreate, DoadorUpdate } from '@/types/index';
import { Role } from '@/types/enums';

export class DoadorService {
  private repository = new DoadorRepository();
  private usuarioRepository = new UsuarioRepository();
  private projetoRepository = new ProjetoRepository();

  async listar(): Promise<Doador[]> {
    return this.repository.findAll();
  }

  async listarPorProjeto(projetoId: string): Promise<Doador[]> {
    return this.repository.findByProjeto(projetoId);
  }

  async listarPorUsuario(usuarioId: string): Promise<Doador[]> {
    return this.repository.findByUsuario(usuarioId);
  }

  async buscarPorUsuarioEProjeto(
    usuarioId: string,
    projetoId: string
  ): Promise<Doador> {
    const doador = await this.repository.findByUsuarioAndProjeto(
      usuarioId,
      projetoId
    );
    if (!doador) {
      throw new Error('Doador não encontrado');
    }
    return doador;
  }

  async criar(dados: DoadorCreate, performadoPor: string): Promise<Doador> {
    // Validar se quem está criando tem permissão (SuperAdmin ou Admin)
    const performador = await this.usuarioRepository.findById(performadoPor);
    if (!performador) {
      throw new Error('Usuário que está realizando a ação não encontrado');
    }

    const temPermissao =
      performador.roles.includes(Role.SUPER_ADMIN) ||
      performador.roles.includes(Role.ADMINISTRADOR);

    if (!temPermissao) {
      throw new Error(
        'Apenas SuperAdmin ou Administrador podem cadastrar doadores'
      );
    }

    // Validar se usuário existe
    const usuario = await this.usuarioRepository.findById(dados.id_usuario);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    // Validar se projeto existe
    const projeto = await this.projetoRepository.findById(dados.id_projeto);
    if (!projeto) {
      throw new Error('Projeto não encontrado');
    }

    // Adicionar role de Doador ao usuário se não tiver
    if (!usuario.roles.includes(Role.DOADOR)) {
      const novasRoles = [...usuario.roles, Role.DOADOR];
      await this.usuarioRepository.update(dados.id_usuario, {
        roles: novasRoles,
      } as any);
    }

    return this.repository.create(dados);
  }

  async atualizar(
    usuarioId: string,
    projetoId: string,
    dados: DoadorUpdate,
    performadoPor: string
  ): Promise<Doador> {
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
        'Apenas SuperAdmin ou Administrador podem atualizar doadores'
      );
    }

    await this.buscarPorUsuarioEProjeto(usuarioId, projetoId);
    return this.repository.update(usuarioId, projetoId, dados);
  }

  async deletar(
    usuarioId: string,
    projetoId: string,
    performadoPor: string
  ): Promise<void> {
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
        'Apenas SuperAdmin ou Administrador podem deletar doadores'
      );
    }

    await this.buscarPorUsuarioEProjeto(usuarioId, projetoId);
    await this.repository.delete(usuarioId, projetoId);
  }
}

