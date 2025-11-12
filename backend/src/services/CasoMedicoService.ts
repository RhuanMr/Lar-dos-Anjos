import { CasoMedicoRepository } from '@/repositories/CasoMedicoRepository';
import { AnimalRepository } from '@/repositories/AnimalRepository';
import { UsuarioRepository } from '@/repositories/UsuarioRepository';
import {
  CasoMedico,
  CasoMedicoCreate,
  CasoMedicoUpdate,
} from '@/types/index';
import { Role } from '@/types/enums';

export class CasoMedicoService {
  private repository = new CasoMedicoRepository();
  private animalRepository = new AnimalRepository();
  private usuarioRepository = new UsuarioRepository();

  async listar(): Promise<CasoMedico[]> {
    return this.repository.findAll();
  }

  async listarPorAnimal(animalId: string): Promise<CasoMedico[]> {
    return this.repository.findByAnimal(animalId);
  }

  async buscarPorId(id: string): Promise<CasoMedico> {
    const casoMedico = await this.repository.findById(id);
    if (!casoMedico) {
      throw new Error('Caso médico não encontrado');
    }
    return casoMedico;
  }

  async criar(
    dados: CasoMedicoCreate,
    performadoPor: string
  ): Promise<CasoMedico> {
    // Validar permissão
    const performador = await this.usuarioRepository.findById(performadoPor);
    if (!performador) {
      throw new Error('Usuário que está realizando a ação não encontrado');
    }

    const temPermissao =
      performador.roles.includes(Role.SUPER_ADMIN) ||
      performador.roles.includes(Role.ADMINISTRADOR) ||
      performador.roles.includes(Role.FUNCIONARIO);

    if (!temPermissao) {
      throw new Error(
        'Apenas SuperAdmin, Administrador ou Funcionário podem cadastrar casos médicos'
      );
    }

    // Validar se animal existe
    const animal = await this.animalRepository.findById(dados.id_animal);
    if (!animal) {
      throw new Error('Animal não encontrado');
    }

    return this.repository.create(dados);
  }

  async atualizar(
    id: string,
    dados: CasoMedicoUpdate,
    performadoPor: string
  ): Promise<CasoMedico> {
    // Validar permissão
    const performador = await this.usuarioRepository.findById(performadoPor);
    if (!performador) {
      throw new Error('Usuário que está realizando a ação não encontrado');
    }

    const temPermissao =
      performador.roles.includes(Role.SUPER_ADMIN) ||
      performador.roles.includes(Role.ADMINISTRADOR) ||
      performador.roles.includes(Role.FUNCIONARIO);

    if (!temPermissao) {
      throw new Error(
        'Apenas SuperAdmin, Administrador ou Funcionário podem atualizar casos médicos'
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
        'Apenas SuperAdmin ou Administrador podem deletar casos médicos'
      );
    }

    await this.buscarPorId(id);
    await this.repository.delete(id);
  }
}

