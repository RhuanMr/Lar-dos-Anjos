import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth.service';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar token no localStorage ao carregar
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Verificar se token ainda é válido
          await authService.verify();
          // Token válido
          setLoading(false);
        } catch (error: any) {
          // Token inválido, expirado ou erro de conexão
          // Se for erro de conexão (sem response), manter token mas marcar como não autenticado
          if (!error.response) {
            // Erro de rede - manter dados mas não autenticado
            setUser(null);
            setToken(null);
          } else {
            // Token inválido - limpar tudo
            logout();
          }
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, senha: string) => {
    try {
      const response = await authService.login(email, senha);
      const { usuario, token: newToken } = response.data.data;

      setUser(usuario);
      setToken(newToken);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(usuario));
    } catch (error: any) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setLoading(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedProject');
  };

  const hasRole = (role: string): boolean => {
    return user?.roles.includes(role) ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        login,
        logout,
        hasRole,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

