import { ProjetoRepository } from '@/repositories/ProjetoRepository';
import { EnderecoService } from '@/services/EnderecoService';
import {
  Projeto,
  ProjetoCreate,
  ProjetoInsert,
  EnderecoCreate,
} from '@/types/index';
import { Role } from '@/types/enums';
import { AdministradorRepository } from '@/repositories/AdministradorRepository';
import { FuncionarioRepository } from '@/repositories/FuncionarioRepository';
import { VoluntarioRepository } from '@/repositories/VoluntarioRepository';

export class ProjetoService {
  private repository = new ProjetoRepository();
  private enderecoService = new EnderecoService();
  private administradorRepository = new AdministradorRepository();
  private funcionarioRepository = new FuncionarioRepository();
  private voluntarioRepository = new VoluntarioRepository();

  async listar(user?: { id: string; roles: Role[] }): Promise<Projeto[]> {
    if (!user || user.roles.includes(Role.SUPER_ADMIN)) {
      return this.repository.findAll();
    }

    const projectIds = new Set<string>();
    const hasRole = (role: Role) => user.roles.includes(role);

    try {
      const adminProjetos =
        await this.administradorRepository.findByUsuario(user.id);
      adminProjetos.forEach((admin) => projectIds.add(admin.id_projeto));
    } catch (error) {
      console.error('Erro ao buscar projetos como administrador:', error);
    }

    if (hasRole(Role.FUNCIONARIO)) {
      try {
        const funcionarios =
          await this.funcionarioRepository.findByUsuario(user.id);
        funcionarios.forEach((funcionario) =>
          projectIds.add(funcionario.id_projeto)
        );
      } catch (error) {
        console.error('Erro ao buscar projetos como funcionário:', error);
      }
    }

    if (hasRole(Role.VOLUNTARIO)) {
      try {
        const voluntarios =
          await this.voluntarioRepository.findByUsuario(user.id);
        voluntarios.forEach((voluntario) =>
          projectIds.add(voluntario.id_projeto)
        );
      } catch (error) {
        console.error('Erro ao buscar projetos como voluntário:', error);
      }
    }

    if (!projectIds.size) {
      return [];
    }

    return this.repository.findByIds([...projectIds]);
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
