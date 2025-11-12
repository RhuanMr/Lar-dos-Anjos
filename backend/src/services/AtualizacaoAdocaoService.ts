import { AtualizacaoAdocaoRepository } from '@/repositories/AtualizacaoAdocaoRepository';
import { AdocaoRepository } from '@/repositories/AdocaoRepository';
import { UsuarioRepository } from '@/repositories/UsuarioRepository';
import {
  AtualizacaoAdocao,
  AtualizacaoAdocaoCreate,
  AtualizacaoAdocaoUpdate,
} from '@/types/index';
import { Role } from '@/types/enums';

export class AtualizacaoAdocaoService {
  private repository = new AtualizacaoAdocaoRepository();
  private adocaoRepository = new AdocaoRepository();
  private usuarioRepository = new UsuarioRepository();

  async listar(): Promise<AtualizacaoAdocao[]> {
    return this.repository.findAll();
  }

  async listarPorAdocao(adocaoId: string): Promise<AtualizacaoAdocao[]> {
    return this.repository.findByAdocao(adocaoId);
  }

  async buscarPorId(id: string): Promise<AtualizacaoAdocao> {
    const atualizacao = await this.repository.findById(id);
    if (!atualizacao) {
      throw new Error('Atualização não encontrada');
    }
    return atualizacao;
  }

  async criar(
    dados: AtualizacaoAdocaoCreate,
    performadoPor: string
  ): Promise<AtualizacaoAdocao> {
    // Validar permissão - apenas funcionários podem criar atualizações
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
        'Apenas SuperAdmin, Administrador ou Funcionário podem criar atualizações de adoção'
      );
    }

    // Validar se adoção existe
    const adocao = await this.adocaoRepository.findById(dados.id_adocao);
    if (!adocao) {
      throw new Error('Adoção não encontrada');
    }

    // Validar se responsável existe
    const responsavel = await this.usuarioRepository.findById(
      dados.id_responsavel
    );
    if (!responsavel) {
      throw new Error('Responsável não encontrado');
    }

    // Verificar se responsável é funcionário
    const responsavelEFuncionario =
      responsavel.roles.includes(Role.SUPER_ADMIN) ||
      responsavel.roles.includes(Role.ADMINISTRADOR) ||
      responsavel.roles.includes(Role.FUNCIONARIO);

    if (!responsavelEFuncionario) {
      throw new Error(
        'Responsável deve ser SuperAdmin, Administrador ou Funcionário'
      );
    }

    // Atualizar lt_atualizacao na adoção
    const hoje = new Date();
    const dataAtualizacao: string = hoje.toISOString().substring(0, 10);
    await this.adocaoRepository.update(dados.id_adocao, {
      lt_atualizacao: dataAtualizacao,
    });

    return this.repository.create(dados);
  }

  async atualizar(
    id: string,
    dados: AtualizacaoAdocaoUpdate,
    performadoPor: string
  ): Promise<AtualizacaoAdocao> {
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
        'Apenas SuperAdmin, Administrador ou Funcionário podem atualizar atualizações de adoção'
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
        'Apenas SuperAdmin ou Administrador podem deletar atualizações de adoção'
      );
    }

    await this.buscarPorId(id);
    await this.repository.delete(id);
  }
}

