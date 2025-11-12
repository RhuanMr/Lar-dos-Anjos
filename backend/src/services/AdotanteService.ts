import { UsuarioRepository } from '@/repositories/UsuarioRepository';
import { Usuario } from '@/types/index';
import { Role } from '@/types/enums';
import { AdotanteCreate } from '@/types/index';

export class AdotanteService {
  private usuarioRepository = new UsuarioRepository();

  async cadastrarComoAdotante(
    dados: AdotanteCreate
  ): Promise<Usuario> {
    // Validar se usuário existe
    const usuario = await this.usuarioRepository.findById(dados.id_usuario);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    // Adicionar role de Adotante ao usuário se não tiver
    if (!usuario.roles.includes(Role.ADOTANTE)) {
      const novasRoles = [...usuario.roles, Role.ADOTANTE];
      return this.usuarioRepository.update(dados.id_usuario, {
        roles: novasRoles,
      } as any);
    }

    return usuario;
  }

  async removerRoleAdotante(usuarioId: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    // Remover role de Adotante
    const novasRoles = usuario.roles.filter((role) => role !== Role.ADOTANTE);
    return this.usuarioRepository.update(usuarioId, {
      roles: novasRoles,
    } as any);
  }
}

