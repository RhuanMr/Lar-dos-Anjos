import { UsuarioRepository } from '@/repositories/UsuarioRepository';
import { Usuario, UsuarioCreate, UsuarioUpdate, EnderecoCreate } from '@/types/index';
import { Role } from '@/types/enums';
import { AuthService } from './AuthService';
import { EnderecoService } from './EnderecoService';

const MAX_SUPER_ADMINS = 2;

export class UsuarioService {
  private repository = new UsuarioRepository();
  private enderecoService = new EnderecoService();

  async listar(): Promise<Usuario[]> {
    return this.repository.findAll();
  }

  async buscarPorId(id: string): Promise<Usuario> {
    const usuario = await this.repository.findById(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }
    return usuario;
  }

  async criar(dados: UsuarioCreate): Promise<Usuario> {
    // Validar email e CPF únicos
    const usuarioEmail = await this.repository.findByEmail(dados.email);
    if (usuarioEmail) {
      throw new Error('Email já cadastrado');
    }

    const usuarioCpf = await this.repository.findByCpf(dados.cpf);
    if (usuarioCpf) {
      throw new Error('CPF já cadastrado');
    }

    // Validar limite de SuperAdmins
    if (dados.roles.includes(Role.SUPER_ADMIN)) {
      const countSuperAdmins = await this.repository.countSuperAdmins();
      if (countSuperAdmins >= MAX_SUPER_ADMINS) {
        throw new Error(
          `Limite de ${MAX_SUPER_ADMINS} SuperAdmins atingido`
        );
      }
    }

    // Criar endereço se os campos obrigatórios estiverem presentes
    let enderecoId: string | undefined = undefined;
    if (dados.cep && dados.bairro && dados.cidade && dados.uf) {
      const enderecoData: EnderecoCreate = {
        cep: dados.cep.replace(/\D/g, ''),
        estado: dados.uf,
        cidade: dados.cidade,
        bairro: dados.bairro,
        endereco: dados.endereco || null,
        numero: dados.numero || null,
        complemento: dados.complemento || null,
      };

      const enderecoCriado = await this.enderecoService.criar(enderecoData);
      enderecoId = enderecoCriado.id;
    }

    // Separar campos de endereço e genero dos campos do usuário
    const { endereco, numero, complemento, bairro, cidade, uf, cep, genero, ...camposUsuario } = dados;
    
    // Criar usuário com endereco_id se houver endereço
    const dadosUsuario: any = camposUsuario;
    if (enderecoId) {
      dadosUsuario.endereco_id = enderecoId;
    }

    return this.repository.create(dadosUsuario);
  }

  async atualizar(id: string, dados: UsuarioUpdate): Promise<Usuario> {
    const usuario = await this.buscarPorId(id);
    
    // Criar ou atualizar endereço se os campos obrigatórios estiverem presentes
    let enderecoId: string | undefined = undefined;
    const dadosAny = dados as any;
    if (dadosAny.cep && dadosAny.bairro && dadosAny.cidade && dadosAny.uf) {
      const enderecoData: EnderecoCreate = {
        cep: dadosAny.cep.replace(/\D/g, ''),
        estado: dadosAny.uf,
        cidade: dadosAny.cidade,
        bairro: dadosAny.bairro,
        endereco: dadosAny.endereco || null,
        numero: dadosAny.numero || null,
        complemento: dadosAny.complemento || null,
      };

      // Se o usuário já tem um endereço, atualizar; senão, criar novo
      if (usuario.endereco_id) {
        await this.enderecoService.atualizar(usuario.endereco_id, enderecoData);
        enderecoId = usuario.endereco_id;
      } else {
        const enderecoCriado = await this.enderecoService.criar(enderecoData);
        enderecoId = enderecoCriado.id;
      }
    }

    // Separar campos de endereço e genero dos campos do usuário
    const { endereco, numero, complemento, bairro, cidade, uf, cep, genero, ...camposUsuario } = dadosAny;
    
    // Atualizar usuário com endereco_id se houver endereço
    const dadosUsuario: any = camposUsuario;
    if (enderecoId) {
      dadosUsuario.endereco_id = enderecoId;
    }
    
    return this.repository.update(id, dadosUsuario);
  }

  async deletar(id: string): Promise<void> {
    await this.buscarPorId(id);
    await this.repository.delete(id);
  }

  async promoverParaAdmin(
    usuarioId: string,
    performadoPor: string
  ): Promise<Usuario> {
    // Validar se quem está fazendo é SuperAdmin ou Admin
    const performador = await this.buscarPorId(performadoPor);
    if (!performador.roles.includes(Role.SUPER_ADMIN)) {
      throw new Error('Apenas SuperAdmin pode promover para Admin');
    }

    const usuario = await this.buscarPorId(usuarioId);
    const novasRoles = [...usuario.roles];

    if (!novasRoles.includes(Role.ADMINISTRADOR)) {
      novasRoles.push(Role.ADMINISTRADOR);
    }

    return this.repository.update(usuarioId, { roles: novasRoles } as any);
  }

  async concederPrivilegiosAFuncionario(
    _funcionarioId: string,
    _projetoId: string,
    performadoPor: string
  ): Promise<void> {
    const performador = await this.buscarPorId(performadoPor);

    // Apenas SuperAdmin ou Administrador podem conceder privilégios
    const temPermissao =
      performador.roles.includes(Role.SUPER_ADMIN) ||
      performador.roles.includes(Role.ADMINISTRADOR);

    if (!temPermissao) {
      throw new Error(
        'Apenas SuperAdmin ou Administrador podem conceder privilégios'
      );
    }

    // Aqui você teria uma query para atualizar privilégios na tabela 'funcionarios'
    // Por enquanto, apenas validamos
  }

  async definirSenha(
    usuarioId: string,
    senha: string,
    performadoPor?: string
  ): Promise<void> {
    // Verificar se o usuário existe
    await this.buscarPorId(usuarioId);

    // Se performadoPor for fornecido, verificar permissões
    if (performadoPor) {
      const performador = await this.buscarPorId(performadoPor);
      const temPermissao =
        performador.roles.includes(Role.SUPER_ADMIN) ||
        performador.roles.includes(Role.ADMINISTRADOR) ||
        performador.id === usuarioId; // Usuário pode definir sua própria senha

      if (!temPermissao) {
        throw new Error(
          'Apenas SuperAdmin, Administrador ou o próprio usuário podem definir senha'
        );
      }
    }

    // Hash da senha
    const authService = new AuthService();
    const senhaHash = await authService.hashSenha(senha);

    // Atualizar senha no banco
    await this.repository.update(usuarioId, {
      senha_hash: senhaHash,
    } as any);
  }
}
