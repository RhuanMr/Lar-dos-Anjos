import { ProjetoRepository } from '@/repositories/ProjetoRepository';
import { EnderecoService } from '@/services/EnderecoService';
import { Projeto, ProjetoCreate, ProjetoInsert } from '@/types/index';
import { EnderecoCreate } from '@/types/index';

export class ProjetoService {
  private repository = new ProjetoRepository();
  private enderecoService = new EnderecoService();

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

    // Validar campos obrigatórios do endereço
    if (!dados.bairro || !dados.cidade || !dados.uf || !dados.cep) {
      throw new Error('Bairro, cidade, UF e CEP são obrigatórios');
    }

    // Criar endereço primeiro
    const enderecoData: EnderecoCreate = {
      cep: dados.cep.replace(/\D/g, ''),
      estado: dados.uf,
      cidade: dados.cidade,
      bairro: dados.bairro,
      ...(dados.numero && { numero: dados.numero }),
      ...(dados.complemento && { complemento: dados.complemento }),
    };

    const enderecoCriado = await this.enderecoService.criar(enderecoData);

    // Criar projeto APENAS com os campos que existem na tabela projects
    // Usar interface ProjetoInsert para garantir que não enviamos campos de endereço
    // NOTA: descricao não existe na tabela projects, então não é incluído
    const projetoData: ProjetoInsert = {
      nome: dados.nome,
      endereco_id: enderecoCriado.id,
      ...(dados.instagram && { instagram: dados.instagram }),
      telefone: dados.telefone,
      email: dados.email,
    };

    return this.repository.create(projetoData);
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
