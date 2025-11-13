import { AdministradorRepository } from '@/repositories/AdministradorRepository';
import { UsuarioRepository } from '@/repositories/UsuarioRepository';
import { ProjetoRepository } from '@/repositories/ProjetoRepository';
import {
  Administrador,
  AdministradorCreate,
  AdministradorUpdate,
} from '@/types/index';
import { Role } from '@/types/enums';

export class AdministradorService {
  private repository = new AdministradorRepository();
  private usuarioRepository = new UsuarioRepository();
  private projetoRepository = new ProjetoRepository();

  async listar(): Promise<Administrador[]> {
    return this.repository.findAll();
  }

  async listarPorProjeto(projetoId: string): Promise<Administrador[]> {
    return this.repository.findByProjeto(projetoId);
  }

  async listarPorUsuario(usuarioId: string): Promise<Administrador[]> {
    return this.repository.findByUsuario(usuarioId);
  }

  async buscarPorUsuarioEProjeto(
    usuarioId: string,
    projetoId: string
  ): Promise<Administrador> {
    const administrador = await this.repository.findByUsuarioAndProjeto(
      usuarioId,
      projetoId
    );
    if (!administrador) {
      throw new Error('Administrador não encontrado');
    }
    return administrador;
  }

  async criar(
    dados: AdministradorCreate,
    performadoPor: string
  ): Promise<Administrador> {
    // Validar se quem está criando tem permissão (apenas SuperAdmin)
    const performador = await this.usuarioRepository.findById(performadoPor);
    if (!performador) {
      throw new Error('Usuário que está realizando a ação não encontrado');
    }

    if (!performador.roles.includes(Role.SUPER_ADMIN)) {
      throw new Error(
        'Apenas SuperAdmin pode cadastrar administradores de projetos'
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

    // Adicionar role de Administrador ao usuário se não tiver
    if (!usuario.roles.includes(Role.ADMINISTRADOR)) {
      const novasRoles = [...usuario.roles, Role.ADMINISTRADOR];
      await this.usuarioRepository.update(dados.id_usuario, {
        roles: novasRoles,
      } as any);
    }

    console.log('Dados recebidos no service para criar administrador:', dados);
    console.log('Chamando repository.create com:', {
      id_usuario: dados.id_usuario,
      id_projeto: dados.id_projeto,
      observacao: dados.observacao,
    });

    return this.repository.create(dados);
  }

  async atualizar(
    usuarioId: string,
    projetoId: string,
    dados: AdministradorUpdate,
    performadoPor: string
  ): Promise<Administrador> {
    // Validar permissão (apenas SuperAdmin)
    const performador = await this.usuarioRepository.findById(performadoPor);
    if (!performador) {
      throw new Error('Usuário que está realizando a ação não encontrado');
    }

    if (!performador.roles.includes(Role.SUPER_ADMIN)) {
      throw new Error(
        'Apenas SuperAdmin pode atualizar administradores de projetos'
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
    // Validar permissão (apenas SuperAdmin)
    const performador = await this.usuarioRepository.findById(performadoPor);
    if (!performador) {
      throw new Error('Usuário que está realizando a ação não encontrado');
    }

    if (!performador.roles.includes(Role.SUPER_ADMIN)) {
      throw new Error(
        'Apenas SuperAdmin pode deletar administradores de projetos'
      );
    }

    await this.buscarPorUsuarioEProjeto(usuarioId, projetoId);
    await this.repository.delete(usuarioId, projetoId);
  }
}

