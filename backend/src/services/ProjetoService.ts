import { ProjetoRepository } from '@/repositories/ProjetoRepository';
import { Projeto, ProjetoCreate } from '@/types/index';

export class ProjetoService {
  private repository = new ProjetoRepository();

  async listar(): Promise<Projeto[]> {
    return this.repository.findAll();
  }

  async buscarPorId(id: string): Promise<Projeto> {
    const projeto = await this.repository.findById(id);
    if (!projeto) {
      throw new Error('Projeto não encontrado');
    }
    return projeto;
  }

  async criar(dados: ProjetoCreate): Promise<Projeto> {
    // Validar campos obrigatórios
    if (!dados.telefone || !dados.email) {
      throw new Error('Telefone e email são obrigatórios');
    }

    return this.repository.create(dados);
  }

  async atualizar(
    id: string,
    dados: Partial<ProjetoCreate>
  ): Promise<Projeto> {
    await this.buscarPorId(id);
    return this.repository.update(id, dados as any);
  }

  async deletar(id: string): Promise<void> {
    await this.buscarPorId(id);
    await this.repository.delete(id);
  }
}
