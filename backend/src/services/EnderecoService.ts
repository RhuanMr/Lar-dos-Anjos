import { EnderecoRepository } from '@/repositories/EnderecoRepository';
import { Endereco, EnderecoCreate, EnderecoUpdate } from '@/types/index';

export class EnderecoService {
  private repository = new EnderecoRepository();

  async listar(): Promise<Endereco[]> {
    return this.repository.findAll();
  }

  async buscarPorId(id: string): Promise<Endereco> {
    const endereco = await this.repository.findById(id);
    if (!endereco) {
      throw new Error('Endereço não encontrado');
    }
    return endereco;
  }

  async criar(dados: EnderecoCreate): Promise<Endereco> {
    return this.repository.create(dados);
  }

  async atualizar(id: string, dados: EnderecoUpdate): Promise<Endereco> {
    await this.buscarPorId(id);
    return this.repository.update(id, dados);
  }

  async deletar(id: string): Promise<void> {
    await this.buscarPorId(id);
    await this.repository.delete(id);
  }
}

