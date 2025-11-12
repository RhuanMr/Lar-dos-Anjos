import { AdocaoRepository } from '@/repositories/AdocaoRepository';
import { AnimalRepository } from '@/repositories/AnimalRepository';
import { ProjetoRepository } from '@/repositories/ProjetoRepository';
import { UsuarioRepository } from '@/repositories/UsuarioRepository';
import { Adocao, AdocaoCreate, AdocaoUpdate } from '@/types/index';
import { Role } from '@/types/enums';

export class AdocaoService {
  private repository = new AdocaoRepository();
  private animalRepository = new AnimalRepository();
  private projetoRepository = new ProjetoRepository();
  private usuarioRepository = new UsuarioRepository();

  async listar(): Promise<Adocao[]> {
    return this.repository.findAll();
  }

  async listarPorProjeto(projetoId: string): Promise<Adocao[]> {
    return this.repository.findByProjeto(projetoId);
  }

  async listarPorAdotante(adotanteId: string): Promise<Adocao[]> {
    return this.repository.findByAdotante(adotanteId);
  }

  async listarPorAnimal(animalId: string): Promise<Adocao[]> {
    return this.repository.findByAnimal(animalId);
  }

  async buscarPorId(id: string): Promise<Adocao> {
    const adocao = await this.repository.findById(id);
    if (!adocao) {
      throw new Error('Adoção não encontrada');
    }
    return adocao;
  }

  async criar(dados: AdocaoCreate, performadoPor: string): Promise<Adocao> {
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
        'Apenas SuperAdmin, Administrador ou Funcionário podem cadastrar adoções'
      );
    }

    // Validar se projeto existe
    const projeto = await this.projetoRepository.findById(dados.id_projeto);
    if (!projeto) {
      throw new Error('Projeto não encontrado');
    }

    // Validar se animal existe
    const animal = await this.animalRepository.findById(dados.id_animal);
    if (!animal) {
      throw new Error('Animal não encontrado');
    }

    // Validar se adotante existe
    const adotante = await this.usuarioRepository.findById(dados.id_adotante);
    if (!adotante) {
      throw new Error('Adotante não encontrado');
    }

    // Verificar se o adotante tem a role de Adotante
    if (!adotante.roles.includes(Role.ADOTANTE)) {
      throw new Error('Usuário não possui a role de Adotante');
    }

    return this.repository.create(dados);
  }

  async atualizar(
    id: string,
    dados: AdocaoUpdate,
    performadoPor: string
  ): Promise<Adocao> {
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
        'Apenas SuperAdmin, Administrador ou Funcionário podem atualizar adoções'
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
        'Apenas SuperAdmin ou Administrador podem deletar adoções'
      );
    }

    await this.buscarPorId(id);
    await this.repository.delete(id);
  }
}

