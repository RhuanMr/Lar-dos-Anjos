import { User } from './User';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  usuario: User;
  token: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  loading: boolean;
  setUser?: (user: User | null) => void;
}

