import { UsuarioRepository } from '@/repositories/UsuarioRepository';
import { Usuario } from '@/types/index';
import { Role } from '@/types/enums';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface LoginResponse {
  usuario: Omit<Usuario, 'senha'>;
  token: string;
}

export class AuthService {
  private repository = new UsuarioRepository();
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;

  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.warn(
        '⚠️ JWT_SECRET não definido no .env. Usando chave padrão (NÃO SEGURO PARA PRODUÇÃO)'
      );
    }
    this.jwtSecret = secret || 'sua-chave-secreta-super-segura-aqui';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { email, senha } = credentials;

    // Buscar usuário por email
    const usuario = await this.repository.findByEmail(email);
    if (!usuario) {
      throw new Error('Email ou senha incorretos');
    }

    // Verificar se usuário está ativo
    if (!usuario.ativo) {
      throw new Error('Usuário inativo. Entre em contato com o administrador');
    }

    // Verificar se usuário tem permissão para acessar o sistema
    const temAcesso = this.verificarPermissaoAcesso(usuario.roles);
    if (!temAcesso) {
      throw new Error(
        'Você não tem permissão para acessar o sistema. Apenas SuperAdmin, Administrador ou Funcionário com privilégios podem fazer login'
      );
    }

    // Verificar senha
    // Nota: Se a tabela não tiver campo senha ainda, precisará adicionar
    // Por enquanto, vamos assumir que existe um campo senha_hash
    const senhaValida = await this.verificarSenha(senha, usuario);
    if (!senhaValida) {
      throw new Error('Email ou senha incorretos');
    }

    // Gerar token JWT
    const token = this.gerarToken(usuario);

    // Remover senha do objeto de retorno
    const { senha: _, ...usuarioSemSenha } = usuario as any;

    return {
      usuario: usuarioSemSenha,
      token,
    };
  }

  private verificarPermissaoAcesso(roles: Role[]): boolean {
    // Apenas SuperAdmin, Administrador ou Funcionário podem acessar
    return (
      roles.includes(Role.SUPER_ADMIN) ||
      roles.includes(Role.ADMINISTRADOR) ||
      roles.includes(Role.FUNCIONARIO)
    );
  }

  private async verificarSenha(
    senha: string,
    usuario: Usuario
  ): Promise<boolean> {
    // Verificar se o usuário tem senha_hash no banco
    // O campo pode ser 'senha_hash' ou 'senha' dependendo da estrutura do banco
    const usuarioComSenha = usuario as any;
    
    // Tentar encontrar o campo de senha (pode ser senha_hash, senha, password, etc)
    const senhaHash = usuarioComSenha.senha_hash || usuarioComSenha.senha || usuarioComSenha.password;
    
    if (!senhaHash) {
      // Se não houver senha_hash, retornar false
      throw new Error('Senha não configurada. Entre em contato com o administrador');
    }

    return bcrypt.compare(senha, senhaHash);
  }

  private gerarToken(usuario: Usuario): string {
    const payload: Record<string, any> = {
      id: usuario.id,
      email: usuario.email,
      roles: usuario.roles,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as jwt.SignOptions);
  }

  async verificarToken(token: string): Promise<{
    id: string;
    email: string;
    roles: Role[];
  }> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as {
        id: string;
        email: string;
        roles: Role[];
      };
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expirado');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Token inválido');
      }
      throw new Error('Erro ao verificar token');
    }
  }

  async hashSenha(senha: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(senha, saltRounds);
  }
}

