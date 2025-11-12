import { VoluntarioRepository } from '@/repositories/VoluntarioRepository';
import { UsuarioRepository } from '@/repositories/UsuarioRepository';
import { ProjetoRepository } from '@/repositories/ProjetoRepository';
import {
  Voluntario,
  VoluntarioCreate,
  VoluntarioUpdate,
} from '@/types/index';
import { Role } from '@/types/enums';

export class VoluntarioService {
  private repository = new VoluntarioRepository();
  private usuarioRepository = new UsuarioRepository();
  private projetoRepository = new ProjetoRepository();

  async listar(): Promise<Voluntario[]> {
    return this.repository.findAll();
  }

  async listarPorProjeto(projetoId: string): Promise<Voluntario[]> {
    return this.repository.findByProjeto(projetoId);
  }

  async listarPorUsuario(usuarioId: string): Promise<Voluntario[]> {
    return this.repository.findByUsuario(usuarioId);
  }

  async buscarPorUsuarioEProjeto(
    usuarioId: string,
    projetoId: string
  ): Promise<Voluntario> {
    const voluntario = await this.repository.findByUsuarioAndProjeto(
      usuarioId,
      projetoId
    );
    if (!voluntario) {
      throw new Error('Voluntário não encontrado');
    }
    return voluntario;
  }

  async criar(
    dados: VoluntarioCreate,
    performadoPor: string
  ): Promise<Voluntario> {
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
        'Apenas SuperAdmin ou Administrador podem cadastrar voluntários'
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

    // Adicionar role de Voluntário ao usuário se não tiver
    if (!usuario.roles.includes(Role.VOLUNTARIO)) {
      const novasRoles = [...usuario.roles, Role.VOLUNTARIO];
      await this.usuarioRepository.update(dados.id_usuario, {
        roles: novasRoles,
      } as any);
    }

    return this.repository.create(dados);
  }

  async atualizar(
    usuarioId: string,
    projetoId: string,
    dados: VoluntarioUpdate,
    performadoPor: string
  ): Promise<Voluntario> {
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
        'Apenas SuperAdmin ou Administrador podem atualizar voluntários'
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
        'Apenas SuperAdmin ou Administrador podem deletar voluntários'
      );
    }

    await this.buscarPorUsuarioEProjeto(usuarioId, projetoId);
    await this.repository.delete(usuarioId, projetoId);
  }
}

