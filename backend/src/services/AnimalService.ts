import { AnimalRepository } from '@/repositories/AnimalRepository';
import { ProjetoRepository } from '@/repositories/ProjetoRepository';
import { Animal, AnimalCreate, AnimalUpdate } from '@/types/index';
import { Role } from '@/types/enums';
import { UsuarioRepository } from '@/repositories/UsuarioRepository';

export class AnimalService {
  private repository = new AnimalRepository();
  private projetoRepository = new ProjetoRepository();
  private usuarioRepository = new UsuarioRepository();

  async listar(): Promise<Animal[]> {
    return this.repository.findAll();
  }

  async listarPorProjeto(projetoId: string): Promise<Animal[]> {
    return this.repository.findByProjeto(projetoId);
  }

  async buscarPorId(id: string): Promise<Animal> {
    const animal = await this.repository.findById(id);
    if (!animal) {
      throw new Error('Animal não encontrado');
    }
    return animal;
  }

  async criar(dados: AnimalCreate, performadoPor: string): Promise<Animal> {
    // Validar permissão
    const performador = await this.usuarioRepository.findById(performadoPor);
    if (!performador) {
      throw new Error('Usuário que está realizando a ação não encontrado');
    }

    const temPermissao =
      performador.roles.includes(Role.SUPER_ADMIN) ||
      performador.roles.includes(Role.ADMINISTRADOR) ||
      (performador.roles.includes(Role.FUNCIONARIO) &&
        (await this.verificarPrivilegiosFuncionario(
          performadoPor,
          dados.id_projeto
        )));

    if (!temPermissao) {
      throw new Error(
        'Apenas SuperAdmin, Administrador ou Funcionário com privilégios podem cadastrar animais'
      );
    }

    // Validar se projeto existe
    const projeto = await this.projetoRepository.findById(dados.id_projeto);
    if (!projeto) {
      throw new Error('Projeto não encontrado');
    }

    return this.repository.create(dados);
  }

  async atualizar(
    id: string,
    dados: AnimalUpdate,
    performadoPor: string
  ): Promise<Animal> {
    // Validar permissão
    const performador = await this.usuarioRepository.findById(performadoPor);
    if (!performador) {
      throw new Error('Usuário que está realizando a ação não encontrado');
    }

    const animal = await this.buscarPorId(id);

    const temPermissao =
      performador.roles.includes(Role.SUPER_ADMIN) ||
      performador.roles.includes(Role.ADMINISTRADOR) ||
      (performador.roles.includes(Role.FUNCIONARIO) &&
        (await this.verificarPrivilegiosFuncionario(
          performadoPor,
          animal.id_projeto
        )));

    if (!temPermissao) {
      throw new Error(
        'Apenas SuperAdmin, Administrador ou Funcionário com privilégios podem atualizar animais'
      );
    }

    return this.repository.update(id, dados);
  }

  async deletar(id: string, performadoPor: string): Promise<void> {
    // Validar permissão
    const performador = await this.usuarioRepository.findById(performadoPor);
    if (!performador) {
      throw new Error('Usuário que está realizando a ação não encontrado');
    }

    // Validar se animal existe
    await this.buscarPorId(id);

    const temPermissao =
      performador.roles.includes(Role.SUPER_ADMIN) ||
      performador.roles.includes(Role.ADMINISTRADOR);

    if (!temPermissao) {
      throw new Error(
        'Apenas SuperAdmin ou Administrador podem deletar animais'
      );
    }

    await this.repository.delete(id);
  }

  private async verificarPrivilegiosFuncionario(
    _usuarioId: string,
    _projetoId: string
  ): Promise<boolean> {
    // Aqui você pode implementar a verificação de privilégios do funcionário
    // Por enquanto, retorna false (pode ser implementado depois)
    // Os parâmetros são prefixados com _ para indicar que são intencionalmente não usados
    return false;
  }
}

