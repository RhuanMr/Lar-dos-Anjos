import { FuncionarioRepository } from '@/repositories/FuncionarioRepository';
import { UsuarioRepository } from '@/repositories/UsuarioRepository';
import { ProjetoRepository } from '@/repositories/ProjetoRepository';
import {
  Funcionario,
  FuncionarioCreate,
  FuncionarioUpdate,
} from '@/types/index';
import { Role } from '@/types/enums';

export class FuncionarioService {
  private repository = new FuncionarioRepository();
  private usuarioRepository = new UsuarioRepository();
  private projetoRepository = new ProjetoRepository();

  async listar(): Promise<Funcionario[]> {
    return this.repository.findAll();
  }

  async listarPorProjeto(projetoId: string): Promise<Funcionario[]> {
    return this.repository.findByProjeto(projetoId);
  }

  async listarPorUsuario(usuarioId: string): Promise<Funcionario[]> {
    return this.repository.findByUsuario(usuarioId);
  }

  async buscarPorUsuarioEProjeto(
    usuarioId: string,
    projetoId: string
  ): Promise<Funcionario> {
    const funcionario = await this.repository.findByUsuarioAndProjeto(
      usuarioId,
      projetoId
    );
    if (!funcionario) {
      throw new Error('Funcionário não encontrado');
    }
    return funcionario;
  }

  async criar(
    dados: FuncionarioCreate,
    performadoPor: string
  ): Promise<Funcionario> {
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
        'Apenas SuperAdmin ou Administrador podem cadastrar funcionários'
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

    // Adicionar role de Funcionário ao usuário se não tiver
    if (!usuario.roles.includes(Role.FUNCIONARIO)) {
      const novasRoles = [...usuario.roles, Role.FUNCIONARIO];
      await this.usuarioRepository.update(dados.id_usuario, {
        roles: novasRoles,
      } as any);
    }

    return this.repository.create(dados);
  }

  async atualizar(
    usuarioId: string,
    projetoId: string,
    dados: FuncionarioUpdate,
    performadoPor: string
  ): Promise<Funcionario> {
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
        'Apenas SuperAdmin ou Administrador podem atualizar funcionários'
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
        'Apenas SuperAdmin ou Administrador podem deletar funcionários'
      );
    }

    await this.buscarPorUsuarioEProjeto(usuarioId, projetoId);
    await this.repository.delete(usuarioId, projetoId);
  }

  async concederPrivilegios(
    usuarioId: string,
    projetoId: string,
    performadoPor: string
  ): Promise<Funcionario> {
    // Apenas SuperAdmin ou Administrador podem conceder privilégios
    const performador = await this.usuarioRepository.findById(performadoPor);
    if (!performador) {
      throw new Error('Usuário que está realizando a ação não encontrado');
    }

    const temPermissao =
      performador.roles.includes(Role.SUPER_ADMIN) ||
      performador.roles.includes(Role.ADMINISTRADOR);

    if (!temPermissao) {
      throw new Error(
        'Apenas SuperAdmin ou Administrador podem conceder privilégios'
      );
    }

    return this.atualizar(
      usuarioId,
      projetoId,
      { privilegios: true },
      performadoPor
    );
  }

  async removerPrivilegios(
    usuarioId: string,
    projetoId: string,
    performadoPor: string
  ): Promise<Funcionario> {
    // Apenas SuperAdmin ou Administrador podem remover privilégios
    const performador = await this.usuarioRepository.findById(performadoPor);
    if (!performador) {
      throw new Error('Usuário que está realizando a ação não encontrado');
    }

    const temPermissao =
      performador.roles.includes(Role.SUPER_ADMIN) ||
      performador.roles.includes(Role.ADMINISTRADOR);

    if (!temPermissao) {
      throw new Error(
        'Apenas SuperAdmin ou Administrador podem remover privilégios'
      );
    }

    return this.atualizar(
      usuarioId,
      projetoId,
      { privilegios: false },
      performadoPor
    );
  }
}

