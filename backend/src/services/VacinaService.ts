import { VacinaRepository } from '@/repositories/VacinaRepository';
import { AnimalRepository } from '@/repositories/AnimalRepository';
import { UsuarioRepository } from '@/repositories/UsuarioRepository';
import { Vacina, VacinaCreate, VacinaUpdate } from '@/types/index';
import { Role } from '@/types/enums';

export class VacinaService {
  private repository = new VacinaRepository();
  private animalRepository = new AnimalRepository();
  private usuarioRepository = new UsuarioRepository();

  async listar(): Promise<Vacina[]> {
    return this.repository.findAll();
  }

  async listarPorAnimal(animalId: string): Promise<Vacina[]> {
    return this.repository.findByAnimal(animalId);
  }

  async buscarPorId(id: string): Promise<Vacina> {
    const vacina = await this.repository.findById(id);
    if (!vacina) {
      throw new Error('Vacina não encontrada');
    }
    return vacina;
  }

  async criar(dados: VacinaCreate, performadoPor: string): Promise<Vacina> {
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
        'Apenas SuperAdmin, Administrador ou Funcionário podem cadastrar vacinas'
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
    dados: VacinaUpdate,
    performadoPor: string
  ): Promise<Vacina> {
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
        'Apenas SuperAdmin, Administrador ou Funcionário podem atualizar vacinas'
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
        'Apenas SuperAdmin ou Administrador podem deletar vacinas'
      );
    }

    await this.buscarPorId(id);
    await this.repository.delete(id);
  }
}

