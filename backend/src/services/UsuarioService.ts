import { UsuarioRepository } from '@/repositories/UsuarioRepository';
import { Usuario, UsuarioCreate, UsuarioUpdate } from '@/types/index';
import { Role } from '@/types/enums';

const MAX_SUPER_ADMINS = 2;

export class UsuarioService {
  private repository = new UsuarioRepository();

  async listar(): Promise<Usuario[]> {
    return this.repository.findAll();
  }

  async buscarPorId(id: string): Promise<Usuario> {
    const usuario = await this.repository.findById(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }
    return usuario;
  }

  async criar(dados: UsuarioCreate): Promise<Usuario> {
    // Validar email e CPF únicos
    const usuarioEmail = await this.repository.findByEmail(dados.email);
    if (usuarioEmail) {
      throw new Error('Email já cadastrado');
    }

    const usuarioCpf = await this.repository.findByCpf(dados.cpf);
    if (usuarioCpf) {
      throw new Error('CPF já cadastrado');
    }

    // Validar limite de SuperAdmins
    if (dados.roles.includes(Role.SUPER_ADMIN)) {
      const countSuperAdmins = await this.repository.countSuperAdmins();
      if (countSuperAdmins >= MAX_SUPER_ADMINS) {
        throw new Error(
          `Limite de ${MAX_SUPER_ADMINS} SuperAdmins atingido`
        );
      }
    }

    return this.repository.create(dados);
  }

  async atualizar(id: string, dados: UsuarioUpdate): Promise<Usuario> {
    await this.buscarPorId(id);
    return this.repository.update(id, dados);
  }

  async deletar(id: string): Promise<void> {
    await this.buscarPorId(id);
    await this.repository.delete(id);
  }

  async promoverParaAdmin(
    usuarioId: string,
    performadoPor: string
  ): Promise<Usuario> {
    // Validar se quem está fazendo é SuperAdmin ou Admin
    const performador = await this.buscarPorId(performadoPor);
    if (!performador.roles.includes(Role.SUPER_ADMIN)) {
      throw new Error('Apenas SuperAdmin pode promover para Admin');
    }

    const usuario = await this.buscarPorId(usuarioId);
    const novasRoles = [...usuario.roles];

    if (!novasRoles.includes(Role.ADMINISTRADOR)) {
      novasRoles.push(Role.ADMINISTRADOR);
    }

    return this.repository.update(usuarioId, { roles: novasRoles } as any);
  }

  async concederPrivilegiosAFuncionario(
    _funcionarioId: string,
    _projetoId: string,
    performadoPor: string
  ): Promise<void> {
    const performador = await this.buscarPorId(performadoPor);

    // Apenas SuperAdmin ou Administrador podem conceder privilégios
    const temPermissao =
      performador.roles.includes(Role.SUPER_ADMIN) ||
      performador.roles.includes(Role.ADMINISTRADOR);

    if (!temPermissao) {
      throw new Error(
        'Apenas SuperAdmin ou Administrador podem conceder privilégios'
      );
    }

    // Aqui você teria uma query para atualizar privilégios na tabela 'funcionarios'
    // Por enquanto, apenas validamos
  }
}
